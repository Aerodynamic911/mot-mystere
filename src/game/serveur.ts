import AsyncStorage from '@react-native-async-storage/async-storage';
import { URL_SERVEUR } from '../config';
import { oublierSauvegarde } from './sauvegarde';

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

export async function oublierCompte(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CLE);
  } catch {
    // rien à faire
  }
}

export interface Reponse {
  status: number;
  donnees: any;
}

/** Appel au serveur ; lève une erreur seulement si le réseau est inaccessible. */
export async function appeler(chemin: string, methode: string, compte: Compte | null, corps?: unknown): Promise<Reponse> {
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

export async function creerCompte(): Promise<Compte | null> {
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
      await oublierSauvegarde();
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
  /** Ma réaction (emoji) au résultat de cet ami pour le jour, s'il y en a une. */
  ma_reaction?: string | null;
  /** Réaction reçue de cet ami pour mon résultat du jour. */
  reaction_recue?: string | null;
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

// --- Réactions, groupes, défis et statistiques ----------------------------------------------

/** Réactions prédéfinies (pas de texte libre). */
export const REACTIONS = ['👏', '🔥', '😮', '😂', '😅', '💪'];

export const reagir = (joueurId: string, jour: string, emoji: string | null) =>
  action('/v1/reactions', 'POST', { joueur_id: joueurId, jour, emoji });

export interface GroupeResume {
  id: string;
  nom: string;
  code: string;
  membres: number;
  moi_createur: boolean;
}

export interface LigneClassement {
  id: string;
  nom: string;
  moi: boolean;
  /** Score du jour ; `null` si le joueur n'a pas encore joué. */
  jour: number | null;
  semaine: number;
  mois: number;
  serie: number;
}

export interface DetailGroupe {
  id: string;
  nom: string;
  code: string;
  moi_createur: boolean;
  jour: string;
  classement: LigneClassement[];
}

export type ErreurGroupe = 'nom' | 'limite' | 'trop_de_groupes' | 'code' | 'introuvable' | 'groupe_plein' | 'banni' | 'reseau' | 'inconnue';

const ERREURS_GROUPE: string[] = ['nom', 'limite', 'trop_de_groupes', 'code', 'introuvable', 'groupe_plein', 'banni'];

async function appelGroupe(chemin: string, corps: unknown): Promise<{ ok: true; groupe: { id: string; nom: string; code: string } } | { ok: false; erreur: ErreurGroupe }> {
  try {
    const compte = await compteLocal();
    if (!compte) return { ok: false, erreur: 'inconnue' };
    const r = await appeler(chemin, 'POST', compte, corps);
    if (r.status === 200 || r.status === 201) return { ok: true, groupe: r.donnees };
    const e = r.donnees?.erreur as string | undefined;
    return { ok: false, erreur: e && ERREURS_GROUPE.includes(e) ? (e as ErreurGroupe) : 'inconnue' };
  } catch {
    return { ok: false, erreur: 'reseau' };
  }
}

export const creerGroupe = (nom: string) => appelGroupe('/v1/groupes', { nom });
export const rejoindreGroupe = (code: string) => appelGroupe('/v1/groupes/rejoindre', { code });

/** Mes groupes ; `null` sans profil. Lève une erreur si le réseau est inaccessible. */
export async function lireGroupes(): Promise<GroupeResume[] | null> {
  const compte = await compteLocal();
  if (!compte) return null;
  const r = await appeler('/v1/groupes', 'GET', compte);
  return r.status === 200 ? (r.donnees.groupes as GroupeResume[]) : null;
}

export async function lireGroupe(id: string, jour: string): Promise<DetailGroupe | null> {
  const compte = await compteLocal();
  if (!compte) return null;
  const r = await appeler('/v1/groupes/' + id + '?jour=' + encodeURIComponent(jour), 'GET', compte);
  return r.status === 200 ? (r.donnees as DetailGroupe) : null;
}

/** Quitter un groupe (mon id) ou en retirer un membre (créateur du groupe). */
export async function quitterGroupe(groupeId: string, joueurId: string): Promise<boolean> {
  return action('/v1/groupes/' + groupeId + '/membres/' + joueurId, 'DELETE');
}

/** Mon identifiant de joueur sur le serveur (pour me repérer dans un groupe). */
export async function monIdentifiant(): Promise<string | null> {
  return (await compteLocal())?.id ?? null;
}

export interface DefiEnLigne {
  id: string;
  mystere_id: string;
  autre: { id: string; nom: string };
  essais_de: number;
  gagne_de: boolean;
  reponse: { essais: number; gagne: boolean } | null;
  expire_le: string;
}

export type ErreurDefi = 'introuvable' | 'trop_de_defis' | 'reseau' | 'inconnue';

export async function envoyerDefi(aJoueur: string, mystereId: string, essais: number, gagne: boolean): Promise<{ ok: true } | { ok: false; erreur: ErreurDefi }> {
  try {
    const compte = await compteLocal();
    if (!compte) return { ok: false, erreur: 'inconnue' };
    const r = await appeler('/v1/defis', 'POST', compte, { a_joueur: aJoueur, mystere_id: mystereId, essais, gagne });
    if (r.status === 201) return { ok: true };
    const e = r.donnees?.erreur as string | undefined;
    return { ok: false, erreur: e === 'introuvable' || e === 'trop_de_defis' ? e : 'inconnue' };
  } catch {
    return { ok: false, erreur: 'reseau' };
  }
}

/** Défis reçus et envoyés ; `null` sans profil. Lève une erreur si le réseau est inaccessible. */
export async function lireDefis(): Promise<{ recus: DefiEnLigne[]; envoyes: DefiEnLigne[] } | null> {
  const compte = await compteLocal();
  if (!compte) return null;
  const r = await appeler('/v1/defis', 'GET', compte);
  return r.status === 200 ? r.donnees : null;
}

/** Renvoie mon résultat à l'ami qui m'a défié (silencieux). */
export async function repondreDefi(id: string, essais: number, gagne: boolean): Promise<void> {
  await action('/v1/defis/' + id + '/resultat', 'POST', { essais, gagne });
}

export interface StatsDuJour {
  jour: string;
  disponible: boolean;
  total?: number;
  taux_reussite?: number;
  essais_moyen?: number | null;
  repartition?: Record<string, number>;
}

/** Statistiques de tous les joueurs pour le jour ; `null` sans profil. */
export async function lireStatsDuJour(jour: string): Promise<StatsDuJour | null> {
  const compte = await compteLocal();
  if (!compte) return null;
  const r = await appeler('/v1/stats/jour?jour=' + encodeURIComponent(jour), 'GET', compte);
  return r.status === 200 ? (r.donnees as StatsDuJour) : null;
}

// ---- Notifications sur le téléphone ----
export const enregistrerJetonPush = (jeton: string, langue: string) => action('/v1/notifications', 'PUT', { jeton, langue });
export const retirerJetonPush = (jeton: string) => action('/v1/notifications', 'DELETE', { jeton });
