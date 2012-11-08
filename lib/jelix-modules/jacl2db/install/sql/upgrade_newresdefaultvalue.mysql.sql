
ALTER TABLE %%PREFIX%%jacl2_rights DROP PRIMARY KEY;
ALTER TABLE %%PREFIX%%jacl2_rights CHANGE id_aclres id_aclres varchar(100) NOT NULL default '-';
UPDATE %%PREFIX%%jacl2_rights SET id_aclres='-' WHERE id_aclres='' OR id_aclres IS NULL;
ALTER TABLE %%PREFIX%%jacl2_rights ADD PRIMARY KEY ( `id_aclsbj` , `id_aclgrp` , `id_aclres`);

ALTER TABLE %%PREFIX%%jacl2_subject DROP PRIMARY KEY;
ALTER TABLE %%PREFIX%%jacl2_subject CHANGE id_aclsbj id_aclsbj varchar(100) NOT NULL;
ALTER TABLE %%PREFIX%%jacl2_subject ADD PRIMARY KEY ( `id_aclsbj`);


