--
-- PostgreSQL database dump
--

\restrict testse2elizmap


SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tests_projects; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tests_projects;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: quartiers; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.quartiers (
    quartier integer NOT NULL,
    geom public.geometry(MultiPolygon,4326),
    quartmno character varying(2),
    libquart character varying(32),
    photo character varying(255),
    url character varying(255)
);


--
-- Name: sousquartiers; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.sousquartiers (
    id integer NOT NULL,
    quartmno character varying,
    squartmno character varying,
    libsquart character varying,
    quartiers_libquart character varying,
    geom public.geometry(MultiPolygon,2154)
);


--
-- Name: attribute_table; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.attribute_table (
    id integer NOT NULL,
    label_from_int_value_relation integer,
    label_from_text_value_relation text,
    label_from_int_value_map integer,
    label_from_text_value_map text,
    label_from_int_relation_reference integer,
    label_from_text_relation_reference text,
    label_from_array_int_multiple_value_relation integer[],
    label_from_array_text_multiple_value_relation text[],
    label_from_text_multiple_value_relation text
);


--
-- Name: attribute_table_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.attribute_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attribute_table_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.attribute_table_id_seq OWNED BY tests_projects.attribute_table.id;


--
-- Name: birds; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.birds (
    id integer NOT NULL,
    bird_name text,
    bird_scientific_name text
);


--
-- Name: birds_areas; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.birds_areas (
    id integer NOT NULL,
    bird_id integer NOT NULL,
    natural_area_id integer NOT NULL
);


--
-- Name: birds_areas_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.birds_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: birds_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.birds_areas_id_seq OWNED BY tests_projects.birds_areas.id;


--
-- Name: birds_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.birds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: birds_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.birds_id_seq OWNED BY tests_projects.birds.id;


--
-- Name: birds_spots; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.birds_spots (
    id integer NOT NULL,
    area_id integer,
    spot_name text
);


--
-- Name: birds_spots_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.birds_spots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: birds_spots_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.birds_spots_id_seq OWNED BY tests_projects.birds_spots.id;


--
-- Name: children_layer; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.children_layer (
    id integer NOT NULL,
    parent_id integer,
    comment text
);


--
-- Name: children_layer_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.children_layer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: children_layer_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.children_layer_id_seq OWNED BY tests_projects.children_layer.id;


--
-- Name: data_integers; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.data_integers (
    id integer NOT NULL,
    label text
);


--
-- Name: data_integers_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.data_integers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_integers_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.data_integers_id_seq OWNED BY tests_projects.data_integers.id;


--
-- Name: data_trad_en_fr; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.data_trad_en_fr (
    id integer NOT NULL,
    label_en text,
    label_fr text
);


--
-- Name: data_trad_en_fr_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.data_trad_en_fr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_trad_en_fr_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.data_trad_en_fr_id_seq OWNED BY tests_projects.data_trad_en_fr.id;


--
-- Name: data_uids; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.data_uids (
    id integer NOT NULL,
    uid text,
    label text
);


--
-- Name: data_uids_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.data_uids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_uids_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.data_uids_id_seq OWNED BY tests_projects.data_uids.id;


--
-- Name: dnd_form; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.dnd_form (
    id integer NOT NULL,
    field_in_dnd_form text,
    field_not_in_dnd_form text
);


--
-- Name: dnd_form_geom; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.dnd_form_geom (
    id integer NOT NULL,
    field_in_dnd_form text,
    field_not_in_dnd_form text,
    geom public.geometry(Point,2154)
);


--
-- Name: dnd_form_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.dnd_form_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dnd_form_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.dnd_form_geom_id_seq OWNED BY tests_projects.dnd_form_geom.id;


--
-- Name: dnd_form_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.dnd_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dnd_form_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.dnd_form_id_seq OWNED BY tests_projects.dnd_form.id;


--
-- Name: dnd_popup; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.dnd_popup (
    id integer NOT NULL,
    field_tab1 text,
    field_tab2 text,
    geom public.geometry(Polygon,2154)
);


--
-- Name: dnd_popup_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.dnd_popup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dnd_popup_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.dnd_popup_id_seq OWNED BY tests_projects.dnd_popup.id;


--
-- Name: double_geom; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.double_geom (
    id integer NOT NULL,
    title text,
    geom public.geometry(Polygon,4326),
    geom_d public.geometry(Polygon,4326)
);


--
-- Name: double_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.double_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: double_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.double_geom_id_seq OWNED BY tests_projects.double_geom.id;


--
-- Name: edition_layer_embed_child; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.edition_layer_embed_child (
    id integer NOT NULL,
    descr text
);


--
-- Name: edition_layer_embed_child_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.edition_layer_embed_child_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edition_layer_embed_child_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.edition_layer_embed_child_id_seq OWNED BY tests_projects.edition_layer_embed_child.id;


--
-- Name: edition_layer_embed_line; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.edition_layer_embed_line (
    id integer NOT NULL,
    descr text,
    geom public.geometry(LineString,4326)
);


--
-- Name: edition_layer_embed_line_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.edition_layer_embed_line_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edition_layer_embed_line_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.edition_layer_embed_line_id_seq OWNED BY tests_projects.edition_layer_embed_line.id;


--
-- Name: edition_layer_embed_point; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.edition_layer_embed_point (
    id integer NOT NULL,
    id_ext_point integer,
    descr text,
    geom public.geometry(Point,4326)
);


--
-- Name: edition_layer_embed_point_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.edition_layer_embed_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edition_layer_embed_point_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.edition_layer_embed_point_id_seq OWNED BY tests_projects.edition_layer_embed_point.id;


--
-- Name: end2end_form_edition; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.end2end_form_edition (
    id integer NOT NULL,
    value integer
);


--
-- Name: end2end_form_edition_geom; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.end2end_form_edition_geom (
    id integer NOT NULL,
    value integer,
    geom public.geometry(Point,2154)
);


--
-- Name: end2end_form_edition_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.end2end_form_edition_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: end2end_form_edition_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.end2end_form_edition_geom_id_seq OWNED BY tests_projects.end2end_form_edition_geom.id;


--
-- Name: end2end_form_edition_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.end2end_form_edition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: end2end_form_edition_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.end2end_form_edition_id_seq OWNED BY tests_projects.end2end_form_edition.id;


--
-- Name: filter_layer_by_user; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.filter_layer_by_user (
    gid integer NOT NULL,
    "user" text,
    "group" text,
    geom public.geometry(Point,2154)
);


--
-- Name: filter_layer_by_user_edition_only; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.filter_layer_by_user_edition_only (
    gid integer NOT NULL,
    "user" text,
    "group" text,
    geom public.geometry(Point,2154)
);


--
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.filter_layer_by_user_edition_only_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.filter_layer_by_user_edition_only_gid_seq OWNED BY tests_projects.filter_layer_by_user_edition_only.gid;


--
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.filter_layer_by_user_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.filter_layer_by_user_gid_seq OWNED BY tests_projects.filter_layer_by_user.gid;


--
-- Name: form_advanced_point; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_advanced_point (
    id integer NOT NULL,
    geom public.geometry(Point,2154),
    has_photo boolean,
    website text,
    quartier text,
    sousquartier text
);


--
-- Name: form_advanced_point_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_advanced_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_advanced_point_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_advanced_point_id_seq OWNED BY tests_projects.form_advanced_point.id;


--
-- Name: form_edition_all_fields_types; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_all_fields_types (
    id integer NOT NULL,
    integer_field integer,
    boolean_nullable boolean,
    boolean_notnull_for_checkbox boolean NOT NULL,
    boolean_readonly boolean,
    integer_array integer[],
    text text,
    uids text,
    value_map_integer integer,
    html_text text,
    multiline_text text
);


--
-- Name: form_edition_all_fields_types_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_all_fields_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_all_fields_types_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_all_fields_types_id_seq OWNED BY tests_projects.form_edition_all_fields_types.id;


--
-- Name: form_edition_line_2154; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_line_2154 (
    id integer NOT NULL,
    label text,
    geom public.geometry(LineString,2154)
);


--
-- Name: form_edition_line_2154_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_line_2154_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_line_2154_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_line_2154_id_seq OWNED BY tests_projects.form_edition_line_2154.id;


--
-- Name: form_edition_line_3857; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_line_3857 (
    id integer NOT NULL,
    label text,
    geom public.geometry(LineString,3857)
);


--
-- Name: form_edition_line_3857_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_line_3857_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_line_3857_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_line_3857_id_seq OWNED BY tests_projects.form_edition_line_3857.id;


--
-- Name: form_edition_line_4326; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_line_4326 (
    id integer NOT NULL,
    label text,
    geom public.geometry(LineString,4326)
);


--
-- Name: form_edition_line_4326_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_line_4326_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_line_4326_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_line_4326_id_seq OWNED BY tests_projects.form_edition_line_4326.id;


--
-- Name: form_edition_point_2154; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_point_2154 (
    id integer NOT NULL,
    label text,
    geom public.geometry(Point,2154)
);


--
-- Name: form_edition_point_2154_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_point_2154_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_point_2154_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_point_2154_id_seq OWNED BY tests_projects.form_edition_point_2154.id;


--
-- Name: form_edition_point_3857; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_point_3857 (
    id integer NOT NULL,
    label text,
    geom public.geometry(Point,3857)
);


--
-- Name: form_edition_point_3857_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_point_3857_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_point_3857_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_point_3857_id_seq OWNED BY tests_projects.form_edition_point_3857.id;


--
-- Name: form_edition_point_4326; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_point_4326 (
    id integer NOT NULL,
    label text,
    geom public.geometry(Point,4326)
);


--
-- Name: form_edition_point_4326_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_point_4326_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_point_4326_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_point_4326_id_seq OWNED BY tests_projects.form_edition_point_4326.id;


--
-- Name: form_edition_polygon_2154; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_polygon_2154 (
    id integer NOT NULL,
    label text,
    geom public.geometry(Polygon,2154)
);


--
-- Name: form_edition_polygon_2154_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_polygon_2154_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_polygon_2154_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_polygon_2154_id_seq OWNED BY tests_projects.form_edition_polygon_2154.id;


--
-- Name: form_edition_polygon_3857; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_polygon_3857 (
    id integer NOT NULL,
    label text,
    geom public.geometry(Polygon,3857)
);


--
-- Name: form_edition_polygon_3857_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_polygon_3857_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_polygon_3857_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_polygon_3857_id_seq OWNED BY tests_projects.form_edition_polygon_3857.id;


--
-- Name: form_edition_polygon_4326; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_polygon_4326 (
    id integer NOT NULL,
    label text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: form_edition_polygon_4326_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_polygon_4326_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_polygon_4326_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_polygon_4326_id_seq OWNED BY tests_projects.form_edition_polygon_4326.id;


--
-- Name: form_edition_snap; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_snap (
    id integer NOT NULL,
    geom public.geometry(Point,4326)
);


--
-- Name: form_edition_snap_control; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_snap_control (
    id integer NOT NULL,
    geom public.geometry(Point,4326)
);


--
-- Name: form_edition_snap_control_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_snap_control_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_snap_control_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_snap_control_id_seq OWNED BY tests_projects.form_edition_snap_control.id;


--
-- Name: form_edition_snap_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_snap_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_snap_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_snap_id_seq OWNED BY tests_projects.form_edition_snap.id;


--
-- Name: form_edition_snap_line; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_snap_line (
    id integer NOT NULL,
    geom public.geometry(LineString,4326)
);


--
-- Name: form_edition_snap_line_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_snap_line_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_snap_line_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_snap_line_id_seq OWNED BY tests_projects.form_edition_snap_line.id;


--
-- Name: form_edition_snap_point; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_snap_point (
    id integer NOT NULL,
    geom public.geometry(Point,4326)
);


--
-- Name: form_edition_snap_point_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_snap_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_snap_point_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_snap_point_id_seq OWNED BY tests_projects.form_edition_snap_point.id;


--
-- Name: form_edition_snap_polygon; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_snap_polygon (
    id integer NOT NULL,
    geom public.geometry(Polygon,4326)
);


--
-- Name: form_edition_snap_polygon_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_snap_polygon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_snap_polygon_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_snap_polygon_id_seq OWNED BY tests_projects.form_edition_snap_polygon.id;


--
-- Name: form_edition_upload; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_upload (
    id integer NOT NULL,
    generic_file text,
    text_file text,
    image_file text,
    text_file_mandatory text NOT NULL,
    image_file_mandatory text NOT NULL,
    image_file_specific_root_folder text
);


--
-- Name: form_edition_upload_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_upload_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_upload_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_upload_id_seq OWNED BY tests_projects.form_edition_upload.id;


--
-- Name: form_edition_upload_webdav; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_upload_webdav (
    id integer NOT NULL,
    remote_path text,
    local_path text
);


--
-- Name: form_edition_upload_webdav_child_attachments; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_upload_webdav_child_attachments (
    id integer NOT NULL,
    id_parent integer,
    remote_path text
);


--
-- Name: form_edition_upload_webdav_child_attachments_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_upload_webdav_child_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_upload_webdav_child_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_upload_webdav_child_attachments_id_seq OWNED BY tests_projects.form_edition_upload_webdav_child_attachments.id;


--
-- Name: form_edition_upload_webdav_geom; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_upload_webdav_geom (
    id integer NOT NULL,
    remote_path text,
    local_path text,
    geom public.geometry(Point,4326)
);


--
-- Name: form_edition_upload_webdav_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_upload_webdav_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_upload_webdav_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_upload_webdav_geom_id_seq OWNED BY tests_projects.form_edition_upload_webdav_geom.id;


--
-- Name: form_edition_upload_webdav_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_upload_webdav_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_upload_webdav_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_upload_webdav_id_seq OWNED BY tests_projects.form_edition_upload_webdav.id;


--
-- Name: form_edition_upload_webdav_parent_geom; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_upload_webdav_parent_geom (
    id integer NOT NULL,
    descr text,
    geom public.geometry(Point,4326)
);


--
-- Name: form_edition_upload_webdav_parent_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_upload_webdav_parent_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_upload_webdav_parent_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_upload_webdav_parent_geom_id_seq OWNED BY tests_projects.form_edition_upload_webdav_parent_geom.id;


--
-- Name: form_edition_vr_dd_list; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_vr_dd_list (
    id integer NOT NULL,
    code text,
    label text
);


--
-- Name: form_edition_vr_dd_list_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_vr_dd_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_vr_dd_list_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_vr_dd_list_id_seq OWNED BY tests_projects.form_edition_vr_dd_list.id;


--
-- Name: form_edition_vr_list; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_vr_list (
    id integer NOT NULL,
    code text,
    label text,
    code_parent text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: form_edition_vr_list_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_vr_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_vr_list_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_vr_list_id_seq OWNED BY tests_projects.form_edition_vr_list.id;


--
-- Name: form_edition_vr_point; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_edition_vr_point (
    id integer NOT NULL,
    code_without_exp text,
    code_with_simple_exp text,
    code_for_drill_down_exp text,
    code_with_drill_down_exp text,
    code_with_geom_exp text,
    geom public.geometry(Point,4326)
);


--
-- Name: form_edition_vr_point_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_edition_vr_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_edition_vr_point_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_edition_vr_point_id_seq OWNED BY tests_projects.form_edition_vr_point.id;


--
-- Name: form_filter; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_filter (
    id integer NOT NULL,
    label text,
    geom public.geometry(Point,2154)
);


--
-- Name: form_filter_child_bus_stops; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.form_filter_child_bus_stops (
    id integer NOT NULL,
    label text,
    id_parent integer,
    geom public.geometry(Point,2154)
);


--
-- Name: form_filter_child_bus_stops_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_filter_child_bus_stops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_filter_child_bus_stops_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_filter_child_bus_stops_id_seq OWNED BY tests_projects.form_filter_child_bus_stops.id;


--
-- Name: form_filter_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.form_filter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_filter_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.form_filter_id_seq OWNED BY tests_projects.form_filter.id;


--
-- Name: huge_table; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.huge_table (
    id integer NOT NULL,
    geom public.geometry(Point,4326),
    lookup_1 integer,
    lookup_2 integer,
    date_1 date,
    num_1 integer,
    float_1 numeric,
    bool_1 boolean
);


--
-- Name: huge_table_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.huge_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: huge_table_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.huge_table_id_seq OWNED BY tests_projects.huge_table.id;


--
-- Name: layer_legend_categorized; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.layer_legend_categorized (
    id integer NOT NULL,
    geom public.geometry(Point,2154),
    category integer
);


--
-- Name: layer_legend_categorized_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.layer_legend_categorized_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: layer_legend_categorized_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.layer_legend_categorized_id_seq OWNED BY tests_projects.layer_legend_categorized.id;


--
-- Name: layer_legend_single_symbol; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.layer_legend_single_symbol (
    id integer NOT NULL,
    geom public.geometry(Point,2154)
);


--
-- Name: layer_legend_single_symbol_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.layer_legend_single_symbol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: layer_legend_single_symbol_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.layer_legend_single_symbol_id_seq OWNED BY tests_projects.layer_legend_single_symbol.id;


--
-- Name: layer_with_no_filter; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.layer_with_no_filter (
    gid integer NOT NULL,
    geom public.geometry(Point,2154)
);


--
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.layer_with_no_filter_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.layer_with_no_filter_gid_seq OWNED BY tests_projects.layer_with_no_filter.gid;


--
-- Name: lookup_1; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.lookup_1 (
    id integer NOT NULL,
    data text NOT NULL
);


--
-- Name: lookup_1_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.lookup_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lookup_1_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.lookup_1_id_seq OWNED BY tests_projects.lookup_1.id;


--
-- Name: lookup_2; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.lookup_2 (
    id integer NOT NULL,
    data text NOT NULL
);


--
-- Name: lookup_2_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.lookup_2_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lookup_2_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.lookup_2_id_seq OWNED BY tests_projects.lookup_2.id;


--
-- Name: many_bool_formats; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.many_bool_formats (
    id integer NOT NULL,
    bool_simple_null_cb boolean,
    bool_not_nullable_cb boolean NOT NULL,
    bool_simple_null_vm boolean,
    bool_not_nullable_vm boolean NOT NULL,
    geom public.geometry(Point,4326)
);


--
-- Name: TABLE many_bool_formats; Type: COMMENT; Schema: tests_projects; Owner: -
--

COMMENT ON TABLE tests_projects.many_bool_formats IS 'CB for CheckBox, VM for ValueMap';


--
-- Name: many_bool_formats_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.many_bool_formats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: many_bool_formats_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.many_bool_formats_id_seq OWNED BY tests_projects.many_bool_formats.id;


--
-- Name: many_date_formats; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.many_date_formats (
    id integer NOT NULL,
    field_date date,
    field_time time without time zone,
    field_timestamp timestamp without time zone,
    field_date_auto_cast date DEFAULT (now())::date,
    field_time_auto_cast time without time zone DEFAULT (now())::time without time zone,
    field_timestamp_auto_cast timestamp without time zone DEFAULT (now())::timestamp(0) without time zone,
    field_date_auto date DEFAULT now(),
    field_time_auto time without time zone DEFAULT now(),
    field_timestamp_auto timestamp without time zone DEFAULT now(),
    field_date_expr_now date,
    field_time_expr_now time without time zone,
    field_timestamp_expr_now timestamp without time zone,
    field_date_expr_now_auto date DEFAULT now(),
    field_time_expr_now_auto time without time zone DEFAULT now(),
    field_timestamp_expr_now_auto timestamp without time zone DEFAULT now(),
    field_timestamp_date_only timestamp without time zone,
    field_timestamp_date_only_auto timestamp without time zone DEFAULT now(),
    field_timestamp_date_only_expr_now timestamp without time zone,
    field_timestamp_date_only_expr_now_auto timestamp without time zone DEFAULT now()
);


--
-- Name: many_date_formats_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.many_date_formats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: many_date_formats_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.many_date_formats_id_seq OWNED BY tests_projects.many_date_formats.id;


--
-- Name: natural_areas; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.natural_areas (
    id integer NOT NULL,
    natural_area_name text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: natural_areas_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.natural_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: natural_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.natural_areas_id_seq OWNED BY tests_projects.natural_areas.id;


--
-- Name: parent_layer; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.parent_layer (
    id integer NOT NULL,
    geom public.geometry(Point,2154)
);


--
-- Name: parent_layer_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.parent_layer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parent_layer_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.parent_layer_id_seq OWNED BY tests_projects.parent_layer.id;


--
-- Name: reverse_geom; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.reverse_geom (
    id integer NOT NULL,
    geom public.geometry(MultiLineString,2154)
);


--
-- Name: revert_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.revert_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: revert_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.revert_geom_id_seq OWNED BY tests_projects.reverse_geom.id;


--
-- Name: selection; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.selection (
    id integer NOT NULL,
    "group" text,
    geom public.geometry(Point,2154)
);


--
-- Name: selection_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.selection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: selection_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.selection_id_seq OWNED BY tests_projects.selection.id;


--
-- Name: selection_polygon; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.selection_polygon (
    id integer NOT NULL,
    geom public.geometry(Polygon,2154)
);


--
-- Name: selection_polygon_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.selection_polygon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: selection_polygon_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.selection_polygon_id_seq OWNED BY tests_projects.selection_polygon.id;


--
-- Name: shop_bakery_pg; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.shop_bakery_pg (
    id integer NOT NULL,
    geom public.geometry(Point,4326),
    name character varying(254)
);


--
-- Name: shop_bakery_id_0_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.shop_bakery_id_0_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_bakery_id_0_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.shop_bakery_id_0_seq OWNED BY tests_projects.shop_bakery_pg.id;


--
-- Name: single_wms_baselayer; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_baselayer (
    id integer NOT NULL,
    title text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: single_wms_baselayer_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_baselayer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_baselayer_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_baselayer_id_seq OWNED BY tests_projects.single_wms_baselayer.id;


--
-- Name: single_wms_baselayer_two; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_baselayer_two (
    id integer NOT NULL,
    title text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: single_wms_baselayer_two_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_baselayer_two_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_baselayer_two_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_baselayer_two_id_seq OWNED BY tests_projects.single_wms_baselayer_two.id;


--
-- Name: single_wms_lines; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_lines (
    id integer NOT NULL,
    title text,
    geom public.geometry(LineString,4326)
);


--
-- Name: single_wms_lines_group; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_lines_group (
    id integer NOT NULL,
    title text,
    geom public.geometry(LineString,4326)
);


--
-- Name: single_wms_lines_group_as_layer; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_lines_group_as_layer (
    id integer NOT NULL,
    title text,
    geom public.geometry(LineString,4326)
);


--
-- Name: single_wms_lines_group_as_layer_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_lines_group_as_layer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_lines_group_as_layer_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_lines_group_as_layer_id_seq OWNED BY tests_projects.single_wms_lines_group_as_layer.id;


--
-- Name: single_wms_lines_group_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_lines_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_lines_group_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_lines_group_id_seq OWNED BY tests_projects.single_wms_lines_group.id;


--
-- Name: single_wms_lines_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_lines_id_seq OWNED BY tests_projects.single_wms_lines.id;


--
-- Name: single_wms_points; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_points (
    id integer NOT NULL,
    title text,
    geom public.geometry(Point,4326)
);


--
-- Name: single_wms_points_group; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_points_group (
    id integer NOT NULL,
    title text,
    geom public.geometry(Point,4326)
);


--
-- Name: single_wms_points_group_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_points_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_points_group_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_points_group_id_seq OWNED BY tests_projects.single_wms_points_group.id;


--
-- Name: single_wms_points_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_points_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_points_id_seq OWNED BY tests_projects.single_wms_points.id;


--
-- Name: single_wms_polygons; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_polygons (
    id integer NOT NULL,
    title text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: single_wms_polygons_group_as_layer; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_polygons_group_as_layer (
    id integer NOT NULL,
    title text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: single_wms_polygons_group_as_layer_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_polygons_group_as_layer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_polygons_group_as_layer_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_polygons_group_as_layer_id_seq OWNED BY tests_projects.single_wms_polygons_group_as_layer.id;


--
-- Name: single_wms_polygons_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_polygons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_polygons_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_polygons_id_seq OWNED BY tests_projects.single_wms_polygons.id;


--
-- Name: single_wms_tiled_baselayer; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.single_wms_tiled_baselayer (
    id integer NOT NULL,
    title text,
    geom public.geometry(Polygon,4326)
);


--
-- Name: single_wms_tiled_baselayer_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.single_wms_tiled_baselayer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: single_wms_tiled_baselayer_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.single_wms_tiled_baselayer_id_seq OWNED BY tests_projects.single_wms_tiled_baselayer.id;


--
-- Name: sousquartiers_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.sousquartiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sousquartiers_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.sousquartiers_id_seq OWNED BY tests_projects.sousquartiers.id;


--
-- Name: table_for_form; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.table_for_form (
    gid integer NOT NULL,
    titre text,
    test text[],
    test_not_null_only text[],
    test_empty_value_only text[],
    geom public.geometry(Point,2154)
);


--
-- Name: table_for_form_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.table_for_form_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: table_for_form_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.table_for_form_gid_seq OWNED BY tests_projects.table_for_form.gid;


--
-- Name: table_for_relationnal_value; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.table_for_relationnal_value (
    gid integer NOT NULL,
    code text,
    label text
);


--
-- Name: table_for_relationnal_value_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.table_for_relationnal_value_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: table_for_relationnal_value_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.table_for_relationnal_value_gid_seq OWNED BY tests_projects.table_for_relationnal_value.gid;


--
-- Name: text_widget_point_edit; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.text_widget_point_edit (
    id integer NOT NULL,
    point_name text,
    geom public.geometry(Point,4326)
);


--
-- Name: text_widget_point_edit_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.text_widget_point_edit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: text_widget_point_edit_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.text_widget_point_edit_id_seq OWNED BY tests_projects.text_widget_point_edit.id;


--
-- Name: time_manager; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.time_manager (
    gid integer NOT NULL,
    test_date date,
    geom public.geometry(Point,2154)
);


--
-- Name: time_manager_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.time_manager_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: time_manager_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.time_manager_gid_seq OWNED BY tests_projects.time_manager.gid;


--
-- Name: townhalls_pg; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.townhalls_pg (
    id integer NOT NULL,
    geom public.geometry(Point,2154),
    name character varying(254)
);


--
-- Name: townhalls_EPSG2154_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects."townhalls_EPSG2154_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: townhalls_EPSG2154_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects."townhalls_EPSG2154_id_seq" OWNED BY tests_projects.townhalls_pg.id;


--
-- Name: tramway_lines; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.tramway_lines (
    id_line integer NOT NULL,
    geom public.geometry(LineString,2154)
);


--
-- Name: tramway_lines_id_tram_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.tramway_lines_id_tram_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tramway_lines_id_tram_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.tramway_lines_id_tram_seq OWNED BY tests_projects.tramway_lines.id_line;


--
-- Name: tramway_pivot; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.tramway_pivot (
    id_pivot integer NOT NULL,
    id_line integer NOT NULL,
    id_stop integer NOT NULL
);


--
-- Name: tramway_pivot_id_pivot_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.tramway_pivot_id_pivot_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tramway_pivot_id_pivot_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.tramway_pivot_id_pivot_seq OWNED BY tests_projects.tramway_pivot.id_pivot;


--
-- Name: tramway_stops; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.tramway_stops (
    id_stop integer NOT NULL,
    geom public.geometry(Point,2154)
);


--
-- Name: tramway_stops_id_stop_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.tramway_stops_id_stop_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tramway_stops_id_stop_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.tramway_stops_id_stop_seq OWNED BY tests_projects.tramway_stops.id_stop;


--
-- Name: triple_geom; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.triple_geom (
    id integer NOT NULL,
    title text,
    geom public.geometry(Point,4326),
    geom_l public.geometry(LineString,4326),
    geom_p public.geometry(Polygon,4326)
);


--
-- Name: triple_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.triple_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: triple_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.triple_geom_id_seq OWNED BY tests_projects.triple_geom.id;


--
-- Name: xss; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.xss (
    id integer NOT NULL,
    geom public.geometry(Point,2154),
    description text
);


--
-- Name: xss_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.xss_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: xss_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.xss_id_seq OWNED BY tests_projects.xss.id;


--
-- Name: attribute_table id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.attribute_table ALTER COLUMN id SET DEFAULT nextval('tests_projects.attribute_table_id_seq'::regclass);


--
-- Name: birds id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.birds ALTER COLUMN id SET DEFAULT nextval('tests_projects.birds_id_seq'::regclass);


--
-- Name: birds_areas id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.birds_areas ALTER COLUMN id SET DEFAULT nextval('tests_projects.birds_areas_id_seq'::regclass);


--
-- Name: birds_spots id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.birds_spots ALTER COLUMN id SET DEFAULT nextval('tests_projects.birds_spots_id_seq'::regclass);


--
-- Name: children_layer id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.children_layer ALTER COLUMN id SET DEFAULT nextval('tests_projects.children_layer_id_seq'::regclass);


--
-- Name: data_integers id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.data_integers ALTER COLUMN id SET DEFAULT nextval('tests_projects.data_integers_id_seq'::regclass);


--
-- Name: data_trad_en_fr id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.data_trad_en_fr ALTER COLUMN id SET DEFAULT nextval('tests_projects.data_trad_en_fr_id_seq'::regclass);


--
-- Name: data_uids id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.data_uids ALTER COLUMN id SET DEFAULT nextval('tests_projects.data_uids_id_seq'::regclass);


--
-- Name: dnd_form id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.dnd_form ALTER COLUMN id SET DEFAULT nextval('tests_projects.dnd_form_id_seq'::regclass);


--
-- Name: dnd_form_geom id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.dnd_form_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.dnd_form_geom_id_seq'::regclass);


--
-- Name: dnd_popup id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.dnd_popup ALTER COLUMN id SET DEFAULT nextval('tests_projects.dnd_popup_id_seq'::regclass);


--
-- Name: double_geom id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.double_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.double_geom_id_seq'::regclass);


--
-- Name: edition_layer_embed_child id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.edition_layer_embed_child ALTER COLUMN id SET DEFAULT nextval('tests_projects.edition_layer_embed_child_id_seq'::regclass);


--
-- Name: edition_layer_embed_line id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.edition_layer_embed_line ALTER COLUMN id SET DEFAULT nextval('tests_projects.edition_layer_embed_line_id_seq'::regclass);


--
-- Name: edition_layer_embed_point id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.edition_layer_embed_point ALTER COLUMN id SET DEFAULT nextval('tests_projects.edition_layer_embed_point_id_seq'::regclass);


--
-- Name: end2end_form_edition id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.end2end_form_edition ALTER COLUMN id SET DEFAULT nextval('tests_projects.end2end_form_edition_id_seq'::regclass);


--
-- Name: end2end_form_edition_geom id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.end2end_form_edition_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.end2end_form_edition_geom_id_seq'::regclass);


--
-- Name: filter_layer_by_user gid; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user ALTER COLUMN gid SET DEFAULT nextval('tests_projects.filter_layer_by_user_gid_seq'::regclass);


--
-- Name: filter_layer_by_user_edition_only gid; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user_edition_only ALTER COLUMN gid SET DEFAULT nextval('tests_projects.filter_layer_by_user_edition_only_gid_seq'::regclass);


--
-- Name: form_advanced_point id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_advanced_point ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_advanced_point_id_seq'::regclass);


--
-- Name: form_edition_all_fields_types id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_all_fields_types ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_all_fields_types_id_seq'::regclass);


--
-- Name: form_edition_line_2154 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_line_2154 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_line_2154_id_seq'::regclass);


--
-- Name: form_edition_line_3857 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_line_3857 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_line_3857_id_seq'::regclass);


--
-- Name: form_edition_line_4326 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_line_4326 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_line_4326_id_seq'::regclass);


--
-- Name: form_edition_point_2154 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_point_2154 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_point_2154_id_seq'::regclass);


--
-- Name: form_edition_point_3857 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_point_3857 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_point_3857_id_seq'::regclass);


--
-- Name: form_edition_point_4326 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_point_4326 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_point_4326_id_seq'::regclass);


--
-- Name: form_edition_polygon_2154 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_polygon_2154 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_polygon_2154_id_seq'::regclass);


--
-- Name: form_edition_polygon_3857 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_polygon_3857 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_polygon_3857_id_seq'::regclass);


--
-- Name: form_edition_polygon_4326 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_polygon_4326 ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_polygon_4326_id_seq'::regclass);


--
-- Name: form_edition_snap id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_snap_id_seq'::regclass);


--
-- Name: form_edition_snap_control id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_control ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_snap_control_id_seq'::regclass);


--
-- Name: form_edition_snap_line id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_line ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_snap_line_id_seq'::regclass);


--
-- Name: form_edition_snap_point id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_point ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_snap_point_id_seq'::regclass);


--
-- Name: form_edition_snap_polygon id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_polygon ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_snap_polygon_id_seq'::regclass);


--
-- Name: form_edition_upload id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_upload_id_seq'::regclass);


--
-- Name: form_edition_upload_webdav id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_upload_webdav_id_seq'::regclass);


--
-- Name: form_edition_upload_webdav_child_attachments id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav_child_attachments ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_upload_webdav_child_attachments_id_seq'::regclass);


--
-- Name: form_edition_upload_webdav_geom id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_upload_webdav_geom_id_seq'::regclass);


--
-- Name: form_edition_upload_webdav_parent_geom id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav_parent_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_upload_webdav_parent_geom_id_seq'::regclass);


--
-- Name: form_edition_vr_dd_list id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_dd_list ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_vr_dd_list_id_seq'::regclass);


--
-- Name: form_edition_vr_list id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_list ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_vr_list_id_seq'::regclass);


--
-- Name: form_edition_vr_point id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_point ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_vr_point_id_seq'::regclass);


--
-- Name: form_filter id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_filter ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_filter_id_seq'::regclass);


--
-- Name: form_filter_child_bus_stops id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_filter_child_bus_stops ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_filter_child_bus_stops_id_seq'::regclass);


--
-- Name: huge_table id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.huge_table ALTER COLUMN id SET DEFAULT nextval('tests_projects.huge_table_id_seq'::regclass);


--
-- Name: layer_legend_categorized id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.layer_legend_categorized ALTER COLUMN id SET DEFAULT nextval('tests_projects.layer_legend_categorized_id_seq'::regclass);


--
-- Name: layer_legend_single_symbol id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.layer_legend_single_symbol ALTER COLUMN id SET DEFAULT nextval('tests_projects.layer_legend_single_symbol_id_seq'::regclass);


--
-- Name: layer_with_no_filter gid; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.layer_with_no_filter ALTER COLUMN gid SET DEFAULT nextval('tests_projects.layer_with_no_filter_gid_seq'::regclass);


--
-- Name: lookup_1 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.lookup_1 ALTER COLUMN id SET DEFAULT nextval('tests_projects.lookup_1_id_seq'::regclass);


--
-- Name: lookup_2 id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.lookup_2 ALTER COLUMN id SET DEFAULT nextval('tests_projects.lookup_2_id_seq'::regclass);


--
-- Name: many_bool_formats id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.many_bool_formats ALTER COLUMN id SET DEFAULT nextval('tests_projects.many_bool_formats_id_seq'::regclass);


--
-- Name: many_date_formats id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.many_date_formats ALTER COLUMN id SET DEFAULT nextval('tests_projects.many_date_formats_id_seq'::regclass);


--
-- Name: natural_areas id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.natural_areas ALTER COLUMN id SET DEFAULT nextval('tests_projects.natural_areas_id_seq'::regclass);


--
-- Name: parent_layer id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.parent_layer ALTER COLUMN id SET DEFAULT nextval('tests_projects.parent_layer_id_seq'::regclass);


--
-- Name: reverse_geom id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.reverse_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.revert_geom_id_seq'::regclass);


--
-- Name: selection id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.selection ALTER COLUMN id SET DEFAULT nextval('tests_projects.selection_id_seq'::regclass);


--
-- Name: selection_polygon id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.selection_polygon ALTER COLUMN id SET DEFAULT nextval('tests_projects.selection_polygon_id_seq'::regclass);


--
-- Name: shop_bakery_pg id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.shop_bakery_pg ALTER COLUMN id SET DEFAULT nextval('tests_projects.shop_bakery_id_0_seq'::regclass);


--
-- Name: single_wms_baselayer id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_baselayer ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_baselayer_id_seq'::regclass);


--
-- Name: single_wms_baselayer_two id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_baselayer_two ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_baselayer_two_id_seq'::regclass);


--
-- Name: single_wms_lines id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_lines ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_lines_id_seq'::regclass);


--
-- Name: single_wms_lines_group id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_lines_group ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_lines_group_id_seq'::regclass);


--
-- Name: single_wms_lines_group_as_layer id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_lines_group_as_layer ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_lines_group_as_layer_id_seq'::regclass);


--
-- Name: single_wms_points id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_points ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_points_id_seq'::regclass);


--
-- Name: single_wms_points_group id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_points_group ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_points_group_id_seq'::regclass);


--
-- Name: single_wms_polygons id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_polygons ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_polygons_id_seq'::regclass);


--
-- Name: single_wms_polygons_group_as_layer id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_polygons_group_as_layer ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_polygons_group_as_layer_id_seq'::regclass);


--
-- Name: single_wms_tiled_baselayer id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_tiled_baselayer ALTER COLUMN id SET DEFAULT nextval('tests_projects.single_wms_tiled_baselayer_id_seq'::regclass);


--
-- Name: sousquartiers id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.sousquartiers ALTER COLUMN id SET DEFAULT nextval('tests_projects.sousquartiers_id_seq'::regclass);


--
-- Name: text_widget_point_edit id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.text_widget_point_edit ALTER COLUMN id SET DEFAULT nextval('tests_projects.text_widget_point_edit_id_seq'::regclass);


--
-- Name: time_manager gid; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.time_manager ALTER COLUMN gid SET DEFAULT nextval('tests_projects.time_manager_gid_seq'::regclass);


--
-- Name: townhalls_pg id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.townhalls_pg ALTER COLUMN id SET DEFAULT nextval('tests_projects."townhalls_EPSG2154_id_seq"'::regclass);


--
-- Name: tramway_lines id_line; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_lines ALTER COLUMN id_line SET DEFAULT nextval('tests_projects.tramway_lines_id_tram_seq'::regclass);


--
-- Name: tramway_pivot id_pivot; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_pivot ALTER COLUMN id_pivot SET DEFAULT nextval('tests_projects.tramway_pivot_id_pivot_seq'::regclass);


--
-- Name: tramway_stops id_stop; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_stops ALTER COLUMN id_stop SET DEFAULT nextval('tests_projects.tramway_stops_id_stop_seq'::regclass);


--
-- Name: triple_geom id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.triple_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.triple_geom_id_seq'::regclass);


--
-- Name: xss id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.xss ALTER COLUMN id SET DEFAULT nextval('tests_projects.xss_id_seq'::regclass);


--
-- Data for Name: attribute_table; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.attribute_table (id, label_from_int_value_relation, label_from_text_value_relation, label_from_int_value_map, label_from_text_value_map, label_from_int_relation_reference, label_from_text_relation_reference, label_from_array_int_multiple_value_relation, label_from_array_text_multiple_value_relation, label_from_text_multiple_value_relation) FROM stdin;
1	1	first	1	un	1	first	{1}	{first}	{"first"}
2	2	second	2	deux	2	second	{2}	{second}	{"second"}
3	3	third	3	trois	3	third	{3}	{third}	{"third"}
4	4	fourth	4	quatre	4	fourth	{1,2,3,4}	{first,second,third,fourth}	{"first","second","third","fourth"}
\.


--
-- Data for Name: birds; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.birds (id, bird_name, bird_scientific_name) FROM stdin;
1	Greater flamingo	Phoenicopterus roseus
2	Black-winged stilt	Himantopus himantopus
3	Purple heron	Ardea purpurea
4	Kingfisher	Alcedo atthis
5	Eurasian teal	Anas crecca
6	Common tern	Sterna hirundo
7	Black-headed gull	Chroicocephalus ridibundus
8	Little grebe	Tachybaptus ruficollis
\.


--
-- Data for Name: birds_areas; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.birds_areas (id, bird_id, natural_area_id) FROM stdin;
1	1	1
2	2	1
3	6	1
4	8	1
5	1	2
6	3	2
7	5	2
8	1	3
9	4	3
10	7	3
11	2	3
12	3	3
13	5	3
14	8	3
\.


--
-- Data for Name: birds_spots; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.birds_spots (id, area_id, spot_name) FROM stdin;
1	1	North tower
2	1	South tower
3	2	East tower
4	2	Vignalie tower
5	3	West tower
\.


--
-- Data for Name: children_layer; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.children_layer (id, parent_id, comment) FROM stdin;
1	2	\N
2	1	first comment
3	1	second comment
\.


--
-- Data for Name: data_integers; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.data_integers (id, label) FROM stdin;
1	first
2	second
3	third
4	fourth
5	fifth
6	sixth
7	seventh
8	eighth
9	ninth
10	tenth
\.


--
-- Data for Name: data_trad_en_fr; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.data_trad_en_fr (id, label_en, label_fr) FROM stdin;
1	first	premier
2	second	deuxième
3	third	troisième
4	fourth	quatrième
\.


--
-- Data for Name: data_uids; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.data_uids (id, uid, label) FROM stdin;
1	00304c51-794c-46df-b17f-84dc797fb227	first
2	4f44046a-88e5-4ec4-bab4-b16d841433c8	second
3	00cd40ee-c7a0-4d19-8985-86a21fee0502	third
4	2b91cf36-67c6-40f1-a0cb-af7e57e290d8	fourth
5	2460e97e-b226-4f53-9f02-bf0d573a8b30	fifth
\.


--
-- Data for Name: dnd_form; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.dnd_form (id, field_in_dnd_form, field_not_in_dnd_form) FROM stdin;
1	test	test
\.


--
-- Data for Name: dnd_form_geom; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.dnd_form_geom (id, field_in_dnd_form, field_not_in_dnd_form, geom) FROM stdin;
1	test_geom	test_geom	01010000206A080000BF599997AB39254116EA7038651D5841
\.


--
-- Data for Name: dnd_popup; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.dnd_popup (id, field_tab1, field_tab2, geom) FROM stdin;
1	tab1_value	tab2_value	01030000206A0800000100000004000000541E93BC41682741EFF7CD63FDF6574182A712AB07682741602DE34CB7F157411AFC5F7C19AD27413F086B27A5F15741541E93BC41682741EFF7CD63FDF65741
2	\N	\N	01030000206A08000001000000040000002AE4B62B3E6927418A4F186F3DF85741F4E1E68337AE2741A143F22A09F2574170B84E664BAE27414C64E47D33F857412AE4B62B3E6927418A4F186F3DF85741
\.


--
-- Data for Name: double_geom; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.double_geom (id, title, geom, geom_d) FROM stdin;
1	F2	0103000020E610000001000000060000005520F9393F8E0E4043232852C1CD454091126D1728C40E4049F9C8EAF5CB454015E1134ED2540E40190EB02B2ECC454015E1134ED2540E40190EB02B2ECC454089C25720B0490E402CE5037573CE45405520F9393F8E0E4043232852C1CD4540	0103000020E61000000100000007000000879AE9F0C7BA0E4030327583F7D1454067325F7DA79E0E404EB50AFEA5D04540FA7B2DC3A5AF0E40CC0ED2F6E3CE45408E34CC0DD0C10E40F5B479184BCF45408E34CC0DD0C10E40F5B479184BCF4540BC614BB6D4EA0E40BE84EFBB22D04540879AE9F0C7BA0E4030327583F7D14540
\.


--
-- Data for Name: edition_layer_embed_child; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.edition_layer_embed_child (id, descr) FROM stdin;
1	External1
2	External2
\.


--
-- Data for Name: edition_layer_embed_line; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.edition_layer_embed_line (id, descr, geom) FROM stdin;
1	Line1	0102000020E61000000200000094A384CD4FDF0E408076888FC4CA454093B1E7F88F540F40B9EC7E14F8CB4540
2	Line2	0102000020E610000002000000B77CE5D938BF0E40921F2ED9AACC45401A956FEB839E0E40404F49F9E0CF4540
\.


--
-- Data for Name: edition_layer_embed_point; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.edition_layer_embed_point (id, id_ext_point, descr, geom) FROM stdin;
1	1	Point1	0101000020E61000003E7C3323ADF30E40EFCE98ADC5D04540
2	2	Point2	0101000020E6100000132532C38BE00E405159256142CE4540
3	\N	Point2	0101000020E6100000932A36E3EF190F40AB0239509FCE4540
\.


--
-- Data for Name: end2end_form_edition; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.end2end_form_edition (id, value) FROM stdin;
1	42
\.


--
-- Data for Name: end2end_form_edition_geom; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.end2end_form_edition_geom (id, value, geom) FROM stdin;
\.


--
-- Data for Name: filter_layer_by_user; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.filter_layer_by_user (gid, "user", "group", geom) FROM stdin;
1	admin	\N	01010000206A08000000E08B6EAA0E744090DC4977C6372F41
3	\N	\N	01010000206A08000028B76AD632CBE540B5C59180B9102E41
2	user_in_group_a,user_in_group_b	\N	01010000206A08000084D3086E0FDFF3404A2C05E482472F41
\.


--
-- Data for Name: filter_layer_by_user_edition_only; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.filter_layer_by_user_edition_only (gid, "user", "group", geom) FROM stdin;
1	admin	\N	01010000206A08000038F12038DF36C9409B93D65E66BE2C41
2	user_in_group_a	\N	01010000206A0800009E69E05761FFEF40ACBFA74377BA2C41
3	\N	\N	01010000206A0800007E208A652CB4E3403CB2FDB3DAB42B41
\.


--
-- Data for Name: form_advanced_point; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_advanced_point (id, geom, has_photo, website, quartier, sousquartier) FROM stdin;
\.


--
-- Data for Name: form_edition_all_fields_types; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_all_fields_types (id, integer_field, boolean_nullable, boolean_notnull_for_checkbox, boolean_readonly, integer_array, text, uids, value_map_integer, html_text, multiline_text) FROM stdin;
\.


--
-- Data for Name: form_edition_line_2154; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_line_2154 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_line_3857; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_line_3857 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_line_4326; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_line_4326 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_point_2154; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_point_2154 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_point_3857; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_point_3857 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_point_4326; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_point_4326 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_polygon_2154; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_polygon_2154 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_polygon_3857; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_polygon_3857 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_polygon_4326; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_polygon_4326 (id, label, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_snap; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_snap (id, geom) FROM stdin;
1	0101000020E61000006977A7BFB7E80E40177AB26FEFCE4540
2	0101000020E6100000C70EE32C16530F4000895515D3CE4540
\.


--
-- Data for Name: form_edition_snap_control; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_snap_control (id, geom) FROM stdin;
\.


--
-- Data for Name: form_edition_snap_line; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_snap_line (id, geom) FROM stdin;
1	0102000020E61000000400000042D99C104AD70E4050A8CB6624CD45400A91624980D00E40F54343E87CCF4540EAB4A6511FEE0E40A6042869E9D04540140CA8B140010F4053283BC05BD14540
2	0102000020E6100000030000003E6604FDD9160F4027CCC20D69CB45407DA52D023C160F40323F457C17CE4540149359C7E03B0F401DF2BCEE2CCE4540
\.


--
-- Data for Name: form_edition_snap_point; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_snap_point (id, geom) FROM stdin;
1	0101000020E6100000F0AEF07A2FE90E4014D8230552CF4540
2	0101000020E610000068BD055DFB290F40FBE25380D8CE4540
3	0101000020E6100000A878D83735F10E4069C908F27FCC4540
\.


--
-- Data for Name: form_edition_snap_polygon; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_snap_polygon (id, geom) FROM stdin;
1	0103000020E610000001000000040000004CD08B4EE2CF0E40749731B8B7CB4540A9757D4CBDEE0E40AD99D2243ECB454031EE198091E80E40E044FF5B2ECA45404CD08B4EE2CF0E40749731B8B7CB4540
2	0103000020E6100000010000000400000063C3BB33EB2E0F40616C3290FDCF4540465DF33A720F0F4086B6CAC58DD145400B9C6A8948430F409B656C1A00D2454063C3BB33EB2E0F40616C3290FDCF4540
\.


--
-- Data for Name: form_edition_upload; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_upload (id, generic_file, text_file, image_file, text_file_mandatory, image_file_mandatory, image_file_specific_root_folder) FROM stdin;
2	\N	\N	\N	media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt	media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg	../media/specific_media_folder/random-4.jpg
3	\N	\N	\N	media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg	../media/specific_media_folder/random-4.jpg	media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt
\.


--
-- Data for Name: form_edition_upload_webdav; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_upload_webdav (id, remote_path, local_path) FROM stdin;
\.


--
-- Data for Name: form_edition_upload_webdav_child_attachments; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_upload_webdav_child_attachments (id, id_parent, remote_path) FROM stdin;
1	1	http://webdav/logo.png
2	1	http://webdav/test_upload.conf
\.


--
-- Data for Name: form_edition_upload_webdav_geom; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_upload_webdav_geom (id, remote_path, local_path, geom) FROM stdin;
1	http://webdav/logo.png	\N	0101000020E610000006521A766BB0FC3F8A557EA334084740
2	http://webdav/test_upload.conf	\N	0101000020E6100000E0283E5447A8E7BFA6E8291692404740
3	http://webdav/test_upload.txt	\N	0101000020E6100000A0440C44BB0ACD3F7E59E5616BE54640
\.


--
-- Data for Name: form_edition_upload_webdav_parent_geom; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_upload_webdav_parent_geom (id, descr, geom) FROM stdin;
1	Parent feat, has attachments	0101000020E6100000607440FCDFDBF03F8A41890489CE4640
\.


--
-- Data for Name: form_edition_vr_dd_list; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_vr_dd_list (id, code, label) FROM stdin;
1	A	Zone A
2	B	Zone B
\.


--
-- Data for Name: form_edition_vr_list; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_vr_list (id, code, label, code_parent, geom) FROM stdin;
1	A1	Zone A1	A	0103000020E610000001000000050000000000000000000000000000000000484000000000000000400000000000004840000000000000004000000000000047400000000000000000000000000000474000000000000000000000000000004840
2	A2	Zone A2	A	0103000020E610000001000000050000000000000000000040000000000000484000000000000010400000000000004840000000000000104000000000000047400000000000000040000000000000474000000000000000400000000000004840
3	B1	Zone B1	B	0103000020E610000001000000050000000000000000000000000000000000474000000000000000400000000000004740000000000000004000000000000046400000000000000000000000000000464000000000000000000000000000004740
4	B2	Zone B2	B	0103000020E610000001000000050000000000000000000040000000000000474000000000000010400000000000004740000000000000104000000000000046400000000000000040000000000000464000000000000000400000000000004740
\.


--
-- Data for Name: form_edition_vr_point; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_edition_vr_point (id, code_without_exp, code_with_simple_exp, code_for_drill_down_exp, code_with_drill_down_exp, code_with_geom_exp, geom) FROM stdin;
\.


--
-- Data for Name: form_filter; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_filter (id, label, geom) FROM stdin;
1	simple label	01010000206A080000ABDA509923FA8340CA9A3B72843672C0
2	Œuvres d'art et monuments de l'espace urbain	01010000206A0800000000000000B0844000000000004885C0
3	monuments	01010000206A080000BC144539B49A9040D88E7FA8F0C072C0
4	monuments 2	01010000206A080000BA9926EC46DC9140DD5B3AA4A0AD80C0
\.


--
-- Data for Name: form_filter_child_bus_stops; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.form_filter_child_bus_stops (id, label, id_parent, geom) FROM stdin;
1	A	1	01010000206A080000296A14F957AC8040CE7BB4B21BD278C0
2	B	1	01010000206A0800001309D622BA978640CE7BB4B21BD278C0
3	C	2	01010000206A0800001302B5B3601F8040F4D9A32B7AC389C0
4	D	2	01010000206A080000BF5504F67B758440FCA0A7E556F889C0
5	E	2	01010000206A08000089C562200A9F8940008E53CEF5098AC0
\.


--
-- Data for Name: huge_table; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.huge_table (id, geom, lookup_1, lookup_2, date_1, num_1, float_1, bool_1) FROM stdin;
1	0101000020E6100000D6E1F9A03C830F407546087621C94540	9	9	2023-10-23	45651	45421.5479395198	f
2	0101000020E6100000E93F858420240F40131B5C466CCB4540	24	4	2016-06-22	47683	33210.7589963613	t
3	0101000020E61000008292921181490F40200A8379FCCC4540	51	10	2018-10-16	6229	5385.53884062574	f
4	0101000020E61000001C38BA58BCFE0E40E8AA266FFFC94540	100	3	2018-08-11	91341	12265.179966882	t
5	0101000020E610000046974A642FC90E4028E1D40634C84540	64	1	2015-10-03	4979	31578.6715002762	t
6	0101000020E610000029940AC5AF460F40068C2E8041CE4540	35	6	2017-11-28	30086	32729.956821795	f
7	0101000020E61000009CC63BC529840E40AB3243938ED04540	15	8	2011-11-18	49573	35264.868597664	t
8	0101000020E6100000950C29FD621B0F4014A030D110CF4540	68	4	2015-04-28	70401	98669.0981058534	t
9	0101000020E6100000EA892F1BC8250F4079E1ED5E25CD4540	43	1	2022-07-24	74861	64657.6696394466	t
10	0101000020E610000029BAD3FA5FED0E40CB4A88F60ED44540	72	8	2012-12-08	47998	88897.2693698517	f
11	0101000020E61000008BCAC991629F0E40C2203CA1ADC84540	25	8	2011-10-15	26546	76055.8651159189	f
12	0101000020E61000007E7C586B141C0F404A27E726E4D34540	45	4	2017-12-02	58147	97094.7307838513	t
13	0101000020E6100000335F15E66FD90E40B87F56753ED14540	81	5	2025-06-04	40030	2426.98872966878	f
14	0101000020E6100000427FDEFC06630E401B382E031FCE4540	47	8	2023-08-29	76887	49554.6436654788	f
15	0101000020E6100000EE606DB7DF5D0F402B4CF2C3BDC94540	91	4	2025-01-10	75769	52192.7017877013	t
16	0101000020E61000004687A118DF8F0E40841FBEBA62D24540	39	7	2011-09-27	8634	51272.1169275674	f
17	0101000020E61000004FA6FC399E680F40152EC65A0BCD4540	7	7	2014-04-27	63975	93075.3998441834	t
18	0101000020E6100000378FD2C33E480F4013F9B3CCD6D04540	10	3	2022-12-15	26284	42505.2804900356	t
19	0101000020E6100000F09759936AFC0E4073CC911D57D14540	97	9	2020-06-20	55736	1557.66923421654	f
20	0101000020E61000008FE0AEB8E55E0F403965CD3221C94540	8	5	2021-07-08	37716	29308.0578795615	f
21	0101000020E61000003E2CFBFD36040F402304CF57E7CC4540	76	7	2024-05-08	83667	67142.2415487501	t
22	0101000020E6100000F20D1C2752850E40EAF0DD29FFD24540	60	6	2013-09-08	87069	80075.6576296332	t
23	0101000020E610000058CE4ACE12760E40DBEDF21C98D34540	1	7	2025-10-29	67405	48170.5794914678	f
24	0101000020E6100000DAF731120C9C0F400913A35BF3C94540	71	10	2012-04-05	59203	11817.3735050019	t
25	0101000020E6100000361CA0DD844E0F405386BA72B2D34540	47	5	2018-12-10	48603	27146.5733510625	t
26	0101000020E6100000C5250209036A0E40090181C251D34540	48	3	2011-10-22	20677	27585.8105155015	t
27	0101000020E61000004904994AF0020F400475F976A7D04540	59	3	2024-03-29	92805	31606.6140585336	t
28	0101000020E610000065A1936525770F40A87A161E4ECE4540	85	3	2012-04-06	37425	38488.297068602	t
29	0101000020E6100000A86D161EDFDD0E404C44777907CD4540	10	5	2010-10-06	48547	80811.9075599682	t
30	0101000020E6100000E0EE55DEAC520F4094041E3F66CB4540	42	1	2024-12-13	74666	87621.9055176164	t
31	0101000020E61000004C2FBF3D49530F40BA12FA37C6D14540	33	6	2017-06-25	89665	88078.4672015432	t
32	0101000020E6100000C20AA50E00940E407EE7A139DACA4540	15	10	2020-07-26	71530	5825.24747597701	f
33	0101000020E610000097494E27B27B0F4026E8CE4104D34540	10	7	2019-04-07	21163	37591.9965700215	f
34	0101000020E610000086F95CB2CBF60E40F7725A8390D14540	42	9	2016-05-29	91696	39256.4446297122	t
35	0101000020E6100000BA9398DB5DF00E40DD6CFBD995C84540	68	2	2016-09-27	70126	37581.5297633815	t
36	0101000020E6100000517E1AE9A2250F40259314889ED44540	54	3	2022-09-05	92865	75568.5947376236	f
37	0101000020E6100000443C2647536C0E4062F69CF12ED04540	32	6	2022-07-07	81501	99723.2941617522	f
38	0101000020E610000057D5B5BCCD7A0F40D328B47754D34540	49	4	2013-09-23	85250	78321.4238265983	f
39	0101000020E610000034E53E62A48E0F40C53A20F49ECF4540	43	1	2024-03-10	89713	31130.5687247746	t
40	0101000020E6100000671A06E3A35B0F402FF13C4332D54540	12	3	2024-06-28	69198	31526.1884378192	t
41	0101000020E6100000A876B20455E50E40962D4FB5EFD14540	80	6	2011-02-22	58403	26111.7085077144	f
42	0101000020E61000006093580526300F4058016B27C4CA4540	16	5	2024-08-30	94733	65761.257014776	t
43	0101000020E61000002BF0B2ED2F3E0F40B6958A45D0CD4540	26	4	2012-12-18	77357	95693.937095664	t
44	0101000020E610000052F49285A1970F400AEED4C859D34540	64	8	2011-12-01	69303	91651.2063328161	t
45	0101000020E61000009803526E1DCB0E4059897BEACCCF4540	22	5	2024-02-16	67758	51496.8824827435	t
46	0101000020E6100000A513308C158C0F4043A630E6D3C74540	7	8	2024-11-17	9992	30312.3750886596	f
47	0101000020E6100000EE10C3E25A8F0F40C96A90212CD04540	63	7	2025-06-25	37149	37348.8094992305	f
48	0101000020E6100000E1309332B3BF0E407CF38F0AB8CA4540	21	10	2018-09-11	71840	38909.5848533078	t
49	0101000020E6100000838399885AD10E405AD9C8A750C94540	4	5	2011-03-08	62247	41557.5001856749	t
50	0101000020E6100000F1DC90D989540F40B39C9FC900D34540	100	5	2018-10-05	29916	97982.7969071813	f
51	0101000020E6100000E65563DA04120F4053B23397C8CF4540	55	5	2022-03-27	95896	37444.5542846745	f
52	0101000020E6100000047F8E5134F50E40B3101B7FA1CF4540	93	9	2011-09-28	10669	41519.9663611045	f
53	0101000020E61000005284B022F9F00E403CA99AAFA3C94540	2	1	2010-03-01	46793	72219.0264987214	t
54	0101000020E610000028E1C07D8A480F4047016BD4C8CD4540	30	8	2018-09-26	30010	50739.9416413395	t
55	0101000020E6100000ECFA870532C90E400B268BD520D34540	22	3	2020-03-30	5601	11146.6988194278	t
56	0101000020E61000004757072737ED0E40044BDC3318C84540	34	7	2015-11-22	39581	1265.47959146797	t
57	0101000020E6100000071BC94D42B60E4045741493E3CA4540	50	8	2024-02-15	2670	56300.3644116702	f
58	0101000020E6100000BE94293073390F40357169BA6DC94540	53	4	2022-10-09	26085	36914.0392034943	f
59	0101000020E6100000AF9996E081970E406F3440BCFCD44540	46	7	2016-03-10	74756	52346.7512921174	f
60	0101000020E6100000B22C9658C8B30E40E262431EF1CD4540	70	9	2024-06-30	81226	3927.25378400283	f
61	0101000020E610000024043152EC8C0F40DC34D1F183CB4540	81	8	2016-07-25	22719	69529.6950387867	f
62	0101000020E610000050483BBA869B0F40C2F3DE3C05CD4540	39	3	2014-02-14	78598	84454.981725386	f
63	0101000020E6100000F315A71A53340F402F70AF55E6CD4540	69	4	2017-07-03	81456	62111.5371659297	t
64	0101000020E61000004880FB6B051D0F4004584A2035D24540	31	8	2015-07-04	18589	19030.0465439601	t
65	0101000020E6100000EBB6DDD02C200F40159973A602D14540	2	10	2024-09-08	5761	90915.9410436369	f
66	0101000020E61000007948C0B3D81E0F40A6785BFB59CD4540	37	2	2010-10-06	14425	41772.9604251866	f
67	0101000020E610000057D68A6A4F1C0F403F1D863264D34540	29	8	2025-04-12	74775	43430.1592447692	f
68	0101000020E61000009217BDF2BA780F400D63B8612FD04540	52	4	2016-06-08	40592	97097.091204167	f
69	0101000020E6100000B8D668D2BFFF0E4099D0FC9AD5D34540	54	4	2013-07-07	55856	59667.2844333753	t
70	0101000020E6100000254C03C5E8810F404015F4EF09CF4540	23	2	2024-12-18	62563	72275.7086304232	t
71	0101000020E6100000D1CFDE163AC60E407DB8A521EFD04540	65	6	2022-12-14	34644	59462.0185140388	t
72	0101000020E6100000ACF68A6930BE0E40D70F883EA1D14540	60	9	2017-10-14	49108	85200.205522831	f
73	0101000020E6100000E96778D45B330F40E397CD9D3ACB4540	28	4	2017-01-11	2953	7711.4068362518	f
74	0101000020E6100000D5A9916E02660F402B3600CA76C84540	95	8	2015-12-16	16808	86409.8936981464	t
75	0101000020E6100000F49F647B411C0F40A7FCAB6389D44540	96	10	2021-02-10	28908	72003.265169737	f
76	0101000020E610000036D85063CF650E40E31FBD34EEC74540	31	10	2015-03-29	65925	9535.28472179033	t
77	0101000020E61000009669C06552A00E4015E2E47A64CA4540	47	1	2011-10-31	90440	2039.31109449149	f
78	0101000020E6100000B90699535E700E407F4CB9F6B4C84540	14	10	2021-06-27	89292	51614.9621709189	t
79	0101000020E6100000E76F73F05D6C0F4045FD5FE7EAD24540	25	1	2022-10-28	18547	80457.0066478757	f
80	0101000020E61000005538D43679460F4080CEB7A422CA4540	4	2	2012-11-26	41923	33097.7497559736	f
81	0101000020E6100000C922EC690BA90F4002559D1E86CD4540	98	1	2010-01-13	92758	53402.9623406593	f
82	0101000020E6100000B8BDAD21476B0F40D8B0465296CE4540	86	6	2024-12-28	84347	54727.1824072472	f
83	0101000020E61000005522F8367C260F4028D7975821D04540	93	2	2013-03-22	80280	16399.8040484373	t
84	0101000020E6100000A12A2EEFDE750F4056FEF7B233D34540	89	10	2017-11-20	66376	37512.0006323898	f
85	0101000020E61000001CE0F5FE078A0F40A132BF2F2ACE4540	42	4	2014-06-17	85813	25031.9692279456	f
86	0101000020E61000002A3FB323B9EC0E40024D078B13CB4540	16	8	2015-08-27	67759	60905.8795016742	t
87	0101000020E610000086D480968CA60F40B1717669C4CC4540	5	9	2016-03-05	38255	80579.9158989125	f
88	0101000020E6100000BE34088690980E4093CD19DA1BC84540	75	10	2025-09-15	17048	81939.5145836821	t
89	0101000020E6100000F2C20B0A36FB0E407354D2F5D9CB4540	22	7	2021-08-22	37880	29.8561335412728	t
90	0101000020E61000006B97284A7F460F402061817B5ACA4540	48	8	2011-10-30	54474	46633.6003932595	t
91	0101000020E610000013CE7C28E8750F402238E9B3E9CB4540	70	3	2024-04-29	17385	58630.0949055849	f
92	0101000020E61000002E4CF1DD788D0F40D2FC847338C94540	77	6	2011-07-24	4045	46133.229368588	t
93	0101000020E610000025E4B76B97F70E404FEA49914BCE4540	58	10	2020-07-04	67078	26753.0004019928	t
94	0101000020E610000097C88562DBE20E4095A310B32FD24540	86	4	2014-01-03	20340	80914.3820245499	f
95	0101000020E6100000D22F6DC4B6110F408D4AD50282D34540	67	5	2017-05-24	86844	66972.7443203586	t
96	0101000020E61000009B3006A66C050F400E41F2B1B9C94540	48	8	2013-12-28	2818	75838.9106610688	t
97	0101000020E61000008D9EFBAFDAA10F40BBE9DA84A8CF4540	36	4	2017-05-30	14492	26760.0616130997	t
98	0101000020E6100000709D289CC0DF0E40A7FA34BDC9C94540	20	5	2019-12-25	47795	94318.780331069	t
99	0101000020E6100000CEFD58D380380F4090B27C0892CE4540	67	3	2018-12-22	47613	51323.8044822889	f
100	0101000020E6100000E74EBBD07E730E403320F3B67DC84540	48	10	2010-05-30	63269	93780.5372001828	f
101	0101000020E6100000E49D09BA5C600F4059D0B70058D34540	8	3	2024-09-12	2788	23042.0989180104	f
102	0101000020E610000012C32301E9160F401606A1111DC94540	5	5	2014-09-16	84715	69828.4235473685	t
103	0101000020E610000022B8D3C841FC0E4088CC8CCBD1D24540	89	10	2011-09-24	96397	60097.7657835292	f
104	0101000020E6100000E47B57B750180F40F9B67806F0CA4540	22	9	2018-03-09	61787	51242.1756254686	t
105	0101000020E610000029ADFCF91BE80E40A8A83C6D2DCD4540	20	3	2019-05-09	9877	19557.6674520506	f
106	0101000020E610000005895CA7C28D0F40146728B7DDC94540	74	1	2018-08-14	821	18890.2303993679	t
107	0101000020E61000007729C6581B5A0F40828FD00531CB4540	24	9	2021-01-06	85946	41154.8798942791	f
108	0101000020E61000004B5640BE7DAB0E40C6FDB9AA3ED44540	43	8	2011-08-15	43134	33925.1169568753	t
109	0101000020E61000000E851FBADEE80E4018DBCC7E13CC4540	52	7	2015-01-29	55049	84553.5167233186	t
110	0101000020E610000027E417B332A80E40A06C6F8B91C84540	59	6	2023-07-26	91966	42634.3923514942	f
111	0101000020E61000009669891A1ADA0E40CD009DE4F1D34540	98	8	2020-03-03	10675	23141.8366474041	f
112	0101000020E6100000FC8BD4AFDCEF0E4009348BDF04CC4540	11	7	2023-02-27	97872	40602.6846493566	f
113	0101000020E61000004452EB723E460F40A728EA4241CD4540	65	2	2021-07-01	46190	84198.6659731997	t
114	0101000020E6100000505F2730B1AF0F4044D323F4FED04540	2	7	2020-11-24	61148	21278.5000274863	t
115	0101000020E61000009D3A7F15CAC30E404BFE8B8F30CD4540	59	3	2018-10-26	90494	10326.3712336161	f
116	0101000020E6100000380699BCB2290F40FD8394A21DCF4540	40	7	2012-11-13	68951	70890.9239807796	t
117	0101000020E61000005B1DD813646E0E40F8AED9C509CA4540	56	5	2020-01-29	17543	66882.7820714207	f
118	0101000020E61000009BA40E6379EF0E4053979E943DD34540	21	2	2021-05-18	76341	21509.2811284739	t
119	0101000020E6100000DB463A7973B10F4047EBB344F6D44540	94	10	2023-01-19	71446	9851.85748681401	t
120	0101000020E6100000E0BF42D997B50E40123B9DCA98D24540	39	10	2014-02-22	85494	2605.32948254093	t
121	0101000020E61000004877700358C30E409C7DDFB52CC94540	88	3	2013-05-11	94086	53742.7919794649	t
122	0101000020E6100000BF67B4C0C07C0E4045504759DDCB4540	4	3	2020-12-08	95411	98245.7113456613	t
123	0101000020E6100000B766FD69D68C0F4060B53C6DD9C94540	72	7	2024-06-16	91365	31483.5574487813	f
124	0101000020E6100000CD63CF82B6A20E405A70C77446D04540	95	10	2025-05-15	74890	70488.4809446054	t
125	0101000020E61000002A739F75809B0E401FE6F978B6CE4540	35	5	2011-10-08	2057	75824.5176304954	t
126	0101000020E6100000E974A23117D60E406285931AA8D04540	96	1	2018-11-16	44815	89607.9362322223	t
127	0101000020E610000016B29DB29F7F0F4057A5E05713CB4540	82	1	2019-04-10	51437	36413.2638667593	t
128	0101000020E6100000716368026FEF0E409746D31878D44540	60	9	2022-10-08	12526	18152.8881608538	t
129	0101000020E61000004B2EA07796580F40D4A30B9EF3C84540	66	5	2016-06-05	31045	94460.4098075214	t
130	0101000020E6100000588AA17BB5880E407D8E70D58ACD4540	6	7	2010-08-25	83572	92586.5213748075	t
131	0101000020E61000002E0A8DA4F4A60F401869A14AB6D34540	15	5	2011-12-30	78198	9052.43023057742	t
132	0101000020E61000008A8C83C214520F40BFD4A8B866CD4540	25	4	2012-05-12	14999	77734.277971422	f
133	0101000020E61000007AA8EEBC632B0F4054C62AB6D7D14540	84	4	2018-05-08	10243	4008.01968602575	t
134	0101000020E6100000D7CBB66120DF0E40FB64F7E4FCD24540	96	2	2013-11-23	75572	61228.0867782979	t
135	0101000020E61000001B641F8AA47E0E40840B3164C3CD4540	83	1	2015-02-09	59632	98291.4544065428	f
136	0101000020E6100000038814860BB60E4070A3A7EA26D14540	82	9	2018-07-08	33476	74529.2899451826	t
137	0101000020E6100000FDAA1D689F6C0E4083D2D60FCBCE4540	70	8	2015-10-31	69805	39620.3384583869	t
138	0101000020E61000000DB50BC7C7CF0E4011B2D042DBCD4540	30	9	2011-09-09	59764	57079.8483278444	t
139	0101000020E61000003212F31281250F40819513D173C84540	42	8	2011-04-17	22698	85040.5934479511	t
140	0101000020E61000009623FC27EFB10F40C9781CCDC9D14540	42	10	2013-01-31	59910	88878.0283389637	f
141	0101000020E6100000F435DD64AC630E40FF642E2999CE4540	33	4	2022-02-01	76930	7012.95700768181	t
142	0101000020E610000055C5C541B0B60E40AC66EA66F5D34540	70	9	2011-06-24	43739	9937.84931090427	t
143	0101000020E6100000F7B8939D40890F40DAA4EBEFD2CC4540	68	7	2018-10-09	2626	61639.0643818939	f
144	0101000020E610000021D693FBFE790F40BA79210178D04540	79	2	2025-06-15	24389	92483.2643033923	t
145	0101000020E61000002F7AC57948870E4088D6C9F40AD14540	87	3	2020-08-25	59384	81115.4860180413	t
146	0101000020E610000099D081A3C6610F40E0C2E099FED24540	1	8	2023-02-06	72082	41727.0377682194	f
147	0101000020E6100000B66C37A9214C0F40DB441A00C3C94540	87	6	2022-02-09	3140	81756.3819293709	t
148	0101000020E61000009953F1B39E1C0F40E01E705590C94540	83	3	2017-08-28	73718	59096.6768442698	t
149	0101000020E6100000CEC9054D48C00E402A19AE7C10D44540	97	7	2011-07-07	27144	95379.1368947595	t
150	0101000020E6100000F80E58D8A9B70E40A780F6FEA0D14540	13	9	2012-03-04	66062	53397.4906688164	t
151	0101000020E6100000BE452F5C6AB40E4022D11BDA12C94540	72	10	2016-05-26	25310	72604.2379518147	f
152	0101000020E6100000C6C6C57A6A310F40502B2F4FBBC74540	48	3	2013-04-02	80441	89308.7426577403	f
153	0101000020E6100000F7EFCEAF09C20E405A0B7FF9E2C74540	71	1	2020-04-25	40733	5208.78411475969	t
154	0101000020E6100000FD80969C471B0F40F2891CD7F1D04540	58	8	2014-05-13	99250	76727.2222392841	t
155	0101000020E61000004EC1188F33010F40B41AF3D98BCB4540	93	1	2020-03-15	29789	20023.1172533978	t
156	0101000020E610000030EA99CE018C0E4040011B7D41D54540	22	2	2014-10-11	4271	25601.4273595871	t
157	0101000020E610000050E8CD2EE8960E406544853722CE4540	18	8	2022-07-06	49136	20251.9488592826	f
158	0101000020E6100000DAF805DC08FE0E407C299DAFBBCF4540	11	2	2015-07-02	72732	11303.5701053355	f
159	0101000020E61000006867D6BEF9E90E402A6CACEE77CD4540	15	10	2024-06-06	77290	3734.77891291358	t
160	0101000020E610000097DCBED5A1F20E40ABADA120FACF4540	11	6	2017-04-13	43141	33852.1934889955	f
161	0101000020E6100000002C16D7F16A0F4040CF81BBB6CB4540	17	3	2022-03-17	28686	18839.776590378	t
162	0101000020E610000044701D56E4970F40640DB08F5BCD4540	84	9	2012-03-01	5728	99386.4578840153	t
163	0101000020E6100000337862B95F070F40FBD5CA834DC94540	35	8	2023-10-29	23003	18245.2682965643	t
164	0101000020E6100000DD846EBD68B70E40B73A87EDEDC94540	67	4	2025-09-24	13098	36692.8724457769	t
165	0101000020E61000000B50A79D97670E401EF533D5B9CA4540	76	8	2010-03-16	80452	34291.3305548263	t
166	0101000020E6100000CDFF83A016D20E40B5D0BD7BC1CE4540	52	8	2011-04-25	75066	48357.6681640589	f
167	0101000020E610000077C90CCF639C0F407C2958A6ADD14540	42	5	2011-12-03	73954	94234.827174985	t
168	0101000020E6100000E77D4AC961730E4074A6A8761ECD4540	25	2	2024-04-02	95074	62214.8216668851	t
169	0101000020E6100000BF482DBA90650F409BA1784415D44540	94	6	2020-02-06	1929	78231.4845196745	t
170	0101000020E6100000F3561EC1E8A70F40A6C89A1862CC4540	2	9	2010-09-22	48823	49141.120584673	t
171	0101000020E61000007B2C5AE142A30E4047119A9993CF4540	83	4	2025-03-11	60002	31640.1551768572	t
172	0101000020E61000005153145F1CB70E40EABAEDE533D14540	85	10	2025-10-22	90141	87031.9708851251	t
173	0101000020E6100000FCE1C47F077C0E40BB5568D890CD4540	76	9	2024-02-23	67898	4643.18095757046	t
174	0101000020E61000004136BB4BE6A10F40D621BDE3C2D14540	43	5	2021-04-05	20189	27688.2011906855	f
175	0101000020E61000008D36BCDB09660E401088ED4788D14540	2	4	2011-05-05	71372	4235.82034003605	t
176	0101000020E6100000870505CB21820E4089DFFA43FFD44540	80	5	2020-06-14	60762	93116.739949315	f
177	0101000020E6100000F23E81B797230F408B963FC4E2D24540	7	4	2019-01-19	78443	16622.0883477074	t
178	0101000020E6100000BCD50BD12B640E40F930C4790DC84540	37	3	2025-05-03	84390	17049.0204890999	t
179	0101000020E61000001F894E4C60DB0E4092B987311CCC4540	82	2	2014-03-03	55753	15999.8175742642	f
180	0101000020E6100000210B87C763AB0F4026A5AD3906D34540	44	6	2014-07-13	42620	37532.0070063056	t
181	0101000020E6100000F62F958798F50E40BF2D001FC8D34540	68	5	2017-11-12	77747	32004.1295557087	f
182	0101000020E6100000779645510E690E4022519F5C1ACA4540	90	7	2014-06-18	51104	24799.6450375388	f
183	0101000020E61000001ED07371BDD90E4011A0468EDACD4540	53	7	2024-12-03	2939	31580.6450036667	f
184	0101000020E61000009841ADE020360F40C84C398E91CD4540	33	4	2018-02-28	45477	96795.2882189446	f
185	0101000020E61000005C99D03C24E20E40CEBE35FD09D44540	8	5	2016-01-04	64915	81839.8751593605	t
186	0101000020E6100000E37EE1B075800F40424CBEACB8C74540	74	7	2014-07-13	40834	12894.1266113248	t
187	0101000020E610000009A940CB087F0E40A6408BB9E2D44540	30	8	2017-08-12	98709	24289.4392888717	f
188	0101000020E610000014F6E286DDC30E405859E4E571CA4540	71	6	2010-10-20	56719	15996.2587539006	t
189	0101000020E61000004B0D66B3D1AE0E40CF4ADDC0B7CB4540	46	9	2024-11-21	38031	61675.465674511	f
190	0101000020E6100000BBE0653D0F700F40D586C5AB5CCC4540	80	9	2012-12-04	51659	67934.4929979567	f
191	0101000020E61000003A6AA32068940F40B869DBB67DD44540	82	9	2014-04-13	62397	10592.6431852583	t
192	0101000020E610000018BDAD2012680E40A2E479995ACF4540	63	2	2010-09-25	68216	72395.8525967844	f
193	0101000020E6100000D6E30DD25E8B0F40D36561384ACD4540	26	9	2021-03-08	84101	87230.1694220169	t
194	0101000020E610000089CBC42D42640F4038EFC9A13AC94540	78	2	2019-03-03	10335	32167.9328031756	t
195	0101000020E610000077EA51252B960E401C46CA65FBC94540	76	3	2020-06-14	49279	82830.2305127211	t
196	0101000020E61000003D986F9D725E0F40D4E7389BEFD04540	43	1	2012-11-17	20673	31927.4262892435	t
197	0101000020E61000004A5A993892440F40EC381B18FACE4540	55	4	2013-06-19	26702	5536.03765010935	f
198	0101000020E61000006F90F756E9500F406A7B096E37CB4540	97	3	2013-11-26	8604	2050.70555334328	f
199	0101000020E610000041E0D3EEA7830E40E66C62BFFFC74540	39	2	2016-06-27	56071	40563.9933115145	f
200	0101000020E61000004C69011A94470F40B0916B553AD04540	28	8	2015-08-04	15630	54740.1849618594	f
201	0101000020E6100000A867FCB593250F40C314E95DF0CD4540	55	4	2017-09-09	56575	82353.5731753896	t
202	0101000020E61000003451D6C5CE7C0F40CDA3641395CC4540	4	5	2010-08-30	33551	53020.3876813097	f
203	0101000020E6100000C951A458D8970E40B6CDFDE47DCD4540	15	1	2023-04-01	45488	64618.7914443452	t
204	0101000020E61000008014C6EBAA6E0F4052BF095871D44540	9	6	2019-01-09	10239	78024.0966126367	f
205	0101000020E61000009FDFFAEA8C980E40CABC66DD3CCD4540	43	9	2018-02-17	45479	21210.4659889107	t
206	0101000020E610000067C45B411A860E4059DF3DFA8BCF4540	73	9	2014-02-12	22404	50632.2463898269	t
207	0101000020E61000004D93508FF45E0F40C0A3B91CDFD44540	56	10	2017-03-09	33792	8794.59372006355	t
208	0101000020E6100000C0C68470C99F0F409DC653D789D24540	88	7	2020-12-29	3892	74343.8476746635	t
209	0101000020E6100000D1F3591661290F40946FA9B461D14540	64	6	2025-12-05	23120	35181.5326521262	f
210	0101000020E610000032FF163D68690F40EF7AC809ACCA4540	51	4	2023-01-21	63875	51806.4740117351	t
211	0101000020E6100000D78B9BC537990E40DE20C7E93BCF4540	89	6	2022-03-25	96548	53267.9854606422	t
212	0101000020E6100000CA35102384D40E4035580A4F53CA4540	90	4	2022-07-05	37482	85203.5889972583	t
213	0101000020E610000022F7D7378DDA0E40E57441CF0ED24540	23	3	2025-11-27	8846	96117.8462168143	t
214	0101000020E6100000FCC7D7D896A10E401C602AC72DCF4540	16	7	2015-07-06	92665	41380.0908291601	f
215	0101000020E6100000191ECAFF6BE10E402EEA7A0233C94540	72	5	2012-11-16	82687	72382.6626064126	t
216	0101000020E61000007F4A135DC0F60E4014D3183331D44540	12	10	2015-10-04	36093	19040.3728778355	f
217	0101000020E610000029DD7A9D61200F40D26F4A3945D34540	45	9	2019-10-23	38555	29083.8224628512	f
218	0101000020E61000007F61E6C735610F40241846CDE0CF4540	51	2	2024-01-02	11917	19822.7489255244	t
219	0101000020E610000027D0E8A0F4FE0E40E29314E0E2C84540	10	9	2016-11-20	57086	71984.076297016	f
220	0101000020E6100000C11A22B50B300F402700A8AFAFCB4540	58	5	2019-11-17	10896	8190.97664450881	f
221	0101000020E6100000A1BE673336A10F40B3C869D7A7D44540	84	1	2018-11-22	50259	9888.77851978474	t
222	0101000020E610000078D9614B23570F408239DEADA0D44540	2	9	2025-03-09	22942	78447.7265059625	f
223	0101000020E61000009445AC5F977E0E40CC09A9CFF7CA4540	92	8	2016-01-02	8646	38732.8365150846	t
224	0101000020E610000032725382A59D0F40439D6F2A39D44540	34	10	2022-01-16	21102	9836.85927850464	f
225	0101000020E6100000A57E4E20F8860E40BCC531B1F5C74540	59	1	2011-05-17	15111	16372.1210698521	t
226	0101000020E610000097E14B578BE60E4022409140FDCD4540	56	4	2023-10-16	18574	78513.2047384552	f
227	0101000020E610000002177A57E1A20F406953B5D626D44540	83	5	2024-12-19	94937	60982.3914237326	f
228	0101000020E6100000ABAEADF3C28C0E4084CE2BF93CCD4540	95	3	2025-07-05	84278	82318.3891214016	t
229	0101000020E6100000B0BB9C3E728E0E40CBA9B51E25D04540	93	8	2010-09-09	63122	44175.1130738564	f
230	0101000020E61000008500ECE7CAFE0E40CFFD5B9357C84540	92	10	2014-11-03	30618	62538.0158133814	t
231	0101000020E61000009833788969B00F40AA6D1465BBD34540	80	6	2011-11-13	31405	36263.5896558327	t
232	0101000020E610000049DCE854306B0E4080FE139C60D14540	16	9	2021-02-02	30442	58808.7469564754	f
233	0101000020E61000005C4C13F113AB0E400D1D6B2D44C94540	55	1	2015-05-17	14338	64774.943895718	t
234	0101000020E6100000AC5AFB2A02970F40CA9EC1840CD24540	62	10	2013-03-18	58819	78113.8234388562	t
235	0101000020E61000009E6E9721D0020F4093E4F76E2ED44540	92	3	2014-10-22	23460	42958.1193496084	t
236	0101000020E61000001B5359DCEF920E40FE48075FE8D44540	66	8	2024-12-19	11150	30713.9159440437	t
237	0101000020E61000004F5D279903740E409E946C282CCB4540	31	3	2012-04-08	37532	84534.2864387781	f
238	0101000020E61000007555A963D9970F40BCF6C3FCACD04540	52	9	2014-03-07	8003	29753.6749811176	t
239	0101000020E6100000082854DA909F0E400DDFC047E2C74540	10	10	2013-05-22	18736	15116.4015806571	t
240	0101000020E61000007CCCA9D0C8A60E40DF92CF1A01D34540	35	6	2017-05-31	57013	2963.25272348004	f
241	0101000020E6100000A762065ACEC80E40E5FDBC0092CB4540	18	2	2023-02-03	37230	75734.3095390615	f
242	0101000020E610000019C73A60C4FB0E40BCF7AE49A1D34540	16	2	2014-05-30	12488	81703.2009269042	f
243	0101000020E610000088F21F3579A60E406B28601D40CA4540	75	2	2023-04-01	58023	51392.5216648015	f
244	0101000020E61000003F13C2864B590F402222C79889C84540	75	9	2018-05-06	91476	23181.7766199454	t
245	0101000020E6100000A6B95524FC8C0E40F43A569CD2D44540	68	3	2022-04-21	61407	96649.4241272069	t
246	0101000020E6100000808E3EF0678A0F409C1E663A3DD54540	23	6	2019-07-15	9678	89699.7617741385	f
247	0101000020E61000007E523EEF9FFB0E404F98226B53CD4540	89	8	2024-05-31	54044	2032.90752576368	t
248	0101000020E61000005DB55EB060F50E40B8E954C8C3D04540	75	3	2016-03-11	63175	78681.3904779258	t
249	0101000020E61000002FFDA0FF746C0F4030FC8F6F1ED34540	13	10	2016-03-09	80073	9146.19169624129	t
250	0101000020E61000007B2E257FF4510F403217C3679DD34540	82	5	2013-07-07	44183	81343.1255043503	t
251	0101000020E61000003162AD0CFDCC0E40169F83C7C5CF4540	4	1	2025-03-25	11632	26124.6206703961	t
252	0101000020E6100000FB715009AC7B0E40C221AC1D68CC4540	46	5	2024-09-17	36771	31154.8679274713	f
253	0101000020E61000001CAA705FD6E40E403CF7ADBF75D04540	14	1	2019-10-13	71365	76919.8823461857	t
254	0101000020E61000006949503F39900E4099C5DAAE4BC84540	76	1	2018-12-04	35636	85549.9982336311	t
255	0101000020E61000003B156A62BABC0E4004C15B0931C84540	41	8	2012-09-21	58790	66834.3826582413	f
256	0101000020E610000049556CCBCFD00E4006B93D0782CE4540	11	10	2012-12-16	35797	47742.8655557659	t
257	0101000020E610000052EA90AC46E40E4089AF2D728AD34540	29	1	2024-11-18	73818	86223.359842865	f
258	0101000020E6100000DAD06BAA6E6E0F400908AC1FA4CE4540	11	8	2013-05-04	46165	7183.92958515617	t
259	0101000020E6100000F20AAAD578A10E406D10BFAB0ED54540	94	3	2020-03-17	62336	31116.0781026655	f
260	0101000020E6100000D3F3863528630E40A9DE655413D04540	14	2	2011-03-24	41849	24671.9100605314	f
261	0101000020E6100000A2CD83ED67F40E405F21272CB3CB4540	9	7	2010-03-28	89618	24160.1022167485	t
262	0101000020E6100000E2A934BE52A50F40C55BD826A1CA4540	3	4	2019-08-01	32729	15201.5168041941	f
263	0101000020E610000080DA6DD585860E402B3DA55A88CC4540	85	2	2022-08-01	9821	59168.3925476753	f
264	0101000020E61000009BCCC920228F0F40F549B3A3CFD34540	86	2	2020-07-21	71559	89364.5042883198	t
265	0101000020E61000005469B75C17D30E40B5F83CCBD9C84540	53	8	2023-12-02	96636	95320.9305732641	t
266	0101000020E61000009F85D3663CA70F40A7291B2908D24540	55	6	2014-08-17	7070	45119.5603231777	f
267	0101000020E61000000348F33A79A20E40BBC0E3D6CCC94540	45	1	2020-12-18	93498	55482.295612735	t
268	0101000020E61000004462CA2D2BF90E4043E3C752BAC94540	95	6	2022-04-19	61532	3941.81192696637	f
269	0101000020E610000095F00419EFB10E405B78ED773FD04540	9	8	2011-03-04	77321	88922.4718964044	f
270	0101000020E61000007D72B470F7960F40454408C895CA4540	80	9	2013-10-29	17442	87749.5512737004	t
271	0101000020E61000007FA3B7680D8D0E40B6FA96131AD14540	32	10	2023-02-01	35685	24175.5206539318	t
272	0101000020E61000007787C5597CCD0E409032BCB008D44540	12	5	2018-06-19	71983	80776.8912191775	f
273	0101000020E61000001D042FD116860E4085ADEC6E50D24540	33	7	2020-02-21	63452	78479.2643744271	t
274	0101000020E6100000CB00E866BB100F401F317692F7D04540	64	6	2013-07-05	33041	49736.8003441733	f
275	0101000020E61000009ECE9F3C3A2F0F40DDDECC185DC94540	78	5	2010-11-24	73688	5132.68924903678	t
276	0101000020E6100000A2CC395D17BF0E40D235C5D148D34540	48	7	2019-05-08	45310	88554.5214123641	t
277	0101000020E61000005306822BEEAA0F401146173A3ED24540	12	2	2025-05-14	28992	41885.0842020668	f
278	0101000020E61000008CD835726C5A0F40A6C7629FBAD44540	87	3	2024-07-17	13453	27026.2024230544	f
279	0101000020E610000087EE29298B7C0E40CF17D34CFDD04540	28	10	2010-05-12	80181	82047.4261117943	f
280	0101000020E6100000F3411F2C9F6A0E40BE340EEC27D14540	17	7	2024-11-05	19123	44133.9056851882	f
281	0101000020E6100000C0B70105A2540F40876D20F4FBC74540	25	4	2023-10-05	38013	1576.93423590981	t
282	0101000020E61000008A57ED6102C50E401A57592C57D14540	85	8	2023-12-29	13261	58797.5746442645	t
283	0101000020E6100000C11ABA8FD57B0F40B057160843C84540	93	1	2010-12-04	55565	29681.0652635582	f
284	0101000020E610000077D0CA3E013F0F4075B9764B20D04540	16	7	2016-08-17	41035	68057.8159000214	t
285	0101000020E610000018288168DC9D0E405B0FEE1C52CC4540	70	5	2018-01-03	12578	94510.2987027692	f
286	0101000020E6100000FE8ABA85F4960F4080308A0B77D44540	90	3	2021-12-17	54276	12214.8929590041	f
287	0101000020E61000009F51EE30E6300F4084D533093CD54540	57	7	2016-11-09	51906	31362.786510158	t
288	0101000020E6100000D3A282B056900E40C5A4304550D14540	68	6	2024-03-05	62289	2796.26140093197	f
289	0101000020E61000009B7367AE2E150F40461CB2F7F7D34540	16	1	2019-06-14	29634	29667.9443192131	t
290	0101000020E6100000174C28BDA1B00E40FC815501E5D44540	47	3	2015-09-24	16302	60769.30446132	f
291	0101000020E610000000F7A1135A630F40073C80D376C94540	36	4	2014-01-11	25067	57957.7109308942	f
292	0101000020E610000027049A5BD6500F4093F27BED2DD24540	66	8	2012-10-03	18782	71306.6624741493	f
293	0101000020E6100000BEB48859A4810E4008427759CFCB4540	21	8	2019-04-06	80895	91778.1520131757	f
294	0101000020E6100000FE85FFF01C680E40E95062B6BECD4540	96	7	2015-02-04	39178	28618.5220617568	t
295	0101000020E6100000F5230AAFC4940E401B2478F68BD24540	12	7	2020-03-28	69559	91619.3913250636	f
296	0101000020E61000005CCB70DDC0CA0E40C6FEA15765D14540	81	3	2025-01-08	88192	96033.6821494529	t
297	0101000020E61000004D83F2C39AB70E40FE31348352D04540	2	8	2014-10-26	91075	7611.27618821966	t
298	0101000020E6100000804D055F341A0F40483F83B87FCB4540	88	6	2012-03-06	68876	55936.0897486717	t
299	0101000020E6100000EEF84FCF7D9D0E40C37FA41AEBCE4540	25	3	2010-10-08	31783	68591.6599433604	t
300	0101000020E6100000ACCD273E666C0E402DCE423D95CD4540	46	10	2021-04-29	4992	99754.152658343	f
301	0101000020E61000007E87B5121EA90E40EAE11CCE42CD4540	74	5	2011-08-28	81762	98601.8624933239	t
302	0101000020E61000004C82792E046E0F40C4EFB92101D14540	6	5	2023-07-26	44017	92598.9124975793	t
303	0101000020E6100000098C909AEE970E4088119227F3C74540	46	5	2024-06-30	30503	39278.2138172397	t
304	0101000020E610000050D5F617CBD10E40CC28455D1BC84540	84	1	2014-03-22	54607	42531.6304980876	f
305	0101000020E61000007664C241178A0F40F52E553857D34540	50	1	2018-06-23	78527	78550.8253421001	f
306	0101000020E6100000F1B52ACFC2CC0E408EEA5BFEC3CA4540	56	6	2016-12-13	72851	15193.0170434302	f
307	0101000020E61000005109594DFC1C0F4068A6E29ABDCE4540	55	3	2022-02-25	67512	75659.0513154922	t
308	0101000020E6100000B6808B0406940F4039ABFE4259D34540	77	3	2011-12-05	60033	35859.3469428175	f
309	0101000020E61000003BF398C032430F40E7F4D8535ACB4540	14	8	2017-08-06	44959	4413.56571222704	t
310	0101000020E61000004FF42166C01B0F409E8D65A9BDC94540	47	9	2011-07-16	48917	28144.6573598312	t
311	0101000020E61000005F8BB42E4C3C0F402C8047CEA7C84540	29	8	2023-11-26	72384	43333.6375572758	t
312	0101000020E6100000B0907464D39F0E406B05021F21D44540	87	7	2014-11-24	13549	63890.7263593689	f
313	0101000020E6100000A0642D03059D0F40533315C5A7C84540	62	5	2015-07-05	94829	24339.2377112106	t
314	0101000020E61000004E170C2CC7DE0E40BEA4DD91B1CB4540	35	8	2022-09-03	62189	32460.4691456236	t
315	0101000020E6100000709EE437BEB70E40F88CEA8E96CB4540	86	5	2019-08-09	41767	74516.8637897008	f
316	0101000020E6100000C7EFC2F081620F40C9E517AA6FCF4540	60	6	2018-04-09	1471	52443.8289320076	t
317	0101000020E6100000543B7C58D95E0F401AFA880277CA4540	61	9	2015-03-09	49360	16773.2008110705	t
318	0101000020E6100000B954D15F63730E4077BA7CD872CD4540	35	10	2017-02-13	66209	99578.0057361295	t
319	0101000020E61000008C08CFC3F6780E40E4E34DE0F5CC4540	19	5	2015-10-01	14629	77142.6984451421	f
320	0101000020E6100000FD44526263770E40C7E2ECE376D54540	90	8	2012-02-01	64359	29694.8473102245	f
321	0101000020E61000004D7D4E9F36A50E40D898680D69CF4540	46	2	2014-05-07	80493	98189.416422499	f
322	0101000020E6100000786783AE74E30E401CB4ACB1B5CB4540	55	8	2012-04-20	89315	56532.9988525117	t
323	0101000020E6100000811A339BF4060F40068B98FF81CA4540	95	2	2021-12-29	60876	44262.6929288424	t
324	0101000020E61000005725882352870F402A262548FFD44540	6	8	2011-06-18	38111	682.472141667811	t
325	0101000020E610000084C3FD19977E0F40372ABC702CD44540	89	8	2015-06-18	36817	65691.3064521	t
326	0101000020E61000005A5CDB18F2BE0E40D403986B99D14540	63	8	2023-02-26	18593	7219.52920008166	f
327	0101000020E6100000FDDA8E78465A0F40BEEB3BFF8FCF4540	55	8	2013-01-16	68705	48471.5833167736	f
328	0101000020E61000006B61B22902520F40ECAFB31310C94540	2	10	2023-01-11	12237	16290.2164945777	f
329	0101000020E6100000A78D523A188B0E40D71A61F778D04540	90	3	2020-09-07	83780	88338.9838534386	t
330	0101000020E61000008212B321B2420F406CA1BEB246CC4540	18	3	2016-06-26	51493	11596.5332211151	t
331	0101000020E61000007129B69E8DAB0F40C8F7DC238CCD4540	9	2	2022-03-17	79670	7031.0751849642	f
332	0101000020E6100000E470E8BA36590F401B9A5C3016CB4540	32	10	2020-08-18	56598	67326.219889385	f
333	0101000020E61000007BBA73FBDDA70F404EF6AE0738D14540	3	9	2016-08-07	31674	11374.9319897468	t
334	0101000020E6100000DEE8EA9104970F40C0C2057D0ED44540	1	8	2010-07-23	12242	79965.9086986752	f
335	0101000020E6100000DEE8D1EAB4550F4033B647C327CC4540	43	9	2019-12-19	17020	18345.6521081196	t
336	0101000020E61000006864B6FC2AB80E40C8871EF6A2D34540	82	10	2013-07-08	4148	14083.5028574282	t
337	0101000020E6100000094ACBD7C6D90E404826707436CD4540	11	2	2021-05-27	90003	35460.9728539698	t
338	0101000020E6100000F4CC855BC7E50E40AC94AA07AAD34540	32	9	2023-10-08	96525	80296.4349925343	f
339	0101000020E6100000D2A221D4499F0F4002832C3F7DCC4540	54	1	2012-02-10	3049	59050.1233740749	t
340	0101000020E61000000F7A9AF234430F40D177FFC567D44540	29	9	2020-12-06	40734	86667.7726291468	t
341	0101000020E610000043ED89C96F840E40A54F247986C94540	64	1	2015-04-17	41324	87223.9591890022	f
342	0101000020E610000038A393249F4A0F407ED4DEC50DD24540	16	1	2012-10-27	90570	8968.54345345446	t
343	0101000020E610000037EB7BD4AE8A0F40DC7F266765C94540	45	5	2018-10-16	71792	44086.8281843324	f
344	0101000020E6100000AEF3A70B6A580F408C3C095F8ACE4540	60	4	2017-05-10	46686	14150.0231542117	t
345	0101000020E61000000908FE8702700E40449E06F029C94540	8	2	2025-09-03	64173	98199.3165573607	f
346	0101000020E61000003B61D1EDB0AC0F40421211F328C94540	91	6	2025-04-27	91996	31987.8186397324	t
347	0101000020E6100000096FF582BEFD0E404306C6D432CA4540	94	2	2025-04-03	20922	14860.8164547042	t
348	0101000020E61000002951BF16B3820E40780D45CE0BCD4540	98	1	2015-10-07	34389	90761.5054082125	t
349	0101000020E61000008F9D5C9DAB740E40FFBCD168CFD44540	18	7	2021-08-08	37224	81216.2115581047	t
350	0101000020E6100000FDE0531B40260F40DBEE0564E5CD4540	97	8	2010-01-15	96127	20936.590167135	f
351	0101000020E6100000BF3F8D0C62FE0E406DF34DD885CD4540	44	1	2013-04-16	17354	89829.6516055447	t
352	0101000020E6100000C015C03A76A20F408ED8509EA7C94540	36	9	2013-03-27	40009	47482.3652476949	f
353	0101000020E6100000269D16D373BD0E40904C3D9C4DD14540	73	7	2023-07-10	8774	40325.8783914025	t
354	0101000020E61000008A6D984FA6BB0E4021D1A03E9BCA4540	4	5	2012-07-15	41459	22298.5290430823	t
355	0101000020E61000008C5815B8B1160F40E8179F3647D44540	52	4	2014-01-16	14642	34896.1444222357	t
356	0101000020E6100000AD082BB2EE670F4006CD6D30BED04540	97	3	2012-06-14	47356	15691.1533941425	t
357	0101000020E610000086D98AF170720E40FC75CD0569CE4540	77	7	2018-05-05	50565	16792.8599577022	t
358	0101000020E6100000341334B543220F401B2BA715ECD04540	83	8	2016-09-24	66762	93506.7009718491	f
359	0101000020E6100000C1283BDDE17F0E40DEBA63311FCA4540	22	8	2014-04-15	90785	52762.101280788	f
360	0101000020E6100000CAD96D00AD8C0E40AE26F4B99BCC4540	56	2	2020-01-08	37949	70633.7723012447	t
361	0101000020E61000007212904F4FB10E405DFC11A21BC84540	66	5	2017-11-05	34254	25655.1394010819	t
362	0101000020E61000000071A473628B0F404AD0FEE97AD14540	44	1	2014-05-27	81718	76598.9846028578	f
363	0101000020E6100000D9ACFF9CCCD60E4019BEC6E9E2CC4540	81	9	2024-06-02	90385	92762.5853975585	t
364	0101000020E610000058DF203CFB620F40F7C143B44DCA4540	22	3	2012-12-09	41843	2340.2109835212	t
365	0101000020E6100000FC61C5B7D9850E40D20F761A6CCD4540	19	10	2021-09-26	79235	90048.6159539188	t
366	0101000020E6100000C15C2859B1BD0E40809B67DB71CF4540	5	9	2023-12-28	39811	77791.8176053311	t
367	0101000020E610000010F28E05AC170F40BE416FE918CE4540	83	6	2018-06-09	44154	65637.1298166947	t
368	0101000020E6100000A53D9290D8EC0E40969AF47F68D14540	83	6	2019-05-27	61388	68779.8516038499	f
369	0101000020E610000018F6595643D00E403B0BCDD7C2C74540	77	8	2019-10-31	42314	72435.0188236543	t
370	0101000020E6100000634F98DC40870F40CA434BAF2CC94540	26	6	2022-08-27	86180	210.849332583596	t
371	0101000020E61000003F61E398B9730F4053F516BB24CC4540	35	10	2018-06-11	95852	77366.4403972047	t
372	0101000020E610000066E0835FA6990F40E783A53CC8D24540	33	2	2010-08-30	61236	29935.5354764023	f
373	0101000020E6100000CE4E230E52600F40579F0957C0CE4540	38	1	2017-10-22	75451	12248.7763790086	t
374	0101000020E6100000623DA4C2F6190F404EECD37285D24540	81	10	2010-07-15	98465	50119.516453632	t
375	0101000020E61000008F75835EC36C0E4031469543B1D04540	46	7	2019-08-03	80751	13502.8015268697	f
376	0101000020E6100000FE6329D52A1C0F40E5502D2593D04540	73	3	2016-06-19	45861	41027.3005377461	t
377	0101000020E61000003BE5829E5AB00F407FECC2B85ED44540	39	8	2023-07-20	29244	52216.7874469953	t
378	0101000020E610000049DEB5C18DB50E40808BB8CAF5D44540	59	4	2022-01-12	3656	20195.8568601736	t
379	0101000020E610000048A248CC5C790F40266EFC7B93CA4540	61	5	2017-07-31	5578	56048.8784896171	f
380	0101000020E6100000A9F590C339880E40AC2D0C93B7D14540	93	3	2017-10-05	18713	32910.1949411224	f
381	0101000020E6100000625DAFF56D680F401C26D04815D24540	96	1	2017-09-03	88115	1557.72969720704	t
382	0101000020E61000000714EA1CF7F00E40E971406ECDD34540	6	5	2015-02-01	60831	92351.8783877363	f
383	0101000020E61000007A6561C5A7840F4043CB5CE5FACE4540	77	6	2013-09-02	67271	31056.3154999703	f
384	0101000020E6100000FBCD4E532CDD0E40F7536B7C98C84540	5	8	2020-04-08	17321	23394.4800278778	f
385	0101000020E6100000DE7DB96B969D0E40E1F66D1E1DCB4540	78	6	2025-08-28	54072	8912.37882725355	f
386	0101000020E6100000B7D0027F69BB0E409F0863D440D34540	18	10	2022-02-07	61336	34930.7134210337	t
387	0101000020E61000006625A12D5F530F401F47D2C4ABCF4540	81	5	2011-02-14	65024	89187.5155596847	t
388	0101000020E61000006C332456C0F20E40AF8BB94E5FCD4540	51	5	2014-04-06	52380	21569.9925653664	t
389	0101000020E61000002567931843260F404F407A94EFD14540	11	7	2013-11-10	42335	26047.0053326507	t
390	0101000020E61000002147D30395890F40E1924CB3E6CB4540	60	5	2023-08-20	69133	48186.2553710246	t
391	0101000020E6100000075A1B3E8D570F401509409D22D24540	17	9	2021-07-07	43452	97678.2906136329	t
392	0101000020E610000042FCF25355070F4001428A2174CB4540	25	4	2025-05-20	28049	43497.558994702	t
393	0101000020E6100000081C1B1261810F40B9F098CD15D24540	91	7	2018-02-05	72688	19615.5289872225	f
394	0101000020E610000093013E276B9B0F407746494BF7D04540	97	2	2013-08-07	89881	14208.7441072704	t
395	0101000020E61000004254172F45C70E401286A9FB2CC84540	19	1	2021-05-15	55448	80810.9178998148	f
396	0101000020E6100000A1ABCFC95E2E0F401D05BC2CE4CB4540	66	10	2022-06-08	41780	7383.69790294762	t
397	0101000020E61000001305647D92CF0E402F264B3818CC4540	46	6	2025-12-25	50240	76967.1850982412	t
398	0101000020E61000007377B6434EE30E40FEBABC4DBBCA4540	54	8	2020-09-19	79441	81030.4864240452	t
399	0101000020E61000004209D0B796AE0E40D58D21D471CB4540	21	5	2013-06-12	80019	71910.308236608	f
400	0101000020E6100000B94AEDAF629E0E4032301AF763CD4540	90	5	2024-05-07	18160	76004.1363549511	t
401	0101000020E61000008183C622303D0F40ED7F278FDED44540	65	3	2016-06-16	60231	31105.3583858636	t
402	0101000020E61000001BB81301828D0F40328637972CD14540	47	4	2014-09-04	36371	6887.71136869537	t
403	0101000020E6100000A12FE154A26C0F40F31F78682CCD4540	25	8	2023-07-04	37184	24746.8458808264	t
404	0101000020E6100000441056BC4A6F0E406DBFAAA7B6D34540	30	2	2022-09-07	79115	34537.4050683278	t
405	0101000020E610000002032AD7637C0E4094A703C613D54540	58	7	2016-01-26	17996	21101.3464236369	t
406	0101000020E6100000D9ADA9216E870E40C8949EF184D34540	9	8	2025-06-06	29081	45320.5647309086	t
407	0101000020E6100000190A1AF2A3FF0E40361E564593D24540	36	8	2013-03-26	42842	49128.0939273073	t
408	0101000020E610000053677DAF5CDB0E4042E35ED076CE4540	80	8	2025-06-22	74184	45323.8692439325	f
409	0101000020E6100000D17F9097A98A0F405F2B3A6495D14540	37	6	2019-08-11	46201	71993.6806082667	t
410	0101000020E6100000A020D72F511B0F406BE12ED02DCD4540	95	9	2019-06-03	32773	44075.474131914	t
411	0101000020E610000092483C5367100F40016425FA89D14540	50	3	2021-05-28	49475	8502.8297878756	t
412	0101000020E61000004D34C11A02FA0E40EBC9A54E32CB4540	23	6	2019-02-17	24861	20898.278215093	t
413	0101000020E6100000E775E7C79ECA0E40FB76252CC2D44540	65	4	2015-03-02	91971	93687.3267318715	f
414	0101000020E6100000728EDF1344A80E408DF7EE4514C84540	28	2	2014-06-30	52069	71917.4592120363	t
415	0101000020E610000007405090AFAF0E40FB4482BC46CC4540	7	5	2021-07-01	27590	48407.5601480758	t
416	0101000020E61000008150596F85300F4087CA8D9442D44540	39	7	2019-03-02	70269	13067.6582209312	f
417	0101000020E6100000149F8A7FB8C80E4057EB07DB8ACE4540	87	10	2023-06-02	71019	89689.7063455113	f
418	0101000020E6100000A7465959CE8C0E40DBE60AC3CCD04540	67	3	2015-02-18	8024	76690.8186303731	f
419	0101000020E61000004E0F329E0D0B0F4086C675E06DD04540	72	5	2010-01-13	90101	14972.9548066242	t
420	0101000020E610000082820A03102D0F408E50CB7732C84540	17	2	2022-05-03	44341	50233.8747108579	t
421	0101000020E6100000E9E40B0918D50E409CD58121B4CF4540	30	2	2016-09-25	12954	85312.084868707	t
422	0101000020E61000003867024B1C130F405EA17BCCBDD24540	78	1	2021-04-23	57477	85774.5802174788	f
423	0101000020E6100000C06140DECFC70E40C6D2361897C94540	88	2	2023-01-08	14839	31928.7683364958	t
424	0101000020E6100000B1B66BA9226A0F40D786A3143ED54540	75	3	2018-08-03	62929	28179.9905040552	t
425	0101000020E61000002FC360EDC8A60F4082010BB54AC94540	29	3	2025-12-11	69127	22267.3965281011	t
426	0101000020E610000081460BB206F20E4058379DA6B5CA4540	70	2	2015-03-27	42705	73354.9773740597	t
427	0101000020E6100000DF2D6BD7CA910F40FFEBF5BEA2D04540	64	7	2014-12-25	29654	20025.2017262166	f
428	0101000020E61000001383B7A5052F0F40C6EB94F412D44540	100	6	2019-04-02	49365	50011.1086644878	t
429	0101000020E6100000F2B7B80E3D460F408D24393411D44540	87	8	2010-09-11	96461	42532.0511368477	f
430	0101000020E610000024758147752B0F40ED52BCC7D7CE4540	26	2	2010-02-03	68395	44779.4805971072	t
431	0101000020E610000012F2E77E4B710E407CBE446F20D04540	59	2	2013-08-08	67655	56485.0008567454	t
432	0101000020E61000003CA63A9432CB0E4012E4BA6CD0D14540	24	9	2015-02-13	80952	65901.1399293291	t
433	0101000020E6100000D89AF7460AA00E405283BD8882CE4540	76	8	2022-02-28	63316	43086.5564299957	f
434	0101000020E61000009E31669098210F4057CC836183CE4540	7	5	2019-07-09	26458	69948.7049445902	t
435	0101000020E6100000B02B06ACD09F0F40B13B3E41E3CB4540	67	6	2013-02-03	57830	96216.5871760359	t
436	0101000020E610000037C79C0E51F80E40C234656BD9CC4540	70	10	2013-04-29	99907	17601.8507807845	f
437	0101000020E6100000ACA4683C0D720F4076A02D66B7D24540	57	5	2017-11-14	96288	153.706519830976	t
438	0101000020E61000005B84972C398B0F4082AF931C49CA4540	99	8	2024-01-16	3587	45199.8222313591	t
439	0101000020E610000072DF5F65BA620F40007596177BCE4540	28	6	2016-08-14	45180	60415.3592807039	f
440	0101000020E610000075E4960B16830E40B01E3CA4B4D14540	52	2	2025-12-01	43375	34521.828030385	f
441	0101000020E61000005D2B897718090F405C2855DA8DCF4540	51	1	2020-09-08	66121	84290.7172671307	t
442	0101000020E6100000CD5CD80C366F0E40E26A14BA06D24540	73	6	2012-03-05	63559	39159.6140691967	t
443	0101000020E610000043451351FDC20E407288B52199CC4540	52	2	2014-11-11	57572	46781.2439995294	t
444	0101000020E61000007AD437D644DC0E409C1E8CFB20D04540	96	6	2020-07-14	38981	57300.6640664041	t
445	0101000020E6100000BBA9EE28EEC60E40B01CB54CCAD04540	55	6	2011-07-21	60723	94399.8300406314	t
446	0101000020E6100000F87B9D3AA9630F40CE9C8104E7C74540	35	10	2024-08-21	71271	66789.2988520349	t
447	0101000020E61000006A5C41C73A340F400CF9A0E038D14540	28	2	2024-04-29	74043	26278.2478305952	t
448	0101000020E6100000884E1974F5670E4060E4FDA4DCC84540	14	6	2012-03-05	31669	17804.3055341492	t
449	0101000020E61000005C55B3A01F960F40B75AD426C1CA4540	77	8	2012-01-13	23131	42418.1444703889	t
450	0101000020E61000008E31C33A8F2C0F409B00149242CA4540	95	4	2016-04-29	32512	95313.4321779785	t
451	0101000020E61000009593C7FADEAE0E40A15E6D1950CE4540	42	10	2014-10-05	80625	65866.4121825414	t
452	0101000020E6100000BA97348FF6000F4037538B77C7D24540	44	4	2013-12-07	86031	3271.52226058463	t
453	0101000020E610000079F2ABA288840F40A87B935C71CC4540	86	5	2016-12-24	60066	21756.3939261068	t
454	0101000020E6100000C4E5FA20DB340F4098AC61369FC94540	87	9	2025-01-10	33687	16885.5433241473	f
455	0101000020E6100000F5553884EA0E0F40DD238EF900D44540	9	5	2011-07-01	92378	43581.9534065507	t
456	0101000020E6100000251886243B9A0F402C666C4C8AC94540	63	6	2022-05-31	48518	62999.8548036147	f
457	0101000020E61000007392257168A30F40B4F4A00357CA4540	76	1	2017-08-06	86840	26847.4693893231	t
458	0101000020E61000005C0EF221C6CB0E407663C9EEC8D24540	16	1	2012-06-19	55203	58497.2493226515	f
459	0101000020E61000004CB54127DE2F0F4069ABA60198D24540	87	3	2011-01-23	98404	53332.4909281903	f
460	0101000020E61000008532064C48D10E402631F697F0C84540	75	4	2017-06-15	58695	79994.2455468888	f
461	0101000020E6100000DD3700F2DA990F408C8CD45B64CB4540	87	1	2019-05-15	49314	77513.2889705757	f
462	0101000020E6100000EA16E56B192B0F40C962B4867AD44540	19	6	2024-10-18	49865	27610.7377859756	f
463	0101000020E6100000E1C6C5D0588D0F404E04941252C94540	96	1	2020-08-09	72195	32289.1779502267	f
464	0101000020E610000043BE02FC55B80E406F6210C470CF4540	67	4	2023-02-18	72040	66697.7517124291	f
465	0101000020E6100000EF931DD2894E0F40FB4C20980FD04540	87	4	2018-08-02	34718	31055.3623259391	t
466	0101000020E6100000D0CC465D2C690E402ECF3D165FD04540	32	1	2016-07-24	94886	22207.8983893828	t
467	0101000020E610000033048A8999B00E40DF8FFA30DAD24540	80	10	2014-08-02	74329	84000.7442690742	t
468	0101000020E61000003CA82BBA13E10E40D131788142D54540	29	8	2025-09-26	76618	393.744506817995	t
469	0101000020E610000049A43580B5870E4091C28D0231CB4540	95	1	2013-02-11	87303	79030.0640172255	t
470	0101000020E61000000E26DAA4AA690E40D59198DEB4CF4540	81	1	2010-07-12	44478	84188.5228154819	f
471	0101000020E610000023F0107292AE0F4063635A4460C84540	71	1	2019-02-26	68829	75376.9172620235	f
472	0101000020E6100000A684C17F6A010F402C6A76B977CD4540	2	1	2020-05-14	80843	91585.2360353848	f
473	0101000020E61000009DCD722902F30E4030555F7D2BC84540	69	4	2020-12-17	28411	94892.7946961901	t
474	0101000020E61000009D53A332E8A60F40F1603AE350D24540	64	10	2021-09-08	34810	29451.5326731267	t
475	0101000020E6100000B135F6A6081A0F40BDEB3841CFCC4540	43	1	2020-10-26	80885	57899.0757347471	f
476	0101000020E6100000F9F73D7FA0300F40A4339AFF8CCC4540	91	3	2010-11-20	23362	75068.4484137313	t
477	0101000020E610000087E079DE1E980F40833B497FB9C74540	27	9	2016-03-08	88244	24815.6292841758	f
478	0101000020E6100000B91A8C382A300F40505A0599C2C94540	38	5	2012-08-27	27045	21354.098850035	t
479	0101000020E61000000C3E6514171E0F408F14BEE47FCF4540	53	7	2022-07-16	49707	4529.31491083999	t
480	0101000020E6100000015771C04E780F4042E8283511CD4540	100	2	2014-08-28	26470	32856.0007439266	f
481	0101000020E61000003E13DC7464470F40C9CAB23883CC4540	38	1	2022-01-09	44315	32894.7433500309	t
482	0101000020E6100000A56C267511550F405B07F661ACD34540	30	1	2017-11-25	45674	10241.236540275	f
483	0101000020E61000001DC360B8E2E00E40A064B36A82D04540	27	4	2023-10-02	75866	34588.7065358092	t
484	0101000020E610000098ED932F703B0F40F1886FBB99D34540	37	5	2013-04-18	80046	11535.6313700508	t
485	0101000020E610000033BD79C38CE10E4059A1A50BFACF4540	57	8	2018-02-13	31814	44576.710537373	f
486	0101000020E610000098B0628502A50F40AC4B6DBD6FD24540	36	8	2011-12-16	15966	79531.5175650288	t
487	0101000020E61000004E40F90EC2060F401068D389B9D14540	25	4	2013-02-12	47455	85712.6687450347	t
488	0101000020E61000005C338681AAB70E409675B85FF5D24540	39	6	2021-01-09	59261	66940.2307135847	f
489	0101000020E6100000868C542770B20E404250136283D24540	90	9	2019-02-02	6403	35898.4963809566	f
490	0101000020E610000062E2CF98AD7A0E40D0620671DAD24540	18	8	2021-09-25	74555	59707.704556523	t
491	0101000020E6100000AA80E1E535B30E4023C7F6716BC84540	7	2	2014-11-21	35356	47604.0190009406	t
492	0101000020E6100000D906225CC97A0E40D828DBC965CF4540	34	9	2022-02-24	72963	57444.3987507803	t
493	0101000020E6100000C46BC5BC11A50F4000F261F4C8CD4540	16	2	2010-12-05	34120	55746.4332282383	f
494	0101000020E61000000C6519B47D300F40914A78917ACF4540	34	3	2020-08-20	33090	72143.1208758028	f
495	0101000020E6100000ED6A08CBA0190F40733664B413C94540	25	4	2023-03-10	21174	25452.4370293228	t
496	0101000020E61000008987455309AE0F406934514A06C94540	70	1	2023-02-03	46648	32618.5151732871	t
497	0101000020E610000094E9A475777F0F40532B73B8DCCC4540	4	4	2015-06-21	26891	84518.8346226789	t
498	0101000020E6100000C2CF660BE4820E4056DC71FA28D04540	96	4	2023-10-29	18225	56124.9620133743	f
499	0101000020E6100000C299F39B0B280F40023F812EFFD34540	25	5	2018-07-06	38612	1117.33506882841	f
500	0101000020E610000029D8F76D6B9C0F408813E80344C84540	2	1	2022-12-08	59279	10374.4299432267	f
501	0101000020E6100000DDCA1F9F10E90E40A7B41DA07BC94540	3	6	2013-03-07	38939	55210.8726309183	f
502	0101000020E61000005391FFFD1EFD0E4037F4EA3195CE4540	12	4	2018-03-11	1352	52317.3787035677	t
503	0101000020E61000004F3560C195F20E4000E0EA2CB1C94540	7	4	2010-06-19	73775	4960.15012183058	t
504	0101000020E6100000CC68990C775B0F40AE99D8359CCA4540	48	7	2017-07-07	57487	96332.7820627004	t
505	0101000020E61000003F2E2AB8867A0F4036DD89447ACE4540	6	1	2010-10-21	28665	82453.5572815426	t
506	0101000020E61000009E5C9DAED57F0E40B3FE2B4660CF4540	30	10	2010-09-04	80154	71869.3523475321	f
507	0101000020E6100000FF71A5C1DCF60E404240812583C84540	35	6	2010-04-21	18028	72536.4381304042	f
508	0101000020E610000018FC0754D9CA0E40033DA57410CE4540	15	8	2024-04-05	21280	96234.5749436927	f
509	0101000020E6100000AC72EBBE54730E407A993A5E7AD24540	50	2	2019-07-28	31700	58851.7760724114	f
510	0101000020E610000081B542E1BE660E40B8BB7C7973CC4540	14	5	2021-08-12	596	90889.9335304768	t
511	0101000020E610000066B589F59C180F4012069CF31FCB4540	50	6	2012-06-20	63462	21158.464251808	t
512	0101000020E6100000718DA9C1CFA40F4075C2F9FC34CF4540	46	5	2013-02-25	28305	91893.3030338948	t
513	0101000020E610000026B001D98A210F401945CD5046CB4540	77	7	2024-12-01	91211	55294.082222052	t
514	0101000020E6100000F8A9EE93D2680F40F8DC953618CD4540	28	7	2024-01-02	55526	68199.1803851268	t
515	0101000020E6100000EB0B1089B9070F4002F4C20453CD4540	89	7	2018-09-02	94305	72157.7614714066	t
516	0101000020E610000019078C98C4AC0E409C04957E2ACE4540	13	4	2018-10-14	85188	71981.3514891241	f
517	0101000020E610000099D32D54726C0E40AFABDFD6CACB4540	52	7	2017-10-17	41369	18107.8709144609	f
518	0101000020E6100000B77D4F3551BA0E40C814534E51CA4540	50	1	2017-06-13	97194	15779.281733477	f
519	0101000020E6100000190B18B110660E40134B7F3840C94540	82	1	2022-04-28	15904	82619.0326271289	t
520	0101000020E6100000850B9D829E250F40525CB586C6CB4540	81	4	2025-12-05	95661	14469.5608188536	t
521	0101000020E6100000A3687C20B8C50E409342C8662BC94540	73	10	2014-07-09	81580	91454.9315400304	t
522	0101000020E6100000152A47818D7B0E4007CE597418CB4540	55	9	2018-10-13	9700	82377.8956549728	t
523	0101000020E6100000DBE6AD76C9CC0E408B7A5DE574CC4540	34	6	2016-11-03	58239	20642.3100311697	f
524	0101000020E61000009EDEFD30032A0F403063ECEBA9CE4540	62	4	2014-11-12	7158	78035.9599966652	t
525	0101000020E610000007818E1E64510F4041E3603F6CD44540	91	6	2017-01-29	52345	14539.7403989252	t
526	0101000020E6100000D4D1F60303AB0E408D0BA9E3C1C74540	63	9	2023-06-04	68392	85329.1895434817	t
527	0101000020E61000000E65E457824B0F401B1F85F17DC84540	65	8	2010-07-03	57427	73348.6315427222	f
528	0101000020E6100000A2AF94A1E0BF0E403E0458F1C9CD4540	27	5	2015-02-14	52820	76240.0148812487	f
529	0101000020E6100000BA1FEA39BE640E4042239BD779CA4540	16	5	2018-05-13	5678	51196.8174804	f
530	0101000020E610000032478C2768350F40C82F1614FDCB4540	75	7	2013-06-22	97130	49652.706671322	t
531	0101000020E6100000D47300C4AC330F406B31B9FE68C94540	83	7	2025-04-17	13177	26515.8187726667	t
532	0101000020E6100000579584C0BAEC0E407D85FE8301CB4540	64	10	2019-01-13	59430	45084.8016667338	f
533	0101000020E6100000886C1E9DA01B0F40846DFE2EE7CB4540	42	9	2010-08-05	29959	53298.1257623129	t
534	0101000020E6100000C3AFC983D1040F40314F33F1B7CF4540	97	9	2025-10-31	86176	88463.3935488906	t
535	0101000020E61000008960372D7DC00E40DBEA4DCD1FD34540	22	9	2020-09-29	38541	77103.8375374491	t
536	0101000020E6100000A0582060F02C0F40140D27AF2DCC4540	67	9	2021-08-01	2031	22570.9375873031	f
537	0101000020E6100000379EBFA1AF1F0F401F6BE9F2C1D14540	74	8	2011-02-25	37251	18935.8870272307	f
538	0101000020E6100000353B481E147A0E40F0C92FA6CFCA4540	40	4	2016-06-25	5711	73982.22576261	t
539	0101000020E61000007BCE9194F8DE0E40B1923D7454C94540	4	9	2012-10-27	58727	96508.1859154204	t
540	0101000020E61000001EF610A47A940E4051642E3A5FCA4540	11	4	2012-01-01	95616	51716.3232828128	f
541	0101000020E61000006EAE61B466390F40ABCA1CC3A4D24540	54	2	2019-05-10	91478	32468.8820707284	f
542	0101000020E6100000E036AA7ECF560F4000229B3F32D14540	55	1	2016-12-29	68492	28019.9233412814	f
543	0101000020E61000006B58CBF4F2AF0E40572466A3DACD4540	25	5	2023-03-26	70591	1762.35542912215	f
544	0101000020E6100000FDEC1589313A0F40D55348A485CB4540	47	2	2014-06-04	3158	4729.33314425641	t
545	0101000020E610000001D506F60FC90E40A653F0283CCF4540	9	5	2019-03-26	49430	58583.8749193665	t
546	0101000020E610000059166644633E0F403F78DEF324CB4540	2	8	2020-05-02	87204	61084.6767133748	f
547	0101000020E610000085AE46070B990F4032F9764709C94540	52	2	2021-12-30	46301	99893.2843350615	t
548	0101000020E6100000BF644BCD2FB10E40804C55CB15D54540	20	2	2020-08-08	49312	644.70586612071	t
549	0101000020E6100000AAE79B7369B10E40DAD69DF819CC4540	74	5	2012-08-02	53509	21912.3193338236	t
550	0101000020E610000001EB40C571B50E40DE821DA62BD04540	35	6	2016-05-16	27173	87057.2980070696	f
551	0101000020E6100000AC2F8A8B02F00E40C10BE3CEB4CB4540	46	4	2015-04-07	44372	43587.383763655	f
552	0101000020E6100000B86A7B5AA26F0E40A3CC484AF1CF4540	92	6	2023-03-11	61148	8106.04358795437	f
553	0101000020E6100000A80F310D77CC0E40A882C2E5A4CB4540	46	2	2011-09-06	84126	75392.8349817225	f
554	0101000020E610000004A70E3838830E401B1431E3D4CD4540	37	10	2022-12-22	54287	45593.8098386048	f
555	0101000020E61000000E9A2B81DF740F40D584D48FE4CA4540	96	1	2019-07-07	70148	16665.344930614	t
556	0101000020E610000013C3FCC069040F40A1A32ECA9DCE4540	39	1	2019-10-16	57631	10353.5556415717	t
557	0101000020E61000005F69D95A15380F40235A19BC73D24540	97	5	2016-01-29	7019	31970.251486044	t
558	0101000020E610000051FBD3F122480F40686FD70BC5D44540	47	9	2011-11-01	83747	56366.4091458287	f
559	0101000020E610000066CDF4FA50740F40BE6D6082DEC74540	65	9	2017-12-17	20167	36079.1411008297	f
560	0101000020E6100000D7D79ADFFD250F40FDF27C48AFCB4540	100	2	2021-11-09	69658	16579.3491076233	f
561	0101000020E610000074E39B4A963E0F40E998806444D54540	7	4	2019-01-06	18876	69923.6363411479	f
562	0101000020E610000070A73F0E6E100F40A6AC3D1665CE4540	64	4	2013-06-26	90954	56103.2557849953	t
563	0101000020E6100000105505C580A10E40A2BA617C93CE4540	17	2	2013-09-01	4509	67616.7538211889	f
564	0101000020E6100000A947A16ED17F0F407FBF8C3EF4D34540	93	7	2014-05-11	8656	95181.7087302633	f
565	0101000020E610000081A56E6C736B0E40AAC5CB7F00D44540	47	10	2017-04-02	42396	7256.36434911745	f
566	0101000020E61000003B0C847D0DE50E408B0E6F9E05C94540	99	4	2021-12-26	17247	40263.9843257625	f
567	0101000020E610000011BE8544BC450F4091AAA0FDC4CA4540	52	10	2024-04-16	60119	48437.7411318761	f
568	0101000020E610000081729F90B0050F4063453354E4D04540	51	3	2013-01-27	55139	96836.0723033976	t
569	0101000020E6100000903E692515AC0E4019E607DBC7CF4540	6	3	2022-06-15	94995	80675.7551278073	t
570	0101000020E610000061CC46C4AF540F401259379CFCC94540	69	2	2012-10-31	66455	18499.4198480578	t
571	0101000020E61000007B36E2997A870E40BF1CC1B0F1C94540	44	3	2015-07-24	97591	10971.5337454266	t
572	0101000020E6100000981D5047AE5F0F40B958C4B88FD34540	40	2	2020-07-23	43683	96961.3403273784	f
573	0101000020E6100000A4A2A8A187940E4097FB40A184C94540	79	10	2020-08-22	80747	93401.0264670354	f
574	0101000020E6100000AA7636C28EAA0E40964C0FF103D04540	34	2	2019-04-14	36220	49360.310817982	f
575	0101000020E6100000E4E206B43D800F4066FE762BF2D14540	91	4	2012-05-21	13860	4333.5746983141	f
576	0101000020E61000004B79412139270F40E3C391475DC84540	21	3	2018-06-22	57724	35338.0486287862	f
577	0101000020E6100000A52B9814A5010F4014A7007C3ACE4540	69	6	2019-01-06	56578	80373.8243630664	f
578	0101000020E6100000FF268407B13F0F40AA66063B73CF4540	47	10	2010-08-26	21105	48305.2168261922	t
579	0101000020E6100000944CFBFE75900E40DDEDDE8C7CD24540	57	1	2010-07-25	22491	30509.1713483651	f
580	0101000020E610000061AD19A075F10E40E36738A055CB4540	76	10	2025-07-20	58338	17570.6843804383	f
581	0101000020E6100000733B5F3CCFC50E40C5875FFB0ECF4540	14	7	2013-07-21	49101	41321.5650254457	t
582	0101000020E61000001E8F32A4E4120F403A02063A8CD44540	75	7	2015-10-05	60713	28682.3151146556	t
583	0101000020E6100000527B66E30BAA0E40FFB85E68D6D34540	49	4	2022-12-28	75281	10968.1782342457	t
584	0101000020E61000004E2D8C6B9AC00E4060EDF3083CD14540	66	7	2013-05-29	56184	94841.5839451441	f
585	0101000020E61000003DC84ABC84850F4036794F85B6CB4540	46	6	2013-03-04	72167	13973.620610169	t
586	0101000020E6100000AC5940C3A0660E40EC9D5B75E7CE4540	60	5	2020-09-26	87409	69537.136950365	t
587	0101000020E6100000A5DBB4B053350F4081EC57D709CF4540	46	5	2014-02-22	22167	91283.6724464615	t
588	0101000020E61000000B318B11B3D30E40DAD89042F4CA4540	89	2	2016-05-30	42355	46391.189305183	t
589	0101000020E61000009521859925360F4095B8431E1ACE4540	89	4	2012-09-07	62146	46620.2503440925	t
590	0101000020E610000024B3F55D1AA90E4074EBA4EFA7CE4540	97	9	2012-07-28	58460	50927.9299356836	t
591	0101000020E6100000B0F72E5F06470F40005569A04CD54540	46	7	2018-06-01	775	54418.2700359917	t
592	0101000020E6100000DA539425A46F0E40FCD2B3EA54D14540	2	4	2025-05-29	25771	38779.9441482418	f
593	0101000020E61000002114929A7F170F40232828BBEACF4540	62	2	2015-01-20	61197	84582.2815289732	t
594	0101000020E6100000BF8EE59F31700E403EAE2E70F0CB4540	22	5	2021-04-21	913	59621.9793630423	f
595	0101000020E6100000E0830DEDABB30E4091007BB4D2CC4540	29	3	2015-10-09	41054	38074.6400279669	f
596	0101000020E6100000D9A7A80EE21D0F40BE47F123C2D34540	90	2	2019-04-02	69328	10012.3186994379	t
597	0101000020E610000098BDC319B8A30E40467A2BF521C84540	97	5	2022-06-11	86352	81981.7627211001	t
598	0101000020E6100000093D19BF99120F4025FA7F210ECB4540	43	2	2018-01-22	49396	66096.3281455401	f
599	0101000020E61000004377935EF7470F4040E54BE150D24540	89	9	2017-11-30	2956	80110.5883194659	t
600	0101000020E61000002BE5544DA48E0F409B4A1060CCCA4540	45	7	2010-09-20	52607	64475.0264084104	t
601	0101000020E610000050C28BA8D3BD0E4017517EB40AD34540	89	5	2023-07-28	26119	12908.3561048576	t
602	0101000020E6100000379AC9DC17BD0E406EEB20F843CC4540	32	9	2015-02-22	84223	42630.5869239071	f
603	0101000020E61000001143BE3B60270F4058826F3F75CC4540	69	5	2012-06-09	16603	39974.5183804278	f
604	0101000020E61000000AEF0FDE4C400F40DA6E04B59ECA4540	33	2	2020-05-31	46798	33317.3601409068	f
605	0101000020E61000000DDC87F4A6F60E406CC68BE9BBCC4540	90	1	2015-05-29	62421	55188.0284594512	t
606	0101000020E6100000D6CB912751060F40C3C04AE4F0CB4540	13	5	2014-02-20	8105	48073.4624766518	f
607	0101000020E6100000055AE9987FEF0E405D7D0B8CFECE4540	30	10	2019-09-03	29401	75081.3072127815	t
608	0101000020E61000000E283F9770910F40373F6648D1CC4540	16	3	2014-12-10	12887	95393.6751987047	t
609	0101000020E6100000763B43689D920E40264535E8B0CA4540	56	3	2021-08-31	13367	86827.5674314973	f
610	0101000020E61000009EAF7F60DE660E40CCE51931F1CA4540	100	3	2019-12-28	37570	11850.1121342287	t
611	0101000020E6100000CE9CBC374EC60E40570D474B5DD44540	11	9	2012-12-22	15070	80271.5389976163	f
612	0101000020E6100000D6A696776FD70E4034730CE13FD54540	27	6	2012-07-16	10045	95.8615413977126	t
613	0101000020E610000074D75EEF92E60E40576772D2D1D04540	52	10	2018-09-03	74950	54847.556670857	t
614	0101000020E61000001F1DA6E35C1E0F40A5B6326C57CC4540	87	7	2025-08-12	19831	77056.9670234075	t
615	0101000020E610000010923C9B18210F40AA47F937F9CF4540	93	4	2014-09-19	90658	32823.3075586552	f
616	0101000020E61000003B5786A0B9E30E40189FF60CE8CD4540	20	3	2020-10-27	66886	77768.2419887643	f
617	0101000020E6100000C1B4DEFD20360F40EC1F1E87A4CB4540	1	10	2012-12-26	1936	20315.3944253605	t
618	0101000020E6100000236076A978A00F40B3385732FACD4540	91	2	2013-01-27	52180	23749.3495001177	t
619	0101000020E610000055BC056765740E40471816FFD6CE4540	92	3	2010-08-05	72161	12254.035399354	f
620	0101000020E6100000CBCB3AABE6020F40AA3638AF85D34540	21	8	2012-09-21	88769	57175.1546701374	t
621	0101000020E610000071A1417E07F20E4086039E99E0C74540	63	7	2021-04-16	25321	71382.4020841435	t
622	0101000020E6100000C9A703CDDAA30E4049BFAD9CAEC94540	85	10	2019-07-21	13899	75847.1230288098	f
623	0101000020E610000053A6EA5416DD0E40A2CEB3DC28CB4540	54	6	2018-11-28	87430	99888.9165740683	t
624	0101000020E61000008E1E925EEC8E0E403C745B9F1BCA4540	53	5	2010-01-10	85654	62622.102524456	f
625	0101000020E610000054A4F0E06D210F40C4BD96F41DD54540	6	5	2023-12-09	40873	65493.2411977688	t
626	0101000020E6100000711C3636FCDA0E40225A832C88D34540	48	5	2010-01-11	25810	20780.7075920769	f
627	0101000020E6100000914DFBCE4AD20E40CB22EDB10ACE4540	67	9	2014-11-20	87499	19968.8365291113	f
628	0101000020E61000005AC5FD662BC10E40BF5C77FBE2CC4540	17	10	2022-01-12	57495	32695.9025810608	f
629	0101000020E6100000C6BC8C4F63F20E40670E629AF0D44540	72	3	2015-06-22	55183	44868.466727056	f
630	0101000020E6100000C1CF012ADD930E40491DCC4E83CF4540	22	9	2017-05-02	31038	8674.54962828234	t
631	0101000020E61000009F6250DF28630F402401DD271CD24540	19	2	2023-03-25	79181	34229.3178534874	t
632	0101000020E610000065487C3F4A910F402EC1203001D24540	98	6	2010-02-06	63346	4320.104635202	t
633	0101000020E61000000451BC5830DF0E404A7DE10E91CB4540	66	6	2023-09-28	92636	14683.6350458919	f
634	0101000020E6100000B1DFD0F44C640F40133E6354C8CC4540	41	10	2017-10-08	95000	39137.4184810972	t
635	0101000020E610000095E551BD304B0F40218FB9F4F1C84540	83	6	2012-05-16	90624	56022.2241951344	f
636	0101000020E6100000B5E0307C96700E40B6637FD5C6CC4540	12	10	2018-03-18	93989	29169.6860640623	t
637	0101000020E6100000126E782F90870E406D5282FA99D44540	35	4	2023-09-13	88246	19484.4645266123	f
638	0101000020E61000008E49865851E50E406DFAEFE962CE4540	44	6	2021-03-16	36894	16856.8410084457	t
639	0101000020E61000002299C01A4B7B0E4085D5CAA128CD4540	71	8	2014-03-02	31004	12290.1198643707	t
640	0101000020E61000005CC6DB725DAC0E405C466612C6C94540	54	5	2015-12-24	44048	65414.7040075594	t
641	0101000020E61000005EDF64870CA10E404A9D388E1FC94540	95	4	2010-10-26	10589	18032.2586708487	t
642	0101000020E6100000CAFE6DCAEF130F40F78A62304FC94540	96	10	2016-12-02	57711	4514.84517831104	t
643	0101000020E6100000267F7EDE28AA0E401EEFFC8A0DD14540	78	10	2011-03-22	43726	42432.8569390632	f
644	0101000020E6100000EAC04B9D448E0F40CD9994607AC84540	77	3	2025-05-17	70631	87721.3041598829	t
645	0101000020E6100000E48B685C9DF10E40DD755A1FD5CC4540	33	7	2012-10-28	56660	80916.5279448663	f
646	0101000020E610000079E271ABE0B20E409268C79B3DD24540	14	6	2018-10-19	98003	87376.3756107211	t
647	0101000020E6100000CD60A01F7E6A0E405A72326AB4D24540	64	2	2025-09-03	87086	27561.5634279734	t
648	0101000020E6100000903B328E3BE10E40EB671A5DADCE4540	78	6	2014-07-19	88214	90355.8426928804	t
649	0101000020E61000003B4C5F10F9960E40E5289A56DCC84540	50	5	2023-04-02	78816	97754.0238080657	t
650	0101000020E6100000EC3FAC84EBE10E40CA5082036BD44540	16	3	2014-10-31	46663	46539.3888665597	f
651	0101000020E61000004A8D3864B0BE0E405B747DAC14CC4540	97	2	2014-09-11	56827	31235.3166751038	f
652	0101000020E61000005F2D56B0CFC40E40E4201B54F0CA4540	86	4	2023-11-26	55986	12298.8909228242	t
653	0101000020E6100000ECB825CF142F0F40ED6517C3DBC84540	56	8	2015-12-17	33017	51441.8159779184	t
654	0101000020E6100000EE5749AE23AB0E4068232DA658D34540	68	4	2018-11-19	81539	750.438887665017	t
655	0101000020E61000005CCB8270D1EE0E400D5CD693F8D04540	67	7	2015-05-11	72617	73302.0288854334	f
656	0101000020E61000004E5188EEAC150F40920B6C9B5BCF4540	42	6	2012-05-31	92960	33457.8570136847	t
657	0101000020E6100000DAEB46E99A6E0E40C855271285C84540	27	1	2015-12-30	56536	35355.0155998053	t
658	0101000020E61000003F852844796A0E401A0E1C9326D24540	40	2	2018-12-28	74702	49333.5089599494	f
659	0101000020E61000001792DC300AA20F40152B64AAD3D44540	36	6	2019-07-24	86103	37045.4455432667	f
660	0101000020E61000000A996307C9840F40CD2FD7FCB7CF4540	10	2	2014-11-14	20419	42335.8350137827	t
661	0101000020E610000054B5EC9FB3100F40B00D9913D1CC4540	23	4	2016-12-06	64349	75385.831533799	t
662	0101000020E6100000DE2B9B51B1880E408A76A7EDFCCA4540	36	5	2015-07-05	72592	51806.3907594758	f
663	0101000020E61000001D6C63EB6A6A0F40D63744C12BD34540	77	3	2024-04-10	71440	97993.6967198515	t
664	0101000020E6100000DF9B88EE30BD0E4050BFB234BBC84540	71	8	2014-04-17	52130	3279.63131899569	t
665	0101000020E6100000BC047193F2A90F40F8A6C9CD36CB4540	50	10	2010-10-21	88383	81573.3867155781	f
666	0101000020E6100000405BF355A8A30F4008C71581A2D04540	60	2	2010-02-07	41383	86323.9780780958	t
667	0101000020E6100000EE5A677EF87E0F40B95D72FD32C94540	89	5	2023-10-20	95847	81396.6783390754	t
668	0101000020E610000094605DA461AD0F4080EDCEEA97C84540	15	7	2013-07-21	47725	51982.8332190575	t
669	0101000020E6100000B1F78737314E0F4094F0097808D54540	80	2	2013-11-01	53301	59322.2590184762	t
670	0101000020E6100000CA017C85BED80E407346D369E7D44540	37	7	2020-11-10	40184	81481.282888589	t
671	0101000020E6100000C19B6CFA65930F401A73F5502ED54540	84	1	2015-04-17	16492	27898.3227434864	f
672	0101000020E610000080E3630A041B0F4062BEFA6C85C84540	68	6	2012-01-20	26612	38783.0049987147	f
673	0101000020E6100000C0BB38AF26FB0E4060E92430B1C84540	35	7	2021-10-03	42300	61766.7372153454	f
674	0101000020E6100000A59F80C4AB9E0F400FA7975129CD4540	41	9	2024-12-22	54933	42856.6546987516	f
675	0101000020E6100000AE1581FC310E0F40375A3F4E2BD44540	85	8	2018-03-05	23342	98432.8128050261	f
676	0101000020E61000005A82406B0C450F4004F2D9B4E5C74540	4	9	2025-02-05	4699	781.748541532323	f
677	0101000020E61000002F4639CE554A0F40862C217D64D04540	79	6	2025-08-19	71859	83850.2875397643	f
678	0101000020E6100000D0E5AD3575810E409D4CBFCAADC84540	66	2	2017-01-21	39511	96680.4163875652	t
679	0101000020E6100000316D76F668330F408A98204200CE4540	41	1	2025-06-13	28673	93343.776579299	f
680	0101000020E6100000E6157517FF7B0F40833FA33BC4CA4540	93	3	2017-10-13	95200	21962.1078589136	t
681	0101000020E6100000350C55B025A60E40F5450F204FCB4540	39	1	2022-01-28	17992	6105.08771680156	t
682	0101000020E61000000B68C0A190780F40453FC6A608D14540	87	9	2014-03-19	49641	94638.1883629207	f
683	0101000020E6100000A11E21E3626B0F405CEB21E4F4CF4540	32	10	2014-04-21	15039	34697.3777161235	f
684	0101000020E61000004A99105ADDFE0E407385A13129C94540	6	8	2010-02-11	72614	90681.2394937844	f
685	0101000020E6100000AF32765E9F430F406D37A1DDECCC4540	3	8	2019-04-13	78206	72972.8260038655	t
686	0101000020E6100000DF0A1298B5230F40618FB36C15C94540	37	4	2019-09-15	5088	65021.5493199884	f
687	0101000020E6100000EEFC8B6350900F404575B6F31DD54540	64	9	2018-12-30	77813	74771.2159508488	t
688	0101000020E61000003A0D6E28E6310F4044221C6153D24540	28	10	2024-08-05	51248	87453.6425116361	t
689	0101000020E61000006EBB3038DEAB0F406678C92245D04540	75	5	2014-01-02	78300	9941.25456350969	t
690	0101000020E6100000CC1114CF2E670E40D95EFC9BEED44540	47	9	2013-06-09	5800	10521.2698787277	f
691	0101000020E6100000E814850E46900F409C8A9B51E6D34540	51	3	2025-09-20	47529	48932.6894635052	t
692	0101000020E6100000A3ABFABE16070F4081C851D663CC4540	99	1	2018-01-31	92407	98639.8142901437	t
693	0101000020E6100000ABF5B1F3D53A0F40F7655D66FFC84540	93	3	2017-05-26	52884	41513.3241883889	t
694	0101000020E610000061F7F41EE5AA0F40AAD3CAAE32D54540	96	1	2013-03-22	84572	63718.6791139706	t
695	0101000020E6100000416854B805370F40039017B38BCB4540	99	7	2023-04-23	91693	37324.1917024362	f
696	0101000020E6100000E995927DA75B0F40E38B9E3B6CCA4540	22	5	2013-09-02	18764	40952.8505986682	t
697	0101000020E610000019A727E8BDC50E4047351D374ED24540	75	6	2011-08-01	50604	96719.7203344779	t
698	0101000020E610000041C52FC4F6060F4082AFF0D853D54540	83	10	2017-11-09	94982	20315.9728803589	f
699	0101000020E610000042F4ED8A31910F4095EAFCC79ACB4540	4	1	2020-11-09	69947	48009.7699067707	f
700	0101000020E6100000F06C5527DDAC0F4086B6B373F1C84540	22	10	2023-01-16	25233	69730.4419450715	t
701	0101000020E61000002AE85FDCFDED0E406F3BE169B8CE4540	21	8	2020-09-04	85044	8531.36919330013	t
702	0101000020E61000005C93644299330F4092615E0447CC4540	9	3	2020-08-31	83998	53977.3624770258	t
703	0101000020E6100000C006C6D3D3690F40D4BF8C2CE4C84540	40	1	2025-04-03	65918	12230.4979676681	t
704	0101000020E6100000648BEBBD47910F40DC3B10B700D54540	37	6	2010-08-29	86907	81354.4869978866	t
705	0101000020E610000030E0A15307A10F405ED5216AD6CA4540	97	8	2010-09-13	57265	30826.9313477582	t
706	0101000020E6100000CA970A8069590F403868D16FD6D14540	34	2	2011-08-18	54945	80226.7096534166	f
707	0101000020E6100000BFCF67683EF30E4026E0C7D063C94540	95	1	2015-09-08	14633	68399.2959919757	t
708	0101000020E6100000C19642862E7F0F40BFDDE81826CE4540	63	4	2013-04-08	31860	49837.5640067189	t
709	0101000020E61000004A95705CA3550F401FD7293AC1CE4540	34	9	2020-01-17	97913	18216.9522555845	t
710	0101000020E6100000407A488D99C70E401DFEAABE63D24540	38	7	2017-09-13	51068	25236.5770531257	t
711	0101000020E6100000F74B4879DE680F4071EF118F6CD44540	94	4	2013-12-06	22499	79122.0141940407	f
712	0101000020E61000009FDB713EC7C00E403DFBD6003DCF4540	19	6	2010-02-23	94338	67712.8988847079	t
713	0101000020E61000001A7B524EC5B60E402398C8D0F3CF4540	71	5	2024-12-28	56198	17550.0959855841	t
714	0101000020E61000008456BA78DD6C0E4014AB07F63FD44540	28	7	2012-02-08	40213	15487.2522394263	t
715	0101000020E61000001EA673FC71500F40A341DBC3ABC74540	83	3	2023-03-27	71248	35191.0975044794	t
716	0101000020E61000007473EEF26E4A0F40E296CFE57EC94540	42	5	2013-09-27	25923	501.477583719989	t
717	0101000020E61000006762F51D7FA80E406BAF396EB5D24540	48	2	2021-09-14	96107	88742.9971333412	t
718	0101000020E6100000844A2618918B0E4037EB320A68CD4540	40	8	2014-09-30	62299	93784.3600125127	t
719	0101000020E61000005A6A10C9C7790F40855817F825D24540	5	4	2018-07-07	97491	4907.14093913676	t
720	0101000020E6100000B0AB093B2CA80F407525FE371CD04540	89	8	2018-12-17	42265	78263.9406038103	f
721	0101000020E61000007906CD01BB630F4070F0AA95C2D44540	51	4	2012-09-05	17869	57920.5150749657	t
722	0101000020E61000007367575025AE0E4070AB5FA0CBD14540	68	7	2021-10-08	97319	34736.6974489781	t
723	0101000020E6100000C12789EB7BC40E40B6383D3185C94540	100	2	2025-09-01	31673	69869.4522693898	t
724	0101000020E6100000C304437576670E40FFD8CBB830CD4540	15	7	2025-04-25	10146	95353.1653283234	t
725	0101000020E61000008BCFC1BFEE2D0F40CA56BE1B0DD54540	64	6	2022-07-24	8079	87253.6938252253	t
726	0101000020E6100000F3C641978AB10E400F7307294ACC4540	34	4	2021-02-16	80654	58091.0770268328	t
727	0101000020E6100000BDEF17F026330F40F3011541D3D24540	58	1	2020-10-13	89588	44140.2011058379	t
728	0101000020E6100000E09DE18DCA1F0F40F93BE59BFAC84540	63	1	2011-02-05	84659	56012.0166038839	t
729	0101000020E61000008ED63474049C0E40D105F74CBED44540	39	10	2020-01-22	43269	3198.45057267743	t
730	0101000020E6100000AB628EBE82B70E4072BB6B38FCCD4540	42	3	2023-03-19	28604	26924.1983980699	t
731	0101000020E610000005B2866A397C0F402C52E3960ACD4540	100	9	2017-10-24	71954	85689.5629204423	f
732	0101000020E61000005D196F0FAB690F402F5F22A4FAC94540	6	9	2020-05-08	98334	8466.62773154412	f
733	0101000020E610000033FBCB7A61CC0E40AC5B0147A4C84540	94	6	2024-07-16	22594	34104.7507434379	t
734	0101000020E61000006775CA53B1E40E406E3D9BB775D24540	94	9	2014-11-18	56432	48281.9089131002	t
735	0101000020E6100000A0744DFAAEA50E400FBAC69297CA4540	61	6	2016-08-01	95620	28128.0665207806	t
736	0101000020E61000008B553264BEA80F40DE23077619CB4540	15	3	2016-09-06	61101	69055.9532712081	t
737	0101000020E6100000924E9C41AEAF0F401D9BB5753DCC4540	51	10	2021-05-27	89380	74484.660206736	f
738	0101000020E61000007768EF933B480F40180CC757A4D44540	13	7	2016-02-09	19548	74870.2503156305	f
739	0101000020E6100000840D89F7DC6E0F400178B40F08CB4540	53	7	2025-08-12	29235	72946.1528527364	f
740	0101000020E6100000ED41714308900E40320BC97BECC94540	88	5	2025-08-04	27308	8856.84620226455	f
741	0101000020E610000043AEE6F4C97B0E404C7FA3D3ADCA4540	45	8	2020-10-31	72278	52640.9104973834	t
742	0101000020E61000005FDB52F6F93D0F408969383C00D34540	1	6	2020-05-16	39710	58275.2557666763	t
743	0101000020E610000062F6C75994680F40C47C1BAE35C94540	91	7	2025-02-17	43081	67779.5866543201	f
744	0101000020E61000004FCA06C36BD90E409D7401F157D54540	38	2	2010-11-24	90037	25063.5308386218	t
745	0101000020E6100000263B133F61700E40844A4E0C50C84540	54	4	2018-11-15	94882	48710.4526051977	f
746	0101000020E6100000BD9E6FB612DD0E40257111FC00CA4540	16	6	2011-07-28	86676	1982.37057790482	t
747	0101000020E610000083B716E676340F409F939D578BCA4540	79	6	2012-12-18	87716	47833.8158062801	f
748	0101000020E61000001F8463C65FB30E40E3DB25A6E3D14540	39	2	2018-07-30	8726	8505.43990450498	f
749	0101000020E6100000CE7D40CFBBAE0E40710F2ED637D14540	26	8	2025-11-15	60847	41346.1019280347	t
750	0101000020E61000007071DBACDE380F400E98C8C526CD4540	9	6	2014-04-10	39111	17549.7617940713	f
751	0101000020E61000001E5F05009CAA0F4079638FFCE4C94540	93	4	2012-02-18	78985	8865.19600053037	f
752	0101000020E6100000F198689846710E40AE46689F4AC94540	75	4	2025-03-18	18631	43617.5865886904	t
753	0101000020E6100000A004FB9C595C0F40C71489A6F3C94540	33	9	2017-12-27	1656	61163.3509816009	f
754	0101000020E6100000EDDA0178ECD50E4082C7122816CF4540	48	6	2017-01-14	59883	79956.679823591	t
755	0101000020E6100000D7EC54CC33810E404D1EE13297CF4540	63	2	2020-12-18	99972	11775.1897733345	f
756	0101000020E610000094F5C53AE7130F400312482D0ED34540	63	8	2018-10-30	83521	65908.5885982328	t
757	0101000020E610000088F9BA201A4D0F4035F38A27EACC4540	66	4	2018-07-08	8461	56384.903253745	t
758	0101000020E61000008EA9417559920E400FCB352972CB4540	61	9	2025-08-29	69824	9937.43575285346	t
759	0101000020E61000006BBFD120FD5A0F401138EDF9B1D04540	83	7	2010-04-08	32263	1691.78020240954	t
760	0101000020E61000003899ECC3A38A0E40E55A78935FCE4540	28	2	2025-08-05	22719	4507.39454468447	f
761	0101000020E61000009E976DC06FD50E407808818E00C94540	44	2	2018-05-22	8944	16450.8563840976	f
762	0101000020E61000002202C2387B630E404FF2C4D48CCD4540	36	9	2014-02-13	70268	76951.7704245579	f
763	0101000020E61000009F84BBCB740A0F404B763B3E93CB4540	85	7	2021-01-30	62696	57758.6945754931	t
764	0101000020E61000006CA252E432860F40F308477053CF4540	78	10	2019-12-13	77920	71216.798432757	t
765	0101000020E6100000D976B50D97C10E409D043E8130CD4540	6	1	2019-01-02	65658	28919.7481006029	t
766	0101000020E61000001020697165D60E40591383CE7CCC4540	74	9	2025-11-02	85520	90638.4425197239	t
767	0101000020E610000025DD8DE855860E4027B3B481E6D14540	82	1	2021-06-30	41832	73032.0893236065	t
768	0101000020E6100000D03BB2104C010F40F8E7434E7BC84540	40	7	2018-12-07	42203	85904.8173130092	t
769	0101000020E6100000E4B5E05177770F4069E7F28725CD4540	83	5	2012-04-12	68008	75155.7668887825	f
770	0101000020E610000099500679DB550F40C5D42AE60EC84540	46	7	2010-01-23	46532	65390.5334077765	t
771	0101000020E6100000F2213DC6E0730F402A31FA7B60D14540	96	6	2017-03-27	60989	92783.1263466217	t
772	0101000020E6100000637C65219BB40E40023658BA29C84540	80	9	2021-03-08	66993	20533.7638292662	t
773	0101000020E6100000C05DB04417390F406960515934D54540	38	5	2012-08-18	73602	52042.3279658721	f
774	0101000020E6100000C4EACE8EE6B10E40EBFD540025D44540	61	10	2021-11-19	5201	64731.1067990406	f
775	0101000020E610000004FC091681830F40830725E77DC84540	96	1	2010-05-03	20873	30563.0155057202	t
776	0101000020E6100000A9CA12B7ACA90F40C156F7316CCE4540	23	4	2020-03-13	65427	9722.35557272287	t
777	0101000020E610000060A87702CB850F40748812F41DCA4540	29	5	2018-04-16	87798	42732.0865768491	t
778	0101000020E610000041C6533AF5300F402818464329D04540	56	5	2024-07-24	98058	29815.7676170288	t
779	0101000020E61000003FBAB3404BA00F40B14F053CBACC4540	26	9	2014-10-15	41245	72750.4159340291	f
780	0101000020E61000003FD612E81D970E4080C455CB84C94540	44	5	2025-07-13	4328	82144.9174739062	t
781	0101000020E61000001FD7955995E50E40D81CE49074D34540	85	6	2017-04-14	20621	89103.8011358011	f
782	0101000020E6100000A4320F3D0A600F408F3796DB63C84540	68	3	2011-07-30	58433	22221.3193890822	t
783	0101000020E6100000506E01235A610F408BD0DE0826D54540	26	4	2013-02-01	47781	61218.8587619367	f
784	0101000020E6100000C2C2833D93A00F403B26C5CD74D14540	84	9	2019-06-18	59764	14113.0586663971	t
785	0101000020E610000094331446B76A0F404A6719BB28CB4540	70	2	2024-02-13	99918	91729.4141637886	t
786	0101000020E610000038F86F77B4760E4009AFFC4ED8C84540	62	1	2018-02-21	62556	20261.6915173849	t
787	0101000020E6100000804D7518FCA50E4061552751EFCA4540	74	6	2012-12-03	39532	87652.9483545959	t
788	0101000020E6100000B1E0B4B9B4B90E409885770031CB4540	30	10	2011-06-11	23246	40929.1150094887	f
789	0101000020E61000000A57FCDB6D8D0F40D81AD335D0CD4540	77	7	2013-09-30	36276	62376.0194464269	t
790	0101000020E6100000FF354D098F990F40CFADDC6AA0CB4540	16	10	2017-01-11	54258	38296.4091583833	f
791	0101000020E6100000760C52366D890E40E79B4F16D5CF4540	90	2	2017-10-25	48746	71334.9578406149	f
792	0101000020E61000008E0A04AC7D800E40D7FF42B35DC84540	48	5	2010-08-04	42002	81992.3581434586	t
793	0101000020E61000009FFC5FC262E90E40576435EA26CE4540	70	10	2020-09-06	78732	79483.8126648186	t
794	0101000020E61000009433F0BC6F760E406491CA761BD14540	34	8	2025-06-01	23278	28338.7738707712	t
795	0101000020E6100000E189EEFE83880E4005286856BFD34540	17	3	2019-05-05	28929	84986.5256406295	t
796	0101000020E6100000B116E70A26360F4006AA3D8C37C84540	86	1	2023-07-30	92143	62161.0460467883	f
797	0101000020E610000022D54D2C4E8F0E40D854E267A7D44540	5	2	2011-02-12	34960	59341.1961379914	f
798	0101000020E6100000253D7175BD3D0F407A2DD63DF2CB4540	46	8	2013-12-09	36445	20971.6538114785	f
799	0101000020E61000003E03653ED3910E40482EFCE53ED24540	23	6	2015-03-09	1307	96288.424754174	t
800	0101000020E61000009625A5188D870E4045E1315550C84540	11	5	2022-01-20	97780	80847.3432091636	t
801	0101000020E6100000B458A10C816C0F4071CD4CE145CA4540	14	10	2012-05-25	29322	38284.4751421497	t
802	0101000020E6100000B9408D8C80BC0E40706F56CFA8CE4540	94	9	2012-02-28	35056	91296.6763697536	f
803	0101000020E6100000DC7CF3B38A940F403FB0392F97D34540	4	9	2025-05-04	45920	420.687647872509	f
804	0101000020E6100000D26D60A824AA0E40F4F51F7822D24540	3	4	2023-08-06	11566	13829.8273009083	t
805	0101000020E6100000D3C8E304F5C40E40FC957F78B2CC4540	25	10	2015-02-24	35368	51034.8950992713	t
806	0101000020E61000005F3447AADC170F405DEEE63959CD4540	95	3	2019-08-20	85461	21159.0921148022	t
807	0101000020E6100000AD5AB7A92CF00E40E6051EC83BD04540	69	1	2021-06-26	7087	61278.2617043166	f
808	0101000020E6100000706BC44DC9710E40617659C386CB4540	69	8	2016-07-24	43945	26703.9362816953	t
809	0101000020E61000002FAD18AFA53E0F4081632235C6C84540	5	7	2022-10-29	48414	72183.0731841501	f
810	0101000020E6100000CB8280BB02D20E40F1BD9E0747D24540	45	8	2021-07-02	72788	41580.1337669179	f
811	0101000020E6100000A92C49FFF2FB0E40A23526216DCF4540	72	10	2019-08-19	1372	45721.5669549359	f
812	0101000020E6100000104D2397F5A00E409286519F18CA4540	72	7	2021-01-27	84620	16565.4306230957	f
813	0101000020E6100000310689D257D80E40A784295E89CE4540	22	6	2020-05-05	2670	29298.6658311742	t
814	0101000020E61000001EDCA00B35700E40BC7B1FF430D54540	93	3	2010-11-10	33777	99705.933717312	f
815	0101000020E6100000AE53BBEF90270F400F9740A692C84540	40	10	2014-09-29	72786	5236.5331251093	f
816	0101000020E6100000CE0E1F08D6C80E40CBCFE2BF19CD4540	34	1	2019-10-27	46722	79097.6774878343	t
817	0101000020E6100000F9ACCDE8A89C0F40997EAD34A8CD4540	34	10	2014-12-13	25325	40898.7224259083	f
818	0101000020E610000007B1FE0794A20E40D36FF13007CF4540	95	10	2012-02-05	62128	40098.020951121	f
819	0101000020E6100000B1D4173E150D0F40C1BEB19991D24540	63	6	2011-06-13	16751	18581.1529069671	f
820	0101000020E6100000876F9ED6CEDC0E405E8FA47442D24540	86	7	2020-11-28	38465	78357.8319326319	f
821	0101000020E6100000EFFFA37E47B00F405FEE6044C5CF4540	47	7	2021-07-22	10833	63925.6266712958	f
822	0101000020E610000048433051A1C50E4069FBC18953CF4540	67	8	2011-10-16	61970	63406.1425093939	f
823	0101000020E6100000D777BD8AE21C0F40375B23CBBFC74540	69	8	2010-08-27	37792	61641.9755468222	f
824	0101000020E6100000A7C0817D29590F40BF4D2A641AC94540	55	2	2013-08-08	49429	22823.0421251919	t
825	0101000020E6100000FBDE7F25A1740E4063B50B1F83D24540	31	4	2022-12-10	66735	76218.5356958853	f
826	0101000020E61000006AC21B1F22DC0E40C732ED311EC84540	93	1	2015-10-10	56814	50360.9024706858	f
827	0101000020E610000024235D6B8EAB0F401FEFA0CCB0CA4540	17	9	2024-10-25	80850	16539.9634173426	t
828	0101000020E6100000EC3F341EBA130F40E4FF0FAD04CC4540	38	10	2011-12-14	55893	80619.2516539647	t
829	0101000020E61000002DDEC264B1750F406DBC302A78CB4540	44	2	2016-09-04	85248	42710.963273202	f
830	0101000020E61000009B088B8D4D970F407A86277AA5CC4540	64	2	2014-05-12	96095	17704.3220557918	t
831	0101000020E61000008D2CA9A90CBF0E406FD76059B6CE4540	76	6	2020-02-05	72746	24295.7699868582	t
832	0101000020E61000009311AB18AC310F40D80DE23B06CF4540	90	5	2021-07-24	33466	74316.5223066706	t
833	0101000020E610000093234A9CAEA40F40FA0FB2B6E6C94540	24	1	2013-08-08	70354	42918.6004473416	f
834	0101000020E610000098B1780BA9810E405402F232A4D04540	84	6	2014-02-08	47330	24423.2718221848	t
835	0101000020E6100000BC21C2146FDD0E4078E2829EB9D14540	12	7	2011-08-10	36260	53755.9224446302	t
836	0101000020E610000020EC7D3B1DCC0E4000FE6B4BF6C94540	77	10	2017-08-22	6647	27637.995900474	t
837	0101000020E6100000A9381FF3FD290F4067B97FDAF6C84540	100	7	2025-11-14	3917	27016.4127751619	t
838	0101000020E610000001A53A6A0FA10E406DC706C7F3D04540	15	8	2022-05-25	89230	90037.7789933368	t
839	0101000020E6100000E6BC8B6287EF0E40EB0C153628CB4540	78	6	2019-04-08	22251	1240.71270641459	t
840	0101000020E61000001C1812571B890E40B9B55DB2CACE4540	62	2	2013-03-22	79900	85240.909167615	t
841	0101000020E61000004E71D2ECEF200F403A071ACEAACD4540	35	10	2022-06-23	37271	2220.54508724079	t
842	0101000020E61000001EFA6BDBC0AD0F407063995ADFCB4540	68	8	2015-06-09	45023	41711.4233706099	t
843	0101000020E61000007708C3D1D7010F40FE3D68D4E0D14540	50	1	2015-06-08	57041	2476.79656871822	t
844	0101000020E6100000F3072701D5DD0E40D36DEC0BC1CA4540	49	6	2012-09-01	3413	21804.218290074	f
845	0101000020E6100000690076C5C5570F40865F550AADCF4540	12	10	2022-03-07	22287	58729.3719895404	t
846	0101000020E6100000391B35A96D450F400A743A4D7BD24540	32	3	2015-02-24	6530	11285.9924687891	t
847	0101000020E610000011E7F3B04DC50E40E132A414FCD14540	55	4	2018-01-14	65548	97628.1659863326	t
848	0101000020E610000060F5B271372B0F4037ADD23359D04540	33	7	2014-12-04	57323	24685.5797384159	f
849	0101000020E6100000632CEBEEDA910F404F5F4A65C3CC4540	35	5	2022-02-02	61873	58369.3764710329	t
850	0101000020E6100000A1AF219CD0880F405AB5B89D7FCD4540	57	5	2024-08-29	60512	97856.7262011176	f
851	0101000020E6100000DDC7E272FB680F40E55282CE41D04540	75	9	2015-12-24	69942	43388.6016158467	t
852	0101000020E61000007B9399AF518C0F400AF8766E55D24540	35	5	2025-06-20	7691	39392.2795860816	t
853	0101000020E610000078E0E90951510F40F2E75E2130D04540	55	10	2025-11-23	44555	39042.187494581	f
854	0101000020E610000068E9FE856B3A0F403DA0CC5423D04540	19	2	2016-04-06	27319	3269.40020755038	f
855	0101000020E6100000B7692961D10B0F408B8EA40086D14540	25	2	2013-06-06	84826	40920.6575266888	f
856	0101000020E61000002B0DD18D874F0F40FCF6449013D44540	30	9	2016-05-05	583	71064.620828745	f
857	0101000020E6100000F474CFA1B8A30F40DB8F7839FDD04540	74	8	2022-03-02	16227	80143.5489498035	f
858	0101000020E61000007CA6A9E812DB0E40A5FA9782D3D04540	66	6	2025-04-28	8942	1468.28629331868	f
859	0101000020E61000001BF560D321970E404A73C2097ECB4540	52	9	2012-03-11	40483	33413.2811079133	f
860	0101000020E6100000D0425EC39A1D0F40B0E3B8912FCC4540	14	8	2013-04-11	10031	35837.7599030183	f
861	0101000020E6100000712B8BEACE9C0F40225651B354CB4540	14	7	2024-04-04	75558	56289.8819658011	t
862	0101000020E61000001EF0D78AB6BD0E407EB2DD34E5D14540	35	3	2013-11-02	4265	5782.54332657386	t
863	0101000020E6100000CF2AEED22B620F40B1F0374E57D14540	19	6	2014-07-08	16460	38693.7908833745	f
864	0101000020E6100000801A100F71750E40A58F836472C84540	55	7	2011-11-22	64008	25516.9927701513	t
865	0101000020E61000002FDEDB255E160F4001904D9E78D34540	92	7	2014-11-18	14139	7159.67032040397	t
866	0101000020E61000004557331465B90E40AAC42D26E0C74540	77	5	2022-04-29	13423	31037.4649052603	t
867	0101000020E6100000D6889362A3990E406EC18EF2C3C94540	84	7	2024-08-28	44476	63041.380653924	t
868	0101000020E610000020218085257A0E40E668B731E1C94540	6	5	2016-06-27	74811	97256.9306810054	t
869	0101000020E6100000A7DB32F06F480F40CFF7F3E167D24540	55	2	2015-02-01	69348	86931.4390998013	t
870	0101000020E61000005F52E6D21D9A0E40ED4AD922F1C84540	8	9	2014-03-01	65695	7958.31288296216	f
871	0101000020E61000005130FA3AC1710E408545EA2028D14540	8	1	2019-04-06	63075	69131.4283426014	f
872	0101000020E610000019D2F69711370F40C8F439B689C84540	31	7	2017-01-18	46194	99578.3160859635	t
873	0101000020E6100000AC2F64CFBE190F408EB80BF067CF4540	20	10	2012-12-09	47263	94202.7761295316	t
874	0101000020E6100000F6B3BC9254790E40FB7D77159AD04540	69	3	2023-09-15	99404	53434.2536428047	t
875	0101000020E6100000F1D0D0F6B3550F408DA7CAB4B1C94540	67	5	2020-03-17	17750	7043.78875926328	t
876	0101000020E61000000DC37E519A750F40A492CB898BC94540	27	9	2017-05-11	87907	80053.5563272022	t
877	0101000020E610000065791D611E590F40788A38B1B6CA4540	56	6	2019-02-16	75399	90257.3292756973	f
878	0101000020E61000001B0C71D534280F40389B2B2632D54540	72	6	2023-08-31	92334	75620.8617184033	f
879	0101000020E61000006DE48B0AFB080F407463D9A68BCD4540	32	5	2015-04-12	40439	40063.5530711523	t
880	0101000020E6100000D6F09730446B0F4080D8915F38CE4540	15	9	2016-11-28	63359	64722.5082173542	t
881	0101000020E610000090766628872B0F4008C7098F96D14540	36	3	2012-08-20	24911	58879.3615607935	f
882	0101000020E6100000714D995837A10F40D263E42E3DD34540	97	2	2013-12-08	70610	62707.8555673644	f
883	0101000020E6100000725B323BF87B0F4019D6FA5DE4CD4540	49	10	2010-02-25	35639	79944.9516729933	f
884	0101000020E61000009DAD894A17F40E402BADFD7885D44540	1	5	2012-07-15	6571	57831.6347724304	t
885	0101000020E6100000A015AE92222E0F400FA9673478CB4540	56	1	2011-06-28	67621	27342.134101495	t
886	0101000020E6100000A348A14FC7A30E40FCEDA15F15D44540	79	10	2020-09-25	12252	8888.94516205041	t
887	0101000020E6100000B2654ACCDCFF0E407C0757AC24CB4540	92	1	2013-04-10	39019	59818.1252979095	t
888	0101000020E61000009FFBEED4EAB80E4082E6A94433C94540	5	5	2023-12-07	37148	40471.0434691396	t
889	0101000020E610000047E05E99ED590F40C30299ED44C94540	35	1	2020-11-05	62166	7049.83413713005	t
890	0101000020E61000009E8C452FD0E30E40622F5A585CCF4540	75	7	2018-07-20	54773	30310.6699562235	t
891	0101000020E6100000873713C172AB0E403D20020476C94540	41	2	2023-12-14	52844	47319.1144748646	f
892	0101000020E6100000B2D51971F7C50E40A66596650ECA4540	85	2	2015-07-19	66584	3367.86766120281	t
893	0101000020E6100000DD96B5F04D790F402B337C6306C94540	83	4	2018-04-30	63402	64503.7580768256	f
894	0101000020E61000008D8AB51D19DA0E407F5A4F6ABBCB4540	23	4	2012-01-18	54716	3574.40768965642	f
895	0101000020E61000000E6816F22E170F40FD9D17A510D54540	99	8	2020-05-08	28072	20251.7535128752	f
896	0101000020E61000008F89F9396C570F40EF0523BE4FC94540	20	10	2015-09-14	3345	87239.7902773605	f
897	0101000020E61000007933659907550F405E0795CEE9D24540	96	10	2015-09-23	71686	54090.0631821543	t
898	0101000020E61000004C6DE19CFC7E0F402780BDE594CE4540	88	3	2020-11-16	54172	77646.2556462727	f
899	0101000020E6100000470145274F9A0F401EB55D4C1FCC4540	68	4	2021-03-24	48836	52076.3441955322	f
900	0101000020E61000001B0D25D880660E40D12793F666C84540	35	6	2023-06-18	67188	31505.5251190523	t
901	0101000020E6100000C987B82C0B400F4000859181E7D04540	42	1	2010-07-16	10840	89719.6531806534	f
902	0101000020E6100000B8EC449CF3A30F40CF34F739FFC94540	5	2	2023-07-23	62170	45860.2972662032	f
903	0101000020E610000090828E5661A90E406505C5384ED14540	56	2	2012-06-14	38671	93441.2611947536	f
904	0101000020E610000022CB50F931080F409BD0A6094CCB4540	88	1	2021-11-29	11104	80775.8499595629	t
905	0101000020E6100000993109619C470F40D7E2AFE27ECB4540	85	8	2015-02-22	64164	62173.7004782001	t
906	0101000020E610000037265CBEF7610E40478F5AC348C94540	4	7	2021-09-07	83930	42614.3642755956	f
907	0101000020E6100000605C376F159D0F4012478D525BCE4540	6	5	2021-12-24	32605	38553.5365660195	t
908	0101000020E61000000ACBA07C1F290F40B0D2321778CA4540	3	3	2012-06-03	12321	2506.57151073657	f
909	0101000020E6100000BBB0006D31A00E40FE5E46CBBBCC4540	31	3	2014-11-06	83663	2053.26964477022	t
910	0101000020E6100000FFF2110F8B0D0F40725A64CCCBD44540	2	10	2020-05-10	19661	4577.91328886261	t
911	0101000020E610000038182B936D3C0F40FCA311B402D34540	26	10	2018-01-18	51701	62156.581351026	t
912	0101000020E6100000AEA94D4B4D450F4024EF357ED8D44540	99	3	2013-04-17	44195	16924.5970818208	t
913	0101000020E610000064E4BE7857AF0E408CAA374825CD4540	1	7	2010-12-17	21624	35771.7082719169	f
914	0101000020E6100000B50B09C81F660F40C8ABB3C7A6D04540	86	8	2018-01-23	38103	43028.5847042539	t
915	0101000020E61000004170E7F291350F403560416AD7CA4540	96	10	2014-10-05	52408	23553.3604176398	f
916	0101000020E6100000D6E854E8CED40E40943831F27CC94540	78	9	2017-09-13	79543	75091.6090300712	f
917	0101000020E61000001EF7241A32740F409172833DB3CB4540	54	1	2023-05-13	819	65535.0337856261	f
918	0101000020E61000004F1EB2146E160F40C4C23AD5C8D24540	38	10	2018-10-24	70903	29817.6107496555	f
919	0101000020E61000008F636BA15C090F40A3EA44090ED34540	52	2	2025-06-23	71665	58466.8300424178	f
920	0101000020E61000007F1C02D088AE0E40DAA0F6129DD04540	35	7	2015-12-22	54037	34068.9720839805	f
921	0101000020E6100000DFA4992B33680F4087E0A00AD1D14540	1	9	2025-08-25	47355	24095.2174787431	f
922	0101000020E6100000A8F179981E360F40B04DE2A394D44540	27	8	2013-10-02	21014	28282.8357647141	t
923	0101000020E61000009C1E9792028E0E40E3C21B181DD44540	48	6	2011-11-01	84603	85120.6874129302	f
924	0101000020E61000001EC39C98148D0E40785E55BA4DCB4540	70	1	2015-05-16	13100	95489.1960230996	t
925	0101000020E610000033B24B4051940F40DE834EAE8FCE4540	91	1	2022-10-25	5157	28225.8975600661	f
926	0101000020E6100000E18905F377560F401F2D4EE6E3CE4540	80	8	2011-06-14	64846	28711.1309460892	f
927	0101000020E6100000DCD6F14BF8EA0E4055E3A395ABC84540	38	4	2018-01-23	74254	2785.06690699505	t
928	0101000020E6100000DBB89EF00B970F40947FF17944C84540	72	2	2010-06-25	25668	18571.3102661715	f
929	0101000020E6100000F9A0AD681F820F40206F1272E9C74540	58	8	2023-07-02	13467	85315.0083260655	f
930	0101000020E610000096E2AEFBAC8F0F40C732739651CE4540	77	10	2019-05-20	76	62940.3406044486	t
931	0101000020E61000001D3F9307C6610F406FEEAD3625CD4540	88	6	2014-08-06	81873	54712.9807245143	f
932	0101000020E61000001FF50E368E1D0F40D391D9BF2DC94540	38	8	2019-05-12	2404	55799.8488526012	f
933	0101000020E610000014A465C20BBA0E40D5D98BB941D24540	28	10	2020-04-13	78556	40278.5254339528	t
934	0101000020E610000042726EAA1C590F40A9C6037AF1D34540	82	8	2022-04-11	82546	8313.55861852257	f
935	0101000020E6100000E731CB3D99B10F40C39F93730BD44540	78	5	2014-12-31	96756	35040.2277407458	t
936	0101000020E6100000B469F0F5A3680E40F8EB2E5797CB4540	71	3	2016-05-12	32065	13301.4689261189	t
937	0101000020E610000006CC577DB5290F40CC8537E1FECA4540	94	3	2019-03-01	84268	3128.44118388673	f
938	0101000020E610000044E660D3AC9E0E401E540630CAC74540	9	9	2011-11-07	90701	67242.2887729129	f
939	0101000020E6100000A389D3445B600F408E08B332A8D44540	31	3	2018-08-11	82884	44807.6291365433	f
940	0101000020E610000083BE7EA99C220F407FC3484C04CC4540	8	5	2025-07-06	18244	65752.5509334176	t
941	0101000020E610000052112B96B9A10F40C592371B9DC74540	29	1	2019-08-07	29920	21186.1403459138	t
942	0101000020E6100000353577C6F4640E40AEF955C908D44540	4	2	2017-07-18	29110	92521.6602116539	t
943	0101000020E6100000EE31D71A818E0F402519FAC341CD4540	31	8	2021-10-13	73106	91932.6338843014	f
944	0101000020E61000006A850D32F2490F4047D4066C33CF4540	64	10	2018-12-09	13515	75208.7930581288	f
945	0101000020E6100000C48E316BC6DD0E4069BDDAEC79D04540	95	9	2025-06-24	1819	24148.8107696067	t
946	0101000020E61000003185852F9ED90E40590E7A008BD44540	38	3	2018-08-13	85041	94033.3855446008	f
947	0101000020E6100000A2F65E5658BA0E40D247D8BF66CD4540	6	1	2013-06-30	12120	40357.3577720858	t
948	0101000020E61000009D373C5A92D40E4032EE6DCAD6D44540	72	5	2025-06-22	25743	70758.4990738117	t
949	0101000020E6100000FC911FE7ABB00F40B46A94FA61CE4540	64	7	2010-09-10	26284	36329.3656893252	f
950	0101000020E61000003BDEF632F66D0F40F96E181EE0D44540	4	1	2019-10-04	55406	97671.3412582782	f
951	0101000020E610000071462AA378780E4031FDCB9595D24540	12	1	2016-07-14	12699	88340.5854475592	f
952	0101000020E610000050658832A4430F40EB36CE9379CD4540	17	2	2022-10-01	40193	5707.26906251011	f
953	0101000020E6100000D0742AC07B0A0F40DA6638F4BBD24540	34	2	2013-10-31	3004	21415.1776580727	t
954	0101000020E6100000BE99E88B0ACB0E40318711C589CA4540	65	7	2014-06-12	53428	87905.4976308838	t
955	0101000020E610000038772DAEEC750E40498B3CF407D24540	54	1	2018-09-07	88656	63315.2695129599	f
956	0101000020E6100000637ADB40B18B0F405E1859AC5FCE4540	16	3	2022-08-29	58021	67417.6759947381	t
957	0101000020E61000008C9FB4E7EC070F402D2123F6DBCA4540	18	7	2021-07-22	11065	63446.4867937668	f
958	0101000020E61000008C98AD01D6CB0E407DE139FC3DCA4540	17	8	2010-02-12	84352	4760.04824565022	f
959	0101000020E6100000D97F575F02D10E403C48AF0091CB4540	49	10	2020-01-05	60861	5150.8870013609	t
960	0101000020E610000098159F6BEDEA0E40C128D45DAACE4540	17	3	2022-04-08	72953	9818.81215270259	t
961	0101000020E6100000F00A2F0886590F40945059F6CED44540	21	4	2020-03-02	53980	36411.929633974	t
962	0101000020E6100000421FFB1911E40E40D9A8B70AD6CA4540	66	10	2013-12-08	7642	94031.7422745535	t
963	0101000020E6100000552DEE359B9B0F40B45789D0F1C84540	56	8	2024-06-21	49731	9072.4339107561	t
964	0101000020E6100000FD65265F07430F40D5B8DB5A4ED54540	75	2	2014-06-15	76876	757.370890198517	t
965	0101000020E610000039E03231487E0E40871370A41BCC4540	15	6	2018-03-30	53947	67301.0709088979	t
966	0101000020E6100000F37BDC77B7820E4018F1D33513D54540	16	4	2017-03-25	64914	77027.2745535211	t
967	0101000020E610000080D6708EAB9E0F40A7A05B60B2D04540	67	5	2023-11-14	90044	3167.68999982018	f
968	0101000020E61000009E1A19B326CD0E40E81C18FD20C94540	66	8	2025-11-20	43402	39566.8445976965	f
969	0101000020E6100000904C15A44B6C0F40474F882859D14540	15	6	2010-01-23	79245	41791.3829702323	f
970	0101000020E61000008344C12056820E403CFE233F29C94540	86	6	2017-05-31	40439	15104.574136485	f
971	0101000020E6100000E203EECED3DB0E407683346AC4CC4540	78	2	2023-06-11	68930	74013.4561810295	f
972	0101000020E6100000349F3CBDD3230F40071DFBB0C4C94540	31	5	2010-07-08	36122	64120.8613103646	f
973	0101000020E610000085E3B23A63D00E40C0060F5715D34540	11	10	2019-11-28	51129	4499.31629862366	t
974	0101000020E6100000012E5E2D99F70E400125135009D04540	100	10	2022-01-18	47774	68512.7140561917	f
975	0101000020E6100000C28647F91B970F408247CBD1E5C74540	98	5	2019-12-25	72560	59205.2075006618	t
976	0101000020E61000009871FCDD3D580F403F6F74AC4FD54540	84	10	2016-02-29	12756	91715.6430583773	f
977	0101000020E610000060E8CAF080A60F40217A4532D7CF4540	58	5	2018-03-09	21368	88690.1927751216	f
978	0101000020E61000005EAC23D8BCD60E40A949E38F8DD14540	99	9	2021-07-16	19797	59692.5316001685	f
979	0101000020E6100000693F98CD3E290F407588DBFECDD44540	30	2	2011-05-17	64820	70739.9186668054	t
980	0101000020E6100000974C9945AF9D0E405BBFC745ABCB4540	21	10	2023-12-16	63089	15583.6760638504	t
981	0101000020E61000000042AF3FD61C0F40D7A9EADB37C84540	27	9	2022-06-13	27171	79635.1239521292	f
982	0101000020E6100000A78639E45DF60E40D1F4E20C40CF4540	67	9	2012-02-07	32769	65308.3986238498	t
983	0101000020E6100000A502A314219B0F40C27B093ED5CD4540	19	1	2020-10-21	3049	9106.58039113743	f
984	0101000020E61000001AA531A91D880F40101E18106DD14540	12	1	2024-01-05	99663	71159.7836222619	f
985	0101000020E6100000A8F9B85E9C840F404028C983E9CD4540	77	10	2023-10-28	1543	94349.982161737	f
986	0101000020E61000009ED18DEB348C0E406C65AF9FF4C74540	67	6	2022-01-20	33739	49606.4839419675	t
987	0101000020E61000005D3B87842B8E0E40B50A15E04DCC4540	81	8	2024-04-28	91664	15370.3807406234	f
988	0101000020E61000008E54020A64B90E40F1330C55D5CC4540	7	7	2017-11-24	21254	72566.8173490342	t
989	0101000020E610000032E23F3E9D980F407159536498CE4540	26	4	2011-10-04	76920	38311.1584452064	t
990	0101000020E6100000254D57F6AF7D0F40387F612038D14540	43	4	2020-06-26	63032	84337.738851987	f
991	0101000020E6100000E987C87A32910E408CFE347393CD4540	92	7	2025-03-24	976	85030.570612185	t
992	0101000020E6100000F21FE8B7BB6E0E407C94532BD9D14540	74	9	2011-07-12	90979	97752.4233451006	t
993	0101000020E61000006F4B8D4824B40E40A42FAE37A1CF4540	43	7	2012-06-20	21380	76087.4403758869	t
994	0101000020E6100000E90830F0ADD80E406CD30F594BC94540	8	6	2021-04-30	37020	31990.3489748658	f
995	0101000020E6100000788F5EB1BCF80E40E8F8F95093CD4540	22	10	2024-03-08	69687	35571.7377211219	f
996	0101000020E6100000706D2D5820760E404DA4FE7519CA4540	39	4	2023-12-13	6668	84719.4517019284	f
997	0101000020E61000006D5568F509940E40BAC19023F5C84540	50	2	2018-01-01	37062	59991.4708160537	f
998	0101000020E6100000F777E7473A940E40D71DF9CEB8D14540	71	7	2018-12-31	36222	77465.4399937505	f
999	0101000020E61000003770DF72777D0F4091A76AA5A3D34540	100	3	2016-11-23	12999	50360.5944109813	f
1000	0101000020E6100000C3B562D777A00E4046DB1295F6D44540	64	10	2024-01-30	86410	44103.3260668225	f
1001	0101000020E61000001480C6FF12DC0E40A48609F446D44540	61	8	2023-12-22	26915	65942.502540346	f
1002	0101000020E6100000191EEA98E96C0F40D834F80371CF4540	34	5	2017-05-30	17884	81425.2458215227	t
1003	0101000020E61000006DB620F6343B0F40ED780D82E7D34540	58	8	2016-05-17	83783	32696.977337863	f
1004	0101000020E6100000DAB6C878642C0F4046632ACE6CCC4540	62	3	2019-07-14	67828	93989.0647286953	f
1005	0101000020E6100000E2F2CC0CB1D50E4094C9F3C0D2D14540	95	3	2010-09-17	47153	2622.18227498516	t
1006	0101000020E61000009E82014D1D980F40EC4BBBE85AD24540	94	6	2021-06-16	31717	29611.1610106502	f
1007	0101000020E61000009DAACF2A5CEA0E40529153BF58D34540	78	5	2018-01-02	30947	51104.4797076847	t
1008	0101000020E610000096B3597195750F407080A16A9FC94540	12	2	2020-10-22	39297	6297.97259662677	f
1009	0101000020E6100000A1C4859D367D0F40007EAE643CD54540	53	4	2018-03-17	42020	22183.9873674897	f
1010	0101000020E6100000FA43493010B40E401D9CDE277AD44540	16	1	2011-04-17	68604	8285.29204665662	t
1011	0101000020E6100000EBA3884AF58E0E40FFF6255BEDCF4540	29	6	2018-04-10	44972	9841.62586148263	f
1012	0101000020E610000020D329AB96EA0E40BE252D3105CC4540	28	6	2015-06-19	98359	39272.6068200312	f
1013	0101000020E610000019B9BB72C0C70E40306E25AAB5CE4540	41	8	2014-03-16	28947	64214.729465834	f
1014	0101000020E6100000B295537E6D3A0F40D4262A2FD5D04540	26	7	2017-05-31	35641	88267.0372830805	t
1015	0101000020E6100000264F262EF9AC0E409F590E1366CF4540	35	6	2016-10-12	16413	1023.77973015377	t
1016	0101000020E610000029F94A7A2D6C0E40FA4BA887A4C94540	56	9	2022-08-14	30663	87769.9800661256	t
1017	0101000020E6100000257CD5978DB50E4094A6E97AB2CA4540	29	10	2015-09-22	45834	7167.63076380957	t
1018	0101000020E610000073C542CC14E70E40D87AA925F2D24540	32	3	2020-01-25	50334	15795.801311046	f
1019	0101000020E610000005D0F214760A0F40065B65A096C84540	62	6	2020-07-28	701	46243.4417913488	f
1020	0101000020E61000003AF3BD4B643C0F4002B977C558CE4540	2	3	2024-01-23	12664	28469.7838654375	f
1021	0101000020E61000000E5296340FCA0E40B81B9927BECD4540	85	10	2018-12-09	31335	83380.1067075462	t
1022	0101000020E6100000F2ACAE83A2790E403089353668CA4540	88	4	2020-04-18	56800	76136.4856336805	f
1023	0101000020E61000004FD3B54019740E40BAC1A9A6E6CA4540	82	1	2022-08-01	31405	69551.4958813871	f
1024	0101000020E6100000DDACA9CE8F8C0F40EECEA7ED7CCA4540	11	2	2019-02-07	77900	83953.825468265	f
1025	0101000020E610000096C7F4D83D760E408024444AAED14540	12	6	2010-01-21	33886	95739.9915430373	f
1026	0101000020E610000022CEEE2F513E0F40FD999BBD9EC84540	60	10	2010-07-09	38155	36496.2322507659	t
1027	0101000020E6100000CF97A08CB9440F405D9E7F7226CF4540	18	7	2024-06-19	62862	5638.5612642617	t
1028	0101000020E6100000FD8D5D3256B70E40F4A468B18ECC4540	80	10	2010-01-06	76978	72680.2802351069	t
1029	0101000020E6100000017EB9E61C530F4055E0F3E1E8D34540	76	1	2012-04-08	16990	8553.92452282633	f
1030	0101000020E61000006A3D689D8FA30E40A93A845594D44540	39	4	2014-06-17	94893	34229.4561346653	t
1031	0101000020E6100000C520A13C8AA90F40ACDB2FEE0CD24540	77	1	2025-03-09	15233	84513.354406065	t
1032	0101000020E6100000AFBE2D45FB950F4033B9EC59E5CB4540	12	4	2017-04-12	49777	78777.998922403	f
1033	0101000020E61000002A9457A3BD4A0F40CADC1CC006C94540	44	1	2019-05-02	68837	80520.6034186092	t
1034	0101000020E6100000E168423ACC790F408EC6F9038AD24540	84	10	2015-01-08	48834	62880.0200829814	f
1035	0101000020E61000004DD18F783A090F40ADCEFDC355CE4540	55	8	2024-02-01	36175	86929.2622798544	t
1036	0101000020E6100000D1816F7A55930E40EDB67BBB58CC4540	88	3	2024-07-25	70047	10469.5266745232	f
1037	0101000020E6100000A0BB77C42D3E0F401E7E0D526ACA4540	11	7	2012-12-25	33302	24750.4096168885	f
1038	0101000020E610000037C758252E8A0E40A97217E557CA4540	22	10	2023-07-10	78509	76295.7672485716	t
1039	0101000020E6100000256894442A350F406153CA1B6DC94540	56	4	2024-06-19	91906	80204.5588520793	f
1040	0101000020E6100000B71CABE3966E0E40778F1BA098D24540	45	1	2020-11-08	6391	94177.9580628679	t
1041	0101000020E61000004E52093BC74A0F40DABCD9DCDDD24540	56	4	2011-07-17	94971	72846.0531201248	t
1042	0101000020E610000015B44C58D5D00E40C060BD4BF1D24540	72	9	2016-03-09	36221	29354.5306833799	t
1043	0101000020E6100000EF0352A7D85A0F406014A918BACC4540	80	5	2025-01-22	84417	72199.6120832907	t
1044	0101000020E6100000D3FE5EC47DFD0E401BAFC2C455C94540	64	6	2020-01-25	7195	9822.51544140464	f
1045	0101000020E6100000A2BAF7C500810F40748397FD74D04540	86	9	2020-06-20	98311	20715.4762096552	t
1046	0101000020E6100000C32A6EFABD7F0E4072A4051690CD4540	80	6	2013-05-20	51369	80292.0556441799	f
1047	0101000020E6100000F4CB831BE4C20E40E46EF4165ED44540	84	10	2020-08-11	98868	14785.5788874404	f
1048	0101000020E61000006812422BA2BD0E4050EF6DC421CD4540	32	10	2022-06-07	89343	95135.7436449691	t
1049	0101000020E61000009D2A50DDFCF80E4008A6CEFD32D54540	32	5	2018-01-05	53991	96236.6024818368	t
1050	0101000020E6100000E7D584F624ED0E4071C27D79D6C84540	52	3	2017-09-20	68822	21754.2014602902	f
1051	0101000020E610000071BFA8AC98300F407AB424A3D5D14540	9	1	2013-06-19	67035	4230.20708936404	f
1052	0101000020E61000008F9CA70AA12B0F402C75A64BE1CE4540	83	9	2013-06-10	55557	7866.98249177251	f
1053	0101000020E6100000143EBF163F000F40B1A9FC5708CE4540	44	1	2025-05-17	46895	94318.5271304671	t
1054	0101000020E61000001CDDA2F3F3A20F406CC875C2BCD34540	19	7	2022-11-02	23155	57526.567683541	t
1055	0101000020E61000005FBDD86A86C90E40B1BEF0F591C94540	75	5	2019-12-15	60023	5585.82184991392	t
1056	0101000020E6100000C82686F24BE60E40B517CB631FD14540	73	6	2020-03-20	6509	94867.554760667	f
1057	0101000020E6100000DB05B68BCBF20E409AC30B88CAC84540	99	1	2016-11-14	30629	62343.9721350423	t
1058	0101000020E61000003029A8F06FAA0F4026F1A6DC83C94540	64	1	2017-11-09	45862	40820.2400013582	f
1059	0101000020E6100000DB24934515AA0E40665B49B290D34540	15	1	2013-11-28	92082	67800.446309402	f
1060	0101000020E6100000BB8B58C604370F40FCA9CEB8EAD24540	3	7	2025-08-21	58677	3108.14602008809	t
1061	0101000020E6100000DF118DD641160F4011502E88B4D04540	15	5	2013-11-09	95166	37290.1555809305	t
1062	0101000020E61000007C002420B0D60E40C01442AA2EC94540	18	8	2014-01-28	40892	7735.98411913163	t
1063	0101000020E610000002C5902631700F4045AE8A231ECC4540	27	10	2018-12-30	83458	16079.5490221294	t
1064	0101000020E610000063F889AA3A2B0F404A1F357C50D24540	46	3	2023-08-09	27162	46583.2835170713	f
1065	0101000020E610000069D1AC5521830F40C66079AF1CD04540	83	1	2015-07-06	97514	30566.2721519652	f
1066	0101000020E6100000F1E48B36B6B90E407BA76A89F3D24540	4	4	2018-11-11	27000	34534.5510579298	t
1067	0101000020E61000007E8D1E288F140F400C798B30CECC4540	36	4	2016-01-26	35178	66981.6150206612	t
1068	0101000020E610000065E36A4BAEB40E406E0EF53EDAC84540	7	5	2018-10-27	97795	84496.1335916562	t
1069	0101000020E6100000A251A1C882870E40812178A689CF4540	65	6	2018-09-16	22013	45337.1009911077	t
1070	0101000020E6100000C24AC328D7730E40A20E3A9387D34540	81	10	2017-12-07	37622	30235.3659108535	t
1071	0101000020E6100000157E028ADEB40E4059E550BB23D14540	2	7	2012-08-27	121	72714.7856133892	f
1072	0101000020E6100000CC034DBDCF670F404A1E6168B0CD4540	57	4	2020-02-10	36812	64066.9269752	t
1073	0101000020E61000007F6AC18530960E40D4587260A5CC4540	84	3	2021-12-17	8521	70776.5808142062	t
1074	0101000020E610000005CE168FC48B0E40685494AC3AD34540	48	2	2022-01-26	59003	17259.1346938831	t
1075	0101000020E6100000B7A4BB6401490F402F11A94288CD4540	81	2	2016-12-05	6663	18895.0988172239	t
1076	0101000020E6100000901F37AA657A0E40CBF8A88632C94540	36	9	2018-09-30	51598	45420.9598078515	t
1077	0101000020E61000003C750220A8BC0E40FA6EB6353CCB4540	21	5	2016-02-16	8618	73591.4262233841	t
1078	0101000020E6100000F84D49F7E5720F403AE34C264ED24540	36	5	2016-10-15	39005	89908.621582161	t
1079	0101000020E6100000E1EF92C161F50E407EFB3997ECCE4540	9	5	2020-04-26	94071	61370.2157709758	t
1080	0101000020E61000002003AD20A2790F409919466BC6C84540	74	7	2011-07-27	71646	29647.0113213958	t
1081	0101000020E61000004F94C7366E9F0E406DA6166DE4CA4540	60	5	2016-07-04	30186	30129.0835501615	t
1082	0101000020E61000003DD3FDA08FFE0E40E7815F36EDD44540	12	7	2019-02-06	61507	10281.8586255266	t
1083	0101000020E6100000233ED9F365B90E40E60E29757ECD4540	41	6	2010-02-13	53838	44669.8110145001	t
1084	0101000020E6100000C33E9DC896090F40767EB6A4BFD44540	45	9	2018-12-20	94168	98110.7426847243	t
1085	0101000020E61000008D9373A3728C0E404808EF983BC84540	4	9	2023-10-03	70687	33453.7386634318	f
1086	0101000020E61000004EAD87650C310F406AA542144FCA4540	56	1	2012-03-06	94636	2204.38643319294	f
1087	0101000020E6100000153BF1B510230F407B2802D34BD34540	92	7	2014-08-05	42126	49753.9510489041	f
1088	0101000020E6100000AF06CF1E5E4D0F404042F87C3DCB4540	86	8	2017-08-14	67840	53267.9731019315	t
1089	0101000020E610000053A20C26E4CF0E407D1313D8AFCE4540	40	6	2013-07-24	65461	69053.660751933	f
1090	0101000020E61000003850069E30EB0E405E16663352C84540	84	8	2017-05-20	4230	37451.148828837	t
1091	0101000020E6100000059D847C1F140F40DF0CC6CCCAD44540	71	1	2018-08-09	96920	35490.7107484714	f
1092	0101000020E6100000C29E4E5D74EA0E40504A34B0ACD24540	90	8	2020-12-13	62791	31315.9578212964	f
1093	0101000020E6100000E1DED492F37A0E402A33EB6223C84540	92	10	2014-05-14	34631	99315.9636472549	t
1094	0101000020E6100000906B4DCDB3630F409CCF1F149ED44540	69	9	2012-05-14	15471	51067.9736135168	t
1095	0101000020E6100000918C88C54CF30E40B5608E93A6CE4540	11	4	2014-01-28	66926	4021.46808334842	t
1096	0101000020E6100000B7E1C0E8BDB40E40D890D88309CE4540	68	5	2012-03-14	98486	95202.5225314636	t
1097	0101000020E6100000CC502C1F77370F40ACCBFE786DCE4540	80	1	2020-03-27	32891	64794.5995562975	f
1098	0101000020E6100000678DD63D79310F40705BBDADDBC84540	2	6	2025-05-16	63607	70174.4751561893	t
1099	0101000020E610000065C17001A1740E40D33C4477D4D04540	52	9	2017-07-31	8818	44022.3793239877	t
1100	0101000020E6100000DFE50C99E5D50E40BF771BC2CCD34540	4	10	2010-05-06	48806	95389.1560242695	f
1101	0101000020E61000008DA3A70AF4600F40ED7B559CF2CA4540	87	10	2012-11-29	23176	25440.422394181	f
1102	0101000020E610000022A8464DF8730F40EEBAF9AAAAD34540	20	9	2018-02-24	8644	74004.9408278299	t
1103	0101000020E61000008CF59147F8910E4033BE28D3FECF4540	79	9	2017-07-26	58799	67495.1847508346	t
1104	0101000020E610000080E820F4C8A10F4092E439F5B7D24540	23	9	2015-11-23	58846	445.035435461349	t
1105	0101000020E6100000131BCD2B64890F407DD2908A16D14540	12	1	2013-01-20	45910	37514.5331853375	f
1106	0101000020E6100000028E8152E5240F40B5C36A601FD04540	79	6	2010-08-21	70327	77017.869827037	t
1107	0101000020E6100000F14FC059E4AC0E40F817CBF85FCA4540	84	5	2012-08-18	59521	18463.950903605	t
1108	0101000020E610000081B3568B06AD0E4035E366CDB0C84540	48	5	2013-05-05	94842	71132.8733120924	f
1109	0101000020E6100000D25A7273A8800F405573363250CF4540	80	3	2010-05-19	26458	41753.2458645452	f
1110	0101000020E61000008D6939393D020F406051D4E26AD04540	14	3	2016-03-10	67510	70503.2521990379	t
1111	0101000020E610000012A8183175200F40DF375A682DCA4540	72	8	2011-01-09	40432	99213.9412201152	f
1112	0101000020E6100000D0B75D97927E0F404C4F75BA5ECD4540	8	7	2025-06-25	67489	60585.9298762802	t
1113	0101000020E6100000A71BFF3D91850E407DC358D079C84540	26	7	2012-11-07	62112	34465.9290690994	t
1114	0101000020E610000025209ED8574C0F406D622B2C74C94540	72	4	2024-03-23	55780	530.616363747582	t
1115	0101000020E610000023A3FA164E460F40DBC2B0B6AFCA4540	61	10	2012-03-20	44596	53340.7318859355	f
1116	0101000020E61000007FF8DD13EE0E0F40955172F126D04540	86	9	2013-11-13	589	76197.7307311115	t
1117	0101000020E6100000A3CCEF5D47820E40A6DFBE1665C84540	15	3	2020-03-18	51023	82856.91625057	f
1118	0101000020E61000001DEE9A311B710E400CBEF19BAAD04540	91	4	2021-04-19	8899	27952.3684306602	t
1119	0101000020E61000006EF5BF07E1770F4020B0A98323D54540	99	5	2024-02-14	3864	34383.6493540693	t
1120	0101000020E61000008D2B5AA0CC930E408099A729A0CE4540	74	5	2018-07-23	20282	92480.8248623146	t
1121	0101000020E61000005D5210F4BEC90E408836ECD649D04540	94	6	2021-09-07	87417	21642.0980051241	f
1122	0101000020E6100000DDC3389183030F40C812EFF485D14540	88	10	2023-09-20	60544	4301.41065614178	t
1123	0101000020E6100000A3B6C630377E0F40F9F27A290BCE4540	82	2	2025-04-19	37993	52613.8449380602	t
1124	0101000020E610000048850428E0570F408F4E5FE057CA4540	27	4	2019-10-23	16971	99026.9746072383	t
1125	0101000020E6100000E71DC942BBD80E40A050AA4DD3D34540	75	8	2017-12-25	56964	331.655050275681	f
1126	0101000020E61000006C49730590F50E4000EF997924D34540	61	10	2023-07-05	27769	87519.9367169502	f
1127	0101000020E6100000A56F7E5A737C0F406ABC7CF5A2C84540	77	9	2016-10-23	97710	7330.6435666936	t
1128	0101000020E610000024547ED2C56B0F40A05637EEBDD44540	45	3	2016-03-19	34201	85.0924131733821	t
1129	0101000020E6100000185115BB4F0B0F40EDA74CF3A5CB4540	15	10	2013-11-24	76213	53228.8488494033	t
1130	0101000020E610000027AE9E66CCBE0E405886E278E0CF4540	9	6	2020-01-21	51916	52731.3397658431	t
1131	0101000020E6100000A8DEF91688CF0E40FCC71BE6E4C94540	52	10	2019-09-03	86199	79392.0130664141	f
1132	0101000020E6100000D5595AD543C40E40FEB25CC4B2D24540	1	1	2018-08-25	64494	48284.6459203689	f
1133	0101000020E6100000A7EB9D41CE880E409004E08D44D24540	43	6	2013-05-12	66694	48408.8127228564	t
1134	0101000020E61000007418D2AE84D30E40FFC970C94AC84540	24	7	2010-09-30	38267	75031.7577012617	t
1135	0101000020E610000094A0154BE8FB0E40227FCA7AF5CE4540	34	7	2012-07-07	84614	50023.0559837705	f
1136	0101000020E6100000FC706FD31A660F408C033E4A5CD34540	56	8	2018-08-25	25703	36065.986591517	t
1137	0101000020E610000015F3AF41B9EB0E4078E44DED06D04540	25	9	2020-01-27	91182	49250.7411329995	t
1138	0101000020E61000000AE4C3EEB97C0E40F9A0D403E2CF4540	79	5	2022-10-04	79838	91859.2061389661	t
1139	0101000020E6100000CB61683C27870E4028811F4FD7C94540	48	10	2023-08-13	73996	81003.3168689429	t
1140	0101000020E6100000C3CCB375A7CF0E40B4344A05A8CF4540	46	9	2015-08-24	31449	2814.46366911251	f
1141	0101000020E61000008BEF81095E4F0F406C664E68B5D14540	49	6	2013-08-29	91380	3999.3901688411	t
1142	0101000020E61000007BD286867BE00E402C4B9EF702C84540	43	7	2015-06-15	42143	32037.6720525245	t
1143	0101000020E6100000C5076E56535E0F40E2EA9248FDCB4540	36	1	2019-02-22	3832	60151.8507343634	f
1144	0101000020E61000001F0F7EBB4ABF0E40EAB0EA4B7FCB4540	22	2	2016-02-19	54500	29846.3019136676	f
1145	0101000020E6100000B6F4D8A58D9B0E40A75E2ACE78CF4540	54	10	2017-09-20	99118	82807.0752714867	f
1146	0101000020E61000009A18B63509000F407ACE697EBED04540	35	6	2011-01-14	48605	55235.0511315294	t
1147	0101000020E610000001A6B40098E40E40E2CA46E241CF4540	37	5	2010-07-06	29851	11202.2188568369	f
1148	0101000020E61000003E16A593A8760E40B9B5DA2F12D54540	89	5	2015-11-26	69519	82943.5517786358	t
1149	0101000020E610000090C1079D24830E40D3B1BDDB81D24540	96	3	2015-02-14	88347	48703.3276144414	f
1150	0101000020E610000064379D991B2C0F40EB2F535E43CF4540	86	10	2015-09-15	19055	57868.7780019772	f
1151	0101000020E6100000FACB85C4A0690F409F728F8F84CC4540	21	4	2017-01-22	80740	12647.9230519272	t
1152	0101000020E610000038F65351317C0F40217B942573D04540	56	8	2016-01-27	60143	40457.9623036903	f
1153	0101000020E6100000658E846086910F40553700A7D4C74540	97	8	2025-02-27	52337	25379.4252062474	f
1154	0101000020E6100000F2DF5A013FF90E40AE64C35877CB4540	5	3	2021-09-12	74250	57702.7990907429	t
1155	0101000020E61000006539A3BEEC050F401990A777DCC74540	96	6	2021-08-03	28199	54362.8377577204	t
1156	0101000020E61000003ABA6C0E28FB0E408C188E0AE1C94540	11	8	2013-03-15	51051	57247.9214062824	f
1157	0101000020E61000001073418DD1910F401056498565D44540	22	10	2022-10-26	91547	5066.88798489923	f
1158	0101000020E610000054806AAF3A930E4072172BB2E8D34540	55	10	2023-03-20	75498	37215.317710581	f
1159	0101000020E61000008AA9EF5DAFE30E4081B382F2B9D24540	10	3	2017-03-06	88452	21836.3532732981	t
1160	0101000020E61000003D4FD350F19A0F402425F86E1AD34540	27	7	2019-12-18	64410	32338.6099785012	t
1161	0101000020E6100000191512EB1C140F407F4070D99DC84540	64	7	2017-12-11	32788	58953.442815412	f
1162	0101000020E610000016FE9FD31C930F4032A5FCF749CA4540	17	3	2015-05-09	31767	91121.4560441692	f
1163	0101000020E61000007D202B3D12F40E407E0543D7DED14540	2	9	2012-05-19	22311	29621.3598257568	t
1164	0101000020E6100000DAAC99EB4DFC0E4000AAD440D2CD4540	57	3	2010-04-29	47067	71817.887409994	t
1165	0101000020E61000004C09A0BC132F0F40BA27F0DB3AC94540	24	5	2025-12-25	66076	83773.4073937088	t
1166	0101000020E6100000B9DAFD5A1E0C0F409BD8A6158BCA4540	98	2	2017-02-14	78760	56107.335048216	t
1167	0101000020E6100000C32CC8CF87E50E40ED079FC9C1CC4540	44	2	2025-08-20	50819	49183.1851177751	f
1168	0101000020E610000030D8BBBE47720E404D2C369A36D44540	55	3	2017-02-05	79507	24998.2072598221	f
1169	0101000020E61000008777E6FAD2300F4099D1BB5541CD4540	54	1	2020-07-06	78094	3739.13344174388	t
1170	0101000020E61000001A6354F9BF620F4080D54211B9D24540	39	8	2019-11-23	26491	82955.3272367228	t
1171	0101000020E6100000CB287B47769C0E403FD70C794BD04540	56	2	2011-04-26	43325	55253.2388748544	t
1172	0101000020E610000075C57D29BB810F40286651BDB3D24540	23	9	2017-10-21	60830	43342.1944348876	t
1173	0101000020E610000031EBF9A922860E40082C61A87BD14540	10	2	2022-04-30	52145	26275.9553626161	t
1174	0101000020E6100000A341ED1BF6240F40AC0D5B0A76D04540	52	5	2021-12-24	6624	36500.6562390684	t
1175	0101000020E6100000A0C84B6E873B0F4004C7DDCB41CA4540	34	1	2013-01-03	37622	13953.2769657904	t
1176	0101000020E610000059A7535A638B0E407B672A0FD9D14540	77	1	2010-09-27	11833	69900.2818311951	f
1177	0101000020E6100000AA8B4444818D0E401BCC30C6EDD24540	31	10	2017-05-22	65473	63870.2139665703	t
1178	0101000020E61000008942B644997F0E40A3416DC34BD14540	62	9	2014-12-12	33700	5068.59682866583	t
1179	0101000020E6100000A022EE800FEC0E400328BB03D1CF4540	26	10	2012-09-08	172	50213.2392382601	t
1180	0101000020E610000095CE9EBADD660F4098CCE320B8D14540	54	8	2013-07-14	60090	62165.20420417	f
1181	0101000020E6100000184DFD775CFA0E405697E3CDC1CC4540	75	2	2016-10-07	45080	93794.4463405841	f
1182	0101000020E6100000D53B8B0A71480F40E7727918F8D24540	47	2	2025-01-18	66308	69286.4796434509	f
1183	0101000020E61000007B3F25B6F65F0F40B89F22105CCC4540	4	2	2011-03-26	34986	90760.5202453933	f
1184	0101000020E61000004CDDDEDA63DA0E4032D12CBA72D04540	53	2	2018-10-12	76924	3163.19279148323	t
1185	0101000020E6100000DE3C3AD1B35B0F40E056A537B6C74540	40	3	2016-09-15	99938	42981.2781819603	f
1186	0101000020E61000006E259C9EF3110F40482B080E1DD54540	68	10	2022-12-18	81917	78882.1138523788	f
1187	0101000020E6100000E966FDA114190F40EFA264F883CC4540	82	10	2023-02-16	33719	76811.432806825	t
1188	0101000020E6100000452FBA7DFBF40E401A7D086A4DCB4540	33	10	2020-08-21	69158	4160.78364920933	t
1189	0101000020E6100000046B7DD2220B0F40C075C6DA20CF4540	52	8	2011-05-23	98349	6777.16031323576	f
1190	0101000020E61000001686B06E7C9B0F4001377B4687CC4540	54	2	2010-01-15	81027	39421.8468943958	t
1191	0101000020E610000053D5B7FEAC800E40138DFC9259D24540	91	10	2015-11-13	7266	83299.9793257261	f
1192	0101000020E6100000A68CE976C6090F4020D1FD202FD54540	36	10	2021-07-12	31695	45843.5933670443	f
1193	0101000020E6100000B357CB23F3A10E407D3796EBDFCB4540	8	1	2022-01-14	93415	4162.46606631299	t
1194	0101000020E61000002C9D5A84B1710F400D5D5A5FA2CF4540	41	1	2022-08-07	41673	92022.8338434465	t
1195	0101000020E6100000F329566B6BEE0E40DA338A5125C94540	40	4	2020-02-15	93952	68085.6174480146	t
1196	0101000020E6100000247A1C6024A80F40D5F8DE33A7CF4540	25	10	2019-07-11	30311	58247.3168186561	t
1197	0101000020E610000034D1A24984A10E4008EA40D61DCD4540	66	10	2010-07-25	61149	28811.150325724	t
1198	0101000020E6100000AD34299F6EA50F40BEACF81B5DD04540	70	8	2015-04-28	88841	3477.89186875136	t
1199	0101000020E6100000BF44D2E5472D0F4011581490CECF4540	25	6	2018-05-20	27566	17119.2231641797	t
1200	0101000020E6100000C7C69F63683B0F4000493D3FD2CC4540	46	2	2010-07-08	55335	18831.7190041815	t
1201	0101000020E6100000A37B430C31B00E404E5E9103E4C84540	18	9	2024-03-04	60681	11469.9887772546	f
1202	0101000020E6100000F609BF084C8F0E40B38771502ECF4540	45	9	2025-07-28	32210	34297.2158489993	f
1203	0101000020E61000002651F60BCAE80E404F5E2E5AB0CD4540	19	7	2016-02-16	51515	98202.526699311	f
1204	0101000020E6100000F2394CDE31A00E4040D1AB97B5D14540	69	6	2017-12-25	18467	66644.2000381957	f
1205	0101000020E61000009DBB4FCC60C60E40718956903ED04540	58	5	2024-04-16	13533	41074.9099064149	f
1206	0101000020E6100000F472A4B402950E405AAFC9E0E8CD4540	70	1	2016-09-11	96824	3266.13781255092	t
1207	0101000020E61000009A27784DB5880E40E367A88DF0CC4540	42	2	2010-07-09	13188	16593.7404005935	t
1208	0101000020E61000008629BF3A04960E4063ABB6CAE9CA4540	99	8	2017-09-15	80325	18211.9702650409	t
1209	0101000020E6100000EDFB9BD80A3F0F4094212C807FCE4540	84	7	2011-05-30	68413	87176.3889903433	t
1210	0101000020E6100000C79D6DC363450F4063D4F83CF8D24540	69	9	2016-01-18	82580	87575.596794319	t
1211	0101000020E610000005F34554CC940F4030A81A12E6CF4540	20	8	2025-08-23	26372	44042.0872285421	t
1212	0101000020E61000003F66395D46AA0E40A68E22DD5FCA4540	68	1	2014-12-10	78370	58689.0849959046	f
1213	0101000020E61000000A71C115F42A0F40B56AB2661CD14540	1	8	2017-04-08	87194	24024.4670498371	t
1214	0101000020E61000002A585D7EA4A50E406E6FC40690D14540	45	10	2020-09-27	55620	67740.9948317366	f
1215	0101000020E6100000DD1D5018BC3F0F40424A784F69CC4540	51	2	2024-03-21	42002	83536.480931823	t
1216	0101000020E61000006986F38E028F0F40FA4E3AE746CA4540	99	7	2015-04-19	79176	5881.48605812993	t
1217	0101000020E6100000EED944EF6B840E4062D37F0040CF4540	95	1	2012-05-05	18314	20284.4132297697	t
1218	0101000020E61000002B818951E4530F40A61928AC5ECE4540	58	8	2024-10-14	69885	97629.1269470077	f
1219	0101000020E610000080175ED555AC0E40CA43D3E6C7C74540	96	6	2021-03-01	53053	76683.5788534286	f
1220	0101000020E61000004DA0A84F41150F400DDC7FAFA1D24540	70	6	2024-07-01	88354	87888.244288606	t
1221	0101000020E610000017A3A8AA79980F406E5F0B2B4FCE4540	82	8	2014-11-10	99552	52099.2350948583	f
1222	0101000020E6100000AE8139CB405A0F400849BE775FCB4540	16	3	2015-08-02	159	19074.4105158641	t
1223	0101000020E61000007DED4AAFB4710E4074A666AB53CC4540	64	3	2022-03-14	73861	16842.6588314938	t
1224	0101000020E6100000725319FDE7810E40C768767816CB4540	2	7	2014-06-01	57793	86699.2089832686	t
1225	0101000020E61000008AA276124F030F401513AF926DCA4540	87	6	2010-06-23	77530	32783.1553002625	t
1226	0101000020E61000008E37C1BFD6F00E403677852F67CA4540	16	7	2012-12-26	62780	96370.212665377	t
1227	0101000020E6100000E50F7FF8135B0F40BC20BDBF1CCC4540	10	10	2015-10-06	66441	8117.00397893174	t
1228	0101000020E61000004D8DBFAD2D350F400A309B4666D34540	76	4	2025-05-06	33425	87421.7685652131	t
1229	0101000020E6100000A3716A75A4240F40D7E1DE13A5D14540	8	6	2024-12-28	51567	19695.8371141256	f
1230	0101000020E610000092A5F93CC2E60E40A1B9C9CDACCD4540	13	9	2025-09-09	95684	80636.8789752723	t
1231	0101000020E6100000D0B2629326490F406CED324453CC4540	64	2	2023-01-12	43091	84028.1571147099	t
1232	0101000020E6100000BF7A26BCFE480F408F4C39ED05D44540	84	5	2013-12-13	19368	96715.761902488	t
1233	0101000020E61000007F8EDC01DC530F40BA91277912CC4540	72	1	2016-05-22	91614	48750.9184942985	t
1234	0101000020E6100000C5242AC160960F40DF35575FB2D14540	65	10	2014-02-01	71045	80909.5155109057	t
1235	0101000020E61000006F5D3BFFD0920E4097A07A8302CE4540	7	2	2016-12-03	22201	29602.8917461617	f
1236	0101000020E6100000457922F671EB0E4074B8B9809DC94540	54	10	2014-08-23	1811	4492.15891584944	f
1237	0101000020E61000005E6BD802299C0E40B3A6CF4BD7CF4540	66	9	2013-01-28	75255	61965.7986194128	f
1238	0101000020E61000004CE90B858DF90E40DFFF9AE52CCE4540	16	8	2015-04-05	16496	22399.9603639723	t
1239	0101000020E6100000B468D4C55B9F0F40119FB9CC1CD44540	1	8	2011-06-13	71627	22876.1230008655	t
1240	0101000020E61000000574F25FBF0B0F402D50874566C94540	8	4	2016-09-24	6996	88194.2790582073	f
1241	0101000020E6100000318F183325750E4016C6C40DB7CC4540	36	10	2015-11-09	83348	18782.4827886933	f
1242	0101000020E6100000F6E2721DCD3F0F4035FED8DD80C94540	67	8	2011-01-11	28681	47043.3812170306	t
1243	0101000020E61000005F5BC28D98950E40594B4CBE87CE4540	89	9	2019-07-23	97957	86033.1167905269	f
1244	0101000020E6100000748404C3D19E0F408EEB84EB34D54540	70	5	2020-02-25	35455	19481.2448300006	t
1245	0101000020E6100000A7022467EE510F405D816EE0C2CF4540	74	6	2019-04-21	90419	38913.8795227162	t
1246	0101000020E6100000188EB7A396A00E406456AE7886C94540	18	9	2021-03-30	91794	97977.6574131526	t
1247	0101000020E6100000E4CC9221C7510F404289C396C4C84540	27	10	2020-01-14	59933	64078.5939048884	f
1248	0101000020E6100000FC7C34335DC90E40BA6C4AC09BD34540	16	10	2014-09-19	14514	99980.1105840881	f
1249	0101000020E6100000AB4C0F2D40320F40EB340880E8D34540	75	8	2013-12-23	20124	20859.3946706583	t
1250	0101000020E6100000944FEB243DAE0E40495120F21DCA4540	24	5	2016-01-22	54173	818.909363930564	f
1251	0101000020E6100000E6F811EBB38C0F400F6361AE93D44540	66	6	2024-02-16	96562	84983.0175836142	t
1252	0101000020E6100000CD2281A329C60E4010657325C0C84540	44	2	2017-04-09	43956	82587.9001350362	f
1253	0101000020E61000004C4096EBCC900E40485216EEF6D04540	77	5	2010-12-13	91407	35429.9428838427	t
1254	0101000020E6100000C24C5831B2CA0E40DF242404B4C84540	30	3	2023-08-25	58572	28313.5898656757	f
1255	0101000020E6100000E61DE225C8F20E40B07D6DC257CA4540	61	8	2025-11-14	23992	30794.7941278503	t
1256	0101000020E6100000822D67633C6B0F407131A92F61CA4540	33	4	2018-07-27	96086	35873.921004321	t
1257	0101000020E6100000838EDA7F856D0F409BDEDDAB25CE4540	7	7	2014-10-22	38471	5183.71509082365	f
1258	0101000020E61000006F1AD2D6D4250F40CFFC3BF170D14540	99	9	2021-03-20	84395	15813.0229284665	t
1259	0101000020E610000071D4BD9A2FCD0E408A2292A06CD14540	87	9	2025-10-19	28009	9788.89036798125	t
1260	0101000020E6100000766DB3DC3D890F40417377CFCBCC4540	71	3	2018-03-01	51998	44935.4982759193	f
1261	0101000020E61000004C23E5A0DA190F402AF0AF952FCE4540	54	6	2025-04-15	83045	19213.7098740075	t
1262	0101000020E6100000951A9E9DFFE50E40C1273B0DEEC74540	63	9	2025-01-09	29311	30740.6427297788	t
1263	0101000020E6100000D877357F6D6A0E409F7C59D414C94540	34	8	2021-11-13	44335	80818.0616820102	f
1264	0101000020E61000006FD925DA83110F4071FEF536C1D04540	93	5	2023-12-24	56604	49896.5904474564	f
1265	0101000020E61000005D581319216A0F40EB2BED91FCC74540	50	8	2021-07-17	66642	33392.1056575456	f
1266	0101000020E610000078888F98D5820E40A100FCB0A5CC4540	41	8	2020-04-10	29966	53540.0274768406	t
1267	0101000020E61000009117C72FBC400F40A64E889985CD4540	88	4	2018-07-11	96170	86698.1642648255	f
1268	0101000020E61000006241AFF2DD540F40ED3FC5035FCC4540	26	10	2017-11-24	17714	15482.9041425884	t
1269	0101000020E610000056CE02BC40E30E409695AC326ACE4540	1	6	2014-07-28	77598	39226.9984481945	f
1270	0101000020E610000011D1EA5E916B0F401E0D240EC5D24540	28	4	2017-08-31	29733	60058.3140794046	t
1271	0101000020E61000009F2C74D632870F408B693338A9CE4540	73	8	2017-05-04	96553	91829.2666587069	t
1272	0101000020E6100000E56C5D3D38B20E40AD5DEF6B00D04540	31	10	2023-10-14	98254	47328.8947677331	f
1273	0101000020E6100000E14294C8A4720F4066B63FF22AD34540	56	3	2018-10-31	16288	83044.0580054551	f
1274	0101000020E61000006E8A75850B640F40BBBC0A7D80CC4540	32	3	2016-01-29	83372	11339.1489113893	t
1275	0101000020E6100000FFA439F6E7190F407B3D5B2275CC4540	92	6	2016-04-27	97001	68710.642214974	t
1276	0101000020E610000089FE7C2384A30F406E87EFFC71D04540	99	10	2020-05-24	17013	52969.6741462592	f
1277	0101000020E6100000355490AB20B10E40451FA47C6ECF4540	91	5	2011-09-28	4579	52944.1431608527	f
1278	0101000020E6100000D7FCC6BC66880F4074365C4210CE4540	90	5	2021-07-30	90136	54612.1968229735	f
1279	0101000020E610000042A6B829AA180F40ADF5B656E6C94540	97	2	2022-12-30	62435	30287.094010738	t
1280	0101000020E6100000442FF9C208A20E40DBEFEAAEDCC84540	71	10	2025-07-19	97677	30412.2312271796	t
1281	0101000020E61000008FE08398136F0E406C80545373CA4540	41	2	2010-04-05	61490	41479.2966786278	t
1282	0101000020E6100000E618F664673E0F403F6F59FEF6D34540	36	9	2025-01-12	72149	17853.287848156	f
1283	0101000020E6100000E5FD777FC0E80E40E3E8CDFB6EC94540	22	1	2024-09-15	89488	96305.1383296726	t
1284	0101000020E6100000A3DE59B504F50E401C9E7EFE70CE4540	11	4	2025-03-15	92894	14830.1520817087	f
1285	0101000020E61000009355A53A72AD0F408F558CC543CA4540	87	9	2022-10-22	4573	65460.4950984731	f
1286	0101000020E61000006A1D1997CBBF0E4016F9498587D24540	4	9	2019-07-28	8241	71976.0749204565	t
1287	0101000020E610000017A943068CA20E40E80BFE13D3D24540	4	6	2011-08-31	83750	4134.56990520138	f
1288	0101000020E61000006986AD0BC85C0F400D97581EA4CD4540	1	9	2017-09-19	5956	9308.68671701304	t
1289	0101000020E6100000881188920B670F4081F8F41A6CD04540	60	1	2015-08-23	7447	46073.0433309665	t
1290	0101000020E6100000091A1914F89F0F40FAAF087E23CF4540	11	1	2015-02-09	69543	47255.8422389888	t
1291	0101000020E6100000ABA81CACD9A20F40629DFFFA02CD4540	40	6	2022-03-23	73044	18480.0648884135	f
1292	0101000020E6100000FB1025336E330F401447044E12CC4540	55	4	2011-08-29	76136	25166.3361523883	f
1293	0101000020E6100000FF31D9052C120F401E47EEEE5CC94540	14	7	2025-01-23	7662	80564.6744876569	t
1294	0101000020E6100000E3DE4F75B25E0F403C60F00634D04540	38	1	2015-08-11	83221	70065.3590413783	t
1295	0101000020E610000043F2655662F90E4033B227D33CD24540	5	9	2024-03-13	55171	23819.008081792	t
1296	0101000020E610000063078727312C0F40D92C7F92F2D24540	56	6	2023-06-04	97103	72534.2382674573	t
1297	0101000020E610000040B1B5F36B0B0F409BB0551F9BCF4540	48	4	2023-04-20	37213	65782.9261940857	f
1298	0101000020E61000009FCADD1140E00E40CBC681274ED34540	57	9	2022-04-28	35300	45237.2689522208	t
1299	0101000020E610000060CB95DC4C840E40B088B530ADC94540	22	1	2022-05-24	77528	39443.475497528	f
1300	0101000020E61000008F3AE16628720E403CBA32E7C1C94540	2	7	2016-12-07	3286	73972.3864703895	t
1301	0101000020E6100000AC051343E38F0E40231B2B03FCD14540	31	6	2013-02-14	15333	17398.1911110297	t
1302	0101000020E6100000148197536CC30E407460BC9A87D44540	22	2	2023-03-20	3448	30540.8290580945	f
1303	0101000020E610000075675AA60A050F407272C5E33FCB4540	85	8	2019-11-11	96620	48822.0351408794	f
1304	0101000020E6100000EA7355C95C850E409460711BAFD24540	95	7	2021-01-14	64278	24975.0815662379	t
1305	0101000020E6100000919FC0520A9E0F404749068908CC4540	48	10	2019-02-20	669	10863.6486102889	t
1306	0101000020E6100000536674270E1A0F40FA56EF4BEAC84540	18	9	2024-11-16	36865	70933.8685828399	f
1307	0101000020E61000008458AFB3143B0F40D795431B36CC4540	29	9	2014-08-21	18196	44191.2594448328	t
1308	0101000020E6100000DE6FC6CEB0690F40E59A7F7824D14540	72	2	2021-01-11	88760	97231.5077494041	f
1309	0101000020E61000005CDDEFA732E30E40BC3AD7534CD54540	41	7	2019-02-05	40868	37414.2699956628	t
1310	0101000020E6100000862F019C5AD80E403192A7CFE4D24540	20	10	2025-05-31	52038	93665.3143810957	t
1311	0101000020E6100000B8A326946F800E406AB99D1156CD4540	52	9	2010-07-23	67061	89884.1186450871	f
1312	0101000020E6100000509D1C3F17660E4011C14C4B55CA4540	39	8	2015-07-20	85255	90879.4827808531	t
1313	0101000020E6100000D6D49BB8627E0F408877C613BBCF4540	85	1	2020-09-05	6281	68530.8484758141	f
1314	0101000020E6100000EAA395F2DF620E40F1C68F3AC9CB4540	65	3	2014-11-07	469	68350.6355077242	t
1315	0101000020E61000007BA974CAA74E0F4059391D0DD6C74540	10	2	2022-01-16	44359	43919.2350664021	t
1316	0101000020E6100000DF36EC11CF800E408FA8835452CE4540	96	5	2016-09-27	98347	70228.6333280506	f
1317	0101000020E610000078F0D4B47C7E0F402D451128B4C84540	33	8	2012-06-04	71175	18613.3082521602	f
1318	0101000020E610000078C57F96237F0E408DA2EFE910C84540	3	6	2016-01-15	27542	43705.7959595269	f
1319	0101000020E610000085157EF6DAB10E40DAA237674ECA4540	77	3	2016-12-03	91022	73755.162742661	f
1320	0101000020E6100000BA4F60C45E850E400A572D7EFECE4540	28	2	2021-01-29	78015	44623.2855591443	t
1321	0101000020E6100000C70840E8D79E0E404BA1BED8F1CD4540	87	9	2024-03-02	30679	31935.2875138652	f
1322	0101000020E6100000DB27BC1C977C0E40C323AF3508D34540	41	4	2010-11-01	46242	30457.9456620639	f
1323	0101000020E6100000A8A4876BA18F0F400DEA6A5031CC4540	70	1	2025-08-15	21458	75090.8324042545	t
1324	0101000020E61000004AD1A9AE58700F40F26AC31908D44540	52	7	2020-09-16	30919	71244.6596017992	t
1325	0101000020E61000005B155BDA80F10E404D200F8DEAD34540	50	4	2017-05-03	42118	61833.8211997639	t
1326	0101000020E61000002F600E8EB2710E40AF755914C5CD4540	13	1	2010-02-25	13	91418.6889167895	f
1327	0101000020E6100000DE93BEE3532C0F4004EEB21B16CA4540	31	2	2025-10-13	22697	43573.2529879802	f
1328	0101000020E61000007669EBABF3480F4056ED7267D3CA4540	35	3	2015-03-21	98287	94080.0523247525	t
1329	0101000020E610000033E28FAA9B0F0F40547CC08DEEC74540	85	2	2012-11-03	81601	80129.648989869	f
1330	0101000020E61000007F807A70E56F0F4036F4C9D783C94540	70	8	2012-03-18	33328	71182.8162546058	t
1331	0101000020E61000004A22E4B489CF0E40710C32E0D9C74540	6	6	2024-09-15	93612	59702.2853859706	t
1332	0101000020E6100000CE0AB182423F0F40977346A6C0D44540	7	6	2017-10-31	3470	64949.1558063502	t
1333	0101000020E6100000484DEC23EC930F407B61019038CE4540	78	4	2021-01-18	23636	12177.8226110111	f
1334	0101000020E6100000A24D110592450F40583A7159A8D04540	94	3	2020-02-03	88494	72596.2284362416	f
1335	0101000020E6100000A3D2AD2CB7FE0E409A34D120D4C94540	9	10	2016-08-11	20764	66501.4988564998	f
1336	0101000020E6100000D55B2CDD50640F4026B10E86B5C94540	23	10	2017-06-03	50799	84744.6072095959	f
1337	0101000020E6100000C46D7750669B0E40B0D8808911CA4540	37	4	2016-04-11	10928	97355.4768426811	f
1338	0101000020E6100000CF46A274C0AC0F4093DED73433CF4540	4	9	2011-11-20	72712	23998.1802648901	f
1339	0101000020E6100000343219C4379E0F406538615408D04540	59	2	2025-09-09	69267	23352.6656935643	f
1340	0101000020E6100000E37B64C5ECDB0E40D7FC0F31F4CF4540	14	6	2020-07-08	73250	78423.3625693747	t
1341	0101000020E6100000FDCB2CE5487F0E4016B01B3667CC4540	6	3	2018-09-14	49644	12368.7663760909	t
1342	0101000020E6100000FA4684BF51160F40AEEAF4F030C84540	26	9	2019-07-27	77226	95525.0465635501	f
1343	0101000020E61000008F4C80DBD8670E4053F8E6B813D54540	66	6	2025-02-03	28424	19321.8837033842	f
1344	0101000020E61000002555CA8CA8040F40F6D33E9EEDC84540	57	3	2014-09-06	98581	64091.0079358542	t
1345	0101000020E61000003957B7DBBAC10E40B2E775795ACC4540	29	4	2018-05-01	3315	70260.3247571652	f
1346	0101000020E61000001E90A393F67E0E40A1D94B8E59D54540	4	7	2023-02-11	1118	15364.1878684891	t
1347	0101000020E6100000672ECEE92A220F4018E070E8B7CC4540	80	8	2018-08-20	94496	6637.00817209847	f
1348	0101000020E6100000858760363F0C0F4055076C8353CA4540	48	6	2020-10-22	7695	18421.1740272734	f
1349	0101000020E610000064A7781077900E4049E0552E1CCF4540	84	9	2014-03-13	2715	52439.0851787738	t
1350	0101000020E6100000A11A5C18994C0F405744E8C538CC4540	21	5	2021-05-03	1270	33336.412830823	f
1351	0101000020E6100000411097DE8A080F4003E72EAAEACD4540	41	3	2010-10-20	32568	16990.9949242881	t
1352	0101000020E61000004976AA042A4F0F40899C304143CA4540	19	3	2015-05-27	60317	5984.07691578211	t
1353	0101000020E6100000D518BDEF746A0F403D170EF54BCE4540	16	8	2025-09-30	83278	22057.9244861182	t
1354	0101000020E61000004BFD99D234F80E4009E336F8CCD24540	83	8	2015-05-27	67522	51454.735257053	t
1355	0101000020E61000002E9AC1B23CF50E408BB152D193D24540	9	7	2012-06-01	90105	88145.9106864034	t
1356	0101000020E6100000886ABAF54A220F4064F084EF00CE4540	70	4	2025-04-17	74876	56875.7318291691	t
1357	0101000020E610000097CF6E883D970F402A21500B79D24540	40	4	2022-06-28	65497	79896.6546528111	f
1358	0101000020E610000044CE19E5B7460F40AAE8AA9AB3D24540	88	1	2021-02-08	37264	13428.5023864441	f
1359	0101000020E61000008B677C6F4E630F40E9F627EB25CB4540	81	1	2017-01-30	22414	38515.4922463559	t
1360	0101000020E61000005F1B4F7807570F40A1BC07BF25CA4540	17	8	2013-01-27	8267	29961.3036584346	t
1361	0101000020E6100000DA368257EA9C0E40514EF0F847CD4540	92	3	2011-09-20	65746	9927.78261530147	f
1362	0101000020E6100000BB8A8680C00E0F409A8594DE73CD4540	100	5	2017-11-02	8176	28440.3894140074	t
1363	0101000020E6100000467018E147220F40B11E73B2C0D44540	79	3	2012-02-25	72901	83926.2582204534	t
1364	0101000020E61000007BB6B461A9290F40D542CCF948D34540	79	7	2022-08-12	77154	95846.7587112995	t
1365	0101000020E61000001057E7A8EFA20E40605014A417CD4540	4	5	2016-01-02	85083	66345.1710661629	t
1366	0101000020E610000076B56592FA250F4093E2780DADC94540	57	7	2011-09-30	5289	4931.24038264874	t
1367	0101000020E61000006B08C506E2A00F403CD43D94D9C84540	22	7	2023-07-01	75209	82767.1054744181	f
1368	0101000020E6100000C70A67755B510F409572005D80D04540	21	6	2017-12-17	50937	23523.7841990771	t
1369	0101000020E610000097AC106E50990E405FE3D99888D44540	18	7	2021-11-07	64068	9386.60538362606	t
1370	0101000020E61000004B111DAFB36A0E409DA558CB7FCE4540	77	6	2023-02-11	8931	61791.7635522509	f
1371	0101000020E6100000974F118409760E40D079A2A368CD4540	44	5	2024-03-04	9868	75789.1369622894	f
1372	0101000020E6100000694D5C38DAA50F409B01099121CC4540	59	4	2015-01-12	79688	70568.9385160382	t
1373	0101000020E6100000EFD529F99AA70E405C4E10E9E3CA4540	69	8	2012-02-13	97584	20537.4458087015	t
1374	0101000020E61000004DAA7A2627610F4016476F72C4C74540	69	8	2022-04-17	70836	17463.8433017543	t
1375	0101000020E61000007559870D4B740F40C1E38152A9C84540	11	9	2025-09-25	72315	33398.9142499839	t
1376	0101000020E61000005AAB7661ACF00E408607D02E5BC84540	47	6	2021-02-25	79181	43970.2587281762	t
1377	0101000020E61000009236F892F5DF0E40E8A1518C93D44540	29	7	2021-02-16	30523	1841.07417958383	t
1378	0101000020E6100000F617CDCC05C70E4004D35B9D34D54540	45	4	2018-01-22	67683	13894.3454339073	t
1379	0101000020E6100000CD6381A215BC0E40089FD49BD6CB4540	80	6	2024-07-12	12173	66032.1874417625	t
1380	0101000020E610000048BCFDD126540F40C5E49D411BCF4540	8	10	2017-11-11	59256	27903.1763634592	f
1381	0101000020E6100000F7D8577507A50F405A159FAF18CE4540	51	10	2022-05-08	95341	63819.272811097	f
1382	0101000020E610000038C7AF61590E0F40367CBC2226C94540	1	6	2017-03-22	23137	49015.6219234671	t
1383	0101000020E61000007F4D7109975A0F40B42F6245D9D24540	11	1	2014-06-17	82619	36059.8375892615	f
1384	0101000020E61000002E66B94F598B0F409F09B5911CD34540	98	7	2022-03-06	75434	74061.1757316495	f
1385	0101000020E61000007B03DF3D2E450F40A7602BC5EFCD4540	20	2	2017-09-04	9877	70634.7101056522	f
1386	0101000020E61000009D675936AE810E402DAE1558B0D24540	74	7	2021-10-03	30478	93897.5784495849	t
1387	0101000020E61000000E446C42462A0F400EE2630AC3CC4540	76	3	2011-06-18	32196	6143.67038571664	f
1388	0101000020E61000000A05DE611B360F40650486B6ABD14540	56	8	2020-03-26	92723	97727.9088505485	t
1389	0101000020E610000058FDE38478ED0E40F67B011103CF4540	38	10	2012-12-07	3670	38191.5347243895	t
1390	0101000020E6100000F0CC79B45D160F40A08D8F9DB1CE4540	22	5	2016-02-29	82595	50612.6526588144	t
1391	0101000020E6100000D044DB3DBC470F40C161EEDBABC74540	8	1	2012-09-28	83075	60636.8925372518	t
1392	0101000020E6100000798C17A2DEE90E404D5D18C208C94540	80	7	2024-02-01	1437	20028.365780257	t
1393	0101000020E61000002EED1705B9390F40D01C11B25CC84540	75	2	2013-06-25	33516	89033.9618639461	t
1394	0101000020E6100000DA98D3905BD40E40EF69360454D14540	21	2	2013-02-02	89898	2282.18819791091	f
1395	0101000020E6100000EB4ED7A9EFF80E403D6A335B70D24540	21	9	2016-02-10	84247	22603.8286767903	t
1396	0101000020E6100000012A71B7A8580F40A4B1D14E78D24540	33	1	2011-08-13	28201	66602.4302875221	t
1397	0101000020E610000018A03CAEA4120F408A164D2CBCC94540	10	4	2019-07-22	4211	79477.5815727773	t
1398	0101000020E6100000EAB17A9303A40F40C8BC0530D9C74540	25	6	2018-07-28	63197	57331.1150158442	t
1399	0101000020E6100000B50213E5B5E90E405B0BC0AD03CD4540	58	6	2010-02-10	78142	56943.36729694	f
1400	0101000020E6100000107E5701E4340F4002544FB7F5C94540	25	5	2019-03-09	80196	14225.446373852	t
1401	0101000020E6100000A3CA7B53BF8F0F40ED28B69B60D44540	50	7	2020-09-21	37576	75825.3888116408	f
1402	0101000020E610000005B5D61126A00F400B6BD5C342CC4540	28	7	2021-01-08	78843	42260.1246618996	t
1403	0101000020E61000005B003444AB370F406A59954E69D44540	20	9	2011-09-29	12602	14667.8070075427	t
1404	0101000020E610000093CFD4A3FE780E400A4D18EBDED44540	50	3	2015-10-10	56809	33199.2751931246	t
1405	0101000020E61000001D8B3AD2012C0F408B1E096C26CB4540	64	5	2018-08-12	3836	22639.2642036551	f
1406	0101000020E610000097C24B3391830E4080EB60094FD54540	95	3	2015-04-22	57786	71858.3955423258	f
1407	0101000020E610000025705BFCFF900F4023F4CC5D08CA4540	19	2	2025-12-25	38534	22712.6933617078	f
1408	0101000020E6100000116AEA2F76A10F4009EF40AC5DCB4540	57	4	2023-02-15	43718	50503.0728365402	f
1409	0101000020E61000009FE3E5557D170F40B111E0B1F4C74540	15	2	2010-05-14	4987	2170.72394648652	t
1410	0101000020E6100000CB5FDFB910650F403369C13E39C84540	18	5	2011-12-30	59853	57164.7166367816	f
1411	0101000020E6100000827805B5B1930F404122B5EFF1D14540	86	9	2019-02-12	1012	17212.5107913513	t
1412	0101000020E6100000D33A590E0DAD0F40618C5781E8C74540	55	5	2011-04-26	66517	15978.3887689912	f
1413	0101000020E6100000DADC05FF20A90F40F169F32F19D44540	23	1	2011-02-27	11027	28651.9515715628	f
1414	0101000020E6100000F971F702FAA90E40D76A4E6A91CF4540	21	2	2022-10-02	49899	48077.8550285043	t
1415	0101000020E61000006DA32546EB150F40FFECE7FD1AD04540	6	3	2019-10-02	18663	27237.116313089	t
1416	0101000020E61000003331A939A1040F40561ABF4700D44540	47	6	2015-09-03	87634	56570.1299386534	f
1417	0101000020E61000003675B6D7E0850F407AB20A5A33CA4540	79	3	2018-08-30	55596	4927.30728152047	f
1418	0101000020E6100000EEC4B5C313170F40EF0C32C530CA4540	96	5	2021-04-20	100	99412.7088616675	f
1419	0101000020E61000004ED785C380990F40C356C7F6D2C84540	19	2	2014-10-12	90612	50813.3594779382	t
1420	0101000020E6100000B0B1529E836E0E4060DF816776CA4540	21	9	2020-02-02	39675	49124.9771825603	t
1421	0101000020E6100000FE4317B15E790F409E3E34E83DC84540	95	8	2010-03-23	58420	42371.6041530581	t
1422	0101000020E6100000B8776FF0D9720F40A0EC49EBF9CD4540	51	1	2019-06-16	99814	64570.4823042982	t
1423	0101000020E6100000AE318ED497630F408D2D4E7C22D54540	17	5	2016-07-02	34392	97654.8999890506	f
1424	0101000020E610000050B9602F29950F40FCAE0CC849CB4540	94	7	2022-04-18	63249	66758.9335003307	t
1425	0101000020E610000050ABFA9D2FAA0F40A2E3AED45FD34540	70	8	2014-11-18	76931	62119.1112164751	t
1426	0101000020E61000000B50A0C8AB700E405E6365AC8ED44540	9	4	2011-07-31	57812	7977.64665874161	f
1427	0101000020E6100000C66AD7C36D910E4052B50F5D99D44540	6	3	2012-10-17	91638	59561.3457133076	t
1428	0101000020E6100000360479108CD90E4042FB600D3CCE4540	59	2	2022-11-21	12166	5483.54445981398	t
1429	0101000020E6100000174AB93FE2DC0E409E5BA16E32D14540	19	10	2020-12-08	43663	80835.6920693354	t
1430	0101000020E6100000F3FD4028719A0F4036EDEF7ECAD44540	26	7	2015-07-20	51695	40008.6046639159	t
1431	0101000020E61000003E8CD82016960F40B248EA5F88CF4540	82	1	2025-02-20	55475	33250.6142169984	f
1432	0101000020E61000001818D688E3B40E403D2C9893D9CA4540	80	7	2017-11-28	6789	79771.7287475806	f
1433	0101000020E6100000A7130AEBAE7D0E403849850043D34540	35	1	2017-11-19	8159	62449.7128194042	t
1434	0101000020E6100000B8887FD583650E407C0F6BF054D24540	8	3	2020-07-11	47961	59330.3306296984	f
1435	0101000020E61000000506F556288D0F40FC57B3EE9ED24540	79	10	2022-08-02	16268	34266.1612552043	t
1436	0101000020E61000008628BD3572E20E402A325A163BCD4540	77	7	2011-10-24	58953	21435.0350208401	f
1437	0101000020E6100000021E617FE9770F40A45954C64CCA4540	57	10	2024-07-30	10179	40375.4576162043	f
1438	0101000020E610000098DB1AFF4BA00F40BE1A512EDFCB4540	6	3	2010-07-31	72553	7833.03286288237	t
1439	0101000020E610000043B90F8246AF0F406811201552CB4540	94	2	2021-12-26	72322	96920.8743820717	t
1440	0101000020E6100000E988CD3D26AC0F40C536153A75CF4540	53	6	2022-05-12	22418	78105.5295427692	t
1441	0101000020E6100000663A900818AA0E40D58A102CC4D44540	55	5	2011-03-31	51019	24061.937905528	t
1442	0101000020E6100000BFD4BF4C66CF0E409DAD16ED66C84540	34	10	2025-03-03	75233	67411.1958236434	f
1443	0101000020E6100000F442ACF4CC7F0F4068BDF71FF3CA4540	15	2	2020-04-21	51410	7575.45141929412	t
1444	0101000020E61000006F99CA266D840F40AE6C8E414DCD4540	26	8	2012-08-16	14970	81471.2395291648	t
1445	0101000020E610000038EDF41857720E40F5C505CF44D34540	11	8	2018-03-13	80608	93776.6927788294	t
1446	0101000020E6100000EA8ADCBCFBC10E4042222A168BC94540	16	10	2010-11-21	95283	54238.3109038329	t
1447	0101000020E6100000745D5A6A1AEA0E40FC4E5ADD21D14540	93	2	2022-04-05	35315	8819.69951258914	t
1448	0101000020E61000003F42EF72A7050F401D99714DACCE4540	83	9	2017-08-24	75321	95396.3812817378	f
1449	0101000020E610000070BB826E14990F40F124F2C635CA4540	71	10	2025-12-16	94891	57097.4563997877	t
1450	0101000020E61000007BCCFDDE76A90F40AE03377FBFD04540	28	3	2012-08-29	6973	48283.1263232452	f
1451	0101000020E6100000F029750A465C0F409F3ECB56E4C84540	19	5	2011-09-29	53999	94930.6306418688	t
1452	0101000020E6100000395817B408A40E40969BDBF85BCB4540	82	3	2011-08-27	3105	22043.7627382622	f
1453	0101000020E61000004610BE35DF7C0E40FE1E35EFF0D14540	15	5	2011-06-25	97104	21326.5218005666	t
1454	0101000020E6100000CCA3C012F5960E40EA8DAAA72FD34540	72	1	2017-10-14	35366	8462.90740606275	t
1455	0101000020E6100000554F4249475A0F408BE0B77940CC4540	31	7	2020-02-18	23614	5034.19161242191	f
1456	0101000020E61000005A6CA4A7F1630E408214E7D17DD04540	71	10	2023-03-12	61848	41197.1513313031	f
1457	0101000020E61000004BE26802F8DF0E40B9D2E29833CE4540	4	7	2016-09-18	27641	56475.9933574666	t
1458	0101000020E610000069E9158C68840E4063D6C6ABFCD34540	54	1	2020-10-23	3894	38806.9774681903	f
1459	0101000020E61000000F8C030DE8880E409855841532D04540	78	8	2025-04-05	43505	83281.5628906824	t
1460	0101000020E610000018808494B2D30E40F250F2A6C9CC4540	58	6	2012-11-30	46734	35777.0429690652	f
1461	0101000020E6100000CFBEB95582BE0E40900B999CE2C74540	50	7	2014-08-14	13422	42808.3395440989	t
1462	0101000020E61000009C55699547AC0F402796BA0552D44540	31	1	2014-07-09	12291	37903.0780273764	f
1463	0101000020E6100000BFC74FE02B6E0E409C0E52E21AC84540	77	4	2016-08-02	19603	48537.456015881	f
1464	0101000020E6100000508DF9C49D110F40FACE688408D24540	9	3	2023-05-07	51055	38539.4013567616	t
1465	0101000020E610000057A6E4E1658F0E400C06FE1987D14540	34	4	2014-03-17	88711	28306.4114175448	t
1466	0101000020E6100000D3E2F204A3AD0F40F0F1353FC4C74540	99	2	2023-07-17	53462	56018.1264413832	t
1467	0101000020E610000025370723E16A0F4030E04A8568C94540	9	2	2019-06-18	56912	55106.1366372394	t
1468	0101000020E6100000EBADF37B89000F40BE7D14EFA2D34540	61	10	2014-08-12	40970	69998.2078729718	f
1469	0101000020E6100000F17758F478A00E40F0D41921A6CF4540	50	6	2013-03-22	14171	72628.6318498034	f
1470	0101000020E6100000B0810AF82D4F0F40CE816406F2C84540	64	7	2012-05-02	95527	53608.9022654417	f
1471	0101000020E6100000AB7DBFC71BA90F40B5CF5ED36BCB4540	85	3	2016-09-19	68076	41076.557062629	t
1472	0101000020E61000006B31BE96013E0F40A009E2DCE8C94540	14	7	2019-12-06	25091	96665.6324961901	t
1473	0101000020E6100000026C325214C70E407146A93B83CF4540	47	9	2012-05-16	98138	44229.5828059935	t
1474	0101000020E6100000190264465E800F40A21BA68AB6CB4540	78	5	2012-07-09	7534	25206.0686273488	f
1475	0101000020E6100000FD4CF05712110F40940FB68892CA4540	86	4	2024-02-28	42444	27495.2139060071	f
1476	0101000020E6100000C1162044B5120F40219F813AC8CE4540	16	7	2013-12-29	81374	83848.3982786531	t
1477	0101000020E610000074D78B0BB26F0E407434E48EFEC94540	2	9	2020-10-04	56429	17789.1540677262	t
1478	0101000020E61000001992F4DDB76F0E40910182E006CF4540	84	3	2022-07-10	17718	94091.4923250008	f
1479	0101000020E61000006A8226F8489E0E402B43BF3396D44540	88	9	2020-09-16	1683	38680.7116302791	t
1480	0101000020E6100000ACA0208826E60E4032D9C9182CD04540	65	3	2023-04-16	46693	29422.0325002757	f
1481	0101000020E61000002607E00CC6870F40E368649DB0C84540	9	3	2024-03-25	83106	71076.4238558856	f
1482	0101000020E6100000D45A27F9F2DC0E40D2B7A794E8CE4540	50	4	2016-05-21	57808	47055.7739757812	t
1483	0101000020E61000004F1E1E0D80120F406C9CCF603CD24540	47	4	2022-07-21	21594	77864.6507662477	t
1484	0101000020E6100000BB872CD4E1760F40872F7DD0FEC74540	75	1	2022-06-08	8773	30200.3702130477	f
1485	0101000020E6100000E70F3FDE69740F40E09EA64813C94540	62	2	2018-10-04	39762	50231.3091330638	t
1486	0101000020E6100000FC9C08E916E30E409A439754B6C74540	9	6	2016-09-28	99351	34347.3182720301	t
1487	0101000020E61000004F6C262D44D10E40A6E459A59DC94540	44	4	2019-03-27	13844	50907.5012600269	f
1488	0101000020E61000000FDE3D8587AF0E40D7FE4CA465D24540	28	9	2011-03-05	62175	85781.0140958838	t
1489	0101000020E61000003B2283E227820F404AB3B5DB61D24540	17	9	2024-01-08	39268	39619.9081100504	f
1490	0101000020E61000005696874E62660F400C6361D78DD24540	92	5	2015-10-04	72236	88241.3625682884	f
1491	0101000020E6100000DF4D4AC96CC30E4041C4E5CA85CE4540	18	8	2015-01-31	87162	22550.3151555636	f
1492	0101000020E6100000EBEFF7B999190F406A8FDEF2B0D24540	44	9	2010-10-28	23559	64435.1110124106	f
1493	0101000020E610000007527A2A4DD00E40D808FB3CFCCA4540	21	10	2017-05-28	44351	49478.6110823637	f
1494	0101000020E61000008235849BDD980F40BC693DAE53CF4540	27	7	2021-04-15	37996	82096.5660460871	t
1495	0101000020E6100000362E00FAB57C0E407BFBB2DAB5D34540	77	7	2025-12-04	5965	67821.026883681	t
1496	0101000020E61000006ED52AFB1C760E407655303F13C84540	36	2	2014-05-13	10625	98885.9777219177	f
1497	0101000020E610000099FC10E9DE800E400766AC5F0AD34540	96	9	2015-07-26	58685	26685.8784624528	t
1498	0101000020E610000003FBF65EA3590F40D8F58AA9E7CE4540	14	5	2013-06-11	66988	19803.9350276366	t
1499	0101000020E61000007E1DD564B2280F408D42936F30D44540	81	9	2025-02-26	927	75923.3492839989	t
1500	0101000020E6100000158802BC81430F40809341E64AC84540	16	10	2012-06-19	8597	4368.74410001866	t
1501	0101000020E61000002A16CFEDECD80E40AC3BACF24BD34540	29	9	2025-06-30	63646	36222.8228546048	t
1502	0101000020E6100000CA86B5867A960F4076BEF61668C84540	11	5	2019-04-26	8598	71050.4758870448	f
1503	0101000020E610000031AD105A4A760F4042FA7214A5CC4540	88	7	2014-10-26	83161	91372.2903021767	t
1504	0101000020E610000026451B3AEF7F0F405F029BCB12CC4540	39	7	2022-07-24	41619	99518.9227148939	f
1505	0101000020E610000096F74390587E0F4062D7831252D24540	82	9	2016-12-21	56084	37832.7471455242	f
1506	0101000020E61000006744857BF8120F40A38026FF5DCD4540	91	9	2025-01-15	84101	55782.2033979357	t
1507	0101000020E6100000093559CFCCD30E40463BF9C163D34540	19	7	2019-05-18	53626	96175.5697589259	t
1508	0101000020E6100000C5B9A761C4040F409D46A5F88FC94540	81	5	2025-07-01	14781	2288.21264025898	t
1509	0101000020E6100000A8C3655CB6830E406A48FA506BD34540	91	7	2022-08-22	75012	31018.6843212266	t
1510	0101000020E61000001FA8C40D91850E40B6122C0727D14540	4	8	2014-04-05	24311	41396.2045670176	f
1511	0101000020E6100000627E83B83D6E0E403E88B88BDACE4540	73	9	2023-09-21	77885	84406.2111856992	f
1512	0101000020E6100000A8A5F88DD3A30E4075A2EAF3F5CC4540	41	1	2025-07-19	84573	12340.2717178934	t
1513	0101000020E610000094C4E0B4B2AA0F40A6683C2195D44540	69	1	2021-09-11	23372	54379.9995206052	t
1514	0101000020E610000049FA9B7211660E407182748E7ECE4540	21	7	2025-10-07	21908	4428.62711231307	f
1515	0101000020E61000007DA56B4932B10F406660A2A26CCF4540	13	8	2020-06-13	26744	42658.6922962588	f
1516	0101000020E6100000C2290BB533B10F40B013D6EA35D14540	26	4	2024-05-09	13039	61738.3408014913	f
1517	0101000020E6100000E6C49440CB7B0F40E55AAD8BC3C74540	5	2	2025-03-07	23329	21905.2044165369	f
1518	0101000020E61000002D614588A7F90E40147B5342A6D14540	85	6	2023-11-12	21387	56149.5815863207	t
1519	0101000020E610000004525B8540910F40FE66FFC6C5C74540	46	9	2012-07-14	56072	30974.9560821658	t
1520	0101000020E6100000FBEE0A2B83A20E40EAF47D8D56CC4540	58	9	2018-02-28	24953	84878.2801631455	f
1521	0101000020E61000009A1433EB0B260F401CD366AA3ECD4540	48	3	2016-09-27	41334	1591.6840714761	t
1522	0101000020E6100000A7611C5ED09E0F4002BCE692C3D24540	57	4	2013-10-08	80138	7771.37200827429	t
1523	0101000020E610000010E9EF280B5C0F4093C671B862D04540	76	5	2023-04-27	56273	31769.8731983086	f
1524	0101000020E610000092B35D24E7490F4049D9F3026DD34540	77	8	2016-10-02	5121	77304.9853107386	t
1525	0101000020E610000079A1FC234E9B0E40701B17A1C2D04540	14	1	2010-12-19	984	24033.552093171	t
1526	0101000020E6100000628A8386AF4E0F403ED9559D21CA4540	27	5	2017-11-22	38391	32650.9282220646	t
1527	0101000020E610000056D994F5663B0F409EA3E78247CF4540	71	9	2017-12-18	89423	22947.755708534	t
1528	0101000020E61000003E7452ADF6910F405A85F2509ED04540	25	5	2023-10-18	48768	49787.6417498861	t
1529	0101000020E61000007F1D69139F640E4088EF9467D0D24540	5	2	2016-03-02	79635	87989.5635363024	f
1530	0101000020E6100000D358C58FCA510F402E313E8E77C84540	100	7	2022-12-31	39861	22330.374006998	f
1531	0101000020E6100000AEA7C6F067DD0E40F4DA39828CD44540	89	4	2023-03-14	55706	45804.8024109298	f
1532	0101000020E6100000011BBA02698C0F40CA3C942F1ACA4540	85	4	2014-01-29	93120	90677.1747846389	t
1533	0101000020E6100000D5D9EF83B00B0F408BEA68E3D4D14540	90	8	2013-06-02	53887	57992.3770570297	t
1534	0101000020E6100000597B8D7430020F401B134E0737CF4540	38	4	2019-05-02	26586	86944.1465987658	t
1535	0101000020E6100000C955769B2D970F40BC9F898639D14540	79	5	2025-12-01	27340	90569.4606674435	f
1536	0101000020E610000076CECD2A205F0F40758A0E3BE6D14540	44	9	2014-03-25	78667	33329.5480860191	t
1537	0101000020E61000004B7C9E6395760F40CBBD01F3E4CF4540	73	5	2012-10-10	76459	79899.4417989166	t
1538	0101000020E6100000A9CB20D547850F4012F2D120A3C94540	83	6	2013-03-18	36389	89013.598337706	t
1539	0101000020E6100000FBB3DB8A11520F40DAB39202C9CA4540	15	1	2023-11-29	89348	90417.6801272624	t
1540	0101000020E61000007CBC4C5F19CA0E401F0156E527CB4540	19	9	2025-05-05	84969	93547.6314571581	t
1541	0101000020E6100000993E392FDEA90E40616349E28AD44540	76	8	2020-01-23	49078	48483.7911599938	t
1542	0101000020E6100000CEB919B1D1E60E40DA3C7F7482C84540	86	8	2010-07-20	14903	53177.4688102346	f
1543	0101000020E61000002FD38C211F6A0F4004B448C681CB4540	26	5	2017-12-04	72280	76967.3397364876	t
1544	0101000020E610000096537BD0074C0F402B49C03A59CB4540	90	4	2011-01-20	45703	80727.1269043962	t
1545	0101000020E6100000066B52402D6C0F4074D309658ED14540	35	9	2017-04-26	1537	8611.16963691051	f
1546	0101000020E6100000796A564E77640E40290D876F72C84540	51	6	2022-02-25	43179	54603.2510060283	t
1547	0101000020E6100000B5EAECBE126D0F40C83A9FE910C84540	70	4	2015-05-01	40924	40196.6669403209	t
1548	0101000020E6100000A0A9CDB7F88E0F40F4B0ABF37AD04540	43	10	2021-07-13	96391	17478.3695757014	t
1549	0101000020E6100000295F2013D2900F40C6297C7F35D14540	19	4	2013-09-09	97545	92751.3330675367	f
1550	0101000020E61000006B22A6A3C3780F40E75D95BCDED44540	88	8	2015-05-01	56842	39806.9321458062	f
1551	0101000020E61000005716F8AA9B740F40CB88490C72CC4540	49	5	2013-09-14	55401	94613.5987397613	t
1552	0101000020E6100000E0C1C8CCAD780F402543657B39D44540	7	6	2013-01-15	95735	59663.9971309905	t
1553	0101000020E610000087FF510E16520F40081FC6F2CEC94540	58	10	2024-11-20	41205	68868.6190393494	f
1554	0101000020E6100000C33D895983B10F40936AA9192AD34540	2	4	2011-09-16	32775	80923.2033541633	f
1555	0101000020E61000002B0243BC3E590F40005811E156CB4540	26	6	2010-07-15	66778	83996.3047599352	f
1556	0101000020E6100000073DE118D7320F40FEB05895DDCC4540	88	8	2024-06-29	82746	21386.2339252563	f
1557	0101000020E6100000766799740DA20F409BC9E41992C84540	11	10	2021-11-23	4761	42354.7149413527	f
1558	0101000020E6100000E00DEDBC42920F409611656909D34540	88	4	2018-01-30	1370	1304.6941436917	t
1559	0101000020E61000002D953B1C2E060F401A930BD523CF4540	6	2	2020-06-02	86213	63496.5566326859	t
1560	0101000020E6100000021110EFE20F0F404FB7D962EED44540	33	9	2010-03-12	63330	15295.5467478854	f
1561	0101000020E610000055896C6FEEC20E403F7268B9F0D14540	44	9	2025-05-29	29171	1042.24054848931	t
1562	0101000020E61000005F88852C79760F40589A045FF2C94540	93	2	2013-08-03	94833	58596.4169939134	t
1563	0101000020E61000007498A22AA28F0E4089E65B7320C94540	45	8	2014-11-19	80281	41387.0888226964	t
1564	0101000020E610000096E5DCDAD2560F40EE1910A7E9CB4540	2	9	2015-06-03	40154	41915.021602506	t
1565	0101000020E6100000FAAD299C13F60E408F6AD4C1EBCC4540	88	5	2015-01-31	82568	89477.2505427036	f
1566	0101000020E6100000B73C6EC046B80E40BC5B275FE0D14540	31	3	2015-05-14	40488	25968.1917141649	t
1567	0101000020E610000068E09687065B0F40B7EFC7E217D14540	100	9	2018-10-31	59687	86310.9395581358	f
1568	0101000020E61000007BC470861AB60E40299C99546CCF4540	50	10	2017-03-17	73702	59229.1860479237	f
1569	0101000020E61000004B146F8940C20E40ED03F5F9A1D04540	27	8	2010-08-18	13838	59383.5420981723	t
1570	0101000020E6100000166850F6646D0E40D94B21A3FAD24540	35	4	2019-07-12	55918	51119.7165745371	f
1571	0101000020E6100000E0BBC3B92FF20E40B955887B7CCE4540	37	3	2019-12-20	54866	53004.6596837331	t
1572	0101000020E610000073B7397C28160F4095F3E8C095CD4540	57	1	2024-12-03	75863	69390.2709542147	f
1573	0101000020E6100000DBFD8751D7AD0E404E5C31AD48D04540	80	2	2024-09-02	7468	51384.3652465843	t
1574	0101000020E6100000643F192F3C0E0F4084FFE1B5C7C74540	89	2	2012-12-29	74833	13499.2365917246	t
1575	0101000020E610000088D0824340610F40092BB04B4DCF4540	16	2	2022-10-03	43782	95682.2263633222	t
1576	0101000020E6100000380C5EC50F620E40CF00C0CCEDCA4540	51	4	2012-12-16	93170	85319.6837945448	t
1577	0101000020E6100000EB915192154F0F4073A5D82747D44540	42	9	2013-12-20	56895	16223.3326931695	f
1578	0101000020E61000006A4BF48CCEC50E40E759010306D34540	17	6	2021-08-30	67485	66229.5499392301	f
1579	0101000020E61000001651753061460F40F31BE51BF9D04540	28	7	2014-04-04	88072	26657.7224345887	f
1580	0101000020E6100000019F3292ADC20E40593EDE450ACC4540	24	9	2022-04-07	26735	81963.0527011561	t
1581	0101000020E6100000B420B4C869F80E40CADED22E78D04540	20	2	2025-10-13	26991	22665.5406997044	t
1582	0101000020E6100000F227BDB4A9F30E408BC3F51B75D04540	4	5	2021-07-22	96758	71642.928698752	t
1583	0101000020E61000009F192A2F17230F40DF76F2BA97CA4540	38	2	2013-03-20	58514	71303.915872979	f
1584	0101000020E6100000ED78F0B52DE60E40031A3DD533D54540	74	10	2011-12-12	99686	99263.2501587259	t
1585	0101000020E61000005BBE2376E6530F404203C4804AC84540	26	4	2019-04-06	9181	1986.53745790058	f
1586	0101000020E610000032A00FF8DD990F40196917716EC84540	65	8	2019-05-11	36676	56443.9014068251	t
1587	0101000020E6100000283782E0AD9A0E40302BEAE733D54540	20	10	2020-01-07	9601	88642.255868476	f
1588	0101000020E6100000C6A1E18CBF230F4072E6FC29ACCE4540	91	7	2024-04-24	7680	28198.9670143731	t
1589	0101000020E6100000811FA324020D0F4031D71F4013CE4540	12	8	2024-08-24	26625	45465.415185714	t
1590	0101000020E6100000FB86B71E733E0F40FA72138143CD4540	71	6	2014-02-21	45468	39594.4709243299	t
1591	0101000020E610000099882B400DB00F407E51129214D24540	89	1	2023-07-10	80387	29754.8567481302	t
1592	0101000020E61000003181B1B4ABCF0E409A5ACBD73BC84540	91	10	2023-06-07	33475	47209.2147090806	t
1593	0101000020E6100000B3CF10E4496A0E4099ADDF76D1CE4540	89	8	2024-03-26	84135	40055.0592971744	t
1594	0101000020E6100000ED2ECD19D29A0F40FC7BF5EA63D04540	99	6	2013-08-30	73266	8360.55374059599	t
1595	0101000020E61000001A3E2E36E4E20E404BDA023F2FCB4540	94	7	2019-07-15	21610	66612.7447637186	t
1596	0101000020E6100000658C2875C67C0F409A161A45ADD04540	61	9	2014-04-01	70661	94462.262585376	t
1597	0101000020E6100000AEEE229FC98D0F40BA291A6B48D24540	72	1	2022-05-08	25181	82167.5028646652	f
1598	0101000020E61000001771B6B56AF90E40D995EB3BE6D04540	42	1	2011-03-01	11221	3505.73938347032	t
1599	0101000020E61000008257B63761C20E400F105E7220D24540	27	7	2011-12-15	39932	84582.6695361081	f
1600	0101000020E610000018180C430DFB0E40ABEA9C4F04CF4540	86	6	2023-03-16	33365	11794.7948306628	t
1601	0101000020E6100000C34191028A760F406988B83282C84540	12	3	2013-06-01	91490	2220.34062651222	t
1602	0101000020E6100000C756310E76140F40C70AB9ED85D04540	98	9	2018-06-25	37786	60433.9714135973	t
1603	0101000020E6100000A428078E460C0F4062869B764ECE4540	28	5	2020-07-25	1960	44350.3229508944	t
1604	0101000020E61000009D11F3FC73A30F40ECF78D5DACCA4540	43	1	2014-02-23	39051	95473.7659920474	t
1605	0101000020E61000003773A7F7A6A70E40D8653F982FCF4540	95	2	2024-03-21	78686	72282.9114789839	t
1606	0101000020E6100000E7E2C30E2E6A0F40A667B8D79BC74540	47	9	2021-05-07	73980	93210.4004406754	t
1607	0101000020E6100000BC20A0954E820F40B29CBE814BD34540	26	4	2015-02-25	6207	57562.7456266158	t
1608	0101000020E6100000C8784C4CC19B0F409C3CCB2AF3CF4540	20	3	2024-09-25	58329	75899.8976746654	f
1609	0101000020E6100000627CEACB4B3F0F406B53A149FECF4540	74	6	2022-12-01	84352	37660.1631211946	t
1610	0101000020E610000075EAAAF8BE050F4084569E6396C84540	62	7	2025-05-14	38576	71081.6726837062	t
1611	0101000020E610000041B4AFD2F0380F40FEA782243CD44540	78	5	2025-03-27	26329	83567.1287547845	f
1612	0101000020E610000000AA38B9B7A80E40479BBD24A2CB4540	30	3	2012-04-06	19952	33144.3744137113	f
1613	0101000020E610000095C26A95CDA60F40AABF6388D5CE4540	100	4	2023-11-09	40929	38800.4467057481	f
1614	0101000020E61000003E4D6855100B0F40A763DB32A1CC4540	5	4	2013-11-11	52849	51223.1584236582	f
1615	0101000020E6100000B29614D51DA10E40170B9B7E42D24540	69	8	2013-05-12	55207	91575.6747596637	f
1616	0101000020E61000001CF00F9C51210F40E2C602E37BCC4540	14	6	2013-09-19	66937	7499.72692572356	t
1617	0101000020E610000086576FE31A930F4042405BFB30CD4540	84	7	2021-10-12	41769	94630.3388092458	t
1618	0101000020E610000000DAE393026F0F402D85C6EE11D54540	25	8	2014-10-25	57143	50880.3787634656	t
1619	0101000020E6100000075C415EC01E0F4075F212B817CE4540	86	7	2010-11-17	94133	10330.5266135926	t
1620	0101000020E610000002089CD0FA930F40AAFD7B2F98D24540	34	4	2017-09-25	3246	25294.7629154784	f
1621	0101000020E61000002646AD9E481B0F40EC1623B0D0D34540	89	7	2021-07-10	96795	36977.8974866505	f
1622	0101000020E610000061FAAD2120A50E400A7E3E70E0D14540	47	5	2010-10-12	54300	22978.90006706	f
1623	0101000020E61000006174BBDDAA980E4058C3C40FE2D24540	74	2	2021-10-24	22992	90546.1536814976	f
1624	0101000020E61000008BA60E1387CC0E4030898E1E6CD34540	85	9	2014-11-04	74563	308.326062703568	t
1625	0101000020E6100000CCE5E3AD6CD50E404C22771298D44540	84	6	2011-10-09	19063	48842.6464174329	t
1626	0101000020E610000048BE9FE238720E4031BEB8EFE7D24540	2	6	2021-05-16	82310	92908.2107046426	f
1627	0101000020E6100000853779D646270F4041967DADBAC74540	62	4	2025-01-04	61793	83364.8974140658	t
1628	0101000020E61000009BD02F82A6E20E4031565F341AD04540	14	6	2018-10-13	12210	26862.5835654749	t
1629	0101000020E61000001514D5572F890E40C1D586C77BD24540	5	7	2017-07-29	8230	75609.8246817588	f
1630	0101000020E61000008CBD4803DFC40E4040CAD60DCFCD4540	46	2	2019-03-15	32146	19379.8875448452	t
1631	0101000020E610000037B5035163B60E40256310E3B7D04540	18	9	2014-07-27	86898	79890.0042737975	f
1632	0101000020E6100000822A5F9BEA730E40525B3E305BD24540	85	5	2017-01-27	71030	13561.1526665164	t
1633	0101000020E6100000FDE72C4305930E403CB2AE3729D04540	80	6	2025-01-31	63671	5518.75948632392	f
1634	0101000020E6100000C636D17B7C590F40DB89D1526ED34540	87	5	2016-09-15	12177	61107.4284950102	t
1635	0101000020E6100000C5AFE57FE76E0E402DF366F5DFCA4540	46	3	2016-01-09	71922	21529.9320581605	t
1636	0101000020E6100000C95DFF791B800E4060A618D869CB4540	17	4	2017-08-07	64416	52062.9667035331	f
1637	0101000020E61000002F929A7454830E406B92EBD816CA4540	80	7	2022-11-25	37621	6141.53894955831	t
1638	0101000020E61000003BA8D83750020F407632380054CE4540	61	6	2023-05-10	46220	40619.4576716655	t
1639	0101000020E6100000730D5D1AAC970E408C12BFEE5DD04540	42	9	2020-03-02	85567	23296.8226691929	t
1640	0101000020E6100000F6DE41FB67130F40C4F2CAE3ECCD4540	30	10	2022-01-13	31882	19274.4832155038	t
1641	0101000020E6100000A02997CCAEF10E4069417BF48DCC4540	100	7	2019-08-26	47387	48900.5474656178	t
1642	0101000020E610000014C8FE12C50E0F4076D7DC07CCCA4540	18	1	2017-10-22	40384	60708.3322284779	t
1643	0101000020E6100000AB899FC47F740E40205D5CFFBFCD4540	79	3	2025-08-03	27803	15939.9433852288	t
1644	0101000020E610000041F8FEE2C3DB0E40EB981B643CCA4540	39	1	2015-04-27	25971	60099.4217464259	t
1645	0101000020E6100000599E474196A90E4018DAA8CF86CA4540	47	4	2015-09-20	69480	76455.6739943834	t
1646	0101000020E61000008DBB6EB286BE0E4065E67DDFC7D44540	9	3	2020-09-23	36598	93392.0847308025	f
1647	0101000020E610000029F5B95E772E0F4048F6C8C684CD4540	21	3	2011-05-14	72437	75605.3117566217	t
1648	0101000020E6100000D0C2FCC9ED3F0F40825B892F3DC84540	96	5	2019-03-27	91643	50493.1522553354	f
1649	0101000020E6100000C8341F7303A70E4023EC25714FCC4540	77	5	2020-05-07	81118	3262.82444323123	f
1650	0101000020E6100000559F0903157C0E405C03CD8A39D04540	80	6	2020-04-02	67942	86010.8664755689	t
1651	0101000020E61000005A6F5FA82F1B0F402B4C4F7163D14540	73	2	2025-08-29	91318	79020.0050049696	t
1652	0101000020E6100000EBA521BD11E10E4071CAE6DFAAD14540	46	2	2012-04-20	13650	13076.0110892739	t
1653	0101000020E6100000CC2B84951B820F406BAD5AFB81CE4540	57	3	2021-05-12	80136	9473.46096364083	t
1654	0101000020E61000005E89C47EFA280F408C1D79DF55D24540	33	1	2014-10-13	60024	44713.1380225264	f
1655	0101000020E6100000EFCBA94D72860F403962C48107CD4540	27	4	2013-03-05	62701	17072.0426804215	t
1656	0101000020E6100000D7F98F0A0E710E405E265C5BDDD44540	100	1	2015-10-22	86837	35360.3415519681	t
1657	0101000020E6100000695F970A46D60E40C1750CF565CF4540	91	6	2020-01-03	58820	4835.98270062435	t
1658	0101000020E6100000E697D26FAC560F4040F5180AE9CA4540	5	2	2011-12-28	84550	13742.3151912077	t
1659	0101000020E6100000592F063D028C0F40E1F8B5BFB5D04540	20	6	2023-10-05	72514	40125.3708656979	t
1660	0101000020E61000006537AAEDB4D30E4013850558B2CA4540	17	7	2016-02-20	73277	78617.8449389953	f
1661	0101000020E6100000C5FA53156B7F0E400E17B93F8BD24540	10	5	2020-05-10	44677	41162.319262592	f
1662	0101000020E61000009F7926BFEC770E406B47DD4F44CF4540	11	2	2010-07-10	27165	45644.0588394959	t
1663	0101000020E610000017E52DC76EF10E40BB67AE62CFCD4540	91	3	2019-09-13	68440	47958.3414129509	t
1664	0101000020E6100000CAE8A4201B2C0F40B82DB783EDCD4540	40	7	2020-02-01	29083	74927.7152091808	t
1665	0101000020E6100000A70094A89F400F40E94D517A3ED14540	19	9	2021-12-07	89093	96989.3901993641	f
1666	0101000020E610000078AB006C212C0F4023D2AEC6A9CC4540	16	4	2017-10-13	14969	66239.0813404521	f
1667	0101000020E61000006DCA0AA323080F40BA0AFF76BBCF4540	10	6	2010-02-05	65370	7293.7672611443	f
1668	0101000020E610000054B2A55CA9800F40B198830170D14540	73	1	2022-03-06	97543	67668.3058920971	f
1669	0101000020E61000007E3CB08247210F40C019C1B5BAD34540	4	2	2017-04-20	53158	79213.5586644476	t
1670	0101000020E6100000B78645BBC1480F402CEFBAF3D7C94540	20	5	2019-08-26	57393	94771.3089618604	t
1671	0101000020E6100000C25C1BEBA8DA0E40BF498BAEFFCE4540	60	3	2019-05-31	9320	88835.4750519309	t
1672	0101000020E6100000B307009F6E7C0E4095DB22D887D34540	76	5	2025-12-19	81955	88514.2725340561	f
1673	0101000020E6100000A2564924264E0F406E67256B66D14540	5	6	2018-04-22	41656	15978.9213471236	f
1674	0101000020E61000001291F102ED790E40AB3502322FCC4540	83	1	2020-05-12	71505	14093.3493833556	f
1675	0101000020E61000004D5C78E499640F40E03CBC17C8CE4540	27	4	2010-09-19	8306	61818.0543299146	t
1676	0101000020E6100000960A92ACE69A0F40970FDDF9E2CF4540	58	8	2024-06-09	32847	53896.0044612641	f
1677	0101000020E61000006D60268CB92A0F40649031D377D14540	97	4	2023-06-01	63822	93814.3413201473	t
1678	0101000020E610000003B84B7FB4100F407C0508A7B0CF4540	5	7	2018-11-24	42163	42799.7847664335	t
1679	0101000020E6100000A9E4F04C9A610E40884B62FFDBC94540	87	7	2015-09-12	61767	91559.435229009	t
1680	0101000020E610000025B86C14C2390F4081B87B520ED14540	29	9	2024-10-15	32800	44630.1082181069	f
1681	0101000020E6100000672A5CFC33750E40DD51F00012CC4540	96	7	2025-07-01	45688	37158.6567487023	f
1682	0101000020E610000075053BE97B7E0F40E44B11B176C94540	81	1	2023-09-28	24239	25890.4885112939	f
1683	0101000020E61000000CA81A0A1EA20E4014B3071016CC4540	79	8	2022-02-04	95539	60321.0559949557	t
1684	0101000020E61000004F4DD40766580F40CF6167EFCCC74540	41	1	2020-12-29	68085	75676.7362989546	t
1685	0101000020E610000096888AFF2BB10E40850A4191A1CB4540	71	7	2017-01-22	41163	39705.9084939406	t
1686	0101000020E61000007327222DE69D0F40E5EBB86FA2D44540	84	7	2019-10-09	86559	50465.2150123801	t
1687	0101000020E6100000D5545F112C530F400B31B2FBD2D44540	43	2	2022-01-20	98925	16631.9896405702	t
1688	0101000020E6100000B66F29A3EA690F401F7C9AB843D44540	54	4	2024-11-05	82563	65084.6482336766	t
1689	0101000020E6100000EE5F483AFE9B0E40D449941E71CB4540	17	10	2010-05-10	32615	19944.4235660595	t
1690	0101000020E6100000F90A11127F810F4067031285CFD44540	10	9	2015-01-15	40191	68170.0445720511	f
1691	0101000020E610000089BE4308E3AA0F40733C3B6932CD4540	65	3	2014-01-18	78659	33689.9457982449	f
1692	0101000020E61000002B8C0EE5537E0F40EEB113B818CA4540	81	5	2015-07-05	89507	71305.8399331161	f
1693	0101000020E610000007FB8FA366DA0E40E70505878FCE4540	18	6	2010-02-25	20350	7485.04827453278	f
1694	0101000020E61000008BF026D007970E40955B49EFD0CF4540	78	5	2011-03-18	86933	22548.3099884669	f
1695	0101000020E610000077B21A8849990E40FED090D487D24540	46	4	2023-08-04	19630	806.59535330172	t
1696	0101000020E6100000843933F595420F4057CB2CBDBBC94540	19	8	2010-02-28	51231	88632.4630189019	t
1697	0101000020E61000008561E5F826760E40ADBD25FF39CD4540	51	8	2013-04-24	76571	71416.6089555676	f
1698	0101000020E6100000D9685069996B0E4048AC106535CC4540	89	5	2017-12-26	58676	14864.7539089241	f
1699	0101000020E6100000CCAA4AEB9F950E406D4D80071DD44540	100	7	2015-08-14	30720	45255.8487002223	t
1700	0101000020E6100000A830A6DA963D0F402238AC0ACFCA4540	75	2	2012-10-24	20151	98958.9730821748	t
1701	0101000020E610000078CC0BF0719F0E40EF5022CC86D24540	55	5	2016-04-09	381	88723.3223413109	f
1702	0101000020E6100000C2E56807BCB60E40DA14FA0A5ACA4540	3	8	2018-12-31	81791	45998.5185259071	t
1703	0101000020E6100000EC6F59EA81B00F4003824BEC3BD04540	96	5	2023-01-05	53786	70321.8168983607	f
1704	0101000020E61000008344876E1D320F40A60073EF56CE4540	69	4	2010-02-21	26061	24104.7629003117	t
1705	0101000020E61000000D1CFBDD5F970F40F045542E1FCF4540	85	10	2016-03-05	6650	24568.4817870915	f
1706	0101000020E610000069E2119F9EBA0E4046B040CD5ACB4540	100	7	2010-07-14	78571	4103.53581112222	t
1707	0101000020E6100000A043383DB4760E405834BC03E6CF4540	12	4	2016-09-26	7292	41275.046056721	t
1708	0101000020E6100000A8B7B3897FA70E40B47D726491CD4540	89	8	2016-02-07	41269	27941.1833358124	f
1709	0101000020E610000063026F17168F0F40FBE4007BF0C84540	32	6	2019-10-16	28256	50505.1188485184	f
1710	0101000020E610000070AC447FC0C20E40133B98C89DCF4540	96	2	2018-01-23	21681	84136.8509798801	t
1711	0101000020E6100000CE3926BB6B730F409E15E17358CD4540	97	7	2010-04-22	87321	10359.0726436533	t
1712	0101000020E61000009312516FDEE10E40BD847BEB83CD4540	25	8	2024-06-16	71130	43736.4327747872	t
1713	0101000020E6100000940D9BC159950F40D645015332CC4540	85	8	2018-06-29	1013	12527.2502953254	t
1714	0101000020E6100000B21A442B42980E409C96C64BA7C94540	66	9	2025-07-27	4072	29164.821458848	f
1715	0101000020E6100000E36D5BE1949E0E40E45CCBAE8DCB4540	39	1	2018-08-25	72531	83805.8787788766	t
1716	0101000020E610000066060B8F9C710F4092011050B5D04540	77	8	2016-11-22	46320	70434.0892005337	t
1717	0101000020E6100000E8B2BF513F860E406B25CADEF2CB4540	36	3	2025-03-14	44758	36494.8787077535	t
1718	0101000020E61000006FBDCED5119E0E402BEC69A6EDD34540	7	5	2025-10-10	29853	57888.1441104146	t
1719	0101000020E61000008128C721B40C0F40B867D5251DD44540	80	1	2022-05-27	11155	41056.0297608558	t
1720	0101000020E61000008D49DBA613230F40ABAB55065CCA4540	92	9	2010-11-28	88897	71357.6509564436	f
1721	0101000020E61000007894AE7C19B10F40B7250693D5D24540	23	1	2013-01-23	90895	21529.2154854409	t
1722	0101000020E610000054521B59B9860F4025FB577641D34540	67	9	2022-02-03	13130	97415.1993643786	t
1723	0101000020E61000007A874D85D7A10E403692A040A1D34540	47	5	2011-02-26	90343	11478.0586084474	f
1724	0101000020E61000005D330F4B940F0F40847998FD7AD24540	53	6	2017-07-21	92936	81111.5390090673	f
1725	0101000020E6100000A4C72FE6FC780F40B2732E0500D24540	38	5	2020-09-14	65130	95400.2165499941	t
1726	0101000020E61000007803917A19FD0E40C540EE89A1D44540	12	1	2020-06-16	38316	57488.0923124154	t
1727	0101000020E6100000AD3C2415C4E80E40CCE313C448CC4540	79	2	2021-02-07	95519	25758.3445147808	t
1728	0101000020E6100000A475D128257E0E4029AD43B7E8C84540	46	6	2014-03-26	6476	93002.9453601803	f
1729	0101000020E6100000AE463257EAA50F40CB793195BBD24540	4	3	2024-10-19	22864	89683.2239719614	f
1730	0101000020E6100000752D15D7E34E0F40617B28BF6FD34540	80	8	2011-08-13	10305	75654.2823297195	t
1731	0101000020E61000009CC4400DA0FF0E40D896CDA2C7CC4540	60	8	2022-10-09	28239	93015.7270478487	t
1732	0101000020E61000003D34DC1857120F40C782A4F2F9CD4540	20	2	2014-07-18	9606	35177.9170204251	f
1733	0101000020E610000029887EF6D9CB0E40BB54C5D1F8CC4540	16	8	2021-12-27	92455	62417.5585683784	t
1734	0101000020E6100000945B264946800F40565A816576CA4540	28	5	2021-05-31	93668	81199.4347916333	f
1735	0101000020E6100000FB23C7D2C2120F4019593E1048CF4540	15	8	2025-10-15	59916	41906.0119715595	t
1736	0101000020E610000088E60DD1E3250F4053C71B7DDBD14540	40	6	2024-10-09	79877	48672.3972967994	f
1737	0101000020E61000004FD36F6596120F4057B325D653CA4540	78	4	2017-11-26	27348	19244.6722211872	f
1738	0101000020E6100000F184CF8D20890E4016CA6F08FCCD4540	94	7	2013-08-28	12932	33614.5984437887	t
1739	0101000020E61000006D2E0F24329E0F4041C059F3DFCE4540	54	1	2025-08-01	36790	98413.4586325623	f
1740	0101000020E6100000214AF41A37EC0E404D7CE0AF90D34540	37	5	2019-08-07	53509	18189.9627021195	t
1741	0101000020E61000000FE26C412C000F40DE6BD4255CCD4540	3	4	2021-09-24	35419	20998.595943951	t
1742	0101000020E6100000B619448E36DC0E4058145972B1D24540	75	5	2011-08-25	38154	27823.9646739453	t
1743	0101000020E610000083AF2D46206B0E407534F15158CC4540	28	8	2023-10-17	10389	24124.3175278631	t
1744	0101000020E610000038431A58C4960E40C23CB4BD60D44540	51	1	2021-10-27	6821	6449.08558707276	t
1745	0101000020E610000093B18E8563850E40AA40FFE8B3D34540	70	8	2024-12-08	45614	23089.956264418	t
1746	0101000020E6100000983A29EC399E0F40F3F308C9D3CD4540	47	4	2018-03-07	56584	7044.57330390749	t
1747	0101000020E610000065A5B36782A70F40BC015659EDC84540	86	9	2011-11-28	8637	21136.8809397533	f
1748	0101000020E6100000E808AAC635060F4011F3E41DF6D34540	64	5	2022-10-20	62941	28312.3603917684	t
1749	0101000020E6100000BEC2A4FA904C0F40B72DBD21B5CC4540	64	4	2020-08-27	31656	83175.2413417833	t
1750	0101000020E610000003E56A1DB17D0E40C34229B2F3CE4540	81	10	2018-03-01	44302	24541.2157860464	f
1751	0101000020E6100000E566D6DFC38B0E40D557E7BAE9CE4540	92	3	2010-09-18	27451	35427.9866337871	t
1752	0101000020E6100000D8559A9D33870F4030A4E78AF2C84540	88	6	2018-09-29	56177	84244.3691466197	t
1753	0101000020E610000069034976F27E0E40EDEBEC28D2CE4540	65	4	2012-01-06	5630	39356.8399165955	t
1754	0101000020E61000007A9EF7F478FD0E407E05F37D86C84540	87	9	2023-12-08	20590	13115.7236841613	t
1755	0101000020E6100000527EE33F7F460F40CDC83DBD06CC4540	13	1	2025-08-20	22240	8015.10843341364	f
1756	0101000020E6100000978ED2AA9E8B0F40108C9CF4AAD34540	34	2	2021-05-15	15542	14215.5953214939	t
1757	0101000020E610000006C78B1F8DDB0E40F908912824C94540	11	6	2023-01-25	39890	2499.00227041198	t
1758	0101000020E6100000B4D6ED84C7070F4040D347E6D3C84540	48	5	2012-07-06	79243	44593.0077809154	t
1759	0101000020E61000005A281856DE1A0F40B05C5DBEEFCF4540	20	8	2016-07-13	42630	55934.8494529831	t
1760	0101000020E61000007C8B2BA67F6E0E4078CCAA8C22CE4540	66	5	2019-01-24	12815	47059.4051848451	t
1761	0101000020E6100000CCE002278AF00E401E5B7B4162D34540	74	10	2024-08-15	97253	23239.7762702669	t
1762	0101000020E6100000CAF798E26E1D0F401879D2C159D44540	100	8	2017-01-26	21686	86333.798176202	t
1763	0101000020E6100000EFA632B177970E40B7A0036363CC4540	72	6	2010-11-11	71040	79343.9056340041	f
1764	0101000020E6100000ABEE5163370C0F401968636E27CC4540	44	2	2018-08-16	91131	85962.5526423128	t
1765	0101000020E6100000F8D8C35766E40E402505838091CB4540	17	4	2025-12-29	54976	85610.2196172202	f
1766	0101000020E61000007A67970EA43E0F403EFF517C9EC94540	6	1	2011-07-23	6289	60698.8857125185	f
1767	0101000020E61000002AF3E3E31A920F40B8E436C0EECD4540	84	4	2021-09-16	36991	55186.6635211933	f
1768	0101000020E61000005FE0BA24D5350F4032E96D1E3DD34540	15	2	2013-09-26	70816	21930.6809434399	f
1769	0101000020E6100000BE624C0C96780E40F08B51F6C2D04540	26	9	2012-01-26	4131	38966.4093952521	f
1770	0101000020E6100000771FAB6015670F403D52756CE9CF4540	39	5	2020-06-30	42037	4771.31894819436	f
1771	0101000020E610000094DDE1FB3F980E4036DEE285BECE4540	42	3	2017-08-03	4342	14099.7230246916	t
1772	0101000020E6100000B8EF6DCC35920F40E57F5102FBC84540	31	4	2020-12-18	35441	63395.2224550291	t
1773	0101000020E6100000768A43BEA4000F407E16645B0ACC4540	4	6	2016-09-09	1696	66203.7719789001	f
1774	0101000020E6100000DE250D2D58FF0E40BE6E09E444D34540	56	3	2014-03-30	57532	33491.0735516771	t
1775	0101000020E6100000D2165F405C1A0F4078B9216883CF4540	74	1	2011-08-31	80780	69639.8340007858	t
1776	0101000020E61000005FCD3CC3608A0E406873A4E64BCC4540	55	10	2021-09-05	78494	21503.4914469815	t
1777	0101000020E6100000E07AB82CBB5B0F409C32562E5CD14540	91	9	2023-12-31	91920	38936.871269612	f
1778	0101000020E6100000A392B5664ABD0E4024F1D64B04CF4540	64	9	2021-12-17	88660	70219.9391052558	f
1779	0101000020E6100000C465B4F186140F40FDD1ACDB50CE4540	75	7	2015-11-04	76212	84546.9935895587	t
1780	0101000020E6100000ABD836CFDDEE0E40196E2F305ACC4540	45	3	2019-11-08	31259	53221.2484665314	t
1781	0101000020E610000019452B57DD5C0F40972A5E2363CF4540	61	4	2022-04-05	49143	78757.9398179284	t
1782	0101000020E61000006F9ECCE8FDCF0E406DFDA9345CD44540	4	1	2023-02-16	21628	74741.6230641086	t
1783	0101000020E6100000637F2F2D49280F406E5B305EAED04540	58	2	2014-06-16	22896	60968.3350939988	t
1784	0101000020E610000093D9E04BA5400F40E8258E9D9CD34540	7	5	2014-05-03	16044	8122.16297575199	t
1785	0101000020E6100000F7ACE7AD91780E40EB5FCD8B9ECB4540	34	1	2022-03-10	5537	27881.6810204748	f
1786	0101000020E61000009A924C03DAE60E406DC2433EC6CE4540	3	3	2025-08-23	58937	88477.8514167617	t
1787	0101000020E6100000BFFB23C960230F406FA2A06760C94540	53	3	2013-08-31	54850	81130.9909409516	t
1788	0101000020E6100000AC7F25E8E2D90E40B403D2AC7ACB4540	69	1	2019-12-04	64385	15170.6659012029	f
1789	0101000020E61000006A5B341C4D260F40A66A900A82CE4540	87	2	2016-05-04	64911	85171.4727231589	t
1790	0101000020E6100000F6C4E5461FD70E40E864AC16AAD04540	80	1	2016-12-25	73512	13276.7149815812	f
1791	0101000020E6100000211477CBEE850F408E0424CC9CCB4540	28	2	2011-11-27	89921	90745.3669504152	t
1792	0101000020E6100000A0F86C1C9D9B0F4052415BD54ACA4540	97	10	2013-02-27	14577	17778.4668107817	f
1793	0101000020E6100000EAA072ADBACF0E4026F738AF46CB4540	71	4	2016-11-20	89003	21782.6171963876	t
1794	0101000020E6100000BCD6D9FDB2AA0E40498B010B33CE4540	57	1	2011-06-15	69251	37696.3746793363	f
1795	0101000020E6100000872021F24CBD0E40FE1077E898C94540	7	8	2020-08-20	45853	19199.6572779339	t
1796	0101000020E6100000C5A67C28BE910E405E69AC7312CD4540	22	8	2020-12-19	93862	59758.8645368019	f
1797	0101000020E6100000739361EDD5D90E403BBB48119EC94540	79	1	2018-09-15	28328	84084.2752679334	t
1798	0101000020E6100000DA48337B62970E405BF1072195CA4540	15	7	2025-01-12	15378	67428.999324402	t
1799	0101000020E6100000E915FA5C77AD0F4060485A30BDD34540	38	3	2021-06-17	93792	85191.4420127102	t
1800	0101000020E61000009E80D62996C20E40503BDE6716CB4540	75	4	2018-12-01	35127	43410.2965462815	t
1801	0101000020E6100000368035032C240F4087873669FCCE4540	30	9	2013-07-13	26364	20856.6593116751	t
1802	0101000020E61000002CC2CA3F68330F40BBB82EB641D14540	46	3	2014-09-29	41244	43462.5515097491	t
1803	0101000020E61000000CAD7B1DCD9B0F404E3650C33DCF4540	89	7	2016-07-06	4794	99785.1959635702	f
1804	0101000020E6100000FBB3EF73A1680F40EABD471343D34540	89	1	2021-03-17	44602	8363.94841681232	t
1805	0101000020E610000079E574A902370F4052469AF8ABCF4540	35	9	2018-10-04	57470	37353.8025789556	t
1806	0101000020E6100000C288632E6DE90E40E5E4E5B32DD34540	47	3	2012-06-22	34637	85879.8144053261	t
1807	0101000020E610000036F1A939AF690E4073B27E82C0D24540	55	8	2021-08-30	47635	68481.2326694287	f
1808	0101000020E6100000B7D8E67FF7B90E40470DB297ADCD4540	66	4	2017-01-07	70462	65619.0854290469	t
1809	0101000020E610000009B14F9576620F406647D702E0C94540	38	1	2013-06-04	10936	27555.2503053238	t
1810	0101000020E6100000D87175A27F610F40DB418AC63AD24540	24	1	2021-08-20	88108	37609.4542461493	f
1811	0101000020E61000001E79F47901890F4012D78CD341CC4540	64	6	2018-04-24	20217	91074.3050238753	t
1812	0101000020E6100000BEE89A372F930F40DD52C23A2FD14540	45	9	2015-05-18	83283	3934.25574235291	f
1813	0101000020E6100000A6B9F36CADAB0F4063EC5D95CBC94540	93	9	2024-04-17	5792	23799.5715793608	f
1814	0101000020E610000045BB1162987F0F408786F664BAD34540	88	1	2015-05-24	68575	26820.5080057648	f
1815	0101000020E61000004206049270910F408DB53E7452CB4540	84	5	2021-03-28	43134	80950.8113226891	f
1816	0101000020E6100000538B5AF570A80F400BA9F08565D34540	72	9	2013-02-03	31531	55626.1289743373	f
1817	0101000020E6100000408B20406EAC0F40C52D24AE7FD04540	30	2	2020-03-23	88653	47572.3237421897	t
1818	0101000020E6100000E3A793E66F5D0F40392FA292C6D14540	30	7	2020-08-08	79328	34481.5187779874	t
1819	0101000020E610000053F17A89725D0F40A288ECE7E0D34540	77	2	2017-05-25	4020	7733.50568225599	f
1820	0101000020E61000007E4E36FC50A40E4066D582B579C84540	75	5	2010-10-23	11352	11687.6329751159	t
1821	0101000020E6100000DEE17A7006B70E40DDC69EF5BBC94540	92	2	2023-04-08	87925	70611.8060295225	f
1822	0101000020E61000001C17DEDC686D0E40ABC4C1B19CD14540	90	1	2023-11-09	33878	49762.6166979583	f
1823	0101000020E6100000FD9CC8DA673C0F40466BE81F09D24540	84	9	2024-08-04	40154	43020.160696934	t
1824	0101000020E6100000B08BCF4FD17B0F40FC4C3FD0F2D14540	52	9	2017-04-05	80327	70527.1266976305	f
1825	0101000020E61000001C8FAB0B31A60F40DE7AA35DECCA4540	37	7	2010-10-12	40863	7400.35382270909	t
1826	0101000020E61000002DE6827124010F40C60E065F26D54540	56	6	2015-08-28	91368	45025.0287328203	t
1827	0101000020E6100000536AA77140070F406633D1E626C84540	89	9	2012-04-10	13198	98516.6535790696	t
1828	0101000020E61000009FB0EAC32A1F0F4054FE9C42A1D24540	80	2	2012-11-06	37799	42846.8954397225	t
1829	0101000020E6100000231A1109C4A30E4065F448E495D24540	27	6	2016-07-14	22027	73650.7560992733	t
1830	0101000020E61000001396A9BCE5BF0E40273D66D3FAC84540	16	7	2019-06-05	20003	36697.4720260115	t
1831	0101000020E61000008966019AFFBD0E406492426AC2CF4540	18	5	2015-09-15	70123	58078.4379532103	t
1832	0101000020E6100000E8DC3A548D2A0F40AED9D7049FCF4540	93	1	2025-10-05	29390	65024.4836689801	t
1833	0101000020E6100000E18336469D6A0F40744EFC9962CD4540	100	7	2011-06-19	81875	14845.5435768522	f
1834	0101000020E610000021B5CD8EBFF70E40B3F2B09B9FD34540	6	3	2015-10-15	15416	24395.6246741545	t
1835	0101000020E61000006FBEF9320D550F4011C0FF0D11D34540	83	6	2025-11-03	10164	6938.00103044113	t
1836	0101000020E61000002E4E78D9B4B70E406650F2D7B6CB4540	11	1	2016-09-05	80655	22158.7391162067	t
1837	0101000020E6100000114908819AA60E409F6993C991CD4540	18	10	2011-03-07	4643	4255.32726222864	f
1838	0101000020E6100000EF3790CA16320F409E47BEC901D34540	97	10	2016-04-12	44854	96390.9935654572	t
1839	0101000020E61000009745DCF54D640F406CA0205595CA4540	24	5	2016-06-14	6746	80120.674106223	f
1840	0101000020E6100000C6548CA134740E409D8882C364D44540	74	5	2016-08-06	87167	78016.142150474	f
1841	0101000020E6100000A081F742B0D80E40CD15FAF13CCA4540	3	6	2015-07-27	96841	45703.9857388761	t
1842	0101000020E6100000C3F8E8E08F110F40D02AAEA4A9D34540	46	1	2010-08-14	88012	47098.3228720921	f
1843	0101000020E6100000773345DCF0C70E40FB4BE473E3CB4540	32	10	2013-09-02	77989	27690.2675635169	t
1844	0101000020E61000003EA22EAAAC6D0E40B273C8DE6ECA4540	10	10	2018-05-15	2622	45269.9129186306	t
1845	0101000020E6100000133378F64CE50E40795ED748DDD44540	58	9	2020-03-08	61347	8587.0892756593	t
1846	0101000020E6100000BF76B885D1A80E4098759203E1C94540	61	5	2015-09-08	87363	99451.1841103654	f
1847	0101000020E6100000EF5FFC557E930E40BDC0B23B8BCE4540	90	5	2021-09-14	46619	58197.8150733212	t
1848	0101000020E61000002836C5286AB20E40E849F2448CCE4540	75	2	2021-12-30	68794	84823.3369479461	t
1849	0101000020E61000003A694B48266F0F40F93C789764CF4540	37	6	2011-07-31	80066	16597.3502809121	f
1850	0101000020E610000093E256499A6D0F40D4AAA137ECCE4540	35	7	2013-08-13	22767	40740.5309032043	t
1851	0101000020E6100000CF8C3CD53B8C0F401B9FCE5EFBCE4540	75	2	2013-08-29	46922	24854.1929831008	t
1852	0101000020E61000009C4EEDB0513D0F40BFC113B6DBC84540	47	7	2010-06-03	47995	11234.5855625298	t
1853	0101000020E6100000D42245E94DC90E40D5EA7BFDDAC74540	18	7	2012-06-03	93809	48998.2925396772	t
1854	0101000020E61000007EA106D2B29B0F4051954A159DC74540	87	8	2011-01-30	34341	60940.6077219316	t
1855	0101000020E61000003CBE39E54F8F0E4044E7AD3EE3CA4540	46	10	2018-06-04	47125	18750.6941220289	f
1856	0101000020E6100000EEAE68AA683E0F40D7613E3ED2CB4540	72	3	2022-03-01	37655	66286.8006394785	t
1857	0101000020E6100000CEE38B8C163F0F40A230C2522AC94540	82	3	2011-07-24	61403	64353.1571506101	f
1858	0101000020E610000005CAB31E26410F4073C7A208B7D14540	63	8	2025-04-04	70670	27711.2880681161	t
1859	0101000020E6100000C6B8750EF03D0F4000110E8A19CE4540	23	4	2023-10-22	66104	60350.197546264	t
1860	0101000020E61000003F2947A10D640E40F515E4C534CF4540	9	9	2013-08-20	91972	85592.3615574224	t
1861	0101000020E6100000BE3FDB6D006F0F4047FB3BF91CD04540	39	6	2023-03-26	44765	87935.6292238328	t
1862	0101000020E6100000084260261AE60E40747913E181CF4540	54	2	2020-04-24	97471	99870.1239578856	t
1863	0101000020E610000017E690B1FC810F401CF41D5A3BC84540	27	7	2010-11-26	97805	67605.8167039879	f
1864	0101000020E61000004B46467137F90E4084C09CDB98CF4540	61	8	2020-02-01	18578	59048.4912180377	t
1865	0101000020E61000006A9AD3E93BD90E40571BA4B4A3D24540	33	8	2024-03-09	24324	79372.5286123296	t
1866	0101000020E61000003FA69236650D0F409CC534C226C84540	83	5	2015-01-28	4791	21.2451959624937	f
1867	0101000020E610000077A7D32E084B0F400653CD049CCF4540	84	3	2017-01-01	81925	33506.7891720092	f
1868	0101000020E6100000A67246A37C790E402D216DCD46D24540	39	9	2012-04-28	34266	81566.9004617762	f
1869	0101000020E6100000606151E275990E402E750BB248CA4540	49	4	2019-05-08	9429	26129.1245888345	t
1870	0101000020E610000039721F2D4FEA0E40C0F2C80931CA4540	15	7	2019-11-05	76025	32509.7721064381	t
1871	0101000020E610000034FEDD92EBA80F409AC55080E6CB4540	4	6	2021-01-06	18075	34927.1158251321	f
1872	0101000020E61000002C845820ED9C0E4057317836EBD04540	45	3	2020-10-22	76457	14591.4649520801	t
1873	0101000020E6100000B556FC5668540F4034D495060BD54540	44	2	2012-12-26	45623	57744.9634171262	t
1874	0101000020E6100000667A5625C9FE0E405B0B2AC69DD14540	36	10	2023-05-19	20844	30242.4989356455	t
1875	0101000020E61000005AB7F544B6F30E402C5169DBA5CA4540	1	5	2013-08-27	90848	78295.0244265416	f
1876	0101000020E6100000A67542E8022F0F40812224C682D34540	55	5	2014-05-29	31521	38767.0427767831	t
1877	0101000020E61000001ED86B5C745B0F409F38F67C3BD44540	73	3	2022-03-19	83174	6503.28726113998	f
1878	0101000020E61000005035906CF40F0F4023116B4E6ECC4540	28	10	2021-09-18	99821	38458.5021593595	f
1879	0101000020E610000057D6F18CD67E0E40E8E4AF5A0ED04540	58	10	2012-01-30	90214	86759.0087716331	f
1880	0101000020E6100000FC671E2FB98E0F409F58CB9A2DCE4540	11	10	2019-09-15	69749	15655.2568804049	t
1881	0101000020E6100000BB05CC80F1700F40013AB783CDD04540	53	3	2016-11-20	15998	76968.5047464642	f
1882	0101000020E610000009B5FEFD4EFA0E40E80704CFECC74540	93	8	2018-03-30	97698	95491.6767781478	f
1883	0101000020E610000074DFD608CBAE0E40F5F698A67ACD4540	41	8	2017-08-01	22673	97960.6553359436	t
1884	0101000020E61000001E1740F397A70E404CA9A639A5C94540	99	4	2024-03-30	30085	83625.2038947934	f
1885	0101000020E610000056E60442DC810E40DE2FA6C4B7CE4540	56	2	2024-05-21	69014	82798.2825102195	t
1886	0101000020E610000045AFF327EC640F407993568B34CD4540	33	8	2012-05-24	47166	43661.1217055186	f
1887	0101000020E610000087AEAAAC61B70E407F4CDE93F6CB4540	25	2	2013-10-01	50874	184.665683414709	t
1888	0101000020E6100000054D6AB03E0C0F403B25736E4BD34540	2	9	2019-06-11	15757	36038.1847250357	t
1889	0101000020E6100000755C94E867360F40ED72472403CD4540	82	2	2022-07-03	81541	50140.2047356672	t
1890	0101000020E6100000F4C96B9276840F40067BA124FAD34540	68	3	2014-02-19	96692	36875.4112961464	t
1891	0101000020E61000005F17AD69B2DC0E40732B965C20CD4540	68	6	2010-02-03	52046	96582.3542292317	t
1892	0101000020E6100000EA2FD46FDFBA0E4067A85E29C9CA4540	95	1	2011-07-16	38699	38098.8322434606	f
1893	0101000020E61000002E7F2A320AD90E40C80B8095FCCA4540	97	4	2021-10-01	79267	11631.3842292337	t
1894	0101000020E6100000D86679BAED620E40D954DD635FCE4540	83	3	2024-04-23	64348	45024.185826857	t
1895	0101000020E610000023A8EC06C5300F40FCB9BD05ACD04540	86	2	2023-07-06	40518	40156.2964150755	t
1896	0101000020E61000005D27BEA5F6880E40C7D828CA3EC94540	19	6	2016-12-15	31409	28366.1220394583	t
1897	0101000020E6100000231CD315A43D0F405002A9658DCB4540	33	5	2018-01-23	72295	99582.7799261477	t
1898	0101000020E610000077170AFBE3E30E40DE6EA8554AC84540	63	1	2021-04-16	27845	88775.6755626706	f
1899	0101000020E61000006C88025E1EAC0E40AD6922E063D44540	9	3	2023-08-15	43755	42719.8784790336	f
1900	0101000020E61000003E1D287B51300F40D5DCEB3300D04540	39	8	2012-11-14	65298	33711.150874264	t
1901	0101000020E610000019D0A6408BA60E403BA733DC69D04540	65	2	2013-06-23	60642	25899.5725378206	t
1902	0101000020E61000009199F3D57D340F401DD7339A3ECC4540	8	10	2024-07-28	21384	80565.6969724491	t
1903	0101000020E6100000A2FBA302172A0F40F3A5E63B10CD4540	6	5	2019-01-15	16558	59400.8882583145	t
1904	0101000020E6100000E5BA080AAE9C0F4034246F1555D34540	55	1	2013-12-22	5561	49993.3034495913	t
1905	0101000020E6100000658C5290E12F0F40AF5245F835C94540	46	2	2024-05-06	2600	51822.5886423795	t
1906	0101000020E6100000EEF715FD83E50E408D847EFAA5D14540	84	7	2014-09-28	25668	21581.2704040778	f
1907	0101000020E61000006F6C8ACE2E6F0F403E678AEC7ED14540	16	8	2014-12-02	68609	5640.46496977217	t
1908	0101000020E610000057AEC276C3320F40D838E3A457D04540	12	10	2023-08-30	23387	80941.2342969808	t
1909	0101000020E6100000D28A827CCB6F0F40D4E02729E9CF4540	85	10	2024-02-07	47366	73929.6232979368	t
1910	0101000020E610000040FD842553F10E4087D7B24E44CD4540	41	5	2022-08-05	83266	11779.5533685648	t
1911	0101000020E610000099208D63928C0F40B3BA6CBCCED14540	59	6	2010-11-02	88997	97915.0858134284	t
1912	0101000020E6100000D22DE157497D0F409495CC3F5BCB4540	10	10	2010-06-17	5239	95273.1153211744	f
1913	0101000020E610000090EAB967CEE30E40480EAEEAB6D44540	86	5	2023-11-18	23745	64340.7498142192	t
1914	0101000020E6100000C0C1FB784F470F405CC9E940F9CB4540	23	7	2014-06-28	98051	48674.5958614028	f
1915	0101000020E610000061CFC04A13880E40D8D859165CCD4540	98	7	2025-08-22	50887	31312.0832620364	t
1916	0101000020E6100000FAC6BB42848E0E4048ADD6D7B7CD4540	25	10	2025-05-03	33424	22170.5543561574	t
1917	0101000020E6100000E3A0E21637720E40FE2CAE8D7FCF4540	54	8	2022-09-23	92583	11904.0327743494	f
1918	0101000020E61000003268716BEEA00F40A51DD0BB48CF4540	1	5	2017-09-30	71348	4227.54673999592	f
1919	0101000020E61000006D5A9D113AFD0E40D4D617BE91CA4540	20	10	2025-09-24	31845	78857.8062429587	t
1920	0101000020E61000003C5AB954D7860E40F00204D36FC94540	20	4	2015-01-17	25103	1930.90385066363	t
1921	0101000020E61000009C6E7229A9F10E408A71903676CF4540	75	1	2019-01-29	4520	1912.7188111608	f
1922	0101000020E6100000865C6897AC8C0F40B4762F3901CC4540	76	9	2023-03-25	69699	55604.6545102397	t
1923	0101000020E61000000D94D939F6690E40F3440EA2E9D34540	53	5	2025-08-13	64306	83595.22381161	t
1924	0101000020E61000008A1812793E600F4095198BF4B4D14540	84	7	2023-03-15	13256	71161.7491749969	t
1925	0101000020E6100000D1C989A3E9740F408AAA01D48DD44540	3	2	2011-04-29	23891	86388.7809566961	t
1926	0101000020E610000060BDF00014C70E40644D677DE2C74540	70	3	2019-06-01	14332	12599.4496107263	f
1927	0101000020E6100000D9D5B16FA3C60E401EB9EE6075CB4540	53	1	2019-08-12	11898	55842.3600971308	f
1928	0101000020E61000008FF713C3042C0F4038813200AACA4540	41	10	2022-05-05	30673	33768.8269238634	t
1929	0101000020E6100000106099970D3F0F40089B267E82D04540	62	9	2022-01-21	56225	33236.171475899	t
1930	0101000020E61000005A4E5B514A930E40ED77AC49D2D04540	58	4	2021-07-26	37414	19367.0121141578	t
1931	0101000020E6100000EE6CC717BD4E0F4019C1DF6403D14540	10	5	2020-08-13	70790	44588.6381685388	t
1932	0101000020E6100000CDBCFBA0415C0F407E0FF1D75AC94540	61	6	2014-03-24	68496	86082.4430958254	f
1933	0101000020E610000081F7474DB5860E405779B042FDD24540	94	10	2011-06-05	35931	13838.1295964928	t
1934	0101000020E61000005E63E94E94A70E4067D4792A15CF4540	85	3	2013-06-18	93347	46843.7787537942	t
1935	0101000020E61000002B16F1640A640E409FFC54A8ADCD4540	46	6	2016-06-09	58575	91718.6129713258	f
1936	0101000020E610000069DEFB34C5200F402E4600227FD04540	65	6	2015-12-06	1773	46030.5198541586	f
1937	0101000020E6100000C871F21C2A560F40B189C9541FC84540	92	3	2022-08-25	15010	59754.8422602304	f
1938	0101000020E61000007E83A06230920F408FECEDC09ECA4540	76	6	2025-09-06	31840	48046.567116954	t
1939	0101000020E6100000204D873F0BDA0E40437D2DFA7CCA4540	4	4	2020-09-12	14793	79294.2257077954	f
1940	0101000020E6100000C184AFF571A40E40A44DEDE94AD44540	19	3	2013-03-10	69641	28767.9217375652	t
1941	0101000020E610000059A22CFD05260F40B3024B79EDCB4540	59	2	2010-09-27	28035	3510.83344950058	t
1942	0101000020E6100000268276D537CB0E40BA751CD863CD4540	57	8	2013-09-30	66466	13735.7789003143	t
1943	0101000020E6100000A0E35F88FC710E40AB8749E9A2CA4540	46	7	2020-02-14	68373	79818.1258540333	f
1944	0101000020E610000094B72A8765CD0E40FF396104BDD04540	41	9	2018-04-13	5409	55507.0477114636	t
1945	0101000020E6100000393F86451FD10E402927E10542CD4540	17	6	2012-04-22	34478	61652.4565805732	t
1946	0101000020E6100000536F82590B7B0E404773089832D44540	54	8	2019-09-08	41805	70567.5391299169	t
1947	0101000020E61000005457C1213DA50E40A1D3644DEFD04540	21	7	2023-03-17	45737	15595.9724630707	t
1948	0101000020E61000007083581BCB9E0F4020BBA31794CE4540	53	9	2010-06-26	63920	47393.8269961013	f
1949	0101000020E61000005BD1B6931B9C0E405D595E7592CD4540	34	10	2017-04-23	89557	62249.5565075001	f
1950	0101000020E61000000F13D08735F10E407E23B1DE3BD14540	18	7	2011-03-08	63414	36169.0909341868	t
1951	0101000020E6100000573E1B24F98B0E4072D4E0C2DAC84540	97	4	2024-05-05	5428	30063.3130422948	t
1952	0101000020E6100000B75157399E980F4045D21AF5CDC94540	10	3	2012-11-30	79055	12655.28075466	t
1953	0101000020E6100000C29885629B2C0F402F329BBB61CE4540	81	8	2012-07-25	83451	4089.19690950889	f
1954	0101000020E6100000608DC0642B580F40A8738A011AD04540	39	8	2018-10-15	11815	53879.6261814591	f
1955	0101000020E6100000A42F60F87C750F4007E1B4C49CC74540	15	5	2020-09-12	91720	55870.0872193513	f
1956	0101000020E61000005F46ED4AAA1F0F40C3475701BBCC4540	94	3	2025-08-20	94660	85133.6905338615	f
1957	0101000020E610000057A8F3FE6F470F403DF3C04CE1CF4540	51	6	2019-06-23	29041	94249.3657950367	t
1958	0101000020E6100000634FC245E34D0F40991433BB95CF4540	6	2	2018-01-07	97632	91112.443291979	f
1959	0101000020E6100000D50A55765B720E40ED9D244C24D24540	34	10	2013-11-21	52964	51164.3347403399	t
1960	0101000020E6100000AAD751BA7A870E406E962A7DC8D04540	17	10	2023-08-27	23842	93123.5675743581	f
1961	0101000020E6100000673EC6F77DC50E4008CCFDB810CE4540	77	2	2021-10-18	96741	18497.0703999017	f
1962	0101000020E6100000F417F69CFC010F4005403908EECF4540	72	10	2010-03-08	34404	48403.3085952941	f
1963	0101000020E6100000C887E9B2B1FC0E406D6073C152D04540	55	10	2015-02-22	39705	20967.4169761441	t
1964	0101000020E6100000DEFF54CED7630F40CF5C017D19CC4540	98	6	2013-02-13	6937	61258.6524752758	t
1965	0101000020E610000016D078C1AD4C0F40BEAAA443F4D24540	62	8	2011-02-24	30410	85954.9273411972	t
1966	0101000020E6100000FA204E08E1650E406A19B4558ED44540	69	1	2018-04-27	90249	3809.82598363715	f
1967	0101000020E610000027854821838A0F405A72640697CF4540	86	10	2014-07-01	27982	72950.7478239521	t
1968	0101000020E6100000DEA7667A80A20F4069C90BAF03D24540	66	1	2015-11-20	11190	32770.6010762197	f
1969	0101000020E61000001618F6F41A780E40404354276BCB4540	27	6	2025-05-12	13474	89113.4544113053	t
1970	0101000020E6100000FC8551FCEF8E0F403558D834EBD24540	72	7	2023-03-08	76975	17003.5009189868	t
1971	0101000020E6100000253865509CA00E40E85058F4B2CA4540	12	6	2021-01-15	25905	51054.3301563992	f
1972	0101000020E61000006CA1240830850F4017A0F5EA1AD54540	16	9	2018-12-22	76280	30569.4355628263	f
1973	0101000020E610000021986422169C0E4078C90A5A04D24540	43	9	2017-04-07	96357	36665.2404459967	t
1974	0101000020E61000009CF95593658C0F4010F2334ECAD24540	39	6	2024-01-12	86918	80733.2810601434	t
1975	0101000020E610000087FED1EBE08F0F408389091385D44540	79	7	2020-10-07	68873	31617.7198577031	t
1976	0101000020E6100000C8AEFB7011EB0E4049E1D87530CF4540	52	5	2020-01-20	21835	24214.4653001265	f
1977	0101000020E61000007636D5A8B2E00E4080D2AB4C7FC94540	14	8	2012-05-11	91541	64231.4184761382	f
1978	0101000020E61000005DED4164D28A0F409E1E836A03D44540	19	5	2016-10-21	40287	85546.833185346	t
1979	0101000020E6100000BD29C52022920F409FDDF35D92CB4540	63	4	2018-06-25	40626	57655.3952887724	f
1980	0101000020E6100000B8397E4A40BB0E4011DFE6C4AFD04540	32	5	2023-02-11	22065	40464.1561257072	t
1981	0101000020E6100000D29007AE1B730F4012215EDEFBCC4540	44	1	2022-09-15	74794	86897.005366941	t
1982	0101000020E6100000D5696C7ECFED0E40C82E05AEAAD14540	15	9	2022-05-08	80012	48269.9755002435	f
1983	0101000020E6100000B92D4AC896F30E40296C3C45FBCA4540	45	10	2017-11-20	79261	37338.0593064382	f
1984	0101000020E6100000B141608D80430F40E629EFC961CE4540	22	9	2024-05-30	65855	83850.1688602617	t
1985	0101000020E61000003FD87DACE2760F40779D5FC4BDCD4540	21	5	2025-07-16	24645	5796.87262851274	t
1986	0101000020E6100000A7A44389A7220F406CEF0DC1C3C84540	82	3	2021-01-08	39477	56413.0891182926	t
1987	0101000020E61000000BAC43D0576D0E40E2823353A5D44540	60	6	2017-01-11	41290	13319.1929745341	f
1988	0101000020E61000001474CEFBB5E50E4060059A7A12CD4540	43	4	2023-06-09	56698	60409.2379785909	t
1989	0101000020E6100000E6898A0739050F404BF650D16ECF4540	20	9	2020-02-07	47233	21167.4893011307	f
1990	0101000020E610000027DAFEFF60810F40D429010741CC4540	58	3	2025-08-03	86631	43397.6871834588	t
1991	0101000020E61000008D72E214AB8D0F4077A790058ACD4540	25	1	2016-01-17	98239	28076.7703251815	f
1992	0101000020E6100000449BDE3A2E1E0F40C9FC644EDACA4540	31	2	2016-09-26	18392	80285.6025772927	t
1993	0101000020E610000065878FF9B47B0E4029F5FBAB02C84540	31	9	2011-03-26	3573	33971.9668087702	f
1994	0101000020E6100000227B820639930F4099F1A7810EC94540	86	8	2018-10-27	93633	57229.5931408547	t
1995	0101000020E6100000CCC44495C08B0E4061F4FD7E41CE4540	21	4	2023-03-12	525	7283.74575985384	t
1996	0101000020E61000006422E51278860E40C91E885A32CE4540	11	9	2025-01-16	94042	87938.0324739972	t
1997	0101000020E61000001FDB54C6D0FB0E40A7B385130ECD4540	38	8	2023-05-12	15050	1142.73836339636	f
1998	0101000020E61000004B32C229830C0F40C2BE25810BD54540	63	4	2022-09-21	96808	90828.4305182477	t
1999	0101000020E6100000DCBDA894AF1E0F40FD17E641DCD04540	70	2	2012-01-26	50934	51969.7077943684	t
2000	0101000020E6100000A990C31B800D0F4068FAE3C4FBD04540	18	1	2018-03-30	26363	53234.5294325199	t
2001	0101000020E61000000B6F7EA78C810E40D7E2FFD17EC94540	96	10	2018-12-07	72334	8038.56934488059	f
2002	0101000020E6100000FBA8297AEC150F40DDFD7A3F90CC4540	7	4	2016-11-24	90756	33062.9003150621	f
2003	0101000020E6100000321D098443B30E40E02BAB6CA5CE4540	5	10	2012-09-08	71175	35863.3207129746	f
2004	0101000020E6100000BB043A0CBEA40F40D82689E4A1D14540	57	3	2015-08-22	42954	49807.591856858	t
2005	0101000020E6100000EA6E4A3A84A70F4063E60159FEC84540	10	5	2025-06-28	53920	86851.6548545503	t
2006	0101000020E6100000663ADAD968670F4055FF1DD482CE4540	94	7	2023-10-30	71460	88892.4446741208	t
2007	0101000020E6100000DE7B192E31AF0E40FA0F73F2F3CC4540	62	7	2017-10-09	26292	23188.1002468367	f
2008	0101000020E610000047DE76B3D37D0E4075412F559BD14540	72	1	2014-09-24	99702	61389.0065039097	t
2009	0101000020E6100000EDE751ED2C960E40B5477D1425CB4540	15	4	2018-06-04	49457	61345.3442909117	f
2010	0101000020E6100000ECAF8FEA7B6C0E4052C1660264D54540	45	9	2017-04-01	3156	8181.90526219329	f
2011	0101000020E61000005FFBE106B26C0F40F1491242D9C94540	74	5	2024-02-19	63169	37803.2313448156	t
2012	0101000020E610000052451E2C44190F40BDFEB9C383C94540	4	10	2014-01-06	76261	42596.8359259647	f
2013	0101000020E6100000C06413714D880F4054C6BC2C16D24540	85	2	2017-11-14	62568	49200.2287978092	t
2014	0101000020E6100000F2A66E25B51F0F40FB09869411CB4540	18	2	2017-08-01	23296	30711.8755756172	t
2015	0101000020E6100000CCF211C4D4B70E40F70986BB52CE4540	30	9	2016-07-05	65730	89925.6860903869	f
2016	0101000020E6100000DDA953710FAA0F409AE32FD817D14540	29	5	2025-06-04	29157	68762.901386672	t
2017	0101000020E61000002E7B95DA97CE0E40F87DFD5D59CC4540	58	2	2018-08-14	42060	42040.8626415006	f
2018	0101000020E6100000AEA0EABDEBA90E4077674E0A8ACC4540	62	4	2015-12-22	60892	78696.4960641421	t
2019	0101000020E6100000F035EAB2C02A0F409957CDEBEBD44540	61	4	2018-06-15	792	23874.0826936573	f
2020	0101000020E610000026CA6F90C5900E408EDC93D751D44540	95	6	2014-06-16	75701	67475.3438610817	t
2021	0101000020E61000004D07473A29DD0E402A785CA9E6CD4540	65	5	2024-06-21	91007	65515.5959272601	t
2022	0101000020E6100000EA9E54E845870F40AF4F0C7A7ED24540	86	9	2012-03-28	15811	87645.2878842836	f
2023	0101000020E61000000B7952A0006D0E40503C7D0860D34540	78	3	2011-05-14	59971	81010.4614647095	f
2024	0101000020E6100000BEAD0542026A0E40B68F815327C84540	19	1	2018-03-01	96290	84236.5567749977	f
2025	0101000020E6100000D703570A85310F406069BB5F71D44540	87	4	2010-04-02	37161	6669.40014253372	t
2026	0101000020E61000005B65287FBE7D0E40E6564073E1CC4540	41	10	2015-12-29	82529	34972.8385950834	t
2027	0101000020E6100000228EA3BE62240F4082B07F9C0CD44540	61	4	2021-07-25	8747	78879.1968899974	t
2028	0101000020E6100000433BA51481430F403B61E2A315CB4540	12	7	2021-12-21	86393	70954.6892437214	t
2029	0101000020E6100000F673D393AE380F407A2D9D0305D24540	32	6	2019-12-14	36319	35428.4774228432	t
2030	0101000020E6100000D50A9AAB337A0E40140405152BCE4540	17	4	2010-04-20	75270	86494.6217123531	t
2031	0101000020E610000064B2CCC982370F40BEE959ED5CD04540	17	5	2020-10-31	51104	795.908447149296	f
2032	0101000020E6100000A4F142AB39640F400C1F2D9D9BCF4540	62	6	2016-05-15	23846	926.53687195734	t
2033	0101000020E610000017F8CE8803740F40E45199C316D54540	67	5	2012-01-26	31209	59757.367940937	t
2034	0101000020E6100000E1D89C8D5E6A0F40F4E5A10599D24540	79	1	2024-09-14	279	48109.5932845966	t
2035	0101000020E6100000728DFFEF0D740E40A00A140192D44540	18	3	2019-02-07	36725	50176.5940233484	t
2036	0101000020E6100000B208684C630F0F40F2D301D430D34540	93	7	2016-05-17	52731	26193.2616981121	f
2037	0101000020E61000004C07F97A47B80E409800E4C91ACF4540	89	5	2025-07-12	58274	42369.8642249511	f
2038	0101000020E61000008AF1CEB658B10E4027426EEC65CB4540	37	10	2012-05-16	73678	6479.49564139412	t
2039	0101000020E61000000618567DACC50E4053DFAF7E03D44540	78	2	2022-10-26	43391	29089.0285270871	t
2040	0101000020E610000051667E5FED520F40493E792F32CD4540	46	7	2021-10-25	92453	76798.4974489224	f
2041	0101000020E6100000DD990BEF65CA0E40D776679225D44540	88	6	2016-08-19	93964	85968.3730012585	t
2042	0101000020E61000007174F7C2B3110F4074D277B5D9CD4540	5	8	2018-11-01	50859	9082.80674456068	f
2043	0101000020E6100000EEC7123B63AB0E406F2853A41DCC4540	46	2	2023-03-31	49162	55414.9476567259	t
2044	0101000020E610000090758AC12EBE0E4060EE07ACA2D34540	71	8	2023-05-05	91680	33710.6377175875	f
2045	0101000020E61000003B5455AD1FC80E409998851EA5D44540	36	3	2025-07-18	95482	45999.8252984307	t
2046	0101000020E6100000879FDF00168E0E40A8116F33B3CB4540	20	10	2015-11-01	63373	65342.2717618743	t
2047	0101000020E6100000E2485BD4CB9C0F4030A14C166DCB4540	66	6	2010-08-04	88	61036.5947843068	t
2048	0101000020E6100000BC85178EA9870F40BF61007A63C84540	19	10	2015-11-10	62651	78151.7451466658	t
2049	0101000020E6100000D82A93E3C3810F409F5BEBFDF0D04540	7	4	2011-12-30	66330	75073.4040758751	t
2050	0101000020E61000008323940BAB810F4098A2971FA8CC4540	80	8	2015-04-17	76735	32751.3246488061	t
2051	0101000020E61000002A4DB841EA640F40BB62D5CA1CD04540	6	1	2017-11-30	39812	71637.0820333002	f
2052	0101000020E6100000CCA361B9B4630E40FA39021E46CB4540	24	10	2025-05-27	77122	29169.5952283787	t
2053	0101000020E610000055179191B9ED0E4036C95CCF91C94540	60	7	2022-09-30	27231	97260.5310190155	f
2054	0101000020E610000048D413BE9DD60E40D3B2BC692BD14540	68	3	2015-04-12	71850	52636.7701103422	t
2055	0101000020E6100000C18102E36A1A0F40603F21B022D24540	90	10	2012-11-19	45702	94803.1989439533	t
2056	0101000020E6100000CA2824F5538E0F4085CF6A0863C84540	26	1	2021-07-13	24224	27789.5864316335	t
2057	0101000020E6100000B14380A3EB360F40EC06922AB7D04540	87	4	2021-05-03	81923	48396.5873656504	t
2058	0101000020E61000004EF41BCAA0240F401E42D146FACF4540	16	1	2022-07-09	36400	83137.9277076508	f
2059	0101000020E6100000800F8825C4AE0E40342692843FC84540	60	1	2015-06-06	69403	72755.2653424768	f
2060	0101000020E61000009A202EB342370F40553BF0C102C94540	17	3	2024-11-14	98510	28278.1294484685	t
2061	0101000020E610000055FD7FBFF1920F40C8D638DA3AD24540	69	7	2020-02-04	14552	14400.0650645211	t
2062	0101000020E6100000E59FD1DB1DAA0E40140D5F72C3D04540	66	7	2024-04-04	18223	53617.6236050254	f
2063	0101000020E610000061B0260790E40E4043C9B02FEECE4540	15	9	2022-03-14	83983	11462.911941382	t
2064	0101000020E6100000B1F13269BF370F407A1D7D6AA8D34540	52	1	2010-12-20	95403	22690.5012164194	f
2065	0101000020E6100000142F7189842E0F40BF0BDAA29EC84540	94	5	2015-10-10	54529	17045.5379404779	t
2066	0101000020E6100000EDC721E8E2C20E4019B7027125D04540	12	8	2014-07-21	45184	37885.0701968779	f
2067	0101000020E6100000CB1DC36353A60E40675A083AC2CE4540	23	8	2016-09-22	80173	67758.8069145695	t
2068	0101000020E610000067F0571BF54C0F40135E7FA639CD4540	37	7	2012-11-03	24187	93583.8611195635	f
2069	0101000020E6100000E2BAEE7A637F0F40EFFDE086CBCE4540	74	4	2022-05-30	6761	78601.8073442041	f
2070	0101000020E6100000FFA8FFEF48BE0E40FEDC33568BCC4540	89	6	2018-07-01	81898	31130.4302339865	f
2071	0101000020E6100000F8EA11463B780E401161B86A76D14540	17	1	2023-04-09	88915	18483.2896966778	t
2072	0101000020E61000006E1461DFEF740E404574234A0CCD4540	56	10	2023-08-31	42167	1654.94162328872	t
2073	0101000020E61000000307852FEC590F405E3D913565D34540	68	4	2016-06-19	30403	89757.290621425	t
2074	0101000020E6100000DF830261C6BC0E400AD1665C8CD44540	32	7	2011-04-01	25521	11641.5796289141	t
2075	0101000020E6100000077E586544340F400C42BEF037CF4540	48	8	2019-12-19	79098	27658.5814801895	f
2076	0101000020E6100000F073276208210F400A6EEE38E3D44540	50	9	2025-04-05	53848	77216.5015158197	t
2077	0101000020E6100000B6DAAF38FF4B0F40574C362E32C84540	4	9	2019-04-13	21147	18098.5920953767	f
2078	0101000020E610000079DA8C0B0E260F404D242704D7CF4540	7	9	2019-12-21	92272	57412.6046238177	f
2079	0101000020E6100000999427C588F80E40F0E62DA740C94540	22	7	2021-11-25	87814	54421.1194233296	t
2080	0101000020E610000015E3B991756F0F40FF7C3906FED14540	27	4	2013-01-21	15996	1608.94926910848	t
2081	0101000020E6100000940FF7341FE60E40F17F04325DD44540	78	1	2013-01-06	3138	8997.41377113319	f
2082	0101000020E61000002C8A4635FC710F40032D445AA1D14540	4	4	2012-04-24	15021	13055.0462270528	f
2083	0101000020E610000070D448257E720F40EEB2D75A1ECF4540	88	2	2023-10-31	22937	93567.3813770882	t
2084	0101000020E6100000642DF2C6661D0F406B8259FA3BD54540	47	1	2012-04-21	4106	60152.9947825605	t
2085	0101000020E61000004B1E186463930F408E81FE366BCE4540	28	10	2022-06-25	59375	97195.4106893534	t
2086	0101000020E6100000F2A2DB608BB90E40D74C275529CD4540	77	7	2011-11-20	9537	14518.0063391871	t
2087	0101000020E6100000C9EFA676666F0E40BE8D0CCB3BD34540	30	5	2019-02-03	60421	57211.6295106108	t
2088	0101000020E6100000ED5264554C6E0F400A6F5BBFCFD34540	22	6	2020-08-13	32614	93104.7273147632	t
2089	0101000020E6100000206F14DC64A10F40B4CF66382DCC4540	4	8	2016-06-18	68381	54478.3669000967	f
2090	0101000020E6100000B7C6AFAB91AF0F406EBA03739ECA4540	52	1	2024-12-18	13488	50462.7257373785	t
2091	0101000020E6100000C0AACED0AC1E0F40647D1CEF98D44540	94	8	2015-11-12	11351	51602.5836290921	f
2092	0101000020E610000023A089C212EA0E40D35D1436B6CA4540	79	3	2017-05-28	68485	39607.1302306887	f
2093	0101000020E6100000B5E28547D4220F4082C84BCF94CF4540	49	10	2020-10-28	60732	65676.0565772941	f
2094	0101000020E6100000BC01985C05470F4071A12DF806CE4540	64	3	2024-06-11	51115	84807.6221686236	f
2095	0101000020E6100000696E94A7446B0F40FF8137CDA7C84540	64	4	2019-07-09	82976	2048.24068415483	t
2096	0101000020E610000045623BA0A9630F40067B9E4F14D14540	97	7	2022-12-27	38497	31717.7455560435	t
2097	0101000020E61000003ABE93A3BB830F40DF291484FBC94540	88	5	2023-02-15	51517	38289.0396406996	f
2098	0101000020E6100000F49C23945F5F0F4042A5C20149C94540	75	8	2021-04-11	30298	87632.8135334227	t
2099	0101000020E6100000FDC705FDA1AB0F405A9E838964D14540	95	2	2018-03-25	20616	10879.4725868418	t
2100	0101000020E6100000D69FCD86C9C80E40A97F5EE793D24540	52	5	2018-04-17	87266	79861.976893294	t
2101	0101000020E6100000BF00185A86B30E40A3042875F2CE4540	87	8	2011-09-22	29339	45144.7058332684	t
2102	0101000020E610000070C04485A88B0E4025CC6356B3CA4540	9	4	2010-11-20	19314	89603.524101699	t
2103	0101000020E6100000FB550B8BB5D50E409DD23BA914CD4540	6	9	2022-05-22	82302	79553.0328011422	f
2104	0101000020E610000003EB3A0A44F60E40AB69224E37CE4540	54	8	2024-04-06	55854	43681.4783632971	f
2105	0101000020E6100000885F686DCC880E401C0CE2E846D44540	42	1	2015-07-24	22975	39496.4627752216	t
2106	0101000020E61000007F0AE65F28BC0E40CEE51067FBCD4540	92	10	2013-05-31	96083	47128.7422757595	f
2107	0101000020E61000004CCFC646F1AB0E4068DE5CB48BCE4540	21	3	2010-01-29	31724	33743.6051844983	f
2108	0101000020E6100000779A28BAE5B30E406CEEDD839ACD4540	83	6	2025-08-01	25281	28914.4123802063	f
2109	0101000020E610000056D65F0697A60F4017082E866BD44540	6	4	2016-03-05	85394	8147.37560990617	t
2110	0101000020E6100000185FCD6F7B780F40FA67949593C94540	58	1	2022-06-17	92508	45153.6644114541	f
2111	0101000020E6100000E36E5F1EC16C0E40C8484911A1CF4540	78	1	2024-05-29	89895	91105.1188008705	t
2112	0101000020E6100000B4F24FEDF7480F4067EF9B964ECB4540	20	7	2018-01-12	44620	99274.2453159448	t
2113	0101000020E6100000819DFB14C59C0E401BD59429BED14540	28	3	2012-02-14	64941	87811.4674738965	t
2114	0101000020E6100000C0446B5346A50E40FC7FDD5A6ED34540	23	8	2015-04-11	17608	40015.9761457396	t
2115	0101000020E6100000BF1BFEDFB0860E4035A620FF1DD54540	63	1	2017-05-23	38190	38210.5358852953	t
2116	0101000020E6100000B15878494A990E40F8DC319E02D34540	94	7	2014-12-25	19240	70317.1675000941	t
2117	0101000020E6100000A085A0576DCF0E409314438EE7D14540	12	8	2016-04-12	70535	69019.1877634278	t
2118	0101000020E6100000AB0CC89BE8910F40352E85CDCED44540	61	5	2024-09-05	63972	71484.7829525008	t
2119	0101000020E6100000DFD3923C3A410F40EE4483D5C2D04540	76	4	2017-08-04	49086	10573.9135439723	f
2120	0101000020E6100000FDEA55ABA4580F40AEDADC003FCD4540	22	2	2010-09-07	87663	58871.4267185259	f
2121	0101000020E6100000C781224870C40E40750A46D647CE4540	91	10	2023-07-23	10959	47326.9738734575	t
2122	0101000020E61000004C929F744ECA0E40E99CCF01F1CE4540	93	2	2019-10-23	89829	19333.9945288433	f
2123	0101000020E6100000F087FEC67AEF0E407267E5E1A1CD4540	29	8	2020-05-03	51519	23303.2747644349	t
2124	0101000020E61000000A059A710ED70E40B6DEA6BA25D34540	18	10	2014-03-18	30076	99434.0461541343	t
2125	0101000020E61000005ED5180BBFFE0E40FF3092FB89CB4540	85	4	2018-03-12	26762	54201.7459938279	f
2126	0101000020E61000005E860C18D4040F4062195F299EC94540	30	3	2013-10-31	59461	69349.16394935	t
2127	0101000020E61000000033515B37D20E401501345963CC4540	82	10	2018-07-07	20056	997.848345827745	t
2128	0101000020E6100000F7CD8B8273780E40C04CD6E58CCE4540	64	4	2018-10-09	95863	9147.44516816586	f
2129	0101000020E61000000F9219419B640E4070CBFB7498D44540	66	4	2013-11-24	8551	59922.6563015386	t
2130	0101000020E6100000E21E947967650E40B4191F6F09CA4540	73	7	2020-09-06	54838	58184.3425727003	t
2131	0101000020E610000013F96ED4B4300F407C8E3C3F93D14540	75	10	2023-04-12	36614	4685.49216607483	t
2132	0101000020E610000027442F37407E0F40C17D5B1018CF4540	21	5	2012-01-22	18904	19384.7049204925	t
2133	0101000020E6100000C5253F89F44F0F402669CBB2A6D24540	51	8	2019-12-26	56080	90902.0326205872	t
2134	0101000020E6100000C436C70FB65E0F40685F7D2D20CB4540	74	6	2024-09-15	57716	91484.0237068353	t
2135	0101000020E61000001EDCFA0E7D4D0F402F2673DE25CE4540	87	4	2023-04-01	35706	19170.5746653723	t
2136	0101000020E61000001AB4F5FFA6DA0E40E142BDF417C84540	95	10	2017-11-25	67616	98322.2305574453	t
2137	0101000020E61000005F0BA1401D190F40A38D30A1F4D24540	69	9	2017-11-20	91660	53740.0482326058	t
2138	0101000020E61000007AC01D69B9620E40B749FA8C46CA4540	94	4	2012-01-26	19728	84709.6413641463	f
2139	0101000020E610000084369A62577F0E40B0808CEB2CCE4540	89	4	2017-05-03	72982	56891.0007170797	f
2140	0101000020E61000004046BB8D87C80E400CD6FF6796CF4540	11	10	2023-12-08	48586	21297.5810327139	t
2141	0101000020E6100000D353BFDD4F710E4052731EB193D14540	14	10	2025-12-30	73246	86341.2026543575	f
2142	0101000020E6100000FD78DDE86C930F40F7CCC70075CD4540	41	4	2024-06-06	89132	3708.48219259257	f
2143	0101000020E610000066CB6CB1B50F0F400B5B8E17CBCC4540	91	9	2018-08-27	36572	28072.1299064414	f
2144	0101000020E6100000B03B9B5E18A70E40A33F1682C6D44540	17	7	2018-07-31	3840	8312.51544525404	t
2145	0101000020E610000090BD01C431B00E40E00941F677D44540	67	4	2012-03-22	25479	53513.365574107	t
2146	0101000020E610000038B2F68C81640F40DE365C0FF8CD4540	82	10	2024-12-07	79411	15076.2488708927	t
2147	0101000020E61000008BD6C20AFA960F40E7A95D1AA1D14540	36	8	2018-05-27	35146	99388.2428354633	t
2148	0101000020E6100000143B6EECEF950F40B7AE86F65CCF4540	44	3	2024-09-22	83854	84615.1452469982	f
2149	0101000020E6100000DED2BCB290E20E40F996B4606BD24540	40	4	2023-03-24	67514	21889.0282997525	t
2150	0101000020E6100000E95958EEC1070F40A52731A16BD44540	66	8	2018-10-06	69079	29611.0860016663	f
2151	0101000020E61000005DD5185117E70E40F104397754CB4540	100	8	2021-08-03	68368	72479.2969051466	f
2152	0101000020E6100000AD556272A55A0F40F20B987CB6CD4540	32	1	2017-07-04	28433	61883.028917071	f
2153	0101000020E6100000881752D1759D0F402534B0AF3CD14540	76	9	2018-12-29	77115	87134.417882846	t
2154	0101000020E610000093C320B469860E4095D8622A6AD44540	93	8	2016-08-12	2395	6069.8011497007	t
2155	0101000020E61000001DB701FC77AA0E401CEC7667D5C84540	12	10	2018-10-21	22056	77186.5057328691	f
2156	0101000020E610000096BC17FB6D320F40944390629CCD4540	64	1	2024-12-10	48540	21295.9371779311	t
2157	0101000020E610000012BEAD5F23670F400A8F2505AAC74540	66	1	2021-07-17	10594	31943.4169545524	t
2158	0101000020E6100000F8E2D13CFA6B0F40A4B993E14DCF4540	12	3	2024-02-20	37598	81594.3801500011	f
2159	0101000020E61000004FF271D0DB7A0F402FC1DED31ED44540	93	1	2019-06-23	59348	89876.7778949287	f
2160	0101000020E61000004E2CF5C1EE4F0F4031DEBEDFE9D24540	10	1	2025-01-04	54775	98112.3723057089	f
2161	0101000020E6100000801AACBE95730E40A53C47D205D44540	100	10	2011-07-22	56168	54103.3986133524	f
2162	0101000020E6100000EE4DF145DB6A0F403E85D1FFF4CB4540	13	2	2017-06-02	85658	58117.573114056	f
2163	0101000020E6100000BEF70222D7650E40E755743D47CB4540	80	4	2019-06-09	93883	84218.0713151582	f
2164	0101000020E6100000B712D2BC39750E4087E4B775FACE4540	11	8	2011-12-30	64518	47066.0196958951	t
2165	0101000020E610000074AD7BA2EB920E400EB11AE6DFD24540	79	10	2018-11-29	28358	54852.0676331485	t
2166	0101000020E61000009B07153CCB720E408B2F60AEF9C74540	88	6	2019-01-22	84656	60154.0927025421	t
2167	0101000020E6100000DC4C70FC88BA0E4033E94F2A6FC84540	63	8	2020-11-08	40086	44804.6829335279	t
2168	0101000020E6100000AED87D25F3FD0E4043B2706836CC4540	50	7	2014-04-05	47601	91.2259596870468	t
2169	0101000020E6100000C38A741105A60F40DAA74B0508D34540	3	5	2013-08-15	35035	28638.1760965138	f
2170	0101000020E6100000F651636E057E0E402F87CA2848D54540	5	1	2020-11-19	7586	67069.5106787169	t
2171	0101000020E61000008B8E7B86F9B40E4047C94E7134D34540	17	3	2022-12-18	58424	50231.6916888153	f
2172	0101000020E61000000027B1DE934F0F40EA4C42BBEACE4540	77	4	2018-04-23	13783	60416.6267638212	f
2173	0101000020E61000005F7278D08FD60E40D529230120CA4540	64	10	2024-08-26	21040	6113.95489756894	t
2174	0101000020E6100000791D88BA87270F40D9989BA4FED24540	2	8	2020-11-06	53288	56024.8832970732	t
2175	0101000020E610000081C2ED7DF5A00F409B69853E4BC94540	77	9	2017-11-14	73571	2639.90415878514	f
2176	0101000020E6100000A8A22739347A0F40F5249BEFC3D04540	67	9	2012-03-16	84246	17325.4011571496	t
2177	0101000020E61000005EDC8BFC4DCE0E40F68AAA3B72D44540	84	5	2024-08-02	98631	80286.2470709439	t
2178	0101000020E61000006D6C0986B4F30E400997EEFBE9CD4540	63	8	2014-10-09	8864	18334.1187145587	f
2179	0101000020E61000005BDAE572D8D40E4063FAF89B35D44540	97	9	2011-08-04	66016	57783.7155893299	t
2180	0101000020E61000003948B2D0AFF70E4071CED79D11D14540	8	8	2019-04-20	82685	88147.6271049577	t
2181	0101000020E610000060023AFACBC40E40259D5A84D3CC4540	77	5	2011-05-18	30906	753.391178218199	t
2182	0101000020E6100000E1D6133507110F40AC61761683CB4540	96	2	2014-08-26	6407	60250.5271002677	t
2183	0101000020E61000001A377A553E900E408C488DAC53CB4540	67	10	2024-06-16	7519	95213.7938914355	f
2184	0101000020E6100000A804D7556D7B0E4038CE6BF9D9C94540	94	6	2011-03-22	32101	91750.7735869685	t
2185	0101000020E61000009DD2BF6547BF0E407F74823E2AD54540	72	1	2012-07-23	58435	69137.0727464073	t
2186	0101000020E6100000A601FABB1EF60E40C00885FF24D14540	60	7	2023-04-07	24368	89760.0324986305	f
2187	0101000020E6100000BA912B7037BA0E40D10D2D4BF0CC4540	45	1	2016-02-21	51355	75881.0414549657	t
2188	0101000020E61000006CF17C466C7E0F40EEB824A5EED04540	7	8	2025-04-27	7054	19080.0733043987	t
2189	0101000020E61000005FEB6A546E560F401B050595FFD04540	65	2	2025-09-05	16674	62744.0094986233	t
2190	0101000020E61000009E69289E079C0F40E50E8C0A65C94540	89	2	2018-11-22	48823	30337.4602008587	t
2191	0101000020E6100000D4F1873BAF730F4062F1002CFDD44540	4	2	2021-06-27	69165	67720.6067596336	t
2192	0101000020E6100000B909269913580F40B2ED8E005DD04540	82	10	2023-06-21	663	63355.8940607281	t
2193	0101000020E6100000A171876337990E40206CF2EFF2CC4540	79	3	2014-08-07	45909	19656.5886047596	t
2194	0101000020E61000005AAABCB303600F40FC0378A659D44540	26	2	2014-05-09	65876	74688.4569898452	f
2195	0101000020E61000006FD0CA47467E0F404CE3BA3E9DD44540	82	5	2017-04-03	69466	24420.8585666971	f
2196	0101000020E6100000FC2E5387B27E0E40377E6ADBB7D34540	55	7	2017-06-06	21273	14841.5729267279	t
2197	0101000020E61000007478581990980E40B1E35F9E3FD14540	69	8	2018-04-23	18116	66617.1371739028	f
2198	0101000020E610000067FEA4A942DE0E409C32114578CC4540	51	5	2011-06-21	89116	70314.3647828227	t
2199	0101000020E6100000EBBE6D839E780F40419DA7F3D1CA4540	54	4	2013-08-04	83548	2404.90198106991	t
2200	0101000020E61000002FFB465FDED40E40DDD640B3BEC94540	22	8	2017-08-26	87137	96043.0358936486	t
2201	0101000020E6100000AF4488A5ECB80E40E7195CC7ACCE4540	72	5	2016-11-01	64557	14459.6569992733	f
2202	0101000020E61000004F83F743C7AD0E4011224F6993D04540	87	5	2021-12-20	54259	62725.0540927184	f
2203	0101000020E6100000766E0F73FB6D0F403261406C3DC94540	72	7	2018-12-11	74996	72853.225692978	f
2204	0101000020E6100000C0A8034BDC230F40FC7091598BCD4540	77	3	2018-03-09	53855	73198.0783087662	t
2205	0101000020E610000059129BD632970E40D3DA6EC420D24540	53	5	2025-11-30	37828	30491.3750785343	t
2206	0101000020E61000009E814E7100530F40F3591142A0D04540	71	8	2012-06-29	49776	47150.256369132	t
2207	0101000020E6100000261F1A5E2D530F40B3A8878C87D34540	21	10	2018-04-19	27633	71449.6853418401	f
2208	0101000020E6100000E47E48CE2C400F40E0ACB96B52CF4540	80	3	2015-09-29	28959	51839.7387900839	t
2209	0101000020E6100000A431D6C621FC0E406D44408EE2CA4540	25	9	2020-02-01	94632	80706.1939659602	t
2210	0101000020E61000005ABD7B96BE3A0F408567F669A7C94540	46	2	2013-06-05	76098	75284.4273103757	f
2211	0101000020E6100000735DFE61029B0E40869E53F047C84540	100	6	2010-10-17	37853	75108.6600587662	f
2212	0101000020E6100000CF23A263FCAA0F406D3C5363B0D14540	89	4	2023-06-29	71562	742.121818151964	f
2213	0101000020E6100000B6005EC4596E0E400F2D659D36CF4540	70	3	2010-04-19	63016	26169.5075550358	f
2214	0101000020E610000083ABE364A7850F401337FB4D61C94540	11	1	2014-06-22	38813	49154.7390646725	f
2215	0101000020E610000060F567823E600F400CE112E4E1C74540	63	9	2024-09-08	39676	53110.3394153586	f
2216	0101000020E610000090C98823FC6C0E40DCDC6BD116D54540	59	10	2017-06-01	51215	15312.6822503269	t
2217	0101000020E610000044F74FA8E17B0E409C7AD11D97CF4540	6	2	2010-07-10	86318	10489.2498256562	t
2218	0101000020E610000017BD87E85FCD0E40C47990991DCF4540	81	3	2017-03-27	17156	2354.86657796458	t
2219	0101000020E610000079AB2486C2950E40FF2F159ACAD14540	34	6	2010-02-26	28791	20923.1917667322	t
2220	0101000020E610000030D0CC19566E0E400B07B05CF6CF4540	39	1	2015-04-21	945	54577.9882357017	t
2221	0101000020E6100000AE7FF3465D400F406EA3F729F0CC4540	53	3	2022-08-14	4826	55969.8176091419	t
2222	0101000020E61000001A03E59AF2A40F406FEA5489DACE4540	12	4	2025-02-18	71616	47960.4223762444	f
2223	0101000020E6100000F3728C24D2480F40EA97C3E612D14540	16	8	2010-07-23	6471	27274.6689589963	t
2224	0101000020E6100000504E4CA81E420F407D849E93B0CF4540	10	2	2025-11-24	87208	59762.903753163	t
2225	0101000020E6100000469F0007EB6C0F40874E60E25BCB4540	80	10	2010-07-07	20678	15043.9242589858	t
2226	0101000020E6100000BE0458CBC08A0F408413E4FBE4CD4540	53	6	2024-05-08	69938	84687.1782480445	t
2227	0101000020E6100000FED98897791B0F40629BB54D81CE4540	53	5	2017-02-07	37978	30018.3791790703	t
2228	0101000020E6100000B9C4BE7D09FD0E40EF3C397221D34540	42	8	2012-10-02	81279	95181.3512190871	t
2229	0101000020E6100000E53F87D3B4AC0E4066CEC178A5CF4540	87	10	2011-03-23	53832	12073.185944975	f
2230	0101000020E61000006AFCAB6DB1C10E40788FF16DB6D24540	56	4	2020-05-18	81749	5066.24965212976	f
2231	0101000020E6100000309D9988D2660E405E9427433ED44540	19	10	2015-06-24	56831	58889.2415214131	t
2232	0101000020E61000001114E5254A9C0E403AC605DC3AD44540	38	8	2015-03-28	86171	31211.6683002663	f
2233	0101000020E61000001A149018D1E90E4077AC4BEF94CC4540	18	1	2010-06-10	66017	8106.43363178565	f
2234	0101000020E6100000DF197EA3068A0E40EE39B133CECD4540	85	2	2018-03-23	20102	92909.2067059522	t
2235	0101000020E61000006422370616C70E402FB986546CCC4540	94	5	2021-10-30	28422	55010.5355594606	t
2236	0101000020E610000045D775EBF4B80E40F40BF6B87DCC4540	7	1	2023-05-25	9213	35725.7027963071	f
2237	0101000020E610000002DF02C41CC20E407633C8C81DCF4540	72	5	2010-06-25	21610	31346.5553161861	t
2238	0101000020E6100000D79F019DF9DF0E4044A40B8A91CF4540	39	4	2012-04-12	57727	18155.8052844864	t
2239	0101000020E61000002D4954C7D1110F400526A13BC5C74540	86	7	2016-04-27	13665	78413.5832869599	t
2240	0101000020E610000056CD2DA5647E0F404CD36A8D3CCF4540	77	4	2012-01-17	6031	9473.1605048783	t
2241	0101000020E6100000B77B3F3BB10E0F4069FB28DC0CCF4540	100	5	2025-06-14	87726	23847.0373803443	t
2242	0101000020E61000003426287283170F40288B5EE018D14540	36	8	2022-04-13	59586	77152.8676183449	f
2243	0101000020E6100000D252F5FAB8690E40EFAEA65897D34540	61	5	2025-09-27	33819	86744.785971549	t
2244	0101000020E6100000744FE49F72A00F40CDEF9FB388D24540	26	7	2022-01-27	26816	59120.7832920227	f
2245	0101000020E610000053EB83885A380F404841FA5A20D14540	56	3	2021-09-01	18732	53431.2057116821	t
2246	0101000020E6100000AE263ED881640F405241F33217CF4540	39	5	2015-12-08	68266	47354.1369375595	f
2247	0101000020E6100000CD72A9A534420F40C6E34C9543D24540	10	6	2013-05-14	33183	42216.9913958355	t
2248	0101000020E61000003B0B5224188D0F40B377EC8B95D24540	50	5	2024-10-26	30724	10858.7110490669	t
2249	0101000020E6100000640C5C52C3050F407CB146C152D44540	31	5	2010-02-23	66564	22319.3212166483	t
2250	0101000020E61000000FCF44C0ACCC0E40C057173A63D54540	68	3	2022-10-06	37794	52493.4389570692	t
2251	0101000020E6100000CF22958E4A790F40C46C26964ED34540	31	4	2015-09-05	87498	75038.0639817486	t
2252	0101000020E6100000BFB68AD6AABC0E40408704CF97D24540	95	8	2011-05-08	19110	28055.2219934999	f
2253	0101000020E61000004CD7957443140F406618DF4D6CCB4540	20	1	2021-01-03	60536	99275.1154226817	t
2254	0101000020E61000003606F11BA7A00F40D029C6F551D34540	30	6	2022-06-29	77706	66826.0942122403	t
2255	0101000020E6100000121BD71900BC0E40D525447868C94540	83	6	2020-03-22	78238	99229.91520219	t
2256	0101000020E61000009431F7BD65B50E4098A2F532D8D24540	41	3	2019-02-22	11917	24649.1608877178	f
2257	0101000020E61000000B5588B7495C0F406A7EC31BAFCE4540	76	1	2014-01-14	68449	63236.2397204986	t
2258	0101000020E6100000347AEE9DCE870F405250DF68C7D04540	70	10	2011-11-07	71046	24044.4987584991	t
2259	0101000020E61000008D02CF90C3530F40042746E735CA4540	63	1	2024-09-20	13727	9184.57241548198	t
2260	0101000020E6100000EB07ED29FCE80E4018404DC2CFCF4540	5	9	2025-01-23	62874	45835.9431347518	t
2261	0101000020E6100000E4FA56CC99330F40F277510A88D34540	24	8	2019-05-25	26109	38388.4026087607	f
2262	0101000020E610000057101BFBEF1D0F406AB99D27CDD24540	29	10	2013-07-02	93443	42254.1529356436	t
2263	0101000020E610000024BEB5C05D040F40D2803A6407CB4540	27	9	2017-10-09	34075	51943.5643041245	t
2264	0101000020E61000004C2E259BF4F20E404CAD2E5748D14540	72	10	2012-02-04	73649	70782.2348395007	f
2265	0101000020E6100000A1F80DBD4D3A0F404B03EBC428CE4540	22	5	2018-08-10	83364	49404.7689663388	f
2266	0101000020E6100000BBAB9463B1990F40BDFDE3E8E3C94540	58	3	2017-06-21	69782	75544.7535814999	t
2267	0101000020E61000007EDFB9F36C900E4093BEE65119D34540	43	6	2015-02-04	7978	97547.9900196056	t
2268	0101000020E61000008146B5EBAC950F40C963346510C84540	47	5	2020-05-27	20632	73670.7558175713	t
2269	0101000020E6100000FB20B78F71760E40359B3FAE49C84540	4	2	2024-02-09	18058	65058.5095991091	t
2270	0101000020E6100000DB44A49135AA0E408864C5AC22D04540	17	7	2017-08-11	54244	73604.7184972936	f
2271	0101000020E6100000E30AD95212050F40E44D2AEA36CD4540	86	4	2021-08-08	25160	78372.4356375506	f
2272	0101000020E6100000EC61DB8897A10E404A8E76758AD04540	20	7	2014-09-09	35151	98047.961689467	t
2273	0101000020E61000004DEB2437A5570F400CADFCA292CC4540	54	6	2012-07-06	10164	26529.8862730404	t
2274	0101000020E6100000EBBD4F8CCC980F4058593A3C48CB4540	39	3	2014-11-07	75774	69213.0526987732	t
2275	0101000020E610000047898972AF530F4094E477D3BECB4540	34	2	2011-11-09	24856	95516.2013380593	t
2276	0101000020E61000008F14D3E6F0630F40EFD25E87E4C94540	86	9	2015-06-28	92011	96628.08173931	t
2277	0101000020E61000003DBF50B211D40E40ED4F186554CF4540	30	7	2015-04-22	66782	66051.8897908405	t
2278	0101000020E610000042BAADB439360F40E59F601BF6D44540	88	4	2014-12-24	54110	48131.6534800913	t
2279	0101000020E6100000F26A58FC4D770E40965BAB8A35CE4540	25	1	2013-06-09	60675	68637.2959661963	t
2280	0101000020E61000006148C34A44400F40F22919036DD44540	16	9	2019-02-15	76418	67664.4437960502	t
2281	0101000020E6100000B31F02FBE9480F4054B07C781ECD4540	47	4	2015-07-09	59716	9795.37082924222	t
2282	0101000020E6100000E40C7362F3570F405794FD4A29D54540	67	9	2025-01-23	4170	23180.1262386512	f
2283	0101000020E6100000F989A0DD65450F400111B064E9CB4540	79	10	2019-05-19	919	40671.6638044105	t
2284	0101000020E610000040C9CBC8FDEB0E40D3189F004FD44540	27	2	2013-10-14	37526	65069.6612299057	t
2285	0101000020E61000009C167106FD4E0F40D993874DB6CB4540	75	9	2024-07-22	49652	77401.4490487491	t
2286	0101000020E6100000C5F359139EFB0E40D08CB05DE9CA4540	22	9	2018-01-12	35786	40834.7417034271	t
2287	0101000020E6100000BAF91EA6C8F40E4068AE134FF7D34540	60	2	2012-02-27	73031	43316.4121755617	f
2288	0101000020E6100000A4D6C1AF0D300F40ECC164213FC84540	16	2	2019-06-10	15743	32797.5296027524	f
2289	0101000020E6100000BF9D130231100F40C6CA0DF6AAC84540	41	6	2013-01-17	34884	64120.9051651134	t
2290	0101000020E6100000BBE9C5027E7B0F40AB08F18D18CC4540	97	9	2012-02-20	52450	36127.1161191453	f
2291	0101000020E61000001E95DD045B390F40308F6FE957D04540	34	10	2018-07-25	56516	44733.3344855176	t
2292	0101000020E6100000D467DE25D9860E40273CD42BBECB4540	59	3	2011-12-18	19456	7714.29809447373	t
2293	0101000020E6100000B99C6DB3DA250F40FDBAF94D19D24540	44	4	2012-08-25	78032	12864.5334286493	f
2294	0101000020E610000006CF1F063CB60E40C92D234894D44540	34	1	2012-07-01	14884	12293.3537170309	f
2295	0101000020E6100000515190A496710F40542180E5CCCE4540	53	10	2019-11-06	96129	89913.6469066746	t
2296	0101000020E6100000DE59CD917E750F40AA32D98D85CA4540	85	9	2025-07-29	71396	79652.5872245497	t
2297	0101000020E6100000A9E8E7F10E2E0F40210591D712D04540	9	6	2018-09-19	92766	33003.0493646629	f
2298	0101000020E6100000F8211BA7D20C0F40FC50052AE2CC4540	70	1	2019-09-18	66655	64724.3230391218	f
2299	0101000020E61000004CB4D6906B200F40CFF9E4A5A4C84540	49	8	2024-05-07	89953	57004.3209141357	t
2300	0101000020E6100000FBD1FB48F57A0F40118EFDE21AD04540	63	3	2024-10-07	1134	32683.5398600913	t
2301	0101000020E6100000653F499C977A0E40E64D503D74D44540	3	3	2023-03-05	99027	33750.1571400528	t
2302	0101000020E6100000CB04064478790F409E2E87D72CCE4540	3	2	2017-07-25	68091	99096.999166113	t
2303	0101000020E610000075ECC506E15E0F400CE06267A2D04540	2	8	2024-04-26	19049	54434.8974369847	t
2304	0101000020E61000003AE24A1862940F40E487465D3DC84540	68	7	2021-05-24	64835	70484.886950331	t
2305	0101000020E6100000444FE49BA89A0E4066811EB703CB4540	67	1	2024-09-09	32858	40987.7529784397	t
2306	0101000020E6100000E476790C65530F400480A0E160CF4540	46	3	2013-09-10	60061	57076.0252781291	t
2307	0101000020E61000009DF6180E34730F40BCF85A5487CE4540	12	6	2016-08-06	18473	77108.1523098285	t
2308	0101000020E610000037BCE0FC42270F407D46AC5EE3C94540	70	4	2020-12-28	91624	52942.0721796698	t
2309	0101000020E610000021A2540D41020F405BE9010EFDCE4540	80	5	2017-12-30	19437	58645.5378316468	t
2310	0101000020E6100000BC43694986AE0F406F43B00FAACE4540	29	9	2014-06-26	53870	38693.7628015226	t
2311	0101000020E61000005CC45B42347C0F4063A963B5DDCB4540	78	4	2020-10-15	39007	56210.6524357534	f
2312	0101000020E61000001E492BC335380F40CB8A642938D04540	96	2	2012-07-01	13707	84033.7601121789	f
2313	0101000020E610000060DA1EBB15000F408D7121F912D14540	84	2	2025-03-10	40923	42685.4802341383	t
2314	0101000020E610000022A12FA5660A0F40386CDCB9ECCA4540	44	6	2025-02-10	3260	17885.0892960299	t
2315	0101000020E6100000EFCAFE8369260F4049EBA8B1B1D14540	87	1	2011-06-29	9393	61551.5831506096	t
2316	0101000020E61000000DF360D67A890F4059BCE13B69D44540	89	6	2017-05-06	98545	72776.8749153537	f
2317	0101000020E6100000391D66CFA4D70E400F7C093917D24540	78	10	2025-11-22	42770	2791.73625687739	f
2318	0101000020E61000002C0CD0D5688B0E40ED7A477F5ED34540	12	10	2016-10-23	19424	36993.9619229688	f
2319	0101000020E6100000AA63FDAE77620E4073F3155CC4C84540	12	7	2019-04-16	59482	10118.5789310456	f
2320	0101000020E6100000FA6FBD67033E0F40CFE925D75AD44540	12	4	2014-08-16	17039	17183.5036700791	f
2321	0101000020E61000003306DC778E310F400A2E9FDB67C84540	54	8	2025-09-18	74357	63599.5652268237	f
2322	0101000020E61000006A7B32F2ADF90E401122637E78C94540	46	4	2011-09-10	11705	38227.3438249624	t
2323	0101000020E6100000A55DEDCA2F800F4032C604D5BCD14540	98	1	2018-08-13	39748	79674.4670487323	f
2324	0101000020E61000009CE134B76D390F40DBE284739CCF4540	54	8	2010-12-28	83528	37456.8573952768	t
2325	0101000020E6100000CB61294AEF060F40C4A201C6F4D04540	66	9	2010-12-30	32887	28157.0521396625	f
2326	0101000020E610000040D3A74BFC5A0F4046D93504C5D34540	99	6	2012-07-26	4119	84203.7182816463	t
2327	0101000020E610000062C2BB3935950E40076769D8B7D14540	85	6	2021-06-16	62552	71195.584110548	t
2328	0101000020E6100000CD965FFD410E0F40372A9BEB32CF4540	86	2	2022-12-03	38445	86558.8354477792	t
2329	0101000020E6100000A633C4DBAC990E401C7B8DA370CE4540	70	4	2018-02-15	64645	13202.8237464388	t
2330	0101000020E6100000D355F3F4366A0E40E79845212DD04540	41	3	2021-06-15	66710	7852.06029213814	t
2331	0101000020E6100000E1781327947A0F40A8047A9ACAD44540	44	3	2012-03-06	63658	88740.1867515431	f
2332	0101000020E6100000092A83B302DD0E40B235E947B3CE4540	6	3	2010-01-27	49060	36733.2126477113	t
2333	0101000020E61000003F50F9A46E440F4059327DCBD5C84540	73	1	2023-11-14	51625	46423.2323771879	t
2334	0101000020E6100000452A9AFBFE490F4036D0216B1CD54540	36	9	2018-08-21	29693	82808.3504088512	f
2335	0101000020E6100000627EF91F162A0F405D8827EA6ACF4540	1	3	2025-11-21	98514	25514.3518466436	t
2336	0101000020E610000057C4BB6B39A50F409308315CCBD04540	66	9	2013-08-04	86127	16964.7298842572	f
2337	0101000020E6100000A3AAABB07BEB0E40AA24E1AC71CB4540	4	5	2024-03-10	80817	73633.8233611636	t
2338	0101000020E6100000DC599DB6C4770F40BC74DE569BC74540	79	4	2023-03-25	88618	40069.4561512932	t
2339	0101000020E6100000B4272FA71AC80E40BE9AD8E409CC4540	72	1	2024-06-18	75626	71095.4192258886	f
2340	0101000020E610000062EE622F56700F40E9E2562CE0C84540	66	7	2025-07-28	53118	93670.4266839697	t
2341	0101000020E6100000E113EE68E5A80E40B17DAAEEA8D14540	15	7	2024-04-02	9797	43232.4800933944	t
2342	0101000020E6100000CEB86895117F0E4052142A28E0D34540	99	2	2024-09-30	41928	26770.6890624545	t
2343	0101000020E6100000DD9417FF50930F405C43DABD02CD4540	73	2	2011-12-26	78546	19371.2239827524	f
2344	0101000020E61000002233ADA9F78E0E408CC9F59559CA4540	53	9	2024-08-18	1037	84449.4731817001	t
2345	0101000020E61000006925F3AE93DD0E40A0D33EF126CE4540	52	9	2019-11-20	25991	31455.4342249185	f
2346	0101000020E61000008C0EF19AAD1D0F40429E428BCFCD4540	7	6	2022-07-02	68136	5707.26019307362	f
2347	0101000020E6100000C20C6F266B2B0F40B6D2AE7EF2CA4540	56	3	2016-03-18	60745	27532.808993897	f
2348	0101000020E6100000C0B1CF8CBD500F40F6C2C30628D44540	23	4	2013-04-17	24719	36270.3303316135	t
2349	0101000020E6100000A74F40C7675F0F409CA1019C8CCD4540	51	5	2023-04-25	88164	72491.248511458	f
2350	0101000020E6100000B0D0FFE266230F406C6F26892DD44540	81	8	2011-01-10	13121	19800.1305105355	t
2351	0101000020E6100000AB4C110B060D0F40C1E570083ED24540	69	6	2020-06-18	55844	88435.3924188984	t
2352	0101000020E6100000C403215D89000F40A7D206FDB3CD4540	79	9	2012-04-07	39168	89489.2925352264	f
2353	0101000020E610000047D23551AF270F4093F8EF545EC94540	83	1	2022-11-19	62784	27903.6159018549	f
2354	0101000020E6100000DC8F4BE469790F40978B989873CF4540	23	9	2020-04-30	70760	48624.0542941846	f
2355	0101000020E610000087247D782D950E40E07FAAFE82D44540	18	8	2016-11-07	38610	52611.0462921082	t
2356	0101000020E61000002DD8A1D570E90E4094816F3D60CD4540	74	3	2013-01-24	43131	91319.844033371	t
2357	0101000020E6100000694EA6C83D610F409E9710E936CE4540	67	1	2012-07-15	55837	81862.3883196347	f
2358	0101000020E6100000D5E2A6523BDD0E40A6947D4805D14540	82	4	2012-03-05	49439	23763.5528316555	t
2359	0101000020E6100000901A5F36AC900F400A5ADBA3C5CB4540	7	10	2025-11-21	76578	46141.0976729329	f
2360	0101000020E61000000677804843C70E4021F5C6A58CC84540	52	4	2014-12-08	15296	89693.6186154056	t
2361	0101000020E61000007DB2AB186CAB0F40F19E4D4908CD4540	46	3	2024-03-27	30090	54113.4242168543	t
2362	0101000020E6100000626C1C1C0E280F407A70FDBC5BCB4540	58	10	2021-02-16	43599	26152.2717360672	f
2363	0101000020E610000013488BE75FA80F40C50079BAC9C74540	91	5	2018-08-01	61375	3745.73158280693	t
2364	0101000020E6100000F764555188770E4027D1AC1E0CD44540	77	10	2021-05-12	96434	95865.2981791314	f
2365	0101000020E61000007A00AD1F6D3B0F40E8D62408F3CE4540	95	9	2014-04-21	96375	30685.7519053046	t
2366	0101000020E6100000ACCAD715BF060F40669522D31DC94540	62	8	2019-03-21	13400	28983.4920359909	f
2367	0101000020E6100000466ABF732BA00F407211BA7321C94540	67	4	2025-02-04	14284	70212.3048940522	f
2368	0101000020E61000008CFC20336D070F401AADF007BFCB4540	7	7	2022-04-26	90812	26543.4391872347	t
2369	0101000020E610000024DD923B72250F402F750242C4D04540	7	6	2019-08-07	83031	60404.21256452	t
2370	0101000020E610000008AB91A75B6D0F404992866823D24540	89	9	2023-02-13	38702	8517.06737446105	f
2371	0101000020E610000079AED46544A30F40102D7CA748C84540	80	2	2010-05-12	71851	39684.002998733	t
2372	0101000020E61000008E9E6B9CE78D0F40FABCEE83C9CF4540	14	2	2025-08-14	25115	84434.1039127061	t
2373	0101000020E6100000C310F6A086630E40A019F7394BC84540	60	10	2022-10-05	62060	75965.8305709695	f
2374	0101000020E61000006861A7F6133C0F406215682BDACA4540	70	4	2023-08-27	56692	65998.832536873	t
2375	0101000020E61000008A680E8717A20E401A8CDBDBEAD14540	63	10	2019-07-11	85372	15641.2259239762	t
2376	0101000020E61000009440135AB5EF0E409C05FA81FAC84540	18	3	2010-01-17	85746	44513.1286623744	f
2377	0101000020E61000004795CCE55C5B0F40E553625D8FD24540	55	4	2025-10-06	30591	28010.490119735	t
2378	0101000020E610000052EBC79EF8970F401775FD35BDD34540	93	8	2015-12-11	68507	1690.3769132856	f
2379	0101000020E6100000321EECBC937F0F4014E992235CCA4540	48	3	2014-01-03	52281	60363.521659668	t
2380	0101000020E6100000AB32734B6A240F409030703619CA4540	45	5	2025-10-24	70135	43755.149792769	t
2381	0101000020E610000054F1D5D4D2390F40492296E0E3CD4540	16	4	2011-10-13	26879	1418.29689412902	t
2382	0101000020E61000006AD47C3378E00E400D5D7C5B1FCC4540	76	10	2010-05-04	10425	74502.2072143681	f
2383	0101000020E610000035216A4D9CF10E404784FE546AD44540	72	7	2017-01-23	4675	25812.6375980058	t
2384	0101000020E61000000B82CF5133880F408982EB1606D04540	71	10	2015-12-04	54496	1463.40569703884	t
2385	0101000020E6100000B5B6ECAC4D170F40A0D9A05A5BD54540	86	9	2015-07-12	17552	75827.6959102209	f
2386	0101000020E6100000F9D05A5BA0510F40E6D73CC74BCC4540	8	4	2025-04-28	3099	97635.796211007	t
2387	0101000020E61000003776603E7FCE0E408613DF4C9AD34540	8	8	2018-03-14	6130	22614.2899484771	t
2388	0101000020E6100000771FF320A99D0E40FF1887B1F7C74540	65	5	2021-02-20	21382	63670.4552287449	t
2389	0101000020E61000009B3AE66E57600F40512825D197D24540	27	8	2015-02-28	64315	43448.9389535291	t
2390	0101000020E61000007E895A148FBA0E403BFC0034EFD24540	87	7	2017-05-15	14501	14845.4913305031	f
2391	0101000020E6100000976B3BC3F9BF0E40BA0D19C58ACD4540	27	5	2024-11-27	5602	54462.5880993198	t
2392	0101000020E6100000A15DA0B53B180F406A9CE0BD1ED04540	40	9	2020-02-13	85692	22074.5922754659	t
2393	0101000020E610000074023BF45A6C0E40128054FA27CB4540	90	9	2018-04-21	95484	32752.9064929957	t
2394	0101000020E6100000778240E2D89C0E402A96B64B3DD24540	73	7	2022-04-07	14519	61021.9540838879	t
2395	0101000020E61000000407F610C9AB0E4095FB94626CD04540	47	9	2010-01-13	24317	13439.6695792845	t
2396	0101000020E6100000FBE0D8CF3E600F4075BD2BF487CB4540	16	6	2023-09-30	4628	13744.0320443983	t
2397	0101000020E6100000CDCE0E6318BB0E401EE972B4C8CD4540	96	3	2025-02-16	36258	48656.9003343022	t
2398	0101000020E61000001175CDF48F030F406BB07D2759C84540	88	9	2016-03-11	3439	67161.9930499791	t
2399	0101000020E6100000E4C8307C57650F405B62DDAE17D34540	22	10	2015-05-17	37741	97628.6083151958	t
2400	0101000020E6100000E69283609A2E0F40FCEB0979A5C74540	56	5	2022-04-04	87155	4150.89670454505	t
2401	0101000020E610000080A6404372E10E40CF9CFA3529CA4540	72	5	2013-01-17	86352	87210.4135555791	f
2402	0101000020E61000001AAA3408CF510F405B71CF3F99CC4540	90	2	2015-04-28	40544	51811.370637926	t
2403	0101000020E61000002BA06CF92E680E402060B4E0A2CB4540	48	9	2015-01-21	84514	19615.1308665097	f
2404	0101000020E610000038D3EF8842900F40AF7F1B64B5CA4540	23	1	2019-02-20	41612	11814.1982370511	t
2405	0101000020E61000001DDD86A952430F404AACDE60DBCF4540	6	7	2017-09-11	47926	38780.5336599672	f
2406	0101000020E610000082451DD290170F4062B89BBF49CB4540	26	10	2011-12-10	12642	27175.489564796	t
2407	0101000020E610000083A20D17874E0F40C8C492B1F6CF4540	36	9	2016-09-05	53448	1329.81523147351	f
2408	0101000020E6100000FE5094CE9E860E40B7DBDF8863CF4540	44	1	2021-03-27	40733	77556.7572987576	f
2409	0101000020E610000004E99EF459AB0E4089095FA00FCD4540	18	2	2024-01-24	28687	29123.7807683032	t
2410	0101000020E61000004E4D2C87196C0F40A57F0C8A32D14540	1	7	2025-12-21	84360	93493.9787172031	f
2411	0101000020E6100000522248FEA8E30E409307D93AFDCC4540	13	7	2014-09-06	54222	3839.01086769447	t
2412	0101000020E61000000E91282004840F409E11BC0592D14540	75	8	2011-06-23	28940	68031.9532015317	t
2413	0101000020E610000004F6ED8DE8A80F402940685248D44540	17	9	2013-01-09	7070	14735.2354277371	t
2414	0101000020E6100000FBC545333D990F409FA0743417CE4540	22	6	2023-07-26	8742	46502.2518378321	f
2415	0101000020E6100000962681FAAE980E400334D6D730CC4540	28	7	2017-12-30	41756	4030.97594716737	f
2416	0101000020E6100000E1C5979713A70E40420FD66F4EC94540	78	4	2017-03-24	43741	71390.8630892625	f
2417	0101000020E6100000A71BDE1A35A30E40B3B7EDD20CC84540	98	4	2025-06-30	9453	69400.0458350024	t
2418	0101000020E610000008C1B2C2EB470F40F964C9FBABCA4540	82	2	2013-05-01	9216	17654.1681532572	t
2419	0101000020E6100000BCF76B7C82860F402C0E156B61CE4540	12	10	2015-01-03	16753	34312.7291556059	f
2420	0101000020E610000013D0A07889D40E407850A3447ACB4540	57	4	2011-11-11	50643	76437.552962184	f
2421	0101000020E6100000B6CFAA7CF72D0F4044A3947088CF4540	16	10	2013-01-18	29201	76539.5518544864	t
2422	0101000020E610000000531F9DDD4C0F40B6BBF8DADED04540	64	7	2016-07-05	21171	50432.8488677283	t
2423	0101000020E610000023CD0B9F872C0F404CC6E8B15DCD4540	77	8	2017-06-13	91923	92530.1220941511	f
2424	0101000020E6100000E3ACB72AAD0A0F4030E1996BCAD04540	57	3	2020-05-26	57173	54153.6617026368	t
2425	0101000020E610000092251BFDD2B30E403F376453B4CC4540	53	3	2011-09-15	99316	19401.6966980447	t
2426	0101000020E610000029FCD5FC6B030F4009424FF0AFCA4540	88	1	2020-10-22	82285	63141.4049433952	t
2427	0101000020E6100000119AD116EECD0E40137538D3F5CC4540	34	2	2016-05-30	96399	83574.600183934	t
2428	0101000020E6100000C60908F136F30E4085906C1C0CD04540	20	10	2022-10-30	10806	58930.430079847	t
2429	0101000020E6100000487CF26CBB850F4089165E61D8D24540	21	5	2010-09-20	94272	86778.2907260116	t
2430	0101000020E6100000C584BC37F9610F4040F8D1E5D8C84540	14	10	2014-05-25	65331	58288.6716639951	f
2431	0101000020E6100000043A92432A5C0F4074D876754DCE4540	91	8	2025-08-30	43539	58399.5003475616	t
2432	0101000020E6100000243F9E2622310F408C8F450BFCD04540	2	9	2013-09-16	98521	76994.3482012925	t
2433	0101000020E6100000379BF34E35400F400B95FC3CFFD14540	58	7	2023-05-29	64778	81455.2697762269	t
2434	0101000020E61000001BA81EAA48780E40E147878BD0C94540	81	3	2022-11-07	53242	88390.2254362875	f
2435	0101000020E61000007D6155AA246C0E406585CB7D07CD4540	18	10	2011-03-13	73859	80159.9334313376	t
2436	0101000020E6100000C20684B834CA0E40F16FDB96B3CC4540	49	2	2013-06-25	28394	82231.9616262873	t
2437	0101000020E6100000943811CEBA590F40720F30873BC84540	56	2	2020-11-24	45388	71753.2884316967	t
2438	0101000020E61000009275F52FC2490F40689A278E67C84540	80	5	2011-12-19	25422	83566.2361021356	t
2439	0101000020E61000001A19178D8CAF0E402411F56E51D34540	75	8	2025-01-18	52672	62625.5367446406	f
2440	0101000020E6100000DCB5932732A40E40C116F689DFD24540	26	4	2013-07-10	6853	61348.434826994	f
2441	0101000020E61000006ECDC03032510F40EF5CD892A6D24540	61	1	2023-08-10	17117	52100.1077215266	t
2442	0101000020E61000005DF3842E565C0F402E391F383CD34540	30	10	2023-02-02	53310	50405.8628949269	t
2443	0101000020E6100000D5E559E52FC60E40D43F81A3C1D34540	41	2	2022-02-21	54015	12359.6860233311	t
2444	0101000020E6100000F1109C3392E80E40FDE005CA9FCA4540	93	6	2018-08-05	49550	58323.271444757	t
2445	0101000020E6100000DF4FF537DFDA0E404B54167C69CD4540	53	10	2012-11-17	35076	51861.350293955	t
2446	0101000020E6100000AEA32A2F03360F4060ED775236D24540	93	2	2016-04-06	4829	1696.9278557406	t
2447	0101000020E610000049F6C4ED6D8E0F407520547926D34540	29	7	2018-08-04	57087	27885.7334102524	t
2448	0101000020E610000075F8762DF3C20E40938BEF9402CB4540	51	9	2022-07-14	1800	72107.9124409476	t
2449	0101000020E6100000D676C605DC5C0F40E19FC9AFCECC4540	98	6	2010-01-19	89689	50822.4883854086	t
2450	0101000020E61000007B810929CFFF0E4087D92022D8CB4540	69	8	2021-01-12	84164	31631.0685329569	t
2451	0101000020E6100000B32CD583A7D10E408AA3527CA3CD4540	21	7	2021-09-26	1720	10637.2151551799	t
2452	0101000020E6100000DF5EE5BFA3A20F4049121172F4CF4540	32	2	2024-08-29	98525	69571.1845109217	t
2453	0101000020E61000007D2143C495770F406F94BD2A8BCD4540	37	6	2025-02-17	13722	40219.9832128422	t
2454	0101000020E610000094B7CEFA8DEB0E407C52B59CB6D44540	10	6	2018-09-05	15070	42724.4430901818	t
2455	0101000020E61000004643AF5916540F406FC54F99D5CC4540	22	8	2022-02-25	11313	81354.1547881278	f
2456	0101000020E6100000D42F159376680F404A2B914594CF4540	97	3	2025-07-04	87429	54842.876690821	t
2457	0101000020E6100000B88B8D8856B10E40F6C9606A9AD04540	5	2	2019-09-08	69995	32207.1428298663	f
2458	0101000020E6100000B00480702A960F40D72AF660FACE4540	21	4	2016-08-27	4134	87932.8496929919	t
2459	0101000020E6100000C1D82CA577950F4091D876298BD04540	58	10	2025-11-16	57321	60728.525703079	f
2460	0101000020E61000000AFFE7F114500F40D17790DECCD44540	18	8	2019-01-15	27042	47791.1255438996	t
2461	0101000020E6100000624B235E55390F40D2F02A5DFEC74540	47	6	2019-11-01	46102	21176.5768012045	t
2462	0101000020E6100000564DB02EECB10E407E2CF0F9A2D34540	31	2	2017-08-13	35637	53021.9789742479	f
2463	0101000020E6100000FEB74E15027F0F406FF0FB9D8DCF4540	25	8	2015-02-22	37539	10237.3757321126	f
2464	0101000020E610000049900F9504500F40FE2DE08CE4CA4540	7	9	2010-11-08	86994	438.55063415692	f
2465	0101000020E61000006FEDB874766E0F404EB6155494C84540	69	1	2023-05-24	88899	39984.8527615497	f
2466	0101000020E61000009698318AE0810E40308277A49FD44540	94	7	2019-03-16	46123	44952.2774790649	t
2467	0101000020E6100000DCC92CF2D2800F40CE5F96A1A5D04540	77	7	2019-05-11	14368	24772.6415236152	f
2468	0101000020E6100000AF49089031730E401E31F22626CE4540	70	8	2018-02-20	91563	44939.2302073421	f
2469	0101000020E6100000BFF53C5CFE730F400EC86BBCDDC84540	55	5	2014-08-05	21169	52389.9198462896	f
2470	0101000020E6100000ED189DC4EB810E408ED5C240CACF4540	41	7	2012-03-23	26834	32322.9198552046	t
2471	0101000020E6100000102719EF600F0F403041F3B42ECC4540	63	5	2015-04-24	82939	26860.3794932395	f
2472	0101000020E6100000248502A3BAB00F406045FA1BABD04540	38	7	2016-08-10	10698	48411.1973568281	t
2473	0101000020E6100000C6AA37E38A8B0E40E1FB2AF501CC4540	57	4	2018-07-28	21393	79804.8437499135	t
2474	0101000020E610000056475397E5E80E40DB9EB8C5F2C94540	94	1	2010-07-25	79041	19466.2889681951	t
2475	0101000020E6100000CC23AD060A670E40EB9EDA932DCC4540	70	6	2020-10-12	93400	45586.9856376975	f
2476	0101000020E6100000655B20B253EB0E40CACDD1FED0CD4540	63	6	2016-01-01	57303	81822.7221356507	t
2477	0101000020E6100000ED6C2B14411F0F403E0B69660DCA4540	32	5	2017-05-22	66288	89771.7905898389	f
2478	0101000020E610000092D45320BE720F40C11D803AACCD4540	26	8	2022-02-08	38297	92722.554253439	t
2479	0101000020E61000003EBE40D728840E40ADB557177ACE4540	73	7	2013-08-28	69493	27104.8047170504	t
2480	0101000020E610000073FE5B2E57980E40372D63D1DCCB4540	15	5	2015-07-26	33065	91928.9545881842	f
2481	0101000020E6100000E9C73799BAEF0E404DC87BBF4DCF4540	92	2	2023-06-08	83230	22941.8332700811	t
2482	0101000020E61000003E27F1A15CD50E400A3275BD02D04540	18	6	2016-07-01	57523	68494.4113778427	t
2483	0101000020E61000001E480AE881A90E40F6E4A1586DCC4540	83	4	2024-05-10	92764	28771.3433448346	f
2484	0101000020E6100000011E7EAB73700E40E1F7C973DACA4540	11	9	2012-03-04	64798	34234.2706965774	t
2485	0101000020E6100000B15B85C1289D0E408A09C79C63D04540	20	1	2010-10-29	33556	93941.8101419152	t
2486	0101000020E61000004DB32E7F19F30E40F9CD0879F7CB4540	69	1	2016-11-08	70361	16632.7695014642	t
2487	0101000020E61000004CE2D15D60330F40B4A9FA6390CE4540	37	1	2014-11-23	76146	70810.581909046	f
2488	0101000020E6100000D5FDF8BC9CE70E40AE0945DA95C94540	37	5	2019-01-13	69126	48556.4341553494	f
2489	0101000020E610000061FDF25590390F40A34BA388B4C74540	89	4	2021-01-27	17542	7989.92110834944	t
2490	0101000020E61000000B9E98898C4D0F407AE3BE6508C94540	7	6	2010-02-14	72614	44526.5476620505	t
2491	0101000020E610000015B90AEC3F960E400DB138AF12C94540	24	4	2022-12-09	93870	46488.5235681262	f
2492	0101000020E6100000A7523354E1830E4048794CA0E1D04540	95	5	2011-11-22	81567	67490.8464538517	f
2493	0101000020E61000001656D4A378AE0F4021980F15B7CB4540	67	3	2017-01-16	90268	95740.1798943432	t
2494	0101000020E610000006E37C77DF770E407FACCED16ED04540	80	2	2016-12-10	28643	72655.3718965653	f
2495	0101000020E6100000065E539657960F401E9B020FFCD34540	4	4	2010-03-22	99318	3062.93266081159	t
2496	0101000020E61000003CC173933B470F40E808F84153D14540	63	8	2022-09-28	72109	77209.4761432133	f
2497	0101000020E61000005972712CD9820F403C05DA25ECC84540	44	8	2013-10-07	25699	30171.3031491784	t
2498	0101000020E6100000273BB8F8803C0F40DA7C08BA44D24540	32	7	2019-07-03	6059	54856.2860801487	f
2499	0101000020E6100000DDA19A1A1E7A0F4088A91FBE55CC4540	63	2	2019-03-23	60322	42476.3808209476	t
2500	0101000020E6100000612A7B3A3E4F0F40278F873B67D04540	22	2	2011-09-26	47131	1959.92628029993	f
2501	0101000020E6100000CD1211EF8E7D0E4052FE137830CB4540	23	9	2021-03-11	9837	85982.4574261559	t
2502	0101000020E6100000A7E86E57285E0F40A1E3A02FF1CF4540	92	8	2013-08-13	58455	21584.3819394893	t
2503	0101000020E61000007BB605A800D40E40F0CF81A654CD4540	30	8	2013-12-17	28244	10921.0413588354	f
2504	0101000020E6100000943B8501DFD10E40D6F3CD59F6D04540	39	2	2022-10-28	26729	88537.9853643763	f
2505	0101000020E6100000B501B3DD58890F4072529DC04AC84540	53	4	2019-04-15	14941	1109.38342745641	t
2506	0101000020E6100000279EF0E95A430F40C70E42528BCC4540	88	5	2019-09-30	10842	17489.105577479	f
2507	0101000020E61000000C1BAD7100610F40B936265BF0CC4540	74	3	2024-10-26	47612	68495.5030481539	f
2508	0101000020E610000054F3F58258970F40191065BB4DCC4540	50	9	2014-06-18	77910	69992.8231158088	t
2509	0101000020E6100000555AE6F552260F40BCA87B7F06D14540	67	2	2020-04-27	20136	78290.9471498616	t
2510	0101000020E6100000FC3C1ACBBBA40E405D923A9463D54540	11	6	2022-07-25	17864	66686.1636055292	t
2511	0101000020E61000002D65D3DB33B10F40FBF2D16188D04540	99	6	2012-03-01	42769	37302.4829245888	f
2512	0101000020E61000001584DD8E93650F4038924D91CCD34540	44	6	2024-12-23	65581	73209.5783955587	t
2513	0101000020E6100000193E53F5740F0F400F1EE4685BC84540	18	8	2015-04-14	4177	94530.5156540883	t
2514	0101000020E6100000AF0C89DF44950E4061E4A7E48BCF4540	1	7	2019-07-10	46284	97534.9733837299	t
2515	0101000020E610000039352E1ED9140F40DD901FC2CAC84540	21	7	2019-08-14	3151	43398.5414875832	t
2516	0101000020E610000048FBA53A26AE0E40292D87D921D34540	63	4	2014-02-11	87893	63764.4884241929	f
2517	0101000020E6100000F812EC86CB840E4041D6DDC134CA4540	45	7	2015-12-29	40807	77487.1011426429	f
2518	0101000020E6100000B9F74D7C421F0F40DA8BE71970D14540	68	3	2014-12-28	49415	67773.8874947404	t
2519	0101000020E6100000B1778D80B25D0F4041C2CAA386C84540	64	9	2013-04-07	16738	34350.3399542033	f
2520	0101000020E6100000C2E4385C43BC0E40622202AE17D14540	17	10	2021-03-14	96229	77688.1520327692	t
2521	0101000020E6100000F583CED56B920E40A7D550CBEDCB4540	35	4	2013-09-10	59279	94443.8421728735	f
2522	0101000020E61000006012EEDF90C10E40BD69E538CFD34540	22	4	2017-02-09	85568	27886.2043238817	t
2523	0101000020E610000006291025D0520F4045F6B2AAAECD4540	30	2	2024-06-14	15401	97189.788558649	t
2524	0101000020E610000050E1A296CB3B0F40C456426E8CCC4540	20	1	2020-12-10	49938	90619.0924524991	f
2525	0101000020E6100000E6B193F2CCAF0F40018D48C262D34540	91	7	2018-03-07	60702	9803.47767112777	t
2526	0101000020E6100000CBA6EFADA69A0F4050F7213CFDD04540	53	2	2017-05-24	66550	58460.7142503627	f
2527	0101000020E610000036FD7584F3250F40B7A9789024C94540	27	2	2014-12-13	48883	5874.29314068961	f
2528	0101000020E6100000CB8B1E5C4AAE0E40E694C1E9EFC74540	63	4	2016-12-14	46117	52186.2212471185	f
2529	0101000020E610000083B7724C8B860E4099496E46D4D24540	73	7	2022-04-09	67911	36531.5165969186	t
2530	0101000020E6100000B22166B4FA090F403210F736A9CD4540	81	2	2011-02-10	55677	56227.3045526965	t
2531	0101000020E6100000BB22F651F8600F40477D8C4706CF4540	89	7	2021-05-21	41886	51922.793387989	t
2532	0101000020E61000004178F58927A70E40DC08144886CC4540	34	3	2017-08-28	45626	15912.6701250214	t
2533	0101000020E61000000AE28F47DEA50F404A66BBF258C84540	10	3	2012-03-23	49458	79680.9074481068	t
2534	0101000020E61000002E0D7174931C0F40F8662E67BDC94540	32	6	2019-05-23	27513	23244.0106754334	t
2535	0101000020E6100000C80439DFA7020F4044082276BBC74540	72	5	2016-01-24	71454	29611.6867623126	t
2536	0101000020E610000024CDDCEE10670F40F2DC8C02E0D24540	88	6	2019-01-25	68487	16146.9265639283	f
2537	0101000020E610000035EDD90CD9990E40FF6072253DCE4540	83	1	2017-02-14	21107	91398.4108166957	t
2538	0101000020E61000006CCA5A74ED700F409198B48377D24540	27	10	2022-07-27	58294	13678.4757174218	t
2539	0101000020E61000009588A53A628F0E4086BF6C7A74D14540	74	2	2021-10-25	86626	77378.7948879887	t
2540	0101000020E6100000DEA70BF9FDBC0E407BDAD42338D04540	78	4	2017-08-14	64589	25738.6814568984	f
2541	0101000020E6100000197786838A680E40EE84F72D4DD24540	58	8	2017-05-29	76772	66311.9414031884	f
2542	0101000020E6100000225C13D664AD0E40EB431D4EF1D34540	11	7	2025-06-26	5513	13947.8328117569	t
2543	0101000020E6100000A9B7E0B354510F40FD39C8C7ACCE4540	9	4	2015-04-12	50240	14725.0881837667	t
2544	0101000020E6100000BD643D7625A50E40867FA7EC32CC4540	39	10	2019-10-12	11626	96793.0984699226	f
2545	0101000020E6100000FC3CF0313C740F403A5FD50333CA4540	12	7	2023-03-12	49368	61736.2599043395	f
2546	0101000020E6100000201FF84203360F40D9149AE9BACF4540	30	4	2017-04-13	3615	96406.2767807233	t
2547	0101000020E61000006DFC059F567B0F404FD622363FCA4540	45	1	2016-01-12	25149	75545.4555444218	t
2548	0101000020E61000008CFF9055A45B0F403062E268C0CB4540	32	8	2022-10-18	37781	65208.8480933366	t
2549	0101000020E61000000E3097D2D9320F40CE245C8BFBC74540	30	5	2021-06-29	24367	29116.2372706596	f
2550	0101000020E6100000F14767F913A50E40B67AFCCC95D34540	65	6	2012-03-04	97589	41084.4791602734	t
2551	0101000020E61000001F2C5DB3E8840F40E6EB10F9C8C74540	30	5	2013-02-05	32127	45605.9993109691	f
2552	0101000020E6100000D5E7CE8C49D60E40112A70B93AD44540	80	6	2012-12-28	47606	49473.2918091008	t
2553	0101000020E61000000551E0F3B88D0E40C6B1B6AB5EC94540	49	6	2019-09-06	42524	16081.6968132574	t
2554	0101000020E6100000A8F2DAEB58A70F40AA63729AAFC84540	99	9	2022-11-04	31340	31384.3176056107	t
2555	0101000020E610000095ABF93B4D060F40F1F31C57B8D24540	1	9	2024-01-21	37041	76017.3230032829	t
2556	0101000020E61000003E62383817E90E4025BB1A2C6BD04540	8	8	2016-04-29	17604	91551.1933213906	t
2557	0101000020E6100000B4104793E39F0F401807271F35CB4540	22	6	2014-05-24	44275	31763.5868089523	f
2558	0101000020E6100000C60B51CE9C830F404B6212D83ED34540	95	3	2025-03-09	6456	71298.6030694049	f
2559	0101000020E61000001A642FDD7D7C0E40A839CBBCA4C84540	29	3	2025-09-23	99631	92566.1064617252	f
2560	0101000020E61000000602EB9713380F40AA8C1F3D32CA4540	87	3	2016-08-10	37486	4051.31632794142	f
2561	0101000020E6100000232C8B03632E0F409299583EBED34540	90	6	2010-02-17	96131	41786.2887018432	t
2562	0101000020E6100000CABD281BAB9A0E402F2198FA6BD14540	87	10	2014-09-05	10285	35480.8660436591	t
2563	0101000020E61000008087E48D8D800F404E267DAE8CCF4540	83	3	2019-10-08	26792	67418.8923066077	f
2564	0101000020E6100000740674BCEBB70E407FA6CEAB2ED44540	55	6	2014-11-17	92687	96925.9635513633	t
2565	0101000020E61000001E0F9B6F66330F4099087AF38CCA4540	90	8	2025-06-29	37108	53318.8415882696	t
2566	0101000020E6100000E47A334BC2960E402DDE41FE4ACA4540	79	7	2013-01-16	70754	79927.3738962007	t
2567	0101000020E610000042873082B1AD0F404F2274F4F2D44540	62	2	2016-08-20	3253	72733.3623336196	f
2568	0101000020E6100000BCCAE8D9F39D0F400591DB5C99C94540	35	6	2015-11-22	81519	11801.9024439356	f
2569	0101000020E610000080EF1C5449CF0E40849929C70DD54540	3	10	2024-12-18	76655	87651.2241351386	t
2570	0101000020E610000086E7E8763E770F4056920C1A98D14540	19	3	2011-02-22	32881	64230.3442979085	t
2571	0101000020E610000010C695577A8B0F409AE45E0917CB4540	41	1	2016-05-31	46965	81582.9964802302	t
2572	0101000020E61000007F09B6062A6F0E403F6FD94485D04540	29	10	2012-10-23	49432	12903.260326413	t
2573	0101000020E61000008BF25764CED00E40EDEFD85655CF4540	7	5	2014-09-30	91150	86174.3580580391	f
2574	0101000020E6100000E1339A17A7210F40E845438EEECC4540	56	2	2010-05-19	58714	5059.11296848922	t
2575	0101000020E6100000F134FAAD16CD0E404C5640A723D14540	22	3	2019-10-28	65595	63436.8011917179	t
2576	0101000020E610000036FC93B949690E40D247B5DB76CD4540	12	7	2025-03-26	91758	26860.870464146	t
2577	0101000020E6100000E6A1FCB060E50E40B19C4CCEF6CA4540	73	3	2010-02-23	62597	46008.7518730047	t
2578	0101000020E610000034D16A9790DF0E4095EC106A08D54540	12	9	2021-07-17	12603	11132.784413534	t
2579	0101000020E61000005A80992D3E720F40208796D740CF4540	51	6	2015-06-25	44308	72134.6196068958	t
2580	0101000020E61000002AA1678AF71D0F4066891EDF74CB4540	35	3	2012-10-06	30308	25238.0668642617	t
2581	0101000020E6100000BA3E639993A60E405BD3A264CCC84540	16	9	2023-05-03	20996	44432.3487794662	t
2582	0101000020E6100000C123BC326B970F40F0AC533FF5CA4540	45	3	2024-09-19	52002	91247.9044320874	t
2583	0101000020E6100000FF36752F11620F409D647437C5CC4540	85	3	2023-01-21	63957	21300.7733810414	t
2584	0101000020E6100000E67AE8F1F06C0E40492C2612B2C84540	49	4	2017-05-07	54839	2366.37810882334	t
2585	0101000020E610000028E81B444A770E40F006DFE975C94540	58	1	2012-06-04	24373	52006.4050006231	t
2586	0101000020E6100000B3FE2F325E9D0F404F33B5BD98D34540	87	4	2018-09-13	86510	1008.21205854342	t
2587	0101000020E61000005F663C9FBF740F407C81EEDED7CD4540	21	8	2011-08-16	29904	99299.1266847465	t
2588	0101000020E6100000BF2DCA8671AF0E408F69E2EFC4CE4540	63	10	2017-11-09	13133	83055.8029921532	f
2589	0101000020E61000006D351F2C9A3F0F404F384AD06CD34540	93	9	2011-03-15	60563	89996.9711685272	t
2590	0101000020E6100000A685CE2ECA420F4076B018D590D04540	90	10	2020-05-20	84774	60064.8025528501	f
2591	0101000020E6100000FDC43D9388AA0F406305D5DBF8CD4540	11	4	2011-12-04	79479	48663.5885492553	t
2592	0101000020E61000005837965414A00E405904A30D1ECE4540	13	3	2024-10-01	35014	73256.3442660383	f
2593	0101000020E61000005FF8FA18987F0E40E6E2C647A1C94540	21	1	2025-06-19	57308	70562.9990132868	t
2594	0101000020E610000077573FEB581A0F40385743C903D54540	83	2	2023-01-20	15899	56710.9686425905	t
2595	0101000020E6100000A197AE8565940E4017DAB216AAD34540	3	8	2017-02-19	9316	89158.7221498266	f
2596	0101000020E6100000D55EE04A23750E40C32592AA05D34540	28	3	2012-01-01	19889	77836.9417778042	t
2597	0101000020E61000002E75C590EAE70E408822C50602D44540	83	6	2019-09-05	26070	10134.7798848308	f
2598	0101000020E610000056DC03D901720F40FC23213FF3D34540	92	10	2017-07-23	2620	80193.8103895442	t
2599	0101000020E61000009B691A42E08C0F406BE16C73DECA4540	50	9	2024-05-01	67931	39948.4879329999	f
2600	0101000020E6100000A073CDD7665D0F409C54BC245DD24540	29	9	2023-12-27	62332	64309.0575132217	f
2601	0101000020E6100000E8DC43C27F800F40D73855EF61CD4540	59	7	2023-11-25	18417	63762.4845511984	f
2602	0101000020E61000001F1742D415C90E40AD4FE9E239D54540	15	5	2017-02-13	49331	89576.1693887422	t
2603	0101000020E61000004587513EA73F0F40A61EC27EFAC74540	49	3	2020-12-17	20980	72692.9080865071	t
2604	0101000020E6100000FC06FF42300C0F40D7F10F7AB9C84540	43	4	2020-08-04	22483	17016.2884210033	t
2605	0101000020E6100000F13E8B06A2360F4085A2019312CB4540	53	1	2014-09-25	47899	69688.6999469301	f
2606	0101000020E6100000E800F8C231740F403F8DC206FCC94540	21	10	2018-10-31	88027	17496.0635105706	t
2607	0101000020E6100000B723C3F07C7B0E4052D2385C48D14540	21	2	2013-04-04	42364	7358.86724864421	t
2608	0101000020E6100000E213381CA78D0E40227C139BAFC94540	69	1	2017-06-05	57975	81192.0010633903	t
2609	0101000020E61000005D67A2D9F6D40E40DB4403F0EBCB4540	79	9	2012-01-29	24140	71666.5330343637	f
2610	0101000020E6100000FE82B2A717920F402E1CBC5B7BD14540	20	2	2022-11-03	45015	67176.6703566827	t
2611	0101000020E6100000247E58A92ED10E40784A634D34CA4540	38	5	2011-11-15	5386	45916.49503005	t
2612	0101000020E610000020A5735692480F40C065FE973ECA4540	56	4	2022-05-25	11121	37361.6558606478	f
2613	0101000020E6100000DD538F6B0C2D0F40959EB3D7D6CC4540	31	4	2017-10-08	72395	65088.5479209286	t
2614	0101000020E610000086045920B1140F40FB5D6C4A9CD34540	59	8	2022-03-03	40501	54575.3864345945	t
2615	0101000020E6100000A5E5FC36CBFF0E407577A795DDD14540	5	5	2020-05-15	86362	12236.2301124894	t
2616	0101000020E6100000C58F0B2763D30E405838478B42CB4540	69	3	2018-12-26	29520	12762.1952652202	f
2617	0101000020E61000007833A1BAE3E90E40C39AD00261D54540	13	9	2016-01-04	23239	75067.2888153671	f
2618	0101000020E6100000DAA87251FB890F404CF46EE60AD04540	78	4	2014-02-21	95211	56179.2582377133	f
2619	0101000020E610000061982564BE1F0F40749008E7C7D14540	26	3	2019-09-26	15732	74126.7687976164	t
2620	0101000020E610000043864F416EA50F4028083B8A16C84540	21	8	2015-04-27	45650	69979.8712954127	f
2621	0101000020E61000005101EAB583750F4099DF9A4E50D34540	51	7	2023-12-10	77594	54705.1456603904	f
2622	0101000020E6100000E56986CC13510F409F2DDCC1AFCA4540	10	5	2011-05-11	4599	68648.186389308	t
2623	0101000020E6100000B524E2D882180F4073CF72DC93CD4540	92	10	2016-11-18	42308	22107.7841243447	t
2624	0101000020E610000099FC0C19737A0F40A3527F4C04C84540	11	3	2019-03-30	45532	26354.4326380642	t
2625	0101000020E6100000AC588141520B0F40E4047D5137CD4540	65	2	2020-05-15	21777	50416.3909467247	f
2626	0101000020E61000001EE6459D8FCF0E40A37C470841D24540	52	2	2021-12-15	15920	50961.3493193207	t
2627	0101000020E6100000496A54FDEC640F406B31416432D44540	73	7	2025-09-15	77415	84076.0407085051	f
2628	0101000020E61000005E6BF8942A170F40DE896763F6CA4540	86	10	2017-08-18	22331	45141.1724168312	t
2629	0101000020E61000003590FAD35CFA0E401E02A2C729CA4540	29	9	2019-10-27	36989	85947.4761536756	t
2630	0101000020E610000065315A00C7D50E40317E549885C84540	88	2	2014-06-18	67610	77377.5803477257	t
2631	0101000020E6100000F9C25BD7C2050F403A139A2188D34540	60	1	2020-06-07	86628	41501.3023483188	t
2632	0101000020E6100000F3BF89121DF00E407FE410E947D24540	58	6	2024-09-24	54220	20421.4069751727	t
2633	0101000020E61000009155F46D99930F40A027E3B3D5D24540	24	1	2020-04-13	54874	81873.9501162321	f
2634	0101000020E6100000C55A97F3427B0F4075AB0D5C8DCD4540	39	3	2010-11-12	73659	85913.6032827565	t
2635	0101000020E6100000CD2F6D2431D50E4058994E0796D04540	69	2	2010-12-01	39240	21218.3411051654	f
2636	0101000020E61000000CBDFFBCF8EE0E40E28B128321CA4540	91	4	2021-06-18	60917	32102.4576710916	t
2637	0101000020E6100000E7E600AF29F40E40C65E25302BC94540	21	8	2025-10-08	14325	79256.4485359751	f
2638	0101000020E61000003702EE8727AA0F407A60899F2CC84540	46	7	2011-03-28	20839	53932.4159175307	f
2639	0101000020E610000028A79748B5A10E4039E7AD25D8D04540	23	4	2020-08-18	84157	62685.935999006	t
2640	0101000020E61000007788365D05050F403266A1FD92D44540	80	10	2024-10-21	35249	95789.3646981242	t
2641	0101000020E6100000D1E1EBE058C40E40BB1A3C07D5D44540	32	6	2019-08-03	41560	78040.0945699558	f
2642	0101000020E610000061618F51AE780F40EA0461A9CFCE4540	10	5	2018-08-21	98265	9163.22648691244	f
2643	0101000020E6100000C1E96E49809B0E402E2123911FD44540	25	2	2024-08-08	37068	4334.98745518803	f
2644	0101000020E61000001240E35DEB920E4003E86800CFC94540	51	10	2021-12-06	73668	91454.9882032395	f
2645	0101000020E61000000B2962389F790E4009589E81B0D14540	28	2	2022-08-12	5198	20832.0584300266	f
2646	0101000020E61000009F42141E73D80E4044CFEFA796CF4540	84	1	2016-02-28	27598	43045.5137833538	t
2647	0101000020E6100000DD2557707D940F400B055BF8F4C94540	68	1	2013-06-20	98420	44812.724657331	t
2648	0101000020E61000006C1F8C225CCD0E40B6CA0A73BACC4540	11	6	2017-01-27	53877	35920.8111272539	f
2649	0101000020E61000007A6DEC0C8D290F40B6326D4053CA4540	20	5	2014-10-09	84392	16441.5934644437	t
2650	0101000020E610000005E68969AEF80E40C6EE91E052C84540	47	10	2020-11-02	25600	76069.2756313488	f
2651	0101000020E610000035B2D40672EC0E4063A9D9AC93CF4540	88	6	2024-12-17	7463	61759.1156864304	t
2652	0101000020E6100000F21E087370790F402FF14B329AD44540	42	4	2019-12-08	80300	33148.1301804697	t
2653	0101000020E61000007236CD6C8E9A0E40AE71274132CC4540	1	1	2015-10-22	23255	42093.2336027852	t
2654	0101000020E61000004AF69E58AE8D0E406C0DB1C3A5C84540	43	7	2024-11-20	2893	7654.80322672376	t
2655	0101000020E6100000FCF6C6D9CBBC0E4029C09CAC63D44540	96	2	2022-11-21	79693	308.661183792025	t
2656	0101000020E6100000CCA3B05298990F40B8D84B4A3FD44540	99	10	2023-03-15	21144	22158.3052861705	f
2657	0101000020E61000009FC13B4E44950E40D6210B1513D04540	10	1	2014-09-15	81205	77056.2877974509	t
2658	0101000020E610000083C2F4BE726C0E40D911612F6FCB4540	90	7	2017-12-26	6567	59287.2342435836	t
2659	0101000020E61000006B420A233B9A0E401CA7811E93CC4540	60	2	2025-01-11	32126	9262.96885067273	t
2660	0101000020E61000008198521BDF080F40CA6372BD7CD14540	25	4	2024-09-25	64515	72541.3206418545	t
2661	0101000020E6100000541C3C0A84AF0E403DBEF04E92D14540	28	7	2023-08-09	59414	46075.2178427647	f
2662	0101000020E61000004A831F822BC80E40913F72256DD44540	66	7	2015-07-31	29757	88480.5378733361	t
2663	0101000020E610000090478337B7DF0E404C9A50D13DD14540	4	6	2017-11-18	89795	83149.7811815501	t
2664	0101000020E6100000E7FDEC8D078A0E406DB1B896EED44540	77	10	2020-11-20	51634	91458.7829914458	t
2665	0101000020E6100000303C386BB79C0F403B5D5B63F9D44540	10	2	2024-08-02	22512	73947.1412951012	t
2666	0101000020E6100000BB612785E9820F40D9AA306C51D44540	14	6	2013-02-26	29878	84410.5782436829	t
2667	0101000020E6100000721919D270A50E4046CEB05AF4C94540	43	9	2012-02-27	81668	41490.0356117984	f
2668	0101000020E610000018CD8C73656C0E405AC0E974ECD44540	1	6	2023-07-10	41262	23577.5891912656	t
2669	0101000020E6100000C4680E56A1DF0E40018D928AA8CC4540	64	9	2023-08-18	93477	15025.9273974249	t
2670	0101000020E61000006D5102BA3EE90E407C7F625769CC4540	54	5	2015-11-27	25976	80619.5075369329	t
2671	0101000020E6100000F295B83FFDFB0E402E21065C57CE4540	63	7	2015-06-26	87472	92617.7076951771	f
2672	0101000020E610000008523DAAB9030F40AA8B96AECBCC4540	86	5	2025-02-28	32939	80389.8944394816	t
2673	0101000020E610000092DAE2175C500F4047D5B297DFD24540	50	7	2018-10-14	57383	14746.1627477385	t
2674	0101000020E6100000A99415C372DE0E40BAECF4649DCA4540	73	5	2023-10-25	70584	27510.4459400884	t
2675	0101000020E610000059EB83761E910E406C91427017D54540	35	4	2021-04-12	16118	87802.7166094711	t
2676	0101000020E6100000D87EA316CB110F4081A15A69E6C84540	74	8	2020-09-03	88007	69204.5651786412	t
2677	0101000020E6100000EDF3E40424890F40D01D36AC6DCF4540	46	2	2024-03-31	22638	23764.3784389955	t
2678	0101000020E6100000E9BC4ECD5E710F4090692BD024D04540	56	10	2017-07-28	59506	70431.6181777563	t
2679	0101000020E61000001952EEE6B9660F40BEF445D563CF4540	74	9	2013-05-18	39052	61966.9666010196	t
2680	0101000020E6100000EE035D4D32190F4094F61DE7DBD14540	66	8	2021-04-13	50919	57223.6859085164	t
2681	0101000020E6100000E758EE286D270F40D2DF7ECC7ED24540	96	4	2012-12-16	31144	87392.7449035184	t
2682	0101000020E6100000E1F0B1BBF5AC0E40250C4129CBD34540	27	8	2017-05-12	86923	81607.3485579061	t
2683	0101000020E6100000CE1B4D96B18A0E40DB8F787B1DCC4540	100	7	2010-05-01	68879	45325.9568098416	t
2684	0101000020E6100000B56250EC15AD0F40DB8AA74FFCD34540	28	10	2023-02-26	88596	49109.7360589381	f
2685	0101000020E610000078BD0D77B1B10E40FE8ADBBF40CD4540	95	2	2025-09-02	30170	30140.2378405051	t
2686	0101000020E610000014F0480C44800F400F6263957FCB4540	83	9	2012-07-18	16959	45514.9345149567	f
2687	0101000020E6100000059111DA5BA70F404A4D4B544DCA4540	5	9	2023-08-03	14319	95835.6333798471	t
2688	0101000020E6100000BB935BFD0F210F40BAC05F9102D44540	98	2	2024-03-27	7944	71845.0148727573	t
2689	0101000020E610000024CABB2C82EF0E401FB41CBEC6D24540	4	10	2018-07-13	76836	99387.3986751788	t
2690	0101000020E610000016955BCBB34B0F40B83CC465AECA4540	33	7	2012-05-22	54574	45774.5544501465	f
2691	0101000020E6100000613F8E0A9EAE0F406BCF682180C84540	53	8	2017-10-28	2078	5372.46816817858	t
2692	0101000020E61000005CB75B18CB3F0F406EE7E2209DCE4540	61	1	2025-01-28	58666	72033.0507586488	t
2693	0101000020E6100000A20AF3F0CC6F0F40F3133EF896CD4540	31	4	2011-01-25	85232	63800.2437971762	f
2694	0101000020E61000002278D5A12EDB0E40F1B9182E52CF4540	28	9	2014-03-19	25910	74552.510070511	f
2695	0101000020E61000009BDDFFEAA4860E40D84C9E2DF6D34540	42	5	2021-12-20	1219	46385.4358186675	t
2696	0101000020E61000009ECB7AD0DAC90E40058EE7D3DBC94540	46	7	2013-12-06	64072	38651.1147394113	t
2697	0101000020E61000004EAF62E6A2790F404ED3BF7820CC4540	79	3	2020-12-27	77938	13538.4776461652	t
2698	0101000020E61000008573F5CEB5040F4084E206EA8BD24540	47	1	2015-01-13	73664	89581.0168038207	f
2699	0101000020E61000005234943E9E740E40CE3019E47CCE4540	46	2	2014-10-31	10838	82885.7471375605	f
2700	0101000020E61000008D1B58273D450F40C3078944B3D44540	68	6	2016-08-01	94258	22524.4465261029	t
2701	0101000020E610000031973CADEAA30F40F4D4833789CE4540	73	5	2018-08-18	30906	80676.9092970873	t
2702	0101000020E6100000BC3B7CBE21760E400E04A93AE3CB4540	76	4	2025-05-26	19555	84674.0079589892	t
2703	0101000020E610000030E7A90620D80E40957756F401D04540	99	9	2018-02-23	52796	87091.7556753693	t
2704	0101000020E6100000991535B949EB0E40B4BF1AB0E5CB4540	8	1	2021-12-04	30380	78707.3156227191	t
2705	0101000020E61000004C4ECD903A420F402E959FC7C1D34540	12	7	2013-06-13	20915	83560.2967056057	t
2706	0101000020E6100000F36959BD8D330F403877961F4ECF4540	69	8	2014-07-15	19527	43376.4536502142	t
2707	0101000020E6100000193CE939C1BE0E40D8A219E90BD44540	38	6	2018-04-07	71162	44138.2931248571	t
2708	0101000020E610000068472EF0427A0E4074FABFB3B0CC4540	47	7	2024-07-02	56189	922.463172790322	t
2709	0101000020E6100000A7DD593A9B080F4081BE285B2BD24540	77	3	2014-01-06	12106	1875.35484861763	t
2710	0101000020E6100000C241C70B2A3C0F40977A48EFC0CB4540	67	6	2011-07-24	86934	38191.2676410303	t
2711	0101000020E6100000B95CD9290CF50E404386850B43D54540	12	5	2011-08-22	37890	52599.7081031517	t
2712	0101000020E6100000C85280458AA20F404B184A940AD54540	36	6	2010-07-07	57682	61127.9364854937	t
2713	0101000020E610000063CE2C4EDF920F40334AAB6FAFC74540	43	7	2023-09-16	63016	14161.2302230619	t
2714	0101000020E610000059C6DDBAF6590F408BCE030452CD4540	48	6	2016-10-01	15556	49701.7272229297	t
2715	0101000020E610000006ABC5C7C4110F40F72DAEE124C94540	29	5	2014-07-08	75284	31666.3537191541	t
2716	0101000020E6100000FDBB8EFFF4A00E409E2AA78BE5CF4540	19	1	2014-03-24	86990	80228.7956563391	t
2717	0101000020E6100000B391DC4A2D010F403A0A69935DCC4540	68	5	2019-07-11	71813	93828.0254567773	t
2718	0101000020E61000007A151B8745E70E40DE09D4074BCA4540	64	1	2010-06-03	71459	36251.1326831724	t
2719	0101000020E6100000B006F49382A80E407227464C54CB4540	86	1	2010-05-13	87502	14814.9941443477	t
2720	0101000020E61000009D71C6AAB40C0F4037B7C8D00DC84540	59	3	2014-04-28	75323	15720.564511839	t
2721	0101000020E6100000ADD1AE2540700F40ECF98C577ACE4540	10	3	2025-11-11	5520	3005.5237105248	f
2722	0101000020E6100000D60DA65AB00D0F40D348941EA0C94540	80	2	2023-06-12	64791	53031.1003252163	t
2723	0101000020E6100000248C6574F7E20E40E4F52DBD00CF4540	49	5	2022-07-20	59142	20185.8942028137	t
2724	0101000020E6100000422FCDB65FFA0E408607F06339D34540	20	7	2019-10-21	93798	13748.2717321624	t
2725	0101000020E6100000C2EC319E8A950F40A0E1D08B44CC4540	47	4	2025-02-22	30331	73278.057311583	t
2726	0101000020E6100000B22EB546B7280F4032A2F0FA4ACB4540	98	4	2016-09-13	50154	38766.7418199858	t
2727	0101000020E6100000C47032AED9910E40D68610E9BECD4540	72	8	2012-06-08	9183	50067.4572360422	f
2728	0101000020E61000008562B41535640F40BB9A4E5AD4D14540	53	3	2017-02-25	94082	12677.4514057512	t
2729	0101000020E610000041EEBED1AE4A0F401979C8D6C7CB4540	19	4	2019-04-29	65898	75656.1143128049	t
2730	0101000020E6100000DD4FA3DF9F650F40C963F355E9CB4540	19	3	2013-04-15	85587	9478.49391665174	t
2731	0101000020E610000037F59593804C0F40E37A3573A6CD4540	79	7	2020-09-25	32756	92107.1331498567	t
2732	0101000020E6100000FB93D2BB5CDB0E40EB1079F5CFD14540	25	3	2016-05-09	92716	66492.1296310862	t
2733	0101000020E6100000597A267E8C180F405153AED311C84540	17	2	2012-01-25	27458	41203.5334155074	t
2734	0101000020E61000006E1B98B933A70F4059FB4F6745CD4540	72	5	2019-11-10	51730	87862.1338985293	t
2735	0101000020E610000020346F2E28670E40B5F626A1F4D24540	78	2	2022-09-25	98408	90682.3838262959	f
2736	0101000020E6100000625D3715A89A0F4027E54BE191CD4540	72	9	2010-12-10	92370	38000.846162402	f
2737	0101000020E610000075E2A35017900E40722E923391CC4540	15	5	2023-08-30	6518	66102.3267636906	t
2738	0101000020E610000078903517F8BC0E40BD5256FE59D04540	32	8	2011-09-25	16074	92492.3274147167	t
2739	0101000020E61000001A66E734EF1D0F405A788DDEDACB4540	97	10	2016-04-17	43124	70904.1809620585	t
2740	0101000020E6100000815A30693BDF0E40B71F65D36BCD4540	7	10	2018-05-16	11600	99926.4314264104	f
2741	0101000020E6100000B7ADC16A0ECC0E40E8B62C3BFED34540	26	1	2023-07-31	72749	3355.94178464513	t
2742	0101000020E6100000F53E6389399C0F406F1F5489FBC74540	66	3	2010-12-01	32216	4410.50265801908	t
2743	0101000020E61000009A92E45837340F40A736A9F0B1C84540	93	10	2012-03-10	32523	28517.4086998154	f
2744	0101000020E610000066D433C23AFD0E40D6BE8048F0CB4540	64	7	2011-01-24	35490	50210.0018844452	f
2745	0101000020E6100000A7185A1318AA0E40206C7AA484CB4540	48	3	2019-08-22	80100	33778.4901868798	t
2746	0101000020E6100000A25A4E281E9D0F406E66B17B5BD04540	44	4	2011-12-15	53951	68624.116374841	t
2747	0101000020E610000040E3E795113F0F40AE6B8DB8C2CC4540	89	1	2011-03-21	45247	57107.442666307	t
2748	0101000020E61000005E82BA8F0B460F40FAE2C20F54C94540	35	10	2019-04-04	66742	59813.9534121629	t
2749	0101000020E61000001AB422EA28E30E406A62BF8F78CC4540	9	9	2013-08-19	13905	4860.61777845075	t
2750	0101000020E610000092F7A5BCB45D0F407353E4F9E2D14540	95	2	2014-10-28	35742	70885.6595343793	t
2751	0101000020E610000018D9EEF79F160F40F844D63D77CF4540	68	9	2015-04-13	33556	89181.2548756055	t
2752	0101000020E610000038072AA6FEB50E407999F3FC03D54540	52	9	2015-11-26	22974	53333.5817497646	t
2753	0101000020E6100000649E3E2C13A80F40B3D6FBDA24D54540	73	2	2019-09-28	61331	81654.869618079	f
2754	0101000020E61000004483DD9122C40E4008681815A4CA4540	18	3	2015-10-05	2997	84682.4950066059	f
2755	0101000020E6100000F84C268C29BF0E40CAF82ADCA0CB4540	14	5	2013-06-20	45642	87430.1545352553	t
2756	0101000020E6100000355380F930580F40768CC8CEA6D14540	39	7	2010-09-14	37810	19896.8972514426	t
2757	0101000020E610000092A46C2B822B0F40C13EB19A33D34540	94	9	2021-03-29	78756	67849.6101814787	f
2758	0101000020E610000036136A0BB69A0E400F70479AC1D24540	3	3	2025-08-09	80992	59733.556255538	t
2759	0101000020E61000005A72C7A0EDB00E4004A3EE7DD7D44540	15	2	2019-01-01	88304	79524.1423415423	f
2760	0101000020E61000001AD642F1B0390F4087D9988F43CC4540	38	6	2017-09-04	2474	33500.5129995458	f
2761	0101000020E610000031AC21077EF00E40464BD9F79CD04540	74	4	2024-10-01	28092	15513.426363594	t
2762	0101000020E6100000EA531761D7C30E403CE85EB534CB4540	11	6	2018-10-19	10061	32596.0944062395	f
2763	0101000020E6100000B3560F132BBE0E406E4B6A0C6DCE4540	75	4	2013-11-05	84498	11003.4952465798	t
2764	0101000020E6100000E0E845E2C7AE0F4075EC1C7163CB4540	60	7	2012-11-03	44049	45408.0713021804	t
2765	0101000020E610000018B2F4CD6F3B0F405C68651DA5D44540	47	10	2021-06-10	41165	92194.051105596	t
2766	0101000020E61000006784946FD5AE0E4046DB21F228C94540	100	3	2013-02-04	43033	55089.707978593	f
2767	0101000020E6100000926845D902EA0E4099E424FBB5D14540	17	9	2019-03-27	60659	36449.4186182531	f
2768	0101000020E6100000AA985ED7ABDB0E407174C26998D34540	4	2	2014-09-08	5931	21860.998968518	t
2769	0101000020E6100000FDBDE75A909C0F40E183160D8ECA4540	99	7	2010-12-02	56410	49922.8191707521	f
2770	0101000020E61000004A78496562CF0E40ACC70DB879D04540	88	7	2013-08-05	82273	74767.4067947709	t
2771	0101000020E610000060D71B181BF00E40ECD561C0D9D14540	26	4	2023-02-17	36164	17619.9982590834	f
2772	0101000020E6100000D18DAFBC8AAF0F40633B4DC06ECD4540	89	7	2013-06-19	1237	32623.6656393927	f
2773	0101000020E610000062C2A553E0F80E40D2D51DCFD9CD4540	3	1	2015-05-20	13970	362.918550386793	f
2774	0101000020E6100000E9CC0A86A7620F404298D2C8D7CB4540	98	10	2025-08-06	23414	25596.1911468524	t
2775	0101000020E61000003C257864C7A90F409262FC9E28CC4540	43	4	2019-04-26	5095	3420.36992537982	t
2776	0101000020E610000077F5539D478B0E408BB757C4A5CE4540	67	3	2013-11-27	76889	34285.1240867834	t
2777	0101000020E6100000058B7A75F4630E409551270E2CC94540	85	6	2023-10-16	81261	43151.2486313511	t
2778	0101000020E61000007E4823A245710F401E4C52C5B6CC4540	18	10	2022-04-05	34667	7291.2318732743	t
2779	0101000020E61000006EC932674A6C0E40EFDFB9BD9AD04540	1	4	2024-02-03	69413	43470.0207738114	t
2780	0101000020E61000007FF90DFB286E0E4019776F70C2CD4540	53	6	2020-08-07	40689	82063.5914154097	f
2781	0101000020E61000005A5394FD96990E407535B4B812CD4540	39	1	2016-03-16	27169	77381.187525866	f
2782	0101000020E6100000A7DF068DF19B0F402D4D21742CC94540	8	5	2017-10-15	1556	35297.0126303155	f
2783	0101000020E6100000BCBF206D62340F40866471A6B3CC4540	57	6	2016-06-11	61652	98696.9552185421	t
2784	0101000020E6100000EE1DA76496C00E40350D452869D04540	6	10	2020-11-14	76394	44926.1794212554	t
2785	0101000020E610000052C20072FC750F40F1076CA01ACB4540	39	3	2018-03-12	87195	29466.5210553775	f
2786	0101000020E61000001D5434212B000F4092F4A6C59ACF4540	81	10	2015-06-27	6117	87605.7952777495	f
2787	0101000020E61000006841ACA5786D0F40335060DF4AD44540	76	3	2015-12-12	61309	91406.1814016234	t
2788	0101000020E6100000C33E31D1B3020F407C16302A03CA4540	3	5	2017-09-27	22754	64004.5454378525	t
2789	0101000020E6100000A5612F4193870F40FDC3D80D68D44540	96	4	2019-06-21	97231	80579.8335485323	t
2790	0101000020E6100000677C7169F2C00E40BFDB3FEC03D14540	11	7	2014-10-16	57197	65105.4535720401	f
2791	0101000020E61000006DAA0A16C2DB0E40FF670B5C6CD24540	58	2	2018-01-24	66807	27672.8707067252	f
2792	0101000020E6100000C6065B2A05600F40A83D051200D44540	58	8	2021-10-05	40883	96715.1322730632	f
2793	0101000020E610000031B787C8E6500F40018C1B6C82C94540	38	10	2014-01-25	29386	82864.7420087488	t
2794	0101000020E61000004714BB8334210F40FE562D9BE5CE4540	50	5	2014-01-23	64958	36822.5987373982	t
2795	0101000020E61000004C36793F03D40E40877EDC2AF8CD4540	68	9	2010-05-05	38330	55984.6358804153	t
2796	0101000020E610000038558974C2D00E40056B536678CA4540	83	7	2019-02-07	24089	53150.6808344606	f
2797	0101000020E6100000EF893401A4C50E40E54C03A34ED34540	16	9	2013-03-17	3112	61871.9502248398	t
2798	0101000020E61000007922E7D96A7A0F4096F2598595D24540	39	9	2022-08-25	57389	68784.7455666246	f
2799	0101000020E6100000FC01214A6FB00E4042FAEF73F0D04540	18	5	2015-12-15	79627	88624.3933730167	f
2800	0101000020E6100000F332561F75820E406FEFB485E5C84540	16	6	2025-08-01	11623	70716.3017847354	f
2801	0101000020E610000035E8C0C30F8D0F40A1A72DC6D5CE4540	41	8	2013-03-04	62061	90546.5241450626	f
2802	0101000020E610000062347D779D610F40BA83036499D04540	63	5	2012-12-05	87878	38575.3106353932	t
2803	0101000020E610000046886DB3B3DF0E4026DBA56706D14540	53	1	2024-11-19	12397	33070.6251558464	t
2804	0101000020E61000000C48CCDAD14A0F40AFD0B63699CE4540	54	4	2023-07-23	8776	34491.5497323336	t
2805	0101000020E6100000EFE668D9806A0E40EB3306C658CD4540	88	6	2021-01-31	15376	50074.0692047048	t
2806	0101000020E6100000B4222BEC31CF0E40AA01F18BC8D44540	1	8	2017-03-26	77632	9542.72331163226	t
2807	0101000020E610000004E65B4E50B50E405A16434480D34540	68	5	2010-01-05	92356	56712.5086015858	t
2808	0101000020E61000003665E58EA48B0E40ACD0FDFE74CE4540	36	3	2014-02-11	28089	85149.2688958389	f
2809	0101000020E610000094BB1C5E8C250F40BC74E25957CF4540	38	5	2021-12-14	45003	97507.8812177829	t
2810	0101000020E61000009F153F2A16810E4027073EE2D7CF4540	83	8	2014-10-10	79689	37875.2651500506	t
2811	0101000020E6100000B5304C9C33950E40B6B4DEC59DD34540	79	4	2022-09-09	13190	35116.5061213167	f
2812	0101000020E6100000385CCCF26A2B0F40607F9BE395D24540	82	5	2012-03-03	9390	42724.4499462075	f
2813	0101000020E6100000FAAA69E9B9310F40AAF548C3F6D44540	58	2	2020-07-28	3205	78346.2691382553	t
2814	0101000020E6100000DEFD2C3229B90E40054864FD74C84540	36	4	2011-01-15	30051	12510.2058238509	f
2815	0101000020E6100000B2CFA2E735E80E40B65F012624C84540	46	1	2012-09-02	11342	1474.71068494229	t
2816	0101000020E61000000D8E479C5D9A0E4035F1509A8BC94540	1	2	2022-04-04	67480	65341.8485132178	t
2817	0101000020E6100000218DE7FD27A30F40255DA3B5E0D34540	53	3	2012-06-05	87394	49008.7574172747	t
2818	0101000020E6100000E37F8314F7060F40EEE56B66FDCD4540	70	9	2023-02-28	12010	16253.8655301301	t
2819	0101000020E6100000275283CF74960E403B08CE0AE6D04540	86	4	2017-05-12	43746	87989.2390831604	f
2820	0101000020E61000002AF1B3F85E5D0F40F55D6AE52CCE4540	26	10	2024-06-24	49405	46625.9620760414	t
2821	0101000020E6100000124A5C32CE0A0F40032B5C782AD34540	22	9	2024-08-07	24380	14586.8633524241	f
2822	0101000020E61000001854C9145C790E40CDE068066BC94540	5	7	2012-09-18	63436	47416.6607267213	f
2823	0101000020E6100000F155D5A77AA90F403BCE4A52CECE4540	99	6	2014-01-13	14453	41642.4626613612	t
2824	0101000020E610000057FBF5D1796C0F404A3A92A7F0C94540	48	1	2015-01-16	48921	72092.7858696296	t
2825	0101000020E6100000C816A7AFC27C0E40230C5348FDD34540	96	2	2021-10-30	62329	40465.2975366706	f
2826	0101000020E61000004EA050716BA80E40FAC1F23981D24540	38	6	2024-02-05	8915	55690.6480273609	f
2827	0101000020E6100000A14EF75E488E0E40A4F19DEC82D04540	73	4	2017-03-02	83415	1128.33409373969	f
2828	0101000020E610000088956A0094210F40D6A70FC17CD24540	47	9	2019-09-20	44593	88744.2245180118	t
2829	0101000020E610000059E0474DEB690F40BE0BCA70C6D34540	60	9	2020-04-15	44903	31511.3394280666	t
2830	0101000020E61000003211DC18EB300F4051B644B58DD34540	85	3	2013-01-06	71846	91257.2442517686	f
2831	0101000020E610000036AAC61C8B730F4066B2622B74D24540	44	4	2012-03-26	9697	46401.2402935323	f
2832	0101000020E61000002BAEA65AF9850E40A2B8D03AE4CB4540	83	2	2021-08-08	93307	27318.7692366814	t
2833	0101000020E61000008F0D15113C6D0E40580F4975CDD34540	94	1	2017-06-09	30283	56294.5547200654	f
2834	0101000020E6100000EAD6F753FC710E40E713728307CD4540	54	9	2025-01-21	42839	15413.0543942915	f
2835	0101000020E6100000D9B7DECF72D90E40C5AEAD29EBC84540	19	2	2022-11-05	57392	60534.9284118158	f
2836	0101000020E61000005C286798A0FC0E40897432EB46D24540	64	3	2014-06-16	89828	38205.3936857912	t
2837	0101000020E6100000CF55D0CFD84B0F40850C51681ED24540	53	7	2010-08-10	5324	4397.01312941956	t
2838	0101000020E610000099586B47091D0F40B84F3C665BCF4540	99	2	2014-04-13	41992	41953.7820127375	f
2839	0101000020E610000040A88CE9F8130F40A5E3DFEA6BCC4540	25	2	2010-05-28	49344	11446.1063553552	t
2840	0101000020E6100000884F1D23FA450F403AFF4D466CD34540	7	3	2017-09-01	25349	68100.1212549187	f
2841	0101000020E61000002FA7B8ACAB820E400A30501343CD4540	79	6	2020-10-19	18939	23096.5713348213	t
2842	0101000020E6100000DFCB0D87C1A20E4040817D1D27D54540	90	2	2013-07-13	15897	76045.115798856	t
2843	0101000020E6100000D2F1054BCA870F40775264057AD04540	18	7	2014-10-03	10253	57303.5732884452	f
2844	0101000020E6100000A2241BA7BB3E0F40EE91B1AEFECE4540	50	9	2012-04-22	52142	9766.82571119003	t
2845	0101000020E61000001808B0FDEC620F406676D88ECDC84540	23	3	2016-01-06	71182	21059.6111518537	t
2846	0101000020E610000015B9AC4174F00E40941861200DCE4540	72	1	2015-03-24	75735	69676.7764868855	t
2847	0101000020E6100000C33C59FC7E750E40F0D5969CA3CF4540	98	4	2014-03-26	11089	81352.4384368689	f
2848	0101000020E6100000C78C21FA618B0E402863423C22D44540	84	9	2020-04-17	96706	932.711787804963	t
2849	0101000020E61000001F7A1286E3D10E4081F9CA14A0D14540	48	6	2015-06-14	56632	94997.1874876064	t
2850	0101000020E6100000BAF3430E91630F40194882D3FECC4540	57	6	2012-07-18	69216	73939.000278298	t
2851	0101000020E610000039D55D845D730F401CDF66E0F9D04540	91	8	2017-08-13	98723	50514.65730615	t
2852	0101000020E610000097B2A9DF33770F40C1C6A7A651CF4540	85	6	2010-05-11	76857	17327.9048961918	t
2853	0101000020E61000007907053F648C0E40BDBBB7AE0CCD4540	44	10	2025-08-03	47475	25326.9531022154	t
2854	0101000020E6100000CA71493815E30E408FC4B1E32AD34540	34	7	2016-01-13	10072	89120.0444685264	f
2855	0101000020E6100000B2F9165A88270F40027B1C7DF3C74540	28	2	2010-09-21	22911	22734.4304011008	f
2856	0101000020E610000051B5769790F00E4001C2C62E76D24540	9	8	2024-01-08	72312	58328.870226552	t
2857	0101000020E61000004C58E4647A3E0F40A12C4F5783D24540	51	8	2024-06-12	12341	24690.8203386314	t
2858	0101000020E6100000FB333DFC2C830F407A5CE08225D54540	85	8	2022-02-13	9791	10445.3957787305	f
2859	0101000020E610000098A5E81B90D70E40F4F8D4972DC84540	66	5	2017-02-18	47021	34233.9081340168	f
2860	0101000020E6100000FEE63A6FF76D0F40AFF02E198AD04540	91	4	2015-03-25	10200	83854.4061545808	t
2861	0101000020E61000004042E47AEBAB0E40E418A8BE3ED34540	7	1	2013-03-29	84303	30276.3329635387	t
2862	0101000020E6100000384BC9FE0CAF0F4033E9FA890ACC4540	2	4	2023-07-04	57292	81619.1976945441	f
2863	0101000020E61000003CFD0E0634710E4078345B1BE3CB4540	10	1	2021-11-27	19488	36060.4183251136	f
2864	0101000020E6100000ED43673844160F405D55B257A7CA4540	27	3	2024-07-13	6796	47443.2207829026	f
2865	0101000020E61000002BA0604E036B0F4014965C73CBCA4540	81	9	2025-08-12	63706	11990.4732045107	f
2866	0101000020E6100000FF43485C0C3D0F40D1D560E7F7C94540	30	10	2025-02-19	25040	42630.5982874539	f
2867	0101000020E610000006E4CBBFA2BC0E4029A172CF20C94540	22	2	2018-11-07	98175	2794.767281292	t
2868	0101000020E6100000ECF55570DA8A0E4073817BB085CB4540	68	10	2015-07-18	86529	6082.29042254662	t
2869	0101000020E610000080EB9C74E9190F40A99C0F9DFCCB4540	2	8	2012-04-05	15639	98706.6338046801	f
2870	0101000020E6100000DE2F4BA785840F40E5299DF47ED44540	59	2	2024-12-15	39181	93331.9445923914	f
2871	0101000020E61000007EBB5CC76DF20E40BDC5783DD2D24540	86	5	2018-03-28	96092	93424.6138514478	t
2872	0101000020E6100000A7F22804709A0F40CCE5AED4B4CF4540	29	9	2017-02-28	62871	24121.5603637961	f
2873	0101000020E61000002764464636840E40965B93F668CC4540	40	10	2014-07-21	22887	11657.9150554703	t
2874	0101000020E610000008CA5F5FDF6F0F409AEA0420EACB4540	26	4	2012-03-26	56409	36909.4560913501	t
2875	0101000020E610000077960C0C62550F405577408F38CF4540	67	3	2016-11-08	98486	44873.0813991113	t
2876	0101000020E6100000AB19E30AAAD10E40F3D5267E1AD04540	13	10	2010-11-22	20669	79545.1237638793	t
2877	0101000020E6100000A2401EAD2F9C0E4040DAA522A4D34540	56	10	2022-08-13	40413	42726.6776897618	t
2878	0101000020E6100000DC1C740C8B460F404102559B0AD54540	64	8	2012-08-15	10257	85004.9244600342	t
2879	0101000020E61000003A2AFFED48370F4001B6548EF0C74540	60	5	2024-10-19	22855	97248.0934718118	f
2880	0101000020E6100000F1FDC9C040740E4041B6265846C94540	8	1	2012-12-27	14617	99963.007559185	t
2881	0101000020E610000031B3D17740810E40E310BB9C8ED04540	100	4	2018-12-18	56016	87804.8048204631	f
2882	0101000020E6100000875BB3E7EB910E404DC629BD50CD4540	80	2	2020-10-20	95935	90731.0442331526	f
2883	0101000020E6100000286C43A18BB20E40322C122ACCC94540	66	1	2015-06-15	67817	44234.314095813	f
2884	0101000020E6100000EE92DE012C570F40B2F1989427CE4540	64	5	2020-05-02	16321	75734.1850451198	t
2885	0101000020E6100000FF6934FC09EA0E401FC824BA5FD24540	95	1	2011-05-19	85732	88805.6708113365	t
2886	0101000020E6100000E15CAB29C77A0F40F2C7D78225CB4540	44	5	2013-11-29	50663	47402.6523926446	t
2887	0101000020E61000009D0371D4BDAE0E4062658E7F3CCB4540	58	7	2024-07-06	41651	43321.7707878189	f
2888	0101000020E61000009970935220140F406DACEDFB89D14540	3	4	2018-09-09	54073	99218.7503627903	t
2889	0101000020E610000088EB8E1BDF190F40414700F65DC84540	40	3	2020-05-22	86904	73834.0245658481	t
2890	0101000020E61000000F788AE828470F408D38D9034BD44540	53	7	2023-09-08	2182	26350.4031653977	f
2891	0101000020E610000017033C2D868E0F407A514C30C7D14540	57	6	2018-09-24	96120	72313.2791466632	t
2892	0101000020E610000050DDB71BF3910E4044E5998A17C84540	27	8	2025-10-27	12740	8011.40994113025	f
2893	0101000020E6100000518350EE57640F406E008370A0CD4540	100	1	2023-09-15	61121	89815.3824219217	f
2894	0101000020E61000000D9C78E18FB20E40ADE93BBB1ACA4540	50	8	2023-08-12	77196	33005.7427655551	f
2895	0101000020E61000004543DFDCEAA20E401AC47A84CCC74540	88	3	2010-08-19	57004	18406.8950210028	t
2896	0101000020E6100000A278CAF8A3150F402CC8EBE8E4CE4540	71	2	2020-08-01	82139	23108.9311903454	t
2897	0101000020E61000005CE5581C059D0E4003E927C150CF4540	40	9	2022-03-26	46852	67005.830255528	t
2898	0101000020E6100000767546B7378D0E40DC86A9E25BCB4540	17	5	2010-06-27	50451	247.562176291605	t
2899	0101000020E610000057279632AA870F40E12F4C21F2CA4540	7	8	2014-05-17	19426	34586.7600754821	t
2900	0101000020E61000005D0CE688DF0C0F40448625B2F1C94540	33	9	2017-08-23	88012	70228.5528087706	t
2901	0101000020E6100000FCACED8A6B440F404A3927B37FD14540	73	3	2020-11-28	25351	64044.5986761886	f
2902	0101000020E6100000594F12C8ED930E405A82402E62CF4540	25	8	2012-03-09	21252	6950.54615741033	t
2903	0101000020E610000066D2A7B19FAC0F40C9F6FC1A6FCB4540	24	5	2024-02-05	26965	39680.073498268	t
2904	0101000020E610000045CB34E9329B0E400B33D4DA2CC94540	14	9	2020-11-02	33514	82887.4059598275	f
2905	0101000020E61000007088BE0A759A0F40DCC098C1E4CC4540	1	5	2024-08-11	9881	95688.2756211683	f
2906	0101000020E61000008F3FC784605A0F40F68CE7CFAED44540	41	6	2018-01-21	91414	20412.3380376453	f
2907	0101000020E6100000DA6DF8C50A1E0F4068D0E911DBC74540	69	2	2012-12-19	93243	40557.0320489149	f
2908	0101000020E6100000C3DA1AB4459B0E4017C941D477D34540	18	2	2018-01-05	89901	22494.0309944706	f
2909	0101000020E610000038F5256282AB0F40C79640CD9DD24540	54	9	2019-06-30	53034	63388.2091571361	f
2910	0101000020E6100000D9AFE0D7199A0E40D17465E9CACD4540	5	8	2017-02-26	67928	30484.4638181387	t
2911	0101000020E61000006079A868EDF40E40D5DE80F435D24540	21	7	2015-07-16	60863	45673.5556812975	f
2912	0101000020E6100000F437F404B06C0F4025B3025CD8CD4540	42	1	2016-05-11	43091	17640.3962525636	f
2913	0101000020E6100000A0B3EC1F6F080F40008CB8289FD34540	78	9	2024-05-15	93897	3768.24749521916	f
2914	0101000020E6100000797DFBE0228C0F4075BE107FD1CF4540	42	9	2023-05-04	96581	17577.6447263193	t
2915	0101000020E6100000DE8F0AF4A6030F4079B60808FED04540	52	3	2013-04-02	83117	81952.1635359115	t
2916	0101000020E61000008A965209933C0F408DC8B297E3D24540	9	6	2023-04-03	5849	20721.1012153806	f
2917	0101000020E6100000E8C9A3E383C10E4013875AB23FCE4540	32	5	2023-04-23	79076	6098.79253298646	t
2918	0101000020E610000047B4F185E2070F4004F6D3060ECD4540	33	2	2017-10-16	75866	56473.8731822439	f
2919	0101000020E61000004749E4C2189F0F40EB6EF6521BD24540	63	6	2010-02-21	85	22321.739876205	t
2920	0101000020E61000007BC6B4393F0E0F4061EC697335D14540	19	3	2017-10-10	68905	80416.7190889135	t
2921	0101000020E610000039AECC5745910E40BD1C81E80AC94540	41	6	2019-09-15	48619	63547.8066444414	f
2922	0101000020E61000005139366378B40E4027A11ACB6DD14540	98	4	2019-06-06	59782	55264.8654859844	t
2923	0101000020E61000006028861C8F0C0F40DFF3F82A6FCC4540	44	2	2015-02-07	95440	50304.7892253863	f
2924	0101000020E610000011ECAAF8131A0F40511D923D68CA4540	89	6	2023-12-10	27810	75748.1162213368	t
2925	0101000020E61000009ACA7EE658CA0E40A5E2A34108D14540	14	4	2019-07-01	68510	67583.7196318215	f
2926	0101000020E6100000DC3E029AB6CF0E401F0A382480D24540	54	1	2022-07-26	50318	31511.615142612	f
2927	0101000020E61000000C01239E14B10F4022E2FB099DCC4540	70	1	2010-08-09	6802	85669.2402249618	t
2928	0101000020E6100000F7AF66A5ED830F40E78A14BAFACB4540	43	1	2014-08-05	88578	15560.0598616079	f
2929	0101000020E61000009160F18B38AA0E406724CCED1EC84540	43	5	2014-10-27	31480	82391.6209566629	t
2930	0101000020E6100000DB92937311910F403D97FE8EBACC4540	71	2	2021-08-19	96265	33386.4916296598	f
2931	0101000020E6100000952373DE086E0F40647E994421C84540	5	10	2018-09-25	93777	73063.0610057277	f
2932	0101000020E61000004C626311A9890F40B14DCE81D8D44540	2	2	2016-09-24	3202	97655.5323594444	f
2933	0101000020E6100000AAD770BE16560F4054E4DAED6ACD4540	70	8	2021-02-07	6311	4447.15671754179	f
2934	0101000020E6100000E7F5AAB93BD30E40B6EE31FDEAC94540	68	10	2017-06-21	81316	95143.5063382008	f
2935	0101000020E61000002E591F6B48760F403AB28CD3B9D24540	21	8	2021-12-10	36975	28157.2015192514	f
2936	0101000020E6100000869793327AAD0E40BE37CCE0EBCB4540	53	4	2016-02-16	90694	87098.5663290536	f
2937	0101000020E6100000F9CDEFA513120F409510BC290FCA4540	75	7	2010-05-13	12121	31776.6409108046	t
2938	0101000020E61000004BB4F15280900E40099DD721E1CB4540	86	3	2011-03-03	49131	70670.8128880384	t
2939	0101000020E61000006AD62F32581F0F408A5309FA4BD04540	98	9	2010-10-25	85952	44199.3577926513	f
2940	0101000020E6100000B7F288DFA2740F409A7B8616FAD14540	66	9	2022-05-08	74292	12363.7452295026	t
2941	0101000020E6100000C3CB6C1DE4AC0F40B24EEE988ECC4540	60	8	2014-11-28	47219	21210.2130518157	t
2942	0101000020E6100000EF957F78B4EC0E40D2B3BFD646D54540	3	10	2010-11-14	78261	85933.3846415794	t
2943	0101000020E610000035267BD4318B0E4070D1246D3BD14540	88	3	2015-11-30	62613	60992.2157243713	t
2944	0101000020E610000098FE18C624680E402CCBFD2B06D24540	94	9	2014-04-18	89831	6788.19257816097	f
2945	0101000020E6100000591270FB11F80E40DA10BC61DDC84540	26	6	2015-10-09	48864	93743.5023307481	t
2946	0101000020E61000007080E1EB5F9E0E401C73BA88D9CC4540	40	6	2023-01-18	18080	25182.8558594578	t
2947	0101000020E6100000D4B807ED48770E40366CB7F731D04540	4	7	2024-12-06	50529	19082.3452792763	t
2948	0101000020E6100000D9D431C215F40E40B783820B44D34540	78	2	2016-05-16	24443	89550.126405282	f
2949	0101000020E6100000CC5FB0660DCC0E4099202ED2CED04540	30	7	2017-06-25	50323	24552.6664866332	t
2950	0101000020E61000008BD6782732AE0E40C13A651B7FC94540	16	7	2024-11-14	33614	5164.08092849867	t
2951	0101000020E61000002DCA88D9CAA10F400B24C338BBCE4540	75	8	2016-11-22	32774	89343.193691125	f
2952	0101000020E6100000B00440D2412D0F406DA1FB4AC4C94540	100	9	2012-03-20	74277	87486.862654284	t
2953	0101000020E6100000961D1A6662A10E40546BF14C6ED34540	58	4	2014-05-29	71465	68543.7583340566	t
2954	0101000020E6100000F4B5CB1AF8A40F4034C0F5B42BD14540	27	6	2021-06-25	1951	93369.3887561216	t
2955	0101000020E61000009476E7D1F5790F40813E6655BAD34540	17	4	2025-10-05	26964	20098.8166315059	t
2956	0101000020E61000000BB460F377920E4079008D4B52D04540	92	8	2024-04-16	75485	32288.497466459	f
2957	0101000020E6100000759FD604CE980E401C73FE20E4CE4540	91	5	2017-04-26	49783	34069.6099614933	t
2958	0101000020E6100000C784C21466A10E404D1F2A506ED14540	64	3	2020-11-12	28126	39849.8938398755	f
2959	0101000020E6100000ED252FBA10680F4060BD10EB75CC4540	32	6	2013-09-22	2612	81537.1900585274	t
2960	0101000020E61000001B777B632DA70E40B753CB52D7CD4540	52	1	2013-07-02	61648	46268.0462005295	f
2961	0101000020E610000008F0764763FA0E402D37B90F0FD44540	40	6	2010-10-17	71593	84792.6890016637	f
2962	0101000020E61000007F6C77CC5AAB0F40D981B431ABD24540	72	2	2023-01-05	57371	61173.369364963	f
2963	0101000020E6100000FFD9CE72E1AB0E4068644D14D4CD4540	71	1	2024-09-23	40225	7673.04624345671	f
2964	0101000020E6100000F452C8AD35A20E40A46CD2D530D04540	17	1	2018-06-08	15965	20757.9630406646	f
2965	0101000020E6100000BD83642D41950E40FF5135191AD14540	26	3	2025-10-15	14565	96510.8125634931	f
2966	0101000020E6100000B4BA7282C6650F407BF2E10263D14540	11	7	2015-07-29	65305	97255.381071188	t
2967	0101000020E6100000D62021B2D2890E4074EC116E7BC84540	61	7	2010-03-17	8263	45387.0408303168	f
2968	0101000020E61000000C37302EAF280F40938DD7C404CE4540	30	1	2010-03-19	94137	44286.5297221955	f
2969	0101000020E610000032E0D33E98890E4079EB1D07DED14540	67	10	2020-03-04	84570	73299.6541619776	t
2970	0101000020E610000070D12FD56A730F40CB34D31266D04540	15	7	2012-02-05	13879	893.374038855987	f
2971	0101000020E6100000349EE0378CCC0E400D57293D20C94540	70	2	2020-12-10	32515	99686.3074392847	f
2972	0101000020E61000005B71DD8FFF7A0F40AB0A39D7ABD14540	69	10	2011-12-11	14982	2690.25420617046	t
2973	0101000020E61000009D10098E961C0F40F1F048B323D34540	42	2	2018-10-18	66534	46116.0999273728	t
2974	0101000020E6100000A478E3B159C90E40CAB782D467D04540	54	1	2024-09-16	43115	89946.9829105226	t
2975	0101000020E61000000E82007604870E4010509AD1F5CE4540	86	7	2014-05-17	49262	52720.5773235123	t
2976	0101000020E61000003DA3EFAED7EB0E40F3436D524ED24540	67	10	2016-04-15	43459	46903.5826987389	t
2977	0101000020E6100000DE4DDB74866E0F4041991410A6CC4540	68	3	2025-05-31	9550	95382.1637758151	t
2978	0101000020E6100000131C652FCA8B0E4043DE2E70A0CF4540	48	9	2016-07-28	11727	39846.6931878298	f
2979	0101000020E6100000436BD87620510F400D4B054A6AD14540	98	1	2013-08-13	2193	83741.9974374896	t
2980	0101000020E6100000623A7C57ACB30E40A9EC8C8D6FC94540	22	6	2017-08-19	91242	11550.704882311	f
2981	0101000020E610000086146C59EE710F403549983062CB4540	17	8	2015-11-06	46243	83120.3196785657	t
2982	0101000020E6100000D2B6726482ED0E401E8ED0E2BDD04540	19	5	2025-02-24	83085	74616.3353275659	f
2983	0101000020E6100000B53CA95EE1860E405D071C11F4C84540	71	4	2014-10-08	91282	30999.7973947036	t
2984	0101000020E6100000FF74B24E9D0C0F40BD3903E6D4CE4540	98	10	2019-07-14	66827	34108.6266379678	t
2985	0101000020E61000002B14534CBE270F40DA577B25BAD24540	44	7	2011-12-26	61595	33281.1601334982	f
2986	0101000020E610000045DA5198CE8D0F40CC736B7236CC4540	31	10	2017-07-13	44020	26487.9227516983	f
2987	0101000020E610000036DFE283414F0F40BD891E627FCE4540	27	1	2014-10-19	40197	40827.4473862709	f
2988	0101000020E6100000FFB8EAA4AEF10E403772B8CB2BD54540	80	9	2016-01-10	57405	78448.0007765736	t
2989	0101000020E61000004100623515850F4060F94383A2D34540	8	6	2017-12-18	38891	52054.615612148	f
2990	0101000020E61000004B65208657690F404E80E97C44C84540	69	1	2019-10-09	53279	19685.3402816457	f
2991	0101000020E6100000180A28DF3EAB0E40499DFAA4D2D14540	3	7	2014-10-03	30066	51674.3840053967	t
2992	0101000020E6100000AC35624BE6AA0E405E9AF92641D54540	62	9	2021-03-25	86058	69756.8573019835	f
2993	0101000020E61000009ED95534C8F40E400CB208FA9BCD4540	14	8	2025-12-02	40626	24108.2606439393	f
2994	0101000020E6100000E6AAEF2278F00E408F3522F1FED44540	70	4	2013-08-28	26163	36265.1489970614	t
2995	0101000020E6100000D32F2286ABC00E40FB4686BBF1C94540	14	4	2023-09-11	73195	1020.59912095793	t
2996	0101000020E610000002DEA00A91470F405FF5DF92EAC94540	42	4	2021-01-31	32209	48064.8237109895	t
2997	0101000020E61000002F877A2B0D790F400CD4874005D44540	67	5	2021-11-16	51860	50049.6749933405	f
2998	0101000020E6100000E6F88069F86F0F40CF31D3B699CA4540	69	6	2023-02-10	13199	21979.8785243947	t
2999	0101000020E6100000229916685A6D0F40343F1C10EECC4540	13	4	2018-03-19	30644	3813.02452654915	t
3000	0101000020E61000009ABDAEB8E7E60E40438704B273D14540	16	2	2023-10-30	21168	67919.6127378623	t
3001	0101000020E61000002C9155114BFA0E40B0365743D3D44540	63	5	2015-03-05	62325	67782.8202711342	f
3002	0101000020E6100000BC005CFE3B3C0F40005555A779CD4540	72	4	2019-10-14	13610	58675.0833000055	t
3003	0101000020E610000072210F7F43B00F401D0C933BAACF4540	8	5	2013-05-22	34317	38579.1252476778	f
3004	0101000020E6100000F732AFB95D970F409E4AD70B42D54540	43	2	2019-05-26	40957	91738.40655759	t
3005	0101000020E610000024133870F84A0F40EBA4DD9F12C84540	56	3	2023-12-28	30497	37560.9384137184	t
3006	0101000020E61000003F17D35F64DF0E40549005EBEFC74540	19	2	2019-11-17	57636	40085.1893561783	f
3007	0101000020E6100000CC43A6954B770E4071FC3EB965CA4540	50	4	2013-02-09	42500	44725.3542617597	t
3008	0101000020E61000009CCBF47A63050F40093D1FDCE5D14540	38	9	2015-09-14	85960	53404.371073501	t
3009	0101000020E610000001D0B87724020F40712D2516E7CB4540	30	5	2015-03-28	78161	77419.0073405725	t
3010	0101000020E61000001C5E5C4FE1590F405C07A5D40BD04540	10	5	2024-08-03	44973	85047.2600651899	f
3011	0101000020E6100000BCAA0ED6A36D0E403FE70E7E6EC94540	17	2	2015-04-14	83260	3402.50378839346	t
3012	0101000020E61000009BC1C371AC080F405207EB7D21CA4540	98	6	2011-09-30	55947	26732.5295812213	t
3013	0101000020E61000001B441A9F084B0F404A7295F971CE4540	36	7	2018-11-18	526	98625.765932968	t
3014	0101000020E6100000C0E7A5232CCF0E40CCA16B3CD1CB4540	9	1	2015-11-21	57898	41567.092203812	t
3015	0101000020E61000009A9C3DE00A5F0F401DD4961BA6C84540	22	7	2019-06-23	69525	63422.0812590076	f
3016	0101000020E6100000CC05FDBF42120F400A0DC44239D44540	70	10	2013-04-08	5187	18863.7037650859	t
3017	0101000020E61000008B0B9DFCA05B0F40F08247CECFCA4540	2	8	2010-08-28	58215	6093.01189313738	t
3018	0101000020E6100000433CD74BB9FA0E40DA1B9522BFCE4540	40	1	2018-02-16	15196	90035.2711368354	t
3019	0101000020E6100000314D14C7D6880F40B56A8C2292C84540	82	2	2012-06-26	86378	63435.5710713329	t
3020	0101000020E6100000785F157B2FE40E4014FBCE6AA8D04540	44	9	2024-09-11	27405	6650.18380165097	t
3021	0101000020E61000005F51F96383130F40B770F59779D44540	99	7	2013-04-21	56851	93787.2668557487	f
3022	0101000020E6100000C10F2BB8A8EF0E40B383B91CEDCA4540	8	2	2024-04-15	78824	15094.5200794582	t
3023	0101000020E610000012E1B78841100F40E6AA5BFEA7CB4540	63	10	2010-07-11	51977	56511.745080927	t
3024	0101000020E6100000664E11FDC9ED0E4076F4A056F7CF4540	80	4	2012-10-12	37311	41359.9513458462	t
3025	0101000020E6100000770F0A0F1D170F4002D07BC2BECB4540	34	4	2023-12-18	49755	35559.2000319125	f
3026	0101000020E6100000AFFA4C5A15C00E403EDBAD3AB7C94540	63	8	2021-03-20	58449	99024.1621949667	f
3027	0101000020E610000072A04DC341160F4090737CC23AD14540	59	4	2020-07-18	28472	55585.5246219951	f
3028	0101000020E6100000930CF2638C830E4031A7761F82CA4540	54	6	2017-02-19	52162	5115.72672996858	t
3029	0101000020E61000004E13BDB6E7010F40E502D71E3BD24540	64	3	2012-10-06	24304	11728.4548377134	f
3030	0101000020E61000004CD85C4A89190F404CD567C17BCA4540	77	7	2025-11-10	8793	33293.0650708951	f
3031	0101000020E6100000C940E8341E250F40EE455F7861C84540	76	4	2017-02-14	28344	32208.3620203308	t
3032	0101000020E610000060CD551B78390F40CF52CB2D85D14540	8	1	2023-03-19	98986	55056.3901059778	t
3033	0101000020E61000000B60F49BEC960E4084DC5BC105D54540	100	8	2010-06-30	20793	33038.6806766874	t
3034	0101000020E61000005A553BBC26A50F40613DE869E0D44540	62	2	2010-10-07	35635	90174.2156017924	f
3035	0101000020E6100000010C68B7C70A0F4052DDD015C1CF4540	47	5	2018-02-19	54258	96682.8540342243	t
3036	0101000020E6100000FA7AF2E02C8C0F40E99D0D0ABAC84540	100	3	2014-05-25	48979	42554.8508862021	t
3037	0101000020E61000006FBD1A29C7910F401CE2008F9CCE4540	86	6	2020-02-03	5563	14873.9227925752	f
3038	0101000020E61000008A906FEA69650E409586E85E28D54540	98	3	2020-01-02	35310	50532.0229128872	f
3039	0101000020E6100000C65B73B8E44B0F40C91B90D5BCCE4540	20	7	2020-07-13	43789	73240.7305508686	t
3040	0101000020E6100000D876ACD8C8060F40A2D2A815B5C74540	81	5	2010-04-27	38769	77551.3703688472	t
3041	0101000020E6100000AF0CD18D26720E4047A140AD2FCF4540	47	6	2022-08-23	13233	27988.3720189773	f
3042	0101000020E61000006B020826A06D0F40B4E0CA7052CB4540	5	10	2016-07-03	84073	28677.4598892519	f
3043	0101000020E6100000DD4F852AABFB0E409C8773EE44D44540	49	9	2020-08-07	8777	70072.6946974132	f
3044	0101000020E6100000C69A4DBBB9280F408CBCF9708AD34540	64	6	2024-02-15	22614	67539.338951804	t
3045	0101000020E61000007F764BE70DC10E40994CE589BFD44540	93	3	2018-03-01	7698	19122.1468060506	t
3046	0101000020E6100000EF11F517642C0F40B2DEA481DDD04540	79	3	2018-05-24	71966	42859.6874779034	t
3047	0101000020E6100000D497470F9D030F4032D33B01FDC84540	82	7	2012-04-20	52401	90405.7630958008	f
3048	0101000020E61000004D5BD959257E0F40DE46E85DADC94540	38	5	2020-05-10	63447	49053.0079215679	t
3049	0101000020E6100000E57157530A5A0F403F033F31D6C74540	59	2	2024-07-03	71581	58381.0124318139	f
3050	0101000020E610000005AB7C30C08B0F40158EA58460D04540	3	10	2012-02-20	84185	54064.6650638268	f
3051	0101000020E61000006E566B9D69C70E404A4C9DF0F0CF4540	35	9	2021-11-25	92477	87655.0709688499	t
3052	0101000020E61000002C00374A48830F40BF588EA0ADC94540	34	3	2021-12-27	480	98860.0293831176	t
3053	0101000020E61000007E2FAD21A6A20E408CE8226FC5D04540	22	3	2024-01-23	70993	75369.5974411732	f
3054	0101000020E6100000A59E984244BA0E40FDC886D6E7C94540	99	10	2024-07-19	15196	48173.1141945191	t
3055	0101000020E6100000313273F19ED40E40FFE67DD264D24540	94	5	2010-10-28	97010	43972.4237324166	t
3056	0101000020E610000086F589DAF0B70E40FF5969CD50C84540	88	5	2011-01-14	50805	12104.3594382162	f
3057	0101000020E6100000D0318DDFCB9B0F40C6F5A50C39D34540	90	9	2018-09-18	10358	47576.6615908631	f
3058	0101000020E6100000A10625BCC8660F40EBD38EF300CB4540	30	4	2014-11-30	5881	21365.7564364159	t
3059	0101000020E610000034C0CC3071810E40F2E652A233CA4540	12	3	2010-03-17	69339	21817.4187815369	f
3060	0101000020E6100000A3DB2081E3AD0E40844D576A7ACA4540	37	4	2014-06-17	1922	83282.6562390282	t
3061	0101000020E61000004BBD9535F5620F409DD492571FCE4540	30	6	2012-09-07	51353	12378.0579066948	t
3062	0101000020E61000003BC560761BF90E4087257AF5B5D44540	81	1	2024-08-20	33510	8400.13625733826	t
3063	0101000020E61000003C7EEA4BC5510F40E377288003D14540	21	4	2023-08-19	96239	51178.5723808269	f
3064	0101000020E61000001E8260905B0D0F40C30711743CCB4540	69	1	2013-11-06	23501	65622.0140968656	t
3065	0101000020E61000003DAF2C381E720F4099B11CAE51CB4540	9	10	2024-07-13	85486	8498.22992522904	f
3066	0101000020E6100000FD0489B1463D0F40BA16858653D14540	31	7	2022-07-19	28184	57066.8718735863	f
3067	0101000020E6100000ED4096D2DE3F0F4059524B2AEDD24540	22	3	2016-04-06	77777	58582.9837575964	f
3068	0101000020E6100000FB60CB1A283B0F40EF04157594CE4540	31	6	2020-10-10	33415	26244.2491904475	t
3069	0101000020E61000000454453D291B0F4088B77199B6C74540	26	9	2016-02-24	61365	88180.9029766567	f
3070	0101000020E6100000FEBD90B2F7090F402BB44BD46BD44540	19	5	2017-10-02	39518	60285.9357363253	t
3071	0101000020E6100000AC40334281310F408206A2090ACA4540	70	5	2015-07-24	24000	59155.1506094184	f
3072	0101000020E6100000BF86A97F49F70E40F5377C5559D34540	95	3	2024-07-01	1732	96177.1117935521	f
3073	0101000020E6100000D0AD76AB77920E40BF1A982453D34540	74	6	2017-04-21	15542	41294.9672253534	t
3074	0101000020E6100000EE4C603140480F40B929D658B1D14540	38	5	2025-04-03	69145	48327.5262845676	f
3075	0101000020E6100000D1BCB3CE72A10F40A412A341E4CD4540	46	2	2014-03-30	23981	71321.420801273	t
3076	0101000020E6100000CBA1D1A6B5620E4063D28D372ECC4540	24	6	2025-01-21	88082	62676.3271450917	f
3077	0101000020E6100000DCDDC1AD65650E4046B4451898CF4540	88	2	2011-12-05	10713	60424.9981916596	f
3078	0101000020E610000032DD2718615E0F40FD991E77F2CD4540	3	2	2020-06-25	74379	87269.4211376012	f
3079	0101000020E610000001C9A6CCDA680E4038A828B0C1CF4540	72	9	2010-06-25	29152	25183.0743478086	f
3080	0101000020E61000005734CF912BDF0E40B4A151F4BAD44540	93	5	2018-02-10	78954	75899.5877907054	f
3081	0101000020E61000001E0C1CD371250F40E0EB3C8AFFD24540	70	4	2019-03-16	56614	73943.4803628629	t
3082	0101000020E6100000A12B7128E61E0F40D5062DCD7FCE4540	39	10	2025-03-09	66574	32744.2089710019	t
3083	0101000020E61000001885A5CBEC010F40A24D5F4B1BD04540	83	8	2021-06-26	66575	1820.8864849244	t
3084	0101000020E6100000C4375D262AE40E405F91C99762CB4540	91	4	2015-10-14	82596	66605.886152562	f
3085	0101000020E61000005A549C94C5150F404F5022609EC94540	88	2	2011-08-06	8432	56111.2660041208	t
3086	0101000020E61000001A75237179D10E40E40705BE06CE4540	40	2	2014-05-23	29129	77669.731825406	f
3087	0101000020E6100000B6E0756198ED0E40DEB799E0E2D14540	100	5	2012-09-27	89821	40819.7139663413	t
3088	0101000020E6100000DA856016F4930E4012521D7BB0C84540	16	6	2013-10-20	47772	98324.0905139405	f
3089	0101000020E610000012F162761CD50E40F6C47FE1D1CB4540	56	4	2020-08-28	9512	35660.8680952291	f
3090	0101000020E610000014419F4553960F40730A028D4AC94540	84	10	2024-11-12	1074	41334.9095612234	t
3091	0101000020E610000004AEDA888A820F40F8483CDEECCF4540	57	7	2015-11-29	68522	15699.9997154373	f
3092	0101000020E6100000BA69ED7A28560F40C3E0D018E4CD4540	77	3	2024-04-02	48825	4599.08141997949	t
3093	0101000020E6100000BE1562801FA30E409D48F96E37CE4540	97	2	2022-09-03	5865	99861.2809438357	t
3094	0101000020E610000079554470F27E0F40754F34EFA2CA4540	71	9	2022-07-22	7917	92665.2303898556	t
3095	0101000020E6100000182703411DEA0E4054430661AFD44540	99	9	2019-05-12	78934	76497.1798625157	f
3096	0101000020E61000007B88D95BAB720F40CF22684F27D44540	81	1	2013-12-24	70878	85747.6135815431	f
3097	0101000020E6100000B6927ADF68080F4062E9D46B6CD04540	14	2	2011-12-24	92253	21844.7532744965	t
3098	0101000020E61000001663703F42480F40BDFF30CE53C84540	89	8	2013-08-22	38575	83995.1991764291	t
3099	0101000020E6100000A1C2333734B20E403A2A923A79CA4540	86	9	2016-08-24	768	78641.9263476124	t
3100	0101000020E61000001DDEFB0A2BA40F40E0221FBA35D24540	69	10	2011-12-01	11733	17949.8848767032	f
3101	0101000020E6100000A05B15E7EB670F401235926C82D04540	49	8	2020-10-19	11525	83995.8709216949	f
3102	0101000020E610000071C71A99DD7E0F40E23950496CCC4540	80	9	2017-01-06	45787	83432.8974764728	t
3103	0101000020E61000009C120EBA62D10E4033AF4A7066D34540	88	4	2019-12-17	20630	62479.0033472172	t
3104	0101000020E610000083458843C09F0F40CB73068893CF4540	76	6	2017-12-20	84651	48484.6483933694	f
3105	0101000020E6100000F6A567B94D010F404DEC302367D14540	34	9	2017-03-22	66803	94563.8270445585	f
3106	0101000020E6100000FC543B36257D0F40194113D8DED24540	35	10	2016-11-12	56617	78666.2779297905	t
3107	0101000020E61000007FFBE9CE163C0F407D36CA782CCB4540	55	5	2018-08-21	42707	48396.7974064193	f
3108	0101000020E6100000A94132D26F8F0F4093C0E7B842CF4540	49	6	2016-12-19	98894	80762.1205063491	f
3109	0101000020E6100000446F4ECB53A80F402645DC9052CE4540	61	1	2017-10-04	73422	90207.9983784417	f
3110	0101000020E6100000F50E5592AF4A0F40E732BD4690D34540	63	7	2012-09-11	81512	9668.892597045	t
3111	0101000020E61000008974702A7AC20E4058E8328362CA4540	70	5	2014-09-22	27260	17724.9934655881	f
3112	0101000020E6100000059578F7B9EB0E40C8D7C2B258CE4540	36	9	2020-10-31	68057	26985.1264437417	f
3113	0101000020E61000005F283D44229E0E4068809C3815CB4540	78	6	2017-06-01	93811	94114.6398962595	t
3114	0101000020E61000005BEC7CA2C0810E400FE24F4B85CA4540	17	5	2022-08-10	26191	16479.4652740762	t
3115	0101000020E61000005C0B87D1E8890F40DC3212E503C94540	98	9	2014-07-07	76506	95761.4228239941	f
3116	0101000020E61000007D82FA093C2F0F402DFACE8E19CE4540	29	8	2020-11-04	88291	88813.986488721	t
3117	0101000020E6100000E9D27DECFCA50F40ECA89CB7D8C94540	73	10	2014-02-10	42046	65924.2911447121	f
3118	0101000020E610000031881C22DF750F408D7148E8DBCE4540	84	9	2023-12-01	41588	70932.4794079315	t
3119	0101000020E61000004782BCD6827D0E405DE75B0DB6CC4540	35	7	2020-07-07	88590	84674.7757594791	t
3120	0101000020E61000007E3123E3BCFA0E40881DFECBFED14540	25	6	2019-06-28	54213	48123.0555818535	f
3121	0101000020E610000029A3575E05F90E401F65CBA40FCC4540	96	2	2024-04-03	11109	50078.9802799195	t
3122	0101000020E6100000E6ED00B37C9A0E4093B1565A79CA4540	53	6	2019-11-24	98676	2915.95692332542	t
3123	0101000020E610000021D4124E7FA30E401F966CF357D24540	16	6	2017-07-23	34240	22370.5171921736	t
3124	0101000020E610000033085C23023B0F40F494827B74D34540	96	10	2012-07-26	98472	31567.3685226651	t
3125	0101000020E61000001EF80A7F00450F40C3A494F52BD04540	20	7	2013-07-01	77320	3270.09440907757	t
3126	0101000020E6100000CCC533F2882A0F403589F3696AD04540	28	5	2022-02-05	40780	46473.9660340723	t
3127	0101000020E61000004C127C311B710F40BFBD42C565C84540	94	10	2014-04-28	92311	54730.4526289119	f
3128	0101000020E6100000C8D7C1DBDEB50E40A7D31036D8C84540	28	10	2013-11-11	59964	8678.14636541118	f
3129	0101000020E61000005C420CBCC1090F405720BA1A2DCA4540	23	4	2019-09-03	4553	71262.5225526274	t
3130	0101000020E6100000B7E5D5E97F040F40FF86CB6BE5D44540	100	9	2013-06-28	73399	49571.7257179031	t
3131	0101000020E610000094934EEE339D0F403F00FE3C03CE4540	25	4	2011-10-18	13187	67869.7449403663	t
3132	0101000020E6100000C1BA14B167AA0F40189FFD225FCC4540	12	5	2024-10-24	72933	61100.6913170482	t
3133	0101000020E61000007DAE87B118DA0E40BC66D9F988CC4540	94	2	2022-01-13	95806	67801.265440536	t
3134	0101000020E6100000C34497CC330B0F403E754D0591D34540	3	5	2022-06-05	57904	68302.2824253782	t
3135	0101000020E61000003C62D72991E70E40D2E1D03488D44540	87	7	2020-04-14	94802	11675.4238072263	t
3136	0101000020E610000018AC4537022B0F408C43DFF33DD44540	62	10	2020-09-14	87836	43567.6176229784	t
3137	0101000020E61000007A43C30B35CD0E40284C393495CD4540	66	4	2018-05-15	51570	84335.8157269298	t
3138	0101000020E61000005E5BDCDCB8AB0F40D04569A2EFCD4540	20	6	2020-05-04	2915	85261.8436022132	f
3139	0101000020E6100000F4C0B1AC95290F40C39F74EC8ECD4540	61	4	2018-05-06	33338	51112.0581026878	t
3140	0101000020E6100000F9F035B5118C0E409DEC07CA13D24540	80	6	2013-05-12	76643	59298.3486875341	f
3141	0101000020E6100000859481E246E10E4059582F32F9C94540	69	7	2012-09-30	85861	53864.6768521027	t
3142	0101000020E6100000EE9140B133CC0E404C1B3B3B13CC4540	91	3	2018-01-05	57862	95487.9608169958	t
3143	0101000020E6100000EE5BE3769CB80E407FC4550F70C94540	66	10	2014-08-12	16285	55856.7243221633	t
3144	0101000020E61000003708F07EBF680E40D3C65BA27EC94540	20	7	2023-01-06	75157	32640.1405223058	t
3145	0101000020E61000009B2EA125641C0F40EDB53AD0E5D04540	96	7	2015-05-30	82523	45078.6196765669	t
3146	0101000020E6100000239E97AE81010F40347EAA2D32D34540	48	3	2015-03-21	71271	1530.17791954355	t
3147	0101000020E610000092DDE9509DFC0E403CB968573BD04540	70	3	2022-03-31	25662	61095.4085270574	t
3148	0101000020E6100000A155634FD0800E40FEB1245E41C94540	8	3	2011-02-23	89866	76225.2107584233	t
3149	0101000020E6100000C1C8857D2FDA0E40FBA8EDB2F2CB4540	13	4	2023-09-29	31370	79414.9398270358	t
3150	0101000020E6100000792666E358E20E400A3BCAF6FAC84540	88	5	2014-08-07	14907	7930.04092362568	t
3151	0101000020E6100000D4D4952696C20E401C3E282033C84540	47	3	2015-11-21	57185	9256.04446229942	f
3152	0101000020E6100000F35531EBAE190F408CC5AD62D0CD4540	58	10	2011-07-18	83031	21632.0305246061	f
3153	0101000020E6100000CDBBF3716EA10E40EEB9685222C84540	62	6	2011-09-02	60913	14987.4685696246	t
3154	0101000020E61000006BB19DD2E8B40E408471CEADC1D04540	13	6	2013-09-09	70040	7432.10135875993	t
3155	0101000020E6100000CD25B0DE55A60E408D4BDA5BE4CE4540	96	10	2024-03-24	18373	23700.8202522903	t
3156	0101000020E610000058D1B8EBEF830F40FAA1321715D34540	79	9	2023-02-07	68480	22920.4023843569	t
3157	0101000020E610000070A9413071160F409C9E41CDB8C74540	48	1	2011-04-14	58802	5490.5067320387	f
3158	0101000020E6100000979A014596AD0F406E7F38D304CF4540	85	4	2011-11-25	67026	27488.9211766596	t
3159	0101000020E61000009C2B470AEC9F0F40F46F440B0ED04540	68	7	2023-12-27	68415	10829.9268729278	t
3160	0101000020E610000057A24906ACD30E4035A1CC23F0D34540	36	7	2022-06-18	34701	54621.3242205244	t
3161	0101000020E6100000F4CD7316F9440F408F62328AE9D14540	37	5	2019-09-13	50381	94629.1344795768	f
3162	0101000020E6100000C09549CEC5780F40F792952052D14540	86	8	2021-02-13	15099	93280.713966814	f
3163	0101000020E6100000C13ADDE5B1420F40DA7A33F125C94540	14	7	2020-08-17	17912	38525.2511699115	t
3164	0101000020E6100000B1EE73F0B6670E4039B923EC90D24540	96	6	2010-06-21	6254	11339.5096644423	t
3165	0101000020E61000007E02155D3FC90E40EEACE1FA1DD24540	93	3	2022-04-29	27055	64794.8249348599	f
3166	0101000020E61000009D3EF55E8E700F40A929781F71D34540	21	7	2023-03-15	37425	83249.247090369	t
3167	0101000020E6100000E3710359F8840F40DD4A84A39BCA4540	95	1	2013-07-16	60419	72972.7565922127	t
3168	0101000020E6100000AF22B6F5BD910F4037F26ADFECCE4540	81	3	2021-08-17	46942	4938.23525298396	t
3169	0101000020E6100000B17263D554B20E40A756F123AAD14540	26	10	2019-12-17	86801	5583.97411969862	t
3170	0101000020E61000006DA9767899810F406600509D7FD44540	74	7	2020-05-14	65302	31318.4832999197	t
3171	0101000020E6100000155F605346D70E40EDA74F72ADC84540	28	5	2016-12-28	89069	85795.5105341653	t
3172	0101000020E610000078D4C3D7C36C0E40C7AB7E1695CC4540	3	9	2020-07-07	27013	39468.3311791016	t
3173	0101000020E6100000FDB36385AE7B0E406B91F7EBB0CD4540	10	8	2011-07-28	3322	82761.8599170083	f
3174	0101000020E6100000521F2297A9FA0E406578D705C6CF4540	80	5	2012-11-12	1600	92140.1294569427	t
3175	0101000020E61000003E069E93E38D0E40138702D68CD34540	15	2	2014-11-15	72041	60830.4806086003	t
3176	0101000020E61000009EA263EECEDE0E40A19E728DF1D34540	39	3	2013-05-21	74807	54218.6502081441	f
3177	0101000020E6100000E8AACB0DA5E30E406DE8CCDEF7D14540	96	9	2010-06-23	79567	88126.1265113695	t
3178	0101000020E6100000EAC44E12543A0F401749FED491CA4540	9	10	2017-06-14	66558	39369.8399364997	f
3179	0101000020E610000091B371A8F8780E409E31E05EC7CE4540	6	6	2015-09-28	41300	64394.7510817393	f
3180	0101000020E610000031F35DC112F90E4052A3AD1D8CCA4540	84	3	2021-06-25	95802	11226.8688080502	t
3181	0101000020E610000044B8172BEB7F0F40348FAD9A7ACD4540	94	6	2018-12-28	18666	8625.09168400116	t
3182	0101000020E61000000F133FBA43D40E40ECE64D9FBDD24540	27	7	2014-02-05	54410	98524.8705354693	f
3183	0101000020E61000007A41D6C168670E409A3447B316D14540	39	9	2020-08-20	22998	12325.5927095001	t
3184	0101000020E6100000AE64BF312EB20E4020C128DBF3D34540	38	10	2016-07-24	99462	20869.2991508641	t
3185	0101000020E61000004539BA1F5D760E40A9F05B34DDD24540	95	7	2017-03-30	99303	11408.6016739418	t
3186	0101000020E610000002B70CEC72DA0E40EF0C588552CB4540	4	5	2018-02-24	9504	22469.4913518942	t
3187	0101000020E6100000DA993D0457870E40C957C26EA9CA4540	12	1	2023-01-31	81674	2766.75651220555	t
3188	0101000020E61000009214E8DA60C40E40D1A8AB47A1D14540	4	7	2014-01-13	11089	92813.1398306723	f
3189	0101000020E6100000782E88BCBB830E40D0300B8F76CB4540	19	1	2019-10-11	72864	55606.9883954725	t
3190	0101000020E610000088857B47E41A0F4028FA921B33D44540	14	6	2020-06-21	19049	50525.7921275792	t
3191	0101000020E6100000C068407F554F0F408B40374E39CF4540	11	4	2025-05-13	51804	62327.653006334	t
3192	0101000020E6100000FC78F03B79BC0E40375D94EF32CF4540	62	9	2019-02-19	19716	82924.2874432712	f
3193	0101000020E6100000D53DF4D3516A0E40E4122A7DB0CC4540	57	5	2021-09-26	63059	19401.4218875848	t
3194	0101000020E6100000BE68DE3080150F4099C2539BD5D14540	48	1	2020-11-06	88082	97612.7682047454	t
3195	0101000020E6100000176EEB842A870F40D149A4FC1CCB4540	37	10	2019-03-06	56404	87030.9982653278	t
3196	0101000020E6100000036C0116AE510F40DD6B838901CE4540	87	8	2023-03-12	26586	41736.7105660511	t
3197	0101000020E6100000F45CDAFCC9780E403DF27AE9DFCE4540	3	7	2016-10-27	48545	11101.490173102	t
3198	0101000020E6100000F16645536DE60E40F79E5058EBC84540	76	9	2015-07-10	59829	41911.8505264693	t
3199	0101000020E610000056D070F01E580F40A401CC9B15CD4540	22	8	2024-02-21	98205	46591.6112923387	f
3200	0101000020E6100000686D054B86870F40CD594DB6A5CD4540	98	3	2015-07-28	60791	82235.5941139186	f
3201	0101000020E61000001CD6D3B52F6A0F407B77869808D44540	45	10	2015-02-18	6460	12865.870690618	f
3202	0101000020E610000077C00CC6AFA20F40694DE35085CD4540	41	4	2022-12-11	45917	20039.643603329	f
3203	0101000020E610000039705CD711170F40B68DB56E1FCA4540	64	5	2011-05-01	35154	34950.6065802778	t
3204	0101000020E6100000315763ACA6DE0E40B183FD18B7C94540	52	10	2017-08-31	99887	37452.4924767782	t
3205	0101000020E6100000A5F49759EE960F4020F56ED747D04540	64	10	2024-07-29	18992	71185.9689196136	f
3206	0101000020E6100000831A4AF996760E40D36A6C0B99CA4540	98	9	2014-01-24	67478	54261.5826042982	f
3207	0101000020E6100000C23E18B0E5060F4019FAC617A7D24540	93	9	2014-02-14	70788	50569.4945417698	t
3208	0101000020E61000002C1FC2F122A60E40C1D6BFF563D14540	41	5	2023-06-18	18588	60203.1968872704	t
3209	0101000020E61000009800D2999C6B0F4038EFAA21FECE4540	10	1	2020-06-26	36776	92062.7352919807	t
3210	0101000020E610000032F9C46FF2DD0E40ED11C8AEF1C84540	24	4	2022-06-19	29522	45219.1707771072	t
3211	0101000020E6100000E10A804F98670E40D03A0CF601CD4540	66	8	2019-05-31	73776	94823.8565795211	f
3212	0101000020E61000008A4CED6967D30E40EFAD9F0E2DD34540	99	10	2024-06-14	60145	83182.2797221036	t
3213	0101000020E6100000E7DF89DB5E650E4065F7DB96CBD44540	57	5	2024-11-29	84273	98178.5513436766	t
3214	0101000020E61000003FBEA342169C0F401ECF85E7BFCA4540	56	1	2025-04-15	55983	64613.2442391297	t
3215	0101000020E610000064D1FEEC07FB0E40EF21FEED60D14540	21	6	2012-01-28	61936	47412.6991220219	f
3216	0101000020E61000007EDE0046233C0F4021BDED51EACF4540	98	8	2010-06-13	10576	4138.33961960792	t
3217	0101000020E610000059C0CA90E1C50E40235FA8E28ED04540	49	7	2013-05-04	5315	30886.912429477	f
3218	0101000020E6100000ADFB9DC5F8E80E4031B9834B1CD34540	44	2	2019-07-07	65261	51649.7730917494	t
3219	0101000020E6100000674E4F40C7BA0E40A8AD899333D24540	92	9	2020-02-07	7592	67431.6579809862	t
3220	0101000020E6100000130890343EE50E4082CC4FA4E2CB4540	65	2	2012-11-18	42114	33018.5316443508	f
3221	0101000020E6100000C976CE794E050F406BB131F718D04540	34	6	2015-10-15	56262	55641.3637491145	f
3222	0101000020E61000009F72A581FA840E4094D02DFCFFCA4540	3	10	2016-08-05	29884	63194.7038385467	t
3223	0101000020E6100000BD10139EFE970E402D9413065DD34540	48	5	2020-12-15	79980	17981.9743997664	t
3224	0101000020E6100000FAEDB96DD3DF0E40BB80F52E7FC84540	52	6	2012-04-26	9485	20680.9076528506	t
3225	0101000020E6100000ABCB3812AEAE0F40AF58443409CE4540	70	1	2012-08-17	53383	32885.6945445133	f
3226	0101000020E6100000A886D02AB3670F400321125BCDC94540	29	10	2024-09-18	6011	12517.5084992985	f
3227	0101000020E6100000F6320BB943810E406AFB57C818D14540	26	6	2018-02-01	97636	74713.0334905153	t
3228	0101000020E6100000597BD1063D260F404586E5AB84D44540	56	7	2019-03-11	18985	1288.99444575328	t
3229	0101000020E610000043803902D3340F40721BE79741D54540	46	7	2014-08-10	27620	22613.5329534747	t
3230	0101000020E6100000253A9AB8B9FE0E4070ECE4681AC84540	88	7	2014-10-28	39022	3902.13367220005	f
3231	0101000020E6100000EAAE621578F70E40C8A574106ACF4540	82	5	2018-03-06	15990	33557.0070787826	t
3232	0101000020E6100000F755E746BED20E407F0F968638D54540	78	4	2012-05-08	80233	37993.0615219024	t
3233	0101000020E610000090749941FE350F404D1BB45833CD4540	25	1	2021-03-19	65669	72960.5899222884	f
3234	0101000020E6100000839C0CE2487F0F40D5896F694CC94540	94	8	2020-03-10	87430	4123.21458293539	t
3235	0101000020E61000001B8EEA5075E90E40C7A26D62EFC94540	82	3	2018-08-07	45374	63009.2082632757	t
3236	0101000020E61000002FECB3DAC7C70E409BCDB9D198CD4540	84	5	2014-03-05	46233	10320.1786873597	f
3237	0101000020E61000002C08B665E1840F4006DF7914DCC74540	14	3	2025-01-23	54948	66255.619840243	t
3238	0101000020E6100000D38B354C7F940F40522BB8E70ED04540	80	5	2023-03-10	24300	46196.2191504979	t
3239	0101000020E61000006B454F34C1650E40258F42FE4ED54540	59	2	2015-02-23	36483	52966.9461685576	f
3240	0101000020E61000008A881AA663DB0E40610EA92980CF4540	1	6	2022-04-28	59855	29030.745351115	f
3241	0101000020E61000007BA86AA639AD0F40C8C232BFDECF4540	5	5	2018-08-31	89142	39339.8351743133	t
3242	0101000020E6100000D6238AED621F0F40926E4AA616CD4540	22	4	2019-10-13	91911	2064.97490300057	t
3243	0101000020E61000006C8C30839B670E4022D4618A16CE4540	50	5	2012-10-28	79105	11690.5975506422	t
3244	0101000020E61000005121C4A6C7200F4052A1CF8491CA4540	5	3	2022-04-17	51220	38839.8664410481	t
3245	0101000020E6100000AA6886F843C00E4079E946AAAEC84540	50	5	2011-11-08	50772	59765.5049676308	t
3246	0101000020E61000000D8C4D8771A20F40063AAB8937CD4540	28	9	2011-08-06	9576	9192.45143731462	f
3247	0101000020E6100000A3F7F2BC97160F405E072E8C2CD24540	9	3	2022-09-04	16318	24498.9061196831	t
3248	0101000020E6100000A3BB8BFFF0A60E402BF4C5427FCE4540	92	1	2013-08-09	94676	46500.591383264	t
3249	0101000020E610000088202EE727D40E404659B36248CE4540	4	10	2022-09-16	33394	5248.30552850912	f
3250	0101000020E610000076CE342FD27F0F4076EE6F67C5CD4540	91	5	2014-04-04	90502	41192.2578844871	f
3251	0101000020E61000007EF2F311D1580F40808380E340D44540	33	9	2023-08-23	87348	60604.3573928151	t
3252	0101000020E6100000CF2B39641D4F0F40733450CD25CC4540	78	3	2020-09-09	32172	51922.7752260625	t
3253	0101000020E6100000DF35F625C3F20E4015EB858970CB4540	65	10	2022-09-26	39768	21255.3868326066	t
3254	0101000020E6100000FE891BCDF6490F40C15858D619CF4540	39	9	2010-01-14	81136	23175.8040319696	t
3255	0101000020E6100000ECFBADABDC8E0F40BA1D268260D34540	60	10	2014-05-23	63998	12980.335636517	f
3256	0101000020E6100000C58EAA0AFE850F408CC25C02C0CC4540	40	3	2022-09-06	62935	47204.8696309249	t
3257	0101000020E61000002FBA2602E4520F408E0CD4E4EAD14540	80	10	2012-10-23	83711	65648.1229873196	f
3258	0101000020E610000071E8ACB67ACB0E40C9D8AFF3D0CE4540	1	1	2019-07-25	78582	29250.3881253862	t
3259	0101000020E6100000E9A3C7EB4BCE0E40F1C8C39B1FD04540	28	5	2016-09-01	33997	47429.8137347012	f
3260	0101000020E6100000B7BF854F4DFE0E40FC12018436D44540	35	2	2014-05-29	22424	22205.1319500071	t
3261	0101000020E6100000A3CEBA9AC54D0F407B0F816786D44540	16	8	2016-08-10	58334	72192.9838277993	f
3262	0101000020E6100000FF6D168EC3F40E406580592FBBC74540	6	4	2022-07-13	56341	42880.0924286604	t
3263	0101000020E610000071F2DC23C7230F4036667B1ACACA4540	67	10	2023-03-13	73773	47789.4713732506	t
3264	0101000020E6100000C09F05D71AA00E4004A0177E26D34540	67	10	2022-07-08	20736	31404.3258345065	f
3265	0101000020E610000075DB275B9EBC0E4056F9C2833FD54540	76	10	2023-08-31	70048	72515.2949709096	f
3266	0101000020E61000004CB12C1789850F401628432CD9D14540	88	1	2010-02-04	67286	82204.7102221512	t
3267	0101000020E6100000AE1542BCC99C0E40580147E790C84540	28	10	2020-06-20	39610	63183.914987466	t
3268	0101000020E6100000447CA195DFD90E40126EE9BE3DD04540	51	8	2025-06-03	76338	73218.6469119375	f
3269	0101000020E6100000839527054E330F40342ADCF7B8CD4540	81	4	2023-02-23	80297	80316.0891022097	t
3270	0101000020E6100000A425EA6907500F404BECD20EAFCD4540	69	10	2020-03-04	88352	86903.5709840482	f
3271	0101000020E61000006C2190FA8E810E4090E1866CCDD14540	24	2	2024-08-19	53169	24232.0875887803	f
3272	0101000020E61000001C9001BC6A0D0F405EFAC0ADC9CD4540	2	10	2023-07-26	63463	5764.91830624883	f
3273	0101000020E61000002CDDD520AD110F40D9B4C4A278D14540	70	1	2016-03-15	82553	19244.3307157109	f
3274	0101000020E6100000F7B5778106B40E40E085F53B4BCB4540	84	3	2019-08-18	25956	87165.16519262	t
3275	0101000020E61000009FE32DCD7BA50F40F74F9164D8CC4540	21	6	2023-10-03	70018	40675.1275188745	t
3276	0101000020E6100000712C99B5A2450F40EDDEA1E261D14540	96	6	2024-03-02	93183	86419.8092626181	f
3277	0101000020E6100000F05036E0876D0E407EF77FB522C84540	78	6	2012-06-29	60745	31348.7578295992	f
3278	0101000020E610000027678E2E37FF0E406E36E9D708D54540	61	6	2016-12-13	22635	76042.3576012983	t
3279	0101000020E61000003C24BBF703E80E4080F4DE762BD24540	16	3	2013-07-13	69627	71633.5018245277	t
3280	0101000020E61000007215A61D640F0F404E5D20045AD04540	91	1	2024-07-06	13585	98436.2190611875	f
3281	0101000020E6100000231A474B94B80E4045A3858440D34540	61	7	2019-06-20	69537	37310.0057391008	f
3282	0101000020E610000073278778544C0F406FBF0BD4D8D14540	41	7	2018-12-28	21405	94830.2189164416	t
3283	0101000020E6100000B9BB79C7C86F0E4031AE9C2449CB4540	93	5	2019-09-11	65409	25995.0652423739	t
3284	0101000020E6100000FD9DF15C0BEF0E40910D18BE62D04540	23	6	2017-09-16	2588	36225.1724620821	f
3285	0101000020E6100000EA39BFCFD3F20E40CA6EB96A09C84540	89	8	2022-02-14	53947	45039.9142865966	t
3286	0101000020E61000008D6BFD1D6BF40E40D469E7AE58CC4540	95	5	2025-06-10	43719	1893.00965709067	t
3287	0101000020E610000056492E003D330F40D64F1AE98ACB4540	52	6	2017-09-24	79413	27243.0507002975	t
3288	0101000020E6100000699B400D31560F40EBD56F66F6CF4540	83	10	2021-02-04	36162	5467.50930349802	t
3289	0101000020E61000004E57447F81430F40A8E389AFB0C74540	98	2	2021-03-19	83077	41808.6719578048	f
3290	0101000020E61000005CDA4CB4E63F0F40F18DC57542D24540	9	4	2017-02-12	25721	49394.007647809	t
3291	0101000020E6100000E432E10AF9A40E4006151FB82CC94540	60	10	2011-06-16	35662	39126.7390682865	f
3292	0101000020E61000009F16243B50AC0F40C566FF18D2CA4540	53	7	2014-07-04	9578	1953.26572784191	f
3293	0101000020E61000002EB9D0D00BCF0E406C0060BEBAD14540	51	7	2024-09-12	60702	54373.2548953997	t
3294	0101000020E61000000BF6F083B7350F4009E72DF91ED44540	12	2	2024-07-31	99058	88683.1081472004	t
3295	0101000020E6100000AC303630D1650F409DB7E04F86CB4540	61	10	2022-06-13	15448	32690.6525426257	t
3296	0101000020E6100000C982B9E8BB9D0F40DE6D5502DAD14540	39	2	2022-11-28	27271	15825.0847108402	f
3297	0101000020E610000071002C81F1660E40FE75CD71B4D04540	28	10	2017-07-28	69875	1108.6698231402	f
3298	0101000020E610000056CF1B68AA970E40C4499F9386C84540	76	5	2019-10-14	31053	75076.7862858961	t
3299	0101000020E61000008465F3A54BCC0E4026A12ADEBCD14540	94	6	2017-11-15	32792	52287.1417594946	t
3300	0101000020E6100000B88A4E91A1180F40832625C0BAD44540	47	10	2024-03-15	91147	30487.2241767799	t
3301	0101000020E61000009AB69C499BAF0E4029F7273354D24540	22	7	2011-01-03	6702	2352.74199233908	f
3302	0101000020E6100000269A123534840F40F68EDB341ED14540	1	8	2021-04-05	85799	38683.6498123053	t
3303	0101000020E6100000E80315CF001C0F408E8F9E6CC6CE4540	77	6	2014-09-08	98261	14110.2790417981	f
3304	0101000020E610000043897BF7560A0F4077F63AEB4AD04540	10	4	2016-11-11	87886	90412.9980359309	t
3305	0101000020E61000009EA6BEB6E7570F40F3A152F5D7D04540	70	7	2013-04-22	14776	31055.3522531278	f
3306	0101000020E610000020AA50C0C67E0E403D3DAB4F29D44540	26	2	2016-07-19	49780	87474.184444657	t
3307	0101000020E610000099771DF9CF780E40C3BC365EE2C84540	57	10	2013-08-01	4131	7943.22878468208	t
3308	0101000020E61000002AAAD4AE09090F40E45A8D7A91CC4540	97	2	2017-02-22	27492	94103.2238726868	f
3309	0101000020E6100000D7C75A19E2AE0F40A6FAF9CC4ACA4540	66	4	2017-02-11	38677	28908.1080238009	t
3310	0101000020E6100000C91E6824EFB10F404BBCC3CE34D54540	87	10	2018-05-28	8394	59685.2656685447	t
3311	0101000020E61000003388465219050F4058BDBDDD17C84540	89	3	2016-07-09	23365	50085.2980607313	f
3312	0101000020E6100000A3F6104F45610F40B92DF1C3DAC94540	85	2	2025-05-03	47088	48254.7863799745	f
3313	0101000020E6100000ABDBE835831C0F4098FE01978AD14540	2	9	2012-08-25	33014	72934.4380230994	t
3314	0101000020E61000001CD6BC6817870F404618B887CCCF4540	62	7	2018-08-14	99003	37959.4031686463	t
3315	0101000020E61000007D85C6920BFB0E409EA92F1E48CC4540	13	8	2019-10-23	81930	7530.81863403888	t
3316	0101000020E6100000C6FB911453AC0E40B1D69CE02BD54540	21	3	2021-01-30	94593	26804.5631178594	t
3317	0101000020E6100000D6CADE2E00680E40186656E037D14540	66	4	2024-08-12	30762	80956.4059124888	t
3318	0101000020E6100000074422AD00730E40A5C4F1F99DCE4540	89	7	2025-06-26	63676	4999.46425917335	f
3319	0101000020E6100000D3F70E3117B00E40231C1680EACA4540	43	5	2017-06-18	4545	10684.1566582917	t
3320	0101000020E6100000B4EEEF9D96AF0E40552DBA3BB7CC4540	13	1	2014-03-09	15021	56857.5479986839	f
3321	0101000020E61000007501A6A226430F4049DB7D1ABCCE4540	90	7	2015-08-14	4972	90578.1520351443	t
3322	0101000020E6100000B62BCF792C2F0F4090C576E316C84540	51	10	2014-11-16	94884	87538.0884321015	f
3323	0101000020E610000008D9B559A7740E405FAA501C74CC4540	47	9	2022-08-29	30114	57063.5599283613	t
3324	0101000020E6100000F2C4748EC0F50E403151AB9E1ACA4540	11	7	2013-05-12	82065	19424.450095276	f
3325	0101000020E610000052CC8DFFF5930F40E4209CBEC4C94540	62	5	2016-09-12	82847	86508.4295642382	t
3326	0101000020E6100000B727A6AC2E7F0E4000C7F66EB3D44540	72	9	2022-11-07	88273	68157.5224280038	f
3327	0101000020E610000024A08A381DA40E405EAC5D85E9CB4540	81	4	2012-06-30	43203	415.754508547383	f
3328	0101000020E61000006D01895A66240F409DD8F87CDCC74540	87	1	2011-06-12	26288	68687.6213033816	f
3329	0101000020E61000006FB69B74AC770F40B2DAC96978C94540	61	3	2012-01-18	20866	35475.6393343465	f
3330	0101000020E61000001A5F8CF9CD680E409E9A61FDB0C94540	12	10	2020-07-23	61478	9601.42227578715	f
3331	0101000020E6100000BD3A4AA2275F0F40C03717A933CA4540	45	4	2019-08-20	85354	63992.60158841	f
3332	0101000020E610000002A9300FCC720F40474A8674D6CF4540	64	6	2020-01-31	62950	42514.5510098158	f
3333	0101000020E61000008344C40A854C0F40BA945EFBB8C74540	63	9	2015-11-01	1884	94205.7057011349	f
3334	0101000020E6100000FE2F1EB321460F40A39CB61CA0C84540	49	7	2018-07-27	48760	89699.9030861859	t
3335	0101000020E610000077BEA0CF16AE0E40CF09DAE301CF4540	44	10	2011-10-31	96685	40420.4252692351	f
3336	0101000020E6100000C22073400EA40E402EBDD3DBC4CF4540	96	4	2021-08-03	47592	77071.5277579101	f
3337	0101000020E610000015491346517F0F4085BD989240C94540	83	5	2021-10-22	1356	96980.2212809129	t
3338	0101000020E6100000408EEF786A250F40C00413F568CB4540	97	7	2012-04-17	4546	91891.8049129875	t
3339	0101000020E61000002EB140646B490F40BC26B7D814CD4540	40	4	2017-08-31	53866	76064.4503599129	t
3340	0101000020E61000001C16EE0505FD0E408794237514CA4540	38	2	2013-05-12	44471	60073.7252307914	t
3341	0101000020E6100000DB3C46D1D6C80E4020A77AC95FC84540	68	3	2013-02-14	64311	68719.8696455671	f
3342	0101000020E6100000963E946939420F40B1FB458B12CE4540	60	4	2025-06-03	73336	84181.8936142102	t
3343	0101000020E6100000180F58AD3F850E403006904580D04540	57	7	2012-09-07	24132	23547.120093258	t
3344	0101000020E6100000029E723B001B0F40329B02EFFDCE4540	92	5	2024-09-15	2868	11425.6098006583	f
3345	0101000020E6100000E676873C16220F4004567F0043CD4540	30	8	2011-10-13	8901	34348.3487442151	t
3346	0101000020E6100000CDD5495B2CEB0E40493CB9151ED44540	63	7	2010-02-22	68043	97072.5423579249	t
3347	0101000020E6100000EF20FAA2C4A00E4055F138F27BC84540	92	10	2025-03-29	72932	10066.8088460566	f
3348	0101000020E6100000767AA7058F180F400CAD27E5E1D34540	18	3	2024-02-03	62482	74151.3508324968	t
3349	0101000020E610000079348E4DBFD60E407EAFDD0A66D14540	52	9	2019-04-03	50653	86045.6984006616	f
3350	0101000020E61000009AF8585FF5620E4065F8AED308CE4540	53	8	2025-08-28	7394	57708.9226690796	t
3351	0101000020E610000061791530DA5C0F401B004461BBC94540	9	7	2025-02-26	8948	58056.4766575524	f
3352	0101000020E610000089CC9775018E0E40EC92BF359CD24540	96	5	2023-05-14	3188	51267.3727430017	t
3353	0101000020E6100000FCF47C64316A0F40B31433FB10CD4540	6	9	2017-08-09	63562	62863.1499835685	f
3354	0101000020E6100000FB7282C73D4B0F4072EB260FA0D04540	18	8	2020-11-15	91462	86823.8372807059	t
3355	0101000020E61000008ED2BB38B9FD0E4023F92D3F52D14540	18	1	2015-09-24	46518	77186.7548902383	f
3356	0101000020E6100000E5E53C8C10610F4011663A4536C94540	98	7	2022-04-17	38841	73488.4996075343	t
3357	0101000020E6100000DE0AB32469040F400C05772B06CD4540	71	1	2010-06-12	13917	53022.8094718024	t
3358	0101000020E6100000D6C46FAAAD820E40FB706F5114D34540	85	9	2025-05-04	15779	83553.470444393	f
3359	0101000020E6100000B60862E2F3740E4096FC3FC8BFD34540	21	3	2016-05-05	58673	94906.9383979967	f
3360	0101000020E6100000D3E52F7F099F0F403511937508CA4540	76	7	2025-04-18	47931	57469.1724369819	f
3361	0101000020E6100000867C2E94FE4D0F40A1175D8290D34540	63	7	2014-05-27	18707	58736.2889780725	t
3362	0101000020E6100000BA5603338D690E409F6C36157BD34540	74	9	2025-07-21	23464	47144.377369947	t
3363	0101000020E610000047A7A26631010F40C1E329D5DAD04540	50	6	2011-12-01	94376	19479.0311346936	t
3364	0101000020E6100000F805B51DDB760F404EC5AEE788CE4540	6	8	2012-01-05	87697	43485.8193789173	t
3365	0101000020E6100000917A89197EDD0E40D2B4947116CD4540	63	8	2023-08-14	81304	40094.616074241	t
3366	0101000020E61000008E5BA03BA8540F405E3B76BD71CB4540	33	4	2020-07-15	14841	83011.8253078754	t
3367	0101000020E61000005C77223006530F40EED610409DD14540	49	7	2018-01-31	30801	32060.2725022588	t
3368	0101000020E6100000D43EC88F4C930E40559985BDD0CA4540	47	7	2022-08-29	82448	32828.4409869274	f
3369	0101000020E6100000EFE6270D3B7B0F40B44F510111D34540	34	7	2019-06-04	9977	24758.4035681098	f
3370	0101000020E6100000FA713EAA94F50E40980F8C03AAD14540	69	2	2023-03-24	77312	8764.55684778794	t
3371	0101000020E610000082943D6000EF0E405CB6AFD16AC84540	8	2	2010-12-15	79224	81690.7771211315	t
3372	0101000020E610000047197497DA210F40968D6AB89AD44540	66	4	2016-06-21	11503	33938.4468969409	t
3373	0101000020E61000006B71C8B5C86D0E40AF51B4AA14D04540	27	1	2013-08-17	78922	53189.6502765981	t
3374	0101000020E61000000088654F7C7E0F40028178746BD34540	51	1	2017-08-08	78694	41711.7111659359	f
3375	0101000020E61000006E29D4A7A08F0F4058C99758A3CF4540	10	9	2012-01-21	68470	36169.3305495876	f
3376	0101000020E61000009B8057F0BD5C0F40DCE3ECD30BD54540	17	10	2018-09-02	51621	40772.7887097495	f
3377	0101000020E6100000D29A0540E7E60E4025913ED1ECD14540	88	8	2023-09-07	14313	51835.9858499264	t
3378	0101000020E6100000BC53CED2BE330F404A42A7B6FACA4540	69	6	2012-03-31	22266	5975.9584171563	t
3379	0101000020E6100000A240527B733E0F406973ECC6CECD4540	20	3	2018-03-07	51911	29728.7333491731	f
3380	0101000020E6100000ADBF4F5CD7970F40F7087B9957D34540	67	8	2025-05-22	63301	75246.8242079745	f
3381	0101000020E610000022E371DB35CA0E40E2D82365EBCF4540	17	8	2018-03-08	799	66542.2983043505	f
3382	0101000020E6100000BFA52613B2890F40A2EEC40DDAC74540	2	2	2023-06-23	36925	46487.7610501719	f
3383	0101000020E61000007C9E7F29208F0F40BBC6D6D627D04540	99	4	2021-06-19	30620	46573.0537743259	f
3384	0101000020E6100000CC1998DF13C00E40AD3ADFDD96CA4540	94	9	2013-04-02	80902	40347.1869060654	t
3385	0101000020E61000002EAD05FD7ACF0E40D8D61EAC63C94540	81	10	2023-10-30	12175	99738.5054934931	f
3386	0101000020E6100000E26324F507530F404CE1A52A03D34540	45	2	2018-04-29	31785	30176.6717297298	f
3387	0101000020E6100000C09E20FE32110F40333A45E7D0CF4540	43	7	2010-01-01	38923	17082.0894424054	t
3388	0101000020E61000009626E96235F40E40DE5987DB7BCF4540	39	3	2023-08-10	90890	43441.4684275235	f
3389	0101000020E6100000EA692A6BC4ED0E403C445312CBC94540	67	8	2011-09-25	59142	86257.8030242252	t
3390	0101000020E6100000CC688A438C4A0F40EB38FC06EECD4540	51	8	2020-04-21	38470	49701.055245834	t
3391	0101000020E61000004B2236EE1DCC0E405BCE4DF20BD34540	18	8	2015-02-24	52562	41907.5635749036	f
3392	0101000020E610000086EB0B9F13EC0E40A856A170D9C74540	60	7	2024-06-06	71081	12176.2697608764	t
3393	0101000020E6100000C2882DB981B80E4028A6F53D07CB4540	17	4	2021-06-17	41024	86000.8563549543	f
3394	0101000020E6100000131BE9B7B23C0F409B06C3046AC94540	52	6	2014-02-18	12177	72668.1631249787	t
3395	0101000020E6100000E961D74ABE960E402DC59601C2D44540	100	6	2017-03-01	82591	46055.2691939503	f
3396	0101000020E61000007CEB99CDCCB30E403E2BFBF7DECD4540	96	2	2011-07-13	10342	40228.54679551	t
3397	0101000020E6100000649E9114B98C0F409EAE499070CB4540	3	5	2025-10-23	64852	87492.157446018	f
3398	0101000020E6100000DCF95933D89E0F400AA0ABAEEACC4540	75	2	2013-08-03	42022	24329.7118032668	t
3399	0101000020E6100000A72DF8F0A8380F406B107359F0CD4540	13	5	2021-11-24	48414	46740.0398534805	t
3400	0101000020E61000004CE0FD8BD91C0F40F32E27332DD24540	37	7	2014-07-16	48199	93396.0241525948	t
3401	0101000020E610000069416D618A1F0F40CC56E58D0AD14540	54	4	2014-02-26	22139	94319.0220289119	f
3402	0101000020E6100000B4C415414C1E0F40D5E5D70E5DCD4540	72	7	2024-11-02	15400	80609.448848428	t
3403	0101000020E610000007AD3334AF1B0F40DF520E8969D34540	48	4	2017-02-28	37120	56705.3503587712	t
3404	0101000020E61000003BECA5EDB5790F4073273CFC41D04540	36	9	2014-04-23	27555	62978.6206246967	f
3405	0101000020E6100000A12B4710CDFD0E40AA640662DDD34540	85	3	2025-02-25	49291	85314.0217449596	t
3406	0101000020E61000000859B3A8DA810F409F4C3D4216CF4540	72	9	2014-09-02	22061	54288.0491462955	t
3407	0101000020E6100000710E35270BC50E40950BA8B4EAD04540	83	5	2022-12-02	21826	4477.71941501631	f
3408	0101000020E6100000189A6FEAC0BE0E40DA6CC7817FD14540	22	6	2021-02-19	87002	85482.5697247331	f
3409	0101000020E6100000351D8BAAE0300F409365CACC38CB4540	95	7	2012-06-21	27472	30927.2510733389	f
3410	0101000020E610000040A85A8263650F400B676E9DA7C84540	38	10	2010-11-13	56083	34896.3696377743	f
3411	0101000020E61000001902079DB51B0F4042F721A0A0D44540	14	2	2012-10-29	98	62350.0711161862	f
3412	0101000020E6100000F635A2EFDC650E409528E027E3C74540	2	2	2010-09-14	35604	22158.4952254492	f
3413	0101000020E6100000D25280F855A00E409493B9F34ACA4540	94	7	2024-09-08	78531	53164.238096299	t
3414	0101000020E61000008E20624AC8710E4017304937EAC84540	18	6	2017-10-07	39074	21518.9496407007	t
3415	0101000020E6100000AB82BA725E6E0F40381C0C45EDD24540	86	1	2025-06-18	16537	71954.6274703702	t
3416	0101000020E6100000247429EC8D460F407707931C0FCA4540	98	3	2011-04-11	66689	63388.0440294998	t
3417	0101000020E610000022127155DEA70F403B536B2A6DCD4540	1	7	2019-01-16	51238	26915.7055069516	t
3418	0101000020E6100000E44F8269C76A0F409F7AD4A7C6CE4540	93	1	2013-06-26	88104	22795.2623397795	f
3419	0101000020E61000004270DDE0B9280F40ED03CFA318D04540	12	5	2017-12-19	57765	18880.4302894267	t
3420	0101000020E6100000703E3B13437A0F406215B6D913D34540	63	5	2024-04-18	30220	4674.06353162749	t
3421	0101000020E61000009083E159BB880F40D71419ED28CE4540	56	2	2024-10-27	89752	18770.4892207038	t
3422	0101000020E61000006579A040CDEA0E40B3E66D3C3FCB4540	85	9	2019-06-18	50669	22235.2827164562	f
3423	0101000020E610000044C4F708ECA60F40B5D3B9A6A3CC4540	93	4	2017-05-27	37611	58016.7722349036	t
3424	0101000020E61000008A51581699960E40086CAA5352C84540	58	6	2013-02-08	76491	49480.1698113176	f
3425	0101000020E6100000BE28CBC4ADF90E4026832438A3CB4540	52	2	2024-10-28	26403	55136.3844698989	t
3426	0101000020E6100000B059FFF719460F40107F0F1C29CA4540	47	2	2022-11-12	12227	68894.5976797505	t
3427	0101000020E61000008E2DC4723F7A0F402A5C14E9E0CB4540	5	1	2012-07-29	87246	6596.63845575114	f
3428	0101000020E6100000438E18FA87910F408D5D9CE242C94540	94	9	2022-07-23	13101	93306.0400484469	t
3429	0101000020E61000008641CBCAE3F90E402CFAF05659CE4540	16	9	2024-06-02	52129	60890.8549628517	t
3430	0101000020E6100000E175B74EE8E10E40D5B2D85752D24540	60	3	2017-06-11	51895	39613.0312153052	t
3431	0101000020E6100000786DCE34F8100F4029EA3C8567D34540	72	8	2011-08-26	62922	6732.63942783506	t
3432	0101000020E610000004172AFF58050F40C3DA1846AFC94540	93	4	2021-12-21	38333	64493.1925624061	t
3433	0101000020E610000049142218E7A20F40628EEEC6B4CF4540	69	8	2018-09-23	11773	77211.0074100622	f
3434	0101000020E6100000DBCD8B27CCE10E40CA543F9EB0C94540	73	7	2013-01-08	51875	57041.0882354584	f
3435	0101000020E610000055D2E9F94A380F4096D3547296CE4540	81	4	2020-06-30	29733	28262.8002039894	t
3436	0101000020E610000088089AB833700E40B521440DA9C84540	49	9	2018-01-08	43943	61888.8777032352	t
3437	0101000020E6100000CADF7C73005F0F40CE4E54AE6CD34540	79	2	2013-04-04	37059	4408.47547672016	t
3438	0101000020E6100000EBA2BB0E78170F40828B4DBB0DC94540	85	1	2010-12-25	75154	99327.1567040939	f
3439	0101000020E6100000663B526A32FE0E40CAF65094C8D24540	19	2	2022-07-11	5994	58151.7126585624	t
3440	0101000020E610000037DD26623D640E408153E8268DD14540	97	10	2015-12-16	35889	27395.9165132934	t
3441	0101000020E61000005B41DA93251B0F407C193C2FE7CA4540	71	9	2015-07-12	66215	32299.4521846403	f
3442	0101000020E61000006414320232E70E40218D0D492ECD4540	41	7	2019-07-24	60927	61781.4815699634	f
3443	0101000020E61000000B100C2643910F4040BF9FE5CFC94540	60	5	2011-10-01	97703	36770.4596294294	t
3444	0101000020E61000009656E28BC85A0F40265082DD4ECB4540	13	5	2019-05-13	17564	21169.5366977298	f
3445	0101000020E61000004E058B1E74A90E40D0EEA21438D44540	68	7	2010-05-29	41870	39233.222017135	t
3446	0101000020E610000072813CBA58E80E402903747F2DCC4540	28	3	2016-01-06	9833	39904.0333989132	f
3447	0101000020E6100000332CBBB043A80E4088BFEEF7A5C84540	33	10	2021-06-27	58622	47316.1234297847	t
3448	0101000020E6100000826CDAC5CCDA0E40BCC7154FDAD34540	92	8	2024-05-02	15221	33611.2590128123	t
3449	0101000020E6100000807F6BDABAF10E4018C275F408CC4540	77	3	2019-11-23	46088	20682.7638052712	f
3450	0101000020E6100000F99D43B3AB460F40FEA002AD27CD4540	31	3	2018-03-22	14330	75972.8840116762	t
3451	0101000020E61000001A5F162280B10F40BBAAC3891BD14540	24	4	2024-12-10	13627	96167.5249484516	t
3452	0101000020E6100000FEEBFD18B0C50E40BD15299134CD4540	57	8	2013-07-12	73219	82898.5203271588	f
3453	0101000020E6100000ECB52E82D1270F403B74073F03CF4540	22	8	2022-03-07	54408	2714.99601943519	t
3454	0101000020E61000000BBBE2CA5B6E0E40BCC3D035F1C94540	64	10	2019-01-19	68534	74257.9828264425	t
3455	0101000020E61000000D35683965EE0E402B0C944D29D34540	45	3	2015-05-31	25909	79341.1047320713	f
3456	0101000020E610000044D6FB291DAE0F402258D6F3F3D44540	29	7	2019-03-04	36880	76675.5271329728	t
3457	0101000020E61000009E8A952C0FB60E40D3FC43BF62D24540	47	3	2017-11-24	19486	83548.5039051771	t
3458	0101000020E6100000D815B919DCC20E4016F2855509C94540	23	1	2019-02-22	96120	951.86298890908	f
3459	0101000020E6100000F8857586597C0E40FD066BD9B9CB4540	48	10	2024-03-15	47365	26128.6845305542	t
3460	0101000020E6100000967FF3C4168A0F403BE32DD7A2C94540	71	9	2017-05-16	80233	17958.0879736214	t
3461	0101000020E6100000E613DAC22CA50E40D3ED77A916D04540	49	7	2015-05-10	90998	88469.3605443488	t
3462	0101000020E61000007E5C99DB789C0E40AD634AF8D5CE4540	97	1	2024-10-22	28143	72278.6632386282	f
3463	0101000020E610000031BEE3DC7ED50E409AC16E69B4D04540	93	3	2017-02-16	53464	19637.1024708461	t
3464	0101000020E6100000DC625CD72B820F40982B971412CB4540	48	7	2012-01-01	18823	4816.3391472194	f
3465	0101000020E6100000E46868F13CEE0E402139677181D44540	32	7	2022-02-13	83482	22065.8249096785	f
3466	0101000020E6100000DF4B157D03560F40D6E58D84D5C84540	16	7	2011-11-13	28784	38826.0203659222	t
3467	0101000020E6100000F87FE0C29F8A0E4063A51D236DCD4540	51	2	2019-10-21	6324	58279.1081715408	t
3468	0101000020E6100000D7375C40ADA70F4068BE5E94D3D34540	58	4	2015-11-03	84373	71173.9732960199	t
3469	0101000020E610000097553410F6520F4040314A219DCD4540	29	10	2024-07-25	65585	23895.0269675836	t
3470	0101000020E610000013654AD4022D0F408D318253F5D14540	81	6	2020-07-11	7370	81169.0185803025	f
3471	0101000020E61000007EBD36787DDC0E40B073B75D30D34540	13	9	2017-01-22	43619	64480.8014301129	f
3472	0101000020E6100000F3A70FB3CB800E40D05C7336C2CD4540	78	3	2016-12-31	85915	51866.2985195735	f
3473	0101000020E6100000F1F6664C10B60E40E000CAF4F5D04540	22	3	2022-07-14	86350	2914.49230168395	f
3474	0101000020E61000004976A3D0FD6E0E40CFFA7AFBC6CE4540	90	10	2013-10-26	99320	78370.8512460632	t
3475	0101000020E610000090347FEAB7CD0E40A0B00825E3CD4540	52	3	2025-05-09	33684	91074.9688979903	t
3476	0101000020E61000001029AA45C6210F405D78B1978BC84540	9	1	2010-10-22	87846	68803.9749514886	f
3477	0101000020E61000005593838A21B00F407D7647EDD8D14540	89	3	2024-12-30	20878	36624.3854670098	t
3478	0101000020E6100000A51F86B34D640E40BA291CD8A4CE4540	40	4	2015-08-19	70394	42254.5873323354	f
3479	0101000020E6100000590A951EBFB90E40FAF06ABB1BD44540	20	3	2025-11-11	11101	87515.3014905714	t
3480	0101000020E6100000CF8159CAA4890F403E722E64F0CC4540	3	10	2020-02-17	14552	12472.4561525186	t
3481	0101000020E61000001158D2873A780F4057748E5792D04540	43	10	2025-05-22	17986	22867.9181082112	f
3482	0101000020E61000004A8D642295880E4017D2FB3617D14540	65	2	2010-06-24	59430	69425.3823575025	t
3483	0101000020E61000008486440B0A5F0F40D5AAC03828D34540	23	6	2010-04-20	91967	59868.2938491189	t
3484	0101000020E610000001CF585DCD4E0F403E39F43DB9C94540	32	4	2012-11-15	55671	13767.9087444545	t
3485	0101000020E6100000A24F98CFA51C0F40699799DC75C94540	31	6	2024-11-19	45686	52625.1780254524	f
3486	0101000020E610000009C47B54A3C00E40F323A87508D44540	81	9	2018-02-20	67369	44331.6162690688	f
3487	0101000020E6100000E1E96C94B5B90E404B512AEF89D14540	15	10	2025-11-05	23206	82113.7677283931	t
3488	0101000020E61000006E5CC76338B30E4060E520531FC94540	89	1	2025-12-06	62234	7409.89638109852	f
3489	0101000020E61000005A128FCA16300F409F893039A9C74540	40	5	2015-02-26	34335	93686.8091824798	f
3490	0101000020E6100000CB46137E02BF0E40E7C9A3FAE1C74540	55	3	2013-03-16	61080	90075.5308850441	f
3491	0101000020E6100000636B3A73AF180F40B38957FD29D14540	63	5	2017-09-08	44617	71619.2158904154	t
3492	0101000020E61000006D54F141D3000F4096E6BE465ACB4540	51	10	2014-07-07	34109	95253.6748844353	f
3493	0101000020E61000003D75B84A6B8D0E405B0722D40ED54540	92	2	2013-01-09	61153	12511.3893360366	t
3494	0101000020E6100000A359557BE3940E401072417210CE4540	77	7	2022-04-29	18389	10462.1026289855	f
3495	0101000020E61000002174477A97FD0E40FEB26362BDCF4540	82	2	2010-12-28	34824	71266.207067432	t
3496	0101000020E6100000F593C3EA22EC0E40E5B550246FCD4540	57	9	2017-10-01	12322	78995.927356302	t
3497	0101000020E6100000EF441C4B31F30E40FEB0DBC701D04540	69	10	2010-05-16	32425	94558.792564793	f
3498	0101000020E610000074C6BCA234680F40459D73D9AACB4540	98	1	2022-10-23	40801	90739.4521894202	t
3499	0101000020E6100000D63BFBE0899A0F408FDA91AB39CD4540	27	5	2010-11-27	68575	23845.8599439034	t
3500	0101000020E6100000BE162BDC6B050F40DDAD0B1992C94540	48	8	2021-08-28	51456	98685.6544418922	f
3501	0101000020E610000047C9F1CE32B90E40BBC1F81313CA4540	28	9	2018-08-29	20106	46181.8384821569	t
3502	0101000020E610000099AB6EB92C690E405436771F8FCA4540	46	9	2010-08-03	66539	89535.0443933105	t
3503	0101000020E6100000241DB4E105D20E4078AA3B84CBCE4540	90	3	2019-06-09	63537	28004.749363582	t
3504	0101000020E61000009FE976BC7A9D0F40C1E67CB082D14540	41	1	2025-05-25	30403	25107.9105588361	t
3505	0101000020E61000009FE277B6C7700E40EA97FAF81ECD4540	74	6	2010-01-04	70544	99640.6054479911	t
3506	0101000020E610000044B54DF763660F4017511294E7D34540	31	4	2012-04-03	4893	50812.3199566358	t
3507	0101000020E6100000F2726B96FBA50F4024C995037FCC4540	66	9	2019-10-18	86162	49336.4808083962	t
3508	0101000020E61000005C36192651A30E407437C7699FCF4540	83	3	2020-08-07	44868	42615.9081719373	f
3509	0101000020E610000054A7FDF868B70E40C444536F4ED14540	40	5	2010-10-31	86414	90499.1668894724	f
3510	0101000020E6100000654F052E8F790E40CB86851F64CD4540	94	3	2018-05-15	47978	95167.8881015828	t
3511	0101000020E6100000E94D719EDFA10F408474560693D14540	10	7	2015-08-30	73495	3711.86290351164	t
3512	0101000020E610000008A4B1B149670E40982BA2F79BD14540	70	10	2019-06-01	36662	36181.1871010996	f
3513	0101000020E6100000312C312B04850E40D9BEF7BBCBD44540	42	6	2019-06-06	16541	93688.2326404232	t
3514	0101000020E6100000174381B045250F40888A4792DDD24540	54	4	2019-02-06	58301	37948.0840883227	f
3515	0101000020E610000016B2A121A0640E40D59356B707C84540	13	4	2025-04-09	75581	20308.8251591527	t
3516	0101000020E6100000F6B9F36878DF0E40510AAE9208CC4540	65	2	2021-06-09	35703	82087.9015608179	f
3517	0101000020E6100000CA488F5A55AB0F4019CAFC6A05D34540	51	3	2014-12-11	6612	75836.4954856088	f
3518	0101000020E61000001631B805F0F40E403BA69A9394D34540	40	10	2016-09-26	87434	45587.508018263	f
3519	0101000020E6100000CE226E5C73680E400AFD1B30F1C94540	18	4	2025-01-03	22285	92289.0948185001	f
3520	0101000020E6100000A744521E3BD90E40C1C88281AFCD4540	81	7	2016-05-23	10953	27413.7396251132	t
3521	0101000020E6100000AC16F7F656370F4058C92CD095CD4540	88	5	2020-06-24	52132	26372.9153376043	t
3522	0101000020E6100000A75A18AFFCDF0E40BE3404A704D44540	84	8	2023-10-08	68915	84045.2373682558	t
3523	0101000020E6100000E7487BE178810F4026D33F9193C74540	83	1	2011-07-03	34363	75241.7742261253	t
3524	0101000020E6100000832EC430F57F0E40D6277D8CD0D44540	50	7	2019-06-13	82857	88334.5141806976	f
3525	0101000020E610000000C85F2A0EC40E40E0E0C91E44CA4540	56	8	2011-07-30	54684	76818.416018849	t
3526	0101000020E6100000D68DFC62EDAE0E40D9B56C2DA6CB4540	76	8	2024-01-29	62644	73326.5535784332	t
3527	0101000020E6100000EC221076D0700F401532491352CC4540	15	7	2024-07-26	61411	36259.610982932	t
3528	0101000020E610000026B51AD812930F40EFB9014473D44540	31	9	2014-05-25	23339	74656.3087105784	f
3529	0101000020E6100000DE123EFD596A0E4046982D7160CF4540	13	6	2025-10-19	43496	99066.5114269726	t
3530	0101000020E6100000C6DB0242F9880F400940E4B821CD4540	10	6	2015-05-02	6304	84100.5945477548	f
3531	0101000020E6100000690AB3C44B630F40BEE9EA960BC94540	10	7	2017-08-04	34026	17750.4241009708	f
3532	0101000020E6100000CE4D5FB94F960E406FD46819F6C94540	3	3	2020-06-12	78634	18983.7015090753	f
3533	0101000020E6100000034AAE5C71600F409BD7066324D14540	49	7	2020-09-08	1809	2178.95599846236	t
3534	0101000020E610000067403EFA47430F4007560BFFF0CE4540	95	4	2015-09-11	70332	83069.7001797752	t
3535	0101000020E61000004E5C79180A510F40DF2B30041DCB4540	77	9	2022-09-02	22861	26574.7769826719	t
3536	0101000020E6100000C9EAC1A02B840E404D41A85605C84540	97	7	2010-07-10	53870	66230.1096198075	f
3537	0101000020E610000062B82B7E3B490F40AE5B3F9747D04540	18	7	2016-03-22	40289	6368.89559116824	f
3538	0101000020E61000004CA3FEFA79210F407B7C8B43D2CD4540	3	7	2019-03-26	47320	16809.9534167676	t
3539	0101000020E6100000F43021DA737C0F401837729AB3CC4540	83	8	2014-04-04	71575	16532.9575478139	f
3540	0101000020E6100000661A755D67980E40C52B881FA8CD4540	94	7	2024-01-22	98171	99376.6801390614	f
3541	0101000020E61000006D97A81B716C0F407E29AD429CD44540	20	1	2013-06-16	98614	15767.3266927834	t
3542	0101000020E61000003A59FF8908970E40E327874C35CD4540	24	7	2022-01-05	43809	84689.9600070681	f
3543	0101000020E6100000FA7D686846820E409A4B2A4694CF4540	67	8	2018-03-02	39143	24089.5229885228	t
3544	0101000020E6100000DC32F8BA025F0F4006869340F6D44540	9	4	2025-08-06	21817	59011.2117474357	t
3545	0101000020E61000008D39ABCF8B9E0F404522756882D24540	2	3	2019-05-12	94537	68953.9349749417	t
3546	0101000020E6100000C9A9BA7CA0280F403C94ADE446D14540	85	1	2015-10-07	36188	75467.5978294486	f
3547	0101000020E6100000D8588033FA6B0F407BA792999ECA4540	96	10	2020-07-05	71678	14649.2024881202	t
3548	0101000020E610000032B7C062E9970E4033F5940D42CF4540	55	1	2016-12-09	28246	67052.72013924	f
3549	0101000020E610000036031F9ADB8D0E40CC392EAF51D54540	20	7	2013-07-17	52241	26638.215938537	t
3550	0101000020E6100000CF660BC587D40E40F98AA30D3BCA4540	57	6	2018-12-03	40866	78524.1744857416	t
3551	0101000020E610000067E7C1E2E3D80E406C9525D3F6D14540	60	7	2015-02-12	55452	61085.4778450123	f
3552	0101000020E6100000C86B1284799E0E40B24AD07A39CF4540	22	10	2025-01-02	88011	383.726170779486	f
3553	0101000020E61000008DC1FD8AD2E10E40208F4C4F1EC94540	51	5	2022-12-29	74409	74827.3363451318	t
3554	0101000020E6100000B54CB66C3CF40E405F0CDFFE45D44540	31	9	2011-06-06	61787	3272.42784207364	t
3555	0101000020E6100000499D907CC4200F40D5BB76D883D34540	20	9	2018-04-14	13184	2925.96172459012	t
3556	0101000020E6100000639BB5A262600F404AC27211DCCF4540	96	9	2010-01-18	41200	97734.826071125	t
3557	0101000020E6100000998DF787DBFF0E40B0EC3134FCC84540	81	1	2016-11-18	26177	87877.6542597627	t
3558	0101000020E61000006F8E778C592F0F4017CDD140C1CB4540	79	3	2023-08-01	18	19895.1356787109	t
3559	0101000020E61000005C38BAF280A40F4076DBBC217BD44540	94	3	2019-02-25	62720	30958.0292668754	t
3560	0101000020E61000000CC05CCBFD550F4083FB00D98DD44540	34	2	2015-08-04	11258	8903.12114676193	f
3561	0101000020E6100000119AC3F2487F0E4091564B64F2CA4540	9	8	2025-09-12	46616	86536.7832168249	t
3562	0101000020E610000072FBDAB71F9C0F40B83755E367D44540	93	10	2012-04-09	12299	10486.3741580482	t
3563	0101000020E6100000CC0EFE20608A0E40316BF95EEAC74540	70	9	2018-03-31	3748	72425.6163468203	t
3564	0101000020E6100000592C886D2CE60E400889A06317CE4540	25	2	2024-08-01	65433	57966.0834311962	f
3565	0101000020E610000065BF503EE5A10F40E1260EB421D44540	47	4	2012-07-23	96485	39298.9443485654	t
3566	0101000020E61000009E987714FC8C0E40A15AB91825CD4540	28	4	2017-01-19	20023	35407.4466461881	t
3567	0101000020E6100000C71DD19B498F0E4095AD0CE913D04540	82	7	2013-01-15	45559	22881.7832865537	t
3568	0101000020E6100000D8B8C203EDFD0E40120F44852EC84540	100	1	2015-02-21	45838	91030.458969861	t
3569	0101000020E6100000BD2615E594AE0F40486CE012B0D34540	97	4	2017-12-02	10089	79304.2919971817	t
3570	0101000020E6100000B54B09937A6A0E40C515C0153FD14540	55	1	2010-04-23	84877	48505.8737070466	f
3571	0101000020E610000004E5B90B09A80E40484DCFD33AC94540	7	3	2025-07-31	73799	35540.4037550562	f
3572	0101000020E610000097A8A6FD2D990F404B0527E302D24540	25	3	2011-02-12	39966	46498.5799389971	t
3573	0101000020E6100000901C7F1187040F40BBDBA0123BD44540	10	2	2014-12-16	31252	55966.3666484701	f
3574	0101000020E6100000BCD6FA8FBD930E40B0F25BB6DDD44540	84	5	2011-03-02	36043	37336.0926876748	t
3575	0101000020E610000012951D2FFA750E40A93FC90F3ACB4540	13	5	2023-05-28	36941	99058.9137865959	f
3576	0101000020E6100000AB73A8F3AA960F4085F7DEEF9DD04540	52	2	2016-06-17	94186	4660.78784670112	f
3577	0101000020E6100000337E1024EAA00E40A788D769EBC74540	50	6	2024-12-12	54423	47648.1672649513	t
3578	0101000020E6100000A5C4882E52A30E405AB6A28C01D34540	32	5	2025-07-15	17014	89879.7663046591	f
3579	0101000020E6100000C43056AEE5C80E402545DD5C8ACB4540	17	7	2012-02-27	13241	23308.3355996897	f
3580	0101000020E61000009FD2C62EF5FC0E40FB871F92C8D34540	78	1	2020-05-16	36261	40688.6956490116	t
3581	0101000020E61000003069A9D65DA40E409FB99CB149CA4540	66	10	2013-12-20	69525	58312.0554024849	t
3582	0101000020E61000004812D01BD2580F409E4A33568EC84540	97	6	2013-11-04	1688	67827.9508828556	t
3583	0101000020E6100000C7D78D27428D0E4079D727F5E8D44540	59	4	2014-11-04	9110	91440.9737143085	f
3584	0101000020E6100000E2E13D4995880F4030E6EF5F43D54540	32	3	2025-04-02	22731	82132.0534472037	f
3585	0101000020E6100000E933E757D0F80E40D83517F431CD4540	53	7	2017-12-15	21651	92910.02778338	f
3586	0101000020E6100000136A113F89F50E400F233DF8A8D04540	37	7	2013-04-06	81343	80211.3706033233	t
3587	0101000020E6100000087CF0FE12700F407B1336FA0AD34540	37	7	2025-02-10	93026	24401.2615083043	t
3588	0101000020E61000001B7A16A527530F404ECD893FC2D34540	32	4	2015-06-29	38756	95246.0941260197	t
3589	0101000020E61000003CAAB59BF1D00E4042791A45C5CF4540	63	7	2021-08-05	27000	58983.0878837403	t
3590	0101000020E6100000F06E6FBEF57A0E40640AAB693FCC4540	45	2	2022-01-27	18295	8527.13768472151	f
3591	0101000020E6100000ACFC791387E50E40B79A7F5095D04540	11	5	2014-03-11	17598	21068.3826489173	t
3592	0101000020E6100000F35467B5D9900E409CEC74954AC84540	55	6	2010-02-07	9955	82856.8129774273	f
3593	0101000020E6100000797DFF5349BD0E40CCD0CFF02DC84540	18	2	2021-01-13	65643	51959.5552440963	f
3594	0101000020E6100000EE4623533CCD0E40C79B731574CE4540	15	4	2025-03-03	53216	22063.031270669	f
3595	0101000020E61000005A214C08A0DF0E405C2ABC6BB8D34540	96	2	2024-09-05	65183	16096.7255638611	f
3596	0101000020E610000035840814CDE40E40F6EBB92DB8C74540	75	10	2015-03-12	37146	64985.7961748579	f
3597	0101000020E6100000AA83A4F9A96D0F402979EB6AB2CE4540	25	2	2011-08-24	74109	43765.8807621764	f
3598	0101000020E61000009E21BF5505A00E401156FE7036D54540	14	5	2014-11-21	88043	36754.9725678166	t
3599	0101000020E6100000182667F710650E40B31B76F342D04540	49	2	2021-10-15	75833	59815.4099543478	f
3600	0101000020E61000001A412626E6F60E40FF78A88BA1CB4540	62	1	2011-08-05	30734	56910.7763186041	t
3601	0101000020E6100000B77597DB48A50F406C9364C678CA4540	34	9	2011-11-01	42615	45116.7794042441	f
3602	0101000020E61000005E39A09E03870E40CB25A17EB0CC4540	73	10	2025-09-13	40459	56479.8624031511	t
3603	0101000020E6100000B6608CCE4F900F40FBCB231AC4D34540	7	2	2015-10-02	6117	34501.3692327551	t
3604	0101000020E61000007EFF63088BD40E405A9A7BFEB1C84540	77	5	2022-05-25	7588	47164.2973861475	t
3605	0101000020E61000005F81FB035FA50F40CBA2EC85DFD14540	21	3	2010-09-14	7375	71359.3055518111	f
3606	0101000020E610000060E4E585B5A00E40ACE82A86D1C94540	49	10	2016-07-30	80834	96162.1403049456	t
3607	0101000020E6100000EA8A956275F80E40888F6B03C5C94540	46	4	2015-10-30	31630	70421.7210136059	t
3608	0101000020E6100000DDAC3FA11EB10E40D13D80BA10D04540	51	3	2017-03-04	81933	72279.304233295	t
3609	0101000020E6100000DA913FB0E59A0F40DB3924E77ECA4540	13	3	2017-04-08	88196	71561.3110933726	t
3610	0101000020E610000009175453CB8C0E4045DA570513D14540	49	2	2022-01-31	20647	89508.1736242234	t
3611	0101000020E6100000A6779D4887D10E405FC6C46BDAD34540	23	10	2015-02-22	75152	96712.9587726884	t
3612	0101000020E61000008C5A86437D830E40378AEC634AD24540	32	4	2017-09-06	93899	48332.0895232493	f
3613	0101000020E6100000C09619E00F110F40DB7E88CEF0D04540	1	6	2023-05-02	43844	84740.690482133	t
3614	0101000020E6100000965D153DC32E0F409B01146481C94540	63	1	2025-05-16	28854	81453.2071648048	f
3615	0101000020E6100000CE1A5366D1C20E404A817A8E82D34540	77	10	2022-12-27	4453	44166.3284621476	t
3616	0101000020E61000000146D8DBD8AD0F4095AD5A7753D24540	82	1	2018-08-09	7135	73472.4325462134	t
3617	0101000020E61000006F9626992D5C0F406154AA6AEFD44540	25	4	2017-04-21	7354	43467.294071945	f
3618	0101000020E6100000B4F1C5CAB07C0E403F6406B431D14540	10	1	2025-02-21	92882	36193.5334537305	t
3619	0101000020E61000003FA42B34196E0E407B5AE82A1AD14540	100	7	2022-03-20	84720	9636.12574265342	t
3620	0101000020E610000050BFD72ECF510F40189F565016C84540	10	5	2025-01-09	31251	86185.0089538892	t
3621	0101000020E6100000246784E1A0C50E40748F789179D14540	21	6	2012-06-28	2488	88373.5782452244	t
3622	0101000020E6100000D10A7215537E0F4017AFDF215BC84540	86	8	2021-05-14	26675	97812.1585302332	f
3623	0101000020E6100000468A6951D03D0F4083E6B15B45D04540	22	5	2016-07-16	96321	45555.7448075441	t
3624	0101000020E6100000CAE2AAA8F5990E407720F1285ACC4540	83	2	2020-07-12	26983	377.134071127228	f
3625	0101000020E6100000C9C9116EA6980F40541B980A85D44540	39	10	2012-07-21	16929	68424.1827628145	t
3626	0101000020E61000004D8BC0CF91320F402572A99636D54540	16	3	2015-02-25	20291	75806.5106387502	t
3627	0101000020E610000005B8D44D04940E4032E869AD76D14540	55	9	2018-03-21	98565	46998.774262377	t
3628	0101000020E6100000C057AE7AB4640E401298DCF6E5CE4540	23	7	2023-06-18	21252	70297.5301105659	t
3629	0101000020E61000008D16669806150F40278F0F8004D44540	52	7	2016-01-26	54780	47981.8146794987	f
3630	0101000020E6100000D543F19ABCAD0E40C3370778D4D44540	76	2	2010-07-27	93821	20769.9653593306	f
3631	0101000020E61000004CC0697B53660F4016830F3D5FC94540	18	1	2015-11-26	2697	83662.0648822149	t
3632	0101000020E6100000874451FE5C540F4049BA015253D24540	84	1	2025-05-09	55146	39318.309755774	t
3633	0101000020E6100000133584F9D17E0E40CAD3D19BE5CB4540	96	10	2012-01-10	58264	4879.59028355489	f
3634	0101000020E61000007A507D46A9680E403DF81309C9CD4540	74	5	2024-08-13	84241	4479.60096240501	t
3635	0101000020E6100000BC3E638BEE940E408329E2B0A0D24540	38	8	2023-01-17	60754	62654.5040131585	t
3636	0101000020E61000007C05EBDD9CC80E406152272F7AD14540	100	9	2023-06-06	87875	43846.4053261549	t
3637	0101000020E6100000F312FAD5F5B50E40368A6A2053D04540	67	2	2014-01-08	32516	8127.22392695338	t
3638	0101000020E6100000E9DB60765A190F403B01C4CC84CB4540	97	7	2011-06-19	43317	14752.2399421447	t
3639	0101000020E6100000F7FC3D67149A0E40E5145788F4CE4540	68	9	2014-05-04	8643	8980.22989345213	t
3640	0101000020E6100000434BE3D7356E0E40F723DC097DCD4540	4	8	2019-02-14	503	24950.5920638214	t
3641	0101000020E61000007A492367B4A70E40EEE28C341DCD4540	58	7	2019-06-25	68417	94955.1541958093	t
3642	0101000020E61000009335E190F46E0F40A570B29025D14540	75	7	2022-11-19	42456	50116.3293540543	f
3643	0101000020E6100000DAD999AF29960E40698FC23AD2C74540	77	6	2012-07-01	88715	35683.5198502636	f
3644	0101000020E6100000B43D47360CD60E403637329708C84540	22	2	2013-10-13	95593	34210.7180535361	t
3645	0101000020E610000045FE1711A1880F4011245ED666D34540	85	10	2023-04-17	28666	40866.0733978117	f
3646	0101000020E6100000EF1C0ECC5EC80E408F5D2124F3CA4540	51	8	2022-02-19	70904	29651.0559740281	f
3647	0101000020E6100000CDA0123BCB1D0F40CB24ECBDA5CE4540	52	2	2025-04-01	37343	17977.7985576165	t
3648	0101000020E6100000FFC0259DEC940F4005B6078766D34540	74	2	2013-11-07	73746	44762.6314106226	f
3649	0101000020E6100000B2B616CFFB420F401B36450E64CB4540	86	6	2011-11-09	80751	66532.656041812	f
3650	0101000020E6100000DEC6FB4A7B190F40E854C8FCD9C94540	18	5	2017-01-22	85400	42927.5118960146	t
3651	0101000020E61000007DC36FB2643D0F40BBF43786ADC84540	93	4	2013-03-25	79044	53964.3255208143	t
3652	0101000020E6100000759787E8519E0E40608FFA114FD44540	34	7	2019-05-09	42363	77384.3901062096	t
3653	0101000020E61000008C3026DB029D0F40AFE353E8ADC84540	59	4	2021-05-30	20324	9143.24097731667	f
3654	0101000020E61000001F2BF76758DF0E40CCA0AF88D4CB4540	62	9	2024-11-21	32307	96478.7705142757	t
3655	0101000020E61000008507D9A4F3B70E406F298BAC64CB4540	70	2	2022-10-23	92467	70494.2388531885	f
3656	0101000020E6100000D889C04FF9610F402F2686D778CF4540	67	3	2012-01-13	5155	11394.6186775684	t
3657	0101000020E610000035A338D85B600F4010F55F55AECA4540	56	5	2020-03-09	50677	82320.1031422444	f
3658	0101000020E6100000C3D3242721720E40CDFDE82E6FCD4540	9	3	2018-11-07	5061	86126.3634016704	t
3659	0101000020E61000009445784FD67B0E40545261D506CD4540	63	9	2021-08-27	83413	83690.0247763065	t
3660	0101000020E61000009599A4137C740E403EAA82706AD54540	51	3	2014-01-07	97026	2820.99525605182	t
3661	0101000020E6100000FD1FBA5680A60E40D3219B6E3BCF4540	90	2	2024-04-05	87603	82792.7655329862	t
3662	0101000020E61000000E69A39C2DE40E40477508F8CACB4540	43	1	2012-11-16	71844	51545.5676932011	f
3663	0101000020E6100000C194B4DDA4060F40562CD4C984CA4540	76	7	2012-08-06	99102	56685.9515823091	t
3664	0101000020E6100000F730FC4BA6860F4018E65119E6D44540	50	5	2010-10-30	880	40976.9037398527	f
3665	0101000020E61000003437B121087B0F40981E5F2427D44540	9	2	2017-06-14	40159	89501.252495115	f
3666	0101000020E610000032A2FDD650BF0E40A0E5B6D980D14540	92	1	2016-07-27	89076	92703.0592524276	t
3667	0101000020E61000008D176F661E5E0F403C447453A6CF4540	35	8	2018-10-22	75224	99713.5522808246	t
3668	0101000020E6100000CE546BADE3520F401C9303FB1BC94540	59	4	2011-05-04	8770	12552.3426349776	t
3669	0101000020E6100000FE2639FCE18A0E40182DBD0573D04540	6	5	2024-07-30	35602	26925.1776706945	t
3670	0101000020E610000048F7B87534420F4054FDB7E753CC4540	20	9	2013-09-08	18995	83786.195155672	t
3671	0101000020E6100000BACA6BB97BAA0F4004C463B175CD4540	46	5	2025-05-07	30280	27610.9800077622	t
3672	0101000020E61000007CA84AD77B570F406EE18B1944CB4540	38	9	2019-03-21	14522	68849.0129528038	f
3673	0101000020E6100000D28BF0F86EA50F40BC53760E6FD14540	82	3	2020-06-26	93745	76057.7034333996	t
3674	0101000020E61000003C487E27E6970F40FABEB5C6D9D34540	4	6	2021-04-20	61674	79497.5116458183	t
3675	0101000020E61000000108940D50570F4042ABA3BA09CC4540	77	9	2025-06-28	90679	1443.8405092841	t
3676	0101000020E61000003D61838FE3B70E409AE37055C3D34540	96	8	2019-02-26	6418	39696.1058387199	t
3677	0101000020E610000029A3E14790D60E4041ED529B5BCD4540	14	8	2020-01-23	97291	31549.5168569075	t
3678	0101000020E61000000291BDA07EE40E40ED366169ADD34540	17	8	2013-12-30	74518	65198.2217325258	f
3679	0101000020E61000006437624BF99D0F40066B1FE360CC4540	53	1	2019-09-25	16274	3673.29469118314	f
3680	0101000020E6100000781DA22319460F40BFE8B78E6AD44540	3	1	2019-08-14	25680	79165.4257125862	t
3681	0101000020E61000003836A081EB820E40D03A855291C94540	76	4	2012-12-19	11252	49346.7687792207	f
3682	0101000020E6100000E0391B422D490F40FD270E10FED14540	97	2	2014-12-31	76065	35705.8019522138	f
3683	0101000020E6100000082C9494B8890F40A465C77E71C94540	53	9	2018-12-26	26552	57400.843157241	f
3684	0101000020E6100000A35AA7D60E550F401DF89CAA69CE4540	32	8	2014-06-17	69634	35641.2670969715	f
3685	0101000020E6100000055229249F700E406A2DAC562CC94540	22	9	2010-02-18	18056	40706.4861878651	t
3686	0101000020E6100000F267F0DF60AD0F40FD9928F135C94540	73	4	2019-02-11	77152	3593.99283800643	f
3687	0101000020E6100000FBD902916BFF0E40149832C871CA4540	7	4	2013-10-24	33962	44321.7285457801	t
3688	0101000020E61000004BB39CE899850E40ACCF259BCFCC4540	55	4	2024-09-11	65796	92671.5472518238	t
3689	0101000020E6100000B358051EC1730E400CE3EA8BC0D44540	100	7	2022-04-10	99519	59179.7377947908	f
3690	0101000020E61000009C66AB8F4C290F4069AAD44FE3CD4540	96	10	2015-05-25	12302	28608.3783733367	f
3691	0101000020E610000076A31AF354FE0E40360CF61064CD4540	7	2	2025-03-03	78815	40643.2803356424	f
3692	0101000020E6100000C4F8197674A20F40DE2119E0C2C94540	89	10	2024-02-18	87478	47602.9079630483	t
3693	0101000020E6100000B552BC569DBD0E40637D7FDD7BD14540	36	7	2010-02-05	42276	2048.92530196845	f
3694	0101000020E61000003F6DB64C63BE0E40BD406E519FCA4540	90	1	2015-08-25	18837	61569.4081235167	t
3695	0101000020E6100000DCA942ACA0150F405F74189141D44540	64	4	2011-05-24	15739	52406.7640770185	f
3696	0101000020E6100000E8AA3F9D096C0F4051516F37BBD04540	84	3	2018-11-03	30816	78855.7333962816	f
3697	0101000020E61000000A419C8C87700E4014B1727B4ACE4540	84	6	2017-03-15	12002	33154.3079884781	t
3698	0101000020E6100000A78240F08E250F40249976510CD14540	65	5	2013-11-24	88008	66020.9026294994	t
3699	0101000020E6100000D34BEE64F07F0E4093A1FD370BCA4540	1	4	2024-12-14	84835	86071.7010689866	t
3700	0101000020E61000000AD2862BED8B0E402EBDE5F490CC4540	2	7	2025-08-01	15643	75392.0172222942	f
3701	0101000020E6100000DC2FB7BC89B40E40B55CBE2C0BC84540	97	6	2021-01-11	38822	78193.308507846	t
3702	0101000020E6100000D66997B8758B0F40A4527CB048D14540	10	6	2013-10-20	89406	64374.0386861792	t
3703	0101000020E610000077FC41C5C8DA0E403B7C8AFEDFCC4540	83	1	2023-08-06	99049	69105.9606518101	f
3704	0101000020E6100000F8BDBF437F640F40D43A4B4851CA4540	2	3	2023-10-30	11190	69568.5118197674	t
3705	0101000020E61000009936E3DAB3D40E4051F64F8B5DD54540	47	2	2016-01-24	48182	40313.2556355825	t
3706	0101000020E61000007B1F2F5D60830E40890D1F1291CD4540	32	3	2024-10-14	32227	37438.5366572732	f
3707	0101000020E6100000B5F9B90504BD0E407515985A90CF4540	61	4	2017-11-08	48032	64287.4680238232	f
3708	0101000020E6100000C11E808A65150F40E10CE88CFDCD4540	18	7	2016-02-06	6652	19198.0577079697	t
3709	0101000020E6100000AFC882590AED0E40207278115FD14540	19	6	2025-11-19	97019	10704.5706760454	t
3710	0101000020E61000002A769C31FD860F4047F97D422AC94540	77	10	2025-03-12	19139	28718.1918796333	f
3711	0101000020E61000008A2D2B0B39720F404464989C23CC4540	75	9	2012-01-14	76930	48545.1270782765	f
3712	0101000020E6100000360C094705990F40C26BDA37E9D24540	8	4	2011-01-26	69723	66394.7869352292	t
3713	0101000020E61000003911A9E9E75F0F40943370E996CE4540	48	5	2010-01-06	10713	44220.2289991869	f
3714	0101000020E61000000983B8DE641B0F40E0023FEF6AD24540	91	8	2020-06-13	41574	34789.4721359942	t
3715	0101000020E6100000201AFF4DBD6C0E4081C22D58D5D04540	100	3	2011-07-17	6636	56837.6799270969	t
3716	0101000020E6100000F3B04858931A0F40CFE78E4D69D04540	52	7	2015-09-14	15151	33043.3844246582	t
3717	0101000020E6100000B71B3F0407AF0F408B05274D2DD44540	93	9	2017-07-12	16129	55136.7924235541	t
3718	0101000020E61000002965ECCBA4B50E40749A45DFD3D44540	18	7	2022-03-04	47498	36887.9487616607	t
3719	0101000020E6100000FB976D54B0790F408EB1B1BD83CA4540	5	8	2025-11-11	62088	46970.1878009206	t
3720	0101000020E6100000F7413E738C8A0E40CA089D88ACD14540	64	5	2021-07-09	17268	48326.5338945471	f
3721	0101000020E610000090AFE748B3670F40C95CD9CD2DD24540	52	2	2018-09-11	26867	12023.6924076155	f
3722	0101000020E610000063CE97DC36F10E40820E1659C4D34540	59	8	2017-08-03	17159	54864.5727375657	t
3723	0101000020E6100000EE08A1B55A840F404EED3F0300CF4540	40	10	2015-08-25	22329	29734.5489776626	f
3724	0101000020E610000027E606D646DC0E408345901CAFC84540	92	1	2015-05-06	14815	23795.2288501493	t
3725	0101000020E610000042FC82F2829B0E4054239B0223CB4540	38	7	2022-08-28	80399	97103.2204377575	t
3726	0101000020E610000032183C16D7BC0E40D99F389982D34540	75	1	2020-07-16	32461	77511.6413233446	t
3727	0101000020E61000006FDCF436FA510F40717C548284CF4540	95	3	2021-01-28	2712	42366.4381588481	f
3728	0101000020E6100000B114E4C3AEF20E40E0C54C9124CD4540	19	1	2025-02-28	63019	84512.8377401306	t
3729	0101000020E610000022CCF6418A270F40EED629C1F7D14540	20	2	2019-11-28	71140	63541.4496172402	t
3730	0101000020E610000050197EAE66890F40A927102AEBCB4540	59	4	2021-11-24	87727	85528.4070372781	f
3731	0101000020E61000009CCA631045560F40CEEDA30859D24540	11	9	2013-05-29	51282	7114.91542391922	t
3732	0101000020E6100000C94861F167090F40B5630C9E77CB4540	71	8	2016-06-29	62905	13811.1309038802	f
3733	0101000020E6100000386895BD4A820F40EE883ED71ED24540	31	1	2013-05-10	72726	97845.1694525728	t
3734	0101000020E6100000AB33CEE8CA9E0F40BF8E5CD1E6D04540	46	2	2011-09-01	57369	79335.5191159861	f
3735	0101000020E61000009694B5DF3AC70E40B074F3F85FC84540	87	8	2022-03-14	81306	70777.612540668	t
3736	0101000020E61000006CCBA8A20C2C0F40F6A3FDD5E3CB4540	90	3	2025-08-10	7035	48336.4003172935	t
3737	0101000020E610000022A5278DE4CC0E40D5D1566A14CC4540	39	3	2018-03-23	47656	82613.3365272028	t
3738	0101000020E6100000B72523F2F7DF0E4020767B2096CA4540	29	4	2015-05-08	63849	75079.1104017823	t
3739	0101000020E6100000A9CDBDE98CAF0E40F3F3BA4663CB4540	23	7	2013-11-17	10986	98359.5194937379	t
3740	0101000020E61000004EB57EB3929E0E40ECD047E574CD4540	73	3	2014-05-03	17155	50724.6047390883	t
3741	0101000020E6100000E8215539E3380F40127D186AB9D44540	99	9	2019-07-07	26573	77332.5550177455	t
3742	0101000020E6100000A934E02E598F0F40F49EB4291FD14540	59	2	2019-10-27	27309	2134.02397459916	f
3743	0101000020E610000032C628D4636D0F404E9D783B1BCD4540	70	7	2013-03-15	31333	48763.9095743551	f
3744	0101000020E61000006384324C4D6F0E40625930D4C5D34540	57	10	2011-07-17	44632	30890.7108858222	t
3745	0101000020E6100000670E072C08790E40DC41CF2A08D54540	39	4	2015-12-07	94342	98720.0200680707	t
3746	0101000020E61000003148DAE50F8A0E4021AB1E3B46D34540	61	10	2023-10-30	31228	97397.9337973276	t
3747	0101000020E6100000098AF24A31000F406B11EBA68BD24540	71	9	2014-08-01	95506	97749.1407106463	f
3748	0101000020E6100000C4B781655ADC0E40E1822E8779CE4540	63	3	2020-01-25	36322	90462.8349661002	f
3749	0101000020E610000033C870E49F8B0F400CDF683AABD14540	48	1	2013-05-13	22581	15251.9504522743	t
3750	0101000020E6100000A4BB5AEC091B0F401A6AD3611FCD4540	9	9	2010-03-24	12057	76417.0916203991	t
3751	0101000020E61000004F19EE58460F0F40A862600BADD14540	21	9	2014-04-18	96161	19179.8555725535	t
3752	0101000020E610000058428E1F59F90E402672343041CB4540	22	1	2017-03-18	10330	59681.6610901824	t
3753	0101000020E61000006BEC8BC6DC200F40A765093458D54540	72	5	2019-08-09	64098	19037.984102599	t
3754	0101000020E61000005A121E3694C90E409D26A5DDBDD44540	86	7	2021-08-02	92927	35168.1312825036	t
3755	0101000020E6100000D47BE54782A70E4020B24666FEC74540	93	1	2010-03-27	69477	24617.9001747651	t
3756	0101000020E61000004E690B7F90AE0E40FBECB57C41CC4540	45	2	2024-04-17	65257	2967.45609092675	t
3757	0101000020E61000003D8F752D49310F4087324CC329D44540	82	1	2021-08-20	66196	83056.5087452316	t
3758	0101000020E6100000F38F8BF7DBCA0E4071ECC02E8ECE4540	78	8	2021-05-09	34272	19865.8556534709	t
3759	0101000020E610000049E14664128F0E40EE5C0649D4D04540	41	2	2021-01-20	12646	2116.71200177779	t
3760	0101000020E61000004ABA2938F20A0F404509A3618BD04540	97	5	2021-06-12	51370	68200.9225046609	t
3761	0101000020E6100000818C2396A02D0F40A4D1EFA73FC84540	47	9	2019-09-26	5375	70121.2824281443	f
3762	0101000020E61000005D3A126414D40E40EDBAE7088DCF4540	15	9	2014-08-05	68066	87165.4921678324	t
3763	0101000020E61000003BB13131AD110F4046AEE154F1D24540	15	7	2019-06-04	67459	79069.6680732255	t
3764	0101000020E61000003089297B55C60E400C54B147B7C94540	18	3	2015-03-20	2236	17360.643569145	t
3765	0101000020E6100000FCA3C73C19680F40E9E4FA2E03D54540	83	5	2023-04-15	11236	25707.4205713194	f
3766	0101000020E6100000AC644D3672A80F40EAD779C37EC94540	77	6	2012-06-04	85686	88070.8751885992	t
3767	0101000020E610000058A45CEDC1F00E40BC14430381CA4540	14	7	2024-03-20	50567	15360.2428379797	t
3768	0101000020E6100000B40B81EE38900F402B71C7DE9ED04540	41	8	2024-11-12	78201	12826.6037448128	t
3769	0101000020E610000032AC53E4BB2C0F4041526EE4FAD34540	58	3	2017-09-21	34590	22561.7611073604	t
3770	0101000020E6100000C138880169420F407C076023E2D34540	67	7	2015-10-29	32863	3757.29430800216	t
3771	0101000020E61000001374AD8AF62E0F40A69BCBA1C2CE4540	33	5	2013-12-29	8486	53577.7342210405	f
3772	0101000020E61000006E8B2A33AB6F0E40EDB6E9280DD04540	54	7	2024-07-21	80840	3244.47031789568	t
3773	0101000020E6100000601E0FE2BECC0E400CA25A20E7D14540	45	9	2017-12-15	73190	7112.75741368147	t
3774	0101000020E610000093155EC8BB9E0E40F650BC9F86CE4540	58	9	2025-10-04	41876	83662.7781582443	t
3775	0101000020E61000006FC372F446250F40AA8DC59662CE4540	79	6	2014-06-13	42461	7733.4593958015	t
3776	0101000020E6100000DB20956ABE9C0F409A3BE67CD4CB4540	86	10	2011-06-29	74611	20290.5106825138	f
3777	0101000020E6100000C970879DEFF70E401933B1BB10CD4540	46	8	2017-02-24	30743	57696.5331115241	t
3778	0101000020E6100000FAEBB9D31A730F40D357C7C8C8D24540	56	5	2017-08-08	47387	38169.7232845616	t
3779	0101000020E61000009E8C3F081C8B0F40B0ED83355DCA4540	43	5	2023-03-08	67940	27496.7338387837	t
3780	0101000020E6100000D703F55EA2600F40D8EAD5E087CE4540	89	4	2014-01-10	93181	59914.9336178465	t
3781	0101000020E61000008540243125820E405A5A26DE82D14540	36	10	2022-09-07	80830	20907.9759481726	t
3782	0101000020E6100000062E776151060F40D2D5C076AECF4540	73	8	2019-09-29	75537	86775.6902423237	f
3783	0101000020E6100000076192D1D06F0E40610854D6F6D14540	11	1	2024-10-23	34919	60291.496432197	t
3784	0101000020E6100000BCB43BBA0CC00E40135F455F94CC4540	46	2	2019-10-18	70574	91960.4585216624	t
3785	0101000020E6100000385246B46DDE0E40CB69B7E33FD04540	26	6	2011-06-19	78543	95145.0337111143	f
3786	0101000020E6100000D077279395C30E4023EF120EDFD04540	20	2	2012-07-30	87106	67597.560631909	t
3787	0101000020E6100000BF26BBC9C2640F401BD3C044DCC74540	100	9	2025-11-26	93307	15391.9847507329	t
3788	0101000020E610000010C414F57F360F40065B762246D14540	80	7	2025-12-18	65122	29688.7312025912	f
3789	0101000020E6100000FC62F0EEFB670E408D56A843E9C84540	36	1	2014-11-22	32930	13150.2852076655	t
3790	0101000020E6100000B00FEB44A6950F40CB180B40FACA4540	87	2	2012-03-04	36611	70830.5300245012	t
3791	0101000020E61000009402823AD72B0F4020B76A8F36CA4540	30	6	2017-09-29	97242	83352.3503277799	t
3792	0101000020E6100000E3CF979054AD0E40F3FAC50C4CCE4540	2	8	2025-10-01	41325	64392.6309325232	f
3793	0101000020E6100000A8A4820D6F040F405DDBDDAFC3D24540	10	5	2015-03-07	45970	86881.9267342033	t
3794	0101000020E6100000A722181B0E870F4067E47E337BCC4540	100	2	2022-05-24	39754	51281.9581010091	t
3795	0101000020E610000062AB65C2B3370F402E9BD20ECFC94540	60	6	2024-07-24	69822	51566.900188923	t
3796	0101000020E6100000F5F1E894ED0E0F401288262E1AD44540	48	5	2012-08-26	39114	18338.3786023094	t
3797	0101000020E6100000D974798A249A0F40CD5EB1C184C94540	94	3	2014-01-18	17847	60166.2664933309	f
3798	0101000020E6100000D551F6C5B0A20F4094C8489D31CA4540	3	9	2013-09-08	46132	34994.5044328586	t
3799	0101000020E6100000250B03BDBEC80E40F27B188EC1D24540	59	1	2014-01-01	34410	30010.7167718681	t
3800	0101000020E6100000A3B57B86CE2F0F40FDAC1D5CA0D24540	34	1	2016-01-28	43093	66556.3879959461	t
3801	0101000020E610000076CF4C8B95CD0E40C81654D1B4C84540	38	10	2022-02-05	32135	39416.4406145073	t
3802	0101000020E6100000121F35779D990F4040FD63425CCB4540	36	2	2021-06-26	15556	33781.8593558113	f
3803	0101000020E6100000E93A59EE442B0F40B17A715F96D44540	83	8	2019-10-11	73221	89755.418187226	t
3804	0101000020E61000000A479529C78F0F407E7288DC55C94540	6	6	2015-11-09	19380	6623.45506399216	f
3805	0101000020E6100000E7F05E6CA4B80E4058750147B0CF4540	82	7	2024-04-10	5318	28303.3277047938	f
3806	0101000020E610000057202B59E24D0F406B2AE4711BD04540	26	1	2010-11-24	74832	99755.277823912	t
3807	0101000020E61000005428A16A49660E40E89AF3F490D04540	30	7	2018-03-09	45329	68118.1910353197	f
3808	0101000020E6100000CDF55D431AAE0E40E24330ABB7D24540	40	8	2015-11-03	49836	50356.4690306975	t
3809	0101000020E6100000059C1483F7E00E401753638636D54540	32	8	2013-02-14	55345	17473.3875997157	f
3810	0101000020E610000050FFC2BE28870E403DDEC85E33CB4540	79	9	2022-01-13	91903	3870.90545070585	t
3811	0101000020E61000007F002E39EC680E4068A37D9CA2CF4540	21	8	2014-05-02	7008	5970.0624701202	f
3812	0101000020E6100000C3CAEABCD5AE0F40E632E5AD1DC84540	14	6	2025-05-25	67452	12257.5960137447	t
3813	0101000020E6100000B38C1E8165040F4035FA2E5F80CD4540	54	2	2013-04-27	18529	17959.869439789	t
3814	0101000020E61000009FF511FE3BF30E40E0FC873238C84540	4	5	2017-12-09	1101	64976.0521055755	f
3815	0101000020E6100000A849EF019DA80F40CB29C26630D24540	10	8	2019-09-14	87476	47669.691850885	f
3816	0101000020E6100000807C60DC261B0F406ED90924CECC4540	71	3	2016-06-05	52391	63341.7913437163	t
3817	0101000020E610000099C6750677320F40A7A609D4B7CC4540	97	2	2020-10-17	1598	94001.8564192339	t
3818	0101000020E6100000468E2AF9B7960F40BE18AEF28FC74540	86	3	2015-02-14	23347	74415.4064518741	t
3819	0101000020E6100000B617C4399B2F0F401A2F843FC1C94540	90	6	2024-02-11	91274	91832.3341544114	f
3820	0101000020E6100000FEE1F39000210F40FA84113A9FCF4540	21	3	2025-08-29	29854	26343.1434611068	t
3821	0101000020E6100000595F6E7652790F40A07F785905CD4540	15	7	2019-08-14	14305	70066.8642399533	t
3822	0101000020E61000005367E3A5F84A0F40DDA65752C5CC4540	67	2	2011-08-20	50621	85467.4993254453	f
3823	0101000020E610000043ABC26C99560F407078557BA8D34540	2	5	2019-12-04	8489	96887.5869828393	t
3824	0101000020E61000000F16CEFD83E20E4049509C1876D04540	11	9	2010-05-26	11131	54015.0743740318	t
3825	0101000020E6100000A9DFE1E09D3B0F409F0AED28BAD34540	8	5	2015-12-21	28910	63291.2706987544	t
3826	0101000020E610000092CC02203BE00E402E97A3AEF9CF4540	58	7	2015-05-23	50123	26607.7869150504	f
3827	0101000020E6100000A5393E70BFA80F40A2493D679BD24540	69	3	2013-04-28	88454	42452.604060174	t
3828	0101000020E6100000223D20794A070F405061C3C79AD14540	41	3	2017-07-04	5248	76770.9155301221	t
3829	0101000020E61000001ED96E42EDB50E405199C55B15D34540	75	6	2023-05-02	96300	58411.7022389785	f
3830	0101000020E610000051AB70E433B30E404081211D86D24540	71	2	2021-10-01	23241	32464.0949483993	f
3831	0101000020E610000088095E6B6A7B0E405862EF48B1D24540	53	10	2015-06-19	48225	10222.6983448428	f
3832	0101000020E6100000D2323F4D75B40E40CFC68B05ACC84540	59	7	2019-08-05	26789	65657.2479282044	t
3833	0101000020E61000002B7344E4807B0E406232D6F46BCF4540	69	7	2010-11-13	68879	16212.9638160634	t
3834	0101000020E610000020AF4EDAA6A80F402BD96358EECD4540	10	6	2024-07-14	55209	56905.3862619288	t
3835	0101000020E610000009EE14F5C52F0F400B1E78F99CCF4540	57	10	2017-02-12	44642	71261.7914499839	t
3836	0101000020E6100000EA9C19322E190F40144ADB2CFEC84540	95	7	2023-06-12	53609	93439.8698145755	f
3837	0101000020E6100000992BB90D66AE0F40679DE3881FC94540	70	9	2017-04-04	22111	19869.2364082883	f
3838	0101000020E6100000058BED29657F0F4074B2DFC506CD4540	54	3	2025-04-05	62252	93833.4200954695	t
3839	0101000020E6100000408F7719CC850E40ED2483F317D04540	56	5	2011-05-08	69360	48202.3859509384	t
3840	0101000020E61000000906E163F8610E40F808142D8BCB4540	18	1	2010-01-04	60014	48841.4985797337	t
3841	0101000020E6100000D0AE41E730B10F406FA6B6E9A6D44540	45	8	2023-07-09	42787	7909.22804952019	t
3842	0101000020E610000077C29862B7270F402ACADEF219D44540	34	6	2025-03-17	96235	13627.1666185133	f
3843	0101000020E6100000374D322D359D0F40BCF5D48D2EC84540	74	5	2025-07-11	66937	70618.9989128935	f
3844	0101000020E6100000C42470A01DED0E40BC77F6AA4EC94540	5	10	2012-12-10	32903	92836.2563822826	t
3845	0101000020E6100000D43A666768FD0E40C84177B4A5CE4540	95	2	2018-03-02	3749	62325.3904209634	t
3846	0101000020E6100000E2D600688CF40E401E7299F3D0C94540	68	10	2015-05-06	22748	11790.6979851548	f
3847	0101000020E6100000CD6CB550CC5B0F407AB6965AADCA4540	94	7	2015-12-10	5593	3028.07040689057	t
3848	0101000020E6100000B338FDBC797A0F40D3675F3855CE4540	52	1	2015-03-21	25754	88138.5561412501	t
3849	0101000020E61000001440069A3A800E40FC68A37061CF4540	69	6	2023-02-25	76691	27851.6307126651	f
3850	0101000020E610000019CE9EFD94F20E40B7FD8B8C92C84540	29	10	2023-05-06	8481	47446.1872010052	f
3851	0101000020E610000018657DD0F5C80E40AC24E58D03CE4540	44	6	2025-09-26	39750	65068.5033617349	t
3852	0101000020E6100000308CC9DDD4700E403CB0904587D24540	64	7	2016-12-09	82970	61370.6768739481	f
3853	0101000020E61000009DF7AA8DF7690E40357E330B48CC4540	35	6	2022-05-30	34435	30366.4959838531	t
3854	0101000020E6100000DE0FF53975180F40CF3A634B43CB4540	36	7	2017-03-28	46064	56398.0830395266	t
3855	0101000020E61000002B06F60C9FA80F403C1A506D48CF4540	87	2	2020-11-15	44459	31884.7769559425	f
3856	0101000020E610000095D4BFC2CC250F40B48D433E35CB4540	35	4	2010-11-28	91007	46009.6702910583	t
3857	0101000020E610000097E582102C680F403348DDBA2ACD4540	75	1	2016-03-17	46619	28504.6875467882	t
3858	0101000020E6100000786BA751C8060F40104BD76141CD4540	6	2	2019-12-20	84585	98403.7773866145	f
3859	0101000020E6100000C50F85A8A6B00E401CDC7F3120CE4540	26	1	2019-08-30	74417	77024.1188688183	f
3860	0101000020E61000002187692FC86A0E404C4552B0BFCB4540	65	10	2012-10-15	50534	96153.4884604079	f
3861	0101000020E61000004BA22A5247BC0E40FCA36B3855CA4540	93	8	2015-06-06	4875	60302.6622669673	t
3862	0101000020E61000001F87A810D7670E40355D110A1FC94540	81	1	2025-11-26	82221	28615.7922233611	f
3863	0101000020E61000001453521301220F4099F2614FAACB4540	1	7	2022-02-11	58220	74183.8884887032	t
3864	0101000020E61000004442652CBFC70E404E9B88290AC94540	64	6	2023-03-29	6721	62432.6708825559	f
3865	0101000020E6100000289B8FAC1D7C0E4089F3071D29CB4540	55	5	2011-12-16	13813	19789.6401740491	f
3866	0101000020E610000040155FC569C90E4029DCED444DCC4540	2	6	2020-01-28	19006	78106.5675595629	t
3867	0101000020E6100000AB9BBAC78E270F40CBBE2E19A2CE4540	25	10	2015-06-08	83016	68800.0286034645	t
3868	0101000020E610000009C3E503AE530F40C9BCFC47AFD44540	99	2	2024-11-06	90441	54037.8856664974	t
3869	0101000020E6100000F6622F644F4C0F406E4A6FFD8AC84540	93	3	2018-08-25	65226	85785.7952037346	t
3870	0101000020E6100000E53D02D398C20E407A9F4A57D5CD4540	87	4	2024-06-21	17252	39833.5186279343	f
3871	0101000020E6100000211E9D6C25620E405853639D74CA4540	6	2	2018-06-15	33262	51542.6863726676	t
3872	0101000020E610000055D2D8C2A1360F40A964A0AE35CC4540	41	1	2014-02-03	34426	90901.2967555857	t
3873	0101000020E610000055FF540380330F409EC0CE1167C94540	92	6	2024-10-09	67953	2710.28860314968	f
3874	0101000020E6100000F1C4342529EB0E4038AD5EA9F0CA4540	43	7	2020-07-07	40118	49756.2218934199	f
3875	0101000020E6100000DDFA1D820C180F4037AE924BA0CB4540	75	6	2017-09-05	11358	99248.5805439837	t
3876	0101000020E61000008199D3FEB1000F40283CE99BA7CF4540	19	9	2015-01-17	96265	72203.4575599356	t
3877	0101000020E61000009C68E1CFEAC20E40B9DA362715D34540	75	7	2013-11-25	8552	77130.6040294657	t
3878	0101000020E61000008B445AA8CB2C0F4049F31E8614CC4540	14	8	2022-04-18	36157	36190.5411179733	t
3879	0101000020E6100000AAFC3B38FB1E0F406214402FB3D14540	31	7	2024-02-15	16528	5464.80980798101	t
3880	0101000020E610000038A290408D790E40B69ACEC0FECA4540	58	10	2023-03-28	55102	50951.9951475237	t
3881	0101000020E6100000E7CFD28352DC0E408E4E4E798EC94540	7	2	2013-05-24	27251	51778.5425064311	f
3882	0101000020E6100000FE3A706B58910E401BC3F8FD34CA4540	33	4	2016-10-11	24882	12170.1179280783	f
3883	0101000020E61000007B64F087AA3C0F40BFE0ADFB7ED24540	19	3	2020-05-28	61343	50057.0655503236	f
3884	0101000020E61000009BC41971FE580F40CBC30E6848D14540	100	5	2016-07-10	41354	22986.3987724308	t
3885	0101000020E6100000443734C99CB00E40C744E816EBCD4540	75	3	2013-10-21	50854	95910.9519165097	f
3886	0101000020E6100000FB491C7D373C0F407593789088CB4540	27	7	2017-01-03	5595	66759.0629629237	f
3887	0101000020E6100000BF280148C6CA0E405291815158CF4540	42	5	2017-02-02	21942	9979.23565129943	t
3888	0101000020E61000001E6EA465A4400F400AA8ACE937CB4540	50	8	2014-05-18	23103	61908.6599067036	f
3889	0101000020E61000002AC63F6D0F9B0F406BE8332335C94540	91	10	2023-07-29	7579	81868.5566813816	f
3890	0101000020E6100000C874A2F81FB30E40227F270024D54540	14	3	2013-03-23	21136	90259.6408683817	t
3891	0101000020E6100000B732851AEEB20E40AFE8500A01CC4540	53	5	2014-08-16	97622	99010.7991900181	f
3892	0101000020E6100000EF1FEACCA0B80E401E71627A15D04540	80	3	2012-03-24	32372	84253.6863795984	t
3893	0101000020E6100000F6D04E722AF20E4033BBAEDEC1CB4540	61	5	2019-10-06	86432	37941.1530431588	t
3894	0101000020E6100000C911D205AE700E408C2BC6F7C6CF4540	27	6	2011-09-02	71529	62119.9287678827	t
3895	0101000020E6100000ED9D63CD1CC90E40B47E5A8BE6CB4540	9	2	2023-10-10	3752	48039.7242547448	t
3896	0101000020E61000008EDF7AC418820E408C300414BACD4540	30	3	2010-05-31	8750	15248.5536961628	f
3897	0101000020E6100000DAA08E46F4740F4099C3E4EDDFCA4540	73	5	2023-07-31	20288	91488.8130211165	t
3898	0101000020E61000001E890F2098000F40534385CEACCE4540	84	9	2014-06-10	18694	19927.8521949224	f
3899	0101000020E61000002337F201DE370F400DA69BEA9AD24540	25	6	2019-09-06	16898	65370.9222014234	t
3900	0101000020E610000090D80197764A0F40CD2DD3B3CCD44540	14	1	2024-10-08	19493	67720.52366081	t
3901	0101000020E610000061F97F7241730F40A2459C58E2C74540	92	1	2024-12-30	14818	47143.2725861256	t
3902	0101000020E6100000380F78571F2A0F402AE89724C3CB4540	18	2	2024-12-11	26258	83756.3320953925	t
3903	0101000020E6100000D894DFAEFD400F40CC2E09FE14D54540	74	2	2016-10-06	61771	78101.9743606341	t
3904	0101000020E6100000B085F6B2960E0F40797B40D54DCE4540	87	10	2011-04-30	34586	59936.6096433812	f
3905	0101000020E610000026E6BF3F70A10E406BF33785C5CE4540	36	9	2022-04-17	97959	93267.3521967296	f
3906	0101000020E61000003C5A1629CF810F40174DA373F7D34540	52	2	2013-07-28	44221	68844.7515857578	t
3907	0101000020E61000000C82B4556D6E0E409324FDF30BD44540	68	7	2016-06-21	63424	55025.6260057359	t
3908	0101000020E61000005E7DF04810E70E4074CCB3CA3AC94540	60	9	2020-11-10	30353	87754.5659207346	f
3909	0101000020E61000007B2FA986D5450F4027D3F42CD6CA4540	43	10	2011-02-20	77335	27828.0500107316	t
3910	0101000020E610000004F7BEFBCF050F40F7CF6921A0D04540	35	3	2019-01-20	97048	38519.7698746985	t
3911	0101000020E6100000F1457A1349AE0E4099F2E80AFCCF4540	60	8	2019-02-28	62885	61866.8623904311	t
3912	0101000020E610000050AD3567E3510F40E8FF5EE5F8C94540	4	5	2012-05-23	88351	58656.9808093961	t
3913	0101000020E61000007D44ABA63D880E40599D7531E3C94540	55	10	2013-09-04	60987	7952.6057488192	t
3914	0101000020E6100000B6CFC6C6B35E0F40E4565C2F9DD34540	21	2	2015-09-05	16566	56313.9080074021	t
3915	0101000020E6100000A426C2FBDC930E40353F690649C94540	51	2	2016-10-04	70119	21714.8628118707	t
3916	0101000020E6100000655A3F82CCA80E4057A1E7BFF1CF4540	59	8	2024-09-25	81287	97619.5838759642	t
3917	0101000020E6100000673921C91B830F401C51AB33F8D14540	84	9	2017-08-06	21403	6513.94525464559	f
3918	0101000020E610000058A894F9F4250F408C0A1DAA57C84540	95	7	2025-10-04	8605	26356.3580486676	f
3919	0101000020E6100000FA2368182D030F404113BF4E35CE4540	40	7	2012-12-06	36546	49374.9117153104	t
3920	0101000020E6100000AC11FD5004410F40DC83C540A1CF4540	21	9	2015-07-31	42789	43455.1717074968	t
3921	0101000020E61000008444CBC264920E40426D43F686D24540	28	3	2018-05-03	2806	61611.6476942717	t
3922	0101000020E6100000E5296B8DC3EF0E409F4BD59B58CB4540	94	10	2012-12-13	34628	6529.98900537516	f
3923	0101000020E6100000D8BAD0415CC70E406EA4226209CF4540	79	5	2010-06-13	68586	25510.2559072626	t
3924	0101000020E6100000D764A2FC70120F40FCB5801B8CD44540	56	4	2025-03-21	77004	71923.5052408405	f
3925	0101000020E61000007513CBA796A80E40190D3857EDD34540	73	6	2019-08-07	16953	42834.3521585535	f
3926	0101000020E610000091C36DBE78C20E404A3DB4F049D14540	24	8	2010-07-06	86549	60448.5581263877	t
3927	0101000020E6100000C6762A387C850F408DBD3FE7ACCB4540	47	7	2024-02-20	89988	44194.8110884425	t
3928	0101000020E6100000E006D0A5FB690E407C350CB9F6CE4540	71	4	2020-12-04	5195	28839.0528680606	t
3929	0101000020E6100000E726E03BAB340F40A1B61B2D17CF4540	2	9	2017-09-14	21663	6070.64589559281	t
3930	0101000020E6100000DF0CD4600ED60E40FA34CEB3FACA4540	82	7	2016-07-13	62906	42395.6061626605	t
3931	0101000020E61000006345800772360F403DD02BD61BCE4540	85	1	2013-09-05	63313	67409.7841120789	f
3932	0101000020E61000002B222AC98BF10E40DBFC710D4FD54540	39	3	2011-05-03	85884	17224.7070717152	f
3933	0101000020E61000005F0C5F686BAA0E40FAA377C2D6CE4540	76	6	2016-05-11	95549	88339.6891141833	t
3934	0101000020E6100000FA5ACD21DA6F0E400ACDBD0C6DD14540	89	3	2025-09-24	12675	12166.8700978443	t
3935	0101000020E6100000579A232966170F40C841E93DCFCF4540	72	9	2017-05-26	50006	47572.9420855707	t
3936	0101000020E6100000ECFD35DED06F0E40DA84CF7908CC4540	44	9	2020-11-06	40750	44675.2433354639	t
3937	0101000020E610000053BC58DD07B10E4028E01772E7CC4540	27	5	2018-06-18	17939	22331.99826835	t
3938	0101000020E610000005F3AC1F38210F40D4D01DD19ED34540	56	7	2022-04-26	95547	45883.5522893263	t
3939	0101000020E610000029A7F27E79A40E4039AD928D3FC84540	53	2	2017-01-05	94997	45818.0485980524	t
3940	0101000020E6100000EEAF2F48B4110F4033671ECD3ACB4540	77	9	2024-05-09	26241	93263.1458771662	f
3941	0101000020E61000005B4167B7D7460F4073447D155DD24540	36	3	2016-07-18	2920	85663.9998794125	f
3942	0101000020E6100000D0FF560EAB8E0F407E727445F6CA4540	70	4	2015-06-28	6350	18515.86394641	f
3943	0101000020E6100000F7C5DDA95DBB0E40870A069134D34540	27	8	2019-11-21	67804	4308.89749428971	f
3944	0101000020E6100000C341683B6CBD0E40CBD27C5E52CC4540	15	6	2020-09-05	6795	60986.0986241324	t
3945	0101000020E6100000A6341265BD260F405600E3AF76CC4540	93	1	2020-08-30	40373	86050.229177597	t
3946	0101000020E6100000A824A361C43F0F40039A837A79CA4540	8	4	2023-07-30	33651	27382.4266173165	t
3947	0101000020E6100000A43A729519F50E40B0A7197CB0CC4540	60	1	2022-10-12	84290	54441.2550537257	t
3948	0101000020E6100000C4D08AF6A6090F40EE7F9F8AEECB4540	39	6	2013-06-14	34654	10611.9068188866	t
3949	0101000020E61000006C6849AAD4EE0E403C3CFB28E2CE4540	92	1	2020-10-09	55734	99821.0899618361	f
3950	0101000020E61000003861A2680A8E0F406E1EACAFDECC4540	90	5	2019-12-26	33345	91615.9202347053	t
3951	0101000020E6100000E6697C07CF900E40849A266F8ECA4540	62	7	2024-09-19	31866	20027.7404569872	t
3952	0101000020E610000005153177DEF20E405C01DB915CD54540	64	2	2010-05-15	89993	80882.663673304	t
3953	0101000020E6100000D090B00164660E403D7BE0B3C8CA4540	63	8	2014-12-16	40070	98761.4712306094	f
3954	0101000020E610000001B403E49EC70E40F6A59B8453D44540	22	1	2015-03-05	13736	39262.5895495805	f
3955	0101000020E610000073A73F5E47B00F40790470BECECA4540	45	3	2011-01-05	57960	25323.5660423657	t
3956	0101000020E6100000FB54C06D6CD60E40E56C2D6132D54540	10	9	2020-04-26	89560	91358.705765293	t
3957	0101000020E61000004464F4DE36E60E4008E4527DE2D04540	78	8	2024-06-07	47851	91607.3700643828	t
3958	0101000020E6100000EDC7D30B071F0F408E925A3255CC4540	76	7	2023-05-08	81435	76577.4193495738	f
3959	0101000020E6100000D40C909F021E0F4063541D32BDCF4540	99	2	2016-09-07	79638	93652.9678550207	t
3960	0101000020E6100000084C7AD2A0E10E400C2BE67DE8CD4540	4	1	2014-11-01	37745	5173.95813379808	t
3961	0101000020E6100000957D16487A340F4064770E66CECB4540	32	3	2020-12-29	24390	28163.1614804078	f
3962	0101000020E61000000F3865B95AA30F4041FF3182FCCD4540	68	2	2022-09-09	20426	38247.3358726162	t
3963	0101000020E61000005AD68DD937760E401AC8BFC3D7CE4540	56	10	2021-11-07	8026	17611.6084788332	t
3964	0101000020E6100000F995147990030F40ED3C03604BD34540	6	3	2010-05-20	51724	23183.4114192271	t
3965	0101000020E6100000527AD31347F20E405C392EBCD3C74540	18	7	2024-05-05	99841	33522.3503822806	t
3966	0101000020E610000079788A74AFA50E401A1B3AEEA8C94540	66	7	2018-09-10	15468	12502.0769488354	t
3967	0101000020E6100000A732D630E1DB0E403869C5C738CB4540	50	4	2012-04-17	20146	49888.3090610063	f
3968	0101000020E61000007825BC83698D0E4070D4617822CA4540	51	7	2021-10-09	31550	18091.1260682636	t
3969	0101000020E6100000E2B9403091220F406644BECD35D54540	99	7	2018-05-10	57094	38360.4002737798	t
3970	0101000020E6100000A2BC476411DF0E40507AB2AD7BD34540	52	8	2013-10-07	42015	28703.3811856602	t
3971	0101000020E610000067EDE39224D30E4079E7C81C37CE4540	28	7	2022-05-05	5279	82317.4441708389	f
3972	0101000020E61000005DE27D0FC7C20E40387099B1F0CC4540	48	1	2014-07-02	70733	40828.08819292	t
3973	0101000020E6100000441E0F9765F60E406E4C04ADFBD44540	27	1	2023-06-02	70629	70722.932544176	t
3974	0101000020E6100000B7EA0DFFC7910E40D092D9A0B6CF4540	48	5	2016-08-10	99364	69425.5439480715	t
3975	0101000020E61000008A29473D7B640F402910D7794DD24540	59	4	2014-08-16	34141	47780.8433486896	t
3976	0101000020E6100000411C1CDB028F0F4097822CC90BD24540	52	5	2018-08-16	44625	22517.9465645702	f
3977	0101000020E61000004429A5CD05DF0E400F0EA4AF67CB4540	2	7	2018-06-09	90469	44090.4592074093	t
3978	0101000020E6100000205ADE84D1650F40B4DBF3A89FCC4540	26	6	2025-12-28	38181	8871.06006998017	f
3979	0101000020E6100000171C2EBED14A0F40B8A50D46EDC84540	90	2	2022-07-23	52194	63587.6792394612	t
3980	0101000020E6100000583E465850720E403B8755A69DCC4540	100	2	2023-06-01	43452	6061.49203179571	f
3981	0101000020E61000003E6B66567C240F4059031905AAC74540	64	3	2014-05-16	53544	41803.130946249	t
3982	0101000020E6100000B02C28769C880E4064C820ACABD44540	86	6	2013-10-17	5322	91324.6340997059	f
3983	0101000020E6100000AB26B1C348E50E40E12662C944CE4540	15	9	2014-06-16	22865	87564.7387486944	t
3984	0101000020E6100000F2E1BF4A067A0E40EDED74A720CD4540	27	9	2015-07-28	20337	99042.6361349805	t
3985	0101000020E61000002E4FD53AD4AC0E40A735D649B7C94540	82	7	2013-09-16	71721	21941.1831038988	t
3986	0101000020E6100000CAEE1892199E0E40D583EC153FC94540	12	2	2017-01-21	57299	98607.5498352403	f
3987	0101000020E61000003AFB762B77170F4029B139C065C94540	23	2	2023-05-28	64098	29230.5611483228	t
3988	0101000020E6100000D8BBC6B867A70E406C44891230D14540	91	5	2022-03-20	63050	80910.7293468611	f
3989	0101000020E6100000DE06AACB06910F400FE501687AC84540	53	10	2024-01-28	29368	93207.7580552032	t
3990	0101000020E61000006DDEC062FAEE0E4096CD41C912CD4540	96	1	2024-05-29	84439	54148.9133734554	t
3991	0101000020E61000009AD0DB34DAB10E40EFFD92D532D24540	70	4	2017-12-31	23939	71706.9004736638	t
3992	0101000020E610000098E85E4DB96E0E400E5F86C8EED24540	30	10	2019-09-01	78561	90632.4228990533	t
3993	0101000020E61000000A7A7EB9FEDF0E40F401B329CCCE4540	48	9	2018-02-07	44226	41421.7758253215	t
3994	0101000020E610000010A9964876970E40A07EC3E4C8C84540	97	10	2010-02-22	32601	46901.2618569211	t
3995	0101000020E61000006542A5D196E20E40745D2BE135D44540	28	2	2010-05-26	38671	39498.5997444259	t
3996	0101000020E6100000CAA322661FBC0E40DF023DE106CC4540	48	3	2017-08-06	116	65289.950700645	t
3997	0101000020E61000009964933896C30E40104BDD1BD4CA4540	16	5	2014-05-17	20972	32545.2440323962	t
3998	0101000020E6100000F28E99664B2B0F4075830157D0C84540	11	9	2010-04-19	12896	47595.4296575048	f
3999	0101000020E61000000F34D4EFC6A80E40F9005CFA48D34540	59	9	2022-01-20	96331	16246.8787902724	t
4000	0101000020E6100000E9A22BC308F20E40F53617FE0DD14540	85	7	2014-08-30	65662	56895.1717869628	t
4001	0101000020E6100000AB806E1FDE140F408B4C6B4C4CCF4540	35	6	2023-08-12	29570	51472.4877307458	t
4002	0101000020E6100000E3BC11BE7B6C0E4021F0149075C84540	12	3	2010-08-18	22497	46305.7625082296	t
4003	0101000020E61000003827C372C26D0E406F49B9C748D24540	83	1	2013-08-15	26397	97092.2024503615	t
4004	0101000020E6100000614BCF8472A20F40B5E150BCCED44540	7	9	2011-12-20	3069	3411.82295506699	f
4005	0101000020E6100000B7B2D199AB860F40298D1F9981CF4540	85	4	2011-09-06	90563	72230.4075696679	f
4006	0101000020E61000000F7E9BDDFE100F4050F522F6F8CC4540	81	5	2023-03-12	89742	44142.0075169983	f
4007	0101000020E610000081E2EFE6C08A0E40ABE96874F9CA4540	1	10	2015-01-14	39969	36495.2692629007	t
4008	0101000020E6100000A4522DDADD690F409281660836D34540	83	7	2013-07-19	54641	28691.3311721662	t
4009	0101000020E61000000C1B9C18F0BD0E409AD07804DFC84540	37	8	2021-11-02	85382	19923.0720951773	t
4010	0101000020E61000000157AF2908AD0F403CAB5F671FCB4540	49	3	2011-05-23	29432	13450.6578640219	f
4011	0101000020E6100000DB9499A50CA00F40666A5EE6ACD04540	42	3	2011-12-03	92474	43507.7964220391	f
4012	0101000020E6100000A9F2A448017D0F4025A87D1029C94540	91	2	2024-08-10	22242	55308.5731863849	t
4013	0101000020E6100000F724328CD3AD0F4006791BC7ABC84540	46	1	2021-02-06	27589	72383.5327023898	f
4014	0101000020E6100000BB84F7ECBA4B0F40A8BA1D6526D54540	6	7	2021-05-05	15355	36994.9853941426	t
4015	0101000020E61000009576F03876D70E4056557999C5D44540	34	5	2025-04-09	27364	1680.53294395698	f
4016	0101000020E6100000E2D6E3870D950F4038B40D9905D54540	45	5	2016-03-08	19774	92945.6261309972	f
4017	0101000020E610000002DA18DDCB180F40439107A793C84540	20	10	2010-07-30	32153	6953.42692942029	f
4018	0101000020E6100000E21005EDB7FB0E404E27846D6DC84540	89	5	2010-07-03	14556	40034.0703244273	t
4019	0101000020E6100000142F5690449B0F4099D5D00F1BCD4540	79	5	2021-11-02	25991	6507.54425164506	f
4020	0101000020E6100000D437FFB9300C0F40729DA22662D44540	75	4	2014-12-24	16982	50500.4593515372	f
4021	0101000020E6100000D92C7BA918430F4057B33ED402C84540	100	5	2024-03-24	2037	2592.54663413049	f
4022	0101000020E61000001C94A5181E490F401F32BA2A7BD04540	97	7	2012-05-17	53483	42904.7985691704	t
4023	0101000020E61000005B3E3B4DBF7D0E40A395881B8EC84540	32	7	2019-12-24	10167	15380.9341556882	f
4024	0101000020E6100000D438A5D28D310F4069F6C96D09CE4540	5	10	2018-08-23	11687	57527.631267952	f
4025	0101000020E61000003A12AB806A7E0F40F446A428CCCA4540	32	3	2013-03-03	61299	23625.8459898368	t
4026	0101000020E6100000B0123DE9D8A50E40CCBB7DFC29CB4540	14	5	2025-10-17	93870	13638.5824556236	t
4027	0101000020E61000000335731FC9790F404FD03A940AD14540	17	10	2019-12-23	3656	22523.9666547739	t
4028	0101000020E6100000721D76EAB6690F40B4461A3FC7CF4540	28	4	2023-03-04	71303	40652.6112840535	t
4029	0101000020E6100000C4782D2F27000F40786EE99303C94540	77	5	2013-04-05	64023	10046.6759530676	t
4030	0101000020E6100000F0A7CC236A450F40319E0F41CFCC4540	16	4	2025-01-16	4416	90128.2383346764	t
4031	0101000020E61000001A7BBF0001230F407DAE4FC330C94540	90	2	2020-07-20	45545	8620.88082362804	t
4032	0101000020E6100000F4481C79BC8E0F404848BD1416D54540	3	2	2025-01-31	45278	36040.8027786593	f
4033	0101000020E6100000A2AC00B541320F4045A1FDF224D24540	86	6	2024-02-17	42310	39024.7315543353	f
4034	0101000020E61000008900E115D3AD0F40AFA634580DD04540	33	6	2018-06-30	9715	13212.3004088877	f
4035	0101000020E610000093B00E3A23690E40EBF28316D2D44540	72	5	2023-06-30	54595	71660.3995020506	f
4036	0101000020E61000008E831AE9658D0F403FE8AE6EF1D34540	73	7	2020-02-05	31424	63913.6709876006	t
4037	0101000020E6100000FE0BD1EB0E090F402B0B1CCB6CCC4540	51	1	2013-01-24	30999	6928.81783623707	t
4038	0101000020E6100000456BF9EDE03B0F40120AD3B914C94540	68	5	2019-05-02	29181	96700.4835907161	t
4039	0101000020E6100000B0FC237895AA0F4069F83D2416D54540	82	3	2022-10-01	10743	64247.571747907	t
4040	0101000020E6100000CABB365F75360F403BA8EAEC65CB4540	41	1	2012-12-18	80361	78406.5973640184	f
4041	0101000020E61000001DC8923CED5C0F4034BB863E59CA4540	53	3	2025-08-09	36583	28911.0834537791	t
4042	0101000020E6100000B1E0D2BBA5C40E40BE08125B4AD24540	77	3	2017-12-25	50244	34916.2406945281	t
4043	0101000020E61000004337C9BC478D0F404364AF217BCB4540	97	9	2023-04-25	28181	98596.9868326009	t
4044	0101000020E610000063EB49B966AC0F404C981EF5C5C84540	39	7	2022-05-27	46874	78842.0960931628	f
4045	0101000020E6100000B77954C161EF0E40A1DF13D1D0CE4540	84	9	2022-10-07	70990	16904.2826847227	t
4046	0101000020E61000004209DA1AD1310F403C6822FE3CCC4540	75	3	2019-12-18	13582	74952.0702035224	t
4047	0101000020E610000052DCA04C066B0F40D34A602AF5C84540	93	7	2019-02-22	86161	83968.3691384429	f
4048	0101000020E6100000BB4DD62D848D0F404FB2D767B8D44540	1	6	2024-07-17	1780	87171.6687943278	t
4049	0101000020E610000098E4DD87F6A10F40BB98AD47FECA4540	53	9	2010-02-12	60529	20239.7544955498	t
4050	0101000020E61000000632C4692D580F4047798B1DFED14540	57	6	2020-03-24	71569	95468.9831953685	t
4051	0101000020E61000008C02CB5394F50E40CA3BDC5252C94540	96	1	2014-07-31	67503	72721.9424368857	f
4052	0101000020E610000050BBD66ED5800F4050BFDF1002CE4540	84	10	2023-05-21	41722	21764.2541066673	f
4053	0101000020E61000004DC7652501550F40C05EB604B1CE4540	21	6	2013-05-30	35606	34329.9999139144	t
4054	0101000020E610000046746F0D7DC40E407FFFE32C63D24540	76	6	2011-06-08	55119	84777.402386473	t
4055	0101000020E610000015EFA4B6396C0F40FE510CB77AD44540	61	7	2016-09-12	72125	4954.95378888757	f
4056	0101000020E6100000C36FDC4ED6C00E40051CBF845FCF4540	41	5	2019-04-08	53413	37203.4985448516	t
4057	0101000020E6100000EE4B9161C2B60E4081841E24E4CF4540	89	2	2020-12-30	68605	21390.1357786005	t
4058	0101000020E6100000C6CA75006B6E0E40EC6C049963D44540	37	2	2014-03-19	75323	56635.189306617	f
4059	0101000020E61000001493D9B0F1520F403F717041CBC74540	71	8	2010-10-07	53916	80254.8371121689	t
4060	0101000020E6100000CF08D252E8490F40E66559BE7AC94540	45	9	2012-08-31	91238	89808.607851168	f
4061	0101000020E6100000F10A423813AA0E4059D3F4DBD5D24540	17	6	2014-01-09	79168	59655.8687960612	t
4062	0101000020E610000033CDE215448C0E40705821C591CD4540	43	5	2018-10-27	83739	6630.80679290167	t
4063	0101000020E6100000D0080C439A760F407027B19028D24540	52	8	2018-03-24	84520	89707.7252286976	t
4064	0101000020E610000083473947B4A40F40E4FC5C252ED04540	76	4	2011-09-01	2995	18238.0536148196	f
4065	0101000020E6100000F0A91A4D35670F40E421F412DCD44540	6	6	2015-12-29	24283	72496.9173615644	t
4066	0101000020E61000008321729B29B00E40B37BE6B6DDD14540	6	10	2015-09-14	95490	94540.1167504897	t
4067	0101000020E6100000877DE561F3C60E40A99EE97775C94540	47	6	2010-02-15	86961	7943.3034275517	t
4068	0101000020E610000078E125969E670E40E7B0EEC43DCD4540	7	4	2019-02-11	82404	88271.5291015813	f
4069	0101000020E61000002B9606A7DF2D0F4024C902801AD54540	45	7	2011-12-09	51593	49746.947654009	t
4070	0101000020E610000066E693EC8EB30E40EF98D8DC75CC4540	88	4	2013-06-23	73311	3725.01069679818	t
4071	0101000020E6100000111E064547300F409C86FD60E1D24540	20	5	2023-03-05	18748	68318.7321108037	t
4072	0101000020E6100000B47B32A2021D0F40C5A2CAC6D5C84540	13	3	2013-07-01	22159	69634.7370727459	t
4073	0101000020E6100000B9FD79E2729D0E40C4D4CB7FE2D44540	33	6	2014-10-15	81657	28230.5451709935	f
4074	0101000020E610000034062D78D8B70E4067794DF91DCE4540	87	6	2022-05-16	13719	65660.7982906158	t
4075	0101000020E61000004091A579237D0F405B897118D9CC4540	57	1	2025-11-13	83387	43771.5188500078	f
4076	0101000020E610000077B3F1860F690F404918DA9D0FCA4540	54	10	2020-03-31	38240	4798.26650024608	t
4077	0101000020E61000009F7C0E7508CA0E404CFDAD00ACC84540	63	5	2014-08-08	46822	71011.3488431173	t
4078	0101000020E6100000E511413553E80E4080C3CA7E9BD24540	24	3	2024-05-06	9709	5074.38936486955	f
4079	0101000020E6100000503D0F5806A70E402081495E79CA4540	8	8	2012-07-03	77768	97771.1225705585	f
4080	0101000020E6100000234AC2A6E8A70F40008BA1B73FCB4540	16	1	2024-06-20	73350	3462.86994827409	f
4081	0101000020E6100000F8A7513A62AF0F4075A4042F38CC4540	82	1	2013-06-11	89140	80185.0926270569	f
4082	0101000020E61000000FF4C6AA0E4A0F40EEAD9FD68ED44540	87	2	2011-09-01	67623	29210.8733098217	t
4083	0101000020E61000005F4F541D22700F4057625273F8CA4540	32	2	2025-06-29	67537	94228.5644070163	f
4084	0101000020E6100000DB0262CEE5910E407846E953F4C94540	50	3	2015-02-14	27689	37551.679324992	t
4085	0101000020E6100000017F7EB3307A0E4079FE7D2795CA4540	60	1	2012-12-12	29791	6501.16911038223	t
4086	0101000020E6100000086B65D47D3E0F40D0BDC72927D34540	96	3	2021-09-15	81360	44787.2625200255	t
4087	0101000020E6100000DBAFC12C4A6A0F40AA26CAFC33C94540	35	10	2019-02-04	73113	65177.8487807514	t
4088	0101000020E6100000259F449BF9720E4062D22C995AC84540	26	8	2023-12-16	89545	62490.3442694144	f
4089	0101000020E61000009CCBF2D8D6DD0E40F0F5F7FBE0C94540	5	5	2015-08-14	8489	4943.91613576639	f
4090	0101000020E61000005B06C592AC380F405870474093CA4540	86	7	2020-06-22	34345	61184.317771857	t
4091	0101000020E6100000DE3F0B3CE8B10E40F158EE48CFD14540	2	9	2018-08-24	33319	75321.7082372079	t
4092	0101000020E6100000573A62DE89AF0E40FAAD1F6A3CD14540	93	7	2014-07-06	76598	60603.5670454806	f
4093	0101000020E610000092B82403CB3B0F400927C7CD2BCD4540	78	6	2011-09-06	67007	79683.6009171173	f
4094	0101000020E6100000C15C840061AA0F40F786D6EC1BCA4540	36	2	2025-03-14	70682	53524.4472685821	t
4095	0101000020E610000040CBE72D90700E4078F8472160C94540	71	2	2022-07-27	45156	79360.485519918	t
4096	0101000020E6100000860BAEC1D75B0F4052B1B1890FCA4540	50	8	2021-06-04	1778	24498.2513823203	f
4097	0101000020E6100000F161DAAE7DD40E401FC5F07FE4CE4540	94	8	2017-03-21	10984	19027.6267360649	t
4098	0101000020E6100000392CE7FDC6810E40E0CC01009FCF4540	35	8	2025-01-21	33877	1567.54702795627	t
4099	0101000020E6100000E32D6BAD1FF90E40980FB633B8C74540	50	7	2013-12-16	91370	28396.5201483227	t
4100	0101000020E6100000FBAC9533B5150F40DA5F4F223AD34540	30	1	2022-06-24	9489	43217.6282096954	f
4101	0101000020E6100000A292B367274D0F401AC5D95212CD4540	2	3	2022-11-20	41963	15935.789470599	t
4102	0101000020E6100000B0FC1BD6BB920E402E61AE505ACB4540	87	2	2012-12-19	40099	18033.3571598415	t
4103	0101000020E610000017D133B6F85A0F404D374C0AC1D04540	47	7	2016-12-25	30701	29286.9950583728	t
4104	0101000020E610000082F161546D870E4046733EAB5FCE4540	88	10	2021-08-08	39857	64418.3235335439	f
4105	0101000020E6100000D329B2BBC4D20E40A4D6418140C94540	56	3	2011-06-24	97479	84398.6564605391	f
4106	0101000020E6100000657AC81BF00C0F400AE249EE84CB4540	18	1	2011-09-08	20208	2529.26515858309	t
4107	0101000020E6100000299BB0F43F880F408BB916CB3DCF4540	19	4	2012-04-24	44859	25542.2641343458	f
4108	0101000020E61000004815E886F8C10E40D39AC5E031CD4540	36	10	2019-08-22	61057	7410.16337048179	f
4109	0101000020E6100000DCA0E5BE24D70E4022AEC35B50CC4540	30	4	2012-08-09	14427	23582.1501261075	f
4110	0101000020E61000007A69DB2B6B840E40D6B10831E8D14540	85	9	2023-12-16	30897	49734.7423233685	t
4111	0101000020E61000009DC823D6B8020F4006B563A26EC84540	74	4	2024-03-13	2054	93524.3178449603	t
4112	0101000020E6100000142C7137C1750F40581B888D51CD4540	98	8	2020-05-23	11050	26955.6021518777	f
4113	0101000020E6100000E128EBD69B550F40DBA5D001DBC74540	63	9	2023-03-01	63195	8248.5482281903	f
4114	0101000020E6100000AF7DDF2705730F408178BA7767D14540	73	6	2010-05-10	97111	28885.4154587831	t
4115	0101000020E6100000F0CF815E41B50E40ED88A1A24EC84540	44	2	2015-01-20	91550	632.193127545655	f
4116	0101000020E610000015BDFBECF63C0F40EF5913AA34D54540	65	2	2015-02-10	61483	42538.7605875466	f
4117	0101000020E610000095B1E889FAB40E40F93D58B52CD44540	94	2	2018-08-02	22941	58511.4715274479	t
4118	0101000020E6100000482DC20492820F40E29DFCA87CC84540	88	9	2014-05-05	71908	2916.27681660531	t
4119	0101000020E610000006A5FAFBE0AA0F40AF2035C46ACE4540	67	8	2015-02-01	37874	13798.0943013269	t
4120	0101000020E610000011EC2E2658880F4015045BE108CA4540	70	3	2023-05-18	790	57675.1445895776	t
4121	0101000020E61000000C3CA1EDEC310F4062F8549C3BD04540	97	7	2014-12-14	49711	76688.8639785327	f
4122	0101000020E61000002E0B6FD61BA30F40CEDE2C08AFCC4540	26	3	2020-05-29	8428	42544.3114803189	f
4123	0101000020E6100000A4DA00DCDD980E409499627767C94540	38	8	2019-09-13	4945	33759.0598301823	t
4124	0101000020E61000000F929B4102E60E408CBC6B5457D34540	17	1	2021-07-18	81138	81764.3371311736	t
4125	0101000020E610000045429E8D2F620F409596623720C84540	59	8	2022-03-08	21828	60362.0055666633	f
4126	0101000020E6100000EEDAE70C9E5F0F408CA8C7F008D54540	16	7	2017-08-29	98183	98121.0078035581	t
4127	0101000020E6100000FC88E424F79F0F40DFC2E45A4FD14540	61	10	2018-05-06	21413	20741.276375308	t
4128	0101000020E6100000EACD93DDEA680F401B59298A28CB4540	15	5	2011-01-09	52892	66776.993968608	t
4129	0101000020E6100000661D945F05770E4037BB757BFBC84540	5	3	2024-08-02	20882	50395.8615551075	t
4130	0101000020E6100000C67B320C8EA40E401DACC3E4DDCA4540	34	1	2017-10-18	57626	4039.22752479307	f
4131	0101000020E6100000806A152DD7B50E400562820E3CCB4540	93	7	2025-05-11	84156	22074.9236666338	f
4132	0101000020E610000090C029C9F58D0F40DECA30A4B0CD4540	86	9	2020-11-11	43332	53283.1361042847	t
4133	0101000020E610000003A76E2D42970F402F02AD04A4CB4540	25	2	2021-06-11	4671	86279.4779000337	t
4134	0101000020E61000004B6865B3E5880E401C87214BF3CF4540	3	4	2012-02-07	75425	99158.2004806117	f
4135	0101000020E610000011AD9E350F7F0E403ABF42134DC84540	12	5	2011-08-08	19136	54590.907105364	t
4136	0101000020E610000034AA1F5E93EA0E40F1CB56653ECE4540	7	10	2015-03-20	95941	5615.63574152446	t
4137	0101000020E610000039952D53CD750E4042326A1003D14540	51	9	2021-02-04	68512	27053.7913933428	t
4138	0101000020E6100000A849E0F7C5890E400615DB48BED34540	39	3	2020-05-06	80759	20739.3368162442	f
4139	0101000020E610000049001A3EB8340F4097161CFB2EC84540	43	5	2021-02-07	72864	64505.4451293302	t
4140	0101000020E6100000A6BBC18D958F0E4085BAE4CD81D44540	85	10	2025-11-03	540	2062.41205986486	t
4141	0101000020E6100000B8BFE210203F0F403B1DF89932CC4540	90	7	2016-03-09	24230	85568.3014036315	t
4142	0101000020E61000008264860B74910E407876662830D24540	98	3	2022-02-24	97195	77538.206422353	t
4143	0101000020E6100000E2708191AB880E40D68017A833C84540	15	2	2012-02-18	81805	77826.8029477217	t
4144	0101000020E610000093BFE2A820700F402662385929CA4540	93	6	2016-09-21	68843	46710.120534334	t
4145	0101000020E610000071A2E44010BD0E40311A807CA8CE4540	43	6	2010-06-18	61568	9196.10872545991	t
4146	0101000020E610000096715180EF950F40D2562D77CCD34540	60	4	2021-03-23	91447	15879.9245477752	f
4147	0101000020E6100000C642D37B5FA90E40F2283B0F16D24540	33	5	2023-04-28	5618	72107.1308275124	t
4148	0101000020E61000002EA9AADE6FC60E408D08C87088CC4540	64	7	2019-04-05	78127	58019.3191576607	f
4149	0101000020E6100000B400D7EFA3130F40B5062AA23DCD4540	25	10	2021-12-21	31802	96870.4567396235	t
4150	0101000020E6100000B067D94D9BF10E40E48BABCB3CD04540	65	7	2020-12-25	61667	53796.1358469988	t
4151	0101000020E6100000979CFFCFB5720E40DCAD3A0582CB4540	85	4	2020-05-05	65920	45258.7972468117	t
4152	0101000020E6100000FA3E20CF843E0F40CB00CBF6BDC84540	6	9	2025-02-09	9269	12639.040181579	t
4153	0101000020E6100000BC83F92DE2D10E408DC238B649D24540	30	1	2023-08-24	95445	80504.8407387545	t
4154	0101000020E6100000572ABAA94FFD0E40653E2FAC40CF4540	89	10	2023-09-18	43430	17336.3893682791	f
4155	0101000020E610000058D8EF98CC9E0E4057EAAE5B16CA4540	28	4	2014-11-02	11377	1395.2112732359	f
4156	0101000020E61000008066C981D8D60E40742C0D1565CE4540	98	10	2011-09-14	4377	95206.496778592	t
4157	0101000020E6100000815FE49E906F0E406F2493EA17D54540	73	9	2021-10-06	99668	99083.3355533335	f
4158	0101000020E61000002A9CF976F3270F40B0BAC04B71C84540	47	9	2011-06-03	19083	20973.8952513754	f
4159	0101000020E6100000307BE75C57CB0E40B8AE859260CD4540	33	10	2023-02-13	24313	69346.8575043795	f
4160	0101000020E6100000C3BF1C8A6F9D0F4014DA15CA6FCD4540	28	9	2020-07-28	28853	79378.3750071609	f
4161	0101000020E6100000ADF049A5B39E0E405440694724CF4540	20	8	2020-05-30	72603	63243.1794289771	t
4162	0101000020E6100000E13B873FF10B0F408E8FF7CD66D24540	74	8	2011-12-21	35966	85975.2476337643	f
4163	0101000020E6100000C47EC9BB94DE0E40B9DEBEFB4FD24540	85	9	2025-01-03	53889	99239.4522805092	f
4164	0101000020E610000003C9D547D6B00F40D2BFABF4D5CF4540	75	1	2011-08-13	12059	2913.92352219468	f
4165	0101000020E6100000C6603A0AB6C50E40EB184ECC53CF4540	3	5	2019-12-15	52820	42324.143223629	t
4166	0101000020E61000004AB3AC756D550F40B6B4AEF312C94540	44	9	2016-10-13	17616	97380.9456043947	f
4167	0101000020E61000005E7E568CF8760E40906894A77FD24540	51	6	2022-03-21	19979	89064.3544612204	f
4168	0101000020E6100000A10998B103DC0E40BD16D88062C84540	79	9	2010-05-23	14137	95785.7483473492	t
4169	0101000020E6100000DC36C6CEC92F0F40F8B725F74ED54540	38	10	2015-01-31	80949	59413.0071699835	t
4170	0101000020E6100000A7ABB318FAAC0F40CAB81CFC9FCA4540	39	4	2021-01-10	23365	1263.6720003468	t
4171	0101000020E61000006E62ED9068140F406DA92D890CCC4540	23	8	2024-09-23	93742	4782.14804245749	t
4172	0101000020E6100000A960D9F174780F40843B9F898DCB4540	73	3	2023-09-24	34150	41137.4321377095	t
4173	0101000020E6100000BC266F05DC960F40F069AECCA7CC4540	62	4	2016-04-18	10159	11981.9901203572	t
4174	0101000020E61000001379AEBE51C10E40A472E240D6CE4540	18	8	2010-07-27	96806	56359.7177655499	t
4175	0101000020E6100000260CD1C863310F407A57C2C004CF4540	66	7	2016-07-10	22499	28723.0819231362	t
4176	0101000020E6100000C919BF87D7A40F4065FB01AB23CA4540	36	5	2016-10-29	24915	85651.8353284841	t
4177	0101000020E6100000BC9BA4C747800E40BDD093CED3D04540	62	6	2015-11-25	9631	7439.56189582429	f
4178	0101000020E6100000503C328BF3DB0E40070C73698DD14540	36	4	2011-07-14	44115	60881.0724562204	t
4179	0101000020E6100000600013EA8FCC0E40A4AAD33905CA4540	52	10	2022-06-18	21527	16538.6055681215	f
4180	0101000020E61000002C5BED6253260F407F058157F8C84540	78	3	2012-09-06	12014	12368.6426187778	t
4181	0101000020E6100000A9AE202DF0A00E4059738B8003D14540	71	7	2015-04-11	30313	71307.7175452672	t
4182	0101000020E61000001372664AE5F10E40B8FC144122CB4540	62	7	2018-01-05	14560	60731.0987529259	t
4183	0101000020E6100000BB42FF2298860E4067D11C05BFCE4540	20	1	2017-05-02	86006	82230.6513035833	f
4184	0101000020E610000023A6F4C2EE1C0F40769757F97ACD4540	20	3	2019-04-20	31119	50107.8444468164	t
4185	0101000020E6100000CC64040850A90F4054374B9ADACB4540	68	2	2020-07-13	66198	37320.6838205844	t
4186	0101000020E61000001983E262BC030F40A540EEC200D24540	50	8	2017-01-03	36044	47398.8173638526	f
4187	0101000020E610000048A388AB36DC0E40DC3C47E0C5CA4540	72	7	2014-07-03	62547	93648.8548118047	t
4188	0101000020E610000077E4045B41570F404314CE2C97CF4540	17	4	2019-05-14	8796	57409.3007520673	t
4189	0101000020E6100000EF66167FE1440F40C70A6E5188D24540	88	7	2018-06-18	62724	45397.4714333898	f
4190	0101000020E6100000CBF44090FAC60E406FAA85FED6D14540	12	9	2023-02-09	22219	5169.23168600436	t
4191	0101000020E61000009301A7F5272F0F4068E267A75AD04540	54	7	2014-06-24	81866	12817.0422616633	f
4192	0101000020E61000005F8E0C73DD930F401DCC174385CC4540	18	1	2024-10-06	36746	91002.8864435254	t
4193	0101000020E6100000BCE6D51E1B890F4052E201BD7ECD4540	65	7	2012-01-17	57903	59430.9769491509	f
4194	0101000020E6100000B165F719C5680F40016B764A22D04540	59	2	2015-12-13	67218	56583.2181773935	f
4195	0101000020E61000003DC71BB8188C0F403814A0B325D24540	39	8	2024-03-20	98347	26997.5341712256	t
4196	0101000020E610000021AB154013530F40EDF063FF30D04540	93	4	2012-02-07	8378	33874.827666293	f
4197	0101000020E61000009084098EEF390F404DE3161208D04540	89	3	2012-05-15	49684	40243.3007955444	t
4198	0101000020E61000005DE51D23F3090F4063575F8881D14540	83	9	2022-11-27	14930	80694.9559629099	t
4199	0101000020E61000006DA1D6DBE14F0F4098F1A79D17D44540	1	9	2020-03-31	32648	43868.4870505297	t
4200	0101000020E6100000BE7314D1ACA10F40F6F6493F1FD14540	29	7	2015-04-12	53696	59718.8768234593	t
4201	0101000020E6100000573C42E006DB0E40DD5D1E82C3D04540	100	9	2012-07-08	89108	75656.906384785	f
4202	0101000020E61000009CCE1E1EDD950E40AE29E39E6ACB4540	45	1	2018-07-26	88390	61634.4629396989	t
4203	0101000020E61000002C24DB8908200F404FF7596611CC4540	91	6	2013-11-22	67299	72433.1327106887	f
4204	0101000020E6100000EE9483ED98380F40FA53CCCCC1C74540	23	10	2020-04-06	9524	45867.6931039112	t
4205	0101000020E6100000E635708F249E0F407A1731EC0ECB4540	99	2	2011-08-20	67966	90430.418496542	t
4206	0101000020E6100000ECE5B556FDBB0E4004C36261FFD14540	56	3	2019-11-21	29326	89316.5981019564	f
4207	0101000020E61000001C390BFB0F600F400860C41277D14540	90	2	2014-08-24	14924	83861.4872758127	t
4208	0101000020E6100000CA3EAF714C770E40F06ABDAA8DC84540	9	4	2016-06-06	80748	89538.2128634266	t
4209	0101000020E6100000C8D7FCA778160F40CC9CFEF45BD34540	20	3	2018-04-08	99051	78625.9778582286	t
4210	0101000020E6100000C12B8C0369B70E40A71C6DA8D4C74540	25	9	2014-11-04	2810	300.912098381967	t
4211	0101000020E6100000399E59F50C9C0E403870DB43AFC94540	89	8	2025-05-01	5948	44142.8402629285	f
4212	0101000020E61000004722D777DB780E40207A93571CCA4540	86	2	2024-06-11	13317	85349.5980954556	f
4213	0101000020E61000003C4BA550F6470F40B69EE1428ED24540	50	4	2021-07-11	35617	27296.7410248428	t
4214	0101000020E61000001556C76D739C0E404ABE48C5DFC84540	35	2	2014-01-07	44692	683.630874707863	f
4215	0101000020E6100000676E9455956F0E402405FB1FF0D04540	91	9	2017-01-07	8956	60519.0524229764	t
4216	0101000020E6100000A9CD3F757C340F40268EECD36CC84540	16	6	2011-06-10	90327	44490.2240217349	t
4217	0101000020E6100000FFFF9A0CE6180F40346B7E0F41CF4540	30	9	2022-03-11	34901	88214.0391097	t
4218	0101000020E6100000D317A807E57A0E407A1B248D9AD04540	45	6	2025-04-30	3971	69936.1124219812	t
4219	0101000020E6100000E1C363A384570F405DCCFCE8D0C94540	78	5	2022-10-10	60785	50295.164316858	t
4220	0101000020E6100000312AA65F44730F4001C975244AC94540	64	9	2024-12-23	49704	14817.8755442701	f
4221	0101000020E6100000AADE266D9A580F400DC69C0E9CCA4540	39	10	2024-09-05	57599	70609.6630402848	f
4222	0101000020E6100000DB26063593270F4037C3B38119D54540	35	5	2020-02-24	2247	779.370499037091	t
4223	0101000020E61000006E451BC39D050F401F7B0FA275CD4540	43	9	2016-10-22	52085	3323.20247202902	t
4224	0101000020E6100000231A9B969C690F4096EB6EB43FCE4540	67	7	2018-11-01	41636	73657.9329366032	f
4225	0101000020E6100000CDAE5FB6E32D0F40C44E029691D14540	14	7	2023-06-19	14036	24258.3535740826	t
4226	0101000020E6100000A850B9B149A10F4061A229A006D34540	14	9	2016-11-19	69395	38660.3722081759	t
4227	0101000020E61000006D028F16557D0F400F3601C9B7CD4540	30	3	2018-09-27	10771	23723.1171156923	f
4228	0101000020E6100000DBACD65A55F60E400D29AE708FD44540	48	10	2023-11-01	16855	99576.4273251046	t
4229	0101000020E61000005FDCCBF4022C0F401F89237095CB4540	36	6	2020-07-04	30625	92262.9737594723	f
4230	0101000020E61000007DCF07BC57A30E40F0CA856315D44540	35	7	2025-08-03	35045	97144.2227404011	f
4231	0101000020E6100000EC816CA34DFE0E4044D54F5515CB4540	8	8	2025-08-23	66276	17921.3852465945	f
4232	0101000020E6100000665FE9D881B50E405A4F359511C94540	76	10	2010-10-26	96519	51246.0942519796	t
4233	0101000020E61000000934A8E3E1590F40E0D2CD0717C94540	70	6	2024-02-26	762	67949.9953955101	t
4234	0101000020E6100000C85C9E2B54E00E40A563731656CF4540	67	10	2010-03-11	472	18785.9908159376	f
4235	0101000020E6100000C970EC9FB5A80E406EBC0C6E78C94540	88	10	2019-12-19	86937	74912.3656251453	t
4236	0101000020E6100000DAF0B7D6ADC50E40DA8BAC3A1DCA4540	50	8	2010-12-23	12960	12681.3978411565	f
4237	0101000020E61000003B5E2E069B770F400D58294B23C94540	5	10	2016-10-04	79372	94339.9624065866	t
4238	0101000020E61000003A215BFE7BD80E407EDE84CDC4CB4540	47	1	2011-03-15	79222	89338.699433963	t
4239	0101000020E6100000D6188CC15C150F4003797B9418D54540	89	2	2016-05-23	86082	5930.19197655038	f
4240	0101000020E61000003D2037B432550F40B7A9CD4D4CC94540	7	3	2016-11-28	7010	19168.2675207048	f
4241	0101000020E61000003412E61DC2580F406D7C9E5EDAD24540	100	10	2017-09-14	37012	22948.1044255421	f
4242	0101000020E6100000E419ED09317D0F40F55838DD99CE4540	96	9	2016-02-26	41477	63384.3307840157	f
4243	0101000020E61000006714E175AC980F400669A1F5FDCB4540	56	3	2014-07-09	35271	31218.5533018661	t
4244	0101000020E61000005B9B8162C0650E40B4D07820A3C84540	56	5	2016-02-24	41112	6691.38071534532	t
4245	0101000020E61000008163611434410F40D07BEEF70FD14540	6	4	2015-09-23	41886	96337.4811381201	t
4246	0101000020E6100000EED93323B1A10F40BEA60DFB1CCA4540	3	4	2015-07-30	42208	95723.299066038	t
4247	0101000020E6100000D02205BCB2A70E40064C7F6E47D14540	78	7	2010-08-07	67945	6164.77652000411	f
4248	0101000020E61000002A5841017D080F4044830FE63DCB4540	61	6	2022-02-26	13260	99721.3953377595	f
4249	0101000020E61000003178236DC24A0F40BCE13B3776CB4540	34	1	2015-11-26	39421	35689.8586321822	t
4250	0101000020E6100000A44BF4D70A640E408749F83370C94540	2	6	2014-08-22	47881	57949.0244006601	t
4251	0101000020E6100000A636E806759C0F406B18A5C375CE4540	94	4	2021-10-06	32248	79919.9545300961	t
4252	0101000020E61000005B0B12477B290F409E43B4C7B1CA4540	54	5	2018-11-04	57987	169.480939536992	t
4253	0101000020E6100000DBA93D58E7A00E40829575FB86CC4540	61	7	2023-12-31	97262	70930.1757929647	f
4254	0101000020E61000003841CBAD100D0F40D1980D80CED44540	86	4	2025-08-06	87779	63848.5430024228	t
4255	0101000020E6100000DF1DDBF1A13A0F40263D10F3F4D24540	99	10	2023-08-22	60375	76102.438807862	f
4256	0101000020E61000000DCF4481B6460F409EBE87D8DCD44540	54	3	2020-01-30	58858	59114.6235540346	t
4257	0101000020E61000005F0473F023B00E40CD4EBEBF60CD4540	54	10	2015-01-11	90476	7172.91751567592	t
4258	0101000020E6100000AC67B3D6D5630F40F01A4857E2D04540	99	10	2014-04-19	48041	15369.6858711841	f
4259	0101000020E6100000E70FF45A13370F40A3D2F99EE5CA4540	11	2	2025-04-16	66901	71498.3682387766	t
4260	0101000020E610000014BED41E05D60E40F770014A5EC94540	66	10	2019-11-11	81540	92388.1873742911	f
4261	0101000020E6100000450C4B0140720F4072DEACD3E0CB4540	18	4	2016-01-27	93532	90474.0385934402	t
4262	0101000020E6100000EC83D83C05170F408D8C929BD2D24540	59	2	2019-09-29	31988	35495.5996025655	f
4263	0101000020E610000025B53226C5050F402719B4F505D34540	7	9	2020-08-24	48205	75287.7519329012	f
4264	0101000020E6100000A9AA6BAEBBAD0E40C5208F70E0D04540	2	10	2010-09-24	95696	58714.7932273061	t
4265	0101000020E6100000E3281B931E6A0F402D6AD437C8D14540	84	1	2025-03-23	53808	65342.4475986163	t
4266	0101000020E610000093775CBC64380F40D17903B9AAD44540	34	8	2021-11-11	6359	68560.4043280741	t
4267	0101000020E6100000903E34B2A18C0E409C9334CADED34540	44	1	2013-08-10	55444	22342.1559418955	t
4268	0101000020E610000079E71F6B628D0E40F6C2030214CB4540	14	8	2019-07-14	63770	41795.8052666535	t
4269	0101000020E610000085C63CC85D950F40655BAFAC99CE4540	24	9	2021-09-12	55617	4479.02489956165	f
4270	0101000020E610000065D6B586A3570F4086D824D420CF4540	2	9	2014-12-11	61409	82957.413037927	f
4271	0101000020E61000005915B0C327ED0E40FCFC7B76A7C84540	37	6	2013-05-31	86760	78923.6984342934	t
4272	0101000020E6100000F768C3527C9A0F400DA51E5A2BC84540	20	10	2024-03-13	18695	76065.0141142696	t
4273	0101000020E61000003202B247AB810F406F60D22318C84540	100	5	2016-06-16	78617	16101.9200598184	t
4274	0101000020E6100000BAEB53CC42900F40BE78551A4FCE4540	19	7	2019-07-28	72300	91380.9330697562	t
4275	0101000020E610000072990E1FF95E0F40168E333235CD4540	18	6	2022-08-28	45135	93574.118532401	t
4276	0101000020E6100000D75690D0281F0F40B4FB4EF717C94540	66	10	2024-07-21	17879	23216.9320890988	t
4277	0101000020E610000046D76D5B8EB90E40645AED2F57D24540	86	7	2025-10-04	16227	46164.4926622633	f
4278	0101000020E610000048123A3609580F407693D35C1CD44540	6	8	2022-06-04	86220	93628.3030108314	t
4279	0101000020E61000009F51023909AE0F405C17BE1504D44540	51	6	2019-12-12	58973	15306.9469791616	t
4280	0101000020E6100000E1B04957A1660E406389778189CB4540	30	6	2017-12-24	36134	96464.1212003685	f
4281	0101000020E610000032B3905E9A280F40F1262ECDC7CA4540	64	7	2023-04-08	90935	20407.5345714827	t
4282	0101000020E6100000C5C35E29F0610F400589343E8AD44540	75	7	2017-12-21	65874	35593.3320798	t
4283	0101000020E6100000FB3FB23605240F40BF785ECC19CC4540	53	8	2016-07-04	9444	77920.5801030517	f
4284	0101000020E6100000D3D41CE92EA20F40267C71D9C2C74540	47	1	2022-01-04	88275	68971.6560695393	f
4285	0101000020E61000002F9B4FFA55910F40764118ED1BCD4540	83	1	2011-08-18	94574	43920.359368097	t
4286	0101000020E6100000FD805ED3E2460F4002DA6A6D48CF4540	6	2	2021-12-28	20521	60252.3170081761	f
4287	0101000020E6100000FAFC83D504DF0E40DB55D3018AD04540	24	10	2024-11-16	55666	14918.0710837072	f
4288	0101000020E61000005EB9A00C86D70E40EF5EBDE38AD44540	98	10	2015-05-24	89753	24198.2995122287	f
4289	0101000020E6100000B6FE724609BB0E40C5A2F070A6CD4540	60	4	2014-02-22	60139	92023.4182052332	t
4290	0101000020E6100000A9B3A811ABD40E40F69C2198CED44540	41	1	2013-05-21	95384	90407.4618483987	t
4291	0101000020E61000004972A64B9F6F0F4055D18579C7D44540	84	3	2019-07-27	47348	29557.8756923094	f
4292	0101000020E6100000578C0FF0A4790E4006AC1F619BD24540	14	10	2016-11-06	38686	95911.9728049119	t
4293	0101000020E6100000682564640D440F40689068DA84CD4540	7	8	2013-09-30	80564	34144.0549337765	f
4294	0101000020E61000009C430F39630D0F4055C422CFB9D24540	6	5	2025-08-26	31055	3143.59409110967	t
4295	0101000020E61000009AC6423BB1CB0E40D9CB5E63B8CA4540	86	7	2011-03-22	62685	35781.5366706889	t
4296	0101000020E61000001139E79E38760E404B7EB683CBD14540	20	3	2016-05-29	61494	12906.644403202	t
4297	0101000020E6100000CDFA00E95D8B0F40B30EDF8C5CCE4540	56	1	2024-10-24	76536	15809.3066215053	f
4298	0101000020E6100000C409824D76080F40819D6665E9CA4540	57	7	2019-06-25	92277	57722.3882209593	t
4299	0101000020E610000093B8B240F3CA0E40CC1410DA4ECA4540	44	9	2017-09-28	31267	77457.0991514763	t
4300	0101000020E610000063D02404A2900E400B1A55AFCAC74540	87	8	2014-02-14	21261	67510.7440776599	t
4301	0101000020E6100000B09137653ACD0E4063A471C69ACB4540	92	3	2022-09-14	52103	28450.0539728831	f
4302	0101000020E61000008A4E184025EB0E40349A42C0C3CE4540	29	8	2011-01-10	28220	96053.8445662919	f
4303	0101000020E61000004F9C05AD0A590F4080D5846BF6D44540	8	4	2022-01-07	15795	3049.88225073504	t
4304	0101000020E6100000940D573559E00E409668145DF9CA4540	20	4	2021-06-07	2666	34129.3807413984	t
4305	0101000020E61000004328BB50059F0F4024D25625BAC84540	70	7	2011-11-03	44527	73453.1644809523	f
4306	0101000020E6100000E879C3EF7B7D0E404651154007CC4540	87	5	2019-01-10	2367	61502.4390181842	f
4307	0101000020E610000082F7A20FA0850E400541C99345D54540	69	6	2015-11-01	99019	69803.6203266615	t
4308	0101000020E6100000C0BC1B25559B0F4021C94128BFD04540	2	5	2019-12-10	1550	21643.3842405348	f
4309	0101000020E6100000BA016DF2F5CE0E407D02CDC609C94540	57	1	2011-04-20	59539	49319.616198327	t
4310	0101000020E6100000E828CA28DF6D0F409232EC4548D14540	52	3	2021-11-26	94410	77961.3697139189	t
4311	0101000020E61000007A53F13225830E404358787340C94540	86	3	2025-02-07	48221	36670.6538511868	t
4312	0101000020E61000005B65639AADDD0E40B11FF034A2CC4540	64	8	2020-01-05	49046	90569.0011424769	f
4313	0101000020E61000006DCA73E378220F40BC08EB2FCAC94540	28	8	2025-09-28	63350	17212.743379939	t
4314	0101000020E6100000394326DCBECD0E404A16F8AA2FD34540	16	7	2018-03-24	21717	75152.9711497593	t
4315	0101000020E6100000600CC2700FFA0E4077728FC708D04540	2	4	2021-09-11	82560	55740.8403905552	t
4316	0101000020E6100000DC8D60E1C7980F406D812916D7C74540	6	3	2022-01-02	36748	9082.83954685156	f
4317	0101000020E61000002C9FAAE744A50F40C2B4F0FBEACF4540	72	7	2017-09-15	85466	52967.2018839147	t
4318	0101000020E6100000375726373CDA0E401A17BCF788D14540	73	8	2015-07-21	10031	33826.6296551202	t
4319	0101000020E6100000F28A88A584290F40F29C9E29CBD44540	11	8	2024-01-18	49810	16741.4767927786	t
4320	0101000020E6100000E126ADA6FD990E40AA4445B6C4CB4540	20	8	2010-03-11	94359	54644.0543414932	t
4321	0101000020E6100000766C5529961D0F40B499322D1EC84540	33	2	2020-12-08	61619	50445.8952535553	f
4322	0101000020E61000002A8F3D524EF50E40C5FD400E65CF4540	15	3	2013-02-08	4727	48534.7433417132	t
4323	0101000020E6100000AD09D94047640E4015D8AF5628D44540	3	6	2025-09-22	50938	19233.6331374492	t
4324	0101000020E6100000987DE91E46980F40BD64C38CF7CD4540	1	6	2017-07-06	94777	38343.4249607449	f
4325	0101000020E61000002628061649840F40244FDE2D58D14540	84	10	2015-07-08	92450	88208.6539089393	f
4326	0101000020E61000009D76A141C8830F40B61A2783F7CD4540	40	10	2011-09-18	11832	25628.590348004	t
4327	0101000020E6100000ED8B244EF48E0E40E204CD3704C84540	14	5	2013-03-13	96127	77612.0681732103	t
4328	0101000020E6100000F5A9CC40828F0E405E42DD134FCC4540	98	5	2016-05-28	84464	81568.9138915464	f
4329	0101000020E610000091833C3929B80E400069761215CD4540	18	8	2018-05-24	13699	74283.5643271676	t
4330	0101000020E61000006A0272524E980F400B93147AB4CE4540	91	5	2015-06-30	13631	7377.85137151854	t
4331	0101000020E6100000B0684E28EE7E0F40C558DBBE6FD14540	14	8	2019-03-27	15730	58396.2752017306	t
4332	0101000020E6100000FE0B0DD802940E400504302597CD4540	63	9	2010-08-02	55753	57586.6480002701	f
4333	0101000020E6100000A22DA082BE6B0E406A73CCAE05D24540	73	4	2019-08-02	88799	7372.70814545787	t
4334	0101000020E6100000E90D8A1277B20E4069ACA8A574CF4540	59	8	2024-11-13	4833	72173.8718639592	t
4335	0101000020E61000008CB89745AFD80E40D0D12BA878C94540	21	8	2022-05-09	37540	10697.0832165423	f
4336	0101000020E61000007159C32478FA0E40289437E5A8CD4540	81	4	2011-02-12	46393	27242.1275652052	t
4337	0101000020E61000009A1C41CE45780E407D805C3A1FCA4540	81	4	2014-11-25	39653	21063.2344630471	t
4338	0101000020E61000007EAEE4099C920E406B931F26D8C84540	27	1	2021-05-31	23244	43535.623741743	t
4339	0101000020E6100000E63D753802930E407FDEC510C6D14540	11	10	2018-05-11	3771	85175.1703518638	f
4340	0101000020E61000001ED801E3077D0F404978CBF4ABD34540	22	2	2021-10-29	95802	42607.2331258273	t
4341	0101000020E6100000F952FEC319A10E40EA82FA76BCD44540	90	7	2013-04-17	16237	70085.3722119241	f
4342	0101000020E610000008D4F8D53DDE0E40C8659C464AD44540	51	9	2023-10-31	51237	37576.3704816495	t
4343	0101000020E6100000141DF2BBDF6D0F40FBB50EDE97CF4540	12	3	2018-04-05	20618	71547.452101233	t
4344	0101000020E610000089637FBBE1390F40732A895F12D44540	83	1	2024-07-10	98468	96661.6050170332	t
4345	0101000020E6100000FAA8D9E0932D0F4038BDA0B048CC4540	24	10	2024-07-22	675	28718.6272676032	t
4346	0101000020E610000069DA9D5688D20E401C9CFCECE7D14540	82	3	2012-03-26	53469	39605.2846626619	t
4347	0101000020E610000090E10B0DC8980F4040EF4F543DD24540	91	7	2015-11-09	93852	84545.5344059541	f
4348	0101000020E61000004EEB3E19A0E90E4098CA562069D34540	56	4	2015-06-01	66656	39489.3794822137	f
4349	0101000020E610000046D6DF76F0740F40E04BFE31ACC94540	4	8	2019-12-16	88816	42049.5864438623	t
4350	0101000020E6100000D4D4E457F97E0F405EAE29682AD54540	45	2	2025-12-14	38225	54107.4560097816	f
4351	0101000020E61000006A4714F33AB40E4066B1563990D44540	80	6	2011-06-06	44489	19722.5426753189	t
4352	0101000020E61000007101D4A2D78C0E40F609B8F5F0CF4540	89	7	2016-03-17	52662	91858.868071889	f
4353	0101000020E61000002E86E16B90EC0E403C0097862DCC4540	50	10	2024-02-14	801	62935.2696069055	f
4354	0101000020E610000086CC494BC8C40E406D320669BECE4540	44	4	2023-07-29	14389	3987.54424688819	t
4355	0101000020E61000000B6DC795533A0F40379BCB8ECAD04540	27	5	2015-07-02	98012	20578.8173009783	t
4356	0101000020E6100000251A816D7CAD0E406F44273228CF4540	82	2	2016-04-15	97320	38511.6505670384	f
4357	0101000020E61000003F1FFB81126E0E4098F87973BDC94540	11	2	2021-09-19	62912	76672.1555101072	t
4358	0101000020E61000002A88CA2362B80E40BD7F2107A0CA4540	8	9	2018-03-05	43896	18600.7376084796	f
4359	0101000020E610000039281FD697E80E4026FD796CD7D24540	78	5	2010-09-02	79334	18392.8396537044	f
4360	0101000020E610000052BBAB023D0D0F408F90B69C7DC84540	16	8	2021-11-25	53345	91559.3128136272	t
4361	0101000020E61000000574B437203C0F409A1DC50F6ECE4540	63	7	2017-02-07	1144	82615.2177854835	t
4362	0101000020E6100000ED764FDA11CC0E40B572CAABBFCD4540	65	3	2014-06-18	95367	73907.667577687	t
4363	0101000020E6100000D1640CDDCB790E40CAF39B4465CA4540	67	3	2012-08-17	49795	33244.2926129462	f
4364	0101000020E6100000FAADD52B4A760E403009845808CB4540	79	2	2013-09-18	59460	70208.3246758839	t
4365	0101000020E61000009093D16BC0890F4093520E479ECA4540	26	4	2014-11-22	37331	56583.7597633417	f
4366	0101000020E6100000D48FC37B94740E405DAB6F899BD14540	25	6	2025-11-02	55743	61929.4113704945	t
4367	0101000020E6100000DF4C40F3E63E0F40269D5BA27FC84540	39	8	2019-06-25	3198	3821.07820831767	t
4368	0101000020E610000005EE837D92460F405CF0396C3FCF4540	53	5	2012-07-27	42070	7101.95524538189	t
4369	0101000020E61000000572CF18B4B50E40FB2AF1158CCC4540	24	5	2023-09-05	10338	63154.6112760215	t
4370	0101000020E6100000762D51372F540F40DD770B5EFDD34540	41	4	2013-08-31	20406	69563.036972282	f
4371	0101000020E61000006134AC3E75A30E40BAAF98D475D44540	81	7	2016-05-13	81318	4659.40486420542	t
4372	0101000020E6100000BC7ABE96E5AB0F4025C5AE790FD24540	68	8	2013-08-05	15110	50823.2327428248	t
4373	0101000020E6100000CD46893A91940F40BD882A2FADCB4540	53	5	2023-03-19	98588	44795.9833024419	t
4374	0101000020E61000008026296BA8AF0F40739D967D80D14540	24	3	2016-01-04	1801	31188.9367360548	t
4375	0101000020E6100000EE316E7A5E4B0F403B8867AA21C94540	71	4	2020-01-19	71630	48425.3410791731	f
4376	0101000020E610000097C600B71D770F40443CA1BF83D24540	34	7	2022-01-21	25071	53197.904376313	t
4377	0101000020E6100000806D7E69CD050F400E7D99CD66CE4540	80	4	2010-07-31	87996	4185.05655854797	t
4378	0101000020E61000006F4259810E940E4044D6FA433DCC4540	5	5	2025-09-20	73985	73553.1127124586	t
4379	0101000020E6100000E17435759F400F4098A973A95BCA4540	68	2	2019-05-22	80871	38401.5185029915	t
4380	0101000020E6100000D1C852B0618A0E40807A97BA47CA4540	11	1	2023-06-11	75774	56534.8416825145	t
4381	0101000020E6100000150E73938C370F4033B3D3674CC94540	89	9	2016-11-14	11028	89243.6631042414	t
4382	0101000020E6100000B5B0043BDB6C0E40732EDF5E5ED24540	37	10	2021-06-06	71800	92465.3043211691	t
4383	0101000020E6100000F7460408754A0F40FC416AA3B9D24540	28	5	2024-11-09	27852	54590.33413493	t
4384	0101000020E61000004235F95EE7CC0E401B033B1AF3D24540	52	10	2025-02-12	75528	2758.05715622921	t
4385	0101000020E61000001955421537B00F40762C8474FFC94540	1	10	2014-02-01	97889	58320.5022413174	t
4386	0101000020E6100000003E9791BB5A0F40CFEBD6129BCC4540	52	7	2012-12-27	54594	79081.9380274014	t
4387	0101000020E610000011328F84E8FC0E400F2E842455C94540	42	7	2025-10-12	50022	79883.919946882	t
4388	0101000020E6100000D6625D91A1830F402D7AB86880D04540	52	4	2016-08-18	38479	50655.9873804795	f
4389	0101000020E6100000922E3894A0810E401CB66F4378CD4540	51	10	2025-12-19	87042	39195.9905182976	t
4390	0101000020E610000029F957CD77C10E4021A230C35BD44540	48	7	2013-06-25	66890	43161.4377339373	f
4391	0101000020E61000003164EB6A12BD0E4013B30C9618CD4540	25	2	2016-09-22	64941	19188.961998254	t
4392	0101000020E6100000B5AB1462D1FA0E40B5F934B21AD54540	13	4	2011-05-27	57307	2144.33979475968	t
4393	0101000020E6100000C6BBEA0E1AE90E4098685FC0CCC84540	33	5	2022-05-04	20846	77223.7085173409	f
4394	0101000020E61000006EBB64D4D8300F409AC63872F1D14540	81	8	2024-12-31	9256	82315.5093731386	t
4395	0101000020E6100000D306B3C9DC2E0F40F1E11DDA17CF4540	36	10	2021-12-08	95876	38931.6434538917	t
4396	0101000020E61000001ECFC64D95FC0E407B77B76132CE4540	44	1	2020-03-30	34704	18058.2951626395	f
4397	0101000020E6100000FBFC22583AA40F404D7AF69BBCD34540	4	1	2013-06-21	2266	9660.10068083902	t
4398	0101000020E6100000A3CCACEE04CA0E4081C7B1B185C94540	99	3	2016-08-31	25969	99069.2786552459	f
4399	0101000020E6100000A3890BB7B7E40E40ADC5CDC6EFD04540	83	8	2025-10-06	16206	77138.864061536	t
4400	0101000020E610000037E8BB228FF60E404845A02FC8C84540	61	3	2025-11-16	68073	37803.1461983871	t
4401	0101000020E6100000D2EFC58184A90F40FFF6D8585AC94540	59	6	2024-11-27	32252	76744.1878758663	t
4402	0101000020E6100000276F3F47D4AB0E405CE0D976A6D34540	23	1	2023-03-29	7502	19423.3559542035	t
4403	0101000020E61000002A1E22E6B0350F404F8E68E7B9D24540	88	6	2021-05-02	30816	95588.4211124544	f
4404	0101000020E6100000A897148427170F40CFC89414E5D04540	52	2	2016-03-30	79850	28132.3772804719	f
4405	0101000020E6100000E6777552A2D80E406D20002503C94540	85	7	2022-11-23	81031	94856.7857576674	f
4406	0101000020E61000009114358E7E6E0F40BACAB5CD11CC4540	17	6	2024-10-04	82469	88405.1923615941	t
4407	0101000020E6100000B0070D25F82C0F4048CB70B946D24540	48	10	2019-12-03	24366	79105.3990269127	f
4408	0101000020E6100000D6C561A96F7F0F4051CF042D4FD04540	49	5	2017-08-30	89361	39121.0629378953	t
4409	0101000020E6100000FD4D100438B90E407E135AC1BBD24540	24	4	2017-09-08	14937	69414.706071883	t
4410	0101000020E610000052012620EC130F408AC1E443EACC4540	79	2	2012-12-26	23960	39053.6181486824	f
4411	0101000020E610000019500969A1B20E40F81E0279BAC84540	1	10	2024-05-26	71661	26373.3901858407	t
4412	0101000020E610000093D402B0D5870E4095409A77A9CF4540	99	4	2022-04-15	1576	17607.1563018936	t
4413	0101000020E610000074C8B1D3F3730E40E9F8745F80D34540	84	10	2024-04-03	6842	87594.7271077482	t
4414	0101000020E6100000AE19B276E7B40E40BEA957E7F5D04540	34	4	2024-01-12	55492	92298.1043530119	f
4415	0101000020E6100000785F53421A6A0F40EB0721F9F0CD4540	18	7	2022-12-01	99655	40648.9118685506	f
4416	0101000020E61000001595500824980E40793F19E685CC4540	8	5	2010-11-07	6287	21279.5617925541	t
4417	0101000020E6100000FEA076A2CA8F0E40841FB8C72AD34540	88	4	2011-11-18	61004	8525.83889268452	t
4418	0101000020E6100000ED914C3B6E470F4004063FAF6ECD4540	36	5	2024-05-07	90272	12950.2098332944	f
4419	0101000020E6100000422C8080DE7C0E4072F8662CFDC84540	53	7	2013-07-13	50021	41757.2482439832	f
4420	0101000020E61000006849989584BA0E404981B5D13ACB4540	21	10	2022-09-19	99518	32503.706820376	f
4421	0101000020E6100000557F01224D710F400912EBEA54D24540	23	10	2020-07-06	71191	78259.2806811235	t
4422	0101000020E610000020E470D2D3F60E40D30D9BE4FDCE4540	49	5	2014-06-17	95020	58802.2394011599	f
4423	0101000020E61000009F274D1A3C7A0F402C3FF89EF0C84540	79	6	2021-10-07	50988	87070.0163261418	f
4424	0101000020E6100000559C9AF275A20E408CA162E900CB4540	35	3	2022-11-26	52844	74722.2504082958	t
4425	0101000020E6100000A5829F5B75FE0E402A064C5AFFD44540	89	8	2021-03-25	35364	17125.7065021893	t
4426	0101000020E61000005AE779B567B50E408CD0DBC9A6CD4540	73	5	2019-02-11	43119	4619.62215099541	t
4427	0101000020E610000036DCD58A7B060F4000CF1C6FC0D44540	31	9	2017-05-04	91023	52069.3192861341	t
4428	0101000020E6100000BD6863CDCD8E0E40437E662930C84540	69	8	2013-01-30	38480	83533.3230885915	t
4429	0101000020E61000000DE0102E4E300F408E0B225857CA4540	62	2	2022-09-29	13985	30600.3953906509	t
4430	0101000020E6100000F9A274CD8C210F408F18DE9180D34540	73	4	2025-05-05	53032	75352.0396064438	t
4431	0101000020E610000067CA600F324F0F40E85BC18348CB4540	52	2	2021-03-12	7580	45818.8590055639	f
4432	0101000020E6100000E6BA1E2D2CD10E40C4DD5DC68ECE4540	91	3	2021-10-10	80106	12765.4313679828	f
4433	0101000020E61000009B5A1EE16BED0E405009E68536C84540	6	5	2018-04-26	89035	89991.1710706362	f
4434	0101000020E6100000D41984627A150F406644F872CBD44540	91	1	2015-12-29	53962	29773.0646493938	t
4435	0101000020E6100000D17FAA7C5BEA0E406728FAB7CFD24540	26	1	2012-01-12	45642	61990.4363428733	t
4436	0101000020E61000008E6F017A627B0E40D97CB0C851C84540	55	3	2015-12-20	49828	49284.809262022	t
4437	0101000020E61000004DF177BFD8640F402CFE4DAF95D44540	45	7	2020-09-19	21007	78274.5170096835	t
4438	0101000020E61000004A721A2AAFF60E402F059F43BECE4540	33	7	2024-01-07	90700	12900.2556062417	t
4439	0101000020E6100000ADEBC5CAEAB30E40839D0A7F10CE4540	22	6	2010-01-22	11286	4485.75622666796	t
4440	0101000020E61000000E279C4930360F40AE31584B6CCE4540	94	2	2022-09-01	71019	10341.8922223844	t
4441	0101000020E61000002B5EC4F220330F406CCBD476C9C84540	4	7	2019-08-20	91596	14406.7100071288	t
4442	0101000020E6100000D966E09C48780E40A8E12036CCD04540	65	7	2017-09-16	68619	99767.3846363485	t
4443	0101000020E6100000F72DC24310D30E40500B7BE4BAD34540	16	4	2025-09-24	71040	32813.2106952705	t
4444	0101000020E61000003C84253841620F404E1174D7C7CA4540	36	6	2025-03-18	86437	27556.9977954587	t
4445	0101000020E6100000ECE15D8EEE710F40A3E55B5CB0D34540	44	3	2017-05-04	45086	38997.7680308274	t
4446	0101000020E610000068D1938C86940E40E7A4EB39E0CF4540	74	9	2013-05-09	86132	25114.5830535348	t
4447	0101000020E610000050A0105649A40F403B743044E9D24540	76	8	2017-02-11	92521	94974.1600039176	t
4448	0101000020E6100000A5594F1B848B0F40A61A1C8DE7D04540	64	8	2024-04-03	95516	46870.3688909943	t
4449	0101000020E610000061AD709070240F401B43E9DD17D04540	99	7	2014-12-11	6152	81231.4111887974	f
4450	0101000020E6100000918B430D44AF0E40E8B70AFF64CA4540	16	2	2017-09-15	43255	11453.750707323	t
4451	0101000020E61000009C9570B63DAE0E405917EF96B0C84540	17	3	2014-01-29	87504	44910.6009225529	t
4452	0101000020E6100000FDAF788348820F405BA85BF640CF4540	82	3	2024-10-05	28421	97735.5139421535	t
4453	0101000020E6100000906A46A1F0030F4084BACD197DD04540	40	5	2012-01-08	39257	28864.3704853017	f
4454	0101000020E6100000DC31EF37831D0F40E3EA3F006ECA4540	52	5	2010-10-01	86865	33932.8293320866	f
4455	0101000020E6100000FE08A2C9897D0F401315749B4BCD4540	72	9	2018-12-18	46224	18585.9125137689	t
4456	0101000020E6100000BFEF2151D4820E40700CF13FA9C84540	73	5	2014-07-12	19880	6478.52253107921	f
4457	0101000020E6100000E0DD83F3BC4B0F40CB08DA8D81C94540	43	1	2013-04-13	95101	61314.1074116707	f
4458	0101000020E6100000B6EA1950A3430F4087B1148FA0CA4540	30	1	2017-10-22	93212	46970.9610143996	t
4459	0101000020E61000005281AFEBD4120F405FEC81E71FD04540	46	2	2014-06-07	2919	93742.605087014	t
4460	0101000020E6100000FE7B11C6B1840E400DCFBF0D5EC84540	49	9	2022-01-10	10523	22243.9384939911	t
4461	0101000020E6100000D157D59307700E40EFE925CBCFD04540	100	5	2022-11-07	7983	15576.6027846938	t
4462	0101000020E6100000E73913BA8C760F40FBB7790E42D54540	66	8	2024-01-02	19339	14654.3809998861	f
4463	0101000020E61000006E353E75AC920E40915B45C4BECE4540	60	6	2022-05-19	76892	72086.2509173301	t
4464	0101000020E6100000C712786776C90E40F62296163FD04540	25	2	2010-05-24	28328	10889.7488988245	f
4465	0101000020E6100000AF2E31B0D4040F40894FF7BCB8D14540	59	7	2023-04-17	84887	224.066269730527	t
4466	0101000020E61000000BC7CEEBA87A0F40FE904C6A34CE4540	34	4	2020-11-04	43170	34295.5811923574	f
4467	0101000020E6100000FE07436F6E580F4034BC076E29CA4540	12	7	2021-05-28	84109	28836.232168128	t
4468	0101000020E61000003CA2D4ED34650E40572A8861AFD34540	12	9	2022-02-18	29007	43237.3479957247	t
4469	0101000020E610000035D914CF94D80E408ACF89F0CDD34540	39	7	2015-12-22	42923	24679.4719618614	f
4470	0101000020E610000006F33636C1F20E40E89789470ED34540	77	8	2020-03-29	77711	48068.8386538648	t
4471	0101000020E6100000EB3EA934807A0F401FFDBCBD9BC84540	14	1	2022-04-06	93161	39251.7442265179	t
4472	0101000020E6100000CD48C970A3690F40459C32B8E6D44540	36	9	2020-07-05	50532	30200.9280298371	t
4473	0101000020E6100000711AFD18230A0F40C3B932C1DFCB4540	74	2	2022-05-28	84187	8717.5716883592	t
4474	0101000020E6100000EEEB233807C00E4097F0B970DBCF4540	92	9	2019-10-23	52971	99140.0760539343	f
4475	0101000020E61000008A61ADBF82CF0E4097FCE206F0C94540	24	9	2021-02-20	83113	53321.5681709766	t
4476	0101000020E6100000FDB48C1438C70E40392C0105C2D24540	30	1	2014-12-02	29044	27812.6984099178	f
4477	0101000020E61000008B4C7B38C68A0E401574390251D24540	86	9	2018-02-09	62191	36466.5537796823	f
4478	0101000020E610000041EEA91BB7D40E401FD779FB59C84540	54	6	2018-08-30	75688	51040.5513332046	t
4479	0101000020E6100000D7FF613268FD0E4010CE387EDFCE4540	78	1	2024-08-29	9409	43874.5568542139	f
4480	0101000020E6100000AAEFB49F4E670F405C6CE7B574D34540	80	10	2017-09-16	99389	76493.5970786632	f
4481	0101000020E6100000479A2E252DEA0E4025430DC01CD04540	65	4	2013-04-02	85904	73881.6098836814	t
4482	0101000020E61000000604E229407A0E40C4739F40F8CF4540	76	6	2012-09-03	82966	12433.5728366052	f
4483	0101000020E6100000979AFA16ED8A0E402372333597C94540	14	5	2010-03-02	23998	82993.8925684197	f
4484	0101000020E61000000ADD90326BCF0E40F831CEE583CF4540	43	5	2023-08-17	62040	19413.5195139054	t
4485	0101000020E6100000D53EAA6F784C0F408E5E9C80C0D14540	30	9	2014-12-30	28884	95863.6385368128	t
4486	0101000020E61000004C0398DADDDF0E4009C531D6D9C74540	75	6	2016-08-09	49041	37556.5551201657	t
4487	0101000020E6100000C35D58723C620F406B1D9EFC0ECC4540	96	2	2013-07-06	43484	85675.6150160644	t
4488	0101000020E6100000C185D6F392BF0E4039B55F6160CB4540	11	1	2015-07-08	36108	22035.8954926423	t
4489	0101000020E6100000A3347445499B0E406FCCA620B6CF4540	95	9	2025-02-07	32032	59275.7671726499	f
4490	0101000020E6100000D64B93333CFF0E408212A57DDED04540	14	9	2018-11-07	86971	59456.0965448202	t
4491	0101000020E6100000AD5ECE79FBE40E408D4896AA46CF4540	88	10	2016-05-31	52507	90374.1132305678	t
4492	0101000020E61000008AADA5B291750E40666804B148D54540	47	4	2022-01-07	53980	80217.0982363831	t
4493	0101000020E61000005FD6A34FF4810E40A1BCC41698D24540	11	6	2014-05-17	24965	1645.05977541822	t
4494	0101000020E610000003F54ADB1E2B0F40AFD7BB6D25CF4540	51	5	2013-03-23	57338	67661.1042759226	t
4495	0101000020E61000003AF71822DB6B0F40C08A230C84CC4540	30	3	2018-12-02	39887	68197.0202511494	t
4496	0101000020E61000007C4D8988E57E0F408A968C9662D04540	98	2	2010-11-01	75586	71665.2097734096	t
4497	0101000020E6100000EA1A1BE61D8F0F40FC146568F6C74540	71	2	2013-12-30	46126	82385.0489789928	f
4498	0101000020E6100000E9ED27027DFA0E406209988159CB4540	35	1	2024-01-30	40009	20304.6016252601	f
4499	0101000020E6100000E7E0DF20EA050F407B0E03F0D5C74540	32	2	2018-07-17	33923	15705.185346158	t
4500	0101000020E6100000A0166E9DAEF70E4039130F620ECA4540	99	1	2021-06-06	73761	68440.882997407	f
4501	0101000020E6100000696E8DF1D5950F400E3FF36169D44540	25	1	2015-07-16	12110	86389.6435802643	f
4502	0101000020E6100000E96FA201CE900E4029959AC1E7D34540	98	8	2020-10-25	10218	32407.4229636164	t
4503	0101000020E610000056A67E48F7E20E40C5A50B31D9D24540	58	3	2017-08-02	74663	91346.3053999304	t
4504	0101000020E61000008DE26C7C3C970F40614263D4F4D24540	21	2	2011-09-29	12627	70394.3463381461	t
4505	0101000020E61000003E22556FDD130F40B0D1EB27A5C84540	98	5	2024-11-29	81945	74946.8663762749	t
4506	0101000020E6100000B2256EC924920F40F000801072CA4540	77	6	2018-11-12	33081	59481.5747802665	t
4507	0101000020E610000088960F08DCF30E4070D036FAE4D14540	9	3	2019-01-27	60655	79149.5792127454	f
4508	0101000020E6100000E3C4DFD47BFC0E400B04FE6DD4CD4540	15	7	2014-09-09	14858	78508.928831338	f
4509	0101000020E61000009F33588F1E2D0F40ABB48ED71CC94540	5	7	2013-04-14	79171	13160.5487830598	t
4510	0101000020E610000000E8552C860B0F40B2F68B7974CA4540	22	10	2019-10-26	54778	88647.1097350652	f
4511	0101000020E6100000AD7956A6C8E60E404C98883E8ECC4540	29	2	2010-05-27	50857	47605.8737367026	t
4512	0101000020E61000007460B44AB1730E40FDB563785ED44540	13	4	2021-05-12	20664	13697.303862201	f
4513	0101000020E6100000B31399D58B2F0F400F30156C5ACD4540	14	3	2010-07-21	89969	79274.1774829446	t
4514	0101000020E6100000BB2714CF6F5E0F406983710DDBD24540	95	3	2023-08-09	9480	9336.79857631629	f
4515	0101000020E610000079553C86549A0E40F50EAE512FD04540	38	9	2021-01-14	4572	49722.2893185733	f
4516	0101000020E610000002C2BE842C820F4028B1E9B3D8D24540	12	9	2010-09-05	99860	31686.5099336324	t
4517	0101000020E6100000067CB4D4D4820E40750AF9F374D14540	60	3	2014-05-09	77133	16208.6958811867	f
4518	0101000020E6100000AB95D1E8A7210F40A8B8050893D04540	50	10	2014-01-31	70952	40287.1076974904	t
4519	0101000020E6100000CD2BCF12FA3C0F4072B2D21C2CCA4540	66	3	2022-01-31	57424	92657.1774588163	f
4520	0101000020E6100000D91F51662E8F0E405EA8C70A01D24540	72	10	2021-12-15	41192	53792.6085621474	t
4521	0101000020E61000008E516DB49A8C0E40335DB301D3D24540	84	10	2017-08-19	14842	4935.94989569832	t
4522	0101000020E6100000CB036945FE7D0E4034F913C154D14540	98	9	2012-07-06	87227	75312.2568204337	t
4523	0101000020E61000002C51668654E90E40BE16064FE6CF4540	31	9	2011-11-07	66193	3928.14376837267	t
4524	0101000020E6100000F5E45393E9630F40929C9904BED14540	34	6	2019-07-03	56365	45453.8983846307	t
4525	0101000020E61000003C0EB197AAF80E407B0C2A9297CC4540	68	10	2012-05-23	66757	52265.429270136	t
4526	0101000020E6100000EA8CC3585B490F40A9BC111B14D34540	96	10	2022-06-09	71744	39452.7902417472	t
4527	0101000020E610000054DC95EAB25E0F400483315180CC4540	54	10	2013-09-18	97427	89086.8151543856	t
4528	0101000020E6100000D1CA2237E6D90E40850B69FC7FD04540	48	10	2025-02-22	41184	15161.6023239453	f
4529	0101000020E6100000E7F405DBF60F0F4023ECC35B15D54540	63	4	2011-12-31	39689	34055.4206268142	t
4530	0101000020E61000007C9AD45ABF1A0F407471C28DC5CC4540	37	1	2021-01-27	3392	36909.8006043059	f
4531	0101000020E610000028472E7217F40E406B56C81C0ECB4540	99	1	2013-01-03	83298	73972.7448228224	t
4532	0101000020E6100000C4B157317D0C0F403BF05916FFCE4540	33	10	2025-01-26	70511	81989.4617793311	f
4533	0101000020E610000063B602D5399E0F4058F2047386CC4540	98	4	2012-07-29	82231	66169.2204315101	t
4534	0101000020E6100000D2122982947D0E40F5E0EA6F43D24540	6	3	2022-01-06	77503	80164.0885022856	f
4535	0101000020E6100000BD120C44AC050F40D47B40CF39D54540	56	4	2024-06-08	17013	73670.4569690784	t
4536	0101000020E6100000F1517A3C7C9E0E4064D53199A3CB4540	71	1	2025-10-19	49740	74647.9784495608	t
4537	0101000020E6100000516BBB58C5710F4031596B279ECF4540	12	8	2011-10-15	26297	14158.6548085502	t
4538	0101000020E6100000F6B9A1B9CEED0E405C6B460236C94540	87	10	2016-07-01	26335	89298.869087918	f
4539	0101000020E610000075869EC543A70F40416CFECF76CF4540	35	1	2015-07-30	80009	70525.4947759439	f
4540	0101000020E61000009D84597501A20E40C838852D55CD4540	58	3	2017-03-09	15211	52436.7638664668	t
4541	0101000020E6100000CC8B381F43A50F401A8AE3FB53D04540	1	5	2023-06-28	8437	79249.7804685712	f
4542	0101000020E61000002BC77C53902D0F409615412305D04540	84	5	2022-09-21	34473	2084.70089876587	t
4543	0101000020E6100000F48B69E9CA3C0F40D5F2C9CCD9CC4540	43	3	2020-12-05	81148	35251.9351413215	t
4544	0101000020E61000006E1D7D33B2B00E4054C0E31DBCC84540	4	3	2024-09-08	42036	53487.2912603304	f
4545	0101000020E6100000EB8985B2A88C0E40E5D40B7E33CF4540	22	4	2018-05-16	6989	98489.5825303791	t
4546	0101000020E6100000104BA72C7CE70E409E4F192CD8CD4540	17	6	2019-02-20	84118	91917.5766813554	f
4547	0101000020E610000001D0180785A20E408A6D6890B1D14540	74	8	2019-08-27	94841	59252.980471003	f
4548	0101000020E61000008454F5D47FC50E40EEDC5E743AD04540	98	10	2018-09-07	42797	82771.740863534	f
4549	0101000020E61000006D096844DB940E40D57FD9C7F0CD4540	58	10	2010-10-20	64048	40489.431971158	t
4550	0101000020E61000005E170A0341870E4045F37EC6DDCC4540	97	5	2011-10-17	17594	52157.1748108753	f
4551	0101000020E6100000FE84D0DC31980E40091C60F1CBCA4540	30	5	2022-08-27	41723	59742.466348409	f
4552	0101000020E6100000F7A31C30703F0F40521BA78E7BCE4540	11	1	2023-03-28	21492	69658.233135864	t
4553	0101000020E6100000809E9B99A8440F40C5E1E28421D34540	100	4	2024-01-13	41705	79280.5804883244	t
4554	0101000020E6100000173E52BA53930F40D271706CF0CF4540	97	3	2012-10-02	21409	61080.2877611509	t
4555	0101000020E610000052E5BE1864A70E402D9D46526ECA4540	26	8	2010-01-14	90621	57732.8464382454	f
4556	0101000020E61000003A26EDFC0C2E0F40A3680DB220D14540	18	5	2025-10-26	12520	56836.0712458803	t
4557	0101000020E6100000B5D7AE2FC1A50E40E0EE4C7FBCD14540	11	7	2016-01-16	89376	57725.3538469109	f
4558	0101000020E61000007E993035E83E0F402F41BC207DCC4540	50	10	2022-11-10	9867	9160.13248074494	t
4559	0101000020E610000031C008A5D48E0F406FDC6C585ACA4540	62	9	2013-02-04	80118	86015.4514858887	t
4560	0101000020E61000003B8B71405D820E4056E95E4436CF4540	80	5	2020-05-07	76481	1953.6302312853	t
4561	0101000020E6100000FB6528DA3B500F4010E4602D58CE4540	59	2	2011-01-21	21576	78417.9226551571	f
4562	0101000020E61000006BABC3EAB3130F408AEB72D295D24540	72	2	2023-04-28	23651	34223.6194162334	f
4563	0101000020E6100000CE082E6E7D980F4095715D3A7BCE4540	56	10	2025-09-18	10126	90895.1751666012	f
4564	0101000020E61000007F57F63B8E5D0F402972956661CB4540	97	8	2013-10-17	61776	91715.2880628038	f
4565	0101000020E610000091C8AD633C710E40C1E828014DCC4540	6	6	2025-12-28	85142	65935.5338958211	t
4566	0101000020E6100000E56E787E95840E40B743AD7B23CB4540	33	8	2019-12-08	14544	92208.2002818689	f
4567	0101000020E61000008E7A10C9DD030F40CDDFFEC15DCA4540	21	8	2021-06-04	12084	11356.5875714746	f
4568	0101000020E610000018A20DB0E8ED0E402B6EA3F859CA4540	9	1	2024-01-22	50834	63551.2857420532	f
4569	0101000020E6100000CD3537971D5B0F409A4EE3A107CC4540	41	2	2016-04-18	95229	53977.0876674587	f
4570	0101000020E61000008474FC5012360F400898443D81D34540	82	10	2025-01-08	15748	93190.7652063017	t
4571	0101000020E6100000CA05E31EDC230F40DCA2209393D14540	17	4	2022-07-11	22329	64959.6680196	f
4572	0101000020E6100000F8453E3EE6E80E40C5D0528D6BCD4540	23	3	2018-04-03	79410	13463.2007262138	t
4573	0101000020E6100000EEE480F2A5480F40888CA47D5FCC4540	28	6	2017-11-21	83915	25462.161356918	t
4574	0101000020E6100000FF65150F95490F40E9135298FDD34540	4	1	2018-06-28	67973	68952.8759923189	f
4575	0101000020E61000004E7F8CF944520F40E00AE46F2ACC4540	40	9	2022-08-13	71120	43285.7754749972	f
4576	0101000020E61000003ADBA8D688950F40BE350854C1D14540	57	3	2025-04-27	74708	9537.72711131404	f
4577	0101000020E61000009C1CE12A3F920E40E8F21D160DCE4540	38	9	2022-08-11	14255	63812.0623182636	t
4578	0101000020E61000008BCEBC8B66E90E401DE52F6FB7C94540	84	7	2016-03-30	66619	73229.8309809898	t
4579	0101000020E6100000A166E590039A0E408F275779BBCF4540	61	5	2025-02-04	90182	68958.8183881321	f
4580	0101000020E610000076F0649256F70E4017B75B3A18CE4540	39	2	2013-05-30	92644	63131.007790278	f
4581	0101000020E61000004193EDAA569B0F40CD0B14FB08D44540	61	3	2016-02-29	64117	32232.72447524	f
4582	0101000020E6100000536CD95DE70D0F407113A54954C94540	21	9	2025-09-07	32204	94095.5719267344	t
4583	0101000020E61000003964475669750E4048372405BBCC4540	85	10	2012-05-24	87440	66110.5417711878	f
4584	0101000020E6100000F492E7AE0C3E0F403401A40F4BC94540	97	1	2018-07-02	47061	9366.2464502883	f
4585	0101000020E61000007C3A76FD9C940E40277C377861CE4540	85	10	2016-08-11	69538	12207.6599547442	f
4586	0101000020E61000008BEE88E2A19C0F40FEA684030BD54540	67	6	2011-02-22	48106	54752.0334054581	t
4587	0101000020E6100000735F33FE02520F4025E0FFD1FDCF4540	67	9	2017-09-23	33554	5814.13530873454	t
4588	0101000020E61000003C7A48D519A20E40A6BC8B0A80C94540	81	8	2024-06-12	72303	89683.1258316977	f
4589	0101000020E6100000C21132BA5A500F40006A52F9F6C84540	10	2	2018-09-29	61422	39218.4984396421	t
4590	0101000020E61000008E433B6AFCCA0E40E0D2F31395D34540	14	1	2010-07-29	1561	38613.5139545981	f
4591	0101000020E610000004F88DF8F0300F401B733802F0D34540	49	6	2019-05-22	68816	15842.2669541043	f
4592	0101000020E6100000AF58312117AF0E405EC7B6AEEBC94540	39	3	2020-03-24	12095	11051.2725974303	t
4593	0101000020E61000003D7CD8A2158B0F40E96CF9407AD44540	6	4	2015-04-19	1501	68394.2191953501	t
4594	0101000020E61000001DD7C9EA8FC30E40E8B44514F5C84540	77	3	2011-11-24	13050	68530.7864653831	f
4595	0101000020E61000004A02D8A441900E406F56EBC8EFD04540	100	7	2025-07-28	47655	10766.5811786511	f
4596	0101000020E6100000165AF7DD76CB0E403A430EDCC6C84540	40	6	2019-11-20	67884	32339.0015481095	t
4597	0101000020E61000000CC6A2A1FCF20E40CCC04A3446CA4540	67	3	2016-01-21	11801	51387.4418663189	f
4598	0101000020E6100000E0E9FBA700690F4063BD03345ECA4540	50	8	2022-01-21	19393	22639.5065094273	f
4599	0101000020E61000005D300A40526E0F404BD2B1153FCE4540	24	2	2016-08-03	21314	84840.7230652213	t
4600	0101000020E6100000E884991134220F40B8BAAA1E52D14540	49	8	2025-10-27	60260	30272.2553082615	f
4601	0101000020E61000005C82F9853FCE0E408647CBC574D14540	65	2	2025-04-19	98165	64922.0879875905	t
4602	0101000020E6100000EEE0D812608B0F4069ACB1A5A5CC4540	97	1	2018-03-10	82463	10276.695066324	f
4603	0101000020E610000080FFB62695180F4005C62B12FFCD4540	16	2	2019-08-21	45457	35091.3657283745	t
4604	0101000020E61000003E30466F48E80E408898382709C84540	63	7	2021-02-03	82662	12268.0352344276	f
4605	0101000020E6100000D2BEFB4CC86C0E40799F6D892AC94540	84	3	2020-11-22	31122	56694.26612255	t
4606	0101000020E6100000AD140B984C110F405EB58916B3D04540	23	4	2024-10-16	31811	17885.5614643736	t
4607	0101000020E6100000F6F722ED786A0F407D9F246EFAC74540	20	10	2025-07-30	55987	83964.1002715504	f
4608	0101000020E61000006133C37341820E40EF234755AECC4540	54	1	2015-05-03	90598	30256.9273882538	f
4609	0101000020E6100000B0056AF47E3E0F402BD35002ABCD4540	79	5	2012-03-28	95852	99052.1724416915	f
4610	0101000020E6100000072DC2CC0F580F4024A7776B54CC4540	61	4	2010-01-09	38858	58689.3955311306	t
4611	0101000020E61000006456A266FEE20E406405BB7E8DCE4540	47	3	2016-04-22	41687	74969.7416687052	t
4612	0101000020E610000012398631486C0F404B8F7E35D3D24540	46	8	2024-09-07	11423	89249.3845447651	t
4613	0101000020E6100000F49089E2AD870F400C5CFCACBECE4540	75	2	2015-07-29	15200	41076.2106243	t
4614	0101000020E6100000377EA5F7DDB20E4070D6AABFD0CF4540	80	2	2022-03-21	42231	657.071732689318	t
4615	0101000020E6100000516954DAC6710F40CF1507FC2CD34540	96	1	2010-07-13	80981	26427.2324452437	f
4616	0101000020E6100000D1CC1BDA1A670F4099D500E669CC4540	79	10	2022-07-20	57300	61710.8094706803	f
4617	0101000020E6100000755AEA3DE9180F40B06E852C61CC4540	80	4	2016-06-16	53734	10999.856033882	t
4618	0101000020E6100000C569B9BE0FA40F40CCD575EF7CD04540	92	5	2012-12-01	40130	78482.3690411638	f
4619	0101000020E6100000FE99F19F2CB40E40F1C3211735CF4540	11	8	2010-01-12	16327	43495.0084409436	t
4620	0101000020E6100000F0D072C04B880F40F7F47E2AFECD4540	91	1	2019-09-27	22479	32022.1285533967	t
4621	0101000020E6100000E54BBF15731B0F40AAE75B4306CA4540	99	2	2014-07-08	54423	51768.3780982188	t
4622	0101000020E61000004759372734A10E408DE12A08D4C84540	54	8	2017-12-28	98923	41282.4192704503	f
4623	0101000020E6100000291FB3299F720E4072B8AADE3ECA4540	10	8	2012-08-18	84853	89905.3727872124	t
4624	0101000020E61000003FF15288DE3D0F406D08956FF9D34540	22	5	2012-05-06	32614	9299.14655905086	t
4625	0101000020E6100000F61A2BF6E8E70E40C1A9A5BE89C94540	65	5	2024-01-27	65614	80823.7506894965	t
4626	0101000020E61000009AF15A4798F60E40FC149F536ECE4540	24	8	2016-11-14	25646	34806.1805965003	f
4627	0101000020E6100000AB74F20FFFAB0F401F9742E841CA4540	80	9	2010-12-06	68870	94264.2701429653	f
4628	0101000020E610000092B24D86F8C10E40EC4DE1E67FD24540	59	8	2018-02-24	18571	30171.8428066887	f
4629	0101000020E61000006C40E513609F0E40DC143B02E3D24540	10	5	2018-12-31	22552	82973.7689680757	t
4630	0101000020E61000005582D8DEE75B0F405546AA7270CD4540	56	1	2013-10-01	96844	32087.4784480806	t
4631	0101000020E61000007873D28BF5640F404E6EE64675D04540	39	3	2016-03-29	47595	99234.5155708894	t
4632	0101000020E61000004850B3C7E3A30F403ADD4D0AE2CE4540	92	1	2016-02-15	41391	79492.8770721742	f
4633	0101000020E61000008F8352F87DA40F407D297D20F9CC4540	86	2	2018-07-13	93030	84178.8221426525	f
4634	0101000020E610000079DE219B95330F4014FB03221DCC4540	15	3	2017-08-27	59765	83910.131123233	t
4635	0101000020E61000005379F5444D120F40342B17B26DC94540	27	9	2025-05-17	79285	24920.9008320915	f
4636	0101000020E610000028D4591C725F0F409A3E75944AD04540	23	4	2012-06-15	28523	8221.76142243827	f
4637	0101000020E61000004C127FCCA3F90E40F14367612AD24540	75	3	2016-06-10	7161	92246.5182203158	f
4638	0101000020E61000008DBA01C8AF2D0F40789192EEAED24540	32	3	2025-04-22	76751	40392.3367620625	t
4639	0101000020E610000095B058589A0B0F40A62D0EE289CF4540	95	4	2012-07-01	70747	87120.5326719526	f
4640	0101000020E6100000E09D7B62FBE10E404E35E1C644D34540	19	5	2014-07-31	23224	58.3908555954249	t
4641	0101000020E6100000B737FAB700830E4028840991B6C94540	72	8	2024-12-21	32404	97185.4624916893	f
4642	0101000020E6100000B27AFD1672730E401C706EC79AC94540	78	4	2025-11-22	85908	27231.1266886983	t
4643	0101000020E6100000EB9DA1DB8C900E401A04F4C6F4D14540	78	5	2025-06-08	35877	60160.9887298343	t
4644	0101000020E6100000254F9AFE3DC00E4048187D9A91D44540	91	8	2020-01-09	39064	55310.2549606911	t
4645	0101000020E61000001FFE3EF6A0000F40FC27E14F2BCB4540	39	7	2022-06-22	99819	43078.1073251499	t
4646	0101000020E6100000B71288FECF840E40CA2684B3EDD24540	99	9	2019-09-14	47909	54916.3556254177	t
4647	0101000020E6100000D838D7AE349D0F40427C4F0A21CC4540	5	3	2013-02-26	44549	43156.7906562762	f
4648	0101000020E6100000A0E8E95A82180F409D4C2472E2C84540	46	8	2023-03-01	42536	4806.95932706787	f
4649	0101000020E61000000B0C87BA213B0F40B6B7C62218CC4540	47	9	2022-04-21	93177	94016.0766612176	t
4650	0101000020E610000047D9DC72F26B0F40EA85B677F4D04540	48	6	2011-01-17	52282	32084.9660870902	f
4651	0101000020E6100000481448A6BCE30E409C70D9C75DD54540	92	5	2010-04-16	45077	28175.7059068923	f
4652	0101000020E61000005907C2496BDA0E40E320648CDCD24540	77	4	2019-09-26	16242	28397.2619938915	t
4653	0101000020E6100000E7129010397D0E402A039DAE4BCD4540	90	5	2019-05-03	21083	73117.0090435332	f
4654	0101000020E6100000E31374AD68690E4038111BA14FCA4540	20	8	2025-09-13	43940	62910.6313440775	f
4655	0101000020E6100000370F3F10657C0F4036D16AB3FDCF4540	1	3	2016-06-07	48472	24638.3441273759	t
4656	0101000020E610000093D60B7327640E4008034756DCCB4540	53	9	2019-02-18	89077	14849.1573689081	t
4657	0101000020E6100000BCF30EAAF74F0F40DC34BF75D8C74540	96	2	2021-08-01	97574	70656.7138539758	f
4658	0101000020E61000009201456EB27F0E405FBF45285FCE4540	100	10	2017-03-08	10174	61685.5403963177	t
4659	0101000020E610000039C8863CD07D0F40D5496DACECC84540	37	8	2014-07-18	13256	3966.67899703049	t
4660	0101000020E6100000F21AB14F71800E408B3B8988EBC74540	5	7	2012-02-19	48061	8494.47341197691	f
4661	0101000020E6100000C254929E1BB40E408233B48234CA4540	3	2	2019-07-30	44121	38556.8221923723	f
4662	0101000020E61000002C93584D56830E404158B6F20FCF4540	1	7	2014-03-01	60025	78789.1382145415	f
4663	0101000020E610000002A77C024F9E0E40C0FC12CBF3CD4540	93	7	2017-01-13	34385	66466.2994463998	f
4664	0101000020E6100000ACB3FD2C797B0E40E1BEF3C02AD34540	34	3	2024-01-08	90068	54208.2034220021	t
4665	0101000020E610000089558A387B8F0F40819687940ECC4540	3	4	2017-02-20	1365	9101.67825506234	t
4666	0101000020E610000043DB7B429E6E0F40CB72F7D0F2D34540	53	1	2025-05-11	83552	73081.0818583733	t
4667	0101000020E6100000A0F09867EDF00E401B59EBFEF3D34540	10	10	2025-05-02	38282	27697.93506016	t
4668	0101000020E610000000C300CD07630E40FA3C5AFEC4CC4540	51	10	2021-12-31	69919	26572.9279781349	f
4669	0101000020E6100000498C5E255E730E40FFE416FDF7CD4540	94	3	2021-03-14	53488	3898.02789409428	f
4670	0101000020E61000006CE94D23AD2B0F40B6343A38FDC94540	38	4	2015-11-11	22241	20951.257399668	t
4671	0101000020E61000004F90AA144B480F40A5611C4FD9CA4540	6	6	2025-10-21	81091	70414.5594961908	t
4672	0101000020E61000002855D2A1E2100F408B4BDD5D13C84540	36	4	2024-01-16	56468	23112.1967694016	t
4673	0101000020E6100000476F507802700F40330B89C17FC94540	41	1	2012-01-27	67457	45687.7943122142	f
4674	0101000020E61000009594A782C8CE0E40A94C37D417C84540	39	5	2013-12-27	48963	62007.3174428891	f
4675	0101000020E6100000AA4B8977EE3E0F40260AE858F2D44540	51	10	2022-07-07	57691	99282.5114881001	f
4676	0101000020E6100000C89F765866950F400F30E675FFCD4540	59	3	2019-07-23	88047	81343.3194667345	t
4677	0101000020E61000006A1AE919C3420F40F982E922A6D04540	57	9	2016-05-15	96567	10186.4320362948	t
4678	0101000020E6100000AEADA7AFD4FC0E4042218430C6C94540	16	3	2016-09-23	45118	99560.2618846741	t
4679	0101000020E61000004ADB172794640F401EDD3F5193C94540	90	4	2022-06-25	56925	69133.7456964636	t
4680	0101000020E6100000F1404E1C639D0E401944830F06CA4540	12	2	2011-01-17	47441	20492.9589913562	t
4681	0101000020E6100000AE85453B62AB0F40C8DEF9A757CF4540	51	6	2016-07-03	63206	63322.7190498359	t
4682	0101000020E61000002D16720AD49B0F40F5900EE845D04540	75	3	2010-03-28	71087	59934.5990149607	t
4683	0101000020E6100000FE10915AF7DE0E40A7621EA802D04540	75	5	2013-04-16	95885	93369.98134698	f
4684	0101000020E6100000562BE27929810E404B481FC948CC4540	19	6	2015-01-19	8020	56375.7496676024	t
4685	0101000020E6100000CB2F85BD70140F40D7BD031928C84540	82	3	2022-07-13	79704	60842.6505344031	t
4686	0101000020E6100000C65F5A39EC690E40C999BAF813D54540	80	9	2010-01-29	94006	27897.1107491826	t
4687	0101000020E61000001A4290948E040F4024204A97D2C84540	40	10	2010-03-05	86820	8388.65768050676	t
4688	0101000020E6100000008AEC5195C20E40020AB8EC5DCC4540	83	4	2025-06-12	97974	24982.1458007865	t
4689	0101000020E61000009CA25B0E36810E401B105F1B50D54540	87	9	2019-02-05	38137	32261.7131130852	t
4690	0101000020E6100000CEE1C94FB9210F4051004CBF85CC4540	2	7	2021-07-15	68473	53917.3900544793	f
4691	0101000020E610000040705FAA850A0F40F7D1D6A369CA4540	28	10	2015-05-30	50951	46764.5423072093	t
4692	0101000020E61000008326ADAC37900E401EFEE37D15CF4540	3	2	2023-03-06	65677	99183.059599424	t
4693	0101000020E61000008C432E254C4C0F40F098B3EF37CC4540	43	5	2011-01-19	86504	95545.9913270591	t
4694	0101000020E6100000345291E05C080F40771CE9B3ECCD4540	68	8	2025-04-25	55277	51611.8749957615	f
4695	0101000020E6100000741A605C2B4F0F40B9F61F4E2BCA4540	87	5	2013-02-26	60122	50127.0322747724	t
4696	0101000020E6100000EFBA0327A66A0F4005CAB4B885CE4540	3	8	2015-03-16	63982	92784.1321396288	f
4697	0101000020E6100000597DFBC58BF80E405DD37D23CDD24540	54	2	2024-01-30	57429	93040.5664142674	t
4698	0101000020E61000009220FE07B5F30E40508A2CA570D24540	50	1	2016-07-21	47767	26317.5135816099	f
4699	0101000020E6100000FF212394D0230F4070222F0334CE4540	14	1	2019-12-05	56153	49076.2368605045	f
4700	0101000020E6100000731C3E0C86990F40F47731FF92D24540	61	2	2020-09-29	81966	96317.5308843715	f
4701	0101000020E6100000E8994A9C1B450F40C57C7494CED24540	55	9	2023-01-05	73964	45005.9113396975	t
4702	0101000020E6100000977DF87EF7650F402ED4F86E1DCB4540	16	2	2025-10-13	2787	44980.6633524794	t
4703	0101000020E6100000BF6C53DADA560F40681C626004CA4540	58	1	2017-06-01	75562	57940.0994614747	t
4704	0101000020E610000013464E2F779B0E40F98769B35CCD4540	52	10	2023-11-20	30059	22798.620757249	t
4705	0101000020E61000004EB4CE6C63120F4049149C0F9CCD4540	17	3	2014-02-26	60730	46792.9660507651	t
4706	0101000020E6100000335483528D220F40B83BE219DED44540	15	5	2016-05-08	72994	86726.7492265336	t
4707	0101000020E6100000362CEBE15A260F401284343175D34540	48	1	2014-09-13	96647	47171.1024230577	f
4708	0101000020E6100000D032935708A60E40BF5F68DA2DCD4540	52	10	2017-08-07	24081	16064.9125415681	f
4709	0101000020E6100000FD57FD1919260F40BF38F963CAC94540	84	3	2023-05-16	63748	85815.0902159954	t
4710	0101000020E6100000DAC8E5A340A00F40B607EDE9F4C84540	1	5	2012-06-17	7188	12161.6556675204	t
4711	0101000020E61000006AC9EDEDC8520F405DB4EC0655D04540	100	1	2024-02-01	28744	26000.7434092188	t
4712	0101000020E610000014312F44BF9C0E406B0351AD70D44540	65	1	2016-12-13	41184	51856.563551121	f
4713	0101000020E6100000EB1DFF7D976B0E40F8703E297ACE4540	8	3	2024-07-18	39469	47273.1836824343	t
4714	0101000020E61000000C679037EE770E403921C7DA75CD4540	16	6	2018-09-28	85341	36608.4469581035	t
4715	0101000020E61000007ED6C5C358A70F40FE9AD51F19CC4540	86	2	2011-05-28	52087	50516.4515886146	t
4716	0101000020E610000031905FD2F0AA0E40DF1C508BCECA4540	16	2	2018-11-20	29602	51608.2629126958	t
4717	0101000020E6100000E01F83C87F610F40DE20BE9FA3C74540	50	8	2023-10-01	82412	25352.8673130413	t
4718	0101000020E61000007D38079324740F4011C2DFD776C84540	93	9	2016-02-05	81129	16687.0770159351	t
4719	0101000020E61000006A98DE0000EE0E4040F326275CC84540	21	2	2023-09-17	81363	9348.1891478844	f
4720	0101000020E6100000547C49379CE30E40ED6ADF8F76D44540	42	3	2011-07-08	60503	51846.8185712768	t
4721	0101000020E6100000FEFADF9102C40E408573407546D54540	32	6	2022-10-15	96326	34999.6604024738	t
4722	0101000020E61000009FED74BBA9BC0E40BA10595BDCCB4540	16	9	2012-02-09	84796	93783.3163201039	f
4723	0101000020E61000009AE0EDE40C530F407F8EC464EACE4540	48	8	2023-01-16	2025	48612.6046762992	f
4724	0101000020E6100000F9814C114DA80F40FE457DF60CCE4540	64	6	2013-02-04	98770	68526.5778716973	f
4725	0101000020E610000028452C10470E0F40AF6EB5652EC94540	44	10	2010-05-11	66987	40907.6234340876	f
4726	0101000020E6100000CCA1036F675B0F409AF61704C1D24540	40	5	2014-04-14	78455	54058.5394135791	f
4727	0101000020E6100000E87E33D7DF8C0F401855765F29D34540	69	9	2015-08-08	16136	90568.3451444466	f
4728	0101000020E61000008CA176BBCC450F40FFDEF333C6CD4540	76	2	2025-01-01	71531	88528.7158111844	f
4729	0101000020E610000013A1480E3A7D0E4062059AE3C1D24540	88	6	2010-05-19	68368	3993.45244710187	f
4730	0101000020E6100000CBFA33315F290F4092B82C26B0CC4540	18	3	2013-11-17	79684	27473.5392449889	f
4731	0101000020E6100000968CF6D1EF370F4059C2DFC0C3D14540	14	4	2021-07-02	60652	84187.0064311229	t
4732	0101000020E6100000E80C8A804BEA0E40589EFF4019CF4540	21	1	2021-09-18	18900	58110.1490077098	f
4733	0101000020E61000009DAFA44FAA160F4072D92207B6CE4540	31	2	2020-09-09	9986	49992.4408146728	t
4734	0101000020E6100000B9E601C1BE470F404F21E92FAFC74540	19	2	2012-05-02	21758	38160.2852905417	f
4735	0101000020E610000082F51B4D7DEC0E400FA500973CC94540	86	8	2011-05-10	63943	47007.8642155602	f
4736	0101000020E610000013FACBDBEB3C0F40F1EEB34C5CC84540	1	8	2020-12-30	74816	84118.563987355	t
4737	0101000020E610000089CCAE2C75D20E40AF96484D5ED14540	32	7	2019-01-16	39319	7371.75043123717	f
4738	0101000020E610000046F5432134FB0E402380A54C99D24540	73	2	2016-11-09	56442	94871.0907097807	t
4739	0101000020E610000059D6C04B4D570F409F6E24FA8CD24540	51	4	2011-03-11	81071	54273.1534433446	f
4740	0101000020E610000015E6D355500F0F409A0F42C8D5C94540	76	1	2013-12-23	26608	79943.7994821776	f
4741	0101000020E6100000456792FF76A40F40D83ECF92F6C74540	36	5	2021-12-14	47990	17424.2261729064	t
4742	0101000020E6100000D953EB9801E90E4015B87F6B01CD4540	2	3	2016-11-18	13407	69759.9910321441	f
4743	0101000020E6100000A4CB7F4750370F40B56C52AAFDC94540	65	8	2017-07-11	55917	17633.2236470133	t
4744	0101000020E61000004577A69F52900F4009157ADA4BD44540	66	8	2020-10-24	39743	63707.4005704594	f
4745	0101000020E6100000BE716BE47BA40F40A6E71FD958CC4540	62	10	2014-11-23	23270	76309.3969987891	t
4746	0101000020E610000028CDA6E03C360F40D23C8C6A57D44540	45	3	2016-01-12	77615	2003.46145610089	f
4747	0101000020E61000006EEF1649BC7B0E405AFC0EDBE9D44540	29	2	2016-05-01	63867	49714.0150978303	t
4748	0101000020E6100000471FE13BD82B0F40F49F170442CB4540	16	2	2022-05-31	11655	92609.274869358	f
4749	0101000020E61000001B0DB5B2BD8E0F40F51E709EEAC94540	67	6	2012-04-24	98819	95878.5304339173	f
4750	0101000020E61000000EDA405C01A30F40AEE9DFBD66CB4540	16	7	2016-10-14	13317	8061.08602350244	f
4751	0101000020E6100000B0181E34D5150F405457B4EEE3C74540	5	5	2020-12-13	91179	62261.4684060167	t
4752	0101000020E6100000E2E29FE580650F403E9D5D9C36C84540	64	10	2025-10-17	89327	11796.9572032293	f
4753	0101000020E6100000A50BF58DEE950F404C0394FC0DD24540	57	3	2016-08-06	61054	433.708208171546	f
4754	0101000020E61000001C0DF1F7EFAB0F40217F85FFE5C74540	64	10	2024-12-03	77798	19514.357844678	f
4755	0101000020E61000003C94E917DBA40F40B7689B7D05D44540	46	6	2025-10-11	44	51432.0161671666	t
4756	0101000020E6100000A5F980C4E4AB0E404A65A4C899CF4540	55	1	2017-06-24	11608	65893.4126930293	t
4757	0101000020E6100000C6F36B0834140F4062A26C4C45D04540	78	2	2013-04-27	79313	65575.8964004412	t
4758	0101000020E610000021D4115D95000F40D4403003D7D34540	74	9	2018-09-25	17293	98390.3768631103	t
4759	0101000020E61000008D5EFF966D840F40635CF9FB64CA4540	39	8	2024-11-20	45112	57173.3503759122	t
4760	0101000020E6100000583632D7B9140F409ACFDF5636CA4540	71	5	2015-08-15	57	17039.387976554	f
4761	0101000020E61000006326AA163E980F403CA3F343DAC84540	75	10	2013-01-19	34295	43649.4885681194	f
4762	0101000020E6100000E62F97170A6D0E408C7A695796CA4540	87	8	2014-03-18	56841	67088.1454639197	t
4763	0101000020E6100000C97E5963CF750F4055B779DD63C84540	18	10	2018-02-25	40150	63467.0567781454	t
4764	0101000020E61000006FDF474801730F4039C4955AF9CD4540	61	7	2021-12-02	20571	88690.0547064807	t
4765	0101000020E61000004099636628660F4025CB087C35D54540	88	6	2018-10-12	84532	94604.8173987728	f
4766	0101000020E6100000711FC5F72F960F403C5F80213ECB4540	78	8	2022-03-25	85545	78507.8645758718	f
4767	0101000020E610000004D246484AAC0F403932B0625BD34540	66	4	2015-10-23	80533	85618.7556839685	t
4768	0101000020E6100000C07C6E655D720E400946B38773D44540	42	7	2019-06-11	32645	48713.6939224091	t
4769	0101000020E610000004FD160DFB900E406D4C1EF8A0D44540	59	1	2013-08-26	11078	97142.2879568436	t
4770	0101000020E61000001580BA015BDA0E405FB3616F29CE4540	59	2	2010-08-02	44512	89550.5930867313	t
4771	0101000020E610000022680BFA6EDD0E40BA63A18744D14540	29	5	2011-04-08	92643	82563.5178439344	t
4772	0101000020E6100000CD813FEE09990F40A47E5574EED44540	83	6	2012-02-22	80540	97471.1216066914	f
4773	0101000020E6100000B670563A3D930F401ED5A0A576CF4540	79	3	2020-09-12	17731	99895.3308046574	f
4774	0101000020E6100000DB483DFE69B10E40CD0232AFE2CA4540	70	10	2013-08-11	42427	89715.472829549	t
4775	0101000020E6100000EFDF3D53477F0E405C989DE845D34540	44	9	2023-07-24	68698	10650.2043400819	t
4776	0101000020E6100000AF894B0C3E650E40FD2068D92ED24540	42	3	2020-03-26	4903	86043.0876848685	t
4777	0101000020E61000006A3017C165900F40024F34C361D24540	1	9	2018-03-24	92	77315.0936566193	t
4778	0101000020E61000002CC194C72DE10E409883CFAB41CD4540	53	3	2021-04-21	18877	69401.2135054376	t
4779	0101000020E61000007A34FF44F0770F4094BB7B194BCA4540	83	7	2015-06-14	46710	10067.1271570172	t
4780	0101000020E61000009EF17728F0A10F4014E3EDC6C8CB4540	60	2	2018-01-13	33173	57707.6196567754	t
4781	0101000020E6100000EC1243256DAD0F405F2AE21A84CF4540	58	5	2017-06-01	23866	92798.1049460837	t
4782	0101000020E6100000515609B7A4AB0E4026A1E7C1BBD44540	53	3	2017-09-26	46557	77631.1997713725	t
4783	0101000020E6100000A9687944DCCC0E40EAABBD9E73C84540	65	1	2025-02-10	37040	11282.3964367843	t
4784	0101000020E6100000A313A31057820F40A1C46DF3C5CA4540	42	5	2019-01-29	94717	56536.0916122458	f
4785	0101000020E6100000E682851B5D840F401D904F2624CD4540	7	8	2022-09-19	78484	29563.9380949796	t
4786	0101000020E6100000300D0D6D11720E40E14710874CD34540	27	5	2021-12-12	47668	30800.0439163987	t
4787	0101000020E61000006A9C32E267C10E402F48A49556C94540	92	6	2021-01-28	41438	56508.9587363807	f
4788	0101000020E6100000FC4FD1F704EB0E40BC41067418D14540	51	5	2017-10-22	79183	94794.8198949406	t
4789	0101000020E61000002C8F09765A060F40FD7FC8C4B8CE4540	66	2	2014-09-01	62575	6281.13218783493	t
4790	0101000020E6100000CE6DCDA1229B0F405E4AB1315FCA4540	45	5	2015-06-07	70649	50877.598505493	f
4791	0101000020E6100000C5214F7F48AC0F40088A67CEC5D04540	98	9	2013-05-27	12609	90431.9527121535	t
4792	0101000020E61000005D412D42745C0F4046383D42EDC84540	66	10	2024-04-29	50054	43770.0952221872	t
4793	0101000020E610000076D019A874A30E40944B4B5071CB4540	16	5	2014-11-02	89148	72004.7365315551	t
4794	0101000020E61000007E70C5D6637B0E401B3757E7D6D14540	99	5	2017-10-14	71516	80856.8515645906	t
4795	0101000020E6100000C2C4A846A8950E40B034614A2ED34540	97	9	2022-09-15	45565	31757.8148269735	f
4796	0101000020E6100000E5F9EDD3E8590F4045230BFA41CC4540	58	6	2016-10-09	8139	25932.9925834193	t
4797	0101000020E6100000639C8A7A01E40E403DD6528DFECD4540	8	3	2014-06-06	97072	65576.2379306624	f
4798	0101000020E610000018926DF4C3850E40ABDADCFFF2D34540	47	6	2024-03-13	84124	23629.4743940009	f
4799	0101000020E6100000D2EB645CFC860E40D79AEE2A06D04540	64	3	2017-02-25	56540	22863.8789046904	t
4800	0101000020E6100000C774F66CBAD30E40572E37F0A0CC4540	76	8	2018-05-05	88645	21446.2994334663	f
4801	0101000020E61000009B648EDF5FBB0E40AD381DFBFFC74540	46	9	2025-12-06	47113	33108.7667059887	t
4802	0101000020E61000009B5C3091A1AB0F408DB6EC9022D44540	3	2	2013-02-21	97281	50064.4631016163	t
4803	0101000020E610000057330261BA6C0E40DBB955FCD5C74540	3	5	2015-11-12	13160	40474.7351631853	t
4804	0101000020E610000074D719E86C100F40F6ACC44AD5D14540	92	4	2010-08-24	79512	11707.370407498	f
4805	0101000020E6100000CC91214FBE8B0E4014CD6B308DD14540	88	8	2018-05-17	18567	87715.1091266439	f
4806	0101000020E61000002E35A399D7AD0F4034815018C1C74540	41	5	2013-06-13	99644	39452.3718339812	t
4807	0101000020E61000006659467768690F40B17D00EC80C94540	21	9	2017-09-26	3687	12893.3485705367	t
4808	0101000020E6100000E00D61BB05020F40927FB73EB0D34540	43	3	2010-03-02	47758	46251.679630411	t
4809	0101000020E6100000F8B4C36C71A10E40C46C002F9ECF4540	56	5	2017-06-30	15856	62419.0944209567	f
4810	0101000020E6100000FE79D743BC4E0F40042EA7A7D0C84540	99	9	2020-09-28	14793	55934.7709191234	t
4811	0101000020E61000006A6F9A8825A90F4078ABE4E69ACB4540	85	3	2025-09-30	17581	31120.6581837533	t
4812	0101000020E610000035E679E7203F0F40D4293412F8C94540	95	6	2019-05-06	76954	68167.7863443855	t
4813	0101000020E6100000C021BBC98EC70E4082783BBAADCF4540	87	7	2021-10-20	64663	40575.8970969624	f
4814	0101000020E6100000833E29C071810F4025CA4BCABCCB4540	87	7	2018-05-04	79445	18388.2627129073	t
4815	0101000020E610000085E608A2F5100F40262B9A9BB6CA4540	16	5	2010-06-24	49950	44837.0355329055	t
4816	0101000020E6100000709A1AD32A100F409045C9C693CE4540	27	1	2019-05-20	4136	34608.4404628736	t
4817	0101000020E61000000C8BC13F88720E409A357C0BDEC94540	5	7	2017-06-02	13756	58133.1215975205	f
4818	0101000020E610000031E2DA1E536F0E403D3359A3E2CE4540	64	2	2022-01-28	94816	28156.1159799121	t
4819	0101000020E6100000276F46B32DA10E40CD6B94EF7FD44540	12	2	2023-07-16	31816	13502.9904434045	t
4820	0101000020E610000016504A5280E60E40E0C35AEB37D04540	37	6	2019-10-30	20438	74151.9991487001	t
4821	0101000020E610000062FC9478CD870F40F9EB3E3CA3C84540	19	5	2018-08-18	39487	78518.6439487719	f
4822	0101000020E6100000FBDC5AF705DF0E40B03E3B6303CF4540	7	3	2012-06-28	7476	81609.5952995043	f
4823	0101000020E61000004EE832768E120F401511DC4D48D24540	21	6	2021-05-11	99457	23949.7137817429	f
4824	0101000020E6100000CF6562DD90760F405396B6CFD3C74540	75	5	2017-02-02	25400	53924.6825344736	t
4825	0101000020E6100000D70E49B9D6720F4040BED73F2DC94540	55	9	2015-04-04	80522	12658.4357595159	t
4826	0101000020E6100000FF002E9036E30E4041E4DE98CBC74540	43	1	2014-06-16	24690	64211.5247152595	t
4827	0101000020E6100000CFEE65B84CCE0E4047974499A5C94540	90	5	2010-05-25	37938	67338.839017214	t
4828	0101000020E6100000B1B45B291AAE0E40F911126C71D24540	3	9	2018-12-14	55984	55200.1945463353	t
4829	0101000020E610000008103A54B57F0F40CD5E4268A2D24540	73	2	2014-02-26	80390	62016.0766874481	f
4830	0101000020E6100000A3537DB600670F406FF7D4ED7AD24540	46	2	2012-02-11	7373	69582.2307952625	t
4831	0101000020E610000085CFED893CC20E408B803B7176CE4540	18	2	2017-08-29	72510	26464.9153834083	t
4832	0101000020E610000030C2EEF6161C0F40581BABA8AFD24540	15	7	2024-02-01	52770	39730.1714016569	t
4833	0101000020E6100000698422878ACD0E40DF10F163DFCA4540	97	4	2019-02-21	60064	56162.5736484892	t
4834	0101000020E610000003CE4A6979990F4083A269F55ECF4540	22	4	2022-03-22	12369	9997.9882137575	f
4835	0101000020E61000005E6E17C08B7B0E4040B65E77B1D34540	8	6	2023-05-16	80899	70982.8426062166	t
4836	0101000020E610000061A55D74D1730E40AD8B84B8D2C74540	42	1	2025-09-09	38424	72204.6236059962	t
4837	0101000020E6100000A9736F240D810E4099ED09B6F5D24540	75	7	2014-03-18	70101	52862.1538498132	t
4838	0101000020E610000038106B49CE590F40385776D4F4CE4540	6	6	2015-03-16	61053	5740.6914095427	f
4839	0101000020E6100000095711FABE280F407E1F08683FD44540	33	6	2016-12-13	41695	6164.74948474623	f
4840	0101000020E61000007A9426A754450F4041576EC32AC84540	98	10	2024-02-26	14274	39235.1976636486	t
4841	0101000020E61000004D92C1FC3ED90E40E8F0B39040D34540	60	4	2025-05-04	9161	79537.9599509531	f
4842	0101000020E6100000B7E04ADD1E950F40CD51C1066EC84540	78	9	2025-03-17	236	63181.4861030622	f
4843	0101000020E6100000608F16259A790F4048FA2A31AECC4540	82	7	2017-07-01	87209	66847.7954658429	t
4844	0101000020E61000002635E86F66810F40865DC97535CC4540	62	10	2021-11-24	70979	28962.3297199644	f
4845	0101000020E61000000E1E09FAFB7A0F4045E8EB313DD24540	50	8	2016-12-02	2521	2364.33884868779	f
4846	0101000020E61000001CD61E564F100F40B563B5155DCD4540	89	4	2013-12-23	33955	69166.7473968678	f
4847	0101000020E61000000F40DE3A3DD30E407B448AC05CD34540	59	10	2013-12-07	52824	33210.2588618376	t
4848	0101000020E6100000FDB946C3C8030F4047DA6A9979C94540	6	6	2011-10-22	10163	82925.6321098147	f
4849	0101000020E6100000BE70D89211830E403FAAAA276AD34540	60	5	2011-04-05	94499	11486.3929351486	f
4850	0101000020E6100000F06DE72331860E406D72B70905D14540	58	7	2022-09-14	75587	57180.9709873035	t
4851	0101000020E6100000D9B29DE1596D0E40D54009CEF0CE4540	48	7	2010-01-11	17315	95016.3121511279	t
4852	0101000020E61000006E14D41F7DA50E400662718401CD4540	83	7	2025-09-10	88308	52818.3861155906	f
4853	0101000020E61000000A5C6BA674A90F40A86DDB9A6BD44540	66	4	2013-05-26	43676	30078.1932485942	f
4854	0101000020E6100000EF819361C1670E40E6CECDEE7DCE4540	14	5	2018-12-19	56557	88156.4298820453	t
4855	0101000020E61000008C4777F4A2B10F40964F7E5C53CF4540	37	9	2011-04-16	4957	26772.9408547775	t
4856	0101000020E61000009C61CD75ACAE0F40652A93254BD14540	85	1	2023-03-21	92534	37998.308908283	f
4857	0101000020E610000028CF80FE437E0F40C1E11C02A7C74540	60	1	2025-10-18	35447	89832.8915137063	t
4858	0101000020E6100000CCCAF18136F80E40BA776AA089D14540	61	7	2021-11-20	88862	28622.4978683974	f
4859	0101000020E6100000C0EA7564CE900F404D392F93B2C74540	4	8	2014-12-21	85448	5125.4073579887	t
4860	0101000020E61000001FADD03F3AA20E40901ED9F165CC4540	10	6	2013-12-31	23371	51652.4337319923	f
4861	0101000020E61000008BAFB2F60D270F40BFEB949D24CD4540	62	6	2011-11-16	56848	88795.5240834609	f
4862	0101000020E6100000BCD288E4839F0F40999B12A4DAD24540	21	3	2019-05-13	17717	44009.6225143765	f
4863	0101000020E6100000CD57D35BF55C0F409C41A8E995D04540	2	2	2024-01-28	14000	68627.8870102791	t
4864	0101000020E610000095A7AC261A4B0F4079EC40AA48D34540	26	6	2020-06-30	83994	49514.2238757021	t
4865	0101000020E610000055296F7E539C0E40AFD34ED39DD04540	11	6	2011-07-22	67442	15237.7579800676	t
4866	0101000020E6100000751B69282F4F0F40E7BB35001CCA4540	38	7	2012-09-21	2577	40965.0195028502	t
4867	0101000020E6100000067DE5A51C3A0F403B7C526D69CF4540	96	1	2022-04-07	61572	30938.3879732621	f
4868	0101000020E6100000B2FD9D4E36920F4038E7608EA2D04540	58	2	2012-04-24	37953	25144.575550445	f
4869	0101000020E6100000DA180FDC25510F404A6D201E8CC84540	35	10	2011-11-07	62242	38682.0236241771	t
4870	0101000020E6100000BB4962B7C2DE0E40C6BD788D94D44540	48	9	2017-11-22	10126	53931.5201281384	t
4871	0101000020E610000028686D10C1890F40379CCD7623CA4540	67	1	2019-06-23	93561	1573.45658722354	t
4872	0101000020E61000006B431C692B0D0F4094464E32D0D14540	8	4	2021-12-07	74158	39262.5434930402	f
4873	0101000020E6100000F777822181000F40E683299436CF4540	87	6	2013-06-21	69363	12862.5615990669	f
4874	0101000020E61000007C0CE1A13A980F404005BD037BD14540	75	7	2018-12-12	45008	42580.374886866	t
4875	0101000020E610000086126DCF71620F407B6F20C3F4D14540	29	3	2017-02-01	39178	96273.3057895146	f
4876	0101000020E610000044D3E32D5D770F40463A914DCBCF4540	100	2	2010-03-11	20071	48714.00221879	f
4877	0101000020E6100000C0FAB6E672850F40F3D38DA29FC94540	5	6	2010-06-21	28368	16277.9517623756	t
4878	0101000020E6100000B04A0988E6510F40A9E6B065E1CA4540	76	6	2020-09-08	35176	20431.5189767953	f
4879	0101000020E6100000221EFC996DCB0E401067C32039CB4540	89	8	2023-03-16	85749	94678.3843054287	f
4880	0101000020E61000004154A4017AAB0E408057450E8DD44540	67	1	2025-05-23	47829	3331.71241829702	t
4881	0101000020E610000044913138C8E70E4071D1203B79C84540	33	10	2011-12-07	61009	70388.4770699263	t
4882	0101000020E6100000A65679D1276B0F403D2619EA5ECB4540	81	3	2023-08-21	28508	75273.3227003824	f
4883	0101000020E61000008500D0B8374C0F4050EB25BA7ACB4540	33	3	2024-07-15	30790	2304.70201126587	t
4884	0101000020E61000004769C0DCF26A0F406AA027D2BAD14540	67	2	2017-08-07	14572	94442.3615238673	f
4885	0101000020E61000000747E8EDD6620E40EA5F2C41A8C84540	66	4	2012-01-26	44940	2308.72923382828	t
4886	0101000020E610000087D43E07AE6D0F400E02522500C84540	50	5	2023-02-15	77062	36655.07331021	f
4887	0101000020E6100000394E88AED48E0F40B84954EA6BD04540	95	3	2018-09-01	29039	87290.0628898154	t
4888	0101000020E6100000E6DB9A966A8F0F404C52317845D14540	20	2	2024-06-20	18344	99843.1436718306	t
4889	0101000020E610000034E6DD2ADB790F40ACC4F08ED6D44540	62	10	2016-02-27	23669	72935.5525153911	f
4890	0101000020E61000003B276032B3710F40CACBEF4150CC4540	8	2	2021-07-06	66780	93974.1664492762	f
4891	0101000020E61000005DED1A67407A0F409B01895E40D44540	13	7	2015-09-01	91436	84252.5832309785	t
4892	0101000020E6100000FD7B9F0E80520F40991AFDA9C3C94540	37	6	2018-07-25	26080	22075.1460160397	t
4893	0101000020E610000068C9C34D11AE0F406DB7385639D34540	33	8	2020-02-14	86863	61089.8510516369	f
4894	0101000020E6100000B32DB8F723550F4030D9870A67CB4540	13	2	2023-01-31	20320	96024.0769919372	f
4895	0101000020E6100000DF580A085C320F40F8750603E7CC4540	3	9	2021-09-17	8822	81454.4529161253	f
4896	0101000020E6100000985AA3D327A00F40DF073C4C9FC84540	50	6	2016-07-06	7448	57163.1154894779	t
4897	0101000020E610000091C9816CC9920F40F3F1906E17D34540	95	8	2020-02-15	26687	69013.2991895571	t
4898	0101000020E6100000610028ACA9070F40D59B64320DCF4540	71	4	2024-11-27	886	69237.3142954955	t
4899	0101000020E61000008C80C1D273120F4031B5FB02D6D44540	87	7	2010-06-14	21235	42589.2098230802	t
4900	0101000020E6100000264FB15126C10E404596DC6BCBD14540	80	6	2020-02-23	44776	5142.98339332726	f
4901	0101000020E610000037B037C24B760F407BE70858FEC94540	83	2	2014-08-25	69544	58451.0353834671	t
4902	0101000020E6100000EDA009A72A8F0E40FD35F5690BC94540	84	4	2025-11-01	7877	5237.46935582659	t
4903	0101000020E6100000B4AC00901A570F40888AF96DD6CB4540	73	6	2015-04-10	89629	97973.2211147613	t
4904	0101000020E610000034F8CF0726F50E407042220FD0CC4540	67	7	2011-08-26	32104	84261.3479185075	f
4905	0101000020E6100000961BAD071AB90E40245EB9EA02D24540	12	8	2024-04-30	67551	79925.7324372966	f
4906	0101000020E61000002BDEC7E4765D0F40A5E10BF8ECD04540	58	9	2025-05-13	50206	78363.8112522842	t
4907	0101000020E6100000768919FF06B70E40BBDADF9A2ACF4540	92	6	2017-08-02	8159	46952.1125212688	f
4908	0101000020E6100000DC9A9D82F4BE0E401A0C28ABDFD04540	57	6	2025-11-06	63502	7061.70668804207	f
4909	0101000020E6100000429A697F2E6E0E4044A6BA8502D34540	99	2	2014-09-18	13223	97590.9540498845	t
4910	0101000020E6100000987EEDF374EF0E406D52013278CE4540	40	7	2017-02-24	23521	91124.0095098914	t
4911	0101000020E61000005AEF04049B130F40CA7A47F96CCD4540	45	4	2020-09-15	40997	93118.9849600086	t
4912	0101000020E61000007493C62757AC0E40AD8DAFD441D04540	76	1	2012-10-26	71548	21298.0014577901	f
4913	0101000020E61000007B8EB158375F0F40C6567CEA6ACF4540	79	4	2023-09-30	77313	53201.7239253689	t
4914	0101000020E6100000428CDC9842620E40FCD6E15ADBCA4540	63	9	2010-06-18	24380	1221.09752759905	f
4915	0101000020E61000007599A622BD4B0F4031C0AD124FD44540	7	7	2018-03-25	78041	35808.4208353695	t
4916	0101000020E61000007EA4AB1537C50E403338F6C32DD34540	63	1	2013-04-01	16378	46769.5017048383	t
4917	0101000020E610000036DC27F83E430F403FE7BFA111D14540	32	1	2011-04-02	99222	49919.7245658176	t
4918	0101000020E61000007F7BAC132FC10E407AAADA18F5CB4540	11	8	2013-07-28	88383	48062.1291809385	t
4919	0101000020E610000051A15D5748F90E40F91E566195D04540	21	5	2016-08-23	46722	33454.5831591536	f
4920	0101000020E61000001533BDECB6F50E401FAB8A5492D04540	18	1	2025-12-01	3460	56933.6990945797	f
4921	0101000020E6100000D1D2FBED23230F4094742E35AACA4540	13	8	2017-09-25	96142	67546.389613763	f
4922	0101000020E610000004C79EBCC7E80E408CEE72E31ED54540	72	6	2020-11-21	15882	24383.8075866731	t
4923	0101000020E61000006ECCAE62C5530F402B8B363363C84540	2	5	2024-07-31	4477	23607.7038860612	t
4924	0101000020E6100000C6D47CFD91960F40883C73829EC84540	95	7	2023-09-10	19983	54583.4798742981	t
4925	0101000020E610000081A03F8F879B0E407EBD205D32D54540	94	10	2018-03-31	32114	40712.8047650073	t
4926	0101000020E610000070DD5C3E19240F40FFC16410A8CE4540	67	8	2020-06-28	1880	42103.9250930616	f
4927	0101000020E6100000F065C663260C0F40342980A71FCE4540	40	9	2010-05-10	74865	52362.3630958982	f
4928	0101000020E6100000E7E14B9EBB3E0F4013A473BD3BCD4540	70	9	2012-07-15	86553	42137.6090661437	t
4929	0101000020E6100000AC37EFDAB9B10F400ECF83EB1ED24540	68	2	2022-10-19	94891	61579.7474019341	f
4930	0101000020E610000047C8C9D0CFCE0E40CB215B3938C84540	58	5	2012-02-26	76819	91992.7687552185	t
4931	0101000020E6100000F5AA8FB35B680E402FECE76195CE4540	44	9	2024-02-04	35595	17613.0914274393	t
4932	0101000020E61000004F7503B2249A0F40359CA9575FD04540	11	5	2010-04-30	59403	97191.9103011277	t
4933	0101000020E610000091E846927AE20E40C17A44B00BCB4540	50	5	2021-06-12	12414	91027.4719990766	t
4934	0101000020E61000008C91A8CAA77B0F406339028AA9D04540	22	5	2015-04-26	57941	74292.6716652914	t
4935	0101000020E61000006D4F2920A68F0F404328C08857D24540	57	3	2015-08-29	46878	26810.5350342285	t
4936	0101000020E6100000948B982C10FA0E4007BDDD71AAD04540	49	2	2023-09-20	18894	69240.8539075458	f
4937	0101000020E61000009D0EF789AABF0E409A353B9243D24540	9	5	2011-04-01	29531	13533.0428859857	f
4938	0101000020E6100000BDC801F559F90E407269B49AF7CE4540	5	9	2024-05-16	56996	43485.3906842231	t
4939	0101000020E61000003C7EAF6110770F40C8DAF97E9EC84540	19	3	2024-12-30	9116	97193.9037523129	t
4940	0101000020E610000062B7214BB9170F407E2F6FA95FD04540	69	2	2014-03-13	42297	5459.65395501977	t
4941	0101000020E6100000A8116927A40A0F40D13FC35270CE4540	27	1	2025-02-10	83299	56298.8840566929	t
4942	0101000020E6100000AC1866A512A30F40C88B035EA9CA4540	74	1	2016-04-01	75679	67137.6743672324	t
4943	0101000020E61000000F37E15186AB0E4073E9BD523ACF4540	59	3	2023-08-20	56202	21525.7771909493	t
4944	0101000020E61000002D883E46A0680F40630E9B23CEC74540	18	2	2016-03-30	8554	54642.8788756084	t
4945	0101000020E61000006AC911CFB97F0F40E6037AC441D34540	77	9	2023-01-31	65961	96047.929034397	f
4946	0101000020E610000054B03E862F9F0F40409C1129E3CF4540	60	8	2024-10-21	93784	1815.61125450489	t
4947	0101000020E61000005B963553D33D0F400EAF1945DECF4540	64	6	2019-07-29	80494	98398.7154666385	f
4948	0101000020E61000002E3E06D793050F408B9E93B9A7C84540	51	6	2015-12-29	20778	58397.8764212483	f
4949	0101000020E61000001D371EEA203A0F407F814C9C37D44540	7	10	2019-06-27	61742	68941.979274284	t
4950	0101000020E610000063677F317DA80E406DCF6895E3CB4540	9	5	2018-09-09	44104	6693.36205893647	f
4951	0101000020E6100000CE4FC13265A70F405B4BB99B93CE4540	38	8	2021-04-08	51035	82768.8125088852	t
4952	0101000020E6100000AFCDB467D40C0F4037771117A1CC4540	13	3	2019-04-01	64954	68435.3970826584	t
4953	0101000020E6100000255484D0459F0E40C9AB380147D24540	50	4	2018-12-10	96057	99441.7548055783	f
4954	0101000020E61000000FA5460374240F4016193C446FCC4540	56	6	2021-02-10	24406	39343.4916257366	f
4955	0101000020E61000001DCEAE5403960F4085A8C14E43CD4540	51	3	2023-06-17	90685	64256.3255280535	t
4956	0101000020E6100000FB2B54973D6E0F40DBA7ED4B33D54540	10	3	2020-03-18	31337	60414.2495772829	t
4957	0101000020E6100000404A33247A1E0F407F09D5580BCE4540	26	10	2019-02-23	86374	20507.8794162382	t
4958	0101000020E61000008032BE4731950F40E7AD481A73D24540	18	4	2025-04-01	99842	13888.7028271713	t
4959	0101000020E6100000886207CB801C0F402A807475B3D34540	50	2	2014-10-27	89583	46483.4132348417	t
4960	0101000020E61000004921DFDACEA20E400FE7E98BDAD14540	39	10	2010-04-16	60366	42200.6268629967	f
4961	0101000020E610000055E4A9FE97960E403EA73AECCBD24540	9	3	2011-02-13	65218	38388.3591699287	f
4962	0101000020E6100000BD4153AD4BCA0E406880869575D34540	45	10	2011-12-31	22824	83511.8329959597	f
4963	0101000020E610000064A0779124D50E40B10C185B8CD44540	7	1	2017-11-20	68550	3704.35153937847	t
4964	0101000020E6100000C28C3CA8CD6F0E409AC07366DED24540	39	2	2011-06-13	86711	96537.1237993808	t
4965	0101000020E6100000DBF251BFAC290F409148AD45B8C74540	93	9	2012-07-13	1502	93236.6582259398	t
4966	0101000020E610000025B21393CDE20E40BB69C6E516D04540	42	6	2016-02-27	70830	1968.23306459823	f
4967	0101000020E6100000DB791596BD8A0E40C2BE79D097D24540	3	8	2019-06-29	30681	8793.37215588733	t
4968	0101000020E61000008B14085BC9C40E4079BE4F94E8CD4540	26	9	2025-05-20	25506	42234.1937869322	t
4969	0101000020E6100000FBBB7574C6B70E405BBB393ABCD04540	59	9	2012-12-21	93149	14116.5979923046	f
4970	0101000020E6100000DA5A133B53760E4010368B5D47D24540	77	3	2018-12-24	46405	27600.491839378	t
4971	0101000020E6100000805F833881920E40ADD404FE44D04540	58	7	2020-03-04	77676	61126.2885521485	f
4972	0101000020E6100000A08E778C70550F40E6BED1CD59D34540	12	10	2013-01-28	20777	28139.2823181039	f
4973	0101000020E6100000025190F2036B0E40D34D5F9D05CB4540	45	9	2022-08-20	60920	79505.2333608373	t
4974	0101000020E61000002E22A31F4E7F0E405C2A99C366CB4540	49	6	2017-12-06	30659	9305.86126335486	t
4975	0101000020E6100000C2F8C00260820E406A2F523312CA4540	33	1	2018-11-19	58017	19588.5547951768	f
4976	0101000020E610000050D794E4BA010F40CE5C2D4462CE4540	24	1	2018-07-19	10914	36572.2496109153	t
4977	0101000020E61000006648BBDE35960E407BF8020962D04540	17	8	2010-07-29	76048	69977.7075558094	t
4978	0101000020E6100000D1F29744A1170F40593D6D74B9CD4540	13	1	2021-03-08	75551	79517.8987144155	t
4979	0101000020E61000002113DC3503F20E409F3BE248AECC4540	32	1	2010-01-11	90657	70330.1992400361	f
4980	0101000020E61000000C26258F1B100F402A95D4A4DDCA4540	12	9	2025-04-30	23220	31709.2116885086	f
4981	0101000020E61000001A64A46083750E400579A847DFCD4540	37	7	2019-03-04	45032	69266.2631599924	t
4982	0101000020E610000038ED754422DD0E40015904E63BCA4540	17	4	2019-03-10	9391	80707.4885199132	f
4983	0101000020E6100000AF4177EB2AA80E401A599102BECA4540	11	5	2025-03-16	60152	64668.1506672589	t
4984	0101000020E6100000F94893713DBC0E4041080562CBD44540	47	3	2022-12-25	94316	5097.93242102465	t
4985	0101000020E6100000967C306F7E2D0F404FBF1E37A9CD4540	40	9	2023-02-28	96673	43870.1642046556	f
4986	0101000020E6100000FD117E8958410F40CACBA9CF5BC84540	14	1	2018-02-15	47094	71601.1393497373	t
4987	0101000020E610000028050CF55FA40E40ED01B78A3DCC4540	67	4	2020-03-04	54039	62239.7982806191	t
4988	0101000020E610000052BE435C887C0E4081984B9612D04540	23	10	2019-08-22	31549	63340.7536770035	f
4989	0101000020E6100000B59104086B1C0F400BD9187C54D14540	64	7	2018-06-13	59645	4819.38102733663	t
4990	0101000020E6100000DE58D1EA70E30E4056F09BE7BED14540	12	2	2015-03-21	48258	26813.7071403661	f
4991	0101000020E61000006D9CE98F1D810F40F275466D69CE4540	29	3	2024-06-23	61877	65558.9065872949	t
4992	0101000020E610000097A11233E7270F40541FF5984CD24540	47	3	2022-02-27	19315	2190.01974283426	t
4993	0101000020E6100000B8D24484BD830F405318E68CEFCC4540	71	9	2013-10-23	37058	30839.3649459591	t
4994	0101000020E6100000707DD747B76F0E40AA2A86C3C0D44540	46	4	2017-09-30	68815	7506.03928113196	f
4995	0101000020E6100000B3FE00E82DD70E4022E8B46C36CF4540	48	9	2024-11-05	15009	762.192080278168	t
4996	0101000020E61000006CDBCD8182570F4075078E0CD6CA4540	83	6	2023-11-16	26995	12579.2553490438	f
4997	0101000020E610000041FC83DC648C0F4009A80FBADED04540	23	4	2014-09-30	27917	18384.6204806519	f
4998	0101000020E61000007513BE395ED20E40D3C9C9B4B2CA4540	96	4	2025-12-13	77478	88214.6432516202	t
4999	0101000020E61000006CA8AB15CE800E40187FA6E584D24540	48	2	2010-08-15	37991	29184.9543928572	t
5000	0101000020E61000005222164D55770E40FCFD79963ACF4540	45	7	2020-05-26	83972	81564.6690746019	t
\.


--
-- Data for Name: layer_legend_categorized; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.layer_legend_categorized (id, geom, category) FROM stdin;
\.


--
-- Data for Name: layer_legend_single_symbol; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.layer_legend_single_symbol (id, geom) FROM stdin;
1	01010000206A080000189125735F71274188E80344B5F35741
\.


--
-- Data for Name: layer_with_no_filter; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.layer_with_no_filter (gid, geom) FROM stdin;
1	01010000206A08000040787D23418CE540D5BEAF2CA4D43041
\.


--
-- Data for Name: lookup_1; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.lookup_1 (id, data) FROM stdin;
1	Graylag Goose
2	Greater White-fronted Goose
3	Taiga Bean-Goose
4	Tundra Bean-Goose
5	Pink-footed Goose
6	Brant
7	Barnacle Goose
8	Willow Ptarmigan
9	Rock Ptarmigan
10	Western Capercaillie
11	Black Grouse
12	Gray Partridge
13	Caucasian Snowcock
14	Common Quail
15	Rock Pigeon
16	Stock Dove
17	Common Wood-Pigeon
18	Eurasian Collared-Dove
19	Laughing Dove
20	Great Spotted Cuckoo
21	Common Cuckoo
22	Eurasian Nightjar
23	Alpine Swift
24	Common Swift
25	Pallid Swift
26	Water Rail
27	Corn Crake
28	Spotted Crake
29	Eurasian Moorhen
30	Eurasian Coot
31	Red-knobbed Coot
32	Western Swamphen
33	Little Crake
34	Baillon's Crake
35	Common Crane
36	Eurasian Thick-knee
37	Black-winged Stilt
38	Pied Avocet
39	European Golden-Plover
40	Eurasian Dotterel
41	Common Ringed Plover
42	Little Ringed Plover
43	Kentish Plover
44	Eurasian Whimbrel
45	Jack Snipe
46	Eurasian Woodcock
47	Common Snipe
48	Red Phalarope
49	Red-necked Phalarope
50	Terek Sandpiper
51	Common Sandpiper
52	Green Sandpiper
53	Marsh Sandpiper
54	Wood Sandpiper
55	Common Redshank
56	Spotted Redshank
57	Common Greenshank
58	Ruff
59	Temminck's Stint
60	Sanderling
61	Purple Sandpiper
62	Little Stint
63	Parasitic Jaeger
64	Pomarine Jaeger
65	Great Skua
66	Wilson's Storm-Petrel
67	White-faced Storm-Petrel
68	Black Stork
69	White Stork
70	Eurasian Bittern
71	Little Bittern
72	Black-crowned Night Heron
73	Little Egret
74	Western Reef-Heron
75	Little Heron
76	Squacco Heron
77	Black-winged Kite
78	European Honey-buzzard
79	Oriental Honey-buzzard
80	Eurasian Griffon
81	Short-toed Snake-Eagle
82	Lesser Spotted Eagle
83	Booted Eagle
84	Golden Eagle
85	Bonelli's Eagle
86	Western Barn Owl
87	Eurasian Scops-Owl
88	Eurasian Eagle-Owl
89	Northern Hawk Owl
90	Eurasian Pygmy-Owl
91	Little Owl
92	Tawny Owl
93	Eurasian Wryneck
94	Eurasian Three-toed Woodpecker
95	Middle Spotted Woodpecker
96	White-backed Woodpecker
97	Great Spotted Woodpecker
98	Syrian Woodpecker
99	Lesser Spotted Woodpecker
100	Gray-headed Woodpecker
\.


--
-- Data for Name: lookup_2; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.lookup_2 (id, data) FROM stdin;
1	Western Paleartic
2	Eastern Paleartic
3	Neartic
4	Afrotropic
5	Neotropic
6	Australasia
7	Indomalaya
8	Oceania
9	Antartic
10	Not determined
\.


--
-- Data for Name: many_bool_formats; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.many_bool_formats (id, bool_simple_null_cb, bool_not_nullable_cb, bool_simple_null_vm, bool_not_nullable_vm, geom) FROM stdin;
1	t	t	f	f	0101000020E6100000AD1BE53121E42140A1F508C59F304540
\.


--
-- Data for Name: many_date_formats; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.many_date_formats (id, field_date, field_time, field_timestamp, field_date_auto_cast, field_time_auto_cast, field_timestamp_auto_cast, field_date_auto, field_time_auto, field_timestamp_auto, field_date_expr_now, field_time_expr_now, field_timestamp_expr_now, field_date_expr_now_auto, field_time_expr_now_auto, field_timestamp_expr_now_auto, field_timestamp_date_only, field_timestamp_date_only_auto, field_timestamp_date_only_expr_now, field_timestamp_date_only_expr_now_auto) FROM stdin;
\.


--
-- Data for Name: natural_areas; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.natural_areas (id, natural_area_name, geom) FROM stdin;
1	Étang du Galabert	0103000020E6100000010000006B000000966E5D1B9969124047F3918478B645403C69FAF49A651240E0328493CCB64540B54AE29B72651240533EEDB4DBB645405B36D2B5576512400B4BB784ECB64540D417BA5C2F65124067519CECF4B6454040BC7151B6641240F3535E49F8B645405F89491273641240F3535E49F8B64540736C687DFA621240347115F41EB74540736C687DFA621240A67C7E152EB74540736C687DFA6212401988E7363DB74540736C687DFA621240D194B1064EB74540DF10207281621240739CF71C58B745400F6E9F41AA6112402D9B966E56B745404D084FC323611240CFA2DC8460B74540F3F33EDD0861124058B3C95F76B74540F3F33EDD08611240C9CC5DFF97B745408BA2FE449D60124097DEAB88AFB74540AA6FD6055A601240DDDF0C37B1B7454016148EFAE05F1240DDDF0C37B1B7454035E165BB9D5F1240C7DA887DAAB7454035E165BB9D5F1240C9CC5DFF97B74540A0851DB0245F12406AD4A315A2B745409FA3772F5E571240AD828D6788B84540BB2C85531C541240EE9F4412AFB84540B8D90DF7005512404AA6297AB7B84540C2C3C64C3656124092995FAAA6B845409FA3772F5E571240D5A8EBD6BAB8454026C28F888657124031AFD03EC3B845406F46F85F3558124031AFD03EC3B8454007F5B7C7C95712402FBDFBBCD5B845400B482F24E556124017C6A281E1B8454095B9BED928561240A2C864DEE4B84540FD0AFF7194561240A73D41897FB94540D79738F8A0581240A73D41897FB94540841A6A0BA05A12407A33391672B94540319D9B1E9F5C1240201F293057B94540B5683C1BAC5D12404F1B062552B9454046710DCA095F124068125F6046B94540F746B63924601240970E3C5541B945404AB5D766086212406CF6086421B945400575392C5864124012E2F87D06B945405490E3FC20671240B8CDE897EBB845405581363D046B1240ECAD6F90C1B845401E7EC8B4A46D124034A1A5C0B0B84540AF869963026F1240EE9F4412AFB845407BD6A237BE701240DA8C95DA95B84540F16413827A711240517CA8FF7FB845403AE97B5929721240F767981965B84540AF77ECA3E57212405752278548B84540D92E7DBAD7731240B73CB6F02BB84540C89ED5AB6B741240B73CB6F02BB84540E31836100D7512408D2483FF0BB84540FF929674AE75124004149624F6B7454067E4D60C1A761240C0040AF8E1B74540EE02EF654276124095ECD606C2B74540752107BF6A7612400CDCE92BACB74540752107BF6A76124025D34267A0B74540EE02EF654276124044A01A285DB745408904262AF2741240A0A6FF8F65B745404EBDED04947412408C9350584CB7454067E4D60C1A7612409077FA5B27B74540AC15C887AD7712407E5620A6FBB64540D6CC589E9F781240C64956D6EAB645405DEB70F7C7781240244210C0E0B64540EEF341A6257A1240823ACAA9D6B64540A21C62725B7A1240F929DDCEC0B64540B3AC0981C779124014130B8CA2B645404B5BC9E85B791240B80C26249AB645406A28A1A9187912404501BD028BB64540F599305F5C78124047F3918478B64540A9C2502B9278124062DCBF415AB645404B5BC9E85B791240C0D4792B50B64540D279E14184791240F898AA2701B645404B5BC9E85B7912401574AD66D0B545400DC11967E2791240305DDB23B2B5454067D5294DFD7912401C4A2CEC98B54540834F8AB19E7A1240D83AA0BF84B545403778AA7DD47A1240F131F9FA78B5454075125AFF4D7A124039252F2B68B545402C8EF1279F791240C619C60959B5454030E16884BA7812408018655B57B54540E75C00AD0B7812408018655B57B54540603EE853E37712400E0DFC3948B5454025F7AF2E85771240F9F94C022FB5454067E4D60C1A76124029F629F729B54540E31836100D751240E3F4C84828B545407BC7F577A1741240E3F4C84828B545402859D44ABD72124007377DB47FB545407F1A6DD4BC73124007377DB47FB545408D579D860D741240A74CEE489CB54540F4A8DD1E79741240BB5F9D80B5B54540CF3517A585761240CF724CB8CEB54540AF683FE4C876124059833993E4B54540EE02EF6542761240C7AAF8B018B645406A374E69357512400ABA84DD2CB645402FF01544D774124025A3B29A0EB645408904262AF27412402795871CFCB54540E76BAD6C287412402795871CFCB54540EABE24C94373124050BBE58B2EB6454066F383CC36721240C0D4792B50B645409750039C5F711240F0D056204BB645407BD6A237BE70124049E5660666B645402BBBF866F56D12407BD3187D4EB645405C1878361E6D1240A8DD20F05BB6454043F18E2E986B12408DF4F2327AB645401A3AFE17A66A1240E9FAD79A82B64540966E5D1B9969124047F3918478B64540
2	Étang de la Vignalie	0103000020E61000000100000013000000FAB787157957124009B9029C22BA45401DC92973345A1240C79B4BF1FBB94540AFB3A0A2586312404B375C2177B945405D2725F63A691240B2F7691223B94540D2A6E880DA6D1240A2C864DEE4B84540F26413827A711240D89AC058A8B84540BB61A5F91A741240B3580CED50B8454079747E1B867512409D5388334AB84540C2F8E6F2347612403DFA2B6F26B945408E394307D47B12403724ADE95DB94540928CBA63EF7A1240C1C5CC6B33BA4540C2E93933187A1240EECFD4DE40BA45400ED0C626FF751240D7CA50253ABA454068F383CC367212404AD6B94649BA45408A13D3E90E71124002E383165ABA454045E2E16E7B6F124090D71AF54ABA4540838B3EB0116B12407BC46BBD31BA4540CE8F2523325F124021B05BD716BA4540FAB787157957124009B9029C22BA4540
3	Étang Saint Anne	0103000020E610000001000000260000003E0FEC76EE7C12409E03979B4DAD4540E74D53EDEE7B1240E979D4F4E9AD4540917D0DA4D27E124026B3E19B35AE4540916E60E4B582124079F172FC87AE4540188D783DDE8212404CE76A897AAE4540E82FF96DB5831240F0E0852172AE4540EED5E726EC811240B1B5A3F838AE454042440954D0831240CE90A63708AE4540A99549EC3B841240D274503BE3AD45409805A2DDCF841240D274503BE3AD4540D69F515F49841240CE90A63708AE45402D61EAE8488512409DA2F4C01FAE4540BE69BB97A686124028A5B61D23AE4540E4CDD4517D881240CAACFC332DAE4540186F1EBEA48A1240E0B180ED33AE4540F64ECFA0CC8B1240CAACFC332DAE4540E16BB035458D1240B3A7787A26AE454081B1B196F38E1240869D700719AE45407D5E3A3AD88F1240438EE4DA04AE45405B3EEB1C00911240747C9651EDAD4540D0CC5B67BC9112408D73EF8CE1AD454050458507AE93124049646360CDAD45402E2536EAD5941240ED5D7EF8C4AD454077A99EC184951240046302B2CBAD4540E9E497AF259712400655D733B9AD45405F7308FAE1971240213E05F19AAD45406CB038AC329812400C2B56B981AD45406CB038AC329812409A1FED9772AD45405F7308FAE19712406F07BAA652AD45405F7308FAE19712405AF40A6F39AD45405F7308FAE197124075DD382C1BAD454043F9A79540971240A7CBEAA203AD45408FD087C90A9712407AC1E22FF6AC45407003B0084E971240ABAF94A6DEAC4540F630752193931240F1B0F554E0AC45404C10682ACC8C124061CA89F401AD4540188D783DDE821240FEED250731AD45403E0FEC76EE7C12409E03979B4DAD4540
\.


--
-- Data for Name: parent_layer; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.parent_layer (id, geom) FROM stdin;
1	01010000206A080000E9DB1DB8AD8E274172033A2F24F45741
2	01010000206A080000DF431F18D8E027417C598F864DF45741
\.


--
-- Data for Name: quartiers; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.quartiers (quartier, geom, quartmno, libquart, photo, url) FROM stdin;
1	0106000020E61000000100000001030000000100000058040000924410CFCBDA0E4016AC14ABA1D345404D5E6AFDF0DA0E40FE004C2EA1D345405E7646B6FDDB0E40C62118969DD34540D738E31F3FDC0E40941B2B969CD34540DFE5727F5CDC0E407CAE68E29BD34540473B5F1CCCDD0E408EA608B492D34540124CCDA86CDE0E4038B228DF8DD34540DC0315DDF2DE0E40A869533389D3454026AB8BFFFFDE0E40A7C8C38788D3454087272E1815DF0E408283037587D34540C214316725DF0E406E4B929986D345406EB136733EDF0E4027B0584085D34540BB970A3862DF0E404B166C4B83D34540EEAF832082DF0E4046AB98D581D34540755E49FCBADF0E40211943C97FD3454050363FF7E9DF0E40C212826C7ED34540C2E45AF34BE00E40C7A88B9A7BD345400BF1D775A6E00E406BBC676279D345403989B116FDE00E404B965F9C77D3454052A6F83641E10E406545994B76D34540849B106AA8E10E40E7A2444F74D34540497EABF946E20E40C304399771D34540EB466ABD67E20E404128653C71D34540D7CDEBB096E20E404FEBD4CC70D345404C40D5AE0BE30E401DC3F7C26FD34540449040226EE30E400B17B4166ED3454007D4F42AD3E30E404EFA0BC76BD345403AAF57A81BE40E40834D893569D345409B7F5A22D3E40E4096F179D860D3454047A7BB2DF5E40E40E0776FA55FD34540A70C339436E50E40C252CDA15CD34540BC8EDC2259E50E40E75C06B35AD34540EC51EBF89CE50E4062C6FCAF56D34540603A777AD6E50E400830213F53D34540657FFFDEE3E50E4058EB753752D34540158DE957FDE50E40A8811DEB50D34540261962ED02E60E40E00E33AA50D34540D816F1411FE60E409E7FAD664FD34540561FCF503FE60E40149961504ED345409EC4B4DD83E60E40204A950D4CD345402DD8B58FB7E60E40DFD5DB4D4AD34540C0E6333FDBE60E40910B152549D34540433B9E2AF2E60E40F4692F9048D3454046FCFAB289E70E40653A5D9044D34540ADDBEB5F9FE70E40C9B136EB43D345405688A36CB5E70E400ED2ED3143D34540787282A7E0E70E40D98E249C41D34540FEA190A416E80E40092C3A823FD34540620F354F49E80E4071F1043B3DD345403C0034DD52E80E40AE7D99C03CD3454095A432837BE80E4008567FD03AD3454008F70F2C90E80E40A8B821AC39D34540094321539FE80E409C2C0BF938D345404DCC5B3BB0E80E4080CA019738D3454051F69268BEE80E405B1F5B7C38D34540155EE33DCCE80E407AB5B68838D345408EC985BAD9E80E402A0FEBBA38D34540625BCC463CE90E406DF7C8493AD34540CE6AB420F5E90E40F16C32433DD3454037F584B20FEA0E4041F4DAA83DD34540275E1B6A30EA0E409CB2692F3ED34540D83EA4528EEA0E4041A71E563DD345400565E1C4BDEB0E4024D491423AD345400D3E0519E5EC0E4012F2483437D345402463643F21ED0E400D3D924336D34540FD78BD413CED0E4087417DBF35D34540E307CA9C53ED0E40B0EE5F3D35D34540457D8BD07BED0E4051D1753334D3454094EEF2C798ED0E405B76EE8033D34540153E1EA5C2ED0E40E5EE418E32D34540BBB37C53D2ED0E40A93DC22732D34540947CB36DECED0E400B1BDE6831D345401746B60FF8ED0E40E9547F0B31D34540BCC8E4200EEE0E40B1A9FF5D30D345405BD5A1E42AEE0E406DF6402D2FD34540C98938C555EE0E40A61909BC2CD34540A86A05F16FEE0E40A2D9E7292BD345403B06422EB2EE0E4049AC673C27D34540C3FBCBD864EF0E40639667161DD3454060596F890AF00E40D35E10FF13D3454097630DEC27F00E40C507005712D34540D33FC72D36F00E40BFC82E7011D34540C6B03DD54FF00E40A60FB6990FD345405D2211466AF00E40110690B20DD345404861E17F78F00E409BC4DEB80CD34540C9B5F5FB81F00E40950CCD120CD34540D96D4E2F94F00E40C51DF7E10AD3454067CB0AFDBCF00E40E3013A5708D3454000C847E4F0F00E406A492C2005D3454069D1522763F10E4066D3E96EFED24540A283240F82F10E4063849B85FCD24540E0CBF5FCD9F10E40A0B60601F7D24540D6FC548153F20E40E5D5222DF0D24540A81ECC2ACDF20E407F9515B4E9D245407D2CC4FFD3F20E40EE07C385E9D24540AD8481B0E7F20E40721F89FEE8D24540979CBC8940F40E40B0FA6CD7E8D2454061CEDE47EAF40E40C21030A8E9D24540C31436D2E6F50E4061A7E044EBD245400425530B2CF60E402E845DA8EBD24540B7D40CAD55F60E40C4542B21ECD2454018B60F8AB9F70E40305B350EEFD2454077C2022104F80E4085E3D1A6EFD2454064D3D26438F80E40D3C4534BF0D2454094B1EBB7DBF80E401738834BF2D24540DE5FB39138F90E4044E66BD4F3D24540D81BAEEE71F90E40B6CD3F04F5D245409EECD59DA5F90E40D1C3D938F6D2454095EEAF32F8F90E4055B78578F8D24540A6ECE0E865FA0E40C4DA477DFBD24540E2F3506BCBFA0E405F054052FED2454050B8869016FB0E4045C2764400D345408A0D2BF34FFB0E4029D2418101D34540E5CB5C2B97FB0E4031CD92CB02D34540435AF2E2DBFB0E40FB8821ED03D3454052BFB39DF7FB0E408490ED2D04D34540444EEB6485FC0E40B9DA2B2904D34540C8D290E115FD0E40231100D701D34540166B33358AFD0E409EDAC634FFD24540FB09EFBBCAFD0E40D817C30CFED24540F6C2D49908FE0E40AF7FCB57FDD24540AA88A2B92EFE0E4000A0AB2FFDD245409461484669FE0E40C681754DFDD2454085F91F56A4FE0E4042FD36ADFDD24540EACBFC31D3FE0E403327D203FED245400B9173F209FF0E4073E270C6FED24540159AD37632FF0E4056462D7FFFD245408A862B9E7CFF0E402E8A7D0101D3454059C49E95B8FF0E4065FC619702D345406988B927F9FF0E40B43A3F8104D345400A1F598A3A000F4090651D6C06D34540612FEC526A000F408C08A70408D3454027C7D43A98000F40360D2FFD09D3454034C6B9F5D2000F40BD9812840CD34540AEB0B560FA000F406853E8830ED3454099A32CEE2C010F40733657EA10D345406DD3EAF64E010F408B2671AA12D34540E8DC953961010F406FAF909913D345403CCFDF3B7B010F40E619119B14D345401B7B1EA49F010F4006BC023615D34540F17758E1EB010F40FBFD5BDC15D34540F84D64D63E020F4053B99F0D16D345402F27737B73020F406820CBA315D34540A559EFE0CB020F40887C743A15D34540F836C08E18030F400FB06EF914D3454063C2269958030F40689D769C14D345409926653FA7030F404BA93E3514D34540796A6DBB05040F40E8D638C813D34540B5C74DCC5D040F40E697278E13D3454073A44373CF040F40B071864E13D345409824FEE459050F4011B44E1513D3454067FAA165DF050F406776ADB212D3454043C0FB4016060F4054A7A1B912D345406EABD91636060F4028E4A81413D34540BBF210C34C060F40FED196E013D34540E3F5CDB167060F402B36542615D345409DA77D0F80060F40FDF3601C16D34540020BB70C9E060F4038C742EA16D34540DC5DFC26C7060F401A8EC31118D345407C9BFD04E1060F409470C8BA18D3454093F3484B12070F40234C32FF19D3454029CECFE663070F40EE4E2BD71BD34540E995C62494070F40F3B4EB921CD34540DA3177A5BD070F406F7F47BA1CD3454081270F96DD070F409B68A6591CD3454027AD03A80F080F40E144669B1BD345406D7D9BD83C080F4088EE7DD91AD345404075F3CA5F080F40DC2859E219D345405ABFFCA09F080F40EDF79E0A18D3454013D7E26FEB080F408D3C4CAD15D345408CF461B44D090F4080F8449B12D34540778E250A81090F40AB7AB7FD10D34540286A0413AB090F4077BCF87A0FD345409952FDB0C9090F4018EA60DE0DD345400CAE0848E6090F40476E97440CD34540E69EC35E230A0F402718C3B108D34540F3E1E401600A0F4036A7B60205D34540EF1466D3850A0F408A844D2103D34540A5013E41C10A0F405AE6EF7400D34540A854C230F90A0F402500A32DFED2454005FD31A9320B0F4036D488AEFBD24540B20EC78E7C0B0F400D429DA0F8D245402AF23831AF0B0F404F8A7B4DF6D24540DA93E13DD60B0F4056CE0B74F4D24540A42A52D7030C0F4019F8B4BDF1D24540044F4FB6160C0F40BC94BE37F0D24540EBC5E6F52E0C0F40B9CC6DF1EDD24540698FF6EABB0C0F403B00F720E1D24540581CADDF100D0F409CDDBB61D9D24540D4932419650D0F409BBF63D5D1D245403B2A13D7B40D0F40ADE49840CAD245402E157FE2D50D0F40A2880FA8C6D245407516768F0D0E0F405BB948CEC0D24540448060FB2E0E0F40886FF723BDD24540C0AE50B1380E0F4032D31510BCD24540B476A846500E0F40FC90F525BAD24540CCD60E19700E0F40427B0582B8D24540D3CADE57930E0F406840E449B7D245404D00ECAEC70E0F40FFEDA425B6D24540581DEB3BF90E0F405A1C0A23B5D24540F70041503E0F0F4080A19832B4D2454000DC64A58A0F0F409D452E1DB3D24540BBCCBDA0FC0F0F40376662B6B1D24540C6087AA165100F4067266836B0D245406CC46CFEFF100F4063A73239AED24540ED0667902A120F40259A243BABD245408F25D893ED120F4091BDFF4EA9D245402381E8BE9E130F406ADEE774A7D24540ABF28DC2D5130F4064DD8FE3A6D24540B6318E9A85140F401950D7C8A4D24540E9B7E0B0D9140F40C8317BCAA3D245409BC86B9C1A150F40EE85BC9EA2D24540B51441655D150F40FB13EC0BA1D245407C59B22E9B150F407DC2822D9FD2454037D8566EDE150F40BEA2D3C39CD24540452F41D02C160F40769F63C599D245405A313D7A66160F407D87C2C696D24540586DD6F58B160F40ED0D3E1994D245408F6F08299E160F40269EBDF191D2454022DFA459AB160F400C475D768FD245404B276DCFC1160F4051B425D38BD24540730EDB09E1160F40E89B59C787D2454038FA6DDB00170F40FF55E12D84D2454035BE45DA20170F407122EF0081D24540862D2F1738170F4029ACA5437ED245402DC2472243170F40D51C1B7C7CD24540284E9FED4F170F404925E6077AD2454030D317C05D170F401042781D77D2454098EDCAD667170F409165770374D24540CB884D4B70170F40D4FB43DF71D245404EDB9F9282170F40A9921FE86FD24540C312F1D6A1170F40C2489BEA6DD2454036580D33B3170F403BE9EBAC6CD245409479CEAADE170F4068F0B1B26BD245407B77F04500180F40F55BFD6D6BD245408160D35439180F405210F7E06BD245409A65111F74180F407D63A2956CD2454027C6A488B1180F40F7E532BC6DD245403C809E21F4180F4065B9CDA76ED245407AB3E02051190F40A580FD8F6FD245409D99DAF47A190F408D962F8270D2454016603C2AB5190F401BA46ACA70D245406AC9F58CFC190F403467B58570D24540FDA1F29E4F1A0F409076CB0570D2454078D8C319A31A0F406E8226886FD24540FDFCD6B13F1C0F4099526D386ED245406906EF50CD1C0F402E17B5D96DD24540645928BD2E1D0F4003FCC7AC6DD245401192B8EE671D0F40A75222786DD2454023E56C0EA11D0F40500807196DD2454097D1A904EC1D0F40D4EEF6A86BD24540DEC048AD501E0F405711908468D24540B06D318DA51E0F40FF3EAB8465D2454001492AB0E81E0F40B746E4D862D24540E9446E73431F0F4057C99D5A5FD245405F527E105D1F0F40ED048E735DD2454080448AF46F1F0F40AE29E3FC5BD245407C5289E67C1F0F401F0C0AE759D245402CE1CC9F801F0F40F1C5611C58D24540FF8806987C1F0F4042DED03B56D24540F968943B761F0F40255F53A852D2454084EF5BC26B1F0F40E9D1E1F54ED24540E7C53840561F0F405ECADE2549D245400615C18F451F0F40DCB3ED2D44D2454084608061311F0F4071BE369540D245403613E5F51B1F0F404C7EF4E93DD2454071F66054051F0F400AA0AD433BD245402C160840E11E0F40C43AD98238D24540FD4F1B77B61E0F405107DE4235D24540B6A3CAC26F1E0F408F6F095230D2454034A05CF71F1E0F40799B6C022BD245400859DDF0001E0F40BA0069AF28D2454050A0E4B5EA1D0F40EB51820526D24540FB23CF05E11D0F40449EB43624D24540147D544CDC1D0F4003F4439E22D245402EB4F291EC1D0F409B63E9BD1FD24540B28068270F1E0F40BD3C24F11CD24540CB033B2E2E1E0F406D51805B1BD2454010006607761E0F4020C2EA4619D24540518B898ECA1E0F402275326817D24540704153B81F1F0F4037DEEE1616D24540C56D232C611F0F40C857733C15D245409041E871B71F0F40A69BD8A114D24540CE9145F9F51F0F40B3C49B9014D24540D305201560200F4016110EC614D2454073C1E7E1BC200F40ED950E3715D245408A3727AE2A210F40B810187B16D24540B23F20559B210F4025A895C517D24540BD87C15400220F405462245E19D245409A160DB36C220F409AF8AA191BD2454034D62DE4C7220F4069129E8E1CD245401C37CDEDE6220F404C655FF41CD24540B2CBA10813230F40B85018841DD24540B10F2C661A230F40D21CB4A41DD24540D3A698465F230F402C3F03361DD24540B2165A657C230F4085D8A5E71CD24540ED11A70895230F407B1DD2901CD24540924F5E95D3230F40911060921BD24540068096E309240F40C8BE364A1AD245404CFCBDCC28240F40651BF16719D2454012B4EE3439240F40D9A6A9CF18D24540F21310C546240F40B234D23618D2454071E8BEAD56240F402D49026617D245402344495663240F40CDA6BB9416D245401F3E42DA9D240F4071375DBA12D2454045DF4BD5C5240F4081CE943C0FD2454062230824D3240F400EF8DA060ED2454010D15972DC240F40610197F60CD2454074897A01FD240F408D68D13B08D24540B38F84571D250F40C6C038F802D24540CDC50B0E38250F401F9BC6D5FED1454098F88BD93E250F4079400998FDD145404D9CF25E44250F40B8385A38FCD1454088F2057250250F40820A5106F9D145401D2E69FA54250F40459C4A3AF7D14540D8AB0FA75B250F406DB616BFF3D14540E208376363250F40C473E4E2EFD1454066F95A9E6C250F401B014FB7EBD14540F9AA87D36F250F405BA7A9A3EAD1454037A7F65279250F4006AA0A1CE7D14540A01B73D67C250F4010C7F6CAE5D14540A4D94D5A89250F40A3E9E8BAE0D14540B5541F328D250F40C4E48E3ADFD145404CFC20268F250F40EB96C310DED14540B7360A2B94250F40D9300D83DAD145409466674095250F40DD940936D9D14540E9B9D33495250F401A40C020D8D14540A743EB899A250F40E42E4F53D5D14540EE366911A7250F4046A48652CFD14540EFADEEB1A9250F406104A0D3CDD1454079C0FA67AF250F40A97894F5CAD1454079F6E888C6250F40D762CF31BFD14540ACB5CE69C7250F4001D89A6DBCD14540D5DC1DA1C5250F40F6DBE211BBD14540946D17FCBD250F409670E751B8D145403F72219DB8250F4044774720B7D14540229D1DA1B1250F401E1C17F6B5D14540BC907CF297250F40D948E3D6B1D14540208A582290250F40E04F41A2B0D14540C26BB6CF83250F40DB00A854AFD14540DEF76EDD75250F40800B6A07AED14540B430643567250F404761DDF8ACD14540F02B73EC56250F401C614FE8ABD145406931DD062D250F40F34458D0A9D145409EA42A7E12250F4088D9DD85A8D145408A1113B7FB240F4010EC1979A7D14540D0D36789E7240F40235B10D0A6D14540BAA93264D1240F4042A4664EA6D14540589E003AB5240F40EDACB7F9A5D14540A2E5C14E96240F40A4F7ECDBA5D145400DD57E206B240F40C9D0428FA5D14540FC9D002057240F40000BBF52A5D1454056EC8FE843240F4074578B05A5D14540BB5316A537240F40FA867ED5A4D145405287C8CC1B240F40AC40A44BA4D145407AD7C1E2FF230F40D2A05297A3D14540894045F8EC230F40D02E2609A3D1454092A1C140DB230F40B2FEE96EA2D14540C1FADEA9C1230F40D4D1A475A1D145404154047AAA230F407FF09A66A0D14540F6958C3C98230F40536982849FD145408EEF7FB489230F408C45A2C29ED14540C0C091846F230F40225A7D539DD14540F407F3865B230F402ABCE3239CD145406A6B5C1B4C230F40846F01339BD14540D4D7BEC23E230F40ECEFCF5C9AD14540F9FA5CF314230F405A42C17F97D14540A4CC0B2207230F408594888196D14540EBFC1FBFC7220F4003F3A89291D145409A714B72A4220F4092746CBC8ED145408183560C99220F402D520FB38DD145408760F2D98C220F40477320B28CD145408A5AADBF60220F40DB4BE83389D145408833355E55220F407A7B273588D145405E759CCF33220F407C4AB4A785D1454074736DCD26220F4040F0F3A684D14540C613F40419220F4093ABF7BD83D14540093DCE9901220F40EF4F352082D145407021CBF3E3210F40B8D6A82D80D14540D415F500D2210F402057B0047FD14540AF0A2053A8210F404EDAD5777CD145401C91A2B399210F404D87557D7BD14540C18102248D210F4029F36F967AD14540907DE53B64210F40D0D0A3F077D14540B8FDF0FC55210F40458F5BE476D14540ADD38CB14A210F404129B01A76D14540F06B72802A210F40347D9EE673D145403C74D14BF9200F40B972B9DA6FD145400F512ED5C4200F40543A7CCF6AD1454019FCBB8E9F200F40FDC98F2067D14540091AB88192200F402704DB0566D145403038D0A784200F40261467F264D14540C292EC6477200F40193D1B5064D145401AAAB8746D200F4055531ADB63D145406C3349E44A200F40E1DDA6C862D145402ED8F0EA35200F40531D3B2962D145403644CFCA21200F40C7C10AA061D1454048AB4854E81F0F404C1C7D2F60D14540FC89F92DD01F0F4054B599BD5FD1454077BA8205B61F0F40C2E21F595FD14540723CBB5B7F1F0F40C8212AC85ED145405F319BC4691F0F406D5E3CA15ED1454031BA68C7531F0F40D46C1B7F5ED145402FC58724171F0F40544D6E375ED145401B09B418FF1E0F4054713E055ED145405EE7FB9EE81E0F40D01CA9B15DD14540E452DC8ACB1E0F40CBB0731D5DD1454050D7B599B11E0F409A7B1C445CD14540C12E6838AC1E0F40D3B5C0065CD145408280972B8F1E0F404338108A5AD14540F285F585761E0F400E4278E558D145409990E5646C1E0F40D30382FA57D14540FFC2E52A601E0F405B50B4E656D1454073257699551E0F40851FC6E755D14540F374E51E371E0F409A1F6FEF52D145402B4D1C332E1E0F4014284EFE51D1454066636C5C271E0F40DAB7932C51D145406C18B735031E0F40364367424DD145406440C7AACF1D0F401917858346D14540E4E177F0BA1D0F406F14958C43D14540925CECC0A91D0F4000A0404F40D145402447A446A51D0F40AC06FD4E3FD145406C0922DDA01D0F404DEBD5763ED1454083456E3A931D0F40737CD6FE39D14540B4404E33911D0F40F0B94C0639D14540A92A97218F1D0F400048500535D1454037F73D1F8F1D0F4014EA3F0534D145404282D9288E1D0F4064B8BFB930D14540CE5A04D18C1D0F407DA7AA7D2DD14540F87A850B8D1D0F40BB90B4152CD14540531A0A81911D0F40C6D8AF1B2AD14540BCC37634931D0F407AF1595029D14540E1AB8144941D0F40393789F028D1454056B69CD99D1D0F4068EFCE9526D145403D568193A51D0F40A83907A125D145402DBF09F1B01D0F4046E404A224D1454035F1E0F7BF1D0F40778FEAA623D14540BF27FB80D21D0F40AB74605122D145400E5955E8E11D0F40D1417E4421D1454074E0E2DBEB1D0F4099A997C720D145406ADA8B0AF31D0F40B313247820D14540D35D10DCFF1D0F40BA39F40920D14540BBC23D2E091E0F4056454AFD1FD14540A41AC4F5431E0F40C10C98B61FD14540D55D230A681E0F405F6B778C1FD14540F08FB745A51E0F40304EDB4F1FD14540F0A28AB6E31E0F406D4A120D1FD14540BA6266DB6C1F0F404F2891B71ED145400CB97526811F0F406DB964AE1ED1454004867EC8C91F0F40052A58831ED14540A95776B5EC1F0F402E8669801ED14540031E52F927200F402679296B1ED1454081D69D3336200F403F17AA721ED1454083C065B67D200F40B20AD9821ED14540DB65D2ADD4200F403EF02AA01ED145408791E94C56210F4023DA48C21ED145408A51BA136F210F402B66C3C21ED14540D93452C983210F400CB665BF1ED14540C30F8C489B210F40E26E629A1ED14540E70F2936DD210F40F40D29F01DD1454063CD84B7F8210F40BE7069AA1DD14540459FB75931220F40B97C5D1D1DD14540EB16BC646C220F40D115487F1CD1454068C1A0D985220F4000242D2E1CD145404F9DDBEBC2220F400874758E1BD1454070AE879ECC220F4089D002701BD145406DD59242D6220F4037272B2E1BD14540B194FAABDE220F40263185E51AD14540666617C7F6220F40A6884B431AD14540470D41CB0E230F4006899F6919D14540DCA3150622230F40B81319C618D145404B82A89929230F403A4C796F18D14540AA233F2637230F40371390CF17D1454020300A6E41230F40436F622317D14540D172FDF446230F403BA467C116D1454022A862145D230F406FBEC74814D14540FEA7F63367230F40DBC6E13B13D145407EE33A7288230F40C9866E2E0FD14540108992B691230F4095E48F060ED1454050D8A40E9B230F402ADDE30D0DD145408678B6F0AF230F40C6CD8E880AD14540D732B073BC230F405792A25D09D14540057B1612C7230F405AAB138808D14540FD7A4B8FE2230F4042408D4406D14540641DF2D3EE230F404BB2FA7D05D14540793278F8F7230F40767D9A0305D1454091BBBF56B0240F4054E4CD2AFCD04540C62627C4C7240F40D77D28E1FAD04540743D9582EF240F409CA7F8C8F8D04540B5F2CF2229250F40D80C7ABEF5D045408CC4AD5840250F40BDCC89EFF3D0454041B66E994A250F40EBA3D832F3D04540A0E9BEA360250F40C0A3A881F1D04540390E81627B250F400C67C768EFD045405D11267E9A250F40D16F370FEDD045400E401D45B1250F40BB3ED92FEBD04540E127BDE3E2250F402D70C173E7D04540AEAAD6F6E7250F4048E18EF5E6D04540B0881A31E8250F403246C487E6D0454084E3CD3AE8250F40513032A5E5D045407E75982FE7250F40CCDC7D23E3D04540B4A0CFC3E0250F4051134D7FDCD045401DAF9146DD250F40D1F23DF8D9D0454086A50B91DB250F40D6BD87CAD8D04540CDFEF5D5D9250F40B47BD88FD7D045408F1D5A7AD9250F4066261DC0D4D0454054C11B5CD9250F40794EFE7DD3D045401986C1F2DA250F4037E93C6ED2D045404C25AEA3DB250F4041296F36CFD04540D98AD7BCDC250F4084EFDCF2CDD04540E0F2D8F8DD250F4021D40B03CDD04540A25D072EDF250F408830900FCAD0454048A2F3BBE4250F400AC4F6CAC7D0454018629B27EA250F40BDB3CB3AC4D045401B602597EE250F40757D5353BDD04540D350A39BEF250F40E1DA35DEBBD04540B7DA1F9FF2250F40E0604760B8D0454011B7A72EF5250F406327F4CBB3D04540813D24D7F6250F40D4AA84F3B0D04540664426D8F9250F40CA80AD6FADD04540722A8FECFC250F4097A7DD20A9D04540C67246EDFF250F400C800296A6D04540556AB3A010260F40AF2F40C7A3D0454090D788E11F260F40E71B5F65A1D045408C20AB7134260F40AB66381C9ED04540C73AE72A4B260F4059EDD5229BD04540438F53FA79260F400ACF728995D045404C5174B98B260F409F8D6C4A93D04540AF2D8EDF92260F403EB0E8E692D045407BA6A72AE6260F404FFD6E168FD045406712B68725270F40B4AC142E8CD045404F4205D430270F403819F4068BD04540788E96AD60270F404944C4F985D04540C9206CCE68270F4010A6B60385D04540BE1C864383270F404CF9103B82D045406A1C8FAD8E270F4057D4E35B81D04540909BACC0D8270F40AAD89EDD7CD0454048FF7DE309280F4076F3C4ED79D04540FB4F86C513280F40ABC1924779D0454060F27FD62F280F40EC9D4D6F77D045405A6C6B0441280F40D6B470C775D045405428A23049280F405A6A84EC74D04540D9BA76D84E280F4018E196E073D0454050A673D253280F404B623C2673D045402DEF948163280F406D699BDA6FD04540D10DE3E46D280F409EBC837E6DD04540ABFAF9B772280F408E47F7666CD04540294906DE80280F401999F65169D04540F37FD39C87280F409046BDF667D04540435750669E280F403C92742565D04540B9938A3CAE280F40EBBC303163D0454062657E72B9280F40447AF8D461D04540C828F89FD8280F40AE2E3FAF5ED04540D1EFBC98EC280F4011F016E85CD0454096A109EF04290F40F67F9CE25AD04540B90CF4FA0F290F4003C81D1B5AD04540AD10955136290F407B881F9357D04540ED48E5F442290F40B60638B756D045408954C93653290F40118447C555D04540BC85585562290F40C88F260555D04540CC00F5A27D290F40F303B54454D04540C507B83CCB290F400C6B136552D04540A5B10209252A0F4015B18F8E50D045400368347A3A2A0F407720D55B50D045401DBBC694732A0F401DE64FFA4FD04540D02ED67F8B2A0F4032B2CFDF4FD0454006D1E49B932A0F40B92F21D84FD0454027A23266A12A0F40B38AD6CC4FD04540F98CEDEFE12A0F40992D90B74FD0454009BF581EEE2A0F401FFA0FB64FD045402924656EF72A0F406540AEA44FD045401E8D997D0E2B0F4024E3096E4FD04540A89498D1632B0F40FC5E228F4ED0454057B358F16F2B0F4019053F6A4ED0454044196E6C43230F40C950EA0ECFCF45407267352085220F4057BD4747D6CF45405CCE0221FC1C0F40712BEA30F8CF4540CA98CD44981A0F404388F65800D0454058041DEFF7180F4032E8230806D0454080CA4F33E3170F40E5FD99760CD04540AC64D89FD8160F401D0F11E413D045402DBDA5C6DE150F40E9E877781DD0454019556B82C6140F40D28A65182AD04540324F7EEA19130F40940DE7BD29D04540E4DAFC7B27110F40C80A2C7028D04540B348A247EF0E0F400BAE5D6D21D04540C4B74F3B01090F4091F4C99A14D045400675B9AD62080F40A569342C15D04540FB3EB4FCDA070F40669F3B0417D04540AB4A7DABE6040F409E490E7923D04540EC0073D3AA000F4082C2286335D0454002C0ED83AEFF0E40AF8BEB0E39D045400BDDFAA872FD0E4029530ADF3ED045403D36258C00FC0E4097A1457D41D04540AF30958B9AFA0E40993AD5F142D04540FF1C1881E8F70E402BE24AD740D04540A5D5E3F33FF50E40E24CF5183FD04540B9E897EA0BF50E40F62F5FF73ED0454096F8B56581EE0E409ED8E7CE2FD04540342F20ABF3EC0E40B9CC598127D04540918712E2C0EA0E40454888D214D04540C6E14E09E9E60E40C29A4A66E9CF4540DF86E827EFE50E40433B891FDFCF45402FAFA13CD8E40E407C6D7C59D1CF4540FA1B4E00BFE00E40242369BDA3CF4540FE18A48E21DF0E4030A455A791CF4540DB0457E330DE0E40C70D8A0483CF45402159B62E40DD0E40FD0DF24971CF4540FBCF14BAFCDB0E40654945BA78CF4540E4CFBED456DA0E4041646CBF85CF4540BC13867B53D70E40C8C6B439A3CF4540BC931A76DAD60E40750C1334A8CF4540B63239A65BD60E40503E9CECAFCF45407F1702CAD6D50E40A1E305C2BECF4540319645BE58D50E4080926D5FC9CF4540DFB54250CDD40E4023A2C607D1CF45404B412462CCD10E40CDC97796EECF45407DEA766BD5CE0E406F19DCB601D04540F08361EA45CD0E40B50974FD0BD045403CF7042C6FCB0E409D22FBE420D04540ED4BADF4B9C90E400A89BC5F34D045401A53FA00CFC60E40239096364BD0454002427CEFD4C50E4046566C8053D04540A6BDF5602AC50E40130432975DD0454051797B8F17C40E40960E5B0974D0454089B9D1769BC30E40F2E0B8837AD04540C545D392A1C20E40110EA14483D04540C84881CE01C00E40C2CB5E5B9AD0454019D47DABE0BD0E403FC5035ABAD04540572A7AF78FBC0E409C9F9547B6D045408B658F542EBC0E40726552B2A1D0454023637CDACBBB0E4029194D1592D045408400351B2BBB0E40C5D5EF1F81D0454056C0A19792BA0E4020C94F7974D04540F59EA65FD7B90E40CA56345E68D045407AE2D51686B80E40EC0DFFAD55D045405475455469B70E40BC46245D48D04540760270FC16B60E4041FCCC183BD04540F3F485019BB40E402E6725462CD04540DFB49F33F9B30E402EA15CEF33D04540A475D769B1B30E40077950423CD045407E99FA5767B30E40DE30DEF844D045407BF7823B35B30E40E0F279AB4CD04540EA1158C848B20E40A8549B8051D04540195BE29534B10E409D8E177856D04540248A1D824BAF0E4015F8C14D5FD045409A2DA9E7FCAC0E40109EE43D6ED04540CAADB88F73AC0E40CACE372073D04540E5DEDA58AFAB0E40F6E2FB147AD0454018102849D8AA0E4053F5C2A481D04540EF36B3E1DBA90E405DF717478AD0454093F2D4EC44A90E40D1C523B492D045401AA9A18CC2A80E405819C7CD9AD045405FCCA8DE60A80E404FDA8F589ED0454007BEEBC1EDA70E40D3DCC4F2A0D04540ACBDEAD97FA70E40AFF33F5AA2D04540B3149620AEA60E40AB562200A5D04540DA57C95B8AA60E4042574FF1A5D045404DB4108074A60E40E8580024A7D045400241E9EA64A60E403FF78DCCA8D04540EEA2AF7D61A60E4037FD3163AAD0454074FDB2529EA60E40D29BF48CC2D04540652C462FADA60E40C42C213BC8D04540A9146B62A5A60E40F739781ECED0454037238AA389A60E400F63F6E4D3D04540D032479966A60E40C7E5A6B1D8D0454013F81C29F6A50E403B7A2B0CE5D0454089398AF2B7A50E40A098A3FEECD0454050FF755B79A50E40D6E90F04F5D045408718301936A50E40490D738DFDD045400AE91431C2A40E4075D69C6A0CD14540CE5D078086A40E406DEC8F9D16D145401113327546A40E40544337061CD14540085734562DA40E4084F554311DD14540D8DD1DC71DA40E40839A9DE51DD145401F94B17CFBA30E406A53367F1FD145403ADCD57181A30E40132E351C25D145400F7CCB6E40A30E40BF28611828D1454046A14277AEA20E408F473FD32ED1454067C0388A33A20E40E0FD8F4334D14540CC2B2752E9A10E40399CA19637D14540C5F7B3E98FA10E408B617A873BD1454083E9E9ECB5A00E404FB10FFF44D14540D8BEAC636FA00E409B01C86D4AD145402C8797F2FD9F0E404EAC866559D145400D342C88809F0E4049CFBDDC66D14540F910B5D04F9F0E40C5F89D036CD14540D9CD940E1A9F0E40ECB4C3C371D14540A4424917019F0E40E633858C7FD1454045FB095C0A9E0E404A2FAB3DBDD145407AB1026A38A10E40FC5C59B8D1D14540ED7FE5F3C29F0E402D44F5A4E4D145403440C2C6B79F0E40408C8D31E8D14540E8DCD884AD9F0E4058C39CFDEAD14540A3D27263A29F0E400A48EBA2EDD145403326E36AA39F0E4006CFF02DEED14540CC8ED7E5A69F0E403241E3C1EED145406DF3FCCEAC9F0E40287EC951EFD14540B90724CCB19F0E409CF2139BEFD1454081D034C7B69F0E40C8E9A6DFEFD14540FCBCFDCCBD9F0E400C74DE2AF0D1454097051A90C39F0E40624B395BF0D145400A0F2C83CA9F0E407BC14377F0D145408D59787BD39F0E40A0AEF98CF0D145408C6CBC76DC9F0E40B3C0C5A9F0D14540E2A04D95ED9F0E405A5E77CFF0D145402FCA675250A00E409F18C7E8F1D145408990F16892A00E40B380C29EF2D14540AC9720D8DBA00E40F7BFCA6AF3D145406184A32D0BA10E404E6B57F4F3D14540A9EEE6E319A10E4093D46A2DF4D1454094E4B3B021A10E4061460F62F4D145401AD3BDDB27A10E40E8B35192F4D1454029B8A1C331A10E40CFB0E6F6F4D14540FE9C00BE36A10E4032C51C39F5D145408FFCBBEA3AA10E40E0606681F5D145402C1EBFF03FA10E40C0DF18E1F5D145409193708042A10E405D37CC30F6D1454093E37E1245A10E40B7656686F6D14540F119E00F48A10E40EADB2BE4F6D145405D1536374AA10E407934C632F7D145405A8F79CF4CA10E40703DB697F7D14540A4706BAF50A10E401AF77F24F8D14540160C5C3557A10E4083A16D38F9D145404F61B72562A10E4022F22C2FFBD14540F71A604271A10E40BD96046DFDD145408975CD2F78A10E401994AC7FFED14540F25631EC7FA10E408806CF8FFFD145407D805E1A85A10E40AD3EC85300D24540AEC24F538AA10E40E515E33201D24540167E85B490A10E40D78ACDEA01D24540649BC1769AA10E4084B1CAF502D2454098ADAE19B6A10E40A32B7B0C06D24540E78407D8C5A10E4096628BD607D2454002EECF38CCA10E40076C488D08D24540120AB3B1D1A10E40A0000A0809D24540264E7072D8A10E406D4FA3AA09D24540B4D7CFC1DEA10E402476BB350AD2454026D238DEE5A10E40D7B092B90AD24540B61AB4EDEFA10E40740F3D810BD24540EA5D5554F8A10E40C7C7D4320CD245402127F4DCFFA10E40DFEF35C10CD24540F9D3974905A20E4006E7471D0DD245406BD5ACB60AA20E401F218B7A0DD24540516519A312A20E40C57F39FE0DD245405ACD0FAB1CA20E40E9EB01B30ED24540FA4FC29724A20E40E6C4DB370FD245404F4642AD2BA20E40894A02AA0FD24540EF4EC1F231A20E40F283551C10D245402C5F8B1C3BA20E40AC61E7AD10D24540ACFA349D42A20E401730392811D24540FD3FAAB149A20E4050FC029811D24540BE14E39751A20E409388590C12D24540C7BDCCEB59A20E40E130C28E12D2454097A90ED086A20E405FA4A81D15D24540712E4C029FA20E40E97F92B516D245400C353521C2A20E40B05E003619D24540501FC19CF3A20E4039CCC4171DD245407125951530A30E404B21570B22D24540399A1A7065A30E40B1AC5A7626D245409EC00B5992A30E4033F0A4142AD24540778CDEC2BAA30E40323FFFA02DD24540EB43107CE1A30E4086523D0331D245407E9CA4E206A40E40C9317C2234D2454087B1E37E0BA40E408C4F8D7D34D2454054F0E96D30A40E40D215F57537D245409B7CFEDD4EA40E40B831EA703AD24540573B6A476FA40E408CC3DE463DD24540D60AE5478FA40E40D2D98E1A40D2454095A9D331B1A40E40BED8EBA543D24540612E44E8DAA40E40ED60BD6447D245409ABAA55FFEA40E400E15C1C14AD245406BA3A18831A50E401AA3CBC74FD24540675B444F61A50E4009353F7754D2454047D6C6E88CA50E40775700E259D245409FF007399EA50E4034A0F18B5CD245407F8340D1B2A50E401C90054E60D24540B0E14563DEA50E40127EE6B168D24540AED28C5BF4A50E408A12FED76CD2454018956BF439A60E407F83D9286CD24540D6461D7944A60E4067FCAC0C6CD245404EE5517755A60E4052BFF7E06BD24540A13AE7C7BDA60E40C58C58A66AD245400D775B301FA70E405AA0D06A69D24540BC4487803DA70E403B5B610869D2454060A6AFC0F9A70E40942B346866D24540095B83435CA80E40129345E364D245409C048DB2B6A80E40738B5B7C63D24540569AFE10F6A80E40E2E9317762D24540FE32851F41A90E40ACE6843A62D245407870CBD4CAA90E40FA07CE2D5FD245409308A2611FAA0E40EB74DC495DD24540C5FA3C9D5CAB0E4051CD141E56D24540E2F3820FDFAB0E40A0ABBB3253D24540C48AFFE20AAC0E408241D21152D245408D0D199DE0AC0E40D3D0EB224DD24540E7122E5F78AD0E4024958AAC49D2454006B658661DAE0E40B894C0E045D2454088DF172D35AE0E40EEB8E96645D2454010B830CD99AE0E40E169571543D24540616FCBBD0DAF0E403758307640D24540627B6F8648AF0E4091DB9F273FD2454018BC50A25AAF0E4088B2C8BA3ED245404027A3286BAF0E40EE167A7B44D245400120DFB844AF0E405EFF16E847D24540ACF84A4B3FAF0E401C90408D48D24540B1A65CAA38AF0E40872A7B3E49D2454026EC671436AF0E40427E0BE349D245408A82439F34AF0E40BBFD8E4D4AD24540E13CB05E32AF0E404F3909C44AD2454021FBD3B131AF0E40E2EC7D1B4BD2454055114EB030AF0E408D6767A34BD245401B587FE933AF0E40034BCF954CD24540EEA9FCA13AAF0E40C03B2C234DD24540DC431CBF44AF0E4069BCDA0B4ED24540CF85A15A49AF0E40F41C90644ED24540EE8E0F216CAF0E4062C26D0851D245402CC34FE177AF0E4005F207F951D24540C9CF566B80AF0E40C265E70153D24540A12DA97582AF0E4051C9FA0A54D2454087B918947FAF0E40C91468F654D245401B998E2C79AF0E4050175D3656D245407C8BA0D364AF0E40F7D4272959D245405CB4B9394CAF0E40FA68839E5AD24540320D76D932AF0E402841A52B5CD2454008DAD3EC25AF0E403537CF5E5DD245403266CDD421AF0E405BF3094E5ED24540DF25748A1FAF0E401247BFAB5ED245404F1151481FAF0E40BB9ACE0D60D24540D32F579A20AF0E40D1CC055261D245406DC382E524AF0E40D465CCE561D245404D44C6A029AF0E4079DA8B8D62D245408B9EFCCB2BAF0E405EBB94E562D245408694A0F734AF0E407C95AE7A63D24540A91D089C40AF0E40F7BAAF2564D24540AFF6E46646AF0E402503E76864D24540D23D4C0860AF0E40082C978465D24540A6C9DB146EAF0E40428F331C66D24540212B3C0178AF0E40A871628B66D245404469D32388AF0E40D5C0F34567D24540C909ADEE90AF0E402B94D6EC67D24540FFFB80B397AF0E40604CDD9868D24540F2677A1498AF0E40AA13B18A69D245400B721E5795AF0E404EBBF8D66CD24540BCBC502297AF0E4056CC2D496FD24540C6CCCC8997AF0E405FEE824B70D24540BEF7121A98AF0E404A3A4CB371D245408CCE400D99AF0E4043E59E1174D24540750E44B397AF0E40F1C190C676D24540ADBDC99296AF0E402956D50779D24540656D298394AF0E40F33468FB7AD2454091D0DFEB91AF0E40516309A07CD2454066E77D1F8FAF0E4032878EC07DD24540C3E7EDED89AF0E40E0C188FB7ED24540D368A6E883AF0E4089EB3E2D80D245408EB2E80A7DAF0E408C32E74981D24540E8FD1A0E78AF0E402C72660582D24540246442C275AF0E40E3B1915F82D24540D89D859766AF0E405CCF1E0F84D24540A9799F2C58AF0E407251629685D24540DF34D1EC4FAF0E40A49E4F4A86D2454000E3EE8E44AF0E407A44AC5287D24540056D85392CAF0E40373F137389D24540C5464BF835AF0E4001B571738AD24540A7BFC4365CAF0E407C7F689F8CD245406BD27EB56FAF0E4037B110A08DD2454034EEDECE9DAF0E40EBA9DD2290D245400EAC9A54BBAF0E4093A0C3D491D24540FC275B96C6AF0E40294CD48C92D245407C12DC6EC8AF0E40B07B091A93D24540F1995952CAAF0E40903662C293D24540C1C7FD07C8AF0E4080A9152094D245409DD2E778C3AF0E4053F9A6E994D245403123A5BAA6AF0E4091E12C3398D245402429387796AF0E402F55D4309AD2454019CE3C0C91AF0E401F3214DD9AD24540DA0E9C3E79AF0E40F60508509ED24540708EB02073AF0E40989A6A449FD245408A0931A96FAF0E407A1781BD9FD24540724291AC6BAF0E4060BB25F1A0D24540A160EBEC6BAF0E4082C49291A1D2454011BF731A6CAF0E409FC6D002A2D24540F3ABF5DC72AF0E40A496F4A8A2D24540ABD672DD79AF0E40A49D03E6A2D24540D9FF071484AF0E405971CB0AA3D2454066303983A3AF0E40D7212C6DA3D245408BB1FAEABEAF0E40B0CE74E4A3D24540D330705FD3AF0E4027EDB63FA4D245400ADCB28616B00E408A9C5792A5D24540BA37A8161DB00E40543B42BAA5D245408229AA2046B00E40C37258C3A6D24540A3AC9EC265B00E407FDCEFA3A7D2454007D137B681B00E407E3BC874A8D245407B047FAF8FB00E4052F907DCA8D24540BCB9C230B9B00E405A5FC70AAAD2454000D06E34D9B00E403825F4DBAAD245407D4FB925F9B00E408E371F7FABD2454079A8194145B10E407ECBA5DBACD245401A44C5EA58B10E40037F0B44ADD245404A3146E46AB10E408DE08083ADD2454002A9012798B10E407AEAC1EEADD245405277B3E7B5B10E40A0BEE62CAED24540CA1FE654EDB10E40E237419EAED24540A4FA9DBBF2B10E402DBEFDEAAED2454051712F07EDB10E401246D4E2AFD245404B14C778E7B10E40D5549936B0D245407A7BED55E0B10E406C3109A7B0D24540D2B0A09ED7B10E40B6201C34B1D24540F9915D20CEB10E407808C8D7B1D24540ACD0D74BBEB10E40514973E3B2D24540E7AA2682B4B10E406614FECDB3D24540887A0709A6B10E40C41BDD31B5D24540B63A19619FB10E40B27D65D1B5D245407DF594978BB10E40FF749723B8D24540E37F838674B10E4092F60266BBD245409F12F36A68B10E40A856FA9EBDD24540CBF7B6535AB10E402DEA09F7BFD2454055F6A43854B10E40760F7FF2C0D24540B8CC274D51B10E404AAE27C5C1D24540261CD00D4CB10E40C054ECDDC2D245408F4BA1CD49B10E4009B50158C4D245407B18B9244AB10E408AC00E31C5D24540322D23214EB10E40DCAD6E03C6D24540B98EE88157B10E403A4AA61CC7D245406CF0CCE75FB10E4076ACB1CAC7D245404006D95A65B10E405D031A36C8D24540FA64A0C16DB10E40101F82E6C8D24540B524060B76B10E40BBF8C64DC9D2454035F99A517EB10E400E93F7ADC9D245405EB0F55C8FB10E40D8E5B4A5CAD24540563B3CB59FB10E405C0F93E5CBD24540F00A458CA3B10E40BC51C25ACCD245405737AE65A7B10E40BA6BD8D5CCD24540087F17CAAEB10E406961CD0BCED24540B6F3DDF8BAB10E406FAE410FD0D24540660F0AEDC6B10E4086946B80D1D2454060CE5909D3B10E407C304352D2D24540B2218643E8B10E408F6EFE96D3D2454027AE1BD510B20E405A684B79D5D245405BB67A5D45B20E40E8263FD0D7D24540208BB51355B20E403A731A7FD8D24540CDEC48B378B20E40FE516D34DAD2454025DD53C586B20E40661604D9DAD2454035E7B1E896B20E4097EFC394DBD245403ACCCBC3AAB20E408831D877DCD24540A127B10CC3B20E401A303441DDD24540E75868F0D7B20E40955411AEDDD24540FB353B1AF2B20E402BFC4516DED245408D7489B61EB30E40D47B50E8DED2454033C7A89D3AB30E40DC4B5099DFD245403DBFC61B4BB30E408BFCF033E0D245401824E5C451B30E40DD22609AE0D24540D06CA37B60B30E404C3FDED5E1D24540E94BEDF365B30E407D9F3D4EE2D24540855F1F7A6EB30E401826824CE3D245408354FE597DB30E40A7009EEEE4D24540F2FAF1F588B30E400B5BCD86E6D245403A9EA9EE8FB30E401D8D69B3E7D24540D69598F292B30E4048271D24E9D245408DF4F60E94B30E40EE6AE2E7EBD2454082D91E8996B30E40C99B5607EED2454035AB8F96A1B30E4090B87C42F0D245401FE5F318B6B30E40CD2FF8C5F2D245404F4AA055C8B30E40A4D35BAFF4D245409BCAACC6DBB30E40E1773890F6D24540CF02037FF0B30E40047C9596F8D245401BB7971900B40E40E1567003FAD24540C8557A8A07B40E40E6BD1258FBD245409D979EA60BB40E4061BA7A79FCD24540D1EE6C2F0BB40E4044E23E56FDD24540125A6EF908B40E4074B8ABE6FDD245403F96CAEE07B40E40EEFC985AFFD245404D82A9E40AB40E403852E9A700D34540882C781618B40E40DDBAFB2602D345402143D31332B40E40C827BF2805D3454068AAB9E240B40E40635C63A006D345409B1B108B4DB40E405A8FCACB07D34540553873956AB40E40C1B0A64E0AD34540DD72FE877AB40E40BD1752930BD345405A2BC58D8FB40E40467D87570DD34540300EA4AF99B40E40BA97D34A0ED345404C7FF1EBA3B40E404EBD2E800FD345404B6EDBE3ACB40E40896D8B9911D34540601C6F5CAFB40E404E4CDEB112D34540B5115AE6B1B40E4092A5ADFA15D3454030D3ED8AB1B40E408628071D17D345401B7E6735B1B40E40B1FF91531AD3454087E06E48AFB40E4075BCAD9F1DD3454042139DC6ACB40E40176B65791FD3454087682D1CACB40E408621C1D61FD3454045C23A86A6B40E400565AF1D22D34540303A033F9FB40E4069BB503924D34540BA4A02B099B40E40C984548E25D345409964359093B40E402279FC7D26D34540FDC6FE298EB40E401AB8083627D34540EE4EE4EB87B40E4086A730DA27D345409B2942137EB40E40B88129A028D345406ABF1F7E6FB40E406D3074BE29D345404883223963B40E405CBF2F8D2AD345407CC799AC5DB40E40FD7CB0E52AD34540D857B97145B40E409B83BB452CD3454017E6B2AB23B40E4047B09B292ED3454065143F7BFDB30E4005D4732F30D3454024574EC714B40E409458598B31D345404041F3834FB40E40DC2C992634D345408B6C434D6CB40E40C9D23D0435D3454091B84F4976B40E4076E82B9935D345406FE0029D95B40E40ED7B5CB836D34540F79F78AFBAB40E4035EF19FC37D34540AA43824DD4B40E40538C270D39D345408010ADCD01B50E405ED6CD113BD34540A521830936B50E4079ADE2AA3DD34540599753674CB50E402BAA74BB3ED34540044D859457B50E40BFDD9B3F3FD34540A366796D7FB50E407688AC543FD345402C1AE20CC7B50E401BD6CFA842D3454047228E201BB70E40480AB2812DD345404EAF689D86B80E4088776AF915D3454047F9ED8FEFB80E409C69CF380ED34540458735666EB90E4091CFC25404D34540849D3598E0B90E40E9AAF055FBD245402D38E10013BA0E4016A66D61F7D245402BD311F68ABA0E40F4F3188EECD2454084FAF2EDD1BA0E403C499D2FE6D245401EC796903BBB0E4018EB5E3AE8D24540FF513C5A14BC0E40D5EC50E3EBD2454075EF4C6A19BC0E407591985AECD245402DD8898C8DBC0E4006BE2D3CEED24540F28CD6DAADBC0E40B670ECC2EED245401CA24B8A9CBD0E40BAAA3153F3D24540843F9EAC5BBF0E407490B501FBD2454062BFCFDD9BC00E406935093401D34540B8E3AE295CC10E404F2AEF9105D3454008C12E07CBC10E403D51BA7B08D345405B4652A1D9C10E40F6F2D26C08D34540C847EF4500C20E40FF4A8B8B08D34540F3DDEC2210C20E4056AC839708D34540AB0B48592CC20E403A62E00909D34540076FBAAE29C30E4053351AA50DD34540C1F698C975C30E400798A2FB0ED34540EBCB566A63C40E40FC4B8EEB12D34540859A6E798FC40E40BFBA045E12D34540F0336D5E3FC50E40D6760C5010D34540C5F95C9E70C70E40FDB677C609D34540B879F5835BC90E40747B661404D3454085796EEF70C90E40C8B4C0CD03D34540E5503F8CC4C90E4068B7C4A40AD34540A1E56C4F4ECA0E40956AECC814D3454091146A1952CA0E407675131D15D34540BFBC824654CA0E40E760A77815D345401260D5B375CA0E40E731DCC61BD345401FB300119ACA0E40A7FAEB5124D3454090E2D95AA0CA0E401EB035D027D3454028488129AACA0E4076EB28FA2DD345400E3BE8C8CECA0E40BB3B2F1F2ED345409459F483F8CA0E40F32492D62DD345402C6E55B00ACB0E40AC74CA912DD34540C64B79CC40CB0E40200D31C12CD345409550346457CB0E404F1CCA5C2CD345401EEE7B02A2CB0E40F4B47F082DD34540ABE7D7DF36CC0E40B9203B752ED34540310BA33F64CD0E4032DDCE4631D345404A14A9FBE7CD0E40A6EC268932D3454012745208F3CD0E40E91DE6BB32D34540F316B9E3FACD0E405522B81233D345401A3C609C21CE0E4017D7B76A3ED34540287AB8566FCE0E40906B06CE55D34540A2F6C12778CE0E4095422B8358D345406740A3A37FCE0E40EDA350EF58D34540D5763FA4A0CE0E40D6EA952B5AD34540979C8140DDCF0E4022AB967E66D3454098AC63EFA0D00E408F6C74286ED3454008A09D7069D10E4045A501AB6DD3454039CDF4C0E5D10E4033C0F4A267D3454065F5B50364D20E40F82E3D655FD345407FC5C1B172D20E400585A0865ED345407A2D3FB50FD30E40AED489FB55D345400F19404B17D30E406CC04FA755D3454073BA298A20D30E40BFDE266955D34540AFFD6ABE34D30E4051ACF02355D345407ACFFDA94AD30E40F3072B1855D345408AF79B7492D40E407A25BAE955D3454024B8AC99FCD50E40C92FC34957D34540CD555F1F3AD60E400A9C52B757D34540652D346C5AD60E40D3371D3858D345409057C91173D60E406AF3A6E258D34540CD1A042388D60E407D432CBD59D34540DADE6E858DD60E40787819FE59D34540244C9EB3A0D60E40AE7BE0335BD34540942A7976AFD60E408C8F47895CD34540012B35B6ECD60E4076890B4B63D345406ABDC683FBD60E407BC266BA64D34540FE735B250FD70E4097EE650C66D345405C506CB913D70E401EAD0A5166D34540CE9B134D32D70E405A21B89367D345408A2EB87554D70E4016049DA768D34540C23401B565D70E4081EF191B69D345400AD2FB1AA8D70E405835D9886AD34540CCDFF1B9CBD70E409326C3356BD345407DB81EC423D80E40909508E86CD34540653344C13ED80E40D6B7E4556DD3454080EE8EBFCDD80E402810464A6FD34540DB2AF25FEAD80E403C6A0AC06FD34540C2F1C9F6F9D80E404A24A51E70D345408D4D99880ED90E404AF870BF70D345405CCCC3EC1FD90E40D842C18D71D34540D8DCDDE42CD90E40C401577972D34540B81DB6D39BD90E40075830827ED34540F60B86C0E2D90E4081DBBA1286D34540B7D7EC0F04DA0E40D452360E8AD3454081CE48718DDA0E40B000C42C9AD34540924410CFCBDA0E4016AC14ABA1D34540	HO	HOPITAUX-FACULTES	media/layer/quartier/hopitauxfacultes.png	http://hopitauxfacultes.montpellier.fr/
2	0106000020E610000001000000010300000001000000190300007B57EB7A19970E407BB013BF4ED245405EEECFBF03970E40E05913434FD245409AB0744BA0960E40F0EB447A51D24540E86FD4932B960E40E57BB33554D245407DADB698B1950E40B7F5DAFC56D2454089F72619A3950E40A87AC54D57D24540780AFC6295950E406E21028E57D24540C930DD1F7B950E40BC0CA6E957D24540A2CF531262950E40BB2D243F58D24540A42529084D950E408ECC1D7558D245409DF03FF233950E40342E5DB558D245405246139E1B950E405E9F10D258D24540138C095405950E40968E3DF458D24540D6294645E7940E40139DD1F558D24540F597DA92D4940E40BB631DEF58D24540C5A540A4C2940E4093CF92C958D24540C11C15DBA9940E40A6CE53C558D24540E26578C198940E40A3C797AC58D24540DB9EDB0E96940E40CF5C5E0A59D2454079BE2B7827940E40FC0994CC58D24540423377332C940E401DBECD6456D24540D950719235940E4045FC3D6052D24540854251613E940E401BE145FC4ED24540CE14C57546940E40869DBBCE4BD245404E564FD340940E40760755D446D2454080443BC43C940E405098A7C543D24540327F898336940E4044DC285942D245409D9C1B142B940E40A9B3562640D24540F6C0283C1F940E404A776BF23DD245405EC1030D1D940E40223DC18F3DD245407E7D2FE503940E4027328D8638D2454087D9FFBAF2930E400F0AA63235D245400BA7C228D8930E409B03FBC033D24540469648899E930E405B2B4ED630D24540549C508069930E4047118D382ED245407CC7FA4264930E406CE0B9412BD245402395A6DC5D930E4016F4EF6A27D24540150BF3A23F930E401919F40528D245409E56C97AEB920E40E2E3C4E329D245403FDFEEA28B920E400990DDFD2BD24540078684064D920E40311E84E62DD24540127FEFA40D920E405F7B78EA2FD245408807A910D7910E4009429E9731D245408597FE3AB2910E40CB36FBF132D24540E59F115B7D910E40E929B2D234D2454018596DEC64910E40AA1A1DB235D245408C60CFE450910E405B444F6736D24540A4139C7244910E40BAFDF1C536D24540719CBA0636910E409400694837D24540CAAE05C1D9900E40F0599A323AD2454049E752735A900E40639394D23AD2454019E008D84A900E403018A45838D245409D86B8C415900E403D93FA7B2FD24540B51D93EBD28F0E40154484AB24D24540BEB30DCBAD900E40D671667523D24540861CA97CD3900E40F42D7D3F23D2454099D1DD710D910E407AC061EB22D24540E327D63055910E40EC59948822D24540D53DE83C5C920E4018C98D1021D2454066FC2D2072920E40923D04F220D24540AB370CEB90920E403953B9BE20D24540E487B47C1D930E407B6526AF1BD24540CB45375F5C930E405BB2797119D24540D038E971A0930E40B612E4F816D24540E1ACE753DF930E40736509BA14D24540B93FDBFE16940E40DDA50CBA12D24540AFC415FF1E940E40FFA2806A12D24540D9254C725D940E408D77361B10D24540429761E16F940E4034423A790FD2454009E1429298940E40FC5E0E9B0DD24540911B0D68D2940E40862727ED0AD245404556C87C0B950E4018222E6508D2454000AC829F1A950E40D6C204A407D2454043BDABFE66950E40E4E5289C05D24540F08FCF76A0950E402DF03E0E04D24540D573257CA8950E40CBECA9CB03D245403F1D13DBD6950E403F01FDE300D245404F11FFBBE4950E40FD5B4F0A00D24540903727880F960E40A8BC425DFED1454030166EB54E960E40C79088D7FBD14540A35448198D960E4024E87D62F9D14540D06FEAE4C9960E40C121A800F7D14540118EFCE105970E4060BF88A2F4D1454080E1500A69970E400BA9D0A9F0D1454031FF0237C2970E40237CBF1FEDD145402419D18FFF960E407C23BACEE7D1454084C425FAD1960E409282118FE6D14540D281D0BB35960E40536857D5E2D1454043773719E4950E40193D18D1E0D1454096E6CF17DD950E40C9EA7990E0D14540C9E7D1CF02960E4029B15460DED14540C2EE286047960E40FE384E1ADBD145404B43AE95BC960E407FA9408AD5D145405889705804970E4058898422D2D145402846827A4C970E40280877A5CED145405B58F87093970E4001B15747CBD1454045C9D2C4DA970E4059892DCFC7D1454086E2643704980E40D4CF9ECEC5D14540623ACB44E9970E40F9E62A65C2D14540418269B34D970E40FBA2E346BCD14540D41C7A32BD970E4028EE7EA7B6D145403385BC18CC970E409CEC2054B6D14540DB32D07B74980E40F23F98B5ADD145404D264690E1980E4011BCA74EB0D14540F8EFA8142A990E400A50CDDEB1D14540B5A529ED009A0E406BBB1BE7B6D145401AF9BE02F29A0E402FDD638ABCD14540B59270CD159B0E408596A2A8BCD14540A83B5807059C0E40EC793BB5C1D145407EA89B01159C0E404AE9BC0CC2D14540A580BA5BC49C0E40D9A4BAD1C5D14540492581EACA9C0E40B2D14AF7C5D145402855D1D3ED9C0E40E534D6EEC6D14540E20C7A060B9D0E407307B4D4C7D14540EB934E03679D0E404EF55B57CAD1454095D6642C849D0E40CE0FA225CBD145402BB50E268B9D0E40850E3052CBD14540640AEDC6B59D0E40A0134A49CCD14540E6233CF5CF9D0E40A645AFBFCCD1454024C62B59E29D0E409A5C5607CDD14540297351AF019E0E40E92F2737CFD14540A7916D0A0A9E0E40127670CCCFD14540D6879FCB3B9E0E4007D5625AD3D145401906FD24449E0E40028CF4EAD3D14540DCB1EF90499E0E402069DB45D4D1454034044EBC4D9E0E40231A9B8AD4D145409966A9BC529E0E400B4F27DCD4D14540AF5D158D5A9E0E40A62D3B1AD5D145403DCDBBEC5D9E0E405AEDC369D5D14540D534164A639E0E40994816A0D5D14540EEB1AEE4699E0E40449824E3D5D14540F6394FB2719E0E407D25261AD6D145406AAA49CA7A9E0E404F4FE67ED6D14540DA08ED20859E0E40913114F5D6D14540CF85213EA19E0E40968F4E31D8D14540AF76BFEFC39E0E40C53843A1D9D14540AA45065CD79E0E4071404C76DAD14540DD3C33F6FC9E0E401D011C10DCD145407F44FD3E779F0E401BA11334E1D14540C4159FD7829F0E404C25C5C2E1D145405B0151BD919F0E40E3B3FF72E2D1454030627C11AF9F0E4096B59DACE3D145404E665655C39F0E4026AB5B94E4D14540ED7FE5F3C29F0E402D44F5A4E4D145407AB1026A38A10E40FC5C59B8D1D1454045FB095C0A9E0E404A2FAB3DBDD14540A4424917019F0E40E633858C7FD14540D9CD940E1A9F0E40ECB4C3C371D14540F910B5D04F9F0E40C5F89D036CD145400D342C88809F0E4049CFBDDC66D145402C8797F2FD9F0E404EAC866559D14540D8BEAC636FA00E409B01C86D4AD1454083E9E9ECB5A00E404FB10FFF44D14540C5F7B3E98FA10E408B617A873BD14540CC2B2752E9A10E40399CA19637D1454067C0388A33A20E40E0FD8F4334D1454046A14277AEA20E408F473FD32ED145400F7CCB6E40A30E40BF28611828D145403ADCD57181A30E40132E351C25D145401F94B17CFBA30E406A53367F1FD14540D8DD1DC71DA40E40839A9DE51DD14540085734562DA40E4084F554311DD145401113327546A40E40544337061CD14540CE5D078086A40E406DEC8F9D16D145400AE91431C2A40E4075D69C6A0CD145408718301936A50E40490D738DFDD0454050FF755B79A50E40D6E90F04F5D0454089398AF2B7A50E40A098A3FEECD0454013F81C29F6A50E403B7A2B0CE5D04540D032479966A60E40C7E5A6B1D8D0454037238AA389A60E400F63F6E4D3D04540A9146B62A5A60E40F739781ECED04540652C462FADA60E40C42C213BC8D0454074FDB2529EA60E40D29BF48CC2D04540EEA2AF7D61A60E4037FD3163AAD045400241E9EA64A60E403FF78DCCA8D045404DB4108074A60E40E8580024A7D04540DA57C95B8AA60E4042574FF1A5D04540B3149620AEA60E40AB562200A5D04540ACBDEAD97FA70E40AFF33F5AA2D0454007BEEBC1EDA70E40D3DCC4F2A0D045405FCCA8DE60A80E404FDA8F589ED045401AA9A18CC2A80E405819C7CD9AD0454093F2D4EC44A90E40D1C523B492D04540EF36B3E1DBA90E405DF717478AD0454018102849D8AA0E4053F5C2A481D04540E5DEDA58AFAB0E40F6E2FB147AD04540CAADB88F73AC0E40CACE372073D045409A2DA9E7FCAC0E40109EE43D6ED04540248A1D824BAF0E4015F8C14D5FD04540195BE29534B10E409D8E177856D04540EA1158C848B20E40A8549B8051D045407BF7823B35B30E40E0F279AB4CD045407E99FA5767B30E40DE30DEF844D04540A475D769B1B30E40077950423CD04540DFB49F33F9B30E402EA15CEF33D04540F3F485019BB40E402E6725462CD04540D05965CE34B20E409839B79815D04540CF119609EAB10E4014420C6C10D045408FFB8BD6DBB10E408DE9A65506D045406A4C1D9FD3B10E408428D31204D0454059AB6C60C0B10E401D11D9A701D04540D1FE8898AAB10E40E45D1E0000D04540F9D6B4478AB10E40E2279967FECF4540A7FEFCE368B10E404C4C562BFDCF4540965A631A3FB10E409CF14542FCCF4540BE53EC09F8B00E40E4EAB940FBCF4540710006F6ABB00E4042B7F9E8FACF454074A6135B50B00E409E8D3557FBCF4540E915EDA92BB00E405F97D8FBFACF454058C095C30CB00E4086CC47E1F9CF454074E846B2C4AF0E40BDEC315FF6CF45400966C9D48FAF0E402D585423F2CF4540A1C8F1EE79AF0E40D3887626EDCF4540D595518589AF0E403AF3F872E6CF45405924F40DCDAF0E40DFF70E99DACF4540894FAD9A1AB00E400390DA72D1CF454007F4EA234EB00E409EF1BA47CBCF45403C3789A370B00E40D0267B2EC7CF4540D10A939A82B00E4044C6885FC3CF4540AA5DCA9688B00E402C9EF40EBFCF45402D0BE46582B00E4053D8BDC5BBCF4540566F621961B00E4012C979B8B7CF45407E0594A236B00E40CCDFE31AB4CF45409D82FA76FEAF0E40CBF390BDB0CF45405F4A4BCD8DAF0E40400CB341ADCF45404284DEB4FEAE0E40BA24BADBABCF4540A5CDD94480AE0E40498B187EABCF45402A3697EF1DAE0E40C784B256ABCF454003FB740BDCAD0E40B439990FAACF4540FFD30441B4AD0E40AE2CE204A6CF4540B11B5B6E84AD0E40C8B584289FCF45403E7827ED4BAD0E40F93B14E696CF4540F77CACC5D4AC0E405C85524C8ACF45403923AA91A8A90E4040CD37805DCF454099C0D3B298A90E402B09995758CF4540648C8DF452A90E40419CB86C4DCF4540294FB5DB2EA80E40602E05992DCF45407495BFF56FA70E40DF41082F1BCF4540AD5370456BA60E40F0B251D204CF454008D0423CCBA50E40AABF1982F9CE4540D053DA17EBA40E40B3D6593AE9CE45408FB7CC981BA40E4054B7B0E6D6CE4540D22DF6210CA20E409521AA1BACCE4540CD92AB5F25A40E40E9B47053AFCE4540F7D63AF347A50E4040A24802B1CE4540D7D4389035A60E40D95CFF3DB2CE454053B02F178CA90E40D045A9D1B0CE45408B1C3A7F54A90E402830244C88CE4540226597AD62A90E40F36772077BCE45404E33CA8779A90E40380CEB226FCE45407EE93839EEAA0E40FCA5694437CE45400D7058A9B3AB0E405CB27A2319CE4540563A3A8D23A90E4016D1EE2E1FCE45406A762C49C3A10E40C01505AF37CE4540482A1F02599E0E4015ED8D8142CE4540AA8405B0809D0E40A8DA80BE44CE45404B6902957D9C0E405FAD0B9946CE4540EDC56EFD979B0E40A6C63F1E47CE4540601B34FAC99A0E40EC367CB246CE454078CE92D0449A0E400D6A12B245CE4540F1F4E031C4990E401ABE7ADD43CE4540B224C399F4980E40A322AD773FCE4540CC27EF2819980E40EE56C9E23ACE45403467D89F6A970E40700DD8EA36CE45409C34715973960E403F6E24A22BCE454060189F0700960E409DEDF36B23CE45405FE790E1B2950E400D00853F1CCE45404A8C2BD62D950E40FC71564B10CE4540CC6DC0B3A7940E40F348199801CE45401AFF42D785930E4061AB7B41F0CD4540079CD794C3920E40A197268EE6CD454091D19A2CEF910E40E5A3BA2DDECD4540E78957F0DF900E40654689D3D2CD4540BAFEEFAE24900E404F18576ACBCD454038BCB1D13E8E0E4007DFD23DBACD4540BE26B14F498E0E406A38B72DBECD45402FDC34BD4A8E0E40B0D71FB5BECD4540E345C1E2508E0E404F969DF2C2CD45404C392749558E0E402F365DCEC3CD4540990BC888808E0E40E087CC77C9CD4540F0ECC1E4A58E0E40EBEDEFBAD3CD4540CE9DD71FC38E0E40A258B4D9D8CD4540CAC6BB6BD98E0E401E5684E3DDCD4540DFF850A7DE8E0E40900514E5E2CD454079AAAFD4C28E0E401CBFA38AEACD4540E9B1006B418E0E403F81F95001CE454052A862E0AC8D0E409D1F5AEE15CE4540C374CE88B38C0E40B88DF27D33CE4540C54CFA3E048C0E409D65C24048CE454021FB89B3CC8A0E4015895D9C64CE4540CA94A5A07B8A0E4073CCBE296ECE45404120A25D828A0E408052816287CE4540566609A84D8A0E40620CD7069ACE4540AE92838CE9890E40105F26E4AACE454007049667BA890E407199FB3CBDCE4540795CCF6FBF890E40EAAAE9AABECE45407E8D7E72B8890E400B94A77FC0CE454066202C8C96890E4082ED5626C6CE4540F1BE751793890E40C27D80A6C6CE4540007D525F66890E40D01E4EAACCCE4540E7E5F1A850890E4043734A41CFCE4540F9FCC7A128890E407AE153C9D3CE4540857A060A00890E404323D4EAD7CE454030E35BADDE880E408F4F4BD3DACE4540B9AA6D91BF880E40EA474C45DDCE45402DC25EB182880E402B724A73E1CE4540BA1AF3B011880E40285FAA52E8CE45407E245CC1CE870E403E4ACC94ECCE4540CB2D86EB8D870E40F0778404F1CE45402915672F36870E40EC848D19F7CE45401CADDCABF2860E40868307F4FBCE4540A58E5A09BD860E40E70135F7FFCE454093D092277A860E408D41DE6305CF4540CCFADF2C3D860E408501115E0BCF45401D216950E0850E404D0C6DDE12CF4540D9F32879C5850E40312A46D114CF4540339CC95A99850E4005B92C3A17CF45400322CA1854850E4071982AC11ACF45400B6A868218850E40F94E1B181ECF454046041A99E2840E406829286921CF4540AF2E2FFE9D840E4061867B9025CF4540DB4D686E6E840E40B271FB8228CF4540B2DBAB8C3C840E4068604EC02BCF454008B24AC328840E40BA28D50E2DCF4540D08032EDD7830E40C4007C1631CF454025BBD90791830E403BB18C9534CF4540AE6979106C830E40EAFAD59936CF4540C1DBF1BB17830E4024960D0A3BCF4540F7BFE18AEE820E402618D7A33CCF4540D184416E9C820E40E066E2783ECF4540EE5429797D820E40ECF9DA403FCF4540256390436C820E40EE7DBDE33FCF4540E733A6F448820E40E37D1BFE41CF454066F3019E3F820E4019E0020643CF4540E4D5BEBF1C820E40F285FA4447CF45408341E0D2FC810E40082746BE4ACF4540C6FF2171EA810E4096090B864CCF4540505AA083CC810E40CD6D89E24ECF4540F2ECF994A6810E4023870A8B51CF4540C61F827D99810E408268D55252CF454059FB558981810E407D9D995C53CF4540B6A88A596C810E40EABC683554CF4540008A28BA4E810E40816ECD4955CF4540F49FB1123B810E40FC6E4BE755CF454070F2D6A71F810E407B335D6556CF45406AD6B58802810E40B906DFAF56CF4540EC6D28F7E8800E401971BAB856CF45406BBF6B20CC800E4057BDF0B256CF4540B88F8651C0800E403298CC9D56CF4540928F05A24B800E405B2EC63755CF4540B00BDA571C800E40ECA6A2BE54CF45404B9EBD60EE7F0E40A38CD78A54CF454051B9E6F8C67F0E407B87FC7E54CF45405AEADF81B37F0E40E1AF049054CF4540254D0288A47F0E40637675AF54CF4540904CEC30937F0E40BA6966FD54CF4540CA143A80817F0E40DBD9017055CF4540F07F5F0F717F0E40D23D6AF655CF454084F065A9667F0E405AF20C5E56CF454010B28C1C5B7F0E4050306BF056CF4540B124D47D447F0E404FD26D4558CF454097997721247F0E40DD27C8A45ACF4540B47EB275017F0E40FF8D0B565DCF4540DED7A8F7ED7E0E400DF4FB6B60CF4540A3E15947C47E0E40906485076ACF4540DB36F6ADA77E0E4050FE7FC36FCF45406558FFA39A7E0E40D836F5BC72CF454001315C21877E0E4052D219C775CF454046AA2C2D717E0E40978B07CD78CF45406A1B968A697E0E4060537E087ACF454075AD099B4A7E0E40529765F67DCF454015C4F4B5317E0E40927C08BC80CF4540E32AFFCF247E0E40B9560B0282CF45407531C01EB37D0E406E4BF0528CCF45408B0AF8DCA67D0E40A1F7E3298DCF45401BE2BC468E7D0E401F799AA88ECF454061C219AE337D0E407C247FB393CF45409535037D247D0E40276BDF4E94CF4540B44C32910A7D0E403727588295CF45408609B06EFD7C0E409785FE2E96CF454009C4F250DA7C0E4010146CC097CF4540448C7F29CF7C0E40BEF0CC4C98CF4540FCB84F048D7C0E407F955B799ACF4540B9A4A2F87A7C0E403FA5100D9BCF4540D7ABB2534E7C0E4075A893249CCF4540EF9884791C7C0E4048D7FD699DCF4540666B7B3A867B0E40130D5582A0CF454020168FDC557B0E402BE3C36DA1CF4540562C63001F7B0E405218B95BA2CF454021B738A10F7B0E400FE55282A2CF4540CB140461DB7A0E40FDB3B3D8A2CF4540A27F71ADA87A0E4080C161FEA2CF4540588B2FC8947A0E40E0602600A3CF454056C4F865647A0E40F491A6D8A2CF4540257BE2C51A7A0E4072D32D87A2CF4540D9AC4F39DB790E40321E6E04A2CF454076402306C6790E40BBCCD2CDA1CF4540C015E64F73790E401269C418A1CF45402AEAD83A59790E4074491BDCA0CF454085D23E091A790E4081443C38A0CF4540FFD09712D3780E40469C61719FCF45404B7CE285AD780E4050D604F59ECF4540E2E3096F56780E4035275F729DCF4540BDEDB1B635780E4048F5DBD99CCF45402BD9803200780E4062237D099CCF454004A39648C8770E40323265529BCF4540F4FA63C7A2770E4032FF85F39ACF4540D9DE183C79770E40F24A76A29ACF4540EC6A54974C770E405434D1B29ACF454082C1EE57EF760E4000430B149BCF45403A529D64E2760E4069A8B2309BCF45406BE87401CF760E4007A170749BCF45407022C83294760E40D4A95CAC9CCF4540998FAF057A760E408224AE3A9DCF45409FE8478A6F760E4013F80D6C9DCF4540EE1EAA135D760E4027D0C2F89DCF45404EFB299B49760E40FECD900E9FCF4540B89C9DBC3B760E4088971AEE9FCF4540D709700230760E4025465B16A1CF454067F4F79C12760E405095FFCFA4CF4540569BC5C6FF750E4013BAAB82A7CF4540B98F2EC4E8750E40F0272FF4AACF4540E9CDA472E0750E40F83F6E7CABCF45407E415647CB750E4050FE3362ACCF454011BE7391C4750E40F9977EDFACCF454033E5E34FC2750E40939BC854ADCF454041AC35E3C9750E402786C533B4CF4540B69A00B4CF750E40A4A70691B5CF4540B7B33876D4750E40768F344FB6CF45407FAFC6D7EC750E40EBB27272B9CF4540EFC6EB7D09760E408DB1D324BECF454018CE6C4C0B760E40B938A09BBECF4540EE420CFC08760E4003CE181DC5CF45401FECC05304760E40C9F8F1B9C7CF45402E560BEBF7750E40806BF047CBCF45400F87CEA6F0750E40A5815D7CCECF4540D8B88C6FEC750E40488D0B39D2CF4540E133F381EE750E40ED5A145CD3CF4540FFF2C8D6F2750E4067E82D0CD4CF454051D00ADC02760E40E6D7E48BD5CF4540D4D96AE816760E40C69F8AF5D6CF4540CD65CF6C22760E40E0A91555D7CF45408BDC5E1234760E40533F54CDD7CF45407E29AE9C43760E408D6C7114D8CF4540F18D9CE94F760E40134AF460D8CF45404728378D27770E40370C8196DECF4540D44CFCD348770E40D16DA98FDFCF4540DFC7FDAC67770E407B8B098EE0CF4540C7E1223775770E407C7874E8E0CF454044A4BD548A770E40E7DDEBEFE1CF4540D4E85F5BA9770E409BC0396AE4CF4540FB47AFC6BB770E40E309ABD0E5CF4540FD558725D0770E408E24F503E7CF45403ED2F30C26780E40233FB6B2EBCF45405A97AFA831780E40986D3D4DECCF45407D53B4AA76780E4075E62553EFCF4540844BF20B9D780E40BF9348E2F0CF45407FC58A0AD0780E40BE82AB81F2CF4540D4382E71EE780E40642C0165F3CF45407A6FE14518790E40DE5A416FF4CF4540A4DDC63A51790E40C4DDCEBAF5CF4540011178D57D790E405E1BA697F6CF45408F835E59E2790E40A5430728F8CF4540F245DA1B987A0E40F275E2D0FACF4540D8CB0A60D07A0E40E2F95063FBCF4540582C1CFE137B0E40FFFBC2E8FBCF4540D2FDEAE7877B0E40C7760C63FDCF4540C70628E49D7B0E403D75C887FDCF4540B2DED98CBE7B0E4053A6FFF6FDCF45406DA4A350D87B0E4070A35B6CFECF45404DF185A9607C0E4030780A4201D0454042CFB29F997C0E405E56EF8F02D045406192FD49B27C0E4088523A5203D04540703B7132BC7C0E4035358DBB03D0454056B3669BCB7C0E407CE6DBB404D04540ABE3215DD67C0E4019029C3505D04540F72D0ACAE67C0E40A604BCAB05D045404414DAF0F57C0E4003B18BFD05D0454085124406237D0E409A91EC1809D045402D2B26E0377D0E40F6754F7B0AD04540012446943F7D0E40DF06F57A0BD045408A5F5A0E3F7D0E40FD70AF360CD045406EFDBDC6367D0E4033462AE70ED04540ED52BB33207D0E40F394296311D04540633031C70F7D0E40B0AFAEFD12D045403E4147F80F7D0E409A5EDC8114D04540DF0E3300207D0E407112121E19D045403EDDC1532E7D0E40A773EE6E1AD0454001CE1CD23A7D0E404D4F79381BD045402EFB81FD5A7D0E40E5A4A6781CD04540E8355CC9DD7D0E4011EB07BB22D04540BAD16872087E0E4023BCDAD624D04540C76BEA3C4C7E0E40DB5417EA29D04540B52CC3767B7E0E40925A044D2DD0454061A5EF2BAD7E0E40C5E8C4C52FD04540A1BA0883FE7E0E404119FF3034D045408FF36DCF577F0E400A85642A37D04540441D93F2877F0E408477B2C539D04540FF03A1D1B17F0E404AABD8EF3BD04540CB84FE7004800E404E743B8B41D04540E8AD21ED2D800E40C7C394C944D04540B0AD632745800E4074AF860446D0454053D721CFAE800E40B1D851544BD045400869DDBBC4800E40B45C13584CD04540113D660ED6800E40042C49044DD045405149FA65F2800E4063D0F5D34DD04540F680A01F22810E403BC67C634FD04540C99A0DFA49810E40295DFE8D50D04540D17BEFAFD8810E40B88D920E54D045405FEF34D1BE820E402A7B38DA58D045408A292DF0CB820E401ADC432B59D045402D7FEB281F830E4088A8AB245BD0454090FBCF7C3B830E40E31EE8EA5BD045405356523782830E402E7617235ED04540C9D19578DC830E40450E1F7761D04540274ED13D21840E4046CCBBDD63D045403F9305A344840E40274CE00D65D045408D7EF85F64840E40582B6D3C66D0454016B293116D840E4055832CA766D04540BF05CA73E7840E40B753532D6DD045409F7132F31A850E4010C5B50E70D04540EF4C8B34BF850E40E314A2BC78D04540DB1D08B4EF850E40AA6FF9377BD045403C832E554D860E40BE7CADE27FD04540DE85169269860E40AA0C107581D045402E842C1F70860E4008103D9E82D045400B7177497A860E409BD2D6B384D0454098DD5F3D83860E40652E3BCD86D045409D0CFD4487860E40D6897ABF87D04540135A788196860E40E46AC85B8BD04540449A5AF5BC860E40DD89038A9ED0454049E313C3CA860E400E9E9FAFA4D04540900C33ACFB860E403247CE49ABD0454092D36E0A7A870E40FD0ABCD6BAD045408C9D534A9E870E40CEAEFF41C1D04540ED832349B2870E4089565BAEC8D04540E01F3A84B3870E407B65D6DECED045403DD74F7F95870E406EAFDF09D2D04540D1500DC374870E40D1ECE286D5D04540A753672E34870E403500389FD9D0454018B9238F8C860E406A6F0827E3D04540505C6542B1850E4085699977EDD045405A9C54E6C3840E40B942FA55F8D04540E61F71823F840E406BD26682FDD045401815C5B645830E40BBEF38B205D145408030B865A3820E40D250307414D145404752927D5C820E40C4F1620D1BD1454079378A643F820E4076B8A78F20D1454029F9FCE123820E4063DB90E422D14540DE013D73DE810E40B625440726D145401E5B39A065810E40573C3BB42BD145401F30E835FA800E4007C37B6531D1454060252136EA800E406D21C10532D1454095FC69EDD6800E406AEA1B8F32D1454018415E61BC800E407717793733D14540F6B72A357C800E407D42FE3E34D14540F8BE92066A800E40C7899A7C34D14540C3215F7D0A800E40DE7EED4A35D1454039DAC24F7D7F0E40ECFE30B635D14540CDB56D665A7F0E40B25D2DC235D145409BDD7CE3467F0E40BFCB13B835D1454052CE114F317F0E4029F09D9535D145403D15E9B2CE7E0E40DCE364C634D14540A207A808147E0E40ADE7902433D145400F6A66D7A67D0E4012ED044732D145401E9BBD55607D0E40CC1593AA31D14540CCC247CF127D0E40C04714C430D145401B9453D2CD7C0E40B29AE1E22FD145405FF53181AB7C0E40B33321612FD14540B0B5E3986E7C0E4031194C642ED14540B71696DC617C0E40DEDD2F062ED145404B31EA7F297C0E40473CFE332CD14540B8518870047C0E400A9065EB2AD145404958A966F47B0E4038A1926A2AD1454015F83C9EC87B0E401F21339829D1454088A949C8A17B0E40CC1729F528D14540EC10CCC08B7B0E40E6C67AB628D14540891F920E617B0E40F55C0E9628D1454026055BFED17A0E400320BE5728D145407005B532427A0E4091047F4D28D1454071A1C212D9790E409FD7EE7A28D145401B37CAF0A5790E407A1F419728D14540FC1C542074790E4039A732F428D145404BF4F67C48790E4077B9518729D14540F0DF298722790E400CCEB7152AD14540E888CE3076780E40917B9BE32DD145400375813224780E40505F9B1430D1454085EDF27610780E402966E98230D14540F3D9A66AFB770E40DE6AC1B130D14540A99AEA65EA770E409370B7CB30D14540C2EF5149D5770E40635145D130D145403AABA45491770E40F03E9C7E30D14540D9EF88D100770E400D6CB5AA2FD145402BB59A71DF760E409F3CB67D2FD14540D1056ACC7B760E4087A6A5242FD14540CE2E346454760E401B9CAA1E2FD145404079F5BF43760E403B2EA8252FD14540BB4281DF1A760E40C80346842FD1454043BFDD69EC750E400624212630D14540FE49D3C0D3750E403625DE7030D1454054DE46A69D750E40502F554231D14540DD677FC756750E405C77B4D132D14540B3683AE041750E40EA5EEB5E33D14540458F4B1433750E40291980F533D14540DA721EC21C750E4098D3850935D14540B059BB69FB740E40B85E090037D145404C434E28F5740E40AB98469E37D14540C4DD7893EE740E403943827038D145402C1E5314E5740E40CB3C731C3AD14540C6D9D894E2740E4007A12AFD3AD145402E4DFD4EE1740E40E4615BE23BD145409FAA9BB3E4740E405221B1503ED14540D44B0774E7740E40FB37701D3FD14540CE5AD3CDF8740E400499AEE340D1454059BBB69810750E40D74A318542D14540995D91F338750E400C3D20F444D14540D99951C6B6750E404A7E97F54BD14540BEC0A61255760E40730D0EFB54D1454061C98DBB8E760E40143B3E0958D14540CC05DFE8B1760E40D648D2B159D14540E3E7D552E7760E40165186485CD14540C11BF9B326770E406999ED6B5FD1454064CD6C736E770E40FE07442F63D14540B9B2627A91770E40036F417E65D14540287051139C770E402A9A549E66D145401DEB9F8AA2770E40E483409167D1454082D083CBA4770E402461ED2168D14540104DF599A5770E404E40892669D14540768D31C9A4770E402A8EAC2C6AD14540DA4FF3CDA1770E405C16BFDA6AD14540542629F17A770E402398416071D145401F064ECA71770E403F4404E472D145405EC7E48C59770E400E23655977D14540FE5451F644770E40075180C47AD14540EBEF30F932770E405AD7F4907DD145408A68EAA605770E40D7C4E83885D14540BF1888A7FA760E4042E0693587D1454080E0AD37DD760E4085439BF18DD14540D21DA274DB760E404114EFA88FD1454011DED74AE0760E4088869BB193D1454089C3ABA9E0760E40451240A294D14540253CEAC1E8760E40212879B899D1454007142355F1760E409B9AFAFE9ED14540F203AF2BF3760E4053D82892A0D145403275D2FCF2760E40D02FA82BA2D145402E762BE8ED760E40E2DBF8BDA4D1454056C71E7BEC760E407EEEE23EA5D145409B5A475CE8760E40850A2021A6D14540F1C02EE3DA760E40059C231DABD1454009355D6BD3760E40DAA8CFCFADD145402A96AEBDD2760E40F4894527AED1454010288248D3760E4093A7A87FAED14540B29F4165DE760E40B89CC2EEB0D14540B81E8735E3760E40EBEB22CFB1D145409D8B1616EA760E40302183C5B2D1454058BF0D0DEB760E4054956E28B3D14540C9BB5DC9E6760E40B14494CDB7D145408CF73E3BE5760E401709610BBAD145401A54E805ED760E40604DF84BBCD14540138A2097F0760E400F1EE81ABDD14540A6CE1D21FA760E40F4A60CA3BED1454058CEFA56FC760E40F2A16817BFD14540D40D09A5FD760E40A7A91A58C0D14540D0BDD37EFB760E408D44FC12C1D14540C09477AFF2760E4078E25E6DC2D145401105450CEA760E40FDED812FC3D14540B4A8B230D8760E409DB86E41C4D14540E5FFCE32C6760E408AA811FCC4D14540D428BD539B760E402E1D357CC6D14540C5754ED873760E400B575B4FC7D14540514405AC61760E40F4B00494C7D1454086C9544B2E760E404CE6C21BC8D145406EB578441B760E4076A8CA4DC9D14540B48969A1E1750E4063BD0B82CCD14540090BD33C2B750E407B0D0FCDD6D14540E41736893E750E40E717E77DDCD145409431FBAA43750E403AB9E52DDED14540BA4E8899E2750E40E2864DD0E9D14540AE803BF0EA750E4039022C5CEAD1454040ACAF83FD750E401E56601DEBD1454091EB4EC429760E403244F01EEDD145404933A3F635760E409747D825EDD14540741905A162760E403207671BEDD1454027406BE75B770E40E84D64F7F2D1454085205E0C8B770E40D5CDE10FF4D1454098F0DBA6ED770E40F5562EE5F6D145402858494D67780E402FEF1B7DFAD145402309B2E4A2780E4016D24B3FFCD1454000DD6957D5780E405FFE807AFDD14540EB25D79BDC780E40F754DC5DFDD14540E77C792D72790E406717567EFAD14540C87F9B94BA790E40C24994A6F7D14540AE39C7158C7A0E4098589751F4D14540E85B6A15A27A0E4063590B7BF4D145407BDB825A047C0E4014DCAABBF7D14540AB6BAD26807C0E405383759DFBD14540AA71B944DC7C0E40244EF979FED14540380056BBB67D0E40F016C7A50AD24540EDE6EB47F17D0E40537094E00DD24540831EED8BCB7E0E40CB784A8218D24540527D0D98B3800E405A7D5E832BD245405853202DEE800E40403213CB2DD24540233A9F058D810E40AB83AF0134D245404C35281CB3810E4019E79DCA34D24540C164F62271820E401DF9A0B238D2454063EFB4E3BE820E401C247A253AD245403006890FC7820E4086C7A0433AD24540512EBEA51C840E4070AC495B41D24540EE3B22316B860E407879E0704DD24540A6208A3522870E40860D711952D24540D829AEE2EA890E40B238BBF463D24540A8B489873A8B0E4064F5BF6A6CD245402D91715DBB8B0E40877B27A66FD2454021860F16118C0E403AD7C4B771D24540E0FEBBE1D18C0E40B480B05B73D2454044B6E49A2F8D0E40CC84C91774D24540256DE70184900E40CCD006F35ED24540E0DA621D2A910E403F180BC35AD24540D44DEF70B3910E40DF8DF5D15AD24540AB6FA1F087920E4038B2A1EE5AD245401783FF7694920E40A09EA9C85BD24540B3D672FEAA920E407079FD465DD24540A0C53CA3B6920E401B2B55FA5ED24540391E9138BD920E407C8A5F3660D245406E3B1EC6C0920E4037DD83F960D24540C4354195C2920E4066CB517061D24540A23E14A3C3920E40B3EBDA0B62D245400C4204C5C4920E4083241FDA62D24540729689EDC3920E40BA4861CD63D2454075A889DCC1920E40E1A42CBC64D24540FF130F9BBF920E406E50783165D24540BFD7B1BCBA920E4081ABCF3A66D24540C2BAC28FB4920E4018CEC70B67D245401A190184AD920E4054512EB767D2454057FC5476A6920E40EA61DB5D68D245404C42849E9C920E402514562769D2454037E7592493920E40E039C8D669D24540812B919E87920E405EA0367D6AD245403A3E70E07C920E40D1AC3F0E6BD24540495FA2EF6E920E408052FBC06BD2454078F2538C5E920E40FA13286D6CD245404EF589824C920E40799826096DD245408A9344763C920E40E67FC78A6DD24540F1CAC5C228920E404C09580E6ED24540D0CA718BE1910E409F0269C86FD24540F30EA4768D910E4095F2F2D871D245404789261060910E40AD38831D73D24540C98EC96A56910E40DB986E6073D24540CE4CC4EE43910E40DFAC90E273D24540127F2B792D910E4029D0FB9C74D245406721EB0615910E40F40F257475D24540CDAC69D403910E40AABCD62276D245400E59AB38F2900E40C77814CE76D24540234D52A5E2900E404C46167A77D24540183ACD8FCB900E405B742DAE78D245404BD03DA9BF900E40EB49646679D245403338DCC4B3900E40240C80247AD2454020B886B3A4900E4094B478127BD24540D77C93E096900E4038DAB5107CD245405CA584A79C900E401E6E7F4A7CD245404FFCF283AE900E40795C01487DD245408AE9478901910E40C57A3E9179D24540E3DB06F319910E403C79DAA478D24540116EEE9635910E400808A0A977D245402F9125134C910E407226B8FF76D24540BD5BEFD269910E40D889CB3676D24540BE61ACAB72910E40DD3A4EFC75D2454023F3C586A6910E4079783E9B74D24540C0582121F2910E406A8A58AC72D24540469CD4F746920E4022513C7870D245404A49CEE2A9920E4059760AEB6DD245409123C7AD17930E4053B4BF216BD245400B3F301283930E40402E8D7068D2454023638FC001940E4010CA543865D24540E652663E81940E403D4AC3FE61D24540493FED9907950E40AFA326AC5ED24540FF5100E3A8950E40534C569F5AD245408EE2460051960E40D64DE66156D2454075E3EE9D07970E401647E2D551D245400EB0212A6E970E4088CABC394FD245402F7B96059E970E405640CE024ED245400F431AA80E980E40A1623C3B4BD245409867D83E35980E4089A941344AD245401274316527980E406733101649D2454026DFB36EC0970E40D17866AC4BD24540BA1FADEAAB970E40B4C7C82D4CD245407BE5224F91970E40805C71B04CD245406C341CD16F970E40A27058404DD245408BD0BE0645970E40258757ED4DD245406BB894DF32970E40D2EA083F4ED245404E5CF88D25970E40DF24EC764ED245407B57EB7A19970E407BB013BF4ED24540	PA	MOSSON	media/layer/quartier/mosson.png	http://mosson.montpellier.fr/
3	0106000020E610000001000000010300000001000000FD0100002159B62E40DD0E40FD0DF24971CF4540A75A7F82EBDE0E40A6B352AB63CF454005186ADBACDE0E40565E466F4BCF454002E0A547A6DE0E40C0010B4144CF4540330C8485AFDE0E4090EA39073ECF45408ACB4C4AC3DE0E405BDB80B938CF4540D38193E8D8DE0E4051550CF934CF45400982B104F7DE0E404793992132CF4540AF2A2A8C28DF0E40F165C91D2ECF4540390EE81F69DF0E40F28CA0292ACF454040C5AA73B7E30E40471B8510FBCE4540E6C1BF5B05E20E405E049006F1CE4540DC8F65D7D3DE0E40575776AFE4CE4540C5A867BE68DD0E40043F7376DDCE45403E42A42800DF0E40C5D6C3DED4CE4540B5E6BC48F9DF0E4051A63C70CECE45406BE1F79D26E10E408BCD4C9BC2CE45406CE306B021E20E406C8FEEFCB8CE45404DFC4396A5E00E4084069AE2AECE45408C1C242FFEDE0E406EC8EA3581CE4540B683B42D25DF0E40649EFB4873CE454076CC29B11EDF0E404D187E546BCE454029B6DFF001DF0E403D105C8963CE4540AD1D2ADF7EDE0E40B1B9B3BE57CE45405559D885EADC0E409D295FE141CE454035ACE5736EDC0E4025F3194D3DCE4540C152DF6BC0DB0E40E8AFC4AA38CE45400758476F27DA0E40E85E6C5726CE454007B33ED6B1D90E40EC8957B220CE45409822E71D00D80E405FD8436C1DCE4540098C1270E6D70E40EDF2482EF4CD45405718B92212D90E407C163A5EF5CD454030128A891AD70E402E60D3F2C6CD4540F44AF8ECE5D70E40044B82EDBBCD454089767A2C0FD60E40B73F5B5E9ACD4540A184252D44D70E408782658293CD45400AE4340E0ED60E40514C229A7DCD4540BD22782735D60E407406B5E877CD4540ACC60DB6F6D70E405FDE794971CD4540289D5BE9D4DD0E408EAFE4AB54CD4540D80213ED66DD0E40C3FBD5C04FCD45408D830EFD71DC0E40DFEC886848CD4540FDDC2BEE05D70E40B69FC12B28CD4540F082F7525FD00E407A15F6EEFCCC45400E2C9B67EFCC0E40093A6744ECCC45402F35BC6DB0C90E4011AD7344FACC454063E0682029C60E40B2121107F6CC4540F47A217F18C50E40257E6965F1CC45406B9620D4EAC20E40CB8C4E86E3CC45401CDDD92CC3BF0E40EDCDC6B5C9CC4540959F6F0B6FBE0E4036225AB5BDCC4540F3AA9E078FBD0E4036E809C2B2CC4540B24D0D33A0BC0E40F3B41A4AA6CC454035A590B28FBB0E407E3341DF9ACC454039AC25A223B80E40AC0B3F5079CC454033F83BDA53B60E403D161A9A6BCC4540CE03AAEE57B30E401689BB735ECC45400F3A52E6B0B20E40D62BAAE459CC4540AEFA56DC27B20E4077D6673654CC45400C900DC6D8B10E40D22CA94C4ECC454080694EC0D0B10E405AFB56834CCC4540AA214435D7B10E40946B87654ACC454038B4E56CF2B10E4038D9316A47CC454062677A45FDB10E4093B7A71844CC45405D37D336FAB10E4026E09C8540CC454027449C53F1B10E40413C3E9A3ECC4540D793200DDDB10E4023E2C5A03CCC454008568E40BAB10E40683978DF3ACC4540E6ABE8988CB10E405701316039CC454024ABB33F58B10E4040384F6538CC4540A48E269324B10E401294621538CC45409A6ABCC5C9B00E401F9F9D5735CC4540E847885189B00E4067DA238031CC4540CE60C28D7DB00E40A57B698732CC454082A02AB639B00E405099294C2BCC454074FA94B82BB00E40529B9FCF29CC4540C428842609B00E4021D9629926CC4540BA7E1AEAFCAF0E40E1CC417025CC454012F37BDDA8AF0E4054F2324A1FCC45400C5DA2818FAF0E40C57854CB1DCC45406CBB1F913EAF0E404E22525319CC45402CCBE1E10EAF0E40F037AFCF16CC454077879A55BFAE0E40AABCE3C913CC4540484AC10774AE0E4089E7643A11CC4540CBB6636B21AE0E406C3611AA0ECC4540DDDE6BE1CAAD0E400BE92E6D0CCC454052EEB3036EAD0E4066BDA49A0ACC4540D0E60CF810AD0E403F234A5909CC4540AC30E06253AC0E405656CA3C07CC454019D302D095AB0E4008D62C2605CC45402AC4D570D7AA0E402423FB1703CC4540AE9F9B13EFA90E40A68E059200CC4540F573631592A90E40E02AAD71FFCB454067CB0932D7A80E40123D27F6FCCB454079155A6778A80E400EB8E364FBCB45406922EA1F1EA80E40AECA8BF2F9CB45400216F4F8B3A60E4052972F98F3CB4540F5B5416B9EA50E40076DF8B4EFCB45401076ECEEF0A30E40ABE7BE7BEBCB45405EC01F2F8BA20E40FBD4DFF5E4CB45401900060A6AA20E40DFFE7F49E4CB4540192840EE26A20E4087812FECE2CB4540F7AF8C56A2A10E40CC656732E0CB45402CC35E7138A10E402421AB42DECB45408C71E50F12A10E40A8B52DB0DDCB45401BFE7225E3A00E4045D90616DDCB4540E4DDACBFB6A00E406069A2B1DCCB4540454E1762A0A00E40A3F07A96DCCB4540B61BD8BB5BA00E40F0852F72DCCB4540FFDB338724A00E40F423796EDCCB4540A732754110A00E4019732D7CDCCB454041CA2227D59F0E40E001EFDFDCCB4540D5B017D8709F0E40A1FD00C0DDCB4540A3C707A2169F0E40F9AB7180DECB4540FE09521AE89E0E40287C05DEDECB45405F4B4D00D59D0E40BF06E81DE1CB4540E4BCB54D839D0E4082AAD3D7E1CB4540FC79F257769D0E4023D9E5E9E1CB454031825ADB259D0E4045DF05A0E2CB4540B86547EAF69C0E40E35022FAE2CB4540F264F5D0A49C0E403B24ABB7E3CB4540409F1AE3759C0E40EAA60A1AE4CB45402F4CF5F84A9B0E40D7474FB0E6CB454092A6D4EF249B0E40AA598EFBE6CB45400E0490031C9B0E40CEDCCBFFE6CB4540DA497AD5C39A0E400A8D24C2E7CB454041FFB7A6B59A0E40DEFDEAD0E7CB45408798B7AD939A0E40D4A3DA1EE8CB45408CEA95656A9A0E402785CB6AE8CB45404B12DDAB51990E407F1D89D1EACB45401C7381BD19990E40414D6805EBCB4540FE6356320F990E40DC072A0BEBCB4540ABAD3084EB980E40C71B2B23EBCB45409D331052B8980E40A7D7E4FFEACB45407D821EB39E980E40B48E83DFEACB454090B142F701980E40FD5D4BB1E9CB4540D164B9B67A970E40BCA6386FE8CB454054B77F822D960E409FF9236EE5CB45405B8093E8CA950E40A805827AE4CB4540B255C44008950E4049C1ABDAE2CB454057620BF2F4930E406425C380E0CB4540DE5F03E396930E40DA0DE7BEDFCB4540BDC2D8695B930E4018545334DFCB4540C085B081E2920E40C0D93C4BDECB4540659F8B31A2920E409A298DD4DDCB454073AD776F5F920E400E6D4C57DDCB4540459C57966B910E40EC15FF81DBCB4540FF1362D772900E40816AD29AD9CB45402BCE0071F38F0E4075A8E5B1D8CB45405C4A1BADB08F0E40A739E82FD8CB4540A4DEDCCF678F0E409835F0A6D7CB45402B176DEB3F8F0E40C815815BD7CB4540A5222AB4378F0E406F67541CD7CB454043EFA393498E0E40D1F9AA4CD2CB454021A3FCDCF48D0E40F62BEF89D0CB4540330EBE965A8D0E40249B235CCDCB4540E971CD5B238D0E40C6ADDD41CCCB45400184328BCA8C0E40F878A763CACB45406E468A3A1C8C0E405C2834D2C6CB4540170778A2B28B0E408772469AC4CB4540AD172884A38A0E40A0728776BECB45404E3AED0A98890E4019BC1A4CB8CB45403332FD0142890E40E1162D45B6CB45403CFC83B71E890E4083C34C4BB5CB45405903D47A4D880E40C8B4E4A5B0CB45408D1BCD523E880E407832D54BB0CB454084C739BA26880E40D5BF992EB1CB45403AECE9F7F3870E4056EF2A2BB3CB454065E35DCCEC870E404496CD82B3CB45407A054733DC870E40C22D04A5B4CB4540B800668AC6870E401BAE5652B6CB45407C546E23BD870E4039CC6B2DB7CB4540FBADBA37AD870E40BF904FFFB8CB4540DF2D7C298D870E40C4192D26BECB4540811F4D3485870E40CC5B7494BFCB4540A3D5B22E7D870E4078E86ADFC1CB4540EAD63B737D870E408687D38CC2CB454046DE94A57F870E400CE21000C4CB45408109179E83870E40A24CBCCDC4CB45404D3FA36988870E40EAD880A3C5CB4540C5189CE795870E40F46FE8E9C6CB4540DD5ABFD99F870E40C8185A6EC7CB45403EEE0A07E0870E40EEC22CA9CBCB454034EAF76BF9870E40FF596C44CDCB45401F90213034880E40276CE027D1CB4540D851D416B1880E40987A8C16D9CB4540AEE7690412890E4071C44213E0CB4540782692801B890E4095726574E0CB454021A1FC546B890E40BC0DCF41E5CB45401C3C64DD8C890E408229B2EAE6CB4540A8668AAA97890E40F2F3458BE7CB4540CCCD6373BA890E4002794E4AE9CB4540A50E1925DC890E40F386FF5AEBCB454008A2D8521A8A0E4025E8F7A1EECB454059198809798A0E40114C7E18F3CB454047996FF3878A0E400EEC9EDBF3CB4540F90897339A8A0E40EB660AD9F4CB4540276E08E9B48A0E40A6A08CB2F6CB45408DD035C2C78A0E404D2EBF2BF8CB4540D879ED77DE8A0E40ACEED82BFACB45400A031B40F28A0E40307BEAF3FBCB45401598BFAF2F8B0E4051ACC57902CC4540E11A9A253C8B0E40A0F5903704CC454086073BA4488B0E40BB1DC80B06CC45404D66FA21568B0E40A2CDF65608CC4540B88A78D05F8B0E402ED8753D0ACC4540113CB82B668B0E4081FAC6EA0ACC454034068687708B0E40758DD0790CCC4540B2C83ECD778B0E40A02E316A0DCC45401F8E93AAB18B0E400E25911D13CC454072575AD1CB8B0E40BA20359B15CC454030D64A70D98B0E40895C2F3417CC4540D4BED403EB8B0E403F7C369019CC454029386F79EE8B0E401C9C8E191ACC4540CE2B8131FD8B0E40D91F86711DCC4540554B7DC3028C0E40080C7C351FCC45404540FA79098C0E404A71EDD522CC454075D0242B0B8C0E4098DE5F0824CC4540B38F9B41098C0E409DA05B6727CC4540282ED674088C0E40827FAD812ACC4540EFCEE381038C0E404A9AEA7430CC454072C2BADCFB8B0E409B2BECAC32CC454048B6F840DB8B0E40B5BF547437CC454015892278B08B0E409233AA223BCC454073335B67988B0E40398461E33CCC4540F96E8DDB7F8B0E403E11CF733ECC45401330AB9F6B8B0E40E30767A13FCC4540FEC919A25C8B0E40EC52D5B940CC45405A1A82F9488B0E40C40E0C5542CC4540AB64A5C8338B0E40DFCB952B44CC4540FF70B950278B0E4029C8178246CC45401029DEBB1F8B0E408B2561E348CC4540D8629D701D8B0E40C58ED34B4BCC454006E538A81D8B0E40E12132D84BCC4540A13B4ECB268B0E40BB12196B4ECC4540A13C4245368B0E4092488C9950CC45406581CE123D8B0E40F46AB96051CC4540C1A78519518B0E409648B9BF52CC4540600B7DB4668B0E40CC9D110254CC454025E53B33728B0E4069DCCF5554CC4540701CC3D8C08B0E40DE2A3B2957CC4540F802BA572F8C0E405A6C9D765ACC4540B0A91D5B4F8C0E406AA6BF5A5BCC4540495BD520938C0E4084D6655E5DCC4540D28AB0FEDA8C0E40B6E3CC785FCC45403A33F8661B8D0E40EA37753061CC4540EC7E4DE52D8D0E40CECFA0C361CC45404ADB570E448D0E407A6A795F62CC454000710592758D0E40E3B7296263CC45404E3DCDDE8A8D0E40A3BF53DE63CC4540DBCFCA0B938D0E403FB68C0364CC4540DEF61E7AB08D0E403DBAA48864CC4540B6D1AA92E38D0E40926FDA6F65CC4540F1328694908E0E40003720BD68CC45407C065740A48E0E40629A163669CC4540B7C5280ECC8E0E40646E7F4C6ACC4540F23A9E2CDE8E0E40EBD3CFF36ACC4540896E95DE028F0E40E3A060636CCC4540F23705B51B8F0E403FE2989B6DCC4540C995255D2C8F0E40CB450EAB6ECC454063B84FE7338F0E400D80B2416FCC45401A852BD3508F0E4090F18C8F71CC4540F99CDE775D8F0E4015442BBC72CC4540E38D3B61698F0E40C737DA1C74CC45405AE8E8C0818F0E405CAD553B77CC4540B34EE2AAAA8F0E403BC7B5297DCC45409E320F8FB78F0E40F7D3C1F67ECC4540D968F5DFCD8F0E40FF85C80282CC454007093B83CF8F0E401EEED91183CC45409D83A5E4CE8F0E405ECCE18D83CC4540970E7EA5CC8F0E402FE1E30784CC4540A94F6AEDC48F0E4016D2900985CC45400D7233AFB88F0E40481A41E585CC4540666F3B01AC8F0E40FB66F8AC86CC45401A6A197B9A8F0E40B98D378687CC45401C17DF5C8B8F0E402E70154C88CC454021CBA66E758F0E409555D54A89CC454072C920914D8F0E40DF48621F8BCC45400BDC90050D8F0E40ABB1422E8ECC4540FE30A0ACDD8E0E40B449E09790CC4540327792C5AC8E0E409228792D93CC4540CAAED9F66D8E0E404828508696CC4540FC0440C7688E0E4061D639C196CC4540C34D9EC5628E0E40372C67F696CC454090D2EBD0498E0E4025269A7E97CC4540623B36B03D8E0E40BFB0A49E97CC4540C80D8F5A258E0E40F520FDAB97CC45400C50A5DA138E0E408A079C8E97CC454075C1A4F5A58D0E40BC65D6CE96CC45403F7240696F8D0E40008A266A96CC4540A43AC35D348D0E40F03228F195CC454042483EDBDA8C0E400201818399CC4540470D8214908C0E40654930649DCC4540C235840A388C0E40336B3D9AA1CC4540012DEABA008C0E401E53A168A4CC4540C6B086C5D78B0E40B2A7D28EA6CC45408D945BDAB28B0E40F4555CA8A8CC454078F4D573928B0E40C0B65CE4AACC454020A83E29768B0E406C6A8940ADCC4540F7D57FC75E8B0E401BCCA5B5AFCC45403F6CD65E4F8B0E4047CA0BCDB1CC4540FB94F77B488B0E40D50AB8DCB2CC4540EF5258BE4A8B0E409150EB70B3CC4540CC1749BF6B8B0E40CBCF68D4B6CC454012A559AB828B0E40A9EE2B5CB9CC45408F947401AC8B0E40ACA64B50BECC4540313DD163B18B0E4078A8EE9BBFCC45403D9086CBB78B0E404B000475C2CC45406280B42BB08B0E405C6C09B4C3CC45404EA801BFA08B0E40FA9FDDBAC4CC4540867DC9A52D8B0E4042B5864BC9CC4540207B7698C18A0E4009C85434CDCC4540766CDB073D8A0E4089A128C5D2CC4540B6EE73302D8A0E407169FEC4D3CC4540FF95BAC0108A0E407C85FAC3D5CC4540CEEE092FF9890E409402C5C0D7CC45408D5C7753D7890E40E5259D69DACC4540FFE97E19B7890E40A5CFD916DDCC4540FE70A629A6890E400591F965DECC45406CA073378B890E40D0EBA515E1CC45405F0D22F36B890E401BC86729E5CC45403F21F2212C890E409359F23AF0CC4540FEE8AEA50E890E4023FA16C2F6CC4540BB0ED82DEA880E401A51A92800CD45401B93933CE4880E4048F8428E01CD4540AFA75200DB880E40447603DD03CD454020FD1E10D8880E40378F26B206CD4540076815D4D7880E400EE5392E09CD45407270DA06D6880E4052B019C209CD45400D595CB5D3880E40A0ED341B0CCD4540E463A2A7D1880E4085B041120DCD4540D54FC827C4880E404C3ACDF011CD4540F76D817FBD880E40E29E199513CD45407E7DEC78B5880E40D528BBD714CD454069FE057EAE880E407C973BAB15CD4540D52444D998880E40144E886517CD454052F624BD22880E40C04515B521CD4540E5D41BE017880E40D999ACFA22CD4540D01362EA14880E40018F8EB423CD45405F6FEFA112880E40C42B1C1E25CD45402248151F14880E4059609FCD25CD45406D0AAC791C880E4019CD6C6C27CD45406D40CC515B880E4099DAEB542BCD45403418B5ED70880E405E1075982CCD454037B8C04D89880E40550C07AB2DCD454099CE702FA9880E4070A5DC372ECD4540C0951B8FB0880E40E1712B632ECD45406852F9B1CC880E4019B99CB42ECD4540C6124559FE880E40D37C77072FCD4540B0FD727529890E40789FA43A2FCD4540C8631C1D5F890E406BF512682FCD45406FFCC0CB2E8A0E40511B4B0530CD45402C7887F2458A0E4023AB6F0D30CD45408668A335508A0E40968BD05630CD4540B01E9DD2798A0E4018D1DCE231CD4540CF749684978A0E40DA4FA21033CD454010FD4BD53B8B0E40029B91073BCD4540BA7D54F88D8B0E4030B572783FCD4540FD59A488DB8B0E40DE8679A343CD45406396595CE68B0E408BCF665344CD4540CF4CAD5DF38B0E4045589F6345CD4540A79BCB51F98B0E401346341246CD45408F956AC2FF8B0E40B34897F446CD4540D9CB3C0C228C0E404F48358E4CCD454024D31B96518C0E40F29816DC54CD4540AFFAE9C6738C0E403D9B1B435CCD4540173BD7C6888C0E4081DBA01B61CD4540F72A2E20958C0E40C8B23F9663CD4540FCB75ACAC08C0E4030F0F7546BCD4540A7BF5767C68C0E409E52182E6CCD45403FD21E55E88C0E40DF8F2DD86FCD454061C91B36EE8C0E409361645670CD454007D664E9008D0E403766AF6D71CD454008736AE4408D0E40E340781E75CD4540E4BC34CCBC8D0E40F09810827CCD4540121DB01BD78D0E402EF3D35C7ECD4540BFBDF927EA8D0E40CF8F3E5480CD45409DA3550FF88D0E40B98BBC9B81CD454040DFC872068E0E40BF23DD1583CD454021B33A9A158E0E409908577284CD45401740E4E8318E0E40F15D683D87CD454037992384678E0E40E320C6688CCD4540A2D4C28A7E8E0E408F1A66318FCD4540CB39D5639D8E0E4020014D4C94CD4540A752D097B08E0E401293F1AD97CD4540CB367E00B48E0E400E6A371C99CD4540B5C3F9AEB38E0E40F016D7609BCD4540B70B76BAB38E0E40930D418A9DCD4540F6F492FBAF8E0E402812D3549ECD4540F6BAFDCFA98E0E40C9B5F8269FCD4540D1A47326728E0E40EA86722FA5CD45406E02D3E3428E0E4081534407B0CD4540724221E53D8E0E408BB7FDC3B1CD4540BFBFEDF9388E0E40B76C3AB8B4CD4540DCC8C083388E0E406A57CFA6B7CD4540D5C87DA6388E0E401E9D18FEB7CD4540EB6D460E3A8E0E40EDD95877B8CD4540B07F0EFA3B8E0E4053004937B9CD454038BCB1D13E8E0E4007DFD23DBACD4540BAFEEFAE24900E404F18576ACBCD4540E78957F0DF900E40654689D3D2CD454091D19A2CEF910E40E5A3BA2DDECD4540079CD794C3920E40A197268EE6CD45401AFF42D785930E4061AB7B41F0CD4540CC6DC0B3A7940E40F348199801CE45404A8C2BD62D950E40FC71564B10CE45405FE790E1B2950E400D00853F1CCE454060189F0700960E409DEDF36B23CE45409C34715973960E403F6E24A22BCE45403467D89F6A970E40700DD8EA36CE4540CC27EF2819980E40EE56C9E23ACE4540B224C399F4980E40A322AD773FCE4540F1F4E031C4990E401ABE7ADD43CE454078CE92D0449A0E400D6A12B245CE4540601B34FAC99A0E40EC367CB246CE4540EDC56EFD979B0E40A6C63F1E47CE45404B6902957D9C0E405FAD0B9946CE4540AA8405B0809D0E40A8DA80BE44CE4540482A1F02599E0E4015ED8D8142CE45406A762C49C3A10E40C01505AF37CE4540563A3A8D23A90E4016D1EE2E1FCE45400D7058A9B3AB0E405CB27A2319CE45407EE93839EEAA0E40FCA5694437CE45404E33CA8779A90E40380CEB226FCE4540226597AD62A90E40F36772077BCE45408B1C3A7F54A90E402830244C88CE454053B02F178CA90E40D045A9D1B0CE4540D7D4389035A60E40D95CFF3DB2CE4540F7D63AF347A50E4040A24802B1CE4540CD92AB5F25A40E40E9B47053AFCE4540D22DF6210CA20E409521AA1BACCE45408FB7CC981BA40E4054B7B0E6D6CE4540D053DA17EBA40E40B3D6593AE9CE454008D0423CCBA50E40AABF1982F9CE4540AD5370456BA60E40F0B251D204CF45407495BFF56FA70E40DF41082F1BCF4540294FB5DB2EA80E40602E05992DCF4540648C8DF452A90E40419CB86C4DCF454099C0D3B298A90E402B09995758CF45403923AA91A8A90E4040CD37805DCF4540F77CACC5D4AC0E405C85524C8ACF45403E7827ED4BAD0E40F93B14E696CF4540B11B5B6E84AD0E40C8B584289FCF4540FFD30441B4AD0E40AE2CE204A6CF454003FB740BDCAD0E40B439990FAACF45402A3697EF1DAE0E40C784B256ABCF4540A5CDD94480AE0E40498B187EABCF45404284DEB4FEAE0E40BA24BADBABCF45405F4A4BCD8DAF0E40400CB341ADCF45409D82FA76FEAF0E40CBF390BDB0CF45407E0594A236B00E40CCDFE31AB4CF4540566F621961B00E4012C979B8B7CF45402D0BE46582B00E4053D8BDC5BBCF4540AA5DCA9688B00E402C9EF40EBFCF4540D10A939A82B00E4044C6885FC3CF45403C3789A370B00E40D0267B2EC7CF454007F4EA234EB00E409EF1BA47CBCF4540894FAD9A1AB00E400390DA72D1CF45405924F40DCDAF0E40DFF70E99DACF4540D595518589AF0E403AF3F872E6CF4540A1C8F1EE79AF0E40D3887626EDCF45400966C9D48FAF0E402D585423F2CF454074E846B2C4AF0E40BDEC315FF6CF454058C095C30CB00E4086CC47E1F9CF4540E915EDA92BB00E405F97D8FBFACF454074A6135B50B00E409E8D3557FBCF4540710006F6ABB00E4042B7F9E8FACF4540BE53EC09F8B00E40E4EAB940FBCF4540965A631A3FB10E409CF14542FCCF4540A7FEFCE368B10E404C4C562BFDCF4540F9D6B4478AB10E40E2279967FECF4540D1FE8898AAB10E40E45D1E0000D0454059AB6C60C0B10E401D11D9A701D045406A4C1D9FD3B10E408428D31204D045408FFB8BD6DBB10E408DE9A65506D04540CF119609EAB10E4014420C6C10D04540D05965CE34B20E409839B79815D04540F3F485019BB40E402E6725462CD04540760270FC16B60E4041FCCC183BD045405475455469B70E40BC46245D48D045407AE2D51686B80E40EC0DFFAD55D04540F59EA65FD7B90E40CA56345E68D0454056C0A19792BA0E4020C94F7974D045408400351B2BBB0E40C5D5EF1F81D0454023637CDACBBB0E4029194D1592D045408B658F542EBC0E40726552B2A1D04540572A7AF78FBC0E409C9F9547B6D0454019D47DABE0BD0E403FC5035ABAD04540C84881CE01C00E40C2CB5E5B9AD04540C545D392A1C20E40110EA14483D0454089B9D1769BC30E40F2E0B8837AD0454051797B8F17C40E40960E5B0974D04540A6BDF5602AC50E40130432975DD0454002427CEFD4C50E4046566C8053D045401A53FA00CFC60E40239096364BD04540ED4BADF4B9C90E400A89BC5F34D045403CF7042C6FCB0E409D22FBE420D04540F08361EA45CD0E40B50974FD0BD045407DEA766BD5CE0E406F19DCB601D045404B412462CCD10E40CDC97796EECF4540DFB54250CDD40E4023A2C607D1CF4540319645BE58D50E4080926D5FC9CF45407F1702CAD6D50E40A1E305C2BECF4540B63239A65BD60E40503E9CECAFCF4540BC931A76DAD60E40750C1334A8CF4540BC13867B53D70E40C8C6B439A3CF4540E4CFBED456DA0E4041646CBF85CF4540FBCF14BAFCDB0E40654945BA78CF45402159B62E40DD0E40FD0DF24971CF4540	CV	LES CEVENNES	media/layer/quartier/lescevennes.png	http://lescevennes.montpellier.fr/
6	0106000020E610000001000000010300000001000000810200004C86FAD62B2D0F40A4773B07A8CF4540C678B50D2D2D0F40497A9C04A8CF4540D60E930C3E2D0F408956D3DFA7CF4540B5849134D12D0F40E872B94BA6CF454082C1D936382E0F40DE6DB0F7A5CF454086E69F1E412E0F4039A263E6A5CF45409FAD9541612E0F404458A00FA5CF4540A81040394A300F40F217584CA0CF4540D4F3B574FD300F408661DCB59ECF4540AD9430B77F310F4023CADB839DCF4540E76346532D320F40C5FC5B149CCF454092297E4A2B330F4007EA55879ACF4540688C6E304A340F40D339E21299CF4540629FA5709C340F40381C57A298CF45402A80CC3BEC340F404056592598CF45409908C16E09350F40C497350D98CF4540301DD15299350F401F074B6997CF4540553F797541360F40328D937B96CF454017DEDEF1C3360F40D58DB5D495CF4540A34DF77359370F400C4D690795CF45404EC490E4C4370F4013C3429E94CF45409019A22F1D380F407E62091094CF45407C60782A46380F40E1B62FFB93CF4540C25CC433A0380F40E13ABCB593CF4540FFB00771B0380F40F10A54B393CF45408EAAA11E46390F40F390D24D93CF4540A453CC4299390F405FF96C0D93CF4540B2171420B23A0F40EFFA64B592CF4540312FC127133B0F40AC6905A792CF4540B983299DDD3B0F40F5A9B73B92CF4540AF3EFA21F53B0F40B0322C2792CF454063EA6C74C13C0F40AF97924593CF45404623139DF73D0F400095E6FF94CF4540B68ED8734B3E0F408D65827195CF454081D686FBBA3E0F407FD3161296CF45406099BB9AD43E0F40BE41EC2996CF454038F6D6588B3F0F40961EEF2497CF454095586461B23F0F40C63D3C4397CF4540BBAE71FBEC3F0F40F7E3F18F97CF4540CC6956EE25400F406A0651CB97CF454069F72D7872400F40236B114298CF4540DD42D4AAAC400F40B92C0B9098CF45404221F6C60C410F4054CB8F3799CF4540E5892AF32A410F4080354B8299CF4540C56BD80B4E410F406DAACEEB99CF4540F8EF9C8BBA410F40F20C64199ACF4540207A8511EB420F4096C993019ACF4540391CF71673430F406CF37BF799CF454052F19031CB430F4068F965ED99CF45400163918B56440F40F6004E159ACF4540EF61294776440F40FB29C0389ACF4540C771820BCF440F404D8874CB9ACF4540CCB1B83BFA440F4050FBA2229BCF45403905DA245C450F4059DD1B359CCF454020A19A1CC0450F40D445A3579DCF4540075FD4D0F8450F405C22FDF49DCF4540CB031E5D1E460F402FF160679ECF454032455DDCB2460F40AD4FD806A0CF454044A2CE9A03470F4028E021D5A0CF4540309D40382F470F40F0FE3139A1CF454094FD138CCB470F40ABBE1C8098CF4540A85B23E016480F407685532894CF454000DBE671DC480F40A182830D8ACF4540322F1B8ACE490F40CFA9D8AE7DCF45402E8F5F0CDC490F403299A9F97CCF4540DE06E5DE294A0F405E29F2AA7BCF45404AC9375D384A0F40B134915E7BCF4540D72CDA83954A0F40AB8BD0DA78CF454087003F60594B0F4002DF456273CF45401AE81472CA4B0F4016F32AF56FCF4540E6920EE1004C0F403DCF6B136ECF4540B31F18769A4C0F406540AC7F68CF4540FB8D110EB84C0F40E48BDE6A67CF4540DC7B89AEDB4C0F407E9A803266CF4540435E399F2E4D0F4023316E8C63CF45405629326D984D0F405034E13A60CF4540E7CC613FE04D0F401C19232D5ECF45407EE526E5354E0F409647A82B5CCF45404BBB04A6BA4E0F40ECF0E13459CF4540578DE8F44D4F0F40A2D3731756CF4540C6A6512503500F403A097F6F52CF45403AC86A2150500F40A4BAC71251CF454023F6A4AF62500F406940D9C750CF4540A0EDA90C8F500F405807540F50CF4540C63A4E5DE1500F402DB5D5DB4DCF454016F0FF2F38510F40938E4AC14BCF4540C85E1298B0510F40DCEFBF6748CF45402B621BA828520F40A8A5093445CF45402CE41EA783520F40C61E2E5E43CF4540A81E842ED9520F4060E0880C42CF4540886475FC4D530F405BE8B4BF40CF454005B75041D0530F404C415B9A3FCF4540BCAA7A8355540F40D91A06CE3ECF4540AD0E328F28550F40ED88A9963DCF454065BBB65666560F409873F62F3DCF45400F9E85FE61570F40C321C1F03CCF454049A217096B580F40F05BA7A83CCF4540D234D0AF27590F4079C261423CCF454070EB1AE48E590F40AC0C43733BCF45401668C6F7055A0F40C7A87BCE38CF4540AEF95038EC5A0F40B85BDB0A34CF4540DE0AF5A4745B0F40DC32782231CF45409D8203DBFA5B0F40818C1BC12ECF4540B2F06F96705C0F406F4888C62CCF4540F62F5137D85C0F406CDBA50D2BCF4540F7250EFF3D5D0F40A937ECC229CF4540206E4A9B705D0F4094BFBD6929CF454080D71141D45D0F40D77E2AAC2CCF454084E86877195E0F409D9C1EFA2FCF4540F6794ED1675E0F4089534BC433CF454084285EF3995E0F40A656E11F36CF4540EC15ECC0F65E0F40C8B8517A3ACF45401A511692105F0F40A9AB7FFD3BCF4540CE81BD774E5F0F400E822D473FCF4540C25489C1C85F0F40624BAD2146CF45400BA1F3E925600F401B989C514BCF45403F855C4A55600F404A2A8EE04DCF4540AD1BF162C9600F4084FFB47C54CF4540139D46CA00610F40568DD7C757CF45405F03320F1F610F406667C14159CF4540ABF0891745610F406F889ED85ACF454025ACE5E36D610F402AE0D5405CCF4540F5AE53509F610F4020407EE45DCF4540549A1F4CD2610F409D4EDA605FCF454015DCA8D10A620F405D89197A61CF4540BD29803125620F40E5E18F6262CF454007A35803A3620F40093AD50567CF45403CD6940E18630F402D75D7126BCF45404930A70B61630F4019A974B26DCF45408656DE2186630F40F9BA1BF86ECF4540A3882D8CA0630F40E9FD57F96FCF454071E6CAC685640F408E09521A78CF45405D996535A9640F40A7DE734D79CF4540B48FA561C9640F40E9FB3B7A7ACF4540C486080B0F650F40E59635EA7CCF4540C42960A77A650F409D2021BD80CF45405A43E5FEB8650F40382D7B2683CF45409CC44062D1650F4031E4582984CF45400F7AEEB6F5650F40143D329085CF4540B760CFCA7F660F40DB5FF9528BCF45409DF41D9FB1660F40E42D9CE98DCF4540A2D14C10EA660F4024658DC590CF45403A0B04EBFE660F408952301192CF4540FA0874C920670F40BD53845D94CF454012260BEC34670F4064FDC4E095CF4540877C549C5F670F40CA5D92D199CF4540F98291FA79670F403772049F9CCF4540A6702CAE99670F400050C081A0CF4540300E0709A4670F40DC14C7F0A1CF45407CE69F85C8670F40D8D9CA92A6CF45404C1C8DDEFC670F40F7F5A82CADCF4540D294FEB11B680F40213DA7E8B0CF45404A6BE89835680F4065A19E91B3CF45407C68D19F4C680F40D7A42D27B6CF4540670703DD63680F40DAD0DB47B8CF45401C3FD88494680F40DD0D3DE1BCCF4540D1528E67A0680F409AC44817BECF454033A56664B9680F4008FD5A77C1CF454081ABEA86E4680F40227D735CC8CF45404C56929725690F400F24C514D3CF45404CCB17C434690F40BEE11E57D5CF4540612085A44D690F40504F3B68D9CF45409653A2006A690F40C368E411DDCF45409CD9455174690F4046412668DECF4540ABC4BA58A7690F4070547ECFE3CF45403A5F4697BF690F400FFE9763E6CF4540A306F6D4DC690F40E0A61842E9CF4540FD4F0AE0216A0F401EA44300EFCF45407FD2A6FF596A0F40C9AE8CF7F3CF4540EE725DB7D96A0F40B7C8DBF0FECF4540C80C30D5126B0F4042AE376003D0454022117EAD6C6B0F402FEA885309D0454078FD20FF956B0F40E6CBF5F10BD045400B4A0F5AE56B0F40F1A74D1A11D04540671662B83A6C0F40E9C8451316D04540AE0204DE456C0F40FDC2E08016D04540AC5ADDD2A06C0F40F6863C5619D0454079475A13EC6C0F40D9538F871BD04540C46AD4C5246D0F403144C1101DD04540F037AC88436D0F40BE67A8C61DD045408ED537CD846D0F4063B913691FD0454022012F94D86D0F409BD3779821D04540A3873C05806E0F406221DBB225D04540E68B0A98BF6E0F4096702B2B27D045405FF8EFE0046F0F400F19B6B228D04540365DB66C246F0F40E45FE75729D04540880ACC2C3E6F0F40504A25BB29D0454052E8EFD64F6F0F40B75942342AD045402A11E414846F0F40BB8459C42BD04540549B6D5DA36F0F4076F4BFBF2CD04540B3C40341C36F0F4074A65F332ED0454046985259FC6F0F400535D8AA30D04540849B8C5E22700F40A8D2DD3532D04540A0E64D2F4C700F401268001534D045409C589A1781700F4021D7B44036D04540C81D55C9B2700F40B880318138D045406BB9B7D815710F4059DA70313DD045407DF62C6C7D710F40939C2AFE41D0454050B38812B2710F405B376C8244D04540E0FE883E08720F4007C8A77E48D04540E519207515720F402E9D060149D0454074F55B8E47720F407CA03C404BD045408B0A21A6B0720F407F6DB7CB4FD0454030CC786F1B730F40E98E1B8054D04540351CA2E04D730F40B10A7B9956D04540188671FBC0730F40A7442DC35BD04540FF76869850740F4017E6D40F62D04540A1C8423D83740F40C4A280A164D0454097E0E93DB6740F40115DC91667D04540733289D6E1740F40ECA8BA5269D04540343B63620D750F40DA4E00706BD045407A680D235F750F40F1262C876FD045401367D799E3750F400BF0D96375D0454074C7498BBE760F405EA21EFE7ED045401455A4B0D9760F40201153BE80D045400197808FE6760F40EC5F886681D045408C1471B53C770F40DE32289C7FD04540FF272B9CB2770F40FF8B770B7DD04540B3BBAAF9D0770F40F890B7EB7AD04540F9EF64B4ED770F4037423FC578D045404FD67F7E20780F4039BCF91174D0454021E615C53F780F40EDC7EE3971D04540E55347056D780F4035803BDF6CD04540AB8DD6C201790F402512A9E35DD04540F50E18FC20790F403D4CF0EC5AD0454006904ACB5B790F400119C50955D0454064A6772A93790F408B8E2DA94FD045403DA4A8D1B3790F401C03D70A50D04540ACBB07C4467A0F4060B8A1C751D04540AE96FA01A57A0F40A7C9B0C752D04540EB0DEC28E27A0F400499505353D045405C879A85017B0F4078BF9A8953D045405CD93732357B0F40512291C353D045407B67C1E46C7B0F40BC6C35E653D04540C46C2C00A97B0F40C965D1E653D045406C856C05107C0F406CB9C29553D04540A24D43321E7C0F4073BF817E53D0454036F2215F287C0F40279C769852D045402AB66431307C0F4048B484E451D045403E1DEAFB397C0F40AA8E8A0B51D04540CF9006B9487C0F40F8A4626C4FD04540B9DBB7DE4E7C0F400531239A4ED045400F765B5E707C0F409AF00E6A48D04540C8D25EA28C7C0F407208634943D04540B142235AA67C0F40A44F07E63DD04540F76BFB43CB7C0F40FCEC4E3336D04540B8D0D987E37C0F405DD1F13631D04540AF6AABBCF37C0F40590027472ED045403E9235260D7D0F4079D81F132AD045405C5552CE217D0F40AE1AE21827D045405901BF404D7D0F401CD5766221D0454016BD47E8567D0F40EC6E183820D04540489FFD66937D0F40EE89A57C1AD045408C1266ABE07D0F4041E0F02313D04540D5F0A646FE7D0F40B56A7A3310D045407A5801105D7E0F40E1067F2406D0454042BBF58B6F7E0F404CB0DFC803D04540F0DBE1B7717E0F405DDD422A03D0454084424151727E0F40BC86AFAA02D0454006343AA76F7E0F405A73652202D045403027AD25637E0F407664556101D0454052B445695A7E0F409AB809E500D04540FEB16063357E0F40F3A304BD00D04540E77E7CD1017E0F40642F64C000D04540A4456DAFCA7D0F40363CDCFA00D0454081E5CE59C37D0F40BC37FFEB00D0454042BD7D888A7D0F40F5C6420201D045408EFE7997477D0F40D7FA232A01D04540B2888A3F2D7D0F4001110C4A01D04540BD1445DFFD7C0F40D242B99C01D045405B6734A7887D0F409BD95412F4CF45400EEEB8ECA57D0F40A7C36D4CF1CF45401D42F15C097E0F403ADA80ACE7CF4540823ED7EA117E0F404D3930C9E6CF45407CCBA506207E0F4004F6B567D6CF454060DB2856297E0F40FEC87FE5CBCF45400DD58A73317E0F4034CC8870C1CF4540334E064A387E0F40049FB7B1B9CF454050F9413C287F0F409662F876BBCF45406AAA5CCE6D7F0F40F7C4F92CB4CF454053F2FA0A957F0F408A402905B0CF4540264E671D9C7F0F408CAB2477AFCF4540422C8FD27F7F0F406B34B4E1ADCF45402C6F46E9707F0F405415E132ADCF4540DB372EFE717F0F4005F536E1ACCF4540155D30A8727F0F40D9A79088ACCF454016495A14727F0F40D1160822ACCF4540F31385607F7F0F402A92C625A7CF4540AFF69EC8A17F0F402D566C8E9ACF45405FF8384CA27F0F404F821EDC99CF4540D2649F4EBC7F0F40AA9FF3E799CF4540E023AD1CC27F0F40610EB73C99CF4540A98B0774C97F0F400508DFAB92CF45403503579ADE7F0F40763CF3B980CF45401E722E9CE37F0F404A82FE4B7CCF4540958CCD220C800F408E598C4F78CF4540B318E36326800F40185B911576CF4540CC87B5C854800F40CFC3B88672CF45407D272465C4800F40950C8ECC6ACF45404564C84008810F403E79482866CF4540A647AB3F26810F40AA1E8E2264CF45407C74958230810F404DA9977163CF4540FFF32CE0AF820F40879DC13157CF4540788EEBAC47830F401A871C4A52CF4540EC08B79527840F40E37B30184BCF4540C061566F58840F4031AFEE7B49CF4540AE9501FCF2830F40555F5C8839CF4540958329E8D1830F406FB5C35C34CF4540D0E9171180830F40EAEE2E8727CF45400DD4CC2E75830F40560E7ED125CF45408ABA83DA5F830F407175117A22CF4540D4ACBBD553830F401BEB31F620CF4540126C8B4A4E830F40D5AA245820CF4540672AAA0D55830F400879040420CF45400F2E587D8E830F408CF6937020CF454090A7E9F1C2830F409EA12B9C20CF4540802CBE29C6830F40438ED5971FCF4540DBC463E5D0830F40FC7AB50D1FCF4540BBB45699CE830F40C842D57B1DCF4540BD81A5C4C3830F40484B01011ACF4540A0DA5A62A7830F400BFE0C7713CF4540864ED9709D830F407A53F31B11CF4540B99A5BB131830F4027BC4A23F8CE4540E0B3641CF5820F40A00266A1EBCE454000D80322DE820F40C963EB47E7CE4540AE39B847C6820F401A3DE1C8E2CE45406FE9EC36C2820F40DFFE2CD3E1CE4540EE010B55C0820F40A6C60439E1CE45409F8132E3C0820F4044B77B9FE0CE45403F942B82CB820F406CAA4DD3DFCE454001F2069AE1820F40DC0C3C44DFCE4540873FDF18FA820F4066CB94A0DECE4540E4C3F3850E830F407046EFF7DDCE4540062C697C13830F40262D303BDDCE45400F4866C115830F40B6858DD7DCCE4540982EFD541D830F4070828392DBCE4540D206FA991F830F40CEDAE02EDBCE4540770A7A2324830F4076286E66DACE45404373467027830F40C70B7492D9CE45401F9A6FEA28830F405324CB3AD9CE4540DCE8FC742B830F4032CFDB86D8CE45407A2226042E830F40EDB48ADDD7CE45402E06168533830F40AB05017FD6CE45401D11F62C34830F408363A121D6CE454069A436C240830F408C48B87CCFCE4540E50F0AE54A830F4084E65DC4C9CE4540C6BB4D6F57830F40F76399F8C3CE4540BBCD42A565830F401A81C348BECE45401B7BCDBF76830F4043AFF4B6B8CE4540F2BD808485830F408AA0DB61B3CE454065013BD38C830F4015014E89B0CE454068CA0EF28F830F40BEE91458AECE45401966788997830F40D22C5151A9CE4540DAD3C124A8830F4094BF5ABF9FCE454047DA1761A8830F4064B5CF599FCE454044912CE6B2830F40007B52BC96CE45404D19EE3DB6830F40B84F4F3892CE45409B459664BB830F40DC6DB8F990CE4540DF508901BF830F40295336EE8FCE454072153393C2830F40BC3FC2C88ECE4540B99CF693C2830F40869506D88DCE4540761A497BC2830F40AB563CB98BCE454054217D72AA830F407C74ABB288CE4540EBF4BADA9E830F40B0D6813A87CE45403C7804A484830F4032CEBDDA83CE4540BFEEF8D84F830F409CADEA327DCE454023D807AB41820F40D411469F5BCE4540799FC87B27820F40BF92065058CE4540254CF6541F820F405BDDB74A57CE45408085F982D8810F4067B64D5B4ECE4540C0773A7063810F40A14A71CE3FCE4540CB704E371C810F403BEE49E036CE454075F42ADFE3800F4073E9148E2ECE4540D36A55B7A3800F40A4945E0E25CE45408C41312A73800F40E1EFDCDD1DCE45409B0CA93173800F406CBB62091CCE454011B9B35160800F409972EC921BCE4540CECC47C5C57F0F40AB745FD30ACE45406DFFD6FCB87F0F406214CF6A09CE45408A329994957F0F40230BA56C05CE4540F0B0D018F27E0F40209E1DB6F3CD45401D82EF24837E0F40BC52160EE8CD45407FDE0A20427E0F4076238352E0CD4540BB1C79723A7E0F40FF4E3675DFCD45406C3CAFB6D97D0F40F1F623C4D4CD45404F88664C897C0F40A837F023AFCD454093EFF4E7CC7B0F40334C71359ACD4540D427D04A637D0F4002E3AD3C74CD45405E71655FEA7D0F40759505A567CD45401900946C0B7F0F40A69C3A074ECD454042FFAF412B800F40A2BD4E6035CD4540B33E1B892B810F40171C4AD81FCD45403CB6C3121A820F401073288E0BCD4540A45D785FF9820F404C7D8C9CF9CC4540852DF7B232830F40AD7F8321F4CC4540DEDCCCAB3B830F4052D78947F3CC45408A6C70E073830F4083549306EECC4540885C27CC47840F4054FC9E2CDACC45401443C259A5840F40A51EC030D0CC45404BB04567BE850F4038ECAB3AB2CC45409BC26C1024860F408A9DB048A7CC454076F4EAA92A860F4026720295A6CC4540DE613F61D8870F408F9E783F82CC45407A47F4D4CE870F40A78002C181CC454089A5FC879A860F40BF780E3D70CC45402A6F995213860F4013C4C39368CC4540C6EAB4FCDB840F401DB306A555CC4540E2EA07DC45840F40AC73646B4ACC4540118FC1570D840F4096038E6846CC45403CD9B202EB830F404367A5F643CC4540BA8E7F85DB830F40132CC4DD42CC454050B3E825D3830F40B861134542CC4540A03844FDCA830F406885F62C42CC4540E2B5DCEAB2830F408C9D56E341CC45402EA470C08B830F40A2C4C06C41CC4540C273C7E774830F4026F6932741CC45407C1B81493A830F40057E8CC340CC45406235B12127830F40AF47249540CC4540F212337B18830F404C117E7E40CC45402C60106D0B830F4017A7F65640CC45400C6FFC75DE820F40CC80E39A3FCC4540B2E41030D2820F40C4937B613FCC45409AB8309FC0820F404008A61E3FCC4540ED1329B5B2820F40500DFEDA3ECC4540886031B789820F40B2DD45EB3DCC4540FE40632C75820F40C8D7B0573DCC45401AEF70BD64820F4070AADCE13CCC454022055A6A58820F405759C9893CCC4540A1C8F42850820F4032C1DF373CCC45405E69040445820F40AF7E1CC93BCC45408E11C5EB34820F400D10162B3BCC45402C9B926A24820F403F05C98A3ACC45400F9F4A6116820F40F7A600FE39CC4540376670220E820F40A9E8F9B139CC4540D00FDCC208820F40DF75327839CC454036A94705F9810F40E6A968BB38CC45402FB921F6E5810F4029EFB4D337CC454098122333CA810F404BFD6A8136CC45403AA1D1BFB1810F4016984F5535CC4540F4219E378E810F40572132E033CC45406BBA22EC58810F40A4DD48B231CC454094B6968451810F40C041C67731CC4540D26FEA893C810F408E1469D130CC4540FA688F9D29810F404CB71A3B30CC45403F308AA01B810F405DB0A0CA2FCC4540192DA22B12810F40FCE56B822FCC45402ED8B9B608810F40632B353A2FCC45408C128F2102810F406A2B6B052FCC45405A3BFA7FF9800F4040C749C52ECC45406172BE08B7800F40C88B551D2DCC454083B991DAA7800F40F53975BC2CCC45408A7578089E800F40C9D21E8D2CCC45403B1CBD055F800F40F3D277612BCC4540A1724F1158800F40BBE7D0402BCC4540B692CE1B0C800F4059B9542D2ACC4540184B98C2F07F0F4043998FD129CC4540E51CA92AE67F0F40704100BA29CC454065833C09CA7F0F4020661D7029CC4540C57A39C2A57F0F4077352F1529CC4540562185039E7F0F40E62AB10129CC45405D05F004F47E0F403EF0594B27CC4540EED27E32E87E0F408B5FFA2C27CC454035E7E6F7A67E0F40AD4E738226CC4540F9218CD2747E0F409C87FCFE25CC4540FF5D5FF83C7E0F403112786D25CC4540432B54D5157E0F400940630725CC45400800F6B3C47D0F40A6966A3224CC4540CC81A6D4B67D0F4011CE870724CC45401E0779772A7D0F40475B615022CC4540F17EFA7CA77C0F401632F8B620CC454066D53FC88D7C0F409AEAA06620CC45406CD58D55167C0F406B2B19301FCC45407458040F887B0F406688FCBE1DCC45401E36ABAC737B0F40D587C1891DCC45407A4021B3357B0F4039E831E31CCC45402E2AD424D97A0F400FAAD9E91BCC4540C8FBFB05AF7A0F40B23C492E1BCC45402104E82D767A0F4018ED6B301ACC4540624C6DFB1D7A0F40D15FA0EA19CC4540E0710C22AF790F4064C726E018CC4540822F934B8B790F4095982B9918CC45407827B15333790F403F621EE917CC4540C02054D7C9780F40AC62881217CC454011ED7F26B9760F400913B3C612CC4540F8C1AB88B2730F40E8F862BB0BCC4540A60EEF38BD720F408142177A09CC454017AA32BCBD710F403203022707CC4540B0B6F592C1700F40477E8A0305CC4540AF3374532D700F40DDC5BED503CC4540EC36F9B36D6F0F400BC94BC902CC45405E4F83929C6E0F40287F2F9C01CC454013BFE77BE56D0F403CDF0E9600CC45408BE1BB89DC6D0F40F5DC428C00CC454011D386714E6C0F40CC0790D8FECB454063146CDA5A6B0F40FF77ABC3FDCB4540726AEE7C686A0F406F9232B3FCCB4540DE68E88C66690F409F8FFC48FBCB4540187E9B86EC680F401EEEA2AEFACB45404A8E5ED923680F408728824AFACB4540B42BCBD047670F402497AF32FACB4540C06DDC3C7C660F40AD8699AAF9CB4540DD617B83BE650F406331CB42F9CB4540C6A4184018650F40555212AAF8CB4540A1FE91F263640F40299EF780F7CB4540590DFAEBAA630F4027C1FBBBF5CB45402E96BD5F81630F40399B5963F5CB4540D4151E52CA620F40A86DAE7BF3CB45405A81A93CFE610F40408C93CCF0CB4540AF8FD7C633610F406396161DEECB4540346334B359600F403D382CEEEBCB4540CE5EEE12825F0F40A5A122C8E9CB4540A253B5C0C95E0F40F1AAD6C0E7CB454025F5BEF94B5E0F4008E040F3E5CB4540EC9F6BB88F5D0F40E7B5B941E3CB4540CC9A6DCBDA5C0F40D3FAE39DE0CB4540DA20A60C275C0F40ECE85AE3DDCB45400A18596FB75B0F4064A4FAFADBCB45407610B6FC1A5B0F403D2474ACD8CB4540F0E4F2E27A5A0F40774A8C5DD5CB4540ED103BEBB7590F40F2615130D1CB4540757E98145B590F40DCD9FD86CFCB4540F63D10D8EE580F40592F59E2CECB4540F05FD94972580F40B91A9E15CDCB454003EB373963580F40D3491FF9CCCB454010806B9444580F406547297ECCCB45407C6A541371560F40DA289EF0C5CB4540A9F076A1A0550F4014F3F47AC3CB454023EBD98171540F40CC456ECCBFCB4540E2E53E3C41530F400A8D7147BCCB4540A425A518B2520F402B4601AEBACB4540E1E7C15668520F4027ABBBFBB9CB45409E8E2EC001520F40F296B841B9CB45408BF14BF363510F403362F17FB8CB45408601EB6F77500F401AA97ECEB7CB4540B29653FB724F0F4089040320B7CB4540912CCBABE14D0F40B5528B67B6CB4540583212DF934B0F40DA14844CB5CB45400187621D8A4B0F40CD91E342B5CB4540997B2CAB554B0F40010BA50DB5CB454036B09E20EA4A0F4037E16117B5CB45400E9236CEB74A0F40AD117F1BB5CB45404E096E2E894A0F407036183BB5CB454098C86B39EE490F409BDE6670B5CB45404E2C4B6D99490F4068B63E83B5CB4540F4FC002D64490F40AA8DB751B5CB4540D68763CB0B490F402DA2A68EB5CB4540F46C2E8FD2480F4096BBD68AB5CB45409A7B6670CA480F40AED11A89B5CB4540FAADA89571480F40AAF6D69CB5CB4540E10F8220D4470F40660291AAB5CB4540C5C6A26E78470F40C2CAECBEB5CB4540255F7ECE2F470F4001E30CCFB5CB45407FE33F4F9B460F4021BE02F0B5CB4540796984C583460F404211B1F1B5CB4540485AEFCA49460F403E1C5917B6CB45409645FD7519450F40B54DA245B6CB4540F9CABBB19F440F403E442643B6CB45406406123D3A440F400C237E4BB6CB4540EC87E43365430F4089E0A458B8CB4540D7634B5F91420F406D70715EBACB45405BF3DF56E2410F4034298C10BCCB45405B427FC4A3410F40137021E8BBCB4540B6E07D04CA400F4085F8756EBBCB4540CAF59B1825400F4090D0D01BBBCB4540F0B8B5FFA93F0F406B8A23D5BACB4540B1907B07273F0F40D9E8E42BBACB454023EBD380043F0F40955DF01BBACB4540DC7CD511FE3E0F40ECA1C540BACB454057217210F03E0F40FED23DC3B9CB4540368AAA7B643E0F40651207FDB5CB454063CF8277E83C0F40C56A0B1CC8CB4540422CE1FB793C0F402ACB0290D2CB45408191659ECC3B0F40264B9EE6E2CB4540FC4A0AF0613B0F4059A0F3B6EDCB45405C848A26533A0F40D25F80A40ACC45400415CEEF03390F40F12179211FCC4540DFBB123356370F40BF74D9D131CC45406B3D37847E360F40F8C8312A3BCC454067AED04850350F408F930D2E48CC4540BFFEC7EE9F320F40431EF67965CC4540D2B5869BCC310F40CBDE6C8970CC4540F7765624D4300F402DE2CBEB81CC4540EE68F4785B300F40A6456F4A8ECC4540D5058FAEB62F0F407EF4B8A7A5CC45405039726B282F0F4044F44BB5B6CC4540D918D5C0672E0F40F7CC1AB6C3CC4540F19BEFBB852D0F40A13E409ECECC45402C0ACEC84F2C0F40126D82BDDACC4540AACE703191270F40F8BA9BA1B5CC45400394A4396F240F40AABCD1A0ECCC45402D076CCD63220F400B886E610FCD4540FEA24776E2210F4014CD399816CD4540FC8729C67A200F4038AC8AF42FCD4540E68AD704191F0F40A2942D0D45CD4540AF1C23E3611E0F400D2B5FA751CD4540E5055DAF4F200F4073315A9F62CD4540AFC0DF4FA1220F40C798487A73CD4540062DF5CEA1220F40FF5A9D877ACD4540DDD3C1E6F4270F40D989318E91CD4540FF36A201B0290F4095B570D298CD454004006A750A2B0F407CC7751D9CCD4540193414FE552C0F4060E7A0C19BCD4540084B40505B2D0F403C79DE729BCD45400CE4B5227A2D0F40F6253444C3CD454021B663DDA02D0F4065641262F1CD454079DFAFDD2E2D0F403324A33E22CE454041DD7B08C12C0F40DBBD961839CE4540764B557B622C0F402B1F14AE4CCE4540DAA5790DF32B0F40762632D25BCE4540EAD123D3582B0F40C031D09769CE4540956846A84C2A0F40F8A320C376CE45409A02C8F5D4290F40BE7225CC7CCE4540D374F090C7280F403C19350987CE4540D197C2EE65280F40B579F22098CE4540966D1BC35A280F4069442B60A1CE45403A0B37E058270F40BD0E9CA9B7CE45409C8EF0AE30270F40D52F9A59C4CE4540C52EC9781B260F409E6DE906DCCE454045B73DC294250F4064BA9207E5CE454029C1161864250F40BC7A0401ECCE454010B4885A79250F4047B65E2EF3CE4540CE04E5E8B9250F40E8CD96F8FACE4540285477F940260F40BD494F5D04CF45406DA3B2C6B1260F40B8DC0C1208CF4540CD21E99089270F4021588E710ACF4540542F3D4778290F4040FDA8B30DCF454085804C29632A0F4090210F320CCF454000C0F40DEE2A0F40F7995B400CCF4540F1ECA8F2AE2B0F402F5E223010CF4540E77C0FC4102C0F401C572AEE15CF454004B7F6B5462C0F40527A95991CCF4540CEB351A9602C0F406FD2694C24CF4540F3B5C821AB2C0F404AF6E62638CF45406095328F9C2C0F4055993A9850CF4540A58F91CB9E2C0F40FD06459B62CF4540FCCF2D944E2C0F40A379D1A671CF4540FF9641DC062C0F40048D0DC37BCF4540F9D14E5ECD2B0F406F7516D488CF454051193650452C0F40894611E693CF45406E02C15BC32C0F4056799D039ECF45404C86FAD62B2D0F40A4773B07A8CF4540	MI	PORT MARIANNE	media/layer/quartier/portmarianne.png	http://portmarianne.montpellier.fr/
7	0106000020E610000001000000010300000001000000C700000057B358F16F2B0F4019053F6A4ED0454072AC168E842B0F40D67D122D4ED04540D2A6187AB72B0F40673143944DD04540D293740ADA2B0F40E8A3E4B54CD0454072B19CBF202C0F406640AADD4AD04540CC1E14BA6A2C0F40D3A6E21249D04540955FE9908E2C0F40FE79A25748D04540042FF55D162D0F40AC3407BF47D045409AA247045E2D0F402F2BD12F47D045408C25274B7C2D0F40DA3020C046D04540E62F1F519B2D0F4035BC292846D0454085A2BF89DF2D0F406704CA3144D04540B7B75500022E0F40B4F8141643D045405C267C1F2C2E0F40659E79DD40D04540B71193784A2E0F40860B77A73ED0454098307B0D8E2E0F403F868B4C36D045409B3B1F129B2E0F403F003E6F33D045409D5F0577A62E0F4090214C9230D045408E0F05C7BE2E0F402598B79A2AD04540B354C25BC72E0F40F4ED13C928D045405B4C5F37D42E0F40F3F4DE8925D045405F41B730EA2E0F40550BF0B922D04540C80BB5DBEA2E0F4090AC4A6122D04540A5A6FB6EF72E0F403D2BC49E18D04540937AF8CAFA2E0F40A3F188FE14D04540554D741DFD2E0F40503E7DE20ED04540AB5E8B36F92E0F40BEF223520DD045401859205FBD2E0F4088FE0B5CFFCF45404CBEFA25B02E0F40CF9E3AE5FBCF45400C11393AA82E0F402BBC927CF8CF4540F9EC52939A2E0F401BFAB605F3CF4540515C2E4C902E0F407FE4F9D4EECF4540B2FC3010902E0F409BC51753ECCF454014608DD7972E0F406EC4949CE7CF45409786CCAE9C2E0F404C95A896E5CF454084DA8388A22E0F406ED11818E2CF4540C39BBC2CA92E0F4020DC679ADCCF4540BA1D1E0CAB2E0F40C5004A55D8CF4540DDC9A59EA92E0F400641FDD4D7CF45404936243B7D2E0F405C33C7D5CCCF4540F3A19FBA772E0F407903F253CBCF4540C0F174B8682E0F40661A5D6CC9CF4540BA1CDC3FE52D0F40ED00910CBCCF4540A3010B36742D0F407C81FC05B0CF4540367E5A82612D0F40515B6F06AECF45404C86FAD62B2D0F40A4773B07A8CF45406E02C15BC32C0F4056799D039ECF454051193650452C0F40894611E693CF4540F9D14E5ECD2B0F406F7516D488CF4540FF9641DC062C0F40048D0DC37BCF4540FCCF2D944E2C0F40A379D1A671CF4540A58F91CB9E2C0F40FD06459B62CF45406095328F9C2C0F4055993A9850CF4540F3B5C821AB2C0F404AF6E62638CF4540CEB351A9602C0F406FD2694C24CF454004B7F6B5462C0F40527A95991CCF4540E77C0FC4102C0F401C572AEE15CF4540F1ECA8F2AE2B0F402F5E223010CF454000C0F40DEE2A0F40F7995B400CCF454085804C29632A0F4090210F320CCF4540542F3D4778290F4040FDA8B30DCF4540CD21E99089270F4021588E710ACF45406DA3B2C6B1260F40B8DC0C1208CF4540285477F940260F40BD494F5D04CF4540CE04E5E8B9250F40E8CD96F8FACE454010B4885A79250F4047B65E2EF3CE454029C1161864250F40BC7A0401ECCE454045B73DC294250F4064BA9207E5CE4540C52EC9781B260F409E6DE906DCCE45409C8EF0AE30270F40D52F9A59C4CE45403A0B37E058270F40BD0E9CA9B7CE4540966D1BC35A280F4069442B60A1CE4540D197C2EE65280F40B579F22098CE4540D374F090C7280F403C19350987CE45409A02C8F5D4290F40BE7225CC7CCE4540956846A84C2A0F40F8A320C376CE4540EAD123D3582B0F40C031D09769CE4540DAA5790DF32B0F40762632D25BCE4540764B557B622C0F402B1F14AE4CCE454041DD7B08C12C0F40DBBD961839CE454079DFAFDD2E2D0F403324A33E22CE454021B663DDA02D0F4065641262F1CD45400CE4B5227A2D0F40F6253444C3CD4540084B40505B2D0F403C79DE729BCD4540193414FE552C0F4060E7A0C19BCD454004006A750A2B0F407CC7751D9CCD4540FF36A201B0290F4095B570D298CD4540DDD3C1E6F4270F40D989318E91CD4540062DF5CEA1220F40FF5A9D877ACD4540AFC0DF4FA1220F40C798487A73CD4540E5055DAF4F200F4073315A9F62CD4540AF1C23E3611E0F400D2B5FA751CD4540E68AD704191F0F40A2942D0D45CD454061663BE5361C0F401BE6C0EA40CD4540D65E2F3FBF170F404F33656222CD45407B8F275E76170F40789E7DE320CD45403A92387F1D170F40C9E1C2FC1FCD454063FA56ABC2160F40CA24F2471ECD4540D40AE8D569160F407A961E821BCD454051AD33BC8D140F40D308360B0ACD45402CB6A7CA52130F407842314507CD454060F5134B3C0F0F408877BE83FDCC454082E37416390D0F40BACA858BF2CC4540C0E1EC7771090F400DC24A29E2CC4540218D6EB98D040F40A210BCD8CECC45409BF6DB1364030F4037493DAACACC4540ADB9182725020F40F0EFF20DC7CC4540BF0A227000FD0E404B81448AB8CC45404A3CFF74B8FC0E40D8B4EF37B8CC454012C890775EFC0E4078867286B8CC45401BAD8442C9FB0E40C9D704F0B9CC454067FB554B1EFB0E40A78695BBBCCC45405CFABC6781FA0E40E1F6BC32C0CC4540A1C6DF106DF90E402EF4E059C8CC454025078A56D3F60E40B57E1816E2CC45404A8408524AF50E400BEB87C4F0CC4540B37196853DF40E40FB1A4A8AF7CC454065DFEA1583F30E409A688E3AFCCC4540E849C5CAD5F10E408A2297A303CD45403854424152EF0E408D652A420FCD4540516A0FEF9CEB0E408208329B1FCD454066D881D8B2E80E4065EF41AA28CD45409C42E04536E40E40D3F5403D3CCD4540903DB04E7FE20E40328E33E542CD454074D7318DE1DF0E402C8B910C4ACD4540289D5BE9D4DD0E408EAFE4AB54CD4540ACC60DB6F6D70E405FDE794971CD4540BD22782735D60E407406B5E877CD45400AE4340E0ED60E40514C229A7DCD4540A184252D44D70E408782658293CD454089767A2C0FD60E40B73F5B5E9ACD4540F44AF8ECE5D70E40044B82EDBBCD454030128A891AD70E402E60D3F2C6CD45405718B92212D90E407C163A5EF5CD4540098C1270E6D70E40EDF2482EF4CD45409822E71D00D80E405FD8436C1DCE454007B33ED6B1D90E40EC8957B220CE45400758476F27DA0E40E85E6C5726CE4540C152DF6BC0DB0E40E8AFC4AA38CE454035ACE5736EDC0E4025F3194D3DCE45405559D885EADC0E409D295FE141CE4540AD1D2ADF7EDE0E40B1B9B3BE57CE454029B6DFF001DF0E403D105C8963CE454076CC29B11EDF0E404D187E546BCE4540B683B42D25DF0E40649EFB4873CE45408C1C242FFEDE0E406EC8EA3581CE45404DFC4396A5E00E4084069AE2AECE45406CE306B021E20E406C8FEEFCB8CE45406BE1F79D26E10E408BCD4C9BC2CE4540B5E6BC48F9DF0E4051A63C70CECE45403E42A42800DF0E40C5D6C3DED4CE4540C5A867BE68DD0E40043F7376DDCE4540DC8F65D7D3DE0E40575776AFE4CE4540E6C1BF5B05E20E405E049006F1CE454040C5AA73B7E30E40471B8510FBCE4540390EE81F69DF0E40F28CA0292ACF4540AF2A2A8C28DF0E40F165C91D2ECF45400982B104F7DE0E404793992132CF4540D38193E8D8DE0E4051550CF934CF45408ACB4C4AC3DE0E405BDB80B938CF4540330C8485AFDE0E4090EA39073ECF454002E0A547A6DE0E40C0010B4144CF454005186ADBACDE0E40565E466F4BCF4540A75A7F82EBDE0E40A6B352AB63CF45402159B62E40DD0E40FD0DF24971CF4540DB0457E330DE0E40C70D8A0483CF4540FE18A48E21DF0E4030A455A791CF4540FA1B4E00BFE00E40242369BDA3CF45402FAFA13CD8E40E407C6D7C59D1CF4540DF86E827EFE50E40433B891FDFCF4540C6E14E09E9E60E40C29A4A66E9CF4540918712E2C0EA0E40454888D214D04540342F20ABF3EC0E40B9CC598127D0454096F8B56581EE0E409ED8E7CE2FD04540B9E897EA0BF50E40F62F5FF73ED04540A5D5E3F33FF50E40E24CF5183FD04540FF1C1881E8F70E402BE24AD740D04540AF30958B9AFA0E40993AD5F142D045403D36258C00FC0E4097A1457D41D045400BDDFAA872FD0E4029530ADF3ED0454002C0ED83AEFF0E40AF8BEB0E39D04540EC0073D3AA000F4082C2286335D04540AB4A7DABE6040F409E490E7923D04540FB3EB4FCDA070F40669F3B0417D045400675B9AD62080F40A569342C15D04540C4B74F3B01090F4091F4C99A14D04540B348A247EF0E0F400BAE5D6D21D04540E4DAFC7B27110F40C80A2C7028D04540324F7EEA19130F40940DE7BD29D0454019556B82C6140F40D28A65182AD045402DBDA5C6DE150F40E9E877781DD04540AC64D89FD8160F401D0F11E413D0454080CA4F33E3170F40E5FD99760CD0454058041DEFF7180F4032E8230806D04540CA98CD44981A0F404388F65800D045405CCE0221FC1C0F40712BEA30F8CF45407267352085220F4057BD4747D6CF454044196E6C43230F40C950EA0ECFCF454057B358F16F2B0F4019053F6A4ED04540	MC	MONTPELLIER CENTRE	media/layer/quartier/montpelliercentre.png	http://montpelliercentre.montpellier.fr/
5	0106000020E610000001000000010300000001000000FC000000218D6EB98D040F40A210BCD8CECC4540C0E1EC7771090F400DC24A29E2CC454082E37416390D0F40BACA858BF2CC454060F5134B3C0F0F408877BE83FDCC45402CB6A7CA52130F407842314507CD454051AD33BC8D140F40D308360B0ACD4540D40AE8D569160F407A961E821BCD454063FA56ABC2160F40CA24F2471ECD45403A92387F1D170F40C9E1C2FC1FCD45407B8F275E76170F40789E7DE320CD4540D65E2F3FBF170F404F33656222CD454061663BE5361C0F401BE6C0EA40CD4540E68AD704191F0F40A2942D0D45CD4540FC8729C67A200F4038AC8AF42FCD4540FEA24776E2210F4014CD399816CD45402D076CCD63220F400B886E610FCD45400394A4396F240F40AABCD1A0ECCC4540AACE703191270F40F8BA9BA1B5CC45402C0ACEC84F2C0F40126D82BDDACC4540F19BEFBB852D0F40A13E409ECECC4540D918D5C0672E0F40F7CC1AB6C3CC45405039726B282F0F4044F44BB5B6CC4540D5058FAEB62F0F407EF4B8A7A5CC4540EE68F4785B300F40A6456F4A8ECC4540F7765624D4300F402DE2CBEB81CC4540D2B5869BCC310F40CBDE6C8970CC4540BFFEC7EE9F320F40431EF67965CC454067AED04850350F408F930D2E48CC45406B3D37847E360F40F8C8312A3BCC4540DFBB123356370F40BF74D9D131CC45400415CEEF03390F40F12179211FCC45405C848A26533A0F40D25F80A40ACC4540FC4A0AF0613B0F4059A0F3B6EDCB45408191659ECC3B0F40264B9EE6E2CB4540422CE1FB793C0F402ACB0290D2CB454063CF8277E83C0F40C56A0B1CC8CB4540368AAA7B643E0F40651207FDB5CB45403D981BE4C83D0F4045B1E4C7B1CB45400A8DAA58453D0F4020E680CFADCB45408B3A98EE2D3D0F40FC39DD24ADCB454031734F89B13C0F40C3CA4AC4A9CB4540119F4951643C0F40331B8595A7CB45405640EB36243C0F403D3D46B5A5CB4540B9F84F72F03B0F4038DC6935A4CB454004BE176FA23B0F402B417211A2CB4540749AB0FF5E3B0F40697FD3FC9FCB45401AC6B2F3FC3A0F400C7911879CCB454050DBAB20763A0F40744E2A8197CB45405A11B58E403A0F400608F49395CB45404DD21232FF390F40071B07A192CB45408C0B1761BD390F40B070B3908FCB45406CC9886075390F40E63C61448CCB4540FE84832827390F400BAC30A988CB4540FE0D8477BD380F40B0C10F6384CB4540BA03202C35380F403F0183C07ECB4540D26E945AAB370F40462A7A5A79CB4540CD9792930B370F4055649CE172CB45407926A44657360F4072D4F5DA6BCB4540CEEAC8299D350F4033EF258464CB4540E28034D218350F40FCA76B965FCB45408AC72A18D1340F407D1C65F05CCB4540D2A9E536BC340F40105A5E815CCB4540F02349F4A2340F406D1F0A465CCB4540B7A1B9A78C340F401F3167545CCB4540106596DE6F340F40F93F8E665CCB45409DE9226D3E340F40A0E983925CCB45405A937855AC320F40A2BB9D0357CB4540A3BA4FFE90320F40FC07E3A856CB45404EA1F26741320F40F013269855CB4540EFDD7CD5D8300F40E083A24B51CB45405A5BB6F1A12F0F40FAC86A654DCB45403CF2214C612E0F400ADF628946CB4540F6F13457592D0F40944E665540CB454030226A2C382C0F4082CD82FC3ACB454001A283F8A92A0F40E7BDA30434CB4540788616C11D2A0F40D6E41B9831CB45400DF71E7B25290F40DD8211012CCB4540260107E80C290F402971B1772BCB45400EC5E2E64B280F408EBE1B0627CB454076A530886D270F4019DF3D4820CB4540B35C02C333260F4037281D5B18CB4540F6F240A4C4250F4030FE2BA015CB45403D157459B1250F402F505A1A15CB4540DB809C7A77250F400B506B8C13CB4540013EF26A6E250F402B73A03A13CB4540CA6C710F62250F402908E1CA12CB454070EADB8624250F40024E803C10CB4540A1A4B2A1FF240F40137E9B5F0ECB454001E540C0CA240F4046F7C3270BCB45407E075F96BC240F405C4723470ACB4540B98DB60599240F402BF868B507CB45406265ED367E240F4042DE16B405CB454065326DC262240F40E8E03A1E03CB4540337ABDC24C240F40109444F700CB4540078F96AE35240F40E8C1562BFECA45406D7EEEA21A240F40AABB949DFACA4540FE5077F50D240F403AD7AC6EF8CA4540119ED72600240F408D66476FF7CA4540FBCBF8245D230F40A266D5EFF0CA45407BA4A71852220F4080B0462DE6CA4540B28CEE092F210F4001F19846DACA4540B29E17E9AA200F401A657AD4D4CA4540A5FB198C6C200F4062414839D2CA45402684CE6320200F4086D2EE9FCFCA4540D20D87C2C11F0F4049384885CCCA45402396574B671F0F4063E9CFABC9CA4540A00B5997C61E0F40A8A858C5C5CA4540DCA2C73F891E0F403EE189AAC3CA45401047B5646D1E0F40D24B420AC3CA4540F84090E6261E0F400A6D6260C1CA4540CDA567B6581D0F4004FC046BBCCA4540F13743BE151C0F40B30F9BC0B4CA4540D32AC9A13C1B0F4042D5F7E3AECA4540FE474420FA190F40DA6B6E5AA7CA45407919E929AF190F40A5E69BABA5CA4540EE5156AC6D190F4016900A52A4CA45407953B51506190F404A1C332C9FCA454047A3A3DDFF180F400ED9F4DA9ECA454009E7D3A5C6180F40B9AA02EC9BCA4540E80B1EF8A7180F402F9D9C5B9ACA4540FB6A51FB85180F4055A9FFA498CA4540C681DEF868180F4050088F3097CA45405507AD5441180F40DD0A858A95CA454042B274D4F9170F40DDF3C56A92CA454043DF6D91B3170F40C4C6B9578FCA45402F39F8AB6B170F408C18F43D8CCA4540598C7E1527170F4059ED664A89CA454080B8127512170F404B58827A88CA45408A0C27B0DB160F40ABF59C8E86CA45409AAD34DD8D160F404507E6D683CA45402EDE0E403F160F40720E562C81CA454022199D61F0150F40CF310CDF7ECA454046E5E9309C150F4034E16B757CCA4540B69976DD56150F40B3B505A97ACA454068A56E24CB140F405E7C546B77CA4540634530EB75140F404785327375CA45404949AA131F140F40A881C97D73CA45408AC7DBFDC6130F40EEA11E7871CA4540FF60266873130F408C1111896FCA4540C4658F851A130F40A1A6A78A6DCA4540A2A653ED9B120F40116BC1A36ACA4540FA52DA0A43120F4059B454A568CA45408804A133EC110F40FE46E6AF66CA45402B99C99696110F40CEDD47C164CA4540D58BD4483D110F4079B183B962CA45406564D043E7100F40AB11CCC960CA4540745813324B100F40EBC8EC425DCA454083296EFDF50F0F40A69436545BCA4540DBB055B79C0F0F40EA924D5F59CA454043CB31A83E0F0F40E4892C9E57CA45405380DD6D290F0F408EBF345057CA4540BD72509AE50E0F403B82EA3056CA4540FE44D4216B0E0F40AE86896C54CA4540DF6464F50D0E0F407C1E39D952CA454089F03C46B30D0F40F75E986751CA45408F4D3A92580D0F4008732BEA4FCA4540095EF4D7FB0C0F40EC8E886F4ECA45402286D39D000C0F4061D8DA694ACA4540A124AD82A70B0F40BE838BDB48CA45400EA118294D0B0F40960EFC3C47CA4540EC51BE821C0B0F40CBD2F15D46CA4540DF84BC29F10A0F4095F4708F45CA4540AF4894BAC30A0F402990CF9C44CA4540D3E8FC88990A0F40DE261EA743CA45406C19FE3B690A0F40C16599A442CA4540216E00F5430A0F40C8ED55CB41CA45402CEC4E71180A0F403CD9069540CA454093C1D03DF0090F40907179883FCA4540897CAEEA9C090F40185F183C3DCA4540E01B4D2E4B090F40D2D81FDA3ACA4540FD528B09F9080F4047AA0E7738CA45405DD57E63AC080F40C56E55A035CA4540F0BD5BD361080F4035EE8CEC32CA4540487D00FEAD070F40323AA9DA2CCA4540070A994660070F40428733602ACA45407A65773E0F070F401B10CEBA27CA45407077C1BEC2060F408B20144025CA4540EFC52DB971060F404A8594A022CA45406233F72B23060F403EB0F31620CA4540DA3E1C98D4050F40FD4DD17C1DCA45404B1458E388050F40F9EB1BF61ACA4540BE89229436050F40243E0A2A18CA454081DEFF40E9040F40F21E0BA615CA4540BF28504A9C040F4048EAA30513CA4540A060E1F936040F40CD37EE660FCA4540E826D174FC030F40C08586380DCA4540DF7055C08E030F405BE82BEE08CA45402314C4506D030F406A21888D07CA454051E2098346030F40A6890EF305CA4540CF88D37C2C030F40B5AC41D504CA4540E8B18D789A020F40F6A04713FFC94540D814722671020F4097356E45FDC945408E82183C2C020F405268F879FAC94540FB63DFBAE2010F4061237360F7C94540BE2493BF9D010F40D436B16BF4C945409F7F921355010F4086FDF75EF1C94540AF6DE67B0E010F40F8BFA571EEC94540CA91FE959A000F409452FFE2E9C94540B53ECCD954000F40D69DCE11E7C94540ABE72D8208000F40D075E2F8E3C9454096436C59C2FF0E409E80FC1BE1C94540E9D40E8074FF0E406A92604BDEC94540AA699F3E27FF0E40C4A473EFDBC945406E42783ED4FE0E40EC747B6BD9C94540ABEE065485FE0E40E0B350F8D6C945406700755232FE0E403793CB70D4C94540187DE372E1FD0E404F57B729D2C94540FA25A7D28FFD0E40A8D76007D0C94540E92F9D4E3BFD0E40028FCCC5CDC945402EAC602FE7FC0E400D900E7DCBC94540CD57EAF395FC0E40271F5C52C9C945403D6EC2092FFC0E40A258EAB9C6C94540058C0986F1FB0E409E198525C5C94540BE47AD5FD9FB0E40BCE80FA3C4C9454046297F78A9FB0E4009C02398C3C94540312CAC747AFB0E40010269BDC2C94540E4FCF9D433FB0E40800FE0B3C1C9454041161CC01BFB0E402E7FDF5BC1C945405B8E551ABFFA0E406CEAC50CC0C94540A72158F676FA0E406C2FA445BFC94540ED38FF1A5EFA0E4038193B04BFC9454024D36C6116FA0E40949AE842BEC945401FF9F0D2F9F90E404A319FE3BDC9454040078946CDF90E408304681CBDC945409A6FC1389CF90E40F697083BBCC9454026FB525344F90E409A15BCA1BAC9454093F97D97EBF80E40D71C16F8B8C94540166E526D9FF80E40B1252E48B7C945402B85574C4EF80E4018A02A5DB5C9454031018AD64BF80E404CAA2D4DB5C94540CCB02618E9F80E40ABD488B2C3C94540204FD15B02FB0E40B2886E1FFAC9454075D5D6F134FC0E4006B9CF4D18CA45407B7F178B3EFD0E40B99C438132CA4540E6A427F77AFE0E40D8772FD155CA454032620D12FEFE0E403C33D0B663CA4540DCF251327DFF0E404DEA80CC71CA45400E13AD2E17000F4032E2140085CA4540C97CE3ECB7000F406F3E41CF9ACA454021B7C6C252010F40B0A0BF0FB0CA4540D420992660020F40D7025C34E0CA4540502F06E0DC020F40043BE235F7CA454098724AA007030F40FF1BB76B00CB4540FB07A4B472030F4019E647A62BCB454046493451EF030F4010D441F65DCB45408C617BB636040F4042290A5184CB4540140949D541040F403BA31331A8CB45408585D29C69040F4020129E64DFCB4540F3F8478663040F4064AE9513F5CB4540C44350A57D040F404826AF4C42CC4540DE7D1B3365040F4061884FF78DCC4540218D6EB98D040F40A210BCD8CECC4540	PR	PRES D'ARENE	media/layer/quartier/presdarene.png	http://presdarenes.montpellier.fr/
4	0106000020E610000001000000010300000001000000BC010000218D6EB98D040F40A210BCD8CECC4540DE7D1B3365040F4061884FF78DCC4540C44350A57D040F404826AF4C42CC4540F3F8478663040F4064AE9513F5CB45408585D29C69040F4020129E64DFCB4540140949D541040F403BA31331A8CB45408C617BB636040F4042290A5184CB454046493451EF030F4010D441F65DCB4540FB07A4B472030F4019E647A62BCB454098724AA007030F40FF1BB76B00CB4540502F06E0DC020F40043BE235F7CA4540D420992660020F40D7025C34E0CA454021B7C6C252010F40B0A0BF0FB0CA4540C97CE3ECB7000F406F3E41CF9ACA45400E13AD2E17000F4032E2140085CA4540DCF251327DFF0E404DEA80CC71CA454032620D12FEFE0E403C33D0B663CA4540E6A427F77AFE0E40D8772FD155CA45407B7F178B3EFD0E40B99C438132CA454075D5D6F134FC0E4006B9CF4D18CA4540204FD15B02FB0E40B2886E1FFAC94540CCB02618E9F80E40ABD488B2C3C9454031018AD64BF80E404CAA2D4DB5C945407E5E55BFF3F70E4052355F3AB3C945400295E7BA8DF70E40F49C9AD5B0C945405B76B5CD36F70E40FCF67FA1AEC94540E107B2822AF70E40254A4856AEC945402492F1AB05F70E402D2C938EADC945407A23B907D7F60E404206819EACC945405725B341CFF60E40A276E276ACC9454002AAD9B467F60E40155DEB49AAC945402C2BB2C7EDF50E4078E237D4A7C945406DEEFB2FDCF50E40A3CB9F79A7C945404204BBABBAF50E40F6A191E1A6C9454085D7543480F50E40DB0F20CDA5C94540E591C7104BF50E403DEDBCD9A4C945404DE116A51BF50E405F5AE4FDA3C94540B3B7B065F4F40E40C56D0946A3C945402680E0C3B1F40E407DB74E12A2C945405382DAF8A7F40E40D925D8EFA1C94540723D1CF360F40E40D76EE7E9A0C94540954B80F119F40E40F52667ED9FC94540719F0F71EBF30E4084F09E549FC9454063FFDCCEABF30E4026315C839EC945404E80C7996CF30E40E72BFBBE9DC945404498DEB132F30E4054A2270B9DC945407E55E1C0B6F20E402ABDA89A9BC94540634F4542A7F20E40A315436B9BC94540ED9C64F14BF20E40D85F70619AC94540F8AFD468FAF10E402CF6FF7299C94540BDED9A14B3F10E40BF4D79AA98C945400849FDE780F10E40AD57510498C9454028D0A04A08F10E404E73D1C596C945408E942F5DF4F00E400679F9AF93C94540FE3A1FE8DDF00E40BCFB7D5E90C945407EBA46DFBEF00E404148B1ED8AC94540357B1A5180F00E402345C0D382C945405F95DA2760F00E407E508A997EC94540DA58854353F00E40A06233D77CC945406C1D9B6640F00E40B64B3F5F7AC945407946BF782DF00E404EB001BE77C945405E8344EE1EF00E40AB8E7FEB75C94540C014ED6615F00E400F9DC47274C945401B0117420CF00E4094C7F9EC72C94540A1144F8EFDEF0E40A60352B76FC9454068AFD2AAF3EF0E40EFBC495D6DC945405E15511DEBEF0E40BD2B4E4D6BC945408BEDB5B1E9EF0E40E35C2CCE6AC9454070BEC502E1EF0E4029F57F6A69C9454035A3E8D9D1EF0E40873DCB1267C945405261FB92C4EF0E40A835825D65C9454047618871A4EF0E40E97EE03362C945407065CA6D74EF0E403D25ABE65DC94540A1A92DC652EF0E4054A2B9FA5AC945401E7BB6FC31EF0E400DE4FE3158C9454092C3875E23EF0E400BB1D32C57C9454047B7A3B4FDEE0E409746415F54C9454064AB8752C6EE0E401B2FDCE650C94540EF25B7BFADEE0E406591C6594FC94540FC3F22136FEE0E403AC2DAE84BC945401566054733EE0E402452E98E48C94540669D17B5FBED0E40B6DD6F9F45C945407A88A2D0B9ED0E40AAC3B93F42C94540F54845B39AED0E40C574049340C945405DEBC4B66EED0E401E68A32E3EC94540A1B3CDF6F7EC0E405A719F8E37C94540FD85087EDCEC0E40030468DC35C94540564A5E5A5EEC0E40B895A1072EC945402D5A2F414DEC0E40FE407FE52CC945401A21F1BE27EC0E40C6F876772AC945403A13327D0DEC0E404D1ACDC328C945406E533FE708EC0E409191E97628C94540B3282139D0EB0E40D3BBDCCA24C94540881926F897EB0E4040B0B32B21C9454033DF882060EB0E403389FF8F1DC94540ABE49C2129EB0E40E943850A1AC94540C175EEB4F1EA0E408900CC7516C94540083F98F1BBEA0E40C95581F912C94540708FC20688EA0E402063580A0FC9454003F091B94FEA0E40AAD5824C0BC94540183B37B51AEA0E401467BEA607C945406388440EE4E90E407BDD11F903C94540FBD5136AADE90E4096387B5200C9454095996F9377E90E4056D6CFA5FCC84540D216DC52EEE80E40FC1F3469F4C845402D54F0F7B6E80E40A096F1FEF0C8454009D0A5787BE80E4066524B5FEDC84540BD547D4543E80E40F3C5F7DFE9C845400664E8EC06E80E4025A5E728E6C845404E86D555CEE70E403A7D17B3E2C845407281AC2796E70E4032BB923FDFC84540C908D93D5AE70E404821EC98DBC845400EC50FFD1FE70E4015DB8409D8C845404F93B876CEE60E4056257A1FD3C84540E02017FE92E60E405E97278FCFC84540EF925E675AE60E40FDE45919CCC84540CDC4B6F11EE60E40BB141990C8C845402280D2B9E4E50E40E5FBEC15C5C845401995DFEE83E50E4087B0F689BFC845407A56F4C649E50E40A4C8B636BCC8454073F53EB20CE50E409A55CEADB8C84540271F20C2D3E40E400467495AB5C8454082748BA094E40E40996DAAC3B1C845403E17AB725AE40E40C8001261AEC845406D085F0350E30E40D49B9CBB9EC845400549A0C324E30E40FBBE4D249CC84540BE2695D3F9E20E404713EE5199C84540B2405451EDE20E408494DC7D98C84540F93C91DDE2E20E40C33B0BBB97C84540A8074D0AC6E20E4082E499B095C8454098B4C321C0E20E40F9DEBA2095C8454001C66580BBE20E40BE1986B794C84540095B951EB5E20E40DC2345FD93C84540EB050257A2E20E4053CFA8B591C84540D2948FA09DE20E40B9498E1891C8454049031E009BE20E40BDA8939F90C8454056C5B2A399E20E40DEBF014590C845403C059AC097E20E404ACC099F8FC845406C437CF99CE20E40648648808DC84540D7AA992EA0E20E4058D21A698CC84540FF5D83D5A0E20E409ABFAB048CC845408E06B235A4E20E405128A8578BC84540313CC7C6A8E20E40C2FADE998AC84540029D083E85E20E40851892048AC845409D4DC43A6FE20E40E33B82C289C845400DD4297070E20E40821C6ABC8AC8454038076E7971E20E403134CB498BC845406C49C6B572E20E407D2334548CC84540427F12286FE20E4001EF19908EC84540A4F6FA2B6DE20E4064338DAA8FC8454090203FB866E20E40E8B56BC290C84540896F62C955E20E4078D7710294C84540FE5CF52D50E20E4020165F2F95C845404023998944E20E40410F2A7B97C84540CAD16C1242E20E4066EF836698C84540F32C6B4235E20E407F0BD5CD9CC84540EA25546C21E20E406D96B5DFA6C84540405583651FE20E402AFE36E0A7C8454060A3256111E20E40F4313752A9C84540A24129F605E20E40A0D29D2CAAC8454076B80FABD7E10E40BC76B40EAEC8454006598028B5E10E4066A45BFCB0C845403984250A9EE10E40953019FFB2C84540B48942CE7CE10E4021273D12B6C8454076E754BE51E10E4046345FEBB9C8454033789D6C48E10E40C51829F2BAC84540B2E8A20C2CE10E40D58287FFBDC84540898231EE21E10E40DD35910DBFC8454021AD99B806E10E402054D6FAC1C8454083A7B473EFE00E40FA01179EC4C845407427CABCC3E00E40E6A08BDAC9C84540B4239AA0AAE00E40861532F4CCC845404EBE7B639DE00E40C837D950CFC84540607149BC8CE00E40D2CFEA42D2C845409EE51E937AE00E40327C4A7DD5C845403CE829F36FE00E4073D7CA4BD7C8454053DCF52363E00E4097CDB0B7D9C845409067A8A458E00E40898365D6DBC845403DFF1DD14DE00E4030BD8C25DEC845402A792CF03AE00E40EECCF799E2C84540CA46B28D29E00E402A59D1BDE6C84540B3015506FDDF0E407D7FEEF4F1C845406094EBEAECDF0E4003FA623FF5C845406D7B72A3E9DF0E40051CBD29F6C845401021B5D3D7DF0E400D2CC141F8C84540813FFBF4D1DF0E40875088C9F8C8454051966E2BCADF0E4046985997F9C8454085EC541BC3DF0E40D1D0BA2EFAC8454074667068A5DF0E4038BB3DFAFBC84540B525D80C99DF0E40CC539984FCC84540D8FE687C91DF0E40811DE8DFFCC845400A0540817FDF0E403293B08DFDC845401CA3E7C85CDF0E4003F083F9FEC84540CC851EA147DF0E40CD6AD4D4FFC8454060C6AFE136DF0E409685F88C00C94540F3F79BFF00DF0E40F24840BD02C94540CC300207F1DE0E404141FC5F03C94540FE9007E3B5DE0E401227D79A05C945407148AC396DDE0E4053EB868208C945408EDF6A2C20DE0E401BF5FA970BC945408FDB766811DE0E40EC0362330CC94540D37FA9BDC4DD0E4019BEC73B0FC94540F7EACF4681DD0E40FB8B23F311C945402D1127915ADD0E40ABA84A8A13C945405D8930A856DD0E4045872EE713C945401F82E1C048DD0E40B88B3EA214C94540DDB1B20C44DD0E40263EEC0915C945404A4C683629DD0E40F3F525E416C94540BFA14A5900DD0E406956892A1BC9454037315B2ADCDC0E404B120CFA20C945403C0C315FA4DC0E401FE7FD702DC945401B852BAF84DC0E40CD91D65531C94540250A893A7FDC0E4094716BE331C94540CCBD66825EDC0E408E645B3E34C945403DAD53284BDC0E40C85BBB8B35C9454075F0D36424DC0E4044A1BF0038C9454000CA059F0CDC0E40202A086939C94540C2E95F63C5DB0E401F7BFAD63DC945406FD28FC888DB0E40818DAD7741C94540F03ABD06B3DA0E40DC414C9F4EC94540814D87ED39DA0E401C5D772756C94540BFDBBFCDCFD90E4062214A985CC94540A4597473BCD90E40A330ABE55DC9454014BEDF5623D90E40CAA2E18867C945402F75D1EA19D90E4038F7F84F68C94540446EB6C13ED80E408305F12B74C9454030C4D7C900D80E40F50D107277C945402203626CC4D70E4098D517AC7BC94540C65FAA16B3D70E40339923F37CC9454033A934942BD70E407FCA84FA88C94540BC797AE417D70E40C4CBFA758AC945404A10DBBAF5D50E406F3F915A9EC94540A96C77C3CAD50E4046A4C776A0C945400EA58326A0D50E40D8B3F071A3C94540D2778E3C84D50E4015844DA7A6C94540F42845B15CD50E40C63CF432AAC94540EC511EEA37D50E4095C5FA8FADC9454056E1AD7426D50E4063252A89AEC9454098C2BD6315D50E40383F017AAFC945401D991CA8F5D40E40648EEC45B1C94540A4C65E1BB9D40E40101A950DB6C9454091F4DD6AA7D40E40031FDC75B9C94540A96FA8CC95D40E40D4ADF80ABDC945409EC7820A8CD40E40547A05FFBEC9454025EDFE877ED40E404E0E3BB4C1C945406A07F6F172D40E40CCE0F026C4C9454074CFE5956AD40E409497178DC5C9454075491FE144D40E40801D48A1CAC94540F1D016083CD40E4036B29FD3CBC9454077F16BE623D40E407ECAF55BCFC94540CCC855ED08D40E40C7A6B9E3D2C94540DA5083EEF9D30E40CB9A55EFD4C94540575288B2E3D30E40FCD7A824D8C945406A79F480DAD30E4084A8D47CD9C94540883B83C5C0D30E4024D1AD13DDC945405ABE35F4A7D30E404E5338EBE0C945406D876A15A1D30E40B27847FDE1C945407F8AD4409AD30E40DE2C1B28E3C94540790A699093D30E40F79C82ACE3C94540D1752FC873D30E40C4BCC359E5C945409C72697867D30E407614C802E6C945404B546C8D63D30E4009F0F15AE6C94540BDF984BC5BD30E4026CA3A18E7C94540E98229BA4AD30E408529B52DE9C945409180410237D30E4068EE5996EBC94540CE78297F1AD30E40648C8B53EFC94540FC2C1D890BD30E4041857F75F0C94540CAF6E64EFFD20E40D7029753F1C945406E801723C6D20E40C9649B70F5C94540AEFE0D4795D20E40688AD908F9C94540CE04E1143FD20E401B57D69FFFC94540DE0F99EF23D20E4067AF02BB01CA4540D891A365F8D10E40E248CC7005CA4540557897D1BCD10E40472B16A00ACA45401D1F13885FD10E401B742BBF12CA4540A038610041D10E40264DCE8315CA4540D4AC106C1FD10E40907B01C518CA4540C3587007C6D00E4014BD847C1FCA45404AA3F0F601D00E40D51984592ECA45401D3B949574CF0E409099D2F738CA454067FD1D2CC5CE0E40655A41BC46CA45409A0F717833CE0E40859992B752CA454007190BED4DCD0E400FE4BB1D66CA45402330F29D0DCD0E40635DDEA86BCA4540A9EBB913FFCC0E40416858D56CCA4540200C2B8EF5CC0E40AF4C135F6DCA4540A5CD5998CDCC0E404CE35CE86FCA4540B5963F5ABFCC0E403E5F53D070CA4540EF2B8F7F81CC0E40C4FF9A6674CA4540DB9AE9DC72CC0E40369CE95675CA4540EC37CF496ACC0E403E52963676CA4540E30BB2F64DCC0E407AFDF76B78CA45402B14D5E9E2CB0E40819076AA83CA4540CBA554BC50CB0E40A9C0B28293CA45406B51BD20E8CA0E401CE8BFC79ECA4540629A91D9DECA0E4012B602EC9FCA45406D9255C9D4CA0E40F3E3F520A1CA454030B02185D0CA0E409805C89DA1CA45401F0A10BE48CA0E4080042015ADCA4540EC9D487CDCC90E400BE2005CB6CA454093DE19AC79C90E4004A397E7BECA4540201670523BC90E4065B32C4AC4CA4540B3EFE04C0FC90E40721921D3C6CA45407082CDCCEAC80E40CAD77AE4C8CA4540DCCA7A59D7C80E401BE407F8C9CA45406BD7B67A82C70E4026A2E115D7CA4540C0A2E78E5DC50E4035DB1D99EBCA454069F86B680EC40E40B0AF8ED0F4CA454021B2CB48F5C20E40AE97D126FCCA4540C44916E173C20E40AB14705402CB454034B2230205C20E403B3D742B07CB45407A849BD76BC10E408E82E4C609CB45404888FFA1DAC00E4060232F010ECB4540FCF55CDA56C00E4000B4FD5413CB45407A26CBCA6DBF0E40B6E7372A21CB454096B7628961BF0E40198FF7F821CB454071A7464257BF0E40C2886FA722CB4540FCF5DC8E4EBF0E407E20113823CB45407430AACFE5BE0E4093328E2C2ACB454054898497AABE0E4099B441462CCB45407CD87CFD31BE0E40A970F72330CB45406BBF19F3CCBD0E40C2754E3132CB454055AC272C81BD0E405EE4508135CB4540D97770FE45BD0E40A9CF61B738CB4540EA0B009ED4BC0E40B4D4AC6B40CB45405D9A703261BC0E406456221848CB4540B9D4CFC537BC0E4095B5100D4BCB454099B76C7FF2BB0E400E1E9E6750CB4540C76D8FB1E2BB0E400E5B327951CB4540605EB8E4E6BA0E406EC6A73262CB454003D903EBD1BA0E40792E698763CB4540F98F76B9AEBA0E40ECEFD0D565CB4540E5A3E1816FBA0E40AA6E8B1E6BCB454024D10F6E10BA0E40BA169EED72CB45409C74423DEDB90E40EA2D603E75CB45408D63F5A49FB90E406B4C0D1A7ACB45407A19F50470B90E4003AFBBCA7DCB4540CE249BBEE2B80E40A1FE70CF88CB45409A6C2404D1B80E403DCD1B278BCB45401659499EABB80E401507E50B8FCB4540AB7B17BF61B80E40775B3F1D97CB4540900367AEE0B70E405B75E536A1CB454063A160C36FB70E40E99DC416AACB45407AE5086C62B70E405E3DB63AABCB4540C19CF72D4FB70E405F28E4D5ACCB4540D4D0F9951EB70E40EFD2AC29B2CB4540933F54DDF1B60E4099EE9F06B7CB454036984EA5E9B60E40BDFDB6C8B7CB45407DF52CA5D5B60E40DF4E4786B9CB45402B6127D38CB60E4095F9222DC0CB45403B25CBDEDEB50E40592684BFCFCB4540CB79652DABB50E4001D4ED6FD4CB45408D78755E72B50E400C39E786D9CB45400C12E54B64B50E40068AE9DEDACB4540047AD1BA4CB50E40078A15D1DBCB454092999AE9D6B40E40C963C497E0CB45404C173F4572B40E40D85158ADE4CB454031E1B9E74BB40E404090882BE6CB45401730C05E3AB40E40201635FAE6CB4540978AA39F0AB40E40374C205EE9CB4540F9331BFAF0B30E4095695033EBCB4540E22AB754E6B30E406C9B9FFAEBCB4540EC6DBF1DCBB30E409CA888F3EDCB4540D56E77F6A4B30E409364CEFBF0CB4540D6E6C41B74B30E4087902FA9F4CB454008D2831E40B30E40AD5F069EF8CB4540B36172AC36B30E4039A1775AF9CB4540E665AB2B31B30E40D760EBCCF9CB45406C575D5601B30E4008F70303FFCB4540DBD856B8A9B20E40C4869E4008CC4540836BB45B7DB20E407F0886030DCC45409D0ED52850B20E409C3817B611CC454030A86ABB2EB20E408C24106013CC4540C9781A9B1FB20E4067F5B51D14CC4540AC814FC9FBB10E4050F056E315CC45407ACA70DFEDB10E4047A25C9E16CC4540AE802A0FC4B10E4067E142A018CC454093E5AFB3B9B10E40A2322D1D19CC4540B2009791B2B10E405C503F8B19CC454094A3B527A1B10E40760AC7A71ACC45402760A64584B10E402037B8841CCC4540D12C7A0B72B10E40F27F3DA01DCC454078BD5C2E54B10E40A3AE6C1420CC4540E168EC1907B10E4039FEDB4327CC45402BE35C0ECBB00E4073D6EF642CCC4540174EFD41B2B00E40485FB6522ECC45400B35C3F7A3B00E40E609B2202FCC4540C5C63A869CB00E40AE7131CC2FCC4540183C0B0C97B00E408A25264F30CC4540E847885189B00E4067DA238031CC45409A6ABCC5C9B00E401F9F9D5735CC4540A48E269324B10E401294621538CC454024ABB33F58B10E4040384F6538CC4540E6ABE8988CB10E405701316039CC454008568E40BAB10E40683978DF3ACC4540D793200DDDB10E4023E2C5A03CCC454027449C53F1B10E40413C3E9A3ECC45405D37D336FAB10E4026E09C8540CC454062677A45FDB10E4093B7A71844CC454038B4E56CF2B10E4038D9316A47CC4540AA214435D7B10E40946B87654ACC454080694EC0D0B10E405AFB56834CCC45400C900DC6D8B10E40D22CA94C4ECC4540AEFA56DC27B20E4077D6673654CC45400F3A52E6B0B20E40D62BAAE459CC4540CE03AAEE57B30E401689BB735ECC454033F83BDA53B60E403D161A9A6BCC454039AC25A223B80E40AC0B3F5079CC454035A590B28FBB0E407E3341DF9ACC4540B24D0D33A0BC0E40F3B41A4AA6CC4540F3AA9E078FBD0E4036E809C2B2CC4540959F6F0B6FBE0E4036225AB5BDCC45401CDDD92CC3BF0E40EDCDC6B5C9CC45406B9620D4EAC20E40CB8C4E86E3CC4540F47A217F18C50E40257E6965F1CC454063E0682029C60E40B2121107F6CC45402F35BC6DB0C90E4011AD7344FACC45400E2C9B67EFCC0E40093A6744ECCC4540F082F7525FD00E407A15F6EEFCCC4540FDDC2BEE05D70E40B69FC12B28CD45408D830EFD71DC0E40DFEC886848CD4540D80213ED66DD0E40C3FBD5C04FCD4540289D5BE9D4DD0E408EAFE4AB54CD454074D7318DE1DF0E402C8B910C4ACD4540903DB04E7FE20E40328E33E542CD45409C42E04536E40E40D3F5403D3CCD454066D881D8B2E80E4065EF41AA28CD4540516A0FEF9CEB0E408208329B1FCD45403854424152EF0E408D652A420FCD4540E849C5CAD5F10E408A2297A303CD454065DFEA1583F30E409A688E3AFCCC4540B37196853DF40E40FB1A4A8AF7CC45404A8408524AF50E400BEB87C4F0CC454025078A56D3F60E40B57E1816E2CC4540A1C6DF106DF90E402EF4E059C8CC45405CFABC6781FA0E40E1F6BC32C0CC454067FB554B1EFB0E40A78695BBBCCC45401BAD8442C9FB0E40C9D704F0B9CC454012C890775EFC0E4078867286B8CC45404A3CFF74B8FC0E40D8B4EF37B8CC4540BF0A227000FD0E404B81448AB8CC4540ADB9182725020F40F0EFF20DC7CC45409BF6DB1364030F4037493DAACACC4540218D6EB98D040F40A210BCD8CECC4540	CX	CROIX D'ARGENT	media/layer/quartier/croixdargent.png	http://croixdargent.montpellier.fr/
\.


--
-- Data for Name: reverse_geom; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.reverse_geom (id, geom) FROM stdin;
1	01050000206A0800000100000001020000000700000098A624A136812741793B727BCBF457413984A189558127412AF0BC57C7F45741E2B4B5EB9C8127415343830CB6F4574194D36C7EF481274148CF9DEF9CF45741AE503C3D6A822741FFB327438AF45741E9EC2005C48227414092D5797DF45741B96DBC48C3822741E1A569D06BF45741
\.


--
-- Data for Name: selection; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.selection (id, "group", geom) FROM stdin;
1	group_a	01010000206A08000072B2BCA495200741582EE2F77EEC2B41
2	autre	01010000206A08000010D23D75D8A70B4189D15E7A6AE62B41
\.


--
-- Data for Name: selection_polygon; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.selection_polygon (id, geom) FROM stdin;
1	01030000206A08000001000000050000001CEC9B0989AE03419C58A1D8A97E2B410886917FAFB8064104FBD00802822B41FDDA4DDC5CB3064118886F09A5392C415C77FE088CA003414DAF0201413D2C411CEC9B0989AE03419C58A1D8A97E2B41
2	01030000206A080000010000000500000035C390A8C6630D412034B65258892B416332D21140811041AB6D51FC538D2B41298191CC9A731041229009EAA92D2C41787F6CA730590D41B5BF8C8FD6312C4135C390A8C6630D412034B65258892B41
\.


--
-- Data for Name: shop_bakery_pg; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.shop_bakery_pg (id, geom, name) FROM stdin;
2	0101000020E6100000A0CD509C25750E4096E89FF856D44540	fgeajwprkl
3	0101000020E61000009CE5F1C4C0DA0E4047043C6C5DD54540	fjcujcyzgf
4	0101000020E61000004E9CD1A6A3690E40956CEAD4A3C94540	pgtcyjasms
5	0101000020E61000009ECFEB4F68340F40BC08282A6BCC4540	kgwaygnmfi
8	0101000020E6100000AB8A54B61EC90E40210B79DF04D84540	zilsrrrltf
9	0101000020E61000004B3280A645FB0E40C7C56C5652D44540	bxmlxnoaok
11	0101000020E61000003A6DC25EC9E10E405064925050CC4540	pqdfzypdia
12	0101000020E6100000105FD05900800E408C87F40010CD4540	imihgfrznp
13	0101000020E6100000EF1C196CF5700F40D5937E8A3FD14540	yzihrycjmf
14	0101000020E6100000185DC095273E0F402D10C8203BD04540	jsncvnfjym
16	0101000020E6100000AE502EB51E660E4093A7946872C74540	ohwheojhyq
18	0101000020E6100000D0F106E1911B0F40957AE6993EC84540	bxaqbwrkbz
19	0101000020E6100000019DFF5627200F4055E04CD8E2CA4540	cwwmyjlclj
21	0101000020E61000006E7287D967280F402AF5498937D24540	gdrqiiqjhq
23	0101000020E610000090C039CEBCBF0E40D61F124EFDCE4540	eyaqhbmuqi
24	0101000020E610000050BB831EB8970F40DE9C63977CD24540	rlwyfwejpp
25	0101000020E61000004683A70DB92F0F4075CCA87F2FD44540	tymcjjhqod
\.


--
-- Data for Name: single_wms_baselayer; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_baselayer (id, title, geom) FROM stdin;
1	BaseLayer	0103000020E610000001000000050000000077401A836C0E406218402DF9D34540F368B4E6EE6D0E40BE2FFD7034C84540064D1A2727DB0F40E97A89E64FC845403177BEC1E3D60F4021A5CF131AD445400077401A836C0E406218402DF9D34540
\.


--
-- Data for Name: single_wms_baselayer_two; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_baselayer_two (id, title, geom) FROM stdin;
1	BaseLayer	0103000020E610000001000000050000000077401A836C0E406218402DF9D34540F368B4E6EE6D0E40BE2FFD7034C84540064D1A2727DB0F40E97A89E64FC845403177BEC1E3D60F4021A5CF131AD445400077401A836C0E406218402DF9D34540
\.


--
-- Data for Name: single_wms_lines; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_lines (id, title, geom) FROM stdin;
1	Line_1	0102000020E610000003000000F9B211BC9ED60E408E3A65F50FCD4540540A8151ACE70E40CE34022A99CD4540959FB13B18FB0E408E3A65F50FCD4540
2	Line_2	0102000020E610000003000000D834E225840E0F40D9FC65426DCD454033359F5F9F390F408A58458ECACD4540E7426E59180D0F40EA80A308B1CE4540
3	Line_3	0102000020E6100000030000004DFF1B7EAC020F404E56A30FE0CA4540832F0ED991310F406B3AC4F516CB454059AEB7E2E24F0F40D560CC5F30CA4540
4	Line_4	0102000020E61000000400000050B8E50891B30E40DBAB490552D0454043B2974868800E40FF555E11C5CD4540BACE6CE9ABA80E40EE7C290001CB4540DF96F95476D90E405E6107B231C84540
\.


--
-- Data for Name: single_wms_lines_group; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_lines_group (id, title, geom) FROM stdin;
1	Gr_Line_1	0102000020E610000003000000ECF2811770260F40C0783E418FCF4540560909F88A1B0F40B5BD472386D04540D487F5C7C00E0F402B69E0A680D04540
2	Gr_Line_2	0102000020E610000003000000DE3BA83FCE0D0F4090257F710DD04540A95D512D04130F40C0783E418FCF4540F7A6348F7D250F4084DFE2DF5DCF4540
\.


--
-- Data for Name: single_wms_lines_group_as_layer; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_lines_group_as_layer (id, title, geom) FROM stdin;
1	GrL_Line_1	0102000020E6100000050000005C0C30581F350F40AE3AB89756D14540368BD96170530F402696EF0472D1454004AD824FA6580F40DA545E06B2D04540A0A160428B480F40B407A0CA49D0454075CE6E03C1320F40F8F619FFBCD04540
2	GrL_Line_1	0102000020E610000003000000A152EC59042E0F40D13CCBCB09D1454094446026702F0F4020530203F2CF4540858548DB624B0F4023B1837FF7CF4540
\.


--
-- Data for Name: single_wms_points; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_points (id, title, geom) FROM stdin;
1	Point_1	0101000020E6100000D4E246DD68DA0E40F6FE852F6FCE4540
2	Point_2	0101000020E61000009F4B2640BA2E0F40BC7596500ECF4540
3	Point_3	0101000020E610000086E099F00A170F404BD17ACF65CC4540
4	Point_4	0101000020E61000000FC4C44FC7EE0E404BD17ACF65CC4540
5	Point_5	0101000020E61000005E67816DC7000F40DD6303E4BDCF4540
6	Point_6	0101000020E61000003BD9D5F0D5A10F40C372465718C94540
\.


--
-- Data for Name: single_wms_points_group; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_points_group (id, title, geom) FROM stdin;
1	Gr_Point_1	0101000020E61000008E4139C6DB150F40C481FBED12D04540
2	Gr_Point_2	0101000020E61000003CEDF090621E0F40FC92BD25BBCF4540
\.


--
-- Data for Name: single_wms_polygons; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_polygons (id, title, geom) FROM stdin;
1	Polygon_1	0103000020E61000000100000005000000B4C30716ACC30E40483F48BDBFD04540DF96F95476D90E408FC7AF52D9CF4540353DDDD20A050F401952B198F6D0454072CFE65CE2FE0E4016AE93289BD14540B4C30716ACC30E40483F48BDBFD04540
2	Polygon_2	0103000020E6100000010000000500000084D85B7D9F4B0F4016605975F6CD454091E6E7B0334A0F4093FE883C2FCF45409B925CB5D57D0F407B4B94215BCF454058FD2BCB696A0F4019537694BFCD454084D85B7D9F4B0F4016605975F6CD4540
3	Polygon_3	0103000020E61000000100000006000000ECA485880AD80E404588118DE5CA4540FC5B5F60ACF00E40C7E5AC6425CA4540ADB8A242ACDE0E40E0E730B56AC94540233468B24DB80E40739AD9C084CB4540FE639DD317BC0E40EA2CE38FE7CB4540ECA485880AD80E404588118DE5CA4540
\.


--
-- Data for Name: single_wms_polygons_group_as_layer; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_polygons_group_as_layer (id, title, geom) FROM stdin;
1	GrL_Polygon_1	0103000020E610000001000000050000004047CA4CE91D0F407A324B0E1CD24540369317D5DB1E0F4095FB91B52AD145408736D4F2DB300F402472445BAED14540721DE3EB474D0F40666B678A21D245404047CA4CE91D0F407A324B0E1CD24540
2	GrL_Polygon_2	0103000020E61000000100000005000000DDDCB770705C0F40B407A0CA49D04540C71A79C5CE5E0F408F1E65FD7CD145401B180F9F55700F4034D366C414D14540B75B617AC17A0F40B407A0CA49D04540DDDCB770705C0F40B407A0CA49D04540
\.


--
-- Data for Name: single_wms_tiled_baselayer; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.single_wms_tiled_baselayer (id, title, geom) FROM stdin;
1	TiledBaseLayer	0103000020E610000001000000050000000077401A836C0E406218402DF9D34540F368B4E6EE6D0E40BE2FFD7034C84540064D1A2727DB0F40E97A89E64FC845403177BEC1E3D60F4021A5CF131AD445400077401A836C0E406218402DF9D34540
\.


--
-- Data for Name: sousquartiers; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.sousquartiers (id, quartmno, squartmno, libsquart, quartiers_libquart, geom) FROM stdin;
1	HO	HOS	Plan des 4 Seigneurs	HOPITAUX-FACULTES	01060000206A080000010000000103000000010000000D010000DBF97EEA1D6F274151DA1B0845F857416FF085493E6F2741D5E76ACF46F85741D712F2C1806F2741BC7493004AF85741CC5D4B48826F2741A4703D664AF857416C787AE5A56F27411283C00A4CF85741E4839ECDAF6F274141F163804CF857411973D7F2F86F27410000007850F8574101DE020982702741F54A592A57F85741F241CF26E47027414BC8078D5CF8574109F9A0071F71274107CE195560F85741C7293AF24071274176711BD962F8574102BC057245712741257502CE62F85741280F0B55517127419CC420EC62F85741CBA14536567127418FE4F2F762F8574111363CDD5E7127414182E25B63F85741234A7B83AC712741D509685E67F85741DC4603D8C37127413EE8D98868F85741D3BCE3B40C72274124287EF86BF85741A1D6344F1A7227419CA223856BF85741E8D9AC9A507227415C8FC2D969F85741D42B65D9FD7227412C65198A64F85741E02D90609573274183C0CAE95FF857410E2DB2FD9B732741C3F528B05FF85741E5D0223BB5732741E4839E8565F857412FDD24E6DE7327411B9E5E2D6EF85741BE30990AE073274152B81E756EF85741674469AFE07327416DC5FEC26EF85741AF25E483EA732741C217261F74F8574193180416F57327413BDF4F617BF85741AC1C5AC4F6732741C66D34587EF85741764F1E56F97327419BE61D9383F85741D42B6599047427418A1F63B683F85741C58F3177117427417FD93D7D83F85741F38E5314177427413EE8D94483F857412A3A92CB27742741C7BAB89982F85741EF3845C72E742741FF21FD4682F857418A8EE4B24574274148E17AE082F857418195436B73742741B7627F2584F85741371AC0FBCF742741EE7C3FA986F857415C204171F87427414B5986C887F85741827346D4FB742741A323B9F487F857412B871639FE7427410C022B3F88F857417FFB3A5009752741454772E191F857415E4BC8871F75274197900FBEA5F85741D3DEE00B22752741567DAE0AA8F857415917B751247527410C022B67A8F85741ECC039632E752741CE88D276A9F857415917B7F18E752741448B6C0BB4F857419A081B9ECA7527417424979FBAF85741772D215F08762741DE718A4ABAF857419F3C2C142F762741E561A13AB5F857410A68228C56762741CFF7534BAEF85741A3923A215B762741E6AE2590ADF857413CBD52168C76274194878562A6F85741394547728E76274168B3EA1BA6F857416744694F9176274158CA32E8A5F85741075F988C977627419FCDAAAFA5F85741CDCCCC4C9E7627414BEA04A8A5F857413D0AD72303772741075F987CA6F85741234A7B83727727417958A8CDA7F857414703786B8577274176711B31A8F85741166A4D538F7727418048BFA1A8F85741DAACFADC96772741FE65F734A9F8574172F90F499D772741B6847CF0A9F85741075F98EC9E77274151DA1B28AAF85741835149BDA4772741CDCCCC30ABF857416744692FA9772741CF66D553ACF85741F5B9DA8ABB772741211FF414B2F85741D1915CFEBF772741492EFF4DB3F85741B6847CF0C57727410C93A96EB4F8574110583954C7772741D0B359A9B4F85741DB8AFDA5D0772741A1F831BEB5F85741B3EA7315DB772741A5BDC1ABB6F85741E0BE0E5CE07727414A7B830FB7F85741B07268B1F4772741EA95B24CB8F8574154E3A59BFF772741BE9F1AE3B8F857415F984C951A782741EA95B25CBAF85741FD87F4DB22782741A323B9BCBAF8574174B515BB4E782741ED9E3C74BCF857410F9C338257782741547424DBBCF857417B14AE475C7827416F81042DBDF85741ED0DBE906278274171AC8BB7BDF857416EA301DC67782741F38E5368BEF85741E71DA7C86B782741B3EA7331BFF857412A3A920B8D782741B0726871C9F8574190A0F851A27827411CEBE2E2CFF857415E4BC847AC78274160E5D046D3F857414C378961D5782741C66D3400E1F857410F0BB506E8782741AA825161E7F85741A089B081F378274100917EFBE6F85741A52C437C467927412731080CE4F8574193A982B15A7927414CA60A3AE3F85741AA8251C963792741143FC6A4E2F85741D49AE69DD579274119E25803DBF85741E6AE2564077A27411A51DAFBD6F85741B81E850B317A2741D0D55614D3F857417AA52C23357A27415EBA4984D2F85741CEAACFB53B7A27419A99999DD1F857412D431CCB407A2741F1F44AE5D0F857415DFE439A487A27415DDC46C3CFF8574183C0CAC1537A27416666661ECEF8574110E9B7AF5D7A274189D2DEE4CCF85741ABCFD5566F7A2741D509682ECBF857412CD49AE67D7A2741371AC00BCAF85741E09C11459C7A2741C13923B2C7F857419E5E294BB87A27412FDD24DAC5F85741FF21FD16D37A2741FFB27B62C4F85741E9263128E87A27413789414CC3F85741AD69DE11087B2741D0D556A8C1F8574168B3EA13397B2741107A366BBFF85741B6847C30437B2741C7BAB821BFF8574124287EAC517B27419F3C2CC8BEF85741098A1FC3757B2741615452F3BDF85741ED0DBE30947B2741A857CA92BCF8574193180476B37B27416EA301A8BAF857411CEBE2F6C97B27413CBD5282B8F857416744690F037C2741363CBD7EB1F8574189D2DEA00D7C274173D7127EB0F85741E2C798FB217C274140A4DFF6ADF85741401361C32C7C2741E2581757ACF857412497FFF0417C2741BF0E9CF7A8F85741151DC9E5537C2741D8F0F412A6F857419FABAD18587C2741D044D834A5F8574104E78C08607C27415F07CE1DA4F85741894160C5617C274164CC5DE7A3F85741CEAACF956A7C2741BF7D1DD8A2F85741E71DA788747C2741BF0E9CEFA1F857411E166ACD897C2741C9E53F0CA0F8574114D044D8997C27417D3F35969EF8574187A757EAA47C27411FF46C9E9DF85741234A7B03AC7C2741304CA6229DF85741D6C56DF4DA7C2741D578E9CE99F857415BB1BFACE17C274135EF384599F8574103780B84E87C2741499D80AA98F85741ED0DBEF0F57C27412D431C5797F85741713D0AB7067D27413EE8D99495F857412063EE7A167D2741CF66D5AB93F8574145D8F074197D2741E09C114593F857416891ED1C267D2741865AD3A491F85741C1A8A48E2C7D27410C022BAF90F85741DB8AFD45317D27418FC2F51890F85741BD529681367D2741302AA9C78FF857413480B7E03A7D2741508D97B28FF8574166F7E4213F7D2741295C8FBE8FF85741FE65F744437D2741744694EA8FF85741A01A2F7D617D27414013614791F8574164CC5D2B9A7D274189D2DEE093F8574104C58F51A27D27418D28ED3994F85741EEEBC059AC7D274103098AAF94F8574173D71252C97D274169006F0194F8574162A1D6F4267E27416ADE718691F85741516B9A17827E274129CB100F8FF85741903177AD947E2741FED478498EF857417B14AE079D7E27411D3867DC8DF85741F5DBD741A47E2741E3A59B708DF857417958A8B5B07E274100917E938CF85741736891ADB97E274113F241FF8BF857419A779CA2C67E2741705F07368BF8574146B6F37DCB7E274117B7D1E08AF85741992A1895D37E274183C0CA418AF85741ED0DBE30D77E27414182E2F389F8574175029A08DE7E27410C022B6389F85741257502FAE67E27411DC9E56388F857411D5A645BF47E2741FB3A705686F857417B14AE87FC7E274185EB510485F85741AED85F36117F27414694F6B681F85741A8C64BF7487F27414DF38E2F79F85741C1CAA1A57C7F2741ED9E3C8C71F857414260E5D0857F2741643BDF2770F857414FAF94458A7F27415917B7656FF85741A7E8484E927F27419A9999D96DF85741598638969A7F2741B22E6E3F6CF857418AB0E1099F7F27413867446D6BF85741A089B001A27F274148BF7DE16AF85741C520B0B2A77F2741933A01E169F85741C520B072B47F2741A089B0BD67F85741A4703DAAC47F27416C787A0965F857413CBD5256E87F27415C2041695FF8574160764FFEF17F274112A5BDCD5DF857416519E2780D8027419A99992959F85741B22E6E63338027413B70CE6C53F85741C520B0525980274196B20CFD4DF8574127A089705B80274126E483D64DF8574187A7578A61802741492EFF654DF857416ADE71CA628027410E2DB2654DF85741014D84AD538027414260E5EC0DF857416519E2F859802741DC4603800AF8574169006FE164802741B6F3FDDC06F85741DB8AFD056E802741508D970A05F85741E78C280D7B8027413789415C03F8574151DA1BFCB6802741C13923C2FDF757413B014DA494802741AB3E5773FCF75741AC8BDB28278027417AA52C3BF5F757418D28ED4DE77F2741DE718AEAF3F757414D158C4A417F274126E483AAF0F757418E06F016157F274179E926B1EFF75741BE3099CAEE7E2741F8C26426EFF75741F7065F98C57E2741166A4D3FEEF757411F85EB51697E2741DDB58460ECF75741FED478E97D7E274174B515CBCAF7574136CD3B4E677E2741143FC604C3F757418CDB6820637E27416D567D1AC0F75741BDE3145D627E2741FB3A70D6BDF75741986E1243617E27411826531DBAF7574150FC18D3507E2741E2E99506B3F75741986E1223547E2741BA490CCEABF757412063EE1A347E274183C0CA7DABF75741F853E3C5357E2741DE020912A8F7574142CF66F5377E274122FDF6E1A2F757410612145F387E27414A7B83639FF757417CF2B0D0137E2741B4C8767A96F757418FE4F2DFE87D27416C09F9748DF7574161545267D27D27413EE8D9E887F75741F5DBD721AD7D2741DFE00B937FF75741431CEBA2A17D27412F6EA3A97DF757415F07CED9537D2741000000FC8BF75741FAEDEB802E7D274139B4C8DA92F7574170CE8812247D2741FB3A700E94F7574123DBF9DE1B7D2741DDB584E894F75741CC7F48FFF77C27416B9A773897F7574192CB7FE8C37C2741107A362798F7574124287E4CAF7C274113F2418B98F7574163EE5AA2757C27418E7571539AF75741C442AD295C7C2741A167B3F69AF757413B70CE083A7C27413A92CB1399F75741FD87F4DB2F7C27410EBE305198F75741933A010D287C274124B9FC6797F75741A2B43758237C2741492EFF1996F75741DD240681247C2741295C8F9A94F757413E7958C83C7C2741BB270FBF8EF75741C898BB96397C27415AF5B9A28DF75741A01A2F5DF67B2741499D805288F75741EC51B89EC77B27416C787A9D84F757410612141F7C7B27415A643BF77EF757416519E2B8C07B2741B1506BD673F757411283C04A757B2741827346506FF75741F54A59E6EF7A27413108ACA065F75741A01A2F1DC37A27410D71AC1B5DF7574129ED0DFE937A27419487854E57F757415C8FC2D5AE7A27413FC6DC514CF75741E5D0229BBD7A2741A913D02C3EF75741B515FBEBD07A27410B2428DA34F75741FDF675A0A87A2741D3BCE36034F7574180B74042717A27418BFD65DB34F75741A52C43DC3C7A2741CFF753DF36F757419A081BBE077A2741B7627F6539F757411904564EF8782741D6C56DAC4CF75741A7E8488E1C78274112143F725AF75741FE65F7C4A5772741AB3E57AF5CF75741492EFFE1327727414C37894D5FF757411283C02AFC762741B7627F1D5CF757416F128340637627415DFE435A58F75741A1F8314676752741D6C56D1C54F757419A081B9E41752741C66D34F053F75741711B0D201C752741F6285C4F54F7574164CC5D8BD67427418A1F637E55F7574109F9A007987427419A9999A955F75741333333736174274139D6C5B554F75741D0B3597536742741711B0D1453F75741A857CA52F372274185EB51A846F757414C378901FD722741840D4F9F70F75741C66D34A0ED72274176711BE97AF7574111363C1D947227417A36AB0296F757415DFE439A1172274134113660B1F7574124287E6C627127414FAF9455CCF757414A0C02ABBF702741151DC9F1E5F75741499D80065B702741C58F31CBF8F757416DC5FE52F86F2741454772C50EF85741DBF97EEA1D6F274151DA1B0845F85741
2	HO	HOP	HOPITAUX-FACULTES	HOPITAUX-FACULTES	01060000206A080000010000000103000000010000001E020000EEEBC099DB6627411A51DABF67F7574177BE9FFADB662741CA32C4CD67F75741FBCBEE29D866274101DE02DD6AF75741DE718ACED4662741986E123B6DF7574107CE1931D16627417B832F786FF7574185EB5178D16627417AC729EE6FF75741E3361A80D26627416B2BF66B70F75741EC2FBB47D4662741744694E670F757417E8CB9CBD566274111363C2571F757416744694FD7662741AF25E45F71F757414DF38E73D966274141F163A071F75741CBA14536DB6627416DE7FBC971F75741DC460358DD662741910F7AE271F7574145477219E0662741CEAACFF571F757413A234ADBE266274130BB270F72F75741D49AE61DE86627416519E23072F757419CC42070066727419A99992973F757416EA301BC1A6727415AF5B9CA73F75741AA82514931672741840D4F7F74F75741C7293AD23F672741865AD3F874F75741EB73B55544672741363CBD2A75F7574111C7BAB8466727410DE02D5875F757418E75719B48672741A301BC8175F75741DD2406A14B67274195D409D875F7574155C1A8244D6727417CF2B01076F7574104E78C684E67274143AD694E76F75741569FABED4F672741BC0512A076F75741AD69DEB150672741F90FE9E376F75741AED85F7651672741CA54C12C77F75741AB3E575B526727414ED1917C77F7574191ED7CFF5267274120D26FBF77F75741A913D0C4536727418351491578F757417B832FEC5467274104560E8D78F75741E8D9ACDA566727417B14AE7779F75741280F0B155A672741986E12237BF75741A54E40935E6727417AA52C0B7DF75741A089B0A16067274138F8C2F47DF75741B98D06F062672741CC5D4BDC7EF757413F355E7A64672741FF21FD827FF75741BEC11706666727417CF2B04080F75741F31FD2EF67672741835149DD80F7574146B6F3DD6A672741C364AAC081F75741CF66D527736727411F85EB6184F75741711B0DE077672741D656ECE785F75741355EBAC979672741B81E858386F75741F01648707B67274131992AEC86F75741D734EF787D6727415AF5B97687F757411AC05B607F6727413BDF4FED87F75741448B6C87816727411895D45D88F75741E5F21F9284672741C3F5280889F75741E2C7981B87672741516B9A9F89F75741ECC039638967274107CE19198AF75741E92631088B6727417E8CB9678AF7574158A835AD8C672741F6285CB78AF75741F38E53148F67274161C3D3278BF7574129ED0D1E926727412FDD24C28BF75741C3D32B8594672741516B9A338CF7574164CC5DAB9667274152B81E958CF7574193A9829198672741A167B3F68CF75741621058599B672741986E12738DF757418FE4F29F9D6727414DF38EDB8DF75741DB8AFDC59F672741986E123B8EF757415EBA492CA2672741022B879E8EF7574188855AB3A4672741B459F50D8FF75741ABCFD556B2672741AD69DE3D91F75741CDCCCCACB9672741C7293A9A92F75741A1D6344FC4672741AC8BDBBC94F75741AC1C5A44D3672741728A8E0C98F7574107F01688E5672741BADA8A459CF75741006F81A4F56727412575020AA0F757419318043603682741B98D0620A3F75741666666660F6827413F355E26A6F757412B1895141B682741F4FDD408A9F75741CC7F485F2668274163EE5AB2ABF75741E6AE25C42768274103780B00ACF75741CDCCCCEC3268274199BB9688AEF757415F984C153C68274177BE9F12B1F757416EA301DC4568274148BF7D7DB3F75741295C8F824F682741F8C264E6B5F75741C520B0B259682741ECC039EBB8F75741151DC9456668274124287E1CBCF757414DF38EF370682741325530FABEF7574188F4DB57806827411B0DE041C3F75741516B9AB78E6827413A92CB3FC7F7574117B7D1C09B68274107F016DCCBF7574155C1A8E4A06827412AA91320CEF75741E25817F7A66827411F85EB51D1F7574109F9A0C7B368274103098A73D8F75741CC7F483FBA6827413CBD52FADBF75741F4FDD4B8CF682741280F0B6DDBF7574117D9CEF7D268274112143F56DBF75741E86A2B36D86827416A4DF332DBF757411895D469F8682741B8AF0333DAF7574111363C7D166927412BF69731D9F75741F1F44AD91F69274114AE47E1D8F757419D11A5FD5969274167D5E7BAD6F75741CAC3426D78692741D26F5F7BD5F757410B24285E946927418F537454D4F75741DFE00BF3A7692741083D9B7DD3F75741363CBD12BF692741B459F551D3F757412DB29DAFE9692741AA6054CAD0F757415F07CED9036A2741CDCCCC38CFF75741B8AF0307666A27415F984C45C9F75741182653658E6A274135EF38D9C6F757414E6210F89B6A2741865AD3E8C5F75741B1BFEC1EDE6A2741A9A44ED0C1F757418E06F0160D6B27412B1895F0BEF75741D8F0F42A406B27411895D4C9BBF757414FAF9485476B2741933A0165BBF757411283C0AA666B274110583978B9F7574124287E8C8A6B27418195434BB7F75741D7A370BD9C6B2741355EBA35B6F75741D93D7958A26B27413D9B55DBB5F7574152B81E05A76B27410E2DB2BDBAF757414260E5F09A6B2741D734EFA0BDF757417FD93D39996B27411D38672CBEF757412C651922976B2741FE43FAC1BEF75741DBF97E4A966B274111363C4DBFF757414772F9CF956B27411D5A64A7BFF7574122FDF615956B2741BF0E9C0BC0F75741226C78DA946B2741A089B055C0F7574169006F81946B274117B7D1C8C0F75741E17A146E956B2741567DAE96C1F75741083D9B75976B2741C8073D0FC2F75741492EFF819A6B2741E10B93D5C2F757418126C2E69B6B274138674421C3F75741D8F0F46AA66B2741FBCBEE61C5F7574117D9CEF7A96B274130BB272FC6F75741151DC985AC6B2741C0EC9E10C7F757414DF38E13AD6B27414FAF94F1C7F757417424971FAC6B2741D3BCE3B8C8F75741643BDF0FAA6B27416E3480C7C9F7574105341196A36B2741F46C5645CCF75741AF9465E89B6B2741CFF7537FCDF75741FD87F4FB936B2741D42B65CDCEF75741F2B050EB8F6B274148E17AD0CFF757416E3480978E6B27411CEBE29AD0F75741A52C43DC8D6B27412C6519EAD0F757416D567DAE8D6B27415DFE4316D2F75741CC7F48FF8D6B2741F1F44A29D3F7574129CB10478F6B2741029A08A7D3F75741D656ECAF906B2741EEEBC035D4F75741B9FC8754916B2741C0EC9E80D4F757414ED1911C946B2741925CFEFFD4F757418638D6A5976B2741A1F83192D5F757416FF08569996B2741CCEEC9CBD5F757419CA22339A16B2741FF21FDBED6F75741DA1B7C81A56B27412497FF40D7F7574198DD9387A86B27413B014DA0D7F757413C4ED171AD6B274131992A40D8F75741CB10C71AB06B2741744694CED8F75741AF25E423B26B27419CA22361D9F75741D34D6230B26B2741EBE2362EDAF757411A51DA1BB16B27415C8FC2F9DCF75741A52C437CB16B27416519E20CDFF75741E10B9389B16B2741FD87F4E7DFF75741C3F5289CB16B274172F90F19E1F7574100917EBBB16B2741C8073D1BE3F757415A643B1FB16B2741091B9E66E5F75741DAACFA9CB06B27412041F14FE7F75741567DAED6AF6B2741A8C64BF7E8F757415EBA49ECAE6B2741302AA95BEAF75741029A08FBAD6B2741925CFE4FEBF757412D431C4BAC6B2741B840825AECF75741E8D9AC5AAA6B2741BDE3145DEDF75741E4141D29A86B27415917B74DEEF75741E2E99592A66B274131992AECEEF75741547424D7A56B274165AA6038EFF757413EE8D90CA16B27417CF2B0A4F0F757416F1283809C6B2741B1BFECEEF1F75741FED478E9996B2741091B9E86F2F75741567DAE56966B2741E10B9365F3F75741AD69DEB18E6B274152499D30F5F7574191ED7C9F916B27416DC5FE0AF6F757412BF6973D9D6B2741D1915CE6F7F757412A3A922BA36B2741B7D100C2F8F757416D567D2EB16B2741857CD0E7FAF75741DB8AFD25BA6B2741CB10C75AFCF75741D656EC8FBD6B2741DC4603F8FCF7574136AB3E17BE6B274144FAED6FFDF75741000000A0BE6B2741645DDCFEFDF7574138F8C2E4BD6B27410534114EFEF75741DC68006FBC6B274124287EF8FEF7574162105859B36B2741FF21FDBE01F85741DFE00B33AE6B2741B072686D03F85741C5FEB27BAC6B27411CEBE2FE03F85741AF9465E8A46B2741DD2406E906F85741F085C9F4A26B2741742497B707F85741AE47E1DAA16B274166F7E41D08F85741BE30998AA06B2741CE19512209F857418A8EE492A06B2741D1915CAA09F8574182E2C798A06B2741F8C2640A0AF85741BD5296A1A26B27416B2BF6970AF857416F8104C5A46B2741FDF675CC0AF85741EF3845E7A76B2741C6DCB5EC0AF85741014D848DB16B27418BFD65430BF857417F6ABCF4B96B27411D5A64AB0BF85741EBE2363AC06B2741F931E6FA0BF85741C4B12ECED46B274101DE02210DF85741B6847CD0D66B274103098A430DF85741575BB15FE36B2741BC7493280EF8574124287E0CED6B2741832F4CEA0EF8574185EB5198F56B2741A7E8489E0FF857410B2428DEF96B2741CC7F48F70FF85741F6285C8F066C27413B014DFC10F85741AB3E575B106C2741B6F3FDB011F85741FE65F7241A6C27417A36AB3E12F857415F07CE79316C274108AC1C6E13F857411DC9E57F376C27419FABADC813F85741AF25E4033D6C27411AC05B0014F857412D431CEB4A6C27414BEA046014F857416744690F546C2741857CD09714F8574119E25817656C2741EB73B5FD14F8574100917EBB666C27413D9B553F15F8574107F016E8646C274189D2DE1016F857417B832F2C636C2741F2B0505716F857415917B7F1606C2741D49AE6B516F857419FABAD385E6C274175029A2C17F85741A69BC4405B6C27411C7C61B617F85741FE43FA4D566C27410D71AC9718F85741EEEBC039536C274193A9825D19F857412A3A92AB4E6C2741355EBA891AF857414DF38E934C6C2741CC5D4B101BF85741228E7551466C274102BC05061DF8574154E3A5FB3E6C274174B515C71FF85741BC7493183B6C2741105839A821F85741FF21FD96366C2741B81E85A323F857415BD3BCA3346C2741984C157824F857416D567DAE336C27418A1F632A25F85741143FC6FC316C2741AF25E41726F857417FFB3A30316C2741A2B4375827F857418E75713B316C2741F016481028F85741D8817366326C274129CB10C328F857415F984C35356C2741910F7AB229F85741091B9EBE376C2741431CEB462AF85741AC1C5A64396C2741BBB88DA22AF8574139D6C5ED3B6C27412497FF382BF85741F9A067733E6C27418CB96B912BF857419FABADF8406C27413D0AD7E32BF85741BEC11726466C27419FCDAAB72CF85741C58F31174B6C2741BC7493C82DF857416688633D4C6C27416132552C2EF85741AF25E4634D6C2741992A18952EF857419F3C2C944F6C2741C364AA9C2FF85741A1D6342F536C2741B537F85231F857417DAEB6C2566C2741C74B378D32F85741705F076E5A6C2741AF94654033F8574103098ADF606C2741696FF05534F85741B459F5396D6C274150FC18F335F857413D2CD43A7D6C27418CDB68F437F857418F537404826C2741F2D24D8A38F8574188635DDC8C6C2741A913D0003AF8574189416025916C27411895D48D3AF857419FCDAA0F966C2741A167B32E3BF8574151DA1B1C9C6C2741CD3B4EF13BF85741448B6C87A36C274197FF909E3CF85741AAF1D2EDA96C274196B20CFD3CF857419F3C2CF4B16C27410A6822583DF85741C364AAA0BF6C2741AE47E10E3EF85741F5B9DA2AC86C2741F697DDA73EF857416ABC7433CD6C27417CF2B02C3FF857414850FC38CF6C2741ED9E3C843FF857411895D4A9D36C27413867449140F857417FFB3A50D56C27411DC9E5F740F857410E2DB2DDD76C2741F7065FD041F85741857CD053DC6C274168226C3443F85741AA8251C9DF6C274110E9B78F44F857412B8716D9E16C27416154528F45F857417B832FACE26C27415B423EC846F857415F29CBD0E26C274121B0722049F85741B003E76CE36C27416C787AED4AF85741849ECDAAE66C27411CEBE2D24CF857415BB1BFCCEC6C27419A779CF64EF857410F0BB546F26C2741FC18739750F85741C66D3420F86C2741A01A2F3152F85741371AC05BFE6C27418716D9EA53F8574130BB270F036D2741AAF1D22155F85741DD240641056D27416744694356F857412AA91370066D2741C74B373957F8574100917E3B066D27413E7958F457F85741D200DE82056D274197FF906E58F8574193180416056D2741F163CCA959F85741615452E7056D2741C6DCB5C45AF8574171AC8BDB096D2741AE47E10A5CF85741C9E53FA4116D274112143F9A5EF8574131992A18166D2741A7E848DA5FF8574107F016E8196D2741228E75D960F8574187A757AA226D2741287E8CFD62F85741C5FEB27B276D27416D567D1264F85741857CD0D32D6D27417593189465F85741A69BC4E0306D274120D26F6366F8574107CE19F1336D274116FBCB6A67F85741E78C288D366D2741AB3E573369F85741C5FEB23B376D2741A60A46216AF857417E1D38C7376D27411FF46CEA6CF85741E86A2B96376D2741E02D90E06DF8574152499D40376D27418D28ED9970F85741984C156C366D2741B072686573F857411D386784356D2741A857CAF674F85741C74B3749356D27411B0DE04575F8574129CB1067336D27419565883377F857410C93A902316D27413B014DFC78F85741BC0512342F6D27413EE8D91C7AF85741C66D34402D6D2741F9A067E77AF85741FED478892B6D27411CEBE2827BF857415917B791296D27411E166A0D7CF8574171AC8B7B266D2741ED9E3CB47CF85741A779C7E9216D2741454772A57DF857414BEA04141E6D27418E7571537EF85741F7065F581C6D2741D49AE69D7EF857415227A0C9146D2741637FD9C57FF8574186C954410A6D2741BC74935C81F8574177BE9F5AFE6C2741E63FA40F83F857419031776D056D2741280F0B3984F8574173D71252176D27418C4AEA7486F8574197FF901E206D2741ACADD83387F857419EEFA726236D27419E5E29B387F85741E561A1B62C6D2741FBCBEEA988F857415839B408386D2741CC5D4BC089F85741A5BDC1D73F6D2741FFB27BAA8AF857412D211FB44D6D2741835149658CF85741F7065F985D6D2741C1A8A49E8EF85741EF384567646D2741984C15888FF857416D567DCE676D27415F984CF98FF8574196B20C11746D2741CFF7530F90F85741575BB1DF896D27413BDF4FE992F85741B6F3FD14F46D2741569FAB1D81F857417E8CB9AB656E2741B98D06506DF8574138674489866E274188635DC866F85741D5E76A4BAE6E27418716D9725EF857416519E218D26E2741D1915CDE56F85741499D80E6E16E2741A01A2F8953F85741E0BE0E9C076F27412AA913684AF85741BE3099EA1D6F274176711B0945F85741DBF97EEA1D6F274151DA1B0845F857416DC5FE52F86F2741454772C50EF85741499D80065B702741C58F31CBF8F757414A0C02ABBF702741151DC9F1E5F7574124287E6C627127414FAF9455CCF757415DFE439A1172274134113660B1F7574111363C1D947227417A36AB0296F75741C66D34A0ED72274176711BE97AF757414C378901FD722741840D4F9F70F75741A857CA52F372274185EB51A846F75741D0B3597536742741711B0D1453F75741333333736174274139D6C5B554F7574109F9A007987427419A9999A955F7574164CC5D8BD67427418A1F637E55F75741711B0D201C752741F6285C4F54F757419A081B9E41752741C66D34F053F75741A1F8314676752741D6C56D1C54F757416F128340637627415DFE435A58F757411283C02AFC762741B7627F1D5CF75741492EFFE1327727414C37894D5FF75741FE65F7C4A5772741AB3E57AF5CF75741A7E8488E1C78274112143F725AF757411904564EF8782741D6C56DAC4CF757419A081BBE077A2741B7627F6539F75741A52C43DC3C7A2741CFF753DF36F7574180B74042717A27418BFD65DB34F75741FDF675A0A87A2741D3BCE36034F75741B515FBEBD07A27410B2428DA34F75741E5D0229BBD7A2741A913D02C3EF757415C8FC2D5AE7A27413FC6DC514CF7574129ED0DFE937A27419487854E57F75741A01A2F1DC37A27410D71AC1B5DF75741F54A59E6EF7A27413108ACA065F757411283C04A757B2741827346506FF757416519E2B8C07B2741B1506BD673F757410612141F7C7B27415A643BF77EF75741EC51B89EC77B27416C787A9D84F75741A01A2F5DF67B2741499D805288F75741C898BB96397C27415AF5B9A28DF757413E7958C83C7C2741BB270FBF8EF75741DD240681247C2741295C8F9A94F75741A2B43758237C2741492EFF1996F75741933A010D287C274124B9FC6797F75741FD87F4DB2F7C27410EBE305198F757413B70CE083A7C27413A92CB1399F75741C442AD295C7C2741A167B3F69AF7574163EE5AA2757C27418E7571539AF7574124287E4CAF7C274113F2418B98F7574192CB7FE8C37C2741107A362798F75741CC7F48FFF77C27416B9A773897F7574123DBF9DE1B7D2741DDB584E894F7574170CE8812247D2741FB3A700E94F75741FAEDEB802E7D274139B4C8DA92F757415F07CED9537D2741000000FC8BF75741431CEBA2A17D27412F6EA3A97DF75741F5DBD721AD7D2741DFE00B937FF7574161545267D27D27413EE8D9E887F757418FE4F2DFE87D27416C09F9748DF757417CF2B0D0137E2741B4C8767A96F757410612145F387E27414A7B83639FF7574142CF66F5377E274122FDF6E1A2F75741F853E3C5357E2741DE020912A8F757412063EE1A347E274183C0CA7DABF75741986E1223547E2741BA490CCEABF7574150FC18D3507E2741E2E99506B3F75741986E1243617E27411826531DBAF75741BDE3145D627E2741FB3A70D6BDF757418CDB6820637E27416D567D1AC0F7574136CD3B4E677E2741143FC604C3F75741FED478E97D7E274174B515CBCAF757411F85EB51697E2741DDB58460ECF75741F7065F98C57E2741166A4D3FEEF75741BE3099CAEE7E2741F8C26426EFF757418E06F016157F274179E926B1EFF757414D158C4A417F274126E483AAF0F757418D28ED4DE77F2741DE718AEAF3F75741AC8BDB28278027417AA52C3BF5F757413B014DA494802741AB3E5773FCF7574151DA1BFCB6802741C13923C2FDF75741F085C9140A812741ECC03993F6F7574199BB96F0E2812741C898BB6EE4F757415A643B5F07822741BADA8A05E1F75741728A8E441482274135EF3839DFF75741AC8BDB481C82274175931864DDF7574112A5BD2124822741B1BFECD2DAF757419FCDAA0F2B82274167D5E78ED7F75741DF4F8DD72B822741F54A59F2D3F75741D734EF98238227410F9C333AB5F75741F31FD28F24822741575BB193B2F75741F8C2644A28822741BADA8A25B0F75741637FD9FD2F822741D26F5F3BADF757410AD7A3D03C82274146B6F33DAAF757410AD7A3101683274104560EB981F75741ABCFD53675832741CE88D2EA6CF757418FE4F21FB2832741EC2FBB7756F7574196438BACBB832741FB5C6DED4CF75741B7D1005E8083274145D8F0880AF75741B1BFECDE6D8327418FC2F580DFF6574148BF7D9D638327415F07CE4DD9F657411CEBE276498327416C787AE1D2F65741FB5C6DA503832741C1A8A4C2C1F65741B6F3FD543A82274126E4836E88F6574140A4DF9EA8812741AD69DEA958F657411F85EBF175812741A089B00D54F65741A913D0A4388127411AC05B0C3FF6574122FDF6350F81274176E09CE92DF65741B7D1001E06812741C7293A5228F65741A4703D2A0A8127419FABADE822F657415DDC4663458127413D2CD46E0BF65741F7E461413D812741F163CC5D0BF657412E90A0B83A7F2741CBA145CEFDF55741371AC0DBC07E2741992A1899F6F557412DB29DEF147E27412EFF2185E6F55741CDCCCC2CE97C2741FE43FA49C1F55741E2C798FB9C7C274196438B78B8F5574174B5151B487C27411EA7E8ACACF5574197900F5A8A7A274163EE5A0E76F557412DB29D4F417A27411361C38B69F5574188635D7CF87927418638D6695AF55741CE19515AD5792741516B9A935CF55741AD69DE51947927411895D49560F55741E78C286D1179274139B4C8726BF55741925CFEE381782741105839387AF557416F1283C02E782741D0D556C882F55741A913D0641778274114AE474585F55741B37BF210FC772741A4703D4A88F55741AD69DE71D4772741728A8EC88EF55741D34D6270AA7727412C65194E9BF55741DF4F8DD782772741C364AA40A4F55741C58F315757772741D656ECAFAAF55741363CBD12F0762741E6AE2560B5F557413D9B555F6876274176E09C6DC3F5574126E483BE9E752741E0BE0E10D1F557411FF46C760175274168226CE0DBF557418A8EE4128474274191ED7CDFEAF557413E7958E8E673274132E6AEBDFDF55741D734EF38FF722741DC4603CC10F65741A323B99CB1722741C0EC9EB817F65741AB3E575B7C7227418F53743420F65741BA6B091926722741448B6C1F33F65741A779C769FF7127411D38679038F657418CB96BA9897127417C61329943F657411283C04AE17027415D6DC52E53F65741CDCCCC2CAA702741BEC117E65BF65741A52C431C377027416DE7FB156EF65741287E8CB9CF6F2741A4DFBE7E6AF65741E0BE0EBCC26F2741986E128762F65741DB8AFD25B36F27413EE8D90059F657414BEA04F4956F274105C58FB94BF657418D28EDAD656F2741F0A7C6473DF657416C09F9A0376F27418638D67D32F65741423EE8D9FE6E2741BBB88D2628F6574105341156986E274116FBCB2A18F65741C8073D9B416E2741C520B0C20CF65741F8C264AAE06D27410A68221002F6574196438B6C666D2741462575A6F4F557414703780B346D274141F16314FBF55741D578E9E6056D2741772D217709F65741304CA6EAF56C2741C6DCB5F80FF65741EEEBC0F9B66C27411C7C616A13F65741E6AE25C4766C2741D0D5569016F65741EBE2361AC06B27415839B45C1FF65741AC8BDB28096B27416FF085C92BF65741D93D7998A16A2741A69BC4B035F65741D50968A26B6A274120D26FCB3AF657412D211FD45E6A27417B14AE033CF657416B9A777C106A2741DCD7813B43F657414CA60A66E1692741C6DCB5504AF65741984C15ACB8692741F46C562151F65741E25817579A692741B98D061854F65741992A18B5766927416891ED4056F65741D1915CFE13692741166A4D8F59F65741FED478E9086927412AA913585AF65741D93D791802692741F5DBD7595BF6574139D6C52DFD682741E92631C05CF657419A779C02FC68274152499D185EF65741FD87F45BFD682741462575B65FF65741E09C1145016927410000006064F657416FF085E909692741B6F3FDDC6EF65741C9E53F040D692741789CA29B72F65741D656EC2F11692741E5F21F6E77F657416688635D0E692741AB3E576B7CF65741E71DA76805692741705F074E81F657418126C246FA682741C3F5285C85F65741A835CD3BE7682741D34D62F08AF6574132E6AEC5D668274166F7E4C98FF65741DF4F8D17C76827418273462495F657410F9C33E299682741D3BCE37CA4F657410F9C332275682741C217260BB1F657410F0BB50662682741A167B3AAB9F65741F0A7C6EB4D6827410534113ABEF657411748509C1068274183C0CAD9C5F657410E4FAFF4CE6727412E90A000CEF65741F90FE9B7A86727411D386790D2F65741E7FBA9D17567274144696FA8D8F65741499D800632672741A69BC498E0F657419B559FEB1B672741C0EC9E2CE5F65741363CBDB214672741C1A8A4BAE7F65741D200DEC2056727413D2CD4F6ECF65741E78C28EDF76627417DD0B3D1F1F657416ADE712AC56627412A3A925700F757412CD49A06B066274119E2586306F757411A51DA5BA76627419FABAD1012F7574187A757EA956627412C65195E1DF757416DE7FB695966274168B3EAB744F75741D712F201576627417958A84546F75741D95F762F50672741ABCFD5F657F75741EEEBC099DB6627411A51DABF67F75741
3	HO	HOA	Aiguelongue	HOPITAUX-FACULTES	01060000206A080000010000000103000000010000001C0200006ADE71CA628027410E2DB2654DF857415F984CB5CB8027415986386A4DF85741666666E6FF802741C1CAA12D4EF85741C3D32B854D8127418E06F0A64FF85741B003E7CC62812741849ECD0250F857410E4FAF946F8127418048BF6D50F85741E71DA7E8DC812741B5A6790F53F85741166A4DD3F38127416C09F99853F857418048BFDD038227415396212A54F85741EE5A42FE358227412FDD24EE55F8574122FDF675528227411B9E5E4557F85741EC2FBB076482274158A8354D58F857419A9999D97382274148E17A5859F85741CE19511A8D822741287E8C495BF8574112143FA6AE8227413108ACE45DF85741F6285CAFCD8227418A1F635660F8574161C3D3ABE4822741DAACFA0462F8574160764F3EF6822741F31FD21763F8574190A0F8110C832741789CA23764F85741234A7B2321832741C0EC9E3465F85741CF66D5A7298327417446946E65F85741211FF44C55832741DB8AFD7965F857411361C3F38183274122FDF69163F85741B3EA73F5A5832741DC68006361F85741E71DA7E8B9832741BB270F6F60F857412F6EA301CD832741F7065FDC5FF85741DD2406C1D8832741B84082BE5FF8574138F8C2C4EA8327419D8026DE5FF8574144FAEDEBFC832741A779C73560F85741E5F21F520B84274185EB518460F857417D3F351E1C842741166A4D2F61F857413867448928842741AC1C5AD061F857411DC9E53F3F842741B515FB1F63F85741713D0A97518427410C93A97E64F85741C520B05265842741280F0B2566F85741FB3A704E7984274188635DCC67F85741A60A46E5878427416B2BF62B69F85741FAEDEBE095842741ED0DBEDC6AF857418F5374C4A78427419B559F076DF85741378941C0B3842741F853E3BD6EF8574183C0CA21C38427411AC05BCC70F8574108AC1C7ACD8427410000004C72F857419BE61D07D38427417F6ABC1873F85741D0B359F5DA842741D49AE6F573F85741EC51B81EE6842741EE7C3F7D74F85741C139238AFD842741091B9E1275F857418104C50F17852741B3EA734575F85741D0D5564C278527416C787AF174F85741A4703D8A428527411895D4A174F85741355EBA295A85274174B5157374F85741D26F5FE76D8527418195432B74F857416F81042586852741AC1C5ADC73F85741B537F842A385274180B7408A73F857415DDC4663BE8527419EEFA76273F857413B014D64E18527410B46253973F85741BBB88D060C862741CCEEC91773F85741499D80263586274139B4C8D272F857411EA7E80846862741C520B0DE72F8574116FBCBCE4F86274188855A2F73F8574108AC1CBA56862741363CBDDE73F8574144FAEDEB5E862741AD69DEF574F85741B7627F596686274179E926C975F8574135EF38856F8627416DC5FE7A76F8574122FDF6157C8627414CA60A7A77F85741E63FA4FF838627410DE02D0C78F85741560E2D12938627419C33A22479F85741014D840DAC86274112A5BDBD7AF857414850FCD8BA862741EBE236627BF857414ED1919CC78627410A6822887BF85741F4FDD478D1862741EB73B5397BF857414260E5F0E086274166F7E49D7AF85741E71DA7E8EE8627416ADE71FE79F8574111363CBDF98627417F6ABC3079F85741D26F5F870D8727415E4BC8A777F85741BB270F0B2587274140A4DFAE75F85741832F4C86438727417E1D381F73F85741FCA9F17253872741598638C671F85741C364AA80608727412063EE8270F85741075F980C6A872741D93D79286FF85741BC7493F8728727419F3C2CD06DF85741F0A7C60B86872741C8073DCF6AF85741BADA8AFD98872741AA6054B667F85741A1F831C6A4872741CE19512266F8574135EF3845B787274175029AE463F85741AA8251A9C8872741E92631FC61F85741BE30998ADA8727410AD7A3E45FF85741C3D32B85F18727415F07CE555DF8574121B072480188274139B4C8625BF8574104C58F710D882741569FABD559F85741BC9690AF1B8827416DE7FB8D57F857413411369C21882741FB5C6D4556F85741E9482E3F29882741AED85F5A54F85741C5FEB29B55882741DDB5848C49F857416519E25870882741F7065F0443F857412E90A0D88A8827413A234AA73CF8574117D9CEF7A3882741BBB88D4236F85741C442AD69AE882741EB73B53933F857415D6DC5FEBF882741696FF0492EF8574110E9B78FCA88274197900F322BF8574166F7E4A1CD88274135EF38492AF85741E10B9309D5882741A52C43AC28F857417C6132F5DE88274110E9B74B27F85741D88173E6E9882741D8F0F44626F85741D42B6519FA882741D734EF5425F85741FE43FA6D09892741772D217F24F8574158CA32C41E89274140A4DFBA23F85741F4FDD45836892741BC0512D822F85741A167B38A59892741FA7E6AB421F85741AE47E1FA798927411FF46C7A20F85741BBB88DA6A9892741C5FEB2DB1EF857416ADE71CA058A27412D431C731CF85741D93D79F8418A274188855AE71AF85741F241CFA6788A274145D8F06819F8574169006FA1898A27415E4BC8F318F85741D0D556ECBF8A2741FB3A703E17F85741462575E2D98A27414E62107016F85741250681F5ED8A2741992A187915F85741CFF753A3028B2741FCA9F12A14F8574104560ECD158B2741E6AE259C12F85741F31FD2AF2A8B2741643BDF9710F8574164CC5D0B438B27410F0BB5160EF857412FDD2406558B2741E25817930BF857413B014DC4608B27419318045209F8574175029A88668B274144696F8007F8574121B072C86A8B274157EC2F6705F85741D42B65F9718B27410A68225402F85741182653E57B8B2741F7E461E9FEF75741E25817F7858B274109F9A0DFFBF75741DE718A0E908B2741423EE831F9F75741F2B0506B978B2741F853E3E1F6F75741F38E53F49A8B2741F775E060F5F7574148E17A149F8B2741E7FBA94DF3F75741C1A8A48EA38B2741AA6054D6F0F75741A1F831E6A68B274112143F36EEF75741158C4AAAA98B27418A1F6366ECF7574179E92671AF8B27413C4ED1BDEAF75741BF7D1D38B98B274114AE4711E9F7574121B072A8BE8B2741637FD905E8F7574111363C1DCC8B2741499D8036E7F75741917EFB7AD68B2741D9CEF7FFE6F7574126530503E88B27411361C367E7F75741DE718A0EFA8B2741FC187307E8F75741711B0DE00C8C2741925CFE07E9F7574133C4B14E218C2741098A1FD7E9F757410B2428DE3D8C2741394547A6EAF757417B832FAC4A8C274137894178EBF75741E5F21F925C8C27412041F1BBEBF75741CD3B4E91728C27412BF69789EBF757411B0DE02D8C8C274187A75726EBF757414D158CEAA58C274172F90FC5EAF757418FC2F508258D27419D8026D6E9F75741FED478A9508D2741287E8C95E9F75741F5B9DAAA6E8D27415DFE437AE9F7574187A7574A808D27414772F953E9F7574198DD93E7918D2741C442AD09E9F757416E348017A98D2741FBCBEED9E7F7574190A0F851C88D2741E258173BE5F75741C7BAB8ADE28D2741B3EA73B9E2F7574176711B8DF78D274155302A7DE0F757419A779CC2138E27414BC80791DDF75741DBF97ECA1B8E2741431CEBF6DBF757416B2BF6B7218E274188855ABBDAF757414BC807DD258E274131992AF8D8F757414FAF9425278E274134A2B473D7F75741EA95B20C268E274117D9CEDBD5F757416688635D248E2741F931E6D2D2F75741D0D5566C218E27413A234AAFCFF7574194F6063F1B8E2741CC7F48BFCAF75741DAACFA7C168E27414A0C0287C6F75741B003E78C108E27410A682278C3F757418FC2F5280A8E2741D8817332C1F7574135EF3865038E2741AC8BDBF0BEF757417424977FF88D274113F24197BCF7574133333393EB8D274176711BD1B9F75741D95F762FD68D27411B2FDD98B5F75741499D8006BE8D2741A54E400FB1F757418126C2A6B48D274161545213AFF7574160E5D002AE8D2741A167B3CEACF75741304CA62AAB8D274111363C45ABF75741250681D5A98D274143AD69EAA9F757417FFB3A10AF8D27411DC9E57BA7F75741EA95B2ECB98D27414BEA0420A5F75741BA6B0999C38D274103098ACBA3F757418CDB68E0D98D27416B2BF60FA2F757414A0C020BF48D2741D95F7683A0F75741F775E05C0E8E2741B537F86E9FF757419F3C2C94228E27412497FFBC9EF757414A7B832F3D8E27416E3480439EF757412497FF70508E2741CF66D53B9EF7574117D9CE17718E274145D8F0749EF75741C05B20A18D8E274129CB10DF9EF7574122FDF655AF8E2741257502FE9FF75741819543EBD18E2741A4DFBE22A1F75741759318E4F08E274165AA6088A2F757410612141F128F274148E17A0CA4F75741EB73B5152E8F2741ABCFD552A5F7574151DA1B9C378F2741E02D90ACA5F75741C3D32B25458F2741CFF7532BA6F757410C022B67478F27413A92CB47A6F75741759318A45C8F274176E09CF1A5F7574132772DA1658F274143AD69B2A5F757419D11A53D6D8F274103098A6BA5F75741FCA9F192808F27415D6DC59AA4F75741E6AE2564918F2741E2E9958AA3F757417DD0B3F99A8F2741C4B12ECEA2F75741FFB27B12A08F2741F931E64EA2F757419E5E294BA48F2741CE88D2CEA1F75741DD240641A98F2741DF4F8D1FA1F75741C898BB36AD8F274127C2866FA0F7574112143F86BF8F27418048BF319DF75741D122DB19CC8F27411D3867409AF757416ADE714AD08F2741CC7F483B99F75741143FC63CD38F27416C787A5598F757413A92CB9FDD8F27414D158C5694F75741371AC0FBE78F2741068195E38FF75741F54A5986F08F274179E926658CF75741CBA145B6F28F27416F1283588BF757411D386784F48F27416A4DF32E8AF757413D2CD47AF88F2741EC51B87A87F7574140136103FA8F27410EBE30F585F75741CEAACF55FC8F27413CBD520283F757415DDC4603FF8F2741F46C56BD7FF757415BB1BF2C0290274158A835357CF75741EC51B83E0390274188F4DB4B7BF757410AD7A37006902741CB10C74E78F7574120D26F9F079027418941603177F75741835149DD0B9027418B6CE7E772F75741C442AD290D902741462575A271F75741226C78DA0D902741325530A670F75741D3DEE0AB0F9027418E7571A36DF757413D2CD41A10902741C74B37896CF7574196438B2C1090274108AC1C9E6BF757414182E20712902741B1506B3E69F757416210585916902741D044D82864F75741151DC9451790274124287EE462F757413789414019902741EFC9C37660F75741F54A5946219027413A92CB7F56F75741D712F2C12190274120D26F2754F75741B98D06502190274168226C0053F75741B81E852B1F90274133C4B1AA50F7574154E3A59B1D902741B537F8A64FF757412731088C1B9027411B9E5EA94EF75741F085C9F413902741ACADD8274BF7574155C1A8A4119027415F984C214AF757416DC5FEF20D902741BDE3140549F7574186C954C1099027414850FCE847F757418A8EE4520590274122FDF60147F75741C9E53F640090274172F90F1946F757419BE61DA7F38F274190A0F84D44F75741992A1895EB8F274160E5D03243F75741666666A6E48F27411D38674C42F757416891ED7CDE8F2741ABCFD5BA41F7574142CF66B5D78F27418D976E4A41F757414772F90FCF8F274100917EFF40F75741CAC3428DC58F2741A857CAE240F757417B14AE47B88F2741DAACFA9C40F75741CCEEC923B28F27418E75716740F757410612143FAC8F2741ACADD82340F75741C3F5287CA88F274112A5BDF93FF757414BEA04F49F8F27415C8FC2813FF75741C442AD69978F2741CA32C4E53EF757412F6EA3A1918F27419BE61D6B3EF75741BA6B09398C8F2741AED85FE63DF75741107A366B848F27410DE02D103DF75741FA7E6A5C7D8F27413A92CB273CF757412AA913D0778F2741053411663BF757414FAF9465738F2741BC0512C03AF75741E7FBA9716B8F2741AD69DE8539F7574114AE4761658F274136CD3B8238F75741F38E53B4608F2741F01648B437F757413B70CEA85C8F27410EBE30FD36F757414C378901508F27414A0C028B34F7574168B3EAD34B8F27418D28EDB133F7574199BB96B0388F27410A68227C2FF757418AB0E1092E8F2741FDF675102DF75741A835CD9B2A8F27410F9C332E2CF75741539621EE268F2741DC6800532BF75741B4C8769E198F2741D656EC5728F75741B37BF230168F27410C93A97E27F75741705F070E0C8F27414260E55025F757411AC05B20088F27415C8FC27524F75741857CD0F3038F2741C520B0AE23F757419D11A5DDFC8E2741A60A464D22F75741431CEBE2F38E27415DDC46A320F75741FCA9F172EE8E274148BF7DA51FF757418104C5CFE18E2741CFF753771DF7574163EE5A62DD8E27413BDF4FA11CF7574122FDF695D98E2741E6AE25DC1BF7574104C58F31CD8E2741FAEDEB9819F75741ECC039E3C88E2741643BDFB318F7574168226C78C58E274109F9A00718F75741EBE236BABB8E2741F163CC2516F75741986E12E3AC8E2741DE0209B212F757417A36AB1E9D8E27411E166A650EF757415BB1BFEC918E27415F07CE410BF757410E2DB2FD8D8E274155C1A8500AF75741DC6800CF898E2741E10B936509F757412FDD24C6858E2741DBF97EDA08F75741C976BEBF828E27413255307608F7574161325530788E27410BB5A68907F75741615452C7718E27415452270007F7574191ED7C9F6B8E27419A99998906F7574187A7570A5A8E2741C898BB4A05F75741956588A3528E274191ED7CE704F757416688639D4A8E27411D5A648F04F75741857CD0D3398E274143AD690E04F757412497FF30338E27414A0C02EB03F757418A1F636E2C8E274109F9A0CB03F75741AF9465C8198E27412D211F8803F757411B2FDD64128E2741F931E65A03F75741575BB17F0B8E27414C37891103F75741FF21FD96028E2741787AA59002F75741849ECDAAFA8D274148BF7DD501F75741448B6C07F98D274189D2DEA001F75741363CBD32F08D274140A4DF5A00F75741C3F528BCE88D2741956588F3FEF6574110E9B7AFE58D2741C58F312BFEF657414F401301E28D2741925CFE3FFDF657414DF38ED3DE8D2741E8D9AC66FCF65741819543ABD58D2741E561A1DEF9F6574126E483FED28D27417C613211F9F65741DCD781F3D08D2741091B9E5EF8F6574197FF901EC68D2741B003E708F5F65741CCEEC9C3B68D274194F6064BEFF65741FD87F49BB08D27415C2041C5ECF657417CF2B090AB8D2741E9263104EAF65741CFF75343AA8D2741B1506B2AE9F657414E6210F8A88D27410C93A972E8F657413108AC1CA58D2741333333A7E4F65741F31FD28FA48D2741C9E53FD4E3F65741029A083BA48D274123DBF96EE0F657411B0DE04DA48D2741AD69DE95DFF6574146257542A48D2741508D97CADCF6574188F4DB17A48D27413E79580CDAF6574189416045A48D27417AA52CDBD8F65741B81E85CBA58D27415305A32ED7F65741C05B2061A68D27411FF46C82D6F65741341136BCA68D2741CD3B4E31D6F657412BF697DDA98D2741AB3E5733D4F65741CD3B4E51AC8D274155C1A864D3F6574155C1A8E4AF8D2741EB73B58DD2F6574185EB5198B48D2741910F7ABAD1F65741B5A67967BA8D2741D8F0F49AD0F65741EBE2363ABF8D27417CF2B0B8CFF657419F3C2C54C28D27411DC9E54FCFF65741D34D6290C48D274186C9540DCFF65741107A368BC88D274186C954B1CEF6574167D5E76ACB8D274109F9A0A7CEF65741E10B9389DD8D2741EBE23672CEF65741CA54C1A8E88D2741499D8052CEF6574195D40988FB8D2741B1E1E925CEF65741B8AF03C70E8E2741105839F4CDF657414182E207398E27414694F6BACDF65741E92631483F8E2741D7A370B5CDF65741CA54C1A8558E274101DE0299CDF657416DE7FB69608E2741D509689ACDF657419E5E29AB728E274123DBF98ECDF65741984C150C778E2741431CEB96CDF657419FCDAA0F8D8E274199BB96ACCDF65741B9FC87D4A78E27419BE61DCFCDF657413A234ABBCF8E2741462575FACDF65741A52C435CD78E2741E4839EFDCDF657416891EDBCDD8E2741E09C11FDCDF657418B6CE7FBE48E27413B014DE0CDF65741EB73B555F98E2741840D4F57CDF65741C21726D3018F27415A643B1FCDF65741E17A144E138F2741D712F2ADCCF657415B423E88258F2741FFB27B2ECCF65741E09C11652D8F274104E78CECCBF657415A643B3F408F274144FAED6BCBF65741B7D1003E438F2741C58F3153CBF65741917EFB3A468F2741B30C711CCBF65741516B9AD7488F27415E4BC8DFCAF657410DE02D50508F2741FAEDEB58CAF65741696FF0C5578F2741713D0AA3C9F65741EE5A42BE5D8F274170CE881AC9F6574108AC1C1A608F2741FBCBEED1C8F657411C7C6152648F274188F4DB4BC8F65741FBCBEE89678F2741265305BBC7F6574152B81E45698F2741E02D9068C7F65741FB5C6D45708F2741304CA652C5F65741DC460378738F2741CCEEC96FC4F657412041F1037E8F2741D3DEE003C1F65741992A18F5808F274129ED0D0AC0F657415839B4E8838F274137894138BFF65741CC5D4B888A8F2741B22E6E17BDF65741454772798E8F27414013611BBCF657418716D9CE918F274100917E67BBF65741E5F21F729A8F27413333337FB9F65741AF9465489E8F2741C66D34D8B8F6574146257522A18F274190317771B8F657410B462595DA8F274139D6C505B1F6574152B81EE5E18F2741D3BCE3F0AFF657412D431C4BEE8F27410F0BB52EAEF65741A60A4645009027414F4013A1ABF657418A1F638E0790274130BB271BAAF65741E09C11C50A9027411748507CA9F657419FCDAAAF1190274191ED7C0FA8F65741992A18151A902741EF38454BA6F657418BFD65D723902741EA95B250A4F65741E63FA4FF2A902741CDCCCCBCA2F65741D34D62903A902741C5FEB2979FF657414F1E162A3C9027413867442D9FF657418F5374443C902741C66D34D09EF65741F4FDD4583C90274151DA1B109EF6574117D9CE373C90274168B3EAEF9BF65741545227C03A902741C442AD4D96F657415D6DC5DE399027413108AC2894F65741A1D6346F399027413108AC2893F65741B1BFECFE38902741569FAB1D92F65741B459F519399027418BFD65BB8FF657411B9E5E2939902741CBA145AA8EF657418E7571BB3990274195D409C48DF6574179E926313A9027419D11A5098BF65741E02D90A03A902741448B6CF789F65741827346143B9027417FFB3A2C89F65741903177AD3B902741F31FD2AB86F65741643BDF8F3D9027419F3C2CC084F6574132772D813F902741AEB662BB81F65741499D8066419027413BDF4FE17BF6574188855AD3419027414F4013A57AF65741DE93870543902741234A7BAF77F657411B9E5E2944902741F163CCCD73F65741925CFEE344902741F7065F6471F657413FC6DC1546902741CA32C4696EF657418351495D47902741061214C36AF65741FD87F47B4890274198DD939B68F65741C286A7D74D9027412731083C66F657416519E2B8529027410AD7A33864F65741FB3A704E59902741EEEBC07161F65741E926318860902741363CBDEE5EF65741A9A44E606F902741787AA5345AF65741B22E6E037590274174B5154F58F65741091B9E3E77902741DCD781FB57F657419FCDAA2F919027416519E2C854F6574161C3D3EBA4902741D044D85852F657412EFF217DA8902741D3DEE05F51F65741DDB5849CB7902741143FC61C4DF657410DE02D30BA90274172F90F4D4CF65741075F988CC2902741CCEEC9F349F657414C378921C69027413D0AD73749F65741AA825149DD90274162A1D67045F65741728A8EA4EC902741AC8BDBF842F65741FA7E6ABCEF90274196B20C6D42F6574135EF3885F89027411361C3DF40F657412AA913F0FD902741F2D24D7A3FF65741C3D32B85009127419A9999C13EF65741516B9A570291274129CB10DF3DF6574136CD3BEE03912741E4839E413DF65741234A7B030991274107F016783AF65741A913D0640C91274172F90F7938F65741E561A1F60D9127412B18958C37F65741C1A8A48E129127417C6132F134F65741BDE314BD14912741DF4F8DCB33F657416519E2F81B9127414D158C6A31F657413A92CBFF20912741C3F528C42FF657411904568E24912741E86A2B9E2EF65741BEC117662E912741B84082F62BF657414A7B83AF349127413D2CD4762AF657413FC6DC553C91274116FBCBC228F65741273108CC3F9127411CEBE21A28F657417B832FCC4B9127415C8FC2F925F65741F7E461C14F912741A323B94025F65741083D9BD554912741B072687524F657415EBA498C5991274158CA32D423F65741234A7B0362912741984C153423F657411B0DE00D7A912741BEC117A621F657419CA223D9959127417C61322120F657418BFD65779C9127412B1895F81FF657412B189514AE912741F01648AC1FF657419F3C2C74B5912741B6847C981FF65741BC0512F4B7912741AE47E1921FF65741BC051234BC9127418716D98A1FF65741B3EA7315D0912741B98D06801FF657413FC6DCD5D3912741BF7D1D801FF65741D0B359B5D6912741B1506B721FF65741F9A067D3DD9127417A36AB461FF657418195432BF89127417E1D38931EF65741F8C2646AFA91274155C1A8801EF6574141F1634C818F27412B189590B1F557412041F123468F2741295C8F9AB7F55741D8F0F42A8F8D27418D28EDBDD3F5574143AD691ED28C27418F537464DAF55741BA6B0979518C27419CC42008DFF557418E75717B048C2741166A4DD3E3F55741CE19511AA98B274131992A8CEAF5574133C4B16E5B8B2741ACADD88FF2F557416DE7FB29048B2741E4141D25FDF557416B9A779CB08A2741F54A59D6FCF557410E4FAF34808A274172F90FA9FCF557419CC420D0E6892741098A1F57FBF557410E2DB25D38892741EFC9C326F5F557417DD0B3D965872741EA95B2A0E9F55741029A08FB34872741508D970AEAF55741705F070E0B872741D656EC8BEBF55741FCA9F1F2EC852741787AA514F8F5574161C3D3ABE4842741B6F3FDB003F65741A01A2F1D84842741F31FD28307F65741F931E68E4A842741FCA9F10A09F657414DF38E93D3832741C21726330CF65741EC2FBB6761832741986E12430EF65741933A010DF38227416B2BF6570FF65741022B87B61E822741F01648440DF657415DDC4663458127413D2CD46E0BF65741A4703D2A0A8127419FABADE822F65741B7D1001E06812741C7293A5228F6574122FDF6350F81274176E09CE92DF65741A913D0A4388127411AC05B0C3FF657411F85EBF175812741A089B00D54F6574140A4DF9EA8812741AD69DEA958F65741B6F3FD543A82274126E4836E88F65741FB5C6DA503832741C1A8A4C2C1F657411CEBE276498327416C787AE1D2F6574148BF7D9D638327415F07CE4DD9F65741B1BFECDE6D8327418FC2F580DFF65741B7D1005E8083274145D8F0880AF7574196438BACBB832741FB5C6DED4CF757418FE4F21FB2832741EC2FBB7756F75741ABCFD53675832741CE88D2EA6CF757410AD7A3101683274104560EB981F757410AD7A3D03C82274146B6F33DAAF75741637FD9FD2F822741D26F5F3BADF75741F8C2644A28822741BADA8A25B0F75741F31FD28F24822741575BB193B2F75741D734EF98238227410F9C333AB5F75741DF4F8DD72B822741F54A59F2D3F757419FCDAA0F2B82274167D5E78ED7F7574112A5BD2124822741B1BFECD2DAF75741AC8BDB481C82274175931864DDF75741728A8E441482274135EF3839DFF757415A643B5F07822741BADA8A05E1F7574199BB96F0E2812741C898BB6EE4F75741F085C9140A812741ECC03993F6F7574151DA1BFCB6802741C13923C2FDF75741E78C280D7B8027413789415C03F85741DB8AFD056E802741508D970A05F8574169006FE164802741B6F3FDDC06F857416519E2F859802741DC4603800AF85741014D84AD538027414260E5EC0DF857416ADE71CA628027410E2DB2654DF85741
5	CV	CVA	Alco	LES CEVENNES	01060000206A080000010000000103000000010000007E000000CE19515AD5792741516B9A935CF55741B1E1E975057827415227A0F14CF55741C286A777A4762741B7D1004A49F557412DB29D8FB9752741B515FB4F48F55741DE02094A3F7527415BB1BFC848F55741D1915C7EFF742741492EFF6946F557418E7571BBBF7427414F40138D42F5574101DE024901742741E4839E3932F55741B30C714CCE7327415305A3AE2EF55741E92631A88F732741FB3A70BA2AF55741A857CA32E67227412041F15724F55741E9263108D571274165AA60401BF55741B7D1009E5C7127412575024215F557417DAEB62231712741333333BF11F55741D0B359D5FA70274167D5E7260DF5574124287E6CA77027414F1E16E202F55741567DAEB6466F2741DE718AD2DAF4574196438BACCC6E2741A089B0A1CCF4574195D409A8AF6E2741A8C64B6FC8F45741C976BE9F976E2741B30C71E8C1F45741AC8BDB482E6E2741B515FB339CF457414D840DEF046E27414DF38E838EF4574146257522F46D2741F931E62E75F4574193A98211FA6D2741E3361A0C4DF45741D9CEF733E46D27414D158CAA32F45741613255B0C56D2741D8F0F42A20F4574199BB9630F16C2741B5A679CF27F45741832F4CC6BF6A2741C898BB5637F4574167D5E7CA956A27413A92CB5748F45741C0EC9E7C886A274152499DAC4DF457418E75719B346A2741E63FA4036FF457411B2FDDC4186A274176E09C117AF457414F4013E1106A27412E90A02484F45741643BDF8F0B6A2741E5D022638FF45741FED478C9196A274141F163C4B1F45741CB10C77A12692741728A8EA0B2F45741EBE2361AB7682741E561A12AB1F4574103098AFF6F682741CDCCCCF0AFF457418FE4F2BFCA672741A167B3FEACF457417A36AB5E5E68274168226CC8CEF45741C139232A6A682741F5DBD77DD1F4574197FF903E77682741B8AF03C3D4F457418F5374C4A86827415F984C1DE1F45741AC1C5AA4EC68274139454702EFF457413BDF4F4D0D69274127310884F5F45741E3361A201D69274126E483AAF8F457413C4ED1D16B692741D5E76ABB0BF55741075F984CA5692741BF7D1D6C1BF55741DDB584FCFC69274133C4B18636F55741D95F76AF116A274154E3A5CF3FF5574182734634166A27416F81043144F557415BD3BC230D6B27414BC807816AF557418716D9EE306B2741D93D793C75F55741986E1263476B27416EA301987EF5574177BE9FFA4F6B2741F1F44A1982F55741371AC03B576B27415BB1BF2C84F5574104C58FF15B6B2741A4DFBE8A85F557416F810425706B27416A4DF3A686F55741F5B9DA6A8E6B27412CD49AD286F557412B189554B56B27417AA52C2F87F55741787AA54CE16B274176E09C6D88F5574194F606BF036C274196218E6D8BF55741569FABCD146C2741EB73B54D8EF557410612149F216C2741431CEB6291F55741D656ECAF246C2741158C4A7292F557413FC6DC952B6C27413FC6DCD594F557414C3789412D6C2741371AC09F97F55741CE19511A2B6C27419FCDAA479BF5574144FAED4B256C274168226C809EF55741A3923A81066C274146B6F349A8F55741BEC11786F16B2741CA32C4E5AEF55741000000E0DB6B2741E25817EBB8F557416B2BF697D66B2741B515FB97BEF55741E8D9ACFADC6B27416519E2D4C2F557419C33A2F4EC6B274189416071C6F55741151DC9E5026C274163EE5A72C9F5574196218E550C6C2741E78C2865CAF55741C5FEB29B176C2741D88173B6CAF55741287E8CD9336C27414D158C62CAF55741DD2406414B6C2741D3BCE3B4CAF5574196B20C11616C2741E8D9AC96CBF55741EC51B8DE6D6C2741787AA560CCF5574161325510786C2741F0164870CDF557419EEFA7E6816C2741705F07CECEF55741F46C567D886C27412A3A9237D0F5574129ED0D3E8E6C2741F8C26446D2F557413411369C906C274102BC0532D4F55741492EFF41946C2741280F0BC1DCF55741386744E9AA6C27410000002CE1F5574196438B6C666D2741462575A6F4F55741F8C264AAE06D27410A68221002F65741C8073D9B416E2741C520B0C20CF6574105341156986E274116FBCB2A18F65741423EE8D9FE6E2741BBB88D2628F657416C09F9A0376F27418638D67D32F657418D28EDAD656F2741F0A7C6473DF657414BEA04F4956F274105C58FB94BF65741DB8AFD25B36F27413EE8D90059F65741E0BE0EBCC26F2741986E128762F65741287E8CB9CF6F2741A4DFBE7E6AF65741A52C431C377027416DE7FB156EF65741CDCCCC2CAA702741BEC117E65BF657411283C04AE17027415D6DC52E53F657418CB96BA9897127417C61329943F65741A779C769FF7127411D38679038F65741BA6B091926722741448B6C1F33F65741AB3E575B7C7227418F53743420F65741A323B99CB1722741C0EC9EB817F65741D734EF38FF722741DC4603CC10F657413E7958E8E673274132E6AEBDFDF557418A8EE4128474274191ED7CDFEAF557411FF46C760175274168226CE0DBF5574126E483BE9E752741E0BE0E10D1F557413D9B555F6876274176E09C6DC3F55741363CBD12F0762741E6AE2560B5F55741C58F315757772741D656ECAFAAF55741DF4F8DD782772741C364AA40A4F55741D34D6270AA7727412C65194E9BF55741AD69DE71D4772741728A8EC88EF55741B37BF210FC772741A4703D4A88F55741A913D0641778274114AE474585F557416F1283C02E782741D0D556C882F55741925CFEE381782741105839387AF55741E78C286D1179274139B4C8726BF55741AD69DE51947927411895D49560F55741CE19515AD5792741516B9A935CF55741
15	MC	MCA	Les Arceaux	MONTPELLIER CENTRE	01060000206A0800000100000001030000000100000038000000FC187357F17F274188635D0482F457412BF697DD5D802741304CA65275F45741470378AB878027419CC420D071F4574171AC8BDB70802741DF4F8DEB4BF45741C3F528FC7B802741637FD9E14BF45741516B9AD7858027418CB96B854BF457410C022B079380274107F016604AF457416744696F9F802741D578E9C248F457418716D92EAE8027412B87169146F45741F9A067D3B680274183C0CABD44F45741228E7551BE802741A301BC8142F45741E5F21F52C38027415F984C7540F45741A779C729AB7F274107CE190123F4574197FF90BEB57F2741DF4F8DFB19F45741696FF0E5C27F274161C3D3F70BF457411CEBE256E67D27414D158C3E0CF45741A69BC4C0D77D2741A60A46C104F4574188F4DB57197D27414BC8079D09F457418638D6E5B17C2741492EFF6511F4574162105839977C27415305A3D612F457417E8CB90B797C274108AC1C3A14F457412D431C2B567C27419A99996D14F457414C3789811E7C2741E258173314F45741D95F768FB17B2741F01648BC11F457410B24289E287B27414694F6AE15F457419CA22339DA7A274180B740F617F45741E4141D098E7A2741D656EC8319F457413EE8D9CC337A2741D734EF601AF45741840D4F6F6E79274117B7D1D819F45741B4C876DECA7827413D9B55D717F45741431CEBA26E78274176E09CB516F4574103780B84737827417FFB3AB039F457418CDB68E0F8782741E78C28A53CF457414A7B83AF1C792741917EFB7A41F45741228E755199792741FA7E6A3051F4574125068195CE7927411EA7E83055F4574139B4C876F47927410A68222059F457410C022B676F7A27415F984CD56BF457414182E2E7967A274116FBCBE275F45741F31FD22F9F7A2741250681817CF45741BA6B0999A07A2741D3BCE34083F4574130BB278F937A2741CFF7530B8FF457415DFE439A127B2741E8D9ACF2B5F457416D567DEE867B274188635DACBEF45741787AA52C487B2741166A4D27C5F45741F31FD2CF307B2741A4703D92C7F45741C286A7F7167B2741849ECD4ECAF45741302AA933DB7A2741933A01A1D0F457417A36ABFE8D7A2741190456FAD5F45741000000E00F7A2741EC2FBB17DDF457417368912D7F7A27413F355E5EE3F4574144696F107A7B274175029A2CEEF45741F853E305FF7B2741A4703DDEF6F457415EBA496C877C2741DDB584F4E7F4574173D71252B27D2741A3923A61C5F45741FC187357F17F274188635D0482F45741
4	PA	PAH	Les Hauts de Massane	MOSSON	01060000206A08000001000000010300000001000000EE010000EEEBC099DB6627411A51DABF67F75741D95F762F50672741ABCFD5F657F75741D712F201576627417958A84546F757416DE7FB695966274168B3EAB744F7574187A757EA956627412C65195E1DF757411A51DA5BA76627419FABAD1012F757412CD49A06B066274119E2586306F757416ADE712AC56627412A3A925700F75741E78C28EDF76627417DD0B3D1F1F65741D200DEC2056727413D2CD4F6ECF65741363CBDB214672741C1A8A4BAE7F657419B559FEB1B672741C0EC9E2CE5F65741499D800632672741A69BC498E0F65741E7FBA9D17567274144696FA8D8F65741F90FE9B7A86727411D386790D2F657410E4FAFF4CE6727412E90A000CEF657411748509C1068274183C0CAD9C5F65741F0A7C6EB4D6827410534113ABEF657410F0BB50662682741A167B3AAB9F657410F9C332275682741C217260BB1F657410F9C33E299682741D3BCE37CA4F65741DF4F8D17C76827418273462495F6574132E6AEC5D668274166F7E4C98FF65741A835CD3BE7682741D34D62F08AF657418126C246FA682741C3F5285C85F65741E71DA76805692741705F074E81F657416688635D0E692741AB3E576B7CF65741D656EC2F11692741E5F21F6E77F65741C9E53F040D692741789CA29B72F657416FF085E909692741B6F3FDDC6EF65741E09C1145016927410000006064F65741FD87F45BFD682741462575B65FF657419A779C02FC68274152499D185EF6574139D6C52DFD682741E92631C05CF65741D93D791802692741F5DBD7595BF65741401361A3CB682741EEEBC0953BF65741560E2D72F467274111C7BAD037F657416EA3015CF6672741228E753930F6574158A8352DF5672741787AA5482FF6574155C1A884F46727418048BFBD2EF657417DD0B379F3672741B29DEF0B2EF6574199BB9650F1672741D42B65792DF65741A4703D2AF067274109F9A0132DF657418126C266ED672741CC7F48DF2CF65741C9E53F64EA672741DC6800BB2CF65741AF25E483E66727418FE4F2BB2CF6574135EF38C5E167274108AC1CDA2CF65741EC2FBB27DC67274192CB7F0C2DF6574101DE0229D967274112143F262DF65741DE0209EAD5672741BA6B093D2DF65741394547F2BE672741C5FEB2EB2DF6574107F0162885672741211FF4B42FF65741E3361A805C67274195D4098431F65741C05B20812B672741C7293AF633F65741547424D7086727411973D79A35F657419EEFA7E62F67274197900F7E3CF65741933A016D29672741C442ADF13CF65741E7FBA951226727416ADE714A3DF6574154E3A51B146727416DE7FB053EF6574177BE9FFAE9662741FFB27B4A40F657419BE61D47AD662741075F988C43F6574103780B0456662741759318FC45F6574150FC18332766274109F9A04347F6574105A392DAF7652741C8073D0F48F6574120D26F3FE0652741029A088748F6574117B7D140D765274111363CAD48F65741C1A8A4AEED652741986E12774BF65741F0164810AF6527417FD93D3154F6574154E3A51BB6652741A913D0EC56F65741992A18B505662741DAACFA205CF657414D158C4A1266274168B3EA9F65F6574124287ECC6D6327417B14AE2766F65741091B9EFE88622741903177C966F6574195658823706127414182E2EB66F65741C898BBB65A61274194F6063F66F65741295C8F6244612741F54A591A65F65741F54A5986336127418273466863F65741CB10C71A22612741C8073DBB60F657415B423E28C8602741D0B359BD4FF657414FAF94A585602741A7E848B643F65741BD5296A1726027414703787B3FF657419D11A57D66602741FE43FA353BF657419BE61DE7BF5F27416FF085E13AF65741304CA62AB05F27418A1F63363BF65741560E2DB2A05F2741105839CC3BF657410B462595995F2741DAACFA083CF65741986E1223875F2741BC74930C3DF657410E4FAF547B5F2741BD5296413EF65741378941605F5F274134A2B43B41F657418FE4F29F345F27415452278041F657418104C56F3E5F2741F7065FCC50F657412F6EA341425F2741925CFE0356F657413D2CD4DA505F2741705F07A25BF65741ADFA5CAD765F27417D3F35DE68F65741E9B7AF63815F27417AA52C536EF657419EEFA706875F27416B9A77A074F65741BC7493F8865F2741B98D06E079F6574186C954817D5F2741C0EC9E8C7CF6574136CD3B2E735F27416ADE717E7FF65741D712F2015F5F27413480B7F082F657419A9999B92A5F2741CC5D4BF48AF657417DD0B379E65E2741F4FDD49C93F65741FDF675A09C5E27415E4BC8BB9CF65741ACADD87F735E2741CAC34211A1F657410C93A902265E2741AC8BDBE8A7F65741575BB1FFF25D27417424975BB4F65741F38E53B4DC5D2741E3A59BECB9F6574151DA1B5CD35D274189416095BEF65741423EE8B9CA5D27410E4FAF8CC0F65741A69BC420B55D27415986382EC3F65741EF3845878F5D27418AB0E1F1C7F657416D567D0E6E5D2741DE718ABACCF65741E86A2B16695D27413B70CE40CDF65741DDB5841C635D2741840D4FB3CDF6574158CA32E45A5D274164CC5D3FCEF657416744690F475D27415EBA4918CFF657411F85EB71415D2741567DAE4ACFF65741D734EFF8235D274144FAEDEFCFF657419CA22379F85C2741E02D903CD0F6574168226CB8ED5C274157EC2F43D0F65741547424B7E75C2741787AA538D0F65741B9FC8714E15C27417FD93D19D0F65741BEC117C6C25C2741DF4F8D5FCFF657418CB96B69895C27411C7C61EACDF657415F07CED9675C2741234A7B23CDF657414D840D2F525C2741C5FEB297CCF65741C66D34603A5C274168226CCCCBF657411F85EB31255C2741499D8006CBF65741FBCBEEA91A5C27416F810495CAF65741948785FA075C2741B6847CB8C9F657417C613215045C2741F9A06767C9F657412063EEDAF25B27418D976ED6C7F6574104E78C88E75B27412AA913BCC6F6574114AE47A1E25B2741A3923A4DC6F657417F6ABC34D55B27418D976E96C5F65741F5B9DA4AC95B274114D04408C5F657418126C286C25B27414260E5D0C4F65741234A7B63B55B27412B8716B1C4F657413D2CD45A895B274183C0CA6DC4F6574162A1D6145D5B274105A39256C4F65741333333B33C5B2741910F7A72C4F65741C520B0F22C5B274118265385C4F65741083D9B951D5B274150FC18CFC4F65741E2C7981B105B2741B22E6E47C5F65741DA1B7C61045B2741613255BCC5F657413BDF4F0DCF5A2741C364AAE4C8F657417E1D38A7B55A274103780BB8CAF657410A68228CAF5A274198DD9313CBF6574139D6C50DA95A2741C3D32B39CBF657416D567DCEA35A27419031774DCBF65741FE43FA4D9D5A274103780B50CBF657419BE61D67885A2741BE9F1A03CBF65741567DAEF65B5A27411B2FDD40CAF65741DFE00BB3515A274119E25817CAF65741A167B30A335A2741151DC9C1C9F65741AC8BDBE8265A2741ED0DBEB8C9F6574175029AC8215A2741B6F3FDBCC9F6574144FAED2B155A2741992A1809CAF6574170CE88D2065A27419D11A58DCAF6574125068135FF592741022B87CACAF65741EE5A427EEE592741E8D9AC76CBF657417FFB3A90D85927419D8026C2CCF65741C898BB16D2592741F0A7C637CDF6574146B6F37DCD592741B459F5B5CDF6574164CC5D8BC659274112A5BD9DCEF6574175931824BC59274121B07244D0F657412731082CBA5927416DE7FBC9D0F65741567DAE16B85927412A3A927BD1F65741B30C710CB5592741B3EA73E5D2F657416B2BF637B4592741EC2FBBA3D3F657415BD3BCC3B35927418D28ED65D4F6574103780BA4B45927418D28ED75D6F65741A4DFBE6EB5592741A835CD23D7F65741D578E9A6BA592741C520B0A6D8F65741668863DDC15927410612140BDAF65741772D211FCE592741840D4F1FDCF6574152499D60F4592741E3A59B1CE2F65741B7D1007E245A2741567DAED2E9F65741E71DA708365A2741E9B7AF6FECF657418FE4F2BF405A27417E1D38DBEDF6574158CA3204515A27416D567D12F0F657410DE02D50645A274197900FC2F2F6574155C1A8247A5A2741E17A14FAF5F65741728A8EC4845A274133C4B1F2F7F65741F697DDF3875A2741DC4603E8F8F65741C364AAE0895A2741E561A1B6F9F657415B423E888A5A27416FF08531FAF65741EB73B5B58A5A274197FF900EFBF65741ECC039638A5A2741ED0DBEECFBF657410A68226C895A274127310880FCF657416C09F9007D5A2741789CA20302F757410E4FAF147A5A2741234A7B4B03F7574116FBCB4E725A2741143FC61007F75741C8073DBB6B5A27413108ACF409F75741742497FF655A2741CE1951520CF75741ECC03983575A274127C286CB12F75741BDE314FD535A274105C58F7914F757410B4625754A5A274148E17A2C1AF75741F0A7C6CB495A27415F29CBA01BF7574186C954014B5A27413EE8D90C1FF75741AAF1D20D4B5A2741FAEDEBD81FF75741228E75314D5A2741637FD92924F75741516B9A774F5A27411361C3A328F7574124287EEC4F5A274183C0CAF929F757412F6EA3C14F5A27416C09F9542BF75741234A7B034E5A274177BE9F822DF75741C139238A4D5A27415E4BC8EF2DF757417958A8354C5A274157EC2FAF2EF75741547424B7475A274110E9B7E732F7574105A3923A455A2741E02D903035F7574194F606FF445A2741304CA67A35F75741789CA223455A27419D11A5C535F75741C9E53F64485A2741986E12D737F757412AA913D0495A2741F163CC9538F757414BC807DD4B5A2741AEB6626739F757410F9C33224C5A274188855ABB39F7574103098A7F4A5A27419E5E29AB3DF757412EFF21DD495A274193A982913FF75741C8073D1B4C5A27410C022B7B41F757414CA60A264D5A2741917EFB2A42F75741E8D9ACFA4F5A2741D6C56D7843F7574117B7D1A0505A2741840D4FDB43F75741B07268F1505A274119E258EB44F75741029A083B505A27414FAF948945F75741075F986C4D5A27411C7C61AE46F757413CBD52B64A5A274108AC1C5247F75741CCEEC923455A2741E02D903848F757415BB1BF8C3F5A2741B6F3FDD448F7574194F6063F325A27413F355E164AF7574121B07208265A27411E166AC54AF75741F2B0506B205A2741F163CCFD4AF75741D34D6290105A2741A245B66B4BF7574191ED7C9F0A5A27413867446D4CF75741EC2FBBA7F8592741B1BFEC1E4FF75741E4141DC9BF592741C520B0C657F757410B462555C55927413D0AD79B5CF757410D71ACCBC6592741E561A10A5EF757410D71ACEBF659274144FAEDF767F7574133333373F9592741F6285C6F68F75741D49AE61DFF592741280F0B1569F7574108AC1C9A0C5A2741D734EFCC6AF757412063EE5A105A27414BEA04D46AF75741E0BE0E1C1E5A27419FCDAACF6AF757416DC5FE726A5A274199BB96E06FF757415DDC46E3785A27419E5E29D370F7574124287E0C975A27414E62104473F7574152499D40BC5A27411748505C76F7574108AC1C7ACE5A2741B98D06E077F75741D0D556ECDD5A2741F7065FF078F757412D431C2BE05A274117B7D1D878F75741A167B36A0E5B2741CC5D4B7876F75741CF66D5E7245B274197FF901674F75741068195A3655B27416F12835871F75741BBB88D666C5B27418AB0E17D71F75741B1BFEC3ED95B274154E3A56374F75741FF21FD16FF5B27415D6DC5BA77F75741A9A44E401B5C274155302A317AF75741E10B93A95D5C274104560E9984F75741022B87766F5C27410000005C87F75741D5E76AEBB15C27418048BF7590F757410EBE30D9465D2741780B24C4A0F75741287E8CB9585D27414850FCB8A2F757415917B731895D2741C7BAB80DA8F75741BADA8ADD945D27418FE4F2BBA8F75741F7065F18CF5D27412D431C1FACF75741FB3A70EEE65D274169006F61ADF7574161325570E95D274161C3D37BADF75741917EFB1A525E2741B459F5A1B3F757412497FF10075F2741211FF41CBEF75741250681153F5F27417DAEB622C2F75741FA7E6A3C1960274130BB278FD1F75741D734EFF87F6027418AB0E1DDD8F7574192CB7F68A7602741728A8EA8DBF7574129CB10A7C1602741F54A5972DDF75741925CFEE3FC60274173D712EADEF75741EA0434B119612741772D2193DFF75741287E8C9921622741BA6B09FDCDF75741AF9465085562274179E92681CAF757411904564E7F622741F697DD9BCAF7574117D9CEB7C062274146B6F3C9CAF7574195658883C462274175931884CBF75741BF7D1D58CB62274197FF90CACCF757414D840DCFCE62274189D2DE3CCEF75741742497BFD062274125068149CFF757411895D4C9D1622741615452EFCFF75741B98D0650D2622741ED9E3C54D0F75741BF7D1D98D2622741A2B437D8D0F7574160E5D0E2D26227417E1D3887D1F75741840D4F8FD2622741F7E46155D2F75741E2C798DBD1622741789CA21FD3F757414C378921D1622741F5B9DA82D3F75741BE9F1A8FCF622741CFF75363D4F757410BB5A699CD622741643BDF13D5F7574180B74062CB622741D93D79A4D5F75741BE30992AC9622741E09C1131D6F757419C33A214C66227411CEBE2DAD6F75741F46C561DC36227417A36AB6ED7F757416C787A85BF622741BE3099FAD7F75741075F982CBC6227416B9A7774D8F757415F984CD5B76227417446940AD9F757412BF697BDB2622741AE47E19AD9F75741FE65F724AD622741F1F44A1DDAF75741BB270F2BA862274196218E89DAF7574107CE1911A262274174B515F7DAF75741A60A46058C622741BE309966DCF75741D7A370FD7162274108AC1C1EDEF7574124287EEC63622741787AA52CDFF75741BC9690EF60622741AF946564DFF75741083D9B355B62274162A1D6D0DFF7574143AD693E54622741075F986CE0F7574175029AA84C622741DDB58420E1F75741B37BF2504762274140A4DFB2E1F757419CA223D941622741EE5A4242E2F75741DA1B7C013D622741499D80D2E2F75741B6847CD0356227413F575BD5E3F757419A99991932622741F38E5370E4F75741B537F8622E622741CC5D4B10E5F7574133C4B1AE29622741DDB584D8E5F757413A234A5B256227410C93A9AEE6F7574126E4831E27622741C9E53FE0E6F757415EBA498C2C6227416F8104B9E7F75741EE5A425E46622741F9A0679BE4F75741FCA9F1F24D6227416C787AD5E3F75741B8AF038756622741166A4D03E3F757410612147F5D622741287E8C75E2F75741CEAACFB566622741A4703DCEE1F75741C21726736962274196218E9DE1F75741D200DE8279622741B81E8577E0F757410A6822EC90622741302AA9DBDEF75741560E2D32AB62274105341106DDF757412D211FD4C96227418A1F63E6DAF75741F9A067D3EB62274189D2DE94D8F75741857CD0130D63274103098A57D6F75741FE43FA4D34632741EB73B5A9D3F75741780B24C85B632741CE88D2FAD0F75741A3923A618563274167446937CEF75741CA32C451B76327414260E5D8CAF7574100000060EB6327413FC6DC51C7F757411283C0EA236427417DD0B389C3F75741984C15AC436427418048BF5DC1F75741637FD97D52642741713D0A5BC0F757418351495D75642741840D4F0BBEF75741EA04345181642741A9A44E30BDF7574166F7E4217D6427417FFB3A3CBCF75741C66D34405D642741107A3663BEF757412FDD24E656642741849ECDCEBEF75741D3DEE0AB4E6427418716D93ABFF7574173D71252446427411E166AB1BFF75741D42B651937642741575BB13FC0F757416891ED7C31642741E2581783C0F75741CC7F485F2D64274176711BB1C0F75741295C8FA229642741280F0BEDC0F7574104E78CE8226427415AF5B95AC1F757419D80262204642741B0726831C3F7574166F7E401E0632741FB3A7076C5F75741492EFF41BA63274189D2DEC4C7F75741C1CAA1C5B563274124B9FC07C8F7574121B07288B1632741280F0B3DC8F757417B832F6CA963274103780B88C8F757419FCDAAAFA1632741B459F5CDC8F75741E7FBA9319B63274105C58FF9C8F75741BC05127493632741228E752DC9F757419C33A2F48B632741A8C64B43C9F7574196218E15856327416DE7FB5DC9F75741B9FC87D47B632741ED9E3C5CC9F757416ABC7413766327419C33A254C9F75741D044D890706327414694F632C9F7574110E9B7EF6863274117B7D12CC9F7574139D6C5AD63632741BEC11716C9F7574170CE88D26263274118265365C9F757419E5E29CB40632741BD529625C9F757412A3A926B42632741B515FB1BC7F7574139B4C896456327411B2FDDB4C3F75741158C4A8A48632741637FD9D5C0F75741E02D90404B6327411EA7E824BEF7574126E483DE49632741857CD0EBB9F75741B1E1E9D5486327413A92CB53B7F75741D200DE024763274108AC1C1EB6F75741894160A543632741C976BE3FB4F757415E4BC827406327411D386760B2F757419A779C823F6327414B59860CB2F757410612141F38632741F775E0C4ADF757418D976E123363274117B7D1F0AAF75741D1915CFE2A632741C364AAB4A9F75741083D9B7519632741C442AD35A7F757412497FF500963274165AA60F8A4F757415227A0E907632741FDF67574A2F75741E561A1360663274170CE88329FF7574148BF7DDDFC622741D200DEB29FF757416DC5FED2E2622741F6285C3FA1F75741107A362BC5622741CA32C4FDA2F757412C6519C2B16227417958A895A4F757413F355E1A9E622741C0EC9E44A6F757416D567D2E8D6227411CEBE2AAA7F7574123DBF9BE8162274182E2C7CCA8F75741CEAACF5571622741FCA9F15EAAF75741FDF675C069622741AD69DE19ABF7574172F90F8963622741454772B1ABF75741903177AD5F6227418CDB6800ACF75741302AA9335B622741287E8C6DACF75741C898BB963E622741A69BC4DCAEF75741EBE2365A17622741D26F5F57AFF757416519E2B812622741F016483CADF75741A089B001036227413D9B55B3A5F757410DE02D30EF612741C74B37819CF75741AF9465A8326227410E4FAF909BF75741B8AF03473E622741ABCFD5669BF757411B2FDD2450622741228E75259BF757414625754266622741BA6B09D99AF75741D734EF58B7622741C3D32BB599F7574131992A18BE6227416FF0859D99F75741567DAE96C76227410EBE307599F75741BA6B0939F36227412EFF213995F75741F163CCBD06632741A01A2F5993F75741E63FA4DF1B632741F31FD24791F75741AC1C5A642F63274140A4DF668FF75741B515FBAB406327416D567DBA8DF75741E926312843632741F697DD778DF75741B515FB8B5663274145D8F0888BF757413B014D445C63274148BF7D018BF75741E78C28ED686327415B423E7089F7574144FAEDEB7A6327412E90A03087F75741075F98AC8C632741992A181185F757417AA52C639163274140A4DF6E84F75741107A360BA9632741D712F2BD82F75741F4FDD4D8BA632741226C787281F75741EB73B555BD6327411973D73A81F7574196B20CD1CB632741E09C11C97EF75741832F4C26D0632741FBCBEE117EF75741CA32C471DD632741BBB88DAA7CF75741A857CA12F163274196218E8D7AF757419C33A2740464274177BE9F7E78F75741FC18735717642741857CD07F76F75741B1506BFA29642741BC05128474F757415227A0C9486427411058393071F757417D3F357E64642741C3D32B396EF7574199BB96F028642741333333A369F75741D1915CFE1A64274191ED7C8F68F757410C022B27EB632741849ECD5665F757418CB96B29D2632741C6DCB59863F757418638D605D0632741EA04346163F7574187A757CADB6327419D80268A61F757412F6EA321F16327410C93A9CA5EF75741DDB5849C15642741166A4D1F5AF75741C7293AF22B642741BC96904357F75741F241CF664264274183C0CA5554F75741DAACFA7C58642741E5F21F8251F75741CA32C4B16E642741FA7E6A984EF757416519E2987B6427412C6519EA4CF757411283C08A736427418126C2024AF75741D9CEF713446427415D6DC5C244F757411B0DE0CD66642741AAF1D20940F75741C139236A6B6427413108ACC43FF7574126E483DE9F642741C217268738F757416F810445C164274180B740C63AF75741FA7E6A7CD76427414850FC203CF7574129CB1047196527416744697B40F757415AF5B91A636527418FE4F25B45F757419D11A51D6E65274114AE477945F757418CB96B69B76527418AB0E1D949F75741DE718A4EBC652741C7BAB8254AF75741B8AF0307F26527416DE7FB694DF75741C74B3709F4652741B840828A4DF75741A8C64BB7FE652741925CFE5F4EF757413B014DA407662741D49AE6254FF757418FC2F5C8236627418273465051F757410E4FAFB42C662741560E2D0252F75741A8C64BD72E6627413108AC2852F75741C1CAA1E53B662741744694FE52F757415BB1BFEC43662741E7FBA96553F7574179E9269149662741174850A453F7574113F2410F53662741A1F8318255F7574136AB3E9755662741C1CAA10156F75741780B24A8646627413945470A59F75741D656EC2F676627415917B78559F75741F085C9D46866274119E258D359F757414B5986186A6627410534110E5AF757416891ED9C6B6627417E8CB9535AF757418CDB68006E66274155302A895AF7574155C1A8046F662741B37BF2CC5AF7574109F9A0A7706627414DF38EFB5AF7574164CC5DAB72662741992A18355BF757416D567D0E7566274127A089645BF75741BC0512D477662741F931E6BA5BF75741948785FA7A66274131992A205CF7574144FAED8B8366274157EC2F2F5DF75741378941208E662741A4DFBE6A5EF75741B515FB0B94662741894160215FF75741295C8F829F662741A323B98060F757412D431CCBC4662741E4141DE964F75741FCA9F152C8662741A8C64B6365F757414ED191DCCC66274180B740FA65F757411B0DE0CDD566274157EC2F0767F75741EEEBC099DB6627411A51DABF67F75741
6	PA	PAI	LA PAILLADE	MOSSON	01060000206A080000010000000103000000010000006D0100008FE4F29F345F27415452278041F65741378941605F5F274134A2B43B41F657410E4FAF547B5F2741BD5296413EF65741986E1223875F2741BC74930C3DF657410B462595995F2741DAACFA083CF65741560E2DB2A05F2741105839CC3BF65741304CA62AB05F27418A1F63363BF657419BE61DE7BF5F27416FF085E13AF657419D11A57D66602741FE43FA353BF65741BD5296A1726027414703787B3FF657414FAF94A585602741A7E848B643F657415B423E28C8602741D0B359BD4FF65741CB10C71A22612741C8073DBB60F65741F54A5986336127418273466863F65741295C8F6244612741F54A591A65F65741C898BBB65A61274194F6063F66F6574195658823706127414182E2EB66F65741091B9EFE88622741903177C966F6574124287ECC6D6327417B14AE2766F657414D158C4A1266274168B3EA9F65F65741992A18B505662741DAACFA205CF6574154E3A51BB6652741A913D0EC56F65741F0164810AF6527417FD93D3154F65741C1A8A4AEED652741986E12774BF6574117B7D140D765274111363CAD48F6574120D26F3FE0652741029A088748F6574105A392DAF7652741C8073D0F48F6574150FC18332766274109F9A04347F6574103780B0456662741759318FC45F657419BE61D47AD662741075F988C43F6574177BE9FFAE9662741FFB27B4A40F6574154E3A51B146727416DE7FB053EF65741E7FBA951226727416ADE714A3DF65741933A016D29672741C442ADF13CF657419EEFA7E62F67274197900F7E3CF65741547424D7086727411973D79A35F65741C05B20812B672741C7293AF633F65741E3361A805C67274195D4098431F6574107F0162885672741211FF4B42FF65741394547F2BE672741C5FEB2EB2DF65741DE0209EAD5672741BA6B093D2DF6574101DE0229D967274112143F262DF65741EC2FBB27DC67274192CB7F0C2DF6574135EF38C5E167274108AC1CDA2CF65741AF25E483E66727418FE4F2BB2CF65741C9E53F64EA672741DC6800BB2CF657418126C266ED672741CC7F48DF2CF65741A4703D2AF067274109F9A0132DF6574199BB9650F1672741D42B65792DF657417DD0B379F3672741B29DEF0B2EF6574155C1A884F46727418048BFBD2EF6574158A8352DF5672741787AA5482FF657416EA3015CF6672741228E753930F65741560E2D72F467274111C7BAD037F65741401361A3CB682741EEEBC0953BF65741D93D791802692741F5DBD7595BF65741FED478E9086927412AA913585AF65741D1915CFE13692741166A4D8F59F65741992A18B5766927416891ED4056F65741E25817579A692741B98D061854F65741984C15ACB8692741F46C562151F657414CA60A66E1692741C6DCB5504AF657416B9A777C106A2741DCD7813B43F657412D211FD45E6A27417B14AE033CF65741D50968A26B6A274120D26FCB3AF65741D93D7998A16A2741A69BC4B035F65741AC8BDB28096B27416FF085C92BF65741EBE2361AC06B27415839B45C1FF65741E6AE25C4766C2741D0D5569016F65741EEEBC0F9B66C27411C7C616A13F65741304CA6EAF56C2741C6DCB5F80FF65741D578E9E6056D2741772D217709F657414703780B346D274141F16314FBF5574196438B6C666D2741462575A6F4F55741386744E9AA6C27410000002CE1F55741492EFF41946C2741280F0BC1DCF557413411369C906C274102BC0532D4F5574129ED0D3E8E6C2741F8C26446D2F55741F46C567D886C27412A3A9237D0F557419EEFA7E6816C2741705F07CECEF5574161325510786C2741F0164870CDF55741EC51B8DE6D6C2741787AA560CCF5574196B20C11616C2741E8D9AC96CBF55741DD2406414B6C2741D3BCE3B4CAF55741287E8CD9336C27414D158C62CAF55741C5FEB29B176C2741D88173B6CAF5574196218E550C6C2741E78C2865CAF55741151DC9E5026C274163EE5A72C9F557419C33A2F4EC6B274189416071C6F55741E8D9ACFADC6B27416519E2D4C2F557416B2BF697D66B2741B515FB97BEF55741000000E0DB6B2741E25817EBB8F55741BEC11786F16B2741CA32C4E5AEF55741A3923A81066C274146B6F349A8F5574144FAED4B256C274168226C809EF55741CE19511A2B6C27419FCDAA479BF557414C3789412D6C2741371AC09F97F557413FC6DC952B6C27413FC6DCD594F55741D656ECAF246C2741158C4A7292F557410612149F216C2741431CEB6291F55741569FABCD146C2741EB73B54D8EF5574194F606BF036C274196218E6D8BF55741787AA54CE16B274176E09C6D88F557412B189554B56B27417AA52C2F87F55741F5B9DA6A8E6B27412CD49AD286F557416F810425706B27416A4DF3A686F5574104C58FF15B6B2741A4DFBE8A85F55741371AC03B576B27415BB1BF2C84F5574177BE9FFA4F6B2741F1F44A1982F55741986E1263476B27416EA301987EF557418716D9EE306B2741D93D793C75F557415BD3BC230D6B27414BC807816AF5574182734634166A27416F81043144F5574121B072C88F6927416DE7FBED33F55741E63FA43F426827413B70CECC14F55741E9B7AF83026727417B14AEB702F55741A9A44E6086662741CD3B4E31FDF45741F7E46181186627417CF2B0E8F9F457418A8EE412EF65274148BF7D35F7F45741D7A3703DCD65274140136103F4F45741BE30992AB3652741C3D32BE1EEF45741F5B9DAAA9D6527414850FCF0EAF45741925CFEA361652741F7065FDCE8F45741D34D62F0B26427414A0C0297E0F457418CB96B8934632741B1E1E931CCF45741AC1C5AA4A06227410D71AC93C0F457415839B4687B61274196438BE8C4F45741A2B4373810612741AF946588C2F45741B1E1E935A26027413C4ED109BFF45741E6AE25844B602741D6C56D64BAF45741D122DB194B6027419FABADC8BBF457415DDC464340602741CF66D58FC0F45741A779C7293F602741E6AE25FCC0F45741DF4F8DF73060274179E92611C6F457414850FC182A602741E09C1141C8F4574188855A731D602741728A8E14CCF45741AF9465A81060274196B20C91CFF457417368912D066027411B2FDD04D2F45741EA95B26CFC5F27416B9A7714D4F457412F6EA361E95F2741DA1B7C99D7F45741BF7D1D18C65F27417DD0B361DDF45741AAF1D22DB15F2741E9482EF7E0F45741DB8AFDE59C5F274127C286B3E4F45741DFE00B73815F2741EFC9C3D2E9F4574199BB96506C5F27413F575BE9EDF45741068195835B5F274160E5D04AF1F45741CA54C188465F27418CB96BDDF5F45741B3EA7355335F27419C33A2E8FAF45741280F0B35165F27416744693B01F5574139D6C5CD0D5F2741E63FA4DF02F5574144FAED0B005F27417D3F35E604F55741F90FE977EA5E2741F085C9DC07F5574183C0CAE1D75E2741BF0E9CAB0AF557412A3A920BC75E2741931804760DF55741ACADD89FB15E2741E3A59BF410F55741FE65F7C4A25E274100917E6F13F557418D28ED2D935E2741BD52962916F5574143AD69FE8C5E2741107A364317F5574199BB96D0735E2741EB73B5A51AF5574151DA1BBC5D5E2741B07268951DF55741D0B35935525E27418BFD65471FF55741CDCCCCEC375E27410F9C330223F557411AC05B202B5E27419031775924F5574142CF66B5115E274160E5D0DE25F5574197FF901E085E274135EF388526F55741832F4CC6025E27414FAF940D27F55741A69BC4C0F75D2741B4C876D228F55741705F07CEF45D2741A60A46B129F557411B2FDDC4E95D274119E258472DF5574104C58FB1DF5D2741764F1E3630F55741AF9465E8D95D2741C520B0B631F55741499D8086D05D27417B832FB433F55741E92631A8C45D2741AA8251F135F5574102BC0592C05D27416688639936F55741CE88D21EB95D2741CC5D4B7837F55741C74B3789B25D274190A0F82D38F557413CBD5256A95D27413BDF4F1539F557410E2DB23DA35D27413EE8D99839F557417AA52CC39A5D27418FC2F5003AF55741F853E3C5915D274132772D3D3AF55741182653E5895D2741BEC117423AF557412041F103815D2741EE5A423A3AF55741D50968627D5D2741E5D022273AF5574164CC5D8B595D27415BD3BCEB38F557415DDC46034B5D27417FFB3A8038F557415D6DC5DE3C5D2741C286A74F38F557413108ACBC305D2741083D9B4138F55741143FC6BC2A5D274173D7124E38F55741F163CC1D265D2741107A366738F5574132772DC1205D274103098AA738F55741666666461B5D2741431CEB0639F557415BB1BF2C165D2741107A367739F55741E7FBA9F1125D2741705F07CE39F5574182E2C7580F5D27418FC2F5483AF557416FF08549085D2741A835CD673BF557417B14AE27FE5C2741234A7B673DF557416DE7FB49F35C274165AA60AC3FF5574102BC0512ED5C27419F3C2C4842F55741BC96908FDF5C274186C954694AF55741CE19515AD65C274150FC18434FF5574132772D21D25C27418BFD65C751F55741E71DA7E8CB5C27410EBE305954F557418104C5EFC45C27419E5E29E756F557413A92CB7FC25C27413FC6DCF157F55741E2E995B2B85C2741BF0E9C435BF557413CBD52D6B05C27415D6DC59A5DF557419EEFA7C6AC5C27418AB0E1AD5EF557411283C00A895C2741014D846167F5574142CF6635855C2741022B871668F557415B423E887D5C2741B9FC875869F55741B5A67947615C27411B0DE0956DF55741F931E68E5C5C27412AA913186EF55741F163CC7D545C27419D80261A6FF55741A1F83166505C2741A1D634AB6FF557419A999979455C2741DC4603FC70F557418CDB6800425C2741423EE87171F5574177BE9F7A2D5C2741BE9F1A4373F55741BD5296E1275C274126E483BE73F55741A7E8480E1A5C2741FF21FDA674F55741A01A2F9D0A5C2741D122DBB575F557411AC05B20DC5B2741B4C8764678F55741304CA62ACD5B27410EBE300979F5574162A1D634BC5B274142CF66CD79F5574159863876B75B2741BC7493EC79F557419FABAD58A75B2741B9FC87307AF557419FABADB8975B274188855A4B7AF557416B2BF697915B27411973D74A7AF55741BC0512B4825B2741FDF675247AF55741933A010D6C5B27412041F1D779F55741CCEEC983585B27410C93A96279F5574154522700525B27415986383279F55741BF0E9C93385B2741AC1C5A9078F55741D95F768F305B2741A7E8485A78F55741728A8E241D5B27418FC2F5C877F557416E348057075B27410EBE301977F557419FCDAACFFB5A2741FD87F4AB76F5574114D04418E15A27413D9B555B75F5574130BB270FD75A2741EC51B8D674F55741F2D24DA2C65A2741787AA52074F55741567DAE76B55A27411361C37F73F55741613255F0A95A274103098A2B73F557414D158C2A9D5A2741091B9EE272F557415227A0698F5A2741B515FBEB72F55741BB270FAB725A274101DE023573F55741273108AC6E5A27410000004C73F5574116FBCBAE685A2741234A7B8373F557413108AC7C565A274102BC058674F55741265305634E5A2741711B0DFC74F55741C3D32B254B5A2741AC8BDB2475F557417E8CB96B455A2741832F4C9A75F55741621058593F5A2741D3DEE08376F55741AC1C5A043B5A2741DC46034077F5574133333353375A27419318043A78F55741401361032E5A27419B559F5F7BF55741F54A5906285A2741CFF753A77DF55741DFE00BB3205A274168226C9080F55741EEEBC0191E5A2741BE9F1A0381F55741A913D084175A2741CCEEC9C381F55741BB270F6B155A27416210582D82F5574196B20CB1145A2741E02D909082F557415EBA498C165A274111C7BA6488F5574197FF903E185A2741D7A3708D89F5574104E78CA8195A27410C022B2F8AF55741DFE00BF3205A2741E8D9ACDA8CF55741AA605472295A27414BC807D990F557414B5986F8295A2741696FF03D91F55741DE718ACE285A27413C4ED1C196F55741B37BF230275A274121B072F898F5574191ED7C1F235A27418126C2FA9BF55741C442ADA9205A27419D11A5B19EF557412063EE1A1F5A274188635DDCA1F557414F1E16AA1F5A27413D9B55D3A2F5574188855AF3205A2741BDE31469A3F557415E4BC8C7255A274195D409B0A4F557413A234ADB2B5A27417CF2B0E4A5F55741C364AA602F5A2741645DDC36A6F5574198DD93C7345A2741508D979EA6F5574161C3D38B395A27418F5374DCA6F55741F01648503D5A274197FF901EA7F557411283C04A7F5A2741711B0D78ACF55741D734EF78895A27410C93A94EADF55741EF3845E7925A2741B3EA7329AEF55741B30C710C975A2741234A7B77AEF55741AE47E17A9D5A27412497FF58AFF55741F775E0DCA65A2741696FF075B1F557419CC42070AC5A2741A245B6A7B2F55741A69BC4A0B25A274160764FAEB3F55741BA490CC2CC5A2741D26F5FAFB7F55741DBF97E4AD05A2741BC969033B8F557417C613255E55A27410F0BB5CABAF557418195430BF15A27412497FF20BCF557417DAEB6A2005B274187A75786BDF557419FCDAAEF095B27417AC7294ABEF5574194F606BF165B27410A682230BFF55741AA605432285B2741DC68004FC0F5574191ED7CDF355B27411283C00EC1F557414E6210B8545B274165AA606CC2F5574180B740828C5B2741B98D06C0C4F55741B515FBCB9D5B2741AD69DE41C5F5574125068195B25B2741637FD9B9C5F55741014D842DD65B274160764F06C7F557417FFB3AF0DC5B27417B14AE27C7F5574136AB3EF7E65B274114AE4789C7F5574160764FDEEE5B27411D5A64EFC7F5574172F90FA9185C2741D93D7964CAF55741DDB5841C2A5C2741F46C5685CBF5574126C286A7315C27414ED1912CCCF557413BDF4FAD345C274140A4DF86CCF557413D2CD45A395C2741857CD05BCDF5574166F7E4A13C5C2741053411CACDF5574175029AA8415C27414182E22FCEF557411E166A4D465C274139B4C876CEF5574114D044F8535C2741355EBA1DD1F55741D5E76A4B5A5C27411748504CD2F55741D734EF985C5C2741637FD925D3F557419A779C625C5C2741FE65F7C4D3F55741F853E3A5595C2741643BDF0BD6F55741F853E385525C2741F4FDD424D8F55741226C785A4D5C2741C8073D7FD9F55741DE718A4E4D5C2741D34D62C8DAF557410A6822EC515C2741E8D9ACB2DEF557419A081B3E565C274112A5BDD1DFF5574101DE02095A5C2741F853E37DE0F557413D2CD4DA635C274152499D90E1F557415305A3B28B5C2741D93D79ECE6F557410DE02DB0985C2741DBF97EBAE8F5574122FDF635AD5C27416A4DF30EEDF55741E3A59B84BB5C2741CB10C7F2EFF557417E1D38A7CA5C2741A9A44E10F2F55741A913D064E35C2741E9B7AFD7F5F55741BC9690AFFE5C2741F2D24D66F8F5574168B3EA530D5D27416C09F9A0FAF55741560E2D121A5D274129CB107BFCF5574103098A1F335D27416B9A774401F65741273108AC3F5D27415839B40804F65741A01A2FBD465D2741BEC1171605F6574126C286E7665D274112A5BDA109F65741CEAACF956D5D2741C66D34800AF65741AEB662DF725D27414772F9130BF65741107A368B7B5D27412063EEC60BF65741A089B0218A5D27419487851E0DF657415305A352965D2741302AA91F0EF65741D8817306C25D2741AA60542611F6574133C4B18E085E2741E2E9954E15F65741F9A067930C5E27419C33A29415F65741ED0DBE10265E2741083D9B4917F65741E0BE0EBC2E5E2741E02D90F417F6574151DA1B5C445E2741B7627FDD19F657419B559FEB5F5E2741BDE314B91CF65741705F07EE745E2741A01A2FC91EF65741061214BF7F5E27419EEFA7CE1FF65741D656EC6F895E2741D50968D220F65741CEAACF158C5E2741F163CC2D21F657415F29CB50B15E2741CE1951C226F657416519E2F8C05E274138F8C23829F6574190A0F8F1F25E2741894160A530F657410E4FAFB4015F27412497FFC432F65741931804361E5F2741234A7BC336F65741D3DEE0CB265F274127C2861B38F6574100917EBB285F2741C3F5281839F65741FC1873B72B5F2741E4839EDD3AF657414DF38E532E5F2741E86A2BA63CF65741378941802F5F27414772F9733DF6574199BB96F0335F2741C74B378540F657418FE4F29F345F27415452278041F65741
10	MC	MCX	Les Beaux - Arts	MONTPELLIER CENTRE	01060000206A080000010000000103000000010000003300000041F1634C818F27412B189590B1F557414ED1911C668A2741772D21DFD6F4574126E483BEF9892741006F8134C5F457417B832FACCE892741A4DFBE06BAF45741CDCCCC2CA9892741BEC117DAA9F45741FB3A700E978927415BD3BC9B99F45741098A1F039589274196B20C998EF457413F575B1195892741B98D063885F457410E4FAFD4A5892741FE65F7C872F4574121B072C8BD89274196B20C4D5FF45741516B9AD7E8882741006F81A05DF4574175029A48FA8827413480B7F46AF457411058397468882741386744B56CF457412F6EA3C1D1872741B98D069C6EF457411D386704D68727418F5374E072F457418D28ED6D5B8727416210585574F4574122FDF6155C87274119E258237FF457419B559FAB6087274104560EAD86F45741A323B9DC56872741B7D100F68BF457414FAF94C53D8727414CA60AFEB9F4574117B7D1E05286274131992A4CBBF45741D7A3703D60852741ACADD8EBC2F4574176E09CF14D842741D42B6545CCF4574173D712327B842741D26F5F83DEF45741CB10C7FAA7842741D9CEF767F5F45741910F7A76158527415DDC46E706F557416EA3017C6385274104E78CC808F5574134A2B477A28627419EEFA75229F5574124B9FC07728527411DC9E5C75BF5574191ED7CFFFB852741780B248862F55741FED478C922862741A01A2F8D79F55741C8073DDB2A8627411973D7929BF55741A5BDC17745862741C7293ABED2F55741A54E40F33F8627412E90A0C8DCF55741FCA9F1F2EC852741787AA514F8F55741705F070E0B872741D656EC8BEBF55741029A08FB34872741508D970AEAF557417DD0B3D965872741EA95B2A0E9F557410E2DB25D38892741EFC9C326F5F557419CC420D0E6892741098A1F57FBF557410E4FAF34808A274172F90FA9FCF557416B9A779CB08A2741F54A59D6FCF557416DE7FB29048B2741E4141D25FDF5574133C4B16E5B8B2741ACADD88FF2F55741CE19511AA98B274131992A8CEAF557418E75717B048C2741166A4DD3E3F55741BA6B0979518C27419CC42008DFF5574143AD691ED28C27418F537464DAF55741D8F0F42A8F8D27418D28EDBDD3F557412041F123468F2741295C8F9AB7F5574141F1634C818F27412B189590B1F55741
16	MC	MCH	Centre Historique	MONTPELLIER CENTRE	01060000206A080000010000000103000000010000003900000076E09CF14D842741D42B6545CCF45741D7A3703D60852741ACADD8EBC2F4574117B7D1E05286274131992A4CBBF457414FAF94C53D8727414CA60AFEB9F45741A323B9DC56872741B7D100F68BF457419B559FAB6087274104560EAD86F4574122FDF6155C87274119E258237FF457418D28ED6D5B8727416210585574F45741DCD781534B8727416B2BF67368F45741643BDFCF178727411AC05B485EF457414A0C02EBE4862741508D970654F45741182653A585862741AF9465F847F4574190A0F8F10486274152B81EF930F45741DE02096A3186274105A392FA29F45741984C15EC2A86274145D8F01828F45741D9CEF7731C8627415F984CA526F457415DDC46A32586274110E9B77323F45741D200DEA2F58527417AA52CB321F4574154522760E58527414182E2931FF457415C8FC275D6852741A2B437F41CF457415D6DC5DEB785274114AE47A119F45741423EE85976852741ACADD86B0DF45741ECC039635E852741014D84210CF45741000000405E852741386744D1E4F35741560E2D128D852741DF4F8D8BE1F357417F6ABCD46B8527415C8FC2B5D9F35741E7FBA9F1438527413108ACD8DBF35741F2D24D2250842741431CEB12EFF357419318049699832741AF94655C0CF457411FF46C16908327412063EE820EF45741158C4A4ADF8227416DE7FBB906F45741F5DBD741A582274129ED0D9606F45741D712F2816F822741E5D022F706F45741C13923EA238227417424970308F45741029A081BBE812741DBF97ECE09F4574139B4C856F880274104560E050FF45741C05B20C12F802741FA7E6A3015F4574197FF90BEB57F2741DF4F8DFB19F45741A779C729AB7F274107CE190123F45741E5F21F52C38027415F984C7540F45741228E7551BE802741A301BC8142F45741F9A067D3B680274183C0CABD44F457418716D92EAE8027412B87169146F457416744696F9F802741D578E9C248F457410C022B079380274107F016604AF45741516B9AD7858027418CB96B854BF45741C3F528FC7B802741637FD9E14BF4574171AC8BDB70802741DF4F8DEB4BF45741470378AB878027419CC420D071F457412BF697DD5D802741304CA65275F45741FC187357F17F274188635D0482F4574138F8C2A42C81274190317731B6F4574100000080A4812741849ECD76C3F45741E9B7AF6377822741E3C7980FDFF457410DE02DF04B83274152499D10D2F457414DF38ED3AC83274152499D80CDF4574176E09CF14D842741D42B6545CCF45741
7	MI	MIG	Grammont	PORT MARIANNE	01060000206A080000010000000103000000010000002E01000043AD691EC1A127412C65192A34F5574118265345C4A12741AEB6629734F55741832F4C86D3A127411EA7E89C36F55741098A1FC3EFA12741D93D79583AF55741DC460398F7A1274110E9B7A33BF55741C1CAA1650AA227416B9A77743EF557418F5374842FA2274108AC1C5244F55741ED9E3CCC4BA22741363CBDC248F5574110E9B72F5AA2274100917EF34AF557412D431C6B7DA227412A3A929B50F557414B5986388EA22741A913D06C53F5574176711B6D97A227413480B7B054F55741234A7B03A3A2274197900F0E56F55741516B9A77AFA227419F3C2C4457F557414D840D8FBEA22741C442ADAD58F55741E3A59B24CEA227414CA60AF659F5574163EE5A62DFA227414E6210C45BF55741F6285C6FE7A2274158CA328C5CF55741EA0434D10DA32741F46C568960F557414A0C028B31A327410534110664F55741613255D047A3274168B3EA4766F55741B840822253A327413B014D6067F55741ED0DBE305BA327414547723D68F55741006F8124A1A32741A52C433C6FF557417958A8F5ABA32741CA54C14470F55741F54A59C6B5A3274191ED7C4771F5574172F90F09CBA327414ED1916073F5574103098ADFEBA3274123DBF9AA76F557412F6EA3E1FEA327419A9999BD78F55741643BDF4F06A427411DC9E59B79F557415BD3BC6311A427413E7958D07AF55741F085C9743BA4274133C4B1C27FF5574111C7BA984AA42741CBA145FA81F557416F1283C05BA427418941606D84F55741AA60541262A42741FE65F78885F557413C4ED1516CA42741C5FEB27F87F55741499D806672A42741D1915CCA88F557418B6CE73B7FA42741091B9E268CF5574112A5BD2187A42741B459F5898EF557419318049690A427416F8104D991F55741C74B37A993A4274142CF661193F5574126C286879EA42741C58F310397F55741C66D3420AEA42741931804A29CF55741FFB27B52B7A427419CC420D09FF557411FF46C16BFA42741B6847C14A2F557417FD93DF9C5A42741E0BE0E48A4F55741053411F6CCA42741728A8E18A6F5574165AA6094DBA4274144696F04AAF5574138F8C224DFA427410E4FAF0CABF5574102BC0592E6A427417B832FECADF55741A7E8484EF3A42741355EBAC9B3F55741BADA8A7D06A52741711B0DE8BCF55741A835CDFB0AA5274131992AD4BEF55741560E2D5212A527415C8FC249C2F55741401361C31AA5274103780B68C5F55741D0B359D51DA52741448B6C8BC6F55741EE5A421E2DA527417D3F3526CBF557414F40136134A527410E4FAF58CDF557414182E2273DA52741CE88D2CACFF55741931804F651A52741CD3B4EB1D4F55741D42B65D962A52741569FABEDD8F557416D567D4E89A52741F54A594AE2F5574167D5E78A9AA5274106819513E6F557414ED191BCB5A52741BADA8A29EBF55741E02D9040C2A527411283C066EDF55741D26F5F47DAA52741F9A067CFF1F55741B515FB2BF4A5274199BB9610F6F5574102BC0592F7A52741F241CF6EF6F55741CB10C75A13A627413E7958E0F8F557419487855A2AA627414850FCC4FAF557414260E5B03BA627416891ED18FCF557418E75711B45A62741EC51B8B6FCF557416ABC741359A62741280F0B21FEF55741F9A067B372A62741BA6B090500F65741F31FD2EFA5A6274194F6069303F657414FAF9465B9A62741228E75D904F6574188635D9CCEA627419031772D06F65741BEC11746D8A62741A01A2FBD06F657417B832F2CE0A627411748501407F6574150FC1893E5A6274196B20C7D07F657415227A089F5A62741AA6054D608F65741A5BDC117FFA627412D431CAF09F65741273108CC08A7274166F7E4ED0AF65741C1A8A42E1AA7274168B3EA0B0DF657411D3867C425A72741A54E405F0EF65741091B9E7E32A7274187A757FA0FF657412EFF219D42A72741E63FA4D711F657413108ACBC51A72741325530C613F6574129ED0DDE6FA72741CFF753CB17F65741C05B20618FA727419CA223E91BF6574158CA32649FA7274148BF7D111EF657411A51DA9BB9A727416F12837C21F65741986E12A3BDA727412B1895EC21F65741B84082E2CCA727412C6519DA23F6574180B740E2ECA72741143FC6C027F6574158CA32640DA82741190456CA2BF65741A089B0C11CA82741857CD0972DF65741FBCBEEC93FA827415F07CE0532F6574180B740826BA827415F07CE6D37F65741696FF0E57AA82741CD3B4EA139F65741E92631688AA8274182E2C7BC3BF657410C022BA797A82741CB10C7A63DF6574155C1A8E4A4A82741EFC9C3763FF6574148BF7DBDBDA827419CC420F842F657412DB29D0FE6A827418B6CE7FF47F65741E86A2BB628A927410BB5A63D50F65741C4B12EEE30A92741865AD3BC51F65741A8C64BD734A9274145D8F04C52F657417AA52C834FA92741190456D250F65741BEC1170674A927413A234AB34EF65741D5E76A8B7DA927415F07CEE94CF657416132559086A927418D976E1A4BF657419C33A29496A92741E6AE252447F6574127A08970A0A9274126E483BE44F657419CA223B9AEA92741567DAE1241F657413F355EBADDA927410000007034F657410E4FAF94E7A92741AC1C5AF031F65741355EBA29FAA92741621058F92CF65741182653A50BAA2741787AA57028F657419B559FAB15AA274113F241C728F65741780B24C842AA2741014D84512AF65741D734EFB85FAA274176E09C352BF65741B840828272AA2741772D21B32BF65741499D80267CAA274117B7D1E42BF657414703780B8CAA2741925CFE1B2CF65741D95F762F9DAA2741F697DD3F2CF657413C4ED1B1AFAA27418BFD65472CF657415917B771CFAA2741A167B30E2CF6574196B20CD1D3AA27410AD7A3FC2BF6574132E6AE05D7AA274139B4C83A2BF65741A323B97CD9AA2741772D21A32AF6574102BC0592DCAA2741A9A44EEC29F657418351493DE1AA2741DE02098E28F65741A857CA32E3AA274124287EDC27F65741431CEB02EEAA274186C954A122F657413480B720F7AA27410D71AC4B1EF65741029A087BFFAA274132772DBD19F657416E3480770BAB2741BE30993A13F65741713D0A5713AB274113F241030FF6574107CE199118AB27415BD3BC870CF65741917EFBBA20AB27418A1F63FA08F657417F6ABC5427AB2741022B877606F657414703782B35AB27417B14AEA301F657414ED1913C38AB2741CF66D5A700F65741A245B6534BAB27417DAEB6D2FBF55741AED85FB663AB2741C3D32BA1F5F55741B37BF2106DAB2741304CA626F3F557417CF2B0108BAB2741B84082AAEAF55741FFB27BF290AB27416519E2ACE8F557416ADE71AA91AB27419EEFA726E8F557412041F1E391AB2741295C8FBAE7F55741F775E01C91AB274133C4B146E7F55741FFB27B528DAB2741BADA8AA1E6F55741F0A7C6AB8AAB2741E5D02237E6F557415B423E487FAB2741F775E010E6F55741666666666FAB2741EB73B50DE6F557417E1D38675EAB274162A1D638E6F55741A1F831265CAB27414013612BE6F5574152B81EA54AAB27412DB29D37E6F55741006F810436AB2741083D9B51E6F5574152B81EE52DAB27414FAF9469E6F5574126C286471FAB27412FDD24AAE6F557413A234A1B4BAB274119E2583FDBF557414E62105854AB274189D2DEE8D8F557410E2DB2BD73AB2741B22E6ECBD0F557411C7C617276AB2741C5FEB20BD0F55741E0BE0E1C7CAB2741AD69DE29C2F5574170CE88D27FAB2741DE020942B9F55741C442AD2983AB2741F1F44A65B0F557413B014DE485AB274145D8F0D4A9F55741FE65F7A4CFAB2741F1F44A71ABF5574107F016A8E5AB2741CFF7534BA5F55741C2172613F2AB274146B6F3C9A1F557410A68224CF4AB27413F355E52A1F55741598638B6EBAB2741166A4DF79FF55741EA95B22CE7AB274186C954619FF5574104E78C88E7AB2741A2B4371C9FF5574103780BC4E7AB27412EFF21D19EF557415D6DC59EE7AB27415396217A9EF55741D49AE61DECAB27419A9999419AF5574197900FBAF7AB27413108AC988FF55741B37BF2F0F7AB274196218E018FF55741E2E995F2FFAB2741E561A10E8FF55741DE0209CA01AC2741E5F21F7E8EF557419F3C2C9404AC27413FC6DCED88F55741E10B93890CAC274186C954B979F557419FCDAA6F0EAC274148E17AF875F55741DAACFA3C1BAC2741B98D069C72F5574117B7D18023AC2741CF66D5BB70F55741D9CEF71332AC2741B6F3FDBC6DF557416DC5FE1255AC2741D044D83C67F55741F4FDD4586AAC27415F984C5563F5574191ED7CBF73AC2741637FD9A161F5574139B4C8F676AC274101DE020D61F55741A60A4605EEAC27419E5E29D756F55741D8F0F42A1DAD2741D0D556C052F5574142CF66B562AD27414260E5C04CF557410F9C33E271AD27412B8716694BF55741933A01ED53AD27411CEBE2D63DF55741CF66D5274AAD274182E2C77039F55741A52C43FC31AD2741903177852EF55741FB5C6DC52EAD27412B8716112DF5574111C7BA7828AD2741CD3B4E392AF557411D3867E424AD2741029A08EF28F55741E0BE0E3C23AD274165AA606828F55741DC46035825AD2741F5DBD72128F55741ACADD8FF36AD2741C0EC9E8428F5574158CA322447AD2741EC2FBBAF28F557418E06F03648AD2741401361D327F55741613255904BAD274127C2865F27F5574154E3A5FB4AAD27419487850A26F55741736891ED47AD274146B6F31523F55741567DAEB63FAD2741AB3E57871DF5574119E258D73CAD27413D2CD4861BF55741B81E85AB1DAD27412C65194E06F55741E09C11050CAD27417FFB3AACFBF457412D431C4B05AD2741228E75F9F7F45741A1D6344FFEAC2741363CBD26F4F4574146257522FDAC2741696FF055F3F45741226C789AFCAC2741B8AF03D3F2F457415305A3D2FCAC2741B003E750F2F4574104E78C2800AD27414BC807A5F1F457412C65190207AD2741CE19512EF1F457415AF5B99A0EAD27418D976EA6F0F457418A8EE4F214AD27418638D619F0F457418CB96B8916AD27418A1F637AEFF457411D38674417AD2741560E2D26EFF457414BEA04B419AD2741B5A67913EEF45741DC68006F1AAD2741819543BFEDF457418C4AEAE41BAD2741F5DBD715EDF45741EBE236FA1CAD2741499D8062ECF457415C8FC2751DAD2741AC1C5A18ECF45741787AA54C1EAD274107F01680EBF45741759318241FAD2741F4FDD4F0EAF45741AA6054F220AD274114D044C8E9F457417368912D21AD274132772D79E9F457418E06F09625AD27416F1283D8E3F457415EBA492C29AD27419CC42000DFF45741A69BC4802DAD2741BC969017DAF45741C898BB5632AD2741AE47E146D5F457418A1F630E38AD2741925CFE8FD0F4574101DE02093DAD2741A9A44E0CCCF45741925CFE833FAD2741FC1873A3C9F45741615452A740AD27414772F9C7C7F45741A301BC6543AD27413FC6DC85C3F45741AC8BDB4849AD274105A3926ABBF45741789CA26349AD2741006F8114BBF4574150FC18534DAD27415E4BC8C7B3F457416B2BF6B74EAD2741273108F4AFF45741CF66D56750AD274126E483E6AEF45741CE19519A51AD27419CC42004AEF45741F01648104BAB27418FC2F5CC8DF45741D044D890B7AA27413D2CD49686F457418BFD65D78DAA2741A5BDC13B85F45741D578E9265BAA2741D734EF8484F457418D976ED2FBA92741D49AE6D983F457412DB29D4F02A927415474245383F45741D200DE82C9A72741933A01657CF4574132E6AE052AA72741705F077A77F45741CCEEC92334A527415AF5B93A68F457415F984C95D0A427414D158CEA65F4574192CB7FC854A42741CAC342E163F457419D11A51DDFA32741355EBAFD63F4574143AD691E69A22741D95F769F66F457413F355E3A7DA2274176711BAD74F4574129ED0DFE92A227418048BF057DF4574188855A93C9A22741B515FB678AF457417E8CB92BDFA2274163EE5AF68FF457410612147F00A32741363CBD5E9DF45741C13923EA32A3274168B3EA1FAAF457412D211FB43DA327416B9A7704B5F45741022B87562EA327411361C3BBC3F45741FED478C914A3274158CA3274CFF457417AA52CC3D2A227418FE4F26FCDF4574136AB3ED7C3A22741EB73B5D5CEF45741F7E461E15DA22741091B9E82DAF457412D211F14F8A12741287E8CBDE6F4574155302A29B5A227416B9A7794FFF45741F085C9F4D7A2274196438B3804F55741C1CAA1C5FDA227418D28ED2D09F557418AB0E149FFA22741BD52967109F557418716D9EE00A32741105839C009F55741280F0B7502A327411DC9E5230AF55741A1D6340F07A327415BD3BCBB09F5574188F4DB3708A327414B5986480AF557416B9A775C08A32741DDB584940AF55741B537F8E207A327419FABAD000BF557416FF085C904A32741910F7A720BF5574107CE1971FFA2274117B7D1F80BF55741C8073D1BF7A22741D578E9AE0CF55741D42B6599D0A227410E4FAFF410F5574113F2412FB2A22741B22E6EA314F55741772D21DF99A2274155C1A8E417F55741FCA9F1B28EA22741DCD7813F19F55741B003E70C7CA2274158A8350D1BF557419EEFA7E669A2274183C0CAD51CF5574188F4DBB760A22741C13923021EF557415E4BC86730A2274109F9A08F25F5574103098A3F19A227412E90A05029F557414D158C4A05A22741CA32C4392CF55741EE5A42DE0DA2274117B7D1702DF5574143AD691EC1A127412C65192A34F55741
8	MC	MCU	Les Aubes	MONTPELLIER CENTRE	01060000206A080000010000000103000000010000006A000000F8C2646AFA91274155C1A8801EF6574126C28647029227415BD3BC431EF657412F6EA30112922741643BDFC71DF65741DF4F8DB71C9227413333330F1DF65741BA490CA2329227415AF5B9861BF65741ADFA5C8D4992274102BC050A1AF6574152B81EA554922741EF38456F19F65741295C8F827E922741BDE314FD18F65741B7D1009E949227417B14AE8B18F65741454772F99D922741F7065F3018F657411973D792A7922741DC6800B317F65741C5FEB2BBBC922741EA95B21016F65741FB3A706EC7922741DC46032415F657418A8EE492D4922741E561A14613F65741FF21FD16DE9227415396216A11F657410D71AC8BF3922741E926315C0AF65741499D80C6F7922741F90FE9EF07F6574114AE4781FB922741371AC08305F657411361C37303932741A8C64B7700F65741C3F5283C06932741228E75EDFEF557411F85EB710A9327419D80262EFCF5574139D6C56D119327417D3F35CEF9F55741386744A911932741098A1F83F9F557411B9E5E4916932741E5F21F3EF1F557415F07CE991793274191ED7C2BEEF557416FF085C9189327410BB5A6FDE8F55741F085C9B41793274139D6C5A9E7F55741CB10C75A06932741A323B9CCDBF55741EA95B28C02932741AB3E57DBD8F5574103098A5F00932741295C8FF6D5F5574154742497FC922741FF21FD52D1F55741742497BFF99227413B014DC4CDF55741091B9EDEF992274103780BA4CBF55741FAEDEBA0FC922741B459F5A5C7F55741499D8046FE922741D26F5FEFC5F5574111C7BA580093274105C58FF9C2F55741ED0DBED002932741226C7852BEF557419FABADB803932741F697DDB3BAF5574102BC055203932741B1BFEC46BAF557417424977FF6922741029A08EFB0F557412A3A92EBF4922741CC7F48A7AFF557411F85EB71F092274158CA3208AEF55741865AD3FCC8922741BBB88DA2A2F55741EBE2361AA79227410D71AC6398F55741E9482E7FA19227411A51DAAF96F55741E17A14CE9192274108AC1C9291F55741F54A590672922741F931E60A89F55741174850FC4B922741EA04346980F55741696FF0E527922741B37BF2F876F557411748509C3A922741C8073DEB6BF5574108AC1C7A51922741F085C96063F55741A8C64B576B92274131992AA856F55741A4703D0A6C9227413F355E6247F557413867446972922741091B9EAA32F55741C05B20015D922741933A01CD21F557413D2CD49A5592274150FC18431BF557416C09F98045922741D42B659515F5574104C58FD127922741E0BE0EAC10F55741764F1EB6EC9127414BEA04400DF55741D656ECEFC191274188635D240DF55741226C787A7991274196B20C510EF5574186C954413C9127418048BF1D0DF55741E0BE0E5CE1902741E2E995560BF55741F38E53149F902741D5E76A3B09F557410612149F7C9027411FF46C0A06F557410B2428BE53902741D93D7904FEF45741992A187540902741FB3A7062F7F45741CEAACF753A90274136CD3B4AF1F45741FD87F4FB499027418638D665EBF45741849ECD2A74902741F241CFD2E3F457417D3F355ECB902741DE718ADECFF457416519E2B8D890274179E92621C5F45741637FD9DD29912741D93D7958B2F45741E3A59B042E91274177BE9F82AAF4574198DD93674D9127414703780F9CF45741598638D6A9902741AD69DE8DACF457416519E2F81B902741E5D0222FBEF45741BF0E9C33ED8F27418C4AEA48C2F457410612143FD58F2741A913D030C3F457415D6DC57EBB8F27414F401359C3F4574193A98251A98F27416666669EC2F4574188855AB3598F27412C65191ABDF457413EE8D96C968E274127C2867BABF45741BD5296A1358E2741E258172FA3F45741EE7C3F75FB8D27410F0BB5AA9EF45741AED85F56D08D274190A0F8F99CF45741CF66D547948D2741D93D79749CF457418104C50F638D274148BF7D4D9DF457417B832F8C298D27410D71AC879FF457414182E247FD8C27415227A09DA1F4574180B74022BF8C27410B4625CDA5F45741211FF40C9D8C2741250681B9A6F4574109F9A087798C274151DA1BA0A6F457417AC7291A588C27419CA223FDA5F4574188855AF30A8C27415227A005A4F4574108AC1C7AB38B2741006F81F0A0F45741BBB88D867C8B2741C898BB0EA0F457416ABC74B34A8B2741A245B62B9FF457415A643B5FF88A274160E5D07EA0F45741560E2DD28A8A274174249777A2F45741CDCCCC2CA9892741BEC117DAA9F457417B832FACCE892741A4DFBE06BAF4574126E483BEF9892741006F8134C5F457414ED1911C668A2741772D21DFD6F4574141F1634C818F27412B189590B1F55741F8C2646AFA91274155C1A8801EF65741
9	MC	MCB	Boutonnet	MONTPELLIER CENTRE	01060000206A0800000100000001030000000100000035000000FCA9F1F2EC852741787AA514F8F55741A54E40F33F8627412E90A0C8DCF55741A5BDC17745862741C7293ABED2F55741C8073DDB2A8627411973D7929BF55741FED478C922862741A01A2F8D79F5574191ED7CFFFB852741780B248862F5574124B9FC07728527411DC9E5C75BF5574134A2B477A28627419EEFA75229F557416EA3017C6385274104E78CC808F55741910F7A76158527415DDC46E706F55741CB10C7FAA7842741D9CEF767F5F4574173D712327B842741D26F5F83DEF4574176E09CF14D842741D42B6545CCF457414DF38ED3AC83274152499D80CDF457410DE02DF04B83274152499D10D2F45741E9B7AF6377822741E3C7980FDFF4574100000080A4812741849ECD76C3F4574138F8C2A42C81274190317731B6F45741FC187357F17F274188635D0482F4574173D71252B27D2741A3923A61C5F457415EBA496C877C2741DDB584F4E7F45741F853E305FF7B2741A4703DDEF6F4574163EE5A22437B2741E926317C0CF557415E4BC807A87A2741CB10C7561EF55741454772D9937A2741DE0209AA21F55741B8AF03A78F7A274179E9269122F55741B30C714C847A27410DE02D0C25F55741ED0DBED07A7A2741A301BC7127F55741F7E461E1737A27415C8FC29D2AF55741BBB88D666D7A274160E5D01A2FF5574185EB51186A7A274132772D6134F55741A8C64B976B7A27416B9A77783AF557413A92CB7F767A274157EC2F4747F55741D42B65197D7A2741D5E76A0B4FF5574188635D7CF87927418638D6695AF557412DB29D4F417A27411361C38B69F5574197900F5A8A7A274163EE5A0E76F5574174B5151B487C27411EA7E8ACACF55741E2C798FB9C7C274196438B78B8F55741CDCCCC2CE97C2741FE43FA49C1F557412DB29DEF147E27412EFF2185E6F55741371AC0DBC07E2741992A1899F6F557412E90A0B83A7F2741CBA145CEFDF55741F7E461413D812741F163CC5D0BF657415DDC4663458127413D2CD46E0BF65741022B87B61E822741F01648440DF65741933A010DF38227416B2BF6570FF65741EC2FBB6761832741986E12430EF657414DF38E93D3832741C21726330CF65741F931E68E4A842741FCA9F10A09F65741A01A2F1D84842741F31FD28307F6574161C3D3ABE4842741B6F3FDB003F65741FCA9F1F2EC852741787AA514F8F55741
11	MI	MIP	La Pompignane	PORT MARIANNE	01060000206A0800000100000001030000000100000065000000E17A14CE9192274108AC1C9291F557413EE8D90C97922741865AD37491F55741637FD97DC4922741567DAE2E90F557412BF6973DE4922741B537F8F28FF557414BC807FDE69227415F984CE58FF55741A54E40F3F0922741F241CF328FF557415E4BC8E787932741CF66D55F8BF55741B459F539BF932741A8C64B1B8AF55741F6285C6FE7932741B4C8762689F557415DDC46031D942741D1915C0288F55741F4FDD4586B942741EE5A42CE86F55741B37BF2D0C39427410F0BB5B285F557418A1F632EDD942741B9FC875C85F55741BB270FCBF594274127C286FB84F557414A0C02CBFE94274187A757EA84F55741E92631282B95274171AC8B6F84F55741295C8F025F9527411EA7E8B883F55741772D213F8795274108AC1C3A83F55741B1506B5AB5952741F775E09C82F557417FD93D79D6952741F31FD24F82F5574142CF66B5F195274132772DE181F55741B1E1E955FE952741BF7D1DD481F557413FC6DC151A962741D26F5FA381F55741AED85F161F9627419E5E29A381F55741713D0A374D96274122FDF65D81F55741FF21FDD6669627417F6ABC3081F5574148BF7D5DBD962741CA32C40581F55741E02D9040DB9627414B59860481F55741B537F8A21997274141F163C080F5574160E5D0E2209727415227A0B180F55741A60A468527972741705F07CE80F55741D712F2612D9727413108ACE048F557415F29CBB02C972741DBF97EB645F55741CEAACF952B97274198DD93FB43F55741539621AE289727419318047241F55741423EE8791A972741D3BCE31C3CF55741C05B2081149727410C022B8F3AF55741F241CF46EE9627411D5A64DF30F55741F2B0502BC7962741DFE00B2F29F55741D34D62F05696274164CC5DB717F55741E9482EFFF99527412DB29D9F02F557419C33A2B4DC9527412497FFF4FBF45741772D21BFC0952741448B6CB3F8F457418A8EE4D2A7952741C3D32B05F6F45741D1915C1E97952741F697DDBFF2F457414182E24786952741F6285C4BEDF45741EF38454773952741E2581723E5F45741E09C118566952741C976BE67CEF4574154E3A59B579527415305A3B6C7F457416EA3013C1C95274109F9A077B1F4574196B20CD1F6942741304CA6769EF4574129CB1047F3942741F853E3698FF45741A01A2F3DFB942741925CFEEB73F45741492EFF01FC942741CF66D5AB61F45741151DC925919527414F40139177F45741182653C594952741A8C64B274AF45741986E12C3AB95274102BC05AA43F457414850FC78AE9527411A51DADF3EF45741598638F6A2952741E9482EA73AF4574176711B8D98952741448B6C1338F457411B2FDDE4859527418F53748C33F45741865AD39CEE9327414A0C027B29F4574111363CBDD3922741E4839E2921F457413FC6DC95D0922741F085C9D424F45741F54A5966B0922741CC5D4B1847F4574144FAEDEB9092274138F8C22858F457411748503C6B9227414CA60A066CF4574113F241AF4A922741A1F831C677F4574160764F1E1A9227417D3F356283F45741BBB88D06D49127417B832FA48CF457412A3A922BA1912741A54E407F93F4574198DD93674D9127414703780F9CF45741E3A59B042E91274177BE9F82AAF45741637FD9DD29912741D93D7958B2F457416519E2B8D890274179E92621C5F457417D3F355ECB902741DE718ADECFF45741849ECD2A74902741F241CFD2E3F45741FD87F4FB499027418638D665EBF45741CEAACF753A90274136CD3B4AF1F45741992A187540902741FB3A7062F7F457410B2428BE53902741D93D7904FEF457410612149F7C9027411FF46C0A06F55741F38E53149F902741D5E76A3B09F55741E0BE0E5CE1902741E2E995560BF5574186C954413C9127418048BF1D0DF55741226C787A7991274196B20C510EF55741D656ECEFC191274188635D240DF55741764F1EB6EC9127414BEA04400DF5574104C58FD127922741E0BE0EAC10F557416C09F98045922741D42B659515F557413D2CD49A5592274150FC18431BF55741C05B20015D922741933A01CD21F557413867446972922741091B9EAA32F55741A4703D0A6C9227413F355E6247F55741A8C64B576B92274131992AA856F5574108AC1C7A51922741F085C96063F557411748509C3A922741C8073DEB6BF55741696FF0E527922741B37BF2F876F55741174850FC4B922741EA04346980F55741F54A590672922741F931E60A89F55741E17A14CE9192274108AC1C9291F55741
12	MI	MIL	Millénaire	PORT MARIANNE	01060000206A08000001000000010300000001000000D7000000A60A468527972741705F07CE80F55741287E8CB95F972741B81E85BB81F55741FA7E6A1CBF972741BD52965583F55741DE9387E5D8972741AEB662BF83F55741560E2D32FB972741780B245484F5574165AA60140398274136AB3E6B84F5574121B072483B98274111C7BA5485F55741B81E854B47982741ABCFD57285F55741CA32C45159982741499D80BA85F55741713D0AD76A982741CC7F48F385F5574154522760829827412E90A06086F55741D881734694982741182653A986F55741A857CAD2B198274136CD3B4287F5574117D9CE17BB98274101DE028587F55741091B9EDEC59827416ADE71E287F5574135EF3845E79827418941601588F55741D656EC0F459927410D71AC2388F557417F6ABCF46E992741022B872A88F5574134A2B4178A9927416B2BF62B88F55741E9482EFFB49927412BF6975D88F5574180B740C2BE99274136AB3E7F88F55741CAC3420DDA9927410E2DB20589F557416ABC7453E79927416F12835489F5574189416065059A2741613255488AF55741A2B43718249A2741B7D1004A8BF55741B8408282359A2741637FD9D58BF557418AB0E109419A274150FC183B8CF557416F8104A56E9A2741341136AC8DF55741A857CA72879A2741F01648648EF557419A9999D9949A274173D712BE8EF5574176711BADC59A2741910F7A6A87F55741FF21FD36DD9A274141F163C483F55741423EE8D91A9B2741E10B93497BF5574117B7D160669B2741E92631E870F557414E6210986A9B274151DA1B5070F55741FBCBEEA9829B274155302A3D6FF557412CD49A26879B274129ED0DFE6EF55741C74B3709A49B2741ABCFD5E66CF5574101DE02C9E09B27410BB5A65968F557418CDB68E0039C2741F5B9DA7E65F557411895D4C9149C2741075F98EC63F55741BBB88D86449C274171AC8B435FF55741B7627FB94D9C27411058395C5EF5574167D5E7CA589C274120D26F575DF55741F2B0508B729C274190A0F8215BF55741AF25E463939C2741C7BAB85D58F557417E8CB9ABA99C2741E6AE25A856F557417F6ABC34C49C27414D158CFE54F557416DC5FE52ED9C274187A7578A52F55741643BDFEF1A9D274194F606F74FF557414694F606539D2741539621F24CF55741BF7D1DD86A9D2741A54E40D34BF55741B6F3FD94709D27418638D6954BF55741CAC3424D7E9D2741D88173FE4AF557414DF38ED3979D2741E17A142A49F55741AB3E57BBB29D27414013616B47F55741BC051214D89D2741BA490CA244F55741A4DFBE4EFD9D2741CA54C1F841F55741EBE2367A199E2741143FC67440F55741ED9E3CEC339E274114D044603FF557413A92CBFF579E2741448B6C533EF557413FC6DC35809E27412BF697693DF557410AD7A350A99E2741068195CB3CF557418FC2F568EA9E2741EC2FBBDB3BF557417FFB3A504C9F2741DD2406A93BF557411CEBE2D6999F2741C9E53F903BF557419D11A57DEB9F2741DA1B7C713BF55741ACADD89F25A02741AF9465303BF55741F1F44A7945A02741C0EC9E8C3AF557413A234A5B6AA02741FDF6755C38F55741151DC9A5B1A02741CDCCCC6C34F55741FE65F7E4DBA02741AA82510532F557414A0C026B05A12741BC05121030F557417958A8D529A12741984C15702EF55741098A1FE349A12741560E2D062DF55741E86A2B5669A12741228E75F92BF55741BF0E9CF378A12741302AA9B32BF5574163EE5A6297A12741508D97822EF55741B6847C70ACA12741A835CD5731F5574143AD691EC1A127412C65192A34F55741EE5A42DE0DA2274117B7D1702DF557414D158C4A05A22741CA32C4392CF5574103098A3F19A227412E90A05029F557415E4BC86730A2274109F9A08F25F5574188F4DBB760A22741C13923021EF557419EEFA7E669A2274183C0CAD51CF55741B003E70C7CA2274158A8350D1BF55741FCA9F1B28EA22741DCD7813F19F55741772D21DF99A2274155C1A8E417F5574113F2412FB2A22741B22E6EA314F55741D42B6599D0A227410E4FAFF410F55741C8073D1BF7A22741D578E9AE0CF5574107CE1971FFA2274117B7D1F80BF557416FF085C904A32741910F7A720BF55741B537F8E207A327419FABAD000BF557416B9A775C08A32741DDB584940AF5574188F4DB3708A327414B5986480AF55741A1D6340F07A327415BD3BCBB09F55741280F0B7502A327411DC9E5230AF557418716D9EE00A32741105839C009F557418AB0E149FFA22741BD52967109F55741C1CAA1C5FDA227418D28ED2D09F55741F085C9F4D7A2274196438B3804F5574155302A29B5A227416B9A7794FFF457412D211F14F8A12741287E8CBDE6F45741F7E461E15DA22741091B9E82DAF4574136AB3ED7C3A22741EB73B5D5CEF457417AA52CC3D2A227418FE4F26FCDF45741FED478C914A3274158CA3274CFF45741022B87562EA327411361C3BBC3F457412D211FB43DA327416B9A7704B5F45741C13923EA32A3274168B3EA1FAAF457410612147F00A32741363CBD5E9DF457417E8CB92BDFA2274163EE5AF68FF4574188855A93C9A22741B515FB678AF4574129ED0DFE92A227418048BF057DF457413F355E3A7DA2274176711BAD74F4574143AD691E69A22741D95F769F66F457419D11A51DDFA32741355EBAFD63F4574192CB7FC854A42741CAC342E163F457415F984C95D0A427414D158CEA65F45741CCEEC92334A527415AF5B93A68F4574132E6AE052AA72741705F077A77F45741D200DE82C9A72741933A01657CF457412DB29D4F02A927415474245383F457418D976ED2FBA92741D49AE6D983F45741D578E9265BAA2741D734EF8484F457418BFD65D78DAA2741A5BDC13B85F45741D044D890B7AA27413D2CD49686F45741F01648104BAB27418FC2F5CC8DF45741CE19519A51AD27419CC42004AEF45741D5E76ACB52AD27415BD3BC0BADF45741061214DF52AD274109F9A03FACF457415DDC460353AD2741F9A06773AAF4574177BE9FDA4BAD274188F4DBDFA7F45741645DDC6648AD2741BC96909FA6F45741287E8C9940AD27410A6822C0A3F45741545227E030AD274186C954159EF457416891ED5CE0AC27415917B77D81F45741B6847C90D8AC2741CC5D4BAC7EF45741EFC9C322D6AC2741151DC9CD7DF45741A167B30AC1AC27410534113276F457410C022B279EAC2741E86A2BCE69F4574130BB27EF88AC2741B5A6793362F45741C976BE3F78AC2741A4DFBE1E5BF4574152499D4065AC27419031770953F45741A9A44EE056AC27415DDC46EB4CF457413E79580857AC274173D7125E4BF45741DA1B7C4151AC2741448B6CF74AF45741742497FF22AC274197900FB23CF45741075F982C1FAC2741F5B9DA7E3BF4574139B4C89614AC2741711B0D1838F457414182E2A7E3AB27415B423E0029F45741DBF97E6AC2AB2741EA0434111FF45741780B2408C2AB2741CC7F48EB1EF45741F31FD24F12AB274163EE5A2A12F457414182E287C5AA27419031770D0EF457419EEFA7868AAA27414C3789510CF457415AF5B95A4CAA2741948785FA0BF457413D2CD4DA0EAA2741FB5C6D690CF45741EE5A42FECEA92741B29DEF130DF457417F6ABC9495A92741F085C9DC0CF45741A4703D6A3DA92741645DDCBA0AF45741A8C64B9705A92741CAC342E509F457413A92CB9FA2A827412B87161109F45741211FF40C05A8274155302AF108F4574154742417F0A627419A779C960DF4574191ED7CFF33A6274197900F5E0DF45741CE1951BA8CA527411B9E5E210CF45741DB8AFD658DA427416C787A6506F45741CC5D4B680DA227413A234A47F4F35741AC8BDBA827A12741F6285CB7EFF35741423EE839A8A027417AA52CA3EFF357415A643BDF3BA02741006F81BCF0F3574154742437AE9F27414D840D43F3F35741075F98CC339F2741772D218FF7F35741431CEBE2C79D2741EC2FBBD705F45741D0B35935A29927412F6EA38533F4574117D9CED72699274172F90FA938F45741CCEEC9839A982741D88173763CF457411E166A0D00982741029A08273EF457414C3789C17F97274108AC1C463EF45741CBA145F6EF962741C898BB7A3CF45741C898BBF66F962741D34D624439F457411B2FDDE4859527418F53748C33F4574176711B8D98952741448B6C1338F45741598638F6A2952741E9482EA73AF457414850FC78AE9527411A51DADF3EF45741986E12C3AB95274102BC05AA43F45741182653C594952741A8C64B274AF45741151DC925919527414F40139177F45741492EFF01FC942741CF66D5AB61F45741A01A2F3DFB942741925CFEEB73F4574129CB1047F3942741F853E3698FF4574196B20CD1F6942741304CA6769EF457416EA3013C1C95274109F9A077B1F4574154E3A59B579527415305A3B6C7F45741E09C118566952741C976BE67CEF45741EF38454773952741E2581723E5F457414182E24786952741F6285C4BEDF45741D1915C1E97952741F697DDBFF2F457418A8EE4D2A7952741C3D32B05F6F45741772D21BFC0952741448B6CB3F8F457419C33A2B4DC9527412497FFF4FBF45741E9482EFFF99527412DB29D9F02F55741D34D62F05696274164CC5DB717F55741F2B0502BC7962741DFE00B2F29F55741F241CF46EE9627411D5A64DF30F55741C05B2081149727410C022B8F3AF55741423EE8791A972741D3BCE31C3CF55741539621AE289727419318047241F55741CEAACF952B97274198DD93FB43F557415F29CBB02C972741DBF97EB645F55741D712F2612D9727413108ACE048F55741A60A468527972741705F07CE80F55741
13	CV	CVN	LES CEVENNES	LES CEVENNES	01060000206A080000010000000103000000010000004700000088635D7CF87927418638D6695AF55741D42B65197D7A2741D5E76A0B4FF557413A92CB7F767A274157EC2F4747F55741A8C64B976B7A27416B9A77783AF5574185EB51186A7A274132772D6134F55741BBB88D666D7A274160E5D01A2FF55741F7E461E1737A27415C8FC29D2AF55741ED0DBED07A7A2741A301BC7127F55741B30C714C847A27410DE02D0C25F55741B8AF03A78F7A274179E9269122F55741454772D9937A2741DE0209AA21F557415E4BC807A87A2741CB10C7561EF5574163EE5A22437B2741E926317C0CF55741F853E305FF7B2741A4703DDEF6F4574144696F107A7B274175029A2CEEF457417368912D7F7A27413F355E5EE3F45741000000E00F7A2741EC2FBB17DDF457417A36ABFE8D7A2741190456FAD5F45741302AA933DB7A2741933A01A1D0F45741C286A7F7167B2741849ECD4ECAF45741F31FD2CF307B2741A4703D92C7F45741787AA52C487B2741166A4D27C5F457416D567DEE867B274188635DACBEF457415DFE439A127B2741E8D9ACF2B5F4574130BB278F937A2741CFF7530B8FF45741BA6B0999A07A2741D3BCE34083F45741F31FD22F9F7A2741250681817CF457414182E2E7967A274116FBCBE275F457410C022B676F7A27415F984CD56BF4574139B4C876F47927410A68222059F4574125068195CE7927411EA7E83055F45741228E755199792741FA7E6A3051F457414A7B83AF1C792741917EFB7A41F457418CDB68E0F8782741E78C28A53CF4574103780B84737827417FFB3AB039F45741431CEBA26E78274176E09CB516F457412B8716F9AC7627417FFB3AF810F45741462575A225752741CCEEC90F0CF4574133C4B16E767427413F575B010CF45741E3A59B44AC732741E10B93C10CF4574172F90FE930712741F2D24D620FF457410C93A9A26870274151DA1B5C10F457412497FF70C26F274112A5BD6D12F4574135EF3885EF6E2741728A8E3C17F45741613255B0C56D2741D8F0F42A20F45741D9CEF733E46D27414D158CAA32F4574193A98211FA6D2741E3361A0C4DF4574146257522F46D2741F931E62E75F457414D840DEF046E27414DF38E838EF45741AC8BDB482E6E2741B515FB339CF45741C976BE9F976E2741B30C71E8C1F4574195D409A8AF6E2741A8C64B6FC8F4574196438BACCC6E2741A089B0A1CCF45741567DAEB6466F2741DE718AD2DAF4574124287E6CA77027414F1E16E202F55741D0B359D5FA70274167D5E7260DF557417DAEB62231712741333333BF11F55741B7D1009E5C7127412575024215F55741E9263108D571274165AA60401BF55741A857CA32E67227412041F15724F55741E92631A88F732741FB3A70BA2AF55741B30C714CCE7327415305A3AE2EF5574101DE024901742741E4839E3932F557418E7571BBBF7427414F40138D42F55741D1915C7EFF742741492EFF6946F55741DE02094A3F7527415BB1BFC848F557412DB29D8FB9752741B515FB4F48F55741C286A777A4762741B7D1004A49F55741B1E1E975057827415227A0F14CF55741CE19515AD5792741516B9A935CF5574188635D7CF87927418638D6695AF55741
14	PA	PAC	Celleneuve	MOSSON	01060000206A080000010000000103000000010000005B000000E6AE25844B602741D6C56D64BAF45741B1E1E935A26027413C4ED109BFF45741A2B4373810612741AF946588C2F457415839B4687B61274196438BE8C4F45741AC1C5AA4A06227410D71AC93C0F457418CB96B8934632741B1E1E931CCF45741D34D62F0B26427414A0C0297E0F45741925CFEA361652741F7065FDCE8F45741F5B9DAAA9D6527414850FCF0EAF45741BE30992AB3652741C3D32BE1EEF45741D7A3703DCD65274140136103F4F457418A8EE412EF65274148BF7D35F7F45741F7E46181186627417CF2B0E8F9F45741A9A44E6086662741CD3B4E31FDF45741E9B7AF83026727417B14AEB702F55741E63FA43F426827413B70CECC14F5574121B072C88F6927416DE7FBED33F5574182734634166A27416F81043144F55741D95F76AF116A274154E3A5CF3FF55741DDB584FCFC69274133C4B18636F55741075F984CA5692741BF7D1D6C1BF557413C4ED1D16B692741D5E76ABB0BF55741E3361A201D69274126E483AAF8F457413BDF4F4D0D69274127310884F5F45741AC1C5AA4EC68274139454702EFF457418F5374C4A86827415F984C1DE1F4574197FF903E77682741B8AF03C3D4F45741C139232A6A682741F5DBD77DD1F457417A36AB5E5E68274168226CC8CEF457418FE4F2BFCA672741A167B3FEACF4574103098AFF6F682741CDCCCCF0AFF45741EBE2361AB7682741E561A12AB1F45741CB10C77A12692741728A8EA0B2F45741FED478C9196A274141F163C4B1F45741643BDF8F0B6A2741E5D022638FF457414F4013E1106A27412E90A02484F457411B2FDDC4186A274176E09C117AF457418E75719B346A2741E63FA4036FF45741C0EC9E7C886A274152499DAC4DF4574167D5E7CA956A27413A92CB5748F45741832F4CC6BF6A2741C898BB5637F45741BB270F8BCE6A27416D567D6231F45741DD240601046A2741832F4C3E36F457413411361C4E682741234A7B4345F457413F355E9ABC67274144696F404AF457414694F686AE662741772D211353F45741E0BE0EBC6B662741E2E995E254F4574187A757CA1B6627410F9C335A56F4574138674429F96527410BB5A68556F45741E9263108D5652741D95F76B356F457419487859A95652741F5B9DA4256F4574195D409A86C6527417E8CB95B55F45741849ECD2A4565274155302AC153F45741F8C2640A2665274127A089E451F457415DDC4643C26427417B832FF84BF45741B29DEFC78C642741F4FDD48848F4574101DE026941642741539621DE3EF45741F90FE9771E642741643BDFDB37F4574104560E4D146427414D840D2F35F457419318043607642741D200DEBE31F45741363CBD12DF632741022B878E27F45741BB270FCBB663274190A0F8091BF457413F355EBA5E6327415F29CB380CF4574189D2DEE0296327413EE8D9CC04F457418D976E92236327413A234AEB03F457413A234ABBE26227413A234ABBFCF35741226C78FA8F622741401361FFF2F3574196B20CD156622741E3C798A3ECF35741AD69DED10962274193A98205E5F357418B6CE75BC26127410B4625F5DDF35741A1D6344FC5612741A779C739E1F35741CBA145B6C56127417F6ABCACE1F35741508D974EC7612741A301BC45E5F3574108AC1C9AC8612741006F8100E6F357410F0BB586D56127418AB0E1D1EAF35741D656EC4FE061274158A83589F3F35741F085C9F4E861274198DD93E3F7F3574114D04478EF6127414703782BFCF35741E8D9ACBAF0612741091B9E6A00F45741EC51B89EE7612741DF4F8DE306F45741F241CF26BE6127418048BF251AF4574176E09CF18E6127410B4625912BF45741A4DFBE0E406127412AA9138844F45741B1506B9A0861274124287E1056F45741A60A46A5A6602741FD87F4FB6DF45741FDF675008D602741E09C110D76F45741A7E8484E8D602741174850708BF4574160E5D0C27B6027415F984C399BF4574146B6F3BD5B602741E63FA47BA9F4574116FBCBEE4B60274132772D05B9F45741E6AE25844B602741D6C56D64BAF45741
17	MC	MCN	Antigone	MONTPELLIER CENTRE	01060000206A080000010000000103000000010000004900000098DD93674D9127414703780F9CF457412A3A922BA1912741A54E407F93F45741BBB88D06D49127417B832FA48CF4574160764F1E1A9227417D3F356283F4574113F241AF4A922741A1F831C677F457411748503C6B9227414CA60A066CF4574144FAEDEB9092274138F8C22858F45741F54A5966B0922741CC5D4B1847F457413FC6DC95D0922741F085C9D424F4574111363CBDD3922741E4839E2921F45741AD69DEB1D5922741B37BF21C16F45741492EFF41CB922741492EFFB1E3F357413D2CD47AC89227414D840DD3D4F35741547424979A9227419F3C2CE8D4F35741F0A7C6CB1192274186C95421D5F35741E2E99552A7912741857CD02FD2F35741BF7D1DB81491274174469452CBF3574100917E3B7D8F27417AA52CB7B7F35741E86A2B36108F2741A9A44E50BEF3574120D26FBFCC8E274139D6C561BFF35741E9482E7F188D2741B1BFEC2ABAF3574145D8F0B4DC8C2741158C4A2AC2F357413BDF4F6D9A8C2741A54E405FCAF35741C0EC9E9CBB8B2741ED9E3CA0E5F35741107A36CBA78B2741AEB662C3E8F3574182E2C798858B274168B3EA2BF4F3574129CB1027A08B2741D0B3596105F457414ED191BCBC8B2741151DC9291BF45741355EBAE9C88B274164CC5D0B20F4574107F016C8ED8B274172F90FDD25F45741F2D24DC2B58B2741F697DDEF27F4574196218E75808B274157EC2F9B2BF457410D71ACEB418B2741A2B437A433F45741BF7D1D58F98A2741637FD92D3DF45741AC8BDB48B98A274107CE19953AF457413255306A508A2741E86A2B4637F45741B9FC8714198A2741B5A6794336F45741022B87960A8A27412575027E36F45741AEB6627FFF8927418104C52337F45741F697DD93F48927414ED1918838F457412063EEFAED892741FC1873173BF4574121B072C8BD89274196B20C4D5FF457410E4FAFD4A5892741FE65F7C872F457413F575B1195892741B98D063885F45741098A1F039589274196B20C998EF45741FB3A700E978927415BD3BC9B99F45741CDCCCC2CA9892741BEC117DAA9F45741560E2DD28A8A274174249777A2F457415A643B5FF88A274160E5D07EA0F457416ABC74B34A8B2741A245B62B9FF45741BBB88D867C8B2741C898BB0EA0F4574108AC1C7AB38B2741006F81F0A0F4574188855AF30A8C27415227A005A4F457417AC7291A588C27419CA223FDA5F4574109F9A087798C274151DA1BA0A6F45741211FF40C9D8C2741250681B9A6F4574180B74022BF8C27410B4625CDA5F457414182E247FD8C27415227A09DA1F457417B832F8C298D27410D71AC879FF457418104C50F638D274148BF7D4D9DF45741CF66D547948D2741D93D79749CF45741AED85F56D08D274190A0F8F99CF45741EE7C3F75FB8D27410F0BB5AA9EF45741BD5296A1358E2741E258172FA3F457413EE8D96C968E274127C2867BABF4574188855AB3598F27412C65191ABDF4574193A98251A98F27416666669EC2F457415D6DC57EBB8F27414F401359C3F457410612143FD58F2741A913D030C3F45741BF0E9C33ED8F27418C4AEA48C2F457416519E2F81B902741E5D0222FBEF45741598638D6A9902741AD69DE8DACF4574198DD93674D9127414703780F9CF45741
18	MC	MCC	Comédie	MONTPELLIER CENTRE	01060000206A080000010000000103000000010000004100000021B072C8BD89274196B20C4D5FF457412063EEFAED892741FC1873173BF45741F697DD93F48927414ED1918838F45741AEB6627FFF8927418104C52337F45741022B87960A8A27412575027E36F45741B9FC8714198A2741B5A6794336F457413255306A508A2741E86A2B4637F45741AC8BDB48B98A274107CE19953AF45741BF7D1D58F98A2741637FD92D3DF457410D71ACEB418B2741A2B437A433F4574196218E75808B274157EC2F9B2BF45741F2D24DC2B58B2741F697DDEF27F4574107F016C8ED8B274172F90FDD25F45741355EBAE9C88B274164CC5D0B20F457414ED191BCBC8B2741151DC9291BF4574129CB1027A08B2741D0B3596105F4574182E2C798858B274168B3EA2BF4F357415396210E5A8B2741FB5C6DC9F3F35741A167B38A358B2741A7E848D2F3F35741C286A7570F8B27419FCDAAEBF4F35741D0B359D5EA8A2741EEEBC015F7F35741713D0AF7CD8A27416EA30174F9F357419A081BBE988A274145477265FEF35741FDF675E0658A27418351490503F45741AF25E4C3558A2741C7293A5A03F45741E2C798DB438A27416FF085F102F4574103098ADF318A2741A167B34201F457410B4625B5268A27412D211F9CFEF35741B5A67927218A274134A2B497F7F35741DAACFA1C1A8A27414260E5D8F2F357412AA913F0108A2741508D97F6EDF35741C520B0D2FB8927418716D90AE6F3574185EB51F8E3892741F085C954DEF357416C787A05CA8927413A234A1FD7F35741547424B7BF892741910F7A36D4F357419A779C2271882741014D84B1E5F35741AC1C5AC4F4872741B9FC8714D2F3574196218EF5E18627414F1E1682E3F3574186C9544190862741FED4786DD6F35741E17A14CE3E8627415C204185CDF357417F6ABCD46B8527415C8FC2B5D9F35741560E2D128D852741DF4F8D8BE1F35741000000405E852741386744D1E4F35741ECC039635E852741014D84210CF45741423EE85976852741ACADD86B0DF457415D6DC5DEB785274114AE47A119F457415C8FC275D6852741A2B437F41CF4574154522760E58527414182E2931FF45741D200DEA2F58527417AA52CB321F457415DDC46A32586274110E9B77323F45741D9CEF7731C8627415F984CA526F45741984C15EC2A86274145D8F01828F45741DE02096A3186274105A392FA29F4574190A0F8F10486274152B81EF930F45741182653A585862741AF9465F847F457414A0C02EBE4862741508D970654F45741643BDFCF178727411AC05B485EF45741DCD781534B8727416B2BF67368F457418D28ED6D5B8727416210585574F457411D386704D68727418F5374E072F457412F6EA3C1D1872741B98D069C6EF457411058397468882741386744B56CF4574175029A48FA8827413480B7F46AF45741516B9AD7E8882741006F81A05DF4574121B072C8BD89274196B20C4D5FF45741
20	MI	MIPM	PORT MARIANNE	PORT MARIANNE	01060000206A080000010000000103000000010000000001000011363CBDD3922741E4839E2921F45741865AD39CEE9327414A0C027B29F457411B2FDDE4859527418F53748C33F45741C898BBF66F962741D34D624439F45741CBA145F6EF962741C898BB7A3CF457414C3789C17F97274108AC1C463EF457411E166A0D00982741029A08273EF45741CCEEC9839A982741D88173763CF4574117D9CED72699274172F90FA938F45741D0B35935A29927412F6EA38533F45741431CEBE2C79D2741EC2FBBD705F45741075F98CC339F2741772D218FF7F3574154742437AE9F27414D840D43F3F357415A643BDF3BA02741006F81BCF0F35741423EE839A8A027417AA52CA3EFF35741AC8BDBA827A12741F6285CB7EFF35741CC5D4B680DA227413A234A47F4F35741DB8AFD658DA427416C787A6506F45741CE1951BA8CA527411B9E5E210CF4574191ED7CFF33A6274197900F5E0DF4574154742417F0A627419A779C960DF45741211FF40C05A8274155302AF108F457413A92CB9FA2A827412B87161109F45741A8C64B9705A92741CAC342E509F45741A4703D6A3DA92741645DDCBA0AF457417F6ABC9495A92741F085C9DC0CF45741EE5A42FECEA92741B29DEF130DF457413D2CD4DA0EAA2741FB5C6D690CF457415AF5B95A4CAA2741948785FA0BF457419EEFA7868AAA27414C3789510CF457414182E287C5AA27419031770D0EF45741F31FD24F12AB274163EE5A2A12F45741780B2408C2AB2741CC7F48EB1EF4574146257502AFAB2741E9482E7B18F4574139B4C8B6ACAB2741304CA6BE17F457419EEFA7C68FAB27410C93A9A20EF457414703782B2BAB274192CB7F94EEF357415C2041D1F2AA274157EC2FBFDCF35741D95F760F73AB2741A323B9BCBCF3574110E9B7AF9DAB2741EF38451FB2F3574164CC5DCBF8AB27418C4AEA889CF35741BF0E9C7353AC2741371AC0C387F3574195658823A4AC2741827346A075F35741986E1243EFAC2741A52C438864F35741A69BC48035AD2741E63FA46B55F3574157EC2F9B47AD2741A69BC4CC50F35741D34D62704AAD2741933A011550F3574139D6C52D5CAD2741C8073DA74BF3574190A0F8119FAD274136AB3EEB3AF357411973D7B2BCAD27410C022B7F32F357410B4625B515AE2741B003E73819F35741C442ADE935AE2741E4141DFD0FF357413480B70038AE2741BADA8A650FF3574125068155BFAE2741B7627FC9F0F25741C1A8A46EBCAE274179E9265DF0F25741341136DC5EAE274150FC185FE1F25741560E2DD235AE27415EBA49D0DAF25741933A016DD7AD274160764F9ECAF257414DF38E13AAAD274134113608C1F25741C0EC9EFC98AD27416A4DF39ABDF25741E5D0229B8EAD27417FFB3A84BBF25741984C15EC89AD2741A52C4394BAF257412041F16387AD27413C4ED111BAF2574163EE5AE284AD2741FA7E6AFCB9F257412BF6977D7DAD27410C022BBBB9F25741B1E1E97571AD2741705F0752B9F25741228E75716AAD2741EA95B214B9F25741FBCBEE6958AD274101DE02B9B8F257418126C28652AD2741D5E76A8FB8F257416F8104054EAD2741DBF97E7AB8F25741462575024AAD2741FC187357B8F257418E06F0363CAD27417DAEB6B2B7F25741DCD7817338AD274175029A80B7F25741F6285C0F33AD27411B0DE045B7F25741F2B050CB2EAD2741AE47E10AB7F25741F46C563D22AD2741CE88D23AB6F2574145D8F0F41BAD2741CC7F48BBB5F2574136CD3BEE16AD2741B3EA7355B5F25741C74B372913AD274186C95409B5F2574155C1A8A410AD2741D578E9C2B4F2574197FF903E0DAD2741575BB163B4F25741CEAACF5508AD2741F31FD2DBB3F25741B003E74C03AD274190A0F851B3F2574152B81E05FFAC27418FC2F5D8B2F2574189D2DE80FCAC274195658897B2F257410E2DB2DDFAAC2741B1E1E965B2F2574188855A13F6AC2741000000C4B1F257410F0BB546F0AC27413BDF4FFDB0F25741105839D4E7AC27415A643BDBAFF257413D0AD763E0AC2741B1E1E9D9AEF2574113F2418FD5AC2741D42B6599ADF25741B6847C50C5AC274108AC1CBAABF25741E78C280DC3AC2741789CA287ABF25741CCEEC9A3BCAC27412D211FF8AAF257413A234ADBB6AC2741B4C87676AAF25741B6F3FD94B2AC2741228E7515AAF257414260E5B0AFAC2741772D21D7A9F25741CDCCCCCCACAC27415F29CB98A9F257411895D4C9AAAC27418195436BA9F25741A1F83126A8AC2741D3DEE033A9F25741C7BAB8CD93AC27419C33A2C4A7F25741780B24288FAC27413480B770A7F25741182653258CAC2741B22E6E47A7F2574188855AD378AC27416DE7FB41A6F25741B07268B176AC2741DA1B7C25A6F25741545227605FAC2741B8AF0333A5F257413F355EFA56AC2741B7D100E2A4F257419FABADB853AC2741F085C9CCA4F257411361C3134BAC27418716D98AA4F25741E4839EED3FAC274125068139A4F257415EBA498C3DAC2741BC051228A4F257418716D94E09AC2741DDB584A0A2F25741CDCCCCAC05AC2741F7E46185A2F2574169006FA1F1AB274155302AEDA1F257412E90A038E2AB2741CF66D577A1F257418716D90ED1AB27411F85EBF5A0F2574195D40908C5AB2741A857CA9AA0F257415F07CE19ACAB274111C7BADC9FF25741713D0AD7A7AB2741A4DFBEB69FF25741CB10C7BA7CAB2741DB8AFD319EF257418CDB688054AB2741DF4F8DC79CF25741C8073D9B4CAB2741D6C56D809CF25741666666E627AB2741E9482E6B9BF25741569FAB2DFCAA27419A9999219AF257414F1E16EAF5AA27414F1E16F299F2574194F606DFE2AA27415227A05D99F25741FB3A706EC6AA2741F9A0677F98F25741098A1F83B9AA27416ABC74DB97F257411361C313A8AA2741E10B93FD96F2574196438BEC8CAA2741E3361AB896F257413F355EDA6AAA2741A3923AC995F25741EE7C3FD55FAA27411B2FDD8895F2574175029AC844AA274186C954E994F25741F1F44A5924AA274174B5152794F25741819543CB81A92741D734EF4490F257414D840DAF93A8274139D6C5F189F25741D26F5F4748A827418104C5EB87F2574143AD69BEF9A72741014D84D585F257416B2BF637ACA7274195D409E883F25741D50968A27EA727418E06F0D682F25741CDCCCCAC43A72741BDE314DD81F25741F085C95403A7274193A982C580F25741ACADD8FFCAA6274102BC05D27FF2574123DBF93EC8A627419FABADC87FF2574185EB51B84DA62741E4141D297EF25741545227C002A62741E5F21F227DF257415B423E28B8A52741713D0A1F7CF257412D431CCB68A52741E17A14CE7AF257410B24283E43A52741992A183D7AF25741D044D87005A52741B6F3FDD079F257412CD49AA6C1A42741F6285CA379F25741A8C64BF782A427418F53741879F257413255308A48A42741022B87AA78F2574171AC8B5B15A42741F5DBD71578F257418C4AEAE4DDA32741C05B200577F25741BEC11706A5A3274134A2B46F75F25741ACADD83F98A327411361C31F75F257413D9B55FF5FA32741C3D32B6D73F25741A245B65321A3274129CB100F71F25741780B2428E3A22741F4FDD4B06EF25741B8408222A0A22741AAF1D2BD6CF25741D7A370DD5DA227415305A3D26AF25741C8073D3B25A22741C05B200569F2574143AD699EFEA127413A234A6F67F25741166A4DD3C4A12741933A011165F25741C74B37498DA12741E9482EBF62F25741B7D1001E56A1274180B7405A60F257411AC05BE033A1274119E258AF5EF257416D567DEE03A1274109F9A0CF5BF257416B9A77DCD2A027417AA52CEF58F257412BF6971D97A027415986384E55F257412041F1A37AA02741FCA9F1DA53F25741E258175759A027412063EE4253F25741CE19511A33A02741B7D100AE51F25741A2B437782EA02741BF7D1D9451F257417CF2B01025A027413E79582851F25741448B6C87959F2741FA7E6A644BF2574126E4837E559F27417A36AB3649F2574112A5BD61F89E2741865AD3F445F25741B8AF03E79A9E2741BEC117D642F25741984C15EC6E9E274105A3926A41F257418FE4F23F589E2741FF21FDCA40F25741560E2DB2389E2741287E8C2140F2574112A5BD21089E27417E1D386B3FF257416A4DF34EBF9D2741EEEBC0B93EF257413A234A1B6F9D2741984C15083EF25741F7E46181F39C2741D49AE63D3DF25741E8D9ACDA3D9C2741EC51B80A3CF257415F07CED93A9C2741454772013CF25741D3BCE3B42A9C2741AA6054CE3BF257412497FF90099C274187A757CA3BF2574130BB270FFA9B2741E3361AC83BF257418716D9AEEB9B2741BD5296DD3BF25741819543EBBB9B274179E926F93BF25741CA54C1C8A19B2741234A7BFF3BF2574103780B64919B2741B22E6ECF3BF2574195658823769B2741280F0BF93BF257416C09F980649B2741166A4DEF3BF25741E02D9000629B27411EA7E8EC3BF2574146B6F39D469B274103098AF33BF25741A2B43718169B274114AE47ED3BF25741250681D5F99A27412D211FF43BF2574188855A73E39A2741BADA8AF93BF257416A4DF3AEB59A2741C0EC9E043CF25741E17A146EAE9A2741D26F5F033CF25741E4839E8D9C9A27413480B71C3CF25741956588C33E9A27411E166A213CF25741B4C8763E199A274148BF7D113CF257415AF5B9FAF999274104560E0D3CF25741211FF42CB89927417AC729B23DF2574140A4DFBE76992741A01A2F513FF25741705F07AE409927418CB96BAD40F257411B9E5E692D9927414E62108440F25741EBE2365AEA9827415B423E0440F2574113F2418FB79827416E3480AB3FF25741BBB88DA6919827419D11A5613FF257414B59865869982741CFF753C33EF25741CBA145B65E98274166F7E4B13EF25741F90FE9B75C982741AF9465D03EF257414260E5705898274165AA60643EF2574171AC8B5B2F982741B515FB3F3BF2574185EB5138B7972741C976BE534AF25741598638166C972741DFE00B475DF257411361C39344972741143FC6B467F25741CCEEC903399727418D28EDE16AF2574192CB7F48E6962741E2E9957282F257413E7958687D962741AF25E4AB93F25741394547D2BB952741CC7F484BAAF257419318049634952741EFC9C3EAB9F25741CFF753E37F942741A913D098CEF25741ED9E3CEC3D9427413C4ED1E1D7F25741D578E906F0932741166A4D83E6F2574138F8C2E4C9932741C520B0F2F0F2574104C58F5195932741BF0E9CAF04F357417B832F2C689327412EFF211513F357414A7B83CF2B932741B459F5051EF357413FC6DC55E59227412731082C27F357413B70CEE884922741006F815031F35741840D4F8F11912741696FF05111F35741AB3E57FB0C9027413F575B4141F357411CEBE256728F2741F5B9DAD65CF3574199BB96F0498F274160764FE662F35741643BDF2FD98E274123DBF93E78F35741A8C64B976A8E2741EC51B8FA89F35741CEAACF35318E2741151DC99594F3574101DE0209C88E2741CF66D52FA3F357417A36AB9E7D8F274168226CBCB1F3574100917E3B7D8F27417AA52CB7B7F35741BF7D1DB81491274174469452CBF35741E2E99552A7912741857CD02FD2F35741F0A7C6CB1192274186C95421D5F35741547424979A9227419F3C2CE8D4F357413D2CD47AC89227414D840DD3D4F35741492EFF41CB922741492EFFB1E3F35741AD69DEB1D5922741B37BF21C16F4574111363CBDD3922741E4839E2921F45741
21	CV	CVC	La Chamberte	LES CEVENNES	01060000206A0800000100000001030000000100000036000000B4C876DECA7827413D9B55D717F457414CA60A2633782741AD69DE45F0F35741143FC69C72782741FC187303E7F3574113F2410FE477274145D8F05CCAF357414F4013C1437827414F4013ADC4F35741302AA9D3E5772741D044D8F8B1F35741C139234AF2772741F1F44A29ADF35741C6DCB5447D78274144FAEDBBA7F357417E1D38274E7A27418CB96B1990F35741D712F2A12C7A27419A081BE28BF3574136AB3EB7E17927419A99998D85F357410000000041782741CEAACF316AF35741A5BDC1172F7627418941604544F357414B59863821752741F54A59C635F35741B98D0630207427412B87164D41F35741F697DD330A73274158A835553DF35741F0A7C68BB672274150FC184B39F3574160764FBE0B7227418351494D2DF35741CE19511A20712741ECC0391B18F35741742497FF0E712741A1D6348316F357416891EDDCAC70274124B9FCC30CF35741AA82518979702741C442ADB505F35741D3DEE0EB5E70274111C7BAF401F35741B6F3FDF41F702741DC4603B8F8F25741F853E345F76F27413F355EEEF3F2574124B9FC07856F2741840D4F5707F357411A51DA9B006F27413789412020F35741226C787AE36E2741DE02096626F35741840D4F4FC46E27419031771D2EF35741D3DEE00BA36E27417CF2B06438F357413480B7C0836E2741516B9A3744F35741B9FC87B46C6E2741EC2FBBF751F3574187A7574A5F6E27414A7B83C75FF35741B22E6E234F6E2741D7A370ED71F357417A36AB5E356E2741EC2FBB4784F35741840D4FCF246E2741931804BA8FF357415B423EA80A6E2741A167B3C69BF35741A01A2FDDA46D2741B84082BAC0F35741CAC3426D856D2741E63FA44BCEF357414694F6A6716D274171AC8B4BD8F35741789CA2A36F6D2741780B245CE2F35741FA7E6A7C736D2741CBA14522ECF35741E9B7AF838A6D2741B7627FDDFCF35741613255B0C56D2741D8F0F42A20F4574135EF3885EF6E2741728A8E3C17F457412497FF70C26F274112A5BD6D12F457410C93A9A26870274151DA1B5C10F4574172F90FE930712741F2D24D620FF45741E3A59B44AC732741E10B93C10CF4574133C4B16E767427413F575B010CF45741462575A225752741CCEEC90F0CF457412B8716F9AC7627417FFB3AF810F45741431CEBA26E78274176E09CB516F45741B4C876DECA7827413D9B55D717F45741
19	CV	CVM	La Martelle	LES CEVENNES	01060000206A080000010000000103000000010000008F010000613255B0C56D2741D8F0F42A20F45741E9B7AF838A6D2741B7627FDDFCF35741FA7E6A7C736D2741CBA14522ECF35741789CA2A36F6D2741780B245CE2F357414694F6A6716D274171AC8B4BD8F35741CAC3426D856D2741E63FA44BCEF35741A01A2FDDA46D2741B84082BAC0F357415B423EA80A6E2741A167B3C69BF35741840D4FCF246E2741931804BA8FF357417A36AB5E356E2741EC2FBB4784F35741B22E6E234F6E2741D7A370ED71F3574187A7574A5F6E27414A7B83C75FF35741B9FC87B46C6E2741EC2FBBF751F357413480B7C0836E2741516B9A3744F35741D3DEE00BA36E27417CF2B06438F35741840D4F4FC46E27419031771D2EF35741226C787AE36E2741DE02096626F357411A51DA9B006F27413789412020F3574124B9FC07856F2741840D4F5707F35741F853E345F76F27413F355EEEF3F25741333333D3CC6F2741C05B20EDEEF25741053411B6986F274132772D51E9F25741068195A3C96E2741713D0A03D3F25741B81E856B8D6E27412C6519CACDF257413EE8D96C336E2741780B244CC6F25741A9A44E00496D27411B0DE0D5BAF25741F46C56DD156D2741D200DEE6B6F257415BB1BF0CEC6C274100917E07B2F257418E75711BD46C2741C976BEFBACF25741956588C3D16C2741C2172677ABF257415E4BC8E7D36C2741D6C56DACA9F25741DA1B7C81DC6C2741711B0D28A7F2574105341116E06C274189D2DE58A4F257410F0BB566DF6C2741EA95B250A1F25741933A01CDDC6C2741547424AF9FF2574173D712B2D66C2741B30C71009EF25741B7627F19CC6C2741ACADD87F9CF25741AF25E423BE6C27412C6519369BF25741F085C914AE6C2741F90FE95B9AF25741508D972E9E6C2741A4DFBE129AF257410F0BB566826C2741A4703DB697F25741228E75D16E6C2741789CA26F94F25741B4C8761E6B6C274109F9A04B95F25741C3F528BC566C27418A8EE4228FF25741B29DEF87526C2741CB10C7DE8DF2574151DA1B1C486C2741B7D100228BF257415EBA496C446C27415F29CB248AF25741516B9AF72A6C2741D42B65E584F2574160E5D042236C2741764F1E9E83F25741006F81A40A6C27417B14AECB7FF25741F7E46121FC6B27416C09F9A47DF25741598638D6E36B27412B18950C7BF25741CD3B4ED1CC6B274145D8F0D878F25741984C158CB36B2741CF66D5A376F257414A0C020B996B2741E09C11B574F25741A1D6348F7C6B2741857CD01F73F257413D2CD4FA5F6B27419D11A50572F25741A8C64BB7256B2741BF0E9C2770F257414BEA0474EB6A274105A3924E6EF2574179E926F1B06A274175029A7C6CF25741D8817386696A2741A323B9406AF257411361C3F34C6A274197FF904269F25741D5E76A8B136A2741F016481467F257418A8EE472F66927410F9C33B665F2574151DA1BBCDA692741F241CF7264F25741B7627F996B692741598638EA5EF25741AE47E15A166927414FAF94815BF257415917B75192682741F01648C057F25741933A018D2468274119E2581352F25741EFC9C3621A6827415C8FC27D51F25741705F07CE05682741E561A14E50F25741E3A59B24DD672741CAC342F14DF257410F0BB5A6BC67274190A0F8414CF257412BF697DDB067274183C0CAC14BF257411361C373A267274136CD3B3A4BF257415BB1BFCC94672741DDB584E04AF257416ADE71EA8D672741E9482EC74AF257418638D6C578672741CD3B4EA14AF25741401361C36767274121B072984AF257415DDC46836167274190A0F8A14AF257414CA60A464F672741B30C71F04AF257417368914D30672741E0BE0EA44BF25741F697DD7314672741D49AE63D4CF25741ABCFD5160667274144696F884CF257418CB96B29B16627413B014D544EF257418104C5EF97662741250681E94EF257410DE02DF09366274191ED7CF74EF257413CBD52167B6627419A9999894FF257412B8716996C662741E78C28D14FF2574103098A3F536627416688636950F257417DAEB6C244662741FD87F4B750F257416519E278E8652741304CA6CA52F25741C8073DBBDC652741022B870653F2574174B515FBD9652741EA04340953F257414C3789C1BE6527414260E5A453F2574112A5BD61BA6527416B2BF6AF53F257411D3867E4AF652741DE718AEE53F257419EEFA726A3652741E8D9AC2A54F2574174B5157B4C652741917EFB1656F2574100917E3B3B652741EA04343D56F257411D5A64FB376527412497FF4056F2574157EC2FFB2C652741C442AD5156F25741A8C64B371D652741DBF97E2E56F257412B189554156527411D38671056F25741091B9E1EE56427414BEA040055F2574104E78C88BB6427416F8104E153F2574188855A1355642741304CA63251F25741EFC9C3C236642741696FF05950F25741FB5C6DE5FA632741D0B359E54EF25741C8073D3BA6632741EC51B8CA4CF257411E166A4D896327417CF2B01C4CF257413D0AD703776327412B8716A14BF25741FCA9F1D251632741DFE00BCF4AF257413255300A3E632741857CD0634AF25741DD24068129632741EFC9C3F249F25741B1BFEC7EDE6227413D0AD74B48F25741C5FEB2FB91622741A60A469546F257414D158CCA6A6227415AF5B9C245F25741C05B204156622741569FAB4D45F25741E25817D73F62274173D712D244F2574176E09C9133622741705F078E44F25741FE43FA0D316227419B559F5744F25741C6DCB504E86127412063EE2A40F25741DE02090ACE61274107F016A43EF25741EEEBC0B99E612741832F4CE23BF257411EA7E8C88D6127413BDF4FED3AF25741075F988C726127418126C24E39F25741AED85F163D6127418D976E3636F257417F6ABCB41C6127412C65194A34F257414B598698C9602741A301BCF92EF25741C3F5289C77602741759318A429F25741637FD93D5D602741615452E327F257414A7B836F526027411A51DA0B27F25741E10B93491260274102BC050623F257413B014DA40D602741BF7D1DB822F257414D840D4F066027416DE7FB7523F2574161545287F65F27414BEA042025F257412A3A924BF45F27412BF6976925F25741423EE819EF5F274190A0F85D26F25741A1D6344FE85F27415E4BC8C727F257417AC7295AE55F27412B18958028F2574176E09C51E05F27416DE7FB092AF2574148E17A14D65F27416C09F9642EF2574129CB1087D35F27415AF5B99A2FF2574152B81EE5D05F27417424978B31F25741E17A14EED05F2741304CA61E32F2574186C95481D15F27419D11A55933F257410A6822ACD25F274144696F0834F257418BFD6517D45F2741560E2DBE34F257413B70CE28D85F2741A9A44ED435F257412AA91330DB5F2741E4839E4536F25741BE3099AAEE5F2741394547E239F25741FAEDEB60F65F274105C58F413BF25741C898BB3608602741742497933EF2574138F8C2242E602741764F1E5A45F2574152B81E854B6027410AD7A3504BF25741DBF97E6A4E602741D9CEF7A34BF257413BDF4FAD66602741948785BE4FF25741E3A59BE4706027410F9C332A51F25741ADFA5C2D746027416ABC74B351F257418638D6C57E6027414CA60A3253F25741295C8F0289602741EEEBC0F554F25741D34D62F09B6027416ABC74C357F2574113F241CFB86027413FC6DC955BF25741B459F559BD602741F4FDD43C5CF257415E4BC8E7C2602741736891155DF2574186C95401CB602741A779C7A95EF25741083D9BB5D060274127C286EB5FF257412497FF90D7602741711B0DA061F257411B9E5E89DD602741A69BC42463F257419D802602F0602741F931E6B268F257417DD0B3B9F36027410B24282E6AF257411C7C6172F7602741D6C56DBC6BF25741CD3B4E71FB6027410D71ACAF6DF25741849ECD4AFE602741E78C284D6FF257414BEA04340061274138F8C2E06FF2574172F90F4903612741C3F5283471F25741CEAACF75056127413480B70072F25741068195E3166127414BEA04DC76F257414FAF94C51E612741AB3E57FB78F25741C8073DDB226127416E3480577AF2574157EC2F1B28612741454772597CF25741D50968222961274180B740CE7CF2574113F2416F2D6127416FF085A57FF25741645DDC062F612741CD3B4E2581F25741E25817D73061274158A8353984F25741B8AF034731612741C74B373D85F25741DCD78173306127417F6ABC1888F257414ED191FC2F6127419D8026BA8AF257412D431C0B2E612741A01A2FC58FF25741780B24882B612741257502A691F257414CA60A2621612741925CFEAF95F25741280F0BB513612741091B9ECA98F257418195432B0C612741C0EC9E449AF2574123DBF97E04612741C1CAA1959BF2574139D6C52DFE602741CC7F48939CF2574154E3A57BF960274127C2867F9DF257419CC42050F3602741C4B12EDA9EF2574198DD93A7EC602741917EFB66A0F257414CA60AA6E860274132772D61A2F2574135EF3825E660274101DE0265A4F25741FE65F744E56027416ABC746FA6F25741ED9E3C4CE5602741DBF97EE6A6F25741C1A8A4EEE76027419A081B16A9F257410A68228CEC6027410EBE30F1AAF25741C898BB96EE602741EFC9C39AABF25741C442ADA9F4602741B1506BC6ACF2574157EC2F3BFB602741696FF0D9ADF25741000000C0FE602741764F1E22AEF2574104E78CC8166127419565888FB0F257419FABAD98386127412DB29D67B3F25741A301BC654261274185EB512CB4F25741098A1F2357612741FDF675E8B5F25741F5DBD7216D612741174850B8B7F25741E5D022DB806127417B14AE33B9F25741234A7B838661274163EE5AB2B9F25741B30C714C8D61274138F8C238BAF25741371AC07B9C61274155302A19BBF25741986E1203A3612741C0EC9E84BBF2574118265385A56127416F8104A5BBF25741ADFA5C8DAE612741F775E018BCF25741AB3E573BBE6127412FDD24E2BCF25741FE43FA4DF361274196438BC0BFF25741280F0B55F961274152B81E29C0F257416F810485056227415C204119C1F257418A1F630E0B6227416C09F9A8C1F25741D200DE4216622741D34D62E4C2F25741D9CEF7D31D622741C286A7EFC3F257410C93A9E22262274127C286D7C4F257411283C02A25622741B98D0658C5F25741F8C264EA2D6227419BE61D4FC7F25741226C78BA31622741166A4D4FC8F25741E78C284D356227414DF38E7BC9F257418BFD65973C62274106121423CCF2574126C286C748622741567DAE2ED1F25741ACADD89F4C622741431CEBB6D2F2574172F90F49536227417446944ED5F25741547424B7536227412B189534D6F25741BADA8A7D5362274132E6AE9DD6F257415BD3BCC352622741B003E704D7F25741ED0DBE5050622741508D97DED7F25741E2C7987B4C622741BF0E9C97D8F25741FB5C6D854862274154E3A53FD9F25741D656EC0F4362274129ED0DF6D9F25741287E8C593E6227418273469CDAF257418638D68537622741705F0772DBF257416B9A771C2B622741ECC039FBDCF2574163EE5A02176227418CDB688CDFF257411AC05B40086227415A643B93E1F2574152499D00F961274157EC2FBFE3F25741F8C2646AE56127418195438FE6F2574158A835CDE36127410E4FAFC0E6F2574110E9B7EFE1612741E78C28EDE6F257415C8FC235DA6127414F1E165EE7F257418E06F076D6612741DC460378E7F25741E561A1F6CE61274162A1D680E7F25741D6C56D94C9612741C1392366E7F25741BEC117C6A7612741CC5D4BB8E6F25741EC51B8FE966127416210585DE6F25741764F1ED6846127413480B7F0E5F2574183C0CA01696127413D2CD4EEE8F2574173D712B25161274189D2DE30ECF25741832F4C4636612741696FF0B9EFF25741C74B37092561274142CF6615F2F25741925CFE431861274110E9B7E3F3F2574160764FBE0C61274110E9B7A7F5F2574105A3929A0261274142CF6689F7F257419FABADB8F960274139B4C886F9F2574114D04458F2602741CEAACF99FBF25741166A4D73ED602741A1F8315EFDF257414F401341EB6027413D0AD743FEF25741AC8BDBE8EB602741355EBAC1FEF25741FF21FDD6F56027419C33A2A401F35741D42B65B9FC602741C66D34CC03F357414ED1911C09612741C286A70308F357418D28EDAD0A612741D42B651D09F35741F697DD730C6127417FFB3A880BF35741759318040A612741D712F2950CF3574196B20C31056127417E1D38730DF35741AC8BDB68E160274163EE5A4611F3574114D044D8BF602741AF25E48B14F357414ED1919C96602741D881733619F3574155302AA991602741EEEBC00D1AF35741462575C28860274151DA1BBC1BF35741A835CD5B8160274107CE19691DF357412BF697BD76602741B1BFECA61FF35741C976BE9F6C6027410AD7A3E821F35741D34D625067602741BB270F0323F357411973D7D25E6027414013614725F3574126C286E75460274132772DB928F3574119E25877406027410EBE301532F3574196438BEC36602741098A1F9B37F35741448B6C072B6027418B6CE78F3FF357410BB5A61929602741499D80BE40F3574117D9CE1726602741D88173B242F35741A01A2FFD246027414850FC1845F3574129ED0DBE24602741F016483447F357414FAF9425246027416C787AB147F35741728A8E4423602741D578E9AE49F357415C204191226027419F3C2C804AF3574107CE19111E6027417E8CB99F4EF35741BBB88DE61B6027416744690350F357418E06F05619602741E6AE251451F35741BD52962117602741EFC9C3C651F35741DF4F8D571060274198DD933B53F35741C8073D3BEB5F2741E10B93ED5BF357419B559FCBE75F2741B9FC87005DF357410B4625D5E65F27418638D69D5DF35741EC2FBB07E65F2741C3F528D05EF35741D044D870E65F2741C05B20655FF357412CD49AE6E85F274132E6AEC560F35741865AD3FCFB5F2741AF94651C64F357418A1F638E02602741FAEDEB3065F35741BADA8AFD096027413411361C66F35741BEC117C61360274140A4DF9666F3574175029A08166027413E7958BC66F357418D28EDAD1E60274114D0440467F357419F3C2CF42D6027410681954F67F35741BC7493383B602741D26F5F7F67F357414BC807BD4B60274164CC5DAB67F357411E166AAD8B6027413FC6DC4568F35741A4DFBECE92602741772D214F68F35741FCA9F1F295602741F8C2648E68F3574172F90FA9A26027416ADE71E269F35741D122DBB9AB602741621058E56AF35741355EBAC9DD60274167D5E7B671F35741EC2FBBC7F6602741C8073D8375F35741D712F2610E612741D3DEE01379F35741470378AB116127419D8026AA79F357412575029A15612741158C4A927AF357415DDC466317612741B1BFEC267BF3574113F2414F19612741956588E77BF35741E8D9AC7A23612741744694AA80F35741F8C2648A31612741696FF0B987F35741E4839E8D3B612741E92631048EF35741DE718AAE416127410B24282292F35741F31FD24F456127412506813D94F35741DC4603385261274174B515D39AF35741B22E6EE353612741A5BDC18B9BF35741EE7C3F155E6127419A779CAA9EF357416EA301DC5F612741C7293A169FF357419E5E298B65612741B37BF204A0F3574126E483FE78612741728A8E2CA3F35741C3D32BA59E612741BDE3147DA9F35741EC51B89EA6612741CE195112ABF35741B7627F59AC612741BE9F1ABFACF35741D8F0F48AB06127410F9C33D6ADF35741061214DFB4612741F0164818AFF35741E7FBA971B96127415F984C41B0F35741A5BDC1F7C16127416D567DA2B2F357417D3F351ED2612741DE02090AB7F357412041F103D961274152499D68B9F357415839B428E2612741643BDFBFBDF35741E86A2BD6E7612741A835CD9FC0F35741C74B37C9E86127410F0BB5D6C1F357417E1D3887E861274123DBF9C2C3F35741CCEEC963E861274134113698C5F357415396212EE761274106819543C6F3574111C7BA38E56127412EFF21F5C6F35741832F4CA6D36127416C09F90CCCF35741857CD053C4612741EB73B539D5F35741BE3099AAC2612741CBA145B2D6F35741228E75F1C0612741B537F832D9F35741A2B43798C0612741CFF753AFDBF35741143FC69CC0612741D0B359F9DBF35741986E1203C16127413B014D60DCF3574104560E8DC1612741C8073D03DDF357418B6CE75BC26127410B4625F5DDF35741AD69DED10962274193A98205E5F3574196B20CD156622741E3C798A3ECF35741226C78FA8F622741401361FFF2F357413A234ABBE26227413A234ABBFCF357418D976E92236327413A234AEB03F4574189D2DEE0296327413EE8D9CC04F457413F355EBA5E6327415F29CB380CF45741BB270FCBB663274190A0F8091BF45741363CBD12DF632741022B878E27F457419318043607642741D200DEBE31F4574104560E4D146427414D840D2F35F45741F90FE9771E642741643BDFDB37F4574101DE026941642741539621DE3EF45741B29DEFC78C642741F4FDD48848F457415DDC4643C26427417B832FF84BF45741F8C2640A2665274127A089E451F45741849ECD2A4565274155302AC153F4574195D409A86C6527417E8CB95B55F457419487859A95652741F5B9DA4256F45741E9263108D5652741D95F76B356F4574138674429F96527410BB5A68556F4574187A757CA1B6627410F9C335A56F45741E0BE0EBC6B662741E2E995E254F457414694F686AE662741772D211353F457413F355E9ABC67274144696F404AF457413411361C4E682741234A7B4345F45741DD240601046A2741832F4C3E36F45741BB270F8BCE6A27416D567D6231F45741832F4CC6BF6A2741C898BB5637F4574199BB9630F16C2741B5A679CF27F45741613255B0C56D2741D8F0F42A20F45741
22	MC	MCG	Gambetta	MONTPELLIER CENTRE	01060000206A0800000100000001030000000100000030000000696FF0E5C27F274161C3D3F70BF4574197FF90BEB57F2741DF4F8DFB19F45741C05B20C12F802741FA7E6A3015F4574139B4C856F880274104560E050FF45741029A081BBE812741DBF97ECE09F45741C13923EA238227417424970308F45741D712F2816F822741E5D022F706F45741F5DBD741A582274129ED0D9606F45741158C4A4ADF8227416DE7FBB906F457411FF46C16908327412063EE820EF457419318049699832741AF94655C0CF45741F2D24D2250842741431CEB12EFF35741E7FBA9F1438527413108ACD8DBF357417F6ABCD46B8527415C8FC2B5D9F35741BC749358E18427418E7571DFB5F3574182E2C7B829852741D34D6244B1F357419CA22339F48527416DE7FB95A5F3574103098A9F9F862741A1F831829AF35741EBE2365A3087274195D409EC90F357417424973F8A872741BDE3145986F35741CBA1459652872741304CA6E67DF3574148BF7DFD328727415917B76978F357412BF697FD04872741CB10C7726EF35741492EFF01E386274131992ABC66F35741B537F8429786274187A757BE52F357418FC2F5E85A86274163EE5ADA3AF35741EA043411468627411361C3D322F35741E17A14AEEA852741B81E85271FF357411B9E5E0946852741AD69DED519F357412C651922FC832741ED0DBE580FF35741A01A2F1DF48327419EEFA7160FF35741053411F6DD8327412497FFC80EF35741AED85F36CA8327415F07CEF10EF35741910F7A36C2832741EEEBC0010FF35741986E122394832741E0BE0E2410F35741DD2406415F832741780B247012F357414260E5904B83274196B20C9913F35741AF9465A82E832741A54E404F15F3574114AE4781DF822741E6AE25941BF357415839B4E8D8822741F241CF1A1CF35741819543EB028227417B832F5832F35741A857CAB28F812741D6C56DEC3DF357416E34809702812741EC51B87247F357415C204131D8802741C7293A6649F35741B29DEFC77D8027412E90A08C4DF35741FBCBEEC941802741E10B93B187F3574187A7574A06802741865AD3D8C5F35741696FF0E5C27F274161C3D3F70BF45741
23	MC	MCF	Figuerolles	MONTPELLIER CENTRE	01060000206A0800000100000001030000000100000022000000696FF0E5C27F274161C3D3F70BF4574187A7574A06802741865AD3D8C5F35741FBCBEEC941802741E10B93B187F35741B29DEFC77D8027412E90A08C4DF357412B8716D9CC7F2741DCD7810F56F357419FABADF8907E2741CB10C79664F35741C7293A72AA7D274104E78CF46BF35741832F4C26477C2741BD5296117CF3574196438B6CBF7B27415474248781F357412AA91390F07A2741DC46035087F357417E1D38274E7A27418CB96B1990F35741C6DCB5447D78274144FAEDBBA7F35741C139234AF2772741F1F44A29ADF35741302AA9D3E5772741D044D8F8B1F357414F4013C1437827414F4013ADC4F3574113F2410FE477274145D8F05CCAF35741143FC69C72782741FC187303E7F357414CA60A2633782741AD69DE45F0F35741B4C876DECA7827413D9B55D717F45741840D4F6F6E79274117B7D1D819F457413EE8D9CC337A2741D734EF601AF45741E4141D098E7A2741D656EC8319F457419CA22339DA7A274180B740F617F457410B24289E287B27414694F6AE15F45741D95F768FB17B2741F01648BC11F457414C3789811E7C2741E258173314F457412D431C2B567C27419A99996D14F457417E8CB90B797C274108AC1C3A14F4574162105839977C27415305A3D612F457418638D6E5B17C2741492EFF6511F4574188F4DB57197D27414BC8079D09F45741A69BC4C0D77D2741A60A46C104F457411CEBE256E67D27414D158C3E0CF45741696FF0E5C27F274161C3D3F70BF45741
24	MC	MCS	Gares	MONTPELLIER CENTRE	01060000206A080000010000000103000000010000004100000082E2C798858B274168B3EA2BF4F35741107A36CBA78B2741AEB662C3E8F35741C0EC9E9CBB8B2741ED9E3CA0E5F357413BDF4F6D9A8C2741A54E405FCAF3574145D8F0B4DC8C2741158C4A2AC2F35741E9482E7F188D2741B1BFEC2ABAF3574120D26FBFCC8E274139D6C561BFF35741E86A2B36108F2741A9A44E50BEF3574100917E3B7D8F27417AA52CB7B7F357417A36AB9E7D8F274168226CBCB1F3574101DE0209C88E2741CF66D52FA3F35741CEAACF35318E2741151DC99594F35741A8C64B976A8E2741EC51B8FA89F35741ECC03983878D27413D9B552786F357415DDC4683298C2741386744C56BF35741787AA52C138C274196438B786AF35741A01A2FDDF78B2741061214AB69F35741986E1203DC8B27410C93A92E68F357415BD3BCC3C68B2741E3A59B5066F35741917EFBDAC08B2741FF21FDCA65F3574166F7E4812F8B2741BC9690C756F357416F8104C5F68A2741E86A2B5255F3574117D9CE77AE892741151DC9794CF357414CA60A068D892741F163CC914BF3574189D2DE20EF8827412731080C42F35741789CA2C3A78827416B2BF69B3EF35741BA490C42C6872741454772BD33F35741EA043411468627411361C3D322F357418FC2F5E85A86274163EE5ADA3AF35741B537F8429786274187A757BE52F35741492EFF01E386274131992ABC66F357412BF697FD04872741CB10C7726EF3574148BF7DFD328727415917B76978F35741CBA1459652872741304CA6E67DF357417424973F8A872741BDE3145986F35741EBE2365A3087274195D409EC90F3574103098A9F9F862741A1F831829AF357419CA22339F48527416DE7FB95A5F3574182E2C7B829852741D34D6244B1F35741BC749358E18427418E7571DFB5F357417F6ABCD46B8527415C8FC2B5D9F35741E17A14CE3E8627415C204185CDF3574186C9544190862741FED4786DD6F3574196218EF5E18627414F1E1682E3F35741AC1C5AC4F4872741B9FC8714D2F357419A779C2271882741014D84B1E5F35741547424B7BF892741910F7A36D4F357416C787A05CA8927413A234A1FD7F3574185EB51F8E3892741F085C954DEF35741C520B0D2FB8927418716D90AE6F357412AA913F0108A2741508D97F6EDF35741DAACFA1C1A8A27414260E5D8F2F35741B5A67927218A274134A2B497F7F357410B4625B5268A27412D211F9CFEF3574103098ADF318A2741A167B34201F45741E2C798DB438A27416FF085F102F45741AF25E4C3558A2741C7293A5A03F45741FDF675E0658A27418351490503F457419A081BBE988A274145477265FEF35741713D0AF7CD8A27416EA30174F9F35741D0B359D5EA8A2741EEEBC015F7F35741C286A7570F8B27419FCDAAEBF4F35741A167B38A358B2741A7E848D2F3F357415396210E5A8B2741FB5C6DC9F3F3574182E2C798858B274168B3EA2BF4F35741
25	CX	CXE	Estanove	CROIX D'ARGENT	01060000206A0800000100000001030000000100000024000000B29DEFC77D8027412E90A08C4DF357415C204131D8802741C7293A6649F357414FAF9405177E2741C1A8A456D6F25741F31FD24FEA782741AA60546200F25741FED478096F782741C1A8A46615F257419D11A51DCB772741394547762EF25741F9A067F3267727414B59868443F2574114AE4781F07627416F12832C53F257417C6132557976274174B5159F61F25741492EFF41EF7527411EA7E8E875F25741D26F5F8755752741EE5A42C687F25741A857CA5241752741006F81B48AF25741819543AB2C752741D712F2798EF25741D734EFF81E752741E3A59B8091F257417FFB3A900575274169006F4997F2574111C7BA58EA742741EF38454BA2F25741849ECD6AD3742741F90FE9D3ABF25741986E1263AA742741470378FFB9F257410D71ACAB757427411283C03EC7F25741F54A59462F742741FFB27BC6D5F257413A234A3BC4732741E02D904CE8F257417E8CB96B7473274194F606D30CF357410C93A9A21E7427410EBE30B123F357414B59863821752741F54A59C635F35741A5BDC1172F7627418941604544F357410000000041782741CEAACF316AF3574136AB3EB7E17927419A99998D85F35741D712F2A12C7A27419A081BE28BF357417E1D38274E7A27418CB96B1990F357412AA91390F07A2741DC46035087F3574196438B6CBF7B27415474248781F35741832F4C26477C2741BD5296117CF35741C7293A72AA7D274104E78CF46BF357419FABADF8907E2741CB10C79664F357412B8716D9CC7F2741DCD7810F56F35741B29DEFC77D8027412E90A08C4DF35741
26	PR	PRA	Aiguerelles	PRES D'ARENE	01060000206A08000001000000010300000001000000660000006F8104C5F68A2741E86A2B5255F3574166F7E4812F8B2741BC9690C756F35741917EFBDAC08B2741FF21FDCA65F357415BD3BCC3C68B2741E3A59B5066F35741986E1203DC8B27410C93A92E68F35741A01A2FDDF78B2741061214AB69F35741787AA52C138C274196438B786AF357415DDC4683298C2741386744C56BF35741ECC03983878D27413D9B552786F35741A8C64B976A8E2741EC51B8FA89F35741643BDF2FD98E274123DBF93E78F3574199BB96F0498F274160764FE662F357411CEBE256728F2741F5B9DAD65CF35741AB3E57FB0C9027413F575B4141F35741840D4F8F11912741696FF05111F357413B70CEE884922741006F815031F357413FC6DC55E59227412731082C27F357414A7B83CF2B932741B459F5051EF357417B832F2C689327412EFF211513F3574104C58F5195932741BF0E9CAF04F3574138F8C2E4C9932741C520B0F2F0F25741D578E906F0932741166A4D83E6F25741ED9E3CEC3D9427413C4ED1E1D7F25741CFF753E37F942741A913D098CEF257419318049634952741EFC9C3EAB9F25741394547D2BB952741CC7F484BAAF257413E7958687D962741AF25E4AB93F2574192CB7F48E6962741E2E9957282F25741CCEEC903399727418D28EDE16AF257411361C39344972741143FC6B467F25741598638166C972741DFE00B475DF2574185EB5138B7972741C976BE534AF2574171AC8B5B2F982741B515FB3F3BF25741A835CD1BFE972741FFB27B7E37F257410F9C33E2D59727418638D61134F25741D93D79B8CE972741B840827E33F257414694F6A6A89727418BFD659330F257419BE61D0791972741B003E7B02EF25741F0A7C66B7D972741226C78122DF2574122FDF6956D97274130BB27C72BF25741E561A1B655972741A301BCED29F25741D93D7918419727419487852228F257414694F6262397274144696F2825F257413D9B55FFF9962741B1BFECD620F25741CCEEC9A3E996274133C4B12E1FF257413F355EBAD59627415A643BA71CF25741F6285CAFC1962741A857CA061AF25741DD2406C1AB96274139B4C83217F257418A1F63EE93962741A1D6341B14F257413C4ED1B173962741E3C7986F10F257412C6519224A96274152B81E990BF2574142CF661520962741151DC9F506F257417DD0B359EF952741D8F0F46601F25741B1E1E955B8952741083D9B5DFBF15741C7BAB88D7F952741E63FA40FF5F15741448B6C27579527416A4DF3D2F0F157412F6EA34141952741925CFE8BEEF1574174B515DB3A952741DCD7812BEEF15741FF21FD1633952741D1915CF6EDF1574139B4C8362C95274127310800EEF1574174469456239527417B832F0CEEF1574139B4C816149527411DC9E52BEEF157412EFF219D989427415B423E48E9F1574119E25837909427415B423EF8E8F157414CA60AC677942741711B0D08E8F157417A36ABFE08942741D881733AE4F1574197FF907EA99327410EBE30C9E0F15741E25817374793274185EB51D4DAF1574177BE9F5AF6922741A9A44E74D5F157413E7958A89D92274113F241CBD0F15741A52C437C23922741E86A2BB6CAF1574174469476F89127413E795898C8F15741EFC9C362AC912741ECC039BFC3F15741E8D9ACDAA491274100000048C3F1574114D044B869912741F853E36DBFF15741AED85FB625912741EB73B59DB9F15741933A01CD03912741304CA632B7F157410AD7A3D0428F2741083D9B25EEF1574114AE47610E8F2741C5FEB2A7F1F15741BF7D1D98D98E2741EA95B280F3F157417C613215DF8E27414FAF9455F5F157410BB5A6F9E08E27411C7C61AAF7F1574107F01688DE8E2741A9A44EACFAF15741A7E8480ED78E2741F9A0672FFDF157412AA91330CF8E2741295C8F6AFFF15741D0D5564CC38E27417958A85101F25741742497BFB38E27412A3A92AB02F257417B14AEA7A58E2741BB270F4B03F257414ED1911CA18E27410F0BB50611F25741827346B49D8E2741F0A7C61B25F25741E09C11656D8E2741CDCCCCD430F25741B1E1E955568E27415986384238F25741A779C7894A8E2741FAEDEBCC3FF257411283C08A468E2741BD52961146F257417E8CB9CB3C8E27418FC2F5F860F25741226C78FA558D2741F7E461299BF25741A9A44E00D58C2741FF21FD46B9F2574161C3D32B078C2741ED9E3C88E0F2574145D8F0F4A88B274114D04450F4F25741C3F528FC598B2741A835CDEB09F35741E92631E8108B27419E5E29DB21F357416F8104C5F68A2741E86A2B5255F35741
27	PR	PRM	Saint Martin	PRES D'ARENE	01060000206A0800000100000001030000000100000026000000EA043411468627411361C3D322F35741BA490C42C6872741454772BD33F35741789CA2C3A78827416B2BF69B3EF3574189D2DE20EF8827412731080C42F357414CA60A068D892741F163CC914BF3574117D9CE77AE892741151DC9794CF357416F8104C5F68A2741E86A2B5255F35741E92631E8108B27419E5E29DB21F35741C3F528FC598B2741A835CDEB09F3574145D8F0F4A88B274114D04450F4F2574161C3D32B078C2741ED9E3C88E0F25741A9A44E00D58C2741FF21FD46B9F25741226C78FA558D2741F7E461299BF257417E8CB9CB3C8E27418FC2F5F860F257411283C08A468E2741BD52961146F25741A779C7894A8E2741FAEDEBCC3FF25741B1E1E955568E27415986384238F25741E09C11656D8E2741CDCCCCD430F25741B6847CB02C8E27410B4625E92DF2574191ED7C1F248E2741448B6CB326F257418638D6E5FA8D274150FC184700F2574126C28667888D27412041F13301F2574162A1D6F4218D27416A4DF3CA02F257418048BF9DAF8B2741A089B06D14F257418C4AEA64E88A274119E2589B20F25741FED478697A8827417424975348F25741029A08BB378827418BFD650B4EF25741B30C710C07882741865AD3A053F257412497FF50E887274183C0CA4158F25741000000A0D7872741D6C56D745DF257410DE02DB0C58727414A7B83076DF25741BB270FAB72872741D3BCE3188AF25741840D4FEF27872741234A7B3F97F257411973D732B68627417FD93DCDAAF25741CFF753039586274174469462B6F2574140A4DF9E48862741075F98C0BAF257414B5986783E862741006F81CCEBF25741EA043411468627411361C3D322F35741
28	CX	CXM	Lemasson	CROIX D'ARGENT	01060000206A080000010000000103000000010000003C000000EA043411468627411361C3D322F357414B5986783E862741006F81CCEBF2574140A4DF9E48862741075F98C0BAF25741F7E461A14B862741F31FD25FA8F257410BB5A67949862741D509682A6AF25741C3F528FC4C86274124287EC857F257416F1283C0448627418126C2AE24F257411895D4294486274190A0F8890AF2574111363C3D30862741265305F3E8F1574196B20CD107862741C58F3113B7F15741ECC039A3E885274146B6F37D95F1574194F6065FAC8527413D2CD4B697F15741516B9A374E842741B81E85A395F15741C5FEB2BB9D832741A8C64BDBAFF15741A54E40331F832741D1915CCAC4F157413A234A9BE58227410F9C33AAC3F157414850FCD87F8227419EEFA76ACAF15741F2D24DE21C8227415BD3BCF3D3F157410B2428BE9E81274103780BFCE2F15741668863FDE98127418AB0E1ADECF157412C651982598127415305A3A204F2574114AE4701887F2741F01648781CF257411283C04A517F2741423EE8851FF2574177BE9FDA6D7F2741228E75AD2CF257419F3C2C14957F27410F0BB56E3CF2574117D9CE97A07F2741C0EC9EC042F257412D431CAB9B7F27410EBE301546F257413411369C917F2741FF21FD4E49F25741C6DCB504847F27412BF697014CF2574180B740C2757F274188855A8360F25741363CBDB2787F2741C74B37A965F2574198DD93C7867F27418BFD65036BF25741CB10C79A4B8027414260E5249AF2574189416025C27F274174249713A6F25741355EBA09297F2741AAF1D2A9AFF25741BADA8A5D157F2741371AC013B1F25741098A1F230C7F2741CBA1458EB3F25741986E1203037F274132772DC9B9F2574175931824F37E274112A5BD21C0F2574142CF6695D97E2741F2B0507BC3F257417DAEB642B87E2741CA54C1A0C6F257414FAF9405177E2741C1A8A456D6F257415C204131D8802741C7293A6649F357416E34809702812741EC51B87247F35741A857CAB28F812741D6C56DEC3DF35741819543EB028227417B832F5832F357415839B4E8D8822741F241CF1A1CF3574114AE4781DF822741E6AE25941BF35741AF9465A82E832741A54E404F15F357414260E5904B83274196B20C9913F35741DD2406415F832741780B247012F35741986E122394832741E0BE0E2410F35741910F7A36C2832741EEEBC0010FF35741AED85F36CA8327415F07CEF10EF35741053411F6DD8327412497FFC80EF35741A01A2F1DF48327419EEFA7160FF357412C651922FC832741ED0DBE580FF357411B9E5E0946852741AD69DED519F35741E17A14AEEA852741B81E85271FF35741EA043411468627411361C3D322F35741
29	CX	CXP	Pas du Loup	CROIX D'ARGENT	01060000206A08000001000000010300000001000000970000004B59863821752741F54A59C635F357410C93A9A21E7427410EBE30B123F357417E8CB96B7473274194F606D30CF357413A234A3BC4732741E02D904CE8F25741F54A59462F742741FFB27BC6D5F257410D71ACAB757427411283C03EC7F25741986E1263AA742741470378FFB9F25741849ECD6AD3742741F90FE9D3ABF2574111C7BA58EA742741EF38454BA2F257417FFB3A900575274169006F4997F25741D734EFF81E752741E3A59B8091F25741819543AB2C752741D712F2798EF25741A857CA5241752741006F81B48AF25741D26F5F8755752741EE5A42C687F25741492EFF41EF7527411EA7E8E875F257417C6132557976274174B5159F61F2574114AE4781F07627416F12832C53F25741F9A067F3267727414B59868443F257419D11A51DCB772741394547762EF25741FED478096F782741C1A8A46615F25741F31FD24FEA782741AA60546200F25741F853E3854D7827411283C0FEDFF15741AE47E1FA7E762741F38E537C92F1574129ED0D3E2B762741E5F21FEA84F157411E166A4DDD752741F2D24D3E7EF15741956588C329752741E3C7989372F15741C520B0129274274160E5D03664F15741C3D32BA53D7427413F575BBD5BF15741083D9BF5387427419B559FD35CF1574108AC1C5A25742741423EE85D61F157415F07CE991774274191ED7C7F63F15741BF0E9C330C7427418F53743C65F15741DD240621067427412731082466F15741378941209C732741713D0A1F71F157412E90A078F17227419031774982F15741E3A59B84897227412CD49AF689F157412575025A32722741DA1B7C1190F15741832F4C060A72274189D2DE4095F15741A089B081E77127417E8CB94F99F15741D49AE61DB8712741DA1B7C759BF157418104C50F8B7127413D0AD7FB9EF15741ED0DBE106271274160764F72A3F1574146B6F33D1971274161325514AFF15741780B24681571274187A757C2AFF157417CF2B030127127410EBE3055B0F1574117D9CE770F71274167D5E7CEB0F15741674469AFEE7027414C3789A9B6F157415839B448DC702741107A366BB8F157411CEBE2D6B670274132E6AEA5BBF157411B0DE08D9770274148E17A58BDF15741022B87F67F70274127C2861FC0F1574126E4837E6D7027413CBD52D2C2F15741575BB1FF49702741C520B04EC9F15741A9A44EE02570274158CA32C4CFF1574132E6AEE5187027412F6EA341D2F157415227A0290370274144696FC4D6F15741E2581737FE6F2741363CBDAAD7F15741A779C769AF6F27416D567DBEE5F15741226C78DAA86F274158A835DDE6F157416E3480D79D6F274108AC1CCEE8F15741CB10C7FA896F2741FB3A7042EDF1574129ED0D1E6C6F2741FC1873D7F3F1574157EC2F1B616F2741F54A59CAF5F15741A2B437D8486F27415839B4E0F9F1574129CB10E7396F27417CF2B0FCFCF157418A8EE4920D6F2741014D844506F2574107CE19F1076F274151DA1B4008F2574126530523FC6E2741D0B359890BF25741BE3099CAE46E27415F29CB5812F25741849ECD4ABC6E2741516B9ADB1AF2574100917EDB986E274197900F5622F25741DE0209AA946E274158CA324C23F25741B4C8769E8E6E274160E5D0A624F25741D200DE427F6E274197900F2629F2574186C95421716E2741211FF4402DF257414A0C028B6E6E274155C1A8E42DF2574132772D41686E2741AC1C5A5C2FF25741764F1E56516E2741728A8EF834F25741865AD39C1A6E274187A7571A42F257419FABAD580A6E2741A4DFBE0E46F257410BB5A679F86D2741E10B93594AF25741849ECD0AF46D27415E4BC87B4BF25741AED85FB6EC6D2741304CA6464CF257417CF2B010C86D2741B8AF034750F257419A779CC2A86D2741B8AF03B353F25741F085C9D49C6D27414D840DF354F25741EC51B85E976D27418F5374A055F2574188635D7C886D2741832F4CA257F257414DF38E73806D274169006F2D59F25741D7A3701D7D6D27413BDF4FD559F25741AED85F96746D274105A3927E5BF257416891ED9C686D2741143FC60C5EF25741B81E854B596D2741637FD92561F257410E2DB2FD486D274157EC2F7B64F2574129CB1007466D2741FE43FA1965F257415BB1BF4C446D27416ADE717A65F257419FCDAA2F356D2741E3A59BE069F2574112143F86196D2741C74B37AD71F25741CFF753830B6D274173D712B275F257417424973FFD6C2741B6F3FDA879F25741105839D4F26C2741E8D9AC0E7BF25741D7A3701DEE6C274166F7E4AD7BF25741F9A067F3E26C2741CB10C72A7DF257416B9A779CDE6C27411DC9E5C77DF257415F984C95D16C274113F241777FF25741AB3E575BCE6C274107F016E07FF25741A69BC420CC6C27413108AC3C80F25741A4DFBEAEC66C2741E3361A2C81F25741A1F831A6BD6C27416C787ABD82F25741BC0512F4B76C2741D9CEF7AB83F25741166A4D93AE6C27416C787ABD85F2574130BB274F966C274172F90FCD8BF2574127A08970836C27410A68222090F2574101DE02A97B6C2741341136C091F25741DFE00B33776C27411B9E5E6D92F25741E2C798DB746C2741B7D100FE92F257419D802622736C27416B9A776C93F25741228E75D16E6C2741789CA26F94F257410F0BB566826C2741A4703DB697F25741508D972E9E6C2741A4DFBE129AF25741F085C914AE6C2741F90FE95B9AF25741AF25E423BE6C27412C6519369BF25741B7627F19CC6C2741ACADD87F9CF2574173D712B2D66C2741B30C71009EF25741933A01CDDC6C2741547424AF9FF257410F0BB566DF6C2741EA95B250A1F2574105341116E06C274189D2DE58A4F25741DA1B7C81DC6C2741711B0D28A7F257415E4BC8E7D36C2741D6C56DACA9F25741956588C3D16C2741C2172677ABF257418E75711BD46C2741C976BEFBACF257415BB1BF0CEC6C274100917E07B2F25741F46C56DD156D2741D200DEE6B6F25741A9A44E00496D27411B0DE0D5BAF257413EE8D96C336E2741780B244CC6F25741B81E856B8D6E27412C6519CACDF25741068195A3C96E2741713D0A03D3F25741053411B6986F274132772D51E9F25741333333D3CC6F2741C05B20EDEEF25741F853E345F76F27413F355EEEF3F25741B6F3FDF41F702741DC4603B8F8F25741D3DEE0EB5E70274111C7BAF401F35741AA82518979702741C442ADB505F357416891EDDCAC70274124B9FCC30CF35741742497FF0E712741A1D6348316F35741CE19511A20712741ECC0391B18F3574160764FBE0B7227418351494D2DF35741F0A7C68BB672274150FC184B39F35741F697DD330A73274158A835553DF35741B98D0630207427412B87164D41F357414B59863821752741F54A59C635F35741
30	CX	CXA	CROIX D'ARGENT	CROIX D'ARGENT	01060000206A08000001000000010300000001000000490100004FAF9405177E2741C1A8A456D6F257417DAEB642B87E2741CA54C1A0C6F2574142CF6695D97E2741F2B0507BC3F2574175931824F37E274112A5BD21C0F25741986E1203037F274132772DC9B9F25741098A1F230C7F2741CBA1458EB3F25741BADA8A5D157F2741371AC013B1F25741355EBA09297F2741AAF1D2A9AFF2574189416025C27F274174249713A6F25741CB10C79A4B8027414260E5249AF2574198DD93C7867F27418BFD65036BF25741363CBDB2787F2741C74B37A965F2574180B740C2757F274188855A8360F25741C6DCB504847F27412BF697014CF257413411369C917F2741FF21FD4E49F257412D431CAB9B7F27410EBE301546F2574117D9CE97A07F2741C0EC9EC042F257419F3C2C14957F27410F0BB56E3CF2574177BE9FDA6D7F2741228E75AD2CF257411283C04A517F2741423EE8851FF2574114AE4701887F2741F01648781CF257412C651982598127415305A3A204F25741668863FDE98127418AB0E1ADECF157410B2428BE9E81274103780BFCE2F15741F2D24DE21C8227415BD3BCF3D3F157414850FCD87F8227419EEFA76ACAF157413A234A9BE58227410F9C33AAC3F15741A54E40331F832741D1915CCAC4F15741C5FEB2BB9D832741A8C64BDBAFF15741516B9A374E842741B81E85A395F1574194F6065FAC8527413D2CD4B697F15741ECC039A3E885274146B6F37D95F157410B24281E708527416F81044156F15741C66D34604C8527414F1E163E48F157419A9999191285274154E3A59B31F15741E86A2B16E4842741FCA9F14221F157419D8026C27E842741696FF0D901F15741AAF1D24D2D842741CCEEC973E8F05741C74B3749808327413411360CB8F05741EC2FBB2702832741787AA5D893F05741F2B0500BFC822741FAEDEB1092F05741F1F44A19EA8227410E4FAFEC8CF05741D0B359F5BA8227413480B7AC80F0574122FDF6B59F8227419BE61DDB7EF05741560E2D72808227418F5374C87CF05741228E75D165822741EA95B2E07AF0574176711B0D628227410681959F7AF0574114AE47C15682274112143FF279F057416DC5FE7248822741E4839E2179F0574199BB961046822741E9482EFF78F057412DB29D4F268227410D71AC1B77F057414F1E16EA0082274192CB7FF874F05741C6DCB584FB81274139D6C5A974F057418E75713BF1812741EA04342574F05741849ECD4ADF8127418F53743473F05741E0BE0EFCCE8127411748506072F05741A4DFBE6EC0812741CA54C1A071F05741789CA263B481274175029A0071F057412497FFF09F812741B30C71F46FF057418716D9EE9C8127410B2428D66FF05741D1915C1E878127413E7958F06EF05741FB3A704E71812741DE718A126EF05741E3A59B04638127418FE4F28B6DF05741C58F31774F812741BF0E9CD36CF057416ADE710A3C812741A4703D266CF057415D6DC53E2A812741234A7B876BF057412CD49A2604812741BD5296416AF0574195658863FF80274110E9B7176AF0574102BC0552E380274168226C2C69F0574163EE5A42CA802741B072685968F05741280F0B55B480274154E3A5A767F05741F8C264EAA48027411826531567F0574145D8F0D47F802741A1F831FA65F05741D5E76AEB79802741AA60545A63F05741EC51B83E738027419B559F8760F05741EB73B5156A802741840D4FE75BF057415B423E68578027414CA60A0255F0574130BB27CF4D802741211FF46851F05741FC1873F7498027415917B7E94FF05741764F1E56448027413D0AD7CF4DF057415305A3B23E8027416A4DF3924BF057412575025A3A802741AAF1D2054AF05741A1F8318637802741ADFA5CC548F057415917B7D134802741AD69DE7947F05741F241CF8630802741E3C798BF44F05741D26F5FA72D8027414E6210C042F0574161C3D32B2B802741D95F76FF40F0574135EF38C52A8027414A7B839340F0574170CE8832288027412497FF643FF057416DC5FEB223802741D200DE663DF057418B6CE7BB1F8027419EEFA7F23BF05741D044D810168027417CF2B04039F05741764F1E9607802741A779C79535F05741C4B12E6EFD7F2741FD87F41733F0574107F01688F37F2741984C15B830F0574197900F1AEF7F274104560ED92FF05741DCD781B3E37F274104E78C742DF05741B22E6EE3D27F27418351497D2AF057418D28ED6DCB7F2741696FF02929F0574146B6F35DB87F27411058393826F0574113F2412FA67F2741F2D24D5A23F05741A1F83146957F27419BE61DD720F057418E06F036817F274154E3A5F31DF05741742497BF777F274182E2C7841CF057417D3F355E6A7F2741F085C9781AF05741F5DBD741467F274166F7E4CD14F0574187A757EA3D7F27411283C05A13F057418048BF9D177F2741386744A90CF05741E17A146E127F27411E166AB10BF0574124287E0C077F2741696FF09D09F0574145D8F014FF7E27417DD0B32908F057415F29CBB0FD7E2741DC4603E807F05741B7D1007EEC7E274117B7D1C404F05741D3DEE06BDB7E274175029AAC01F05741B459F579CA7E2741F6285C97FEEF574155302AC9B97E274104560E95FBEF5741C286A7F7A87E2741A779C785F8EF5741448B6CA7987E27418BFD658BF5EF57413F575BF1887E2741F31FD22FF2EF57419D11A5DD777E27412BF697FDEEEF5741F2B050CB677E27419CC420E0EBEF57414B598638577E27415E4BC8BBE8EF57414CA60AA6467E27414547729DE5EF574188855A53367E27414CA60A7AE2EF5741FAEDEBA00C7E2741AB3E576FDBEF574104C58FD1FB7D2741984C1584D8EF5741CC7F48BFE97D27412D431C6BD5EF574116FBCBAED87D2741D49AE66DD2EF5741C8073D5BC67D27414850FC40CFEF5741107A362BB57D2741A835CD4BCCEF5741AB3E571BA47D2741E3A59B58C9EF5741E71DA7E8917D27417958A839C6EF574136AB3E37807D2741BE30992EC3EF5741DFE00B73677D27419BE61DFBBEEF57414C378961557D2741C21726EFBBEF574193A98231447D2741FE43FAF9B8EF57411AC05B20327D27416EA301F4B5EF5741B98D0670207D2741D8F0F4FAB2EF574160E5D002037D274196438B3CAEEF574148E17A54F17C2741006F8164ABEF57415DDC46C3DE7C27419EEFA75EA8EF5741280F0B75CD7C274194878586A5EF574126530543BA7C2741865AD374A2EF574168B3EA93A87C2741F0A7C68F9FEF5741CE19519A577C274140A4DF2E92EF57413CBD52764A7C2741A835CDF78FEF574113F2416F3D7C2741567DAE8E8DEF5741CCEEC9A3397C27416FF085D98CEF574162105879367C2741107A36338CEF5741A01A2FBD2D7C27412EFF21758AEF574196218EF52B7C2741B84082FA89EF5741D656EC8F2A7C27413B70CEA089EF57414CA60AA6287C2741A1F8310289EF57410C022B07237C274186C9541187EF574140A4DF9E217C27412DB29D8B86EF57414B5986D8207C2741CA54C12486EF5741857CD073207C2741857CD0D785EF57419E5E29EB1F7C27411CEBE24A85EF5741674469AF217C274136AB3E7F83EF574132772DC1227C274140A4DF9282EF5741E0BE0EFC227C2741151DC93D82EF5741A54E4013247C2741FC1873AB81EF5741C442AD89257C27412653050B81EF5741FDF675A01A7C2741E3A59B8880EF5741C3F528DC137C2741C7293A4E80EF574172F90F29147C274180B7402281EF5741D34D6270147C2741A4703D9A81EF57417D3F35BE147C2741A52C437C82EF574100917E7B137C27415F29CB6084EF57416DE7FBC9127C2741BC05125085EF5741BF7D1DB8107C27419FABAD3C86EF5741F2D24D420B7C2741613255FC88EF574104C58F71097C27411CEBE2FA89EF5741F6285CAF057C2741B98D06EC8BEF57411D5A64DB047C2741F2B050B38CEF574145D8F094007C274183C0CA6D90EF57414850FCB8F97B2741454772F598EF5741BEC11706F97B2741EC51B8CE99EF5741BC749398F47B27418E06F0069BEF574140136103F17B27418A8EE4BE9BEF57419C33A274E27B27413B70CE049FEF5741D122DB99D77B274111C7BA7CA1EF5741F9A06753D07B274133C4B12EA3EF574105A392DAC57B2741DE718AC6A5EF5741B81E854BB87B274158A83505A9EF57419FABAD58B57B274194F606E3A9EF5741C976BE5FAC7B2741499D8076ACEF5741CAC3422DA97B27411C7C615AADEF5741C520B092A07B2741EFC9C3D2AFEF5741B9FC8734997B2741A913D00CB2EF574117D9CE578B7B27417CF2B078B6EF5741E63FA45F837B27412063EE16B9EF5741EE5A421E7F7B2741A1F83116BBEF57411D3867C4797B27415E4BC893BDEF574136CD3BEE737B274126E4834EC0EF5741C1CAA185707B2741DE9387D5C1EF57416F8104656C7B2741CA32C4E1C3EF5741E02D9000697B2741CDCCCCACC5EF574197FF907E657B2741F775E0A0C7EF5741BC7493585F7B2741CEAACF65CBEF5741FB3A70AE597B2741508D97E6CEEF5741E02D90204B7B27417FFB3A64D8EF5741F2B050EB457B274117B7D12CDBEF574136AB3ED7447B27417AA52CF3DBEF5741E5F21F323F7B2741371AC0B7DDEF57416519E2583D7B274112143F2ADEEF57417AA52CE33A7B2741D656ECD7DEEF5741304CA6AA387B2741B81E8557DFEF5741C05B20612F7B274146B6F3D9E0EF5741EC2FBB872B7B2741696FF04DE1EF5741984C152C297B27414D158C9AE1EF5741F38E5394237B2741D9CEF72BE2EF5741C1CAA1C5187B274111C7BA5CE3EF5741B98D0630127B2741FA7E6A14E4EF5741F4FDD4F80C7B27411283C0AEE4EF57416ABC7433FC7A274127310884E6EF5741E5D0223BF77A27413B014D0CE7EF5741764F1ED6E47A27416DE7FBE9E8EF5741D42B6539CE7A274138F8C258EBEF574140A4DF3EB67A27411B0DE0EDEDEF574112143FA6B17A2741E0BE0E70EEEF5741BB270FCB997A27412FDD24FAF0EF5741984C15CC847A2741006F8140F3EF574120D26FBF787A27414FAF9495F4EF574103780B84777A2741D656ECE3F4EF574176711B2D737A2741280F0B81F5EF5741394547B2717A274121B072D8F5EF5741E10B9349697A27419FCDAA67F7EF5741A9A44E605C7A27417E1D3803FBEF5741D5E76ACB507A274175029AECFFEF5741736891AD3E7A2741105839780AF05741E63FA49F347A274129ED0DC20DF057410F0BB5E6327A2741014D84390EF057411D3867A4287A27417FD93D3510F05741F085C994227A27418638D64D11F05741BF0E9C73167A274194F6065F13F05741C3D32B050F7A274122FDF68D14F057413108ACBCF879274117D9CE4718F057416DE7FBC9E579274138F8C2541BF05741C1A8A4EEA279274114AE476526F05741933A010D7D792741107A36BB2CF057412BF697DD5B79274166F7E42532F05741FE43FACD55792741DBF97E3E33F057418126C2E6257927410534115A3BF057410AD7A3F022792741AD69DE013CF05741925CFE83DE7827419C33A2F845F05741787AA52CCB782741E71DA7B848F0574166F7E441B8782741C286A7474CF0574102BC05D2B2782741BE9F1A5B4DF057419E5E292B8878274109F9A07F57F05741D49AE6FD81782741EF3845BF58F05741F7065F1827782741A7E8487E69F057418D976EB219782741C976BE436BF05741DC4603580C782741394547C66DF0574132772D8103782741EC2FBB7B70F057411904560EF777274176711B7973F057410EBE3079EB77274136AB3E4F76F0574118265305E6772741C364AA2077F0574196B20CB1E07727414D840DEB77F05741448B6CC7D6772741C1CAA16D79F05741925CFEC3C3772741C6DCB5747DF057417FFB3A10BE7727411FF46C5680F05741CE88D25EB87727417AC7295E83F0574131992A38B5772741E4141D0585F05741AB3E57DBB07727418E75714F87F0574157EC2F1BAD7727412BF6976189F057413BDF4F6DAA77274165AA60908AF0574116FBCB6E9E77274139B4C8DA8EF057417D3F359E9B772741BD5296DD8FF0574161C3D3EB93772741F163CCD992F05741F1F44A598B77274135EF38D595F05741A245B693867727417424978F97F057412EFF217D7F772741E4839E459AF057416D567D8E7C772741FDF675689BF05741143FC65C747727413B70CE709EF057416D567D6E6C772741E3361AB0A1F057411748503C6A772741C976BE97A2F057414703780B6877274141F16394A3F0574190A0F8F1657727412041F103A4F05741F241CF065C772741DDB5846CA5F05741DC68002F5877274126E483FAA5F05741F9A067F3567727413EE8D944A6F05741865AD37C547727416F1283E4A6F05741C286A7174F772741029A08A7A8F05741E561A1D6487727415E4BC8AFAAF05741F241CFC63F7727413E7958D8ADF05741992A18153B77274175029ACCAEF05741711B0D4037772741BF0E9C87AFF05741D9CEF753257727413F355EFEB2F0574169006F011677274169006F05B6F0574162A1D6F4FA762741C1A8A492BBF057414A7B836FF27627418C4AEA58BDF057417A36ABBEE47627419A999979C0F05741C364AA00D276274155C1A8D8C4F0574124B9FCA7B4762741E10B93B1CBF057418195430BAB7627417AA52C07CEF0574162A1D674A0762741053411C6D0F057411895D469847627419487856ED6F05741696FF0E5467627418B6CE7F3E2F057415EBA498C1A762741EB73B5E5EBF05741CB10C77AE37527416744697FF7F05741FCA9F1B2B57527417CF2B09801F15741E10B93896D752741E25817F311F157419CC420505975274103098A9F16F1574194F606BF54752741A69BC49C17F15741A301BCC55175274127A0891018F157414FAF944545752741CE88D2321AF15741B37BF2D040752741DB8AFDF51AF15741F163CC7D2D752741705F07FA1DF15741E10B93E9287527417FFB3AC41EF157417F6ABC34267527416C09F9801FF15741ED0DBE501D752741D0B3595D21F15741A69BC480FB742741304CA6DA2AF15741B515FB4BCD7427416666663A38F157416B9A773CAC7427416FF085BD41F157419E5E294BA97427413E7958B442F15741E8D9AC1AA674274111363CB943F157416C09F9C0A4742741091B9E2244F15741A857CA127A742741BDE314CD4DF157413B70CE0858742741A54E409F55F15741C3D32BA53D7427413F575BBD5BF15741C520B0129274274160E5D03664F15741956588C329752741E3C7989372F157411E166A4DDD752741F2D24D3E7EF1574129ED0D3E2B762741E5F21FEA84F15741AE47E1FA7E762741F38E537C92F15741F853E3854D7827411283C0FEDFF15741F31FD24FEA782741AA60546200F257414FAF9405177E2741C1A8A456D6F25741
31	PR	PRE	PRES D'ARENES	PRES D'ARENE	01060000206A08000001000000010300000001000000CA00000040A4DF9E48862741075F98C0BAF25741CFF753039586274174469462B6F257411973D732B68627417FD93DCDAAF25741840D4FEF27872741234A7B3F97F25741BB270FAB72872741D3BCE3188AF257410DE02DB0C58727414A7B83076DF25741000000A0D7872741D6C56D745DF257412497FF50E887274183C0CA4158F25741B30C710C07882741865AD3A053F25741029A08BB378827418BFD650B4EF25741FED478697A8827417424975348F257418C4AEA64E88A274119E2589B20F257418048BF9DAF8B2741A089B06D14F2574162A1D6F4218D27416A4DF3CA02F2574126C28667888D27412041F13301F257418638D6E5FA8D274150FC184700F2574191ED7C1F248E2741448B6CB326F25741B6847CB02C8E27410B4625E92DF25741E09C11656D8E2741CDCCCCD430F25741827346B49D8E2741F0A7C61B25F257414ED1911CA18E27410F0BB50611F257417B14AEA7A58E2741BB270F4B03F25741742497BFB38E27412A3A92AB02F25741D0D5564CC38E27417958A85101F257412AA91330CF8E2741295C8F6AFFF15741A7E8480ED78E2741F9A0672FFDF1574107F01688DE8E2741A9A44EACFAF157410BB5A6F9E08E27411C7C61AAF7F157417C613215DF8E27414FAF9455F5F15741BF7D1D98D98E2741EA95B280F3F1574114AE47610E8F2741C5FEB2A7F1F157410AD7A3D0428F2741083D9B25EEF15741933A01CD03912741304CA632B7F15741C05B20A1C59027417D3F35C2B2F15741BC749398A3902741A01A2F65B0F157414260E5B09D902741736891F1AFF1574197900FFA8B902741EB73B599AEF15741250681358990274119E25853AEF15741A1D6346F859027417E1D38F3ADF15741BB270FAB72902741014D84C1ABF157412497FF706790274196B20C29AAF157418F537464579027412E90A068A7F1574185EB51185390274199BB96A8A6F15741280F0B5548902741FCA9F176A4F15741287E8C39409027413480B7C0A2F15741AED85FF637902741D93D798CA0F157419CA2235931902741D200DEB69EF1574188855A732A902741386744559CF15741234A7B6322902741AE47E14E99F15741A1F831A61E90274198DD937397F157414B5986781A90274148BF7D9996F15741A52C43BCE88F27411EA7E80491F1574106819543978F2741516B9AC787F15741AE47E17A3E8F2741FD87F48F7DF15741C7BAB82D168F2741C58F31E378F157413B70CE28038F27414D158CA676F15741234A7BE3EB8E2741FBCBEE6974F15741567DAEF6CE8E2741C1CAA1BD71F157411E166A4DB38E274172F90F496FF157416ABC7413828E2741E3A59BE86BF157417C6132556F8E274145D8F0186AF1574161C3D3CB668E2741D712F28D69F157416DC5FE32518E27416F81041D68F1574155302A09128E27411895D4D163F157411CEBE216AF8D274197900F2E5DF157413480B7A06C8D27412BF6971D58F157419CC420D0098D274183C0CA9551F157411CEBE2D6F28C2741E926312050F15741D50968C2DE8C274144FAEDF34EF15741CE19513ABF8C274129CB108B4AF157413FC6DC55BD8C274148BF7D454AF15741B003E7ECAB8C27418D976EC247F15741713D0A97A28C274103098A6B46F1574194F6063F988C2741D3DEE0F344F15741A167B36A8F8C2741F775E0B443F1574188855A53838C2741C1A8A44A42F157417E1D38876D8C27412E90A09C3FF157411A51DA1B588C2741014D84F93CF15741B98D0630428C27414B5986503AF15741832F4C462D8C2741A9A44EC837F15741CB10C7FA268C2741EEEBC01537F15741E9482E3F168C2741091B9E6E35F1574131992A78FE8B2741BF7D1D1833F157413C4ED171E68B27419FABADCC30F157417FFB3A50CE8B27413B014DD02EF15741211FF48CB48B2741840D4FBB2CF157418D976E529F8B2741A60A462D2BF15741D712F281748B27411904565E28F157418F5374645A8B2741903177A926F1574129CB10C73F8B27415AF5B9F624F157413B70CEC8248B27410534113623F15741D3DEE02B0B8B2741BDE3148921F157418D28EDEDEF8A27416D567DCE1FF1574146257522C98A27419A779C4A1DF15741006F81E4AD8A2741DC4603901BF157419BE61D47938A2741386744DD19F157414F1E160A798A274144696F3018F157410D71ACAB5D8A27411B0DE06D16F15741508D974E438A2741BC0512C014F157410BB5A679138A2741AA8251B111F157413108AC5CF9892741FDF6750410F15741E9482EFFDD892741D49AE6510EF1574158CA3224C1892741EC51B8CA0CF15741CC7F489FBA892741CBA145860CF15741C7BAB8CDA5892741A1D6348B0BF157413F575B31808927412FDD24FE09F1574111C7BA9863892741B1E1E99D08F15741D712F2C1478927419487855A07F157414D158CEA2B892741C05B200D06F15741333333730F8927411B0DE0C104F15741857CD053C2882741C3D32B3D01F1574154E3A5FBA68827419D11A5E1FFF05741295C8F428B882741C66D3478FEF05741280F0B557C88274112A5BDB5FDF0574175029A086F8827418AB0E101FDF057415DFE431A618827419E5E292FFCF0574161C3D32B548827410F9C335AFBF05741DDB5845C458827410E2DB279FAF05741F31FD2EF39882741F7E461BDF9F0574129ED0D9E2C88274148BF7DB1F8F05741DE718A4E208827411B9E5EC9F7F05741CDCCCCCC0688274186C954CDF5F05741DE0209CAED8727419E5E29BFF3F057410C022BA7D48727414BEA04B0F1F0574197FF903EBD872741D5E76A3FEFF0574188F4DB77A68727413108ACECECF05741FDF675806F8727418BFD65B3E7F057414ED191BC578727418C4AEA90E5F057413CBD52F63E872741E7FBA949E3F05741FFB27B9227872741E2581727E1F0574196438BCC0E872741D044D8E4DEF05741CF66D5C7F68627411E166AB5DCF05741F2D24DC2DE86274124B9FC77DAF05741637FD99DC786274119E2584BD8F05741083D9B75AE8627417AA52CE3D5F05741EA0434D19686274155C1A8B8D3F05741D5E76A4B7F8627412C651976D1F057416E34805760862741EE7C3F59CEF0574185EB51784E8627411B9E5E79CCF05741C8073DFB2C862741053411CAC8F057417B14AEC722862741F9A0679BC7F05741B37BF2F0168627419BE61D3BC6F05741C05B20010F862741696FF045C5F05741A1D6346FE28527410DE02D54C0F05741EB73B5D5D5852741E0BE0EC8BEF05741705F07CEC08527418AB0E161BCF057412C651962AA8527416F8104B9B9F0574114D0445895852741F31FD22FB7F0574104560E2D7F852741D49AE691B4F05741956588A369852741ABCFD50EB2F057410C93A94246852741FE65F724AEF0574177BE9FFA30852741637FD9B9ABF05741C1A8A4AE198527410EBE3011A9F05741DB8AFD4504852741E3361A9CA6F057419D11A57DEC842741075F9830A4F05741AB3E57DBD484274107F01628A2F05741C898BB76BB842741933A01FD9FF05741C2172653A384274152499DE09DF05741190456EE89842741948785B29BF05741211FF42C71842741166A4DBB99F057411E166A2D5884274130BB27E397F057417B832F4C3E842741C66D34F095F057414D158C8A24842741ECC039F793F05741304CA6AA0B84274195D4091892F05741E6AE2524EC83274169006FD98FF057415BB1BF4CD98327413D0AD77B8EF057416F8104E5D1832741508D970A8EF057415F984C35C3832741DFE00B238DF0574195D409C8B4832741FDF675648CF05741FC1873179F8327412DB29D7B8BF057411F85EBB197832741AED85F2E8BF05741143FC63C7B832741E6AE25088AF057414A7B830F658327418E75715789F057412D431C6B5D832741A60A461D89F057417D3F355E47832741BADA8A7188F05741BF7D1D983E8327412F6EA31D88F05741B515FBEB30832741643BDF6F87F0574160764FDE2183274120D26FAB86F057414FAF94E506832741CE88D24685F05741B515FBABEB822741378941D483F05741E2E99552D4822741EEEBC05D82F05741B1E1E975BB822741075F98B480F05741D0B359F5BA8227413480B7AC80F05741F1F44A19EA8227410E4FAFEC8CF05741F2B0500BFC822741FAEDEB1092F05741EC2FBB2702832741787AA5D893F05741C74B3749808327413411360CB8F05741AAF1D24D2D842741CCEEC973E8F057419D8026C27E842741696FF0D901F15741E86A2B16E4842741FCA9F14221F157419A9999191285274154E3A59B31F15741C66D34604C8527414F1E163E48F157410B24281E708527416F81044156F15741ECC039A3E885274146B6F37D95F1574196B20CD107862741C58F3113B7F1574111363C3D30862741265305F3E8F157411895D4294486274190A0F8890AF257416F1283C0448627418126C2AE24F25741C3F528FC4C86274124287EC857F257410BB5A67949862741D509682A6AF25741F7E461A14B862741F31FD25FA8F2574140A4DF9E48862741075F98C0BAF25741
\.


--
-- Data for Name: table_for_form; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.table_for_form (gid, titre, test, test_not_null_only, test_empty_value_only, geom) FROM stdin;
1	test	{A06}	{A07}	{A08}	01010000206A080000BF599997AB39254116EA7038651D5841
\.


--
-- Data for Name: table_for_relationnal_value; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.table_for_relationnal_value (gid, code, label) FROM stdin;
1	A06	Flower
2	A07	water
3	A08	Tree
\.


--
-- Data for Name: text_widget_point_edit; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.text_widget_point_edit (id, point_name, geom) FROM stdin;
1	Widget_test	0101000020E6100000FBC6B025B7E10E4098DF5229E9CC4540
\.


--
-- Data for Name: time_manager; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.time_manager (gid, test_date, geom) FROM stdin;
1	2007-01-01	01010000206A08000072ECD2D4C065E9404740013F7A9D2B41
2	2012-01-01	01010000206A080000882F5B0432140441836413BEEF982B41
3	2017-01-01	01010000206A08000057105E3098401241FAAC37BCDA8F2B41
\.


--
-- Data for Name: townhalls_pg; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.townhalls_pg (id, geom, name) FROM stdin;
2	01010000206A080000B070BFB387622741CBBAE76B05F95741	Mairie annexe Hauts de Massane
3	01010000206A080000303A03F13F842741E7D9AA80C5EF5741	Antenne Mairie de lattes
4	01010000206A08000089DFAAF6EE7F2741F4D5A7D391F65741	Mairie annexe Aiguelongue
5	01010000206A080000EB419CCDE2A627411E3C63EB42F95741	Mairie de Jacou
6	01010000206A08000065E565E565732741490076935BF35741	Mairie de proximité François Villon
7	01010000206A08000052995D46639F27416CEF124319FB5741	Hôtel de Ville - Château de Bocaud
10	01010000206A08000006BA48A8F5812741849BABACE3F15741	Mairie de proximité Tastavin
11	01010000206A080000553A90666B692741EAC7AC16BCF55741	Mairie de proximité Mosson
12	01010000206A0800000017CC451FA427412DBB27DD35F05741	Mairie de Lattes
15	01010000206A08000060C2CEE4FCB2274108AC96DF61F45741	Mairie de Fabrègues
17	01010000206A080000D575499D665C274182DB1149E1F15741	Mairie de Lavérune
18	01010000206A08000023CC2413098627419522FA78C5F85741	Mairie
20	01010000206A0800006CBECA5E30A12741A864FF0BB7F85741	Mairie du Crès
21	01010000206A0800009A11D11B525F27419EC4CD2838EF5741	Mairie de Saint-Jean-de-Védas
23	01010000206A0800005A14FFF6E07F27410CCDC3B640FA5741	\N
26	01010000206A0800000D5D7691554F27418CE75ADCE4F85741	Mairie de Grabels
\.


--
-- Data for Name: tramway_lines; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.tramway_lines (id_line, geom) FROM stdin;
1	01020000206A08000002000000F722C8E2F0772741BF798FAEAAFB5741976BC742154E2741085C8F5AE2F45741
2	01020000206A08000002000000A5B2716D583727413CBFE4A30CF85741BEC01D387A882741C4688F7ECAF75741
\.


--
-- Data for Name: tramway_pivot; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.tramway_pivot (id_pivot, id_line, id_stop) FROM stdin;
1	1	1
2	1	2
3	1	3
4	2	2
5	2	4
6	2	5
\.


--
-- Data for Name: tramway_stops; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.tramway_stops (id_stop, geom) FROM stdin;
1	01010000206A0800001BC9724DE876274184CEE49B89FB5741
3	01010000206A08000074C51CD81D4F2741A6B1E4E3F2F45741
4	01010000206A08000070B9714DE5382741D9143A2D1DF85741
5	01010000206A080000D01373EDF5872741C4688F7ECAF75741
2	01010000206A08000029101D782B60274100143A91EBF75741
\.


--
-- Data for Name: triple_geom; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.triple_geom (id, title, geom, geom_l, geom_p) FROM stdin;
1	P2	0101000020E61000009BAFF31C24420F40B0F20C103ECD4540	0102000020E610000003000000F831609D15230F40B6C8ADA872CB45400D2267EAD5350F40CA0ED2F6E3CE4540CD98B4D8D86F0F40013F5C530CCE4540	0103000020E610000001000000040000008CEAFEE73F350F40CE5B430568D2454027CEAF4A464D0F40F4234A1D77D045405E04E2147F7E0F402E327583F7D145408CEAFEE73F350F40CE5B430568D24540
\.


--
-- Data for Name: xss; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.xss (id, geom, description) FROM stdin;
1	01010000206A0800000D9D9921FD822741B3C56B7B4DF45741	<script>alert('XSS')</script>
2	01010000206A0800003C971843589327416B44F41A5BF45741	<iframe width="300" height="200" src="https://www.openstreetmap.org/export/embed.html?bbox=-0.004017949104309083%2C51.47612752641776%2C0.00030577182769775396%2C51.478569861898606&layer=mapnik"></iframe>
\.


--
-- Name: attribute_table_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.attribute_table_id_seq', 4, true);


--
-- Name: birds_areas_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.birds_areas_id_seq', 14, true);


--
-- Name: birds_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.birds_id_seq', 8, true);


--
-- Name: birds_spots_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.birds_spots_id_seq', 5, true);


--
-- Name: children_layer_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.children_layer_id_seq', 3, true);


--
-- Name: data_integers_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.data_integers_id_seq', 10, true);


--
-- Name: data_trad_en_fr_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.data_trad_en_fr_id_seq', 4, true);


--
-- Name: data_uids_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.data_uids_id_seq', 5, true);


--
-- Name: dnd_form_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.dnd_form_geom_id_seq', 1, true);


--
-- Name: dnd_form_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.dnd_form_id_seq', 1, true);


--
-- Name: dnd_popup_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.dnd_popup_id_seq', 2, true);


--
-- Name: double_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.double_geom_id_seq', 1, true);


--
-- Name: edition_layer_embed_child_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.edition_layer_embed_child_id_seq', 2, true);


--
-- Name: edition_layer_embed_line_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.edition_layer_embed_line_id_seq', 2, true);


--
-- Name: edition_layer_embed_point_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.edition_layer_embed_point_id_seq', 3, true);


--
-- Name: end2end_form_edition_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.end2end_form_edition_geom_id_seq', 1, false);


--
-- Name: end2end_form_edition_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.end2end_form_edition_id_seq', 4, true);


--
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.filter_layer_by_user_edition_only_gid_seq', 3, true);


--
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.filter_layer_by_user_gid_seq', 3, true);


--
-- Name: form_advanced_point_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_advanced_point_id_seq', 1, false);


--
-- Name: form_edition_all_fields_types_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_all_fields_types_id_seq', 1, false);


--
-- Name: form_edition_line_2154_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_line_2154_id_seq', 1, false);


--
-- Name: form_edition_line_3857_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_line_3857_id_seq', 1, false);


--
-- Name: form_edition_line_4326_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_line_4326_id_seq', 1, false);


--
-- Name: form_edition_point_2154_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_point_2154_id_seq', 1, false);


--
-- Name: form_edition_point_3857_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_point_3857_id_seq', 1, false);


--
-- Name: form_edition_point_4326_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_point_4326_id_seq', 1, false);


--
-- Name: form_edition_polygon_2154_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_polygon_2154_id_seq', 1, false);


--
-- Name: form_edition_polygon_3857_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_polygon_3857_id_seq', 1, false);


--
-- Name: form_edition_polygon_4326_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_polygon_4326_id_seq', 1, false);


--
-- Name: form_edition_snap_control_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_snap_control_id_seq', 1, false);


--
-- Name: form_edition_snap_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_snap_id_seq', 2, true);


--
-- Name: form_edition_snap_line_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_snap_line_id_seq', 2, true);


--
-- Name: form_edition_snap_point_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_snap_point_id_seq', 3, true);


--
-- Name: form_edition_snap_polygon_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_snap_polygon_id_seq', 2, true);


--
-- Name: form_edition_upload_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_upload_id_seq', 2, true);


--
-- Name: form_edition_upload_webdav_child_attachments_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_upload_webdav_child_attachments_id_seq', 2, true);


--
-- Name: form_edition_upload_webdav_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_upload_webdav_geom_id_seq', 1, false);


--
-- Name: form_edition_upload_webdav_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_upload_webdav_id_seq', 1, false);


--
-- Name: form_edition_upload_webdav_parent_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_upload_webdav_parent_geom_id_seq', 1, true);


--
-- Name: form_edition_vr_dd_list_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_vr_dd_list_id_seq', 2, true);


--
-- Name: form_edition_vr_list_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_vr_list_id_seq', 4, true);


--
-- Name: form_edition_vr_point_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_edition_vr_point_id_seq', 1, false);


--
-- Name: form_filter_child_bus_stops_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_filter_child_bus_stops_id_seq', 5, true);


--
-- Name: form_filter_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.form_filter_id_seq', 4, true);


--
-- Name: huge_table_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.huge_table_id_seq', 5000, true);


--
-- Name: layer_legend_categorized_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.layer_legend_categorized_id_seq', 2, true);


--
-- Name: layer_legend_single_symbol_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.layer_legend_single_symbol_id_seq', 1, true);


--
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.layer_with_no_filter_gid_seq', 1, true);


--
-- Name: lookup_1_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.lookup_1_id_seq', 100, true);


--
-- Name: lookup_2_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.lookup_2_id_seq', 10, true);


--
-- Name: many_bool_formats_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.many_bool_formats_id_seq', 1, true);


--
-- Name: many_date_formats_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.many_date_formats_id_seq', 1, false);


--
-- Name: natural_areas_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.natural_areas_id_seq', 3, true);


--
-- Name: parent_layer_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.parent_layer_id_seq', 2, true);


--
-- Name: revert_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.revert_geom_id_seq', 5, true);


--
-- Name: selection_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.selection_id_seq', 33, true);


--
-- Name: selection_polygon_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.selection_polygon_id_seq', 2, true);


--
-- Name: shop_bakery_id_0_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.shop_bakery_id_0_seq', 25, true);


--
-- Name: single_wms_baselayer_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_baselayer_id_seq', 1, true);


--
-- Name: single_wms_baselayer_two_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_baselayer_two_id_seq', 1, true);


--
-- Name: single_wms_lines_group_as_layer_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_lines_group_as_layer_id_seq', 2, true);


--
-- Name: single_wms_lines_group_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_lines_group_id_seq', 2, true);


--
-- Name: single_wms_lines_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_lines_id_seq', 4, true);


--
-- Name: single_wms_points_group_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_points_group_id_seq', 2, true);


--
-- Name: single_wms_points_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_points_id_seq', 6, true);


--
-- Name: single_wms_polygons_group_as_layer_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_polygons_group_as_layer_id_seq', 2, true);


--
-- Name: single_wms_polygons_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_polygons_id_seq', 3, true);


--
-- Name: single_wms_tiled_baselayer_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.single_wms_tiled_baselayer_id_seq', 1, true);


--
-- Name: sousquartiers_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.sousquartiers_id_seq', 31, true);


--
-- Name: table_for_form_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.table_for_form_gid_seq', 1, true);


--
-- Name: table_for_relationnal_value_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.table_for_relationnal_value_gid_seq', 3, true);


--
-- Name: text_widget_point_edit_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.text_widget_point_edit_id_seq', 1, true);


--
-- Name: time_manager_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.time_manager_gid_seq', 3, true);


--
-- Name: townhalls_EPSG2154_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects."townhalls_EPSG2154_id_seq"', 27, true);


--
-- Name: tramway_lines_id_tram_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.tramway_lines_id_tram_seq', 2, true);


--
-- Name: tramway_pivot_id_pivot_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.tramway_pivot_id_pivot_seq', 6, true);


--
-- Name: tramway_stops_id_stop_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.tramway_stops_id_stop_seq', 5, true);


--
-- Name: triple_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.triple_geom_id_seq', 1, true);


--
-- Name: xss_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.xss_id_seq', 2, true);


--
-- Name: attribute_table attribute_table_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.attribute_table
    ADD CONSTRAINT attribute_table_pkey PRIMARY KEY (id);


--
-- Name: birds_areas birds_areas_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.birds_areas
    ADD CONSTRAINT birds_areas_pkey PRIMARY KEY (id);


--
-- Name: birds birds_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.birds
    ADD CONSTRAINT birds_pkey PRIMARY KEY (id);


--
-- Name: birds_spots birds_spots_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.birds_spots
    ADD CONSTRAINT birds_spots_pkey PRIMARY KEY (id);


--
-- Name: children_layer children_layer_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.children_layer
    ADD CONSTRAINT children_layer_pkey PRIMARY KEY (id);


--
-- Name: data_integers data_integers_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.data_integers
    ADD CONSTRAINT data_integers_pkey PRIMARY KEY (id);


--
-- Name: data_trad_en_fr data_trad_en_fr_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.data_trad_en_fr
    ADD CONSTRAINT data_trad_en_fr_pkey PRIMARY KEY (id);


--
-- Name: data_uids data_uids_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.data_uids
    ADD CONSTRAINT data_uids_pkey PRIMARY KEY (id);


--
-- Name: dnd_form_geom dnd_form_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.dnd_form_geom
    ADD CONSTRAINT dnd_form_geom_pkey PRIMARY KEY (id);


--
-- Name: dnd_form dnd_form_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.dnd_form
    ADD CONSTRAINT dnd_form_pkey PRIMARY KEY (id);


--
-- Name: dnd_popup dnd_popup_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.dnd_popup
    ADD CONSTRAINT dnd_popup_pkey PRIMARY KEY (id);


--
-- Name: double_geom double_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.double_geom
    ADD CONSTRAINT double_geom_pkey PRIMARY KEY (id);


--
-- Name: edition_layer_embed_child edition_layer_embed_child_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.edition_layer_embed_child
    ADD CONSTRAINT edition_layer_embed_child_pkey PRIMARY KEY (id);


--
-- Name: edition_layer_embed_line edition_layer_embed_line_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.edition_layer_embed_line
    ADD CONSTRAINT edition_layer_embed_line_pkey PRIMARY KEY (id);


--
-- Name: edition_layer_embed_point edition_layer_embed_point_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.edition_layer_embed_point
    ADD CONSTRAINT edition_layer_embed_point_pkey PRIMARY KEY (id);


--
-- Name: end2end_form_edition_geom end2end_form_edition_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.end2end_form_edition_geom
    ADD CONSTRAINT end2end_form_edition_geom_pkey PRIMARY KEY (id);


--
-- Name: end2end_form_edition end2end_form_edition_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.end2end_form_edition
    ADD CONSTRAINT end2end_form_edition_pkey PRIMARY KEY (id);


--
-- Name: filter_layer_by_user_edition_only filter_layer_by_user_edition_only_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user_edition_only
    ADD CONSTRAINT filter_layer_by_user_edition_only_pkey PRIMARY KEY (gid);


--
-- Name: filter_layer_by_user filter_layer_by_user_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user
    ADD CONSTRAINT filter_layer_by_user_pkey PRIMARY KEY (gid);


--
-- Name: form_advanced_point form_advanced_point_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_advanced_point
    ADD CONSTRAINT form_advanced_point_pkey PRIMARY KEY (id);


--
-- Name: form_edition_all_fields_types form_edition_all_fields_types_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_all_fields_types
    ADD CONSTRAINT form_edition_all_fields_types_pkey PRIMARY KEY (id);


--
-- Name: form_edition_line_2154 form_edition_line_2154_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_line_2154
    ADD CONSTRAINT form_edition_line_2154_pkey PRIMARY KEY (id);


--
-- Name: form_edition_line_3857 form_edition_line_3857_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_line_3857
    ADD CONSTRAINT form_edition_line_3857_pkey PRIMARY KEY (id);


--
-- Name: form_edition_line_4326 form_edition_line_4326_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_line_4326
    ADD CONSTRAINT form_edition_line_4326_pkey PRIMARY KEY (id);


--
-- Name: form_edition_point_2154 form_edition_point_2154_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_point_2154
    ADD CONSTRAINT form_edition_point_2154_pkey PRIMARY KEY (id);


--
-- Name: form_edition_point_3857 form_edition_point_3857_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_point_3857
    ADD CONSTRAINT form_edition_point_3857_pkey PRIMARY KEY (id);


--
-- Name: form_edition_point_4326 form_edition_point_4326_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_point_4326
    ADD CONSTRAINT form_edition_point_4326_pkey PRIMARY KEY (id);


--
-- Name: form_edition_polygon_2154 form_edition_polygon_2154_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_polygon_2154
    ADD CONSTRAINT form_edition_polygon_2154_pkey PRIMARY KEY (id);


--
-- Name: form_edition_polygon_3857 form_edition_polygon_3857_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_polygon_3857
    ADD CONSTRAINT form_edition_polygon_3857_pkey PRIMARY KEY (id);


--
-- Name: form_edition_polygon_4326 form_edition_polygon_4326_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_polygon_4326
    ADD CONSTRAINT form_edition_polygon_4326_pkey PRIMARY KEY (id);


--
-- Name: form_edition_snap_control form_edition_snap_control_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_control
    ADD CONSTRAINT form_edition_snap_control_pkey PRIMARY KEY (id);


--
-- Name: form_edition_snap_line form_edition_snap_line_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_line
    ADD CONSTRAINT form_edition_snap_line_pkey PRIMARY KEY (id);


--
-- Name: form_edition_snap form_edition_snap_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap
    ADD CONSTRAINT form_edition_snap_pkey PRIMARY KEY (id);


--
-- Name: form_edition_snap_point form_edition_snap_point_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_point
    ADD CONSTRAINT form_edition_snap_point_pkey PRIMARY KEY (id);


--
-- Name: form_edition_snap_polygon form_edition_snap_polygon_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_snap_polygon
    ADD CONSTRAINT form_edition_snap_polygon_pkey PRIMARY KEY (id);


--
-- Name: form_edition_upload form_edition_upload_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload
    ADD CONSTRAINT form_edition_upload_pkey PRIMARY KEY (id);


--
-- Name: form_edition_upload_webdav_child_attachments form_edition_upload_webdav_child_attachments_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav_child_attachments
    ADD CONSTRAINT form_edition_upload_webdav_child_attachments_pkey PRIMARY KEY (id);


--
-- Name: form_edition_upload_webdav_geom form_edition_upload_webdav_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav_geom
    ADD CONSTRAINT form_edition_upload_webdav_geom_pkey PRIMARY KEY (id);


--
-- Name: form_edition_upload_webdav_parent_geom form_edition_upload_webdav_parent_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav_parent_geom
    ADD CONSTRAINT form_edition_upload_webdav_parent_geom_pkey PRIMARY KEY (id);


--
-- Name: form_edition_upload_webdav form_edition_upload_webdav_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_upload_webdav
    ADD CONSTRAINT form_edition_upload_webdav_pkey PRIMARY KEY (id);


--
-- Name: form_edition_vr_dd_list form_edition_vr_dd_list_code_key; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_dd_list
    ADD CONSTRAINT form_edition_vr_dd_list_code_key UNIQUE (code);


--
-- Name: form_edition_vr_dd_list form_edition_vr_dd_list_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_dd_list
    ADD CONSTRAINT form_edition_vr_dd_list_pkey PRIMARY KEY (id);


--
-- Name: form_edition_vr_list form_edition_vr_list_code_key; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_list
    ADD CONSTRAINT form_edition_vr_list_code_key UNIQUE (code);


--
-- Name: form_edition_vr_list form_edition_vr_list_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_list
    ADD CONSTRAINT form_edition_vr_list_pkey PRIMARY KEY (id);


--
-- Name: form_edition_vr_point form_edition_vr_point_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_edition_vr_point
    ADD CONSTRAINT form_edition_vr_point_pkey PRIMARY KEY (id);


--
-- Name: form_filter_child_bus_stops form_filter_child_bus_stops_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_filter_child_bus_stops
    ADD CONSTRAINT form_filter_child_bus_stops_pkey PRIMARY KEY (id);


--
-- Name: form_filter form_filter_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.form_filter
    ADD CONSTRAINT form_filter_pkey PRIMARY KEY (id);


--
-- Name: huge_table huge_table_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.huge_table
    ADD CONSTRAINT huge_table_pkey PRIMARY KEY (id);


--
-- Name: layer_legend_categorized layer_legend_categorized_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.layer_legend_categorized
    ADD CONSTRAINT layer_legend_categorized_pkey PRIMARY KEY (id);


--
-- Name: layer_legend_single_symbol layer_legend_single_symbol_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.layer_legend_single_symbol
    ADD CONSTRAINT layer_legend_single_symbol_pkey PRIMARY KEY (id);


--
-- Name: layer_with_no_filter layer_with_no_filter_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.layer_with_no_filter
    ADD CONSTRAINT layer_with_no_filter_pkey PRIMARY KEY (gid);


--
-- Name: lookup_1 lookup_1_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.lookup_1
    ADD CONSTRAINT lookup_1_pkey PRIMARY KEY (id);


--
-- Name: lookup_2 lookup_2_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.lookup_2
    ADD CONSTRAINT lookup_2_pkey PRIMARY KEY (id);


--
-- Name: many_bool_formats many_bool_formats_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.many_bool_formats
    ADD CONSTRAINT many_bool_formats_pkey PRIMARY KEY (id);


--
-- Name: many_date_formats many_date_formats_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.many_date_formats
    ADD CONSTRAINT many_date_formats_pkey PRIMARY KEY (id);


--
-- Name: natural_areas natural_areas_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.natural_areas
    ADD CONSTRAINT natural_areas_pkey PRIMARY KEY (id);


--
-- Name: parent_layer parent_layer_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.parent_layer
    ADD CONSTRAINT parent_layer_pkey PRIMARY KEY (id);


--
-- Name: quartiers quartiers_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.quartiers
    ADD CONSTRAINT quartiers_pkey PRIMARY KEY (quartier);


--
-- Name: reverse_geom revert_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.reverse_geom
    ADD CONSTRAINT revert_geom_pkey PRIMARY KEY (id);


--
-- Name: selection selection_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.selection
    ADD CONSTRAINT selection_pkey PRIMARY KEY (id);


--
-- Name: selection_polygon selection_polygon_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.selection_polygon
    ADD CONSTRAINT selection_polygon_pkey PRIMARY KEY (id);


--
-- Name: shop_bakery_pg shop_bakery_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.shop_bakery_pg
    ADD CONSTRAINT shop_bakery_pkey PRIMARY KEY (id);


--
-- Name: single_wms_baselayer single_wms_baselayer_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_baselayer
    ADD CONSTRAINT single_wms_baselayer_pkey PRIMARY KEY (id);


--
-- Name: single_wms_baselayer_two single_wms_baselayer_two_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_baselayer_two
    ADD CONSTRAINT single_wms_baselayer_two_pkey PRIMARY KEY (id);


--
-- Name: single_wms_lines_group_as_layer single_wms_lines_group_as_layer_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_lines_group_as_layer
    ADD CONSTRAINT single_wms_lines_group_as_layer_pkey PRIMARY KEY (id);


--
-- Name: single_wms_lines_group single_wms_lines_group_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_lines_group
    ADD CONSTRAINT single_wms_lines_group_pkey PRIMARY KEY (id);


--
-- Name: single_wms_lines single_wms_lines_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_lines
    ADD CONSTRAINT single_wms_lines_pkey PRIMARY KEY (id);


--
-- Name: single_wms_points_group single_wms_points_group_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_points_group
    ADD CONSTRAINT single_wms_points_group_pkey PRIMARY KEY (id);


--
-- Name: single_wms_points single_wms_points_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_points
    ADD CONSTRAINT single_wms_points_pkey PRIMARY KEY (id);


--
-- Name: single_wms_polygons_group_as_layer single_wms_polygons_group_as_layer_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_polygons_group_as_layer
    ADD CONSTRAINT single_wms_polygons_group_as_layer_pkey PRIMARY KEY (id);


--
-- Name: single_wms_polygons single_wms_polygons_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_polygons
    ADD CONSTRAINT single_wms_polygons_pkey PRIMARY KEY (id);


--
-- Name: single_wms_tiled_baselayer single_wms_tiled_baselayer_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.single_wms_tiled_baselayer
    ADD CONSTRAINT single_wms_tiled_baselayer_pkey PRIMARY KEY (id);


--
-- Name: sousquartiers sousquartiers_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.sousquartiers
    ADD CONSTRAINT sousquartiers_pkey PRIMARY KEY (id);


--
-- Name: table_for_form table_for_form_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.table_for_form
    ADD CONSTRAINT table_for_form_pkey PRIMARY KEY (gid);


--
-- Name: table_for_relationnal_value table_for_relationnal_value_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.table_for_relationnal_value
    ADD CONSTRAINT table_for_relationnal_value_pkey PRIMARY KEY (gid);


--
-- Name: text_widget_point_edit text_widget_point_edit_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.text_widget_point_edit
    ADD CONSTRAINT text_widget_point_edit_pkey PRIMARY KEY (id);


--
-- Name: time_manager time_manager_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.time_manager
    ADD CONSTRAINT time_manager_pkey PRIMARY KEY (gid);


--
-- Name: townhalls_pg townhalls_EPSG2154_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.townhalls_pg
    ADD CONSTRAINT "townhalls_EPSG2154_pkey" PRIMARY KEY (id);


--
-- Name: tramway_lines tramway_lines_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_lines
    ADD CONSTRAINT tramway_lines_pkey PRIMARY KEY (id_line);


--
-- Name: tramway_pivot tramway_pivot_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_pivot
    ADD CONSTRAINT tramway_pivot_pkey PRIMARY KEY (id_pivot);


--
-- Name: tramway_stops tramway_stops_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_stops
    ADD CONSTRAINT tramway_stops_pkey PRIMARY KEY (id_stop);


--
-- Name: triple_geom triple_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.triple_geom
    ADD CONSTRAINT triple_pkey PRIMARY KEY (id);


--
-- Name: xss xss_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.xss
    ADD CONSTRAINT xss_pkey PRIMARY KEY (id);


--
-- Name: fki_line_fkey; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX fki_line_fkey ON tests_projects.tramway_pivot USING btree (id_line);


--
-- Name: fki_parent_fkey; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX fki_parent_fkey ON tests_projects.children_layer USING btree (parent_id);


--
-- Name: fki_stop_fkey; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX fki_stop_fkey ON tests_projects.tramway_pivot USING btree (id_stop);


--
-- Name: sidx_form_edition_snap_geom; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX sidx_form_edition_snap_geom ON tests_projects.form_edition_snap USING gist (geom);


--
-- Name: sidx_quartiers_geom; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX sidx_quartiers_geom ON tests_projects.quartiers USING gist (geom);


--
-- Name: sidx_shop_bakery_pg_geom; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX sidx_shop_bakery_pg_geom ON tests_projects.shop_bakery_pg USING gist (geom);


--
-- Name: sidx_townhalls_pg_geom; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX sidx_townhalls_pg_geom ON tests_projects.townhalls_pg USING gist (geom);


--
-- Name: sousquartiers_geom_geom_idx; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX sousquartiers_geom_geom_idx ON tests_projects.sousquartiers USING gist (geom);


--
-- Name: tramway_pivot line_fkey; Type: FK CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_pivot
    ADD CONSTRAINT line_fkey FOREIGN KEY (id_line) REFERENCES tests_projects.tramway_lines(id_line) NOT VALID;


--
-- Name: tramway_pivot stop_fkey; Type: FK CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.tramway_pivot
    ADD CONSTRAINT stop_fkey FOREIGN KEY (id_stop) REFERENCES tests_projects.tramway_stops(id_stop) NOT VALID;


--
-- PostgreSQL database dump complete
--

\unrestrict testse2elizmap
