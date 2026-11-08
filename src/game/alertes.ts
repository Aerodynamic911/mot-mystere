import { lireAmis, lireDefis } from './serveur';

export interface Alertes {
  amis: number;
  defis: number;
}

export const AUCUNE_ALERTE: Alertes = { amis: 0, defis: 0 };

/** Demandes d'amis reçues en attente + défis reçus auxquels le joueur n'a pas encore répondu. */
export async function compterAlertes(jour: string): Promise<Alertes> {
  try {
    const [amis, defis] = await Promise.all([lireAmis(jour), lireDefis()]);
    return {
      amis: amis?.recues.length ?? 0,
      defis: defis?.recus.filter((d) => !d.reponse).length ?? 0,
    };
  } catch {
    return AUCUNE_ALERTE;
  }
}
