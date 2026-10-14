/* Quizzle — énigme à essayer sur la page d'accueil. */
(function () {
  var EN = document.documentElement.lang === 'en';

  /* Numéro du mystère du jour : le 1er octobre 2026 est le n°1, comme dans le jeu. */
  var n = document.querySelector('[data-numero]');
  if (n) {
    var d = new Date();
    var jours = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 9, 1)) / 86400000) + 1;
    n.textContent = Math.max(1, jours);
  }

  var racine = document.getElementById('enigme');
  if (!racine) return;

  var DONNEES = EN
    ? {
        categorie: 'Monument to guess',
        indices: [
          'I was built for a World’s Fair.',
          'I was inaugurated in 1889, for the centenary of the Revolution.',
          'I am made of puddled iron, held together with rivets.',
          'Originally, I was supposed to be dismantled after twenty years.',
          'My usefulness for radiotelegraphy saved me.',
          'I bear the name of the company of the engineer who built me.'
        ],
        reponse: 'The Eiffel Tower',
        alias: ['eiffel tower', 'eiffel', 'tour eiffel', 'la tour eiffel', 'the eiffel tower'],
        anecdote: 'The Eiffel Tower was supposed to be dismantled in 1909. Its usefulness as a radiotelegraphy antenna convinced the authorities to keep it.',
        t: {
          placeholder: 'Your answer…', valider: 'Submit', suivant: 'Next clue', deja: 'You already tried that answer.',
          faux: 'Not quite. Here is another clue.', passe: 'Clue requested', bravo: 'Well done! Found in {n} attempt{s}',
          perdu: 'Not this time, but well played!', score: 'Score', anecdoteTitre: 'Did you know?', rejouer: 'Play again', indice: 'Clue'
        }
      }
    : {
        categorie: 'Monument à deviner',
        indices: [
          "J'ai été construite pour une Exposition universelle.",
          'Mon inauguration date de 1889, pour le centenaire de la Révolution.',
          'Je suis faite de fer puddlé, assemblé avec des rivets.',
          "À l'origine, je devais être démontée au bout de vingt ans.",
          "Mon utilité pour la radiotélégraphie m'a sauvée.",
          "Je porte le nom de l'entreprise de l'ingénieur qui m'a bâtie."
        ],
        reponse: 'La tour Eiffel',
        alias: ['tour eiffel', 'eiffel', 'la tour eiffel'],
        anecdote: "La tour Eiffel devait être démontée en 1909. Son utilité comme antenne de radiotélégraphie a convaincu les autorités de la conserver.",
        t: {
          placeholder: 'Votre réponse…', valider: 'Valider', suivant: 'Indice suivant', deja: 'Vous avez déjà essayé cette réponse.',
          faux: "Pas tout à fait. Voici un autre indice.", passe: 'Indice demandé', bravo: 'Bravo ! Trouvé en {n} essai{s}',
          perdu: 'Pas cette fois, mais bien joué !', score: 'Score', anecdoteTitre: 'Le saviez-vous ?', rejouer: 'Rejouer', indice: 'Indice'
        }
      };

  var MAX = 6;
  var t = DONNEES.t;
  var liste = racine.querySelector('.indices');
  var pastilles = racine.querySelector('.pastilles');
  var form = racine.querySelector('form');
  var champ = form.querySelector('input');
  var message = racine.querySelector('.message');
  var zone = racine.querySelector('.resultat-zone');
  var bSuivant = racine.querySelector('[data-suivant]');
  var propositions = []; // texte saisi, ou null pour un indice demandé
  var fini = false;

  racine.querySelector('.enigme-cat').textContent = DONNEES.categorie;
  champ.placeholder = t.placeholder;
  form.querySelector('[type=submit]').textContent = t.valider;
  bSuivant.textContent = t.suivant;

  function norm(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[’']/g, ' ').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
      .filter(function (m) { return m && ['le', 'la', 'les', 'l', 'de', 'du', 'des', 'd', 'un', 'une', 'the', 'a', 'an'].indexOf(m) < 0; })
      .join(' ');
  }
  var bonnes = [DONNEES.reponse].concat(DONNEES.alias).map(norm);
  function correct(s) { return bonnes.indexOf(norm(s)) >= 0; }

  function dessiner() {
    var visibles = Math.min(propositions.length + 1, MAX);
    if (fini) visibles = MAX;
    var deja = liste.children.length;
    for (var i = deja; i < visibles; i++) {
      var li = document.createElement('li');
      li.className = 'indice';
      var b = document.createElement('b');
      b.textContent = i + 1;
      b.setAttribute('aria-label', t.indice + ' ' + (i + 1));
      var sp = document.createElement('span');
      sp.textContent = DONNEES.indices[i];
      li.appendChild(b); li.appendChild(sp);
      liste.appendChild(li);
    }
    pastilles.innerHTML = '';
    propositions.forEach(function (p) {
      var el = document.createElement('span');
      el.className = 'pastille' + (p === null ? ' passe' : correct(p) ? ' ok' : '');
      el.textContent = p === null ? '⏭ ' + t.passe : (correct(p) ? '✓ ' : '✗ ') + p;
      pastilles.appendChild(el);
    });
    form.hidden = fini; bSuivant.parentNode.hidden = fini;
  }

  function terminer(gagne) {
    fini = true;
    dessiner();
    var n = propositions.length;
    var div = document.createElement('div');
    div.className = 'resultat' + (gagne ? '' : ' perdu');
    var h = document.createElement('h3');
    h.textContent = gagne ? t.bravo.replace('{n}', n).replace('{s}', n > 1 ? 's' : '') : t.perdu;
    var rep = document.createElement('div'); rep.className = 'reponse'; rep.textContent = DONNEES.reponse;
    div.appendChild(h); div.appendChild(rep);
    if (gagne) { var sc = document.createElement('p'); sc.textContent = t.score + ' : ' + (MAX + 1 - n) + '/' + MAX; div.appendChild(sc); }
    var at = document.createElement('p'); at.innerHTML = '<strong>💡 ' + t.anecdoteTitre + '</strong><br>'; at.appendChild(document.createTextNode(DONNEES.anecdote));
    div.appendChild(at);
    var r = document.createElement('button'); r.type = 'button'; r.className = 'btn btn-2'; r.textContent = t.rejouer;
    r.onclick = function () { propositions = []; fini = false; liste.innerHTML = ''; zone.innerHTML = ''; message.textContent = ''; champ.value = ''; dessiner(); champ.focus(); };
    div.appendChild(r);
    zone.innerHTML = ''; zone.appendChild(div);
  }

  function avancer(valeur) {
    propositions.push(valeur);
    if (valeur !== null && correct(valeur)) return terminer(true);
    if (propositions.length >= MAX) return terminer(false);
    dessiner();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = champ.value.trim();
    if (!v || fini) return;
    var deja = propositions.some(function (p) { return p !== null && norm(p) === norm(v); });
    if (deja) { message.textContent = t.deja; return; }
    champ.value = '';
    if (!correct(v)) {
      message.textContent = propositions.length + 1 < MAX ? t.faux : '';
      racine.classList.remove('secoue'); void racine.offsetWidth; racine.classList.add('secoue');
    } else message.textContent = '';
    avancer(v);
  });
  bSuivant.addEventListener('click', function () { if (!fini) { message.textContent = ''; avancer(null); } });
  champ.addEventListener('input', function () { message.textContent = ''; });
  dessiner();
})();
