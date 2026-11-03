// Groupes prives : creation, code d'invitation, mini-classements (jour, semaine, mois, serie).

import { type Env, type Joueur, ajouterJours, codeAleatoire, erreur, json, jourParis, lireCorps, nomAutorise } from './commun';

const JOUR = /^\d{4}-\d{2}-\d{2}$/;
const MAX_GROUPES_PAR_JOUEUR = 10;
const MAX_MEMBRES = 30;
const MAX_CREES_PAR_JOUR = 3;

const NOM_AFFICHE = `CASE WHEN j.statut = 'approuve' AND j.pseudo IS NOT NULL
  AND (SELECT COUNT(DISTINCT s.joueur_signalant) FROM signalements s WHERE s.joueur_signale = j.id AND s.traite = 0) < 3
  THEN j.pseudo ELSE 'Joueur-' || upper(substr(replace(j.id, '-', ''), 1, 4)) END`;

async function creer(requete: Request, env: Env, joueur: Joueur): Promise<Response> {
  if (joueur.statut === 'banni') return erreur(403, 'banni');
  const nom = String((await lireCorps(requete)).nom ?? '').trim().replace(/\s+/g, ' ');
  if (!(await nomAutorise(env, nom, 3, 24))) return erreur(400, 'nom');

  const mes = await env.DB.prepare('SELECT COUNT(*) AS n FROM membres WHERE joueur_id = ?').bind(joueur.id).first<{ n: number }>();
  if ((mes?.n ?? 0) >= MAX_GROUPES_PAR_JOUEUR) return erreur(409, 'limite');
  const crees = await env.DB.prepare("SELECT COUNT(*) AS n FROM groupes WHERE createur = ? AND cree_le > datetime('now', '-1 day')")
    .bind(joueur.id)
    .first<{ n: number }>();
  if ((crees?.n ?? 0) >= MAX_CREES_PAR_JOUR) return erreur(429, 'trop_de_groupes');

  const id = crypto.randomUUID();
  for (let essai = 0; essai < 5; essai++) {
    const code = codeAleatoire(6);
    try {
      await env.DB.batch([
        env.DB.prepare('INSERT INTO groupes (id, nom, code, createur) VALUES (?, ?, ?, ?)').bind(id, nom, code, joueur.id),
        env.DB.prepare('INSERT INTO membres (groupe_id, joueur_id) VALUES (?, ?)').bind(id, joueur.id),
      ]);
      return json({ id, nom, code }, 201);
    } catch {
      // code deja pris : on en tire un autre
    }
  }
  return erreur(500, 'creation_impossible');
}

async function rejoindre(requete: Request, env: Env, joueur: Joueur): Promise<Response> {
  if (joueur.statut === 'banni') return erreur(403, 'banni');
  const code = String((await lireCorps(requete)).code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) return erreur(400, 'code');
  const groupe = await env.DB.prepare('SELECT id, nom, code FROM groupes WHERE code = ?').bind(code).first<{ id: string; nom: string; code: string }>();
  if (!groupe) return erreur(404, 'introuvable');
  const deja = await env.DB.prepare('SELECT 1 AS x FROM membres WHERE groupe_id = ? AND joueur_id = ?').bind(groupe.id, joueur.id).first();
  if (deja) return json({ id: groupe.id, nom: groupe.nom, code: groupe.code });
  const mes = await env.DB.prepare('SELECT COUNT(*) AS n FROM membres WHERE joueur_id = ?').bind(joueur.id).first<{ n: number }>();
  if ((mes?.n ?? 0) >= MAX_GROUPES_PAR_JOUEUR) return erreur(409, 'limite');
  const nb = await env.DB.prepare('SELECT COUNT(*) AS n FROM membres WHERE groupe_id = ?').bind(groupe.id).first<{ n: number }>();
  if ((nb?.n ?? 0) >= MAX_MEMBRES) return erreur(409, 'groupe_plein');
  await env.DB.prepare('INSERT OR IGNORE INTO membres (groupe_id, joueur_id) VALUES (?, ?)').bind(groupe.id, joueur.id).run();
  return json({ id: groupe.id, nom: groupe.nom, code: groupe.code }, 201);
}

