import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FOURNISSEUR, ErreurCompte, lierCompte, restaurerProgression, sauvegardeDisponible } from '../game/compteLie';
import { EtatSauvegarde, etatSauvegarde, sauvegarderMaintenant } from '../game/sauvegarde';
import { supprimerProfil } from '../game/serveur';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';

interface Props {
  /** Appelé quand la progression d'une sauvegarde vient d'être appliquée : l'appli recharge ses données. */
  onRestaure: () => void;
}

const MESSAGES: Record<ErreurCompte, () => string> = {
  annule: () => '',
  indisponible: () => tr('La connexion n’est pas disponible pour le moment.', 'Sign-in is not available right now.'),
  deja_lie: () =>
    tr(
      'Ce compte protège déjà une autre progression. Utilisez « Restaurer ma progression » pour la retrouver.',
      'This account already protects another game. Use “Restore my progress” to get it back.',
    ),
  aucune_sauvegarde: () => tr('Aucune sauvegarde n’est liée à ce compte.', 'No backup is linked to this account.'),
  reseau: () => tr('Pas de connexion au serveur. Réessayez plus tard.', 'No connection to the server. Please try again later.'),
  inconnue: () => tr('Une erreur est survenue. Réessayez plus tard.', 'Something went wrong. Please try again later.'),
};

const nomCompte = () => (FOURNISSEUR === 'apple' ? 'Apple' : 'Google');

function formaterDate(iso: string | null): string {
  if (!iso) return tr('à l’instant', 'just now');
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function SauvegardeBloc({ onRestaure }: Props) {
  const [dispo, setDispo] = useState(false);
  const [etat, setEtat] = useState<EtatSauvegarde | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState('');

  const rafraichir = useCallback(async () => {
    setEtat(await etatSauvegarde());
  }, []);

  useEffect(() => {
    sauvegardeDisponible().then(setDispo);
    rafraichir();
  }, [rafraichir]);

  if (!dispo && !etat) return null;

  async function lier() {
    setOccupe(true);
    setMessage('');
    const r = await lierCompte();
    setOccupe(false);
    if (!r.ok) setMessage(MESSAGES[r.erreur]());
    await rafraichir();
  }

  async function sauvegarder() {
    setOccupe(true);
    setMessage('');
    const ok = await sauvegarderMaintenant();
    setOccupe(false);
    if (!ok) setMessage(MESSAGES.reseau());
    await rafraichir();
  }

  function restaurer() {
    Alert.alert(
      tr('Restaurer ma progression', 'Restore my progress'),
      tr(
        'La progression de ce téléphone sera remplacée par celle de votre sauvegarde. Continuer ?',
        'The progress on this phone will be replaced by your backup. Continue?',
      ),
      [
        { text: tr('Annuler', 'Cancel'), style: 'cancel' },
        {
          text: tr('Restaurer', 'Restore'),
          onPress: async () => {
            setOccupe(true);
            setMessage('');
            const r = await restaurerProgression();
            setOccupe(false);
            if (r.ok) {
              await rafraichir();
              setMessage(tr('Progression restaurée !', 'Progress restored!'));
              onRestaure();
            } else {
              setMessage(MESSAGES[r.erreur]());
            }
          },
        },
      ],
    );
  }

  function supprimer() {
    Alert.alert(
      tr('Supprimer ma sauvegarde', 'Delete my backup'),
      tr(
        'Votre compte en ligne, votre sauvegarde, vos amis et vos groupes seront supprimés du serveur. La progression restera sur ce téléphone.',
        'Your online account, backup, friends and groups will be deleted from the server. Your progress stays on this phone.',
      ),
      [
        { text: tr('Annuler', 'Cancel'), style: 'cancel' },
        {
          text: tr('Supprimer', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            setOccupe(true);
            const ok = await supprimerProfil();
            setOccupe(false);
            setMessage(ok ? tr('Sauvegarde supprimée.', 'Backup deleted.') : MESSAGES.reseau());
            await rafraichir();
          },
        },
      ],
    );
  }

  return (
    <View>
      {etat ? (
        <>
          <Text style={styles.note}>
            {tr(
              `✅ Progression sauvegardée avec votre compte ${nomCompte()}.\nDernier envoi : ${formaterDate(etat.derniere)}`,
              `✅ Progress backed up with your ${nomCompte()} account.\nLast backup: ${formaterDate(etat.derniere)}`,
            )}
          </Text>
          <TouchableOpacity style={styles.bouton} onPress={sauvegarder} disabled={occupe} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.boutonTexte}>☁️ {tr('Sauvegarder maintenant', 'Back up now')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={supprimer} disabled={occupe} style={styles.lien} accessibilityRole="button">
            <Text style={styles.lienTexte}>{tr('Supprimer ma sauvegarde et mes données en ligne', 'Delete my backup and online data')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.note}>
            {tr(
              `Gardez votre progression si vous changez de téléphone : liez-la à votre compte ${nomCompte()}. Nous ne recevons ni votre nom ni votre e-mail.`,
              `Keep your progress if you change phones: link it to your ${nomCompte()} account. We receive neither your name nor your email.`,
            )}
          </Text>
          <TouchableOpacity style={styles.bouton} onPress={lier} disabled={occupe} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.boutonTexte}>
              ☁️ {tr(`Sauvegarder avec ${nomCompte()}`, `Back up with ${nomCompte()}`)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bouton, styles.boutonSecondaire]} onPress={restaurer} disabled={occupe} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.boutonTexte}>📲 {tr('Restaurer ma progression', 'Restore my progress')}</Text>
          </TouchableOpacity>
        </>
      )}
      {occupe && <ActivityIndicator color={couleurs.accent} style={{ marginTop: 10 }} />}
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { color: couleurs.texteSecondaire, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  bouton: { borderRadius: rayon, borderWidth: 1.5, borderColor: couleurs.accent, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  boutonSecondaire: { borderColor: couleurs.bordure },
  boutonTexte: { color: couleurs.texte, fontSize: 15, fontWeight: '700' },
  lien: { alignItems: 'center', paddingVertical: 10 },
  lienTexte: { color: couleurs.texteSecondaire, fontSize: 13, textDecorationLine: 'underline' },
  message: { color: couleurs.texte, fontSize: 13, marginTop: 8, textAlign: 'center' },
});
