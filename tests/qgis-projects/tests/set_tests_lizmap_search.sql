-- Add the extension pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- Add the extension unaccent, available with PostgreSQL contrib tools. This is needed to provide searches which are not sensitive to accentuated characters.
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

-- Add the f_unaccent function to be used in the index
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text AS
$func$
SELECT public.unaccent('public.unaccent', $1)  -- schema-qualify function and dictionary
$func$ LANGUAGE sql IMMUTABLE;

DROP MATERIALIZED VIEW IF EXISTS lizmap_search;
CREATE MATERIALIZED VIEW lizmap_search AS
SELECT
    'Quartier' as item_layer, -- name of the layer presented to the user
    concat(quartmno, ' - ', libquart) AS item_label, -- the search label is a concatenation between the 'Commune' code (idu) and its name (tex2)
    NULL AS item_filter, -- the data will be searchable for every Lizmap user
    NULL AS item_project, -- the data will be searchable for every Lizmap maps (published QGIS projects)
    geom -- geometry of the 'Commune'. You could also use a simplified version, for example: ST_Envelope(geom) AS geom
FROM tests_projects.quartiers
UNION ALL -- combine the data between the 'Commune' (above) and the 'Parcelles' (below) tables
SELECT
    'Sous-Quartier' AS item_layer,
    concat(squartmno, ' - ', libsquart) AS item_label,
    'admins' AS item_filter, -- only users in the admins Lizmap group will be able to search among the 'Sous-Quartiers'
    'form_advanced' AS item_project, -- the Sous-Quartiers will be available in search only for the form_advanced.qgs and urban.qgs QGIS projects
    geom
FROM tests_projects.sousquartiers
;
