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
-- Name: dnd_popup; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.dnd_popup (
    id integer NOT NULL,
    field_tab1 text,
    field_tab2 text,
    geom public.geometry(Polygon,2154)
);


ALTER TABLE tests_projects.dnd_popup OWNER TO lizmap;

--
-- Name: dnd_popup_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.dnd_popup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.dnd_popup_id_seq OWNER TO lizmap;

--
-- Name: dnd_popup_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.dnd_popup_id_seq OWNED BY tests_projects.dnd_popup.id;


--
-- Name: dnd_popup id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.dnd_popup ALTER COLUMN id SET DEFAULT nextval('tests_projects.dnd_popup_id_seq'::regclass);


--
-- Data for Name: dnd_popup; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.dnd_popup (id, field_tab1, field_tab2, geom) FROM stdin;
1	tab1_value	tab2_value	01030000206A0800000100000004000000541E93BC41682741EFF7CD63FDF6574182A712AB07682741602DE34CB7F157411AFC5F7C19AD27413F086B27A5F15741541E93BC41682741EFF7CD63FDF65741
\.


--
-- Name: dnd_popup_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.dnd_popup_id_seq', 1, true);


--
-- Name: dnd_popup dnd_popup_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.dnd_popup
    ADD CONSTRAINT dnd_popup_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

