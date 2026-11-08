// Defis directs entre amis, reactions en emoji et statistiques communautaires du jour.

import { envoyerPush, nomAfficheDe } from './notifPush';
import { type Env, type Joueur, erreur, json, jourParis, lireCorps } from './commun';

const JOUR = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f-]{36}$/;
const MAX_DEFIS_PAR_JOUR = 10;
const MIN_RESULTATS_STATS = 50;
export const REACTIONS = ['👏', '🔥', '😮', '😂', '😅', '💪'];

const NOM_AFFICHE = `CASE WHEN j.statut = 'approuve' AND j.pseudo IS NOT NULL
  AND (SELECT COUNT(DISTINCT s.joueur_signalant) FROM signalements s WHERE s.joueur_signale = j.id AND s.traite = 0) < 3
  THEN j.pseudo ELSE 'Joueur-' || upper(substr(replace(j.id, '-', ''), 1, 4)) END`;

async function sontAmis(env: Env, a: string, b: string): Promise<boolean> {
  const r = await env.DB.prepare(
    `SELECT 1 AS x FROM amities WHERE statut = 'acceptee' AND ((joueur_a = ?1 AND joueur_b = ?2) OR (joueur_a = ?2 AND joueur_b = ?1))
     AND NOT EXISTS (SELECT 1 FROM blocages WHERE (joueur_id = ?1 AND joueur_bloque = ?2) OR (joueur_id = ?2 AND joueur_bloque = ?1))`,
  )
    .bind(a, b)
    .first();
  return !!r;
}

function lireEssais(corps: Record<string, unknown>): { essais: number; gagne: boolean } | null {
  const essais = Number(corps.essais);
  if (!Number.isInteger(essais) || essais < 0 || essais > 12) return null;
  return { essais, gagne: corps.gagne === true };
}

async function envoyerDefi(requete: Request, env: Env, joueur: Joueur): Promise<Response> {
  if (joueur.statut === 'banni') return erreur(403, 'banni');
  const corps = await lireCorps(requete);
  const cible = corps.a_joueur;
  const mystere = corps.mystere_id;
  const res = lireEssais(corps);
  if (typeof cible !== 'string' || !UUID.test(cible) || cible === joueur.id) return erreur(400, 'joueur');
  if (typeof mystere !== 'string' || mystere.length < 1 || mystere.length > 64) return erreur(400, 'mystere');
  if (!res) return erreur(400, 'essais');
  if (!(await sontAmis(env, joueur.id, cible))) return erreur(404, 'introuvable');

  const recents = await env.DB.prepare("SELECT COUNT(*) AS n FROM defis WHERE de_joueur = ? AND cree_le > datetime('now', '-1 day')")
    .bind(joueur.id)
    .first<{ n: number }>();
  if ((recents?.n ?? 0) >= MAX_DEFIS_PAR_JOUR) return erreur(429, 'trop_de_defis');

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO defis (id, de_joueur, a_joueur, mystere_id, essais_de, gagne_de, expire_le) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+7 days'))",
  )
    .bind(id, joueur.id, cible, mystere, res.essais, res.gagne ? 1 : 0)
    .run();
  const nom = await nomAfficheDe(env, joueur.id);
  await envoyerPush(
    env,
    cible,
    {
      fr: { titre: 'Quizzle : défi reçu', corps: `${nom} vous défie sur un mystère. Relevez le défi !` },
      en: { titre: 'Quizzle: challenge received', corps: `${nom} challenges you on a mystery. Take it on!` },
    },
    { type: 'defi' },
  );
  return json({ id }, 201);
}

interface LigneDefi {
  id: string;
  mystere_id: string;
  essais_de: number;
  gagne_de: number;
  essais_a: number | null;
  gagne_a: number | null;
  expire_le: string;
  autre_id: string;
  autre_nom: string;
}

