import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tr } from '../i18n';
import { Carte, RARETES } from '../data/cartes';

/** Vrai si la couleur de fond (#RRGGBB) est claire : le texte doit alors être foncé. */
function estClair(hex: string): boolean {
  const n = parseInt(hex.replace('#', ''), 16);
  if (Number.isNaN(n)) return false;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

interface Props {
  carte: Carte;
  largeur: number;
  /** Carte pas encore obtenue : silhouette et consigne pour l'avoir. */
  verrouillee?: boolean;
  consigne?: string;
}

/** Une carte à collectionner : cadre selon la rareté, grand emoji, titre et origine. */
export default function CarteVisuelle({ carte, largeur, verrouillee = false, consigne }: Props) {
  const rarete = RARETES[carte.rarete];
  const fond = verrouillee ? '#1A1F3A' : carte.fond;
  const clair = !verrouillee && estClair(fond);
  const texte = verrouillee ? '#9AA0C0' : clair ? '#1B1B2B' : '#F2F3F8';
  const u = largeur / 100; // unité proportionnelle : tout s'adapte à la taille de la carte
  return (
    <View
      style={[
        styles.carte,
        { width: largeur, height: largeur * 1.42, borderRadius: 9 * u, borderWidth: Math.max(2, 2.4 * u), borderColor: verrouillee ? '#323963' : rarete.couleur, backgroundColor: fond },
      ]}
    >
      <View style={[styles.rarete, { backgroundColor: verrouillee ? '#323963' : rarete.couleur, borderRadius: 6 * u, paddingHorizontal: 7 * u, paddingVertical: 2 * u }]}>
        <Text style={[styles.rareteTexte, { fontSize: 7.5 * u }]}>{verrouillee ? tr('À OBTENIR', 'LOCKED') : rarete.libelle.toUpperCase()}</Text>
      </View>
      <Text style={{ fontSize: 40 * u, opacity: verrouillee ? 0.35 : 1, marginTop: 6 * u }}>{verrouillee ? '❓' : carte.emoji}</Text>
      <Text style={[styles.titre, { color: texte, fontSize: 10.5 * u, lineHeight: 12.5 * u }]} numberOfLines={2}>
        {verrouillee ? '???' : carte.titre}
      </Text>
      <Text style={[styles.sousTitre, { color: texte, fontSize: 7.8 * u, lineHeight: 9.6 * u }]} numberOfLines={3}>
        {verrouillee ? (consigne ?? '') : carte.sousTitre}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 6, overflow: 'hidden' },
  rarete: { alignSelf: 'center' },
  rareteTexte: { color: '#14172C', fontWeight: '900', letterSpacing: 1 },
  titre: { fontWeight: '900', textAlign: 'center' },
  sousTitre: { textAlign: 'center', opacity: 0.85 },
});
