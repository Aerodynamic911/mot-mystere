#!/usr/bin/env python3
"""Génère les pages statiques du site Quizzle (français à la racine, anglais dans /en/).

Usage : python3 build.py
Les liens des boutiques sont à renseigner ci-dessous dès que l'appli est publiée.
"""
import math
import os

# ── À renseigner à la publication ────────────────────────────────────────────
LIEN_APP_STORE = ''      # ex. https://apps.apple.com/app/quizzle/id000000000
LIEN_GOOGLE_PLAY = ''    # ex. https://play.google.com/store/apps/details?id=com.occitangames.quizzle
SITE = 'https://occitangames.com'
CONTACT = 'contact@occitangames.com'
# ─────────────────────────────────────────────────────────────────────────────

ICI = os.path.dirname(os.path.abspath(__file__))
PALETTE = ['#F5B942', '#FF8A5B', '#FF6B9D', '#B58CFF', '#6CB4FF', '#3DDC97', '#F5B942']


def assombrir(hexa, f):
    f = max(0, min(1, f))
    return '#' + ''.join('%02x' % round(int(hexa[i:i + 2], 16) * f) for i in (1, 3, 5))


def mot_marque(texte='QUIZZLE'):
    """Logo : lettres sur un arc, épaisseur extrudée, contour sombre, couleurs de l'arc-en-ciel."""
    lettres = list(texte)
    n = len(lettres)
    taille = 112
    emplacement = taille * 0.84
    R = 720
    cx, cy = 320, 112 + R
    corps = []
    for i, l in enumerate(lettres):
        th = (i - (n - 1) / 2) * emplacement / R
        x = cx + R * math.sin(th)
        y = cy - R * math.cos(th)
        deg = math.degrees(th)
        couleur = PALETTE[i % len(PALETTE)]
        calques = []
        for dy in range(10, 0, -1):
            calques.append('<text y="%d" fill="%s" stroke="%s" stroke-width="7" stroke-linejoin="round">%s</text>' % (dy, assombrir(couleur, 0.62 - dy * 0.012), '#1A0F4A', l))
        calques.append('<text fill="%s" stroke="#1A0F4A" stroke-width="7" stroke-linejoin="round" paint-order="stroke">%s</text>' % (couleur, l))
        calques.append('<text fill="%s" stroke="none">%s</text>' % (couleur, l))
        corps.append(
            '<g transform="translate(%.1f %.1f) rotate(%.2f)"><g class="lettre" style="--i:%d" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="%d">%s</g></g>'
            % (x, y, deg, i, taille, ''.join(calques)))
    return ('<svg class="mot-marque" viewBox="-24 0 688 190" role="img" aria-label="Quizzle">%s</svg>' % ''.join(corps))


def boutiques(t):
    def un(lien, nom, sous):
        if lien:
            return '<a class="boutique" href="%s" rel="noopener"><small>%s</small><strong>%s</strong></a>' % (lien, sous, nom)
        return '<span class="boutique" aria-disabled="true"><small>%s</small><strong>%s</strong></span>' % (t['bientot'], nom)
    return '<div class="boutiques">%s%s</div>' % (
        un(LIEN_APP_STORE, 'App Store', t['dispo_ios']),
        un(LIEN_GOOGLE_PLAY, 'Google Play', t['dispo_android']))


