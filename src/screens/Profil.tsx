import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DefiEnLigne, ErreurPseudo, ProfilServeur, envoyerResultat, lireProfil, proposerPseudo, supprimerProfil } from '../game/serveur';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';
import FondAnime from '../ui/FondAnime';
import AmisBloc from './AmisBloc';
import DefisBloc from './DefisBloc';
import GroupesBloc from './GroupesBloc';
import StatsBloc from './StatsBloc';

interface Props {
  onRetour: () => void;
  /** Jour du mystère (AAAA-MM-JJ, jour local). */
  jour: string;
  /** Résultat du mystère du jour s'il est terminé : renvoyé au serveur à l'ouverture (sans danger), au cas où l'envoi aurait échoué. */
  resultatDuJour: { essais: number; gagne: boolean } | null;
  /** Lance un défi reçu ; renvoie `false` si le mystère est inconnu de cette version. */
  onRelever: (defi: DefiEnLigne) => boolean;
}

const MESSAGES_ERREUR: Record<ErreurPseudo, () => string> = {
  forme: () =>
    tr(
      'Le pseudo doit faire 3 à 16 caractères : lettres, chiffres, espaces, tirets ou soulignés.',
      'The nickname must be 3 to 16 characters: letters, digits, spaces, hyphens or underscores.',
    ),
  interdit: () => tr("Ce pseudo n'est pas autorisé. Essayez-en un autre.", 'This nickname is not allowed. Try another one.'),
  pris: () => tr('Ce pseudo est déjà pris.', 'This nickname is already taken.'),
  trop_tot: () => tr('Vous pouvez changer de pseudo une fois par semaine.', 'You can change your nickname once a week.'),
  banni: () => tr("Vous ne pouvez plus changer de pseudo.", 'You can no longer change your nickname.'),
  reseau: () => tr('Connexion impossible. Réessayez plus tard.', 'Unable to connect. Please try again later.'),
  inconnue: () => tr('Une erreur est survenue. Réessayez plus tard.', 'Something went wrong. Please try again later.'),
};

