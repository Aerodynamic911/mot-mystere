import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MAX_ESSAIS } from '../game/engine';
import { PALIERS_JOURS, PALIERS_VICTOIRES, prochainPalier } from '../game/bonus';
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
  onPreferences: () => void;
  niveauAventure: number;
  etapesFaites: number;
  etapesTotal: number;
  onAventure: () => void;
  onEvenement: () => void;
  serieVictoires: number;
  jokers: number;
  nbCartes: number;
  onCollection: () => void;
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
  onPreferences,
  niveauAventure,
  etapesFaites,
  etapesTotal,
  onAventure,
  onEvenement,
  serieVictoires,
  jokers,
  nbCartes,
  onCollection,
}: Props) {
  const [statsOuvertes, setStatsOuvertes] = useState(false);
  // Infobulle ouverte en touchant la série ou les jokers.
  const [info, setInfo] = useState<'serie' | 'jokers' | null>(null);
  const [hauteurScene, setHauteurScene] = useState(0);
  // La place restante après le texte « Mystère du jour » et les puces (≈ 84 px) revient à la mascotte.
  const tailleMascotte = hauteurScene ? Math.max(90, Math.min(190, hauteurScene - 84)) : 190;
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

      <View style={styles.haut}>
        <TitreArc texte="BOXTERY" />
        <View style={styles.ruban}>
          <Text style={styles.rubanTexte}>LE JEU DES MYSTÈRES</Text>
        </View>
      </View>

      {/* Zone fixe (non défilante) : la mascotte rétrécit sur un petit écran pour que « Mystère du jour » et les stats restent visibles. */}
      <View style={styles.scene} onLayout={(e) => setHauteurScene(e.nativeEvent.layout.height)}>
        <Mascotte taille={tailleMascotte} />
        <View style={styles.puces}>
          <Puce icone="🔥" valeur={serieVictoires} libelle="Série" onPress={() => setInfo('serie')} />
          <Puce icone="✨" valeur={jokers} libelle="Jokers" onPress={() => setInfo('jokers')} />
          <Puce icone="🃏" valeur={nbCartes} libelle="Cartes" onPress={onCollection} />
          <Puce icone="📊" valeur="" libelle="Stats" onPress={() => setStatsOuvertes(true)} />
        </View>
      </View>

      <View style={styles.modes}>
        <TouchableOpacity style={[styles.mode, jourTermine && styles.modeEnAvant]} onPress={onAventure} activeOpacity={0.85}>
          <Text style={styles.modeEmoji}>🗺️</Text>
          <Text style={styles.modeTitre}>Aventure</Text>
          <Text style={styles.modeDetail}>Niveau {niveauAventure}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mode, jourTermine && styles.modeEnAvant]} onPress={onEvenement} activeOpacity={0.85}>
          <Text style={styles.modeEmoji}>🎉</Text>
          <Text style={styles.modeTitre}>Événements</Text>
          <Text style={styles.modeDetail}>
            {etapesFaites}/{etapesTotal} étapes
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pied}>
        {/* Tant que le mystère du jour n'est pas fait, c'est le bouton principal ; ensuite il s'efface devant les autres modes. */}
        <TouchableOpacity
          style={[styles.boutonPrincipal, jourTermine && styles.boutonPrincipalFait]}
          onPress={onJouerDuJour}
          activeOpacity={0.85}
        >
          <Text style={[styles.boutonPrincipalTexte, jourTermine && styles.boutonPrincipalTexteFait]}>
            {jourTermine ? '✅  Mystère du jour' : '📅  Mystère du jour'}
          </Text>
          <Text style={[styles.boutonPrincipalSous, jourTermine && styles.boutonPrincipalSousFait]}>
            {jourTermine ? (jourGagne ? 'Trouvé · revenez demain !' : 'Terminé · revenez demain !') : 'À découvrir'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.boutonPreferences} onPress={onPreferences} activeOpacity={0.85}>
          <Text style={styles.boutonPreferencesTexte}>⚙️  Préférences</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={info !== null} transparent animationType="fade" onRequestClose={() => setInfo(null)}>
        <TouchableOpacity style={styles.voile} activeOpacity={1} onPress={() => setInfo(null)}>
          <View style={styles.infoCarte}>
            {info === 'serie' && (
              <>
                <Text style={styles.statsTitre}>🔥 Série de victoires</Text>
                <Text style={styles.infoTexte}>
                  C'est le nombre de parties gagnées d'affilée, tous modes confondus : mystère du jour, aventure et événements. Une défaite remet le compteur à zéro.
                </Text>
                <Text style={styles.infoTexte}>
                  {prochainPalier(PALIERS_VICTOIRES, serieVictoires)
                    ? `Prochain bonus : ${prochainPalier(PALIERS_VICTOIRES, serieVictoires)!.seuil} victoires d'affilée → +${prochainPalier(PALIERS_VICTOIRES, serieVictoires)!.jokers} ✨ joker(s).`
                    : "Vous avez atteint tous les paliers de bonus !"}
                </Text>
                <Text style={styles.infoNote}>Votre meilleure série : {stats.meilleureSerieVictoires}. Série de jours avec le mystère du jour : {serie} (détail dans 📊 Stats).</Text>
              </>
            )}
            {info === 'jokers' && (
              <>
                <Text style={styles.statsTitre}>✨ Jokers</Text>
                <Text style={styles.infoTexte}>
                  Un joker révèle un indice supplémentaire sans compter comme un essai. Vous en avez {jokers} en réserve : utilisez-les pendant une partie avec le bouton vert « Utiliser un joker ».
                </Text>
                <Text style={styles.infoTexte}>
                  Pour en gagner, enchaînez les séries : {PALIERS_JOURS.map((p) => p.seuil).join(', ')} jours de suite avec le mystère du jour, ou {PALIERS_VICTOIRES.map((p) => p.seuil).join(', ')} victoires d'affilée.
                </Text>
              </>
            )}
            <Text style={styles.infoNote}>Touchez pour fermer</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={statsOuvertes} transparent animationType="fade" onRequestClose={() => setStatsOuvertes(false)}>
        <View style={styles.voile}>
          <View style={styles.statsCarte}>
            <ScrollView>
              <Text style={styles.statsTitre}>Vos statistiques</Text>
              <View style={styles.statsLigne}>
                <Stat valeur={stats.parties} label="Parties" />
                <Stat valeur={stats.victoires} label="Victoires" />
                <Stat valeur={`${tauxVictoire}%`} label="Réussite" />
              </View>

              <Text style={styles.repTitre}>Séries</Text>
              <View style={styles.statsLigne}>
                <Stat valeur={serie} label="Jours de suite" />
                <Stat valeur={stats.meilleureSerie} label="Meilleure (jours)" />
              </View>
              <View style={styles.statsLigne}>
                <Stat valeur={stats.serieVictoires} label="Victoires d'affilée" />
                <Stat valeur={stats.meilleureSerieVictoires} label="Meilleure série" />
              </View>

              <Text style={styles.repTitre}>Par mode</Text>
              {(
                [
                  ['📅 Mystère du jour', stats.modes.jour],
                  ['🗺️ Aventure', stats.modes.aventure],
                  ['🎉 Événements', stats.modes.evenement],
                ] as const
              ).map(([nom, c]) => (
                <View key={nom} style={styles.modeLigne}>
                  <Text style={styles.modeNom}>{nom}</Text>
                  <Text style={styles.modeDetailTexte}>
                    {c.victoires}/{c.parties} · 💡 {c.indices} · ✍️ {c.propositions}
                  </Text>
                </View>
              ))}
              <Text style={styles.legende}>victoires/parties · indices demandés · réponses proposées</Text>

              <Text style={styles.repTitre}>Bonus de série</Text>
              <Text style={styles.bonusTexte}>✨ {jokers} joker{jokers > 1 ? 's' : ''} en réserve ({stats.jokersUtilises} utilisé{stats.jokersUtilises > 1 ? 's' : ''})</Text>
              {[
                { nom: 'Jours de suite', palier: prochainPalier(PALIERS_JOURS, serie), courant: serie, unite: 'jours' },
                { nom: "Victoires d'affilée", palier: prochainPalier(PALIERS_VICTOIRES, stats.serieVictoires), courant: stats.serieVictoires, unite: 'victoires' },
              ].map((b) => (
                <Text key={b.nom} style={styles.bonusTexte}>
                  {b.palier ? `${b.nom} : ${b.courant}/${b.palier.seuil} ${b.unite} → +${b.palier.jokers} ✨` : `${b.nom} : tous les paliers atteints !`}
                </Text>
              ))}

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

