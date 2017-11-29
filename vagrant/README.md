
Testing Lizmap with Vagrant
===========================

To contribute to the project, and to test Lizmap, there is a configuration 
in this directory to setup a virtual machine using Vagrant. 

Here are steps:

- install [Virtual box](https://www.virtualbox.org/) and [Vagrant](http://www.vagrantup.com/downloads.html)
- go into the vagrant/ directory (where there is the README.md file you're reading),
 launch the vagrant virtual machine:

```
cd vagrant/
vagrant up
```

It will create a virtual machine with all needed software:
postgresql, postgis, redis, nginx, php, QGIS server... 

It can take time the first time. It depends of your internet connection.

When the "Done" message appears, and if there are no errors, Lizmap is
ready. Go in http://localhost:8130/ to see the app.

You can authenticate yourself in the application with the login "admin" 
and the password "admin".

You can now modify the source code of Lizmap, and see changes into your
web browser.

To enter into the virtual machine, type:

```
vagrant ssh
```

To shutdown the virtual machine, type:

```
vagrant halt
```