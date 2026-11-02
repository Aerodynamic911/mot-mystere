CREATE TABLE joueurs (
  id TEXT PRIMARY KEY,
  secret_hash TEXT NOT NULL,
  code_ami TEXT NOT NULL UNIQUE,
  pseudo TEXT,
  pseudo_cle TEXT UNIQUE,
  statut TEXT NOT NULL DEFAULT 'attente' CHECK (statut IN ('attente', 'approuve', 'refuse', 'banni')),
  dernier_changement_pseudo TEXT,
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  derniere_activite TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_joueurs_statut ON joueurs (statut);
CREATE TABLE resultats (
  joueur_id TEXT NOT NULL REFERENCES joueurs (id),
  jour TEXT NOT NULL,
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
  joueur_a TEXT NOT NULL,
  joueur_b TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'demande' CHECK (statut IN ('demande', 'acceptee')),
  cree_le TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (joueur_a, joueur_b)
);
CREATE TABLE groupes (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
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
  mot TEXT PRIMARY KEY
);
