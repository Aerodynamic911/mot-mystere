import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

export type TypeEffet = 'bravo' | 'indice' | 'faux';
export interface EffetEnCours {
  type: TypeEffet;
  /** Change à chaque déclenchement, pour rejouer l'animation même deux fois de suite. */
  cle: number;
}

const { width: L, height: H } = Dimensions.get('window');
const COULEURS = ['#F5B942', '#3DDC97', '#8C6BFF', '#FF6B9D', '#6CB4FF', '#FFFFFF'];

/** Animations plein écran : confettis pour une victoire, ampoule pour un indice, nuage pour une mauvaise réponse. */
export default function EffetsJeu({ effet }: { effet: EffetEnCours | null }) {
  if (!effet) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {effet.type === 'bravo' && <Confettis key={`c${effet.cle}`} />}
      {effet.type === 'bravo' && <Eclat key={`e${effet.cle}`} couleur="rgba(61,220,151,0.28)" />}
      {effet.type === 'bravo' && <EmojiPop key={`p${effet.cle}`} emoji="🎉" taille={96} />}
      {effet.type === 'indice' && <Eclat key={`e${effet.cle}`} couleur="rgba(245,185,66,0.22)" />}
      {effet.type === 'indice' && <EmojiPop key={`p${effet.cle}`} emoji="💡" taille={84} />}
      {effet.type === 'faux' && <Eclat key={`e${effet.cle}`} couleur="rgba(255,107,107,0.22)" />}
      {effet.type === 'faux' && <EmojiPop key={`p${effet.cle}`} emoji="🤔" taille={80} />}
    </View>
  );
}

/** Voile de couleur qui apparaît et s'efface. */
function Eclat({ couleur }: { couleur: string }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(t, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.timing(t, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  }, [t]);
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: couleur, opacity: t }]} />;
}

/** Un emoji qui grossit en rebondissant, monte un peu et disparaît. */
function EmojiPop({ emoji, taille }: { emoji: string; taille: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [t]);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        alignSelf: 'center',
        top: H * 0.3,
        fontSize: taille,
        opacity: t.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [20, -60] }) },
          { scale: t.interpolate({ inputRange: [0, 0.2, 0.35, 1], outputRange: [0.2, 1.35, 1, 1.05] }) },
        ],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

interface Particule {
  x: number;
  dx: number;
  taille: number;
  couleur: string;
  duree: number;
  retard: number;
  rotation: number;
  rond: boolean;
}

function Confettis() {
  const particules = useMemo<Particule[]>(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: L * (0.1 + Math.random() * 0.8),
        dx: (Math.random() - 0.5) * 140,
        taille: 7 + Math.random() * 8,
        couleur: COULEURS[i % COULEURS.length],
        duree: 1500 + Math.random() * 1300,
        retard: Math.random() * 350,
        rotation: 360 + Math.random() * 540,
        rond: i % 3 === 0,
      })),
    [],
  );
  return (
    <>
      {particules.map((p, i) => (
        <Confetti key={i} {...p} />
      ))}
    </>
  );
}

function Confetti({ x, dx, taille, couleur, duree, retard, rotation, rond }: Particule) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: duree, delay: retard, easing: Easing.in(Easing.quad), useNativeDriver: true }).start();
  }, [t, duree, retard]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: -20,
        width: taille,
        height: rond ? taille : taille * 1.6,
        borderRadius: rond ? taille / 2 : 2,
        backgroundColor: couleur,
        opacity: t.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, H * 0.95] }) },
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${rotation}deg`] }) },
        ],
      }}
    />
  );
}
