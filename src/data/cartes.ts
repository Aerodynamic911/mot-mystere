import { decorParRang } from '../game/aventure';
import { EVENEMENTS, Evenement } from './evenements';

export type Rarete = 'commune' | 'rare' | 'epique' | 'legendaire';
export type OrigineCarte = 'aventure' | 'evenement' | 'jour';

export interface Carte {
  id: string;
  origine: OrigineCarte;
  titre: string;
  sousTitre: string;
  emoji: string;
  /** Couleur dominante de la carte. */
  couleur: string;
  /** Couleur du fond de la carte. */
  fond: string;
  rarete: Rarete;
  /** Comment on l'a obtenue (affiché quand on agrandit la carte). */
  obtention: string;
}

export const RARETES: Record<Rarete, { libelle: string; couleur: string }> = {
  commune: { libelle: 'Commune', couleur: '#9AA0C0' },
  rare: { libelle: 'Rare', couleur: '#4DA3FF' },
  epique: { libelle: 'Épique', couleur: '#B07CFF' },
  legendaire: { libelle: 'Légendaire', couleur: '#F5B942' },
};

/** Une carte d'aventure tous les 10 niveaux : la n-ième carte récompense le niveau 10 × n. Le décor suit celui de la carte. */
export const NIVEAUX_PAR_CARTE_AVENTURE = 10;
/** Une carte du jour tous les 50 mystères du jour résolus. */
export const MYSTERES_PAR_CARTE_JOUR = 50;

export function carteAventure(n: number): Carte {
  const decor = decorParRang(n - 1);
  const cycle = Math.floor((n - 1) / 8);
  const rarete: Rarete = cycle === 0 ? 'commune' : cycle === 1 ? 'rare' : cycle === 2 ? 'epique' : 'legendaire';
  return {
    id: `av-${n}`,
    origine: 'aventure',
    titre: decor.tresorNom,
    sousTitre: `${decor.nom} · niveau ${n * NIVEAUX_PAR_CARTE_AVENTURE}`,
    emoji: decor.tresor,
    couleur: decor.sombre ? decor.trait : decor.encre,
    fond: decor.parchemin,
    rarete,
    obtention: `Obtenue en réussissant le niveau ${n * NIVEAUX_PAR_CARTE_AVENTURE} de l'aventure.`,
  };
}

export function carteEvenement(e: Evenement): Carte {
  return {
    id: `ev-${e.id}`,
    origine: 'evenement',
    titre: e.titre,
    sousTitre: 'Événement terminé',
    emoji: e.emoji,
    couleur: e.couleur,
    fond: '#1A1F3A',
    rarete: 'epique',
    obtention: `Obtenue en terminant les 20 étapes de l'événement « ${e.titre} ».`,
  };
}

const TITRES_JOUR = ['Éclaireur', 'Gardien du temps', 'Maître des énigmes', 'Oracle', 'Grand sage', 'Légende vivante'];
const EMOJIS_JOUR = ['🌅', '⏳', '🧩', '🔮', '📜', '👑'];

export function carteJour(k: number): Carte {
  const i = (k - 1) % TITRES_JOUR.length;
  const cycle = Math.floor((k - 1) / TITRES_JOUR.length);
  return {
    id: `jr-${k}`,
    origine: 'jour',
    titre: cycle ? `${TITRES_JOUR[i]} ${cycle + 1}` : TITRES_JOUR[i],
    sousTitre: `${k * MYSTERES_PAR_CARTE_JOUR} mystères du jour`,
    emoji: EMOJIS_JOUR[i],
    couleur: '#F5B942',
    fond: '#2A2350',
    rarete: k <= 1 ? 'rare' : k <= 3 ? 'epique' : 'legendaire',
    obtention: `Obtenue en résolvant ${k * MYSTERES_PAR_CARTE_JOUR} mystères du jour.`,
  };
}

/** Retrouve une carte à partir de son identifiant (`av-3`, `ev-merveilles`, `jr-2`). */
export function carteParId(id: string): Carte | null {
  const [type, reste] = [id.slice(0, 2), id.slice(3)];
  if (type === 'av' || type === 'jr') {
    const n = Number(reste);
    if (!Number.isInteger(n) || n < 1) return null;
    return type === 'av' ? carteAventure(n) : carteJour(n);
  }
  if (type === 'ev') {
    const e = EVENEMENTS.find((x) => x.id === reste);
    return e ? carteEvenement(e) : null;
  }
  return null;
}
