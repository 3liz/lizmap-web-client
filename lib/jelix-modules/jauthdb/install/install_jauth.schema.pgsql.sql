CREATE TABLE IF NOT EXISTS %%PREFIX%%jlx_user (
  usr_login character varying(50) NOT NULL DEFAULT '',
  usr_password character varying(120) NOT NULL DEFAULT '',
  usr_email character varying(255) NOT NULL DEFAULT '',
  CONSTRAINT jlx_user_pkey PRIMARY KEY (usr_login)
);
