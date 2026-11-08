import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LIEN_QUIZZLE } from '../config';
import {
  Ami,
  ErreurAmi,
  ListeAmis,
  REACTIONS,
  bloquerJoueur,
  demanderAmi,
  lireAmis,
  reagir,
  repondreDemande,
  retirerAmi,
  signalerJoueur,
} from '../game/serveur';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';

interface Props {
  codeAmi: string;
  jour: string;
  onChange?: () => void;
}

const MESSAGES: Record<ErreurAmi, () => string> = {
  code: () => tr('Le code doit faire 8 caractères.', 'The code must be 8 characters long.'),
  introuvable: () => tr('Aucun joueur avec ce code.', 'No player with this code.'),
  soi_meme: () => tr("C'est votre propre code !", "That's your own code!"),
  limite: () => tr("Vous avez atteint le nombre maximum d'amis.", 'You have reached the maximum number of friends.'),
  trop_de_demandes: () => tr("Trop de demandes aujourd'hui. Réessayez demain.", 'Too many requests today. Try again tomorrow.'),
  reseau: () => tr('Connexion impossible. Réessayez plus tard.', 'Unable to connect. Please try again later.'),
  inconnue: () => tr('Une erreur est survenue. Réessayez plus tard.', 'Something went wrong. Please try again later.'),
};

function libelleResultat(a: Ami): string {
  if (!a.resultat) return tr("⏳ N'a pas encore joué au mystère du jour", "⏳ Hasn't played today's mystery yet");
  if (a.resultat.score === 0) return tr("❌ N'a pas trouvé le mystère du jour", "❌ Didn't find today's mystery");
  return a.resultat.essais === 1
    ? tr('✅ A trouvé le mystère du jour en 1 essai', "✅ Found today's mystery in 1 try")
    : tr('✅ A trouvé le mystère du jour en {n} essais', "✅ Found today's mystery in {n} tries", { n: a.resultat.essais });
}

