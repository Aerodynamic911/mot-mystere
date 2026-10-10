import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MAX_ESSAIS } from '../game/engine';
import { Stats } from '../game/storage';
import { couleurs, rayon } from '../theme';
import FondAnime from '../ui/FondAnime';
import TitreArc from '../ui/TitreArc';

interface Props {
  numero: number;
  serie: number;
  stats: Stats;
  jourTermine: boolean;
  jourGagne: boolean;
  musiqueActive: boolean;
  onToggleMusique: () => void;
  onJouerDuJour: () => void;
  onPartieLibre: () => void;
}

export default function Home({
  numero,
  serie,
  stats,
  jourTermine,
  jourGagne,
  musiqueActive,
  onToggleMusique,
  onJouerDuJour,
  onPartieLibre,
}: Props) {
  const tauxVictoire = stats.parties > 0 ? Math.round((stats.victoires / stats.parties) * 100) : 0;
  const maxRep = Math.max(1, ...stats.repartition);

  return (
    <View style={styles.racine}>
      <FondAnime />
      <TouchableOpacity
        style={styles.boutonSon}
        onPress={onToggleMusique}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={musiqueActive ? 'Couper la musique' : 'Activer la musique'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.boutonSonTexte}>{musiqueActive ? '🔊' : '🔇'}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.conteneur}>
      <TitreArc texte="CLUEBOX" />
      <Text style={styles.sousTitre}>Un personnage, un lieu ou un monument à deviner chaque jour.</Text>

      <View style={styles.serieCarte}>
        <Text style={styles.serieNombre}>🔥 {serie}</Text>
        <Text style={styles.serieLabel}>{serie > 1 ? 'jours de suite' : 'jour de suite'}</Text>
      </View>

      <TouchableOpacity style={styles.boutonPrincipal} onPress={onJouerDuJour} activeOpacity={0.85}>
        <Text style={styles.boutonPrincipalTexte}>
          {jourTermine ? (jourGagne ? '✅ Revoir le mystère du jour' : 'Revoir le mystère du jour') : `Jouer le mystère n°${numero}`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.boutonSecondaire} onPress={onPartieLibre} activeOpacity={0.85}>
        <Text style={styles.boutonSecondaireTexte}>🎲 Partie libre (sans limite)</Text>
      </TouchableOpacity>

      <View style={styles.statsCarte}>
        <Text style={styles.statsTitre}>Vos statistiques</Text>
        <View style={styles.statsLigne}>
          <Stat valeur={stats.parties} label="Parties" />
          <Stat valeur={`${tauxVictoire}%`} label="Victoires" />
          <Stat valeur={stats.meilleureSerie} label="Meilleure série" />
        </View>

        <Text style={styles.repTitre}>Victoires par nombre d'essais</Text>
        {Array.from({ length: MAX_ESSAIS }, (_, i) => (
          <View key={i} style={styles.repLigne}>
            <Text style={styles.repIndex}>{i + 1}</Text>
            <View style={styles.repPiste}>
              <View style={[styles.repBarre, { width: `${(stats.repartition[i] / maxRep) * 100}%` }]} />
            </View>
            <Text style={styles.repValeur}>{stats.repartition[i]}</Text>
          </View>
        ))}
      </View>
      </ScrollView>
    </View>
  );
}

function Stat({ valeur, label }: { valeur: number | string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValeur}>{valeur}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  conteneur: { padding: 20, paddingTop: 28, alignItems: 'stretch' },
  boutonSon: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,31,58,0.75)',
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  boutonSonTexte: { fontSize: 18 },
  sousTitre: { color: couleurs.texteSecondaire, fontSize: 15, textAlign: 'center', marginTop: 10, marginBottom: 24 },
  serieCarte: {
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderRadius: rayon,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  serieNombre: { color: couleurs.texte, fontSize: 40, fontWeight: '800' },
  serieLabel: { color: couleurs.texteSecondaire, fontSize: 14, marginTop: 2 },
  boutonPrincipal: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 16, alignItems: 'center' },
  boutonPrincipalTexte: { color: '#1B1B1B', fontSize: 17, fontWeight: '700' },
  boutonSecondaire: {
    marginTop: 12,
    borderRadius: rayon,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: couleurs.bordure,
    backgroundColor: 'rgba(26,31,58,0.82)',
  },
  boutonSecondaireTexte: { color: couleurs.texte, fontSize: 16, fontWeight: '600' },
  statsCarte: {
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderRadius: rayon,
    padding: 18,
    marginTop: 24,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  statsTitre: { color: couleurs.texte, fontSize: 17, fontWeight: '700', marginBottom: 14 },
  statsLigne: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 18 },
  stat: { alignItems: 'center', flex: 1 },
  statValeur: { color: couleurs.accent, fontSize: 26, fontWeight: '800' },
  statLabel: { color: couleurs.texteSecondaire, fontSize: 12, marginTop: 2, textAlign: 'center' },
  repTitre: { color: couleurs.texteSecondaire, fontSize: 13, marginBottom: 8 },
  repLigne: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  repIndex: { color: couleurs.texteSecondaire, width: 16, fontSize: 13 },
  repPiste: { flex: 1, height: 14, backgroundColor: couleurs.carteClaire, borderRadius: 7, overflow: 'hidden', marginHorizontal: 8 },
  repBarre: { height: '100%', backgroundColor: couleurs.succes, borderRadius: 7 },
  repValeur: { color: couleurs.texte, width: 24, fontSize: 13, textAlign: 'right' },
});
