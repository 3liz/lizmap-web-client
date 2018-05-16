;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

startModule = "jelix"
startAction = "default:index"

; the default locale used in the application
locale = "en_US"

; the locales available in the application
availableLocales = "en_US"

; the charset used in the application
charset = "UTF-8"

; the default theme
theme = default

; set "1.0" or "1.1" if you want to force an HTTP version
httpVersion=""

; see http://www.php.net/manual/en/timezones.php for supported values
; if empty, jelix will try to get the default timezone
timeZone =

; list of directories where the framework can find plugins
pluginsPath = app:plugins/

; list of directories where the framework can find modules
modulesPath = lib:jelix-modules/,app:modules/

; Default domain name to use with jfullurl for example.
; Let it empty to use $_SERVER['SERVER_NAME'] value instead.
; For cli script, fill it.
domainName =

; the locale to fallback when the asked string doesn't exist in the current locale
fallbackLocale =

; indicate HTTP(s) port if it should be forced to a specific value that PHP cannot
; guess (if the application is behind a proxy on a specific port for example)
; true for default port, or a number for a specific port. leave empty to use the
; current server port.
forceHTTPPort =
forceHTTPSPort =

; chmod for files created by Jelix
chmodFile=0664
chmodDir=0775

; ---  don't set the following options to on, except if you know what you do

; disable all installers and the installer.ini.php
; useful only if you manage the installation of modules by hands (not recommanded)
disableInstallers = off
; if set to on, all modules have an access=2, and access values in [modules] are not readed (not recommanded)
enableAllModules = off

; set it to true if you want to parse JSON content-type in jClassicRequest
; (as in the futur Jelix 1.7) or keep false if you want to have, as usual, JSON
; content as a string in the __httpbody parameter.
; this flag will be removed in Jelix 1.7
enableRequestBodyJSONParsing = false

[modules]
; modulename.access = x   where x : 0= unused/forbidden, 1 = private access, 2 = public access

jelix.access = 2
jelix.path = lib:jelix/core-modules/jelix

; jacldb is deprecated. keep it uninstall if possible
jacldb.access = 0


[coordplugins]

[tplplugins]
defaultJformsBuilder = html
defaultJformsErrorDecorator =

[responses]
html = jResponseHtml
basichtml = jResponseBasicHtml
redirect = jResponseRedirect
redirectUrl = jResponseRedirectUrl
binary = jResponseBinary
text = jResponseText
cmdline = jResponseCmdline
jsonrpc = jResponseJsonrpc
json = jResponseJson
xmlrpc = jResponseXmlrpc
xml = jResponseXml
zip = jResponseZip
rss2.0 = jResponseRss20
atom1.0 = jResponseAtom10
css= jResponseCss
htmlfragment = jResponseHtmlFragment
htmlauth = jResponseHtml
sitemap = jResponseSitemap

[_coreResponses]
html = jResponseHtml
basichtml = jResponseBasicHtml
redirect = jResponseRedirect
redirectUrl = jResponseRedirectUrl
binary = jResponseBinary
text = jResponseText
cmdline = jResponseCmdline
jsonrpc = jResponseJsonrpc
json = jResponseJson
xmlrpc = jResponseXmlrpc
xml = jResponseXml
zip = jResponseZip
rss2.0 = jResponseRss20
atom1.0 = jResponseAtom10
css= jResponseCss
htmlfragment = jResponseHtmlFragment
htmlauth = jResponseHtml
sitemap = jResponseSitemap

[jResponseHtml]
; list of active plugins for jResponseHtml
plugins =

; path to the minify entry point, relative to basepath
minifyEntryPoint = minify.php
;concatenate and minify CSS and/or JS files :
minifyCSS = off
minifyJS = off
; list of filenames which shouldn't be minified. Path relative to basePath:
minifyExcludeCSS = ""
minifyExcludeJS = "jelix/wymeditor/jquery.wymeditor.js"

[debugbar]
plugins = sqllog,sessiondata,defaultlog
defaultPosition=right
errors_openon=error

