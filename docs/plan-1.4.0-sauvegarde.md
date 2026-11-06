# Quizzle 1.4.0 : sauvegarde de la progression par compte Apple / Google

## Objectif
Un joueur qui change de téléphone retrouve sa progression (pièces, jokers, costumes, séries, aventure, événements, quêtes, collection, préférences) en se connectant avec son compte Apple (iPhone) ou Google (Android). Aucun compte n'est obligatoire pour jouer.

## Principe
- Le joueur a déjà un identifiant anonyme (id + secret) sur le serveur. On y **lie** son compte Apple/Google : le serveur ne garde que l'identifiant anonyme du fournisseur (`sub`), jamais l'e-mail ni le nom.
- L'appli envoie une copie des données de jeu (`PUT /v1/sauvegarde`, 64 Ko max) au démarrage et quand elle passe en arrière-plan (au plus toutes les 3 h).
- Sur un nouveau téléphone : « Restaurer ma progression » → connexion Apple/Google → `POST /v1/compte/restaurer`. Le serveur **change le secret** (l'ancien téléphone perd l'accès), renvoie l'identifiant du joueur, le nouveau secret et la sauvegarde. Amis, groupes et pseudo suivent car ils sont rattachés à l'identifiant du joueur.
- Suppression : « Supprimer ma sauvegarde et mes données en ligne » (Préférences) → `DELETE /v1/joueurs/moi`, qui efface aussi les liens et la sauvegarde. Exigé par Apple (5.1.1 v) et Google Play.

## Serveur (fait)
- Migration `0005_comptes_sauvegardes.sql` : tables `comptes_lies` et `sauvegardes`.
- `serveur/src/comptes.ts` : vérification des jetons (RS256, clés publiques Apple/Google, émetteur, destinataire, expiration), routes `POST /v1/compte/lier`, `GET /v1/compte`, `PUT /v1/sauvegarde`, `POST /v1/compte/restaurer`.
- Testé : 9 cas de jetons (valide, mauvaise audience/émetteur/signature, expiré, clé inconnue, sans sub, Apple), migration et upsert en D1 local.
- Variables à ajouter dans Cloudflare : `GOOGLE_CLIENT_ID` (client Web, voir ci-dessous). `APPLE_AUDIENCE` est facultatif (défaut `com.occitangames.quizzle`).

## Appli (fait, non testé sur téléphone)
- `src/game/sauvegarde.ts` (instantané, envoi, application), `src/game/compteLie.ts` (connexion Apple/Google, lier, restaurer), `src/screens/SauvegardeBloc.tsx` dans Préférences, rechargement des données après restauration, sauvegarde automatique.
- Dépendances : `expo-apple-authentication`, `@react-native-google-signin/google-signin` (modules natifs : un build est nécessaire pour tester).

## À fournir / configurer (Julien)
1. **Apple** : la capacité « Sign in with Apple » sur l'identifiant d'app `com.occitangames.quizzle` (EAS peut la synchroniser à la prochaine build iOS ; sinon à cocher dans le portail développeur).
2. **Google Cloud** (projet `quizzle-play`) : écran de consentement OAuth, puis 3 identifiants OAuth :
   - un client de type **Application Web** (son identifiant va dans `GOOGLE_WEB_CLIENT_ID` de `src/config.ts` et dans la variable Cloudflare `GOOGLE_CLIENT_ID`) ;
   - un client **Android** avec l'empreinte SHA-1 de la clé de signature Play (Play Console › Intégrité de l'appli › Signature d'application) ;
   - un client **Android** avec l'empreinte SHA-1 de la clé d'envoi EAS (`eas credentials`, ou la fiche Credentials sur expo.dev).
3. Coller la migration 0005 dans la console D1 (comme les précédentes).

## À faire avant l'envoi aux magasins
- Politique de confidentialité : ajouter la sauvegarde (identifiant anonyme du compte Apple/Google, données de jeu stockées sur le serveur, suppression possible).
- App Privacy (Apple) : « Identifiants » (ID utilisateur) liés au joueur, usage « fonctionnalités de l'appli », non utilisés pour le suivi. Google Play « Sécurité des données » : idem, plus le lien de suppression du compte.
- Rappel dans la progression : proposer la sauvegarde après quelques parties (bandeau sur l'accueil) ; écran « Nouveau téléphone ? » au premier lancement.
- Tests : iPhone et Android réels, restauration sur un deuxième appareil, annulation de la fenêtre de connexion, mode avion, compte Google/Apple déjà lié à une autre progression.

## Limites connues
- Pas de transfert iOS ↔ Android (comptes différents).
- Deux téléphones ne se synchronisent pas en continu : la dernière sauvegarde envoyée gagne.
- Un joueur qui ne lie jamais son compte ne peut rien récupérer.
