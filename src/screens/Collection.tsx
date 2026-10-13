import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Carte, MYSTERES_PAR_CARTE_JOUR, NIVEAUX_PAR_CARTE_AVENTURE, carteAventure, carteEvenement, carteJour, carteParId } from '../data/cartes';
import { EVENEMENTS, evenementEnCours } from '../data/evenements';
import { Progression } from '../game/progression';
import { Stats } from '../game/storage';
import { tr } from '../i18n';
import { couleurs } from '../theme';
import CarteVisuelle from '../ui/CarteVisuelle';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

interface Props {
  possedees: string[];
  progression: Progression;
  stats: Stats;
  onRetour: () => void;
}

const COLONNES = 3;
const ECART = 10;

/** Page des cartes à collectionner : celles qu'on a obtenues, et la prochaine à gagner dans chaque catégorie. */
export default function Collection({ possedees, progression, stats, onRetour }: Props) {
  const { width } = useWindowDimensions();
  const largeur = Math.floor((width - 40 - ECART * (COLONNES - 1)) / COLONNES);
  // Carte agrandie (touchez une carte obtenue pour l'admirer).
  const [agrandie, setAgrandie] = useState<Carte | null>(null);
  // Seuls l'événement en cours et ceux déjà commencés ou terminés apparaissent : les suivants restent une surprise.
  const courant = evenementEnCours().id;
  const evenementsVisibles = EVENEMENTS.filter(
    (e) => e.id === courant || possedees.includes(`ev-${e.id}`) || (progression.evenements[e.id]?.faites ?? 0) > 0,
  );

  const avoir = (prefixe: string): Carte[] =>
    possedees
      .filter((id) => id.startsWith(prefixe))
      .map((id) => carteParId(id))
      .filter((c): c is Carte => !!c)
      .sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));

  const aventure = avoir('av-');
  const jour = avoir('jr-');
  const prochaineAventure = aventure.length + 1;
  const prochaineJour = jour.length + 1;
  const niveauxReussis = progression.aventure.niveau - 1;
  const victoiresJour = stats.modes.jour.victoires;

  const total = possedees.filter((id) => carteParId(id)).length;

  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre={tr('Collection', 'Collection')} onRetour={onRetour} />
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.resume}>
          🃏 {total} {tr(total > 1 ? 'cartes obtenues' : 'carte obtenue', total > 1 ? 'cards collected' : 'card collected')}
        </Text>
        <Text style={styles.aide}>
          {tr("Des cartes à collectionner se gagnent en jouant. Touchez une carte obtenue pour l'agrandir et l'admirer.", 'Collectible cards are earned by playing. Tap a card you own to enlarge it and admire it.')}
        </Text>

        <Section titre={`🗺️ ${tr('Aventure', 'Adventure')}`} note={tr('Une carte tous les {n} niveaux réussis', 'One card every {n} levels completed', { n: NIVEAUX_PAR_CARTE_AVENTURE })}>
          {aventure.map((c) => (
            <Touchable key={c.id} onPress={() => setAgrandie(c)}>
              <CarteVisuelle carte={c} largeur={largeur} />
            </Touchable>
          ))}
          <CarteVisuelle
            carte={carteAventure(prochaineAventure)}
            largeur={largeur}
            verrouillee
            consigne={tr('Réussir le niveau {n} ({a}/{n})', 'Complete level {n} ({a}/{n})', { n: prochaineAventure * NIVEAUX_PAR_CARTE_AVENTURE, a: Math.min(niveauxReussis, prochaineAventure * NIVEAUX_PAR_CARTE_AVENTURE) })}
          />
        </Section>

        <Section titre={`🎉 ${tr('Événements', 'Events')}`} note={tr("Une carte quand l'événement est terminé (20 étapes)", 'One card when the event is completed (20 steps)')}>
          {evenementsVisibles.map((e) => {
            const c = carteEvenement(e);
            const faites = progression.evenements[e.id]?.faites ?? 0;
            return possedees.includes(c.id) ? (
              <Touchable key={c.id} onPress={() => setAgrandie(c)}>
                <CarteVisuelle carte={c} largeur={largeur} />
              </Touchable>
            ) : (
              <CarteVisuelle key={c.id} carte={c} largeur={largeur} verrouillee consigne={`${e.titre}${tr(' : ', ': ')}${faites}/20 ${tr('étapes', 'steps')}`} />
            );
          })}
        </Section>

        <Section titre={`📅 ${tr('Mystère du jour', 'Daily mystery')}`} note={tr('Une carte tous les {n} mystères du jour résolus', 'One card every {n} daily mysteries solved', { n: MYSTERES_PAR_CARTE_JOUR })}>
          {jour.map((c) => (
            <Touchable key={c.id} onPress={() => setAgrandie(c)}>
              <CarteVisuelle carte={c} largeur={largeur} />
            </Touchable>
          ))}
          <CarteVisuelle
            carte={carteJour(prochaineJour)}
            largeur={largeur}
            verrouillee
            consigne={`${Math.min(victoiresJour, prochaineJour * MYSTERES_PAR_CARTE_JOUR)}/${prochaineJour * MYSTERES_PAR_CARTE_JOUR} ${tr('mystères du jour', 'daily mysteries')}`}
          />
        </Section>
      </ScrollView>
      <CarteAgrandie carte={agrandie} onFermer={() => setAgrandie(null)} />
    </View>
  );
}

