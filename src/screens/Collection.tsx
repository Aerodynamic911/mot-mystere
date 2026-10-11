import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Carte, MYSTERES_PAR_CARTE_JOUR, NIVEAUX_PAR_CARTE_AVENTURE, carteAventure, carteEvenement, carteJour, carteParId } from '../data/cartes';
import { EVENEMENTS } from '../data/evenements';
import { Progression } from '../game/progression';
import { Stats } from '../game/storage';
import { couleurs } from '../theme';
import CarteVisuelle from '../ui/CarteVisuelle';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

interface Props {
  possedees: string[];
  progression: Progression;
  stats: Stats;
  onRetour: () => void;
}

const COLONNES = 3;
const ECART = 10;

/** Page des cartes à collectionner : celles qu'on a obtenues, et la prochaine à gagner dans chaque catégorie. */
export default function Collection({ possedees, progression, stats, onRetour }: Props) {
  const { width } = useWindowDimensions();
  const largeur = Math.floor((width - 40 - ECART * (COLONNES - 1)) / COLONNES);

  const avoir = (prefixe: string): Carte[] =>
    possedees
      .filter((id) => id.startsWith(prefixe))
      .map((id) => carteParId(id))
      .filter((c): c is Carte => !!c)
      .sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));

  const aventure = avoir('av-');
  const jour = avoir('jr-');
  const prochaineAventure = aventure.length + 1;
  const prochaineJour = jour.length + 1;
  const niveauxReussis = progression.aventure.niveau - 1;
  const victoiresJour = stats.modes.jour.victoires;

  const total = possedees.filter((id) => carteParId(id)).length;

  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre="Collection" onRetour={onRetour} />
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.resume}>🃏 {total} carte{total > 1 ? 's' : ''} obtenue{total > 1 ? 's' : ''}</Text>

        <Section titre="🗺️ Aventure" note={`Une carte tous les ${NIVEAUX_PAR_CARTE_AVENTURE} niveaux réussis`}>
          {aventure.map((c) => (
            <CarteVisuelle key={c.id} carte={c} largeur={largeur} />
          ))}
          <CarteVisuelle
            carte={carteAventure(prochaineAventure)}
            largeur={largeur}
            verrouillee
            consigne={`Réussir le niveau ${prochaineAventure * NIVEAUX_PAR_CARTE_AVENTURE} (${Math.min(niveauxReussis, prochaineAventure * NIVEAUX_PAR_CARTE_AVENTURE)}/${prochaineAventure * NIVEAUX_PAR_CARTE_AVENTURE})`}
          />
        </Section>

        <Section titre="🎉 Événements" note="Une carte quand l'événement est terminé (20 étapes)">
          {EVENEMENTS.map((e) => {
            const c = carteEvenement(e);
            const faites = progression.evenements[e.id]?.faites ?? 0;
            return possedees.includes(c.id) ? (
              <CarteVisuelle key={c.id} carte={c} largeur={largeur} />
            ) : (
              <CarteVisuelle key={c.id} carte={c} largeur={largeur} verrouillee consigne={`${e.titre} : ${faites}/20 étapes`} />
            );
          })}
        </Section>

        <Section titre="📅 Mystère du jour" note={`Une carte tous les ${MYSTERES_PAR_CARTE_JOUR} mystères du jour résolus`}>
          {jour.map((c) => (
            <CarteVisuelle key={c.id} carte={c} largeur={largeur} />
          ))}
          <CarteVisuelle
            carte={carteJour(prochaineJour)}
            largeur={largeur}
            verrouillee
            consigne={`${Math.min(victoiresJour, prochaineJour * MYSTERES_PAR_CARTE_JOUR)}/${prochaineJour * MYSTERES_PAR_CARTE_JOUR} mystères du jour`}
          />
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ titre, note, children }: { titre: string; note: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitre}>{titre}</Text>
      <Text style={styles.sectionNote}>{note}</Text>
      <View style={styles.grille}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { paddingHorizontal: 20, paddingBottom: 40 },
  resume: { color: couleurs.texte, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  section: { marginTop: 18 },
  sectionTitre: { color: couleurs.accent, fontSize: 18, fontWeight: '800' },
  sectionNote: { color: couleurs.texteSecondaire, fontSize: 12, marginTop: 2, marginBottom: 10 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: ECART },
});
