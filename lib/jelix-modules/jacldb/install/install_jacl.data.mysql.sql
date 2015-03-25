--

INSERT INTO `%%PREFIX%%jacl_group` VALUES (1, 'administrateur', 0, NULL);
INSERT INTO `%%PREFIX%%jacl_group` VALUES (2, 'utilisateurs', 1, NULL);

--

INSERT INTO `%%PREFIX%%jacl_right_values_group` VALUES (1, 'jacldb~acldb.valgrp.truefalse', 1);
INSERT INTO `%%PREFIX%%jacl_right_values_group` VALUES (2, 'jacldb~acldb.valgrp.crudl',0);
INSERT INTO `%%PREFIX%%jacl_right_values_group` VALUES (3, 'jacldb~acldb.valgrp.yesno',1);
INSERT INTO `%%PREFIX%%jacl_right_values_group` VALUES (4, 'jacldb~acldb.valgrp.groups',0);
INSERT INTO `%%PREFIX%%jacl_right_values_group` VALUES (5, 'jacldb~acldb.valgrp.users',0);

--
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('FALSE', 'jacldb~acldb.valgrp.truefalse.false', 1);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('TRUE',  'jacldb~acldb.valgrp.truefalse.true', 1);

INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('LIST',   'jacldb~acldb.valgrp.crudl.list', 2);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('CREATE', 'jacldb~acldb.valgrp.crudl.create', 2);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('READ',   'jacldb~acldb.valgrp.crudl.read', 2);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('UPDATE', 'jacldb~acldb.valgrp.crudl.update', 2);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('DELETE', 'jacldb~acldb.valgrp.crudl.delete', 2);

INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('NO',  'jacldb~acldb.valgrp.yesno.no', 3);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('YES', 'jacldb~acldb.valgrp.yesno.yes', 3);

INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('LIST',   'jacldb~acldb.valgrp.groups.list', 4);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('CREATE', 'jacldb~acldb.valgrp.groups.create', 4);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('RENAME', 'jacldb~acldb.valgrp.groups.rename', 4);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('DELETE', 'jacldb~acldb.valgrp.groups.delete', 4);

INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('LIST',    'jacldb~acldb.valgrp.users.list', 5);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('DETAILS', 'jacldb~acldb.valgrp.users.details', 5);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('UPDATE',  'jacldb~acldb.valgrp.users.update', 5);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('CREATE',  'jacldb~acldb.valgrp.users.create', 5);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('DELETE',  'jacldb~acldb.valgrp.users.delete', 5);
INSERT INTO `%%PREFIX%%jacl_right_values` VALUES ('CHANGE_PASSWORD', 'jacldb~acldb.valgrp.users.password', 5);

--
INSERT INTO `%%PREFIX%%jacl_subject` VALUES ('jauth.users.management', 5, 'jacldb~acldb.sbj.users.management');
INSERT INTO `%%PREFIX%%jacl_subject` VALUES ('jacldb.groups.management', 4, 'jacldb~acldb.sbj.groups.management');
