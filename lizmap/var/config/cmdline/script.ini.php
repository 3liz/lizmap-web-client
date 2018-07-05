;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

startModule=jelix
startAction="default:index"

[responses]
[coordplugins]
auth="cmdline/auth.coord.ini.php"
jacl2=1
[coordplugin_jacl2]
on_error=1
error_message="jacl2~errors.action.right.needed"
on_error_action="jelix~error:badright"

[modules]
master_admin.access=1
jauthdb_admin.access=1
jacl2db_admin.access=1
lizmap.access=2