TEXTES = {
    'fr': dict(
        lang='fr', racine='', autre_lang='en/', autre_nom='EN', autre_label='English version',
        titre='Quizzle, le jeu des mystères : devinez à partir d’indices',
        description='Quizzle : six indices, une réponse. Un mystère par jour, une aventure sans fin, des événements mensuels et plus de 200 énigmes pour tous les âges. Bientôt sur iPhone et Android.',
        aller='Aller au contenu', nav_jouer='Essayer', nav_modes='Modes de jeu', nav_dl='Télécharger',
        h1='Six indices. Une seule réponse.',
        chapeau='Chaque énigme commence vague et devient de plus en plus précise. Moins vous demandez d’indices, plus votre score monte. Un mystère par jour, une aventure sans fin et plus de 200 énigmes.',
        bientot='Bientôt', dispo_ios='Télécharger sur l’', dispo_android='Disponible sur',
        note_bientot='Quizzle arrive bientôt sur iPhone et Android. Les liens de téléchargement apparaîtront ici dès la publication.',
        note_dispo='Gratuit à télécharger.',
        essai_intro='Une vraie énigme du jeu. Tapez votre réponse, ou demandez un indice.',
        modes_h='Trois façons de jouer',
        modes_p='Quelques minutes suffisent. Revenez chaque jour, ou enchaînez les niveaux.',
        m1_h='Le mystère du jour', m1_p='Un mystère par jour, le même pour tout le monde. Trouvez-le trois jours de suite pour gagner un joker, puis la série continue de grandir.',
        m1_visuel='Mystère du jour', m1_n='n°',
        m2_h='L’aventure', m2_p='Une carte au trésor, huit décors et des niveaux sans fin. Tous les 30 niveaux, vous gagnez un nouveau titre.', m2_t='Nouveau titre',
        m3_h='Les événements', m3_p='Chaque mois, une aventure à thème en 20 étapes, avec une carte à collectionner à la clé.', m3_t='20 étapes',
        ages_h='Des énigmes pour chaque génération',
        ages_p='Plus de 200 énigmes, de la tour Eiffel à Minecraft. Choisissez votre tranche d’âge dans les préférences : vous recevez les énigmes que tout le monde connaît, plus celles qui parlent à votre époque.',
        ages=[
            ('Tous publics', ['Tour Eiffel', 'Panda', 'Imprimerie', 'Cléopâtre']),
            ('Ados, 13 à 17 ans', ['Minecraft', 'Pokémon', 'Naruto', 'Usain Bolt']),
            ('18 à 30 ans', ['ChatGPT', 'Netflix', 'Daft Punk', 'Inception']),
            ('30 à 50 ans', ['Tamagotchi', 'Nokia 3310', 'France 98', 'Minitel']),
            ('50 ans et plus', ['Apollo 11', 'Édith Piaf', '2CV', 'Tintin']),
        ],
        ages_note='Le jeu est conçu pour les 13 ans et plus.',
        amis_h='Défiez vos amis',
        amis_p='Après chaque partie, envoyez un code à un ami. Il joue la même énigme que vous et voit s’il fait mieux. Aucun compte à créer : le code suffit.',
        bulle1='🎯 Défi Quizzle ! J’ai trouvé en 3 essais. Saurez-vous faire mieux ?', bulle2='Code du défi :',
        p1_t='Une série à protéger', p1_p='Les victoires d’affilée rapportent des jokers.',
        p2_t='Des jokers', p2_p='Un indice offert, sans compter comme un essai.',
        p3_t='Des glaçons', p3_p='Ils gardent votre série au frais si vous manquez un jour.',
        p4_t='Des cartes à collectionner', p4_p='Elles récompensent votre progression.',
        fin_h='Prêt à deviner ?', fin_p='Quizzle arrive bientôt sur iPhone et Android. Vos données restent sur votre téléphone : aucun compte à créer.',
        pied_pub='Quizzle est un jeu édité par Occitan Games.', conf='Confidentialité', ment='Mentions légales', contact='Contact',
        url_conf='confidentialite.html', url_ment='mentions-legales.html', url_home='',
        indice='Indice',
    ),
    'en': dict(
        lang='en', racine='../', autre_lang='../', autre_nom='FR', autre_label='Version française',
        titre='Quizzle, the mystery game: guess from the clues',
        description='Quizzle: six clues, one answer. A daily mystery, an endless adventure, monthly events and over 200 riddles for every age. Coming soon to iPhone and Android.',
        aller='Skip to content', nav_jouer='Try it', nav_modes='Ways to play', nav_dl='Download',
        h1='Six clues. One answer.',
        chapeau='Every riddle starts vague and gets sharper with each clue. The fewer clues you ask for, the higher your score. A mystery every day, an endless adventure and over 200 riddles.',
        bientot='Coming soon', dispo_ios='Download on the ', dispo_android='Get it on',
        note_bientot='Quizzle is coming soon to iPhone and Android. Download links will appear here as soon as it is published.',
        note_dispo='Free to download.',
        essai_intro='A real riddle from the game. Type your answer, or ask for a clue.',
        modes_h='Three ways to play',
        modes_p='A few minutes is all it takes. Come back every day, or chain levels together.',
        m1_h='The daily mystery', m1_p='One mystery a day, the same for everyone. Solve it three days in a row to earn a joker, then your streak keeps growing.',
        m1_visuel='Daily mystery', m1_n='No.',
        m2_h='The adventure', m2_p='A treasure map, eight settings and endless levels. Every 30 levels, you earn a new title.', m2_t='New title',
        m3_h='The events', m3_p='Every month, a themed adventure in 20 steps, with a collectible card at the end.', m3_t='20 steps',
        ages_h='Riddles for every generation',
        ages_p='Over 200 riddles, from the Eiffel Tower to Minecraft. Pick your age group in the settings: you get the riddles everyone knows, plus the ones that speak to your era.',
        ages=[
            ('All ages', ['Eiffel Tower', 'Panda', 'Printing press', 'Cleopatra']),
            ('Teens, 13 to 17', ['Minecraft', 'Pokémon', 'Naruto', 'Usain Bolt']),
            ('18 to 30', ['ChatGPT', 'Netflix', 'Daft Punk', 'Inception']),
            ('30 to 50', ['Tamagotchi', 'Nokia 3310', 'France 98', 'Minitel']),
            ('50 and over', ['Apollo 11', 'Édith Piaf', '2CV', 'Tintin']),
        ],
        ages_note='The game is designed for ages 13 and over.',
        amis_h='Challenge your friends',
        amis_p='After each game, send a code to a friend. They play the same riddle as you and see if they do better. No account to create: the code is all it takes.',
        bulle1='🎯 Quizzle challenge! I found it in 3 attempts. Can you do better?', bulle2='Challenge code:',
        p1_t='A streak to protect', p1_p='Winning in a row earns you jokers.',
        p2_t='Jokers', p2_p='A free clue that does not count as an attempt.',
        p3_t='Ice cubes', p3_p='They keep your streak on ice if you miss a day.',
        p4_t='Collectible cards', p4_p='They reward your progress.',
        fin_h='Ready to guess?', fin_p='Quizzle is coming soon to iPhone and Android. Your data stays on your phone: no account to create.',
        pied_pub='Quizzle is a game published by Occitan Games.', conf='Privacy', ment='Legal notice', contact='Contact',
        url_conf='privacy.html', url_ment='legal.html', url_home='',
        indice='Clue',
    ),
}


