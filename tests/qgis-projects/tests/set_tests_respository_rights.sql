-- This script adds rights to test Lizmap projects...
INSERT INTO lizmap.jacl2_rights 
VALUES 
-- ...without being logged in first (anonymous group)
('lizmap.repositories.view', '__anonymous', 'testsrepository', 0),
('lizmap.tools.displayGetCapabilitiesLinks', '__anonymous', 'testsrepository', 0),
('lizmap.tools.edition.use', '__anonymous', 'testsrepository', 0),
('lizmap.tools.layer.export', '__anonymous', 'testsrepository', 0),
-- ...for users in admins group
('lizmap.repositories.view', 'admins', 'testsrepository', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'admins', 'testsrepository', 0),
('lizmap.tools.edition.use', 'admins', 'testsrepository', 0),
('lizmap.tools.layer.export', 'admins', 'testsrepository', 0);
