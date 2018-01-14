
CREATE TABLE IF NOT EXISTS %%PREFIX%%jacl2_group (
    id_aclgrp varchar(50),
    name varchar(150) NOT NULL,
    grouptype int(5) NOT NULL DEFAULT '0',
    ownerlogin varchar(50),
    PRIMARY KEY (id_aclgrp)
);

CREATE TABLE IF NOT EXISTS %%PREFIX%%jacl2_subject (
  id_aclsbj varchar(100) NOT NULL,
  label_key varchar(100) DEFAULT NULL,
  id_aclsbjgrp VARCHAR( 50 ) DEFAULT NULL,
  PRIMARY KEY (id_aclsbj)
) ;

CREATE TABLE IF NOT EXISTS %%PREFIX%%jacl2_user_group (
  login varchar(50) NOT NULL,
  id_aclgrp varchar(50) NOT NULL,
  PRIMARY KEY (login, id_aclgrp)
) ;

CREATE TABLE IF NOT EXISTS %%PREFIX%%jacl2_rights (
  id_aclsbj varchar(100) NOT NULL,
  id_aclgrp varchar(50) NOT NULL,
  id_aclres varchar(100) NOT NULL DEFAULT '-',
  canceled integer NOT NULL default 0,
  PRIMARY KEY (id_aclsbj,id_aclgrp,id_aclres)
) ;

CREATE TABLE IF NOT EXISTS %%PREFIX%%jacl2_subject_group (
    id_aclsbjgrp VARCHAR( 50 ) NOT NULL,
    label_key VARCHAR( 60 ) NOT NULL,
    PRIMARY KEY (id_aclsbjgrp)
);
