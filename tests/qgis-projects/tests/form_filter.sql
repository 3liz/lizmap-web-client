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
-- Name: form_filter; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.form_filter (
    id integer NOT NULL,
    label text,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.form_filter OWNER TO lizmap;

--
-- Name: form_filter_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.form_filter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.form_filter_id_seq OWNER TO lizmap;

--
-- Name: form_filter_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.form_filter_id_seq OWNED BY tests_projects.form_filter.id;


--
-- Name: form_filter id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.form_filter ALTER COLUMN id SET DEFAULT nextval('tests_projects.form_filter_id_seq'::regclass);


--
-- Data for Name: form_filter; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.form_filter (id, label, geom) FROM stdin;
1	simple label	01010000206A08000000000000007083400000000000207AC0
2	Œuvres d'art et monuments de l'espace urbain	01010000206A0800000000000000B0844000000000004885C0
\.


--
-- Name: form_filter_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.form_filter_id_seq', 2, true);


--
-- Name: form_filter form_filter_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.form_filter
    ADD CONSTRAINT form_filter_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

