import AsyncStorage from '@react-native-async-storage/async-storage';
import { tr } from '../i18n';
import { cleDuJour } from './engine';
import type { ModeJeu, Stats } from './storage';

/** Ce qui se passe dans le jeu et peut faire avancer une quête. */
export type EvenementQuete =
  | { type: 'partie'; mode: ModeJeu; gagne: boolean; essais: number }
  | { type: 'sprint'; trouves: number; points: number }
  | { type: 'vf'; bonnes: number; total: number }
  | { type: 'boss' }
  | { type: 'partage' };

export interface Recompense {
  pieces: number;
  jokers: number;
}

interface Modele {
  id: string;
  /** Une seule quête par famille et par jour : la variété est garantie. */
  famille: string;
  cible: number;
  recompense: Recompense;
  titre: () => string;
  /** Combien cet évènement fait avancer la quête (0 si elle n'est pas concernée). */
  compte: (e: EvenementQuete) => number;
}

export interface Quete {
  id: string;
  famille: string;
  cible: number;
  recompense: Recompense;
  titre: string;
  progres: number;
  reclamee: boolean;
  /** Terminée mais pas encore récupérée. */
  prete: boolean;
}

const gagnee = (e: EvenementQuete, mode?: ModeJeu) => (e.type === 'partie' && e.gagne && (!mode || e.mode === mode) ? 1 : 0);
const rapide = (e: EvenementQuete) => (e.type === 'partie' && e.gagne && e.essais <= 2 ? 1 : 0);

/** Les quêtes du jour : chaque modèle est un objectif, une seule quête par famille est choisie chaque jour. */
const QUOTIDIENNES: Modele[] = [
  { id: 'd-win2', famille: 'win', cible: 2, recompense: { pieces: 10, jokers: 0 }, titre: () => tr('Trouvez 2 mystères', 'Solve 2 mysteries'), compte: (e) => gagnee(e) },
  { id: 'd-win4', famille: 'win', cible: 4, recompense: { pieces: 20, jokers: 0 }, titre: () => tr('Trouvez 4 mystères', 'Solve 4 mysteries'), compte: (e) => gagnee(e) },
  { id: 'd-fast1', famille: 'fast', cible: 1, recompense: { pieces: 10, jokers: 0 }, titre: () => tr('Trouvez un mystère en 2 essais ou moins', 'Solve a mystery in 2 attempts or fewer'), compte: rapide },
  { id: 'd-fast3', famille: 'fast', cible: 3, recompense: { pieces: 25, jokers: 0 }, titre: () => tr('Trouvez 3 mystères en 2 essais ou moins', 'Solve 3 mysteries in 2 attempts or fewer'), compte: rapide },
  { id: 'd-jour', famille: 'jour', cible: 1, recompense: { pieces: 10, jokers: 0 }, titre: () => tr('Résolvez le mystère du jour', 'Solve the daily mystery'), compte: (e) => gagnee(e, 'jour') },
  { id: 'd-aventure', famille: 'aventure', cible: 2, recompense: { pieces: 15, jokers: 0 }, titre: () => tr("Réussissez 2 niveaux d'aventure", 'Clear 2 adventure levels'), compte: (e) => gagnee(e, 'aventure') },
  { id: 'd-event', famille: 'event', cible: 2, recompense: { pieces: 15, jokers: 0 }, titre: () => tr("Réussissez 2 étapes d'un événement", 'Clear 2 steps of an event'), compte: (e) => gagnee(e, 'evenement') },
  { id: 'd-sprint', famille: 'sprint', cible: 1, recompense: { pieces: 10, jokers: 0 }, titre: () => tr('Faites un Sprint', 'Play a Sprint'), compte: (e) => (e.type === 'sprint' ? 1 : 0) },
  { id: 'd-sprint6', famille: 'sprint', cible: 6, recompense: { pieces: 20, jokers: 0 }, titre: () => tr('Trouvez 6 mystères en Sprint', 'Solve 6 mysteries in Sprint'), compte: (e) => (e.type === 'sprint' ? e.trouves : 0) },
  { id: 'd-vf10', famille: 'vf', cible: 10, recompense: { pieces: 15, jokers: 0 }, titre: () => tr('Répondez juste à 10 affirmations Vrai ou faux', 'Get 10 True or false statements right'), compte: (e) => (e.type === 'vf' ? e.bonnes : 0) },
  { id: 'd-vf-parfait', famille: 'vf', cible: 1, recompense: { pieces: 25, jokers: 1 }, titre: () => tr('Faites un sans-faute au Vrai ou faux', 'Get a perfect score in True or false'), compte: (e) => (e.type === 'vf' && e.total >= 10 && e.bonnes === e.total ? 1 : 0) },
  { id: 'd-image', famille: 'image', cible: 2, recompense: { pieces: 15, jokers: 0 }, titre: () => tr('Devinez 2 images mystères', 'Guess 2 mystery pictures'), compte: (e) => gagnee(e, 'image') },
  { id: 'd-partage', famille: 'partage', cible: 1, recompense: { pieces: 10, jokers: 0 }, titre: () => tr('Partagez un résultat avec un ami', 'Share a result with a friend'), compte: (e) => (e.type === 'partage' ? 1 : 0) },
];

