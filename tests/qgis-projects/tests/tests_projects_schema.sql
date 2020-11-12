--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg90+1)
-- Dumped by pg_dump version 13.0 (Ubuntu 13.0-1.pgdg18.04+1)

-- Started on 2020-11-12 15:02:00 CET

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

--
-- TOC entry 13 (class 2615 OID 20843)
-- Name: tests_projects; Type: SCHEMA; Schema: -; Owner: lizmap
--

CREATE SCHEMA tests_projects;


ALTER SCHEMA tests_projects OWNER TO lizmap;

SET default_tablespace = '';

--
-- TOC entry 289 (class 1259 OID 29010)
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
-- TOC entry 291 (class 1259 OID 29031)
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
-- TOC entry 290 (class 1259 OID 29029)
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.filter_layer_by_user_edition_only_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.filter_layer_by_user_edition_only_gid_seq OWNER TO lizmap;

--
-- TOC entry 4702 (class 0 OID 0)
-- Dependencies: 290
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.filter_layer_by_user_edition_only_gid_seq OWNED BY tests_projects.filter_layer_by_user_edition_only.gid;


--
-- TOC entry 288 (class 1259 OID 29008)
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.filter_layer_by_user_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.filter_layer_by_user_gid_seq OWNER TO lizmap;

--
-- TOC entry 4703 (class 0 OID 0)
-- Dependencies: 288
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.filter_layer_by_user_gid_seq OWNED BY tests_projects.filter_layer_by_user.gid;


--
-- TOC entry 293 (class 1259 OID 29042)
-- Name: layer_with_no_filter; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.layer_with_no_filter (
    gid integer NOT NULL,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.layer_with_no_filter OWNER TO lizmap;

--
-- TOC entry 292 (class 1259 OID 29040)
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.layer_with_no_filter_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.layer_with_no_filter_gid_seq OWNER TO lizmap;

--
-- TOC entry 4704 (class 0 OID 0)
-- Dependencies: 292
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.layer_with_no_filter_gid_seq OWNED BY tests_projects.layer_with_no_filter.gid;


--
-- TOC entry 4554 (class 2604 OID 29013)
-- Name: filter_layer_by_user gid; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user ALTER COLUMN gid SET DEFAULT nextval('tests_projects.filter_layer_by_user_gid_seq'::regclass);


--
-- TOC entry 4555 (class 2604 OID 29034)
-- Name: filter_layer_by_user_edition_only gid; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user_edition_only ALTER COLUMN gid SET DEFAULT nextval('tests_projects.filter_layer_by_user_edition_only_gid_seq'::regclass);


--
-- TOC entry 4556 (class 2604 OID 29045)
-- Name: layer_with_no_filter gid; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_with_no_filter ALTER COLUMN gid SET DEFAULT nextval('tests_projects.layer_with_no_filter_gid_seq'::regclass);


--
-- TOC entry 4692 (class 0 OID 29010)
-- Dependencies: 289
-- Data for Name: filter_layer_by_user; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.filter_layer_by_user (gid, "user", "group", geom) FROM stdin;
1	admin	\N	01010000206A08000000E08B6EAA0E744090DC4977C6372F41
2	other-user	\N	01010000206A08000084D3086E0FDFF3404A2C05E482472F41
3	\N	\N	01010000206A08000028B76AD632CBE540B5C59180B9102E41
\.


--
-- TOC entry 4694 (class 0 OID 29031)
-- Dependencies: 291
-- Data for Name: filter_layer_by_user_edition_only; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.filter_layer_by_user_edition_only (gid, "user", "group", geom) FROM stdin;
1	admin	\N	01010000206A08000038F12038DF36C9409B93D65E66BE2C41
2	other-user	\N	01010000206A0800009E69E05761FFEF40ACBFA74377BA2C41
3	\N	\N	01010000206A0800007E208A652CB4E3403CB2FDB3DAB42B41
\.


--
-- TOC entry 4696 (class 0 OID 29042)
-- Dependencies: 293
-- Data for Name: layer_with_no_filter; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.layer_with_no_filter (gid, geom) FROM stdin;
1	01010000206A08000040787D23418CE540D5BEAF2CA4D43041
\.


--
-- TOC entry 4705 (class 0 OID 0)
-- Dependencies: 290
-- Name: filter_layer_by_user_edition_only_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.filter_layer_by_user_edition_only_gid_seq', 3, true);


--
-- TOC entry 4706 (class 0 OID 0)
-- Dependencies: 288
-- Name: filter_layer_by_user_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.filter_layer_by_user_gid_seq', 3, true);


--
-- TOC entry 4707 (class 0 OID 0)
-- Dependencies: 292
-- Name: layer_with_no_filter_gid_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.layer_with_no_filter_gid_seq', 1, true);


--
-- TOC entry 4560 (class 2606 OID 29039)
-- Name: filter_layer_by_user_edition_only filter_layer_by_user_edition_only_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user_edition_only
    ADD CONSTRAINT filter_layer_by_user_edition_only_pkey PRIMARY KEY (gid);


--
-- TOC entry 4558 (class 2606 OID 29018)
-- Name: filter_layer_by_user filter_layer_by_user_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.filter_layer_by_user
    ADD CONSTRAINT filter_layer_by_user_pkey PRIMARY KEY (gid);


--
-- TOC entry 4562 (class 2606 OID 29050)
-- Name: layer_with_no_filter layer_with_no_filter_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_with_no_filter
    ADD CONSTRAINT layer_with_no_filter_pkey PRIMARY KEY (gid);


-- Completed on 2020-11-12 15:02:01 CET

--
-- PostgreSQL database dump complete
--

