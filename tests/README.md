Testing Lizmap
===============

A docker configuration is provided to launch Lizmap into a container.
You must install Docker on your machine first. Then you should execute
the run-docker script.

To launch containers the first time:

```
./run-docker build
```

Then:

```
./run-docker 
```

You must set lizmap.local into your /etc/hosts
```
127.0.0.1 lizmap.local
```

Then, in your browser, go to `http://lizmap.local:8130/`.

If you want to use pgadmin or any other postgresql client, access credentials are:

- host: `lizmap.local`
- port: 8132
- database: `lizmap`
- user: `lizmap`
- password: `lizmap1234!`


To stop containers:

```
./run-docker stop 
```

You may have to close connections to the postgresql database if you are using
Pgadmin for example, before stopping containers. 

You can execute some commands into the php container or other containers, by using this command:

```
./lizmap-ctl <command>
```

Note: Launch `reset` or `reset-sqlite` the first time you launch docker, if lizmap
was already configured for the Vagrant machine.

Available commands:

* `reset`: to reinitialize the application (with lizmap data stored into Postgresql) 
* `reset-sqlite`: to reinitialize the application (with lizmap data stored into sqlite) 
* `composer_update` and `composer_install`: to update PHP packages 
* `clean_tmp`: to delete temp files 
* `install`: to launch the Jelix installer
* `shell` and `shellroot` : to enter into the php container
* `ldapreset` to reset the ldap content, and `ldapusers` to store some users for tests
* `pgsql` to enter into the interactive command line of postgresql (psql)
* `redis-cli` to enter into the interactive command line of Redis (redis-cli)

Launching unit-tests
====================

This directory contains some unit tests.

To launch tests:

- Launch the lizmap application as indicated above.
- launch `./lizmap-ctl unittests`

Using LDAP
=========

Into `lizmap/var/config/localconfig.ini.php`:

1. set `ldapdao.access=2` into the `modules` section
2. set `driver=ldapdao` into the `coordplugin_auth` section
3. launch `lizmap-ctl  install`

Be sure there are users into the ldap: execute `lizmap-ctl ldapusers`. It should 
show a list of users (Jane and John). If there are not present, launch `lizmap-ctl ldapreset`.

You should then be able to connect yourself into lizmap with login jane (password: passjane) or
login john (password: passjohn).

Using Redis for cache
=====================

Into `lizmap/var/config/lizmapConfig.ini.php`, set `cacheStorageType=redis`
into the `services` section.

Into `lizmap/var/config/profiles.ini.php`, uncomment parameters into the `jcache:qgisprojects`
section.

You can inspect the content of Redis with `lizmap-ctl redis-cli`.
 
Testing qgis projects
======================

Put your projects into `tests/qgis_projects/rep1/` (replace `rep1` by the name 
of your choice), and then you can declare `rep1` projects into the admin page
of Lizmap, or in its `var/config/lizmapConfig.ini.php`
