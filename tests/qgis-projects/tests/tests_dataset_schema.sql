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
