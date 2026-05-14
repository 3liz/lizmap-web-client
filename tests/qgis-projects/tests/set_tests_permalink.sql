-- This script adds records to permalink table for testing purpose

-- empty table
DELETE FROM lizmap.permalink;

INSERT INTO lizmap.permalink(
    id, url_parameters, repository, project, creation_date, last_usage_date)
VALUES
    ('h47yokjwuJ4o', '{"bbox":["3.772082","43.547726","3.997095","43.652970"],"layers":["single_wms_lines","single_wms_baselayer"],"styles":["default","default"],"opacities":[1,1]}', 'testsrepository', 'short_link_permalink', NOW(), NOW()),
    ('h47yokj_old1', '{"bbox":["3.772082","43.547726","3.997095","43.652970"],"layers":["single_wms_lines","single_wms_baselayer"],"styles":["default","default"],"opacities":[1,1]}', 'testsrepository', 'short_link_permalink', NOW() + INTERVAL '-1 day', NOW() + INTERVAL '-1 day'),
    ('h47yokj_old2', '{"bbox":["3.772082","43.547726","3.997095","43.652970"],"layers":["single_wms_lines","single_wms_baselayer"],"styles":["default","default"],"opacities":[1,1]}', 'testsrepository', 'short_link_permalink', NOW() + INTERVAL '-2 day', NOW() + INTERVAL '-2 day'),
    ('h47yokj_old3', '{"bbox":["3.772082","43.547726","3.997095","43.652970"],"layers":["single_wms_lines","single_wms_baselayer"],"styles":["default","default"],"opacities":[1,1]}', 'testsrepository', 'short_link_permalink', NOW() + INTERVAL '-3 day', NOW() + INTERVAL '-3 day'),
    ('h47yokj_old4', '{"bbox":["3.772082","43.547726","3.997095","43.652970"],"layers":["single_wms_lines","single_wms_baselayer"],"styles":["default","default"],"opacities":[1,1]}', 'testsrepository', 'short_link_permalink', NOW() + INTERVAL '-4 day', NOW() + INTERVAL '-4 day'),
    ('h47yokj_old5', '{"bbox":["3.772082","43.547726","3.997095","43.652970"],"layers":["single_wms_lines","single_wms_baselayer"],"styles":["default","default"],"opacities":[1,1]}', 'testsrepository', 'short_link_permalink', NOW() + INTERVAL '-10 day', NOW() + INTERVAL '-10 day')
    ON CONFLICT DO NOTHING
;
