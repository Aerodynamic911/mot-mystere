import { Mystere, MYSTERES } from '../data/mysteres';

export const MAX_ESSAIS = 6;

/** Minuscules, sans accents ni ponctuation, sans articles : « Le Mont-Saint-Michel » → « mont saint michel ». */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(le|la|les|l|de|du|des|d|un|une)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estCorrect(mystere: Mystere, proposition: string): boolean {
  const p = normaliser(proposition);
  if (!p) return false;
  return [mystere.reponse, ...mystere.alias].some((a) => normaliser(a) === p);
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

export function mystereDuJour(cle: string): Mystere {
  const n = MYSTERES.length;
  const i = (((numeroDuJour(cle) - 1) % n) + n) % n;
  return MYSTERES[i];
}

export function mystereAleatoire(exclure?: string): Mystere {
  const choix = MYSTERES.filter((m) => m.id !== exclure);
  return choix[Math.floor(Math.random() * choix.length)];
}
