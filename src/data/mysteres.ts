export type Categorie = 'Personnage' | 'Lieu' | 'Monument';

export interface Mystere {
  id: string;
  categorie: Categorie;
  reponse: string;
  /** Autres écritures acceptées (la casse, les accents et les articles sont ignorés). */
  alias: string[];
  /** 6 indices, du plus vague au plus précis. */
  indices: [string, string, string, string, string, string];
  /** Le « le saviez-vous ? » affiché en fin de partie. */
  anecdote: string;
}

export const MYSTERES: Mystere[] = [
  {
    id: 'vinci',
    categorie: 'Personnage',
    reponse: 'Léonard de Vinci',
    alias: ['Leonard', 'Vinci', 'De Vinci'],
    indices: [
      'Je suis né en 1452, en Toscane.',
      'Peintre, mais aussi ingénieur, anatomiste et inventeur : je voulais tout comprendre.',
      "J'ai rempli des milliers de pages de carnets, écrits en miroir.",
      "J'ai passé mes dernières années en France, invité par un roi.",
      'Mon tableau le plus célèbre représente une femme au sourire énigmatique.',
      'Mon nom vient du village toscan où je suis né.',
    ],
    anecdote:
      "Léonard de Vinci est mort en 1519 au manoir du Clos Lucé, près d'Amboise, invité par François Ier. Il est enterré dans l'enceinte du château d'Amboise.",
  },
  {
    id: 'curie',
    categorie: 'Personnage',
    reponse: 'Marie Curie',
    alias: ['Curie', 'Madame Curie', 'Marie Sklodowska Curie'],
    indices: [
      'Je suis née à Varsovie en 1867.',
      "Je me suis installée à Paris pour étudier à la Sorbonne.",
      "J'ai découvert deux éléments chimiques avec mon mari.",
      "L'un d'eux porte le nom de mon pays natal.",
      'Je suis la première femme à avoir reçu un prix Nobel.',
      "J'en ai reçu deux, en physique puis en chimie.",
    ],
    anecdote:
      "Marie Curie reste la seule personne à avoir reçu un prix Nobel dans deux sciences différentes (physique en 1903, chimie en 1911). Ses cahiers de laboratoire sont encore radioactifs aujourd'hui.",
  },
  {
    id: 'mont-saint-michel',
    categorie: 'Lieu',
    reponse: 'Le Mont-Saint-Michel',
    alias: ['Mont Saint Michel', 'Mont St Michel'],
    indices: [
      'Je suis un lieu français classé au patrimoine mondial de l\'UNESCO depuis 1979.',
      'Je suis situé en Normandie, tout près de la Bretagne.',
      "Je suis un îlot rocheux entouré par l'une des plus fortes marées d'Europe.",
      'Une abbaye bénédictine couronne mon sommet.',
      'Je suis dédié à un archange.',
      "Une statue de cet archange terrasse un dragon au sommet de ma flèche.",
    ],
    anecdote:
      "Selon un vieux dicton, le Couesnon « par sa folie a mis le Mont en Normandie » : la rivière, qui marque la frontière avec la Bretagne, a changé de lit au fil des siècles.",
  },
  {
    id: 'hugo',
    categorie: 'Personnage',
    reponse: 'Victor Hugo',
    alias: ['Hugo'],
    indices: [
      'Je suis né en 1802 à Besançon.',
      "Je suis écrivain, mais aussi dessinateur et homme politique.",
      "Opposant à Napoléon III, j'ai vécu en exil à Jersey puis à Guernesey.",
      "J'ai écrit l'histoire d'un sonneur de cloches bossu qui vit dans une cathédrale.",
      "Mon roman le plus célèbre suit Jean Valjean.",
      'Mon tombeau se trouve au Panthéon.',
    ],
    anecdote:
      "À sa mort en 1885, Victor Hugo a eu droit à des obsèques nationales : sa dépouille a été exposée sous l'Arc de Triomphe avant de rejoindre le Panthéon, suivie par une foule immense.",
  },
  {
    id: 'tour-eiffel',
    categorie: 'Monument',
    reponse: 'La tour Eiffel',
    alias: ['Tour Eiffel', 'Eiffel'],
    indices: [
      "J'ai été construite pour une Exposition universelle.",
      "Mon inauguration date de 1889, pour le centenaire de la Révolution.",
      "Je suis faite de fer puddlé, assemblé avec des rivets.",
      "À l'origine, je devais être démontée au bout de vingt ans.",
      "Mon utilité pour la radiotélégraphie m'a sauvée.",
      "Je porte le nom de l'entreprise de l'ingénieur qui m'a bâtie.",
    ],
    anecdote:
      "La tour Eiffel devait être démontée en 1909. Son utilité comme antenne de radiotélégraphie a convaincu les autorités de la conserver.",
  },
  {
    id: 'cleopatre',
    categorie: 'Personnage',
    reponse: 'Cléopâtre',
    alias: ['Cleopatre', 'Cléopâtre VII', 'Cleopatre VII'],
    indices: [
      "J'ai régné sur l'Égypte au Ier siècle avant J.-C.",
      'Je suis la dernière souveraine de la dynastie des Ptolémées.',
      "On dit que je parlais plusieurs langues, dont l'égyptien.",
      "Ma capitale était Alexandrie.",
      "Je me suis alliée à Jules César, puis à Marc Antoine.",
      "Je suis morte en 30 avant J.-C., après la défaite d'Actium.",
    ],
    anecdote:
      "Cléopâtre était d'origine grecque macédonienne. Elle est considérée comme la première de sa dynastie à avoir appris la langue égyptienne.",
  },
  {
    id: 'mozart',
    categorie: 'Personnage',
    reponse: 'Mozart',
    alias: ['Wolfgang Amadeus Mozart', 'Wolfgang Mozart'],
    indices: [
      'Je suis né à Salzbourg en 1756.',
      "J'étais un enfant prodige : je jouais devant les cours d'Europe dès mon plus jeune âge.",
      "J'ai composé des symphonies, des concertos et des opéras.",
      "Mon opéra La Flûte enchantée est l'un de mes derniers.",
      'Mon Requiem est resté inachevé.',
      "Je suis mort à Vienne en 1791, à 35 ans.",
    ],
    anecdote:
      "Mozart a composé ses premières petites pièces vers l'âge de cinq ans. Il a laissé plus de 600 œuvres en à peine 35 ans de vie.",
  },
  {
    id: 'colomb',
    categorie: 'Personnage',
    reponse: 'Christophe Colomb',
    alias: ['Colomb'],
    indices: [
      'Je suis né à Gênes au XVe siècle.',
      'Je suis navigateur.',
      'Des souverains espagnols ont financé mon expédition.',
      "En 1492, j'ai traversé l'Atlantique avec trois navires.",
      "L'un de mes navires s'appelait la Santa Maria.",
      "Je pensais avoir atteint les Indes.",
    ],
    anecdote:
      "Christophe Colomb a effectué quatre voyages vers les Amériques. On dit qu'il serait mort en restant persuadé d'avoir atteint l'Asie.",
  },
  {
    id: 'machu-picchu',
    categorie: 'Lieu',
    reponse: 'Machu Picchu',
    alias: ['Machu Pichu', 'Machupicchu'],
    indices: [
      "Je suis un site archéologique d'Amérique du Sud.",
      'Je me trouve dans les Andes, à environ 2 400 mètres d\'altitude.',
      "J'ai été bâti au XVe siècle par une grande civilisation précolombienne.",
      "Mon nom signifie à peu près « vieille montagne ».",
      "On m'a révélé au monde en 1911, grâce à l'explorateur Hiram Bingham.",
      'Je suis surnommé la « cité perdue des Incas ».',
    ],
    anecdote:
      "Machu Picchu aurait été un domaine royal de l'empereur inca Pachacutec. Le site est classé à l'UNESCO depuis 1983.",
  },
  {
    id: 'napoleon',
    categorie: 'Personnage',
    reponse: 'Napoléon Bonaparte',
    alias: ['Napoléon', 'Napoleon', 'Napoleon Bonaparte', 'Napoléon Ier', 'Bonaparte'],
    indices: [
      'Je suis né en 1769 en Corse, à Ajaccio.',
      'Militaire de formation, je suis devenu chef de la France.',
      "Je me suis couronné moi-même en 1804.",
      "Ma victoire d'Austerlitz est restée célèbre.",
      "Ma dernière bataille s'est jouée à Waterloo.",
      'Je suis mort en exil à Sainte-Hélène.',
    ],
    anecdote:
      "Le Code civil de 1804, voulu par Napoléon, reste aujourd'hui encore à la base du droit civil français et a inspiré de nombreux pays.",
  },
  {
    id: 'louvre',
    categorie: 'Monument',
    reponse: 'Le Louvre',
    alias: ['Musée du Louvre', 'Louvre'],
    indices: [
      'Je suis à Paris, au bord de la Seine.',
      "À l'origine, j'étais une forteresse, puis un palais royal.",
      "Je suis devenu un musée pendant la Révolution, en 1793.",
      "Une pyramide de verre marque mon entrée depuis 1989.",
      "Je suis le musée le plus visité du monde.",
      'La Joconde est mon œuvre star.',
    ],
    anecdote:
      "La pyramide de verre du Louvre, conçue par l'architecte I. M. Pei, a été très critiquée à son inauguration avant de devenir un symbole de Paris.",
  },
  {
    id: 'einstein',
    categorie: 'Personnage',
    reponse: 'Albert Einstein',
    alias: ['Einstein'],
    indices: [
      'Je suis né à Ulm, en Allemagne, en 1879.',
      'Je suis physicien.',
      "Ma théorie de la relativité a changé notre vision de l'espace et du temps.",
      'On me doit la célèbre formule E = mc².',
      "J'ai reçu le prix Nobel de physique en 1921.",
      "Je me suis installé aux États-Unis, à Princeton, après avoir fui le nazisme.",
    ],
    anecdote:
      "Einstein a reçu son prix Nobel pour son explication de l'effet photoélectrique, et non pour la relativité.",
  },
];
