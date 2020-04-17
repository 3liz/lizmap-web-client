
CREATE TABLE IF NOT EXISTS `%%PREFIX%%community_users` (
  `id` int(11) NOT NULL auto_increment,
  `login` varchar(50) NOT NULL,
  `password` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nickname` varchar(50) default NULL,
  `status` tinyint(4) NOT NULL default '0',
  `keyactivate` varchar(10) default NULL,
  `request_date` datetime default NULL,
  `create_date` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY %%PREFIX%%community_users_login (`login`)
);
