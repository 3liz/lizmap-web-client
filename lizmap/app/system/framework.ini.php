;<?php die('');?>
; =============================================================================
; WARNING: DON'T CHANGE ANYTHING IN THIS FILE. IF YOU WANT TO ADD/ MODIFY SOME
; OPTIONS, SET THEM INTO var/config/localframework.ini.php.
; =============================================================================
; ATTENTION: NE CHANGEZ RIEN DANS CE FICHIER
; SI VOUS VOULEZ MODIFIER/AJOUTER DES OPTIONS DANS CE FICHIER, METTEZ LES
; DANS LE FICHIER var/config/localframework.ini.php.
; =============================================================================

[entrypoint:index.php]
config="index/config.ini.php"
type=classic
default=1

[entrypoint:admin.php]
config="admin/config.ini.php"
type=classic

[entrypoint:script.php]
config="cmdline/script.ini.php"
type=cmdline
