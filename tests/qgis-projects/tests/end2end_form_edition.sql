--
-- PostgreSQL database dump
--

-- Dumped from database version 11.10 (Debian 11.10-1.pgdg100+1)
-- Dumped by pg_dump version 13.2 (Ubuntu 13.2-1.pgdg18.04+1)

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
-- Name: end2end_form_edition; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.end2end_form_edition (
    id integer NOT NULL,
    value integer
);


ALTER TABLE tests_projects.end2end_form_edition OWNER TO lizmap;

--
-- Name: end2end_form_edition_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.end2end_form_edition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.end2end_form_edition_id_seq OWNER TO lizmap;

--
-- Name: end2end_form_edition_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.end2end_form_edition_id_seq OWNED BY tests_projects.end2end_form_edition.id;


--
-- Name: end2end_form_edition id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.end2end_form_edition ALTER COLUMN id SET DEFAULT nextval('tests_projects.end2end_form_edition_id_seq'::regclass);


--
-- Data for Name: end2end_form_edition; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.end2end_form_edition (id, value) FROM stdin;
\.


--
-- Name: end2end_form_edition_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.end2end_form_edition_id_seq', 1, true);


--
-- Name: end2end_form_edition end2end_form_edition_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.end2end_form_edition
    ADD CONSTRAINT end2end_form_edition_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

