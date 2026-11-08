// Notifications sur le telephone (service de notifications d'Expo) : demande d'ami, defi, demande acceptee.
// Tout est "au mieux" : une erreur ici ne doit jamais faire echouer l'action du joueur.

import { type Env, type Joueur, erreur, json, lireCorps } from './commun';

const JETON = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,60}\]$/;
const URL_EXPO = 'https://exp.host/--/api/v2/push/send';

export interface TexteNotif {
  fr: { titre: string; corps: string };
  en: { titre: string; corps: string };
}

const NOM_AFFICHE = `CASE WHEN j.statut = 'approuve' AND j.pseudo IS NOT NULL
  AND (SELECT COUNT(DISTINCT s.joueur_signalant) FROM signalements s WHERE s.joueur_signale = j.id AND s.traite = 0) < 3
  THEN j.pseudo ELSE 'Joueur-' || upper(substr(replace(j.id, '-', ''), 1, 4)) END`;

/** Nom que les autres joueurs voient pour ce joueur. */
export async function nomAfficheDe(env: Env, id: string): Promise<string> {
  try {
    const r = await env.DB.prepare(`SELECT ${NOM_AFFICHE} AS nom FROM joueurs j WHERE j.id = ?`).bind(id).first<{ nom: string }>();
    return r?.nom ?? 'Joueur';
  } catch {
    return 'Joueur';
  }
}

/** Envoie une notification a tous les telephones enregistres du joueur. Silencieux en cas d'echec. */
export async function envoyerPush(env: Env, joueurId: string, texte: TexteNotif, donnees: Record<string, unknown>): Promise<void> {
  try {
    const { results } = await env.DB.prepare('SELECT jeton, langue FROM notifications_jetons WHERE joueur_id = ?')
      .bind(joueurId)
      .all<{ jeton: string; langue: string }>();
    if (!results.length) return;
    const messages = results.map((t) => {
      const l = t.langue === 'en' ? texte.en : texte.fr;
      return { to: t.jeton, title: l.titre, body: l.corps, sound: 'default', channelId: 'amis', data: donnees };
    });
    const controle = new AbortController();
    const minuteur = setTimeout(() => controle.abort(), 4000);
    try {
      const r = await fetch(URL_EXPO, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(messages),
        signal: controle.signal,
      });
      const corps = (await r.json()) as { data?: { status?: string; details?: { error?: string } }[] };
      // Telephone desinstalle : on oublie son jeton.
      const morts = (corps.data ?? [])
        .map((d, i) => (d.status === 'error' && d.details?.error === 'DeviceNotRegistered' ? results[i].jeton : null))
        .filter((j): j is string => !!j);
      for (const jeton of morts) await env.DB.prepare('DELETE FROM notifications_jetons WHERE jeton = ?').bind(jeton).run();
    } finally {
      clearTimeout(minuteur);
    }
  } catch {
    // pas de notification : le joueur la verra en ouvrant l'appli
  }
}

/** PUT /v1/notifications {jeton, langue} et DELETE /v1/notifications {jeton}. */
export async function routeNotifications(requete: Request, env: Env, url: URL, joueur: Joueur): Promise<Response | null> {
  if (url.pathname !== '/v1/notifications') return null;
  const corps = await lireCorps(requete);
  const jeton = String(corps.jeton ?? '');
  if (!JETON.test(jeton)) return erreur(400, 'jeton');
  try {
    if (requete.method === 'PUT') {
      const langue = corps.langue === 'en' ? 'en' : 'fr';
      await env.DB.prepare(
        "INSERT INTO notifications_jetons (jeton, joueur_id, langue, maj_le) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(jeton) DO UPDATE SET joueur_id = excluded.joueur_id, langue = excluded.langue, maj_le = excluded.maj_le",
      )
        .bind(jeton, joueur.id, langue)
        .run();
      return json({ ok: true });
    }
    if (requete.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM notifications_jetons WHERE jeton = ? AND joueur_id = ?').bind(jeton, joueur.id).run();
      return json({ ok: true });
    }
  } catch {
    return erreur(503, 'indisponible');
  }
  return null;
}
