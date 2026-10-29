import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
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
import { jouerEffet } from '../audio/effets';
import { Mystere } from '../data/mysteres';
import { MAX_ESSAIS, PASSE, estCorrect, normaliser } from '../game/engine';
import { LIEN_APP, PARTAGES_PAR_JOKER } from '../config';
import { Difficulte, INDICES_DE_BASE } from '../game/preferences';
import { gainPieces } from '../game/boutique';
import { genererCode } from '../game/social';
import type { ModeJeu } from '../game/storage';
import { langue, localiser, tr } from '../i18n';
import { couleurs, rayon } from '../theme';
import EffetsJeu, { EffetEnCours, TypeEffet } from '../ui/EffetsJeu';

/** Encouragements après une mauvaise réponse (il reste des essais). */
const ENCOURAGEMENTS = [
  'Pas tout à fait… mais vous chauffez ! 🔥',
  'Bien tenté ! Relisez les indices, la réponse est tout près.',
  'Courage, vous êtes sur la piste ! 🕵️',
  "Ce n'est pas ça, mais chaque essai vous rapproche.",
  'Presque ! Un autre regard sur les indices peut tout changer.',
];

/** Messages après un échec : toujours bienveillants. */
const CONSOLATIONS = [
  "Ce n'était pas facile ! Chaque mystère raté est une chose de plus apprise. 💪",
  'Pas cette fois, mais vous avez bien cherché. La prochaine sera la bonne !',
  "Même les meilleurs détectives s'y reprennent à plusieurs fois. Vous y étiez presque ! ✨",
  'Bravo pour avoir essayé jusqu\'au bout : vous retiendrez celui-là !',
];

const ENCOURAGEMENTS_EN = [
  'Not quite… but you’re getting warm! 🔥',
  'Nice try! Re-read the clues, the answer is very close.',
  'Keep going, you’re on the trail! 🕵️',
  'That’s not it, but every attempt brings you closer.',
  'Almost! A fresh look at the clues can change everything.',
];

const CONSOLATIONS_EN = [
  'That wasn’t easy! Every missed mystery is one more thing learned. 💪',
  'Not this time, but you searched well. The next one will be yours!',
  'Even the best detectives need several tries. You were so close! ✨',
  'Well done for trying until the end: you’ll remember this one!',
];

