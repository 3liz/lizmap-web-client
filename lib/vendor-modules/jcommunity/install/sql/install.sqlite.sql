CREATE TABLE IF NOT EXISTS %%PREFIX%%community_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login varchar(50) NOT NULL UNIQUE,
  password varchar(120) NOT NULL,
  email varchar(255) NOT NULL,
  nickname varchar(50) DEFAULT NULL,
  status tinyint(4) NOT NULL default '0',
  keyactivate varchar(10) DEFAULT NULL,
  request_date datetime DEFAULT NULL,
  create_date datetime DEFAULT NULL
);

