import React from 'react';
import { Animated, StyleSheet } from 'react-native';

const ANGLES = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4 + Math.PI / 8);

/**
 * Gerbe d'étoiles qui jaillit d'un point : à placer dans une vue de taille nulle posée sur ce point.
 * `valeur` va de 0 (rien) à 1 (étoiles envolées et disparues).
 */
export default function Eclat({ valeur, rayon = 48 }: { valeur: Animated.Value; rayon?: number }) {
  return (
    <>
      {ANGLES.map((a, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.etoile,
            {
              opacity: valeur.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: valeur.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * rayon] }) },
                { translateY: valeur.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * rayon] }) },
                { scale: valeur.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.2, 0.7] }) },
              ],
            },
          ]}
        >
          {i % 2 ? '✨' : '⭐'}
        </Animated.Text>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  etoile: { position: 'absolute', left: -9, top: -11, fontSize: 18 },
});
