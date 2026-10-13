import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PARTAGES_PAR_JOKER } from '../config';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';

interface Props {
  visible: boolean;
  /** Partages comptés depuis le début (3 = 1 joker). */
  partages: number;
  /** Un partage a déjà été compté aujourd'hui. */
  partageAujourdhui: boolean;
  onFermer: () => void;
  onInviter: () => void;
  /** Renvoie un message d'erreur si le code est invalide, sinon lance le défi. */
  onCode: (code: string) => string | null;
}

/** Fenêtre « Entre amis » : inviter un ami (joker tous les 3 partages) et relever un défi avec un code. */
export default function EntreAmis({ visible, partages, partageAujourdhui, onFermer, onInviter, onCode }: Props) {
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const reste = PARTAGES_PAR_JOKER - (partages % PARTAGES_PAR_JOKER);

  function valider() {
    const e = onCode(code);
    if (e) setErreur(e);
    else {
      setCode('');
      setErreur('');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFermer}>
      <KeyboardAvoidingView style={styles.voile} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.carte}>
          <Text style={styles.titre}>👥 {tr('Entre amis', 'With friends')}</Text>

          <Text style={styles.section}>📤 {tr('Faire découvrir Quizzle', 'Spread the word about Quizzle')}</Text>
          <Text style={styles.texte}>
            {tr(
              'Invitez un ami : tous les {n} partages, vous gagnez un joker ✨ (un partage compté par jour).',
              'Invite a friend: every {n} shares, you earn a joker ✨ (one share counts per day).',
              { n: PARTAGES_PAR_JOKER },
            )}
          </Text>
          <Text style={styles.progres}>
            {tr('Plus que {r} partage{s} avant le prochain joker', '{r} more share{s} until your next joker', { r: reste, s: reste > 1 ? 's' : '' })}
            {partageAujourdhui ? `\n${tr("Déjà compté aujourd'hui, revenez demain !", 'Already counted today, come back tomorrow!')}` : ''}
          </Text>
          <TouchableOpacity style={styles.bouton} onPress={onInviter} activeOpacity={0.85}>
            <Text style={styles.boutonTexte}>{tr('Inviter un ami', 'Invite a friend')}</Text>
          </TouchableOpacity>

          <Text style={[styles.section, { marginTop: 20 }]}>🎯 {tr('Relever un défi', 'Take on a challenge')}</Text>
          <Text style={styles.texte}>
            {tr(
              "Un ami vous a envoyé un code ? Entrez-le pour jouer la même énigme que lui et comparer vos scores. Gagner un défi rapporte un joker ✨ (une fois par jour).",
              'Did a friend send you a code? Enter it to play the same riddle and compare scores. Winning a challenge earns a joker ✨ (once a day).',
            )}
          </Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase());
              if (erreur) setErreur('');
            }}
            placeholder="ABC-123"
            placeholderTextColor={couleurs.texteSecondaire}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            returnKeyType="go"
            onSubmitEditing={valider}
          />
          {erreur !== '' && <Text style={styles.erreur}>{erreur}</Text>}
          <TouchableOpacity style={[styles.bouton, !code.trim() && styles.boutonInactif]} onPress={valider} disabled={!code.trim()} activeOpacity={0.85}>
            <Text style={styles.boutonTexte}>{tr('Relever le défi', 'Take the challenge')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fermer} onPress={onFermer} activeOpacity={0.85}>
            <Text style={styles.fermerTexte}>{tr('Fermer', 'Close')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  voile: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 20 },
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: 20, borderWidth: 1, borderColor: couleurs.bordure },
  titre: { color: couleurs.accent, fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 14 },
  section: { color: couleurs.texte, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  texte: { color: couleurs.texteSecondaire, fontSize: 14, lineHeight: 20 },
  progres: { color: couleurs.accent, fontSize: 13, fontWeight: '700', marginTop: 8 },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  boutonInactif: { opacity: 0.45 },
  boutonTexte: { color: '#1B1B1B', fontWeight: '800', fontSize: 16 },
  input: {
    backgroundColor: couleurs.fond,
    color: couleurs.texte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 10,
  },
  erreur: { color: couleurs.erreur, fontSize: 13, textAlign: 'center', marginTop: 8 },
  fermer: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  fermerTexte: { color: couleurs.texteSecondaire, fontSize: 15, fontWeight: '600' },
});
