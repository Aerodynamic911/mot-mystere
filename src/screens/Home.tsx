import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { MAX_ESSAIS } from '../game/engine';
import { PALIERS_JOURS, PALIERS_VICTOIRES, prochainPalier } from '../game/bonus';
import { Stats } from '../game/storage';
import { tr } from '../i18n';
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
  onAmis: () => void;
  pieces: number;
  onBoutique: () => void;
  niveauAventure: number;
  etapesFaites: number;
  etapesTotal: number;
  onAventure: () => void;
  onEvenement: () => void;
  serieVictoires: number;
  jokers: number;
  nbCartes: number;
  onCollection: () => void;
  /** Récompenses de quêtes à récupérer (pastille sur le bouton Quêtes). */
  quetesARecuperer: number;
  onQuetes: () => void;
  onSprint: () => void;
  /** Bandeau « Donner mon avis » (une fois le joueur lancé, tant qu'il ne l'a pas écarté). */
  avisVisible: boolean;
  onAvis: () => void;
  onFermerAvis: () => void;
  onVraiFaux: () => void;
  /** Absent tant que le jeu n'a pas assez d'images : le mode n'est alors pas proposé. */
  onImage?: () => void;
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
  onAmis,
  pieces,
  onBoutique,
  niveauAventure,
  etapesFaites,
  etapesTotal,
  onAventure,
  onEvenement,
  serieVictoires,
  jokers,
  nbCartes,
  onCollection,
  quetesARecuperer,
  onQuetes,
  onSprint,
  avisVisible,
  onAvis,
  onFermerAvis,
  onVraiFaux,
  onImage,
}: Props) {
  // Sur un petit écran (iPhone SE), le bandeau écraserait la mascotte : le bouton des préférences reste disponible.
  const { height: hauteurEcran } = useWindowDimensions();
  const afficherAvis = avisVisible && hauteurEcran >= 720;
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
        style={[styles.boutonSon, styles.boutonStats]}
        onPress={() => setStatsOuvertes(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={tr('Statistiques', 'Statistics')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.boutonSonTexte}>📊</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.boutonSon, styles.boutonReglages]}
        onPress={onPreferences}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={tr('Préférences', 'Settings')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.boutonSonTexte}>⚙️</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.boutonSon}
        onPress={onToggleMusique}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={musiqueActive ? tr('Couper la musique', 'Mute music') : tr('Activer la musique', 'Turn music on')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.boutonSonTexte}>{musiqueActive ? '🔊' : '🔇'}</Text>
      </TouchableOpacity>

      <View style={styles.haut}>
        <TitreArc texte="QUIZZLE" />
        <View style={styles.ruban}>
          <Text style={styles.rubanTexte}>{tr('LE JEU DES MYSTÈRES', 'THE MYSTERY GAME')}</Text>
        </View>
      </View>

      {/* Zone fixe (non défilante) : la mascotte rétrécit sur un petit écran pour que « Mystère du jour » et les stats restent visibles. */}
      <View style={styles.scene} onLayout={(e) => setHauteurScene(e.nativeEvent.layout.height)}>
        <Mascotte taille={tailleMascotte} />
        <View style={styles.puces}>
          <Puce icone="🔥" valeur={serieVictoires} libelle={tr('Série', 'Streak')} onPress={() => setInfo('serie')} />
          <Puce icone="✨" valeur={jokers} libelle={tr('Jokers', 'Jokers')} onPress={() => setInfo('jokers')} />
          <Puce icone="🃏" valeur={nbCartes} libelle={tr('Cartes', 'Cards')} onPress={onCollection} />
          <Puce icone="🪙" valeur={pieces} libelle={tr('Boutique', 'Shop')} onPress={onBoutique} />
        </View>
      </View>

      <View style={styles.modes}>
        <TouchableOpacity style={[styles.mode, jourTermine && styles.modeEnAvant]} onPress={onAventure} activeOpacity={0.85}>
          <Text style={styles.modeEmoji}>🗺️</Text>
          <Text style={styles.modeTitre}>{tr('Aventure', 'Adventure')}</Text>
          <Text style={styles.modeDetail}>{tr('Niveau', 'Level')} {niveauAventure}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mode, jourTermine && styles.modeEnAvant]} onPress={onEvenement} activeOpacity={0.85}>
          <Text style={styles.modeEmoji}>🎉</Text>
          <Text style={styles.modeTitre}>{tr('Événements', 'Events')}</Text>
          <Text style={styles.modeDetail}>
            {etapesFaites}/{etapesTotal} {tr('étapes', 'steps')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modesPetits}>
        <PetitMode emoji="⚡" titre="Sprint" onPress={onSprint} />
        <PetitMode emoji="✅" titre={tr('Vrai ou faux', 'True or false')} onPress={onVraiFaux} />
        {onImage && <PetitMode emoji="🖼️" titre={tr('Image', 'Picture')} onPress={onImage} />}
      </View>

      {afficherAvis && (
        <View style={styles.bandeauAvis}>
          <TouchableOpacity style={styles.bandeauAvisCorps} onPress={onAvis} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.bandeauAvisTexte}>
              ⭐ {tr('Quizzle vous plaît ? Un avis nous aide énormément', 'Enjoying Quizzle? A review helps us a lot')}
            </Text>
            <Text style={styles.bandeauAvisAction}>{tr('Donner mon avis ›', 'Leave a review ›')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onFermerAvis}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={tr('Fermer', 'Close')}
          >
            <Text style={styles.bandeauAvisFermer}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.pied}>
        {/* Tant que le mystère du jour n'est pas fait, c'est le bouton principal ; ensuite il s'efface devant les autres modes. */}
        <TouchableOpacity
          style={[styles.boutonPrincipal, jourTermine && styles.boutonPrincipalFait]}
          onPress={onJouerDuJour}
          activeOpacity={0.85}
        >
          <Text style={[styles.boutonPrincipalTexte, jourTermine && styles.boutonPrincipalTexteFait]}>
            {jourTermine ? '✅  ' : '📅  '}{tr('Mystère du jour', 'Daily mystery')}
          </Text>
          <Text style={[styles.boutonPrincipalSous, jourTermine && styles.boutonPrincipalSousFait]}>
            {jourTermine
              ? jourGagne
                ? tr('Trouvé · revenez demain !', 'Solved · come back tomorrow!')
                : tr('Terminé · revenez demain !', 'Finished · come back tomorrow!')
              : tr('À découvrir', 'To discover')}
          </Text>
        </TouchableOpacity>
        <View style={styles.ligneSecondaire}>
          <TouchableOpacity style={styles.boutonSecondaire} onPress={onAmis} activeOpacity={0.85}>
            <Text style={styles.boutonPreferencesTexte}>👥  {tr('Entre amis', 'With friends')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boutonSecondaire} onPress={onQuetes} activeOpacity={0.85}>
            <Text style={styles.boutonPreferencesTexte}>🎯  {tr('Quêtes', 'Quests')}</Text>
            {quetesARecuperer > 0 && (
              <View style={styles.pastille}>
                <Text style={styles.pastilleTexte}>{quetesARecuperer}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={info !== null} transparent animationType="fade" onRequestClose={() => setInfo(null)}>
        <TouchableOpacity style={styles.voile} activeOpacity={1} onPress={() => setInfo(null)}>
          <View style={styles.infoCarte}>
            {info === 'serie' && (
              <>
                <Text style={styles.statsTitre}>🔥 {tr('Série de victoires', 'Win streak')}</Text>
                <Text style={styles.infoTexte}>
                  {tr(
                    "C'est le nombre de parties gagnées d'affilée, tous modes confondus : mystère du jour, aventure et événements. Une défaite remet le compteur à zéro.",
                    'This is the number of games won in a row, across all modes: daily mystery, adventure and events. A defeat resets the counter to zero.',
                  )}
                </Text>
                <Text style={styles.infoTexte}>
                  {prochainPalier(PALIERS_VICTOIRES, serieVictoires)
                    ? tr(
                        "Prochain bonus : {n} victoires d'affilée → +{j} ✨ joker(s).",
                        'Next bonus: {n} wins in a row → +{j} ✨ joker(s).',
                        { n: prochainPalier(PALIERS_VICTOIRES, serieVictoires)!.seuil, j: prochainPalier(PALIERS_VICTOIRES, serieVictoires)!.jokers },
                      )
                    : tr('Vous avez atteint tous les paliers de bonus !', 'You have reached every bonus tier!')}
                </Text>
                <Text style={styles.infoNote}>
                  {tr(
                    'Votre meilleure série : {m}. Série de jours avec le mystère du jour : {s} (détail dans 📊 Stats).',
                    'Your best streak: {m}. Daily mystery day streak: {s} (details in 📊 Stats).',
                    { m: stats.meilleureSerieVictoires, s: serie },
                  )}
                </Text>
              </>
            )}
            {info === 'jokers' && (
              <>
                <Text style={styles.statsTitre}>✨ Jokers</Text>
                <Text style={styles.infoTexte}>
                  {tr(
                    'Un joker révèle un indice supplémentaire sans compter comme un essai. Vous en avez {n} en réserve : utilisez-les pendant une partie avec le bouton vert « Utiliser un joker ».',
                    'A joker reveals an extra clue without counting as an attempt. You have {n} in reserve: use them during a game with the green “Use a joker” button.',
                    { n: jokers },
                  )}
                </Text>
                <Text style={styles.infoTexte}>
                  {tr(
                    "Pour en gagner, enchaînez les séries : {a} jours de suite avec le mystère du jour, ou {b} victoires d'affilée.",
                    'To earn them, build streaks: {a} days in a row with the daily mystery, or {b} wins in a row.',
                    { a: PALIERS_JOURS.map((p) => p.seuil).join(', '), b: PALIERS_VICTOIRES.map((p) => p.seuil).join(', ') },
                  )}
                </Text>
              </>
            )}
            <Text style={styles.infoNote}>{tr('Touchez pour fermer', 'Tap to close')}</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={statsOuvertes} transparent animationType="fade" onRequestClose={() => setStatsOuvertes(false)}>
        <View style={styles.voile}>
          <View style={styles.statsCarte}>
            <ScrollView>
              <Text style={styles.statsTitre}>{tr('Vos statistiques', 'Your statistics')}</Text>
              <View style={styles.statsLigne}>
                <Stat valeur={stats.parties} label={tr('Parties', 'Games')} />
                <Stat valeur={stats.victoires} label={tr('Victoires', 'Wins')} />
                <Stat valeur={`${tauxVictoire}%`} label={tr('Réussite', 'Win rate')} />
              </View>

              <Text style={styles.repTitre}>{tr('Séries', 'Streaks')}</Text>
              <View style={styles.statsLigne}>
                <Stat valeur={serie} label={tr('Jours de suite', 'Days in a row')} />
                <Stat valeur={stats.meilleureSerie} label={tr('Meilleure (jours)', 'Best (days)')} />
              </View>
              <View style={styles.statsLigne}>
                <Stat valeur={stats.serieVictoires} label={tr("Victoires d'affilée", 'Wins in a row')} />
                <Stat valeur={stats.meilleureSerieVictoires} label={tr('Meilleure série', 'Best streak')} />
              </View>

              <Text style={styles.repTitre}>{tr('Par mode', 'By mode')}</Text>
              {(
                [
                  [`📅 ${tr('Mystère du jour', 'Daily mystery')}`, stats.modes.jour],
                  [`🗺️ ${tr('Aventure', 'Adventure')}`, stats.modes.aventure],
                  [`🎉 ${tr('Événements', 'Events')}`, stats.modes.evenement],
                  [`🎯 ${tr('Défis entre amis', 'Friend challenges')}`, stats.modes.defi],
                  [`🖼️ ${tr('Images', 'Pictures')}`, stats.modes.image],
                ] as const
              ).map(([nom, c]) => (
                <View key={nom} style={styles.modeLigne}>
                  <Text style={styles.modeNom}>{nom}</Text>
                  <Text style={styles.modeDetailTexte}>
                    {c.victoires}/{c.parties} · 💡 {c.indices} · ✍️ {c.propositions}
                  </Text>
                </View>
              ))}
              <Text style={styles.legende}>{tr('victoires/parties · indices demandés · réponses proposées', 'wins/games · clues requested · answers submitted')}</Text>
              <View style={styles.modeLigne}>
                <Text style={styles.modeNom}>⚡ Sprint</Text>
                <Text style={styles.modeDetailTexte}>
                  {tr('record', 'best')} {stats.recordSprint} · {stats.sprints} {tr('parties', 'games')}
                </Text>
              </View>
              <View style={styles.modeLigne}>
                <Text style={styles.modeNom}>✅ {tr('Vrai ou faux', 'True or false')}</Text>
                <Text style={styles.modeDetailTexte}>
                  {tr('meilleur', 'best')} {stats.vfMeilleur}/10 · {stats.vfBonnes}/{stats.vfTotal}
                </Text>
              </View>
              <View style={styles.modeLigne}>
                <Text style={styles.modeNom}>👹 {tr('Boss vaincus', 'Bosses defeated')}</Text>
                <Text style={styles.modeDetailTexte}>{stats.bossVaincus}</Text>
              </View>

              <Text style={styles.repTitre}>{tr('Bonus de série', 'Streak bonuses')}</Text>
              <Text style={styles.bonusTexte}>
                {tr(
                  '✨ {n} joker{s} en réserve ({u} utilisé{us})',
                  '✨ {n} joker{s} in reserve ({u} used)',
                  { n: jokers, s: jokers > 1 ? 's' : '', u: stats.jokersUtilises, us: stats.jokersUtilises > 1 ? 's' : '' },
                )}
              </Text>
              <Text style={styles.bonusTexte}>
                {tr('🧊 {n} glaçon{s} en réserve', '🧊 {n} ice cube{s} in stock', { n: stats.glacons, s: stats.glacons > 1 ? 's' : '' })}
              </Text>
              {[
                { nom: tr('Jours de suite', 'Days in a row'), palier: prochainPalier(PALIERS_JOURS, serie), courant: serie, unite: tr('jours', 'days') },
                { nom: tr("Victoires d'affilée", 'Wins in a row'), palier: prochainPalier(PALIERS_VICTOIRES, stats.serieVictoires), courant: stats.serieVictoires, unite: tr('victoires', 'wins') },
              ].map((b) => (
                <Text key={b.nom} style={styles.bonusTexte}>
                  {b.palier ? `${b.nom}${tr(' : ', ': ')}${b.courant}/${b.palier.seuil} ${b.unite} → +${b.palier.jokers} ✨` : tr('{nom} : tous les paliers atteints !', '{nom}: every tier reached!', { nom: b.nom })}
                </Text>
              ))}

              <Text style={styles.repTitre}>{tr("Victoires par nombre d'essais", 'Wins by number of attempts')}</Text>
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
              <Text style={styles.fermerTexte}>{tr('Fermer', 'Close')}</Text>
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

/** Petite tuile pour les modes rapides (Sprint, Vrai ou faux, Image). */
function PetitMode({ emoji, titre, onPress }: { emoji: string; titre: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.petitMode} onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={titre}>
      <Text style={styles.petitModeEmoji}>{emoji}</Text>
      <Text style={styles.petitModeTitre} numberOfLines={1}>
        {titre}
      </Text>
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
  boutonReglages: { right: 64 },
  boutonStats: { left: 16, right: undefined },
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
  ligneSecondaire: { flexDirection: 'row', marginTop: 10 },
  boutonSecondaire: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: rayon,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: couleurs.bordure,
    backgroundColor: 'rgba(26,31,58,0.82)',
  },
  pastille: { marginLeft: 8, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: couleurs.erreur, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  pastilleTexte: { color: '#fff', fontSize: 12, fontWeight: '800' },
  bandeauAvis: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: rayon,
    borderWidth: 1.5,
    borderColor: couleurs.accent,
    backgroundColor: 'rgba(245,185,66,0.12)',
  },
  bandeauAvisCorps: { flex: 1 },
  bandeauAvisTexte: { color: couleurs.texte, fontSize: 13, fontWeight: '600' },
  bandeauAvisAction: { color: couleurs.accent, fontSize: 13, fontWeight: '800', marginTop: 2 },
  bandeauAvisFermer: { color: couleurs.texteSecondaire, fontSize: 16, paddingLeft: 12 },
  modesPetits: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12 },
  petitMode: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: rayon,
    backgroundColor: 'rgba(26,31,58,0.88)',
    borderWidth: 1.5,
    borderColor: couleurs.bordure,
  },
  petitModeEmoji: { fontSize: 20 },
  petitModeTitre: { color: couleurs.texte, fontSize: 13, fontWeight: '800', marginTop: 1 },
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
