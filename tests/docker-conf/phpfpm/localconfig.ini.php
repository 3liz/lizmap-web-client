;<?php exit(''); ?>
;for security reasons , don't remove or modify the first line

; put here configuration variables that are specific to this installation

; chmod for files created by Lizmap and Jelix
;chmodFile=0664
;chmodDir=0775

[modules]
;; to use ldap for authentication
;; 1. set multiauth.enabled=on
;; 2. set driver=multiauth below
;; 3. launch `lizmap-ctl  install`
multiauth.enabled = off


[coordplugin_auth]
;; change it to multiauth if you want to use ldap for authentication
driver = Db


[coordplugins]
lizmap=lizmapConfig.ini.php

[jResponseHtml]
plugins = debugbar

[mailer]
mailerType = file
webmasterEmail="root@localhost.org"
webmasterName="root"

[logger]
default = file
error = file
warning = file
notice = file
deprecated = file
auth = file
echoproxy = file

[fileLogger]
echoproxy = echoproxy.log

[jcommunity]
registrationEnabled=off
notificationReceiverEmail="root@localhost.org"

[error_handling]
messageLogFormat = "[%code%]\t%msg%\n  %file%\t%line%\n %url%\n %params%\n ref:%referer%\n%trace%\n\n"