[error_handling]
messageLogFormat = "%date%\t%ip%\t[%code%]\t%msg%\t%file%\t%line%\n\t%url%\n%params%\n%trace%\n\n"
errorMessage="A technical error has occured (code: %code%). Sorry for this inconvenience."
; HTTP parameters that should not appears in logs. See also jController::$sensitiveParameters
sensitiveParameters = "password,passwd,pwd"

[compilation]
checkCacheFiletime  = on
force = off

[urlengine]
; name of url engine :  "basic_significant" or "significant"
engine        = basic_significant

; enable the parsing of the url. Set it to off if the url is already parsed by another program
; (like mod_rewrite in apache), if the rewrite of the url corresponds to a simple url, and if
; you use the significant engine. If you use the deprecated "simple" url engine, you can set to off.
enableParser = on

; if multiview is activated in apache, eg, you don't have to indicate the ".php" suffix
; then set this parameter to on
multiview = off

; the name of the variable in $_SERVER which contains the name of the script
; example : if the you call http://mysite.com/foo/index.php, this is the variable
; which contains "/foo/index.php"
; This name can be SCRIPT_NAME, ORIG_SCRIPT_NAME, PHP_SELF or REDIRECT_SCRIPT_URL
; it is detected automatically by jelix but it can fail sometime, so you could have to setup it
scriptNameServerVariable =


; If you have a rewrite rules which move the pathinfo into a queryparameter
; like RewriteRule ^(.*)$ index.php/?jpathinfo=$1 [L,QSA]
; (it is necessary in some CGI configuration)
; then you should set pathInfoInQueryParameter to the name of the parameter
; which contains the pathinfo value ("jpathinfo" for example)
; leave empty if you don't have to create such rewrite rules.
pathInfoInQueryParameter =

; basePath corresponds to the path to the base directory of your application.
; so if the url to access to your application is http://foo.com/aaa/bbb/www/index.php, you should
; set basePath = "/aaa/bbb/www/".
; if it is http://foo.com/index.php, set basePath="/"
; Jelix can guess the basePath, so you can keep basePath empty. But in the case where there are some
; entry points which are not in the same directory (ex: you have two entry point : http://foo.com/aaa/index.php
; and http://foo.com/aaa/bbb/other.php ), you MUST set the basePath (ex here, the higher entry point is index.php so
; : basePath="/aaa/" )
basePath = ""


; backendBasePath is used when the application is behind a proxy, and when the base path on the frontend
; server doesn't correspond to the base path on the backend server.
; you MUST define basePath when you define backendBasePath
backendBasePath =

; Reverse proxies often communicate with web servers with the HTTP protocol,
; even if requests are made with HTTPS. And it may add a 'Fowarded' or a
; 'X-Forwarded-proto' headers so the web server know what is the protocol of
; the original request. However Jelix <=1.6 does not support these headers, so
; you must indicate the protocol of the original requests here, if you know
; that the web site can be reach entirely with HTTPS.
; Possible value is 'https' or nothing (no proxy).
forceProxyProtocol=

; for an app on a simple http server behind an https proxy, the https verification
; should be disabled (see forceProxyProtocol).
checkHttpsOnParsing = on

; this is the url path to the jelix-www content (you can found this content in lib/jelix-www/)
; because the jelix-www directory is outside the yourapp/www/ directory, you should create a link to
; jelix-www, or copy its content in yourapp/www/ (with a name like 'jelix' for example)
; so you should indicate the relative path of this link/directory to the basePath, or an absolute path.
; if you change it, change also all pathes in [htmleditors]
; at runtime, it contains the absolute path (basePath+the value) if you give a relative path
jelixWWWPath = "jelix/"
jqueryPath="jelix/jquery/"

defaultEntrypoint= index

; action to show the 'page not found' error
notfoundAct = "jelix~error:notfound"

; list of actions which require https protocol for the deprecated "simple" url engine
; syntax of the list is the same as explained in the simple_urlengine_entrypoints
simple_urlengine_https =

