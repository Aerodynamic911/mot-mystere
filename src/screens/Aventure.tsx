import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { decorAventure, essaisAventure, titreJoueur } from '../game/aventure';
import { Progression } from '../game/progression';
import { couleurs, rayon } from '../theme';
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
const X_RELATIFS = [0.2, 0.7, 0.32, 0.78, 0.26, 0.72, 0.34, 0.8, 0.3, 0.56];
const MARGE = 38;
const TAILLE_NOEUD = 40;
const TAILLE_MASCOTTE = 46;

interface Point {
  x: number;
  y: number;
}

/** Carte au trésor : 10 étapes par carte, la mascotte avance de niveau en niveau. Le décor change tous les 10 niveaux. */
export default function Aventure({ progression, depuis, onArrive, onJouer, onRetour }: Props) {
  const { niveau, record, etoiles } = progression.aventure;
  const decor = decorAventure(niveau);
  const sombre = decor.sombre;
  const base = Math.floor((niveau - 1) / PAR_CARTE) * PAR_CARTE; // niveau 0-indexé du début de la carte
  const rang = (niveau - 1) % PAR_CARTE; // position de la mascotte sur la carte
  const [taille, setTaille] = useState<{ l: number; h: number } | null>(null);
  const [nouveaute, setNouveaute] = useState('');

  function mesurer(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setTaille((t) => (t && t.l === width && t.h === height ? t : { l: width, h: height }));
  }

  // Les 10 étapes, du bas vers le haut. Le point 0 est un départ virtuel, sous la première étape.
  const noeuds: Point[] = useMemo(() => {
    if (!taille) return [];
    const utile = taille.h - 2 * MARGE;
    return X_RELATIFS.map((xr, p) => ({
      x: MARGE + xr * (taille.l - 2 * MARGE),
      y: taille.h - MARGE - (p * utile) / (PAR_CARTE - 1),
    }));
  }, [taille]);

  const jalons: Point[] = useMemo(
    () => (noeuds.length && taille ? [{ x: noeuds[0].x, y: taille.h + 30 }, ...noeuds] : []),
    [noeuds, taille],
  );

  // Courbe en S entre deux jalons, et ses points d'échantillonnage pour animer la mascotte le long du chemin.
  const { chemin, echantillons } = useMemo(() => {
    if (jalons.length < 2) return { chemin: '', echantillons: [] as Point[] };
    let d = `M ${jalons[0].x} ${jalons[0].y}`;
    const pts: Point[] = [jalons[0]];
    for (let i = 1; i < jalons.length; i++) {
      const a = jalons[i - 1];
      const b = jalons[i];
      const ym = (a.y + b.y) / 2;
      d += ` C ${a.x} ${ym}, ${b.x} ${ym}, ${b.x} ${b.y}`;
      for (let k = 1; k <= ECHANTILLONS; k++) {
        const t = k / ECHANTILLONS;
        const u = 1 - t;
        pts.push({
          x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
          y: u * u * u * a.y + 3 * u * u * t * ym + 3 * u * t * t * ym + t * t * t * b.y,
        });
      }
    }
    return { chemin: d, echantillons: pts };
  }, [jalons]);

  const progres = useRef(new Animated.Value(0)).current; // en nombre de jalons : 0 = départ, p + 1 = étape p
  const rebond = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const annonce = useRef(new Animated.Value(0)).current;
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
    Animated.timing(progres, {
      toValue: jalonArrivee,
      duration: 900 + 450 * Math.abs(jalonArrivee - jalonDepart),
      delay: 500,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onArrive());
  }, [echantillons, depuis, niveau, rang, progres, onArrive, annonce, decor.nom]);

  const entrees = echantillons.map((_, i) => i / ECHANTILLONS);
  const essais = essaisAventure(niveau);
  const encre = decor.encre;

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

      <View style={[styles.carte, { backgroundColor: decor.parchemin, borderColor: sombre ? '#8C6BFF' : '#FFFFFF' }]} onLayout={mesurer}>
        {/* Image du décor, sous le chemin et les pastilles */}
        <Image source={decor.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {taille && (
          <>
            <View pointerEvents="none" style={styles.nomDecorZone}>
              <Text
                style={[
                  styles.nomDecor,
                  { color: encre, backgroundColor: sombre ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.72)' },
                ]}
              >
                {decor.nom} · niveaux {base + 1}–{base + PAR_CARTE}
              </Text>
            </View>

            <Svg width={taille.l} height={taille.h} style={StyleSheet.absoluteFill}>
              <Path d={chemin} stroke={sombre ? '#000000' : '#FFFFFF'} strokeOpacity={0.4} strokeWidth={8} strokeDasharray="1 11" strokeLinecap="round" fill="none" />
              <Path d={chemin} stroke={encre} strokeOpacity={0.95} strokeWidth={4} strokeDasharray="1 11" strokeLinecap="round" fill="none" />
            </Svg>

            {noeuds.map((n, p) => {
              const niveauNoeud = base + p + 1;
              const fait = niveauNoeud < niveau;
              const courant = niveauNoeud === niveau;
              const tresor = p === PAR_CARTE - 1;
              return (
                <View key={p} style={[styles.noeud, { left: n.x - TAILLE_NOEUD / 2, top: n.y - TAILLE_NOEUD / 2 }]}>
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
                </View>
              );
            })}

            {/* Un anneau qui bat autour du niveau à jouer */}
            {noeuds[rang] && (
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
          </>
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
  carte: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: rayon,
    borderWidth: 3,
    overflow: 'hidden',
  },
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
