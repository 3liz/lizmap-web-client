CREATE SCHEMA if NOT EXISTS tests_projects;

CREATE TABLE tests_projects.form_edition_point_4326 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(Point, 4326)
);

CREATE TABLE tests_projects.form_edition_point_3857 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(Point, 3857)
);

CREATE TABLE tests_projects.form_edition_point_2154 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(Point, 2154)
);

CREATE TABLE tests_projects.form_edition_line_4326 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(LineString, 4326)
);

CREATE TABLE tests_projects.form_edition_line_3857 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(LineString, 3857)
);

CREATE TABLE tests_projects.form_edition_line_2154 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(LineString, 2154)
);
CREATE TABLE tests_projects.form_edition_polygon_4326 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(Polygon, 4326)
);

CREATE TABLE tests_projects.form_edition_polygon_3857 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(Polygon, 3857)
);

CREATE TABLE tests_projects.form_edition_polygon_2154 (
    id serial PRIMARY KEY,
    label text,
    geom Geometry(Polygon, 2154)
);