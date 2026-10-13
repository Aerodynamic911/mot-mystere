import type { TrancheAge } from '../../game/preferences';
import type { Mystere } from '../mysteres';
import type { MystereEn } from '../mysteres_en';

type Six = [string, string, string, string, string, string];
/** [réponse, autres écritures acceptées, 6 indices du plus vague au plus précis, anecdote] */
export type Texte = [string, string[], Six, string];
export interface Brut {
  fr: Mystere;
  en: MystereEn;
}

/** Une énigme en français et en anglais. `publics` : tranches d'âge visées (absent = tout le monde). */
export function e(id: string, categorieFr: string, categorieEn: string, fr: Texte, en: Texte, publics?: TrancheAge[]): Brut {
  return {
    fr: { id, categorie: categorieFr, reponse: fr[0], alias: fr[1], indices: fr[2], anecdote: fr[3], publics },
    en: { c: categorieEn, r: en[0], a: en[1], i: en[2], n: en[3] },
  };
}
