ALTER TABLE %%PREFIX%%jacl2_user_group DROP INDEX login;
ALTER TABLE %%PREFIX%%jacl2_user_group DROP id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_user_group CHANGE code_grp id_aclgrp VARCHAR(50) NOT NULL;
ALTER TABLE %%PREFIX%%jacl2_user_group ADD PRIMARY KEY (login, id_aclgrp);

ALTER TABLE %%PREFIX%%jacl2_rights DROP PRIMARY KEY;
ALTER TABLE %%PREFIX%%jacl2_rights DROP id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_rights CHANGE code_grp id_aclgrp VARCHAR(50) NOT NULL;
ALTER TABLE %%PREFIX%%jacl2_rights ADD PRIMARY KEY(id_aclsbj, id_aclgrp, id_aclres);

ALTER TABLE %%PREFIX%%jacl2_group DROP id_aclgrp;
ALTER TABLE %%PREFIX%%jacl2_group CHANGE code id_aclgrp VARCHAR(50) NOT NULL;
ALTER TABLE %%PREFIX%%jacl2_group ADD PRIMARY KEY(id_aclgrp);
