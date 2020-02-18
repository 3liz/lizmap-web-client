;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

; put here configuration variables that are specific to this installation

; chmod for files created by Lizmap and Jelix
;chmodFile=0664
;chmodDir=0775

[modules]
lizmapdemo.path = "app:../extra-modules/lizmapdemo"
lizmapdemo.access = 2

;; to use ldap for authentication
;; 1. set ldapdao.access=2
;; 2. set driver=ldapdao below
;; 3. launch `lizmap-ctl  install`
ldapdao.access = 0


[coordplugin_auth]
;; change it to ldapdao if you want to use ldap for authentication
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

