// Quizzle 1.4 : sauvegarde de la progression liee au compte Apple (iOS) ou Google (Android).
// Le serveur ne garde que l'identifiant anonyme du fournisseur (champ "sub"), jamais l'e-mail.

import { sha256 } from './auth';
import { type Env, type Joueur, erreur, json, lireCorps } from './commun';

type Fournisseur = 'apple' | 'google';
const FOURNISSEURS: Fournisseur[] = ['apple', 'google'];
const TAILLE_MAX = 64 * 1024;

const JWKS: Record<Fournisseur, string> = {
  apple: 'https://appleid.apple.com/auth/keys',
  google: 'https://www.googleapis.com/oauth2/v3/certs',
};
const EMETTEURS: Record<Fournisseur, string[]> = {
  apple: ['https://appleid.apple.com'],
  google: ['https://accounts.google.com', 'accounts.google.com'],
};

interface CleJwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
}
const cache: Partial<Record<Fournisseur, { cles: CleJwk[]; expire: number }>> = {};

async function clesDe(f: Fournisseur, forcer = false): Promise<CleJwk[]> {
  const c = cache[f];
  if (c && !forcer && c.expire > Date.now()) return c.cles;
  const r = await fetch(JWKS[f]);
  if (!r.ok) throw new Error('jwks_indisponible');
  const { keys } = (await r.json()) as { keys: CleJwk[] };
  cache[f] = { cles: keys, expire: Date.now() + 3600 * 1000 };
  return keys;
}

function debase64url(texte: string): Uint8Array<ArrayBuffer> {
  const b64 = texte.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(texte.length / 4) * 4, '=');
  const bin = atob(b64);
  const octets = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
  return octets;
}
const JSONdepuis = (texte: string) => JSON.parse(new TextDecoder().decode(debase64url(texte)));

