import AsyncStorage from '@react-native-async-storage/async-storage';
import { EVENEMENTS, NB_ETAPES } from '../data/evenements';

export interface ProgressionEvenement {
  /** Nombre d'étapes réussies (0 à 20) : l'étape suivante est `faites + 1`. */
  faites: number;
  /** Étoiles obtenues (0 à 3) pour chaque étape réussie. */
  etoiles: number[];
}

export interface Progression {
  aventure: { niveau: number; record: number; etoiles: number };
  evenements: Record<string, ProgressionEvenement>;
}

export const PROGRESSION_VIDE: Progression = {
  aventure: { niveau: 1, record: 1, etoiles: 0 },
  evenements: {},
};

const CLE = 'boxtery:progression';

/** 3 étoiles en 1 ou 2 essais, 2 étoiles en 3 ou 4, sinon 1. */
export function etoilesPour(nbPropositions: number): number {
  return nbPropositions <= 2 ? 3 : nbPropositions <= 4 ? 2 : 1;
}

export function evenementDe(prog: Progression, id: string): ProgressionEvenement {
  return prog.evenements[id] ?? { faites: 0, etoiles: [] };
}

/** Remet en forme une progression lue sur le téléphone : une valeur abîmée ne doit pas bloquer le jeu. */
function valider(brut: Partial<Progression> | null): Progression {
  const a = brut?.aventure;
  const niveau = Number.isFinite(a?.niveau) && (a?.niveau as number) >= 1 ? Math.floor(a!.niveau) : 1;
  const record = Number.isFinite(a?.record) && (a?.record as number) >= niveau ? Math.floor(a!.record) : niveau;
  const etoiles = Number.isFinite(a?.etoiles) && (a?.etoiles as number) >= 0 ? Math.floor(a!.etoiles) : 0;
  const evenements: Record<string, ProgressionEvenement> = {};
  for (const ev of EVENEMENTS) {
    const e = brut?.evenements?.[ev.id];
    const faites = Number.isFinite(e?.faites) ? Math.max(0, Math.min(NB_ETAPES, Math.floor(e!.faites))) : 0;
    const liste = Array.isArray(e?.etoiles) ? e!.etoiles.slice(0, faites) : [];
    while (liste.length < faites) liste.push(1);
    evenements[ev.id] = { faites, etoiles: liste.map((x) => (x >= 1 && x <= 3 ? Math.floor(x) : 1)) };
  }
  return { aventure: { niveau, record, etoiles }, evenements };
}

export async function chargerProgression(): Promise<Progression> {
  try {
    const texte = await AsyncStorage.getItem(CLE);
    return valider(texte ? (JSON.parse(texte) as Partial<Progression>) : null);
  } catch {
    return PROGRESSION_VIDE;
  }
}

export async function sauverProgression(prog: Progression): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(prog));
  } catch {
    // Le jeu reste jouable même si l'enregistrement échoue.
  }
}

/** Niveau d'aventure réussi : on passe au suivant. */
export function niveauReussi(prog: Progression, nbPropositions: number): Progression {
  const niveau = prog.aventure.niveau + 1;
  return {
    ...prog,
    aventure: {
      niveau,
      record: Math.max(prog.aventure.record, niveau),
      etoiles: prog.aventure.etoiles + etoilesPour(nbPropositions),
    },
  };
}

/** Étape d'événement réussie (seule l'étape en cours fait avancer la progression). */
export function etapeReussie(prog: Progression, id: string, etape: number, nbPropositions: number): Progression {
  const actuel = evenementDe(prog, id);
  if (etape !== actuel.faites + 1 || etape > NB_ETAPES) return prog;
  return {
    ...prog,
    evenements: {
      ...prog.evenements,
      [id]: { faites: etape, etoiles: [...actuel.etoiles, etoilesPour(nbPropositions)] },
    },
  };
}
