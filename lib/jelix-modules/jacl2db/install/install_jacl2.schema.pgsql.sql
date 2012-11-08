--
-- PostgreSQL database dump
--

DROP TABLE IF EXISTS %%PREFIX%%jacl2_rights;
DROP TABLE IF EXISTS %%PREFIX%%jacl2_user_group;
DROP TABLE IF EXISTS %%PREFIX%%jacl2_group;
DROP TABLE IF EXISTS %%PREFIX%%jacl2_subject_group;
DROP TABLE IF EXISTS %%PREFIX%%jacl2_subject;

CREATE TABLE %%PREFIX%%jacl2_group (
    id_aclgrp character varying(50) NOT NULL,
    name character varying(150) NOT NULL DEFAULT '',
    grouptype smallint NOT NULL,
    ownerlogin character varying(50),
    CONSTRAINT %%PREFIX%%jacl2_group_id_aclgrp_pk PRIMARY KEY (id_aclgrp)
);
-- SELECT pg_catalog.setval(pg_catalog.pg_get_serial_sequence('%%PREFIX%%jacl2_group', 'id_aclgrp'), 1, false);

CREATE TABLE %%PREFIX%%jacl2_rights (
    id_aclsbj character varying(255) NOT NULL,
    id_aclgrp character varying(50) NOT NULL,
    id_aclres character varying(100) NOT NULL DEFAULT '-',
    canceled smallint NOT NULL default '0',
    CONSTRAINT %%PREFIX%%jacl2_rights_id_aclsbj_id_aclgrp_id_aclres_pk PRIMARY KEY (id_aclsbj, id_aclgrp, id_aclres)
);

CREATE TABLE %%PREFIX%%jacl2_subject (
    id_aclsbj character varying(100) NOT NULL,
    label_key character varying(100) DEFAULT NULL,
    id_aclsbjgrp character varying( 50 ) DEFAULT NULL,
    CONSTRAINT %%PREFIX%%jacl2_subject_id_aclsbj_pk PRIMARY KEY (id_aclsbj)
);

CREATE TABLE %%PREFIX%%jacl2_user_group (
    "login" character varying(50) NOT NULL,
    id_aclgrp character varying(50) NOT NULL,
    CONSTRAINT %%PREFIX%%jacl2_user_group_login_pk PRIMARY KEY ("login", id_aclgrp)
);


CREATE TABLE %%PREFIX%%jacl2_subject_group (
id_aclsbjgrp character varying( 50 ) NOT NULL ,
label_key character varying( 60 ) NOT NULL ,
CONSTRAINT %%PREFIX%%jacl2_subject_group_id_aclsbjgrp_pk PRIMARY KEY (id_aclsbjgrp)
);


ALTER TABLE ONLY %%PREFIX%%jacl2_rights
    ADD CONSTRAINT %%PREFIX%%jacl2_rights_id_aclgrp_fkey FOREIGN KEY (id_aclgrp) REFERENCES %%PREFIX%%jacl2_group(id_aclgrp);

ALTER TABLE ONLY %%PREFIX%%jacl2_rights
    ADD CONSTRAINT %%PREFIX%%jacl2_rights_id_aclsbj_fkey FOREIGN KEY (id_aclsbj) REFERENCES %%PREFIX%%jacl2_subject(id_aclsbj);

ALTER TABLE ONLY %%PREFIX%%jacl2_user_group
    ADD CONSTRAINT %%PREFIX%%jacl2_user_group_id_aclgrp_fkey FOREIGN KEY (id_aclgrp) REFERENCES %%PREFIX%%jacl2_group(id_aclgrp);

ALTER TABLE ONLY %%PREFIX%%jacl2_subject
    ADD CONSTRAINT %%PREFIX%%jacl2_subject_id_aclsbjgrp_fkey FOREIGN KEY (id_aclsbjgrp) REFERENCES %%PREFIX%%jacl2_subject_group(id_aclsbjgrp);
