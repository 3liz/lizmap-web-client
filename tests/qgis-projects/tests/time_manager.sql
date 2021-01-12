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
-- Name: time_manager; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.time_manager (
    gid integer NOT NULL,
    test_date date,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.time_manager OWNER TO lizmap;

--
-- Name: time_manager_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.time_manager_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.time_manager_gid_seq OWNER TO lizmap;

--
-- Name: time_manager_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.time_manager_gid_seq OWNED BY tests_projects.time_manager.gid;


--
-- Name: time_manager gid; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.time_manager ALTER COLUMN gid SET DEFAULT nextval('tests_projects.time_manager_gid_seq'::regclass);


--
-- Data for Name: time_manager; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.time_manager (gid, test_date, geom) FROM stdin;
1	2007-01-01	01010000206A08000072ECD2D4C065E9404740013F7A9D2B41
2	2012-01-01	01010000206A080000882F5B0432140441836413BEEF982B41
3	2017-01-01	01010000206A08000057105E3098401241FAAC37BCDA8F2B41
\.


--
-- Name: time_manager_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.time_manager_gid_seq', 3, true);


--
-- Name: time_manager time_manager_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.time_manager
    ADD CONSTRAINT time_manager_pkey PRIMARY KEY (gid);


--
-- PostgreSQL database dump complete
--