def ouverture_page(t, titre, description, chemin_autre, canon, noindex=False):
    r = t['racine']
    autre = 'fr' if t['lang'] == 'en' else 'en'
    robots = '<meta name="robots" content="noindex">' if noindex else ''
    return f'''<!doctype html>
<html lang="{t['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre}</title>
<meta name="description" content="{description}">
<meta name="theme-color" content="#0F1224">
{robots}
<link rel="canonical" href="{SITE}/{canon}">
<link rel="alternate" hreflang="fr" href="{SITE}/{canon if t['lang'] == 'fr' else chemin_autre}">
<link rel="alternate" hreflang="en" href="{SITE}/{canon if t['lang'] == 'en' else chemin_autre}">
<meta property="og:type" content="website">
<meta property="og:title" content="{titre}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="{SITE}/img/og.png">
<meta property="og:url" content="{SITE}/{canon}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="{r}img/favicon.png">
<link rel="apple-touch-icon" href="{r}img/apple-touch-icon.png">
<link rel="preload" href="{r}fonts/lilita-one-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{r}assets/style.css">
</head>
<body>
<a class="saut" href="#contenu">{t['aller']}</a>
'''


def entete(t, url_autre, accueil=True):
    r = t['racine']
    nav = ''
    if accueil:
        nav = f'<a class="lien-nav" href="#essai">{t["nav_jouer"]}</a><a class="lien-nav" href="#modes">{t["nav_modes"]}</a><a class="lien-nav" href="#telecharger">{t["nav_dl"]}</a>'
    return f'''<header class="entete"><div class="conteneur">
<a class="marque" href="./"><img src="{r}img/favicon.png" alt="" width="34" height="34">Quizzle</a>
<nav class="nav" aria-label="Navigation">{nav}<a class="langue" href="{url_autre}" hreflang="{'fr' if t['lang'] == 'en' else 'en'}" lang="{'fr' if t['lang'] == 'en' else 'en'}" aria-label="{t['autre_label']}">{t['autre_nom']}</a></nav>
</div></header>
'''


