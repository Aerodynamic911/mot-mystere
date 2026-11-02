// Page du BackOffice (une seule page, sans dependance).
// Les pseudos viennent des joueurs : ils ne sont jamais inseres en HTML, seulement via textContent.

export const PAGE_ADMIN = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Quizzle - BackOffice</title>
<style>
  :root { --fond:#f6f6f4; --carte:#fff; --texte:#1c1c1e; --doux:#6b6b70; --trait:#dcdcd6; --accent:#2f6fed; --ok:#1f8a4c; --non:#c27a00; --ban:#c0392b; }
  @media (prefers-color-scheme: dark) { :root { --fond:#141416; --carte:#1f1f23; --texte:#f0f0f2; --doux:#9a9aa2; --trait:#34343a; --accent:#6ea0ff; --ok:#4cc789; --non:#f0a63a; --ban:#ff6b5e; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--fond); color: var(--texte); font: 16px/1.4 system-ui, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 16px; }
  h1 { font-size: 20px; margin: 4px 0 12px; }
  h2 { font-size: 16px; margin: 24px 0 8px; }
  .carte { background: var(--carte); border: 1px solid var(--trait); border-radius: 10px; padding: 12px; margin-bottom: 8px; }
  .chiffres { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
  .chiffre b { display: block; font-size: 22px; }
  .chiffre span { color: var(--doux); font-size: 13px; }
  .barre { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
  input, select, button { font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--trait); background: var(--carte); color: var(--texte); }
  input { flex: 1; min-width: 140px; }
  button { cursor: pointer; }
  button.ok { border-color: var(--ok); color: var(--ok); }
  button.non { border-color: var(--non); color: var(--non); }
  button.ban { border-color: var(--ban); color: var(--ban); }
  .ligne { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: space-between; }
  .pseudo { font-weight: 600; font-size: 18px; word-break: break-all; }
  .meta { color: var(--doux); font-size: 13px; }
  .actions { display: flex; gap: 6px; flex-wrap: wrap; }
  .vide { color: var(--doux); padding: 8px 0; }
  .mot { display: inline-flex; gap: 6px; align-items: center; background: var(--carte); border: 1px solid var(--trait); border-radius: 999px; padding: 2px 4px 2px 10px; margin: 0 6px 6px 0; }
  .mot button { border: 0; padding: 2px 8px; color: var(--ban); background: none; }
  #message { position: fixed; bottom: 12px; left: 12px; right: 12px; max-width: 760px; margin: 0 auto; background: var(--texte); color: var(--fond); padding: 10px 14px; border-radius: 8px; display: none; }
</style>
</head>
<body>
<main>
  <h1>Quizzle - BackOffice</h1>

  <div class="chiffres" id="chiffres"></div>

  <h2>Pseudos</h2>
  <div class="barre">
    <select id="statut">
      <option value="attente">En attente</option>
      <option value="approuve">Approuvés</option>
      <option value="refuse">Refusés</option>
      <option value="banni">Bannis</option>
      <option value="tous">Tous</option>
    </select>
    <input id="recherche" type="search" placeholder="Rechercher un pseudo">
    <button id="actualiser">Actualiser</button>
  </div>
  <div id="pseudos"></div>

  <h2>Signalements à traiter</h2>
  <div id="signalements"></div>

  <h2>Mots interdits</h2>
  <div class="barre">
    <input id="nouveauMot" placeholder="Ajouter un mot" maxlength="30">
    <button id="ajouterMot">Ajouter</button>
  </div>
  <div id="mots"></div>
</main>
<div id="message" role="status"></div>
<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var minuteur;

  function message(texte) {
    var m = $('message');
    m.textContent = texte;
    m.style.display = 'block';
    clearTimeout(minuteur);
    minuteur = setTimeout(function () { m.style.display = 'none'; }, 3500);
  }

  function appel(chemin, options) {
    options = options || {};
    options.headers = { 'content-type': 'application/json' };
    return fetch(chemin, options).then(function (r) {
      if (!r.ok) throw new Error('Erreur ' + r.status);
      return r.json();
    });
  }

  function el(balise, classe, texte) {
    var e = document.createElement(balise);
    if (classe) e.className = classe;
    if (texte !== undefined && texte !== null) e.textContent = texte;
    return e;
  }

  function bouton(texte, classe, action) {
    var b = el('button', classe, texte);
    b.addEventListener('click', action);
    return b;
  }

  function vide(conteneur, texte) {
    conteneur.textContent = '';
    if (texte) conteneur.appendChild(el('div', 'vide', texte));
  }

  var LIBELLES = { attente: 'en attente', approuve: 'approuvé', refuse: 'refusé', banni: 'banni' };

  function chiffres() {
    appel('/admin/chiffres').then(function (c) {
      var zone = $('chiffres');
      zone.textContent = '';
      [
        ['Joueurs', c.joueurs],
        ['Avec pseudo', c.avec_pseudo],
        ['Pseudos en attente', c.pseudos_en_attente],
        ['Résultats du jour', c.resultats_du_jour],
        ['Signalements', c.signalements_a_traiter]
      ].forEach(function (x) {
        var carte = el('div', 'carte chiffre');
        carte.appendChild(el('b', '', x[1]));
        carte.appendChild(el('span', '', x[0]));
        zone.appendChild(carte);
      });
    }).catch(function (e) { message(e.message); });
  }

  function decider(id, action) {
    appel('/admin/pseudos/' + id + '/' + action, { method: 'POST' })
      .then(function () { message('Fait'); pseudos(); chiffres(); signalements(); })
      .catch(function (e) { message(e.message); });
  }

  function pseudos() {
    var url = '/admin/pseudos?statut=' + encodeURIComponent($('statut').value) + '&q=' + encodeURIComponent($('recherche').value);
    appel(url).then(function (d) {
      var zone = $('pseudos');
      vide(zone, d.pseudos.length ? '' : 'Rien à afficher.');
      d.pseudos.forEach(function (p) {
        var carte = el('div', 'carte');
        var ligne = el('div', 'ligne');
        var gauche = el('div');
        gauche.appendChild(el('div', 'pseudo', p.pseudo));
        var info = LIBELLES[p.statut] || p.statut;
        if (p.signalements) info += ' · ' + p.signalements + ' signalement(s)';
        info += ' · ' + (p.dernier_changement_pseudo || p.cree_le);
        gauche.appendChild(el('div', 'meta', info));
        var actions = el('div', 'actions');
        if (p.statut !== 'approuve') actions.appendChild(bouton('Approuver', 'ok', function () { decider(p.id, 'approuver'); }));
        if (p.statut !== 'refuse') actions.appendChild(bouton('Refuser', 'non', function () { decider(p.id, 'refuser'); }));
        if (p.statut !== 'banni') actions.appendChild(bouton('Bannir', 'ban', function () {
          if (confirm('Bannir ce joueur ?')) decider(p.id, 'bannir');
        }));
        ligne.appendChild(gauche);
        ligne.appendChild(actions);
        carte.appendChild(ligne);
        zone.appendChild(carte);
      });
    }).catch(function (e) { message(e.message); });
  }

  function signalements() {
    appel('/admin/signalements').then(function (d) {
      var zone = $('signalements');
      vide(zone, d.signalements.length ? '' : 'Aucun signalement.');
      d.signalements.forEach(function (s) {
        var carte = el('div', 'carte');
        var ligne = el('div', 'ligne');
        var gauche = el('div');
        gauche.appendChild(el('div', 'pseudo', s.pseudo || '(sans pseudo)'));
        gauche.appendChild(el('div', 'meta', s.nombre + ' signalement(s) · ' + (LIBELLES[s.statut] || s.statut) + (s.motifs ? ' · ' + s.motifs : '')));
        var actions = el('div', 'actions');
        actions.appendChild(bouton('Refuser', 'non', function () { decider(s.id, 'refuser'); }));
        actions.appendChild(bouton('Bannir', 'ban', function () {
          if (confirm('Bannir ce joueur ?')) decider(s.id, 'bannir');
        }));
        actions.appendChild(bouton('Classer', '', function () {
          appel('/admin/signalements/' + s.id + '/traiter', { method: 'POST' })
            .then(function () { signalements(); chiffres(); })
            .catch(function (e) { message(e.message); });
        }));
        ligne.appendChild(gauche);
        ligne.appendChild(actions);
        carte.appendChild(ligne);
        zone.appendChild(carte);
      });
    }).catch(function (e) { message(e.message); });
  }

  function mots() {
    appel('/admin/mots').then(function (d) {
      var zone = $('mots');
      vide(zone, d.mots.length ? '' : 'Aucun mot.');
      d.mots.forEach(function (m) {
        var puce = el('span', 'mot');
        puce.appendChild(el('span', '', m));
        puce.appendChild(bouton('×', '', function () {
          appel('/admin/mots/' + encodeURIComponent(m), { method: 'DELETE' })
            .then(mots)
            .catch(function (e) { message(e.message); });
        }));
        zone.appendChild(puce);
      });
    }).catch(function (e) { message(e.message); });
  }

  $('statut').addEventListener('change', pseudos);
  $('recherche').addEventListener('input', function () { clearTimeout(minuteur); minuteur = setTimeout(pseudos, 300); });
  $('actualiser').addEventListener('click', function () { chiffres(); pseudos(); signalements(); mots(); });
  $('ajouterMot').addEventListener('click', function () {
    var mot = $('nouveauMot').value.trim();
    if (!mot) return;
    appel('/admin/mots', { method: 'POST', body: JSON.stringify({ mot: mot }) })
      .then(function () { $('nouveauMot').value = ''; mots(); })
      .catch(function (e) { message(e.message); });
  });

  chiffres(); pseudos(); signalements(); mots();
})();
</script>
</body>
</html>`;
