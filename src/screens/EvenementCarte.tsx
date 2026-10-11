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

/** Coupe un titre en deux lignes équilibrées (« Merveilles / du monde »). */
function surDeuxLignes(titre: string): string {
  const mots = titre.split(' ');
  if (mots.length < 2) return titre;
  let meilleur = 1;
  let ecart = Infinity;
  for (let i = 1; i < mots.length; i++) {
    const d = Math.abs(mots.slice(0, i).join(' ').length - mots.slice(i).join(' ').length);
    if (d < ecart) {
      ecart = d;
      meilleur = i;
    }
  }
  return `${mots.slice(0, meilleur).join(' ')}\n${mots.slice(meilleur).join(' ')}`;
}

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
      <EnteteEcran titre="Événement" onRetour={onRetour} libelleRetour="‹ Retour" />
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.emoji}>{evenement.emoji}</Text>
        <Text style={[styles.titreTheme, { color: evenement.couleur }]}>{surDeuxLignes(evenement.titre)}</Text>
        <Text style={styles.statut}>{fini ? '🏆 Événement terminé !' : `Étape ${faites + 1} sur ${NB_ETAPES}`}</Text>

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
                  disabled={!courante}
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
          Étoiles : ⭐⭐⭐ en 1 ou 2 essais, ⭐⭐ en 3 ou 4, ⭐ au-delà. La finale ne laisse que {essaisEtape(NB_ETAPES)} essais. Une étape réussie ne peut plus être rejouée.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  // Le titre est sur deux lignes et tout le parcours est descendu pour respirer.
  contenu: { padding: 20, paddingTop: 36, paddingBottom: 40 },
  emoji: { fontSize: 44, textAlign: 'center' },
  titreTheme: { fontSize: 28, fontWeight: '900', textAlign: 'center', lineHeight: 34, marginTop: 6 },
  statut: { color: couleurs.texte, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 12, marginBottom: 34 },
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