function base64url(octets: Uint8Array): string {
  let s = '';
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function audiencesAttendues(env: Env, f: Fournisseur): string[] {
  const brut = f === 'apple' ? (env.APPLE_AUDIENCE ?? 'com.occitangames.quizzle') : (env.GOOGLE_CLIENT_ID ?? '');
  return brut.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Verifie la signature et les champs d'un jeton d'identite ; renvoie l'identifiant anonyme ("sub") ou null. */
export async function verifierJeton(env: Env, f: Fournisseur, jeton: string): Promise<string | null> {
  try {
    const parties = jeton.split('.');
    if (parties.length !== 3 || jeton.length > 4096) return null;
    const entete = JSONdepuis(parties[0]);
    const donnees = JSONdepuis(parties[1]);
    if (entete.alg !== 'RS256' || typeof entete.kid !== 'string') return null;

    let cle = (await clesDe(f)).find((k) => k.kid === entete.kid);
    if (!cle) cle = (await clesDe(f, true)).find((k) => k.kid === entete.kid);
    if (!cle || cle.kty !== 'RSA') return null;

    const cleCrypto = await crypto.subtle.importKey(
      'jwk',
      { kty: 'RSA', n: cle.n, e: cle.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valide = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cleCrypto,
      debase64url(parties[2]),
      new TextEncoder().encode(parties[0] + '.' + parties[1]),
    );
    if (!valide) return null;

    if (!EMETTEURS[f].includes(donnees.iss)) return null;
    const attendues = audiencesAttendues(env, f);
    const recues: string[] = Array.isArray(donnees.aud) ? donnees.aud : [donnees.aud];
    if (!attendues.length || !recues.some((a) => attendues.includes(a))) return null;
    if (typeof donnees.exp !== 'number' || donnees.exp * 1000 < Date.now()) return null;
    if (typeof donnees.sub !== 'string' || !donnees.sub || donnees.sub.length > 255) return null;
    return donnees.sub;
  } catch {
    return null;
  }
}

async function lireJeton(requete: Request, env: Env): Promise<{ f: Fournisseur; sujet: string } | Response> {
  const corps = await lireCorps(requete);
  const f = String(corps.fournisseur ?? '') as Fournisseur;
  if (!FOURNISSEURS.includes(f)) return erreur(400, 'fournisseur');
  const sujet = await verifierJeton(env, f, String(corps.jeton ?? ''));
  if (!sujet) return erreur(401, 'jeton_invalide');
  return { f, sujet };
}

/** Nouveau telephone : le joueur prouve son identite, le serveur change le secret et renvoie la sauvegarde. */
export async function restaurerCompte(requete: Request, env: Env): Promise<Response> {
  const lu = await lireJeton(requete, env);
  if (lu instanceof Response) return lu;
  const lien = await env.DB.prepare('SELECT joueur_id FROM comptes_lies WHERE fournisseur = ? AND sujet = ?')
    .bind(lu.f, lu.sujet)
    .first<{ joueur_id: string }>();
  if (!lien) return erreur(404, 'aucune_sauvegarde');
  const joueur = await env.DB.prepare('SELECT id, code_ami FROM joueurs WHERE id = ?')
    .bind(lien.joueur_id)
    .first<{ id: string; code_ami: string }>();
  if (!joueur) return erreur(404, 'aucune_sauvegarde');

  // Le secret change : l'ancien telephone perd l'acces (utile s'il est perdu ou vole).
  const secret = base64url(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare('UPDATE joueurs SET secret_hash = ? WHERE id = ?').bind(await sha256(secret), joueur.id).run();
  const sauv = await env.DB.prepare('SELECT donnees FROM sauvegardes WHERE joueur_id = ?')
    .bind(joueur.id)
    .first<{ donnees: string }>();
  return json({ id: joueur.id, secret, code_ami: joueur.code_ami, sauvegarde: sauv ? JSON.parse(sauv.donnees) : null });
}

/** Routes authentifiees : /v1/compte (GET, POST /lier) et /v1/sauvegarde (PUT). */
export async function routeComptes(requete: Request, env: Env, url: URL, joueur: Joueur): Promise<Response | null> {
  const { pathname } = url;
  const methode = requete.method;

  if (methode === 'GET' && pathname === '/v1/compte') {
    const { results } = await env.DB.prepare('SELECT fournisseur FROM comptes_lies WHERE joueur_id = ?')
      .bind(joueur.id)
      .all<{ fournisseur: string }>();
    const sauv = await env.DB.prepare('SELECT mis_a_jour FROM sauvegardes WHERE joueur_id = ?')
      .bind(joueur.id)
      .first<{ mis_a_jour: string }>();
    return json({ liens: results.map((r) => r.fournisseur), derniere_sauvegarde: sauv?.mis_a_jour ?? null });
  }

  if (methode === 'POST' && pathname === '/v1/compte/lier') {
    const lu = await lireJeton(requete, env);
    if (lu instanceof Response) return lu;
    const existant = await env.DB.prepare('SELECT joueur_id FROM comptes_lies WHERE fournisseur = ? AND sujet = ?')
      .bind(lu.f, lu.sujet)
      .first<{ joueur_id: string }>();
    if (existant) {
      // Ce compte Apple/Google protege deja une autre progression : l'app proposera de la restaurer.
      return existant.joueur_id === joueur.id ? json({ lie: true }) : erreur(409, 'deja_lie');
    }
    const autre = await env.DB.prepare('SELECT 1 AS x FROM comptes_lies WHERE joueur_id = ? AND fournisseur = ?')
      .bind(joueur.id, lu.f)
      .first();
    if (autre) return erreur(409, 'autre_compte');
    await env.DB.prepare('INSERT INTO comptes_lies (fournisseur, sujet, joueur_id) VALUES (?, ?, ?)')
      .bind(lu.f, lu.sujet, joueur.id)
      .run();
    return json({ lie: true }, 201);
  }

  if (methode === 'PUT' && pathname === '/v1/sauvegarde') {
    const lie = await env.DB.prepare('SELECT 1 AS x FROM comptes_lies WHERE joueur_id = ? LIMIT 1').bind(joueur.id).first();
    if (!lie) return erreur(403, 'non_lie');
    const corps = await lireCorps(requete);
    const donnees = corps.donnees;
    if (!donnees || typeof donnees !== 'object' || Array.isArray(donnees)) return erreur(400, 'donnees');
    const texte = JSON.stringify(donnees);
    if (texte.length > TAILLE_MAX) return erreur(413, 'trop_gros');
    await env.DB.prepare(
      "INSERT INTO sauvegardes (joueur_id, donnees, mis_a_jour) VALUES (?, ?, datetime('now')) ON CONFLICT(joueur_id) DO UPDATE SET donnees = excluded.donnees, mis_a_jour = excluded.mis_a_jour",
    )
      .bind(joueur.id, texte)
      .run();
    return json({ enregistre: true });
  }

  return null;
}
