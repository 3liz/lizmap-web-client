ALTER TABLE %%PREFIX%%jacl2_group CHANGE COLUMN id_aclgrp id_aclgrp varchar(60) NOT NULL;
ALTER TABLE %%PREFIX%%jacl2_user_group CHANGE COLUMN id_aclgrp id_aclgrp varchar(60) NOT NULL;
ALTER TABLE %%PREFIX%%jacl2_rights CHANGE COLUMN id_aclgrp id_aclgrp varchar(60) NOT NULL;