export default function AmisBloc({ codeAmi, jour, onChange }: Props) {
  const [liste, setListe] = useState<ListeAmis | null>(null);
  const [chargement, setChargement] = useState(true);
  const [horsLigne, setHorsLigne] = useState(false);
  const [code, setCode] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null);

  const charger = useCallback(async () => {
    try {
      setListe(await lireAmis(jour));
      onChange?.();
      setHorsLigne(false);
    } catch {
      setHorsLigne(true);
    }
    setChargement(false);
  }, [jour, onChange]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function ajouter() {
    const c = code.trim();
    if (!c) return;
    setEnvoi(true);
    setMessage(null);
    const r = await demanderAmi(c);
    setEnvoi(false);
    if (!r.ok) {
      setMessage({ texte: MESSAGES[r.erreur](), erreur: true });
      return;
    }
    setCode('');
    setMessage({
      texte: r.statut === 'acceptee' ? tr('Vous êtes amis !', 'You are now friends!') : tr('Demande envoyée. Elle doit être acceptée par votre ami.', 'Request sent. Your friend needs to accept it.'),
      erreur: false,
    });
    charger();
  }

  function partager() {
    const texte = tr(
      'Rejoins-moi sur Quizzle ! Mon code ami : {code}\n{lien}',
      'Join me on Quizzle! My friend code: {code}\n{lien}',
      { code: codeAmi, lien: LIEN_QUIZZLE },
    );
    Share.share({ message: texte }).catch(() => {});
  }

  async function repondre(id: string, accepter: boolean) {
    const ok = await repondreDemande(id, accepter);
    if (!ok) setMessage({ texte: MESSAGES.reseau(), erreur: true });
    charger();
  }

  async function reaction(a: Ami, emoji: string) {
    const nouvelle = a.ma_reaction === emoji ? null : emoji;
    // affichage immédiat, puis envoi
    setListe((l) => (l ? { ...l, amis: l.amis.map((x) => (x.id === a.id ? { ...x, ma_reaction: nouvelle } : x)) } : l));
    if (!(await reagir(a.id, jour, nouvelle))) {
      setMessage({ texte: MESSAGES.reseau(), erreur: true });
      charger();
    }
  }

  function menuAmi(a: Ami) {
    Alert.alert(a.nom, undefined, [
      {
        text: tr('Retirer de mes amis', 'Remove friend'),
        onPress: async () => {
          if (!(await retirerAmi(a.id))) setMessage({ texte: MESSAGES.reseau(), erreur: true });
          charger();
        },
      },
      {
        text: tr('Signaler ce pseudo', 'Report this nickname'),
        onPress: async () => {
          const ok = await signalerJoueur(a.id);
          setMessage({ texte: ok ? tr('Merci, le signalement a été envoyé.', 'Thanks, your report was sent.') : MESSAGES.reseau(), erreur: !ok });
        },
      },
      {
        text: tr('Bloquer', 'Block'),
        style: 'destructive',
        onPress: async () => {
          const ok = await bloquerJoueur(a.id);
          if (!ok) setMessage({ texte: MESSAGES.reseau(), erreur: true });
          charger();
        },
      },
      { text: tr('Annuler', 'Cancel'), style: 'cancel' },
    ]);
  }

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>{tr('Mon code ami', 'My friend code')}</Text>
        <Text style={styles.code}>{codeAmi}</Text>
        <Text style={styles.note}>{tr('Donnez ce code à vos amis pour qu’ils vous ajoutent.', 'Give this code to your friends so they can add you.')}</Text>
        <TouchableOpacity style={styles.boutonSecondaire} onPress={partager} activeOpacity={0.85} accessibilityRole="button">
          <Text style={styles.boutonSecondaireTexte}>{tr('Partager mon code', 'Share my code')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>{tr('Ajouter un ami', 'Add a friend')}</Text>
        <TextInput
          style={styles.champ}
          value={code}
          onChangeText={(t) => {
            setCode(t.toUpperCase());
            setMessage(null);
          }}
          placeholder={tr('Code de votre ami', "Your friend's code")}
          placeholderTextColor={couleurs.texteSecondaire}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!envoi}
          returnKeyType="done"
          onSubmitEditing={ajouter}
        />
        {message && <Text style={[styles.note, { color: message.erreur ? couleurs.erreur : couleurs.succes }]}>{message.texte}</Text>}
        <TouchableOpacity
          style={[styles.bouton, (envoi || code.trim().length < 8) && styles.boutonInactif]}
          onPress={ajouter}
          disabled={envoi || code.trim().length < 8}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {envoi ? <ActivityIndicator color="#1B1B1B" /> : <Text style={styles.boutonTexte}>{tr('Envoyer la demande', 'Send request')}</Text>}
        </TouchableOpacity>
      </View>

      {chargement ? (
        <ActivityIndicator color={couleurs.accent} style={{ marginVertical: 16 }} />
      ) : horsLigne ? (
        <View style={styles.section}>
          <Text style={styles.note}>{MESSAGES.reseau()}</Text>
          <TouchableOpacity style={styles.boutonSecondaire} onPress={charger} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.boutonSecondaireTexte}>{tr('Réessayer', 'Try again')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        liste && (
          <>
            {liste.recues.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitre}>{tr('🆕 Demandes d’amis reçues', '🆕 Friend requests received')}</Text>
                <Text style={styles.note}>{tr('Ces joueurs veulent devenir vos amis. Acceptez pour voir leurs résultats et jouer ensemble.', 'These players want to be your friends. Accept to see their results and play together.')}</Text>
                {liste.recues.map((d) => (
                  <View key={d.id} style={styles.ligne}>
                    <Text style={[styles.nom, { flex: 1 }]} numberOfLines={1}>{d.nom}</Text>
                    <TouchableOpacity style={styles.petitBouton} onPress={() => repondre(d.id, true)} accessibilityRole="button">
                      <Text style={styles.petitBoutonTexte}>{tr('Accepter', 'Accept')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.petitBouton, styles.petitBoutonGris]} onPress={() => repondre(d.id, false)} accessibilityRole="button">
                      <Text style={styles.petitBoutonGrisTexte}>{tr('Refuser', 'Decline')}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitre}>{tr('Mes amis', 'My friends')}</Text>
              {liste.amis.length === 0 ? (
                <Text style={styles.note}>
                  {liste.envoyees > 0
                    ? tr('{n} demande(s) en attente de réponse.', '{n} request(s) waiting for a reply.', { n: liste.envoyees })
                    : tr("Pas encore d'amis. Partagez votre code ou saisissez celui d'un ami.", 'No friends yet. Share your code or enter a friend’s code.')}
                </Text>
              ) : (
                liste.amis.map((a) => (
                  <View key={a.id} style={styles.blocAmi}>
                    <View style={styles.ligne}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nom} numberOfLines={1}>
                          {a.nom}
                        </Text>
                        <Text style={styles.detail}>{libelleResultat(a)}</Text>
                        {a.reaction_recue ? (
                          <Text style={styles.recue}>
                            {tr('💌 {nom} vous a envoyé {e}', '💌 {nom} sent you {e}', { nom: a.nom, e: a.reaction_recue })}
                          </Text>
                        ) : null}
                      </View>
                      <TouchableOpacity onPress={() => menuAmi(a)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={tr('Options', 'Options')}>
                        <Text style={styles.menu}>⋯</Text>
                      </TouchableOpacity>
                    </View>
                    {a.resultat && (
                      <Text style={styles.consigne}>
                        {a.ma_reaction
                          ? tr('✓ {e} envoyé à {nom}. Touchez-le à nouveau pour l’annuler.', '✓ {e} sent to {nom}. Tap it again to cancel.', { e: a.ma_reaction, nom: a.nom })
                          : tr('Envoyer une réaction à {nom} :', 'Send a reaction to {nom}:', { nom: a.nom })}
                      </Text>
                    )}
                    {a.resultat && (
                      <View style={styles.reactions}>
                        {REACTIONS.map((e) => (
                          <TouchableOpacity
                            key={e}
                            style={[styles.reaction, a.ma_reaction === e && styles.reactionChoisie]}
                            onPress={() => reaction(a, e)}
                            accessibilityRole="button"
                            accessibilityLabel={tr('Envoyer {e} à {nom}', 'Send {e} to {nom}', { e, nom: a.nom })}
                          >
                            <Text style={styles.reactionEmoji}>{e}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitre: { color: couleurs.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10, textTransform: 'uppercase' },
  code: { color: couleurs.texte, fontSize: 28, fontWeight: '800', letterSpacing: 4 },
  note: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 17, marginTop: 8 },
  champ: {
    backgroundColor: couleurs.carteClaire,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    color: couleurs.texte,
    fontSize: 18,
    letterSpacing: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  boutonInactif: { opacity: 0.5 },
  boutonTexte: { color: '#1B1B1B', fontSize: 16, fontWeight: '800' },
  boutonSecondaire: { borderRadius: rayon, borderWidth: 1, borderColor: couleurs.accent, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  boutonSecondaireTexte: { color: couleurs.accent, fontSize: 15, fontWeight: '700' },
  blocAmi: { borderBottomWidth: 1, borderBottomColor: couleurs.bordure, paddingBottom: 8 },
  consigne: { color: couleurs.texteSecondaire, fontSize: 13, marginBottom: 6 },
  recue: { color: couleurs.accent, fontSize: 13, marginTop: 2 },
  reactions: { flexDirection: 'row', gap: 6 },
  reaction: { borderRadius: 14, borderWidth: 1, borderColor: couleurs.bordure, paddingVertical: 4, paddingHorizontal: 9 },
  reactionChoisie: { borderColor: couleurs.accent, backgroundColor: couleurs.carteClaire },
  reactionEmoji: { fontSize: 18 },
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  nom: { color: couleurs.texte, fontSize: 16, fontWeight: '700' },
  detail: { color: couleurs.texteSecondaire, fontSize: 13, marginTop: 2 },
  menu: { color: couleurs.texteSecondaire, fontSize: 24, fontWeight: '800', paddingHorizontal: 6 },
  petitBouton: { backgroundColor: couleurs.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  petitBoutonTexte: { color: '#1B1B1B', fontSize: 13, fontWeight: '800' },
  petitBoutonGris: { backgroundColor: couleurs.carteClaire },
  petitBoutonGrisTexte: { color: couleurs.texte, fontSize: 13, fontWeight: '700' },
});
