import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { EDITEUR } from '../config';
import LogoEditeur from '../ui/LogoEditeur';

/** Durée de la barre de chargement (l'écran reste affiché au moins ce temps). */
export const DUREE_CHARGEMENT = 3000;

export const FOND_SPLASH = '#2A0A66';
const FOND = FOND_SPLASH;
const BLEU = '#4DA3FF';

/** Écran de chargement : logo et nom de l'éditeur, puis barre de progression et numéro de version. */
export default function Splash() {
  const apparition = useRef(new Animated.Value(0)).current;
  const lueur = useRef(new Animated.Value(0)).current;
  const progres = useRef(new Animated.Value(0)).current;
  const [pourcent, setPourcent] = useState(0);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    Animated.timing(apparition, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(lueur, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(lueur, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    l.start();
    const id = progres.addListener(({ value }) => setPourcent(Math.round(value * 100)));
    Animated.timing(progres, {
      toValue: 1,
      duration: DUREE_CHARGEMENT - 100,
      delay: 300,
      easing: Easing.bezier(0.3, 0.1, 0.4, 1),
      useNativeDriver: false,
    }).start();
    return () => {
      l.stop();
      progres.removeListener(id);
    };
  }, [apparition, lueur, progres]);

  return (
    <View style={styles.conteneur}>
      <Animated.View
        style={[
          styles.centre,
          {
            opacity: apparition,
            transform: [{ scale: lueur.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
          },
        ]}
      >
        <LogoEditeur taille={130} />
        <Text style={styles.editeur}>{EDITEUR.toUpperCase()}</Text>
      </Animated.View>

      <View style={styles.bas}>
        <Text style={styles.chargement}>Chargement</Text>
        <View style={styles.piste}>
          <Animated.View
            style={[styles.barre, { width: progres.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
          />
        </View>
        <Text style={styles.pourcent}>{pourcent} %</Text>
        <Text style={styles.version}>Version {version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: FOND, alignItems: 'center', justifyContent: 'center' },
  centre: { alignItems: 'center' },
  editeur: {
    color: '#F5B942',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 18,
    textShadowColor: 'rgba(245,185,66,0.7)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  bas: { position: 'absolute', bottom: 70, width: '100%', alignItems: 'center' },
  chargement: { color: BLEU, fontSize: 20, fontWeight: '800' },
  piste: {
    width: '74%',
    height: 18,
    borderRadius: 9,
    marginTop: 14,
    backgroundColor: '#1A0B45',
    borderWidth: 2,
    borderColor: BLEU,
    padding: 2,
    overflow: 'hidden',
  },
  barre: { height: '100%', borderRadius: 6, backgroundColor: '#22C55E' },
  pourcent: { color: BLEU, fontSize: 20, fontWeight: '800', marginTop: 12 },
  version: { color: '#5B6FD6', fontSize: 14, fontWeight: '700', marginTop: 18 },
});
