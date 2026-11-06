var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/pageAdmin.ts
var PAGE_ADMIN = `<!doctype html>
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
      <option value="approuve">Approuv\xE9s</option>
      <option value="refuse">Refus\xE9s</option>
      <option value="banni">Bannis</option>
      <option value="tous">Tous</option>
    </select>
    <input id="recherche" type="search" placeholder="Rechercher un pseudo">
    <button id="actualiser">Actualiser</button>
  </div>
  <div id="pseudos"></div>

  <h2>Signalements \xE0 traiter</h2>
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

  var LIBELLES = { attente: 'en attente', approuve: 'approuv\xE9', refuse: 'refus\xE9', banni: 'banni' };

  function chiffres() {
    appel('/admin/chiffres').then(function (c) {
      var zone = $('chiffres');
      zone.textContent = '';
      [
        ['Joueurs', c.joueurs],
        ['Avec pseudo', c.avec_pseudo],
        ['Pseudos en attente', c.pseudos_en_attente],
        ['R\xE9sultats du jour', c.resultats_du_jour],
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
      vide(zone, d.pseudos.length ? '' : 'Rien \xE0 afficher.');
      d.pseudos.forEach(function (p) {
        var carte = el('div', 'carte');
        var ligne = el('div', 'ligne');
        var gauche = el('div');
        gauche.appendChild(el('div', 'pseudo', p.pseudo));
        var info = LIBELLES[p.statut] || p.statut;
        if (p.signalements) info += ' \xB7 ' + p.signalements + ' signalement(s)';
        info += ' \xB7 ' + (p.dernier_changement_pseudo || p.cree_le);
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
        gauche.appendChild(el('div', 'meta', s.nombre + ' signalement(s) \xB7 ' + (LIBELLES[s.statut] || s.statut) + (s.motifs ? ' \xB7 ' + s.motifs : '')));
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
        puce.appendChild(bouton('\xD7', '', function () {
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
<\/script>
</body>
</html>`;

