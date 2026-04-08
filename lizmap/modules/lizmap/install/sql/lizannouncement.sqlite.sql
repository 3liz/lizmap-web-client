CREATE TABLE IF NOT EXISTS "lizmap_announcement" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    "title" VARCHAR NOT NULL,
    "content" TEXT NOT NULL,
    "target_repository" VARCHAR,
    "target_project" VARCHAR,
    "target_groups" TEXT,
    "max_display_count" INTEGER DEFAULT 1,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "is_active" INTEGER DEFAULT 1);

CREATE TABLE IF NOT EXISTS "lizmap_announcement_views" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    "announcement_id" INTEGER NOT NULL REFERENCES "lizmap_announcement"("id") ON DELETE CASCADE,
    "usr_login" VARCHAR NOT NULL,
    "view_count" INTEGER DEFAULT 0,
    "last_viewed_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("announcement_id", "usr_login"));
