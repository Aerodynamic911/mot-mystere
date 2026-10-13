import type { Mystere } from '../mysteres';
import type { MystereEn } from '../mysteres_en';
import type { Brut } from './outil';
import tous1 from './tous1';
import tous2 from './tous2';
import tous3 from './tous3';
import tous4 from './tous4';
import ado from './ado';
import a18 from './a18';
import a30 from './a30';
import a50 from './a50';

const TOUTES: Brut[] = [...tous1, ...tous2, ...tous3, ...tous4, ...ado, ...a18, ...a30, ...a50];

/** Les 148 énigmes ajoutées (en français). */
export const NOUVELLES: Mystere[] = TOUTES.map((b) => b.fr);
/** Leurs traductions anglaises, par identifiant. */
export const EN_NOUVELLES: Record<string, MystereEn> = Object.fromEntries(TOUTES.map((b) => [b.fr.id, b.en]));
