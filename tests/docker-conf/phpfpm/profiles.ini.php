;<?php die(''); ?>
;for security reasons, don't remove or modify the first line

[jdb]

; name of the default profile to use for any connection
default=jauth
jacl2_profile=jauth
lizlog=jauth

[jdb:jauth]
;driver=sqlite3
;database="var:db/jauth.db"

driver=pgsql
host=pgsql
database=lizmap
user=lizmap
password="lizmap1234!"
search_path=lizmap,public

;[jdb:lizlog]
;driver=sqlite3
;database="var:db/logs.db"

; when you have charset issues, enable force_encoding so the connection will be
; made with the charset indicated in jelix config
;force_encoding = on

; with the following parameter, you can specify a table prefix which will be
; applied to DAOs automatically. For manual jDb requests, please use method
; jDbConnection::prefixTable().
;table_prefix =

; Example for pdo :
;driver=pdo
;dsn=mysql:host=localhost;dbname=test
;user=
;password=


; ldap configuration. See documentation
[ldap:lizmapldap]
hostname=openldap
port=389
adminUserDn="cn=admin,dc=tests,dc=lizmap"
adminPassword="passlizmap"

; base dn to search users. Used to search a user using the filter from searchUserFilter
; example for Active Directory: "ou=ADAM users,o=Microsoft,c=US", or "OU=Town,DC=my-town,DC=com"
searchUserBaseDN="ou=people,dc=tests,dc=lizmap"

; filter to get user information, with the given login name
; example for Active Directory: "(sAMAccountName=%%LOGIN%%)"
searchUserFilter[]="(&(objectClass=inetOrgPerson)(uid=%%LOGIN%%))"
searchUserFilter[]="(&(objectClass=simpleSecurityObject)(cn=%%LOGIN%%))"


; the dn to bind the user to login.
; The value can contain a `?` that will be replaced by the corresponding
; attribute value readed from the result of searchUserFilter.
; Or it can contain  `%%LOGIN%%`, replaced by the given login
; Or it can contain only an attribute name, starting with a `$`: the
; attribute should then contain a full DN.
bindUserDN="uid=%?%,ou=people,dc=tests,dc=lizmap"
;It can be a list of DN template:
;bindUserDN[]= ...
;bindUserDN[]= ...

; attributes to retrieve for a user
; for dao mapping: "ldap attribute:dao attribute"
; ex: "uid:login,givenName:firstname,mail:email" : uid goes into the login property,
; ldap attribute givenName goes to the property firstname etc..
; example for Active Directory: "cn,distinguishedName,name"
; or "sAMAccountName:login,givenName:firstname,sn:lastname,mail:email,distinguishedName,name,dn"
searchAttributes="uid:login,givenName:firstname,sn:lastname,mail:email"

; search ldap filter to retrieve groups of a user.
; The user will be assign to jAcl2 groups having the same name of ldap groups.
; Leave empty if you don't want this synchronisation between jAcl2 groups and
; ldap groups.
; !!! IMPORTANT !!! : if searchGroupFilter is not empty,
; the plugin will remove the user from all existing jelix groups
; and only keep the relation between the user and the group retrieved from LDAP
;searchGroupFilter="(&(objectClass=posixGroup)(cn=XYZ*)(memberUid=%%LOGIN%%))"
searchGroupFilter=

; the property in the ldap entry corresponding to a group, that indicate the
; the group name
searchGroupProperty="cn"

; base dn to search groups. Used to search a group using the filter from searchGroupFilter
searchGroupBaseDN=""


[jcache]

; name of the default profil to use for cache
default=myapp


[jcache:myapp]
; disable or enable cache for this profile
enabled=1
; driver type (file, db, memcached)
driver=file
; TTL used (0 means no expire)
ttl=0


; Automatic cleaning configuration (not necessary with memcached)
;   0 means disabled
;   1 means systematic cache cleaning of expired data (at each set or add call)
;   greater values mean less frequent cleaning
;automatic_cleaning_factor = 0

; Parameters for file driver :

; directory where to put the cache files (optional default 'JELIX_APP_TEMP_PATH/cache/')
cache_dir=
; enable / disable locking file
file_locking=1
; directory level. Set the directory structure level. 0 means "no directory structure", 1 means "one level of directory", 2 means "two levels"...
directory_level=0
; umask for directory structure (default jelix one : 0775)
directory_umask=
; prefix for cache files (default 'jelix_cache')
file_name_prefix=
; umask for cache files (default jelix one: 0664)
cache_file_umask=

; Parameters for db driver :

; dao used (default 'jelix~jcache')
;dao = ""
; dbprofil (optional)
;dbprofile = ""


; Parameters for memcached driver :

; Memcached servers.
; Can be a list e.g
;servers = memcache_host1:11211,memcache_host2:11211,memcache_host3:11211 i.e HOST_NAME:PORT
;servers =

[jcache:qgisprojects]
enabled=1
ttl=0
driver=redis_ext
host=redis
port=6379
db=1

[jcache:acl2db]
enabled=1
ttl=0
driver=redis_ext
host=redis
port=6379
db=2

[jcache:requests]
enabled=1
ttl=0
driver=redis_ext
host=redis
port=6379
db=0

[webdav:default]
baseUri=http://webdav/
enabled=1
user=webdav
password=webdav
