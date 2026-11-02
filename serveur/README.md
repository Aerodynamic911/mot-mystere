# Quizzle : serveur (Cloudflare Worker)

API de la version 1.3 : pseudos, amis, groupes, resultats.
Deploiement automatique par Cloudflare (Workers Builds) a chaque envoi sur la branche de production, repertoire racine `/serveur`.

- URL : https://api.occitangames.com
- Test : `GET /v1/sante` doit repondre `{"ok":true,...}`
- Local : `npm install` puis `npx wrangler dev`