/** La grande quête de la semaine. */
const HEBDOMADAIRES: Modele[] = [
  { id: 'w-win15', famille: 'w', cible: 15, recompense: { pieces: 60, jokers: 1 }, titre: () => tr('Trouvez 15 mystères cette semaine', 'Solve 15 mysteries this week'), compte: (e) => gagnee(e) },
  { id: 'w-fast8', famille: 'w', cible: 8, recompense: { pieces: 60, jokers: 1 }, titre: () => tr('Trouvez 8 mystères en 2 essais ou moins', 'Solve 8 mysteries in 2 attempts or fewer'), compte: rapide },
  { id: 'w-sprint3', famille: 'w', cible: 3, recompense: { pieces: 50, jokers: 1 }, titre: () => tr('Faites 3 Sprints cette semaine', 'Play 3 Sprints this week'), compte: (e) => (e.type === 'sprint' ? 1 : 0) },
  { id: 'w-vf40', famille: 'w', cible: 40, recompense: { pieces: 50, jokers: 1 }, titre: () => tr('Répondez juste à 40 affirmations Vrai ou faux', 'Get 40 True or false statements right'), compte: (e) => (e.type === 'vf' ? e.bonnes : 0) },
  { id: 'w-jour4', famille: 'w', cible: 4, recompense: { pieces: 60, jokers: 1 }, titre: () => tr('Résolvez 4 mystères du jour cette semaine', 'Solve 4 daily mysteries this week'), compte: (e) => gagnee(e, 'jour') },
  { id: 'w-boss', famille: 'w', cible: 1, recompense: { pieces: 80, jokers: 2 }, titre: () => tr('Battez un boss', 'Defeat a boss'), compte: (e) => (e.type === 'boss' ? 1 : 0) },
];

/** Bonus quand les 3 quêtes du jour sont récupérées. */
export const BONUS_JOUR: Recompense = { pieces: 15, jokers: 1 };

export interface EtatQuetes {
  jour: { cle: string; progres: Record<string, number>; reclamees: string[]; bonus: boolean };
  semaine: { cle: string; progres: Record<string, number>; reclamee: boolean };
}

export const QUETES_VIDES: EtatQuetes = {
  jour: { cle: '', progres: {}, reclamees: [], bonus: false },
  semaine: { cle: '', progres: {}, reclamee: false },
};

