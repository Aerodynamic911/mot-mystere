import { ImageSourcePropType } from 'react-native';
import { EVENEMENTS, NB_ETAPES } from '../data/evenements';
import { NOUVELLES } from '../data/enigmes';
import { MYSTERES, Mystere } from '../data/mysteres';
import type { TrancheAge } from './preferences';
import { filtrerPublic } from './public';
import { tr } from '../i18n';

/** Tous les mystères disponibles : la base du jeu, les nouvelles énigmes et celles des événements. */
const POOL: Mystere[] = (() => {
  const vus = new Set<string>();
  return [...MYSTERES, ...NOUVELLES, ...EVENEMENTS.flatMap((e) => e.etapes)].filter((m) => !vus.has(m.id) && vus.add(m.id));
})();

export const TAILLE_POOL = POOL.length;

const poolsParAge = new Map<TrancheAge, Mystere[]>();
/** Énigmes de l'aventure pour une tranche d'âge. */
export function poolPour(age: TrancheAge): Mystere[] {
  let p = poolsParAge.get(age);
  if (!p) {
    p = filtrerPublic(POOL, age);
    poolsParAge.set(age, p);
  }
  return p;
}

const INDICE_AGE: Record<TrancheAge, number> = { tous: 0, ado: 1, a18: 2, a30: 3, a50: 4 };

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
function ordre(tour: number, age: TrancheAge): Mystere[] {
  const alea = graine(tour * 7919 + 17 + INDICE_AGE[age] * 104729);
  const liste = [...poolPour(age)];
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  if (tour > 0) {
    // Évite de retrouver tout de suite le dernier mystère du tour précédent.
    const dernier = ordreCache(tour - 1, age)[liste.length - 1];
    if (liste[0].id === dernier.id) [liste[0], liste[1]] = [liste[1], liste[0]];
  }
  return liste;
}

const cache = new Map<string, Mystere[]>();
function ordreCache(tour: number, age: TrancheAge): Mystere[] {
  const cle = `${age}-${tour}`;
  let o = cache.get(cle);
  if (!o) {
    o = ordre(tour, age);
    cache.set(cle, o);
  }
  return o;
}

/**
 * Mystère d'un niveau d'aventure. `reessai` change de mystère après un échec,
 * sans jamais retomber sur celui qu'on vient de rater.
 */
export function mystereAventure(niveau: number, reessai = 0, age: TrancheAge = 'tous'): Mystere {
  const taille = poolPour(age).length;
  const rang = niveau - 1;
  const tour = Math.floor(rang / taille);
  const position = ((rang % taille) + reessai) % taille;
  return ordreCache(tour, age)[position];
}

/** Retrouve un mystère de la liste par son identifiant (pour reprendre un niveau en cours). */
export function mystereParId(id: string): Mystere | null {
  return POOL.find((m) => m.id === id) ?? null;
}

/** Combien d'identifiants on garde en mémoire. */
export const NB_VUS_GARDES = 40;

/**
 * Choisit le mystère d'un niveau en évitant ceux qu'on vient de voir (y compris celui qu'on vient de rater) :
 * un réessai ne ressort pas au niveau suivant. Sans effet de bord : l'appelant mémorise le choix.
 */
export function choisirMystereAventure(niveau: number, vus: string[], age: TrancheAge = 'tous'): Mystere {
  const taille = poolPour(age).length;
  const evites = new Set(vus.slice(-Math.max(0, Math.min(20, taille - 8))));
  for (let k = 0; k < taille; k++) {
    const m = mystereAventure(niveau, k, age);
    if (!evites.has(m.id)) return m;
  }
  return mystereAventure(niveau, 0, age);
}

/** Nombre d'essais autorisés : de plus en plus serré à mesure qu'on avance. */
export function essaisAventure(niveau: number): number {
  if (niveau <= 10) return 6;
  if (niveau <= 30) return 5;
  return 4;
}

const TITRES_FR = ['Apprenti', 'Curieux', 'Explorateur', 'Détective', 'Érudit', 'Maître', 'Sage', 'Légende'];
const TITRES_EN = ['Apprentice', 'Curious One', 'Explorer', 'Detective', 'Scholar', 'Master', 'Sage', 'Legend'];

/** Titre du joueur : il change tous les 30 niveaux (au-delà de « Légende » : « Légende 2 », « Légende 3 »…). */
export function titreJoueur(niveau: number): string {
  const rang = Math.floor((Math.max(1, niveau) - 1) / 30);
  return rang < TITRES_FR.length ? tr(TITRES_FR[rang], TITRES_EN[rang]) : `${tr('Légende', 'Legend')} ${rang - TITRES_FR.length + 2}`;
}

