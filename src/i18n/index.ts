import { Mystere } from '../data/mysteres';
import { EN_NOUVELLES } from '../data/enigmes';
import { MYSTERES_EN } from '../data/mysteres_en';
import { EN_IMAGES } from '../data/images';

export type Langue = 'fr' | 'en';

let courante: Langue = 'fr';

/** Langue de l'appareil (français si c'est la langue du téléphone, anglais sinon). */
export function langueAppareil(): Langue {
  try {
    const l = Intl.DateTimeFormat().resolvedOptions().locale ?? 'fr';
    return l.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'fr';
  }
}

export function definirLangue(l: Langue) {
  courante = l;
}

export function langue(): Langue {
  return courante;
}

/** Choisit le texte dans la langue active : `tr('Bonjour', 'Hello')`. Remplace aussi `{nom}` par les valeurs données. */
export function tr(fr: string, en: string, vars?: Record<string, string | number>): string {
  let texte = courante === 'en' ? en : fr;
  if (vars) for (const k of Object.keys(vars)) texte = texte.split(`{${k}}`).join(String(vars[k]));
  return texte;
}

/** Locale pour les dates et les nombres. */
export function localeActive(): string {
  return courante === 'en' ? 'en-GB' : 'fr-FR';
}

/** Mystère dans la langue active. En anglais, les réponses françaises restent acceptées. */
export function localiser(m: Mystere): Mystere {
  if (courante !== 'en') return m;
  const en = MYSTERES_EN[m.id] ?? EN_NOUVELLES[m.id] ?? EN_IMAGES[m.id];
  if (!en) return m;
  return {
    id: m.id,
    categorie: en.c,
    reponse: en.r,
    alias: [...en.a, m.reponse, ...m.alias],
    indices: en.i,
    anecdote: en.n,
  };
}
