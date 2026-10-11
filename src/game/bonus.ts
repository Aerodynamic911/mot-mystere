/** Bonus de série : on gagne des jokers (un indice offert, qui ne compte pas comme un essai) à certains paliers. */

export interface Palier {
  seuil: number;
  jokers: number;
}

/** Jours de suite avec le mystère du jour trouvé. */
export const PALIERS_JOURS: Palier[] = [
  { seuil: 3, jokers: 1 },
  { seuil: 7, jokers: 2 },
  { seuil: 14, jokers: 3 },
  { seuil: 30, jokers: 5 },
  { seuil: 60, jokers: 8 },
  { seuil: 100, jokers: 15 },
];

/** Victoires d'affilée (tous modes : mystère du jour, aventure, événements). */
export const PALIERS_VICTOIRES: Palier[] = [
  { seuil: 5, jokers: 1 },
  { seuil: 10, jokers: 2 },
  { seuil: 20, jokers: 3 },
  { seuil: 35, jokers: 4 },
  { seuil: 50, jokers: 6 },
  { seuil: 100, jokers: 12 },
];

export interface Bonus {
  origine: 'jours' | 'victoires';
  serie: number;
  jokers: number;
}

/** Bonus gagnés quand une série atteint exactement un palier (`null` = série non concernée). */
export function bonusAttribues(serieJours: number | null, serieVictoires: number | null): Bonus[] {
  const liste: Bonus[] = [];
  const j = PALIERS_JOURS.find((p) => p.seuil === serieJours);
  if (j) liste.push({ origine: 'jours', serie: j.seuil, jokers: j.jokers });
  const v = PALIERS_VICTOIRES.find((p) => p.seuil === serieVictoires);
  if (v) liste.push({ origine: 'victoires', serie: v.seuil, jokers: v.jokers });
  return liste;
}

/** Prochain palier à atteindre pour une série donnée (`null` au-delà du dernier). */
export function prochainPalier(paliers: Palier[], serie: number): Palier | null {
  return paliers.find((p) => p.seuil > serie) ?? null;
}
