import type { Env, Joueur } from './commun';

export async function sha256(texte: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, '0')).join('');
}

// Authentification : l'app envoie son identifiant et son secret ; le serveur ne garde que l'empreinte.
export async function authentifier(requete: Request, env: Env): Promise<Joueur | null> {
  const id = requete.headers.get('x-joueur-id');
  const secret = requete.headers.get('x-joueur-secret');
  if (!id || !secret || id.length > 64 || secret.length > 128) return null;
  const joueur = await env.DB.prepare('SELECT * FROM joueurs WHERE id = ?').bind(id).first<Joueur>();
  if (!joueur) return null;
  if ((await sha256(secret)) !== joueur.secret_hash) return null;
  await env.DB.prepare("UPDATE joueurs SET derniere_activite = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
  return joueur;
}
