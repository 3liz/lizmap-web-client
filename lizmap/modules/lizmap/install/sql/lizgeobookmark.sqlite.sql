CREATE TABLE geobookmark(
  id integer PRIMARY KEY AUTOINCREMENT,
  usr_login text NOT NULL,
  bname text NOT NULL,
  bparams text NOT NULL,
  FOREIGN KEY (usr_login) REFERENCES jlx_user (id_aclgrp)
);
CREATE INDEX idx_geobookmark_usr_login ON geobookmark( usr_login );
