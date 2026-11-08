import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { langue } from '../i18n';
import { enregistrerJetonPush, retirerJetonPush } from './serveur';

/**
 * Notifications sur le téléphone : demande d'ami, défi reçu.
 * Rien n'est demandé avant que le joueur ait un profil en ligne ; il peut les couper à tout moment.
 */

const CLE = 'quizzle.notifications.v1';
const CLE_JETON = 'quizzle.notifications.jeton.v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

export type EtatNotifs = 'actives' | 'coupees' | 'jamais' | 'refusees';

export async function etatNotifications(): Promise<EtatNotifs> {
  try {
    const choix = await AsyncStorage.getItem(CLE);
    const perm = await Notifications.getPermissionsAsync();
    if (choix === 'non') return 'coupees';
    if (perm.granted && choix === 'oui') return 'actives';
    if (!perm.granted && !perm.canAskAgain) return 'refusees';
    return 'jamais';
  } catch {
    return 'jamais';
  }
}

async function jetonDeCetAppareil(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('amis', { name: 'Amis et défis', importance: Notifications.AndroidImportance.DEFAULT });
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const r = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return r.data;
  } catch {
    return null; // pas de jeton (simulateur, Android sans configuration Firebase...) : l'appli reste utilisable
  }
}

/** Demande l'autorisation (une fois) puis enregistre ce téléphone auprès du serveur. */
export async function activerNotifications(): Promise<EtatNotifs> {
  try {
    let perm = await Notifications.getPermissionsAsync();
    if (!perm.granted && perm.canAskAgain) perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) {
      await AsyncStorage.setItem(CLE, 'non');
      return perm.canAskAgain ? 'jamais' : 'refusees';
    }
    const jeton = await jetonDeCetAppareil();
    if (jeton && (await enregistrerJetonPush(jeton, langue()))) await AsyncStorage.setItem(CLE_JETON, jeton);
    await AsyncStorage.setItem(CLE, 'oui');
    return 'actives';
  } catch {
    return 'jamais';
  }
}

export async function couperNotifications(): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, 'non');
    const jeton = await AsyncStorage.getItem(CLE_JETON);
    if (jeton) await retirerJetonPush(jeton);
    await AsyncStorage.removeItem(CLE_JETON);
  } catch {
    // sans effet : le serveur oubliera le jeton s'il devient invalide
  }
}

/** À chaque lancement : rafraîchit le jeton et la langue si les notifications sont actives. */
export async function rafraichirNotifications(): Promise<void> {
  try {
    if ((await AsyncStorage.getItem(CLE)) !== 'oui') return;
    if (!(await Notifications.getPermissionsAsync()).granted) return;
    const jeton = await jetonDeCetAppareil();
    if (jeton && (await enregistrerJetonPush(jeton, langue()))) await AsyncStorage.setItem(CLE_JETON, jeton);
  } catch {
    // ignoré
  }
}

/** Appelle `quand` quand le joueur touche une notification (appli ouverte ou fermée). Renvoie la fonction d'arrêt. */
export function surToucheNotification(quand: () => void): () => void {
  const abo = Notifications.addNotificationResponseReceivedListener(() => quand());
  Notifications.getLastNotificationResponseAsync()
    .then((r) => {
      if (r) quand();
    })
    .catch(() => {});
  return () => abo.remove();
}
