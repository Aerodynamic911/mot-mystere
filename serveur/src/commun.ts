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
