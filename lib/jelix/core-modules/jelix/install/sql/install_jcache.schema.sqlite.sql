CREATE TABLE   IF NOT EXISTS %%PREFIX%%jlx_cache (
  cache_key varchar(255) NOT NULL default '',
  cache_data blob,
  cache_date datetime default NULL,
  PRIMARY KEY  (cache_key)
);
