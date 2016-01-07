
PRAGMA writable_schema = 1;
UPDATE SQLITE_MASTER SET SQL = 'CREATE TABLE jlx_user ( usr_login varchar(50) NOT NULL DEFAULT '''', usr_password varchar(120) NOT NULL DEFAULT '''',  usr_email varchar(255) NOT NULL DEFAULT '''', firstname VARCHAR(100) NOT NULL DEFAULT '''', lastname VARCHAR(100) NOT NULL DEFAULT '''', organization VARCHAR(100) DEFAULT '''', phonenumber VARCHAR(20) DEFAULT '''', street VARCHAR(150) DEFAULT '''', postcode VARCHAR(10) DEFAULT '''', city VARCHAR(150) DEFAULT '''', country VARCHAR(100) DEFAULT '''', comment TEXT DEFAULT '''', PRIMARY KEY  (usr_login) )' WHERE NAME = 'jlx_user';
PRAGMA writable_schema = 0;
