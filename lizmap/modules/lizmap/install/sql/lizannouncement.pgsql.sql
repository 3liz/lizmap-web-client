CREATE TABLE IF NOT EXISTS lizmap_announcement (
    id SERIAL PRIMARY KEY,
    title character varying(255) NOT NULL,
    content TEXT NOT NULL,
    target_repository character varying(100),
    target_project character varying(100),
    target_groups TEXT,
    max_display_count INTEGER DEFAULT 1,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS lizmap_announcement_views (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER NOT NULL REFERENCES lizmap_announcement(id) ON DELETE CASCADE,
    usr_login character varying(100) NOT NULL,
    view_count INTEGER DEFAULT 0,
    last_viewed_at timestamp DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, usr_login)
);
