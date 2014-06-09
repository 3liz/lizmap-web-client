-- Add a new subject 'lizmap.tools.displayGetCapabilitiesLinks' inside the lizmap.grp
INSERT INTO jacl2_subject (id_aclsbj, label_key, id_aclsbjgrp) VALUES ('lizmap.tools.displayGetCapabilitiesLinks', 'admin~jacl2.lizmap.tools.displayGetCapabilitiesLinks', 'lizmap.grp');

-- Add rights for the new 'lizmap.tools.displayGetCapabilitiesLinks' option : copy/paste the rights of 'lizmap.repositories.view' subject.
INSERT INTO jacl2_rights (id_aclsbj, id_aclgrp, id_aclres, canceled) SELECT 'lizmap.tools.displayGetCapabilitiesLinks', id_aclgrp, id_aclres, canceled FROM jacl2_rights WHERE id_aclsbj = 'lizmap.repositories.view';
