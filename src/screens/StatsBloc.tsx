import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatsDuJour, lireStatsDuJour } from '../game/serveur';
import { tr } from '../i18n';
import { couleurs, rayon } from '../theme';

/** Statistiques anonymes de tous les joueurs du jour (affichées seulement quand il y a assez de monde). */
export default function StatsBloc({ jour }: { jour: string }) {
  const [stats, setStats] = useState<StatsDuJour | null>(null);

  useEffect(() => {
    let actif = true;
    lireStatsDuJour(jour)
      .then((s) => actif && setStats(s))
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, [jour]);

  if (!stats || !stats.disponible || !stats.repartition || !stats.total) return null;
  const rep = stats.repartition;
  const cles = ['1', '2', '3', '4', '5', '6', 'perdu'];
  const max = Math.max(1, ...cles.map((c) => rep[c] ?? 0));

  return (
    <View style={styles.section}>
      <Text style={styles.titre}>{tr("Aujourd'hui sur Quizzle", 'Today on Quizzle')}</Text>
      <Text style={styles.resume}>
        {tr('{n} joueurs · {t} % ont trouvé', '{n} players · {t}% found it', { n: stats.total, t: stats.taux_reussite ?? 0 })}
        {stats.essais_moyen ? ` · ${tr('moyenne', 'avg')} ${stats.essais_moyen}` : ''}
      </Text>
      {cles.map((c) => (
        <View key={c} style={styles.ligne}>
          <Text style={styles.etiquette}>{c === 'perdu' ? '❌' : c === '6' ? '6+' : c}</Text>
          <View style={styles.piste}>
            <View style={[styles.barre, { width: `${Math.max(2, ((rep[c] ?? 0) / max) * 100)}%` }, c === 'perdu' && styles.barrePerdu]} />
          </View>
          <Text style={styles.nombre}>{rep[c] ?? 0}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: 'rgba(26,31,58,0.82)', borderRadius: rayon, borderWidth: 1, borderColor: couleurs.bordure, padding: 16, marginBottom: 16 },
  titre: { color: couleurs.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.1, marginBottom: 6, textTransform: 'uppercase' },
  resume: { color: couleurs.texte, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  etiquette: { width: 24, color: couleurs.texte, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  piste: { flex: 1, height: 12, backgroundColor: couleurs.carteClaire, borderRadius: 6, overflow: 'hidden' },
  barre: { height: 12, backgroundColor: couleurs.accent, borderRadius: 6 },
  barrePerdu: { backgroundColor: couleurs.erreur },
  nombre: { width: 40, color: couleurs.texteSecondaire, fontSize: 12, textAlign: 'right' },
});