// src/commun.ts
var STATUTS = ["attente", "approuve", "refuse", "banni"];
var ENTETES = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};
function json(donnees, status = 200) {
  return new Response(JSON.stringify(donnees), { status, headers: ENTETES });
}
__name(json, "json");
function erreur(status, code, extra = {}) {
  return json({ erreur: code, ...extra }, status);
}
__name(erreur, "erreur");
async function lireCorps(requete) {
  try {
    const corps = await requete.json();
    return corps && typeof corps === "object" ? corps : {};
  } catch {
    return {};
  }
}
__name(lireCorps, "lireCorps");
function jourParis() {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(/* @__PURE__ */ new Date());
}
__name(jourParis, "jourParis");
function minuscules(texte) {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
__name(minuscules, "minuscules");
function normaliser(texte) {
  return minuscules(texte).replace(/[0@]/g, "o").replace(/[1!|]/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/[5$]/g, "s").replace(/7/g, "t").replace(/[\s_-]+/g, "");
}
__name(normaliser, "normaliser");

// src/admin.ts
function emailAccess(requete) {
  const direct = (requete.headers.get("cf-access-authenticated-user-email") ?? "").trim().toLowerCase();
  if (direct) return direct;
  const jeton = requete.headers.get("cf-access-jwt-assertion") ?? "";
  try {
    const charge = jeton.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const donnees = JSON.parse(atob(charge));
    return (donnees.email ?? "").trim().toLowerCase();
  } catch {
    return "";
  }
}
__name(emailAccess, "emailAccess");
function refus(requete, env) {
  const autorises = (env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!autorises.length) return "secret_absent";
  const recu = emailAccess(requete);
  if (!recu) return "email_absent";
  return autorises.includes(recu) ? null : "email_different";
}
__name(refus, "refus");
async function adminRequete(requete, env, url) {
  const motif = refus(requete, env);
  if (motif) return erreur(403, "acces_refuse", { motif });
  const { pathname } = url;
  const methode = requete.method;
  if (methode === "GET" && (pathname === "/" || pathname === "/admin")) {
    return new Response(PAGE_ADMIN, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "referrer-policy": "no-referrer",
        "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'"
      }
    });
  }
  if (methode === "GET" && pathname === "/admin/chiffres") {
    const jour = jourParis();
    const compte = /* @__PURE__ */ __name(async (sql, ...valeurs) => (await env.DB.prepare(sql).bind(...valeurs).first())?.n ?? 0, "compte");
    return json({
      joueurs: await compte("SELECT COUNT(*) AS n FROM joueurs"),
      avec_pseudo: await compte("SELECT COUNT(*) AS n FROM joueurs WHERE pseudo IS NOT NULL"),
      pseudos_en_attente: await compte("SELECT COUNT(*) AS n FROM joueurs WHERE pseudo IS NOT NULL AND statut = 'attente'"),
      resultats_du_jour: await compte("SELECT COUNT(*) AS n FROM resultats WHERE jour = ?", jour),
      signalements_a_traiter: await compte("SELECT COUNT(*) AS n FROM signalements WHERE traite = 0"),
      jour
    });
  }
  if (methode === "GET" && pathname === "/admin/pseudos") {
    const statut = url.searchParams.get("statut") ?? "attente";
    if (statut !== "tous" && !STATUTS.includes(statut)) return erreur(400, "statut");
    const recherche = normaliser(url.searchParams.get("q") ?? "").replace(/[%]/g, "");
    const { results } = await env.DB.prepare(
      `SELECT id, pseudo, statut, cree_le, dernier_changement_pseudo,
              (SELECT COUNT(*) FROM signalements s WHERE s.joueur_signale = joueurs.id AND s.traite = 0) AS signalements
       FROM joueurs
       WHERE pseudo IS NOT NULL
         AND (? = 'tous' OR statut = ?)
         AND (? = '' OR pseudo_cle LIKE ?)
       ORDER BY COALESCE(dernier_changement_pseudo, cree_le) DESC
       LIMIT 100`
    ).bind(statut, statut, recherche, `%${recherche}%`).all();
    return json({ pseudos: results });
  }
  const decision = pathname.match(/^\/admin\/pseudos\/([0-9a-f-]{36})\/(approuver|refuser|bannir)$/);
  if (methode === "POST" && decision) {
    const [, id, action] = decision;
    const requeteSql = action === "approuver" ? "UPDATE joueurs SET statut = 'approuve' WHERE id = ? AND pseudo IS NOT NULL" : action === "refuser" ? (
      // le pseudo refuse redevient disponible pour les autres
      "UPDATE joueurs SET statut = 'refuse', pseudo_cle = NULL WHERE id = ? AND pseudo IS NOT NULL"
    ) : "UPDATE joueurs SET statut = 'banni', pseudo_cle = NULL WHERE id = ?";
    const res = await env.DB.prepare(requeteSql).bind(id).run();
    if (!res.meta.changes) return erreur(404, "introuvable");
    return json({ ok: true });
  }
  if (methode === "GET" && pathname === "/admin/signalements") {
    const { results } = await env.DB.prepare(
      `SELECT j.id, j.pseudo, j.statut, COUNT(*) AS nombre, MAX(s.cree_le) AS dernier,
              GROUP_CONCAT(DISTINCT s.motif) AS motifs
       FROM signalements s JOIN joueurs j ON j.id = s.joueur_signale
       WHERE s.traite = 0
       GROUP BY j.id
       ORDER BY nombre DESC, dernier DESC
       LIMIT 100`
    ).all();
    return json({ signalements: results });
  }
  const traiter = pathname.match(/^\/admin\/signalements\/([0-9a-f-]{36})\/traiter$/);
  if (methode === "POST" && traiter) {
    await env.DB.prepare("UPDATE signalements SET traite = 1 WHERE joueur_signale = ?").bind(traiter[1]).run();
    return json({ ok: true });
  }
  if (methode === "GET" && pathname === "/admin/mots") {
    const { results } = await env.DB.prepare("SELECT mot FROM mots_interdits ORDER BY mot").all();
    return json({ mots: results.map((r) => r.mot) });
  }
  if (methode === "POST" && pathname === "/admin/mots") {
    const mot = minuscules(String((await lireCorps(requete)).mot ?? "").trim());
    if (mot.length < 2 || mot.length > 30 || /\s/.test(mot)) return erreur(400, "mot");
    await env.DB.prepare("INSERT OR IGNORE INTO mots_interdits (mot) VALUES (?)").bind(mot).run();
    return json({ ok: true, mot });
  }
  const retrait = pathname.match(/^\/admin\/mots\/([^/]+)$/);
  if (methode === "DELETE" && retrait) {
    await env.DB.prepare("DELETE FROM mots_interdits WHERE mot = ?").bind(decodeURIComponent(retrait[1])).run();
    return json({ ok: true });
  }
  return erreur(404, "introuvable");
}
__name(adminRequete, "adminRequete");

