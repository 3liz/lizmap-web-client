--

INSERT INTO %%PREFIX%%jacl_group (id_aclgrp, name, grouptype, ownerlogin) VALUES (1, 'administrateur', 0, NULL);
INSERT INTO %%PREFIX%%jacl_group (id_aclgrp, name, grouptype, ownerlogin) VALUES (2, 'utilisateurs', 1, NULL);

--

INSERT INTO %%PREFIX%%jacl_right_values_group (id_aclvalgrp, label_key,type_aclvalgrp) VALUES (1, 'jelix~acldb.valgrp.truefalse', 1);
INSERT INTO %%PREFIX%%jacl_right_values_group (id_aclvalgrp, label_key,type_aclvalgrp) VALUES (2, 'jelix~acldb.valgrp.crudl',0);
INSERT INTO %%PREFIX%%jacl_right_values_group (id_aclvalgrp, label_key,type_aclvalgrp) VALUES (3, 'jelix~acldb.valgrp.yesno',1);
INSERT INTO %%PREFIX%%jacl_right_values_group (id_aclvalgrp, label_key,type_aclvalgrp) VALUES (4, 'jelix~acldb.valgrp.groups',0);
INSERT INTO %%PREFIX%%jacl_right_values_group (id_aclvalgrp, label_key,type_aclvalgrp) VALUES (5, 'jelix~acldb.valgrp.users',0);

--
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('FALSE', 'jelix~acldb.valgrp.truefalse.false', 1);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('TRUE',  'jelix~acldb.valgrp.truefalse.true', 1);

INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('LIST',   'jelix~acldb.valgrp.crudl.list', 2);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('CREATE', 'jelix~acldb.valgrp.crudl.create', 2);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('READ',   'jelix~acldb.valgrp.crudl.read', 2);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('UPDATE', 'jelix~acldb.valgrp.crudl.update', 2);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('DELETE', 'jelix~acldb.valgrp.crudl.delete', 2);

INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('NO',  'jelix~acldb.valgrp.yesno.no', 3);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('YES', 'jelix~acldb.valgrp.yesno.yes', 3);

INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('LIST',   'jelix~acldb.valgrp.groups.list', 4);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('CREATE', 'jelix~acldb.valgrp.groups.create', 4);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('RENAME', 'jelix~acldb.valgrp.groups.rename', 4);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('DELETE', 'jelix~acldb.valgrp.groups.delete', 4);

INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('LIST',    'jelix~acldb.valgrp.users.list', 5);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('DETAILS', 'jelix~acldb.valgrp.users.details', 5);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('UPDATE',  'jelix~acldb.valgrp.users.update', 5);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('CREATE',  'jelix~acldb.valgrp.users.create', 5);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('DELETE',  'jelix~acldb.valgrp.users.delete', 5);
INSERT INTO %%PREFIX%%jacl_right_values (value, label_key, id_aclvalgrp) VALUES ('CHANGE_PASSWORD', 'jelix~acldb.valgrp.users.password', 5);

--
INSERT INTO %%PREFIX%%jacl_subject VALUES ('jauth.users.management', 5, 'jelix~acldb.sbj.users.management');
INSERT INTO %%PREFIX%%jacl_subject VALUES ('jacldb.groups.management', 4, 'jelix~acldb.sbj.groups.management');
