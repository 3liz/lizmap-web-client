ALTER TABLE %%PREFIX%%jacl2_group ALTER code TYPE character varying(50) NOT NULL;
UPDATE %%PREFIX%%jacl2_group SET code = name WHERE (code = '' or code IS NULL);

UPDATE %%PREFIX%%jacl2_group SET code = ('__priv_' || code) WHERE grouptype = 2;

UPDATE %%PREFIX%%jacl2_group SET code = '__anonymous' WHERE id_aclgrp = 0;

ALTER TABLE %%PREFIX%%jacl2_user_group ADD code_grp varchar(50) NOT NULL;
ALTER TABLE %%PREFIX%%jacl2_rights ADD code_grp varchar(50) NOT NULL;