// src/auth.ts
async function sha256(texte) {
  const octets = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
async function authentifier(requete, env) {
  const id = requete.headers.get("x-joueur-id");
  const secret = requete.headers.get("x-joueur-secret");
  if (!id || !secret || id.length > 64 || secret.length > 128) return null;
  const joueur = await env.DB.prepare("SELECT * FROM joueurs WHERE id = ?").bind(id).first();
  if (!joueur) return null;
  if (await sha256(secret) !== joueur.secret_hash) return null;
  await env.DB.prepare("UPDATE joueurs SET derniere_activite = datetime('now') WHERE id = ?").bind(id).run();
  return joueur;
}
__name(authentifier, "authentifier");

// src/social.ts
var JOUR = /^\d{4}-\d{2}-\d{2}$/;
var UUID = /^[0-9a-f-]{36}$/;
var MAX_AMIS = 100;
var MAX_DEMANDES_PAR_JOUR = 20;
var MOTIFS = ["pseudo_inapproprie", "harcelement", "autre"];
var NOM_AFFICHE = `CASE WHEN j.statut = 'approuve' AND j.pseudo IS NOT NULL
  AND (SELECT COUNT(DISTINCT s.joueur_signalant) FROM signalements s WHERE s.joueur_signale = j.id AND s.traite = 0) < 3
  THEN j.pseudo ELSE 'Joueur-' || upper(substr(replace(j.id, '-', ''), 1, 4)) END`;
var BLOQUE = `EXISTS (SELECT 1 FROM blocages b WHERE (b.joueur_id = ?1 AND b.joueur_bloque = j.id) OR (b.joueur_id = j.id AND b.joueur_bloque = ?1))`;
function jourValide(jour) {
  if (typeof jour !== "string" || !JOUR.test(jour)) return false;
  const ecart = Math.abs(Date.parse(jour + "T00:00:00Z") - Date.parse(jourParis() + "T00:00:00Z"));
  return Number.isFinite(ecart) && ecart <= 24 * 3600 * 1e3;
}
__name(jourValide, "jourValide");
async function enregistrerResultat(requete, env, joueur) {
  const corps = await lireCorps(requete);
  const essais = Number(corps.essais);
  if (!jourValide(corps.jour)) return erreur(400, "jour");
  if (!Number.isInteger(essais) || essais < 1 || essais > 12) return erreur(400, "essais");
  const gagne = corps.gagne === true;
  const score = gagne ? Math.max(1, 7 - essais) : 0;
  const res = await env.DB.prepare("INSERT OR IGNORE INTO resultats (joueur_id, jour, essais, score) VALUES (?, ?, ?, ?)").bind(joueur.id, corps.jour, essais, score).run();
  const garde = await env.DB.prepare("SELECT essais, score FROM resultats WHERE joueur_id = ? AND jour = ?").bind(joueur.id, corps.jour).first();
  return json({ enregistre: !!res.meta.changes, essais: garde?.essais ?? essais, score: garde?.score ?? score });
}
__name(enregistrerResultat, "enregistrerResultat");
async function demanderAmi(requete, env, joueur) {
  const code = String((await lireCorps(requete)).code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length !== 8) return erreur(400, "code");
  const cible = await env.DB.prepare("SELECT id FROM joueurs WHERE code_ami = ?").bind(code).first();
  if (!cible) return erreur(404, "introuvable");
  if (cible.id === joueur.id) return erreur(400, "soi_meme");
  const bloque = await env.DB.prepare(
    "SELECT 1 AS x FROM blocages WHERE (joueur_id = ?1 AND joueur_bloque = ?2) OR (joueur_id = ?2 AND joueur_bloque = ?1)"
  ).bind(joueur.id, cible.id).first();
  if (bloque) return erreur(404, "introuvable");
  const existante = await env.DB.prepare(
    "SELECT joueur_a, statut FROM amities WHERE (joueur_a = ?1 AND joueur_b = ?2) OR (joueur_a = ?2 AND joueur_b = ?1)"
  ).bind(joueur.id, cible.id).first();
  if (existante) {
    if (existante.statut === "acceptee") return json({ statut: "acceptee" });
    if (existante.joueur_a === joueur.id) return json({ statut: "demande" });
    await env.DB.prepare("UPDATE amities SET statut = 'acceptee' WHERE joueur_a = ? AND joueur_b = ?").bind(cible.id, joueur.id).run();
    return json({ statut: "acceptee" });
  }
  const nb = await env.DB.prepare("SELECT COUNT(*) AS n FROM amities WHERE (joueur_a = ?1 OR joueur_b = ?1) AND statut = 'acceptee'").bind(joueur.id).first();
  if ((nb?.n ?? 0) >= MAX_AMIS) return erreur(409, "limite");
  const recentes = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM amities WHERE joueur_a = ? AND cree_le > datetime('now', '-1 day')"
  ).bind(joueur.id).first();
  if ((recentes?.n ?? 0) >= MAX_DEMANDES_PAR_JOUR) return erreur(429, "trop_de_demandes");
  await env.DB.prepare("INSERT INTO amities (joueur_a, joueur_b, statut) VALUES (?, ?, 'demande')").bind(joueur.id, cible.id).run();
  return json({ statut: "demande" }, 201);
}
__name(demanderAmi, "demanderAmi");
async function listerAmis(env, url, joueur) {
  const param = url.searchParams.get("jour");
  const jour = param && JOUR.test(param) ? param : jourParis();
  const base = `FROM amities a
    JOIN joueurs j ON j.id = CASE WHEN a.joueur_a = ?1 THEN a.joueur_b ELSE a.joueur_a END
    LEFT JOIN resultats r ON r.joueur_id = j.id AND r.jour = ?2
    WHERE (a.joueur_a = ?1 OR a.joueur_b = ?1) AND NOT ${BLOQUE}`;
  const { results: amis } = await env.DB.prepare(
    `SELECT j.id AS id, ${NOM_AFFICHE} AS nom, r.essais AS essais, r.score AS score ${base} AND a.statut = 'acceptee' ORDER BY nom COLLATE NOCASE`
  ).bind(joueur.id, jour).all();
  const { results: recues } = await env.DB.prepare(
    `SELECT j.id AS id, ${NOM_AFFICHE} AS nom ${base} AND a.statut = 'demande' AND a.joueur_b = ?1 ORDER BY a.cree_le DESC`
  ).bind(joueur.id, jour).all();
  const envoyees = await env.DB.prepare("SELECT COUNT(*) AS n FROM amities WHERE joueur_a = ? AND statut = 'demande'").bind(joueur.id).first();
  return json({
    jour,
    amis: amis.map((a) => ({ id: a.id, nom: a.nom, resultat: a.essais === null ? null : { essais: a.essais, score: a.score } })),
    recues,
    envoyees: envoyees?.n ?? 0
  });
}
__name(listerAmis, "listerAmis");
async function routeSociale(requete, env, url, joueur) {
  const { pathname } = url;
  const methode = requete.method;
  if (methode === "POST" && pathname === "/v1/resultats") return enregistrerResultat(requete, env, joueur);
  if (pathname === "/v1/amis") {
    if (methode === "POST") return demanderAmi(requete, env, joueur);
    if (methode === "GET") return listerAmis(env, url, joueur);
  }
  const ami = pathname.match(/^\/v1\/amis\/([0-9a-f-]{36})$/);
  if (ami) {
    const autre = ami[1];
    if (methode === "PUT") {
      const accepter = (await lireCorps(requete)).accepter === true;
      const sql = accepter ? "UPDATE amities SET statut = 'acceptee' WHERE joueur_a = ? AND joueur_b = ? AND statut = 'demande'" : "DELETE FROM amities WHERE joueur_a = ? AND joueur_b = ? AND statut = 'demande'";
      const res = await env.DB.prepare(sql).bind(autre, joueur.id).run();
      return res.meta.changes ? json({ ok: true }) : erreur(404, "introuvable");
    }
    if (methode === "DELETE") {
      await env.DB.prepare("DELETE FROM amities WHERE (joueur_a = ?1 AND joueur_b = ?2) OR (joueur_a = ?2 AND joueur_b = ?1)").bind(joueur.id, autre).run();
      return json({ ok: true });
    }
  }
  if (methode === "POST" && pathname === "/v1/blocages") {
    const cible = (await lireCorps(requete)).joueur_id;
    if (typeof cible !== "string" || !UUID.test(cible) || cible === joueur.id) return erreur(400, "joueur");
    await env.DB.batch([
      env.DB.prepare("INSERT OR IGNORE INTO blocages (joueur_id, joueur_bloque) VALUES (?, ?)").bind(joueur.id, cible),
      env.DB.prepare("DELETE FROM amities WHERE (joueur_a = ?1 AND joueur_b = ?2) OR (joueur_a = ?2 AND joueur_b = ?1)").bind(joueur.id, cible)
    ]);
    return json({ ok: true });
  }
  const deblocage = pathname.match(/^\/v1\/blocages\/([0-9a-f-]{36})$/);
  if (methode === "DELETE" && deblocage) {
    await env.DB.prepare("DELETE FROM blocages WHERE joueur_id = ? AND joueur_bloque = ?").bind(joueur.id, deblocage[1]).run();
    return json({ ok: true });
  }
  if (methode === "POST" && pathname === "/v1/signalements") {
    const corps = await lireCorps(requete);
    const cible = corps.joueur_id;
    const motif = typeof corps.motif === "string" && MOTIFS.includes(corps.motif) ? corps.motif : "autre";
    if (typeof cible !== "string" || !UUID.test(cible) || cible === joueur.id) return erreur(400, "joueur");
    const existe = await env.DB.prepare("SELECT 1 AS x FROM joueurs WHERE id = ?").bind(cible).first();
    if (!existe) return erreur(404, "introuvable");
    const deja = await env.DB.prepare("SELECT 1 AS x FROM signalements WHERE joueur_signale = ? AND joueur_signalant = ? AND traite = 0").bind(cible, joueur.id).first();
    if (!deja) {
      await env.DB.prepare("INSERT INTO signalements (joueur_signale, joueur_signalant, motif) VALUES (?, ?, ?)").bind(cible, joueur.id, motif).run();
    }
    return json({ ok: true });
  }
  return null;
}
__name(routeSociale, "routeSociale");