/** Petit mélange reproductible à partir d'un texte. */
function graine(texte: string): () => number {
  let a = 2166136261;
  for (let i = 0; i < texte.length; i++) a = Math.imul(a ^ texte.charCodeAt(i), 16777619);
  a >>>= 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lundi de la semaine qui contient ce jour (AAAA-MM-JJ). */
export function cleDeSemaine(cle: string): string {
  const [a, m, j] = cle.split('-').map(Number);
  const d = new Date(a, m - 1, j);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return cleDuJour(d);
}

function modelesDuJour(cle: string, imagesDispo: boolean): Modele[] {
  const alea = graine(`quetes:${cle}`);
  const familles = [...new Set(QUOTIDIENNES.map((m) => m.famille))].filter((f) => imagesDispo || f !== 'image');
  // Mélange des familles, puis on garde les 3 premières.
  for (let i = familles.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [familles[i], familles[j]] = [familles[j], familles[i]];
  }
  return familles.slice(0, 3).map((f) => {
    const choix = QUOTIDIENNES.filter((m) => m.famille === f);
    return choix[Math.floor(alea() * choix.length)];
  });
}

function modeleDeLaSemaine(cle: string): Modele {
  const alea = graine(`semaine:${cleDeSemaine(cle)}`);
  return HEBDOMADAIRES[Math.floor(alea() * HEBDOMADAIRES.length)];
}

/** Remet à zéro ce qui date d'un autre jour ou d'une autre semaine. */
export function actualiser(etat: EtatQuetes, cle: string): EtatQuetes {
  const semaine = cleDeSemaine(cle);
  const jourOk = etat.jour.cle === cle;
  const semaineOk = etat.semaine.cle === semaine;
  if (jourOk && semaineOk) return etat;
  return {
    jour: jourOk ? etat.jour : { cle, progres: {}, reclamees: [], bonus: false },
    semaine: semaineOk ? etat.semaine : { cle: semaine, progres: {}, reclamee: false },
  };
}

function versQuete(m: Modele, progres: number, reclamee: boolean): Quete {
  const p = Math.min(m.cible, progres);
  return { id: m.id, famille: m.famille, cible: m.cible, recompense: m.recompense, titre: m.titre(), progres: p, reclamee, prete: p >= m.cible && !reclamee };
}

export function quetesDuJour(etat: EtatQuetes, cle: string, imagesDispo: boolean): Quete[] {
  const e = actualiser(etat, cle);
  return modelesDuJour(cle, imagesDispo).map((m) => versQuete(m, e.jour.progres[m.id] ?? 0, e.jour.reclamees.includes(m.id)));
}

export function queteDeLaSemaine(etat: EtatQuetes, cle: string): Quete {
  const e = actualiser(etat, cle);
  const m = modeleDeLaSemaine(cle);
  return versQuete(m, e.semaine.progres[m.id] ?? 0, e.semaine.reclamee);
}

/** Le bonus du jour se récupère quand les 3 quêtes l'ont été. */
export function bonusPret(etat: EtatQuetes, cle: string, imagesDispo: boolean): boolean {
  const e = actualiser(etat, cle);
  return !e.jour.bonus && quetesDuJour(e, cle, imagesDispo).every((q) => q.reclamee);
}

/** Nombre de récompenses à récupérer (pastille sur l'accueil). */
export function nbARecuperer(etat: EtatQuetes, cle: string, imagesDispo: boolean): number {
  const e = actualiser(etat, cle);
  return (
    quetesDuJour(e, cle, imagesDispo).filter((q) => q.prete).length +
    (queteDeLaSemaine(e, cle).prete ? 1 : 0) +
    (bonusPret(e, cle, imagesDispo) ? 1 : 0)
  );
}

/** Fait avancer les quêtes du jour et de la semaine. */
export function appliquer(etat: EtatQuetes, cle: string, evt: EvenementQuete, imagesDispo: boolean): EtatQuetes {
  const e = actualiser(etat, cle);
  const progresJour = { ...e.jour.progres };
  for (const m of modelesDuJour(cle, imagesDispo)) {
    const n = m.compte(evt);
    if (n > 0) progresJour[m.id] = Math.min(m.cible, (progresJour[m.id] ?? 0) + n);
  }
  const w = modeleDeLaSemaine(cle);
  const progresSemaine = { ...e.semaine.progres };
  const nw = w.compte(evt);
  if (nw > 0) progresSemaine[w.id] = Math.min(w.cible, (progresSemaine[w.id] ?? 0) + nw);
  return { jour: { ...e.jour, progres: progresJour }, semaine: { ...e.semaine, progres: progresSemaine } };
}

/** Récupère la récompense d'une quête (« bonus » pour le bonus du jour). Renvoie null si elle n'est pas disponible. */
export function reclamer(
  etat: EtatQuetes,
  cle: string,
  id: string,
  imagesDispo: boolean,
): { etat: EtatQuetes; recompense: Recompense } | null {
  const e = actualiser(etat, cle);
  if (id === 'bonus') {
    if (!bonusPret(e, cle, imagesDispo)) return null;
    return { etat: { ...e, jour: { ...e.jour, bonus: true } }, recompense: BONUS_JOUR };
  }
  const q = quetesDuJour(e, cle, imagesDispo).find((x) => x.id === id);
  if (q?.prete) return { etat: { ...e, jour: { ...e.jour, reclamees: [...e.jour.reclamees, id] } }, recompense: q.recompense };
  const s = queteDeLaSemaine(e, cle);
  if (s.id === id && s.prete) return { etat: { ...e, semaine: { ...e.semaine, reclamee: true } }, recompense: s.recompense };
  return null;
}

/** Ajoute les pièces et les jokers d'une récompense aux statistiques. */
export function crediter(stats: Stats, r: Recompense): Stats {
  return { ...stats, pieces: stats.pieces + r.pieces, jokers: stats.jokers + r.jokers };
}

export function libelleRecompense(r: Recompense): string {
  return [r.pieces ? `${r.pieces} 🪙` : '', r.jokers ? `${r.jokers} ✨` : ''].filter(Boolean).join(' + ');
}

const CLE = 'quizzle:quetes';

export async function chargerQuetes(): Promise<EtatQuetes> {
  try {
    const brut = await AsyncStorage.getItem(CLE);
    if (!brut) return QUETES_VIDES;
    const l = JSON.parse(brut) as Partial<EtatQuetes>;
    const recordNombres = (o: unknown): Record<string, number> => {
      const r: Record<string, number> = {};
      if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (typeof v === 'number' && Number.isFinite(v)) r[k] = v;
      return r;
    };
    const liste = (o: unknown): string[] => (Array.isArray(o) ? o.filter((x): x is string => typeof x === 'string') : []);
    return {
      jour: {
        cle: typeof l.jour?.cle === 'string' ? l.jour.cle : '',
        progres: recordNombres(l.jour?.progres),
        reclamees: liste(l.jour?.reclamees),
        bonus: !!l.jour?.bonus,
      },
      semaine: {
        cle: typeof l.semaine?.cle === 'string' ? l.semaine.cle : '',
        progres: recordNombres(l.semaine?.progres),
        reclamee: !!l.semaine?.reclamee,
      },
    };
  } catch {
    return QUETES_VIDES;
  }
}

export async function sauverQuetes(etat: EtatQuetes): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // Le jeu reste jouable même si l'enregistrement échoue.
  }
}
