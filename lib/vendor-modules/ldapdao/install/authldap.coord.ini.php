;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

;============= Main parameters

; driver name : "ldap", "Db", "Class" or "LDS" (respect the case of characters)
driver = "ldapdao"

;============ Parameters for the plugin
; session variable name
session_name = "JELIX_USER"

; Says if there is a check on the ip address : verify if the ip
; is the same when the user has been connected
secure_with_ip = 0

;Timeout. After the given time (in minutes) without activity, the user is disconnected.
; If the value is 0 : no timeout
timeout = 0

; If the value is "on", the user must be authentificated for all actions, except those
; for which a plugin parameter  auth.required is false
; If the value is "off", the authentification is not required for all actions, except those
; for which a plugin parameter  auth.required is true
auth_required = off

; What to do if an authentification is required but the user is not authentificated
; 1 = generate an error. This value should be set for web services (xmlrpc, jsonrpc...)
; 2 = redirect to an action
on_error = 2

; locale key for the error message when on_error=1
error_message = "jauth~autherror.notlogged"

; action to execute on a missing authentification when on_error=2
on_error_action = "jauth~login:form"

; action to execute when a bad ip is checked with secure_with_ip=1 and on_error=2
bad_ip_action = "jauth~login:out"


;=========== Parameters for jauth module

; number of second to wait after a bad authentification
on_error_sleep = 0

; action to redirect after the login
after_login = "jauth~login:form"

; action to redirect after a logout
after_logout = "jauth~login:form"

; says if after_login can be overloaded by a "auth_url_return" parameter in the url/form for the login
enable_after_login_override = on

; says if after_logout can be overloaded by a "auth_url_return" parameter in the url/form for the login
enable_after_logout_override = on

;============ Parameters for the persistance of the authentification

; enable the persistance of the authentification between two sessions
persistant_enable=on

; the name of the cookie which is used to store data for the authentification
persistant_cookie_name=jelixAuthentificationCookie

; duration of the validity of the cookie (in days). default is 1 day.
persistant_duration = 1

;=========== parameters for password hashing

; method of the hash. 0 or "" means old hashing behavior of jAuth
; (using password_* parameters in drivers ).
; Prefer to choose 1, which is the default hash method (bcrypt).
password_hash_method = 1

; options for the hash method. list of "name:value" separated by a ";"
password_hash_options = 

;=========== Parameters for drivers

[ldapdao]

compatiblewithdb = on

; name of the dao to get user data
dao = "jauthdb~jelixuser"

; profile to use for jDb 
profile = "jauth"

; profile to use for ldap
ldapprofile = ""

; ldap needs clear password to connect, this is useless for our plugin
; except for the admin user.
; even if password_hash_method is activated, we set it to allow
; password storage migration
; @deprecated
password_crypt_function = sha1

; name of the form for the jauthdb_admin module
form = "jauthdb_admin~jelixuser"

; path of the directory where to store files uploaded by the form (jauthdb_admin module)
; should be related to the var directory of the application
uploadsDirectory= ""

; this is the jelix user that have admin rights. It will not be verified in the
; ldap
jelixAdminLogin="admin"

;--- ldap parameters
; all of this following parameters should be set into the profiles.ini.php file.
; Here is their default values.

; base dn to search users. Used to search a user using the filter from searchUserFilter
; example for Active Directory: "ou=ADAM users,o=Microsoft,c=US", or "OU=Town,DC=my-town,DC=com"
searchUserBaseDN="dc=XY,dc=fr"

; filter to get user information, with the given login name
; example for Active Directory: "(sAMAccountName=%%LOGIN%%)"
searchUserFilter="(&(objectClass=posixAccount)(uid=%%LOGIN%%))"
; it can be a list:
;searchUserFilter[]=...
;searchUserFilter[]=...

; the dn to bind the user to login.
; The value can contain a `?` that will be replaced by the corresponding
; attribute value readed from the result of searchUserFilter.
; Or it can contain  `%%LOGIN%%`, replaced by the given login
; Or it can contain only an attribute name, starting with a `$`: the
; attribute should then contain a full DN.
bindUserDN="uid=%?%,ou=users,dc=XY,dc=fr"
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
; (except default groups if searchGroupKeepUserInDefaultGroups is set to on)
; and only keep the relation between the user and the group retrieved from LDAP
;searchGroupFilter="(&(objectClass=posixGroup)(cn=XYZ*)(memberUid=%%LOGIN%%))"
searchGroupFilter=

; if set to on, users are set in default groups during groups synchronization
; default is on.
searchGroupKeepUserInDefaultGroups = on

; the property in the ldap entry corresponding to a group, that indicate the
; the group name
searchGroupProperty="cn"

; base dn to search groups. Used to search a group using the filter from searchGroupFilter
searchGroupBaseDN=""

