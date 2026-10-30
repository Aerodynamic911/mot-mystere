import type { ImageSourcePropType } from 'react-native';
import type { Mystere } from './mysteres';
import type { MystereEn } from './mysteres_en';
import { FICHIERS } from './imagesFichiers';

/** [identifiant du fichier, catégorie FR, catégorie EN, [réponse, autres écritures, anecdote] en français, idem en anglais] */
type Definition = [string, string, string, [string, string[], string], [string, string[], string]];

const DEFINITIONS: Definition[] = [
  // Monuments
  ['tour-eiffel', 'Monument', 'Landmark',
    ['La tour Eiffel', ['Tour Eiffel', 'Eiffel'], "La tour Eiffel mesure environ 330 m avec ses antennes. Construite pour l'Exposition universelle de 1889, elle devait être démontée au bout de vingt ans."],
    ['The Eiffel Tower', ['Eiffel Tower', 'Eiffel', 'Tour Eiffel'], 'The Eiffel Tower is about 330 m tall with its antennas. Built for the 1889 World’s Fair, it was meant to be dismantled after twenty years.']],
  ['colisee', 'Monument', 'Landmark',
    ['Le Colisée', ['Colisée', 'Colisée de Rome', 'Amphithéâtre Flavien'], 'Inauguré en 80 après J.-C., le Colisée de Rome pouvait accueillir des dizaines de milliers de spectateurs venus voir des combats de gladiateurs.'],
    ['The Colosseum', ['Colosseum', 'Coliseum', 'The Roman Colosseum', 'Colisée'], 'Opened in 80 AD, the Colosseum in Rome could seat tens of thousands of spectators who came to watch gladiator fights.']],
  ['pyramides-gizeh', 'Monument', 'Landmark',
    ['Les pyramides de Gizeh', ['Pyramides de Gizeh', 'Pyramide de Gizeh', 'Pyramides', 'Pyramide de Khéops', 'Grande Pyramide'], 'La Grande Pyramide de Khéops a été la plus haute construction du monde pendant près de 3 800 ans.'],
    ['The Pyramids of Giza', ['Pyramids of Giza', 'Giza Pyramids', 'Great Pyramid', 'Pyramids', 'Great Pyramid of Giza', 'Pyramides de Gizeh'], 'The Great Pyramid of Khufu was the tallest structure in the world for nearly 3,800 years.']],
  ['taj-mahal', 'Monument', 'Landmark',
    ['Le Taj Mahal', ['Taj Mahal'], "Le Taj Mahal a été construit au XVIIe siècle, à Agra, par l'empereur moghol Shah Jahan en souvenir de son épouse Mumtaz Mahal."],
    ['The Taj Mahal', ['Taj Mahal'], 'The Taj Mahal was built in the 17th century in Agra by the Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal.']],
  ['statue-liberte', 'Monument', 'Landmark',
    ['La statue de la Liberté', ['Statue de la Liberté', 'Liberté éclairant le monde', 'Lady Liberty'], "La statue de la Liberté a été offerte aux États-Unis par la France et inaugurée en 1886. Elle a été conçue par le sculpteur Bartholdi ; Gustave Eiffel a imaginé sa structure interne."],
    ['The Statue of Liberty', ['Statue of Liberty', 'Lady Liberty', 'Liberty Enlightening the World', 'Statue de la Liberté'], 'The Statue of Liberty was a gift from France to the United States, unveiled in 1886. It was designed by the sculptor Bartholdi; Gustave Eiffel designed its inner structure.']],
  ['mont-saint-michel', 'Monument', 'Landmark',
    ['Le Mont-Saint-Michel', ['Mont Saint Michel', 'Mont-Saint-Michel', 'Mont St Michel'], 'Le Mont-Saint-Michel, en Normandie, est classé au patrimoine mondial de l’UNESCO depuis 1979 et reçoit plus d’un million de visiteurs par an.'],
    ['Mont-Saint-Michel', ['Mont Saint Michel', 'Mont St Michel', 'Le Mont-Saint-Michel'], 'Mont-Saint-Michel, in Normandy, has been a UNESCO World Heritage Site since 1979 and welcomes more than a million visitors a year.']],
  ['big-ben', 'Monument', 'Landmark',
    ['Big Ben', ['Tour Elizabeth', 'Elizabeth Tower', 'La tour de Big Ben'], 'Big Ben est en réalité le surnom de la grosse cloche de la tour de l’horloge du palais de Westminster, à Londres.'],
    ['Big Ben', ['Elizabeth Tower', 'The Elizabeth Tower', 'Tour Elizabeth'], 'Big Ben is actually the nickname of the great bell inside the clock tower of the Palace of Westminster in London.']],
  ['sagrada-familia', 'Monument', 'Landmark',
    ['La Sagrada Família', ['Sagrada Familia', 'La Sagrada Familia', 'Sagrada Família'], 'La Sagrada Família, à Barcelone, est l’œuvre de l’architecte Antoni Gaudí. Sa construction a commencé en 1882 et se poursuit encore.'],
    ['The Sagrada Família', ['Sagrada Familia', 'La Sagrada Familia', 'Sagrada Família'], 'The Sagrada Família in Barcelona is the work of the architect Antoni Gaudí. Construction began in 1882 and is still going on.']],
  ['machu-picchu', 'Lieu', 'Place',
    ['Le Machu Picchu', ['Machu Picchu', 'Machu Pichu'], 'Le Machu Picchu, cité inca perchée à environ 2 400 m d’altitude dans les Andes péruviennes, est classé à l’UNESCO depuis 1983.'],
    ['Machu Picchu', ['Machu Pichu', 'Le Machu Picchu'], 'Machu Picchu, an Inca city perched at about 2,400 m in the Peruvian Andes, has been a UNESCO World Heritage Site since 1983.']],
  ['grande-muraille', 'Monument', 'Landmark',
    ['La Grande Muraille de Chine', ['Grande Muraille', 'Muraille de Chine', 'Grande Muraille de Chine'], 'La Grande Muraille de Chine s’étend sur plus de 20 000 km, toutes sections confondues. Contrairement à une légende, elle n’est pas visible à l’œil nu depuis la Lune.'],
    ['The Great Wall of China', ['Great Wall of China', 'Great Wall', 'The Great Wall', 'Grande Muraille de Chine'], 'The Great Wall of China stretches for more than 20,000 km, counting all its sections. Contrary to a popular legend, it can’t be seen from the Moon with the naked eye.']],
  ['parthenon', 'Monument', 'Landmark',
    ['Le Parthénon', ['Parthénon', 'Parthenon'], 'Le Parthénon, temple dédié à la déesse Athéna, a été construit au Ve siècle avant J.-C. sur l’Acropole d’Athènes.'],
    ['The Parthenon', ['Parthenon', 'Le Parthénon'], 'The Parthenon, a temple dedicated to the goddess Athena, was built in the 5th century BC on the Acropolis of Athens.']],
  ['tour-de-pise', 'Monument', 'Landmark',
    ['La tour de Pise', ['Tour de Pise', 'Tour penchée de Pise', 'La tour penchée de Pise'], 'La tour de Pise penche parce que le sol, trop mou, a cédé dès le début de la construction, au XIIe siècle.'],
    ['The Leaning Tower of Pisa', ['Leaning Tower of Pisa', 'Tower of Pisa', 'Leaning Tower', 'Pisa Tower', 'Tour de Pise'], 'The Tower of Pisa leans because the soft ground gave way early in its construction, in the 12th century.']],
  // Tableaux
  ['joconde', 'Œuvre', 'Artwork',
    ['La Joconde', ['Joconde', 'Mona Lisa', 'Portrait de Mona Lisa', 'La Gioconda'], 'La Joconde, de Léonard de Vinci, est exposée au Louvre. Elle a été volée en 1911 et retrouvée deux ans plus tard.'],
    ['The Mona Lisa', ['Mona Lisa', 'La Gioconda', 'La Joconde', 'Joconde'], 'The Mona Lisa, by Leonardo da Vinci, is on display at the Louvre. It was stolen in 1911 and found again two years later.']],
  ['nuit-etoilee', 'Œuvre', 'Artwork',
    ['La Nuit étoilée', ['Nuit étoilée', 'Starry Night'], 'Van Gogh a peint La Nuit étoilée en 1889, à l’asile de Saint-Rémy-de-Provence, en s’inspirant de la vue depuis sa chambre.'],
    ['The Starry Night', ['Starry Night', 'La Nuit étoilée', 'Nuit étoilée'], 'Van Gogh painted The Starry Night in 1889 at the asylum of Saint-Rémy-de-Provence, inspired by the view from his room.']],
  ['jeune-fille-perle', 'Œuvre', 'Artwork',
    ['La Jeune Fille à la perle', ['Jeune Fille à la perle', 'La jeune fille à la perle'], 'La Jeune Fille à la perle, peinte par Johannes Vermeer vers 1665, est parfois surnommée « la Joconde du Nord ».'],
    ['Girl with a Pearl Earring', ['The Girl with a Pearl Earring', 'Girl with the Pearl Earring', 'La Jeune Fille à la perle', 'Jeune Fille à la perle'], 'Girl with a Pearl Earring, painted by Johannes Vermeer around 1665, is sometimes nicknamed “the Mona Lisa of the North”.']],
  ['le-cri', 'Œuvre', 'Artwork',
    ['Le Cri', ['Cri', 'The Scream'], 'Edvard Munch a réalisé plusieurs versions du Cri ; la plus célèbre date de 1893.'],
    ['The Scream', ['Scream', 'Le Cri', 'Cri'], 'Edvard Munch made several versions of The Scream; the most famous one dates from 1893.']],
  ['tournesols', 'Œuvre', 'Artwork',
    ['Les Tournesols', ['Tournesols', 'Sunflowers', 'Les tournesols de Van Gogh'], 'Van Gogh a peint plusieurs versions des Tournesols en 1888 et 1889, notamment pour décorer la chambre de son ami Paul Gauguin à Arles.'],
    ['Sunflowers', ['The Sunflowers', 'Van Gogh Sunflowers', 'Les Tournesols', 'Tournesols'], 'Van Gogh painted several versions of Sunflowers in 1888 and 1889, partly to decorate the room of his friend Paul Gauguin in Arles.']],
  ['grande-vague', 'Œuvre', 'Artwork',
    ['La Grande Vague de Kanagawa', ['Grande Vague', 'La Grande Vague', 'Grande Vague de Kanagawa', 'La vague de Kanagawa', 'Hokusai'], 'La Grande Vague de Kanagawa est une estampe du Japonais Hokusai, réalisée vers 1831. Le mont Fuji se voit au loin, derrière la vague.'],
    ['The Great Wave off Kanagawa', ['Great Wave', 'The Great Wave', 'Great Wave off Kanagawa', 'Hokusai', 'La Grande Vague de Kanagawa'], 'The Great Wave off Kanagawa is a woodblock print by the Japanese artist Hokusai, made around 1831. Mount Fuji can be seen in the distance, behind the wave.']],
  ['liberte-guidant-peuple', 'Œuvre', 'Artwork',
    ['La Liberté guidant le peuple', ['Liberté guidant le peuple', 'La liberté guidant le peuple'], 'Eugène Delacroix a peint La Liberté guidant le peuple en 1830, pour évoquer les Trois Glorieuses, la révolution de juillet 1830.'],
    ['Liberty Leading the People', ['La Liberté guidant le peuple', 'Liberté guidant le peuple', 'Delacroix'], 'Eugène Delacroix painted Liberty Leading the People in 1830, to commemorate the July Revolution of 1830.']],
  // Portraits
  ['einstein', 'Personnage', 'Person',
    ['Albert Einstein', ['Einstein'], 'Albert Einstein a reçu le prix Nobel de physique pour son explication de l’effet photoélectrique, et non pour la relativité.'],
    ['Albert Einstein', ['Einstein'], 'Albert Einstein received the Nobel Prize in Physics for explaining the photoelectric effect, not for relativity.']],
  ['napoleon', 'Personnage', 'Person',
    ['Napoléon Bonaparte', ['Napoléon', 'Napoleon', 'Napoléon Ier', 'Napoléon 1er', 'Bonaparte', 'Napoleon Bonaparte'], 'Le célèbre tableau de Jacques-Louis David montre Napoléon franchissant les Alpes en 1800. En réalité, il a passé le col du Grand-Saint-Bernard sur une mule.'],
    ['Napoleon Bonaparte', ['Napoleon', 'Napoléon', 'Napoleon I', 'Bonaparte', 'Napoléon Bonaparte'], 'Jacques-Louis David’s famous painting shows Napoleon crossing the Alps in 1800. In reality, he crossed the Great St Bernard Pass on a mule.']],
  ['mozart', 'Compositeur', 'Composer',
    ['Wolfgang Amadeus Mozart', ['Mozart', 'Wolfgang Mozart', 'W. A. Mozart'], 'Mozart a composé ses premières pièces vers l’âge de 5 ans et donnait déjà des concerts dans toute l’Europe pendant son enfance.'],
    ['Wolfgang Amadeus Mozart', ['Mozart', 'Wolfgang Mozart'], 'Mozart composed his first pieces at around the age of 5 and was already giving concerts all over Europe as a child.']],
  ['beethoven', 'Compositeur', 'Composer',
    ['Ludwig van Beethoven', ['Beethoven', 'Ludwig Beethoven'], 'Beethoven a continué à composer alors qu’il devenait sourd : sa 9e symphonie a été créée en 1824, alors qu’il n’entendait presque plus.'],
    ['Ludwig van Beethoven', ['Beethoven', 'Ludwig Beethoven'], 'Beethoven kept composing as he went deaf: his 9th symphony premiered in 1824, when he could hardly hear anymore.']],
  ['louis-xiv', 'Personnage', 'Person',
    ['Louis XIV', ['Louis 14', 'Louis Quatorze', 'Le Roi-Soleil', 'Roi-Soleil', 'Roi Soleil', 'Louis XIV le Roi-Soleil'], 'Louis XIV, surnommé le Roi-Soleil, a régné 72 ans, de 1643 à 1715 : c’est le plus long règne de l’histoire de France.'],
    ['Louis XIV', ['Louis 14', 'Louis the Fourteenth', 'The Sun King', 'Sun King', 'Le Roi-Soleil', 'Roi-Soleil'], 'Louis XIV, nicknamed the Sun King, reigned for 72 years, from 1643 to 1715: the longest reign in French history.']],
  ['newton', 'Personnage', 'Person',
    ['Isaac Newton', ['Newton', 'Sir Isaac Newton'], 'Isaac Newton a formulé la loi de la gravitation universelle. La légende de la pomme est célèbre, mais il n’a sans doute jamais reçu de pomme sur la tête.'],
    ['Isaac Newton', ['Newton', 'Sir Isaac Newton'], 'Isaac Newton formulated the law of universal gravitation. The apple story is famous, but he probably never had an apple fall on his head.']],
  ['darwin', 'Personnage', 'Person',
    ['Charles Darwin', ['Darwin'], 'Charles Darwin a publié L’Origine des espèces en 1859. Son voyage à bord du Beagle, de 1831 à 1836, l’a profondément inspiré.'],
    ['Charles Darwin', ['Darwin'], 'Charles Darwin published On the Origin of Species in 1859. His voyage aboard the Beagle, from 1831 to 1836, was a deep inspiration.']],
  // Espace
  ['terre', 'Espace', 'Space',
    ['La Terre', ['Terre', 'Planète Terre', 'La planète Terre', 'Earth', 'The Earth'], 'La Terre est la seule planète connue à abriter la vie. Environ 71 % de sa surface est recouverte d’eau.'],
    ['The Earth', ['Earth', 'Planet Earth', 'The Planet Earth', 'Terre', 'La Terre'], 'Earth is the only known planet to harbour life. About 71% of its surface is covered by water.']],
  ['lune', 'Espace', 'Space',
    ['La Lune', ['Lune', 'The Moon', 'Moon'], 'La Lune est à environ 384 000 km de la Terre. Neil Armstrong y a posé le pied en juillet 1969, lors de la mission Apollo 11.'],
    ['The Moon', ['Moon', 'La Lune', 'Lune'], 'The Moon is about 384,000 km from Earth. Neil Armstrong set foot on it in July 1969, during the Apollo 11 mission.']],
  ['saturne', 'Espace', 'Space',
    ['Saturne', ['La planète Saturne', 'Planète Saturne', 'Saturn'], 'Saturne est célèbre pour ses anneaux, faits surtout de glace et de roches. Elle est si peu dense qu’elle flotterait sur l’eau, si l’on trouvait un océan assez grand.'],
    ['Saturn', ['The planet Saturn', 'Planet Saturn', 'Saturne'], 'Saturn is famous for its rings, made mostly of ice and rock. It is so light for its size that it would float on water, if you could find an ocean big enough.']],
  ['soleil', 'Espace', 'Space',
    ['Le Soleil', ['Soleil', 'The Sun', 'Sun'], 'Le Soleil représente environ 99,8 % de la masse du système solaire. Sa lumière met environ 8 minutes à nous parvenir.'],
    ['The Sun', ['Sun', 'Le Soleil', 'Soleil'], 'The Sun makes up about 99.8% of the mass of the solar system. Its light takes about 8 minutes to reach us.']],
  // Animaux
  ['elephant', 'Animal', 'Animal',
    ['L’éléphant', ['Éléphant', 'Elephant', 'Un éléphant', 'Éléphant d’Afrique', 'L’éléphant d’Afrique'], 'L’éléphant d’Afrique est le plus grand animal terrestre : il peut peser plus de 6 tonnes.'],
    ['The elephant', ['Elephant', 'An elephant', 'African elephant', 'The African elephant', 'Éléphant'], 'The African elephant is the largest land animal: it can weigh more than 6 tonnes.']],
  ['girafe', 'Animal', 'Animal',
    ['La girafe', ['Girafe', 'Une girafe', 'Giraffe'], 'La girafe a le même nombre de vertèbres au cou que nous : sept, mais beaucoup plus longues.'],
    ['The giraffe', ['Giraffe', 'A giraffe', 'Girafe', 'La girafe'], 'A giraffe has the same number of neck bones as we do: seven, but much longer.']],
  ['panda', 'Animal', 'Animal',
    ['Le panda', ['Panda', 'Panda géant', 'Le panda géant', 'Un panda'], 'Le panda géant mange presque uniquement du bambou, plus de dix kilos par jour.'],
    ['The panda', ['Panda', 'Giant panda', 'The giant panda', 'A panda', 'Le panda'], 'The giant panda eats almost nothing but bamboo, more than ten kilos a day.']],
  ['tigre', 'Animal', 'Animal',
    ['Le tigre', ['Tigre', 'Un tigre', 'Tiger'], 'Le tigre est le plus grand des félins. Chaque tigre a des rayures uniques, un peu comme nos empreintes digitales.'],
    ['The tiger', ['Tiger', 'A tiger', 'Tigre', 'Le tigre'], 'The tiger is the largest of the big cats. Every tiger has unique stripes, a bit like our fingerprints.']],
  ['baleine', 'Animal', 'Animal',
    ['La baleine à bosse', ['Baleine', 'Une baleine', 'Baleine à bosse', 'La baleine', 'Humpback whale'], 'La baleine à bosse migre sur plusieurs milliers de kilomètres chaque année, et les mâles chantent de longues mélodies.'],
    ['The humpback whale', ['Humpback whale', 'Humpback', 'Whale', 'A whale', 'The whale', 'Baleine à bosse', 'La baleine à bosse'], 'The humpback whale migrates thousands of kilometres every year, and the males sing long songs.']],
  ['aigle', 'Animal', 'Animal',
    ['L’aigle', ['Aigle', 'Un aigle', 'Eagle', 'Aigle royal', 'L’aigle royal'], 'L’aigle repère une proie à plusieurs centaines de mètres grâce à sa vue exceptionnelle.'],
    ['The eagle', ['Eagle', 'An eagle', 'Aigle', 'Bald eagle', 'Golden eagle', 'L’aigle'], 'An eagle can spot prey several hundred metres away thanks to its exceptional eyesight.']],
  ['manchot', 'Animal', 'Animal',
    ['Le manchot', ['Manchot', 'Manchot empereur', 'Le manchot empereur', 'Pingouin', 'Le pingouin', 'Un manchot'], 'Chez le manchot empereur, qui vit en Antarctique, le mâle couve l’œuf sur ses pattes pendant l’hiver, pendant que la femelle part se nourrir en mer.'],
    ['The penguin', ['Penguin', 'A penguin', 'Emperor penguin', 'The emperor penguin', 'Manchot', 'Pingouin'], 'Among emperor penguins, which live in Antarctica, the male keeps the egg warm on his feet through the winter while the female goes to feed at sea.']],
  ['kangourou', 'Animal', 'Animal',
    ['Le kangourou', ['Kangourou', 'Un kangourou', 'Kangaroo'], 'Le kangourou ne sait pas marcher en arrière, et son petit, appelé joey, grandit dans la poche de sa mère.'],
    ['The kangaroo', ['Kangaroo', 'A kangaroo', 'Kangourou', 'Le kangourou'], 'A kangaroo can’t walk backwards, and its baby, called a joey, grows up in its mother’s pouch.']],
  ['lion', 'Animal', 'Animal',
    ['Le lion', ['Lion', 'Un lion', 'Le roi des animaux'], 'Le lion est le seul grand félin à vivre en groupe, appelé fierté ; ce sont surtout les lionnes qui chassent.'],
    ['The lion', ['Lion', 'A lion', 'The king of the jungle', 'Le lion'], 'The lion is the only big cat that lives in a group, called a pride; it’s mostly the lionesses that hunt.']],
  ['zebre', 'Animal', 'Animal',
    ['Le zèbre', ['Zèbre', 'Un zèbre', 'Zebre', 'Le zebre', 'Zebra'], 'Chaque zèbre a des rayures uniques. Elles aideraient notamment à éloigner les mouches piqueuses.'],
    ['The zebra', ['Zebra', 'A zebra', 'Zèbre', 'Le zèbre'], 'Every zebra has unique stripes. They would help, among other things, to keep biting flies away.']],
];

const SANS_INDICE: Mystere['indices'] = ['', '', '', '', '', ''];

export interface ImageMystere {
  mystere: Mystere;
  source: ImageSourcePropType;
}

/** Les images fournies avec l'appli (seules celles dont le fichier existe sont jouables). */
export const IMAGES: ImageMystere[] = DEFINITIONS.filter((d) => FICHIERS[d[0]]).map((d) => ({
  mystere: { id: `img-${d[0]}`, categorie: d[1], reponse: d[3][0], alias: d[3][1], indices: SANS_INDICE, anecdote: d[3][2] },
  source: FICHIERS[d[0]],
}));

/** Traductions anglaises des mystères-images, par identifiant. */
export const EN_IMAGES: Record<string, MystereEn> = Object.fromEntries(
  DEFINITIONS.map((d) => [`img-${d[0]}`, { c: d[2], r: d[4][0], a: d[4][1], i: SANS_INDICE, n: d[4][2] } as MystereEn]),
);

/** Le mode image n'apparaît que s'il y a assez d'images pour varier les parties. */
export function imagesDisponibles(): boolean {
  return IMAGES.length >= 5;
}

export function imageParId(id: string): ImageMystere | null {
  return IMAGES.find((i) => i.mystere.id === id) ?? null;
}
