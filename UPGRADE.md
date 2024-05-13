Upgrading to Lizmap 3.0
========================

First, be sure that your lizmap installation has been upgraded to the latest version
of 2.x.

Then you can upgrade to Lizmap 3.0.

### Data backup

Backup your data into a directory (ex: /tmp).

Lizmap 2.12.2 and higher has a lizmap/install/backup.sh script. Call

```
lizmap/install/backup.sh /tmp
```

If you don't have this script, backup by hand: copy these files somewhere, /tmp for instance:

- var/db/jauth.db
- var/db/logs.db
- var/config/lizmapConfig.ini.php
- var/config/installer.ini.php
- var/config/profiles.ini.php


### Replace lizmap files

Get the lizmap archive (by downloading an archive or by doing a git clone/pull)

You should

- replace the lizmap/ directory by new lizmap/


### Restore data and clean installation


Restore rights and owner on some directories. Here is an example where "myuser" is the
user owning the application file, and "www-data", the group of the web server.

```
sudo lizmap/install/set_rights.sh laurent www-data #replace `laurent` with your name
sudo lizmap/install/clean_vartmp.sh
```

Then you can restore the backup, by giving the path where the backuped file where previously saved:

```
lizmap/install/restore.sh /tmp
```

Note: Lizmap 3.0 requires that `*.db` files should be stored in var/db/, not in var/ as in 2.x


Last step: launch the upgrade script

```
php lizmap/install/upgrade-to-3.php
```
