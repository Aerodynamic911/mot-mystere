import * as StoreReview from 'expo-store-review';
import type { Stats } from './storage';

/**
 * Demande d'avis : la fenêtre de notation intégrée de l'iPhone (les étoiles s'affichent dans le jeu).
 * Règles : jamais au lancement ni en cours de partie, pas dès les premières parties, au bon moment
 * (série de victoires, fin d'un Sprint) et une seule fois par appareil. iOS limite de toute façon
 * l'affichage à 3 fois par an et ne dit pas si la fenêtre est apparue : on garde donc cette unique chance
 * pour un moment où le joueur est content, et le bouton « Donner mon avis » des préférences reste disponible.
 */
export type MomentAvis = 'victoire' | 'sprint';

/** Parties jouées (tous modes) avant la première demande : pas dès la première partie. */
const PARTIES_MIN = 3;
/** Victoires d'affilée qui déclenchent la demande après une partie gagnée. */
const SERIE_VICTOIRES_MIN = 3;
/** Sprints terminés avant que la fin d'un Sprint déclenche la demande. */
const SPRINTS_MIN = 2;
/** Délai après la fin de la partie, pour laisser le joueur voir son résultat (et le récap du Sprint). */
export const DELAI_AVIS_MS = 6000;

export function partiesJouees(stats: Stats): number {
  return stats.parties + stats.sprints + stats.vfParties;
}

/** Faut-il proposer de noter l'appli maintenant ? `stats` est l'état une fois la partie prise en compte. */
export function doitDemanderAvis(stats: Stats, moment: MomentAvis): boolean {
  if (stats.avisDemandes >= 1) return false;
  if (partiesJouees(stats) < PARTIES_MIN) return false;
  return moment === 'victoire' ? stats.serieVictoires >= SERIE_VICTOIRES_MIN : stats.sprints >= SPRINTS_MIN;
}

/** Affiche la fenêtre de notation native si la boutique le permet ; sinon ne fait rien. */
export async function demanderAvisNatif(): Promise<void> {
  try {
    if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview();
  } catch {
    // Pas disponible (émulateur, boutique absente) : on ignore.
  }
}
