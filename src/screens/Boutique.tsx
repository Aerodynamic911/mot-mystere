import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  JOURS_ENTRE_GLACONS,
  MAX_GLACONS,
  PRIX_GLACON,
  PRIX_JOKER,
  jokerDisponible,
  joursAvantGlacon,
} from '../game/boutique';
import { Stats } from '../game/storage';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

interface Props {
  stats: Stats;
  cle: string;
  onAcheterJoker: () => void;
  onAcheterGlacon: () => void;
  onRetour: () => void;
}

/** La boutique : on y dépense les pièces gagnées en jouant. */
export default function Boutique({ stats, cle, onAcheterJoker, onAcheterGlacon, onRetour }: Props) {
  const [merci, setMerci] = useState('');
  const jokerOk = jokerDisponible(stats, cle);
  const attente = joursAvantGlacon(stats, cle);
  const glaconPlein = stats.glacons >= MAX_GLACONS;

  const etatJoker = !jokerOk
    ? tr("Déjà acheté aujourd'hui, revenez demain", 'Already bought today, come back tomorrow')
    : stats.pieces < PRIX_JOKER
      ? tr('Il vous manque {n} 🪙', 'You need {n} more 🪙', { n: PRIX_JOKER - stats.pieces })
      : null;
  const etatGlacon = glaconPlein
    ? tr('Réserve pleine ({n} maximum)', 'Stock full ({n} maximum)', { n: MAX_GLACONS })
    : attente > 0
      ? tr('Prochain glaçon dans {n} jour{s}', 'Next ice cube in {n} day{s}', { n: attente, s: attente > 1 ? 's' : '' })
      : stats.pieces < PRIX_GLACON
        ? tr('Il vous manque {n} 🪙', 'You need {n} more 🪙', { n: PRIX_GLACON - stats.pieces })
        : null;

  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre={tr('Boutique', 'Shop')} onRetour={onRetour} />
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.solde}>
          <Text style={styles.soldeValeur}>🪙 {stats.pieces}</Text>
          <Text style={styles.soldeLibelle}>{tr('pièces', 'coins')}</Text>
        </View>
        <Text style={styles.aide}>
          {tr(
            'Les pièces se gagnent en jouant : 15 🪙 pour le mystère du jour trouvé, 6 🪙 pour les autres victoires, et 5 🪙 de plus si vous trouvez en 1 ou 2 essais.',
            'Coins are earned by playing: 15 🪙 for solving the daily mystery, 6 🪙 for other wins, plus 5 🪙 if you find it in 1 or 2 attempts.',
          )}
        </Text>

        <Article
          emoji="✨"
          nom={tr('Joker', 'Joker')}
          description={tr('Révèle un indice sans compter comme un essai. Un achat par jour.', 'Reveals a clue without counting as an attempt. One purchase per day.')}
          possede={tr('En réserve : {n}', 'In stock: {n}', { n: stats.jokers })}
          prix={PRIX_JOKER}
          bloque={etatJoker}
          onAcheter={() => {
            onAcheterJoker();
            setMerci(tr('✨ Joker ajouté à votre réserve !', '✨ Joker added to your stock!'));
          }}
        />
        <Article
          emoji="🧊"
          nom={tr('Glaçon', 'Ice cube')}
          description={tr(
            "Si vous manquez un jour, il garde votre série de jours de suite au frais. Un achat tous les {n} jours.",
            'If you miss a day, it keeps your daily streak on ice. One purchase every {n} days.',
            { n: JOURS_ENTRE_GLACONS },
          )}
          possede={tr('En réserve : {n}/{m}', 'In stock: {n}/{m}', { n: stats.glacons, m: MAX_GLACONS })}
          prix={PRIX_GLACON}
          bloque={etatGlacon}
          onAcheter={() => {
            onAcheterGlacon();
            setMerci(tr('🧊 Glaçon ajouté ! Il servira tout seul si vous manquez un jour.', '🧊 Ice cube added! It will be used automatically if you miss a day.'));
          }}
        />
        {merci !== '' && <Text style={styles.merci}>{merci}</Text>}
      </ScrollView>
    </View>
  );
}

function Article({
  emoji,
  nom,
  description,
  possede,
  prix,
  bloque,
  onAcheter,
}: {
  emoji: string;
  nom: string;
  description: string;
  possede: string;
  prix: number;
  bloque: string | null;
  onAcheter: () => void;
}) {
  return (
    <View style={styles.article}>
      <Text style={styles.articleEmoji}>{emoji}</Text>
      <View style={styles.articleTexte}>
        <Text style={styles.articleNom}>{nom}</Text>
        <Text style={styles.articleDescription}>{description}</Text>
        <Text style={styles.articlePossede}>{possede}</Text>
        {bloque && <Text style={styles.articleBloque}>{bloque}</Text>}
      </View>
      <TouchableOpacity style={[styles.acheter, !!bloque && styles.acheterInactif]} onPress={onAcheter} disabled={!!bloque} activeOpacity={0.85}>
        <Text style={styles.acheterTexte}>🪙 {prix}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 20, paddingBottom: 40 },
  solde: { alignItems: 'center', marginBottom: 10 },
  soldeValeur: { color: couleurs.accent, fontSize: 40, fontWeight: '900' },
  soldeLibelle: { color: couleurs.texteSecondaire, fontSize: 13, fontWeight: '600' },
  aide: { color: couleurs.texteSecondaire, fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 18 },
  article: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,31,58,0.88)',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 14,
    marginBottom: 12,
  },
  articleEmoji: { fontSize: 38, marginRight: 12 },
  articleTexte: { flex: 1 },
  articleNom: { color: couleurs.texte, fontSize: 17, fontWeight: '800' },
  articleDescription: { color: couleurs.texteSecondaire, fontSize: 13, lineHeight: 18, marginTop: 2 },
  articlePossede: { color: couleurs.accent, fontSize: 12, fontWeight: '700', marginTop: 4 },
  articleBloque: { color: couleurs.erreur, fontSize: 12, fontWeight: '600', marginTop: 2 },
  acheter: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingHorizontal: 14, paddingVertical: 11, marginLeft: 10 },
  acheterInactif: { opacity: 0.4 },
  acheterTexte: { color: '#1B1B1B', fontWeight: '800', fontSize: 15 },
  merci: { color: couleurs.succes, fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 8 },
});
