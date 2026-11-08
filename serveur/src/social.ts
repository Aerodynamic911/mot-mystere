// Resultats du jour, amis par code, blocages et signalements.

import { notifier } from './notifier';
import { envoyerPush, nomAfficheDe } from './notifPush';
import { type Env, type Joueur, erreur, json, jourParis, lireCorps } from './commun';

const JOUR = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f-]{36}$/;
const MAX_AMIS = 100;
const MAX_DEMANDES_PAR_JOUR = 20;
const MOTIFS = ['pseudo_inapproprie', 'harcelement', 'autre'];

// Nom montre aux autres joueurs : le pseudo une fois valide (et non masque par 3 signalements), sinon "Joueur-XXXX".
const NOM_AFFICHE = `CASE WHEN j.statut = 'approuve' AND j.pseudo IS NOT NULL
  AND (SELECT COUNT(DISTINCT s.joueur_signalant) FROM signalements s WHERE s.joueur_signale = j.id AND s.traite = 0) < 3
  THEN j.pseudo ELSE 'Joueur-' || upper(substr(replace(j.id, '-', ''), 1, 4)) END`;

const BLOQUE = `EXISTS (SELECT 1 FROM blocages b WHERE (b.joueur_id = ?1 AND b.joueur_bloque = j.id) OR (b.joueur_id = j.id AND b.joueur_bloque = ?1))`;

// Le jour vient de l'app (jour local du mystere) ; on le verifie a un jour pres du jour de Paris.
function jourValide(jour: unknown): jour is string {
  if (typeof jour !== 'string' || !JOUR.test(jour)) return false;
  const ecart = Math.abs(Date.parse(jour + 'T00:00:00Z') - Date.parse(jourParis() + 'T00:00:00Z'));
  return Number.isFinite(ecart) && ecart <= 24 * 3600 * 1000;
}

async function enregistrerResultat(requete: Request, env: Env, joueur: Joueur): Promise<Response> {
  const corps = await lireCorps(requete);
  const essais = Number(corps.essais);
  if (!jourValide(corps.jour)) return erreur(400, 'jour');
  if (!Number.isInteger(essais) || essais < 1 || essais > 12) return erreur(400, 'essais');
  const gagne = corps.gagne === true;
  // 6 points pour une victoire du premier coup, 1 point pour une victoire au 6e essai, 0 si perdu.
  const score = gagne ? Math.max(1, 7 - essais) : 0;
  const res = await env.DB.prepare('INSERT OR IGNORE INTO resultats (joueur_id, jour, essais, score) VALUES (?, ?, ?, ?)')
    .bind(joueur.id, corps.jour, essais, score)
    .run();
  // On renvoie le score enregistre (celui du premier envoi si le jour etait deja pris).
  const garde = await env.DB.prepare('SELECT essais, score FROM resultats WHERE joueur_id = ? AND jour = ?')
    .bind(joueur.id, corps.jour)
    .first<{ essais: number; score: number }>();
  return json({ enregistre: !!res.meta.changes, essais: garde?.essais ?? essais, score: garde?.score ?? score });
}

// Notification au telephone de l'autre joueur : nouvelle demande d'ami, ou demande acceptee.
async function prevenirAmitie(env: Env, de: string, vers: string, acceptee: boolean): Promise<void> {
  const nom = await nomAfficheDe(env, de);
  await envoyerPush(
    env,
    vers,
    acceptee
      ? {
          fr: { titre: 'Quizzle : nouvel ami', corps: `${nom} est maintenant votre ami !` },
          en: { titre: 'Quizzle: new friend', corps: `${nom} is now your friend!` },
        }
      : {
          fr: { titre: 'Quizzle : demande d’ami', corps: `${nom} souhaite devenir votre ami.` },
          en: { titre: 'Quizzle: friend request', corps: `${nom} wants to be your friend.` },
        },
    { type: acceptee ? 'ami_accepte' : 'ami' },
  );
}

