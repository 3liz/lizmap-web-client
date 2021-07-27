--
-- PostgreSQL database dump
--

-- Dumped from database version 11.12 (Debian 11.12-1.pgdg100+1)
-- Dumped by pg_dump version 13.3 (Ubuntu 13.3-1.pgdg18.04+1)

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
-- Name: form_advanced_point; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.form_advanced_point (
    id integer NOT NULL,
    geom public.geometry(Point,2154),
    has_photo boolean,
    website text
);


ALTER TABLE tests_projects.form_advanced_point OWNER TO lizmap;

--
-- Name: form_advanced_point_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.form_advanced_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.form_advanced_point_id_seq OWNER TO lizmap;

--
-- Name: form_advanced_point_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.form_advanced_point_id_seq OWNED BY tests_projects.form_advanced_point.id;


--
-- Name: form_advanced_point id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.form_advanced_point ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_advanced_point_id_seq'::regclass);


--
-- Data for Name: form_advanced_point; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.form_advanced_point (id, geom, has_photo, website) FROM stdin;
\.


--
-- Name: form_advanced_point_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.form_advanced_point_id_seq', 1, false);


--
-- Name: form_advanced_point form_advanced_point_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.form_advanced_point
    ADD CONSTRAINT form_advanced_point_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

