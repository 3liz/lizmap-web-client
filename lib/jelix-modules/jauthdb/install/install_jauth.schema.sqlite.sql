CREATE TABLE %%PREFIX%%jlx_user (
  usr_login varchar(50) NOT NULL DEFAULT '',
  usr_password varchar(120) NOT NULL DEFAULT '',
  usr_email varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY  (usr_login)
);
