import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';

const PALETTE = ['#F5B942', '#FF8A5B', '#FF6B9D', '#B58CFF', '#6CB4FF', '#3DDC97', '#F5B942'];

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
  const hauteur = Math.max(...points.map((p) => p.y)) + taille * 1.3;

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
            {/* Relief : la même lettre en foncé, décalée vers le bas, derrière la lettre colorée. */}
            <Text style={[styles.texte, styles.relief, { fontSize: taille }]}>{lettre}</Text>
            <Text style={[styles.texte, { fontSize: taille, color: PALETTE[i % PALETTE.length] }]}>{lettre}</Text>
          </Animated.View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lettre: { position: 'absolute', alignItems: 'center' },
  texte: {
    color: couleurs.accent,
    fontWeight: '800',
    textShadowColor: 'rgba(245,185,66,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  relief: {
    position: 'absolute',
    top: 5,
    color: '#241055',
    textShadowColor: 'transparent',
    textShadowRadius: 0,
  },
});
