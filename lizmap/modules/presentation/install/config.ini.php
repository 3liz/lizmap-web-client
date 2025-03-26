[modules]
jelix.access=1
lizmap.access=1
view.access=1

jacl2db_admin.access=1
jauthdb_admin.access=1
master_admin.access=1

presentation.access=2

[coordplugins]
jacl2=1
auth="index/auth.coord.ini.php"

[coordplugin_jacl2]
on_error=2
error_message="jacl2~errors.action.right.needed"
on_error_action="jelix~error:badright"
