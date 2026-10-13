import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';

const PALETTE = ['#F5B942', '#FF8A5B', '#FF6B9D', '#B58CFF', '#6CB4FF', '#3DDC97', '#F5B942'];

/** Décalages (vers le bas) des copies qui forment l'épaisseur de la lettre. */
const EXTRUSION = [9, 8, 7, 6, 5, 4, 3, 2];
/** Huit directions autour de la lettre pour dessiner le contour. */
const CONTOUR: [number, number][] = [
  [-3, 0], [3, 0], [0, -3], [0, 3], [-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2],
];

/** Assombrit une couleur « #RRGGBB » (facteur entre 0 et 1 : 1 garde la couleur, 0 donne du noir). */
function assombrir(hex: string, facteur: number): string {
  const f = Math.max(0, Math.min(1, facteur));
  const c = (i: number) => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0');
  return `#${c(1)}${c(3)}${c(5)}`;
}

interface Props {
  texte: string;
  /** Taille des lettres. */
  taille?: number;
}

/** Titre dont les lettres suivent un arc de cercle (en arc-en-ciel), avec une apparition lettre par lettre. */
export default function TitreArc({ texte, taille = 46 }: Props) {
  const lettres = Array.from(texte);
  const n = lettres.length;
  const largeur = Math.min(Dimensions.get('window').width - 32, 360);
  const emplacement = taille * 0.82; // espace réservé à chaque lettre
  const rayon = largeur * 0.62;
  const apparitions = useRef(lettres.map(() => new Animated.Value(0))).current;
  const ondes = useRef(lettres.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      90,
      apparitions.map((a) => Animated.spring(a, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true })),
    ).start();
    // Une fois les lettres en place, elles ondulent doucement l'une après l'autre.
    const boucles = ondes.map((o, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(o, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(o, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.delay((n - i) * 140 + 600),
        ]),
      ),
    );
    const depart = setTimeout(() => boucles.forEach((b) => b.start()), 1400);
    return () => {
      clearTimeout(depart);
      boucles.forEach((b) => b.stop());
    };
  }, [apparitions, ondes, n]);

  const points = lettres.map((_, i) => {
    const angle = (i - (n - 1) / 2) * (emplacement / rayon); // radians, 0 = sommet de l'arc
    return { angle, x: rayon * Math.sin(angle), y: rayon * (1 - Math.cos(angle)) };
  });
  const hauteur = Math.max(...points.map((p) => p.y)) + taille * 1.3 + 12;

  return (
    <View style={{ width: largeur, height: hauteur, alignSelf: 'center' }}>
      {lettres.map((lettre, i) => (
        <Animated.View
          key={i}
          style={[
            styles.lettre,
            {
              width: emplacement,
              left: largeur / 2 + points[i].x - emplacement / 2,
              top: points[i].y,
              opacity: apparitions[i],
              transform: [{ rotate: `${(points[i].angle * 180) / Math.PI}deg` }, { scale: apparitions[i] }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ translateY: ondes[i].interpolate({ inputRange: [0, 1], outputRange: [0, -taille * 0.1] }) }] }}>
            {/* Extrusion : des copies décalées vers le bas, de plus en plus sombres, donnent l'épaisseur de la lettre. */}
            {EXTRUSION.map((dy) => (
              <Text key={`e${dy}`} style={[styles.texte, styles.calque, { fontSize: taille, top: dy, color: assombrir(PALETTE[i % PALETTE.length], 0.62 - dy * 0.012) }]}>
                {lettre}
              </Text>
            ))}
            {/* Contour : la lettre en très foncé tout autour. */}
            {CONTOUR.map(([dx, dy]) => (
              <Text key={`c${dx}${dy}`} style={[styles.texte, styles.calque, { fontSize: taille, left: dx, top: dy + 2, color: '#170844' }]}>
                {lettre}
              </Text>
            ))}
            {/* Reflet : une copie plus claire, décalée vers le haut à gauche, qui borde la lettre de lumière. */}
            <Text style={[styles.texte, styles.calque, { fontSize: taille, left: -1.5, top: -1.5, color: '#FFFFFF', opacity: 0.85 }]}>{lettre}</Text>
            <Text style={[styles.texte, { fontSize: taille, color: PALETTE[i % PALETTE.length] }]}>{lettre}</Text>
          </Animated.View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lettre: { position: 'absolute', alignItems: 'center' },
  calque: { position: 'absolute', textShadowColor: 'transparent', textShadowRadius: 0 },
  texte: {
    color: couleurs.accent,
    fontWeight: '900',
    textShadowColor: 'rgba(245,185,66,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },

});
