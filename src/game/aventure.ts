import { EVENEMENTS, NB_ETAPES } from '../data/evenements';
import { MYSTERES, Mystere } from '../data/mysteres';

/** Tous les mystères disponibles : la base du jeu et ceux des événements. */
const POOL: Mystere[] = (() => {
  const vus = new Set<string>();
  return [...MYSTERES, ...EVENEMENTS.flatMap((e) => e.etapes)].filter((m) => !vus.has(m.id) && vus.add(m.id));
})();

export const TAILLE_POOL = POOL.length;

/** Petit générateur pseudo-aléatoire : le même numéro donne toujours le même mélange. */
function graine(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ordre de passage des mystères pour un « tour » complet de la liste. */
function ordre(tour: number): Mystere[] {
  const alea = graine(tour * 7919 + 17);
  const liste = [...POOL];
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  if (tour > 0) {
    // Évite de retrouver tout de suite le dernier mystère du tour précédent.
    const dernier = ordre(tour - 1)[liste.length - 1];
    if (liste[0].id === dernier.id) [liste[0], liste[1]] = [liste[1], liste[0]];
  }
  return liste;
}

const cache = new Map<number, Mystere[]>();
function ordreCache(tour: number): Mystere[] {
  let o = cache.get(tour);
  if (!o) {
    o = ordre(tour);
    cache.set(tour, o);
  }
  return o;
}

/**
 * Mystère d'un niveau d'aventure. `reessai` change de mystère après un échec,
 * sans jamais retomber sur celui qu'on vient de rater.
 */
export function mystereAventure(niveau: number, reessai = 0): Mystere {
  const rang = niveau - 1;
  const tour = Math.floor(rang / TAILLE_POOL);
  const position = (rang % TAILLE_POOL + reessai) % TAILLE_POOL;
  return ordreCache(tour)[position];
}

/** Nombre d'essais autorisés : de plus en plus serré à mesure qu'on avance. */
export function essaisAventure(niveau: number): number {
  if (niveau <= 10) return 6;
  if (niveau <= 30) return 5;
  return 4;
}

/** Nom du palier, pour donner une impression de progression. */
export function palierAventure(niveau: number): string {
  if (niveau <= 10) return 'Apprenti';
  if (niveau <= 30) return 'Curieux';
  if (niveau <= 60) return 'Érudit';
  if (niveau <= 100) return 'Maître';
  return 'Légende';
}

/** La dernière étape d'un événement est une finale plus serrée. */
export function essaisEtape(etape: number): number {
  return etape === NB_ETAPES ? 5 : 6;
}
