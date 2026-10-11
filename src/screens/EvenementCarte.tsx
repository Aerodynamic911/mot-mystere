import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Evenement, NB_ETAPES } from '../data/evenements';
import { essaisEtape } from '../game/aventure';
import { ProgressionEvenement } from '../game/progression';
import { couleurs, rayon } from '../theme';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

interface Props {
  evenement: Evenement;
  progression: ProgressionEvenement;
  onJouerEtape: (etape: number) => void;
  onRetour: () => void;
}

const PAR_LIGNE = 4;

/** Carte d'un événement : 20 étapes en parcours, la suivante se débloque quand on réussit la précédente. */
export default function EvenementCarte({ evenement, progression, onJouerEtape, onRetour }: Props) {
  const { faites, etoiles } = progression;
  const fini = faites >= NB_ETAPES;

  // Parcours en serpentin : une ligne de gauche à droite, la suivante de droite à gauche.
  const lignes: number[][] = [];
  for (let i = 0; i < NB_ETAPES; i += PAR_LIGNE) {
    const ligne = Array.from({ length: PAR_LIGNE }, (_, k) => i + k + 1);
    lignes.push((i / PAR_LIGNE) % 2 === 0 ? ligne : ligne.reverse());
  }

  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre={evenement.titre} onRetour={onRetour} libelleRetour="‹ Retour" />
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.statut}>
          {evenement.emoji}  {fini ? '🏆 Événement terminé !' : `Étape ${faites + 1} sur ${NB_ETAPES}`}
        </Text>

        {lignes.map((ligne, i) => (
          <View key={i} style={styles.ligne}>
            {ligne.map((etape) => {
              const faite = etape <= faites;
              const courante = etape === faites + 1;
              const finale = etape === NB_ETAPES;
              const nbEtoiles = faite ? (etoiles[etape - 1] ?? 1) : 0;
              return (
                <TouchableOpacity
                  key={etape}
                  disabled={!faite && !courante}
                  onPress={() => onJouerEtape(etape)}
                  activeOpacity={0.85}
                  style={[
                    styles.noeud,
                    faite && { borderColor: evenement.couleur, backgroundColor: 'rgba(26,31,58,0.95)' },
                    courante && { borderColor: '#FFD36B', backgroundColor: couleurs.accent },
                    !faite && !courante && styles.noeudVerrouille,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Étape ${etape}${faite ? ', réussie' : courante ? ', à jouer' : ', verrouillée'}`}
                >
                  <Text style={[styles.noeudNumero, courante && styles.noeudNumeroCourant]}>
                    {!faite && !courante ? '🔒' : finale && !faite ? '🏆' : etape}
                  </Text>
                  {faite && <Text style={styles.noeudEtoiles}>{'⭐'.repeat(nbEtoiles)}</Text>}
                  {finale && !faite && courante ? <Text style={styles.noeudFinale}>FINALE</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <Text style={styles.note}>
          Étoiles : ⭐⭐⭐ en 1 ou 2 essais, ⭐⭐ en 3 ou 4, ⭐ au-delà. La finale ne laisse que {essaisEtape(NB_ETAPES)} essais. Vous pouvez rejouer une étape réussie à tout moment.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 20, paddingTop: 4, paddingBottom: 40 },
  statut: { color: couleurs.texte, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  noeud: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: rayon,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,31,58,0.82)',
  },
  noeudVerrouille: { opacity: 0.5 },
  noeudNumero: { color: couleurs.texte, fontSize: 22, fontWeight: '800' },
  noeudNumeroCourant: { color: '#1B1B1B', fontSize: 26, fontWeight: '900' },
  noeudEtoiles: { fontSize: 9, marginTop: 2 },
  noeudFinale: { color: '#1B1B1B', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  note: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 12 },
});
