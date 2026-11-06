import { useEffect, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';

/**
 * Vrai quand la place disponible (hauteur de la fenêtre moins le clavier ouvert) est faible.
 * Sur Android, la hauteur de la fenêtre ne change pas à l'ouverture du clavier : on mesure donc le clavier.
 */
export function useEcranCompact(seuil = 520): boolean {
  const { height } = useWindowDimensions();
  const [clavier, setClavier] = useState(0);
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const ouvre = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setClavier(e.endCoordinates.height));
    const ferme = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setClavier(0));
    return () => {
      ouvre.remove();
      ferme.remove();
    };
  }, []);
  return height - clavier < seuil;
}
