Testing Lizmap
===============

A docker configuration is provided to launch Lizmap into a container.

To launch containers the first time:

```
./run-docker
```

You can execute some commands into the php container, by using this command:

```
./dockerappctl.sh <command>
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
- launch `./dockerappctl.sh phpunit`


