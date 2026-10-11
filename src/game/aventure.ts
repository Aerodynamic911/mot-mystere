import { ImageSourcePropType } from 'react-native';
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

const TITRES = ['Apprenti', 'Curieux', 'Explorateur', 'Détective', 'Érudit', 'Maître', 'Sage', 'Légende'];

/** Titre du joueur : il change tous les 30 niveaux (au-delà de « Légende » : « Légende 2 », « Légende 3 »…). */
export function titreJoueur(niveau: number): string {
  const rang = Math.floor((Math.max(1, niveau) - 1) / 30);
  return rang < TITRES.length ? TITRES[rang] : `Légende ${rang - TITRES.length + 2}`;
}

export interface Decor {
  nom: string;
  /** Couleur de repli, affichée si l'image du décor tarde à charger. */
  parchemin: string;
  /** Couleur de l'encre (chemin, textes sur la carte). */
  encre: string;
  /** Image de fond de la carte (portrait, ratio 3:4). */
  image: ImageSourcePropType;
  /** Fond sombre : le chemin et les pastilles passent en clair. */
  sombre: boolean;
  /** Emoji du coffre-fort final de la carte. */
  tresor: string;
}

const DECORS: Decor[] = [
  { nom: 'Forêt enchantée', parchemin: '#9CE6B8', encre: '#17492B', image: require('../../assets/aventure/decor-1.jpg'), sombre: false, tresor: '🧰' },
  { nom: 'Désert doré', parchemin: '#FBE7A0', encre: '#6B3F0C', image: require('../../assets/aventure/decor-2.jpg'), sombre: false, tresor: '🏺' },
  { nom: 'Montagnes gelées', parchemin: '#DCF3F8', encre: '#17476B', image: require('../../assets/aventure/decor-3.jpg'), sombre: false, tresor: '💎' },
  { nom: 'Jungle mystérieuse', parchemin: '#B8E98A', encre: '#124A1C', image: require('../../assets/aventure/decor-4.jpg'), sombre: false, tresor: '🗿' },
  { nom: 'Îles des pirates', parchemin: '#5CF0F0', encre: '#0B4A5C', image: require('../../assets/aventure/decor-5.jpg'), sombre: false, tresor: '🪙' },
  { nom: 'Volcan en feu', parchemin: '#4A2E26', encre: '#FFE4BE', image: require('../../assets/aventure/decor-6.jpg'), sombre: true, tresor: '👑' },
  { nom: 'Cité des nuages', parchemin: '#9EDCFA', encre: '#33307A', image: require('../../assets/aventure/decor-7.jpg'), sombre: false, tresor: '🔮' },
  { nom: 'Espace infini', parchemin: '#1E1B5E', encre: '#FFF1C9', image: require('../../assets/aventure/decor-8.jpg'), sombre: true, tresor: '🛸' },
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
