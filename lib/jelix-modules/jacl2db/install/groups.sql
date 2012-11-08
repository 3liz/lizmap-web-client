INSERT INTO %%PREFIX%%jacl2_group (id_aclgrp, name, grouptype, ownerlogin) VALUES ('__anonymous', 'anonymous', 0, NULL);
INSERT INTO %%PREFIX%%jacl2_group (id_aclgrp, name, grouptype, ownerlogin) VALUES ('admins', 'admins', 0, NULL);
INSERT INTO %%PREFIX%%jacl2_group (id_aclgrp, name, grouptype, ownerlogin) VALUES ('users', 'users', 1, NULL);

INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('acl.group.modify', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('acl.group.create', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('acl.group.delete', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('acl.group.view', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('acl.user.modify', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('acl.user.view', 'admins', '-');

INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.users.list', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.users.view', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.users.modify', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.users.create', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.users.delete', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.users.change.password', 'admins', '-');

INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.user.view', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.user.modify', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.user.change.password', 'admins', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.user.view', 'users', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.user.modify', 'users', '-');
INSERT INTO %%PREFIX%%jacl2_rights (id_aclsbj, id_aclgrp, id_aclres) VALUES ('auth.user.change.password', 'users', '-');
