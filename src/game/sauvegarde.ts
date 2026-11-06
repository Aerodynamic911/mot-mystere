import AsyncStorage from '@react-native-async-storage/async-storage';
import { appeler, compteLocal } from './serveur';

/**
 * Sauvegarde de la progression sur le serveur, liée au compte Apple (iOS) ou Google (Android) du joueur.
 * Seuls les réglages de jeu sont copiés : pas d'identifiants, pas de données personnelles.
 */

/** Données de jeu copiées dans la sauvegarde (les identifiants du compte en ligne n'en font pas partie). */
export const CLES_SAUVEGARDEES = [
  'motmystere:stats',
  'motmystere:jour',
  'boxtery:collection',
  'quizzle:quetes',
  'boxtery:progression',
  'cluebox:preferences',
  'motmystere:avisBandeau',
] as const;

const CLE_ETAT = 'quizzle.sauvegarde.v1';
/** Délai minimal entre deux envois automatiques. */
const INTERVALLE_MS = 3 * 3600 * 1000;

export type Fournisseur = 'apple' | 'google';

export interface EtatSauvegarde {
  fournisseur: Fournisseur;
  /** Date (ISO) du dernier envoi réussi, `null` si aucun. */
  derniere: string | null;
}

export type Instantane = Record<string, string>;

export async function etatSauvegarde(): Promise<EtatSauvegarde | null> {
  try {
    const brut = await AsyncStorage.getItem(CLE_ETAT);
    if (!brut) return null;
    const e = JSON.parse(brut) as EtatSauvegarde;
    return e && (e.fournisseur === 'apple' || e.fournisseur === 'google') ? e : null;
  } catch {
    return null;
  }
}

export async function ecrireEtat(etat: EtatSauvegarde): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE_ETAT, JSON.stringify(etat));
  } catch {
    // rien à faire
  }
}

/** Efface le lien local (après une suppression des données en ligne). */
export async function oublierSauvegarde(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CLE_ETAT);
  } catch {
    // rien à faire
  }
}

export async function lireInstantane(): Promise<Instantane> {
  const paires = await AsyncStorage.multiGet([...CLES_SAUVEGARDEES]);
  const instantane: Instantane = {};
  for (const [cle, valeur] of paires) if (typeof valeur === 'string') instantane[cle] = valeur;
  return instantane;
}

/** Remplace les données de jeu de ce téléphone par celles de la sauvegarde. Seules les clés connues sont écrites. */
export async function appliquerInstantane(donnees: unknown): Promise<boolean> {
  if (!donnees || typeof donnees !== 'object') return false;
  const source = (donnees as { cles?: Instantane }).cles;
  if (!source || typeof source !== 'object') return false;
  const paires: [string, string][] = [];
  for (const cle of CLES_SAUVEGARDEES) {
    const v = source[cle];
    if (typeof v === 'string') paires.push([cle, v]);
  }
  if (!paires.length) return false;
  await AsyncStorage.multiRemove([...CLES_SAUVEGARDEES]);
  await AsyncStorage.multiSet(paires);
  return true;
}

/** Envoie la progression au serveur. Renvoie `true` si elle est enregistrée. */
export async function sauvegarderMaintenant(): Promise<boolean> {
  try {
    const etat = await etatSauvegarde();
    const compte = await compteLocal();
    if (!etat || !compte) return false;
    const cles = await lireInstantane();
    const r = await appeler('/v1/sauvegarde', 'PUT', compte, { donnees: { version: 1, cles } });
    if (r.status !== 200) return false;
    await ecrireEtat({ ...etat, derniere: new Date().toISOString() });
    return true;
  } catch {
    return false;
  }
}

/** Envoi automatique : au plus toutes les quelques heures, sans bruit en cas d'échec. */
export async function sauvegarderSiBesoin(): Promise<void> {
  const etat = await etatSauvegarde();
  if (!etat) return;
  if (etat.derniere && Date.now() - Date.parse(etat.derniere) < INTERVALLE_MS) return;
  await sauvegarderMaintenant();
}
