Installing Lizmap
=================

Requirements
------------

First you should install

- The web server Apache or Nginx
- The PHP-FPM package (`php5-fpm` or `php7.0` on debian/ubuntu) or `libapache2-mod-php` (apache only).
  You can install PHP 5.6 or PHP 7.0/7.1/7.2. You can use generic package names, which will install latest version available (`php5`, `php7.0` `php7.2` etc.)
- The package `curl`, and PHP extensions `curl`, `sqlite3`, `gd` and `xml`:
  - Debian 9 Stretch and Ubuntu 18.04: `apt install curl php-sqlite3 php-gd php-xml php-curl`
- [QGIS](http://qgis.org/en/site/forusers/download.html)
and [its documentation about QGIS Server](https://docs.qgis.org/2.18/en/docs/user_manual/working_with_ogc/server/index.html)
- (optional) PostgreSQL with PostGIS and its php extension (`php-pgsql` or equivalents)

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

If you need to re-install lizmap on the same instance, you need to remove the file `lizmap/var/config/installer.ini.php`. This file is created by the installer.

Using QGIS composer/layouts and PDF in Lizmap
----
* If you plan to print PDF from Lizmap, you need a fake X Server. See `QGIS manual <https://docs.qgis.org/2.18/en/docs/training_manual/qgis_server/install.html#fa-http-server-configuration>`_ searching for `xvfb`. It works for Apache and NGINX

Debug
----

* Check Lizmap settings
* Check logs in Apache/Nginx and QGIS Server.
* Enable logs in your `lizmapConfig.ini.php` with the line `debugMode` (*Administration-->Lizmap configuration-->Services-->Debugging On*)
* Check `lizmap/var/log` (e.g. `tail -f lizmap/var/log/messages.log`). Check the addresses used, paste it in a browser, and check the error displayed.

You can enable the Jelix debug toolbar to get some information:
In `lizmap/var/config/localconfig.ini.php`, add:
```
[debugbar]
plugins = sqllog,sessiondata,defaultlog
defaultPosition = right
```
Documentation of Jelix toolbar: https://docs.jelix.org/en/manual/debugging
