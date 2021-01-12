CREATE SCHEMA if NOT EXISTS tests_projects;

CREATE TABLE tests_projects.form_edition_vr_list (
    id serial PRIMARY KEY,
    code text UNIQUE,
    label text,
    code_parent text,
    geom Geometry(Polygon,4326)
);

CREATE TABLE tests_projects.form_edition_vr_dd_list (
    id serial PRIMARY KEY,
    code text UNIQUE,
    label text
);

CREATE TABLE tests_projects.form_edition_vr_point (
    id serial PRIMARY KEY,
    code_without_exp text,
    code_with_simple_exp text,
    code_for_drill_down_exp text,
    code_with_drill_down_exp text,
    code_with_geom_exp text,
    geom Geometry(Point,4326)
);

INSERT INTO tests_projects.form_edition_vr_list (code, label, code_parent, geom) VALUES
  ('A1', 'Zone A1', 'A', ST_GeomFromText('POLYGON((0.0 48.0, 2.0 48.0, 2.0 46.0, 0.0 46.0, 0.0 48.0))', 4326)),
  ('A2', 'Zone A2', 'A', ST_GeomFromText('POLYGON((2.0 48.0, 4.0 48.0, 4.0 46.0, 2.0 46.0, 2.0 48.0))', 4326)),
  ('B1', 'Zone B1', 'B', ST_GeomFromText('POLYGON((0.0 46.0, 2.0 46.0, 2.0 44.0, 0.0 44.0, 0.0 46.0))', 4326)),
  ('B2', 'Zone B2', 'B', ST_GeomFromText('POLYGON((2.0 46.0, 4.0 46.0, 4.0 44.0, 2.0 44.0, 2.0 46.0))', 4326));

INSERT INTO tests_projects.form_edition_vr_dd_list (code, label) VALUES
  ('A', 'Zone A'),
  ('B', 'Zone B');