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

// Crédits des photos : assets/images/credits.txt (une ligne par image : identifiant ; auteur ; licence ; lien).
const fcred = path.join(dossier, 'credits.txt');
const credits = fs.existsSync(fcred)
  ? fs.readFileSync(fcred, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(';').map((x) => x.trim()))
  : [];
const codeCredits = `/** Crédits des photos du mode image. Fichier généré par \`node scripts/gen-images.js\` à partir de assets/images/credits.txt. */
export const CREDITS_IMAGES: { id: string; auteur: string; licence: string; lien: string }[] = ${JSON.stringify(
  credits.filter((c) => c.length >= 4).map((c) => ({ id: c[0], auteur: c[1], licence: c[2], lien: c[3] })),
  null,
  2,
)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'imagesCredits.ts'), codeCredits);