significantFile = "urls.xml"

; filled automatically by jelix
urlScript=
urlScriptPath=
urlScriptName=
urlScriptId=
urlScriptIdenc=
documentRoot=

[simple_urlengine_entrypoints]
; parameters for the deprecated "simple" url engine. This is the list of entry points
; with list of actions attached to each entry points

; script_name_without_suffix = "list of action selectors separated by a space"
; selector syntax :
;   m~a@r    -> for the action "a" of the module "m" and for the request of type "r"
;   m~c:*@r  -> for all actions of the controller "c" of the module "m" and for the request of type "r"
;   m~*@r    -> for all actions of the module "m" and for the request of type "r"
;   @r       -> for all actions for the request of type "r"

index = "@classic"
xmlrpc = "@xmlrpc"
jsonrpc = "@jsonrpc"

[basic_significant_urlengine_entrypoints]
; for each entry point, it indicates if the entry point name
; should be include in the url or not
index = on
xmlrpc = on
jsonrpc = on

[basic_significant_urlengine_aliases]
; list of names to use for module name in url
; urlname = modulename

[logger]
; list of loggers for each categories of log messages
; available loggers : file, syslog, firebug, mail, memory. see plugins for others

; _all category is the category containing loggers executed for any categories
_all =

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

; log files for categories which have "file"
[fileLogger]
default=messages.log
error=errors.log
warning=errors.log
notice=errors.log
deprecated=errors.log
strict=errors.log
debug=debug.log

[memorylogger]
; number of messages to store in memory for each categories, to avoid memory issues
default=20
error= 10
warning=10
notice=10
deprecated=10
strict=10
debug=20
sql=20
soap=20

[mailLogger]
email = root@localhost
emailHeaders = "Content-Type: text/plain; charset=UTF-8\nFrom: webmaster@yoursite.com\nX-Mailer: Jelix\nX-Priority: 1 (Highest)\n"

[syslogLogger]
facility=LOG_LOCAL7
ident="php-%sapi%-%domain%[%pid%]"


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

; Copy all emails into files
copyToFiles = off

; enable the debug mode. debugReceivers should be filled.
debugModeEnabled = off

; type of receivers set into the email
; 1: only addresses from  debugReceivers
; 2: only email address of the authenticated user, or addresses from  debugReceivers
;    if the user isn't authenticated
; 3: both, addresses from debugReceivers and address of the authenticated user
debugReceiversType = 1

; email addresses that will replace receivers in all emails. debugModeEnabled should be on.
debugReceivers =
;debugReceivers[] =

; Receivers for 'To' having these emails will not be replaced by debugReceivers
; Receivers for 'Cc' and 'Bcc' having these emails will not be removed
debugReceiversWhiteList =
;debugReceiversWhiteList[] =

; if set, it replace the address of From
debugFrom =

; if set, it replace the name in From (when debugFrom is set)
debugFromName =

; Prefix to add to subject of mails, in debug mode.
debugSubjectPrefix =

; Introduction inserted at the beginning of the messages in debug mode
debugBodyIntroduction =

[acl]
; exemple of driver: "db".
driver =

[acl2]
; exemple of driver: "db"
driver =



[sessions]
; to disable sessions, set the following parameter to 0
start = 1

; If several applications are installed in the same documentRoot but with
; a different basePath, shared_session indicates if these application
; share the same php session
shared_session = off

; indicate a session name for each applications installed with the same
; domain and basePath, if their respective sessions shouldn't be shared
name=

;
; Use alternative storage engines for sessions
; empty value means the default storage engine of PHP
storage=

; some additionnal options can be set, depending of the type of storage engine
;
; storage = "files"
; files_path = "app:var/sessions/"
;
; or
;
; storage = "dao"
; dao_selector = "jelix~jsession"
; dao_db_profile = ""

; list of selectors of classes to load before the session_start
; @deprecated please use autoload configuration in module.xml files instead
loadClasses=

