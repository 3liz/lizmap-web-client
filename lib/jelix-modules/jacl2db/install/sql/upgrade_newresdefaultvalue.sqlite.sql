
CREATE TEMPORARY TABLE %%PREFIX%%jacl2_rights_tmp(
    "id_aclsbj" VARCHAR(100) NOT NULL,
    "id_aclgrp" VARCHAR(50) NOT NULL,
    "id_aclres" VARCHAR(100) NOT NULL DEFAULT ('-'),
    "canceled" INTEGER NOT NULL DEFAULT (0)
);
INSERT INTO %%PREFIX%%jacl2_rights_tmp (id_aclsbj, id_aclgrp, id_aclres, canceled)
SELECT id_aclsbj, id_aclgrp, id_aclres, canceled FROM %%PREFIX%%jacl2_rights
WHERE id_aclres IS NOT NULL AND id_aclres <> '';
INSERT INTO %%PREFIX%%jacl2_rights_tmp (id_aclsbj, id_aclgrp, id_aclres, canceled)
SELECT id_aclsbj, id_aclgrp, '-', canceled FROM %%PREFIX%%jacl2_rights
WHERE id_aclres IS NULL OR id_aclres = '';

DROP TABLE %%PREFIX%%jacl2_rights;
CREATE TABLE %%PREFIX%%jacl2_rights(
    "id_aclsbj" VARCHAR(100) NOT NULL,
    "id_aclgrp" VARCHAR(50) NOT NULL,
    "id_aclres" VARCHAR(100) NOT NULL DEFAULT ('-'),
    "canceled" INTEGER NOT NULL DEFAULT (0),
    PRIMARY KEY (id_aclsbj, id_aclgrp, id_aclres)
);

INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres, canceled)
SELECT id_aclsbj, id_aclgrp, id_aclres, canceled FROM %%PREFIX%%jacl2_rights_tmp;
DROP TABLE %%PREFIX%%jacl2_rights_tmp;


CREATE TEMPORARY TABLE %%PREFIX%%jacl2_subject_tmp (
  id_aclsbj varchar(100) NOT NULL DEFAULT '',
  label_key varchar(100) DEFAULT NULL,
  id_aclsbjgrp VARCHAR( 50 ) DEFAULT NULL,
  PRIMARY KEY (id_aclsbj)
);
INSERT INTO %%PREFIX%%jacl2_subject_tmp (id_aclsbj, label_key, id_aclsbjgrp)
SELECT id_aclsbj, label_key, id_aclsbjgrp FROM %%PREFIX%%jacl2_subject;
DROP TABLE %%PREFIX%%jacl2_subject;
CREATE TABLE %%PREFIX%%jacl2_subject (
  id_aclsbj varchar(100) NOT NULL,
  label_key varchar(100) DEFAULT NULL,
  id_aclsbjgrp VARCHAR( 50 ) DEFAULT NULL,
  PRIMARY KEY (id_aclsbj)
);
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp)
SELECT id_aclsbj, label_key, id_aclsbjgrp FROM %%PREFIX%%jacl2_subject_tmp;
DROP TABLE %%PREFIX%%jacl2_subject_tmp;

