CREATE TABLE IF NOT EXISTS permalink(
  id VARCHAR(12) PRIMARY KEY,
  url_parameters text NOT NULL,
  repository text NOT NULL,
  project text NOT NULL
);
