import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { EDITEUR } from '../config';
import { couleurs } from '../theme';
import FondAnime from '../ui/FondAnime';
import TitreArc from '../ui/TitreArc';

/** Écran de chargement : titre en arc au centre, nom de l'éditeur en bas. */
export default function Splash() {
  const editeur = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(editeur, { toValue: 1, duration: 600, delay: 900, useNativeDriver: true }).start();
  }, [editeur]);

  return (
    <View style={styles.conteneur}>
      <FondAnime />
      <TitreArc texte="CLUEBOX" taille={52} />

      <Animated.View style={[styles.bas, { opacity: editeur }]}>
        <Text style={styles.un}>Un jeu de</Text>
        <Text style={styles.editeur}>{EDITEUR}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: couleurs.fond, alignItems: 'center', justifyContent: 'center' },
  bas: { position: 'absolute', bottom: 48, alignItems: 'center' },
  un: { color: couleurs.texteSecondaire, fontSize: 13, letterSpacing: 1 },
  editeur: { color: couleurs.texte, fontSize: 18, fontWeight: '700', marginTop: 4 },
});
