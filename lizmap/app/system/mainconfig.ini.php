;<?php die(''); ?>
;for security reasons , don't remove or modify the first line
;this file doesn't list all possible properties. See lib/jelix/core/defaultconfig.ini.php for that

; =============================================================================
; WARNING: DON'T CHANGE ANYTHING IN THIS FILE. IF YOU WANT TO ADD/ MODIFY SOME
; OPTIONS, SET THEM INTO var/config/localconfig.ini.php.
; =============================================================================
; ATTENTION: NE CHANGEZ RIEN DANS CE FICHIER
; SI VOUS VOULEZ MODIFIER/AJOUTER DES OPTIONS DANS CE FICHIER, METTEZ LES
; DANS LE FICHIER var/config/localconfig.ini.php.
; =============================================================================


locale=en_US
charset=UTF-8

; see http://www.php.net/manual/en/timezones.php for supported values
timeZone="Europe/Paris"

theme=default


; the locales available in the application
availableLocales="cs_CZ,de_DE,el_GR,en_US,es_ES,eu_ES,fi_FI,fr_FR,gl_ES,hu_HU,it_IT,ja_JP,nl_NL,no_NO,pl_PL,pt_BR,pt_PT,ro_RO,ru_RU,sl_SI,sv_SE,sk_SK,uk_UA"
; the locale to fallback when the asked string doesn't exist in the current locale
fallbackLocale=en_US

[minimumRequiredVersion]
; Versions on the server, for the system administrator
; The minimum version required about external software to make Lizmap Web Client happy
qgisServer="3.16"
lizmapServerPlugin="2.8.0"

; Versions written in QGIS/CFG files, for the GIS administrator
; Lizmap CFG files with a lower target version are not displayed in the landing page, but displayed in the administration panel to warn the GIS administrator
; Lizmap CFG files with this target version are still displayed in the landing page, but have a warning in the administration panel
; 3 versions behind the current version of LWC
lizmapWebClientTargetVersion=30400

[lizmap]
; CSP header for the map interface
; Exemple value: "default-src 'self' http: https:;connect-src 'self' http: https:;script-src http: https: 'unsafe-inline' 'unsafe-eval'; style-src http: https: 'unsafe-inline';object-src 'none';font-src https:;base-uri 'self';form-action 'self' http: https:;img-src http: https: data: blob:;frame-ancestors http: https:"
; Why these values:
; - some tiles servers or custom scripts may be on http instead of https servers
; - script-src: lizmap or external modules may still have inline script code, and integrated old libraries like Plotly and openlayers2 are using eval() sometimes :-/
; - style-src: lizmap or external modules may still have some inline CSS code
; - some JS code and modules may use the "data:" uri
; - frame-ancestors: lizmap has a specific url to be used into frames
; - connect-src: some JS plugins may do requests to any web API
; - form-action: lizmap may have redirections to external web site after form submits (for authentication like SAML...)
; You can adapt this example to your case, if you know what you do.
; Leave empty if your web server already set the CSP header or if you don't want a CSP header
mapCSPHeader=
; CSP header for the admin interface
adminCSPHeader=

setAdminContactEmailAsReplyTo=off

[modules]
jelix.enabled=on
jelix.installparam[wwwfiles]=copy
jacl.enabled=off
jacldb.enabled=off
jpref.enabled=off
jsoap.enabled=off
junittests.enabled=off
jpref_admin.enabled=off
jacl2.enabled=on
jacl2db.enabled=on
jacl2db.installparam=defaultuser
jauth.enabled=off
jauthdb.enabled=off
jcommunity.enabled=on
jcommunity.installparam[manualconfig]=on
jcommunity.installparam[masteradmin]=off
jcommunity.installparam[defaultusers]="lizmap~defaultusers.json"
jcommunity.installparam[eps]="[index,admin]"
admin.enabled=on
dataviz.enabled=on
filter.enabled=on
action.enabled=on
dynamicLayers.enabled=on
lizmap.enabled=on
proj4php.enabled=on
view.enabled=on
jacl2db_admin.enabled=on
jauthdb_admin.enabled=on
master_admin.enabled=on
multiauth.installparam[manualconfig]=on
multiauth.installparam[eps]="[index,admin]"
ldapdao.installparam[noconfigfile]=on
ldapdao.path="app:vendor/jelix/ldapdao-module/ldapdao"
saml.installparam[localconfig]=on
saml.installparam[authep]=admin

[coordplugins]
;name = file_ini_name or 1
autolocale=1

[coordplugin_autolocale]
; activate the detection from a parameter given in the url
enableUrlDetection=on

; indicate the parameter name indicating the language/locale to use
urlParamNameLanguage=lang


; if no url parameter found, indicate to use one of the prefered language given by the browser
useDefaultLanguageBrowser=on

