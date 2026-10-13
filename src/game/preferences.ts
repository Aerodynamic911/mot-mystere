import AsyncStorage from '@react-native-async-storage/async-storage';

import { Langue, langueAppareil } from '../i18n';

export type { Langue };
export type Difficulte = 'facile' | 'normal' | 'difficile';
export type TrancheAge = 'tous' | 'enfant' | 'ado' | 'adulte';

export interface Preferences {
  langue: Langue;
  difficulte: Difficulte;
  age: TrancheAge;
}

export const PREFERENCES_PAR_DEFAUT: Preferences = { langue: langueAppareil(), difficulte: 'normal', age: 'tous' };

/** Nombre d'indices visibles dès le début de la partie. */
export const INDICES_DE_BASE: Record<Difficulte, number> = { facile: 2, normal: 1, difficile: 1 };

const CLE = 'cluebox:preferences';

const LANGUES: Langue[] = ['fr', 'en'];
const DIFFICULTES: Difficulte[] = ['facile', 'normal', 'difficile'];
const AGES: TrancheAge[] = ['tous', 'enfant', 'ado', 'adulte'];

/** Garde uniquement les valeurs connues : une préférence abîmée ne doit jamais empêcher de jouer. */
function valider(brut: Partial<Preferences> | null): Preferences {
  const p = PREFERENCES_PAR_DEFAUT;
  return {
    langue: brut?.langue && LANGUES.includes(brut.langue) ? brut.langue : p.langue,
    difficulte: brut?.difficulte && DIFFICULTES.includes(brut.difficulte) ? brut.difficulte : p.difficulte,
    age: brut?.age && AGES.includes(brut.age) ? brut.age : p.age,
  };
}

export async function chargerPreferences(): Promise<Preferences> {
  try {
    const texte = await AsyncStorage.getItem(CLE);
    return valider(texte ? (JSON.parse(texte) as Partial<Preferences>) : null);
  } catch {
    return PREFERENCES_PAR_DEFAUT;
  }
}

export async function sauverPreferences(prefs: Preferences): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(prefs));
  } catch {
    // Le jeu reste jouable même si l'enregistrement échoue.
  }
}
