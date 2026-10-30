import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { jouerEffet } from '../audio/effets';
import { Mystere } from '../data/mysteres';
import { poolPour } from '../game/aventure';
import { SECONDES_JOKER_TEMPS } from '../game/boutique';
import { estCorrect, normaliser } from '../game/engine';
import type { TrancheAge } from '../game/preferences';
import { localiser, tr } from '../i18n';
import { couleurs, rayon } from '../theme';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

/** Durée d'une manche, en secondes. */
export const DUREE_SPRINT = 90;
/** Secondes perdues à chaque mauvaise réponse, et pour passer un mystère. */
const PENALITE_ERREUR = 3;
const PENALITE_PASSER = 2;

/** Points d'un mystère : 6 avec un seul indice, 1 avec les six. */
export function pointsSprint(indicesVisibles: number): number {
  return Math.max(1, 7 - indicesVisibles);
}

function nbTrouves(n: number): string {
  return tr(`${n} mystère${n > 1 ? 's trouvés' : ' trouvé'}`, `${n} ${n > 1 ? 'mysteries' : 'mystery'} found`);
}

/** Pièces gagnées à la fin d'un Sprint. */
export function piecesSprint(points: number): number {
  return Math.min(40, Math.round(points / 2));
}

/** Une ligne du récapitulatif de fin de manche. */
interface LigneBilan {
  reponse: string;
  anecdote: string;
  etat: 'trouve' | 'passe' | 'temps';
}

export interface ResultatSprint {
  points: number;
  trouves: number;
  record: boolean;
  pieces: number;
}

interface Props {
  age: TrancheAge;
  /** Meilleur score enregistré avant cette manche. */
  record: number;
  onTerminee: (r: { points: number; trouves: number }) => ResultatSprint;
  /** Jokers temps en réserve : chacun ajoute des secondes au chrono. */
  jokersTemps: number;
  onJokerTemps: () => void;
  onPartage: () => void;
  onRetour: () => void;
}

