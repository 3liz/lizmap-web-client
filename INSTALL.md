Installing Lizmap
=================


Requirements
------------

First you should install

- The web server Apache or Nginx
- The PHP-FPM package (`php5-fpm` or `php7.0` on debian/ubuntu) or `libapache2-mod-php` (apache only).
  You can install PHP 5.6 or PHP 7.0/7.1/7.2. So package names start with `php5`, `php7.0` `php7.1` etc.
- The package `curl`, and PHP extensions `curl`, `sqlite3`, `gd` and `xml` (example with PHP 7 on Debian: `php7.0-sqlite3`, `php7.0-gd`, `php7.0-xml` and `php7.0-curl`)
- [QGIS](http://qgis.org/en/site/forusers/download.html)
- (optional) PostgreSQL with PostGIS and its php extension (`php5-pgsql` or equivalents)

Get the source
--------------

Download the Lizmap archive or get files from https://github.com/3liz/lizmap-web-client/.

Copy files to a directory for apache, let's say  /var/www/mylizmap/.


Installation
------------

Create `lizmapConfig.ini.php`, `localconfig.ini.php` and `profiles.ini.php` and edit them
to set parameters specific to your installation. You can modify `lizmapConfig.ini.php`
to set the url of qgis map server and other things, and `profiles.ini.php` to store
data in a database other than an sqlite database.

```
cd lizmap/var/config
cp lizmapConfig.ini.php.dist lizmapConfig.ini.php
cp localconfig.ini.php.dist localconfig.ini.php
cp profiles.ini.php.dist profiles.ini.php
```
In case you want to enable the demo repositories, just add to ``localconfig.ini.php`` the following:

```
[modules]
lizmap.installparam=demo
```
then exit the directory:

```
cd ../../..
```
Set rights for Apache, so php scripts could write some temporary files or do changes.

```
lizmap/install/set_rights.sh www-data www-data
```

Then you can launch the installer

```
php lizmap/install/installer.php
```

Test
----

In your browser, launch: http://127.0.0.1/mylizmap/lizmap/www.

In case you get a ``500 - internal server error``, run again:

```
cd /var/www/mylizmap/
lizmap/install/set_rights.sh www-data www-data
```
and eventually restart apache.
