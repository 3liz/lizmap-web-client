ALTER TABLE %%PREFIX%%jacl2_rights DROP CONSTRAINT %%PREFIX%%jacl2_rights_id_aclsbj_id_aclgrp_id_aclres_pk;
ALTER TABLE %%PREFIX%%jacl2_rights ALTER COLUMN id_aclres SET DEFAULT '-';
UPDATE %%PREFIX%%jacl2_rights SET id_aclres='-' WHERE id_aclres='' OR id_aclres IS NULL;
ALTER TABLE %%PREFIX%%jacl2_rights ADD CONSTRAINT %%PREFIX%%jacl2_rights_id_aclsbj_id_aclgrp_id_aclres_pk PRIMARY KEY ( id_aclsbj , id_aclgrp , id_aclres);
