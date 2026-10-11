import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * Cluby, la mascotte : une petite boîte-mystère qui flotte, cligne des yeux
 * et laisse s'échapper un point d'interrogation lumineux.
 */
export default function Mascotte({ taille = 220 }: { taille?: number }) {
  const flotte = useRef(new Animated.Value(0)).current;
  const point = useRef(new Animated.Value(0)).current;
  const [yeuxFermes, setYeuxFermes] = useState(false);

  useEffect(() => {
    const f = Animated.loop(
      Animated.sequence([
        Animated.timing(flotte, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flotte, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(point, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(point, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    f.start();
    p.start();

    let ferme: ReturnType<typeof setTimeout>;
    let ouvre: ReturnType<typeof setTimeout>;
    const clignement = () => {
      setYeuxFermes(true);
      ouvre = setTimeout(() => setYeuxFermes(false), 140);
      ferme = setTimeout(clignement, 2200 + Math.random() * 2400);
    };
    ferme = setTimeout(clignement, 1800);
    return () => {
      f.stop();
      p.stop();
      clearTimeout(ferme);
      clearTimeout(ouvre);
    };
  }, [flotte, point]);

  const hauteur = taille * 1.15;
  const l = taille;

  return (
    <View style={{ width: l, height: hauteur, alignItems: 'center' }} pointerEvents="none">
      <Animated.Text
        style={[
          styles.point,
          {
            fontSize: taille * 0.3,
            opacity: point.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }),
            transform: [
              { translateY: point.interpolate({ inputRange: [0, 1], outputRange: [taille * 0.04, -taille * 0.03] }) },
              { rotate: point.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '10deg'] }) },
            ],
          },
        ]}
      >
        ?
      </Animated.Text>

      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          transform: [
            { translateY: flotte.interpolate({ inputRange: [0, 1], outputRange: [0, -taille * 0.05] }) },
            { rotate: flotte.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) },
          ],
        }}
      >
        <Svg width={l} height={l * 0.95} viewBox="0 0 200 190">
          <Defs>
            <LinearGradient id="corps" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFD36B" />
              <Stop offset="1" stopColor="#F0A52B" />
            </LinearGradient>
            <LinearGradient id="couvercle" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#8C6BFF" />
              <Stop offset="1" stopColor="#5B3FD6" />
            </LinearGradient>
          </Defs>

          {/* Ombre au sol */}
          <Ellipse cx={100} cy={178} rx={58} ry={8} fill="rgba(0,0,0,0.28)" />

          {/* Pieds */}
          <Rect x={55} y={158} width={30} height={16} rx={8} fill="#5B3FD6" />
          <Rect x={115} y={158} width={30} height={16} rx={8} fill="#5B3FD6" />

          {/* Bras */}
          <Path d="M32 112 Q10 100 14 78" stroke="#F0A52B" strokeWidth={13} strokeLinecap="round" fill="none" />
          <Path d="M168 112 Q192 118 190 96" stroke="#F0A52B" strokeWidth={13} strokeLinecap="round" fill="none" />
          <Circle cx={14} cy={76} r={10} fill="#FFFFFF" />
          <Circle cx={190} cy={94} r={10} fill="#FFFFFF" />

          {/* Corps */}
          <Rect x={28} y={58} width={144} height={106} rx={26} fill="url(#corps)" />
          <Rect x={40} y={66} width={44} height={10} rx={5} fill="rgba(255,255,255,0.35)" />

          {/* Couvercle */}
          <Rect x={20} y={40} width={160} height={36} rx={16} fill="url(#couvercle)" />
          <Rect x={32} y={47} width={50} height={8} rx={4} fill="rgba(255,255,255,0.3)" />
          <Rect x={86} y={34} width={28} height={14} rx={7} fill="#FFD36B" />

          {/* Visage */}
          {yeuxFermes ? (
            <>
              <Path d="M60 112 Q73 120 86 112" stroke="#2A1B5C" strokeWidth={5} strokeLinecap="round" fill="none" />
              <Path d="M114 112 Q127 120 140 112" stroke="#2A1B5C" strokeWidth={5} strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <Ellipse cx={73} cy={110} rx={14} ry={17} fill="#FFFFFF" />
              <Ellipse cx={127} cy={110} rx={14} ry={17} fill="#FFFFFF" />
              <Circle cx={76} cy={112} r={8} fill="#2A1B5C" />
              <Circle cx={124} cy={112} r={8} fill="#2A1B5C" />
              <Circle cx={79} cy={108} r={3} fill="#FFFFFF" />
              <Circle cx={127} cy={108} r={3} fill="#FFFFFF" />
            </>
          )}
          <Ellipse cx={52} cy={134} rx={9} ry={6} fill="rgba(255,107,107,0.55)" />
          <Ellipse cx={148} cy={134} rx={9} ry={6} fill="rgba(255,107,107,0.55)" />
          <Path d="M82 134 Q100 152 118 134 Q100 140 82 134 Z" fill="#2A1B5C" stroke="#2A1B5C" strokeWidth={3} strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  point: {
    position: 'absolute',
    top: 0,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(140,107,255,0.95)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
});
