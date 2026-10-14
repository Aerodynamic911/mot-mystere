# Site vitrine Quizzle (occitangames.com)

Site statique : aucune dépendance, rien à installer sur l'hébergement.

- `index.html` (français) et `en/index.html` (anglais)
- pages obligatoires pour les stores : `confidentialite.html` / `en/privacy.html` (politique de confidentialité), `mentions-legales.html` / `en/legal.html`
- `assets/`, `fonts/` (polices hébergées localement, pas de Google Fonts), `img/`, `sitemap.xml`, `robots.txt`

## Mettre en ligne
Envoyer le contenu du dossier (sauf `build.py` et `README.md`, facultatifs) à la racine de l'hébergement du domaine occitangames.com. Rediriger occitangames.fr vers https://occitangames.com (redirection 301, chez le registrar).

## Après publication de l'appli
Dans `build.py`, renseigner `LIEN_APP_STORE` et `LIEN_GOOGLE_PLAY`, puis lancer `python3 build.py` : les boutons « Bientôt » deviennent des liens de téléchargement. Compléter aussi les champs surlignés des pages de mentions légales.

URL de la politique de confidentialité à donner aux stores : https://occitangames.com/confidentialite.html
