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

To stop containers:

```
./run-docker stop 
```


You can execute some commands into the php container, by using this command:

```
./lizmap-ctl <command>
```

Available commands:

* `reset`: to reinitialize the application 
* `composer_update` and `composer_install`: to update PHP packages 
* `clean_tmp`: to delete temp files 
* `install`: to launch the Jelix installer

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
 
