import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { tr } from '../i18n';
import { couleurs } from '../theme';

/** Barre du haut commune aux écrans secondaires : retour, titre centré. */
export default function EnteteEcran({ titre, onRetour, libelleRetour }: { titre: string; onRetour: () => void; libelleRetour?: string }) {
  return (
    <View style={styles.entete}>
      <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Text style={styles.retour}>{libelleRetour ?? tr('‹ Accueil', '‹ Home')}</Text>
      </TouchableOpacity>
      <Text style={styles.titre} numberOfLines={1}>
        {titre}
      </Text>
      <View style={styles.espaceur} />
    </View>
  );
}

const styles = StyleSheet.create({
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retour: { color: couleurs.texteSecondaire, fontSize: 16, width: 80 },
  titre: { color: couleurs.texte, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  espaceur: { width: 80 },
});