def pied(t):
    r = t['racine']
    return f'''<footer class="pied"><div class="conteneur">
<p>© 2026 Occitan Games · {t['pied_pub']}</p>
<nav aria-label="{t['conf']}"><a href="{t['url_conf']}">{t['conf']}</a><a href="{t['url_ment']}">{t['ment']}</a><a href="mailto:{CONTACT}">{t['contact']}</a></nav>
</div></footer>
</body>
</html>
'''


def page_accueil(t):
    r = t['racine']
    n_sub = 'en/' if t['lang'] == 'en' else ''
    canon = 'en/' if t['lang'] == 'en' else ''
    autre = '' if t['lang'] == 'en' else 'en/'
    html = ouverture_page(t, t['titre'], t['description'], autre, canon)
    html += entete(t, t['autre_lang'])
    liens_dispo = bool(LIEN_APP_STORE or LIEN_GOOGLE_PLAY)
    note = t['note_dispo'] if liens_dispo else t['note_bientot']
    ages = ''.join(
        '<li><h3>%s</h3><p class="sujets">%s</p></li>' % (nom, '<span aria-hidden="true">/</span>'.join(s for s in [' ' + x + ' ' for x in sujets]))
        for nom, sujets in t['ages'])
    html += f'''<main id="contenu">
<section class="heros"><div class="conteneur">
<div>
{mot_marque()}
<h1>{t['h1']}</h1>
<p class="chapeau">{t['chapeau']}</p>
{boutiques(t)}
<p class="note-bientot">{note}</p>
</div>
<div class="essai" id="essai">
<img class="mascotte-coin" src="{r}img/mascotte.svg" alt="" width="132" height="123">
<p class="essai-intro">{t['essai_intro']}</p>
<div class="enigme" id="enigme">
<p class="enigme-cat"></p>
<ol class="indices" aria-live="polite"></ol>
<div class="pastilles"></div>
<form class="saisie" autocomplete="off"><label class="sr-only" for="reponse">{t['essai_intro']}</label><input id="reponse" name="reponse" type="text" enterkeyhint="send" autocapitalize="words" spellcheck="false"><button class="btn" type="submit"></button></form>
<div class="actions"><button class="btn btn-2" type="button" data-suivant></button></div>
<p class="message" role="status"></p>
<div class="resultat-zone"></div>
</div>
</div>
</div></section>

<section id="modes"><div class="conteneur">
<div class="intro-section"><h2>{t['modes_h']}</h2><p>{t['modes_p']}</p></div>
<div class="modes">
<article class="mode">
<div class="visuel"><div class="ticket"><div class="ticket-corps"><small>{t['m1_visuel']}</small><strong>{t['m1_n']}<span data-numero>1</span></strong><div class="ticket-pips" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div></div>
<h3>{t['m1_h']}</h3><p>{t['m1_p']}</p>
</article>
<article class="mode">
<div class="visuel">{svg_carte(t['m2_t'])}</div>
<h3>{t['m2_h']}</h3><p>{t['m2_p']}</p>
</article>
<article class="mode">
<div class="visuel">{svg_evenement(t['m3_t'])}</div>
<h3>{t['m3_h']}</h3><p>{t['m3_p']}</p>
</article>
</div>
</div></section>

<section class="ages-fond"><div class="conteneur">
<div class="intro-section"><h2>{t['ages_h']}</h2><p>{t['ages_p']}</p></div>
<ul class="ages">{ages}</ul>
<p class="ages-note">{t['ages_note']}</p>
</div></section>

<section><div class="conteneur amis">
<div>
<h2>{t['amis_h']}</h2>
<p class="intro-section" style="color:var(--texte-2);margin-top:14px;font-size:1.1rem">{t['amis_p']}</p>
<div class="petits">
<div class="petit"><span class="emoji" aria-hidden="true">🔥</span><div><strong>{t['p1_t']}</strong><span>{t['p1_p']}</span></div></div>
<div class="petit"><span class="emoji" aria-hidden="true">✨</span><div><strong>{t['p2_t']}</strong><span>{t['p2_p']}</span></div></div>
<div class="petit"><span class="emoji" aria-hidden="true">🧊</span><div><strong>{t['p3_t']}</strong><span>{t['p3_p']}</span></div></div>
<div class="petit"><span class="emoji" aria-hidden="true">🃏</span><div><strong>{t['p4_t']}</strong><span>{t['p4_p']}</span></div></div>
</div>
</div>
<div class="bulle"><p>{t['bulle1']}</p><p>{t['bulle2']}</p><p><span class="code">485-194</span></p></div>
</div></section>

<section class="final" id="telecharger"><div class="conteneur"><div class="final-corps">
<div>
<h2>{t['fin_h']}</h2>
<p>{t['fin_p']}</p>
{boutiques(t)}
</div>
<img class="final-mascotte" src="{r}img/mascotte.svg" alt="" width="300" height="279" loading="lazy">
</div></div></section>
</main>
<script src="{r}assets/app.js" defer></script>
'''
    html += pied(t)
    return html


