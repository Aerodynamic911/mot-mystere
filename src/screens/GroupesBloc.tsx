import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LIEN_QUIZZLE } from '../config';
import {
  DetailGroupe,
  ErreurGroupe,
  GroupeResume,
  LigneClassement,
  creerGroupe,
  lireGroupe,
  lireGroupes,
  monIdentifiant,
  quitterGroupe,
  rejoindreGroupe,
} from '../game/serveur';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';

interface Props {
  jour: string;
}

type Onglet = 'jour' | 'semaine' | 'mois' | 'serie';

const MESSAGES: Record<ErreurGroupe, () => string> = {
  nom: () => tr('Le nom doit faire 3 à 24 caractères (lettres, chiffres, espaces) et ne pas contenir de mot interdit.', 'The name must be 3 to 24 characters (letters, digits, spaces) and must not contain a forbidden word.'),
  limite: () => tr('Vous avez atteint le nombre maximum de groupes (10).', 'You have reached the maximum number of groups (10).'),
  trop_de_groupes: () => tr("Trop de groupes créés aujourd'hui. Réessayez demain.", 'Too many groups created today. Try again tomorrow.'),
  code: () => tr('Le code doit faire 6 caractères.', 'The code must be 6 characters long.'),
  introuvable: () => tr('Aucun groupe avec ce code.', 'No group with this code.'),
  groupe_plein: () => tr('Ce groupe est complet (30 membres).', 'This group is full (30 members).'),
  banni: () => tr('Action impossible avec ce compte.', 'Not possible with this account.'),
  reseau: () => tr('Connexion impossible. Réessayez plus tard.', 'Unable to connect. Please try again later.'),
  inconnue: () => tr('Une erreur est survenue. Réessayez plus tard.', 'Something went wrong. Please try again later.'),
};

const ONGLETS: { id: Onglet; libelle: () => string }[] = [
  { id: 'jour', libelle: () => tr('Jour', 'Day') },
  { id: 'semaine', libelle: () => tr('Semaine', 'Week') },
  { id: 'mois', libelle: () => tr('Mois', 'Month') },
  { id: 'serie', libelle: () => tr('Série', 'Streak') },
];

function valeur(l: LigneClassement, o: Onglet): number {
  return o === 'jour' ? (l.jour ?? -1) : l[o];
}

function texteValeur(l: LigneClassement, o: Onglet): string {
  if (o === 'jour') return l.jour === null ? tr('pas encore joué', 'not played yet') : l.jour === 0 ? tr('pas trouvé', 'not found') : `${l.jour} pt${l.jour > 1 ? 's' : ''}`;
  if (o === 'serie') return l.serie === 0 ? '–' : `${l.serie} 🔥`;
  return `${l[o]} pt${l[o] > 1 ? 's' : ''}`;
}

