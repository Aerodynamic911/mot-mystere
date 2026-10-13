import React, { useEffect, useState } from 'react';
import { definirEffetsActifs } from './src/audio/effets';
import { Platform, SafeAreaView, StatusBar as BarreAndroid, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { EVENEMENTS, NB_ETAPES, evenementEnCours } from './src/data/evenements';
import { NB_VUS_GARDES, choisirMystereAventure, essaisAventure, essaisEtape, mystereParId } from './src/game/aventure';
import { Mystere } from './src/data/mysteres';
import { cleDuJour, mystereDuJour, numeroDuJour } from './src/game/engine';
import {
  EtatDuJour,
  ModeJeu,
  STATS_VIDES,
  Stats,
  chargerJour,
  chargerStats,
  enregistrerPartie,
  sauverJour,
  sauverStats,
  serieAffichee,
} from './src/game/storage';
import { PREFERENCES_PAR_DEFAUT, Preferences, chargerPreferences, sauverPreferences } from './src/game/preferences';
import { definirLangue, tr } from './src/i18n';
import {
  PROGRESSION_VIDE,
  Progression,
  chargerProgression,
  etapeReussie,
  evenementDe,
  niveauReussi,
  sauverProgression,
} from './src/game/progression';
import { carteParId } from './src/data/cartes';
import { cartesMeritees, chargerCollection, sauverCollection } from './src/game/collection';
import Aventure from './src/screens/Aventure';
import Collection from './src/screens/Collection';
import RecompenseModal, { Recompense } from './src/ui/RecompenseModal';
import EvenementCarte from './src/screens/EvenementCarte';
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
  | { nom: 'aventure' }
  | { nom: 'aventure-jeu'; niveau: number; essai: number; mystere: Mystere }
  | { nom: 'collection' }
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
  // Dernier niveau d'aventure affiché sur la carte : la mascotte part de là pour avancer jusqu'au niveau actuel.
  const [niveauVu, setNiveauVu] = useState(1);
  // Étape d'événement qui vient d'être réussie : la carte la fait rebondir avant de passer à la suivante.
  const [etapeAnimee, setEtapeAnimee] = useState<{ id: string; etape: number } | null>(null);
  // Cartes obtenues et récompenses à montrer au joueur (cartes, bonus de série).
  const [collection, setCollection] = useState<string[]>([]);
  const [recompenses, setRecompenses] = useState<Recompense[]>([]);
  const [ecran, setEcran] = useState<Ecran>({ nom: 'accueil' });
  // La langue est appliquée avant chaque affichage : tous les écrans se rafraîchissent avec ce composant.
  definirLangue(prefs.langue);
  const musique = useMusique();
  // Les bruitages suivent le bouton son de l'accueil.
  useEffect(() => definirEffetsActifs(musique.actif), [musique.actif]);

  const cle = cleDuJour();
  const mystereJour = mystereDuJour(cle);
  const numero = numeroDuJour(cle);

  useEffect(() => {
    (async () => {
      const [s, j, p, pr, col] = await Promise.all([
        chargerStats(),
        chargerJour(),
        chargerPreferences(),
        chargerProgression(),
        chargerCollection(),
      ]);
      setStats(s);
      setJour(j);
      setPrefs(p);
      setProg(pr);
      // Cartes déjà méritées avant l'arrivée de la collection : elles sont remises au joueur.
      const dues = cartesMeritees(pr, s, col);
      setCollection([...col, ...dues]);
      if (dues.length) {
        sauverCollection([...col, ...dues]);
        setRecompenses(dues.map((id) => carteParId(id)).filter((c) => !!c).map((carte) => ({ type: 'carte' as const, carte: carte! })));
      }
      setNiveauVu(pr.aventure.niveau);
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

  /**
   * Fin d'une partie, quel que soit le mode : statistiques, bonus de série et cartes gagnées.
   * `progApres` est la progression une fois la partie prise en compte.
   */
  function finDePartie(mode: ModeJeu, propositions: string[], gagne: boolean, progApres: Progression) {
    const { stats: nouvellesStats, bonus } = enregistrerPartie(stats, mode, cle, propositions, gagne);
    setStats(nouvellesStats);
    sauverStats(nouvellesStats);
    const nouvelles = cartesMeritees(progApres, nouvellesStats, collection);
    if (nouvelles.length) {
      const liste = [...collection, ...nouvelles];
      setCollection(liste);
      sauverCollection(liste);
    }
    const recomp: Recompense[] = [
      ...bonus.map((b) => ({ type: 'bonus' as const, bonus: b })),
      ...nouvelles.map((id) => carteParId(id)).filter((c) => !!c).map((carte) => ({ type: 'carte' as const, carte: carte! })),
    ];
    // Un instant après la fin de la partie, pour laisser jouer les animations de résultat.
    if (recomp.length) setTimeout(() => setRecompenses((r) => [...r, ...recomp]), 1500);
  }

  function utiliserJoker() {
    if (stats.jokers <= 0) return;
    const s2 = { ...stats, jokers: stats.jokers - 1, jokersUtilises: stats.jokersUtilises + 1 };
    setStats(s2);
    sauverStats(s2);
  }

  function terminee(propositions: string[], gagne: boolean) {
    const etat: EtatDuJour = { cle, propositions, terminee: true, gagnee: gagne };
    setJour(etat);
    sauverJour(etat);
    finDePartie('jour', propositions, gagne, prog);
  }

  /** Lance un niveau d'aventure : on reprend le mystère d'un niveau commencé, sinon on en choisit un qu'on n'a pas vu récemment. */
  function lancerNiveau(niveau: number, essai: number, nouveau: boolean) {
    const enCours = prog.aventure.enCours;
    let mystere = !nouveau && enCours?.niveau === niveau ? mystereParId(enCours.id) : null;
    if (!mystere) {
      mystere = choisirMystereAventure(niveau, prog.aventure.vus);
      changerProgression({
        ...prog,
        aventure: { ...prog.aventure, vus: [...prog.aventure.vus, mystere.id].slice(-NB_VUS_GARDES), enCours: { niveau, id: mystere.id } },
      });
    }
    setEcran({ nom: 'aventure-jeu', niveau, essai, mystere });
  }

  function changerPreferences(p: Preferences) {
    setPrefs(p);
    sauverPreferences(p);
  }

  function changerProgression(p: Progression) {
    setProg(p);
    sauverProgression(p);
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
          onPreferences={() => setEcran({ nom: 'preferences' })}
          niveauAventure={prog.aventure.niveau}
          etapesFaites={evenementDe(prog, evenementEnCours().id).faites}
          etapesTotal={NB_ETAPES}
          onAventure={() => setEcran({ nom: 'aventure' })}
          onEvenement={() => setEcran({ nom: 'evenement', id: evenementEnCours().id })}
          serieVictoires={stats.serieVictoires}
          jokers={stats.jokers}
          nbCartes={collection.length}
          onCollection={() => setEcran({ nom: 'collection' })}
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
          titre={tr('Mystère n°{n}', 'Mystery No.{n}', { n: numero })}
          numero={numero}
          propositionsInitiales={jourCourant?.propositions ?? []}
          onProgression={progression}
          onTerminee={terminee}
          jokers={stats.jokers}
          onJoker={utiliserJoker}
          onRetour={() => setEcran({ nom: 'accueil' })}
        />
      )}

      {ecran.nom === 'aventure' && (
        <Aventure
          progression={prog}
          depuis={niveauVu}
          onArrive={() => setNiveauVu(prog.aventure.niveau)}
          onJouer={() => lancerNiveau(prog.aventure.niveau, 0, false)}
          onRetour={() => setEcran({ nom: 'accueil' })}
        />
      )}

      {ecran.nom === 'aventure-jeu' && (
        <Game
          key={`av-${ecran.niveau}-${ecran.essai}`}
          difficulte={prefs.difficulte}
          mystere={ecran.mystere}
          titre={tr('Niveau {n}', 'Level {n}', { n: ecran.niveau })}
          maxEssais={essaisAventure(ecran.niveau)}
          libellePartage={tr('Boxtery · Aventure niveau {n}', 'Boxtery · Adventure level {n}', { n: ecran.niveau })}
          propositionsInitiales={[]}
          jokers={stats.jokers}
          onJoker={utiliserJoker}
          onTerminee={(propositions, gagne) => {
            let apres = prog;
            if (gagne && ecran.niveau === prog.aventure.niveau) apres = niveauReussi(prog, propositions.length);
            // Un échec libère le niveau : en y revenant, on aura un autre mystère.
            else if (!gagne) apres = { ...prog, aventure: { ...prog.aventure, enCours: null } };
            if (apres !== prog) changerProgression(apres);
            finDePartie('aventure', propositions, gagne, apres);
          }}
          onRetour={() => setEcran({ nom: 'aventure' })}
          actionFin={(gagne) =>
            gagne
              ? { libelle: tr('Avancer sur la carte 🗺️', 'Move forward on the map 🗺️'), onPress: () => setEcran({ nom: 'aventure' }) }
              : { libelle: tr('Réessayer ce niveau', 'Retry this level'), onPress: () => lancerNiveau(ecran.niveau, ecran.essai + 1, true) }
          }
        />
      )}

      {ecran.nom === 'evenement' && (
        <EvenementCarte
          evenement={EVENEMENTS.find((e) => e.id === ecran.id)!}
          progression={evenementDe(prog, ecran.id)}
          etapeAnimee={etapeAnimee?.id === ecran.id ? etapeAnimee.etape : null}
          onAnimeFini={() => setEtapeAnimee(null)}
          onJouerEtape={(etape) => {
            // Une étape déjà réussie ne se rejoue pas : seule l'étape en cours est accessible.
            if (etape === evenementDe(prog, ecran.id).faites + 1) setEcran({ nom: 'etape', id: ecran.id, etape });
          }}
          onRetour={() => setEcran({ nom: 'accueil' })}
        />
      )}

      {ecran.nom === 'etape' && (
        <Game
          key={`etape-${ecran.id}-${ecran.etape}`}
          difficulte={prefs.difficulte}
          mystere={EVENEMENTS.find((e) => e.id === ecran.id)!.etapes[ecran.etape - 1]}
          titre={tr('Étape {n}/{t}', 'Step {n}/{t}', { n: ecran.etape, t: NB_ETAPES })}
          maxEssais={essaisEtape(ecran.etape)}
          libellePartage={`Boxtery · ${EVENEMENTS.find((e) => e.id === ecran.id)!.titre} ${ecran.etape}/${NB_ETAPES}`}
          propositionsInitiales={[]}
          jokers={stats.jokers}
          onJoker={utiliserJoker}
          onTerminee={(propositions, gagne) => {
            let apres = prog;
            if (gagne) {
              apres = etapeReussie(prog, ecran.id, ecran.etape, propositions.length);
              changerProgression(apres);
              setEtapeAnimee({ id: ecran.id, etape: ecran.etape });
            }
            finDePartie('evenement', propositions, gagne, apres);
          }}
          onRetour={() => setEcran({ nom: 'evenement', id: ecran.id })}
          // Après une victoire on repasse par la carte : l'étape se coche et la suivante s'illumine.
          actionFin={(gagne) => ({
            libelle: !gagne ? tr('Retour à la carte', 'Back to the map') : ecran.etape < NB_ETAPES ? tr('Continuer 🗺️', 'Continue 🗺️') : tr('🏆 Terminer', '🏆 Finish'),
            onPress: () => setEcran({ nom: 'evenement', id: ecran.id }),
          })}
        />
      )}

      {ecran.nom === 'collection' && (
        <Collection possedees={collection} progression={prog} stats={stats} onRetour={() => setEcran({ nom: 'accueil' })} />
      )}

      <RecompenseModal
        recompense={recompenses[0] ?? null}
        suivantes={Math.max(0, recompenses.length - 1)}
        onFermer={() => setRecompenses((r) => r.slice(1))}
      />
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
