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
-- Name: reverse_geom; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.reverse_geom (
    id integer NOT NULL,
    geom public.geometry(MultiLineString,2154)
);


ALTER TABLE tests_projects.reverse_geom OWNER TO lizmap;

--
-- Name: revert_geom_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.revert_geom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.revert_geom_id_seq OWNER TO lizmap;

--
-- Name: revert_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.revert_geom_id_seq OWNED BY tests_projects.reverse_geom.id;


--
-- Name: reverse_geom id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.reverse_geom ALTER COLUMN id SET DEFAULT nextval('tests_projects.revert_geom_id_seq'::regclass);


--
-- Data for Name: reverse_geom; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.reverse_geom (id, geom) FROM stdin;
1	01050000206A0800000100000001020000000700000098A624A136812741793B727BCBF457413984A189558127412AF0BC57C7F45741E2B4B5EB9C8127415343830CB6F4574194D36C7EF481274148CF9DEF9CF45741AE503C3D6A822741FFB327438AF45741E9EC2005C48227414092D5797DF45741B96DBC48C3822741E1A569D06BF45741
\.


--
-- Name: revert_geom_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.revert_geom_id_seq', 5, true);


--
-- Name: reverse_geom revert_geom_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.reverse_geom
    ADD CONSTRAINT revert_geom_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

