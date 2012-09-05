INSERT INTO %%PREFIX%%jacl2_subject_group (id_aclsbjgrp, label_key) VALUES ('acl.grp.user.management', 'jelix~acl2db.acl.grp.user.management');
INSERT INTO %%PREFIX%%jacl2_subject_group (id_aclsbjgrp, label_key) VALUES ('acl.grp.group.management', 'jelix~acl2db.acl.grp.group.management');
INSERT INTO %%PREFIX%%jacl2_subject_group (id_aclsbjgrp, label_key) VALUES ('auth.grp.user.management', 'jelix~auth.acl.grp.user.management');

UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='acl.grp.user.management' WHERE id_aclsbj = 'acl.user.view';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='acl.grp.user.management'  WHERE id_aclsbj = 'acl.user.modify';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='acl.grp.group.management'  WHERE id_aclsbj = 'acl.group.modify';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='acl.grp.group.management'  WHERE id_aclsbj = 'acl.group.create';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='acl.grp.group.management'  WHERE id_aclsbj = 'acl.group.delete';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='acl.grp.group.management'  WHERE id_aclsbj = 'acl.group.view';

UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.users.list';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.users.view';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.users.modify';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.users.create';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.users.delete';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.users.change.password';

UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.user.view';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.user.modify';
UPDATE %%PREFIX%%jacl2_subject SET  id_aclsbjgrp='auth.grp.user.management' WHERE id_aclsbj = 'auth.user.change.password';
