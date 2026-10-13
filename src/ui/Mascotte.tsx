import { tr } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { jouerEffet } from '../audio/effets';
import CorpsMascotte from './CorpsMascotte';

/**
 * Cluby, la mascotte : une petite boîte-mystère qui flotte, cligne des yeux
 * et laisse s'échapper un point d'interrogation lumineux.
 */
export default function Mascotte({ taille = 220 }: { taille?: number }) {
  const flotte = useRef(new Animated.Value(0)).current;
  const point = useRef(new Animated.Value(0)).current;
  const [yeuxFermes, setYeuxFermes] = useState(false);
  const [content, setContent] = useState(false);
  const saut = useRef(new Animated.Value(0)).current; // hauteur du saut, de 0 à 1
  const tour = useRef(new Animated.Value(0)).current; // rotation, de 0 à 1 = un tour complet
  const ecrase = useRef(new Animated.Value(0)).current; // écrasement à l'atterrissage
  const etincelles = useRef(new Animated.Value(0)).current;
  const compteur = useRef(0);

  /** Au toucher : une petite réaction différente à chaque fois (saut, pirouette, secousse). */
  function reagir() {
    const variante = compteur.current++ % 3;
    jouerEffet('pop');
    setContent(true);
    saut.setValue(0);
    tour.setValue(0);
    ecrase.setValue(0);
    etincelles.setValue(0);

    const sauter = Animated.sequence([
      Animated.timing(saut, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(saut, { toValue: 0, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);
    const atterrir = Animated.sequence([
      Animated.timing(ecrase, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.spring(ecrase, { toValue: 0, friction: 4, tension: 120, useNativeDriver: true }),
    ]);
    const pirouette = Animated.timing(tour, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.cubic), useNativeDriver: true });
    const secousse = Animated.sequence(
      [1, -1, 1, -1, 0.6, -0.6, 0].map((v) => Animated.timing(tour, { toValue: v * 0.03, duration: 70, useNativeDriver: true })),
    );

    const mouvement =
      variante === 0
        ? Animated.sequence([sauter, atterrir])
        : variante === 1
          ? Animated.parallel([sauter, pirouette])
          : secousse;

    Animated.parallel([
      mouvement,
      Animated.timing(etincelles, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      tour.setValue(0);
      setContent(false);
    });
  }

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

  const ETINCELLES = [
    { dx: -0.46, dy: -0.34, e: '✨' },
    { dx: 0.46, dy: -0.3, e: '⭐' },
    { dx: -0.34, dy: -0.62, e: '✨' },
    { dx: 0.32, dy: -0.66, e: '💫' },
    { dx: 0, dy: -0.8, e: '⭐' },
  ];

  return (
    <TouchableWithoutFeedback onPress={reagir} accessibilityRole="button" accessibilityLabel={tr('Toucher la mascotte', 'Tap the mascot')}>
    <View style={{ width: l, height: hauteur, alignItems: 'center' }}>
      <Animated.Text
        style={[
          styles.point,
          {
            right: taille * 0.04,
            fontSize: taille * 0.26,
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
            { translateY: saut.interpolate({ inputRange: [0, 1], outputRange: [0, -taille * 0.32] }) },
            { rotate: flotte.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) },
            { rotate: tour.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-360deg', '0deg', '360deg'] }) },
            { scaleY: ecrase.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) },
            { scaleX: ecrase.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) },
          ],
        }}
      >
        <CorpsMascotte largeur={l} hauteur={l * 0.95} yeuxFermes={yeuxFermes || content} />
      </Animated.View>

      {ETINCELLES.map((et, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            top: hauteur * 0.5,
            fontSize: taille * 0.12,
            opacity: etincelles.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateX: etincelles.interpolate({ inputRange: [0, 1], outputRange: [0, et.dx * taille] }) },
              { translateY: etincelles.interpolate({ inputRange: [0, 1], outputRange: [0, et.dy * taille] }) },
              { scale: etincelles.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1.2, 0.8] }) },
            ],
          }}
        >
          {et.e}
        </Animated.Text>
      ))}
    </View>
    </TouchableWithoutFeedback>
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
