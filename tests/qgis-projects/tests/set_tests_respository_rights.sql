-- This script adds rights to test Lizmap projects without being logged in first (anonymous group)
INSERT INTO lizmap.jacl2_rights 
VALUES ('lizmap.repositories.view', '__anonymous', 'testsrepository', 0),
('lizmap.tools.displayGetCapabilitiesLinks', '__anonymous', 'testsrepository', 0),
('lizmap.tools.edition.use', '__anonymous', 'testsrepository', 0),
('lizmap.tools.layer.export', '__anonymous', 'testsrepository', 0);
