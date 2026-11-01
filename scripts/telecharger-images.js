// Télécharge les photos du mode image depuis Wikimedia Commons (à lancer sur ton PC : node scripts/telecharger-images.js).
// Pour chaque image : cherche une photo libre (CC0, domaine public, CC BY, CC BY-SA), la télécharge en 1200 px de large
// dans assets/images/<identifiant>.jpg, et ajoute sa ligne de crédit à assets/images/credits.txt.
// Un rapport (scripts/rapport-images.txt) liste le fichier retenu pour chaque image : regarde les photos avant de valider.
// Options : --force (retélécharge même si le fichier existe), --seulement=id1,id2,
//           --refaire (ne retélécharge que les images marquées « refaire » : photos corrigées après un premier passage).
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
    "recherche": "Château de Versailles facade cour de marbre"
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
    "recherche": "Golden Gate Bridge San Francisco",
    "motsTitre": "golden gate",
    "motsExclus": "bw|black|fog|night"
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
    "recherche": "Mount Fuji Japan landscape Lake Kawaguchi",
    "titre": "File:Lake Kawaguchiko Sakura Mount Fuji 3.JPG"
  },
  {
    "id": "grand-canyon",
    "recherche": "Grand Canyon"
  },
  {
    "id": "chutes-niagara",
    "recherche": "Horseshoe Falls Niagara Falls Canada waterfall"
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
    "recherche": "Claude Monet Nymphéas painting",
    "titre": "File:Claude Monet - Water Lilies - 1906, Ryerson.jpg"
  },
  {
    "id": "ronde-de-nuit",
    "recherche": "Rembrandt The Night Watch"
  },
  {
    "id": "le-penseur",
    "recherche": "Rodin The Thinker sculpture",
    "portrait": true,
    "motsTitre": "thinker|penseur|rodin",
    "titre": [
      "File:Thinker Rodin.jpg",
      "File:The Thinker, Rodin.jpg",
      "File:Le Penseur (Rodin), Musée Rodin.jpg"
    ]
  },
  {
    "id": "venus-de-milo",
    "recherche": "Venus de Milo Louvre"
  },
  {
    "id": "david-michel-ange",
    "recherche": "Michelangelo David statue Florence Accademia",
    "titre": "File:'David' by Michelangelo Fir JBU002.jpg"
  },
  {
    "id": "victor-hugo",
    "recherche": "Victor Hugo portrait Carjat",
    "titre": "File:Victor Hugo by Étienne Carjat 1876 - full.jpg",
    "portrait": true
  },
  {
    "id": "marie-curie",
    "recherche": "Marie Curie portrait",
    "titre": "File:Marie Curie c1920.jpg",
    "portrait": true
  },
  {
    "id": "leonard-de-vinci",
    "recherche": "Leonardo da Vinci self-portrait red chalk",
    "titre": [
      "File:Leonardo da Vinci - presumed self-portrait - WGA12798.jpg",
      "File:Leonardo self.jpg",
      "File:Francesco Melzi - Portrait of Leonardo.png"
    ],
    "portrait": true
  },
  {
    "id": "cleopatre",
    "recherche": "Cleopatra VII bust Altes Museum Berlin",
    "titre": "File:Kleopatra-VII.-Altes-Museum-Berlin1.jpg",
    "portrait": true
  },
  {
    "id": "jeanne-d-arc",
    "recherche": "Joan of Arc miniature 15th century",
    "titre": "File:Joan of Arc miniature graded.jpg",
    "portrait": true
  },
  {
    "id": "gandhi",
    "recherche": "Mahatma Gandhi portrait 1931",
    "titre": "File:Mahatma-Gandhi, studio, 1931.jpg",
    "portrait": true
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
    "recherche": "Polar bear Ursus maritimus",
    "titre": [
      "File:Polar Bear - Alaska (cropped).jpg",
      "File:Polar bear (Ursus maritimus) 2.jpg"
    ],
    "motsExclus": "stamp|colnect|prey|kill|seal|carcass|eating|feeding|postage|coin|drawing|logo",
    "motsTitre": "polar|ours|bear"
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
const refaire = args.includes('--refaire'); // retélécharge seulement les images marquées « refaire » dans la liste (photos corrigées)
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

function candidat(page, souple) {
  const info = page.imageinfo && page.imageinfo[0];
  if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime)) return null;
  const meta = info.extmetadata || {};
  const licence = nettoie((meta.LicenseShortName || {}).value);
  if (!licenceOk(licence)) return null;
  if (souple ? info.width < 600 || info.height < 600 : info.width < 1000 || info.height < 700) return null;
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

