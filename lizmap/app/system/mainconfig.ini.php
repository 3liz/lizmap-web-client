;<?php die(''); ?>
;for security reasons , don't remove or modify the first line
;this file doesn't list all possible properties. See lib/jelix/core/defaultconfig.ini.php for that

; WARNING: IF YOU WANT TO MODIFY SOME OPTIONS, SET THEM INTO localconfig.ini.php.
; Don't change them here.

locale=en_US
charset=UTF-8

; see http://www.php.net/manual/en/timezones.php for supported values
timeZone="Europe/Paris"

theme=default


; the locales available in the application
availableLocales="cs_CZ,de_DE,el_GR,en_US,es_ES,eu_ES,fi_FI,fr_FR,gl_ES,hu_HU,it_IT,ja_JP,nl_NL,pl_PL,pt_BR,pt_PT,ro_RO,ru_RU,sl_SI,sv_SE,sk_SK,uk_UA"
; the locale to fallback when the asked string doesn't exist in the current locale
fallbackLocale=en_US

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
multiauth.installparam[noconfigfile]=on
multiauth.installparam[localconfig]=on
ldapdao.installparam=noconfigfile
ldapdao.path="app:vendor/jelix/ldapdao-module/ldapdao"
saml.installparam="localconfig"

[coordplugins]
;name = file_ini_name or 1
autolocale=1

[coordplugin_jacl2]
; What to do if a right is required but the user has not this right
; 1 = generate an error. This value should be set for web services (xmlrpc, jsonrpc...)
; 2 = redirect to an action
on_error=2

; locale key for the error message when on_error=1
error_message="jelix~errors.acl.action.right.needed"

; action to execute on a missing authentification when on_error=2
on_error_action="jcommunity~login:index"


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

[fileLogger]
default=messages.log
error=errors.log
warning=errors.log
notice=errors.log
strict=errors.log
;metric=time.log
auth=messages.log

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



[acl2]
driver=db


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
useCollection=main

[webassets_main]
jquery.js="assets/js/jquery/jquery-3.5.1.min.js"
jquery_ui.js[]="assets/js/jquery/ui-1.12.1/jquery-ui.min.js"
jquery_ui.css[]="assets/js/jqueryui-1.12.1/jquery-ui.min.css"
jquery_ui.require=jquery


jforms_datepicker_default.require=jquery_ui
jforms_datepicker_default.js[]="$jelix/js/jforms/datepickers/default/init.js"
jforms_datepicker_default.js[]="assets/js/jquery/ui-1.12.1/jquery-ui.min.js"
jforms_datepicker_default.js[]="$jelix/js/jforms/datepickers/default/ui.en.js"
jforms_datepicker_default.js[]="$jelix/jquery/ui/i18n/datepicker-$lang.js"
jforms_datepicker_default.js[]="$jelix/js/jforms/datepickers/default/ui.$lang.js"
jforms_datepicker_default.css[]="assets/js/jquery/ui-1.12.1/jquery-ui.min.css"

jforms_datetimepicker_default.require=jquery_ui
jforms_datetimepicker_default.js[]="$jelix/js/jforms/datepickers/default/init.js"
jforms_datetimepicker_default.js[]="assets/js/jquery/ui-1.12.1/jquery-ui.min.js"
jforms_datetimepicker_default.js[]="$jelix/js/jforms/datepickers/default/ui.en.js"
jforms_datetimepicker_default.js[]="assets/jelix/jquery//ui/i18n/jquery.ui.datepicker-$lang.js"
jforms_datetimepicker_default.js[]="$jelix/js/jforms/datepickers/default/ui.$lang.js"
jforms_datetimepicker_default.css[]="assets/js/jquery/ui-1.12.1/jquery-ui.min.css"

jforms_htmleditor_default.js[]="assets/js/ckeditor5/ckeditor.js"
jforms_htmleditor_default.js[]="assets/js/ckeditor5/translations/$lang.js"
jforms_htmleditor_default.js[]="assets/js/ckeditor5/ckeditor_lizmap.js"

jforms_htmleditor_ckdefault.js[]="assets/js/ckeditor5/ckeditor.js"
jforms_htmleditor_ckdefault.js[]="assets/js/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckdefault.js[]="assets/js/ckeditor5/ckeditor_lizmap.js"

jforms_htmleditor_ckfull.js[]="assets/js/ckeditor5/ckeditor.js"
jforms_htmleditor_ckfull.js[]="assets/js/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckfull.js[]="assets/js/ckeditor5/ckeditor_ckfull.js"

jforms_htmleditor_ckbasic.js[]="assets/js/ckeditor5/ckeditor.js"
jforms_htmleditor_ckbasic.js[]="assets/js/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckbasic.js[]="assets/js/ckeditor5/ckeditor_ckbasic.js"


jforms_htmleditor_ckfullandmedia.require=
jforms_htmleditor_ckfullandmedia.js[]="assets/js/ckeditor5/ckeditor.js"
jforms_htmleditor_ckfullandmedia.js[]="assets/js/ckeditor5/translations/$lang.js"
jforms_htmleditor_ckfullandmedia.js[]="assets/js/ckeditor5/ckeditor_ckfullandmedia.js"

