-- Rights
INSERT INTO lizmap.jacl2_rights
VALUES
-- ...without being logged in first (anonymous group)
('lizmap.repositories.view', '__anonymous', 'presentations', 0),
('lizmap.tools.displayGetCapabilitiesLinks', '__anonymous', 'presentations', 0),
('lizmap.tools.edition.use', '__anonymous', 'presentations', 0),
('lizmap.tools.layer.export', '__anonymous', 'presentations', 0),
-- ...for users in admins group
('lizmap.repositories.view', 'admins', 'presentations', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'admins', 'presentations', 0),
('lizmap.tools.edition.use', 'admins', 'presentations', 0),
('lizmap.tools.layer.export', 'admins', 'presentations', 0),
('lizmap.tools.loginFilteredLayers.override', 'admins', 'presentations', 0),
-- ...for users in publishers group
('lizmap.repositories.view', 'publishers', 'presentations', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'publishers', 'presentations', 0),
('lizmap.tools.edition.use', 'publishers', 'presentations', 0),
('lizmap.tools.layer.export', 'publishers', 'presentations', 0),
('lizmap.tools.loginFilteredLayers.override', 'publishers', 'presentations', 0),
-- ...for users in group_a group
('lizmap.repositories.view', 'group_a', 'presentations', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'group_a', 'presentations', 0),
('lizmap.tools.edition.use', 'group_a', 'presentations', 0),
('lizmap.tools.layer.export', 'group_a', 'presentations', 0),
-- ...for users in group_b group
('lizmap.repositories.view', 'group_b', 'presentations', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'group_b', 'presentations', 0),
('lizmap.tools.edition.use', 'group_b', 'presentations', 0),
('lizmap.tools.layer.export', 'group_b', 'presentations', 0)
ON CONFLICT DO NOTHING
;
