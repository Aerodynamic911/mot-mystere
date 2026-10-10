import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

const CLE = 'cluebox:musique';
const VOLUME = 0.7; // la piste est déjà mixée à bas niveau : elle reste en toile de fond

/** Musique d'ambiance en boucle. Respecte le mode silencieux, se met en pause en arrière-plan, et le choix « son coupé » est mémorisé. */
export function useMusique() {
  const lecteur = useAudioPlayer(require('../../assets/audio/ambiance.wav'));
  const [actif, setActif] = useState(true);
  const [prefLue, setPrefLue] = useState(false);
  const [premierPlan, setPremierPlan] = useState(AppState.currentState === 'active');

  useEffect(() => {
    AsyncStorage.getItem(CLE)
      .then((v) => {
        if (v === 'off') setActif(false);
      })
      .catch(() => {})
      .finally(() => setPrefLue(true));
    setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }).catch(
      () => {},
    );
  }, []);

  useEffect(() => {
    lecteur.loop = true;
    lecteur.volume = VOLUME;
  }, [lecteur]);

  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (etat) => setPremierPlan(etat === 'active'));
    return () => abonnement.remove();
  }, []);

  useEffect(() => {
    if (!prefLue) return;
    if (actif && premierPlan) lecteur.play();
    else lecteur.pause();
  }, [actif, premierPlan, prefLue, lecteur]);

  const basculer = useCallback(() => {
    const suivant = !actif;
    setActif(suivant);
    AsyncStorage.setItem(CLE, suivant ? 'on' : 'off').catch(() => {});
  }, [actif]);

  return { actif, basculer };
}
