import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Difficulte, Langue, Preferences, TrancheAge } from '../game/preferences';
import { couleurs, rayon } from '../theme';
import FondAnime from '../ui/FondAnime';

interface Props {
  prefs: Preferences;
  onChange: (prefs: Preferences) => void;
  onRetour: () => void;
}

interface Choix<T> {
  valeur: T;
  titre: string;
  detail?: string;
  indisponible?: boolean;
}

const LANGUES: Choix<Langue>[] = [
  { valeur: 'fr', titre: 'Français' },
  { valeur: 'en', titre: 'English', detail: 'Bientôt disponible', indisponible: true },
];

const DIFFICULTES: Choix<Difficulte>[] = [
  { valeur: 'facile', titre: 'Facile', detail: '2 indices dès le départ' },
  { valeur: 'normal', titre: 'Normal', detail: '1 indice au départ, les autres à la demande' },
  { valeur: 'difficile', titre: 'Difficile', detail: '1 indice au départ, sans bouton « Indice suivant »' },
];

const AGES: Choix<TrancheAge>[] = [
  { valeur: 'tous', titre: 'Tous publics' },
  { valeur: 'enfant', titre: 'Enfants', detail: '6 à 11 ans' },
  { valeur: 'ado', titre: 'Ados', detail: '12 à 17 ans' },
  { valeur: 'adulte', titre: 'Adultes', detail: '18 ans et plus' },
];

export default function PreferencesEcran({ prefs, onChange, onRetour }: Props) {
  return (
    <View style={styles.racine}>
      <FondAnime />
      <View style={styles.entete}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.retour}>‹ Accueil</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>Préférences</Text>
        <View style={styles.espaceur} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <Section titre="Langue">
          {LANGUES.map((c) => (
            <Ligne key={c.valeur} choix={c} actif={prefs.langue === c.valeur} onPress={() => onChange({ ...prefs, langue: c.valeur })} />
          ))}
        </Section>

        <Section titre="Difficulté">
          {DIFFICULTES.map((c) => (
            <Ligne
              key={c.valeur}
              choix={c}
              actif={prefs.difficulte === c.valeur}
              onPress={() => onChange({ ...prefs, difficulte: c.valeur })}
            />
          ))}
        </Section>

        <Section titre="Tranche d'âge">
          {AGES.map((c) => (
            <Ligne key={c.valeur} choix={c} actif={prefs.age === c.valeur} onPress={() => onChange({ ...prefs, age: c.valeur })} />
          ))}
          <Text style={styles.note}>
            Ce choix reste enregistré sur votre téléphone. Il servira à adapter les mystères proposés quand il y en aura davantage.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitre}>{titre}</Text>
      {children}
    </View>
  );
}

function Ligne<T>({ choix, actif, onPress }: { choix: Choix<T>; actif: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.ligne, actif && styles.ligneActive, choix.indisponible && styles.ligneIndisponible]}
      onPress={onPress}
      disabled={choix.indisponible}
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityState={{ selected: actif, disabled: !!choix.indisponible }}
    >
      <View style={[styles.rond, actif && styles.rondActif]}>{actif && <View style={styles.rondCentre} />}</View>
      <View style={styles.ligneTexte}>
        <Text style={styles.ligneTitre}>{choix.titre}</Text>
        {choix.detail ? <Text style={styles.ligneDetail}>{choix.detail}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retour: { color: couleurs.texteSecondaire, fontSize: 16, width: 80 },
  titre: { color: couleurs.texte, fontSize: 18, fontWeight: '700' },
  espaceur: { width: 80 },
  contenu: { padding: 20, paddingTop: 8 },
  section: {
    backgroundColor: 'rgba(26,31,58,0.82)',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitre: { color: couleurs.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10, textTransform: 'uppercase' },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  ligneActive: { backgroundColor: couleurs.carteClaire, borderColor: couleurs.accent },
  ligneIndisponible: { opacity: 0.5 },
  rond: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: couleurs.texteSecondaire,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rondActif: { borderColor: couleurs.accent },
  rondCentre: { width: 10, height: 10, borderRadius: 5, backgroundColor: couleurs.accent },
  ligneTexte: { flex: 1 },
  ligneTitre: { color: couleurs.texte, fontSize: 16, fontWeight: '600' },
  ligneDetail: { color: couleurs.texteSecondaire, fontSize: 13, marginTop: 2 },
  note: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 17, marginTop: 8 },
});
