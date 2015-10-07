CREATE TABLE public.geobookmark(
  id serial,
  usr_login text NOT NULL,
  bname text NOT NULL,
  bmap text NOT NULL,
  bparams text NOT NULL
);

ALTER TABLE public.geobookmark ADD PRIMARY KEY (id);

ALTER TABLE public.geobookmark
ADD CONSTRAINT geobookmark_usr_login_fkey FOREIGN KEY (usr_login)
REFERENCES jlx_user (usr_login) MATCH SIMPLE
ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX ON public.geobookmark( usr_login );
