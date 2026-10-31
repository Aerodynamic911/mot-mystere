import { LIEN_QUIZZLE } from '../config';
import { tr } from '../i18n';

/** Lien joint aux partages : on ne connaît pas le téléphone du destinataire, donc un lien universel qui l'envoie vers son store. */
export const LIEN_PARTAGE = LIEN_QUIZZLE;

/** Invitation ajoutée à la fin de chaque message de partage. */
export function invitation(): string {
  return tr(
    '🧠 Quizzle : le jeu de culture générale qui rend accro. Gratuit, sans pub, créé en famille 💛\n👉 {lien}',
    '🧠 Quizzle: the addictive general-knowledge game. Free, no ads, made by a family 💛\n👉 {lien}',
    { lien: LIEN_PARTAGE },
  );
}

/** Message de partage complet : le résultat, puis l'invitation avec le lien de téléchargement. */
export function messagePartage(corps: string): string {
  return `${corps}\n\n${invitation()}`;
}