[forms]
; define input type for datetime widgets : "textboxes" or "menulists"
controls.datetime.input = "menulists"
; define the way month labels are displayed widgets: "numbers", "names" or "shortnames"
controls.datetime.months.labels = "names"
; define the default config for datepickers in jforms
datepicker = default

; default captcha type
captcha = simple

captcha.simple.validator=\jelix\forms\Captcha\SimpleCaptchaValidator
captcha.simple.widgettype=captcha

captcha.recaptcha.validator=\jelix\forms\Captcha\ReCaptchaValidator
captcha.recaptcha.widgettype=recaptcha

[jforms_builder_html]
;control type = plugin name


[datepickers]
default = jelix/js/jforms/datepickers/default/init.js

[htmleditors]
default.engine.name = wymeditor
default.engine.file[] = jelix/jquery/jquery.js
default.engine.file[] = jelix/wymeditor/jquery.wymeditor.js
default.config = jelix/js/jforms/htmleditors/wymeditor_default.js
default.skin.default = jelix/wymeditor/skins/default/skin.css

wymbasic.engine.name = wymeditor
wymbasic.engine.file[] = jelix/jquery/jquery.js
wymbasic.engine.file[] = jelix/wymeditor/jquery.wymeditor.js
wymbasic.config = jelix/js/jforms/htmleditors/wymeditor_basic.js
wymbasic.skin.default = jelix/wymeditor/skins/default/skin.css

ckdefault.engine.name = ckeditor
ckdefault.engine.file[] = jelix/ckeditor/ckeditor.js
ckdefault.config = jelix/js/jforms/htmleditors/ckeditor_default.js

ckfull.engine.name = ckeditor
ckfull.engine.file[] = jelix/ckeditor/ckeditor.js
ckfull.config = jelix/js/jforms/htmleditors/ckeditor_full.js

ckbasic.engine.name = ckeditor
ckbasic.engine.file[] = jelix/ckeditor/ckeditor.js
ckbasic.config = jelix/js/jforms/htmleditors/ckeditor_basic.js


[wikieditors]
default.engine.name = wr3
default.wiki.rules = wr3_to_xhtml
; path to the engine file
default.engine.file = jelix/markitup/jquery.markitup.js
; define the path to the "internationalized" file to translate the label of each button
default.config.path = jelix/markitup/sets/wr3/
; define the path to the image of buttons of the toolbar
default.image.path = jelix/markitup/sets/wr3/images/
default.skin = jelix/markitup/skins/simple/style.css



[zones]
; disable zone caching
disableCache = off

[classbindings]
; bindings for class and interfaces : selector_of_class/iface = selector_of_implementation

[imagemodifier]
; set this parameters if images and their cache are on an other website (but on the same server)
; the url from which we can display images (basepath excluded). default = current host
; if you set this parameter, you MUST set src_path
src_url=
; the path on the file system, to the directory where images are stored (the www directory of the other application. default = jApp::wwwPath()
src_path=
; the url from which we can display images cache. default = current host + basepath + 'cache/images/'
; if you set this parameter, you MUST set cache_path
cache_url=
; the path on the file system, to the directory where images cache are stored. default = jApp::wwwPath()
cache_path=


[rootUrls]
; This section associates keywords with root URLs.
; A root url starting with "http://" or "https://" or "/" is supposed to be absolute
; Other values will be prefixed by application's basePath
; This will be used by jUrl::getRootUrl() and jTpl's {jrooturl}
jelix.cache=cache/

[langToLocale]
; overrides of lang_to_locale.ini.php

[disabledListeners]
; list of jEvent listener to not call
; eventname[]="module~listenerName"

[coordplugin_auth]
; key to use to crypt the password in the cookie
; Warning: the value of this parameter should be stored into localconfig.ini.php
persistant_crypt_key=

[recaptcha]
; sitekey and secret should be set only into localconfig.ini.php!
sitekey=
secret=

; see https://developers.google.com/recaptcha/docs/display to know the meaning
; of these configuration parameters.
theme=
type=
size=
tabindex=
