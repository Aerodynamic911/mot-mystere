import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EVENEMENTS, NB_ETAPES } from '../data/evenements';
import { Progression, evenementDe } from '../game/progression';
import { couleurs, rayon } from '../theme';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

interface Props {
  progression: Progression;
  onChoisir: (id: string) => void;
  onRetour: () => void;
}

/** Liste des événements : chacun est une aventure de 20 étapes autour d'un thème. */
export default function Evenements({ progression, onChoisir, onRetour }: Props) {
  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre="Événements" onRetour={onRetour} />
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.intro}>Une aventure de {NB_ETAPES} étapes autour d'un thème. Réussissez chaque mystère pour débloquer le suivant.</Text>

        {EVENEMENTS.map((ev) => {
          const p = evenementDe(progression, ev.id);
          const fini = p.faites >= NB_ETAPES;
          const etoiles = p.etoiles.reduce((a, b) => a + b, 0);
          return (
            <TouchableOpacity key={ev.id} style={[styles.carte, { borderColor: ev.couleur }]} onPress={() => onChoisir(ev.id)} activeOpacity={0.85}>
              <View style={styles.carteHaut}>
                <Text style={styles.emoji}>{ev.emoji}</Text>
                <View style={styles.carteTexte}>
                  <Text style={styles.titre}>{ev.titre}</Text>
                  <Text style={styles.description}>{ev.description}</Text>
                </View>
              </View>
              <View style={styles.piste}>
                <View style={[styles.barre, { width: `${(p.faites / NB_ETAPES) * 100}%`, backgroundColor: ev.couleur }]} />
              </View>
              <View style={styles.carteBas}>
                <Text style={styles.progres}>
                  {fini ? '🏆 Terminé' : p.faites === 0 ? 'Pas encore commencé' : `Étape ${p.faites + 1} sur ${NB_ETAPES}`}
                </Text>
                <Text style={styles.progres}>
                  {p.faites}/{NB_ETAPES}
                  {etoiles > 0 ? `  ·  ⭐ ${etoiles}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 20, paddingTop: 4 },
  intro: { color: couleurs.texteSecondaire, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  carte: {
    backgroundColor: 'rgba(26,31,58,0.88)',
    borderRadius: rayon,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  carteHaut: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 40, marginRight: 14 },
  carteTexte: { flex: 1 },
  titre: { color: couleurs.texte, fontSize: 18, fontWeight: '800' },
  description: { color: couleurs.texteSecondaire, fontSize: 13, lineHeight: 18, marginTop: 4 },
  piste: { height: 10, borderRadius: 5, backgroundColor: couleurs.carteClaire, overflow: 'hidden', marginTop: 14 },
  barre: { height: '100%', borderRadius: 5 },
  carteBas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progres: { color: couleurs.texte, fontSize: 13, fontWeight: '600' },
});
