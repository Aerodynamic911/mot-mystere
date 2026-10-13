import React from 'react';
import CorpsMascotte from './CorpsMascotte';

/** Version minuscule de la mascotte, pour se promener sur la carte de l'aventure. */
export default function MiniMascotte({ taille = 40 }: { taille?: number }) {
  return <CorpsMascotte largeur={taille} hauteur={taille * 0.95} />;
}
