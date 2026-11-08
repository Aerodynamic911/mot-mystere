CREATE TABLE notifications_jetons (jeton TEXT PRIMARY KEY, joueur_id TEXT NOT NULL, langue TEXT NOT NULL DEFAULT 'fr', maj_le TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX idx_notifications_joueur ON notifications_jetons (joueur_id);
