import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: L, height: H } = Dimensions.get('window');

/** Halos de couleur qui dérivent lentement. */
const HALOS = [
  { couleur: 'rgba(245,185,66,0.10)', taille: L * 0.95, x: -L * 0.3, y: H * 0.05, dx: L * 0.25, dy: H * 0.08, duree: 11000 },
  { couleur: 'rgba(120,90,255,0.16)', taille: L * 1.1, x: L * 0.3, y: H * 0.35, dx: -L * 0.3, dy: -H * 0.06, duree: 14000 },
  { couleur: 'rgba(61,220,151,0.08)', taille: L * 0.8, x: -L * 0.2, y: H * 0.7, dx: L * 0.3, dy: -H * 0.07, duree: 12500 },
];

/** Symboles qui montent doucement (position horizontale en part de la largeur). */
const SYMBOLES = [
  { s: '?', x: 0.08, taille: 34, duree: 21000, retard: 0 },
  { s: '✦', x: 0.22, taille: 20, duree: 17000, retard: 4000 },
  { s: '?', x: 0.38, taille: 26, duree: 24000, retard: 9000 },
  { s: '✦', x: 0.52, taille: 16, duree: 15000, retard: 2000 },
  { s: '?', x: 0.66, taille: 38, duree: 26000, retard: 6000 },
  { s: '✦', x: 0.78, taille: 22, duree: 19000, retard: 11000 },
  { s: '?', x: 0.9, taille: 28, duree: 23000, retard: 1000 },
  { s: '✦', x: 0.46, taille: 14, duree: 14000, retard: 7000 },
];

function Halo({ couleur, taille, x, y, dx, dy, duree }: (typeof HALOS)[number]) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: duree, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: duree, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    boucle.start();
    return () => boucle.stop();
  }, [t, duree]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: taille,
        height: taille,
        borderRadius: taille / 2,
        backgroundColor: couleur,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
        ],
      }}
    />
  );
}

function Symbole({ s, x, taille, duree, retard }: (typeof SYMBOLES)[number]) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    t.setValue(0);
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.delay(retard),
        Animated.timing(t, { toValue: 1, duration: duree, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    boucle.start();
    return () => boucle.stop();
  }, [t, duree, retard]);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x * L,
        top: 0,
        fontSize: taille,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.12)',
        opacity: t.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [H + 40, -60] }) },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 14, -10] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '14deg'] }) },
        ],
      }}
    >
      {s}
    </Animated.Text>
  );
}

/** Fond animé : halos de couleur qui dérivent et symboles qui s'élèvent. N'intercepte aucun toucher. */
export default function FondAnime() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {HALOS.map((h, i) => (
        <Halo key={`h${i}`} {...h} />
      ))}
      {SYMBOLES.map((s, i) => (
        <Symbole key={`s${i}`} {...s} />
      ))}
    </View>
  );
}
