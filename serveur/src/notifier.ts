// Alerte de moderation sur le telephone de l'administrateur, via ntfy.sh (application gratuite).
// Le sujet (NTFY_TOPIC) est un secret : sans lui, aucune notification n'est envoyee.
// Le message ne contient jamais de pseudo, seulement des nombres.

import type { Env } from './commun';

async function telegram(env: Env, titre: string, message: string): Promise<string> {
  const jeton = (env.TELEGRAM_TOKEN ?? '').trim();
  const salon = (env.TELEGRAM_CHAT_ID ?? '').trim();
  try {
    const r = await fetch(`https://api.telegram.org/bot${jeton}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: salon, text: `${titre}\n${message}\nhttps://admin.occitangames.com`, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    return r.ok ? 'envoye' : 'telegram_' + r.status;
  } catch (e) {
    return 'telegram_injoignable (' + (e instanceof Error ? e.name : 'inconnu') + ')';
  }
}

// Envoie sur chaque canal configure (Telegram, ntfy) ; renvoie le resultat de chacun.
export async function notifier(env: Env, titre: string, message: string): Promise<string> {
  const resultats: string[] = [];
  if (env.TELEGRAM_TOKEN && env.TELEGRAM_CHAT_ID) resultats.push('Telegram : ' + (await telegram(env, titre, message)));
  if (env.NTFY_TOPIC) resultats.push('ntfy : ' + (await ntfy(env, titre, message)));
  return resultats.length ? resultats.join(' | ') : 'aucun_canal_configure';
}

async function ntfy(env: Env, titre: string, message: string): Promise<string> {
  if (!env.NTFY_TOPIC) return 'secret_absent';
  const jeton = (env.NTFY_TOKEN ?? '').trim();
  try {
    const r = await fetch('https://ntfy.sh/' + encodeURIComponent(env.NTFY_TOPIC), {
      method: 'POST',
      body: message,
      headers: {
        Title: titre,
        Click: 'https://admin.occitangames.com',
        Tags: 'speech_balloon',
        // Compte ntfy : la limite d'envoi est alors la notre, et non celle de l'adresse partagee du Worker.
        ...(jeton ? { Authorization: 'Bearer ' + jeton } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });
    return r.ok ? 'envoye' : 'ntfy_' + r.status + (jeton ? '' : '_sans_jeton');
  } catch (e) {
    // la notification est un confort : on n'echoue jamais pour elle
    return 'injoignable (' + (e instanceof Error ? e.name + ' ' + e.message : 'inconnu').slice(0, 80) + ')';
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
