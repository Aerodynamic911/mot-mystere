import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_ESSAIS, PASSE, jourPrecedent } from './engine';
import { Bonus, bonusAttribues } from './bonus';
import { gainPieces } from './boutique';

export type ModeJeu = 'jour' | 'aventure' | 'evenement' | 'defi' | 'image';

/** Compteurs d'un mode de jeu. */
export interface Compteurs {
  parties: number;
  victoires: number;
  /** Indices demandés (chacun compte comme un essai). */
  indices: number;
  /** Réponses proposées. */
  propositions: number;
}

const COMPTEURS_VIDES: Compteurs = { parties: 0, victoires: 0, indices: 0, propositions: 0 };

export interface Stats {
  /** Toutes parties confondues (mystère du jour, aventure, événements). */
  parties: number;
  victoires: number;
  /** Série de jours consécutifs avec le mystère du jour trouvé. */
  serie: number;
  meilleureSerie: number;
  dernierJourGagne: string | null;
  /** Série de victoires d'affilée, tous modes confondus. */
  serieVictoires: number;
  meilleureSerieVictoires: number;
  /** Nombre de victoires par nombre d'essais (index 0 = 1 essai), tous modes confondus. */
  repartition: number[];
  /** Détail par mode. */
  modes: Record<ModeJeu, Compteurs>;
  /** Jokers en réserve : chacun révèle un indice sans compter comme un essai. */
  jokers: number;
  /** Jokers utilisés depuis le début. */
  jokersUtilises: number;
  /** Partages comptés (au plus un par jour) : 3 partages = 1 joker. */
  partages: number;
  dernierPartage: string | null;
  /** Dernier jour où un défi d'ami gagné a rapporté un joker. */
  dernierDefiJoker: string | null;
  /** Combien de fois on a proposé de noter l'appli, et quand la dernière fois. */
  avisDemandes: number;
  dernierAvis: string | null;
  /** Pièces en réserve (gagnées en jouant), à dépenser dans la boutique. */
  pieces: number;
  /** Glaçons en réserve : chacun sauve la série de jours si on manque un jour. */
  glacons: number;
  dernierAchatJoker: string | null;
  dernierAchatGlacon: string | null;
  /** Sprint : parties jouées et meilleur score. */
  sprints: number;
  recordSprint: number;
  /** Vrai ou faux : séries jouées, meilleur score sur 10 et réponses justes au total. */
  vfParties: number;
  vfMeilleur: number;
  vfBonnes: number;
  vfTotal: number;
  /** Boss vaincus depuis le début. */
  bossVaincus: number;
  /** Skins de mascotte possédés et skin équipé. */
  skins: string[];
  skinEquipe: string;
  /** Jokers spécifiques : +10 secondes au Sprint, et passer une question de Vrai ou faux. */
  jokersTemps: number;
  jokersPasser: number;
  /** Le cadeau de remerciement (jokers et pièces) a déjà été offert. */
  cadeauMerci: boolean;
}

export interface EtatDuJour {
  cle: string;
  /** Mystère proposé ce jour-là (absent sur les anciennes sauvegardes). */
  id?: string;
  propositions: string[];
  terminee: boolean;
  gagnee: boolean;
}

const CLE_STATS = 'motmystere:stats';
const CLE_JOUR = 'motmystere:jour';

export const STATS_VIDES: Stats = {
  parties: 0,
  victoires: 0,
  serie: 0,
  meilleureSerie: 0,
  dernierJourGagne: null,
  serieVictoires: 0,
  meilleureSerieVictoires: 0,
  repartition: Array(MAX_ESSAIS).fill(0),
  modes: { jour: COMPTEURS_VIDES, aventure: COMPTEURS_VIDES, evenement: COMPTEURS_VIDES, defi: COMPTEURS_VIDES, image: COMPTEURS_VIDES },
  jokers: 0,
  jokersUtilises: 0,
  partages: 0,
  dernierPartage: null,
  dernierDefiJoker: null,
  avisDemandes: 0,
  dernierAvis: null,
  pieces: 0,
  glacons: 0,
  dernierAchatJoker: null,
  dernierAchatGlacon: null,
  sprints: 0,
  recordSprint: 0,
  vfParties: 0,
  vfMeilleur: 0,
  vfBonnes: 0,
  vfTotal: 0,
  bossVaincus: 0,
  skins: ['classique'],
  skinEquipe: 'classique',
  jokersTemps: 0,
  jokersPasser: 0,
  cadeauMerci: false,
};

