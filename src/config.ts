import { Platform } from 'react-native';

/** Nom de l'éditeur affiché sur l'écran de chargement. À remplacer par le nom définitif. */
export const EDITEUR = 'Occitan Games';

export const LIEN_APP_STORE = 'https://apps.apple.com/fr/app/quizzle/id6826238020';
/** À renseigner quand la fiche Google Play sera publique. */
export const LIEN_PLAY_STORE: string = 'https://play.google.com/store/apps/details?id=com.occitangames.quizzle';

/** Lien de téléchargement de l'appli, ajouté aux messages d'invitation et de partage (celui du store de l'appareil). */
export const LIEN_APP = Platform.OS === 'ios' ? LIEN_APP_STORE : LIEN_PLAY_STORE;

/** Lien universel des partages : la page envoie chacun vers son store (iPhone, Android). Il ne change jamais : seule la page évolue. */
export const LIEN_QUIZZLE = 'https://occitangames.com/quizzle';

/** Page « Rédiger un avis » de l'App Store (ouvre directement l'écran d'avis). Vide si le store n'a pas de lien d'avis. */
export const LIEN_AVIS: string = Platform.OS === 'ios' ? `${LIEN_APP_STORE}?action=write-review` : LIEN_PLAY_STORE;

/** Nombre de partages nécessaires pour gagner un joker. */
export const PARTAGES_PAR_JOKER = 3;

/** Serveur de Quizzle (Cloudflare) : pseudo, amis, groupes. Rien n'y est envoyé tant que le joueur n'a pas créé son profil. */
export const URL_SERVEUR = 'https://api.occitangames.com';