async function parTitre(titre) {
  const url = API + '?action=query&format=json&titles=' + encodeURIComponent(titre) + '&prop=' + PROP;
  const data = await appel(url);
  const pages = Object.values((data.query && data.query.pages) || {});
  return pages.map((p) => candidat(p, true)).filter(Boolean);
}

async function choisir(item) {
  for (const titre of [].concat(item.titre || [])) {
    const direct = await parTitre(titre);
    if (direct.length) return direct[0];
    console.log('  (titre introuvable ou licence refusée : ' + titre + ')');
  }
  const essais = [
    item.recherche + ' incategory:"Featured pictures on Wikimedia Commons"',
    item.recherche + ' incategory:"Quality images"',
    item.recherche + ' filetype:bitmap',
  ];
  for (const requete of essais) {
    const liste = await parRecherche(requete);
    const mots = item.motsTitre ? new RegExp(item.motsTitre, 'i') : null;
    const exclus = item.motsExclus ? new RegExp(item.motsExclus, 'i') : null;
    const bons = liste.filter((c) => (c.paysage || item.portrait) && (!mots || mots.test(c.titre)) && (!exclus || !exclus.test(c.titre)));
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
  const retirer = new Set();
  for (const item of IMAGES) {
    if (seulement.length && !seulement.includes(item.id)) continue;
    if (refaire && !item.refaire) continue;
    const trouves = fs.readdirSync(DOSSIER).filter((f) => f.replace(/\.[^.]+$/, '') === item.id);
    if (trouves.length && !force && !refaire) {
      rapport.push(item.id + ' : déjà présent (' + trouves[0] + ')');
      continue;
    }
    try {
      const c = await choisir(item);
      if (!c) {
        if (refaire && trouves.length) {
          for (const vieux of trouves) fs.unlinkSync(path.join(DOSSIER, vieux));
          retirer.add(item.id);
          rapport.push(item.id + ' : ancienne photo SUPPRIMÉE (elle était fausse), aucune nouvelle trouvée');
        }
        rapport.push(item.id + ' : AUCUNE PHOTO LIBRE TROUVÉE (cherche à la main : ' + item.recherche + ')');
        console.log('✗ ' + item.id);
        continue;
      }
      const ext = c.mime === 'image/png' ? 'png' : c.mime === 'image/webp' ? 'webp' : 'jpg';
      let buf = await appel(c.url, true);
      if (buf.length > 1500 * 1024 && /\/\d+px-/.test(c.url)) {
        buf = await appel(c.url.replace(/\/\d+px-/, '/700px-'), true); // version plus légère
      }
      for (const vieux of trouves) fs.unlinkSync(path.join(DOSSIER, vieux)); // évite deux fichiers pour le même identifiant
      fs.writeFileSync(path.join(DOSSIER, item.id + '.' + ext), buf);
      retirer.add(item.id);
      nouvelles += item.id + ' ; ' + c.auteur + ' ; ' + c.licence + ' ; ' + c.lien + '\n';
      rapport.push(item.id + ' : ' + c.titre + ' | ' + c.auteur + ' | ' + c.licence + ' | ' + Math.round(buf.length / 1024) + ' Ko');
      console.log('✓ ' + item.id + ' ← ' + c.titre);
    } catch (e) {
      rapport.push(item.id + ' : ERREUR ' + e.message);
      console.log('✗ ' + item.id + ' : ' + e.message);
    }
    await pause(1500);
  }
  if (nouvelles || retirer.size) {
    // Les lignes de crédit des images refaites sont remplacées, pas dupliquées.
    const gardees = credits.split('\n').filter((l) => l.trim() && !retirer.has(l.split(';')[0].trim()));
    fs.writeFileSync(CREDITS, gardees.join('\n') + (gardees.length ? '\n' : '') + nouvelles);
  }
  fs.writeFileSync(RAPPORT, rapport.join('\n') + '\n');
  console.log('\nRapport : ' + RAPPORT);
  console.log('Étape suivante : node scripts/gen-images.js');
}

main();
