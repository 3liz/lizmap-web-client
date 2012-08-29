;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

startModule=view
startAction="default:index"

[coordplugins]
;name = file_ini_name or 1

auth="index/auth.coord.ini.php"
jacl2="index/jacl2.coord.ini.php"
[responses]

[modules]
lizmap.access=2

jauth.access=2

jauthdb.access=2

jauthdb.installparam=defaultuser

jacl2db.access=2
jacl2db.installparam=defaultuser
[acl2]
driver=db
