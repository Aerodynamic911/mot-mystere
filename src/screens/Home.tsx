import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MAX_ESSAIS } from '../game/engine';
import { Stats } from '../game/storage';
import { couleurs, rayon } from '../theme';
import FondAnime from '../ui/FondAnime';
import Mascotte from '../ui/Mascotte';
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
  onPreferences: () => void;
  niveauAventure: number;
  etapesFaites: number;
  etapesTotal: number;
  onAventure: () => void;
  onEvenements: () => void;
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
  onPreferences,
  niveauAventure,
  etapesFaites,
  etapesTotal,
  onAventure,
  onEvenements,
}: Props) {
  const [statsOuvertes, setStatsOuvertes] = useState(false);
  const tauxVictoire = stats.parties > 0 ? Math.round((stats.victoires / stats.parties) * 100) : 0;
  const maxRep = Math.max(1, ...stats.repartition);
  const etatJour = jourTermine ? (jourGagne ? 'trouvé ✅' : 'terminé') : 'à découvrir';

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

      <View style={styles.haut}>
        <TitreArc texte="BOXTERY" />
        <Text style={styles.sousTitre}>Devinez le mystère du jour</Text>
      </View>

      <View style={styles.scene}>
        <Mascotte taille={190} />
        <Text style={styles.jour}>
          Mystère n°{numero} · {etatJour}
        </Text>
        <View style={styles.puces}>
          <View style={styles.puce}>
            <Text style={styles.puceTexte}>🔥 {serie}</Text>
          </View>
          <TouchableOpacity style={styles.puce} onPress={onPartieLibre} activeOpacity={0.85}>
            <Text style={styles.puceTexte}>🎲 Partie libre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.puce} onPress={() => setStatsOuvertes(true)} activeOpacity={0.85}>
            <Text style={styles.puceTexte}>📊 Stats</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modes}>
        <TouchableOpacity style={styles.mode} onPress={onAventure} activeOpacity={0.85}>
          <Text style={styles.modeEmoji}>🗺️</Text>
          <Text style={styles.modeTitre}>Aventure</Text>
          <Text style={styles.modeDetail}>Niveau {niveauAventure}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mode} onPress={onEvenements} activeOpacity={0.85}>
          <Text style={styles.modeEmoji}>🎉</Text>
          <Text style={styles.modeTitre}>Événements</Text>
          <Text style={styles.modeDetail}>
            {etapesFaites}/{etapesTotal} étapes
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pied}>
        <TouchableOpacity style={styles.boutonPrincipal} onPress={onJouerDuJour} activeOpacity={0.85}>
          <Text style={styles.boutonPrincipalTexte}>▶  Jouer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.boutonPreferences} onPress={onPreferences} activeOpacity={0.85}>
          <Text style={styles.boutonPreferencesTexte}>⚙️  Préférences</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={statsOuvertes} transparent animationType="fade" onRequestClose={() => setStatsOuvertes(false)}>
        <View style={styles.voile}>
          <View style={styles.statsCarte}>
            <ScrollView>
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
            </ScrollView>
            <TouchableOpacity style={styles.fermer} onPress={() => setStatsOuvertes(false)} activeOpacity={0.85}>
              <Text style={styles.fermerTexte}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  haut: { paddingTop: 28, alignItems: 'center' },
  sousTitre: { color: couleurs.texteSecondaire, fontSize: 15, textAlign: 'center', marginTop: 6 },
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  jour: { color: couleurs.texte, fontSize: 14, marginTop: 14, fontWeight: '600' },
  puces: { flexDirection: 'row', marginTop: 14 },
  puce: {
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderColor: couleurs.bordure,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  puceTexte: { color: couleurs.texte, fontSize: 14, fontWeight: '600' },
  modes: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12 },
  mode: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: rayon,
    backgroundColor: 'rgba(26,31,58,0.88)',
    borderWidth: 1.5,
    borderColor: couleurs.bordure,
  },
  modeEmoji: { fontSize: 24 },
  modeTitre: { color: couleurs.texte, fontSize: 16, fontWeight: '800', marginTop: 2 },
  modeDetail: { color: couleurs.accent, fontSize: 12, fontWeight: '700', marginTop: 2 },
  pied: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: 'rgba(15,18,36,0.88)',
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
  boutonPrincipal: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 18, alignItems: 'center' },
  boutonPrincipalTexte: { color: '#1B1B1B', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  boutonPreferences: {
    marginTop: 10,
    alignSelf: 'center',
    width: '78%',
    borderRadius: rayon,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: couleurs.bordure,
    backgroundColor: 'rgba(26,31,58,0.82)',
  },
  boutonPreferencesTexte: { color: couleurs.texte, fontSize: 15, fontWeight: '600' },
  voile: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 20 },
  statsCarte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: 18,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    maxHeight: '85%',
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
  fermer: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  fermerTexte: { color: '#1B1B1B', fontWeight: '700', fontSize: 16 },
});
