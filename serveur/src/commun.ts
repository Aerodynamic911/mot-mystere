// Types et outils partages entre l'API de l'app et le BackOffice.

export interface D1Result<T = unknown> {
  results: T[];
  meta: { changes?: number };
}
export interface D1Statement {
  bind(...valeurs: unknown[]): D1Statement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
export interface D1Database {
  prepare(requete: string): D1Statement;
  batch(instructions: D1Statement[]): Promise<D1Result[]>;
}
export interface Env {
  DB: D1Database;
  // Secret Cloudflare : adresse e-mail autorisee dans le BackOffice (jamais dans le depot).
  ADMIN_EMAIL?: string;
  // Nom de domaine du BackOffice (par defaut admin.occitangames.com).
  ADMIN_HOST?: string;
  // Secret : sujet ntfy.sh pour les alertes de moderation (optionnel).
  NTFY_TOPIC?: string;
  // Secret : jeton d'acces du compte ntfy.sh (optionnel mais conseille).
  NTFY_TOKEN?: string;
  // Secrets : bot Telegram pour les alertes de moderation (optionnel).
  TELEGRAM_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  // Identifiant(s) client Google (type Web) acceptes comme destinataire des jetons, separes par des virgules.
  GOOGLE_CLIENT_ID?: string;
  // Destinataire des jetons Apple (par defaut l'identifiant de l'app).
  APPLE_AUDIENCE?: string;
}

export interface Joueur {
  id: string;
  secret_hash: string;
  code_ami: string;
  pseudo: string | null;
  pseudo_cle: string | null;
  statut: 'attente' | 'approuve' | 'refuse' | 'banni';
  dernier_changement_pseudo: string | null;
}

export const STATUTS = ['attente', 'approuve', 'refuse', 'banni'] as const;

const ENTETES = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export function json(donnees: unknown, status = 200): Response {
  return new Response(JSON.stringify(donnees), { status, headers: ENTETES });
}

export function erreur(status: number, code: string, extra: Record<string, unknown> = {}): Response {
  return json({ erreur: code, ...extra }, status);
}

export async function lireCorps(requete: Request): Promise<Record<string, unknown>> {
  try {
    const corps = await requete.json();
    return corps && typeof corps === 'object' ? (corps as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// Jour courant au fuseau Europe/Paris (AAAA-MM-JJ) : c'est le serveur qui decide du jour.
export function jourParis(): string {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// Minuscules et sans accents (pour stocker un mot interdit lisible).
export function minuscules(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Comparaison des pseudos : minuscules, sans accents, chiffres "d'argot" remplaces, sans separateurs.
export function normaliser(texte: string): string {
  return minuscules(texte)
    .replace(/[0@]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/[\s_-]+/g, '');
}

// Texte libre montre aux autres (nom de groupe) : forme, coordonnees, mots interdits.
const FORME_NOM = /^[\p{L}\p{N}_'’-]+(?: [\p{L}\p{N}_'’-]+)*$/u;
const COORDONNEES = /@|https?:|www\.|\.(com|fr|net|org|io)\b|\d{6,}/i;

export async function nomAutorise(env: Env, nom: string, min: number, max: number): Promise<boolean> {
  if (nom.length < min || nom.length > max || !FORME_NOM.test(nom) || COORDONNEES.test(nom)) return false;
  const cle = normaliser(nom);
  const { results } = await env.DB.prepare('SELECT mot FROM mots_interdits').all<{ mot: string }>();
  return !results.some((m) => m.mot && cle.includes(normaliser(m.mot)));
}

// Sans 0, O, 1, I, L : evite les confusions quand on recopie un code.
const ALPHABET_CODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function codeAleatoire(longueur: number): string {
  const octets = crypto.getRandomValues(new Uint8Array(longueur));
  return [...octets].map((o) => ALPHABET_CODE[o % ALPHABET_CODE.length]).join('');
}

// Ajoute n jours a une date AAAA-MM-JJ.
export function ajouterJours(jour: string, n: number): string {
  const d = new Date(Date.parse(jour + 'T00:00:00Z') + n * 86400000);
  return d.toISOString().slice(0, 10);
}
