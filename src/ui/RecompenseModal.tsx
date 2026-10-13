import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jouerEffet } from '../audio/effets';
import { Carte } from '../data/cartes';
import { Bonus } from '../game/bonus';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';
import CarteVisuelle from './CarteVisuelle';
import Eclat from './Eclat';

export type Recompense = { type: 'carte'; carte: Carte } | { type: 'bonus'; bonus: Bonus };

interface Props {
  recompense: Recompense | null;
  /** Nombre de récompenses encore en attente derrière celle-ci. */
  suivantes: number;
  onFermer: () => void;
}

/** Fenêtre de récompense : une carte qui apparaît en rebondissant, ou un bonus de série. */
export default function RecompenseModal({ recompense, suivantes, onFermer }: Props) {
  const entree = useRef(new Animated.Value(0)).current;
  const eclat = useRef(new Animated.Value(0)).current;
  const cle = recompense ? (recompense.type === 'carte' ? recompense.carte.id : `bonus-${recompense.bonus.origine}-${recompense.bonus.serie}`) : '';

  useEffect(() => {
    if (!recompense) return;
    entree.setValue(0);
    eclat.setValue(0);
    jouerEffet('victoire');
    Animated.spring(entree, { toValue: 1, friction: 5, tension: 70, useNativeDriver: false }).start();
    Animated.timing(eclat, { toValue: 1, duration: 1100, delay: 250, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  const echelle = entree.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <Modal visible={!!recompense} transparent animationType="fade" onRequestClose={onFermer}>
      <View style={styles.voile}>
        {recompense?.type === 'carte' && (
          <>
            <Text style={styles.titre}>🎉 {tr('Nouvelle carte !', 'New card!')}</Text>
            <Animated.View style={{ alignItems: 'center', transform: [{ scale: echelle }] }}>
              <CarteVisuelle carte={recompense.carte} largeur={190} />
              <View pointerEvents="none" style={styles.centre}>
                <Eclat valeur={eclat} rayon={150} />
              </View>
            </Animated.View>
            <Text style={styles.sous}>{tr('Retrouvez-la dans votre collection.', 'Find it in your collection.')}</Text>
          </>
        )}
        {recompense?.type === 'bonus' && (
          <>
            <Text style={styles.titre}>
              {recompense.bonus.origine === 'partages' || recompense.bonus.origine === 'defi' ? `🎁 ${tr('Merci !', 'Thank you!')}` : `🔥 ${tr('Bonus de série !', 'Streak bonus!')}`}
            </Text>
            <Animated.View style={[styles.bonus, { transform: [{ scale: echelle }] }]}>
              <Text style={styles.bonusEmoji}>🎁</Text>
              <Text style={styles.bonusJokers}>
                +{recompense.bonus.jokers} joker{recompense.bonus.jokers > 1 ? 's' : ''}
              </Text>
              <Text style={styles.bonusSerie}>
                {recompense.bonus.origine === 'jours'
                  ? tr('{n} jours de suite avec le mystère du jour !', '{n} days in a row with the daily mystery!', { n: recompense.bonus.serie })
                  : recompense.bonus.origine === 'victoires'
                    ? tr("{n} victoires d'affilée !", '{n} wins in a row!', { n: recompense.bonus.serie })
                    : recompense.bonus.origine === 'partages'
                      ? tr('Merci de faire connaître Quizzle ! {n} partages.', 'Thanks for spreading the word about Quizzle! {n} shares.', { n: recompense.bonus.serie })
                      : tr('Défi relevé avec succès !', 'Challenge completed!')}
              </Text>
              <View pointerEvents="none" style={styles.centre}>
                <Eclat valeur={eclat} rayon={130} />
              </View>
            </Animated.View>
            <Text style={styles.sous}>{tr('Un joker révèle un indice sans compter comme un essai.', 'A joker reveals a clue without counting as an attempt.')}</Text>
          </>
        )}
        <TouchableOpacity style={styles.bouton} onPress={onFermer} activeOpacity={0.85}>
          <Text style={styles.boutonTexte}>{suivantes > 0 ? tr('Suivant', 'Next') : tr('Super !', 'Great!')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  voile: { flex: 1, backgroundColor: 'rgba(10,12,28,0.92)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  titre: { color: couleurs.accent, fontSize: 24, fontWeight: '900', marginBottom: 22 },
  centre: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 },
  sous: { color: couleurs.texteSecondaire, fontSize: 14, textAlign: 'center', marginTop: 22, maxWidth: 280 },
  bonus: {
    alignItems: 'center',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    borderWidth: 2,
    borderColor: couleurs.accent,
    paddingVertical: 26,
    paddingHorizontal: 30,
  },
  bonusEmoji: { fontSize: 60 },
  bonusJokers: { color: couleurs.accent, fontSize: 34, fontWeight: '900', marginTop: 6 },
  bonusSerie: { color: couleurs.texte, fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 8, maxWidth: 240 },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 14, paddingHorizontal: 48, marginTop: 28 },
  boutonTexte: { color: '#1B1B1B', fontSize: 17, fontWeight: '800' },
});
