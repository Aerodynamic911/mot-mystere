import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jouerEffet } from '../audio/effets';
import { Affirmation, NB_PAR_SERIE, tirerSerie } from '../data/vraifaux';
import { tr } from '../i18n';
import { messagePartage } from '../game/partage';
import { couleurs, rayon } from '../theme';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

/** Pièces gagnées à la fin d'une série : une par bonne réponse, et 5 de plus pour un sans-faute. */
export function piecesVraiFaux(bonnes: number, total: number): number {
  return bonnes + (bonnes === total && total >= NB_PAR_SERIE ? 5 : 0);
}

export interface ResultatVraiFaux {
  bonnes: number;
  total: number;
  record: boolean;
  pieces: number;
}

interface Props {
  /** Meilleur score enregistré avant cette série. */
  meilleur: number;
  onTerminee: (r: { bonnes: number; total: number }) => ResultatVraiFaux;
  /** Jokers passe en réserve : chacun remplace l'affirmation en cours par une autre, sans pénalité. */
  jokersPasser: number;
  onJokerPasser: () => void;
  onPartage: () => void;
  onRetour: () => void;
}

/** Vrai ou faux : une série de 10 affirmations, avec une explication après chaque réponse. */
export default function VraiFaux({ meilleur, jokersPasser, onJokerPasser, onTerminee, onPartage, onRetour }: Props) {
  const [phase, setPhase] = useState<'regles' | 'jeu' | 'fin'>('regles');
  const [serie, setSerie] = useState<Affirmation[]>([]);
  const [rang, setRang] = useState(0);
  const [bonnes, setBonnes] = useState(0);
  // Réponse donnée à l'affirmation en cours (null tant que le joueur n'a pas répondu).
  const [reponse, setReponse] = useState<boolean | null>(null);
  const [resultat, setResultat] = useState<ResultatVraiFaux | null>(null);

  function demarrer() {
    setSerie(tirerSerie());
    setRang(0);
    setBonnes(0);
    setReponse(null);
    setResultat(null);
    setPhase('jeu');
  }

  function repondre(choix: boolean) {
    if (reponse !== null) return;
    const juste = choix === serie[rang].vrai;
    setReponse(choix);
    if (juste) setBonnes((n) => n + 1);
    jouerEffet(juste ? 'pop' : 'echec');
  }

  /** Joker passe : l'affirmation en cours est remplacée par une autre qui n'est pas déjà dans la série. */
  function passer() {
    if (jokersPasser <= 0 || reponse !== null) return;
    const deja = new Set(serie.map((a) => a.id));
    const remplacante = tirerSerie().find((a) => !deja.has(a.id));
    if (!remplacante) return;
    setSerie((liste) => liste.map((a, i) => (i === rang ? remplacante : a)));
    jouerEffet('indice');
    onJokerPasser();
  }

  function suite() {
    if (rang + 1 < serie.length) {
      setRang(rang + 1);
      setReponse(null);
      return;
    }
    setResultat(onTerminee({ bonnes, total: serie.length }));
    setPhase('fin');
  }

  async function partager() {
    try {
      const r = await Share.share({
        message: messagePartage(
          tr(
            '✅ Quizzle Vrai ou faux : {b}/{t} ! Saurez-vous faire mieux ?',
            '✅ Quizzle True or false: {b}/{t}! Can you beat it?',
            { b: bonnes, t: serie.length },
          ),
        ),
      });
      if (r.action === Share.sharedAction) onPartage();
    } catch {
      // Partage annulé.
    }
  }

  const titre = tr('Vrai ou faux', 'True or false');

  if (phase === 'regles') {
    return (
      <View style={styles.racine}>
        <FondAnime />
        <EnteteEcran titre={`✅ ${titre}`} onRetour={onRetour} />
        <ScrollView contentContainerStyle={styles.centre}>
          <Text style={styles.gros}>🤔</Text>
          <Text style={styles.titreRegles}>{tr('{n} affirmations, vraies ou fausses ?', '{n} statements, true or false?', { n: NB_PAR_SERIE })}</Text>
          <Text style={styles.regle}>
            {tr(
              'Répondez à chaque affirmation, puis découvrez la réponse et une explication. Une pièce par bonne réponse, et 5 de plus pour un sans-faute !',
              'Answer each statement, then discover the answer and an explanation. One coin per right answer, plus 5 for a perfect score!',
            )}
          </Text>
          <Text style={styles.record}>🏅 {tr('Votre meilleur score', 'Your best score')} : {meilleur}/{NB_PAR_SERIE}</Text>
          <TouchableOpacity style={styles.go} onPress={demarrer} activeOpacity={0.85}>
            <Text style={styles.goTexte}>{tr('Jouer', 'Play')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'fin' && resultat) {
    const parfait = resultat.bonnes === resultat.total;
    return (
      <View style={styles.racine}>
        <FondAnime />
        <EnteteEcran titre={`✅ ${titre}`} onRetour={onRetour} />
        <ScrollView contentContainerStyle={styles.centre}>
          <Text style={styles.gros}>{parfait ? '🏆' : resultat.bonnes >= resultat.total / 2 ? '👏' : '💪'}</Text>
          <Text style={styles.titreRegles}>
            {parfait ? tr('Sans-faute !', 'Perfect score!') : resultat.bonnes >= resultat.total / 2 ? tr('Bien joué !', 'Well played!') : tr('Courage, on apprend en jouant !', 'Keep going, you learn by playing!')}
          </Text>
          <Text style={styles.scoreGros}>
            {resultat.bonnes}/{resultat.total}
          </Text>
          {resultat.record ? (
            <Text style={styles.nouveauRecord}>🎉 {tr('Nouveau record !', 'New best score!')}</Text>
          ) : (
            <Text style={styles.recordFin}>🏅 {tr('Record', 'Best')} : {meilleur}/{NB_PAR_SERIE}</Text>
          )}
          <Text style={styles.pieces}>+{resultat.pieces} 🪙</Text>
          <TouchableOpacity style={styles.go} onPress={demarrer} activeOpacity={0.85}>
            <Text style={styles.goTexte}>{tr('Rejouer', 'Play again')}</Text>
          </TouchableOpacity>
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

  const a = serie[rang];
  if (!a) return null;
  const aRepondu = reponse !== null;
  const juste = aRepondu && reponse === a.vrai;
  return (
    <View style={styles.racine}>
      <FondAnime />
      <View style={styles.entete}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.retour}>{tr('‹ Quitter', '‹ Quit')}</Text>
        </TouchableOpacity>
        <Text style={styles.titreEntete}>{titre}</Text>
        <Text style={styles.compteur}>
          {rang + 1}/{serie.length}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.categorie}>{a.categorie.toUpperCase()}</Text>
        <View style={styles.carte}>
          <Text style={styles.affirmation}>{a.texte}</Text>
        </View>

        {!aRepondu ? (
          <View style={styles.choix}>
            <TouchableOpacity style={[styles.choixBouton, styles.choixVrai]} onPress={() => repondre(true)} activeOpacity={0.85}>
              <Text style={styles.choixTexte}>👍 {tr('VRAI', 'TRUE')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.choixBouton, styles.choixFaux]} onPress={() => repondre(false)} activeOpacity={0.85}>
              <Text style={styles.choixTexte}>👎 {tr('FAUX', 'FALSE')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.retour2, juste ? styles.retourJuste : styles.retourFaux]}>
            <Text style={styles.verdict}>{juste ? tr('✓ Bonne réponse !', '✓ Correct!') : tr('✗ Raté…', '✗ Not quite…')}</Text>
            <Text style={styles.laReponse}>
              {a.vrai ? tr("C'est vrai.", "It's true.") : tr("C'est faux.", "It's false.")}
            </Text>
            <Text style={styles.explication}>{a.explication}</Text>
          </View>
        )}
        {!aRepondu && jokersPasser > 0 && (
          <TouchableOpacity style={styles.passer} onPress={passer} activeOpacity={0.85}>
            <Text style={styles.passerTexte}>⏭️ {tr('Passer cette affirmation ({n})', 'Skip this statement ({n})', { n: jokersPasser })}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      {aRepondu && (
        <View style={styles.barreSuite}>
          <TouchableOpacity style={styles.go2} onPress={suite} activeOpacity={0.85}>
            <Text style={styles.goTexte}>{rang + 1 < serie.length ? tr('Suivant', 'Next') : tr('Voir mon score', 'See my score')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  centre: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  gros: { fontSize: 64, marginTop: 6 },
  titreRegles: { color: couleurs.texte, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  regle: { color: couleurs.texte, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 14 },
  record: { color: couleurs.accent, fontSize: 16, fontWeight: '800', marginTop: 14 },
  go: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 16, paddingHorizontal: 30, marginTop: 22, alignSelf: 'stretch', alignItems: 'center' },
  go2: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 14, alignItems: 'center' },
  goTexte: { color: '#1B1B1B', fontWeight: '800', fontSize: 18 },
  secondaire: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: couleurs.bordure, marginTop: 12 },
  secondaireTexte: { color: couleurs.texte, fontWeight: '700', fontSize: 16 },
  scoreGros: { color: couleurs.accent, fontSize: 64, fontWeight: '900', marginTop: 6 },
  nouveauRecord: { color: couleurs.succes, fontSize: 18, fontWeight: '800', marginTop: 10 },
  recordFin: { color: couleurs.texteSecondaire, fontSize: 15, marginTop: 10 },
  pieces: { color: couleurs.accent, fontSize: 24, fontWeight: '900', marginTop: 12 },
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  retour: { color: couleurs.texteSecondaire, fontSize: 16, width: 90 },
  titreEntete: { color: couleurs.texte, fontSize: 17, fontWeight: '700' },
  compteur: { color: couleurs.accent, fontSize: 16, fontWeight: '700', width: 90, textAlign: 'right' },
  contenu: { padding: 20, paddingTop: 8 },
  passer: { alignSelf: 'center', marginTop: 18, paddingVertical: 10, paddingHorizontal: 18, borderRadius: rayon, borderWidth: 1.5, borderColor: couleurs.bordure },
  passerTexte: { color: couleurs.texteSecondaire, fontSize: 14, fontWeight: '700' },
  categorie: { color: couleurs.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, padding: 22, minHeight: 130, justifyContent: 'center' },
  affirmation: { color: couleurs.texte, fontSize: 20, lineHeight: 28, fontWeight: '600', textAlign: 'center' },
  choix: { flexDirection: 'row', marginTop: 22 },
  choixBouton: { flex: 1, borderRadius: rayon, paddingVertical: 20, alignItems: 'center', borderWidth: 2 },
  choixVrai: { borderColor: couleurs.succes, backgroundColor: 'rgba(61,220,151,0.12)', marginRight: 8 },
  choixFaux: { borderColor: couleurs.erreur, backgroundColor: 'rgba(255,107,107,0.12)', marginLeft: 8 },
  choixTexte: { color: couleurs.texte, fontSize: 20, fontWeight: '900' },
  retour2: { borderRadius: rayon, borderWidth: 1.5, padding: 18, marginTop: 18 },
  retourJuste: { backgroundColor: 'rgba(61,220,151,0.10)', borderColor: couleurs.succes },
  retourFaux: { backgroundColor: 'rgba(255,107,107,0.10)', borderColor: couleurs.erreur },
  verdict: { color: couleurs.texte, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  laReponse: { color: couleurs.accent, fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  explication: { color: couleurs.texte, fontSize: 15, lineHeight: 22, marginTop: 10 },
  barreSuite: { padding: 14, borderTopWidth: 1, borderTopColor: couleurs.bordure, backgroundColor: couleurs.fond },
});
