SET search_path TO public;

-- Returns a valid GeoJSON from any query
CREATE OR REPLACE FUNCTION query_to_geojson(datasource text)
RETURNS json AS
$$
DECLARE
    sqltext text;
    ajson json;
BEGIN
    sqltext:= format('
        SELECT jsonb_build_object(
            ''type'',  ''FeatureCollection'',
            ''features'', jsonb_agg(features.feature)
        )::json
        FROM (
          SELECT jsonb_build_object(
            ''type'',       ''Feature'',
            ''id'',         id,
            ''geometry'',   ST_AsGeoJSON(ST_Transform(geom, 4326))::jsonb,
            ''properties'', to_jsonb(inputs) - ''geom''
          ) AS feature
          FROM (
              SELECT * FROM (%s) foo
          ) AS inputs
        ) AS features
    ', datasource);
    RAISE NOTICE 'SQL = %s', sqltext;
    EXECUTE sqltext INTO ajson;
    RETURN ajson;
END;
$$
LANGUAGE 'plpgsql'
IMMUTABLE STRICT;

COMMENT ON FUNCTION query_to_geojson(text) IS 'Generate a valid GEOJSON from a given SQL text query.';



CREATE OR REPLACE FUNCTION lizmap_get_data(parameters json) RETURNS json
LANGUAGE plpgsql
AS $_$
DECLARE
    lizmap_repository text;
    lizmap_project text;
    action_name text;
    action_scope text;
    layer_name text;
    layer_table text;
    layer_schema text;
    feature_id integer;
    layer_srid integer;
    wkt text;
    map_center text;
    map_extent text;
    sqltext text;
    datasource text;
    ajson json;
BEGIN
    -- We set the variables with the values given in the JSON parameters variable
    lizmap_repository:= parameters->>'lizmap_repository';
    lizmap_project:= parameters->>'lizmap_project';
    action_name:= parameters->>'action_name';
    action_scope:= parameters->>'action_scope';
    layer_name:= parameters->>'layer_name';
    layer_schema:= parameters->>'layer_schema';
    layer_table:= parameters->>'layer_table';
    map_center:= parameters->>'map_center';
    map_extent:= parameters->>'map_extent';
    layer_srid:= 0;
    feature_id:= (parameters->>'feature_id')::integer;
    wkt:= parameters->>'wkt';

    -- Default SQL query: used if there is a misconfiguration
    -- For example when
    datasource:= '
    SELECT
    1 AS id,
    ''This action does not exist or there is a misconfiguration'' AS message,
    NULL AS geom
    ';

    -- Get the layer SRID if the scope of the action is layer or feature
    IF action_scope IN ('layer', 'feature') THEN
        layer_srid:= (
        SELECT g.srid
        FROM geometry_columns AS g
        WHERE g.f_table_schema = layer_schema AND g.f_table_name = layer_table
        LIMIT 1
        );
    END IF;

    -- The action_scope can have 3 values: project, layer or feature
    --
    -- actions for the project scope:
    -- They are triggered when the user opens the action panel
    -- selects an action in the list, then click on the button
    IF action_scope = 'project' THEN

        -- Return the buffer 2000m of map center point
        IF action_name = 'project_map_center_buffer' AND trim(map_center) != '' THEN
            datasource:= format(
                $$
                    SELECT
                    1 AS id,
                    '%1$s' AS project,
                    ST_Buffer(
                        ST_GeomFromText('%2$s', 4326)::geography,
                        %3$s
                    )::geometry(POLYGON, 4326) AS geom,
                    'The displayed geometry represents the buffer %3$s m of the current map center' AS message
                $$,
                lizmap_project,
                map_center,
                parameters->>'buffer_size'
            );
        -- Return the buffer 2000m of point drawn by user
        ELSEIF action_name = 'project_map_drawn_point_buffer' AND trim(wkt) != '' THEN
            datasource:= format(
                $$
                    SELECT
                    1 AS id,
                    '%1$s' AS project,
                    ST_Buffer(
                        ST_GeomFromText('%2$s', 4326)::geography,
                        %3$s
                    )::geometry(POLYGON, 4326) AS geom,
                    'The displayed geometry represents the buffer %3$s m of the point drawn by the user' AS message,
                    '<p>The displayed geometry represents the buffer <strong>%3$s m</strong> of the point drawn by the user</p>' AS message_html
                $$,
                lizmap_project,
                wkt,
                parameters->>'buffer_size'
            );
        END IF;

    -- actions for the layer scope
    -- They are triggered when the user open the layer information panel,
    -- select the action, and click on the button
    ELSEIF action_scope = 'layer' THEN

        -- Returns the contour of all the features of the given project layer
        IF action_name = 'layer_spatial_extent' AND layer_srid != 0 THEN
        datasource:= format(
            $$
                SELECT
                1 AS id,
                ST_Buffer(ST_ConvexHull(ST_Collect(geom)), 100)::geometry(POLYGON, %1$s) AS geom,
                'The displayed geometry represents the contour of all the layer features' AS message,
                '%4$s' AS layer_name,
                count(*) AS feature_count
                FROM %2$s.%3$s
            $$,
            layer_srid,
            quote_ident(layer_schema),
            quote_ident(layer_table),
            layer_name
        );
        END IF;

    -- action for the feature scope:
    -- They are triggered when the user displays the the popup of a feature
    -- and then clicks on the corresponding action button
    ELSEIF action_scope = 'feature' THEN

        -- Returns the buffer 500m of the given feature for the given layer
        IF action_name = 'buffer_500' THEN
        datasource:= format(
            $$
                SELECT
                %1$s AS id,
                'The buffer %4$s m has been displayed in the map' AS message,
                ST_Buffer(geom, %4$s) AS geom
                FROM %2$s.%3$s
                WHERE id = %1$s
            $$,
            feature_id,
            quote_ident(layer_schema),
            quote_ident(layer_table),
            parameters->>'buffer_size'
        );
        END IF;
    END IF;

    -- Return the data by running the SQL of the datasource parameter
    -- and transforming it to GeoJSON format via the function query_to_geojson
    SELECT query_to_geojson(datasource)
    INTO ajson
    ;
    RETURN ajson;
END;
$_$;


--
-- Name: FUNCTION lizmap_get_data(parameters json); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION lizmap_get_data(parameters json) IS 'Generate a valid GeoJSON from an action described by a name, PostgreSQL schema and table name of the source data, a QGIS layer name, a feature id and additional options.';
