import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar as BarreAndroid, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { EVENEMENTS, NB_ETAPES } from './src/data/evenements';
import { Mystere } from './src/data/mysteres';
import { essaisAventure, essaisEtape, mystereAventure } from './src/game/aventure';
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
import {
  PROGRESSION_VIDE,
  Progression,
  chargerProgression,
  etapeReussie,
  evenementDe,
  niveauReussi,
  sauverProgression,
} from './src/game/progression';
import Aventure from './src/screens/Aventure';
import EvenementCarte from './src/screens/EvenementCarte';
import Evenements from './src/screens/Evenements';
import Game from './src/screens/Game';
import PreferencesEcran from './src/screens/Preferences';
import { useMusique } from './src/audio/musique';
import Home from './src/screens/Home';
import Splash, { DUREE_CHARGEMENT, FOND_SPLASH } from './src/screens/Splash';
import { couleurs } from './src/theme';

type Ecran =
  | { nom: 'accueil' }
  | { nom: 'preferences' }
  | { nom: 'jour' }
  | { nom: 'libre'; mystere: Mystere; run: number }
  | { nom: 'aventure' }
  | { nom: 'aventure-jeu'; niveau: number; essai: number }
  | { nom: 'evenements' }
  | { nom: 'evenement'; id: string }
  | { nom: 'etape'; id: string; etape: number };

export default function App() {
  const [pret, setPret] = useState(false);
  // L'écran de chargement reste affiché au moins ce temps, même si les données sont prêtes plus tôt.
  const [delaiEcoule, setDelaiEcoule] = useState(false);
  const [stats, setStats] = useState<Stats>(STATS_VIDES);
  const [jour, setJour] = useState<EtatDuJour | null>(null);
  const [prefs, setPrefs] = useState<Preferences>(PREFERENCES_PAR_DEFAUT);
  const [prog, setProg] = useState<Progression>(PROGRESSION_VIDE);
  const [ecran, setEcran] = useState<Ecran>({ nom: 'accueil' });
  const musique = useMusique();

  const cle = cleDuJour();
  const mystereJour = mystereDuJour(cle);
  const numero = numeroDuJour(cle);

  useEffect(() => {
    (async () => {
      const [s, j, p, pr] = await Promise.all([chargerStats(), chargerJour(), chargerPreferences(), chargerProgression()]);
      setStats(s);
      setJour(j);
      setPrefs(p);
      setProg(pr);
      setPret(true);
    })();
    const minuteur = setTimeout(() => setDelaiEcoule(true), DUREE_CHARGEMENT);
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

  function changerProgression(p: Progression) {
    setProg(p);
    sauverProgression(p);
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
      <SafeAreaView style={[styles.racine, { backgroundColor: FOND_SPLASH }]}>
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
          niveauAventure={prog.aventure.niveau}
          etapesFaites={EVENEMENTS.reduce((somme, ev) => somme + evenementDe(prog, ev.id).faites, 0)}
          etapesTotal={EVENEMENTS.length * NB_ETAPES}
          onAventure={() => setEcran({ nom: 'aventure' })}
          onEvenements={() => setEcran({ nom: 'evenements' })}
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
          actionFin={() => ({ libelle: 'Mystère suivant', onPress: () => lancerPartieLibre(ecran.mystere) })}
        />
      )}

      {ecran.nom === 'aventure' && (
        <Aventure
          progression={prog}
          onJouer={() => setEcran({ nom: 'aventure-jeu', niveau: prog.aventure.niveau, essai: 0 })}
          onRetour={() => setEcran({ nom: 'accueil' })}
        />
      )}

      {ecran.nom === 'aventure-jeu' && (
        <Game
          key={`av-${ecran.niveau}-${ecran.essai}`}
          difficulte={prefs.difficulte}
          mystere={mystereAventure(ecran.niveau, ecran.essai)}
          titre={`Niveau ${ecran.niveau}`}
          maxEssais={essaisAventure(ecran.niveau)}
          libellePartage={`Boxtery · Aventure niveau ${ecran.niveau}`}
          propositionsInitiales={[]}
          onTerminee={(propositions, gagne) => {
            if (gagne && ecran.niveau === prog.aventure.niveau) changerProgression(niveauReussi(prog, propositions.length));
          }}
          onRetour={() => setEcran({ nom: 'aventure' })}
          actionFin={(gagne) =>
            gagne
              ? { libelle: 'Niveau suivant', onPress: () => setEcran({ nom: 'aventure-jeu', niveau: ecran.niveau + 1, essai: 0 }) }
              : { libelle: 'Réessayer ce niveau', onPress: () => setEcran({ nom: 'aventure-jeu', niveau: ecran.niveau, essai: ecran.essai + 1 }) }
          }
        />
      )}

      {ecran.nom === 'evenements' && (
        <Evenements progression={prog} onChoisir={(id) => setEcran({ nom: 'evenement', id })} onRetour={() => setEcran({ nom: 'accueil' })} />
      )}

      {ecran.nom === 'evenement' && (
        <EvenementCarte
          evenement={EVENEMENTS.find((e) => e.id === ecran.id)!}
          progression={evenementDe(prog, ecran.id)}
          onJouerEtape={(etape) => setEcran({ nom: 'etape', id: ecran.id, etape })}
          onRetour={() => setEcran({ nom: 'evenements' })}
        />
      )}

      {ecran.nom === 'etape' && (
        <Game
          key={`etape-${ecran.id}-${ecran.etape}`}
          difficulte={prefs.difficulte}
          mystere={EVENEMENTS.find((e) => e.id === ecran.id)!.etapes[ecran.etape - 1]}
          titre={`${EVENEMENTS.find((e) => e.id === ecran.id)!.titre} · ${ecran.etape}/${NB_ETAPES}`}
          maxEssais={essaisEtape(ecran.etape)}
          libellePartage={`Boxtery · ${EVENEMENTS.find((e) => e.id === ecran.id)!.titre} ${ecran.etape}/${NB_ETAPES}`}
          propositionsInitiales={[]}
          onTerminee={(propositions, gagne) => {
            if (gagne) changerProgression(etapeReussie(prog, ecran.id, ecran.etape, propositions.length));
          }}
          onRetour={() => setEcran({ nom: 'evenement', id: ecran.id })}
          actionFin={(gagne) =>
            gagne && ecran.etape < NB_ETAPES
              ? { libelle: 'Étape suivante', onPress: () => setEcran({ nom: 'etape', id: ecran.id, etape: ecran.etape + 1 }) }
              : { libelle: gagne ? '🏆 Terminer' : 'Retour à la carte', onPress: () => setEcran({ nom: 'evenement', id: ecran.id }) }
          }
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
