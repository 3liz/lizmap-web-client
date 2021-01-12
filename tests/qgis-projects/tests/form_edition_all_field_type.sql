--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.24
-- Dumped by pg_dump version 13.1 (Ubuntu 13.1-1.pgdg18.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

--
-- Name: form_edition_all_fields_types; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.form_edition_all_fields_types (
    id integer NOT NULL,
    integer_field integer,
    boolean_notnull_for_checkbox boolean NOT NULL,
    boolean_nullable boolean
);


ALTER TABLE tests_projects.form_edition_all_fields_types OWNER TO lizmap;

--
-- Name: form_edition_all_fields_types_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.form_edition_all_fields_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.form_edition_all_fields_types_id_seq OWNER TO lizmap;

--
-- Name: form_edition_all_fields_types_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.form_edition_all_fields_types_id_seq OWNED BY tests_projects.form_edition_all_fields_types.id;


--
-- Name: form_edition_all_fields_types id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.form_edition_all_fields_types ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_edition_all_fields_types_id_seq'::regclass);


--
-- Data for Name: form_edition_all_fields_types; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.form_edition_all_fields_types (id, integer_field, boolean_notnull_for_checkbox, boolean_nullable) FROM stdin;
\.


--
-- Name: form_edition_all_fields_types_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.form_edition_all_fields_types_id_seq', 27, true);


--
-- Name: form_edition_all_fields_types form_edition_all_fields_types_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.form_edition_all_fields_types
    ADD CONSTRAINT form_edition_all_fields_types_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

