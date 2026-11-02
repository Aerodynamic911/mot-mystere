// BackOffice de moderation : une page web + quelques routes /admin.
// Acces : Cloudflare Access devant admin.occitangames.com, et, en plus, verification ici
// que l'adresse e-mail authentifiee par Access est bien celle du secret ADMIN_EMAIL.

import { PAGE_ADMIN } from './pageAdmin';
import {
  type Env,
  STATUTS,
  erreur,
  json,
  jourParis,
  lireCorps,
  minuscules,
  normaliser,
} from './commun';

interface LignePseudo {
  id: string;
  pseudo: string;
  statut: string;
  cree_le: string;
  dernier_changement_pseudo: string | null;
  signalements: number;
}

// Identite donnee par Cloudflare Access : en-tete e-mail, sinon contenu du jeton d'acces.
function emailAccess(requete: Request): string {
  const direct = (requete.headers.get('cf-access-authenticated-user-email') ?? '').trim().toLowerCase();
  if (direct) return direct;
  const jeton = requete.headers.get('cf-access-jwt-assertion') ?? '';
  try {
    const charge = jeton.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const donnees = JSON.parse(atob(charge)) as { email?: string };
    return (donnees.email ?? '').trim().toLowerCase();
  } catch {
    return '';
  }
}

// ADMIN_EMAIL peut contenir plusieurs adresses separees par des virgules.
// Retourne null si l'acces est autorise, sinon la raison du refus.
function refus(requete: Request, env: Env): string | null {
  const autorises = (env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!autorises.length) return 'secret_absent';
  const recu = emailAccess(requete);
  if (!recu) return 'email_absent';
  return autorises.includes(recu) ? null : 'email_different';
}

export async function adminRequete(requete: Request, env: Env, url: URL): Promise<Response> {
  const motif = refus(requete, env);
  if (motif) return erreur(403, 'acces_refuse', { motif });

  const { pathname } = url;
  const methode = requete.method;

  if (methode === 'GET' && (pathname === '/' || pathname === '/admin')) {
    return new Response(PAGE_ADMIN, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
        'content-security-policy':
          "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'",
      },
    });
  }

  // --- Chiffres du jour ---
  if (methode === 'GET' && pathname === '/admin/chiffres') {
    const jour = jourParis();
    const compte = async (sql: string, ...valeurs: unknown[]): Promise<number> =>
      (await env.DB.prepare(sql).bind(...valeurs).first<{ n: number }>())?.n ?? 0;
    return json({
      joueurs: await compte('SELECT COUNT(*) AS n FROM joueurs'),
      avec_pseudo: await compte('SELECT COUNT(*) AS n FROM joueurs WHERE pseudo IS NOT NULL'),
      pseudos_en_attente: await compte("SELECT COUNT(*) AS n FROM joueurs WHERE pseudo IS NOT NULL AND statut = 'attente'"),
      resultats_du_jour: await compte('SELECT COUNT(*) AS n FROM resultats WHERE jour = ?', jour),
      signalements_a_traiter: await compte('SELECT COUNT(*) AS n FROM signalements WHERE traite = 0'),
      jour,
    });
  }

  // --- Pseudos : liste, recherche ---
  if (methode === 'GET' && pathname === '/admin/pseudos') {
    const statut = url.searchParams.get('statut') ?? 'attente';
    if (statut !== 'tous' && !(STATUTS as readonly string[]).includes(statut)) return erreur(400, 'statut');
    const recherche = normaliser(url.searchParams.get('q') ?? '').replace(/[%]/g, '');
    const { results } = await env.DB.prepare(
      `SELECT id, pseudo, statut, cree_le, dernier_changement_pseudo,
              (SELECT COUNT(*) FROM signalements s WHERE s.joueur_signale = joueurs.id AND s.traite = 0) AS signalements
       FROM joueurs
       WHERE pseudo IS NOT NULL
         AND (? = 'tous' OR statut = ?)
         AND (? = '' OR pseudo_cle LIKE ?)
       ORDER BY COALESCE(dernier_changement_pseudo, cree_le) DESC
       LIMIT 100`,
    )
      .bind(statut, statut, recherche, `%${recherche}%`)
      .all<LignePseudo>();
    return json({ pseudos: results });
  }

  // --- Pseudos : decision ---
  const decision = pathname.match(/^\/admin\/pseudos\/([0-9a-f-]{36})\/(approuver|refuser|bannir)$/);
  if (methode === 'POST' && decision) {
    const [, id, action] = decision;
    const requeteSql =
      action === 'approuver'
        ? "UPDATE joueurs SET statut = 'approuve' WHERE id = ? AND pseudo IS NOT NULL"
        : action === 'refuser'
          ? // le pseudo refuse redevient disponible pour les autres
            "UPDATE joueurs SET statut = 'refuse', pseudo_cle = NULL WHERE id = ? AND pseudo IS NOT NULL"
          : "UPDATE joueurs SET statut = 'banni', pseudo_cle = NULL WHERE id = ?";
    const res = await env.DB.prepare(requeteSql).bind(id).run();
    if (!res.meta.changes) return erreur(404, 'introuvable');
    return json({ ok: true });
  }

  // --- Signalements ---
  if (methode === 'GET' && pathname === '/admin/signalements') {
    const { results } = await env.DB.prepare(
      `SELECT j.id, j.pseudo, j.statut, COUNT(*) AS nombre, MAX(s.cree_le) AS dernier,
              GROUP_CONCAT(DISTINCT s.motif) AS motifs
       FROM signalements s JOIN joueurs j ON j.id = s.joueur_signale
       WHERE s.traite = 0
       GROUP BY j.id
       ORDER BY nombre DESC, dernier DESC
       LIMIT 100`,
    ).all();
    return json({ signalements: results });
  }
  const traiter = pathname.match(/^\/admin\/signalements\/([0-9a-f-]{36})\/traiter$/);
  if (methode === 'POST' && traiter) {
    await env.DB.prepare('UPDATE signalements SET traite = 1 WHERE joueur_signale = ?').bind(traiter[1]).run();
    return json({ ok: true });
  }

  // --- Mots interdits ---
  if (methode === 'GET' && pathname === '/admin/mots') {
    const { results } = await env.DB.prepare('SELECT mot FROM mots_interdits ORDER BY mot').all<{ mot: string }>();
    return json({ mots: results.map((r) => r.mot) });
  }
  if (methode === 'POST' && pathname === '/admin/mots') {
    const mot = minuscules(String((await lireCorps(requete)).mot ?? '').trim());
    if (mot.length < 2 || mot.length > 30 || /\s/.test(mot)) return erreur(400, 'mot');
    await env.DB.prepare('INSERT OR IGNORE INTO mots_interdits (mot) VALUES (?)').bind(mot).run();
    return json({ ok: true, mot });
  }
  const retrait = pathname.match(/^\/admin\/mots\/([^/]+)$/);
  if (methode === 'DELETE' && retrait) {
    await env.DB.prepare('DELETE FROM mots_interdits WHERE mot = ?').bind(decodeURIComponent(retrait[1])).run();
    return json({ ok: true });
  }

  return erreur(404, 'introuvable');
}