function Touchable({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={tr('Agrandir la carte', 'Enlarge card')}>
      {children}
    </TouchableOpacity>
  );
}

/** Carte en grand, qui flotte doucement : de quoi l'admirer. */
function CarteAgrandie({ carte, onFermer }: { carte: Carte | null; onFermer: () => void }) {
  const { width, height } = useWindowDimensions();
  const entree = useRef(new Animated.Value(0)).current;
  const flotte = useRef(new Animated.Value(0)).current;
  const largeur = Math.min(width - 70, (height - 260) / 1.42, 340);

  useEffect(() => {
    if (!carte) return;
    entree.setValue(0);
    Animated.spring(entree, { toValue: 1, friction: 6, tension: 80, useNativeDriver: false }).start();
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.timing(flotte, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(flotte, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    boucle.start();
    return () => boucle.stop();
  }, [carte, entree, flotte]);

  return (
    <Modal visible={!!carte} transparent animationType="fade" onRequestClose={onFermer}>
      <TouchableOpacity style={styles.voile} activeOpacity={1} onPress={onFermer}>
        {carte && (
          <>
            <Animated.View
              style={{
                transform: [
                  { scale: entree.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
                  { translateY: flotte.interpolate({ inputRange: [0, 1], outputRange: [4, -6] }) },
                  { rotate: flotte.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] }) },
                ],
              }}
            >
              <CarteVisuelle carte={carte} largeur={largeur} />
            </Animated.View>
            <Text style={styles.obtention}>{carte.obtention}</Text>
            <Text style={styles.toucher}>{tr('Touchez pour fermer', 'Tap to close')}</Text>
          </>
        )}
      </TouchableOpacity>
    </Modal>
  );
}

function Section({ titre, note, children }: { titre: string; note: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitre}>{titre}</Text>
      <Text style={styles.sectionNote}>{note}</Text>
      <View style={styles.grille}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { paddingHorizontal: 20, paddingBottom: 40 },
  resume: { color: couleurs.texte, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  section: { marginTop: 18 },
  sectionTitre: { color: couleurs.accent, fontSize: 18, fontWeight: '800' },
  sectionNote: { color: couleurs.texteSecondaire, fontSize: 12, marginTop: 2, marginBottom: 10 },
  aide: { color: couleurs.texteSecondaire, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 4 },
  voile: { flex: 1, backgroundColor: 'rgba(10,12,28,0.94)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  obtention: { color: couleurs.texte, fontSize: 15, textAlign: 'center', marginTop: 26, maxWidth: 300, lineHeight: 21 },
  toucher: { color: couleurs.texteSecondaire, fontSize: 12, marginTop: 14 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: ECART },
});
