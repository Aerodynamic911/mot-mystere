import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { jouerEffet } from '../audio/effets';
import { NB_DECORS, decorAventure, decorParRang, essaisAventure, titreJoueur } from '../game/aventure';
import { Progression } from '../game/progression';
import { couleurs, rayon } from '../theme';
import Eclat from '../ui/Eclat';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';
import MiniMascotte from '../ui/MiniMascotte';

interface Props {
  progression: Progression;
  /** Niveau affiché la dernière fois : la mascotte part de là et avance jusqu'au niveau actuel. */
  depuis: number;
  /** Appelé quand la mascotte est arrivée, pour mémoriser le niveau affiché. */
  onArrive: () => void;
  onJouer: () => void;
  onRetour: () => void;
}

const PAR_CARTE = 10;
const ECHANTILLONS = 10; // points calculés le long de chaque tronçon, pour un déplacement fluide
// Les images de décor sont en 896×1152 : la carte garde ce ratio pour qu'on voie toute l'image, sans recadrage.
const RATIO = 896 / 1152;
const MARGE = 38; // côtés et bas
const MARGE_HAUT = 64; // laisse la place au nom du décor, en haut de la carte
// Trois parcours en serpentin, utilisés tour à tour d'une carte à l'autre. Positions des 10 étapes, du bas vers le haut :
// x et y en part de la zone utile (y = 0 en bas, 1 en haut). Les écarts sont volontairement irréguliers, pour un chemin naturel.
const PARCOURS: { x: number; y: number }[][] = [
  [
    { x: 0.2, y: 0 }, { x: 0.68, y: 0.07 }, { x: 0.84, y: 0.25 }, { x: 0.34, y: 0.3 }, { x: 0.16, y: 0.5 },
    { x: 0.62, y: 0.58 }, { x: 0.82, y: 0.74 }, { x: 0.4, y: 0.76 }, { x: 0.2, y: 0.93 }, { x: 0.66, y: 1 },
  ],
  [
    { x: 0.8, y: 0 }, { x: 0.38, y: 0.08 }, { x: 0.16, y: 0.26 }, { x: 0.6, y: 0.3 }, { x: 0.84, y: 0.52 },
    { x: 0.46, y: 0.55 }, { x: 0.2, y: 0.74 }, { x: 0.7, y: 0.78 }, { x: 0.84, y: 0.93 }, { x: 0.4, y: 1 },
  ],
  [
    { x: 0.5, y: 0 }, { x: 0.84, y: 0.1 }, { x: 0.7, y: 0.28 }, { x: 0.3, y: 0.26 }, { x: 0.14, y: 0.46 },
    { x: 0.5, y: 0.56 }, { x: 0.84, y: 0.7 }, { x: 0.46, y: 0.78 }, { x: 0.18, y: 0.9 }, { x: 0.6, y: 1 },
  ],
];
// Tirets du chemin : tous de même longueur, avec le même espace entre eux (longueur, espace, en px).
const TIRETS = '11 9';
const TAILLE_NOEUD = 40;
const TAILLE_MASCOTTE = 46;

interface Point {
  x: number;
  y: number;
}

