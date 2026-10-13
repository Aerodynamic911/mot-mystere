import { PARTAGES_PAR_JOKER } from '../config';
import type { Mystere } from '../data/mysteres';
import type { Bonus } from './bonus';
import type { Stats } from './storage';

/**
 * Un partage compte au plus une fois par jour (pour éviter le spam) ;
 * tous les PARTAGES_PAR_JOKER partages comptés, on gagne un joker.
 */
export function enregistrerPartage(stats: Stats, cle: string): { stats: Stats; bonus: Bonus | null } {
  if (stats.dernierPartage === cle) return { stats, bonus: null };
  const partages = stats.partages + 1;
  const s: Stats = { ...stats, partages, dernierPartage: cle };
  if (partages % PARTAGES_PAR_JOKER !== 0) return { stats: s, bonus: null };
  s.jokers += 1;
  return { stats: s, bonus: { origine: 'partages', serie: partages, jokers: 1 } };
}

/** Un défi d'ami gagné rapporte un joker, au plus une fois par jour. */
export function enregistrerDefiGagne(stats: Stats, cle: string): { stats: Stats; bonus: Bonus | null } {
  if (stats.dernierDefiJoker === cle) return { stats, bonus: null };
  return {
    stats: { ...stats, jokers: stats.jokers + 1, dernierDefiJoker: cle },
    bonus: { origine: 'defi', serie: stats.modes.defi.victoires + 1, jokers: 1 },
  };
}

/** Empreinte stable d'un identifiant (FNV-1a), sur 5 caractères en base 36. */
function empreinte(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h % 36 ** 5).toString(36).toUpperCase().padStart(5, '0');
}

/** Code de défi : 5 caractères pour le mystère + 1 chiffre pour les essais de l'ami (0 = pas trouvé). Ex. « K3F-9Q2 ». */
export function genererCode(idMystere: string, essais: number): string {
  const c = empreinte(idMystere) + String(Math.max(0, Math.min(9, essais)));
  return `${c.slice(0, 3)}-${c.slice(3)}`;
}

/** Retrouve le mystère et le score de l'ami à partir d'un code ; `null` si le code est invalide. */
export function lireCode(code: string, mysteres: Mystere[]): { mystere: Mystere; essaisAmi: number } | null {
  const c = code.toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (c.length !== 6 || !/[0-9]/.test(c[5])) return null;
  const mystere = mysteres.find((m) => empreinte(m.id) === c.slice(0, 5));
  return mystere ? { mystere, essaisAmi: Number(c[5]) } : null;
}
