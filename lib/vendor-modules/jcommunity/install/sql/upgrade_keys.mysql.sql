
ALTER TABLE `%%PREFIX%%community_users` DROP PRIMARY KEY;
ALTER TABLE `%%PREFIX%%community_users` ADD PRIMARY KEY (id);
ALTER TABLE `%%PREFIX%%community_users` ADD UNIQUE KEY (login);
