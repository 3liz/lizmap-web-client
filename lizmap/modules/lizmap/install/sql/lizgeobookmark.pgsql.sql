CREATE TABLE geobookmark(
  id serial,
  usr_login text NOT NULL,
  bname text NOT NULL,
  bmap text NOT NULL,
  bparams text NOT NULL
);
ALTER TABLE geobookmark ADD PRIMARY KEY (id);
ALTER TABLE geobookmark
ADD CONSTRAINT geobookmark_usr_login_fkey FOREIGN KEY (usr_login)
REFERENCES jlx_user (id_aclgrp) MATCH SIMPLE
ON UPDATE CASCADE ON DELETE CASCADE;
CREATE INDEX ON geobookmark( usr_login );
