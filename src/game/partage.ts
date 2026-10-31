import { LIEN_APP, LIEN_APP_STORE } from '../config';
import { tr } from '../i18n';

/** Lien joint aux partages : celui du store de l'appareil, sinon l'App Store (la plupart des amis y sont). */
export const LIEN_PARTAGE = LIEN_APP || LIEN_APP_STORE;

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
