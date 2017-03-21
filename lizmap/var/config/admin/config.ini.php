;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

startModule=master_admin
startAction="default:index"

[responses]
html=adminHtmlResponse
htmlauth=adminLoginHtmlResponse

[modules]
admin.access=2
jauth.access=2
jauthdb_admin.access=2
jacl2db_admin.access=2
master_admin.access=2
jauthdb.access=1

[coordplugins]
auth="admin/auth.coord.ini.php"
jacl2=1



