;<?php die(''); ?>
;for security reasons, don't remove or modify the first line

[jdb]
; name of the default profile to use for any connection
default = "%%appname%%"

[jdb:%%appname%%]
; the driver name : mysql, pgsql, sqlite...
driver="mysql"

; For most of drivers:
database="jelix"
host= "localhost"
user= "root"
password=
persistent= on

; when you have charset issues, enable force_encoding so the connection will be
; made with the charset indicated in jelix config
;force_encoding = on

; with the following parameter, you can specify a table prefix which will be
; applied to DAOs automatically. For manual jDb requests, please use the method
; jDbConnection::prefixTable().
;table_prefix =

; to use pdo
;usepdo=on



[jkvdb]
; default profile
default =

;[jkvdb:sectionname] change this
; ----------- Parameters common to all drivers :
; driver type (file, db, memcached)
; driver =

; ---------- memcached driver
;driver = memcached

; servers list
; Can be a list of HOST_NAME:PORT e.g
;  host = memcache_host1:11211;memcache_host2:11211;memcache_host3:11211
; or
;  host[] = memcache_host1:11211
;  host[] = memcache_host2:11211
;  ...
host = "localhost:11211"

; -------- files driver
;driver = file
;storage_dir = temp:kvfiles/mydatabase/

; Automatic cleaning configuration (not necessary with memcached. 0 means disabled, 1 means systematic cache cleaning of expired data (at each set call), greater values mean less frequent cleaning)
;automatic_cleaning_factor = 0
; enable / disable locking file
;file_locking = 1
; directory level. Set the directory structure level. 0 means "no directory structure", 1 means "one level of directory", 2 means "two levels"...
;directory_level = 2
; umask for directory structure (default '0700')
;directory_umask = ""
; umask for cache files (default '0600')
;file_umask =


;----------------- jKVDb for jPref
[jkvdb:jpref]
;driver = 


;----------------- jSoapClient
[jsoapclient]

[jsoapclient:default]
wsdl=
;trace=1
soap_version=SOAP_1_1

;----------------- jCache
[jcache]

default = myapp

[jcache:myapp]

; Parameters common to all drivers :

;    disable or enable cache for this profile
enabled = 1
;    driver type (file, db, memcached)
driver = file
;    TTL used (0 means no expire)
ttl = 0

; Automatic cleaning configuration (not necessary with memcached)
;   0 means disabled
;   1 means systematic cache cleaning of expired data (at each set or add call)
;   greater values mean less frequent cleaning
;automatic_cleaning_factor = 0

; Parameters for file driver :

; directory where to put the cache files (optional default jApp::tempPath('cache/'))
cache_dir =
; enable / disable locking file
file_locking = 1
; directory level. Set the directory structure level. 0 means "no directory structure", 1 means "one level of directory", 2 means "two levels"...
directory_level = 0
; umask for directory structure (default '0700')
directory_umask =
; prefix for cache files (default 'jelix_cache')
file_name_prefix = ""
; umask for cache files (default '0600')
cache_file_umask =

; Parameters for db driver :

; dao used (default 'jelix~jcache')
;dao = ""
; db profile (optional)
;dbprofile = ""


; Parameters for memcached driver :

; Memcached servers.
; Can be a list e.g
;servers = memcache_host1:11211,memcache_host2:11211,memcache_host3:11211 i.e HOST_NAME:PORT
;servers =
