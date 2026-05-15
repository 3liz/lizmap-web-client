CREATE TABLE IF NOT EXISTS permalink(
  id text PRIMARY KEY,
  url_parameters text NOT NULL,
  repository text NOT NULL,
  project text NOT NULL,
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_usage_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
