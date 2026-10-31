import AsyncStorage from '@react-native-async-storage/async-storage';
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

const CLE_BANDEAU = 'motmystere:avisBandeau';

/**
 * Où en est l'invitation à laisser un avis ?
 * - « aucun » : le joueur n'a encore rien fait ;
 * - « ferme » : il a fermé le bandeau de l'accueil (« pas maintenant ») : le bandeau disparaît, mais le bouton de fin de partie gagnée reste ;
 * - « ouvert » : il a touché un bouton d'avis (page du store ouverte) : plus aucune invitation.
 */
export type EtatAvis = 'aucun' | 'ferme' | 'ouvert';

export async function chargerEtatAvis(): Promise<EtatAvis> {
  try {
    const v = await AsyncStorage.getItem(CLE_BANDEAU);
    return v === 'ouvert' ? 'ouvert' : v === '1' || v === 'ferme' ? 'ferme' : 'aucun';
  } catch {
    return 'aucun';
  }
}

export async function sauverEtatAvis(etat: EtatAvis): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE_BANDEAU, etat);
  } catch {
    // Non enregistré : l'invitation reviendra au prochain lancement, ce n'est pas grave.
  }
}

/** Le bandeau de l'accueil : une fois le joueur lancé (quelques parties), tant qu'il n'y a pas touché ni fermé. */
export function bandeauAvisVisible(stats: Stats, etat: EtatAvis): boolean {
  return etat === 'aucun' && partiesJouees(stats) >= PARTIES_MIN;
}

/** Le bouton de fin de partie gagnée : tant que le joueur n'a pas ouvert la page d'avis. */
export function boutonAvisVisible(stats: Stats, etat: EtatAvis): boolean {
  return etat !== 'ouvert' && partiesJouees(stats) >= PARTIES_MIN;
}
