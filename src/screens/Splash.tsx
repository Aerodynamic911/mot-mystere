import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { EDITEUR } from '../config';
import { couleurs } from '../theme';

/** Écran de chargement : titre du jeu au centre, nom de l'éditeur en bas. */
export default function Splash() {
  const titre = useRef(new Animated.Value(0)).current;
  const editeur = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titre, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(editeur, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [titre, editeur]);

  return (
    <View style={styles.conteneur}>
      <Animated.View
        style={[
          styles.centre,
          {
            opacity: titre,
            transform: [{ scale: titre.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
          },
        ]}
      >
        <Text style={styles.point}>?</Text>
        <Text style={styles.titre}>Mot Mystère</Text>
      </Animated.View>

      <Animated.View style={[styles.bas, { opacity: editeur }]}>
        <Text style={styles.un}>Un jeu de</Text>
        <Text style={styles.editeur}>{EDITEUR}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: couleurs.fond, alignItems: 'center', justifyContent: 'center' },
  centre: { alignItems: 'center' },
  point: { color: couleurs.accent, fontSize: 84, fontWeight: '800', lineHeight: 92 },
  titre: { color: couleurs.accent, fontSize: 38, fontWeight: '800', marginTop: 4 },
  bas: { position: 'absolute', bottom: 48, alignItems: 'center' },
  un: { color: couleurs.texteSecondaire, fontSize: 13, letterSpacing: 1 },
  editeur: { color: couleurs.texte, fontSize: 18, fontWeight: '700', marginTop: 4 },
});
