import AsyncStorage from '@react-native-async-storage/async-storage';
import { URL_SERVEUR } from '../config';

/**
 * Client du serveur Quizzle (profil en ligne).
 * Le compte est anonyme : un identifiant et un secret aléatoires, conservés sur l'appareil.
 * Rien n'est envoyé avant que le joueur propose un pseudo.
 */

const CLE = 'quizzle.profil-en-ligne.v1';
const DELAI_MS = 10000;

export interface Compte {
  id: string;
  secret: string;
  codeAmi: string;
}

export type StatutPseudo = 'attente' | 'approuve' | 'refuse' | 'banni';

export interface ProfilServeur {
  pseudo: string | null;
  statut: StatutPseudo;
  codeAmi: string;
  /** Vrai quand les autres joueurs voient le pseudo (validé par la modération). */
  visible: boolean;
}

export type ErreurPseudo = 'forme' | 'interdit' | 'pris' | 'trop_tot' | 'banni' | 'reseau' | 'inconnue';

export async function compteLocal(): Promise<Compte | null> {
  try {
    const brut = await AsyncStorage.getItem(CLE);
    if (!brut) return null;
    const c = JSON.parse(brut) as Compte;
    return c && c.id && c.secret ? c : null;
  } catch {
    return null;
  }
}

async function oublierCompte(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CLE);
  } catch {
    // rien à faire
  }
}

interface Reponse {
  status: number;
  donnees: any;
}

/** Appel au serveur ; lève une erreur seulement si le réseau est inaccessible. */
async function appeler(chemin: string, methode: string, compte: Compte | null, corps?: unknown): Promise<Reponse> {
  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), DELAI_MS);
  try {
    const entetes: Record<string, string> = { 'content-type': 'application/json' };
    if (compte) {
      entetes['x-joueur-id'] = compte.id;
      entetes['x-joueur-secret'] = compte.secret;
    }
    const r = await fetch(URL_SERVEUR + chemin, {
      method: methode,
      headers: entetes,
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal: controle.signal,
    });
    let donnees: any = null;
    try {
      donnees = await r.json();
    } catch {
      donnees = null;
    }
    return { status: r.status, donnees };
  } finally {
    clearTimeout(minuteur);
  }
}

async function creerCompte(): Promise<Compte | null> {
  const r = await appeler('/v1/joueurs', 'POST', null);
  if (r.status !== 201 || !r.donnees?.id) return null;
  const compte: Compte = { id: r.donnees.id, secret: r.donnees.secret, codeAmi: r.donnees.code_ami };
  await AsyncStorage.setItem(CLE, JSON.stringify(compte));
  return compte;
}

function profilDe(d: any): ProfilServeur {
  return {
    pseudo: d.pseudo ?? null,
    statut: d.statut,
    codeAmi: d.code_ami,
    visible: !!d.visible_des_autres,
  };
}

/** Profil enregistré sur le serveur ; `null` si le joueur n'a pas encore de profil. Lève une erreur si le réseau est inaccessible. */
export async function lireProfil(): Promise<ProfilServeur | null> {
  const compte = await compteLocal();
  if (!compte) return null;
  const r = await appeler('/v1/joueurs/moi', 'GET', compte);
  if (r.status === 401) {
    await oublierCompte(); // compte supprimé côté serveur
    return null;
  }
  return r.status === 200 ? profilDe(r.donnees) : null;
}

/** Propose un pseudo (crée le compte anonyme au premier envoi). */
export async function proposerPseudo(pseudo: string): Promise<{ ok: true } | { ok: false; erreur: ErreurPseudo }> {
  try {
    let compte = await compteLocal();
    if (!compte) {
      compte = await creerCompte();
      if (!compte) return { ok: false, erreur: 'inconnue' };
    }
    let r = await appeler('/v1/joueurs/pseudo', 'PUT', compte, { pseudo });
    if (r.status === 401) {
      // compte inconnu du serveur : on repart d'un compte neuf
      await oublierCompte();
      compte = await creerCompte();
      if (!compte) return { ok: false, erreur: 'inconnue' };
      r = await appeler('/v1/joueurs/pseudo', 'PUT', compte, { pseudo });
    }
    if (r.status === 200) return { ok: true };
    const code = r.donnees?.erreur as string | undefined;
    if (code === 'forme' || code === 'interdit' || code === 'pris' || code === 'trop_tot' || code === 'banni') {
      return { ok: false, erreur: code };
    }
    return { ok: false, erreur: 'inconnue' };
  } catch {
    return { ok: false, erreur: 'reseau' };
  }
}

