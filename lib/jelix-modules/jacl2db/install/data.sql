INSERT INTO %%PREFIX%%jacl2_subject_group (id_aclsbjgrp, label_key) VALUES ('acl.grp.user.management', 'jacl2db~acl2db.acl.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject_group (id_aclsbjgrp, label_key) VALUES ('acl.grp.group.management', 'jacl2db~acl2db.acl.grp.group.management');
INSERT INTO %%PREFIX%%jacl2_subject_group (id_aclsbjgrp, label_key) VALUES ('auth.grp.user.management', 'jelix~auth.acl.grp.user.management');

INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('acl.user.view', 'jacl2db~acl2db.acl.user.view', 'acl.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('acl.user.modify', 'jacl2db~acl2db.acl.user.modify', 'acl.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('acl.group.modify', 'jacl2db~acl2db.acl.group.modify', 'acl.grp.group.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('acl.group.create', 'jacl2db~acl2db.acl.group.create', 'acl.grp.group.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('acl.group.delete', 'jacl2db~acl2db.acl.group.delete', 'acl.grp.group.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('acl.group.view', 'jacl2db~acl2db.acl.group.view', 'acl.grp.group.management');

INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.users.list',   'jelix~auth.acl.users.list', 'auth.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.users.view',   'jelix~auth.acl.users.view', 'auth.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.users.modify', 'jelix~auth.acl.users.modify', 'auth.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.users.create', 'jelix~auth.acl.users.create', 'auth.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.users.delete', 'jelix~auth.acl.users.delete', 'auth.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.users.change.password', 'jelix~auth.acl.users.change.password', 'auth.grp.user.management');

INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.user.view',   'jelix~auth.acl.user.view', 'auth.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.user.modify', 'jelix~auth.acl.user.modify', 'auth.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('auth.user.change.password', 'jelix~auth.acl.user.change.password', 'auth.grp.user.management');
