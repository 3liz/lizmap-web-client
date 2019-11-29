
Testing Lizmap with Vagrant
===========================

**If you download Lizmap Web Client as an archive, vagrant directory will be empty. Use `git clone` instead.**

To contribute to the project, and to test Lizmap, there is a configuration 
in this directory to setup a virtual machine using Vagrant. 

Here are steps:

- install [Virtual box](https://www.virtualbox.org/) and [Vagrant](http://www.vagrantup.com/downloads.html)
- go into the vagrant/ directory (where there is the README.md file you're reading)

```
cd vagrant/
```

- copy `vagrant/vars/custom.yml.dist` to `vagrant/vars/custom.yml` and change some
  settings if needed. You can enable postgresql storage for Lizmap data, or
  enable ldap authentication for example.
  *NB* If you need bleeding edge softwares, you can copy instead `vagrant/vars/custom.yml.latest` to `vagrant/vars/custom.yml` and make the changes.
- launch the vagrant virtual machine:

```
vagrant up
```

It will create a virtual machine with all needed software:
postgresql, postgis, redis, nginx, php, QGIS server... 

It can take time the first time. It depends of your internet connection.

If you have an error like

```
GuestAdditions versions on your host (Y.Y.Y) and guest (Y.Y.Y) do not match.
...
E: Unable to locate package linux-headers-x.x.x-amd64
E: Couldn't find any package by glob 'linux-headers-x.x.x-amd64'
E: Couldn't find any package by regex 'linux-headers-x.x.x-amd64'
```

Enter in the virtual machine, `vagrant ssh`, and then launch `sudo apt-get update`,
then `sudo apt-get dist-upgrade`. When the upgrade is finished, type `exit`.
Then stop and restart the VM: `vagrant halt && vagrant up && vagrant provision`.

When the "Done" message appears, and if there are no errors, Lizmap is
ready. Go in `http://localhost:8130/` to see the app.

You can authenticate yourself in the application with the login "admin" 
and the password "admin". If you did enable the ldap authentication, you can
also try these users/password: john / passjohn and jane / passjane.

You can now modify the source code of Lizmap, and see changes into your
web browser.

If you want to do requests directly to QGIS, the address is `http://localhost:8131/`.
If you want to connect to the postgresql database, the address is localhost
and the port is 8132.

To enter into the virtual machine, type:

```
vagrant ssh
```

To shutdown the virtual machine, type:

```
vagrant halt
```
