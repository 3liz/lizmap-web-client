CREATE TABLE %%PREFIX%%jsessions (
    id character varying(64) NOT NULL,
    creation timestamp NOT NULL,
    "access" timestamp NOT NULL,
    data bytea NOT NULL,
    CONSTRAINT %%PREFIX%%jsession_pkey PRIMARY KEY (id)
);