// src/index.ts
function base64url(octets) {
  let s = "";
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64url, "base64url");
var ALPHABET_CODE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function codeAleatoire(longueur) {
  const octets = crypto.getRandomValues(new Uint8Array(longueur));
  return [...octets].map((o) => ALPHABET_CODE[o % ALPHABET_CODE.length]).join("");
}
__name(codeAleatoire, "codeAleatoire");
var FORME_PSEUDO = /^[\p{L}\p{N}_-]+(?: [\p{L}\p{N}_-]+)*$/u;
var COORDONNEES = /@|https?:|www\.|\.(com|fr|net|org|io)\b|\d{6,}/i;
var SEMAINE_MS = 7 * 24 * 3600 * 1e3;
function nomAffiche(joueur) {
  return joueur.statut === "approuve" && joueur.pseudo ? joueur.pseudo : `Joueur-${joueur.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}
__name(nomAffiche, "nomAffiche");
async function creerJoueur(env) {
  const id = crypto.randomUUID();
  const secret = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const secretHash = await sha256(secret);
  for (let essai = 0; essai < 5; essai++) {
    const code = codeAleatoire(8);
    try {
      await env.DB.prepare("INSERT INTO joueurs (id, secret_hash, code_ami) VALUES (?, ?, ?)").bind(id, secretHash, code).run();
      return json({ id, secret, code_ami: code }, 201);
    } catch {
    }
  }
  return erreur(500, "creation_impossible");
}
__name(creerJoueur, "creerJoueur");
function reponseMoi(joueur) {
  return json({
    id: joueur.id,
    code_ami: joueur.code_ami,
    pseudo: joueur.pseudo,
    statut: joueur.statut,
    visible_des_autres: joueur.statut === "approuve",
    nom_affiche: nomAffiche(joueur)
  });
}
__name(reponseMoi, "reponseMoi");
async function changerPseudo(requete, env, joueur) {
  if (joueur.statut === "banni") return erreur(403, "banni");
  const corps = await lireCorps(requete);
  const pseudo = String(corps.pseudo ?? "").trim().replace(/\s+/g, " ");
  if (pseudo.length < 3 || pseudo.length > 16 || !FORME_PSEUDO.test(pseudo)) {
    return erreur(400, "forme");
  }
  if (COORDONNEES.test(pseudo)) return erreur(400, "interdit");
  const cle = normaliser(pseudo);
  const { results: interdits } = await env.DB.prepare("SELECT mot FROM mots_interdits").all();
  if (interdits.some((m) => m.mot && cle.includes(normaliser(m.mot)))) {
    return erreur(400, "interdit");
  }
  if (joueur.pseudo && joueur.statut !== "refuse" && joueur.dernier_changement_pseudo) {
    const depuis = Date.now() - Date.parse(joueur.dernier_changement_pseudo.replace(" ", "T") + "Z");
    if (depuis < SEMAINE_MS) {
      return erreur(429, "trop_tot", { reessayer_dans_secondes: Math.ceil((SEMAINE_MS - depuis) / 1e3) });
    }
  }
  try {
    await env.DB.prepare(
      "UPDATE joueurs SET pseudo = ?, pseudo_cle = ?, statut = 'attente', dernier_changement_pseudo = datetime('now') WHERE id = ?"
    ).bind(pseudo, cle, joueur.id).run();
  } catch {
    return erreur(409, "pris");
  }
  return json({ pseudo, statut: "attente" });
}
__name(changerPseudo, "changerPseudo");
async function supprimerJoueur(env, joueur) {
  const id = joueur.id;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM reactions WHERE de_joueur = ? OR joueur_cible = ?").bind(id, id),
    env.DB.prepare("DELETE FROM defis WHERE de_joueur = ? OR a_joueur = ?").bind(id, id),
    env.DB.prepare("DELETE FROM membres WHERE joueur_id = ?").bind(id),
    env.DB.prepare("UPDATE groupes SET createur = NULL WHERE createur = ?").bind(id),
    env.DB.prepare("DELETE FROM groupes WHERE id NOT IN (SELECT groupe_id FROM membres)"),
    env.DB.prepare("DELETE FROM amities WHERE joueur_a = ? OR joueur_b = ?").bind(id, id),
    env.DB.prepare("DELETE FROM blocages WHERE joueur_id = ? OR joueur_bloque = ?").bind(id, id),
    env.DB.prepare("DELETE FROM signalements WHERE joueur_signale = ? OR joueur_signalant = ?").bind(id, id),
    env.DB.prepare("DELETE FROM resultats WHERE joueur_id = ?").bind(id),
    env.DB.prepare("DELETE FROM joueurs WHERE id = ?").bind(id)
  ]);
  return json({ supprime: true });
}
__name(supprimerJoueur, "supprimerJoueur");
var src_default = {
  async fetch(requete, env) {
    const url = new URL(requete.url);
    const { pathname } = url;
    const methode = requete.method;
    if (url.hostname === (env.ADMIN_HOST ?? "admin.occitangames.com")) {
      return adminRequete(requete, env, url);
    }
    if (methode === "GET" && pathname === "/v1/sante") {
      return json({ ok: true, service: "quizzle-api", jour: jourParis() });
    }
    if (methode === "POST" && pathname === "/v1/joueurs") {
      return creerJoueur(env);
    }
    if (/^\/v1\/(amis|resultats|blocages|signalements)(\/|$)/.test(pathname)) {
      const joueur = await authentifier(requete, env);
      if (!joueur) return erreur(401, "non_authentifie");
      const reponse = await routeSociale(requete, env, url, joueur);
      if (reponse) return reponse;
    }
    if (pathname === "/v1/joueurs/moi" || pathname === "/v1/joueurs/pseudo") {
      const joueur = await authentifier(requete, env);
      if (!joueur) return erreur(401, "non_authentifie");
      if (methode === "GET" && pathname === "/v1/joueurs/moi") return reponseMoi(joueur);
      if (methode === "DELETE" && pathname === "/v1/joueurs/moi") return supprimerJoueur(env, joueur);
      if (methode === "PUT" && pathname === "/v1/joueurs/pseudo") return changerPseudo(requete, env, joueur);
    }
    return erreur(404, "introuvable");
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-6I7ZC1/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-6I7ZC1/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