/** Carte au trésor : 10 étapes par carte, la mascotte avance de niveau en niveau. Le décor change tous les 10 niveaux. */
export default function Aventure({ progression, depuis, onArrive, onJouer, onRetour }: Props) {
  const { niveau, record, etoiles } = progression.aventure;
  // Aperçu des décors (appui long sur le nom du décor) : on feuillette les cartes sans toucher à la progression.
  const [apercu, setApercu] = useState(0);
  const decor = apercu ? decorParRang(Math.floor((niveau - 1) / PAR_CARTE) + apercu) : decorAventure(niveau);
  const sombre = decor.sombre;
  const base = Math.floor((niveau - 1) / PAR_CARTE) * PAR_CARTE; // niveau 0-indexé du début de la carte
  const rang = (niveau - 1) % PAR_CARTE; // position de la mascotte sur la carte
  const [zone, setZone] = useState<{ l: number; h: number } | null>(null);
  const [nouveaute, setNouveaute] = useState('');
  // Situation au moment d'arriver sur la carte : d'où part la mascotte (figé, même quand la progression est mise à jour).
  const depart = useRef({
    marche: depuis < niveau,
    memeCarte: Math.floor((depuis - 1) / PAR_CARTE) === Math.floor((niveau - 1) / PAR_CARTE),
    depuis,
  }).current;
  // attente → la mascotte est sur l'étape de départ ; marche → elle avance ; arrive → elle est sur l'étape actuelle.
  const [etat, setEtat] = useState<'attente' | 'marche' | 'arrive'>(depart.marche ? 'attente' : 'arrive');

  function mesurer(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setZone((z) => (z && z.l === width && z.h === height ? z : { l: width, h: height }));
  }

  // La carte est la plus grande à ratio d'image fixe qui tient dans la zone disponible.
  const taille = useMemo(() => {
    if (!zone) return null;
    const l = Math.min(zone.l, zone.h * RATIO);
    return { l, h: l / RATIO };
  }, [zone]);

  // Les 10 étapes, du bas vers le haut. Le point 0 est un départ virtuel, sous la première étape.
  const noeuds: Point[] = useMemo(() => {
    if (!taille) return [];
    const parcours = PARCOURS[(Math.floor(base / PAR_CARTE) + apercu) % PARCOURS.length];
    const utile = taille.h - MARGE - MARGE_HAUT;
    return parcours.map((pt) => ({
      x: MARGE + pt.x * (taille.l - 2 * MARGE),
      y: taille.h - MARGE - pt.y * utile,
    }));
  }, [taille, base, apercu]);

  const jalons: Point[] = useMemo(
    () => (noeuds.length && taille ? [{ x: noeuds[0].x, y: taille.h + 30 }, ...noeuds] : []),
    [noeuds, taille],
  );

  // Courbe lisse (Catmull-Rom) passant par tous les jalons, et ses points d'échantillonnage pour animer la mascotte.
  const { chemin, echantillons } = useMemo(() => {
    if (jalons.length < 2 || !taille) return { chemin: '', echantillons: [] as Point[] };
    let d = `M ${jalons[0].x} ${jalons[0].y}`;
    const pts: Point[] = [jalons[0]];
    for (let i = 1; i < jalons.length; i++) {
      const p0 = jalons[Math.max(0, i - 2)];
      const a = jalons[i - 1];
      const b = jalons[i];
      const p3 = jalons[Math.min(jalons.length - 1, i + 1)];
      const c1 = { x: a.x + (b.x - p0.x) / 6, y: a.y + (b.y - p0.y) / 6 };
      const c2 = { x: b.x - (p3.x - a.x) / 6, y: b.y - (p3.y - a.y) / 6 };
      d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
      for (let k = 1; k <= ECHANTILLONS; k++) {
        const t = k / ECHANTILLONS;
        const u = 1 - t;
        pts.push({
          x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
          y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
        });
      }
    }
    return { chemin: d, echantillons: pts };
  }, [jalons, taille]);

  const progres = useRef(new Animated.Value(0)).current; // en nombre de jalons : 0 = départ, p + 1 = étape p
  const rebond = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const annonce = useRef(new Animated.Value(0)).current;
  const eclat = useRef(new Animated.Value(0)).current; // gerbe d'étoiles à l'arrivée
  const pop = useRef(new Animated.Value(1)).current; // l'étape quittée se coche en rebondissant
  const aDeplace = useRef(false);

  useEffect(() => {
    const r = Animated.loop(
      Animated.sequence([
        Animated.timing(rebond, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(rebond, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    r.start();
    p.start();
    return () => {
      r.stop();
      p.stop();
    };
  }, [rebond, pulse]);

  // Une fois la carte mesurée : la mascotte avance de l'ancien niveau au niveau actuel.
  useEffect(() => {
    if (!echantillons.length || aDeplace.current) return;
    aDeplace.current = true;
    const memeCarte = Math.floor((depuis - 1) / PAR_CARTE) === Math.floor((niveau - 1) / PAR_CARTE);
    const jalonArrivee = rang + 1;
    const jalonDepart = depuis >= niveau ? jalonArrivee : memeCarte ? ((depuis - 1) % PAR_CARTE) + 1 : 0;
    progres.setValue(jalonDepart);
    if (jalonDepart === jalonArrivee) {
      onArrive();
      return;
    }
    // Nouveau décor ou nouveau titre : une annonce apparaît un instant.
    const messages: string[] = [];
    if ((niveau - 1) % 30 === 0 && niveau > 1) messages.push(`Nouveau titre : ${titreJoueur(niveau)} !`);
    if ((niveau - 1) % 10 === 0 && niveau > 1) messages.push(`Nouveau décor : ${decor.nom}`);
    if (messages.length) {
      setNouveaute(messages.join('\n'));
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(annonce, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2600),
        Animated.timing(annonce, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
    // La mascotte quitte son étape : elle se coche en rebondissant, puis la mascotte avance.
    setTimeout(() => {
      setEtat('marche');
      jouerEffet('pop');
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
    }, 500);
    Animated.timing(progres, {
      toValue: jalonArrivee,
      duration: 900 + 450 * Math.abs(jalonArrivee - jalonDepart),
      delay: 500,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Arrivée : une gerbe d'étoiles, un petit son, et l'étape devient celle à jouer.
      setEtat('arrive');
      jouerEffet('pop');
      eclat.setValue(0);
      Animated.timing(eclat, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      onArrive();
    });
  }, [echantillons, depuis, niveau, rang, progres, onArrive, annonce, decor.nom, eclat, pop]);

  const entrees = echantillons.map((_, i) => i / ECHANTILLONS);
  const essais = essaisAventure(niveau);
  const encre = decor.encre;
  // Étapes cochées et étape à jouer, selon l'avancement de la mascotte.
  const coche = etat === 'arrive' ? niveau : etat === 'marche' && depart.memeCarte ? depart.depuis + 1 : depart.memeCarte ? depart.depuis : niveau;
  const actuel = etat === 'arrive' ? niveau : etat === 'marche' ? -1 : depart.memeCarte ? depart.depuis : niveau;
  const echellePop = pop.interpolate({ inputRange: [0, 1], outputRange: [1.7, 1] });

  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre="Aventure" onRetour={onRetour} />

      <View style={styles.titres}>
        <Text style={styles.titreJoueur}>{titreJoueur(niveau).toUpperCase()}</Text>
        <Text style={styles.niveau}>Niveau {niveau}</Text>
        <Text style={styles.stats}>
          {essais} essais · ⭐ {etoiles} · record {record}
        </Text>
      </View>

      <View style={styles.zoneCarte} onLayout={mesurer}>
        {taille && (
          <View style={[styles.carte, { width: taille.l, height: taille.h, backgroundColor: decor.parchemin }]}>
            {/* Image du décor, entière, sous le chemin et les pastilles. Taille explicite : une image locale a sinon sa taille d'origine (900 px) et déborde. */}
            <Image source={decor.image} style={{ position: 'absolute', left: 0, top: 0, width: taille.l, height: taille.h }} resizeMode="stretch" />
            <View pointerEvents="box-none" style={styles.nomDecorZone}>
              <TouchableOpacity activeOpacity={1} onLongPress={() => setApercu((a) => (a + 1) % NB_DECORS)} delayLongPress={500}>
                <Text
                  style={[
                    styles.nomDecor,
                    { color: encre, backgroundColor: sombre ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.72)' },
                  ]}
                >
                  {apercu ? `👁 ${decor.nom} (aperçu)` : `${decor.nom} · niveaux ${base + 1}–${base + PAR_CARTE}`}
                </Text>
              </TouchableOpacity>
            </View>

            <Svg width={taille.l} height={taille.h} style={StyleSheet.absoluteFill}>
              <Path d={chemin} stroke={sombre ? '#000000' : '#FFFFFF'} strokeOpacity={0.4} strokeWidth={8} strokeDasharray={TIRETS} strokeLinecap="butt" fill="none" />
              <Path d={chemin} stroke={encre} strokeOpacity={0.95} strokeWidth={4} strokeDasharray={TIRETS} strokeLinecap="butt" fill="none" />
            </Svg>

            {noeuds.map((n, p) => {
              const niveauNoeud = base + p + 1;
              const fait = niveauNoeud < coche;
              const courant = niveauNoeud === actuel;
              const rebondit = etat !== 'attente' && depart.marche && depart.memeCarte && niveauNoeud === depart.depuis;
              const tresor = p === PAR_CARTE - 1;
              return (
                <Animated.View
                  key={p}
                  style={[styles.noeud, { left: n.x - TAILLE_NOEUD / 2, top: n.y - TAILLE_NOEUD / 2 }, rebondit && { transform: [{ scale: echellePop }] }]}
                >
                  <View
                    style={[
                      styles.noeudRond,
                      { borderColor: encre, backgroundColor: fait ? '#3DDC97' : courant ? couleurs.accent : sombre ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.82)' },
                    ]}
                  >
                    <Text style={[styles.noeudTexte, { color: fait || courant ? '#1B1B1B' : encre }]}>
                      {fait ? '✓' : tresor ? decor.tresor : niveauNoeud}
                    </Text>
                  </View>
                  {tresor && !fait && <Text style={[styles.etiquetteTresor, { color: encre }]}>{niveauNoeud}</Text>}
                </Animated.View>
              );
            })}

            {/* Un anneau qui bat autour du niveau à jouer */}
            {etat === 'arrive' && noeuds[rang] && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.anneau,
                  {
                    left: noeuds[rang].x - 30,
                    top: noeuds[rang].y - 30,
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] }) }],
                  },
                ]}
              />
            )}

            {/* Gerbe d'étoiles à l'arrivée de la mascotte */}
            {noeuds[rang] && (
              <View pointerEvents="none" style={{ position: 'absolute', left: noeuds[rang].x, top: noeuds[rang].y, width: 0, height: 0 }}>
                <Eclat valeur={eclat} />
              </View>
            )}

            {/* La mascotte avance sur le chemin */}
            {echantillons.length > 0 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.mascotte,
                  {
                    transform: [
                      { translateX: progres.interpolate({ inputRange: entrees, outputRange: echantillons.map((e) => e.x - TAILLE_MASCOTTE / 2) }) },
                      { translateY: progres.interpolate({ inputRange: entrees, outputRange: echantillons.map((e) => e.y - TAILLE_MASCOTTE) }) },
                    ],
                  },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [
                      { translateY: rebond.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
                      { rotate: rebond.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) },
                    ],
                  }}
                >
                  <MiniMascotte taille={TAILLE_MASCOTTE} />
                </Animated.View>
              </Animated.View>
            )}

            <Animated.View pointerEvents="none" style={[styles.annonce, { opacity: annonce }]}>
              <Text style={styles.annonceTexte}>{nouveaute}</Text>
            </Animated.View>

            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.cadre, { borderColor: sombre ? '#8C6BFF' : '#FFFFFF' }]} />
          </View>
        )}
      </View>

      <View style={styles.pied}>
        <TouchableOpacity style={styles.bouton} onPress={onJouer} activeOpacity={0.85}>
          <Text style={styles.boutonTexte}>▶  Jouer le niveau {niveau}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  titres: { alignItems: 'center', paddingBottom: 8 },
  titreJoueur: { color: couleurs.accent, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  niveau: { color: couleurs.texte, fontSize: 34, fontWeight: '900' },
  stats: { color: couleurs.texteSecondaire, fontSize: 13, marginTop: 2 },
  // Zone disponible entre l'en-tête et le bouton ; la carte, à ratio fixe, y est centrée.
  zoneCarte: { flex: 1, marginHorizontal: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  carte: { borderRadius: rayon, overflow: 'hidden' },
  cadre: { borderRadius: rayon, borderWidth: 3 },
  nomDecorZone: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  nomDecor: { fontSize: 12, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  noeud: { position: 'absolute', width: TAILLE_NOEUD, alignItems: 'center' },
  noeudRond: {
    width: TAILLE_NOEUD,
    height: TAILLE_NOEUD,
    borderRadius: TAILLE_NOEUD / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noeudTexte: { fontSize: 15, fontWeight: '800' },
  etiquetteTresor: { position: 'absolute', top: TAILLE_NOEUD + 1, fontSize: 11, fontWeight: '800' },
  anneau: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: couleurs.accent },
  mascotte: { position: 'absolute', left: 0, top: 0 },
  annonce: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    backgroundColor: 'rgba(15,18,36,0.92)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: couleurs.accent,
  },
  annonceTexte: { color: couleurs.accent, fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 22 },
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