export async function chargerStats(): Promise<Stats> {
  try {
    const brut = await AsyncStorage.getItem(CLE_STATS);
    if (!brut) return STATS_VIDES;
    const lu = JSON.parse(brut) as Partial<Stats>;
    const modes = { ...STATS_VIDES.modes, ...(lu.modes ?? {}) };
    // Anciennes sauvegardes : seules les parties du jour étaient comptées.
    if (!lu.modes) modes.jour = { ...COMPTEURS_VIDES, parties: lu.parties ?? 0, victoires: lu.victoires ?? 0 };
    return { ...STATS_VIDES, ...lu, modes };
  } catch {
    return STATS_VIDES;
  }
}

export async function sauverStats(stats: Stats): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE_STATS, JSON.stringify(stats));
  } catch {
    // Le jeu reste jouable même si le stockage échoue.
  }
}

export async function chargerJour(): Promise<EtatDuJour | null> {
  try {
    const brut = await AsyncStorage.getItem(CLE_JOUR);
    return brut ? (JSON.parse(brut) as EtatDuJour) : null;
  } catch {
    return null;
  }
}

export async function sauverJour(etat: EtatDuJour): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE_JOUR, JSON.stringify(etat));
  } catch {
    // idem
  }
}

/**
 * Enregistre une partie terminée, quel que soit le mode : parties, victoires, indices, réponses, séries.
 * `propositions` contient les réponses et, sous la valeur PASSE, les indices demandés.
 * Renvoie aussi les bonus de série gagnés (jokers).
 */
export function enregistrerPartie(
  stats: Stats,
  mode: ModeJeu,
  cle: string,
  propositions: string[],
  gagne: boolean,
): { stats: Stats; bonus: Bonus[]; glaconUtilise: boolean } {
  const indices = propositions.filter((p) => p === PASSE).length;
  const reponses = propositions.length - indices;
  const m = stats.modes[mode];
  const s: Stats = {
    ...stats,
    repartition: [...stats.repartition],
    modes: {
      ...stats.modes,
      [mode]: {
        parties: m.parties + 1,
        victoires: m.victoires + (gagne ? 1 : 0),
        indices: m.indices + indices,
        propositions: m.propositions + reponses,
      },
    },
    parties: stats.parties + 1,
    pieces: stats.pieces + gainPieces(mode, propositions.length, gagne),
  };
  let glaconUtilise = false;
  let serieJours: number | null = null;
  if (gagne) {
    s.victoires += 1;
    s.serieVictoires = stats.serieVictoires + 1;
    s.meilleureSerieVictoires = Math.max(s.meilleureSerieVictoires, s.serieVictoires);
    const i = Math.min(propositions.length, s.repartition.length) - 1;
    if (i >= 0) s.repartition[i] += 1;
    if (mode === 'jour') {
      const hier = jourPrecedent(cle);
      if (stats.dernierJourGagne === hier) s.serie = stats.serie + 1;
      else if (stats.dernierJourGagne === jourPrecedent(hier) && stats.serie > 0 && stats.glacons > 0) {
        // Un jour manqué : un glaçon sauve la série.
        s.serie = stats.serie + 1;
        s.glacons = stats.glacons - 1;
        glaconUtilise = true;
      } else s.serie = 1;
      s.meilleureSerie = Math.max(s.meilleureSerie, s.serie);
      s.dernierJourGagne = cle;
      serieJours = s.serie;
    }
  } else {
    s.serieVictoires = 0;
    if (mode === 'jour') s.serie = 0;
  }
  const bonus = bonusAttribues(serieJours, gagne ? s.serieVictoires : null);
  s.jokers += bonus.reduce((t, b) => t + b.jokers, 0);
  return { stats: s, bonus, glaconUtilise };
}

/** Série à afficher : tombe à 0 si le dernier succès date de plus d'hier. */
export function serieAffichee(stats: Stats, cleAujourdhui: string): number {
  if (stats.dernierJourGagne === cleAujourdhui || stats.dernierJourGagne === jourPrecedent(cleAujourdhui)) {
    return stats.serie;
  }
  // Un seul jour manqué et un glaçon en réserve : la série est encore sauvée.
  if (stats.glacons > 0 && stats.dernierJourGagne === jourPrecedent(jourPrecedent(cleAujourdhui))) return stats.serie;
  return 0;
}
