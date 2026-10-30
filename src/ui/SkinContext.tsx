import { createContext, useContext } from 'react';
import { SKIN_PAR_DEFAUT } from '../game/skins';

/** Skin de mascotte actuellement équipé : lu par la mascotte de l'accueil et celle de la carte. */
export const SkinContext = createContext<string>(SKIN_PAR_DEFAUT);

export function useSkin(): string {
  return useContext(SkinContext);
}
