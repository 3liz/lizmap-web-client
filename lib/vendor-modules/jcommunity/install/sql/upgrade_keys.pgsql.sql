ALTER TABLE %%PREFIX%%community_users DROP CONSTRAINT IF EXISTS %%PREFIX%%community_users_login_pk;
ALTER TABLE %%PREFIX%%community_users ADD CONSTRAINT %%PREFIX%%community_users_id_pk PRIMARY KEY (id);
ALTER TABLE %%PREFIX%%community_users ADD CONSTRAINT %%PREFIX%%community_users_login_key UNIQUE KEY (login);



