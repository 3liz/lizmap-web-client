
SET client_encoding = 'UTF8';

CREATE SCHEMA IF NOT EXISTS tests_projects;

--
-- Name: shop_bakery_pg; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.shop_bakery_pg (
    id integer NOT NULL,
    geom public.geometry(Point,4326),
    name character varying(254)
);


--
-- Name: shop_bakery_id_0_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects.shop_bakery_id_0_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_bakery_id_0_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects.shop_bakery_id_0_seq OWNED BY tests_projects.shop_bakery_pg.id;


--
-- Name: townhalls_pg; Type: TABLE; Schema: tests_projects; Owner: -
--

CREATE TABLE tests_projects.townhalls_pg (
    id integer NOT NULL,
    geom public.geometry(Point,2154),
    name character varying(254)
);


--
-- Name: townhalls_EPSG2154_id_seq; Type: SEQUENCE; Schema: tests_projects; Owner: -
--

CREATE SEQUENCE tests_projects."townhalls_EPSG2154_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: townhalls_EPSG2154_id_seq; Type: SEQUENCE OWNED BY; Schema: tests_projects; Owner: -
--

ALTER SEQUENCE tests_projects."townhalls_EPSG2154_id_seq" OWNED BY tests_projects.townhalls_pg.id;


--
-- Name: shop_bakery_pg id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.shop_bakery_pg ALTER COLUMN id SET DEFAULT nextval('tests_projects.shop_bakery_id_0_seq'::regclass);


--
-- Name: townhalls_pg id; Type: DEFAULT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.townhalls_pg ALTER COLUMN id SET DEFAULT nextval('tests_projects."townhalls_EPSG2154_id_seq"'::regclass);


--
-- Data for Name: shop_bakery_pg; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.shop_bakery_pg (id, geom, name) FROM stdin;
2	0101000020E6100000A0CD509C25750E4096E89FF856D44540	fgeajwprkl
3	0101000020E61000009CE5F1C4C0DA0E4047043C6C5DD54540	fjcujcyzgf
4	0101000020E61000004E9CD1A6A3690E40956CEAD4A3C94540	pgtcyjasms
5	0101000020E61000009ECFEB4F68340F40BC08282A6BCC4540	kgwaygnmfi
8	0101000020E6100000AB8A54B61EC90E40210B79DF04D84540	zilsrrrltf
9	0101000020E61000004B3280A645FB0E40C7C56C5652D44540	bxmlxnoaok
11	0101000020E61000003A6DC25EC9E10E405064925050CC4540	pqdfzypdia
12	0101000020E6100000105FD05900800E408C87F40010CD4540	imihgfrznp
13	0101000020E6100000EF1C196CF5700F40D5937E8A3FD14540	yzihrycjmf
14	0101000020E6100000185DC095273E0F402D10C8203BD04540	jsncvnfjym
16	0101000020E6100000AE502EB51E660E4093A7946872C74540	ohwheojhyq
18	0101000020E6100000D0F106E1911B0F40957AE6993EC84540	bxaqbwrkbz
19	0101000020E6100000019DFF5627200F4055E04CD8E2CA4540	cwwmyjlclj
21	0101000020E61000006E7287D967280F402AF5498937D24540	gdrqiiqjhq
23	0101000020E610000090C039CEBCBF0E40D61F124EFDCE4540	eyaqhbmuqi
24	0101000020E610000050BB831EB8970F40DE9C63977CD24540	rlwyfwejpp
25	0101000020E61000004683A70DB92F0F4075CCA87F2FD44540	tymcjjhqod
\.


--
-- Data for Name: townhalls_pg; Type: TABLE DATA; Schema: tests_projects; Owner: -
--

COPY tests_projects.townhalls_pg (id, geom, name) FROM stdin;
2	01010000206A080000B070BFB387622741CBBAE76B05F95741	Mairie annexe Hauts de Massane
3	01010000206A080000303A03F13F842741E7D9AA80C5EF5741	Antenne Mairie de lattes
4	01010000206A08000089DFAAF6EE7F2741F4D5A7D391F65741	Mairie annexe Aiguelongue
5	01010000206A080000EB419CCDE2A627411E3C63EB42F95741	Mairie de Jacou
6	01010000206A08000065E565E565732741490076935BF35741	Mairie de proximité François Villon
7	01010000206A08000052995D46639F27416CEF124319FB5741	Hôtel de Ville - Château de Bocaud
10	01010000206A08000006BA48A8F5812741849BABACE3F15741	Mairie de proximité Tastavin
11	01010000206A080000553A90666B692741EAC7AC16BCF55741	Mairie de proximité Mosson
12	01010000206A0800000017CC451FA427412DBB27DD35F05741	Mairie de Lattes
15	01010000206A08000060C2CEE4FCB2274108AC96DF61F45741	Mairie de Fabrègues
17	01010000206A080000D575499D665C274182DB1149E1F15741	Mairie de Lavérune
18	01010000206A08000023CC2413098627419522FA78C5F85741	Mairie
20	01010000206A0800006CBECA5E30A12741A864FF0BB7F85741	Mairie du Crès
21	01010000206A0800009A11D11B525F27419EC4CD2838EF5741	Mairie de Saint-Jean-de-Védas
23	01010000206A0800005A14FFF6E07F27410CCDC3B640FA5741	\N
26	01010000206A0800000D5D7691554F27418CE75ADCE4F85741	Mairie de Grabels
\.


--
-- Name: shop_bakery_id_0_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects.shop_bakery_id_0_seq', 25, true);


--
-- Name: townhalls_EPSG2154_id_seq; Type: SEQUENCE SET; Schema: tests_projects; Owner: -
--

SELECT pg_catalog.setval('tests_projects."townhalls_EPSG2154_id_seq"', 27, true);


--
-- Name: shop_bakery_pg shop_bakery_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.shop_bakery_pg
    ADD CONSTRAINT shop_bakery_pkey PRIMARY KEY (id);


--
-- Name: townhalls_pg townhalls_EPSG2154_pkey; Type: CONSTRAINT; Schema: tests_projects; Owner: -
--

ALTER TABLE ONLY tests_projects.townhalls_pg
    ADD CONSTRAINT "townhalls_EPSG2154_pkey" PRIMARY KEY (id);


--
-- Name: sidx_shop_bakery_pg_geom; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX sidx_shop_bakery_pg_geom ON tests_projects.shop_bakery_pg USING gist (geom);


--
-- Name: sidx_townhalls_pg_geom; Type: INDEX; Schema: tests_projects; Owner: -
--

CREATE INDEX sidx_townhalls_pg_geom ON tests_projects.townhalls_pg USING gist (geom);


--
-- PostgreSQL database dump complete
--