async function demanderAmi(requete: Request, env: Env, joueur: Joueur): Promise<Response> {
  const code = String((await lireCorps(requete)).code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 8) return erreur(400, 'code');
  const cible = await env.DB.prepare('SELECT id FROM joueurs WHERE code_ami = ?').bind(code).first<{ id: string }>();
  if (!cible) return erreur(404, 'introuvable');
  if (cible.id === joueur.id) return erreur(400, 'soi_meme');

  const bloque = await env.DB.prepare(
    'SELECT 1 AS x FROM blocages WHERE (joueur_id = ?1 AND joueur_bloque = ?2) OR (joueur_id = ?2 AND joueur_bloque = ?1)',
  )
    .bind(joueur.id, cible.id)
    .first();
  if (bloque) return erreur(404, 'introuvable'); // on ne revele pas le blocage

  const existante = await env.DB.prepare(
    'SELECT joueur_a, statut FROM amities WHERE (joueur_a = ?1 AND joueur_b = ?2) OR (joueur_a = ?2 AND joueur_b = ?1)',
  )
    .bind(joueur.id, cible.id)
    .first<{ joueur_a: string; statut: string }>();
  if (existante) {
    if (existante.statut === 'acceptee') return json({ statut: 'acceptee' });
    if (existante.joueur_a === joueur.id) return json({ statut: 'demande' });
    // l'autre avait deja fait une demande : on l'accepte
    await env.DB.prepare("UPDATE amities SET statut = 'acceptee' WHERE joueur_a = ? AND joueur_b = ?")
      .bind(cible.id, joueur.id)
      .run();
    await prevenirAmitie(env, joueur.id, cible.id, true);
    return json({ statut: 'acceptee' });
  }

  const nb = await env.DB.prepare("SELECT COUNT(*) AS n FROM amities WHERE (joueur_a = ?1 OR joueur_b = ?1) AND statut = 'acceptee'")
    .bind(joueur.id)
    .first<{ n: number }>();
  if ((nb?.n ?? 0) >= MAX_AMIS) return erreur(409, 'limite');
  const recentes = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM amities WHERE joueur_a = ? AND cree_le > datetime('now', '-1 day')",
  )
    .bind(joueur.id)
    .first<{ n: number }>();
  if ((recentes?.n ?? 0) >= MAX_DEMANDES_PAR_JOUR) return erreur(429, 'trop_de_demandes');

  await env.DB.prepare("INSERT INTO amities (joueur_a, joueur_b, statut) VALUES (?, ?, 'demande')").bind(joueur.id, cible.id).run();
  await prevenirAmitie(env, joueur.id, cible.id, false);
  return json({ statut: 'demande' }, 201);
}

async function listerAmis(env: Env, url: URL, joueur: Joueur): Promise<Response> {
  const param = url.searchParams.get('jour');
  const jour = param && JOUR.test(param) ? param : jourParis();
  const base = `FROM amities a
    JOIN joueurs j ON j.id = CASE WHEN a.joueur_a = ?1 THEN a.joueur_b ELSE a.joueur_a END
    LEFT JOIN resultats r ON r.joueur_id = j.id AND r.jour = ?2
    WHERE (a.joueur_a = ?1 OR a.joueur_b = ?1) AND NOT ${BLOQUE}`;

  const { results: amis } = await env.DB.prepare(
    `SELECT j.id AS id, ${NOM_AFFICHE} AS nom, r.essais AS essais, r.score AS score ${base} AND a.statut = 'acceptee' ORDER BY nom COLLATE NOCASE`,
  )
    .bind(joueur.id, jour)
    .all<{ id: string; nom: string; essais: number | null; score: number | null }>();

  const { results: recues } = await env.DB.prepare(
    `SELECT j.id AS id, ${NOM_AFFICHE} AS nom ${base} AND a.statut = 'demande' AND a.joueur_b = ?1 ORDER BY a.cree_le DESC`,
  )
    .bind(joueur.id, jour)
    .all<{ id: string; nom: string }>();

  const envoyees = await env.DB.prepare("SELECT COUNT(*) AS n FROM amities WHERE joueur_a = ? AND statut = 'demande'")
    .bind(joueur.id)
    .first<{ n: number }>();

  const { results: reactions } = await env.DB.prepare(
    'SELECT de_joueur, joueur_cible, emoji FROM reactions WHERE jour = ?2 AND (de_joueur = ?1 OR joueur_cible = ?1)',
  )
    .bind(joueur.id, jour)
    .all<{ de_joueur: string; joueur_cible: string; emoji: string }>();
  const mienne = new Map(reactions.filter((r) => r.de_joueur === joueur.id).map((r) => [r.joueur_cible, r.emoji]));
  const recuesDe = new Map(reactions.filter((r) => r.joueur_cible === joueur.id).map((r) => [r.de_joueur, r.emoji]));

  return json({
    jour,
    amis: amis.map((a) => ({
      id: a.id,
      nom: a.nom,
      resultat: a.essais === null ? null : { essais: a.essais, score: a.score },
      ma_reaction: mienne.get(a.id) ?? null,
      reaction_recue: recuesDe.get(a.id) ?? null,
    })),
    recues,
    envoyees: envoyees?.n ?? 0,
  });
}

