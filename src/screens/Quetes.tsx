import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BONUS_JOUR, EtatQuetes, Quete, bonusPret, libelleRecompense, queteDeLaSemaine, quetesDuJour } from '../game/quetes';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';
import EnteteEcran from '../ui/EnteteEcran';
import FondAnime from '../ui/FondAnime';

interface Props {
  etat: EtatQuetes;
  cle: string;
  imagesDispo: boolean;
  onReclamer: (id: string) => void;
  onRetour: () => void;
}

/** Les quêtes : 3 objectifs par jour, un bonus quand ils sont tous faits, et une grande quête par semaine. */
export default function Quetes({ etat, cle, imagesDispo, onReclamer, onRetour }: Props) {
  const jour = quetesDuJour(etat, cle, imagesDispo);
  const semaine = queteDeLaSemaine(etat, cle);
  const faites = jour.filter((q) => q.reclamee).length;
  const bonus = bonusPret(etat, cle, imagesDispo);
  const bonusRecupere = etat.jour.cle === cle && etat.jour.bonus;

  return (
    <View style={styles.racine}>
      <FondAnime />
      <EnteteEcran titre={tr('Quêtes', 'Quests')} onRetour={onRetour} />
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.section}>{tr("Aujourd'hui", 'Today')}</Text>
        {jour.map((q) => (
          <CarteQuete key={q.id} quete={q} onReclamer={() => onReclamer(q.id)} />
        ))}

        <View style={[styles.carte, styles.carteBonus, bonus && styles.cartePrete]}>
          <Text style={styles.emoji}>🎁</Text>
          <View style={styles.texte}>
            <Text style={styles.titre}>{tr('Bonus du jour', 'Daily bonus')}</Text>
            <Text style={styles.detail}>
              {bonusRecupere
                ? tr('Récupéré, à demain !', 'Collected, see you tomorrow!')
                : tr('Récupérez vos 3 quêtes ({n}/3)', 'Collect your 3 quests ({n}/3)', { n: faites })}
            </Text>
            <Text style={styles.recompense}>{libelleRecompense(BONUS_JOUR)}</Text>
          </View>
          {bonusRecupere ? (
            <Text style={styles.coche}>✓</Text>
          ) : (
            <TouchableOpacity style={[styles.bouton, !bonus && styles.boutonInactif]} disabled={!bonus} onPress={() => onReclamer('bonus')} activeOpacity={0.85}>
              <Text style={styles.boutonTexte}>{tr('Récupérer', 'Collect')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.section, styles.sectionSemaine]}>{tr('Quête de la semaine', 'Weekly quest')}</Text>
        <CarteQuete quete={semaine} onReclamer={() => onReclamer(semaine.id)} grande />

        <Text style={styles.note}>
          {tr(
            'Les quêtes du jour changent chaque nuit à minuit, celle de la semaine chaque lundi. Elles avancent toutes seules quand vous jouez.',
            'Daily quests change every night at midnight, the weekly one every Monday. They progress on their own as you play.',
          )}
        </Text>
      </ScrollView>
    </View>
  );
}

function CarteQuete({ quete, onReclamer, grande }: { quete: Quete; onReclamer: () => void; grande?: boolean }) {
  const part = quete.cible > 0 ? Math.min(1, quete.progres / quete.cible) : 0;
  return (
    <View style={[styles.carte, quete.prete && styles.cartePrete, quete.reclamee && styles.carteFaite]}>
      <Text style={styles.emoji}>{grande ? '🏆' : quete.reclamee ? '✅' : '🎯'}</Text>
      <View style={styles.texte}>
        <Text style={styles.titre}>{quete.titre}</Text>
        <View style={styles.piste}>
          <View style={[styles.barre, { width: `${part * 100}%` }, quete.prete || quete.reclamee ? styles.barreOk : null]} />
        </View>
        <Text style={styles.detail}>
          {quete.progres}/{quete.cible} · <Text style={styles.recompense}>{libelleRecompense(quete.recompense)}</Text>
        </Text>
      </View>
      {quete.reclamee ? (
        <Text style={styles.coche}>✓</Text>
      ) : (
        <TouchableOpacity style={[styles.bouton, !quete.prete && styles.boutonInactif]} disabled={!quete.prete} onPress={onReclamer} activeOpacity={0.85}>
          <Text style={styles.boutonTexte}>{tr('Récupérer', 'Collect')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 20, paddingBottom: 40 },
  section: { color: couleurs.texteSecondaire, fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  sectionSemaine: { marginTop: 22 },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,31,58,0.88)',
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 14,
    marginBottom: 10,
  },
  cartePrete: { borderColor: couleurs.accent },
  carteFaite: { opacity: 0.6 },
  carteBonus: { marginTop: 4 },
  emoji: { fontSize: 28, marginRight: 12 },
  texte: { flex: 1, minWidth: 0 },
  titre: { color: couleurs.texte, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  piste: { height: 8, backgroundColor: couleurs.carteClaire, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  barre: { height: '100%', backgroundColor: couleurs.accent, borderRadius: 4 },
  barreOk: { backgroundColor: couleurs.succes },
  detail: { color: couleurs.texteSecondaire, fontSize: 12, marginTop: 6 },
  recompense: { color: couleurs.accent, fontWeight: '800', fontSize: 12 },
  bouton: { backgroundColor: couleurs.accent, borderRadius: rayon, paddingHorizontal: 12, paddingVertical: 10, marginLeft: 10 },
  boutonInactif: { opacity: 0.35 },
  boutonTexte: { color: '#1B1B1B', fontWeight: '800', fontSize: 13 },
  coche: { color: couleurs.succes, fontSize: 24, fontWeight: '900', marginLeft: 10 },
  note: { color: couleurs.texteSecondaire, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 18 },
});
