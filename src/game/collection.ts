import AsyncStorage from '@react-native-async-storage/async-storage';
import { EVENEMENTS, NB_ETAPES } from '../data/evenements';
import { MYSTERES_PAR_CARTE_JOUR, NIVEAUX_PAR_CARTE_AVENTURE } from '../data/cartes';
import { Progression } from './progression';
import { Stats } from './storage';

const CLE = 'boxtery:collection';

export async function chargerCollection(): Promise<string[]> {
  try {
    const brut = await AsyncStorage.getItem(CLE);
    const liste = brut ? (JSON.parse(brut) as unknown) : [];
    return Array.isArray(liste) ? liste.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function sauverCollection(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(ids));
  } catch {
    // Le jeu reste jouable même si l'enregistrement échoue.
  }
}

/**
 * Cartes méritées d'après la progression et les statistiques (et pas encore possédées).
 * - Aventure : une carte tous les 10 niveaux réussis.
 * - Événement : une carte quand les 20 étapes sont réussies.
 * - Mystère du jour : une carte tous les 50 mystères du jour résolus.
 * Calculées sur l'état complet : rien n'est perdu si une récompense a été manquée.
 */
export function cartesMeritees(prog: Progression, stats: Stats, possedees: string[]): string[] {
  const ids: string[] = [];
  const niveauxReussis = prog.aventure.niveau - 1;
  for (let n = 1; n <= Math.floor(niveauxReussis / NIVEAUX_PAR_CARTE_AVENTURE); n++) ids.push(`av-${n}`);
  for (const e of EVENEMENTS) if ((prog.evenements[e.id]?.faites ?? 0) >= NB_ETAPES) ids.push(`ev-${e.id}`);
  for (let k = 1; k <= Math.floor(stats.modes.jour.victoires / MYSTERES_PAR_CARTE_JOUR); k++) ids.push(`jr-${k}`);
  return ids.filter((id) => !possedees.includes(id));
}
