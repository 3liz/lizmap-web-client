# Installing Lizmap

## Versions

We recommend you reading the [versions](https://github.com/3liz/lizmap-web-client/wiki/Versions) page about
QGIS Server, webbrowsers etc.

## Requirements

Read requirements on the [release page](https://github.com/3liz/lizmap-web-client/releases) about the version you are
installing.

First you should install :

- The web server Apache or Nginx
- The PHP-FPM package (`php7.4-fpm`, `php8.0-fpm` or  `php8.1-fpm` on debian/ubuntu).
  You can install PHP 7.4/8.0/8.1. You can use generic package names, which will install latest
  version available (`php7.4`, `php8.0` etc.)
- The package `curl`, and PHP extensions `curl`, `sqlite3`, `gd` and `xml`
- [QGIS](http://qgis.org/en/site/forusers/download.html)
and [its documentation about QGIS Server](https://docs.qgis.org/3.22/en/docs/server_manual/index.html).
  We recommend **strongly** to use the same version on the server **and** on the desktop. QGIS Server will read
  your QGS file and obviously can't read a file made with a newer version of QGIS Desktop.
- (optional but highly recommended) PostgreSQL with PostGIS and its PHP extension (`php8.1-pgsql` or equivalents)

## Get the source

- Download the Lizmap ZIP archive from:
  - [the release page on GitHub](https://github.com/3liz/lizmap-web-client/releases) for stable releases.
  - [3liz website](https://packages.3liz.org/pub/lizmap/unstable/) for unstable releases.
- Copy files from the ZIP package to a directory for Apache/Nginx, let's say `/var/www/mylizmap/`.

**Warning**. **Do not use the source code from git**, except if you
are a developer and you want to contribute on the code of Lizmap.
Since Lizmap 3.4, **the source code in the repository is not usable directly**.
You must build the application. Read [how to contribute](./CONTRIBUTING.md) to build your own package.

## Installation

Create `lizmapConfig.ini.php`, `localconfig.ini.php` and `profiles.ini.php` and edit them
to set parameters specific to your installation. You can modify `lizmapConfig.ini.php`
to set the url of qgis map server and other things, and `profiles.ini.php` to store
data in a database other than an sqlite database.

```bash
cd lizmap/var/config
cp lizmapConfig.ini.php.dist lizmapConfig.ini.php
cp localconfig.ini.php.dist localconfig.ini.php
cp profiles.ini.php.dist profiles.ini.php
```

then exit the directory:

```bash
cd ../../..
```

Set rights for Nginx/Apache, so php scripts could write some temporary files or do changes.

```bash
lizmap/install/set_rights.sh www-data www-data
```

Then you can launch the installer

```bash
php lizmap/install/installer.php
```

## Additional features

It's possible to add additional features in Lizmap by adding :

* Lizmap modules, in the PHP application, the list is available on
  [https://docs.lizmap.com](https://docs.lizmap.com/next/fr/introduction.html#additional-lizmap-modules).
* QGIS Server plugins, the list is available on
  [https://docs.lizmap.com](https://docs.lizmap.com/next/fr/install/linux.html#qgis-server-plugins)

## Test

In your browser, launch: http://127.0.0.1/mylizmap/lizmap/www.

In case you get a ``500 - internal server error``, run again:

```bash
cd /var/www/mylizmap/
lizmap/install/set_rights.sh www-data www-data
```
and eventually restart apache.

If you need to re-install lizmap on the same instance, you need to remove the file `lizmap/var/config/installer.ini.php`. This file is created by the installer.

If you want to test lizmap with some demo qgis projects, you should launch
`lizmap/install/reset.sh --keep-config --demo`. You must install some
tools : unzip and wget or curl.


### Using QGIS composer/layouts and PDF in Lizmap

If you plan to print PDF from Lizmap, you need a fake X Server.
See `QGIS manual <https://docs.qgis.org/2.18/en/docs/training_manual/qgis_server/install.html#fa-http-server-configuration>`_ searching for `xvfb`.
It works for Apache and NGINX

### Debug

* Check Lizmap settings
* Check logs in Apache/Nginx and QGIS Server.
* Enable logs in your `lizmapConfig.ini.php` with the line `debugMode` (*Administration-->Lizmap configuration-->Services-->Debugging On*)
* Check `lizmap/var/log` (e.g. `tail -f lizmap/var/log/messages.log`). Check the addresses used, paste it in a browser, and check the error displayed.

You can enable the Jelix debug toolbar to get some information:
In `lizmap/var/config/localconfig.ini.php`, add:
```ini
[jResponseHtml]
plugins = debugbar

[debugbar]
plugins = sqllog,sessiondata,defaultlog
defaultPosition = right
```
Documentation of Jelix toolbar: https://docs.jelix.org/en/manual/debugging
