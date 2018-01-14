CREATE TABLE %%PREFIX%%jlx_cache (
  cache_key character varying(255) NOT NULL,
  cache_data bytea,
  cache_date timestamp default NULL,
  CONSTRAINT %%PREFIX%%jlx_cache_pkey PRIMARY KEY (cache_key)
);
