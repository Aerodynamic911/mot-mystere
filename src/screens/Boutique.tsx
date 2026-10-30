import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  JOURS_ENTRE_GLACONS,
  MAX_GLACONS,
  MAX_JOKERS_SPECIAUX,
  PRIX_GLACON,
  PRIX_JOKER,
  PRIX_JOKER_PASSER,
  PRIX_JOKER_TEMPS,
  SECONDES_JOKER_TEMPS,
  jokerDisponible,
  joursAvantGlacon,
  possedeSkin,
} from '../game/boutique';
import { SKINS, Skin, nomSkin } from '../game/skins';
import CorpsMascotte from '../ui/CorpsMascotte';
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
  onAcheterJokerTemps: () => void;
  onAcheterJokerPasser: () => void;
  onAcheterSkin: (id: string) => void;
  onEquiperSkin: (id: string) => void;
  onRetour: () => void;
}

/** La boutique : on y dépense les pièces gagnées en jouant. */
export default function Boutique({
  stats,
  cle,
  onAcheterJoker,
  onAcheterGlacon,
  onAcheterJokerTemps,
  onAcheterJokerPasser,
  onAcheterSkin,
  onEquiperSkin,
  onRetour,
}: Props) {
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
        <Article
          emoji="⏳"
          nom={tr('Joker temps', 'Time joker')}
          description={tr('Ajoute {n} secondes au chrono du Sprint, à utiliser pendant la manche.', 'Adds {n} seconds to the Sprint timer, to use during a round.', { n: SECONDES_JOKER_TEMPS })}
          possede={tr('En réserve : {n}/{m}', 'In stock: {n}/{m}', { n: stats.jokersTemps, m: MAX_JOKERS_SPECIAUX })}
          prix={PRIX_JOKER_TEMPS}
          bloque={stats.jokersTemps >= MAX_JOKERS_SPECIAUX ? tr('Réserve pleine', 'Stock full') : stats.pieces < PRIX_JOKER_TEMPS ? tr('Il vous manque {n} 🪙', 'You need {n} more 🪙', { n: PRIX_JOKER_TEMPS - stats.pieces }) : null}
          onAcheter={() => {
            onAcheterJokerTemps();
            setMerci(tr('⏳ Joker temps ajouté !', '⏳ Time joker added!'));
          }}
        />
        <Article
          emoji="⏭️"
          nom={tr('Joker passe', 'Skip joker')}
          description={tr('Passe une affirmation de Vrai ou faux : elle est remplacée par une autre, sans pénalité.', 'Skips a True or false statement: it is replaced by another one, with no penalty.')}
          possede={tr('En réserve : {n}/{m}', 'In stock: {n}/{m}', { n: stats.jokersPasser, m: MAX_JOKERS_SPECIAUX })}
          prix={PRIX_JOKER_PASSER}
          bloque={stats.jokersPasser >= MAX_JOKERS_SPECIAUX ? tr('Réserve pleine', 'Stock full') : stats.pieces < PRIX_JOKER_PASSER ? tr('Il vous manque {n} 🪙', 'You need {n} more 🪙', { n: PRIX_JOKER_PASSER - stats.pieces }) : null}
          onAcheter={() => {
            onAcheterJokerPasser();
            setMerci(tr('⏭️ Joker passe ajouté !', '⏭️ Skip joker added!'));
          }}
        />

        <Text style={styles.section}>{tr('Skins de la mascotte', 'Mascot skins')}</Text>
        <Text style={styles.aide}>
          {tr(
            'Habillez votre mascotte. Les costumes et couleurs s’achètent ; les skins spéciaux s’obtiennent en terminant un événement.',
            'Dress up your mascot. Costumes and colours can be bought; special skins are earned by completing an event.',
          )}
        </Text>
        <View style={styles.grille}>
          {SKINS.map((sk) => (
            <CarteSkin
              key={sk.id}
              skin={sk}
              possede={possedeSkin(stats, sk.id)}
              equipe={stats.skinEquipe === sk.id}
              pieces={stats.pieces}
              onAcheter={() => {
                onAcheterSkin(sk.id);
                setMerci(tr('{e} Skin « {n} » acheté et équipé !', '{e} “{n}” skin bought and equipped!', { e: sk.emoji, n: nomSkin(sk) }));
              }}
              onEquiper={() => onEquiperSkin(sk.id)}
            />
          ))}
        </View>
        {merci !== '' && <Text style={styles.merci}>{merci}</Text>}
      </ScrollView>
    </View>
  );
}

function CarteSkin({
  skin,
  possede,
  equipe,
  pieces,
  onAcheter,
  onEquiper,
}: {
  skin: Skin;
  possede: boolean;
  equipe: boolean;
  pieces: number;
  onAcheter: () => void;
  onEquiper: () => void;
}) {
  const evenement = skin.origine === 'evenement';
  const trop = !possede && !evenement && pieces < skin.prix;
  return (
    <View style={[styles.carteSkin, equipe && styles.carteSkinEquipee]}>
      <View style={!possede && evenement ? styles.apercuVerrou : undefined}>
        <CorpsMascotte largeur={84} hauteur={80} skin={skin.id} />
      </View>
      <Text style={styles.skinNom} numberOfLines={1}>
        {skin.emoji} {nomSkin(skin)}
      </Text>
      {equipe ? (
        <Text style={styles.skinEquipe}>{tr('✓ Équipé', '✓ Equipped')}</Text>
      ) : possede ? (
        <TouchableOpacity style={styles.skinBouton} onPress={onEquiper} activeOpacity={0.85}>
          <Text style={styles.acheterTexte}>{tr('Équiper', 'Equip')}</Text>
        </TouchableOpacity>
      ) : evenement ? (
        <Text style={styles.skinVerrou}>🔒 {tr('Terminez l’événement', 'Complete the event')}</Text>
      ) : (
        <TouchableOpacity style={[styles.skinBouton, trop && styles.acheterInactif]} onPress={onAcheter} disabled={trop} activeOpacity={0.85}>
          <Text style={styles.acheterTexte}>🪙 {skin.prix}</Text>
        </TouchableOpacity>
      )}
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
  section: { color: couleurs.accent, fontSize: 13, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', marginTop: 14, marginBottom: 6, textAlign: 'center' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  carteSkin: { width: '48%', backgroundColor: 'rgba(26,31,58,0.88)', borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, padding: 10, marginBottom: 12, alignItems: 'center' },
  carteSkinEquipee: { borderColor: couleurs.accent, borderWidth: 2 },
  apercuVerrou: { opacity: 0.35 },
  skinNom: { color: couleurs.texte, fontSize: 14, fontWeight: '800', marginTop: 6 },
  skinEquipe: { color: couleurs.succes, fontSize: 13, fontWeight: '800', marginTop: 8 },
  skinVerrou: { color: couleurs.texteSecondaire, fontSize: 11, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  skinBouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 },
  merci: { color: couleurs.succes, fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 8 },
});
