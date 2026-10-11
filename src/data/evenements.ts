import { Mystere } from './mysteres';

export interface Evenement {
  id: string;
  titre: string;
  emoji: string;
  description: string;
  couleur: string;
  /** Les 20 étapes, de la plus accessible à la plus relevée. */
  etapes: Mystere[];
}

export const NB_ETAPES = 20;

const merveilles: Mystere[] = [
  {
    id: 'm-gizeh',
    categorie: 'Monument',
    reponse: 'Les pyramides de Gizeh',
    alias: ['Pyramides de Gizeh', 'Pyramide de Gizeh', 'Pyramide de Khéops', 'Grande Pyramide', 'Gizeh', 'Pyramides'],
    indices: [
      "Je suis l'une des plus anciennes merveilles encore debout.",
      'Je me trouve en Afrique, non loin d\'un grand fleuve.',
      'Des milliers d\'ouvriers m\'ont construite il y a environ 4 500 ans.',
      'Je suis faite de millions de blocs de pierre calcaire.',
      'Un sphinx monumental veille non loin de moi.',
      "Je suis le tombeau du pharaon Khéops, près du Caire.",
    ],
    anecdote:
      "La Grande Pyramide de Khéops a été la plus haute construction du monde pendant environ 3 800 ans : elle mesurait à l'origine environ 146 mètres.",
  },
  {
    id: 'm-colisee',
    categorie: 'Monument',
    reponse: 'Le Colisée',
    alias: ['Colisée de Rome', 'Amphithéâtre Flavien', 'Colosseum', 'Colosseo'],
    indices: [
      "J'ai été inauguré au Ier siècle de notre ère.",
      "On me visite aujourd'hui dans une capitale européenne traversée par le Tibre.",
      "Je suis de forme ovale et je pouvais accueillir environ 50 000 spectateurs.",
      'Des gladiateurs s\'y affrontaient devant la foule.',
      "Mon vrai nom est l'amphithéâtre Flavien.",
      "Je suis le plus grand amphithéâtre de l'Empire romain, à Rome.",
    ],
    anecdote:
      "On pense que son nom vient du « Colosse », une statue géante de Néron qui se dressait tout près.",
  },
  {
    id: 'm-taj',
    categorie: 'Monument',
    reponse: 'Le Taj Mahal',
    alias: ['Taj-Mahal', 'Taj'],
    indices: [
      "J'ai été construit au XVIIe siècle.",
      'Je me trouve en Asie, au bord d\'une rivière.',
      'Mon marbre blanc change de couleur selon la lumière du jour.',
      "Un empereur m'a fait bâtir pour honorer son épouse.",
      "Quatre minarets encadrent mon grand dôme.",
      'Je suis à Agra, en Inde.',
    ],
    anecdote:
      "Le Taj Mahal a été commandé par l'empereur moghol Shah Jahan à la mort de son épouse Mumtaz Mahal, en 1631. Sa construction a duré une vingtaine d'années.",
  },
  {
    id: 'm-muraille',
    categorie: 'Monument',
    reponse: 'La Grande Muraille de Chine',
    alias: ['Grande Muraille', 'Muraille de Chine', 'Great Wall of China', 'La Muraille'],
    indices: [
      "Je suis bien plus longue que n'importe quel autre monument.",
      'Je traverse des montagnes, des déserts et des plaines.',
      'Plusieurs dynasties m\'ont construite et reconstruite pendant des siècles.',
      "Je devais protéger un empire contre des invasions venues du nord.",
      "On dit à tort qu'on peut me voir à l'œil nu depuis l'espace.",
      'Mon nom dit tout : une grande muraille, en Chine.',
    ],
    anecdote:
      "Les différentes sections de la Grande Muraille cumulent plusieurs milliers de kilomètres. Les parties les plus visitées, près de Pékin, datent surtout de la dynastie Ming.",
  },
  {
    id: 'm-acropole',
    categorie: 'Monument',
    reponse: "L'Acropole d'Athènes",
    alias: ['Acropole', 'Acropole Athènes', 'Parthénon', 'Le Parthénon'],
    indices: [
      'Je domine une ville vieille de plus de 2 500 ans.',
      'Mon nom signifie « ville haute ».',
      "Je suis perchée sur un rocher calcaire.",
      "Le temple le plus célèbre que j'abrite est dédié à une déesse de la sagesse.",
      "Mes colonnes de marbre ont été élevées au Ve siècle avant notre ère, au temps de Périclès.",
      "Je surplombe Athènes, et le Parthénon est mon joyau.",
    ],
    anecdote: "Le Parthénon est dédié à Athéna. Il a été bâti entre 447 et 432 avant J.-C.",
  },
  {
    id: 'm-liberte',
    categorie: 'Monument',
    reponse: 'La statue de la Liberté',
    alias: ['Statue de la Liberté', 'Liberté éclairant le monde', 'La Liberté éclairant le monde', 'Statue of Liberty'],
    indices: [
      'Je suis un cadeau entre deux pays amis.',
      "J'ai été offerte en 1886.",
      'Je suis en cuivre, et ma couleur verte vient de l\'oxydation.',
      "Je tiens une torche dans une main et une tablette dans l'autre.",
      "Un ingénieur français, Gustave Eiffel, a conçu mon armature intérieure.",
      "J'accueille ceux qui arrivent à New York par la mer.",
    ],
    anecdote:
      "Conçue par le sculpteur Frédéric Auguste Bartholdi, elle a été offerte par la France aux États-Unis pour célébrer l'amitié entre les deux pays et le centenaire de l'Indépendance.",
  },
  {
    id: 'm-petra',
    categorie: 'Lieu',
    reponse: 'Pétra',
    alias: ['Petra', 'La cité rose'],
    indices: [
      'Je suis une ville cachée au cœur du désert.',
      "Je suis taillée directement dans une falaise de grès rose.",
      'Pour me rejoindre, on traverse un étroit défilé de rochers : le Siq.',
      "Les Nabatéens, un peuple de commerçants caravaniers, m'ont bâtie.",
      "Ma façade la plus célèbre s'appelle le Trésor.",
      'Je suis en Jordanie, et on me surnomme la « cité rose ».',
    ],
    anecdote:
      "Pétra est restée presque inconnue de l'Occident jusqu'en 1812, quand l'explorateur suisse Johann Ludwig Burckhardt l'a redécouverte.",
  },
  {
    id: 'm-angkor',
    categorie: 'Monument',
    reponse: 'Angkor Vat',
    alias: ['Angkor', 'Angkor Wat'],
    indices: [
      'Je suis le plus grand monument religieux du monde.',
      'Je suis né au XIIe siècle.',
      'Un large fossé et la jungle m\'entourent.',
      "À l'origine, j'étais dédié à un dieu hindou, avant de devenir un temple bouddhiste.",
      "Mes cinq tours en forme de bouton de lotus sont l'emblème de mon pays.",
      'Je suis au Cambodge, près de Siem Reap.',
    ],
    anecdote:
      "Angkor Vat figure sur le drapeau du Cambodge. Il a été construit sous le roi Suryavarman II, au XIIe siècle.",
  },
  {
    id: 'm-sagrada',
    categorie: 'Monument',
    reponse: 'La Sagrada Família',
    alias: ['Sagrada Familia', 'Basilique de la Sagrada Familia', 'La Sagrada Familia'],
    indices: [
      "Mon chantier a commencé en 1882 et n'est pas tout à fait terminé.",
      "Je suis une église, mais aucune autre ne me ressemble.",
      "Mes tours semblent faites de pierre fondue, ou de forêt de pierre.",
      'Un architecte catalan m\'a consacré la majeure partie de sa vie.',
      'Il s\'appelait Antoni Gaudí.',
      'Je suis une basilique de Barcelone.',
    ],
    anecdote:
      "Antoni Gaudí est mort en 1926, alors que son œuvre était loin d'être achevée. Il est enterré dans la crypte de la basilique.",
  },
  {
    id: 'm-versailles',
    categorie: 'Monument',
    reponse: 'Le château de Versailles',
    alias: ['Versailles', 'Chateau de Versailles', 'Palais de Versailles'],
    indices: [
      "J'étais au départ un simple pavillon de chasse.",
      "Un roi m'a fait agrandir jusqu'à en faire sa résidence principale.",
      "Je suis célèbre pour une immense galerie bordée de miroirs.",
      "Mes jardins ont été dessinés par André Le Nôtre.",
      "En 1919, un traité qui a mis fin à la Première Guerre mondiale y a été signé.",
      "Je suis dans les Yvelines, et Louis XIV y a régné.",
    ],
    anecdote:
      "La cour s'est installée à Versailles en 1682, sous Louis XIV, et y est restée jusqu'à la Révolution, en 1789.",
  },
  {
    id: 'm-stonehenge',
    categorie: 'Monument',
    reponse: 'Stonehenge',
    alias: ['Stone Henge'],
    indices: [
      "Mes premières pierres ont été dressées il y a plus de 4 500 ans.",
      'Je suis un cercle de pierres dressées.',
      "Certaines de mes pierres pèsent plus de vingt tonnes.",
      "On ignore encore avec certitude à quoi je servais : calendrier, cérémonies, tombes…",
      "Je me dresse au milieu d'une plaine verte du sud de l'Angleterre.",
      'Mon nom est Stonehenge, près de Salisbury.',
    ],
    anecdote:
      "Les plus petites pierres, les « pierres bleues », viennent du pays de Galles, à plus de 200 kilomètres de là.",
  },
  {
    id: 'm-sydney',
    categorie: 'Monument',
    reponse: "L'Opéra de Sydney",
    alias: ['Opéra de Sydney', 'Sydney Opera House', 'Opera House', 'Opéra de Sidney'],
    indices: [
      "J'ai été inauguré en 1973.",
      'Mon toit ressemble à des voiles, ou à des coquillages.',
      "Je suis posé sur une pointe qui avance dans une baie.",
      "Un architecte danois, Jørn Utzon, m'a conçu.",
      "Mon toit est couvert de plus d'un million de tuiles de céramique.",
      "Je suis le symbole de la plus grande ville d'Australie.",
    ],
    anecdote:
      "Le chantier a duré 14 ans, bien plus que prévu. Jørn Utzon a quitté le projet avant la fin et n'est jamais revenu en Australie pour voir le bâtiment terminé.",
  },
  {
    id: 'm-christ',
    categorie: 'Monument',
    reponse: 'Le Christ Rédempteur',
    alias: ['Christ du Corcovado', 'Cristo Redentor', 'Christ de Rio', 'Christ Redempteur'],
    indices: [
      "Je suis une statue d'une trentaine de mètres de haut.",
      'Les bras ouverts, je domine une grande ville.',
      'Je suis au sommet du mont Corcovado.',
      "J'ai été inauguré en 1931.",
      "Je suis en béton armé, recouvert de petits carreaux de pierre-savon.",
      'Je veille sur Rio de Janeiro, au Brésil.',
    ],
    anecdote:
      "Le Christ Rédempteur fait partie des « nouvelles sept merveilles du monde » désignées en 2007.",
  },
  {
    id: 'm-chichen',
    categorie: 'Lieu',
    reponse: 'Chichén Itzá',
    alias: ['Chichen Itza', 'Chichen-Itza', 'El Castillo'],
    indices: [
      "Je suis une ancienne cité d'Amérique centrale.",
      "Un peuple d'astronomes et de mathématiciens m'a bâtie.",
      "Ma pyramide à degrés s'appelle El Castillo.",
      "Aux équinoxes, une ombre dessine un serpent qui descend mon escalier.",
      "Je me situe dans la péninsule du Yucatán.",
      "Je suis au Mexique, et mon nom signifie « à la bouche du puits des Itzá ».",
    ],
    anecdote:
      "El Castillo compte 91 marches sur chacune de ses quatre faces. Avec la plateforme du sommet, cela fait 365 : autant que de jours dans l'année.",
  },
  {
    id: 'm-alhambra',
    categorie: 'Monument',
    reponse: "L'Alhambra",
    alias: ['Alhambra', "L'Alhambra de Grenade", 'Alhambra de Grenade'],
    indices: [
      'Je suis une forteresse et un palais à la fois.',
      "Mon nom vient d'un mot arabe qui signifie « la rouge ».",
      "Je domine une ville du sud de l'Europe, au pied de montagnes enneigées.",
      "Mes murs sont couverts de stucs finement ciselés et de faïences colorées.",
      "Je suis l'un des plus beaux témoignages de l'art de l'Espagne musulmane.",
      'Je suis à Grenade, en Andalousie.',
    ],
    anecdote:
      "Le palais s'est surtout développé sous la dynastie nasride, du XIIIe au XVe siècle. Grenade est tombée en 1492 aux mains des Rois Catholiques.",
  },
  {
    id: 'm-bigben',
    categorie: 'Monument',
    reponse: 'Big Ben',
    alias: ['Elizabeth Tower', 'Tour Elizabeth', 'La tour de Big Ben'],
    indices: [
      'Je suis célèbre dans le monde entier pour ma sonnerie.',
      'On me confond souvent avec la tour qui m\'abrite.',
      "Je suis en fait le nom de la plus grosse cloche.",
      "J'ai été installé au bord de la Tamise.",
      'Mon cadran se trouve au sommet du palais de Westminster.',
      'Je suis à Londres.',
    ],
    anecdote:
      "« Big Ben » désigne la cloche, qui pèse plus de 13 tonnes. La tour, elle, s'appelle officiellement Elizabeth Tower depuis 2012.",
  },
  {
    id: 'm-pise',
    categorie: 'Monument',
    reponse: 'La tour de Pise',
    alias: ['Tour de Pise', 'Tour penchée de Pise', 'La tour penchée', 'Tour penchée'],
    indices: [
      'Je suis célèbre à cause d\'un défaut.',
      "Mon chantier a commencé en 1173 et a duré près de deux siècles.",
      "Je penche depuis presque le début de ma construction.",
      "Mon sol est trop mou, fait d'argile et de sable.",
      "On dit que Galilée y aurait fait des expériences sur la chute des corps.",
      "Je suis le clocher de la cathédrale de Pise, en Italie.",
    ],
    anecdote:
      "Après des travaux de consolidation achevés en 2001, la tour ne bouge plus : son inclinaison a même légèrement diminué.",
  },
  {
    id: 'm-burj',
    categorie: 'Monument',
    reponse: 'Burj Khalifa',
    alias: ['Burj Dubai', 'Tour Khalifa', 'La tour Khalifa'],
    indices: [
      'Je détiens un record de hauteur.',
      "J'ai été inauguré en 2010.",
      'Je dépasse les 800 mètres.',
      "Mon design s'inspire d'une fleur du désert.",
      "Je suis dans une ville du Golfe connue pour ses gratte-ciel et ses centres commerciaux.",
      'Je suis le plus haut gratte-ciel du monde, à Dubaï.',
    ],
    anecdote: "Le Burj Khalifa mesure 828 mètres et compte plus de 160 étages.",
  },
  {
    id: 'm-fuji',
    categorie: 'Lieu',
    reponse: 'Le mont Fuji',
    alias: ['Mont Fuji', 'Fuji', 'Fujiyama', 'Fuji-san', 'Fuji-Yama'],
    indices: [
      'Je suis un volcan endormi.',
      'Ma forme est un cône presque parfait.',
      'Mon sommet est enneigé une grande partie de l\'année.',
      "Je suis sacré pour de nombreux habitants de mon pays.",
      "Les artistes m'ont souvent représenté, notamment dans une célèbre estampe avec une grande vague.",
      'Je suis le point culminant du Japon, à 3 776 mètres.',
    ],
    anecdote:
      "La dernière éruption du Fuji remonte à 1707. Par temps clair, sa silhouette est visible depuis Tokyo.",
  },
  {
    id: 'm-carcassonne',
    categorie: 'Lieu',
    reponse: 'La Cité de Carcassonne',
    alias: ['Carcassonne', 'Cité de Carcassonne', 'La Cité', 'Cité médiévale de Carcassonne'],
    indices: [
      'Je suis une ville fortifiée du Moyen Âge.',
      'Je suis entourée de deux enceintes de remparts.',
      'On me compte plus de cinquante tours.',
      "Je suis classée au patrimoine mondial de l'UNESCO depuis 1997.",
      "Viollet-le-Duc a dirigé ma restauration au XIXe siècle.",
      "Je suis dans l'Aude, en Occitanie, et mon nom commence par « Carca ».",
    ],
    anecdote:
      "La Cité de Carcassonne est l'une des plus grandes cités fortifiées d'Europe, avec près de 3 kilomètres de remparts.",
  },
];