[tplplugins]
defaultJformsBuilder=html

[responses]
html=myHtmlResponse
htmlmap=myHtmlMapResponse
htmlsimple=simpleHtmlResponse

[jResponseHtml]


[error_handling]
messageLogFormat="%date%\t[%code%]\t%msg%\t%file%\t%line%\n"
errorMessage="An error occured. Sorry for the inconvenience."

[compilation]
checkCacheFiletime=on
force=off

[sessions]
start=1


[urlengine]

; this is the url path to the jelix-www content (you can found this content in lib/jelix-www/)
; because the jelix-www directory is outside the yourapp/www/ directory, you should create a link to
; jelix-www, or copy its content in yourapp/www/ (with a name like 'jelix' for example)
; so you should indicate the relative path of this link/directory to the basePath, or an absolute path.
jelixWWWPath="assets/jelix/"
jqueryPath="assets/jelix/jquery/"

; enable the parsing of the url. Set it to off if the url is already parsed by another program
; (like mod_rewrite in apache), if the rewrite of the url corresponds to a simple url, and if
; you use the significant engine. If you use the simple url engine, you can set to off.
enableParser=on

multiview=off

; basePath corresponds to the path to the base directory of your application.
; so if the url to access to your application is http://foo.com/aaa/bbb/www/index.php, you should
; set basePath = "/aaa/bbb/www/".
; if it is http://foo.com/index.php, set basePath="/"
; Jelix can guess the basePath, so you can keep basePath empty. But in the case where there are some
; entry points which are not in the same directory (ex: you have two entry point : http://foo.com/aaa/index.php
; and http://foo.com/aaa/bbb/other.php ), you MUST set the basePath (ex here, the higher entry point is index.php so
; : basePath="/aaa/" )
basePath=

; leave empty to have jelix error messages
;notfoundAct=
notfoundAct="jelix~error:notfound"

; this is the revision number to add to url of assets. If empty, no revision will be added.
; If "autoconfig", the revision number will be generated automatically each time
; the configuration will be compiled. Else a value can be given directly into the
; configuration, but it is the responsibility to the developer or the administrator
; to indicate a new one each time the application is deployed for example.
assetsRevision = autoconfig

[logger]
_all=
default=file
error=file
warning=file
notice=file
;deprecated=syslog
strict=file
;sql=syslog
metric=syslog
auth=
lizmapadmin=file

[fileLogger]
default=messages.log
error=errors.log
warning=errors.log
notice=errors.log
strict=errors.log
;metric=time.log
auth=messages.log
lizmapadmin=lizmap-admin.log

[mailLogger]
email="root@localhost"
emailHeaders="Content-Type: text/plain; charset=UTF-8\nFrom: webmaster@yoursite.com\nX-Mailer: Jelix\nX-Priority: 1 (Highest)\n"

[mailer]
webmasterEmail="root@localhost"
webmasterName=

; how to send mail : "mail" (mail()), "sendmail" (call sendmail), or "smtp" (send directly to a smtp)
mailerType=mail
; Sets the hostname to use in Message-Id and Received headers
; and as default HELO string. If empty, the value returned
; by SERVER_NAME is used or 'localhost.localdomain'.
hostname=
sendmailPath="/usr/sbin/sendmail"

; if mailer = smtp , fill the following parameters

; SMTP hosts.  All hosts must be separated by a semicolon : "smtp1.example.com:25;smtp2.example.com"
smtpHost=localhost
; default SMTP server port
smtpPort=25
; secured connection or not. possible values: "", "ssl", "tls"
smtpSecure=
; SMTP HELO of the message (Default is hostname)
smtpHelo=
; SMTP authentication
smtpAuth=off
smtpUsername=
smtpPassword=
; SMTP server timeout in seconds
smtpTimeout=10

[jacl2]
; What to do if a right is required but the user has not this right
; 1 = generate an error. This value should be set for web services (xmlrpc, jsonrpc...)
; 2 = redirect to an action
on_error=2

; locale key for the error message when on_error=1
error_message="jelix~errors.acl.action.right.needed"

; action to execute on a missing authentification when on_error=2
on_error_action="jcommunity~login:index"

[acl2]
hiddenRights=
hideRights=off
driver=db
authAdapterClass=jAcl2JAuthAdapter


[forms]
; define input type for datetime widgets : "textboxes" or "menulists"
controls.datetime.input=menulists
; define the way month labels are displayed widgets: "numbers", "names" or "shortnames"
; controls.datetime.months.labels=names
controls.datetime.months.labels=numbers
; define the default config for datepickers in jforms
datepicker=default
datetimepicker=default

[htmleditors]
default.engine.name=ckeditor
ckdefault.engine.name=ckeditor
ckfull.engine.name=ckeditor
ckbasic.engine.name=ckeditor
ckfullandmedia.engine.name=ckeditor