function auHasard<T>(liste: T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

interface Props {
  difficulte: Difficulte;
  mystere: Mystere;
  titre: string;
  /** Numéro du mystère du jour (pour le partage). Absent dans les autres modes. */
  numero?: number;
  propositionsInitiales: string[];
  onProgression?: (propositions: string[]) => void;
  onTerminee?: (propositions: string[], gagne: boolean) => void;
  onRetour: () => void;
  /** Nombre d'essais autorisés (6 par défaut). */
  maxEssais?: number;
  /** Début du message de partage, à la place de « Quizzle n°X ». */
  libellePartage?: string;
  /** Bouton proposé en fin de partie (mystère suivant, niveau suivant, réessayer…). */
  actionFin?: (gagne: boolean) => { libelle: string; onPress: () => void } | null;
  /** Jokers en réserve (bonus de série) : chacun révèle un indice sans compter comme un essai. */
  jokers?: number;
  onJoker?: () => void;
  /** Appelé quand le joueur a bien partagé (pour compter les partages qui rapportent un joker). */
  onPartage?: () => void;
  /** Mode de jeu, pour afficher les pièces gagnées. */
  mode?: ModeJeu;
  /** Phrase de fin de partie (par exemple la comparaison avec le score d'un ami). */
  commentaireFin?: (gagne: boolean, essais: number) => string | null;
  /** Mode image : la photo se dévoile peu à peu à la place des indices écrits. */
  image?: ImageSourcePropType;
}

export default function Game({
  difficulte,
  mystere: mystereBrut,
  titre,
  numero,
  propositionsInitiales,
  onProgression,
  onTerminee,
  onRetour,
  maxEssais = MAX_ESSAIS,
  libellePartage,
  actionFin,
  jokers = 0,
  onJoker,
  onPartage,
  mode,
  commentaireFin,
  image,
}: Props) {
  const mystere = localiser(mystereBrut);
  const [propositions, setPropositions] = useState<string[]>(propositionsInitiales);
  const [saisie, setSaisie] = useState('');
  const [message, setMessage] = useState('');
  const [encouragement, setEncouragement] = useState('');
  const [consolation] = useState(() => auHasard(langue() === 'en' ? CONSOLATIONS_EN : CONSOLATIONS));
  const [effet, setEffet] = useState<EffetEnCours | null>(null);
  // Indices offerts par des jokers pendant cette partie.
  const [offerts, setOfferts] = useState(0);
  const secousse = useRef(new Animated.Value(0)).current;
  const apparitionResultat = useRef(new Animated.Value(0)).current;
  const defilement = useRef<ScrollView>(null);

  function declencher(type: TypeEffet) {
    setEffet((e) => ({ type, cle: (e?.cle ?? 0) + 1 }));
  }

  function secouer() {
    secousse.setValue(0);
    Animated.sequence(
      [1, -1, 0.7, -0.7, 0.4, 0].map((v) => Animated.timing(secousse, { toValue: v, duration: 60, useNativeDriver: true })),
    ).start();
  }

  const gagne = propositions.some((p) => estCorrect(mystere, p));
  const nbIndices = mystere.indices.length;
  const termine = gagne || propositions.length >= maxEssais;
  const indicesVisibles = termine ? nbIndices : Math.min(propositions.length + INDICES_DE_BASE[difficulte] + offerts, nbIndices);
  const score = gagne ? maxEssais + 1 - propositions.length : 0;

  // La fiche de résultat arrive en rebondissant.
  useEffect(() => {
    if (!termine) return;
    apparitionResultat.setValue(0);
    Animated.spring(apparitionResultat, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    // La fiche de résultat est longue : on descend tout seul pour la montrer en entier.
    const t = setTimeout(() => defilement.current?.scrollToEnd({ animated: true }), 450);
    return () => clearTimeout(t);
  }, [termine, apparitionResultat]);

  const suite = termine ? (actionFin?.(gagne) ?? null) : null;

  function valider() {
    const texte = saisie.trim();
    if (!texte || termine) return;
    if (propositions.some((p) => p !== PASSE && normaliser(p) === normaliser(texte))) {
      setMessage(tr('Vous avez déjà essayé cette réponse.', 'You already tried that answer.'));
      return;
    }
    const suivantes = [...propositions, texte];
    setPropositions(suivantes);
    setSaisie('');
    setMessage('');
    const juste = estCorrect(mystere, texte);
    const fini = juste || suivantes.length >= maxEssais;
    if (juste) {
      setEncouragement('');
      declencher('bravo');
      jouerEffet('victoire');
    } else if (fini) {
      setEncouragement('');
      declencher('faux');
      jouerEffet('echec');
    } else {
      setEncouragement(auHasard(langue() === 'en' ? ENCOURAGEMENTS_EN : ENCOURAGEMENTS));
      declencher('faux');
      secouer();
    }
    if (fini) {
      onTerminee?.(suivantes, juste);
    } else {
      onProgression?.(suivantes);
    }
  }

  // Pas de bouton en mode difficile, quand tous les indices sont déjà visibles, ni quand il ne reste qu'un essai.
  const peutDemanderIndice =
    !termine && difficulte !== 'difficile' && indicesVisibles < nbIndices && propositions.length < maxEssais - 1;

  const peutJoker = !termine && jokers > 0 && indicesVisibles < nbIndices;

  function utiliserJoker() {
    if (!peutJoker) return;
    setOfferts((n) => n + 1);
    setMessage('');
    setEncouragement('');
    declencher('indice');
    jouerEffet('indice');
    onJoker?.();
  }

  function indiceSuivant() {
    if (!peutDemanderIndice) return;
    const suivantes = [...propositions, PASSE];
    setPropositions(suivantes);
    setMessage('');
    setEncouragement('');
    declencher('indice');
    jouerEffet('indice');
    onProgression?.(suivantes);
  }

  async function partager() {
    const carres =
      propositions.map((p) => (p === PASSE ? '🟨' : estCorrect(mystere, p) ? '🟩' : '🟥')).join('') +
      '⬛'.repeat(Math.max(0, maxEssais - propositions.length));
    const entete = libellePartage ?? (numero ? `Quizzle ${tr('n°', 'No.')}${numero}` : 'Quizzle');
    const resultat = gagne ? `${score}/${maxEssais}` : `X/${maxEssais}`;
    try {
      const r = await Share.share({ message: `${entete} ${resultat}\n${carres}` });
      if (r.action === Share.sharedAction) onPartage?.();
    } catch {
      // Partage annulé : rien à faire.
    }
  }

  /** Défi : l'ami reçoit un code, joue la même énigme et compare son score au nôtre. */
  async function defier() {
    const essais = gagne ? propositions.length : 0;
    const code = genererCode(mystereBrut.id, essais);
    const message = gagne
      ? tr(
          '🎯 Défi Quizzle ! J\'ai trouvé en {n} essai{s}. Saurez-vous faire mieux ?\nCode du défi : {code}\nDans Quizzle, touchez « Entre amis » puis entrez le code.',
          '🎯 Quizzle challenge! I found it in {n} attempt{s}. Can you do better?\nChallenge code: {code}\nIn Quizzle, tap “With friends” and enter the code.',
          { n: essais, s: essais > 1 ? 's' : '', code },
        )
      : tr(
          '🎯 Défi Quizzle ! Je n\'ai pas trouvé celui-là. Saurez-vous le résoudre ?\nCode du défi : {code}\nDans Quizzle, touchez « Entre amis » puis entrez le code.',
          '🎯 Quizzle challenge! I couldn\'t find this one. Can you solve it?\nChallenge code: {code}\nIn Quizzle, tap “With friends” and enter the code.',
          { code },
        );
    try {
      const r = await Share.share({ message: LIEN_APP ? `${message}\n${LIEN_APP}` : message });
      if (r.action === Share.sharedAction) onPartage?.();
    } catch {
      // Partage annulé.
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.retour}>{tr('‹ Accueil', '‹ Home')}</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>{titre}</Text>
        <Text style={styles.essais}>
          {Math.min(propositions.length, maxEssais)}/{maxEssais}
        </Text>
      </View>

      <ScrollView ref={defilement} contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.categorie}>{tr('{c} À DEVINER', '{c} TO GUESS', { c: mystere.categorie.toUpperCase() })}</Text>

        {image && <ImageDevoilee source={image} etape={indicesVisibles - 1} />}

        {!image && mystere.indices.map((indice, i) => {
          const visible = i < indicesVisibles;
          const dernier = visible && i === indicesVisibles - 1 && !termine;
          return (
            <IndiceCarte key={i} visible={visible} recent={dernier} numero={i + 1} texte={indice} />
          );
        })}

        {propositions.length > 0 && (
          <View style={styles.pastilles}>
            {propositions.map((p, i) =>
              p === PASSE ? (
                <View key={i} style={[styles.pastille, styles.pastillePasse]}>
                  <Text style={styles.pastilleTexte}>⏭ {tr('Indice demandé', 'Clue requested')}</Text>
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
          <Animated.View
            style={[
              styles.resultat,
              gagne ? styles.resultatGagne : styles.resultatPerdu,
              {
                opacity: apparitionResultat,
                transform: [{ scale: apparitionResultat.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
              },
            ]}
          >
            <Text style={styles.resultatTitre}>
              {gagne
                ? tr('Bravo ! Trouvé en {n} essai{s}', 'Well done! Found in {n} attempt{s}', { n: propositions.length, s: propositions.length > 1 ? 's' : '' })
                : tr('Pas cette fois, mais bien joué !', 'Not this time, but well played!')}
            </Text>
            {!gagne && <Text style={styles.consolation}>{consolation}</Text>}
            <Text style={styles.reponse}>{mystere.reponse}</Text>
            {gagne && <Text style={styles.score}>{tr('Score', 'Score')} : {score}/{maxEssais}</Text>}
            {gagne && mode && <Text style={styles.pieces}>+{gainPieces(mode, propositions.length, true)} 🪙</Text>}

            <Text style={styles.anecdoteTitre}>💡 {tr('Le saviez-vous ?', 'Did you know?')}</Text>
            <Text style={styles.anecdote}>{mystere.anecdote}</Text>

            {commentaireFin && commentaireFin(gagne, propositions.length) !== null && (
              <Text style={styles.commentaireFin}>{commentaireFin(gagne, propositions.length)}</Text>
            )}

            <TouchableOpacity style={styles.bouton} onPress={partager} activeOpacity={0.85}>
              <Text style={styles.boutonTexte}>📤 {tr('Partager mon résultat', 'Share my result')}</Text>
            </TouchableOpacity>
            {!image && (
              <TouchableOpacity style={[styles.bouton, styles.boutonSecondaire, styles.boutonDefi]} onPress={defier} activeOpacity={0.85}>
                <Text style={styles.boutonSecondaireTexte}>🎯 {tr('Défier un ami', 'Challenge a friend')}</Text>
              </TouchableOpacity>
            )}
            {onPartage && (
              <Text style={styles.noteJoker}>
                {tr('✨ +1 joker tous les {n} partages (1 par jour)', '✨ +1 joker every {n} shares (1 per day)', { n: PARTAGES_PAR_JOKER })}
              </Text>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Le bouton pour continuer reste toujours visible en bas : le joueur n'a pas à défiler pour le trouver. */}
      {termine && suite && (
        <View style={styles.barreSuite}>
          <TouchableOpacity style={[styles.bouton, styles.boutonSuite]} onPress={suite.onPress} activeOpacity={0.85}>
            <Text style={styles.boutonTexte}>{suite.libelle}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!termine && (
        <View style={styles.saisieBarre}>
          {message !== '' && <Text style={styles.message}>{message}</Text>}
          {message === '' && encouragement !== '' && <Text style={styles.encouragement}>{encouragement}</Text>}
          {peutJoker && (
            <TouchableOpacity style={[styles.boutonIndice, styles.boutonJoker]} onPress={utiliserJoker} activeOpacity={0.85}>
              <Text style={[styles.boutonIndiceTexte, { color: couleurs.succes }]}>✨ {tr('Utiliser un joker', 'Use a joker')} ({jokers})</Text>
              <Text style={styles.boutonIndiceNote}>{tr('indice offert', 'free clue')}</Text>
            </TouchableOpacity>
          )}
          {peutDemanderIndice && (
            <TouchableOpacity style={styles.boutonIndice} onPress={indiceSuivant} activeOpacity={0.85}>
              <Text style={styles.boutonIndiceTexte}>💡 {tr('Indice suivant', 'Next clue')}</Text>
              <Text style={styles.boutonIndiceNote}>{tr('compte comme un essai', 'counts as an attempt')}</Text>
            </TouchableOpacity>
          )}
          <Animated.View
            style={[
              styles.saisieLigne,
              { transform: [{ translateX: secousse.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] }) }] },
            ]}
          >
            <TextInput
              style={styles.input}
              value={saisie}
              onChangeText={(t) => {
                setSaisie(t);
                if (message) setMessage('');
                if (encouragement) setEncouragement('');
              }}
              placeholder={tr('Votre réponse…', 'Your answer…')}
              placeholderTextColor={couleurs.texteSecondaire}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={valider}
            />
            <TouchableOpacity style={styles.envoyer} onPress={valider} activeOpacity={0.85}>
              <Text style={styles.envoyerTexte}>{tr('Valider', 'Submit')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      <EffetsJeu effet={effet} />
    </KeyboardAvoidingView>
  );
}

/** Une carte d'indice : celle qui vient d'être débloquée glisse en place avec un éclat. */
/** Photo mystère : zoomée et floue au départ, elle se révèle à chaque indice demandé ou essai manqué. */
const ZOOMS = [2.8, 2.3, 1.85, 1.45, 1.15, 1];
const FLOUS = [24, 16, 10, 5, 2, 0];

function ImageDevoilee({ source, etape }: { source: ImageSourcePropType; etape: number }) {
  const i = Math.max(0, Math.min(ZOOMS.length - 1, etape));
  return (
    <View style={{ width: '100%', aspectRatio: 1, borderRadius: 18, overflow: 'hidden', marginBottom: 12, backgroundColor: '#0E0B26' }}>
      <Image source={source} blurRadius={FLOUS[i]} resizeMode="cover" style={{ width: '100%', height: '100%', transform: [{ scale: ZOOMS[i] }] }} />
      <View style={{ position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{i + 1}/{ZOOMS.length}</Text>
      </View>
    </View>
  );
}

function IndiceCarte({ visible, recent, numero, texte }: { visible: boolean; recent: boolean; numero: number; texte: string }) {
  const arrivee = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const dejaVu = useRef(visible);
  useEffect(() => {
    if (visible && !dejaVu.current) {
      dejaVu.current = true;
      arrivee.setValue(0);
      Animated.spring(arrivee, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }).start();
    }
  }, [visible, arrivee]);
  return (
    <Animated.View
      style={[
        styles.indice,
        !visible && styles.indiceVerrouille,
        recent && styles.indiceRecent,
        visible && {
          opacity: arrivee.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
          transform: [{ translateX: arrivee.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        },
      ]}
    >
      <Text style={styles.indiceNumero}>{numero}</Text>
      <Text style={visible ? styles.indiceTexte : styles.indiceTexteVerrouille}>{visible ? texte : tr('🔒 Indice verrouillé', '🔒 Locked clue')}</Text>
    </Animated.View>
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
  boutonJoker: { borderColor: couleurs.succes },
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
  pieces: { color: couleurs.accent, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  boutonDefi: { borderColor: couleurs.accent, marginTop: 10 },
  commentaireFin: { color: couleurs.accent, fontSize: 15, fontWeight: '700', textAlign: 'center', marginTop: 4, marginBottom: 4 },
  noteJoker: { color: couleurs.texteSecondaire, fontSize: 12, textAlign: 'center', marginTop: 10 },
  boutonSecondaireTexte: { color: couleurs.texte, fontWeight: '600', fontSize: 16 },
  barreSuite: { padding: 14, borderTopWidth: 1, borderTopColor: couleurs.bordure, backgroundColor: couleurs.fond },
  boutonSuite: { marginTop: 0 },
  saisieBarre: { padding: 14, borderTopWidth: 1, borderTopColor: couleurs.bordure, backgroundColor: couleurs.fond },
  encouragement: { color: couleurs.accent, fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  consolation: { color: couleurs.texte, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  message: { color: couleurs.erreur, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  saisieLigne: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: couleurs.carte,
    color: couleurs.texte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  envoyer: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingHorizontal: 18, paddingVertical: 13, marginLeft: 10, flexShrink: 0 },
  envoyerTexte: { color: '#1B1B1B', fontWeight: '700', fontSize: 16 },
});
