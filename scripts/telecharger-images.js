// Télécharge les photos du mode image depuis Wikimedia Commons (à lancer sur ton PC : node scripts/telecharger-images.js).
// Pour chaque image : cherche une photo libre (CC0, domaine public, CC BY, CC BY-SA), la télécharge en 1200 px de large
// dans assets/images/<identifiant>.jpg, et ajoute sa ligne de crédit à assets/images/credits.txt.
// Un rapport (scripts/rapport-images.txt) liste le fichier retenu pour chaque image : regarde les photos avant de valider.
// Options : --force (retélécharge même si le fichier existe), --seulement=id1,id2
const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', 'assets', 'images');
const CREDITS = path.join(DOSSIER, 'credits.txt');
const RAPPORT = path.join(__dirname, 'rapport-images.txt');
const UA = 'QuizzleImages/1.0 (https://occitangames.com; contact@occitangames.com)';
const LARGEUR = 1200;

const IMAGES = [
  {
    "id": "sacre-coeur",
    "recherche": "Sacré-Cœur Basilica Montmartre Paris"
  },
  {
    "id": "versailles",
    "recherche": "Château de Versailles facade"
  },
  {
    "id": "pyramide-louvre",
    "recherche": "Louvre Pyramid"
  },
  {
    "id": "opera-sydney",
    "recherche": "Sydney Opera House"
  },
  {
    "id": "golden-gate",
    "recherche": "Golden Gate Bridge San Francisco"
  },
  {
    "id": "christ-redempteur",
    "recherche": "Christ the Redeemer Rio de Janeiro"
  },
  {
    "id": "petra",
    "recherche": "Petra Jordan Treasury Al-Khazneh"
  },
  {
    "id": "angkor-vat",
    "recherche": "Angkor Wat"
  },
  {
    "id": "burj-khalifa",
    "recherche": "Burj Khalifa"
  },
  {
    "id": "carcassonne",
    "recherche": "Cité de Carcassonne"
  },
  {
    "id": "chichen-itza",
    "recherche": "Chichen Itza El Castillo"
  },
  {
    "id": "stonehenge",
    "recherche": "Stonehenge"
  },
  {
    "id": "alhambra",
    "recherche": "Alhambra Granada"
  },
  {
    "id": "porte-brandebourg",
    "recherche": "Brandenburg Gate Berlin"
  },
  {
    "id": "mont-fuji",
    "recherche": "Mount Fuji"
  },
  {
    "id": "grand-canyon",
    "recherche": "Grand Canyon"
  },
  {
    "id": "chutes-niagara",
    "recherche": "Niagara Falls"
  },
  {
    "id": "mont-blanc",
    "recherche": "Mont Blanc massif"
  },
  {
    "id": "naissance-venus",
    "recherche": "Sandro Botticelli La nascita di Venere"
  },
  {
    "id": "le-baiser",
    "recherche": "Gustav Klimt The Kiss"
  },
  {
    "id": "radeau-meduse",
    "recherche": "Théodore Géricault Raft of the Medusa"
  },
  {
    "id": "nympheas",
    "recherche": "Claude Monet Water Lilies"
  },
  {
    "id": "ronde-de-nuit",
    "recherche": "Rembrandt The Night Watch"
  },
  {
    "id": "le-penseur",
    "recherche": "Auguste Rodin The Thinker"
  },
  {
    "id": "venus-de-milo",
    "recherche": "Venus de Milo Louvre"
  },
  {
    "id": "david-michel-ange",
    "recherche": "Michelangelo David Galleria dell Accademia"
  },
  {
    "id": "victor-hugo",
    "recherche": "Victor Hugo Nadar portrait"
  },
  {
    "id": "marie-curie",
    "recherche": "Marie Curie portrait"
  },
  {
    "id": "leonard-de-vinci",
    "recherche": "Leonardo da Vinci portrait"
  },
  {
    "id": "cleopatre",
    "recherche": "Cleopatra VII bust Berlin"
  },
  {
    "id": "jeanne-d-arc",
    "recherche": "Joan of Arc portrait"
  },
  {
    "id": "gandhi",
    "recherche": "Mahatma Gandhi portrait"
  },
  {
    "id": "louis-pasteur",
    "recherche": "Louis Pasteur portrait"
  },
  {
    "id": "loup",
    "recherche": "Grey wolf Canis lupus"
  },
  {
    "id": "ours-polaire",
    "recherche": "Polar bear Ursus maritimus"
  },
  {
    "id": "flamant-rose",
    "recherche": "Greater flamingo Phoenicopterus roseus"
  },
  {
    "id": "dauphin",
    "recherche": "Bottlenose dolphin Tursiops truncatus"
  },
  {
    "id": "paon",
    "recherche": "Indian peafowl male display"
  },
  {
    "id": "guepard",
    "recherche": "Cheetah Acinonyx jubatus"
  },
  {
    "id": "koala",
    "recherche": "Koala Phascolarctos cinereus"
  }
];

