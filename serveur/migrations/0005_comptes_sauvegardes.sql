CREATE TABLE comptes_lies (fournisseur TEXT NOT NULL CHECK (fournisseur IN ('apple', 'google')), sujet TEXT NOT NULL, joueur_id TEXT NOT NULL, lie_le TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (fournisseur, sujet));
CREATE INDEX idx_comptes_joueur ON comptes_lies (joueur_id);
CREATE TABLE sauvegardes (joueur_id TEXT PRIMARY KEY, donnees TEXT NOT NULL, mis_a_jour TEXT NOT NULL DEFAULT (datetime('now')));
