ALTER TABLE %%PREFIX%%jacl2_user_group DROP CONSTRAINT %%PREFIX%%jacl2_group_id_aclgrp_pk;
ALTER TABLE %%PREFIX%%jacl2_user_group DROP id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_user_group RENAME code_grp TO id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_user_group ADD CONSTRAINT %%PREFIX%%jacl2_user_group_login_pk PRIMARY KEY ("login", id_aclgrp);

ALTER TABLE %%PREFIX%%jacl2_rights DROP CONSTRAINT %%PREFIX%%jacl2_rights_id_aclsbj_id_aclgrp_id_aclres_pk;
ALTER TABLE %%PREFIX%%jacl2_rights DROP id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_rights RENAME code_grp TO id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_rights ADD CONSTRAINT %%PREFIX%%jacl2_rights_id_aclsbj_id_aclgrp_id_aclres_pk PRIMARY KEY (id_aclsbj, id_aclgrp, id_aclres)

ALTER TABLE %%PREFIX%%jacl2_group DROP CONSTRAINT %%PREFIX%%jacl2_group_id_aclgrp_pk;
ALTER TABLE %%PREFIX%%jacl2_group DROP id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_group RENAME code TO id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_group ADD CONSTRAINT %%PREFIX%%jacl2_group_id_aclgrp_pk PRIMARY KEY(id_aclgrp);
