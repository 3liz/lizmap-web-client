;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

; put here configuration variables that are specific to this installation

; chmod for files created by Lizmap and Jelix
;chmodFile=0664
;chmodDir=0775

[modules]
;; uncomment it if you want to use ldap for authentication
;; see documentation to complete the ldap configuration
ldapdao.access = 0
lizmap.installparam = demo

[coordplugin_auth]
;; uncomment it if you want to use ldap for authentication
;; see documentation to complete the ldap configuration
driver = Db


[coordplugins]
lizmap=lizmapConfig.ini.php

[jResponseHtml]
plugins = debugbar

[mailer]
mailerType = file

[logger]
default = file
error = file
warning = file
notice = file
deprecated = file
auth = file

[jcommunity]
registrationEnabled=off

