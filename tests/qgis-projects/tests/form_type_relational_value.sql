--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg90+1)
-- Dumped by pg_dump version 11.10 (Ubuntu 11.10-1.pgdg18.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

CREATE SCHEMA if NOT EXISTS tests_projects;

--
-- Name: table_for_form; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.table_for_form(
    gid integer NOT NULL,
    "titre" text,
    "test" text[],
    "test_not_null_only" text[],
    "test_empty_value_only" text[],
    geom public.geometry(Point,2154)
);

--
-- Name: table_for_form_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.table_for_form_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.table_for_form_gid_seq OWNER TO lizmap;

--
-- Name: table_for_form_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.table_for_form_gid_seq OWNED BY tests_projects.table_for_form.gid;


--
-- Name: table_for_relationnal_value; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.table_for_relationnal_value(
    gid integer NOT NULL,
    "code" text,
    "label" text
);

--
-- Name: table_for_relationnal_value_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.table_for_relationnal_value_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.table_for_relationnal_value_gid_seq OWNER TO lizmap;

--
-- Name: table_for_relationnal_value_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.table_for_relationnal_value_gid_seq OWNED BY tests_projects.table_for_relationnal_value.gid;


--
-- Name: table_for_relationnal_value table_for_relationnal_value_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.table_for_form
    ADD CONSTRAINT table_for_form_pkey PRIMARY KEY (gid);

--
-- Name: table_for_relationnal_value table_for_relationnal_value_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.table_for_relationnal_value
    ADD CONSTRAINT table_for_relationnal_value_pkey PRIMARY KEY (gid);


--
-- INSERT DATA IN table_for_form
--

INSERT INTO tests_projects.table_for_form VALUES(
    1,
    'test',
    '{"A06"}',
    '{"A07"}',
    '{"A08"}',
    '01010000206A080000BF599997AB39254116EA7038651D5841'
);

--
-- INSERT DATA IN table_for_relationnal_value
--

INSERT INTO tests_projects.table_for_relationnal_value(gid, "label", "code") VALUES(1, 'Flower', 'A06');
INSERT INTO tests_projects.table_for_relationnal_value(gid, "label", "code") VALUES(2, 'water', 'A07');
INSERT INTO tests_projects.table_for_relationnal_value(gid, "label", "code") VALUES(3, 'Tree', 'A08');

--
-- Name: table_for_form_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.table_for_form_gid_seq', 1, true);


--
-- Name: table_for_relationnal_value_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.table_for_relationnal_value_gid_seq', 3, true);
