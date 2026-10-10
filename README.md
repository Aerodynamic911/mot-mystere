# Mot Mystère

Jeu quotidien de culture générale (Expo / React Native, TypeScript).

## Lancer le jeu

```bash
npm install
npx expo start
```

Scannez le QR code avec l'app **Expo Go** (iPhone ou Android).

Si Expo Go signale une version de SDK incompatible :

```bash
npx expo install expo@latest
npx expo install --fix
npx expo start -c
```

## Contenu

- `src/data/mysteres.ts` : les mystères (6 indices du plus vague au plus précis, alias acceptés, anecdote). Ajoutez-en pour allonger le cycle quotidien.
- `src/game/engine.ts` : validation des réponses (accents, majuscules et articles ignorés), mystère du jour.
- `src/game/storage.ts` : série quotidienne et statistiques (stockage local).
- `src/screens/` : accueil et écran de jeu.

Le mystère du jour est le même pour tous les joueurs (il dépend uniquement de la date).
