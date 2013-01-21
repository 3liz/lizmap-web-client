-- Add a new subject 'lizmap.tools.annotation.use' inside the lizmap.grp
INSERT INTO jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('lizmap.tools.annotation.use', 'admin~jacl2.lizmap.tools.annotation.use', 'lizmap.grp');

-- Add rights for the new 'lizmap.tools.annotation.use' option : copy/paste the rights of 'lizmap.repositories.view' subject.
INSERT INTO jacl2_rights (id_aclsbj, id_aclgrp, id_aclres, canceled) SELECT 'lizmap.tools.annotation.use', id_aclgrp, id_aclres, canceled FROM jacl2_rights WHERE id_aclsbj = 'lizmap.repositories.view';
