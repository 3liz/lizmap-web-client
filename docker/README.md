# Lizmap web client Docker image

The container deploys one Lizmap instance and may run php-fpm on the command line.
(see [docker/php](https://hub.docker.com/_/php/) )


## Configuration variables

- `LIZMAP_WMSSERVERURL`: URL of the OWS (WMS/WFS/WCS) service used
- `LIZMAP_LIZMAPPLUGINAPIURL`: URL of the lizmap plugin API
- `LIZMAP_DEBUGMODE`: Error level INFO/DEBUG/ERROR/WARNING
- `LIZMAP_CACHESTORAGETYPE`: Always Use 'redis'
- `LIZMAP_CACHEREDISHOST`: Redis host
- `LIZMAP_CACHEREDISPORT`: Redis port (use default if not set)
- `LIZMAP_CACHEEXPIRATION`: Lizmap cache expiration time
- `LIZMAP_CACHEREDISDB`:  Redis Database index used
- `LIZMAP_CACHEREDISKEYPREFIX`: the Redis key prefix to use
- `LIZMAP_USER_ID`: ID of the user used to run Lizmap
- `LIZMAP_GROUP_ID`: ID of the group used to run Lizmap
- `LIZMAP_HOME`: The root path for web files used from the web server
- `LIZMAP_THEME`: Lizmap theme to use
- `LIZMAP_ADMIN_LOGIN`: Login of the admin user
- `LIZMAP_ADMIN_EMAIL`: Email address of the admin user
- `LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE`: The password to set for the admin user. See [Admin Setup Section](#admin-setup)
- `LIZMAP_CONFIG_INCLUDE`: Base directory where to find configurations snippets directories. Default to `/www/lizmap/var/config`.
- `LIZMAP_DATABASE_CHECK_RETRIES`: Number of retries to connect to the PostgreSQL database
   during the startup of the container (default is 10). Used only if Lizmap is configured to
   use a PostgreSQL database (see [profiles.ini.php](https://docs.lizmap.com/3.5/en/install/linux.html#postgresql)).
   The startup script waits for 2 seconds before retries (see `LIZMAP_DATABASE_CHECK_WAIT_BEFORE_RETRY`).
- `LIZMAP_DATABASE_CHECK_WAIT_BEFORE_RETRY`: the amount of time in seconds, between
   two retries of connecting to the PostgreSQL database during the startup. Default is 2 seconds.

**Important**: `LIZMAP_HOME` is the prefix of the path towards Lizmap web files (`lizmap/www`). This prefix
must be identical to the one given in the nginx *root* directive, ex:
```
root <LIZMAP_HOME>/www
```

### Note about configuration snippets.

Configuration files may be split into snippets without tampering with the main configuration files. They must end with `.ini.php` and be valid php ini files.

Configuration snippets are  searched in the following directories:

* `$LIZMAP_CONFIG_INCLUDE/lizmapconfig.d`: all `*.ini.php` files in this directory will be imported to `lizmapConfig.ini.php`
* `$LIZMAP_CONFIG_INCLUDE/localconfig.d`: all `*.ini.php` files in this directory will be imported to `localConfig.ini.php`.
* `LIZMAP_PROFILES_INCLUDE`: Override for `$LIZMAP_CONFIG_INCLUDE/profiles.d`: all `*.ini.php` files in this directory will be imported to `profiles.ini.php`.

Into these ini files, if you want to remove a section from the target file,
declare the section with a value `__drop_in_delete=true`.

Each directory location may be overridden with the following variables:

- `LIZMAP_LIZMAPCONFIG_INCLUDE`: Override location for `lizmapConfig.ini.php` snippets.
- `LIZMAP_LOCALCONFIG_INCLUDE`: Override location for `localconfig.ini.php` snippets
- `LIZMAP_PROFILES_INCLUDE`: Override locations for  `profiles.ini.php` snippets.


### Admin Setup

During installation, an admin user will be setup with the `LIZMAP_ADMIN_*` environnement variables.
The `LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE` value can either be:
- `__reset`: It will initiate a password reset process, an email will be sent
  to `LIZMAP_ADMIN_EMAIL` with a link to choose a new password. The web server
  should be configured properly, and the mailer configuration should be set
  in Lizmap. See the Lizmap documentation.
- `__random`: Will set a random password that will be report into the command line (see `docker logs` to access it).
- `/path/to/pass/file`: The path to a file containing your password. The file must be used as a volume for docker to access it.

### Tuning PHP Variables

- `PM_MAX_CHILDREN`: Maximum number of child processes.
- `PM_START_SERVERS`: The number of child processes created on startup.
- `PM_MIN_SPARE_SERVERS`: The desired minimum number of idle server processes.
- `PM_MAX_SPARE_SERVERS`: The desired maximum number of idle server processes.
- `PM_CHILD_PROCESS`: Control the number of child processes.  Values can be (static,dynamic,ondemand)
- `PM_MAX_REQUESTS`: The number of requests each child process should execute before respawning.
- `PM_PROCESS_IDLE_TIMEOUT`: The number of seconds after which an idle process will be killed.

For more information about these read [PHP](https://www.php.net/manual/en/install.fpm.configuration.php)

## Volumes

The following volumes are used:

- `/srv/projects` (required)
- `/www/lizmap/var/config` (required)
- `/www/lizmap/var/lizmap-theme-config` (required)
- `/www/lizmap/var/db` (required)
- `/www/lizmap/var/log` (recommended)
- `/www/lizmap/www` (required)

**Important**: The folder `/www/lizmap/www` must be bound to a directory that is accessible to the web server (see note above)

## Docker compose configuration example

```
lizmap:
    image: lizmap-wps-web-client:3.6
    command:
      - php-fpm
    environment:
      LIZMAP_WPS_URL: http://wps:8080/ # According to your configuration
      LIZMAP_CACHESTORAGETYPE: redis
      LIZMAP_CACHEREDISDB: '1'
      LIZMAP_USER_ID: '1010'
      LIZMAP_GROUP_ID: '1010'
      LIZMAP_WMSSERVERURL: http://map:8080/ows/
      LIZMAP_CACHEREDISHOST: redis
      LIZMAP_HOME: /srv/lizmap/
    volumes:
      - /srv/lizmap/instances:/srv/projects
      - /srv/lizmap/var/lizmap-theme-config:/www/lizmap/var/lizmap-theme-config
      - /srv/lizmap/var/lizmap-config:/www/lizmap/var/config
      - /srv/lizmap/var/lizmap-db:/www/lizmap/var/db
      - /srv/lizmap/www:/www/lizmap/www
      - /var/log/lizmap:/www/lizmap/var/log
```

## nginx example config

```
server {
    listen 80;

    server_name lizmap;

    root /srv/lizmap/www;  # See discussion about LIZMAP_HOME above
    index index.html index.php;

    access_log /var/log/nginx/lizmap_access.log;
    error_log /var/log/nginx/lizmap_error.log;

    # URI resolved to web sub directory
    # and found a index.php file here
    location ~* /(\w+/)?\w+\.php {

        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        set $path_info $fastcgi_path_info; # because of bug http://trac.nginx.org/nginx/ticket/321

        try_files $fastcgi_script_name =404;
        include fastcgi_params;

        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param SERVER_NAME $http_host;
        fastcgi_param PATH_INFO $path_info;
        fastcgi_param PATH_TRANSLATED $document_root$path_info;
        fastcgi_pass  <lizmap_host>:9000;
    }
}
```

## Installing lizmap modules

### Install from archive

- Mount `/www/lizmap/lizmap-modules/` at a location on the host or a from a named volume.
- Get the archive of the lizmap module and extract it in the `/www/lizmap/lizmap-module/` or
  Add the module configuration snippet in the appropriate snippets' directory (see the module documentation for  the configuration files to modify)
- Follow module documentation on how to activate the module in lizmap.
- Restart the container or run `php /www/lizmap/install/installer.php` from inside the container

### Install from composer packages

- Mount `/www/lizmap/my-packages/` at a location on the host or a from a named volume.
- From inside the container, install your module with the command `lizmap-install-module <package-name>`
- Add the module configuration snippet in the appropriate snippets' directory (see the module documentation for  the configuration files to modify)
- Restart the container or run `php /www/lizmap/install/installer.php` from inside the container

### Install for module development

- Mount `/www/lizmap/lizmap-modules/` at the location of your module sources.
  Add the module configuration snippet in the appropriate snippets' directory (see the module documentation for  the configuration files to modify)
- Follow module documentation on how to activate the module in lizmap.
- Restart the container or run `php /www/lizmap/install/installer.php` from inside the container

### Install as bundled modules

You may ship preinstalled modules in your image inherited from lizmap image. Simply
run the following command in your dockerfile: `lizmap-install-module <package-name>`
