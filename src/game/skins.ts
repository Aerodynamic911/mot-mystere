import { tr } from '../i18n';

/**
 * Les skins de la mascotte (version 1.2).
 * - « base » : le skin de départ ;
 * - « boutique » : s'achète avec des pièces ;
 * - « evenement » : s'obtient en terminant un événement (non vendu).
 * Les costumes évoquent des personnages historiques ou des métiers, sans reprendre de personnage protégé.
 */
export type OrigineSkin = 'base' | 'boutique' | 'evenement';

export interface Skin {
  id: string;
  emoji: string;
  nomFr: string;
  nomEn: string;
  origine: OrigineSkin;
  /** Prix en pièces (0 si non vendu). */
  prix: number;
  /** Pour un skin d'événement : l'identifiant de l'événement qui l'offre. */
  evenement?: string;
}

/** Une semaine de jeu rapporte environ 300 pièces : un costume en coûte 7 jours, une simple couleur 4 à 5. */
export const PRIX_COSTUME = 300;
export const PRIX_COULEUR = 200;

export const SKIN_PAR_DEFAUT = 'classique';

export const SKINS: Skin[] = [
  { id: 'classique', emoji: '📦', nomFr: 'Classique', nomEn: 'Classic', origine: 'base', prix: 0 },
  { id: 'menthe', emoji: '🍃', nomFr: 'Menthe', nomEn: 'Mint', origine: 'boutique', prix: PRIX_COULEUR },
  { id: 'ocean', emoji: '🌊', nomFr: 'Océan', nomEn: 'Ocean', origine: 'boutique', prix: PRIX_COULEUR },
  { id: 'rose', emoji: '🌸', nomFr: 'Bonbon', nomEn: 'Candy', origine: 'boutique', prix: PRIX_COULEUR },
  { id: 'cleopatre', emoji: '👑', nomFr: 'Reine du Nil', nomEn: 'Queen of the Nile', origine: 'boutique', prix: PRIX_COSTUME },
  { id: 'roi-soleil', emoji: '☀️', nomFr: 'Roi-Soleil', nomEn: 'Sun King', origine: 'boutique', prix: PRIX_COSTUME },
  { id: 'savant', emoji: '🔬', nomFr: 'Savant fou', nomEn: 'Mad scientist', origine: 'boutique', prix: PRIX_COSTUME },
  { id: 'compositeur', emoji: '🎼', nomFr: 'Compositeur', nomEn: 'Composer', origine: 'boutique', prix: PRIX_COSTUME },
  { id: 'astronaute', emoji: '🚀', nomFr: 'Astronaute', nomEn: 'Astronaut', origine: 'boutique', prix: PRIX_COSTUME },
  { id: 'pirate', emoji: '🏴‍☠️', nomFr: 'Pirate', nomEn: 'Pirate', origine: 'boutique', prix: PRIX_COSTUME },
  { id: 'explorateur', emoji: '🧭', nomFr: 'Explorateur', nomEn: 'Explorer', origine: 'evenement', prix: 0, evenement: 'merveilles' },
  { id: 'empereur', emoji: '⚔️', nomFr: 'Empereur', nomEn: 'Emperor', origine: 'evenement', prix: 0, evenement: 'histoire' },
];

export function skinParId(id: string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

export function nomSkin(s: Skin): string {
  return tr(s.nomFr, s.nomEn);
}

/** Le skin offert quand on termine cet événement (undefined s'il n'y en a pas). */
export function skinDEvenement(idEvenement: string): Skin | undefined {
  return SKINS.find((s) => s.evenement === idEvenement);
}

/** Couleurs du corps et du couvercle de la mascotte. */
export interface Palette {
  c0: string;
  c1: string;
  c2: string;
  dos: string;
  bord: string;
  ombre: string;
  bras: string;
  brasBord: string;
  l0: string;
  l1: string;
  l2: string;
}

const CLASSIQUE: Palette = {
  c0: '#FFE08A',
  c1: '#FBBC3E',
  c2: '#E8941C',
  dos: '#9C5A08',
  bord: '#B97410',
  ombre: '#9A5200',
  bras: '#F5B03A',
  brasBord: '#A8620A',
  l0: '#B49CFF',
  l1: '#7A58F0',
  l2: '#4B2FB8',
};

const PALETTES: Record<string, Partial<Palette>> = {
  menthe: { c0: '#C4F7DC', c1: '#4BE0A0', c2: '#1F9D6B', dos: '#0F6B45', bord: '#138A5C', ombre: '#0A5A38', bras: '#3DD493', brasBord: '#0F7A50' },
  ocean: { c0: '#BFE3FF', c1: '#52A3FF', c2: '#2763C9', dos: '#173F86', bord: '#1D4FA8', ombre: '#102C63', bras: '#4A98F5', brasBord: '#1B4D9E' },
  rose: { c0: '#FFD3EA', c1: '#FF78BE', c2: '#D13A86', dos: '#8C1F5A', bord: '#B02D72', ombre: '#7A1450', bras: '#F763AE', brasBord: '#A02468' },
  astronaute: { c0: '#FFFFFF', c1: '#E8EDF7', c2: '#B8C2D9', dos: '#6F7A96', bord: '#8D98B3', ombre: '#4E5873', bras: '#DDE3F0', brasBord: '#8D98B3', l0: '#9FB4FF', l1: '#5C78E0', l2: '#2E3F9E' },
  pirate: { l0: '#555B73', l1: '#2E3347', l2: '#171A28' },
  empereur: { l0: '#5C7CFF', l1: '#2F4FD0', l2: '#17288A' },
};

export function paletteDe(skin: string): Palette {
  return { ...CLASSIQUE, ...(PALETTES[skin] ?? {}) };
}
