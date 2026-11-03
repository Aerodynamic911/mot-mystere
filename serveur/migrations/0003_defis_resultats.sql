ALTER TABLE defis ADD COLUMN essais_de INTEGER NOT NULL DEFAULT 0;
ALTER TABLE defis ADD COLUMN gagne_de INTEGER NOT NULL DEFAULT 0;
ALTER TABLE defis ADD COLUMN essais_a INTEGER;
ALTER TABLE defis ADD COLUMN gagne_a INTEGER;
CREATE INDEX idx_defis_a ON defis (a_joueur);
CREATE INDEX idx_defis_de ON defis (de_joueur);