async function listerDefis(env: Env, joueur: Joueur): Promise<Response> {
  const colonnes = `d.id, d.mystere_id, d.essais_de, d.gagne_de, d.essais_a, d.gagne_a, d.expire_le`;
  const exclusion = `AND NOT EXISTS (SELECT 1 FROM blocages b WHERE (b.joueur_id = ?1 AND b.joueur_bloque = j.id) OR (b.joueur_id = j.id AND b.joueur_bloque = ?1))`;
  const { results: recus } = await env.DB.prepare(
    `SELECT ${colonnes}, j.id AS autre_id, ${NOM_AFFICHE} AS autre_nom
     FROM defis d JOIN joueurs j ON j.id = d.de_joueur
     WHERE d.a_joueur = ?1 AND d.expire_le > datetime('now') ${exclusion}
     ORDER BY d.cree_le DESC LIMIT 50`,
  )
    .bind(joueur.id)
    .all<LigneDefi>();
  const { results: envoyes } = await env.DB.prepare(
    `SELECT ${colonnes}, j.id AS autre_id, ${NOM_AFFICHE} AS autre_nom
     FROM defis d JOIN joueurs j ON j.id = d.a_joueur
     WHERE d.de_joueur = ?1 AND d.expire_le > datetime('now') ${exclusion}
     ORDER BY d.cree_le DESC LIMIT 50`,
  )
    .bind(joueur.id)
    .all<LigneDefi>();

  const forme = (l: LigneDefi) => ({
    id: l.id,
    mystere_id: l.mystere_id,
    autre: { id: l.autre_id, nom: l.autre_nom },
    essais_de: l.essais_de,
    gagne_de: !!l.gagne_de,
    reponse: l.essais_a === null ? null : { essais: l.essais_a, gagne: !!l.gagne_a },
    expire_le: l.expire_le,
  });
  return json({ recus: recus.map(forme), envoyes: envoyes.map(forme) });
}

async function repondreDefi(requete: Request, env: Env, joueur: Joueur, id: string): Promise<Response> {
  const res = lireEssais(await lireCorps(requete));
  if (!res) return erreur(400, 'essais');
  const maj = await env.DB.prepare(
    "UPDATE defis SET essais_a = ?, gagne_a = ? WHERE id = ? AND a_joueur = ? AND essais_a IS NULL AND expire_le > datetime('now')",
  )
    .bind(res.essais, res.gagne ? 1 : 0, id, joueur.id)
    .run();
  return maj.meta.changes ? json({ ok: true }) : erreur(404, 'introuvable');
}

async function reagir(requete: Request, env: Env, joueur: Joueur): Promise<Response> {
  const corps = await lireCorps(requete);
  const cible = corps.joueur_id;
  const jour = corps.jour;
  if (typeof cible !== 'string' || !UUID.test(cible) || cible === joueur.id) return erreur(400, 'joueur');
  if (typeof jour !== 'string' || !JOUR.test(jour)) return erreur(400, 'jour');
  if (!(await sontAmis(env, joueur.id, cible))) return erreur(404, 'introuvable');
  if (corps.emoji === null) {
    await env.DB.prepare('DELETE FROM reactions WHERE de_joueur = ? AND joueur_cible = ? AND jour = ?').bind(joueur.id, cible, jour).run();
    return json({ ok: true });
  }
  if (typeof corps.emoji !== 'string' || !REACTIONS.includes(corps.emoji)) return erreur(400, 'emoji');
  await env.DB.prepare('INSERT OR REPLACE INTO reactions (de_joueur, joueur_cible, jour, emoji) VALUES (?, ?, ?, ?)')
    .bind(joueur.id, cible, jour, corps.emoji)
    .run();
  return json({ ok: true });
}

async function statsDuJour(env: Env, url: URL): Promise<Response> {
  const param = url.searchParams.get('jour');
  const jour = param && JOUR.test(param) ? param : jourParis();
  const { results } = await env.DB.prepare(
    'SELECT CASE WHEN score = 0 THEN 0 WHEN essais > 6 THEN 6 ELSE essais END AS essais, COUNT(*) AS n FROM resultats WHERE jour = ? GROUP BY 1',
  )
    .bind(jour)
    .all<{ essais: number; n: number }>();
  const total = results.reduce((s, r) => s + r.n, 0);
  if (total < MIN_RESULTATS_STATS) return json({ jour, disponible: false });
  const repartition: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, perdu: 0 };
  for (const r of results) repartition[r.essais === 0 ? 'perdu' : String(r.essais)] = r.n;
  const gagnants = total - repartition.perdu;
  let somme = 0;
  for (let i = 1; i <= 6; i++) somme += i * repartition[String(i)];
  return json({
    jour,
    disponible: true,
    total,
    taux_reussite: Math.round((gagnants / total) * 100),
    essais_moyen: gagnants ? Math.round((somme / gagnants) * 10) / 10 : null,
    repartition,
  });
}

export async function routeDefis(requete: Request, env: Env, url: URL, joueur: Joueur): Promise<Response | null> {
  const { pathname } = url;
  const methode = requete.method;

  if (pathname === '/v1/defis') {
    if (methode === 'POST') return envoyerDefi(requete, env, joueur);
    if (methode === 'GET') return listerDefis(env, joueur);
  }
  const reponse = pathname.match(/^\/v1\/defis\/([0-9a-f-]{36})\/resultat$/);
  if (reponse && methode === 'POST') return repondreDefi(requete, env, joueur, reponse[1]);

  if (methode === 'POST' && pathname === '/v1/reactions') return reagir(requete, env, joueur);
  if (methode === 'GET' && pathname === '/v1/stats/jour') return statsDuJour(env, url);
  return null;
}
