import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';

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

  useEffect(() => {
    Animated.stagger(
      90,
      apparitions.map((a) => Animated.spring(a, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true })),
    ).start();
  }, [apparitions]);

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
          <Text style={[styles.texte, { fontSize: taille }]}>{lettre}</Text>
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
});
