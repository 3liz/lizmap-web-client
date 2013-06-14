-- Add a new subject 'lizmap.tools.loginFilteredLayers.override' inside the lizmap.grp
INSERT INTO jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('lizmap.tools.loginFilteredLayers.override', 'admin~jacl2.lizmap.tools.loginFilteredLayers.override', 'lizmap.grp');

-- Add rights for the new 'lizmap.tools.loginFilteredLayers.override' option : copy/paste the rights of 'lizmap.tools.edition.use' subject.
INSERT INTO jacl2_rights (id_aclsbj, id_aclgrp, id_aclres, canceled) SELECT 'lizmap.tools.loginFilteredLayers.override', id_aclgrp, id_aclres, canceled FROM jacl2_rights WHERE id_aclsbj = 'lizmap.tools.edition.use';
