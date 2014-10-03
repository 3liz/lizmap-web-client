CREATE TABLE `log_detail` (
    `id` INTEGER  AUTO_INCREMENT NOT NULL,
    `log_key` VARCHAR(100) NOT NULL ,
    `log_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `log_user` VARCHAR(100),
    `log_content` TEXT,
    `log_repository` VARCHAR(100),
    `log_project` VARCHAR(100),
    `log_ip` VARCHAR(15),
    PRIMARY KEY (`id`)
);

CREATE TABLE `log_counter` (
    `id` INTEGER AUTO_INCREMENT  NOT NULL ,
    `key` VARCHAR(100) NOT NULL ,
    `counter` INTEGER,
    `repository` VARCHAR(100),
    `project` VARCHAR(100),
    PRIMARY KEY  (`id`)
);
