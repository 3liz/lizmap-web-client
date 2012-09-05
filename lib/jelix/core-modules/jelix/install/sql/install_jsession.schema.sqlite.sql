
CREATE TABLE IF NOT EXISTS %%PREFIX%%jsessions (
  id varchar(64) NOT NULL,
  creation datetime NOT NULL,
  access datetime NOT NULL,
  data blob NOT NULL,
  PRIMARY KEY  (id)
);