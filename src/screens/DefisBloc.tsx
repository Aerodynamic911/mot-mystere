import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DefiEnLigne, lireDefis } from '../game/serveur';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';

interface Props {
  /** Lance le défi reçu (mystère identique) ; renvoie `false` si ce mystère n'existe pas dans cette version de l'app. */
  onRelever: (defi: DefiEnLigne) => boolean;
  onChange?: () => void;
}

function essaisTexte(gagne: boolean, essais: number): string {
  if (!gagne) return tr('❌ pas trouvé', '❌ not found');
  return essais === 1 ? tr('✅ en 1 essai', '✅ in 1 try') : tr('✅ en {n} essais', '✅ in {n} tries', { n: essais });
}

function verdict(d: DefiEnLigne): string | null {
  if (!d.reponse) return null;
  const moi = d.reponse;
  const autre = d.gagne_de;
  if (moi.gagne && (!autre || moi.essais < d.essais_de)) return tr('🏆 Gagné', '🏆 Won');
  if (moi.gagne === autre && (!moi.gagne || moi.essais === d.essais_de)) return tr('🤝 Égalité', '🤝 Tie');
  return tr('Perdu', 'Lost');
}

export default function DefisBloc({ onRelever, onChange }: Props) {
  const [defis, setDefis] = useState<{ recus: DefiEnLigne[]; envoyes: DefiEnLigne[] } | null>(null);
  const [chargement, setChargement] = useState(true);
  const [horsLigne, setHorsLigne] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      setDefis(await lireDefis());
      onChange?.();
      setHorsLigne(false);
    } catch {
      setHorsLigne(true);
    }
    setChargement(false);
  }, [onChange]);

  useEffect(() => {
    charger();
  }, [charger]);

  if (chargement) return <ActivityIndicator color={couleurs.accent} style={{ marginVertical: 16 }} />;
  if (horsLigne) {
    return (
      <View style={styles.section}>
        <Text style={styles.note}>{tr('Connexion impossible. Réessayez plus tard.', 'Unable to connect. Please try again later.')}</Text>
        <TouchableOpacity style={styles.boutonSecondaire} onPress={charger} accessibilityRole="button">
          <Text style={styles.boutonSecondaireTexte}>{tr('Réessayer', 'Try again')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recus = defis?.recus ?? [];
  const envoyes = defis?.envoyes ?? [];

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>{tr('Défis reçus', 'Challenges received')}</Text>
        {recus.length === 0 && (
          <Text style={styles.note}>
            {tr('Aucun défi pour le moment. À la fin d’une partie, touchez « Défier un ami de ma liste » pour en envoyer un.', 'No challenge for now. At the end of a game, tap “Challenge a friend from my list” to send one.')}
          </Text>
        )}
        {recus.map((d) => (
          <View key={d.id} style={styles.ligne}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nom} numberOfLines={1}>
                {!d.reponse ? '🆕 ' : ''}
                {d.autre.nom}
              </Text>
              {!d.reponse && <Text style={styles.nouveau}>{tr('{nom} vous défie ! À vous de jouer.', '{nom} challenged you! Your turn.', { nom: d.autre.nom })}</Text>}
              <Text style={styles.detail}>
                {tr('Son score : ', 'Their score: ')}{essaisTexte(d.gagne_de, d.essais_de)}
                {d.reponse ? `\n${tr('Le vôtre : ', 'Yours: ')}${essaisTexte(d.reponse.gagne, d.reponse.essais)} · ${verdict(d)}` : ''}
              </Text>
            </View>
            {!d.reponse && (
              <TouchableOpacity
                style={styles.petitBouton}
                onPress={() => {
                  if (!onRelever(d)) setMessage(tr("Ce défi utilise un mystère qui n'existe pas dans votre version. Mettez Quizzle à jour.", "This challenge uses a mystery your version doesn't have. Please update Quizzle."));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.petitBoutonTexte}>{tr('Relever', 'Accept')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {message && <Text style={[styles.note, { color: couleurs.erreur }]}>{message}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>{tr('Défis envoyés', 'Challenges sent')}</Text>
        {envoyes.length === 0 && <Text style={styles.note}>{tr('Aucun défi envoyé cette semaine.', 'No challenge sent this week.')}</Text>}
        {envoyes.map((d) => (
          <View key={d.id} style={styles.ligne}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nom} numberOfLines={1}>{d.autre.nom}</Text>
              <Text style={styles.detail}>
                {tr('Mon score : ', 'My score: ')}{essaisTexte(d.gagne_de, d.essais_de)}
                {'\n'}
                {d.reponse ? `${tr('Sa réponse : ', 'Their answer: ')}${essaisTexte(d.reponse.gagne, d.reponse.essais)}` : tr('En attente de sa réponse', 'Waiting for their answer')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: 'rgba(26,31,58,0.82)', borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, padding: 16, marginBottom: 16 },
  sectionTitre: { color: couleurs.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10, textTransform: 'uppercase' },
  note: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 17 },
  boutonSecondaire: { borderRadius: rayon, borderWidth: 1, borderColor: couleurs.accent, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  boutonSecondaireTexte: { color: couleurs.accent, fontSize: 15, fontWeight: '700' },
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  nom: { color: couleurs.texte, fontSize: 16, fontWeight: '700' },
  nouveau: { color: couleurs.accent, fontSize: 13, fontWeight: '700', marginTop: 2 },
  detail: { color: couleurs.texteSecondaire, fontSize: 13, marginTop: 2, lineHeight: 18 },
  petitBouton: { backgroundColor: couleurs.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  petitBoutonTexte: { color: '#1B1B1B', fontSize: 13, fontWeight: '800' },
});
