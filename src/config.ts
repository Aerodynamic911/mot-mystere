import { Platform } from 'react-native';

/** Nom de l'éditeur affiché sur l'écran de chargement. À remplacer par le nom définitif. */
export const EDITEUR = 'Occitan Games';

export const LIEN_APP_STORE = 'https://apps.apple.com/fr/app/quizzle/id6826238020';
/** À renseigner quand la fiche Google Play sera publique. */
export const LIEN_PLAY_STORE = '';

/** Lien de téléchargement de l'appli, ajouté aux messages d'invitation et de partage (celui du store de l'appareil). */
export const LIEN_APP = Platform.OS === 'ios' ? LIEN_APP_STORE : LIEN_PLAY_STORE;

/** Nombre de partages nécessaires pour gagner un joker. */
export const PARTAGES_PAR_JOKER = 3;
