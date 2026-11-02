-- Quizzle 1.3 : schema initial (voir la spec "serveur, amis, groupes et pseudos").
-- Aucune donnee personnelle : ni e-mail, ni nom, ni identifiant publicitaire.

CREATE TABLE joueurs (
  id TEXT PRIMARY KEY,                       -- identifiant aleatoire
  secret_hash TEXT NOT NULL,                 -- empreinte SHA-256 du secret conserve sur l'appareil
  code_ami TEXT NOT NULL UNIQUE,             -- code de 8 caracteres pour s'ajouter entre amis
  pseudo TEXT,                               -- pseudo propose (visible de son auteur seulement tant qu'il n'est pas approuve)
  pseudo_cle TEXT UNIQUE,                    -- pseudo normalise (minuscules, sans accents ni espaces) pour l'unicite
  statut TEXT NOT NULL DEFAULT 'attente' CHECK (statut IN ('attente', 'approuve', 'refuse', 'banni')),
  dernier_changement_pseudo TEXT,
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  derniere_activite TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_joueurs_statut ON joueurs (statut);

CREATE TABLE resultats (
  joueur_id TEXT NOT NULL REFERENCES joueurs (id),
  jour TEXT NOT NULL,                        -- AAAA-MM-JJ, fuseau Europe/Paris
  essais INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 6),
  temps_ms INTEGER,
  envoye_le TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (joueur_id, jour)
);
CREATE INDEX idx_resultats_jour ON resultats (jour);

CREATE TABLE signalements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  joueur_signale TEXT NOT NULL,
  joueur_signalant TEXT NOT NULL,
  motif TEXT,
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  traite INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE blocages (
  joueur_id TEXT NOT NULL,
  joueur_bloque TEXT NOT NULL,
  PRIMARY KEY (joueur_id, joueur_bloque)
);

CREATE TABLE amities (
  joueur_a TEXT NOT NULL,                    -- celui qui demande
  joueur_b TEXT NOT NULL,                    -- celui qui accepte
  statut TEXT NOT NULL DEFAULT 'demande' CHECK (statut IN ('demande', 'acceptee')),
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (joueur_a, joueur_b)
);

CREATE TABLE groupes (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,                 -- code d'invitation de 6 caracteres
  createur TEXT,
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE membres (
  groupe_id TEXT NOT NULL,
  joueur_id TEXT NOT NULL,
  rejoint_le TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (groupe_id, joueur_id)
);
CREATE INDEX idx_membres_joueur ON membres (joueur_id);

CREATE TABLE defis (
  id TEXT PRIMARY KEY,
  de_joueur TEXT NOT NULL,
  a_joueur TEXT NOT NULL,
  mystere_id TEXT NOT NULL,
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  expire_le TEXT NOT NULL
);

CREATE TABLE reactions (
  de_joueur TEXT NOT NULL,
  joueur_cible TEXT NOT NULL,
  jour TEXT NOT NULL,
  emoji TEXT NOT NULL,
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (de_joueur, joueur_cible, jour)
);

CREATE TABLE mots_interdits (
  mot TEXT PRIMARY KEY                       -- en minuscules, sans accents
);
