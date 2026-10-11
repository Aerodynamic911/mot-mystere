import { AudioPlayer, createAudioPlayer } from 'expo-audio';

/** Bruitages courts du jeu. Ils suivent le bouton son de l'accueil : son coupé, aucun bruitage. */
const SOURCES = {
  pop: require('../../assets/audio/pop.wav'),
  victoire: require('../../assets/audio/victoire.wav'),
  echec: require('../../assets/audio/echec.wav'),
  indice: require('../../assets/audio/indice.wav'),
};

export type Effet = keyof typeof SOURCES;

let actifs = true;
const lecteurs: Partial<Record<Effet, AudioPlayer>> = {};

export function definirEffetsActifs(actif: boolean) {
  actifs = actif;
}

export function jouerEffet(nom: Effet) {
  if (!actifs) return;
  try {
    let lecteur = lecteurs[nom];
    if (!lecteur) {
      lecteur = createAudioPlayer(SOURCES[nom]);
      lecteur.volume = 0.8;
      lecteurs[nom] = lecteur;
    }
    // Rejoue depuis le début, même si le son précédent n'est pas fini.
    lecteur.seekTo(0).catch(() => {});
    lecteur.play();
  } catch {
    // Un bruitage qui échoue ne doit jamais gêner la partie.
  }
}
