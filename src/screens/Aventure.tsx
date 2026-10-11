import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { essaisAventure, palierAventure } from '../game/aventure';
import { Progression } from '../game/progression';
import { couleurs, rayon } from '../theme';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

interface Props {
  progression: Progression;
  onJouer: () => void;
  onRetour: () => void;
}

/** Mode aventure : des niveaux qui s'enchaînent, de plus en plus serrés. */
export default function Aventure({ progression, onJouer, onRetour }: Props) {
  const { niveau, record, etoiles } = progression.aventure;
  const essais = essaisAventure(niveau);
  const repere = [niveau - 2, niveau - 1, niveau, niveau + 1, niveau + 2].filter((n) => n >= 1);

  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre="Aventure" onRetour={onRetour} />

      <View style={styles.centre}>
        <Text style={styles.palier}>{palierAventure(niveau).toUpperCase()}</Text>
        <Text style={styles.niveau}>Niveau {niveau}</Text>

        <View style={styles.chemin}>
          {repere.map((n) => (
            <View key={n} style={[styles.noeud, n < niveau && styles.noeudFait, n === niveau && styles.noeudCourant]}>
              <Text style={[styles.noeudTexte, n === niveau && styles.noeudTexteCourant]}>{n < niveau ? '✓' : n}</Text>
            </View>
          ))}
        </View>

        <View style={styles.carte}>
          <Ligne label="Essais pour ce niveau" valeur={`${essais}`} />
          <Ligne label="Étoiles gagnées" valeur={`⭐ ${etoiles}`} />
          <Ligne label="Meilleur niveau" valeur={`${record}`} />
        </View>

        <Text style={styles.note}>
          Réussissez un mystère pour passer au niveau suivant. Les niveaux avancés laissent moins d'essais.
        </Text>
      </View>

      <View style={styles.pied}>
        <TouchableOpacity style={styles.bouton} onPress={onJouer} activeOpacity={0.85}>
          <Text style={styles.boutonTexte}>▶  Jouer le niveau {niveau}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.ligneLabel}>{label}</Text>
      <Text style={styles.ligneValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  palier: { color: couleurs.accent, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  niveau: { color: couleurs.texte, fontSize: 44, fontWeight: '900', marginTop: 4 },
  chemin: { flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 26 },
  noeud: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderWidth: 2,
    borderColor: couleurs.bordure,
    opacity: 0.7,
  },
  noeudFait: { borderColor: couleurs.succes, opacity: 1 },
  noeudCourant: { width: 60, height: 60, borderRadius: 30, backgroundColor: couleurs.accent, borderColor: '#FFD36B', opacity: 1 },
  noeudTexte: { color: couleurs.texte, fontSize: 16, fontWeight: '700' },
  noeudTexteCourant: { color: '#1B1B1B', fontSize: 22, fontWeight: '900' },
  carte: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  ligneLabel: { color: couleurs.texteSecondaire, fontSize: 15 },
  ligneValeur: { color: couleurs.texte, fontSize: 15, fontWeight: '700' },
  note: { color: couleurs.texteSecondaire, fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 16 },
  pied: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: 'rgba(15,18,36,0.88)',
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 18, alignItems: 'center' },
  boutonTexte: { color: '#1B1B1B', fontSize: 20, fontWeight: '800' },
});
