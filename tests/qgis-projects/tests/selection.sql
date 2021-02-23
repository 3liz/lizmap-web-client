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
-- Name: selection; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.selection (
    id integer NOT NULL,
    "group" text,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.selection OWNER TO lizmap;

--
-- Name: selection_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.selection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.selection_id_seq OWNER TO lizmap;

--
-- Name: selection_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.selection_id_seq OWNED BY tests_projects.selection.id;


--
-- Name: selection id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.selection ALTER COLUMN id SET DEFAULT nextval('tests_projects.selection_id_seq'::regclass);


--
-- Data for Name: selection; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.selection (id, "group", geom) FROM stdin;
1	admins	01010000206A08000072B2BCA495200741582EE2F77EEC2B41
2	autre	01010000206A08000010D23D75D8A70B4189D15E7A6AE62B41
\.


--
-- Name: selection_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.selection_id_seq', 33, true);


--
-- Name: selection selection_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.selection
    ADD CONSTRAINT selection_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