export default function ProfilEcran({ onRetour, jour, resultatDuJour, onRelever }: Props) {
  const [onglet, setOnglet] = useState<'amis' | 'groupes' | 'defis'>('amis');
  const [chargement, setChargement] = useState(true);
  const [horsLigne, setHorsLigne] = useState(false);
  const [profil, setProfil] = useState<ProfilServeur | null>(null);
  const [saisie, setSaisie] = useState('');
  const [edition, setEdition] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Valeurs simples (et non l'objet) pour ne pas relancer le chargement à chaque affichage de l'app.
  const essaisJour = resultatDuJour?.essais ?? null;
  const gagneJour = resultatDuJour?.gagne ?? false;

  const charger = useCallback(async () => {
    setChargement(true);
    setHorsLigne(false);
    try {
      const p = await lireProfil();
      setProfil(p);
      if (p && essaisJour !== null) envoyerResultat(jour, essaisJour, gagneJour);
    } catch {
      setHorsLigne(true);
    }
    setChargement(false);
  }, [jour, essaisJour, gagneJour]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function valider() {
    const pseudo = saisie.trim();
    if (pseudo.length < 3) {
      setErreur(MESSAGES_ERREUR.forme());
      return;
    }
    setEnvoi(true);
    setErreur(null);
    const r = await proposerPseudo(pseudo);
    setEnvoi(false);
    if (!r.ok) {
      setErreur(MESSAGES_ERREUR[r.erreur]());
      return;
    }
    setEdition(false);
    setSaisie('');
    await charger();
  }

  function supprimer() {
    Alert.alert(
      tr('Supprimer mes données en ligne ?', 'Delete my online data?'),
      tr(
        'Votre pseudo et vos résultats enregistrés sur le serveur seront effacés. Votre progression sur ce téléphone ne change pas.',
        'Your nickname and the results stored on the server will be erased. Your progress on this phone is not affected.',
      ),
      [
        { text: tr('Annuler', 'Cancel'), style: 'cancel' },
        {
          text: tr('Supprimer', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            const ok = await supprimerProfil();
            if (!ok) {
              setErreur(MESSAGES_ERREUR.reseau());
              return;
            }
            setErreur(null);
            await charger();
          },
        },
      ],
    );
  }

  const aPseudo = !!profil?.pseudo;
  const peutSaisir = !aPseudo || profil?.statut === 'refuse' || edition;

  return (
    <KeyboardAvoidingView style={styles.racine} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FondAnime />
      <View style={styles.entete}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.retour}>{tr('‹ Retour', '‹ Back')}</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>{tr('Mon profil', 'My profile')}</Text>
        <View style={styles.espaceur} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        {chargement ? (
          <ActivityIndicator color={couleurs.accent} style={styles.attente} />
        ) : horsLigne ? (
          <View style={styles.section}>
            <Text style={styles.texte}>{MESSAGES_ERREUR.reseau()}</Text>
            <TouchableOpacity style={styles.boutonSecondaire} onPress={charger} activeOpacity={0.85} accessibilityRole="button">
              <Text style={styles.boutonSecondaireTexte}>{tr('Réessayer', 'Try again')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {aPseudo && profil && (
              <View style={styles.section}>
                <Text style={styles.sectionTitre}>{tr('Votre pseudo', 'Your nickname')}</Text>
                <Text style={styles.pseudo}>{profil.pseudo}</Text>
                {profil.statut === 'attente' && (
                  <Text style={styles.texte}>
                    {tr(
                      '⏳ En attente de validation. Pour l’instant, vous seul le voyez ; les autres joueurs voient « Joueur-… ».',
                      '⏳ Waiting for approval. For now only you can see it; other players see “Joueur-…”.',
                    )}
                  </Text>
                )}
                {profil.statut === 'approuve' && (
                  <Text style={[styles.texte, { color: couleurs.succes }]}>{tr('✅ Validé : les autres joueurs peuvent le voir.', '✅ Approved: other players can see it.')}</Text>
                )}
                {profil.statut === 'refuse' && (
                  <Text style={[styles.texte, { color: couleurs.erreur }]}>
                    {tr("❌ Ce pseudo n'a pas été accepté. Choisissez-en un autre.", '❌ This nickname was not accepted. Please choose another one.')}
                  </Text>
                )}
                {profil.statut === 'banni' && (
                  <Text style={[styles.texte, { color: couleurs.erreur }]}>{tr('Ce profil a été suspendu.', 'This profile has been suspended.')}</Text>
                )}
              </View>
            )}

            {peutSaisir && profil?.statut !== 'banni' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitre}>{aPseudo ? tr('Nouveau pseudo', 'New nickname') : tr('Choisissez un pseudo', 'Choose a nickname')}</Text>
                <TextInput
                  style={styles.champ}
                  value={saisie}
                  onChangeText={(t) => {
                    setSaisie(t);
                    setErreur(null);
                  }}
                  placeholder={tr('Votre pseudo', 'Your nickname')}
                  placeholderTextColor={couleurs.texteSecondaire}
                  maxLength={16}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!envoi}
                  returnKeyType="done"
                  onSubmitEditing={valider}
                />
                <Text style={styles.note}>
                  {tr(
                    'N’utilisez pas votre vrai nom. Le pseudo est relu avant d’être visible des autres joueurs. Rien n’est envoyé tant que vous ne validez pas.',
                    'Do not use your real name. The nickname is reviewed before other players can see it. Nothing is sent until you confirm.',
                  )}
                </Text>
                {erreur && <Text style={styles.erreur}>{erreur}</Text>}
                <TouchableOpacity
                  style={[styles.bouton, (envoi || saisie.trim().length < 3) && styles.boutonInactif]}
                  onPress={valider}
                  disabled={envoi || saisie.trim().length < 3}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  {envoi ? <ActivityIndicator color="#1B1B1B" /> : <Text style={styles.boutonTexte}>{tr('Valider', 'Confirm')}</Text>}
                </TouchableOpacity>
              </View>
            )}

            {aPseudo && !peutSaisir && profil?.statut !== 'banni' && (
              <TouchableOpacity style={styles.boutonSecondaire} onPress={() => setEdition(true)} activeOpacity={0.85} accessibilityRole="button">
                <Text style={styles.boutonSecondaireTexte}>{tr('Changer de pseudo', 'Change nickname')}</Text>
              </TouchableOpacity>
            )}

            {erreur && !peutSaisir && <Text style={styles.erreur}>{erreur}</Text>}

            {profil && <StatsBloc jour={jour} />}

            {profil && (
              <View style={styles.onglets}>
                {(
                  [
                    ['amis', tr('Amis', 'Friends')],
                    ['groupes', tr('Groupes', 'Groups')],
                    ['defis', tr('Défis', 'Challenges')],
                  ] as const
                ).map(([id, libelle]) => (
                  <TouchableOpacity key={id} style={[styles.onglet, onglet === id && styles.ongletActif]} onPress={() => setOnglet(id)} accessibilityRole="button">
                    <Text style={[styles.ongletTexte, onglet === id && styles.ongletTexteActif]}>{libelle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {profil && onglet === 'amis' && <AmisBloc codeAmi={profil.codeAmi} jour={jour} />}
            {profil && onglet === 'groupes' && <GroupesBloc jour={jour} />}
            {profil && onglet === 'defis' && <DefisBloc onRelever={onRelever} />}

            {profil && (
              <TouchableOpacity onPress={supprimer} style={styles.supprimer} activeOpacity={0.8} accessibilityRole="button">
                <Text style={styles.supprimerTexte}>{tr('Supprimer mes données en ligne', 'Delete my online data')}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  onglets: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  onglet: { flex: 1, borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, paddingVertical: 10, alignItems: 'center' },
  ongletActif: { backgroundColor: couleurs.accent, borderColor: couleurs.accent },
  ongletTexte: { color: couleurs.texteSecondaire, fontSize: 14, fontWeight: '700' },
  ongletTexteActif: { color: '#1B1B1B' },
  racine: { flex: 1, backgroundColor: couleurs.fond },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retour: { color: couleurs.texteSecondaire, fontSize: 16, width: 80 },
  titre: { color: couleurs.texte, fontSize: 18, fontWeight: '700' },
  espaceur: { width: 80 },
  contenu: { padding: 20, paddingTop: 8 },
  attente: { marginTop: 40 },
  section: {
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitre: { color: couleurs.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10, textTransform: 'uppercase' },
  pseudo: { color: couleurs.texte, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  texte: { color: couleurs.texteSecondaire, fontSize: 14, lineHeight: 20 },
  note: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 17, marginTop: 8 },
  erreur: { color: couleurs.erreur, fontSize: 14, marginTop: 10 },
  champ: {
    backgroundColor: couleurs.carteClaire,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    color: couleurs.texte,
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  boutonInactif: { opacity: 0.5 },
  boutonTexte: { color: '#1B1B1B', fontSize: 16, fontWeight: '800' },
  boutonSecondaire: {
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.accent,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  boutonSecondaireTexte: { color: couleurs.accent, fontSize: 15, fontWeight: '700' },
  supprimer: { alignItems: 'center', paddingVertical: 12 },
  supprimerTexte: { color: couleurs.texteSecondaire, fontSize: 13, textDecorationLine: 'underline' },
});