function melangerHasard<T>(liste: T[]): T[] {
  const c = [...liste];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/** Sprint : 90 secondes pour trouver un maximum de mystères. Moins on utilise d'indices, plus on marque de points. */
export default function Sprint({ age, record, jokersTemps, onJokerTemps, onTerminee, onPartage, onRetour }: Props) {
  const [phase, setPhase] = useState<'regles' | 'jeu' | 'fin'>('regles');
  const [ordre, setOrdre] = useState<Mystere[]>(() => melangerHasard(poolPour(age)));
  const [rang, setRang] = useState(0);
  const [indices, setIndices] = useState(1);
  const [saisie, setSaisie] = useState('');
  const [reste, setReste] = useState(DUREE_SPRINT);
  const [points, setPoints] = useState(0);
  const [trouves, setTrouves] = useState(0);
  const [bandeau, setBandeau] = useState<{ texte: string; ok: boolean } | null>(null);
  const [malus, setMalus] = useState(0);
  const [resultat, setResultat] = useState<ResultatSprint | null>(null);
  const fin = useRef(0);
  const pointsRef = useRef(0);
  const trouvesRef = useRef(0);
  const dejaFini = useRef(false);
  const essayes = useRef<string[]>([]);
  const bilanRef = useRef<LigneBilan[]>([]);
  const [bilan, setBilan] = useState<LigneBilan[]>([]);
  const champ = useRef<TextInput>(null);

  const brut = ordre[rang % ordre.length];
  const mystere = useMemo(() => localiser(brut), [brut]);
  const courantRef = useRef(mystere);
  courantRef.current = mystere;

  function noter(etat: LigneBilan['etat'], m: Mystere = courantRef.current) {
    bilanRef.current.push({ reponse: m.reponse, anecdote: m.anecdote ?? '', etat });
  }

  function demarrer() {
    setOrdre(melangerHasard(poolPour(age)));
    setRang(0);
    setIndices(1);
    setSaisie('');
    setPoints(0);
    setTrouves(0);
    setBandeau(null);
    setMalus(0);
    setResultat(null);
    setBilan([]);
    bilanRef.current = [];
    pointsRef.current = 0;
    trouvesRef.current = 0;
    dejaFini.current = false;
    essayes.current = [];
    fin.current = Date.now() + DUREE_SPRINT * 1000;
    setReste(DUREE_SPRINT);
    setPhase('jeu');
    setTimeout(() => champ.current?.focus(), 150);
  }

  function terminer() {
    if (dejaFini.current) return;
    dejaFini.current = true;
    noter('temps'); // le mystère en cours quand le temps est écoulé
    setBilan([...bilanRef.current]);
    const r = onTerminee({ points: pointsRef.current, trouves: trouvesRef.current });
    setResultat(r);
    setPhase('fin');
  }

  // Le chrono : on compare à l'heure de fin, pour rester juste même si l'appli ralentit.
  useEffect(() => {
    if (phase !== 'jeu') return;
    const id = setInterval(() => {
      const ms = fin.current - Date.now();
      setReste(Math.max(0, Math.ceil(ms / 1000)));
      if (ms <= 0) {
        clearInterval(id);
        terminer();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Le bandeau (« +5 », « C'était… ») disparaît tout seul.
  useEffect(() => {
    if (!bandeau) return;
    const t = setTimeout(() => setBandeau(null), 1600);
    return () => clearTimeout(t);
  }, [bandeau]);
  useEffect(() => {
    if (!malus) return;
    const t = setTimeout(() => setMalus(0), 900);
    return () => clearTimeout(t);
  }, [malus]);

  function suivant() {
    setRang((r) => r + 1);
    setIndices(1);
    setSaisie('');
    essayes.current = [];
  }

  function retirer(secondes: number) {
    fin.current -= secondes * 1000;
    setMalus(secondes);
    setReste(Math.max(0, Math.ceil((fin.current - Date.now()) / 1000)));
  }

  function valider() {
    const texte = saisie.trim();
    if (!texte || phase !== 'jeu') return;
    if (estCorrect(mystere, texte)) {
      const gain = pointsSprint(indices);
      pointsRef.current += gain;
      trouvesRef.current += 1;
      setPoints(pointsRef.current);
      setTrouves(trouvesRef.current);
      noter('trouve');
      setBandeau({ texte: `✓ ${mystere.reponse}  +${gain}`, ok: true });
      jouerEffet('pop');
      suivant();
    } else {
      if (!essayes.current.includes(normaliser(texte))) {
        essayes.current.push(normaliser(texte));
        retirer(PENALITE_ERREUR);
      }
      jouerEffet('echec');
      setSaisie('');
    }
    setTimeout(() => champ.current?.focus(), 0);
  }

  function ajouterTemps() {
    if (jokersTemps <= 0 || phase !== 'jeu' || dejaFini.current) return;
    fin.current += SECONDES_JOKER_TEMPS * 1000;
    setReste(Math.max(0, Math.ceil((fin.current - Date.now()) / 1000)));
    setBandeau({ texte: `⏳ +${SECONDES_JOKER_TEMPS} s`, ok: true });
    jouerEffet('indice');
    onJokerTemps();
    setTimeout(() => champ.current?.focus(), 0);
  }

  function indiceSuivant() {
    if (indices >= mystere.indices.length) return;
    setIndices((n) => n + 1);
    jouerEffet('indice');
  }

  function passer() {
    setBandeau({ texte: `${tr('C’était', 'It was')} : ${mystere.reponse}`, ok: false });
    retirer(PENALITE_PASSER);
    noter('passe');
    suivant();
    setTimeout(() => champ.current?.focus(), 0);
  }

  async function partager() {
    try {
      const r = await Share.share({
        message: tr(
          'Quizzle ⚡ Sprint : {p} points, {m} en {d} secondes. Saurez-vous faire mieux ?',
          'Quizzle ⚡ Sprint: {p} points, {m} in {d} seconds. Can you beat it?',
          { p: pointsRef.current, m: nbTrouves(trouvesRef.current), d: DUREE_SPRINT },
        ),
      });
      if (r.action === Share.sharedAction) onPartage();
    } catch {
      // Partage annulé.
    }
  }

  if (phase === 'regles') {
    return (
      <View style={styles.racine}>
        <FondAnime />
        <EnteteEcran titre="⚡ Sprint" onRetour={onRetour} />
        <ScrollView contentContainerStyle={styles.centre}>
          <Text style={styles.gros}>⚡</Text>
          <Text style={styles.titreRegles}>{tr('{n} secondes, un maximum de mystères !', '{n} seconds, as many mysteries as you can!', { n: DUREE_SPRINT })}</Text>
          <View style={styles.regles}>
            <Text style={styles.regle}>• {tr('Un seul indice au départ : plus vous en demandez, moins vous gagnez de points (6 points pour 1 indice, 1 point pour 6).', 'Only one clue at first: the more you ask for, the fewer points you win (6 points for 1 clue, 1 point for 6).')}</Text>
            <Text style={styles.regle}>• {tr('Une mauvaise réponse retire {n} secondes. Passer un mystère en retire {m}.', 'A wrong answer costs {n} seconds. Skipping a mystery costs {m}.', { n: PENALITE_ERREUR, m: PENALITE_PASSER })}</Text>
            <Text style={styles.regle}>• {tr('Les pièces gagnées dépendent de votre score.', 'The coins you earn depend on your score.')}</Text>
          </View>
          <Text style={styles.record}>🏅 {tr('Votre record', 'Your best')} : {record}</Text>
          <TouchableOpacity style={styles.go} onPress={demarrer} activeOpacity={0.85}>
            <Text style={styles.goTexte}>{tr('C’est parti !', 'Go!')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'fin' && resultat) {
    return (
      <View style={styles.racine}>
        <FondAnime />
        <EnteteEcran titre="⚡ Sprint" onRetour={onRetour} />
        <ScrollView contentContainerStyle={styles.centre}>
          <Text style={styles.gros}>{resultat.record ? '🏆' : '⏱️'}</Text>
          <Text style={styles.titreRegles}>{tr('Temps écoulé !', 'Time’s up!')}</Text>
          <Text style={styles.scoreGros}>{resultat.points}</Text>
          <Text style={styles.scoreLibelle}>{tr('points', 'points')}</Text>
          <Text style={styles.detailFin}>{nbTrouves(resultat.trouves)}</Text>
          {resultat.record && <Text style={styles.nouveauRecord}>🎉 {tr('Nouveau record !', 'New best score!')}</Text>}
          {!resultat.record && <Text style={styles.recordFin}>🏅 {tr('Record', 'Best')} : {record}</Text>}
          <Text style={styles.pieces}>+{resultat.pieces} 🪙</Text>
          <TouchableOpacity style={styles.go} onPress={demarrer} activeOpacity={0.85}>
            <Text style={styles.goTexte}>{tr('Rejouer', 'Play again')}</Text>
          </TouchableOpacity>
          {bilan.length > 0 && (
            <View style={styles.bilan}>
              <Text style={styles.bilanTitre}>{tr('Récapitulatif des réponses', 'Answers recap')}</Text>
              {bilan.map((l, i) => (
                <View key={i} style={styles.bilanLigne}>
                  <Text style={styles.bilanReponse}>
                    {l.etat === 'trouve' ? '✅' : l.etat === 'passe' ? '⏭' : '⏱'} {l.reponse}
                  </Text>
                  {l.etat !== 'trouve' && (
                    <Text style={styles.bilanEtat}>{l.etat === 'passe' ? tr('Passé', 'Skipped') : tr('Pas trouvé à temps', 'Not found in time')}</Text>
                  )}
                  {!!l.anecdote && <Text style={styles.bilanAnecdote}>{l.anecdote}</Text>}
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={[styles.go, styles.secondaire]} onPress={partager} activeOpacity={0.85}>
            <Text style={styles.secondaireTexte}>📤 {tr('Partager mon score', 'Share my score')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.go, styles.secondaire]} onPress={onRetour} activeOpacity={0.85}>
            <Text style={styles.secondaireTexte}>{tr("Retour à l'accueil", 'Back to home')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const urgent = reste <= 10;
  return (
    <KeyboardAvoidingView style={styles.racine} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.retour}>{tr('‹ Quitter', '‹ Quit')}</Text>
        </TouchableOpacity>
        <Text style={[styles.chrono, urgent && styles.chronoUrgent]}>⏱ {reste}s</Text>
        <Text style={styles.points}>{points} pts</Text>
      </View>
      <View style={styles.piste}>
        <View style={[styles.barre, { width: `${(reste / DUREE_SPRINT) * 100}%` }, urgent && styles.barreUrgente]} />
      </View>
      {malus > 0 && <Text style={styles.malus}>−{malus} s</Text>}

      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        {bandeau ? (
          <Text style={[styles.bandeau, bandeau.ok ? styles.bandeauOk : styles.bandeauRate]}>{bandeau.texte}</Text>
        ) : (
          <Text style={styles.bandeauVide}> </Text>
        )}
        <Text style={styles.categorie}>{tr('{c} À DEVINER', '{c} TO GUESS', { c: mystere.categorie.toUpperCase() })}</Text>
        {mystere.indices.slice(0, indices).map((indice, i) => (
          <View key={`${rang}-${i}`} style={[styles.indice, i === indices - 1 && styles.indiceRecent]}>
            <Text style={styles.indiceNumero}>{i + 1}</Text>
            <Text style={styles.indiceTexte}>{indice}</Text>
          </View>
        ))}
        <Text style={styles.gain}>{tr('Réponse trouvée maintenant : +{n} points', 'Found now: +{n} points', { n: pointsSprint(indices) })}</Text>
      </ScrollView>

      <View style={styles.saisieBarre}>
        <View style={styles.boutons}>
          <TouchableOpacity
            style={[styles.petit, indices >= mystere.indices.length && styles.petitInactif]}
            onPress={indiceSuivant}
            disabled={indices >= mystere.indices.length}
            activeOpacity={0.85}
          >
            <Text style={styles.petitTexte}>💡 {tr('Indice', 'Clue')}</Text>
          </TouchableOpacity>
          {jokersTemps > 0 && (
            <TouchableOpacity style={styles.petit} onPress={ajouterTemps} activeOpacity={0.85}>
              <Text style={styles.petitTexte}>⏳ +{SECONDES_JOKER_TEMPS} s ({jokersTemps})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.petit, styles.petitPasser]} onPress={passer} activeOpacity={0.85}>
            <Text style={styles.petitTexte}>⏭ {tr('Passer (−{n} s)', 'Skip (−{n} s)', { n: PENALITE_PASSER })}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.saisieLigne}>
          <TextInput
            ref={champ}
            style={styles.input}
            value={saisie}
            onChangeText={setSaisie}
            placeholder={tr('Votre réponse…', 'Your answer…')}
            placeholderTextColor={couleurs.texteSecondaire}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={valider}
          />
          <TouchableOpacity style={styles.envoyer} onPress={valider} activeOpacity={0.85}>
            <Text style={styles.envoyerTexte}>{tr('Valider', 'Submit')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  centre: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  gros: { fontSize: 64, marginTop: 6 },
  titreRegles: { color: couleurs.texte, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  regles: { marginTop: 18, alignSelf: 'stretch' },
  regle: { color: couleurs.texte, fontSize: 15, lineHeight: 22, marginBottom: 8 },
  record: { color: couleurs.accent, fontSize: 16, fontWeight: '800', marginTop: 12 },
  go: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 16, paddingHorizontal: 30, marginTop: 22, alignSelf: 'stretch', alignItems: 'center' },
  goTexte: { color: '#1B1B1B', fontWeight: '800', fontSize: 18 },
  secondaire: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: couleurs.bordure, marginTop: 12 },
  secondaireTexte: { color: couleurs.texte, fontWeight: '700', fontSize: 16 },
  scoreGros: { color: couleurs.accent, fontSize: 72, fontWeight: '900', marginTop: 6 },
  scoreLibelle: { color: couleurs.texteSecondaire, fontSize: 14, fontWeight: '700', marginTop: -6 },
  detailFin: { color: couleurs.texte, fontSize: 17, marginTop: 10 },
  nouveauRecord: { color: couleurs.succes, fontSize: 18, fontWeight: '800', marginTop: 10 },
  recordFin: { color: couleurs.texteSecondaire, fontSize: 15, marginTop: 10 },
  pieces: { color: couleurs.accent, fontSize: 24, fontWeight: '900', marginTop: 12 },
  bilan: { alignSelf: 'stretch', marginTop: 26 },
  bilanTitre: { color: couleurs.accent, fontSize: 13, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 10 },
  bilanLigne: { backgroundColor: couleurs.carte, borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, padding: 12, marginBottom: 8 },
  bilanReponse: { color: couleurs.texte, fontSize: 16, fontWeight: '800' },
  bilanEtat: { color: couleurs.texteSecondaire, fontSize: 12, marginTop: 2 },
  bilanAnecdote: { color: couleurs.texteSecondaire, fontSize: 13, lineHeight: 18, marginTop: 6 },
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  retour: { color: couleurs.texteSecondaire, fontSize: 16, width: 90 },
  chrono: { color: couleurs.texte, fontSize: 22, fontWeight: '900' },
  chronoUrgent: { color: couleurs.erreur },
  points: { color: couleurs.accent, fontSize: 18, fontWeight: '800', width: 90, textAlign: 'right' },
  piste: { height: 6, backgroundColor: couleurs.carteClaire, marginHorizontal: 20, borderRadius: 3, overflow: 'hidden' },
  barre: { height: '100%', backgroundColor: couleurs.accent },
  barreUrgente: { backgroundColor: couleurs.erreur },
  malus: { position: 'absolute', top: 14, alignSelf: 'center', color: couleurs.erreur, fontSize: 18, fontWeight: '900', zIndex: 5 },
  contenu: { padding: 20, paddingTop: 10 },
  bandeau: { fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 10, paddingVertical: 8, borderRadius: rayon, overflow: 'hidden' },
  bandeauOk: { color: couleurs.succes, backgroundColor: 'rgba(61,220,151,0.12)' },
  bandeauRate: { color: couleurs.accent, backgroundColor: 'rgba(245,185,66,0.12)' },
  bandeauVide: { fontSize: 16, marginBottom: 10, paddingVertical: 8 },
  categorie: { color: couleurs.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  indice: { flexDirection: 'row', backgroundColor: couleurs.carte, borderRadius: rayon, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: couleurs.bordure, alignItems: 'flex-start' },
  indiceRecent: { borderColor: couleurs.accent, backgroundColor: couleurs.carteClaire },
  indiceNumero: { color: couleurs.accent, fontWeight: '800', fontSize: 16, width: 26 },
  indiceTexte: { color: couleurs.texte, fontSize: 16, lineHeight: 22, flex: 1 },
  gain: { color: couleurs.texteSecondaire, fontSize: 12, textAlign: 'center', marginTop: 4 },
  saisieBarre: { padding: 14, borderTopWidth: 1, borderTopColor: couleurs.bordure, backgroundColor: couleurs.fond },
  boutons: { flexDirection: 'row', marginBottom: 10 },
  petit: { flex: 1, borderRadius: rayon, borderWidth: 1.5, borderColor: couleurs.accent, paddingVertical: 10, alignItems: 'center', marginRight: 10 },
  petitPasser: { borderColor: couleurs.bordure, marginRight: 0 },
  petitInactif: { opacity: 0.35 },
  petitTexte: { color: couleurs.texte, fontSize: 14, fontWeight: '700' },
  saisieLigne: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, minWidth: 0, backgroundColor: couleurs.carte, color: couleurs.texte, borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  envoyer: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingHorizontal: 18, paddingVertical: 13, marginLeft: 10, flexShrink: 0 },
  envoyerTexte: { color: '#1B1B1B', fontWeight: '700', fontSize: 16 },
});
