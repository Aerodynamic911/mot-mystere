import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CREDITS_IMAGES } from '../data/imagesCredits';
import { IMAGES } from '../data/images';
import { Difficulte, Langue, Preferences, TrancheAge } from '../game/preferences';
import { tr } from '../i18n';
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
  { valeur: 'en', titre: 'English' },
];

// Fonctions (et non constantes) : les textes suivent la langue choisie.
const difficultes = (): Choix<Difficulte>[] => [
  { valeur: 'facile', titre: tr('Facile', 'Easy'), detail: tr('2 indices dès le départ', '2 clues from the start') },
  { valeur: 'normal', titre: tr('Normal', 'Normal'), detail: tr('1 indice au départ, les autres à la demande', '1 clue at the start, the others on request') },
  { valeur: 'difficile', titre: tr('Difficile', 'Hard'), detail: tr('1 indice au départ, sans bouton « Indice suivant »', '1 clue at the start, no “Next clue” button') },
];

const ages = (): Choix<TrancheAge>[] => [
  { valeur: 'tous', titre: tr('Tous publics', 'All ages') },
  { valeur: 'ado', titre: tr('Ados', 'Teens'), detail: tr('13 à 17 ans', 'Ages 13 to 17') },
  { valeur: 'a18', titre: tr('18 – 30 ans', 'Ages 18 to 30') },
  { valeur: 'a30', titre: tr('30 – 50 ans', 'Ages 30 to 50') },
  { valeur: 'a50', titre: tr('50 ans et plus', '50 and over') },
];

export default function PreferencesEcran({ prefs, onChange, onRetour }: Props) {
  const [creditsOuverts, setCreditsOuverts] = useState(false);
  return (
    <View style={styles.racine}>
      <FondAnime />
      <View style={styles.entete}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.retour}>{tr('‹ Accueil', '‹ Home')}</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>{tr('Préférences', 'Settings')}</Text>
        <View style={styles.espaceur} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <Section titre={tr('Langue', 'Language')}>
          {LANGUES.map((c) => (
            <Ligne key={c.valeur} choix={c} actif={prefs.langue === c.valeur} onPress={() => onChange({ ...prefs, langue: c.valeur })} />
          ))}
        </Section>

        <Section titre={tr('Difficulté', 'Difficulty')}>
          {difficultes().map((c) => (
            <Ligne
              key={c.valeur}
              choix={c}
              actif={prefs.difficulte === c.valeur}
              onPress={() => onChange({ ...prefs, difficulte: c.valeur })}
            />
          ))}
        </Section>

        <Section titre={tr("Tranche d'âge", 'Age group')}>
          {ages().map((c) => (
            <Ligne key={c.valeur} choix={c} actif={prefs.age === c.valeur} onPress={() => onChange({ ...prefs, age: c.valeur })} />
          ))}
          <Text style={styles.note}>
            {tr(
              'Ce choix reste enregistré sur votre téléphone. Les énigmes proposées sont adaptées à votre tranche d\'âge, avec toujours un tronc commun pour tous.',
              'This choice is stored on your phone. The riddles offered are adapted to your age group, always with a common base for everyone.',
            )}
          </Text>
        </Section>

        {CREDITS_IMAGES.length > 0 && (
          <Section titre={tr('Crédits des images', 'Picture credits')}>
            <TouchableOpacity onPress={() => setCreditsOuverts((o) => !o)} activeOpacity={0.8}>
              <Text style={styles.note}>
                {creditsOuverts
                  ? tr('Masquer les crédits ▲', 'Hide credits ▲')
                  : tr('Photos et œuvres du mode Image, via Wikimedia Commons. Afficher les crédits ▼', 'Photos and artworks in Picture mode, via Wikimedia Commons. Show credits ▼')}
              </Text>
            </TouchableOpacity>
            {creditsOuverts &&
              CREDITS_IMAGES.map((c) => (
                <TouchableOpacity key={c.id} onPress={() => Linking.openURL(c.lien).catch(() => {})} activeOpacity={0.8}>
                  <Text style={styles.note}>
                    {IMAGES.find((i) => i.mystere.id === `img-${c.id}`)?.mystere.reponse ?? c.id} · {c.auteur} · {c.licence}
                  </Text>
                </TouchableOpacity>
              ))}
          </Section>
        )}
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
