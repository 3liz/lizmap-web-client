
INSERT INTO %%PREFIX%%jacl2_group (id_aclgrp, name, grouptype, ownerlogin) VALUES ('__priv_admin', 'admin', 2, 'admin');
INSERT INTO %%PREFIX%%jacl2_user_group (login, id_aclgrp) VALUES ('admin', '__priv_admin');
INSERT INTO %%PREFIX%%jacl2_user_group (login, id_aclgrp) VALUES ('admin', 'admins');

