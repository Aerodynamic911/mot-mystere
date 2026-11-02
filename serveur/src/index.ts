// Quizzle 1.3 : API (Cloudflare Worker + base D1).
// Etape actuelle : joueur anonyme et pseudo, plus le BackOffice (admin.ts) pour la moderation.

import { adminRequete } from './admin';
import {
  type Env,
  type Joueur,
  erreur,
  json,
  jourParis,
  lireCorps,
  normaliser,
} from './commun';

// --- Outils ------------------------------------------------------------------------------
async function sha256(texte: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, '0')).join('');
}

function base64url(octets: Uint8Array): string {
  let s = '';
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Sans 0, O, 1, I, L : evite les confusions quand on recopie un code.
const ALPHABET_CODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function codeAleatoire(longueur: number): string {
  const octets = crypto.getRandomValues(new Uint8Array(longueur));
  return [...octets].map((o) => ALPHABET_CODE[o % ALPHABET_CODE.length]).join('');
}

// Authentification : l'app envoie son identifiant et son secret ; le serveur ne garde que l'empreinte.
async function authentifier(requete: Request, env: Env): Promise<Joueur | null> {
  const id = requete.headers.get('x-joueur-id');
  const secret = requete.headers.get('x-joueur-secret');
  if (!id || !secret || id.length > 64 || secret.length > 128) return null;
  const joueur = await env.DB.prepare('SELECT * FROM joueurs WHERE id = ?').bind(id).first<Joueur>();
  if (!joueur) return null;
  if ((await sha256(secret)) !== joueur.secret_hash) return null;
  await env.DB.prepare("UPDATE joueurs SET derniere_activite = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
  return joueur;
}

// --- Pseudos -----------------------------------------------------------------------------
const FORME_PSEUDO = /^[\p{L}\p{N}_-]+(?: [\p{L}\p{N}_-]+)*$/u;
const COORDONNEES = /@|https?:|www\.|\.(com|fr|net|org|io)\b|\d{6,}/i;
const SEMAINE_MS = 7 * 24 * 3600 * 1000;

function nomAffiche(joueur: Joueur): string {
  return joueur.statut === 'approuve' && joueur.pseudo
    ? joueur.pseudo
    : `Joueur-${joueur.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

async function creerJoueur(env: Env): Promise<Response> {
  const id = crypto.randomUUID();
  const secret = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const secretHash = await sha256(secret);
  for (let essai = 0; essai < 5; essai++) {
    const code = codeAleatoire(8);
    try {
      await env.DB.prepare('INSERT INTO joueurs (id, secret_hash, code_ami) VALUES (?, ?, ?)')
        .bind(id, secretHash, code)
        .run();
      return json({ id, secret, code_ami: code }, 201);
    } catch {
      // code deja pris : on en tire un autre
    }
  }
  return erreur(500, 'creation_impossible');
}

function reponseMoi(joueur: Joueur): Response {
  return json({
    id: joueur.id,
    code_ami: joueur.code_ami,
    pseudo: joueur.pseudo,
    statut: joueur.statut,
    visible_des_autres: joueur.statut === 'approuve',
    nom_affiche: nomAffiche(joueur),
  });
}

async function changerPseudo(requete: Request, env: Env, joueur: Joueur): Promise<Response> {
  if (joueur.statut === 'banni') return erreur(403, 'banni');

  const corps = await lireCorps(requete);
  const pseudo = String(corps.pseudo ?? '').trim().replace(/\s+/g, ' ');
  if (pseudo.length < 3 || pseudo.length > 16 || !FORME_PSEUDO.test(pseudo)) {
    return erreur(400, 'forme');
  }
  if (COORDONNEES.test(pseudo)) return erreur(400, 'interdit');

  const cle = normaliser(pseudo);
  const { results: interdits } = await env.DB.prepare('SELECT mot FROM mots_interdits').all<{ mot: string }>();
  if (interdits.some((m) => m.mot && cle.includes(normaliser(m.mot)))) {
    return erreur(400, 'interdit');
  }

  // Un changement par semaine (le premier pseudo est libre).
  if (joueur.pseudo && joueur.statut !== 'refuse' && joueur.dernier_changement_pseudo) {
    const depuis = Date.now() - Date.parse(joueur.dernier_changement_pseudo.replace(' ', 'T') + 'Z');
    if (depuis < SEMAINE_MS) {
      return erreur(429, 'trop_tot', { reessayer_dans_secondes: Math.ceil((SEMAINE_MS - depuis) / 1000) });
    }
  }

  try {
    await env.DB.prepare(
      "UPDATE joueurs SET pseudo = ?, pseudo_cle = ?, statut = 'attente', dernier_changement_pseudo = datetime('now') WHERE id = ?",
    )
      .bind(pseudo, cle, joueur.id)
      .run();
  } catch {
    return erreur(409, 'pris');
  }
  return json({ pseudo, statut: 'attente' });
}

// Suppression du joueur et de tout ce qui le concerne (droit a l'effacement).
async function supprimerJoueur(env: Env, joueur: Joueur): Promise<Response> {
  const id = joueur.id;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM reactions WHERE de_joueur = ? OR joueur_cible = ?').bind(id, id),
    env.DB.prepare('DELETE FROM defis WHERE de_joueur = ? OR a_joueur = ?').bind(id, id),
    env.DB.prepare('DELETE FROM membres WHERE joueur_id = ?').bind(id),
    env.DB.prepare('UPDATE groupes SET createur = NULL WHERE createur = ?').bind(id),
    env.DB.prepare('DELETE FROM groupes WHERE id NOT IN (SELECT groupe_id FROM membres)'),
    env.DB.prepare('DELETE FROM amities WHERE joueur_a = ? OR joueur_b = ?').bind(id, id),
    env.DB.prepare('DELETE FROM blocages WHERE joueur_id = ? OR joueur_bloque = ?').bind(id, id),
    env.DB.prepare('DELETE FROM signalements WHERE joueur_signale = ? OR joueur_signalant = ?').bind(id, id),
    env.DB.prepare('DELETE FROM resultats WHERE joueur_id = ?').bind(id),
    env.DB.prepare('DELETE FROM joueurs WHERE id = ?').bind(id),
  ]);
  return json({ supprime: true });
}

// --- Routes ------------------------------------------------------------------------------
export default {
  async fetch(requete: Request, env: Env): Promise<Response> {
    const url = new URL(requete.url);
    const { pathname } = url;
    const methode = requete.method;

    // Le BackOffice vit sur son propre nom de domaine ; l'API de l'app n'y repond jamais.
    if (url.hostname === (env.ADMIN_HOST ?? 'admin.occitangames.com')) {
      return adminRequete(requete, env, url);
    }

    if (methode === 'GET' && pathname === '/v1/sante') {
      return json({ ok: true, service: 'quizzle-api', jour: jourParis() });
    }

    if (methode === 'POST' && pathname === '/v1/joueurs') {
      return creerJoueur(env);
    }

    if (pathname === '/v1/joueurs/moi' || pathname === '/v1/joueurs/pseudo') {
      const joueur = await authentifier(requete, env);
      if (!joueur) return erreur(401, 'non_authentifie');
      if (methode === 'GET' && pathname === '/v1/joueurs/moi') return reponseMoi(joueur);
      if (methode === 'DELETE' && pathname === '/v1/joueurs/moi') return supprimerJoueur(env, joueur);
      if (methode === 'PUT' && pathname === '/v1/joueurs/pseudo') return changerPseudo(requete, env, joueur);
    }

    return erreur(404, 'introuvable');
  },
};
