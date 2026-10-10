import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar as BarreAndroid, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mystere } from './src/data/mysteres';
import { cleDuJour, mystereAleatoire, mystereDuJour, numeroDuJour } from './src/game/engine';
import {
  EtatDuJour,
  STATS_VIDES,
  Stats,
  chargerJour,
  chargerStats,
  enregistrerResultat,
  sauverJour,
  sauverStats,
  serieAffichee,
} from './src/game/storage';
import { PREFERENCES_PAR_DEFAUT, Preferences, chargerPreferences, sauverPreferences } from './src/game/preferences';
import Game from './src/screens/Game';
import PreferencesEcran from './src/screens/Preferences';
import { useMusique } from './src/audio/musique';
import Home from './src/screens/Home';
import Splash from './src/screens/Splash';
import { couleurs } from './src/theme';

type Ecran = { nom: 'accueil' } | { nom: 'preferences' } | { nom: 'jour' } | { nom: 'libre'; mystere: Mystere; run: number };

export default function App() {
  const [pret, setPret] = useState(false);
  // L'écran de chargement reste affiché au moins ce temps, même si les données sont prêtes plus tôt.
  const [delaiEcoule, setDelaiEcoule] = useState(false);
  const [stats, setStats] = useState<Stats>(STATS_VIDES);
  const [jour, setJour] = useState<EtatDuJour | null>(null);
  const [prefs, setPrefs] = useState<Preferences>(PREFERENCES_PAR_DEFAUT);
  const [ecran, setEcran] = useState<Ecran>({ nom: 'accueil' });
  const musique = useMusique();

  const cle = cleDuJour();
  const mystereJour = mystereDuJour(cle);
  const numero = numeroDuJour(cle);

  useEffect(() => {
    (async () => {
      const [s, j, p] = await Promise.all([chargerStats(), chargerJour(), chargerPreferences()]);
      setStats(s);
      setJour(j);
      setPrefs(p);
      setPret(true);
    })();
    const minuteur = setTimeout(() => setDelaiEcoule(true), 2200);
    return () => clearTimeout(minuteur);
  }, []);

  // L'état du jour n'est valable que pour la date courante.
  const jourCourant = jour && jour.cle === cle ? jour : null;

  function progression(propositions: string[]) {
    const etat: EtatDuJour = { cle, propositions, terminee: false, gagnee: false };
    setJour(etat);
    sauverJour(etat);
  }

  function terminee(propositions: string[], gagne: boolean) {
    const etat: EtatDuJour = { cle, propositions, terminee: true, gagnee: gagne };
    const nouvellesStats = enregistrerResultat(stats, cle, gagne, propositions.length);
    setJour(etat);
    setStats(nouvellesStats);
    sauverJour(etat);
    sauverStats(nouvellesStats);
  }

  function changerPreferences(p: Preferences) {
    setPrefs(p);
    sauverPreferences(p);
  }

  function lancerPartieLibre(precedent?: Mystere) {
    setEcran((e) => ({
      nom: 'libre',
      mystere: mystereAleatoire(precedent?.id),
      run: e.nom === 'libre' ? e.run + 1 : 1,
    }));
  }

  if (!pret || !delaiEcoule) {
    return (
      <SafeAreaView style={styles.racine}>
        <StatusBar style="light" />
        <Splash />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.racine}>
      <StatusBar style="light" />
      {ecran.nom === 'accueil' && (
        <Home
          numero={numero}
          serie={serieAffichee(stats, cle)}
          stats={stats}
          jourTermine={!!jourCourant?.terminee}
          jourGagne={!!jourCourant?.gagnee}
          musiqueActive={musique.actif}
          onToggleMusique={musique.basculer}
          onJouerDuJour={() => setEcran({ nom: 'jour' })}
          onPartieLibre={() => lancerPartieLibre()}
          onPreferences={() => setEcran({ nom: 'preferences' })}
        />
      )}

      {ecran.nom === 'preferences' && (
        <PreferencesEcran prefs={prefs} onChange={changerPreferences} onRetour={() => setEcran({ nom: 'accueil' })} />
      )}

      {ecran.nom === 'jour' && (
        <Game
          key={`jour-${cle}`}
          difficulte={prefs.difficulte}
          mystere={mystereJour}
          titre={`Mystère n°${numero}`}
          numero={numero}
          propositionsInitiales={jourCourant?.propositions ?? []}
          onProgression={progression}
          onTerminee={terminee}
          onRetour={() => setEcran({ nom: 'accueil' })}
        />
      )}

      {ecran.nom === 'libre' && (
        <Game
          key={`libre-${ecran.run}`}
          difficulte={prefs.difficulte}
          mystere={ecran.mystere}
          titre="Partie libre"
          propositionsInitiales={[]}
          onRetour={() => setEcran({ nom: 'accueil' })}
          onRejouer={() => lancerPartieLibre(ecran.mystere)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView ne protège que iOS : sur Android, on laisse la place de la barre d'état (heure, batterie).
  racine: {
    flex: 1,
    backgroundColor: couleurs.fond,
    paddingTop: Platform.OS === 'android' ? (BarreAndroid.currentHeight ?? 24) : 0,
  },
});
