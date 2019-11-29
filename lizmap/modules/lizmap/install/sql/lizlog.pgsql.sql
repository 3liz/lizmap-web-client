CREATE TABLE IF NOT EXISTS log_detail (
    id SERIAL  PRIMARY KEY,
    log_key character varying(100) NOT NULL ,
    log_timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    log_user character varying(100),
    log_content TEXT,
    log_repository character varying(100),
    log_project character varying(100),
    log_ip character varying(40)
);

CREATE TABLE IF NOT EXISTS log_counter (
    id SERIAL  PRIMARY KEY,
    key character varying(100) NOT NULL ,
    counter INTEGER,
    repository varchar,
    project varchar
);
