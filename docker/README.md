# Lizmap web client Docker image with WPS support

The container deploy one lizmap instance and may run php-fpm on commande line.
(cf [docker/php](https://hub.docker.com/_/php/) )


## Configuration variables

- LIZMAP\_WMSSERVERURL: URL of the OWS (WMS/WFS/WCS) service used by the WPS service 
- LIZMAP\_DEBUGMODE: Error level INFO/DEBUG/ERROR/WARNING
- LIZMAP\_CACHESTORAGETYPE: Always Use 'redis'
- LIZMAP\_CACHEREDISHOST: Redis host
- LIZMAP\_CACHEREDISPORT: Redis port (use default if not set)
- LIZMAP\_CACHEEXPIRATION: Lizmap cache expiration time 
- LIZMAP\_CACHEREDISDB:  Redis Database index used 
- LIZMAP\_CACHEREDISKEYPREFIX: the redis key prefix to use
- LIZMAP\_USER: User used to run Lizmap
- LIZMAP\_HOME: The root path for web files used from the web server
- LIZMAP\_THEME: Lizmap theme to use

**Important**: LIZMAP\_HOME is the prefix of the path towards lizmap web files (lizmap/www). This prefix
must be identical to the one given in the nginx *root* directive, ex:
```
root <LIZMAP_HOME>/www
```

### Tuning PHP Variables
- PM_MAX_CHILDREN: Maximum number of child processes.
- PM_START_SERVERS: The number of child processes created on startup.
- PM_MIN_SPARE_SERVERS: The desired minimum number of idle server processes.
- PM_MAX_SPARE_SERVERS: The desired maximum number of idle server processes.
- PM_CHILD_PROCESS: Control the number of child processes values can be (static,dynamic,ondemand)
- PM_MAX_REQUESTS: The number of requests each child process should execute before respawning
- PM_PROCESS_IDLE_TIMEOUT: The number of seconds after which an idle process will be killed.

For more information about these read [PHP](https://www.php.net/manual/en/install.fpm.configuration.php)
## Volumes

The following volumes are used:

- /srv/projects (required)
- /www/lizmap/var/config (required)
- /www/lizmap/var/lizmap-theme-config (required)
- /www/lizmap/var/db (required)
- /www/lizmap/var/log (recommended)
- /www/lizmap/www (required)

**Important**: The folder /www/lizmap/www must be binded to a directory that is accessible to the web server (see note above)

## Docker compose configuration example

```
lizmap:
    image: lizmap-wps-web-client:3.2
    command: 
      - php-fpm
    environment:
      LIZMAP_WPS_URL: http://wps:8080/ # According to your configuration
      LIZMAP_CACHESTORAGETYPE: redis   
      LIZMAP_CACHEREDISDB: '1'
      LIZMAP_USER: '1010'
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