const args = process.argv.slice(2);
const force = args.includes('--force');
const seulement = (args.find((a) => a.startsWith('--seulement=')) || '').replace('--seulement=', '').split(',').filter(Boolean);

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function appel(url, binaire) {
  for (let essai = 1; essai <= 6; essai++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: binaire ? '*/*' : 'application/json' } });
    if (r.status === 429 || r.status >= 500) {
      await pause(4000 * essai);
      continue;
    }
    if (!r.ok) throw new Error('HTTP ' + r.status + ' pour ' + url);
    return binaire ? Buffer.from(await r.arrayBuffer()) : r.json();
  }
  throw new Error('Trop de tentatives : ' + url);
}

const API = 'https://commons.wikimedia.org/w/api.php';
const PROP = 'imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=' + LARGEUR;

function nettoie(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/;/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

// Licence acceptée : libre, réutilisable, sans clause « pas d'usage commercial » ni « pas de modification ».
function licenceOk(licence) {
  const l = (licence || '').toLowerCase();
  if (/\b(nc|nd)\b|non-?commercial|no derivs/.test(l)) return false;
  return /^(cc0|cc-zero|public domain|pd|cc by|cc-by|attribution)/.test(l) || l.includes('public domain');
}

function candidat(page) {
  const info = page.imageinfo && page.imageinfo[0];
  if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime)) return null;
  const meta = info.extmetadata || {};
  const licence = nettoie((meta.LicenseShortName || {}).value);
  if (!licenceOk(licence)) return null;
  if (info.width < 1000 || info.height < 700) return null;
  const paysage = info.width >= info.height * 0.9;
  return {
    titre: page.title,
    url: info.thumburl || info.url,
    mime: info.mime,
    auteur: nettoie((meta.Artist || {}).value) || 'Auteur inconnu',
    licence,
    lien: info.descriptionurl,
    paysage,
    surface: info.width * info.height,
  };
}

async function parRecherche(requete) {
  const url = API + '?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=' + encodeURIComponent(requete) + '&prop=' + PROP;
  const data = await appel(url);
  const pages = Object.values((data.query && data.query.pages) || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages.map(candidat).filter(Boolean);
}

async function choisir(item) {
  const essais = [
    item.recherche + ' incategory:"Featured pictures on Wikimedia Commons"',
    item.recherche + ' incategory:"Quality images"',
    item.recherche + ' filetype:bitmap',
  ];
  for (const requete of essais) {
    const liste = await parRecherche(requete);
    const bons = liste.filter((c) => c.paysage);
    if (bons.length) return bons[0];
    await pause(800);
  }
  return null;
}

async function main() {
  fs.mkdirSync(DOSSIER, { recursive: true });
  const credits = fs.existsSync(CREDITS) ? fs.readFileSync(CREDITS, 'utf8') : '';
  const deja = new Set(credits.split('\n').map((l) => l.split(';')[0].trim()).filter(Boolean));
  const rapport = [];
  let nouvelles = '';
  for (const item of IMAGES) {
    if (seulement.length && !seulement.includes(item.id)) continue;
    const trouves = fs.readdirSync(DOSSIER).filter((f) => f.replace(/\.[^.]+$/, '') === item.id);
    if (trouves.length && !force) {
      rapport.push(item.id + ' : déjà présent (' + trouves[0] + ')');
      continue;
    }
    try {
      const c = await choisir(item);
      if (!c) {
        rapport.push(item.id + ' : AUCUNE PHOTO LIBRE TROUVÉE (cherche à la main : ' + item.recherche + ')');
        console.log('✗ ' + item.id);
        continue;
      }
      const ext = c.mime === 'image/png' ? 'png' : c.mime === 'image/webp' ? 'webp' : 'jpg';
      const buf = await appel(c.url, true);
      fs.writeFileSync(path.join(DOSSIER, item.id + '.' + ext), buf);
      if (!deja.has(item.id)) nouvelles += item.id + ' ; ' + c.auteur + ' ; ' + c.licence + ' ; ' + c.lien + '\n';
      rapport.push(item.id + ' : ' + c.titre + ' | ' + c.auteur + ' | ' + c.licence + ' | ' + Math.round(buf.length / 1024) + ' Ko');
      console.log('✓ ' + item.id + ' ← ' + c.titre);
    } catch (e) {
      rapport.push(item.id + ' : ERREUR ' + e.message);
      console.log('✗ ' + item.id + ' : ' + e.message);
    }
    await pause(1500);
  }
  if (nouvelles) fs.appendFileSync(CREDITS, (credits && !credits.endsWith('\n') ? '\n' : '') + nouvelles);
  fs.writeFileSync(RAPPORT, rapport.join('\n') + '\n');
  console.log('\nRapport : ' + RAPPORT);
  console.log('Étape suivante : node scripts/gen-images.js');
}

main();
