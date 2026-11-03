// Alerte de moderation sur le telephone de l'administrateur, via ntfy.sh (application gratuite).
// Le sujet (NTFY_TOPIC) est un secret : sans lui, aucune notification n'est envoyee.
// Le message ne contient jamais de pseudo, seulement des nombres.

import type { Env } from './commun';

export async function notifier(env: Env, titre: string, message: string): Promise<string> {
  if (!env.NTFY_TOPIC) return 'secret_absent';
  try {
    const r = await fetch('https://ntfy.sh/' + encodeURIComponent(env.NTFY_TOPIC), {
      method: 'POST',
      body: message,
      headers: {
        Title: titre,
        Click: 'https://admin.occitangames.com',
        Tags: 'speech_balloon',
        // Compte ntfy : la limite d'envoi est alors la notre, et non celle de l'adresse partagee du Worker.
        ...(env.NTFY_TOKEN ? { Authorization: 'Bearer ' + env.NTFY_TOKEN } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    return r.ok ? 'envoye' : 'ntfy_' + r.status + (env.NTFY_TOKEN ? '' : '_sans_jeton');
  } catch {
    // la notification est un confort : on n'echoue jamais pour elle
    return 'injoignable';
  }
}

// Rappel quotidien : pseudos en attente et signalements non traites.
export async function rappelModeration(env: Env): Promise<void> {
  const compte = async (sql: string): Promise<number> => (await env.DB.prepare(sql).first<{ n: number }>())?.n ?? 0;
  const pseudos = await compte("SELECT COUNT(*) AS n FROM joueurs WHERE pseudo IS NOT NULL AND statut = 'attente'");
  const signalements = await compte('SELECT COUNT(DISTINCT joueur_signale) AS n FROM signalements WHERE traite = 0');
  if (!pseudos && !signalements) return;
  const lignes = [];
  if (pseudos) lignes.push(`${pseudos} pseudo(s) en attente`);
  if (signalements) lignes.push(`${signalements} joueur(s) signalé(s)`);
  await notifier(env, 'Quizzle : modération', lignes.join(' · '));
}