/** Supprime le profil et les données du joueur sur le serveur. Renvoie `false` si la suppression n'a pas pu être faite. */
export async function supprimerProfil(): Promise<boolean> {
  const compte = await compteLocal();
  if (!compte) return true;
  try {
    const r = await appeler('/v1/joueurs/moi', 'DELETE', compte);
    if (r.status === 200 || r.status === 401) {
      await oublierCompte();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// --- Résultat du jour et amis ---------------------------------------------------------------

export interface Ami {
  id: string;
  nom: string;
  /** Résultat de l'ami pour le jour demandé ; `null` s'il n'a pas encore joué. `score` vaut 0 s'il n'a pas trouvé. */
  resultat: { essais: number; score: number } | null;
}

export interface ListeAmis {
  jour: string;
  amis: Ami[];
  recues: { id: string; nom: string }[];
  envoyees: number;
}

export type ErreurAmi = 'code' | 'introuvable' | 'soi_meme' | 'limite' | 'trop_de_demandes' | 'reseau' | 'inconnue';

/**
 * Envoie le résultat du mystère du jour (le serveur n'en garde qu'un par jour).
 * Silencieux : sans profil ou sans réseau, il ne se passe rien. Sans danger à répéter.
 */
export async function envoyerResultat(jour: string, essais: number, gagne: boolean): Promise<void> {
  try {
    const compte = await compteLocal();
    if (!compte) return;
    await appeler('/v1/resultats', 'POST', compte, { jour, essais, gagne });
  } catch {
    // pas de réseau : l'envoi sera refait à l'ouverture de l'écran du profil
  }
}

/** Liste des amis et des demandes ; `null` sans profil. Lève une erreur si le réseau est inaccessible. */
export async function lireAmis(jour: string): Promise<ListeAmis | null> {
  const compte = await compteLocal();
  if (!compte) return null;
  const r = await appeler('/v1/amis?jour=' + encodeURIComponent(jour), 'GET', compte);
  return r.status === 200 ? (r.donnees as ListeAmis) : null;
}

export async function demanderAmi(
  code: string,
): Promise<{ ok: true; statut: 'demande' | 'acceptee' } | { ok: false; erreur: ErreurAmi }> {
  try {
    const compte = await compteLocal();
    if (!compte) return { ok: false, erreur: 'inconnue' };
    const r = await appeler('/v1/amis', 'POST', compte, { code });
    if (r.status === 200 || r.status === 201) return { ok: true, statut: r.donnees.statut };
    const e = r.donnees?.erreur as string | undefined;
    if (e === 'code' || e === 'introuvable' || e === 'soi_meme' || e === 'limite' || e === 'trop_de_demandes') return { ok: false, erreur: e };
    return { ok: false, erreur: 'inconnue' };
  } catch {
    return { ok: false, erreur: 'reseau' };
  }
}

async function action(chemin: string, methode: string, corps?: unknown): Promise<boolean> {
  try {
    const compte = await compteLocal();
    if (!compte) return false;
    const r = await appeler(chemin, methode, compte, corps);
    return r.status === 200;
  } catch {
    return false;
  }
}

export const repondreDemande = (id: string, accepter: boolean) => action('/v1/amis/' + id, 'PUT', { accepter });
export const retirerAmi = (id: string) => action('/v1/amis/' + id, 'DELETE');
export const bloquerJoueur = (id: string) => action('/v1/blocages', 'POST', { joueur_id: id });
export const signalerJoueur = (id: string) => action('/v1/signalements', 'POST', { joueur_id: id, motif: 'pseudo_inapproprie' });