const histoire: Mystere[] = [
  {
    id: 'h-galilee',
    categorie: 'Personnage',
    reponse: 'Galilée',
    alias: ['Galileo', 'Galileo Galilei', 'Galilei'],
    indices: [
      'Je suis né en 1564, en Italie.',
      "J'étais mathématicien, physicien et astronome.",
      "J'ai perfectionné la lunette astronomique.",
      "J'ai observé les quatre grandes lunes de Jupiter.",
      "Un tribunal de l'Église m'a obligé à renier l'idée que la Terre tourne autour du Soleil.",
      'On me prête la phrase « Et pourtant elle tourne ».',
    ],
    anecdote:
      "En 1633, Galilée a été condamné par l'Inquisition. Il a fini sa vie en résidence surveillée, près de Florence. L'Église ne l'a officiellement réhabilité qu'en 1992.",
  },
  {
    id: 'h-newton',
    categorie: 'Personnage',
    reponse: 'Isaac Newton',
    alias: ['Newton', 'Sir Isaac Newton'],
    indices: [
      'Je suis né en 1643, en Angleterre.',
      "J'ai étudié et enseigné à l'université de Cambridge.",
      "J'ai montré que la lumière blanche contient toutes les couleurs.",
      "Une pomme serait, dit-on, à l'origine de ma plus célèbre idée.",
      "J'ai formulé les lois du mouvement et de la gravitation universelle.",
      'Une unité de force porte mon nom.',
    ],
    anecdote:
      "Newton a dirigé la Monnaie royale anglaise pendant près de trente ans et a présidé la Royal Society.",
  },
  {
    id: 'h-pasteur',
    categorie: 'Personnage',
    reponse: 'Louis Pasteur',
    alias: ['Pasteur'],
    indices: [
      'Je suis né en 1822, dans le Jura.',
      'Je suis chimiste et biologiste.',
      "J'ai montré que de minuscules êtres vivants provoquent la fermentation.",
      'Un procédé de chauffage qui porte mon nom protège le lait et le vin.',
      "J'ai mis au point un vaccin contre la rage.",
      'Un institut parisien porte mon nom.',
    ],
    anecdote:
      "Le 6 juillet 1885, Pasteur a vacciné pour la première fois un enfant, Joseph Meister, mordu par un chien enragé. L'enfant a survécu.",
  },
  {
    id: 'h-tesla',
    categorie: 'Personnage',
    reponse: 'Nikola Tesla',
    alias: ['Tesla'],
    indices: [
      'Je suis né en 1856, dans un village de l\'Empire d\'Autriche.',
      "Je suis ingénieur et inventeur, et je me suis installé aux États-Unis.",
      "J'ai travaillé un temps pour Thomas Edison, avant de devenir son rival.",
      "J'ai défendu le courant alternatif.",
      "Une unité de champ magnétique porte mon nom.",
      'Une marque de voitures électriques porte aussi mon nom.',
    ],
    anecdote:
      "Tesla a déposé des centaines de brevets. La « bobine Tesla », qu'il a inventée en 1891, produit de très hautes tensions.",
  },
  {
    id: 'h-beethoven',
    categorie: 'Personnage',
    reponse: 'Ludwig van Beethoven',
    alias: ['Beethoven', 'Ludwig Beethoven'],
    indices: [
      'Je suis né en 1770, en Allemagne.',
      'Je suis compositeur et pianiste.',
      'Je me suis installé à Vienne, la capitale de la musique.',
      "J'ai peu à peu perdu l'ouïe.",
      "J'ai composé neuf symphonies, dont la dernière contient l'Ode à la joie.",
      'Ma cinquième symphonie commence par quatre notes célèbres.',
    ],
    anecdote:
      "Beethoven était presque sourd quand il a composé sa Neuvième symphonie. Selon la tradition, à la fin de la création en 1824, il a fallu le retourner vers le public pour qu'il voie les applaudissements.",
  },
  {
    id: 'h-shakespeare',
    categorie: 'Personnage',
    reponse: 'William Shakespeare',
    alias: ['Shakespeare'],
    indices: [
      'Je suis né en 1564, en Angleterre.',
      "J'étais acteur et auteur, dans une troupe de théâtre londonienne.",
      "On m'attribue 37 pièces et 154 sonnets.",
      'Deux amants de Vérone sont parmi mes personnages les plus célèbres.',
      'Un prince danois se demande « Être ou ne pas être ».',
      'Le théâtre du Globe, à Londres, est lié à mon nom.',
    ],
    anecdote:
      "Shakespeare aurait inventé ou popularisé des centaines de mots et d'expressions de la langue anglaise.",
  },
  {
    id: 'h-moliere',
    categorie: 'Personnage',
    reponse: 'Molière',
    alias: ['Moliere', 'Jean-Baptiste Poquelin', 'Poquelin'],
    indices: [
      'Je suis né à Paris, en 1622.',
      'Je suis auteur et acteur de théâtre.',
      "Louis XIV m'a protégé.",
      "J'ai écrit L'Avare, Tartuffe et Le Bourgeois gentilhomme.",
      'Mon vrai nom est Jean-Baptiste Poquelin.',
      "Je suis mort en 1673, peu après une représentation du Malade imaginaire.",
    ],
    anecdote:
      "Molière jouait le rôle d'Argan dans Le Malade imaginaire. Il s'est senti mal pendant la quatrième représentation, en 1673, et il est mort quelques heures plus tard.",
  },
  {
    id: 'h-jeannedarc',
    categorie: 'Personnage',
    reponse: "Jeanne d'Arc",
    alias: ['Jeanne Darc', 'La Pucelle d\'Orléans', 'Pucelle d\'Orléans'],
    indices: [
      'Je suis née vers 1412, dans un village de Lorraine.',
      'Je suis une jeune paysanne.',
      'Je disais entendre des voix qui me demandaient de sauver mon pays.',
      'Une ville assiégée par les Anglais a été libérée grâce à moi.',
      'Le dauphin Charles a été sacré roi à Reims en ma présence.',
      "J'ai été brûlée vive à Rouen, en 1431.",
    ],
    anecdote:
      "Jeanne d'Arc a levé le siège d'Orléans en 1429. Réhabilitée en 1456, elle a été canonisée en 1920.",
  },
  {
    id: 'h-louis14',
    categorie: 'Personnage',
    reponse: 'Louis XIV',
    alias: ['Roi Soleil', 'Le Roi-Soleil', 'Louis 14', 'Louis Quatorze', 'Louis le Grand'],
    indices: [
      'Je suis monté sur le trône à quatre ans.',
      "J'ai régné de 1643 à 1715, l'un des plus longs règnes d'Europe.",
      'On me surnommait le Roi-Soleil.',
      "J'ai fait construire un immense château à la campagne, près de Paris.",
      'On me prête la phrase « L\'État, c\'est moi ».',
      "Ma cour s'est installée à Versailles.",
    ],
    anecdote:
      "Louis XIV a régné 72 ans. Son règne reste l'un des plus longs de l'histoire des monarchies d'Europe.",
  },
  {
    id: 'h-charlemagne',
    categorie: 'Personnage',
    reponse: 'Charlemagne',
    alias: ['Charles le Grand', 'Carolus Magnus', 'Charles Ier'],
    indices: [
      'Je suis né vers 742.',
      'Je suis devenu roi des Francs.',
      "J'ai conquis une grande partie de l'Europe occidentale.",
      "J'ai encouragé le renouveau des lettres et des écoles.",
      "Le pape m'a couronné empereur la nuit de Noël de l'an 800.",
      'Mon nom signifie « Charles le Grand » et ma capitale était Aix-la-Chapelle.',
    ],
    anecdote:
      "Charlemagne a été couronné empereur à Rome par le pape Léon III. Il est enterré à Aix-la-Chapelle, dans l'actuelle Allemagne.",
  },
  {
    id: 'h-alexandre',
    categorie: 'Personnage',
    reponse: 'Alexandre le Grand',
    alias: ['Alexandre', 'Alexandre de Macédoine', 'Alexandre III de Macédoine', 'Alexander the Great'],
    indices: [
      'Je suis né en 356 avant J.-C.',
      "Mon père était roi de Macédoine, et Aristote a été mon précepteur.",
      'Je suis monté sur le trône à vingt ans.',
      "J'ai conquis l'Égypte et la Perse, et je suis allé jusqu'en Inde.",
      'Mon cheval se nommait Bucéphale.',
      "J'ai fondé Alexandrie, et je suis mort à Babylone, à 32 ans.",
    ],
    anecdote:
      "Alexandre est mort à Babylone en 323 avant J.-C., à 32 ans. Il n'avait jamais perdu une grande bataille.",
  },
  {
    id: 'h-cesar',
    categorie: 'Personnage',
    reponse: 'Jules César',
    alias: ['César', 'Cesar', 'Julius Caesar', 'Caius Julius Caesar'],
    indices: [
      'Je suis né en 100 avant J.-C., à Rome.',
      'Je suis un général et un homme politique.',
      'Je suis connu pour avoir conquis la Gaule.',
      'Ma phrase la plus célèbre est « Veni, vidi, vici ».',
      "J'ai franchi le Rubicon et déclenché une guerre civile.",
      'Je suis tombé sous les coups de conjurés aux ides de mars, en 44 avant J.-C.',
    ],
    anecdote:
      "Le mois de juillet porte son nom. Le calendrier julien, qu'il a instauré, est resté en usage pendant plus de 1 600 ans.",
  },
  {
    id: 'h-gandhi',
    categorie: 'Personnage',
    reponse: 'Gandhi',
    alias: ['Mahatma Gandhi', 'Mohandas Gandhi', 'Mohandas Karamchand Gandhi', 'Le Mahatma'],
    indices: [
      'Je suis né en 1869, en Inde.',
      "J'ai étudié le droit à Londres.",
      "J'ai travaillé en Afrique du Sud avant de revenir dans mon pays.",
      "J'ai conduit la « marche du sel ».",
      "J'ai lutté pour l'indépendance de mon pays sans jamais recourir à la violence.",
      'On me surnommait « Mahatma », la « grande âme ».',
    ],
    anecdote:
      "L'Inde est devenue indépendante en 1947. Gandhi a été assassiné en janvier 1948. Son anniversaire, le 2 octobre, est la Journée internationale de la non-violence.",
  },
  {
    id: 'h-mandela',
    categorie: 'Personnage',
    reponse: 'Nelson Mandela',
    alias: ['Mandela', 'Madiba'],
    indices: [
      'Je suis né en 1918, en Afrique du Sud.',
      "J'ai été avocat.",
      "Je me suis battu contre l'apartheid.",
      "J'ai passé 27 ans en prison, dont dix-huit sur l'île de Robben Island.",
      "J'ai reçu le prix Nobel de la paix en 1993.",
      "J'ai été le premier président noir de mon pays, élu en 1994.",
    ],
    anecdote:
      "« Madiba », son nom de clan, est devenu son surnom affectueux. Son anniversaire, le 18 juillet, est la Journée internationale Nelson Mandela.",
  },
  {
    id: 'h-marcopolo',
    categorie: 'Personnage',
    reponse: 'Marco Polo',
    alias: ['Polo'],
    indices: [
      'Je suis né vers 1254, à Venise.',
      'Je suis un marchand.',
      "J'ai voyagé avec mon père et mon oncle.",
      "J'ai suivi la route de la soie jusqu'en Asie.",
      "J'ai servi à la cour de l'empereur mongol Kubilaï Khan.",
      'Mon récit de voyage en Chine s\'appelle « Le Devisement du monde ».',
    ],
    anecdote:
      "Marco Polo a dicté son récit à Rustichello de Pise, alors qu'il était prisonnier à Gênes, vers 1298.",
  },
  {
    id: 'h-magellan',
    categorie: 'Personnage',
    reponse: 'Magellan',
    alias: ['Fernand de Magellan', 'Ferdinand Magellan', 'Fernão de Magalhães'],
    indices: [
      'Je suis né vers 1480, au Portugal.',
      'Je suis navigateur.',
      "J'ai navigué pour le roi d'Espagne.",
      "J'ai trouvé un passage entre l'Atlantique et le Pacifique, à la pointe de l'Amérique du Sud.",
      "Mon expédition a fait le premier tour du monde, mais je n'en suis pas revenu.",
      'Je suis mort aux Philippines, en 1521.',
    ],
    anecdote:
      "Sur cinq navires et environ 240 hommes partis en 1519, un seul navire, la Victoria, est revenu en 1522, commandé par Juan Sebastián Elcano.",
  },
  {
    id: 'h-picasso',
    categorie: 'Personnage',
    reponse: 'Pablo Picasso',
    alias: ['Picasso'],
    indices: [
      'Je suis né en 1881, à Malaga, en Espagne.',
      "Je suis peintre et sculpteur, et j'ai vécu longtemps en France.",
      "J'ai eu une « période bleue », puis une « période rose ».",
      "J'ai inventé le cubisme avec Georges Braque.",
      "Un immense tableau de 1937 dénonce le bombardement d'une ville espagnole.",
      'Ce tableau célèbre s\'appelle Guernica.',
    ],
    anecdote:
      "Picasso est l'un des artistes les plus prolifiques de l'histoire : on estime qu'il a créé environ 50 000 œuvres.",
  },
  {
    id: 'h-vangogh',
    categorie: 'Personnage',
    reponse: 'Vincent van Gogh',
    alias: ['Van Gogh', 'Vincent Van Gogh', 'Vincent'],
    indices: [
      'Je suis né en 1853, aux Pays-Bas.',
      'Je suis peintre.',
      "J'ai vécu dans la pauvreté et je n'ai presque rien vendu de mon vivant.",
      "J'ai séjourné à Arles et à Auvers-sur-Oise.",
      "J'ai peint des tournesols et une célèbre nuit étoilée.",
      "Je me suis coupé une partie de l'oreille.",
    ],
    anecdote:
      "Van Gogh a peint plus de 800 tableaux en une dizaine d'années. Il est mort en 1890, à 37 ans, soutenu toute sa vie par son frère Théo.",
  },
  {
    id: 'h-frida',
    categorie: 'Personnage',
    reponse: 'Frida Kahlo',
    alias: ['Kahlo', 'Frida'],
    indices: [
      'Je suis née en 1907, au Mexique.',
      "Un accident d'autobus, à dix-huit ans, a marqué ma vie.",
      'Je me suis mise à peindre pendant ma convalescence.',
      'Beaucoup de mes tableaux sont des autoportraits.',
      'Mon mari était le peintre Diego Rivera.',
      'Ma maison bleue de Coyoacán est devenue un musée.',
    ],
    anecdote:
      "Frida Kahlo a peint environ 150 tableaux, dont plus de cinquante sont des autoportraits.",
  },
  {
    id: 'h-degaulle',
    categorie: 'Personnage',
    reponse: 'Charles de Gaulle',
    alias: ['De Gaulle', 'Le général de Gaulle', 'Général de Gaulle'],
    indices: [
      'Je suis né en 1890, à Lille.',
      'Je suis un officier de carrière.',
      "En juin 1940, j'ai lancé un appel depuis Londres.",
      "J'ai dirigé la France libre pendant la Seconde Guerre mondiale.",
      "J'ai fondé la Ve République, en 1958.",
      "Un grand aéroport de Paris-Roissy porte mon nom.",
    ],
    anecdote:
      "L'appel du 18 juin 1940 a été diffusé par la BBC. Très peu de gens l'ont entendu sur le moment.",
  },
];

export const EVENEMENTS: Evenement[] = [
  {
    id: 'merveilles',
    titre: 'Merveilles du monde',
    emoji: '🌍',
    description: '20 monuments et lieux extraordinaires à identifier, des pyramides à la Cité de Carcassonne.',
    couleur: '#3DDC97',
    etapes: merveilles,
  },
  {
    id: 'histoire',
    titre: "Grands noms de l'histoire",
    emoji: '🏛️',
    description: "20 figures qui ont marqué l'histoire, des savants aux artistes, des conquérants aux visionnaires.",
    couleur: '#8C6BFF',
    etapes: histoire,
  },
];
