import { NOUVELLES } from '../data/enigmes';
import { Mystere, MYSTERES } from '../data/mysteres';
import { filtrerPublic } from './public';
import type { TrancheAge } from './preferences';

export const MAX_ESSAIS = 6;

/** Entrée enregistrée quand le joueur demande l'indice suivant sans proposer de réponse (compte comme un essai). */
export const PASSE = '__passe__';

/** Minuscules, sans accents ni ponctuation, sans articles : « Le Mont-Saint-Michel » → « mont saint michel ». */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(le|la|les|l|de|du|des|d|un|une|the|a|an)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estCorrect(mystere: Mystere, proposition: string): boolean {
  if (proposition === PASSE) return false;
  const p = normaliser(proposition);
  if (!p) return false;
  return [mystere.reponse, ...mystere.alias].some((a) => memeReponse(normaliser(a), p));
}

/** Distance d'édition (Levenshtein avec inversion de lettres) entre deux chaînes. */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  const m: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    m[i] = [i];
    for (let j = 1; j <= b.length; j++) {
      if (i === 0) {
        m[i][j] = j;
        continue;
      }
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      // lettres inversées (« tiger » pour « tigre ») : une seule faute
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        m[i][j] = Math.min(m[i][j], m[i - 2][j - 2] + 1);
      }
    }
  }
  return m[a.length][b.length];
}

/**
 * Accepte une faute de frappe ou d'orthographe sur une réponse assez longue :
 * 0 faute jusqu'à 4 lettres, 1 faute de 5 à 8 lettres, 2 fautes au-delà de 8.
 * Les réponses avec des chiffres (dates, nombres) restent exactes.
 */
function memeReponse(attendu: string, propose: string): boolean {
  if (attendu === propose) return true;
  if (/[0-9]/.test(attendu) || /[0-9]/.test(propose)) return false;
  const n = attendu.replace(/ /g, '').length;
  const tolerance = n <= 4 ? 0 : n <= 8 ? 1 : 2;
  if (tolerance === 0) return false;
  return distance(attendu, propose) <= tolerance;
}

/** Clé de jour locale, au format AAAA-MM-JJ. */
export function cleDuJour(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${j}`;
}

function parseCle(cle: string): [number, number, number] {
  const [a, m, j] = cle.split('-').map(Number);
  return [a, m, j];
}

export function jourPrecedent(cle: string): string {
  const [a, m, j] = parseCle(cle);
  return cleDuJour(new Date(a, m - 1, j - 1));
}

const DEPART = Date.UTC(2026, 9, 1);

/** Numéro du mystère du jour (1 le 1er octobre 2026). */
export function numeroDuJour(cle: string): number {
  const [a, m, j] = parseCle(cle);
  return Math.floor((Date.UTC(a, m - 1, j) - DEPART) / 86400000) + 1;
}

/** Mélange reproductible : le même numéro de « tour » donne toujours le même ordre. */
function melanger<T>(liste: T[], tour: number): T[] {
  let a = (tour * 2654435761 + 12345) >>> 0;
  const alea = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Mystère du jour : un par jour, choisi parmi les énigmes de la tranche d'âge, sans répétition avant d'avoir fait le tour. */
export function mystereDuJour(cle: string, age: TrancheAge = 'tous'): Mystere {
  const pool = filtrerPublic([...MYSTERES, ...NOUVELLES], age);
  const n = pool.length;
  const rang = Math.max(0, numeroDuJour(cle) - 1);
  return melanger(pool, Math.floor(rang / n))[rang % n];
}