export default function GroupesBloc({ jour }: Props) {
  const [groupes, setGroupes] = useState<GroupeResume[] | null>(null);
  const [chargement, setChargement] = useState(true);
  const [horsLigne, setHorsLigne] = useState(false);
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null);
  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailGroupe | null>(null);
  const [onglet, setOnglet] = useState<Onglet>('jour');

  const charger = useCallback(async () => {
    try {
      setGroupes(await lireGroupes());
      setHorsLigne(false);
    } catch {
      setHorsLigne(true);
    }
    setChargement(false);
  }, []);

  const chargerDetail = useCallback(
    async (id: string) => {
      try {
        const d = await lireGroupe(id, jour);
        if (d) setDetail(d);
        else {
          setOuvert(null);
          charger();
        }
      } catch {
        setMessage({ texte: MESSAGES.reseau(), erreur: true });
      }
    },
    [jour, charger],
  );

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    if (ouvert) chargerDetail(ouvert);
  }, [ouvert, chargerDetail]);

  async function creer() {
    setEnvoi(true);
    setMessage(null);
    const r = await creerGroupe(nom.trim());
    setEnvoi(false);
    if (!r.ok) return setMessage({ texte: MESSAGES[r.erreur](), erreur: true });
    setNom('');
    await charger();
    setDetail(null);
    setOuvert(r.groupe.id);
  }

  async function rejoindre() {
    setEnvoi(true);
    setMessage(null);
    const r = await rejoindreGroupe(code.trim());
    setEnvoi(false);
    if (!r.ok) return setMessage({ texte: MESSAGES[r.erreur](), erreur: true });
    setCode('');
    await charger();
    setDetail(null);
    setOuvert(r.groupe.id);
  }

  function partager(d: DetailGroupe) {
    const texte = tr(
      'Rejoins mon groupe « {nom} » sur Quizzle ! Code du groupe : {code}\n{lien}',
      'Join my group “{nom}” on Quizzle! Group code: {code}\n{lien}',
      { nom: d.nom, code: d.code, lien: LIEN_QUIZZLE },
    );
    Share.share({ message: texte }).catch(() => {});
  }

  function quitter(d: DetailGroupe) {
    Alert.alert(tr('Quitter le groupe ?', 'Leave the group?'), d.nom, [
      { text: tr('Annuler', 'Cancel'), style: 'cancel' },
      {
        text: tr('Quitter', 'Leave'),
        style: 'destructive',
        onPress: async () => {
          const moi = await monIdentifiant();
          if (!moi || !(await quitterGroupe(d.id, moi))) return setMessage({ texte: MESSAGES.reseau(), erreur: true });
          setOuvert(null);
          setDetail(null);
          charger();
        },
      },
    ]);
  }

  function menuMembre(d: DetailGroupe, l: LigneClassement) {
    if (!d.moi_createur || l.moi) return;
    Alert.alert(l.nom, undefined, [
      {
        text: tr('Retirer du groupe', 'Remove from group'),
        style: 'destructive',
        onPress: async () => {
          if (!(await quitterGroupe(d.id, l.id))) setMessage({ texte: MESSAGES.reseau(), erreur: true });
          chargerDetail(d.id);
        },
      },
      { text: tr('Annuler', 'Cancel'), style: 'cancel' },
    ]);
  }

  if (chargement) return <ActivityIndicator color={couleurs.accent} style={{ marginVertical: 16 }} />;
  if (horsLigne) {
    return (
      <View style={styles.section}>
        <Text style={styles.note}>{MESSAGES.reseau()}</Text>
        <TouchableOpacity style={styles.boutonSecondaire} onPress={charger} accessibilityRole="button">
          <Text style={styles.boutonSecondaireTexte}>{tr('Réessayer', 'Try again')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (ouvert) {
    const lignes = detail
      ? [...detail.classement].sort((a, b) => valeur(b, onglet) - valeur(a, onglet) || a.nom.localeCompare(b.nom))
      : [];
    return (
      <>
        <TouchableOpacity onPress={() => { setOuvert(null); setDetail(null); charger(); }} style={styles.retour} accessibilityRole="button">
          <Text style={styles.retourTexte}>‹ {tr('Mes groupes', 'My groups')}</Text>
        </TouchableOpacity>
        {!detail ? (
          <ActivityIndicator color={couleurs.accent} style={{ marginVertical: 16 }} />
        ) : (
          <View style={styles.section}>
            <Text style={styles.titreGroupe}>{detail.nom}</Text>
            <Text style={styles.note}>{tr('Code du groupe', 'Group code')} : <Text style={styles.codeGroupe}>{detail.code}</Text></Text>
            <View style={styles.onglets}>
              {ONGLETS.map((o) => (
                <TouchableOpacity key={o.id} style={[styles.onglet, onglet === o.id && styles.ongletActif]} onPress={() => setOnglet(o.id)} accessibilityRole="button">
                  <Text style={[styles.ongletTexte, onglet === o.id && styles.ongletTexteActif]}>{o.libelle()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {lignes.map((l, i) => {
              const v = valeur(l, onglet);
              const medaille = v > 0 ? ['🥇', '🥈', '🥉'][i] : undefined;
              return (
                <TouchableOpacity key={l.id} style={styles.ligne} onLongPress={() => menuMembre(detail, l)} onPress={() => menuMembre(detail, l)} activeOpacity={detail.moi_createur && !l.moi ? 0.6 : 1}>
                  <Text style={styles.rang}>{medaille ?? `${i + 1}`}</Text>
                  <Text style={[styles.nom, l.moi && styles.moi]} numberOfLines={1}>{l.nom}{l.moi ? ` (${tr('moi', 'me')})` : ''}</Text>
                  <Text style={styles.valeur}>{texteValeur(l, onglet)}</Text>
                </TouchableOpacity>
              );
            })}
            <Text style={styles.note}>
              {tr('Points : 6 si trouvé du premier coup, 1 si trouvé au 6e essai, 0 si raté.', 'Points: 6 for finding it on the first try, 1 on the 6th try, 0 if missed.')}
            </Text>
            {message && <Text style={[styles.note, { color: message.erreur ? couleurs.erreur : couleurs.succes }]}>{message.texte}</Text>}
            <TouchableOpacity style={styles.boutonSecondaire} onPress={() => partager(detail)} accessibilityRole="button">
              <Text style={styles.boutonSecondaireTexte}>{tr('Inviter avec le code', 'Invite with the code')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => quitter(detail)} style={styles.quitter} accessibilityRole="button">
              <Text style={styles.quitterTexte}>{tr('Quitter ce groupe', 'Leave this group')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  }

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>{tr('Mes groupes', 'My groups')}</Text>
        {!groupes || groupes.length === 0 ? (
          <Text style={styles.note}>{tr('Pas encore de groupe. Créez-en un pour la famille ou les amis, ou rejoignez-en un avec son code.', 'No group yet. Create one for family or friends, or join one with its code.')}</Text>
        ) : (
          groupes.map((g) => (
            <TouchableOpacity key={g.id} style={styles.ligne} onPress={() => { setDetail(null); setOuvert(g.id); }} accessibilityRole="button">
              <View style={{ flex: 1 }}>
                <Text style={styles.nom} numberOfLines={1}>{g.nom}</Text>
                <Text style={styles.detail}>{g.membres} {tr('membre(s)', 'member(s)')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>{tr('Créer un groupe', 'Create a group')}</Text>
        <TextInput
          style={styles.champ}
          value={nom}
          onChangeText={(t) => { setNom(t); setMessage(null); }}
          placeholder={tr('Nom du groupe (ex. Famille)', 'Group name (e.g. Family)')}
          placeholderTextColor={couleurs.texteSecondaire}
          maxLength={24}
          editable={!envoi}
          returnKeyType="done"
          onSubmitEditing={creer}
        />
        <TouchableOpacity style={[styles.bouton, (envoi || nom.trim().length < 3) && styles.boutonInactif]} onPress={creer} disabled={envoi || nom.trim().length < 3} accessibilityRole="button">
          <Text style={styles.boutonTexte}>{tr('Créer le groupe', 'Create group')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>{tr('Rejoindre un groupe', 'Join a group')}</Text>
        <TextInput
          style={[styles.champ, { letterSpacing: 2 }]}
          value={code}
          onChangeText={(t) => { setCode(t.toUpperCase()); setMessage(null); }}
          placeholder={tr('Code du groupe', 'Group code')}
          placeholderTextColor={couleurs.texteSecondaire}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!envoi}
          returnKeyType="done"
          onSubmitEditing={rejoindre}
        />
        {message && <Text style={[styles.note, { color: message.erreur ? couleurs.erreur : couleurs.succes }]}>{message.texte}</Text>}
        <TouchableOpacity style={[styles.bouton, (envoi || code.trim().length < 6) && styles.boutonInactif]} onPress={rejoindre} disabled={envoi || code.trim().length < 6} accessibilityRole="button">
          {envoi ? <ActivityIndicator color="#1B1B1B" /> : <Text style={styles.boutonTexte}>{tr('Rejoindre', 'Join')}</Text>}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: 'rgba(26,31,58,0.82)', borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, padding: 16, marginBottom: 16 },
  sectionTitre: { color: couleurs.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10, textTransform: 'uppercase' },
  note: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 17, marginTop: 8 },
  champ: { backgroundColor: couleurs.carteClaire, borderRadius: 12, borderWidth: 1, borderColor: couleurs.bordure, color: couleurs.texte, fontSize: 18, paddingVertical: 12, paddingHorizontal: 14 },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  boutonInactif: { opacity: 0.5 },
  boutonTexte: { color: '#1B1B1B', fontSize: 16, fontWeight: '800' },
  boutonSecondaire: { borderRadius: rayon, borderWidth: 1, borderColor: couleurs.accent, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  boutonSecondaireTexte: { color: couleurs.accent, fontSize: 15, fontWeight: '700' },
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  nom: { color: couleurs.texte, fontSize: 16, fontWeight: '700', flex: 1 },
  moi: { color: couleurs.accent },
  detail: { color: couleurs.texteSecondaire, fontSize: 13, marginTop: 2 },
  chevron: { color: couleurs.texteSecondaire, fontSize: 24 },
  retour: { paddingVertical: 8, marginBottom: 4 },
  retourTexte: { color: couleurs.accent, fontSize: 16, fontWeight: '700' },
  titreGroupe: { color: couleurs.texte, fontSize: 22, fontWeight: '800' },
  codeGroupe: { color: couleurs.texte, fontWeight: '800', letterSpacing: 2 },
  onglets: { flexDirection: 'row', gap: 6, marginTop: 14, marginBottom: 6 },
  onglet: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: couleurs.bordure, paddingVertical: 8, alignItems: 'center' },
  ongletActif: { backgroundColor: couleurs.accent, borderColor: couleurs.accent },
  ongletTexte: { color: couleurs.texteSecondaire, fontSize: 13, fontWeight: '700' },
  ongletTexteActif: { color: '#1B1B1B' },
  rang: { width: 30, color: couleurs.texte, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  valeur: { color: couleurs.texteSecondaire, fontSize: 14, fontWeight: '700' },
  quitter: { alignItems: 'center', paddingVertical: 14 },
  quitterTexte: { color: couleurs.erreur, fontSize: 14, fontWeight: '700' },
});
