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

--
-- Name: filter_layer_by_user; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.filter_layer_by_user (
    gid integer NOT NULL,
    "user" text,
    "group" text,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.filter_layer_by_user OWNER TO lizmap;

--
-- Name: filter_layer_by_user_edition_only; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.filter_layer_by_user_edition_only (
    gid integer NOT NULL,
    "user" text,
    "group" text,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.filter_layer_by_user_edition_only OWNER TO lizmap;

--
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.filter_layer_by_user_edition_only_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.filter_layer_by_user_edition_only_gid_seq OWNER TO lizmap;

--
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.filter_layer_by_user_edition_only_gid_seq OWNED BY tests_projects.filter_layer_by_user_edition_only.gid;


--
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.filter_layer_by_user_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.filter_layer_by_user_gid_seq OWNER TO lizmap;

--
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.filter_layer_by_user_gid_seq OWNED BY tests_projects.filter_layer_by_user.gid;


--
-- Name: layer_with_no_filter; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.layer_with_no_filter (
    gid integer NOT NULL,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.layer_with_no_filter OWNER TO lizmap;

--
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.layer_with_no_filter_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.layer_with_no_filter_gid_seq OWNER TO lizmap;

--
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.layer_with_no_filter_gid_seq OWNED BY tests_projects.layer_with_no_filter.gid;


--
-- Name: filter_layer_by_user gid; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user ALTER COLUMN gid SET DEFAULT nextval('tests_projects.filter_layer_by_user_gid_seq'::regclass);


--
-- Name: filter_layer_by_user_edition_only gid; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user_edition_only ALTER COLUMN gid SET DEFAULT nextval('tests_projects.filter_layer_by_user_edition_only_gid_seq'::regclass);


--
-- Name: layer_with_no_filter gid; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_with_no_filter ALTER COLUMN gid SET DEFAULT nextval('tests_projects.layer_with_no_filter_gid_seq'::regclass);


--
-- Data for Name: filter_layer_by_user; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.filter_layer_by_user (gid, "user", "group", geom) FROM stdin;
1	admin	\N	01010000206A08000000E08B6EAA0E744090DC4977C6372F41
2	other-user	\N	01010000206A08000084D3086E0FDFF3404A2C05E482472F41
3	\N	\N	01010000206A08000028B76AD632CBE540B5C59180B9102E41
\.


--
-- Data for Name: filter_layer_by_user_edition_only; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.filter_layer_by_user_edition_only (gid, "user", "group", geom) FROM stdin;
1	admin	\N	01010000206A08000038F12038DF36C9409B93D65E66BE2C41
2	other-user	\N	01010000206A0800009E69E05761FFEF40ACBFA74377BA2C41
3	\N	\N	01010000206A0800007E208A652CB4E3403CB2FDB3DAB42B41
\.


--
-- Data for Name: layer_with_no_filter; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.layer_with_no_filter (gid, geom) FROM stdin;
1	01010000206A08000040787D23418CE540D5BEAF2CA4D43041
\.


--
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.filter_layer_by_user_edition_only_gid_seq', 3, true);


--
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.filter_layer_by_user_gid_seq', 3, true);


--
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.layer_with_no_filter_gid_seq', 1, true);


--
-- Name: filter_layer_by_user_edition_only filter_layer_by_user_edition_only_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user_edition_only
    ADD CONSTRAINT filter_layer_by_user_edition_only_pkey PRIMARY KEY (gid);


--
-- Name: filter_layer_by_user filter_layer_by_user_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user
    ADD CONSTRAINT filter_layer_by_user_pkey PRIMARY KEY (gid);


--
-- Name: layer_with_no_filter layer_with_no_filter_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_with_no_filter
    ADD CONSTRAINT layer_with_no_filter_pkey PRIMARY KEY (gid);


--
-- PostgreSQL database dump complete
--