export async function routeSociale(requete: Request, env: Env, url: URL, joueur: Joueur): Promise<Response | null> {
  const { pathname } = url;
  const methode = requete.method;

  if (methode === 'POST' && pathname === '/v1/resultats') return enregistrerResultat(requete, env, joueur);

  if (pathname === '/v1/amis') {
    if (methode === 'POST') return demanderAmi(requete, env, joueur);
    if (methode === 'GET') return listerAmis(env, url, joueur);
  }

  const ami = pathname.match(/^\/v1\/amis\/([0-9a-f-]{36})$/);
  if (ami) {
    const autre = ami[1];
    if (methode === 'PUT') {
      const accepter = (await lireCorps(requete)).accepter === true;
      const sql = accepter
        ? "UPDATE amities SET statut = 'acceptee' WHERE joueur_a = ? AND joueur_b = ? AND statut = 'demande'"
        : "DELETE FROM amities WHERE joueur_a = ? AND joueur_b = ? AND statut = 'demande'";
      const res = await env.DB.prepare(sql).bind(autre, joueur.id).run();
      if (res.meta.changes && accepter) await prevenirAmitie(env, joueur.id, autre, true);
      return res.meta.changes ? json({ ok: true }) : erreur(404, 'introuvable');
    }
    if (methode === 'DELETE') {
      await env.DB.prepare('DELETE FROM amities WHERE (joueur_a = ?1 AND joueur_b = ?2) OR (joueur_a = ?2 AND joueur_b = ?1)')
        .bind(joueur.id, autre)
        .run();
      return json({ ok: true });
    }
  }

  if (methode === 'POST' && pathname === '/v1/blocages') {
    const cible = (await lireCorps(requete)).joueur_id;
    if (typeof cible !== 'string' || !UUID.test(cible) || cible === joueur.id) return erreur(400, 'joueur');
    await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO blocages (joueur_id, joueur_bloque) VALUES (?, ?)').bind(joueur.id, cible),
      env.DB.prepare('DELETE FROM amities WHERE (joueur_a = ?1 AND joueur_b = ?2) OR (joueur_a = ?2 AND joueur_b = ?1)').bind(joueur.id, cible),
    ]);
    return json({ ok: true });
  }
  const deblocage = pathname.match(/^\/v1\/blocages\/([0-9a-f-]{36})$/);
  if (methode === 'DELETE' && deblocage) {
    await env.DB.prepare('DELETE FROM blocages WHERE joueur_id = ? AND joueur_bloque = ?').bind(joueur.id, deblocage[1]).run();
    return json({ ok: true });
  }

  if (methode === 'POST' && pathname === '/v1/signalements') {
    const corps = await lireCorps(requete);
    const cible = corps.joueur_id;
    const motif = typeof corps.motif === 'string' && MOTIFS.includes(corps.motif) ? corps.motif : 'autre';
    if (typeof cible !== 'string' || !UUID.test(cible) || cible === joueur.id) return erreur(400, 'joueur');
    const existe = await env.DB.prepare('SELECT 1 AS x FROM joueurs WHERE id = ?').bind(cible).first();
    if (!existe) return erreur(404, 'introuvable');
    const deja = await env.DB.prepare('SELECT 1 AS x FROM signalements WHERE joueur_signale = ? AND joueur_signalant = ? AND traite = 0')
      .bind(cible, joueur.id)
      .first();
    if (!deja) {
      await env.DB.prepare('INSERT INTO signalements (joueur_signale, joueur_signalant, motif) VALUES (?, ?, ?)')
        .bind(cible, joueur.id, motif)
        .run();
      await notifier(env, 'Quizzle : signalement', 'Un joueur a été signalé (BackOffice).');
    }
    return json({ ok: true });
  }

  return null;
}