async function lister(env: Env, joueur: Joueur): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT g.id, g.nom, g.code, g.createur = ?1 AS moi_createur,
            (SELECT COUNT(*) FROM membres m2 WHERE m2.groupe_id = g.id) AS membres
     FROM membres m JOIN groupes g ON g.id = m.groupe_id
     WHERE m.joueur_id = ?1 ORDER BY g.nom COLLATE NOCASE`,
  )
    .bind(joueur.id)
    .all<{ id: string; nom: string; code: string; moi_createur: number; membres: number }>();
  return json({ groupes: results.map((g) => ({ ...g, moi_createur: !!g.moi_createur })) });
}

interface LigneResultat {
  joueur_id: string;
  jour: string;
  score: number;
}

// Serie : jours consecutifs gagnes, en comptant jusqu'a aujourd'hui (ou hier si aujourd'hui n'est pas encore joue).
function serie(jours: Map<string, number>, jour: string): number {
  let courant = jours.has(jour) ? jour : ajouterJours(jour, -1);
  let n = 0;
  while ((jours.get(courant) ?? 0) > 0) {
    n++;
    courant = ajouterJours(courant, -1);
  }
  return n;
}

async function detail(env: Env, url: URL, joueur: Joueur, groupeId: string): Promise<Response> {
  const moi = await env.DB.prepare('SELECT 1 AS x FROM membres WHERE groupe_id = ? AND joueur_id = ?').bind(groupeId, joueur.id).first();
  if (!moi) return erreur(404, 'introuvable');
  const groupe = await env.DB.prepare('SELECT id, nom, code, createur FROM groupes WHERE id = ?')
    .bind(groupeId)
    .first<{ id: string; nom: string; code: string; createur: string | null }>();
  if (!groupe) return erreur(404, 'introuvable');

  const param = url.searchParams.get('jour');
  const jour = param && JOUR.test(param) ? param : jourParis();

  // Les joueurs bloques (dans un sens ou dans l'autre) n'apparaissent pas.
  const { results: membres } = await env.DB.prepare(
    `SELECT j.id AS id, ${NOM_AFFICHE} AS nom
     FROM membres m JOIN joueurs j ON j.id = m.joueur_id
     WHERE m.groupe_id = ?1 AND (j.id = ?2 OR NOT EXISTS (
       SELECT 1 FROM blocages b WHERE (b.joueur_id = ?2 AND b.joueur_bloque = j.id) OR (b.joueur_id = j.id AND b.joueur_bloque = ?2)))`,
  )
    .bind(groupeId, joueur.id)
    .all<{ id: string; nom: string }>();

  const depuis = ajouterJours(jour, -60);
  const { results: lignes } = await env.DB.prepare(
    `SELECT r.joueur_id, r.jour, r.score FROM resultats r
     JOIN membres m ON m.joueur_id = r.joueur_id AND m.groupe_id = ?1
     WHERE r.jour >= ?2 AND r.jour <= ?3`,
  )
    .bind(groupeId, depuis, jour)
    .all<LigneResultat>();

  const parJoueur = new Map<string, Map<string, number>>();
  for (const l of lignes) {
    if (!parJoueur.has(l.joueur_id)) parJoueur.set(l.joueur_id, new Map());
    parJoueur.get(l.joueur_id)!.set(l.jour, l.score);
  }

  const debutSemaine = ajouterJours(jour, -6);
  const debutMois = jour.slice(0, 8) + '01';
  const classement = membres.map((m) => {
    const jours = parJoueur.get(m.id) ?? new Map<string, number>();
    let semaine = 0;
    let mois = 0;
    for (const [j, s] of jours) {
      if (j >= debutSemaine) semaine += s;
      if (j >= debutMois) mois += s;
    }
    return {
      id: m.id,
      nom: m.nom,
      moi: m.id === joueur.id,
      jour: jours.has(jour) ? jours.get(jour)! : null,
      semaine,
      mois,
      serie: serie(jours, jour),
    };
  });

  return json({
    id: groupe.id,
    nom: groupe.nom,
    code: groupe.code,
    moi_createur: groupe.createur === joueur.id,
    jour,
    classement,
  });
}

export async function routeGroupes(requete: Request, env: Env, url: URL, joueur: Joueur): Promise<Response | null> {
  const { pathname } = url;
  const methode = requete.method;

  if (pathname === '/v1/groupes') {
    if (methode === 'POST') return creer(requete, env, joueur);
    if (methode === 'GET') return lister(env, joueur);
  }
  if (methode === 'POST' && pathname === '/v1/groupes/rejoindre') return rejoindre(requete, env, joueur);

  const un = pathname.match(/^\/v1\/groupes\/([0-9a-f-]{36})$/);
  if (un && methode === 'GET') return detail(env, url, joueur, un[1]);

  // Quitter un groupe (soi-meme) ou en retirer quelqu'un (createur seulement).
  const membre = pathname.match(/^\/v1\/groupes\/([0-9a-f-]{36})\/membres\/([0-9a-f-]{36})$/);
  if (membre && methode === 'DELETE') {
    const [, groupeId, cibleId] = membre;
    if (cibleId !== joueur.id) {
      const g = await env.DB.prepare('SELECT createur FROM groupes WHERE id = ?').bind(groupeId).first<{ createur: string | null }>();
      if (!g || g.createur !== joueur.id) return erreur(403, 'interdit');
    }
    await env.DB.batch([
      env.DB.prepare('DELETE FROM membres WHERE groupe_id = ? AND joueur_id = ?').bind(groupeId, cibleId),
      env.DB.prepare('DELETE FROM groupes WHERE id = ? AND id NOT IN (SELECT groupe_id FROM membres)').bind(groupeId),
    ]);
    return json({ ok: true });
  }
  return null;
}