def svg_carte(titre):
    """Carte au trésor : un chemin sinueux, des niveaux, un trophée au niveau 30."""
    return f'''<svg viewBox="0 0 320 170" role="img" aria-label="{titre}" width="100%" height="170">
<path d="M18 138 C70 138 70 92 118 92 S170 132 214 108 S262 44 296 40" fill="none" stroke="#3DDC97" stroke-opacity=".55" stroke-width="5" stroke-dasharray="2 11" stroke-linecap="round"/>
<g font-family="Lilita One, sans-serif" font-size="15" text-anchor="middle" fill="#0F1224">
<circle cx="18" cy="138" r="14" fill="#3DDC97"/><text x="18" y="143">1</text>
<circle cx="118" cy="92" r="14" fill="#3DDC97"/><text x="118" y="97">12</text>
<circle cx="214" cy="108" r="14" fill="#3DDC97"/><text x="214" y="113">21</text>
<circle cx="296" cy="40" r="19" fill="#F5B942" stroke="#FFE08A" stroke-width="3"/><text x="296" y="46" font-size="17">30</text>
</g>
<text x="270" y="78" text-anchor="middle" fill="#F5B942" font-family="DM Sans, sans-serif" font-weight="700" font-size="13">{titre}</text>
</svg>'''


def svg_evenement(titre):
    """20 étapes : une grille de pastilles dont les premières sont gagnées."""
    pts = []
    for i in range(20):
        col, lig = i % 5, i // 5
        x, y = 34 + col * 62, 24 + lig * 36
        if i < 12:
            pts.append(f'<circle cx="{x}" cy="{y}" r="13" fill="#B58CFF"/><path d="M{x-5} {y} l4 4 l7 -8" fill="none" stroke="#0F1224" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
        elif i == 12:
            pts.append(f'<circle cx="{x}" cy="{y}" r="13" fill="#0F1224" stroke="#F5B942" stroke-width="3"/>')
        else:
            pts.append(f'<circle cx="{x}" cy="{y}" r="13" fill="none" stroke="#323963" stroke-width="3"/>')
    return f'<svg viewBox="0 0 320 170" role="img" aria-label="{titre}" width="100%" height="170">{"".join(pts)}<text x="160" y="166" text-anchor="middle" fill="#B58CFF" font-family="DM Sans, sans-serif" font-weight="700" font-size="13">{titre}</text></svg>'


PRIVACY = {
    'fr': dict(
        titre='Politique de confidentialité — Quizzle', desc='Comment Quizzle traite vos données : elles restent sur votre appareil.',
        h1='Politique de confidentialité', maj='Dernière mise à jour : 14 octobre 2026',
        corps=f'''
<p>Quizzle est un jeu mobile édité par Occitan Games. Cette page explique, simplement, ce que l’application fait de vos données.</p>

<h2>En résumé</h2>
<p>Quizzle ne vous demande aucun compte, ne collecte aucune donnée personnelle et n’envoie rien à un serveur. Votre progression reste sur votre téléphone.</p>

<h2>Ce qui est enregistré sur votre appareil</h2>
<ul>
<li>votre progression (niveaux, étapes d’événements, cartes, jokers, glaçons, pièces) ;</li>
<li>vos statistiques de jeu (parties, victoires, séries) ;</li>
<li>vos préférences (langue, difficulté, tranche d’âge).</li>
</ul>
<p>Ces informations sont stockées uniquement dans la mémoire de l’application, sur votre téléphone. L’éditeur n’y a pas accès. Elles disparaissent si vous désinstallez l’application ou effacez ses données.</p>

<h2>Ce que nous ne faisons pas</h2>
<ul>
<li>aucun compte ni identifiant utilisateur ;</li>
<li>aucun outil de mesure d’audience ni de suivi publicitaire dans la version actuelle ;</li>
<li>aucune vente ni transmission de données à des tiers.</li>
</ul>

<h2>Partage et notation</h2>
<p>Les boutons de partage ouvrent le menu de partage de votre téléphone : le message n’est envoyé que si vous choisissez une application et un destinataire. L’éventuelle invitation à noter l’application utilise la fenêtre fournie par l’App Store ou Google Play ; l’éditeur ne reçoit pas votre note comme donnée personnelle.</p>

<h2>Publicité et achats</h2>
<p>La version actuelle ne contient ni publicité ni achat avec de l’argent réel. Si cela change, cette politique sera mise à jour avant la mise en ligne de la nouvelle version, et les paiements passeront par l’App Store ou Google Play, qui gèrent eux-mêmes les informations de paiement.</p>

<h2>Âge minimum</h2>
<p>Quizzle s’adresse aux personnes de 13 ans et plus.</p>

<h2>Ce site</h2>
<p>Ce site n’utilise aucun cookie de suivi ni outil de mesure d’audience. Les polices de caractères sont hébergées sur le site lui-même.</p>

<h2>Vos droits</h2>
<p>L’éditeur ne détenant aucune donnée personnelle vous concernant, il n’y a rien à consulter ni à supprimer chez lui : vous gardez le contrôle en effaçant les données de l’application sur votre téléphone. Pour toute question, écrivez à <a href="mailto:{CONTACT}">{CONTACT}</a>. Vous pouvez aussi saisir la CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).</p>

<h2>Modifications</h2>
<p>Cette politique peut évoluer avec l’application. La date de mise à jour figure en haut de cette page.</p>
'''),
    'en': dict(
        titre='Privacy policy — Quizzle', desc='How Quizzle handles your data: it stays on your device.',
        h1='Privacy policy', maj='Last updated: 14 October 2026',
        corps=f'''
<p>Quizzle is a mobile game published by Occitan Games. This page explains, simply, what the app does with your data.</p>

<h2>In short</h2>
<p>Quizzle asks for no account, collects no personal data and sends nothing to a server. Your progress stays on your phone.</p>

<h2>What is stored on your device</h2>
<ul>
<li>your progress (levels, event steps, cards, jokers, ice cubes, coins);</li>
<li>your game statistics (games, wins, streaks);</li>
<li>your preferences (language, difficulty, age group).</li>
</ul>
<p>This information is stored only in the app’s storage, on your phone. The publisher has no access to it. It disappears if you uninstall the app or clear its data.</p>

<h2>What we do not do</h2>
<ul>
<li>no account or user identifier;</li>
<li>no analytics or advertising tracking in the current version;</li>
<li>no sale or transfer of data to third parties.</li>
</ul>

<h2>Sharing and rating</h2>
<p>The share buttons open your phone’s share menu: a message is sent only if you choose an app and a recipient. The optional prompt to rate the app uses the window provided by the App Store or Google Play; the publisher does not receive your rating as personal data.</p>

<h2>Ads and purchases</h2>
<p>The current version contains no ads and no purchases with real money. If this changes, this policy will be updated before the new version is released, and payments will go through the App Store or Google Play, which handle payment information themselves.</p>

<h2>Minimum age</h2>
<p>Quizzle is intended for people aged 13 and over.</p>

<h2>This website</h2>
<p>This website uses no tracking cookies and no analytics. Fonts are hosted on the site itself.</p>

<h2>Your rights</h2>
<p>Because the publisher holds no personal data about you, there is nothing to access or delete on its side: you stay in control by clearing the app’s data on your phone. For any question, write to <a href="mailto:{CONTACT}">{CONTACT}</a>. You may also contact the French data protection authority, the CNIL (<a href="https://www.cnil.fr/en">cnil.fr</a>).</p>

<h2>Changes</h2>
<p>This policy may change as the app evolves. The update date is shown at the top of this page.</p>
'''),
}

LEGAL = {
    'fr': dict(
        titre='Mentions légales — Quizzle', desc='Mentions légales du site Quizzle / Occitan Games.',
        h1='Mentions légales',
        corps=f'''
<h2>Éditeur du site</h2>
<p>Occitan Games, nom de marque de <span class="a-completer">[prénom et nom de l’entrepreneur individuel]</span>, entrepreneur individuel.<br>
SIRET : <span class="a-completer">[numéro SIRET]</span><br>
Adresse : <span class="a-completer">[adresse professionnelle]</span><br>
Contact : <a href="mailto:{CONTACT}">{CONTACT}</a></p>
<p>Directeur de la publication : <span class="a-completer">[prénom et nom]</span>.</p>

<h2>Hébergeur</h2>
<p><span class="a-completer">[nom, adresse et téléphone de l’hébergeur du site]</span></p>

<h2>Propriété intellectuelle</h2>
<p>Le jeu Quizzle, son nom, son logo, sa mascotte et les contenus de ce site sont la propriété d’Occitan Games. Toute reproduction sans autorisation est interdite.</p>

<h2>Données personnelles</h2>
<p>Voir la <a href="confidentialite.html">politique de confidentialité</a>.</p>
'''),
    'en': dict(
        titre='Legal notice — Quizzle', desc='Legal notice for the Quizzle / Occitan Games website.',
        h1='Legal notice',
        corps=f'''
<h2>Publisher</h2>
<p>Occitan Games, a trade name of <span class="a-completer">[first and last name of the sole proprietor]</span>, sole proprietor (France).<br>
SIRET: <span class="a-completer">[SIRET number]</span><br>
Address: <span class="a-completer">[business address]</span><br>
Contact: <a href="mailto:{CONTACT}">{CONTACT}</a></p>
<p>Publication director: <span class="a-completer">[first and last name]</span>.</p>

<h2>Hosting</h2>
<p><span class="a-completer">[name, address and phone number of the website host]</span></p>

<h2>Intellectual property</h2>
<p>The game Quizzle, its name, logo, mascot and the content of this site are the property of Occitan Games. Reproduction without permission is prohibited.</p>

<h2>Personal data</h2>
<p>See the <a href="privacy.html">privacy policy</a>.</p>
'''),
}


def page_texte(t, contenu, canon, chemin_autre):
    html = ouverture_page(t, contenu['titre'], contenu['desc'], chemin_autre, canon, noindex=False)
    html += entete(t, ('../' + chemin_autre) if t['lang'] == 'en' else chemin_autre, accueil=False)
    maj = f'<p class="maj">{contenu["maj"]}</p>' if 'maj' in contenu else ''
    html += f'<main id="contenu" class="page"><div class="conteneur"><h1>{contenu["h1"]}</h1>{maj}{contenu["corps"]}</div></main>\n'
    html += pied(t)
    return html


def ecrire(chemin, contenu):
    complet = os.path.join(ICI, chemin)
    os.makedirs(os.path.dirname(complet), exist_ok=True)
    with open(complet, 'w', encoding='utf-8') as f:
        f.write(contenu)


if __name__ == '__main__':
    fr, en = TEXTES['fr'], TEXTES['en']
    ecrire('index.html', page_accueil(fr))
    ecrire('en/index.html', page_accueil(en))
    ecrire('confidentialite.html', page_texte(fr, PRIVACY['fr'], 'confidentialite.html', 'en/privacy.html'))
    ecrire('en/privacy.html', page_texte(en, PRIVACY['en'], 'en/privacy.html', 'confidentialite.html'))
    ecrire('mentions-legales.html', page_texte(fr, LEGAL['fr'], 'mentions-legales.html', 'en/legal.html'))
    ecrire('en/legal.html', page_texte(en, LEGAL['en'], 'en/legal.html', 'mentions-legales.html'))
    # sitemap et robots
    urls = ['', 'en/', 'confidentialite.html', 'en/privacy.html', 'mentions-legales.html', 'en/legal.html']
    ecrire('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'<url><loc>{SITE}/{u}</loc></url>\n' for u in urls) + '</urlset>\n')
    ecrire('robots.txt', f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
    print('Site généré.')
