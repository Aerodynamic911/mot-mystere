import type { Mystere } from '../data/mysteres';
import type { TrancheAge } from './preferences';

/** Garde les énigmes qui conviennent à la tranche d'âge : celles pour tous, et celles ciblant cette tranche. « Tous publics » garde tout. */
export function filtrerPublic(liste: Mystere[], age: TrancheAge): Mystere[] {
  if (age === 'tous') return liste;
  return liste.filter((m) => !m.publics || m.publics.includes('tous') || m.publics.includes(age));
}
