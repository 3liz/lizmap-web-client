-- This script adds users, groups and rights to test Lizmap projects...

-- Groups
INSERT INTO lizmap.jacl2_group(
	id_aclgrp, name, grouptype, ownerlogin)
	VALUES ('group_a', 'group_a', 0, null),
    ('__priv_user_in_group_a', 'user_in_group_a', 2, 'user_in_group_a'),
	('group_b', 'group_b', 0, null),
    ('__priv_user_in_group_b', 'user_in_group_b', 2, 'user_in_group_b'),
    ('__priv_publisher', 'publisher', 2, 'publisher')
    ON CONFLICT DO NOTHING
    ;

-- Users
INSERT INTO lizmap.jlx_user(
	usr_login, usr_email, usr_password, status, create_date)
	VALUES
	('user_in_group_a', 'user_in_group_a@nomail.nomail', '$2y$10$d2KZfxeYJP0l3YbNyDMZYe2vGSA3JWa8kFJSdecmSEIqInjnunTJ.', 1, NOW()),
	('user_in_group_b', 'user_in_group_b@nomail.nomail', '$2y$10$d2KZfxeYJP0l3YbNyDMZYe2vGSA3JWa8kFJSdecmSEIqInjnunTJ.', 1, NOW()),
	('publisher', 'publisher@nomail.nomail', '$2y$10$d2KZfxeYJP0l3YbNyDMZYe2vGSA3JWa8kFJSdecmSEIqInjnunTJ.', 1, NOW())
	ON CONFLICT DO NOTHING
	;

-- Users in Groups
INSERT INTO lizmap.jacl2_user_group(
	login, id_aclgrp)
	VALUES ('user_in_group_a', 'group_a'),
	('user_in_group_a', '__priv_user_in_group_a'),
	('user_in_group_a', 'users'),
	('user_in_group_b', 'group_b'),
	('user_in_group_b', '__priv_user_in_group_b'),
	('user_in_group_b', 'users'),
	('publisher', '__priv_publisher'),
	('publisher', 'users'),
	('publisher', 'publishers')
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
('lizmap.tools.loginFilteredLayers.override', 'admins', 'testsrepository', 0),
-- ...for users in publishers group
('lizmap.repositories.view', 'publishers', 'testsrepository', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'publishers', 'testsrepository', 0),
('lizmap.tools.edition.use', 'publishers', 'testsrepository', 0),
('lizmap.tools.layer.export', 'publishers', 'testsrepository', 0),
('lizmap.tools.loginFilteredLayers.override', 'publishers', 'testsrepository', 0),
-- ...for users in group_a group
('lizmap.repositories.view', 'group_a', 'testsrepository', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'group_a', 'testsrepository', 0),
('lizmap.tools.edition.use', 'group_a', 'testsrepository', 0),
('lizmap.tools.layer.export', 'group_a', 'testsrepository', 0),
-- ...for users in group_b group
('lizmap.repositories.view', 'group_b', 'testsrepository', 0),
('lizmap.tools.displayGetCapabilitiesLinks', 'group_b', 'testsrepository', 0),
('lizmap.tools.edition.use', 'group_b', 'testsrepository', 0),
('lizmap.tools.layer.export', 'group_b', 'testsrepository', 0)
ON CONFLICT DO NOTHING
;
