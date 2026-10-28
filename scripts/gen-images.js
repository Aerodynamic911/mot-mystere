// Génère src/data/imagesFichiers.ts à partir des images du dossier assets/images (nom du fichier = identifiant).
const fs = require('fs');
const path = require('path');
const dossier = path.join(__dirname, '..', 'assets', 'images');
const fichiers = fs.existsSync(dossier) ? fs.readdirSync(dossier).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort() : [];
const lignes = fichiers.map((f) => `  '${f.replace(/\.[^.]+$/, '')}': require('../../assets/images/${f}'),`);
const code = `import type { ImageSourcePropType } from 'react-native';

/**
 * Fichiers des images du mode « image qui se dévoile ».
 * Ce fichier est généré par \`node scripts/gen-images.js\` à partir du dossier assets/images : ne pas le modifier à la main.
 */
export const FICHIERS: Record<string, ImageSourcePropType> = {
${lignes.join('\n')}
};
`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'imagesFichiers.ts'), code);
console.log(fichiers.length + ' image(s) référencée(s).');
