import { numeroDuJour } from './engine';
import type { ModeJeu, Stats } from './storage';
import { Skin } from './skins';

export const PRIX_JOKER = 30;
export const PRIX_GLACON = 100;
/** Glaçons gardés en réserve au maximum. */
export const MAX_GLACONS = 3;
/** Un joker s'achète une fois par jour ; un glaçon tous les 5 jours. */
export const JOURS_ENTRE_GLACONS = 5;

/** Pièces gagnées à la fin d'une partie : un peu plus pour le mystère du jour, un bonus si on trouve vite. */
export function gainPieces(mode: ModeJeu, essais: number, gagne: boolean): number {
  if (!gagne) return 0;
  return (mode === 'jour' ? 15 : 6) + (essais <= 2 ? 5 : 0);
}

/** Jokers spécifiques : +10 secondes au Sprint, et passer une affirmation de Vrai ou faux. */
export const PRIX_JOKER_TEMPS = 40;
export const PRIX_JOKER_PASSER = 40;
export const MAX_JOKERS_SPECIAUX = 5;
export const SECONDES_JOKER_TEMPS = 10;

export function acheterJokerTemps(stats: Stats): Stats | null {
  if (stats.jokersTemps >= MAX_JOKERS_SPECIAUX || stats.pieces < PRIX_JOKER_TEMPS) return null;
  return { ...stats, pieces: stats.pieces - PRIX_JOKER_TEMPS, jokersTemps: stats.jokersTemps + 1 };
}

export function acheterJokerPasser(stats: Stats): Stats | null {
  if (stats.jokersPasser >= MAX_JOKERS_SPECIAUX || stats.pieces < PRIX_JOKER_PASSER) return null;
  return { ...stats, pieces: stats.pieces - PRIX_JOKER_PASSER, jokersPasser: stats.jokersPasser + 1 };
}

export function possedeSkin(stats: Stats, id: string): boolean {
  return stats.skins.includes(id);
}

/** Achète un skin de la boutique (null = refusé : déjà possédé, non vendu ou pas assez de pièces). */
export function acheterSkin(stats: Stats, skin: Skin): Stats | null {
  if (skin.origine !== 'boutique' || possedeSkin(stats, skin.id) || stats.pieces < skin.prix) return null;
  return { ...stats, pieces: stats.pieces - skin.prix, skins: [...stats.skins, skin.id], skinEquipe: skin.id };
}

/** Équipe un skin déjà possédé. */
export function equiperSkin(stats: Stats, id: string): Stats | null {
  return possedeSkin(stats, id) ? { ...stats, skinEquipe: id } : null;
}

export function jokerDisponible(stats: Stats, cle: string): boolean {
  return stats.dernierAchatJoker !== cle;
}

/** Jours à attendre avant de pouvoir racheter un glaçon (0 = disponible). */
export function joursAvantGlacon(stats: Stats, cle: string): number {
  if (!stats.dernierAchatGlacon) return 0;
  const ecoules = numeroDuJour(cle) - numeroDuJour(stats.dernierAchatGlacon);
  return Math.max(0, JOURS_ENTRE_GLACONS - ecoules);
}

export function acheterJoker(stats: Stats, cle: string): Stats | null {
  if (!jokerDisponible(stats, cle) || stats.pieces < PRIX_JOKER) return null;
  return { ...stats, pieces: stats.pieces - PRIX_JOKER, jokers: stats.jokers + 1, dernierAchatJoker: cle };
}

export function acheterGlacon(stats: Stats, cle: string): Stats | null {
  if (joursAvantGlacon(stats, cle) > 0 || stats.glacons >= MAX_GLACONS || stats.pieces < PRIX_GLACON) return null;
  return { ...stats, pieces: stats.pieces - PRIX_GLACON, glacons: stats.glacons + 1, dernierAchatGlacon: cle };
}
