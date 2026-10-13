import { numeroDuJour } from './engine';
import type { Stats } from './storage';

const VICTOIRES_MIN = 5;
const DEMANDES_MAX = 3;
const JOURS_ENTRE_DEMANDES = 30;

/** Faut-il proposer de noter l'appli ? Après une victoire, une fois le joueur conquis, et pas trop souvent. */
export function doitDemanderAvis(stats: Stats, cle: string): boolean {
  if (stats.victoires < VICTOIRES_MIN || stats.avisDemandes >= DEMANDES_MAX) return false;
  if (!stats.dernierAvis) return true;
  return numeroDuJour(cle) - numeroDuJour(stats.dernierAvis) >= JOURS_ENTRE_DEMANDES;
}