export interface Decor {
  nom: string;
  /** Couleur de repli, affichée si l'image du décor tarde à charger. */
  parchemin: string;
  /** Couleur de l'encre (textes et bordures sur la carte). */
  encre: string;
  /** Couleur du trait pointillé du chemin, accordée au décor. */
  trait: string;
  /** Halo sombre ou clair derrière le trait, pour qu'il reste lisible. */
  halo: string;
  /** Nom du trésor de fin de carte (pour la carte à collectionner). */
  tresorNom: string;
  /** Image de fond de la carte (portrait, ratio 3:4). */
  image: ImageSourcePropType;
  /** Fond sombre : le chemin et les pastilles passent en clair. */
  sombre: boolean;
  /** Emoji du coffre-fort final de la carte. */
  tresor: string;
}

const DECORS: Decor[] = [
  { get nom() { return tr('Forêt enchantée', 'Enchanted Forest'); }, trait: '#FFF4C2', halo: 'rgba(10,70,35,0.6)', get tresorNom() { return tr('Coffre des fées', 'Fairy Chest'); }, parchemin: '#9CE6B8', encre: '#17492B', image: require('../../assets/aventure/decor-1.jpg'), sombre: false, tresor: '🧰' },
  { get nom() { return tr('Désert doré', 'Golden Desert'); }, trait: '#A6431A', halo: 'rgba(255,255,255,0.7)', get tresorNom() { return tr('Amphore dorée', 'Golden Amphora'); }, parchemin: '#FBE7A0', encre: '#6B3F0C', image: require('../../assets/aventure/decor-2.jpg'), sombre: false, tresor: '🏺' },
  { get nom() { return tr('Montagnes gelées', 'Frozen Mountains'); }, trait: '#1D6FA5', halo: 'rgba(255,255,255,0.8)', get tresorNom() { return tr('Cristal de glace', 'Ice Crystal'); }, parchemin: '#DCF3F8', encre: '#17476B', image: require('../../assets/aventure/decor-3.jpg'), sombre: false, tresor: '💎' },
  { get nom() { return tr('Jungle mystérieuse', 'Mysterious Jungle'); }, trait: '#FFEB99', halo: 'rgba(10,70,25,0.6)', get tresorNom() { return tr('Idole perdue', 'Lost Idol'); }, parchemin: '#B8E98A', encre: '#124A1C', image: require('../../assets/aventure/decor-4.jpg'), sombre: false, tresor: '🗿' },
  { get nom() { return tr('Îles des pirates', 'Pirate Islands'); }, trait: '#FFF6D6', halo: 'rgba(0,70,95,0.55)', get tresorNom() { return tr('Doublon pirate', 'Pirate Doubloon'); }, parchemin: '#5CF0F0', encre: '#0B4A5C', image: require('../../assets/aventure/decor-5.jpg'), sombre: false, tresor: '🪙' },
  { get nom() { return tr('Volcan en feu', 'Blazing Volcano'); }, trait: '#FFB347', halo: 'rgba(0,0,0,0.55)', get tresorNom() { return tr('Couronne de lave', 'Lava Crown'); }, parchemin: '#4A2E26', encre: '#FFE4BE', image: require('../../assets/aventure/decor-6.jpg'), sombre: true, tresor: '👑' },
  { get nom() { return tr('Cité des nuages', 'Cloud City'); }, trait: '#FFFFFF', halo: 'rgba(70,60,160,0.5)', get tresorNom() { return tr('Orbe céleste', 'Celestial Orb'); }, parchemin: '#9EDCFA', encre: '#33307A', image: require('../../assets/aventure/decor-7.jpg'), sombre: false, tresor: '🔮' },
  { get nom() { return tr('Espace infini', 'Infinite Space'); }, trait: '#7FE8FF', halo: 'rgba(0,0,40,0.6)', get tresorNom() { return tr('Soucoupe stellaire', 'Star Saucer'); }, parchemin: '#1E1B5E', encre: '#FFF1C9', image: require('../../assets/aventure/decor-8.jpg'), sombre: true, tresor: '🛸' },
];

/** Nombre de décors différents. */
export const NB_DECORS = DECORS.length;

/** Décor par rang (revient au début après le dernier) : sert à l'aperçu des décors. */
export function decorParRang(rang: number): Decor {
  return DECORS[((rang % DECORS.length) + DECORS.length) % DECORS.length];
}

/** Décor de la carte : il change tous les 10 niveaux. */
export function decorAventure(niveau: number): Decor {
  const dizaine = Math.floor((Math.max(1, niveau) - 1) / 10);
  return DECORS[dizaine % DECORS.length];
}

/** La dernière étape d'un événement est une finale plus serrée. */
export function essaisEtape(etape: number): number {
  return etape === NB_ETAPES ? 5 : 6;
}
