import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Mystere } from '../data/mysteres';
import { MAX_ESSAIS, PASSE, estCorrect, normaliser } from '../game/engine';
import { Difficulte, INDICES_DE_BASE } from '../game/preferences';
import { couleurs, rayon } from '../theme';

interface Props {
  difficulte: Difficulte;
  mystere: Mystere;
  titre: string;
  /** Numéro du mystère du jour (pour le partage). Absent en partie libre. */
  numero?: number;
  propositionsInitiales: string[];
  onProgression?: (propositions: string[]) => void;
  onTerminee?: (propositions: string[], gagne: boolean) => void;
  onRetour: () => void;
  /** Proposé en fin de partie libre. */
  onRejouer?: () => void;
}

export default function Game({
  difficulte,
  mystere,
  titre,
  numero,
  propositionsInitiales,
  onProgression,
  onTerminee,
  onRetour,
  onRejouer,
}: Props) {
  const [propositions, setPropositions] = useState<string[]>(propositionsInitiales);
  const [saisie, setSaisie] = useState('');
  const [message, setMessage] = useState('');

  const gagne = propositions.some((p) => estCorrect(mystere, p));
  const termine = gagne || propositions.length >= MAX_ESSAIS;
  const indicesVisibles = termine ? MAX_ESSAIS : Math.min(propositions.length + INDICES_DE_BASE[difficulte], MAX_ESSAIS);
  const score = gagne ? MAX_ESSAIS + 1 - propositions.length : 0;

  function valider() {
    const texte = saisie.trim();
    if (!texte || termine) return;
    if (propositions.some((p) => p !== PASSE && normaliser(p) === normaliser(texte))) {
      setMessage('Vous avez déjà essayé cette réponse.');
      return;
    }
    const suivantes = [...propositions, texte];
    setPropositions(suivantes);
    setSaisie('');
    setMessage('');
    const fini = estCorrect(mystere, texte) || suivantes.length >= MAX_ESSAIS;
    if (fini) {
      onTerminee?.(suivantes, estCorrect(mystere, texte));
    } else {
      onProgression?.(suivantes);
    }
  }

  // Pas de bouton en mode difficile, ni quand tous les indices sont déjà visibles.
  const peutDemanderIndice = !termine && difficulte !== 'difficile' && indicesVisibles < MAX_ESSAIS;

  function indiceSuivant() {
    if (!peutDemanderIndice) return;
    const suivantes = [...propositions, PASSE];
    setPropositions(suivantes);
    setMessage('');
    onProgression?.(suivantes);
  }

  async function partager() {
    const carres =
      propositions.map((p) => (p === PASSE ? '🟨' : estCorrect(mystere, p) ? '🟩' : '🟥')).join('') +
      '⬛'.repeat(MAX_ESSAIS - propositions.length);
    const entete = numero ? `Mot Mystère n°${numero}` : 'Mot Mystère';
    const resultat = gagne ? `${score}/${MAX_ESSAIS}` : `X/${MAX_ESSAIS}`;
    try {
      await Share.share({ message: `${entete} ${resultat}\n${carres}` });
    } catch {
      // Partage annulé : rien à faire.
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.retour}>‹ Accueil</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>{titre}</Text>
        <Text style={styles.essais}>
          {Math.min(propositions.length, MAX_ESSAIS)}/{MAX_ESSAIS}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.categorie}>{mystere.categorie.toUpperCase()} À DEVINER</Text>

        {mystere.indices.map((indice, i) => {
          const visible = i < indicesVisibles;
          const dernier = visible && i === indicesVisibles - 1 && !termine;
          return (
            <View key={i} style={[styles.indice, !visible && styles.indiceVerrouille, dernier && styles.indiceRecent]}>
              <Text style={styles.indiceNumero}>{i + 1}</Text>
              <Text style={visible ? styles.indiceTexte : styles.indiceTexteVerrouille}>
                {visible ? indice : '🔒 Indice verrouillé'}
              </Text>
            </View>
          );
        })}

        {propositions.length > 0 && (
          <View style={styles.pastilles}>
            {propositions.map((p, i) =>
              p === PASSE ? (
                <View key={i} style={[styles.pastille, styles.pastillePasse]}>
                  <Text style={styles.pastilleTexte}>⏭ Indice demandé</Text>
                </View>
              ) : (
                <View key={i} style={[styles.pastille, estCorrect(mystere, p) && styles.pastilleOk]}>
                  <Text style={styles.pastilleTexte}>
                    {estCorrect(mystere, p) ? '✓ ' : '✗ '}
                    {p}
                  </Text>
                </View>
              ),
            )}
          </View>
        )}

        {termine && (
          <View style={[styles.resultat, gagne ? styles.resultatGagne : styles.resultatPerdu]}>
            <Text style={styles.resultatTitre}>
              {gagne ? `Bravo ! Trouvé en ${propositions.length} essai${propositions.length > 1 ? 's' : ''}` : 'Raté pour cette fois'}
            </Text>
            <Text style={styles.reponse}>{mystere.reponse}</Text>
            {gagne && <Text style={styles.score}>Score : {score}/{MAX_ESSAIS}</Text>}

            <Text style={styles.anecdoteTitre}>💡 Le saviez-vous ?</Text>
            <Text style={styles.anecdote}>{mystere.anecdote}</Text>

            <TouchableOpacity style={styles.bouton} onPress={partager} activeOpacity={0.85}>
              <Text style={styles.boutonTexte}>Partager mon résultat</Text>
            </TouchableOpacity>
            {onRejouer && (
              <TouchableOpacity style={[styles.bouton, styles.boutonSecondaire]} onPress={onRejouer} activeOpacity={0.85}>
                <Text style={styles.boutonSecondaireTexte}>Mystère suivant</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {!termine && (
        <View style={styles.saisieBarre}>
          {message !== '' && <Text style={styles.message}>{message}</Text>}
          {peutDemanderIndice && (
            <TouchableOpacity style={styles.boutonIndice} onPress={indiceSuivant} activeOpacity={0.85}>
              <Text style={styles.boutonIndiceTexte}>💡 Indice suivant</Text>
              <Text style={styles.boutonIndiceNote}>compte comme un essai</Text>
            </TouchableOpacity>
          )}
          <View style={styles.saisieLigne}>
            <TextInput
              style={styles.input}
              value={saisie}
              onChangeText={(t) => {
                setSaisie(t);
                if (message) setMessage('');
              }}
              placeholder="Votre réponse…"
              placeholderTextColor={couleurs.texteSecondaire}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={valider}
            />
            <TouchableOpacity style={styles.envoyer} onPress={valider} activeOpacity={0.85}>
              <Text style={styles.envoyerTexte}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retour: { color: couleurs.texteSecondaire, fontSize: 16, width: 80 },
  titre: { color: couleurs.texte, fontSize: 17, fontWeight: '700' },
  essais: { color: couleurs.accent, fontSize: 16, fontWeight: '700', width: 80, textAlign: 'right' },
  contenu: { padding: 20, paddingTop: 4 },
  categorie: { color: couleurs.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  indice: {
    flexDirection: 'row',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: 'flex-start',
  },
  indiceRecent: { borderColor: couleurs.accent, backgroundColor: couleurs.carteClaire },
  indiceVerrouille: { opacity: 0.45 },
  indiceNumero: { color: couleurs.accent, fontWeight: '800', fontSize: 16, width: 26 },
  indiceTexte: { color: couleurs.texte, fontSize: 16, lineHeight: 22, flex: 1 },
  indiceTexteVerrouille: { color: couleurs.texteSecondaire, fontSize: 15, flex: 1 },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  pastille: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderColor: couleurs.erreur,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  pastilleOk: { backgroundColor: 'rgba(61,220,151,0.15)', borderColor: couleurs.succes },
  pastillePasse: { backgroundColor: 'rgba(245,185,66,0.12)', borderColor: couleurs.accent },
  boutonIndice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rayon,
    borderWidth: 1.5,
    borderColor: couleurs.accent,
    paddingVertical: 11,
    marginBottom: 10,
  },
  boutonIndiceTexte: { color: couleurs.accent, fontSize: 15, fontWeight: '700' },
  boutonIndiceNote: { color: couleurs.texteSecondaire, fontSize: 12, marginLeft: 8 },
  pastilleTexte: { color: couleurs.texte, fontSize: 14 },
  resultat: { borderRadius: rayon, padding: 18, marginTop: 14, borderWidth: 1.5 },
  resultatGagne: { backgroundColor: 'rgba(61,220,151,0.10)', borderColor: couleurs.succes },
  resultatPerdu: { backgroundColor: 'rgba(255,107,107,0.10)', borderColor: couleurs.erreur },
  resultatTitre: { color: couleurs.texte, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  reponse: { color: couleurs.accent, fontSize: 28, fontWeight: '800', textAlign: 'center', marginVertical: 8 },
  score: { color: couleurs.texte, fontSize: 15, textAlign: 'center', marginBottom: 12 },
  anecdoteTitre: { color: couleurs.accent, fontWeight: '700', fontSize: 15, marginTop: 8, marginBottom: 4 },
  anecdote: { color: couleurs.texte, fontSize: 15, lineHeight: 22 },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  boutonTexte: { color: '#1B1B1B', fontWeight: '700', fontSize: 16 },
  boutonSecondaire: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: couleurs.bordure, marginTop: 10 },
  boutonSecondaireTexte: { color: couleurs.texte, fontWeight: '600', fontSize: 16 },
  saisieBarre: { padding: 14, borderTopWidth: 1, borderTopColor: couleurs.bordure, backgroundColor: couleurs.fond },
  message: { color: couleurs.erreur, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  saisieLigne: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: couleurs.carte,
    color: couleurs.texte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  envoyer: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingHorizontal: 18, paddingVertical: 13, marginLeft: 10 },
  envoyerTexte: { color: '#1B1B1B', fontWeight: '700', fontSize: 16 },
});
