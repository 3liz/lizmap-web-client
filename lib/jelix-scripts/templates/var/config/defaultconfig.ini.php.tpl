;<?php die(''); ?>
;for security reasons , don't remove or modify the first line
;this file doesn't list all possible properties. See lib/jelix/core/defaultconfig.ini.php for that

startModule = "%%modulename%%"
startAction = "default:index"

locale = "%%default_locale%%"
availableLocales = "%%default_locale%%"
charset = "UTF-8"

; see http://www.php.net/manual/en/timezones.php for supported values
timeZone = "%%default_timezone%%"

theme = default

pluginsPath = app:plugins/,lib:jelix-plugins/

modulesPath = lib:jelix-modules/,app:modules/

; default domain name to use with jfullurl for example.
; Let it empty to use $_SERVER['SERVER_NAME'] value instead.
domainName =


[modules]
; modulename.access = x where x =
; 0 if installed but not used (database schema is ok for example)
; 1 if accessible by other modules (other modules can use it, but it is not accessible directly through the web)
; 2 if public (accessible through the web)

jelix.access = 2

; jacldb is deprecated. keep it uninstall if possible. install jacl2db instead
jacldb.access = 0

jacl2db.access = 0
jauth.access = 0
jauthdb.access = 0
junittests.access = 0
jWSDL.access = 0

[coordplugins]
;name = file_ini_name or 1

[tplplugins]
defaultJformsBuilder = html

[responses]
html=myHtmlResponse

[error_handling]
;errorMessage="A technical error has occured (code: %code%). Sorry for this inconvenience."

;[compilation]
;checkCacheFiletime  = on
;force  = off

[urlengine]
; name of url engine :  "simple", "basic_significant" or "significant"
engine        = basic_significant

; this is the url path to the jelix-www content (you can found this content in lib/jelix-www/)
; because the jelix-www directory is outside the yourapp/www/ directory, you should create a link to
; jelix-www, or copy its content in yourapp/www/ (with a name like 'jelix' for example)
; so you should indicate the relative path of this link/directory to the basePath, or an absolute path.
; if you change it, you probably want to change path in datepickers, wikieditors and htmleditors sections
jelixWWWPath = "jelix/"
jqueryPath="jelix/jquery/"

; enable the parsing of the url. Set it to off if the url is already parsed by another program
; (like mod_rewrite in apache), if the rewrite of the url corresponds to a simple url, and if
; you use the significant engine. If you use the simple url engine, you can set to off.
enableParser = on

multiview = off

; basePath corresponds to the path to the base directory of your application.
; so if the url to access to your application is http://foo.com/aaa/bbb/www/index.php, you should
; set basePath = "/aaa/bbb/www/".
; if it is http://foo.com/index.php, set basePath="/"
; Jelix can guess the basePath, so you can keep basePath empty. But in the case where there are some
; entry points which are not in the same directory (ex: you have two entry point : http://foo.com/aaa/index.php
; and http://foo.com/aaa/bbb/other.php ), you MUST set the basePath (ex here, the higher entry point is index.php so
; : basePath="/aaa/" )
basePath = ""

defaultEntrypoint= index

entrypointExtension= .php

; action to show the 'page not found' error
notfoundAct = "jelix~error:notfound"

; list of actions which require https protocol for the simple url engine
; syntax of the list is the same as explained in the simple_urlengine_entrypoints
simple_urlengine_https =

[simple_urlengine_entrypoints]
; parameters for the simple url engine. This is the list of entry points
; with list of actions attached to each entry points

; script_name_without_suffix = "list of action selectors separated by a space"
; selector syntax :
;   m~a@r    -> for the action "a" of the module "m" and for the request of type "r"
;   m~c:*@r  -> for all actions of the controller "c" of the module "m" and for the request of type "r"
;   m~*@r    -> for all actions of the module "m" and for the request of type "r"
;   @r       -> for all actions for the request of type "r"

index = "@classic"


[basic_significant_urlengine_entrypoints]
; for each entry point, it indicates if the entry point name
; should be include in the url or not
index = on
xmlrpc = on
jsonrpc = on
rdf = on


[jResponseHtml]
; list of active plugins for jResponseHtml
; remove the debugbar plugin on production server, and in this case don't forget
; to remove the memory logger from the logger section
plugins = debugbar


[logger]
; list of loggers for each categories of log messages
; available loggers : file, syslog, firebug, mail, memory. see plugins for others

; _all category is the category containing loggers executed for any categories
; /!\ remove the memory logger if you don't use the debugbar
_all = memory

; default category is the category used when a given category is not declared here
default=file
error= file
warning=file
notice=file
deprecated=
strict=
debug=
sql=
soap=

[fileLogger]
default=messages.log

[mailLogger]
;email = root@localhost
;emailHeaders = "Content-Type: text/plain; charset=UTF-8\nFrom: webmaster@yoursite.com\nX-Mailer: Jelix\nX-Priority: 1 (Highest)\n"

[mailer]
webmasterEmail = root@localhost
webmasterName =

; How to send mail : "mail" (mail()), "sendmail" (call sendmail), "smtp" (send directly to a smtp)
;                   or "file" (store the mail into a file, in filesDir directory)
mailerType = mail
; Sets the hostname to use in Message-Id and Received headers
; and as default HELO string. If empty, the value returned
; by SERVER_NAME is used or 'localhost.localdomain'.
hostname =
sendmailPath = "/usr/sbin/sendmail"

; if mailer = file, fill the following parameters
; this should be the directory in the var/ directory, where to store mail as files
filesDir = "mails/"

; if mailer = smtp , fill the following parameters

; SMTP hosts.  All hosts must be separated by a semicolon : "smtp1.example.com:25;smtp2.example.com"
smtpHost = "localhost"
; default SMTP server port
smtpPort = 25
; secured connection or not. possible values: "", "ssl", "tls"
smtpSecure = 
; SMTP HELO of the message (Default is hostname)
smtpHelo =
; SMTP authentication
smtpAuth = off
smtpUsername =
smtpPassword =
; SMTP server timeout in seconds
smtpTimeout = 10



[acl2]
; example of driver: "db"
driver =

[sessions]
; If several applications are installed in the same documentRoot but with
; a different basePath, shared_session indicates if these application
; share the same php session
shared_session = off

; indicate a session name for each applications installed with the same
; domain and basePath, if their respective sessions shouldn't be shared
name=

; Use alternative storage engines for sessions
;storage = "files"
;files_path = "app:var/sessions/"
;
; or
;
;storage = "dao"
;dao_selector = "jelix~jsession"
;dao_db_profile = ""


[forms]
; define input type for datetime widgets : "textboxes" or "menulists"
;controls.datetime.input = "menulists"
; define the way month labels are displayed widgets: "numbers", "names" or "shortnames"
;controls.datetime.months.labels = "names"
; define the default config for datepickers in jforms
;datepicker = default

[datepickers]
;default = jelix/js/jforms/datepickers/default/init.js
