--
-- PostgreSQL database dump
--

-- Dumped from database version 11.10 (Debian 11.10-1.pgdg100+1)
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
-- Name: dnd_form; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.dnd_form (
    id integer NOT NULL,
    field_in_dnd_form text,
    field_not_in_dnd_form text
);


ALTER TABLE tests_projects.dnd_form OWNER TO lizmap;

--
-- Name: dnd_form_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.dnd_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.dnd_form_id_seq OWNER TO lizmap;

--
-- Name: dnd_form_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.dnd_form_id_seq OWNED BY tests_projects.dnd_form.id;


--
-- Name: dnd_form id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.dnd_form ALTER COLUMN id SET DEFAULT nextval('tests_projects.dnd_form_id_seq'::regclass);


--
-- Data for Name: dnd_form; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

INSERT INTO tests_projects.dnd_form (id, field_in_dnd_form, field_not_in_dnd_form) VALUES
    (1, 'test', 'test');


--
-- Name: dnd_form_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.dnd_form_id_seq', 1, true);


--
-- Name: dnd_form dnd_form_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.dnd_form
    ADD CONSTRAINT dnd_form_pkey PRIMARY KEY (id);


--
-- Name: dnd_form_geom; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.dnd_form_geom (
    id integer NOT NULL,
    field_in_dnd_form text,
    field_not_in_dnd_form text,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.dnd_form_geom OWNER TO lizmap;

--
-- Name: dnd_form_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.dnd_form_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.dnd_form_geom_id_seq OWNER TO lizmap;

--
-- Name: dnd_form_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.dnd_form_geom_id_seq OWNED BY tests_projects.dnd_form_geom.id;


--
-- Name: dnd_form_geom id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.dnd_form_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.dnd_form_geom_id_seq'::regclass);


--
-- Data for Name: dnd_form_geom; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

INSERT INTO tests_projects.dnd_form_geom (id, field_in_dnd_form, field_not_in_dnd_form, geom) VALUES
    (1, 'test_geom', 'test_geom', '01010000206A080000BF599997AB39254116EA7038651D5841');


--
-- Name: dnd_form_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.dnd_form_geom_id_seq', 1, true);


--
-- Name: dnd_form_geom dnd_form_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.dnd_form_geom
    ADD CONSTRAINT dnd_form_geom_pkey PRIMARY KEY (id);



--
-- PostgreSQL database dump complete
--

