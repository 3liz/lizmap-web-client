


CREATE TEMPORARY TABLE jacl2_group_tmp(
    id_aclgrp varchar(50) PRIMARY KEY,
    name varchar(150) NOT NULL DEFAULT '',
    grouptype int(5) NOT NULL DEFAULT '0',
    ownerlogin varchar(50),
    PRIMARY KEY (id_aclgrp)
);
INSERT INTO jacl2_group_tmp SELECT code, name, grouptype, ownerlogin FROM %%PREFIX%%jacl2_group;
DROP TABLE %%PREFIX%%jacl2_group;
CREATE TABLE %%PREFIX%%jacl2_group(
    id_aclgrp varchar(50) PRIMARY KEY,
    name varchar(150) NOT NULL DEFAULT '',
    grouptype int(5) NOT NULL DEFAULT '0',
    ownerlogin varchar(50),
    PRIMARY KEY (id_aclgrp)
);
INSERT INTO %%PREFIX%%jacl2_group SELECT id_aclgrp, name, grouptype, ownerlogin FROM jacl2_group_tmp;
DROP TABLE jacl2_group_tmp;



CREATE TEMPORARY TABLE jacl2_user_group_tmp(
  login varchar(50) NOT NULL,
  id_aclgrp varchar(50) NOT NULL,
  PRIMARY KEY (login, id_aclgrp)
);
INSERT INTO jacl2_user_group_tmp SELECT login, code_grp FROM %%PREFIX%%jacl2_user_group;
DROP TABLE %%PREFIX%%jacl2_user_group;
CREATE TABLE %%PREFIX%%jacl2_user_group(
  login varchar(50) NOT NULL,
  id_aclgrp varchar(50) NOT NULL,
  PRIMARY KEY (login, id_aclgrp)
);
INSERT INTO %%PREFIX%%jacl2_user_group SELECT login, id_aclgrp FROM jacl2_user_group_tmp;
DROP TABLE jacl2_user_group_tmp;



CREATE TEMPORARY TABLE jacl2_rights_tmp(
  id_aclsbj varchar(100) NOT NULL,
  id_aclgrp varchar(50) NOT NULL,
  id_aclres varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (id_aclsbj,id_aclgrp,id_aclres)
);
INSERT INTO jacl2_rights_tmp SELECT id_aclsbj, code_grp, id_aclres FROM %%PREFIX%%jacl2_rights;
DROP TABLE %%PREFIX%%jacl2_rights;
CREATE TABLE %%PREFIX%%jacl2_rights(
  id_aclsbj varchar(100) NOT NULL,
  id_aclgrp varchar(50) NOT NULL,
  id_aclres varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (id_aclsbj,id_aclgrp,id_aclres)
);
INSERT INTO %%PREFIX%%jacl2_rights SELECT id_aclsbj, id_aclgrp, id_aclres FROM jacl2_rights_tmp;
DROP TABLE jacl2_rights_tmp;

