import { tr } from '../i18n';
import type { Brut } from './vf/type';
import sciences from './vf/sciences';
import monde from './vf/monde';
import culture from './vf/culture';
import divers from './vf/divers';

/** Nombre d'affirmations par série. */
export const NB_PAR_SERIE = 10;

export interface Affirmation {
  id: string;
  categorie: string;
  vrai: boolean;
  texte: string;
  explication: string;
}

// Les affirmations ne sont jamais réordonnées : l'indice dans la liste sert d'identifiant.
const BRUTES: Brut[] = [...sciences, ...monde, ...culture, ...divers];

export const NB_AFFIRMATIONS = BRUTES.length;

function versAffirmation(b: Brut, i: number): Affirmation {
  return { id: `vf-${i}`, categorie: tr(b[0], b[1]), vrai: b[2], texte: tr(b[3], b[5]), explication: tr(b[4], b[6]) };
}

function melanger<T>(liste: T[]): T[] {
  const c = [...liste];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/** Affirmations vues récemment (pendant cette session) : on évite de les reproposer tout de suite. */
let recentes: number[] = [];

/** Une série de 10 affirmations, avec autant de vrai que de faux à une près, sans reprendre celles vues récemment. */
export function tirerSerie(): Affirmation[] {
  const indices = BRUTES.map((_, i) => i);
  const libres = indices.filter((i) => !recentes.includes(i));
  const pool = libres.length >= NB_PAR_SERIE * 3 ? libres : indices;
  const vrais = melanger(pool.filter((i) => BRUTES[i][2]));
  const faux = melanger(pool.filter((i) => !BRUTES[i][2]));
  const nbVrais = 4 + Math.floor(Math.random() * 3); // 4 à 6 vraies
  const choisis = [...vrais.slice(0, nbVrais), ...faux.slice(0, NB_PAR_SERIE - nbVrais)];
  // S'il manque de l'un ou de l'autre, on complète avec ce qui reste.
  if (choisis.length < NB_PAR_SERIE) {
    const reste = melanger(pool.filter((i) => !choisis.includes(i)));
    choisis.push(...reste.slice(0, NB_PAR_SERIE - choisis.length));
  }
  recentes = [...recentes, ...choisis].slice(-Math.max(0, BRUTES.length - NB_PAR_SERIE * 4));
  return melanger(choisis).map((i) => versAffirmation(BRUTES[i], i));
}