/** Pastille de l'accueil : une icône, sa valeur et un mot qui dit ce que c'est. */
function Puce({ icone, valeur, libelle, onPress }: { icone: string; valeur: number | string; libelle: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.puce} onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`${libelle} ${valeur}`}>
      <Text style={styles.puceTexte}>
        {icone}
        {valeur !== '' ? ` ${valeur}` : ''}
      </Text>
      <Text style={styles.puceLibelle}>{libelle}</Text>
    </TouchableOpacity>
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
  ruban: {
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(140,107,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(181,140,255,0.6)',
  },
  rubanTexte: { color: '#E4D9FF', fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  puces: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 },
  puce: {
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderColor: couleurs.bordure,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 66,
  },
  puceLibelle: { color: couleurs.texteSecondaire, fontSize: 11, fontWeight: '600', marginTop: 1 },
  infoCarte: {
    alignSelf: 'center',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 22,
    width: '100%',
    maxWidth: 360,
  },
  infoTexte: { color: couleurs.texte, fontSize: 15, lineHeight: 22, marginBottom: 10 },
  infoNote: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 18, marginTop: 4, textAlign: 'center' },
  modeLigne: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  modeNom: { color: couleurs.texte, fontSize: 14, fontWeight: '600' },
  modeDetailTexte: { color: couleurs.texteSecondaire, fontSize: 13 },
  legende: { color: couleurs.texteSecondaire, fontSize: 11, marginTop: 2 },
  bonusTexte: { color: couleurs.texte, fontSize: 13, marginTop: 4 },
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
  modeEnAvant: { borderColor: couleurs.accent },
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
  boutonPrincipalSous: { color: '#1B1B1B', fontSize: 12, fontWeight: '600', marginTop: 2, opacity: 0.75 },
  boutonPrincipalFait: { backgroundColor: 'transparent', borderWidth: 2, borderColor: couleurs.succes, paddingVertical: 12 },
  boutonPrincipalTexteFait: { color: couleurs.succes, fontSize: 17 },
  boutonPrincipalSousFait: { color: couleurs.texteSecondaire, opacity: 1 },
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
