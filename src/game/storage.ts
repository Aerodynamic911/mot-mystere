import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_ESSAIS, jourPrecedent } from './engine';

export interface Stats {
  parties: number;
  victoires: number;
  serie: number;
  meilleureSerie: number;
  dernierJourGagne: string | null;
  /** Nombre de victoires par nombre d'essais (index 0 = 1 essai). */
  repartition: number[];
}

export interface EtatDuJour {
  cle: string;
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
  repartition: Array(MAX_ESSAIS).fill(0),
};

export async function chargerStats(): Promise<Stats> {
  try {
    const brut = await AsyncStorage.getItem(CLE_STATS);
    if (!brut) return STATS_VIDES;
    return { ...STATS_VIDES, ...(JSON.parse(brut) as Partial<Stats>) };
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

export function enregistrerResultat(stats: Stats, cle: string, gagne: boolean, essais: number): Stats {
  const s: Stats = { ...stats, repartition: [...stats.repartition], parties: stats.parties + 1 };
  if (gagne) {
    s.victoires += 1;
    s.serie = stats.dernierJourGagne === jourPrecedent(cle) ? stats.serie + 1 : 1;
    s.meilleureSerie = Math.max(s.meilleureSerie, s.serie);
    s.dernierJourGagne = cle;
    s.repartition[essais - 1] += 1;
  } else {
    s.serie = 0;
  }
  return s;
}

/** Série à afficher : tombe à 0 si le dernier succès date de plus d'hier. */
export function serieAffichee(stats: Stats, cleAujourdhui: string): number {
  if (stats.dernierJourGagne === cleAujourdhui || stats.dernierJourGagne === jourPrecedent(cleAujourdhui)) {
    return stats.serie;
  }
  return 0;
}
