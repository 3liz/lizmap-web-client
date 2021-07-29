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
-- Name: layer_legend_categorized; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.layer_legend_categorized (
    id integer NOT NULL,
    geom public.geometry(Point,2154),
    category integer
);


ALTER TABLE tests_projects.layer_legend_categorized OWNER TO lizmap;

--
-- Name: layer_legend_categorized_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.layer_legend_categorized_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.layer_legend_categorized_id_seq OWNER TO lizmap;

--
-- Name: layer_legend_categorized_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.layer_legend_categorized_id_seq OWNED BY tests_projects.layer_legend_categorized.id;


--
-- Name: layer_legend_single_symbol; Type: TABLE; Schema: tests_projects; Owner: lizmap
--

CREATE TABLE tests_projects.layer_legend_single_symbol (
    id integer NOT NULL,
    geom public.geometry(Point,2154)
);


ALTER TABLE tests_projects.layer_legend_single_symbol OWNER TO lizmap;

--
-- Name: layer_legend_single_symbol_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: lizmap
--

CREATE SEQUENCE tests_projects.layer_legend_single_symbol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tests_projects.layer_legend_single_symbol_id_seq OWNER TO lizmap;

--
-- Name: layer_legend_single_symbol_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: lizmap
--

ALTER SEQUENCE tests_projects.layer_legend_single_symbol_id_seq OWNED BY tests_projects.layer_legend_single_symbol.id;


--
-- Name: layer_legend_categorized id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_legend_categorized ALTER COLUMN id SET DEFAULT nextval('tests_projects.layer_legend_categorized_id_seq'::regclass);


--
-- Name: layer_legend_single_symbol id; Type: DEFAULT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_legend_single_symbol ALTER COLUMN id SET DEFAULT nextval('tests_projects.layer_legend_single_symbol_id_seq'::regclass);


--
-- Data for Name: layer_legend_categorized; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.layer_legend_categorized (id, geom, category) FROM stdin;
1	01010000206A0800009807EE60CC70274122C96ECAA2F35741	1
2	01010000206A080000B8DE1479FB71274184ECBB19A1F35741	2
\.


--
-- Data for Name: layer_legend_single_symbol; Type: TABLE DATA; Schema: tests_projects; Owner: lizmap
--

COPY tests_projects.layer_legend_single_symbol (id, geom) FROM stdin;
1	01010000206A080000189125735F71274188E80344B5F35741
\.


--
-- Name: layer_legend_categorized_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.layer_legend_categorized_id_seq', 2, true);


--
-- Name: layer_legend_single_symbol_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: lizmap
--

SELECT pg_catalog.setval('tests_projects.layer_legend_single_symbol_id_seq', 1, true);


--
-- Name: layer_legend_categorized layer_legend_categorized_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_legend_categorized
    ADD CONSTRAINT layer_legend_categorized_pkey PRIMARY KEY (id);


--
-- Name: layer_legend_single_symbol layer_legend_single_symbol_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: lizmap
--

ALTER TABLE ONLY tests_projects.layer_legend_single_symbol
    ADD CONSTRAINT layer_legend_single_symbol_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

