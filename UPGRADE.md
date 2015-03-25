Upgrading Lizmap
================


- backup your data into a directory (ex: /tmp).
  files to backup are:
    - var/db/jauth.db
    - var/db/logs.db
    - var/config/lizmapConfig.ini.php
    - var/config/installer.ini.php 
    - var/config/profiles.ini.php
    - var/config/localconfig.ini.php
  The backup script do it for you:

```
lizmap/install/backup.sh /tmp
```

- Get the lizmap archive (by download an archive or by doing a git clone/pull)
- replace the lib/ directory by the new lib/ directory
- replace the lizmap/ directory by new lizmap/
- restore rights and owner on some directories

```
sudo lizmap/install/set_rights.sh
sudo lizmap/install/clean_vartmp.sh
```

- restore the backup and launch the update process

```
lizmap/install/restore.sh /tmp
php lizmapp/install/install.php
```
