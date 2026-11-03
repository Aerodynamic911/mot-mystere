import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ami, envoyerDefi, lireAmis } from '../game/serveur';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';

interface Props {
  visible: boolean;
  mystereId: string;
  essais: number;
  gagne: boolean;
  onFermer: () => void;
}

/** Choix d'un ami de la liste Quizzle pour lui envoyer un défi (même mystère, mon score affiché chez lui). */
export default function DefiAmiModal({ visible, mystereId, essais, gagne, onFermer }: Props) {
  const [amis, setAmis] = useState<Ami[] | null>(null);
  const [profil, setProfil] = useState(true);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null);
  const [envoyes, setEnvoyes] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setChargement(true);
    setMessage(null);
    setEnvoyes([]);
    lireAmis(new Date().toISOString().slice(0, 10))
      .then((l) => {
        setProfil(!!l);
        setAmis(l ? l.amis : []);
      })
      .catch(() => setMessage({ texte: tr('Connexion impossible. Réessayez plus tard.', 'Unable to connect. Please try again later.'), erreur: true }))
      .finally(() => setChargement(false));
  }, [visible]);

  async function envoyer(a: Ami) {
    setMessage(null);
    const r = await envoyerDefi(a.id, mystereId, gagne ? essais : 0, gagne);
    if (r.ok) {
      setEnvoyes((e) => [...e, a.id]);
      setMessage({ texte: tr('Défi envoyé à {nom} !', 'Challenge sent to {nom}!', { nom: a.nom }), erreur: false });
      return;
    }
    const texte =
      r.erreur === 'trop_de_defis'
        ? tr("Trop de défis envoyés aujourd'hui. Réessayez demain.", 'Too many challenges sent today. Try again tomorrow.')
        : r.erreur === 'introuvable'
          ? tr("Cet ami n'est plus disponible.", 'This friend is no longer available.')
          : tr('Connexion impossible. Réessayez plus tard.', 'Unable to connect. Please try again later.');
    setMessage({ texte, erreur: true });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFermer}>
      <View style={styles.fond}>
        <View style={styles.carte}>
          <Text style={styles.titre}>🎯 {tr('Défier un ami', 'Challenge a friend')}</Text>
          {chargement ? (
            <ActivityIndicator color={couleurs.accent} style={{ marginVertical: 20 }} />
          ) : !profil ? (
            <Text style={styles.note}>
              {tr('Créez votre profil (accueil › 👤) et ajoutez des amis pour leur envoyer des défis directement.', 'Create your profile (home › 👤) and add friends to challenge them directly.')}
            </Text>
          ) : !amis || amis.length === 0 ? (
            <Text style={styles.note}>{tr("Vous n'avez pas encore d'amis dans Quizzle. Ajoutez-en depuis votre profil (👤).", 'You have no friends in Quizzle yet. Add some from your profile (👤).')}</Text>
          ) : (
            <ScrollView style={{ maxHeight: 280 }}>
              {amis.map((a) => (
                <View key={a.id} style={styles.ligne}>
                  <Text style={styles.nom} numberOfLines={1}>{a.nom}</Text>
                  <TouchableOpacity
                    style={[styles.bouton, envoyes.includes(a.id) && styles.boutonInactif]}
                    disabled={envoyes.includes(a.id)}
                    onPress={() => envoyer(a)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.boutonTexte}>{envoyes.includes(a.id) ? '✓' : tr('Défier', 'Challenge')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          {message && <Text style={[styles.note, { color: message.erreur ? couleurs.erreur : couleurs.succes }]}>{message.texte}</Text>}
          <TouchableOpacity style={styles.fermer} onPress={onFermer} accessibilityRole="button">
            <Text style={styles.fermerTexte}>{tr('Fermer', 'Close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, padding: 18 },
  titre: { color: couleurs.texte, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  note: { color: couleurs.texteSecondaire, fontSize: 13, lineHeight: 18, marginTop: 8 },
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  nom: { flex: 1, color: couleurs.texte, fontSize: 16, fontWeight: '700' },
  bouton: { backgroundColor: couleurs.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  boutonInactif: { opacity: 0.5 },
  boutonTexte: { color: '#1B1B1B', fontSize: 13, fontWeight: '800' },
  fermer: { alignItems: 'center', paddingTop: 14 },
  fermerTexte: { color: couleurs.accent, fontSize: 15, fontWeight: '700' },
});
