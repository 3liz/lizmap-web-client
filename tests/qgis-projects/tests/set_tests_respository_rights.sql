-- This script adds users, groups and rights to test Lizmap projects...

-- Groups
INSERT INTO lizmap.jacl2_group(
	id_aclgrp, name, grouptype, ownerlogin)
	VALUES ('group_a', 'group_a', 0, null),
    ('__priv_user_in_group_a', 'user_in_group_a', 2, 'user_in_group_a')
    ON CONFLICT DO NOTHING
    ;

-- Users
INSERT INTO lizmap.jlx_user(
	usr_login, usr_email, usr_password, status, create_date)
	VALUES ('user_in_group_a', 'user_in_group_a@nomail.nomail', '$2y$10$d2KZfxeYJP0l3YbNyDMZYe2vGSA3JWa8kFJSdecmSEIqInjnunTJ.', 1, NOW())
	ON CONFLICT DO NOTHING
	;

-- Users in Groups
INSERT INTO lizmap.jacl2_user_group(
	login, id_aclgrp)
	VALUES ('user_in_group_a', 'group_a'),
	('user_in_group_a', '__priv_user_in_group_a'),
	('user_in_group_a', 'users')
	ON CONFLICT DO NOTHING
	;

-- Rights
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
('lizmap.tools.layer.export', 'admins', 'testsrepository', 0),
-- ...for users in group_a group
('lizmap.repositories.view', 'group_a', 'testsrepository', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'group_a', 'testsrepository', 0),
('lizmap.tools.edition.use', 'group_a', 'testsrepository', 0),
('lizmap.tools.layer.export', 'group_a', 'testsrepository', 0)
ON CONFLICT DO NOTHING
;
