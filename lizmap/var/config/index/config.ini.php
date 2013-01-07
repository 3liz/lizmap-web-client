;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

startModule=view
startAction="default:index"

pluginsPath="app:plugins/,lib:jelix-plugins/,module:jacl2db/plugins"
[coordplugins]
;name = file_ini_name or 1

auth="index/auth.coord.ini.php"
jacl2="index/jacl2.coord.ini.php"
[responses]

[modules]
lizmap.access=2
jauth.access=2
master_admin.access=2
jauthdb.access=2
jauthdb.installparam=defaultuser
jauthdb_admin.access=2
jacl2db.access=2
jacl2db.installparam=defaultuser
jacl2db_admin.access=2
admin.access=2
[simple_urlengine_entrypoints]
index="jauth~*@classic"
admin="jacl2db~*@classic, jacl2db_admin~*@classic, jauthdb_admin~*@classic, master_admin~*@classic, admin~*@classic"
[acl2]
driver=db

