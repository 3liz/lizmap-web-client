
-- This script adds a record to permalink table for testing purpose
INSERT INTO lizmap.permalink(
    id, url_parameters, repository, project)
VALUES
    ('h47yokjwuJ4o', '{"bbox":["3.772082","43.547726","3.997095","43.652970"],"layers":["single_wms_lines","single_wms_baselayer"],"styles":["default","default"],"opacities":[1,1]}', 'testsrepository', 'short_link_permalink')
    ON CONFLICT DO NOTHING
;
