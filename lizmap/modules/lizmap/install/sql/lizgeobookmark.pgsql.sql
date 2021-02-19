CREATE TABLE IF NOT EXISTS geobookmark(
  id serial PRIMARY KEY,
  usr_login text NOT NULL,
  bname text NOT NULL,
  bmap text NOT NULL,
  bparams text NOT NULL
);

DROP INDEX IF EXISTS geobookmark_usr_login_idx;
ALTER TABLE geobookmark
DROP CONSTRAINT IF EXISTS geobookmark_usr_login_fkey
;

ALTER TABLE geobookmark
ADD CONSTRAINT geobookmark_usr_login_fkey FOREIGN KEY (usr_login)
REFERENCES jlx_user (usr_login) MATCH SIMPLE
ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX geobookmark_usr_login_idx ON geobookmark( usr_login );