[jcommunity]
loginResponse=htmlauth
registrationEnabled=off
resetPasswordEnabled=on
resetAdminPasswordEnabled=on
verifyNickname=off
;passwordChangeEnabled=on
;accountDestroyEnabled=on
useJAuthDbAdminRights=on
;disableJPref = on


;------- some parameters for the "saml" module
[saml:sp]
; list of dao properties that can be used for mapping
daoPropertiesForMapping="login,email,firstname,lastname,phonenumber"

[pgsqlSchemaTimeout]
; list of timeout for each schema to be sure we have a different connection
; for each lizmap modules, to not share the same search_path. See QgisVectorLayer.
cadastre=31
adresse=32
openads=33

[webassets]
useCollection=common

[webassets_common]
jquery.js[]="assets/js/jquery/jquery-3.5.1.min.js"
jquery.js[]="assets/js/jquery/jquery-migrate-3.3.1.min.js"

jquery_ui.js[]="assets/js/jquery/ui/jquery-ui.min.js"
jquery_ui.css[]="assets/js/jquery/ui/jquery-ui.min.css"

jforms_htmleditor_default.js[]="$jelix/ckeditor5/ckeditor.js"
jforms_htmleditor_default.js[]="$jelix/ckeditor5/translations/$lang.js"
jforms_htmleditor_default.js[]="assets/js/ckeditor5/ckeditor_lizmap.js"

jforms_htmleditor_ckdefault.js[]="$jelix/ckeditor5/ckeditor.js"
jforms_htmleditor_ckdefault.js[]="$jelix/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckdefault.js[]="assets/js/ckeditor5/ckeditor_lizmap.js"

jforms_htmleditor_ckfull.js[]="$jelix/ckeditor5/ckeditor.js"
jforms_htmleditor_ckfull.js[]="$jelix/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckfull.js[]="$jelix/js/jforms/htmleditors/ckeditor_ckfull.js"

jforms_htmleditor_ckbasic.js[]="$jelix/ckeditor5/ckeditor.js"
jforms_htmleditor_ckbasic.js[]="$jelix/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckbasic.js[]="$jelix/js/jforms/htmleditors/ckeditor_ckbasic.js"

jforms_htmleditor_ckfullandmedia.js[]="$jelix/ckeditor5/ckeditor.js"
jforms_htmleditor_ckfullandmedia.js[]="$jelix/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckfullandmedia.js[]="assets/js/ckeditor5/ckeditor_ckfullandmedia.js"

bootstrap.require=jquery
bootstrap.js[]="assets/js/bootstrap.min.js"
bootstrap.css[]="assets/css/bootstrap.min.css"
bootstrap.css[]="assets/css/bootstrap-responsive.min.css"

datatables.require=bootstrap
datatables.js[]=assets/js/jquery.dataTables.min.js
datatables.js[]=assets/js/dataTables.bootstrap.min.js
datatables.js[]="$jelix/datatables/i18n/$locale.js"
datatables.css[]=assets/css/jquery.dataTables.min.css
datatables.css[]=assets/css/dataTables.bootstrap.min.css


map.require=bootstrap
map.js[]=assets/js/OpenLayers-2.13/OpenLayers.js
map.js[]=assets/js/Proj4js/proj4js.min.js
map.js[]=assets/js/jquery.combobox.js
map.js[]=assets/js/TreeTable/javascripts/jquery.treeTable.js
map.js[]=assets/js/map.js
map.js[]=assets/js/lizmap.js
map.css[]=assets/js/TreeTable/stylesheets/jquery.treeTable.css
map.css[]=assets/js/OpenLayers-2.13/theme/default/style.css
map.css[]=assets/css/ol.css
map.css[]=assets/css/main.css
map.css[]=assets/css/map.css
map.css[]=assets/css/media.css

maptheme.css[]="$theme/css/main.css"
maptheme.css[]="$theme/css/map.css"
maptheme.css[]="$theme/css/media.css"


normal.css[]=assets/css/main.css
normal.css[]=assets/css/view.css
normal.css[]=assets/css/media.css

view.js[]=assets/js/view.js

embed.css[]=assets/css/embed.css
embed.css[]="$theme/css/embed.css"

jauthdb_admin.js[]="$jelix/js/authdb_admin.js"
jauthdb_admin.require[]=jquery_ui

jacl2_admin.css[]="$jelix/design/jacl2.css"
jacl2_admin.css[]="$jelix/design/records_list.css"
jacl2_admin.js[]="$jelix/js/jacl2db_admin.js"
jacl2_admin.require[]=jquery_ui

;master_admin.css[]="$jelix/design/master_admin.css"
