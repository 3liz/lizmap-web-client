ALTER TABLE jlx_user ADD COLUMN firstname TEXT NOT NULL DEFAULT '';
ALTER TABLE jlx_user ADD COLUMN lastname TEXT NOT NULL DEFAULT '';
ALTER TABLE jlx_user ADD COLUMN organization TEXT NOT NULL DEFAULT '';
ALTER TABLE jlx_user ADD COLUMN phonenumber TEXT;
ALTER TABLE jlx_user ADD COLUMN street TEXT NOT NULL DEFAULT '';
ALTER TABLE jlx_user ADD COLUMN postcode TEXT NOT NULL DEFAULT '';
ALTER TABLE jlx_user ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE jlx_user ADD COLUMN country TEXT;
ALTER TABLE jlx_user ADD COLUMN comment TEXT;

UPDATE jacl2_rights SET id_aclsbj = 'lizmap.tools.edition.use' WHERE id_aclsbj = 'lizmap.tools.annotation.use';
UPDATE jacl2_subject SET id_aclsbj = 'lizmap.tools.edition.use', label_key='admin~jacl2.lizmap.tools.edition.use' WHERE id_aclsbj = 'lizmap.tools.annotation.use';

