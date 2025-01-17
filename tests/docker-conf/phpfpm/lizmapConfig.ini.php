;<?php die(''); ?>
;for security reasons , don't remove or modify the first line
hideSensitiveServicesProperties=0
;Services
;list the different map services (servers, generic parameters, etc.)
[services]
;Wms map server
wmsServerURL="http://map:8080/ows/"
;WMS subdomain URLs list (optional)
wmsPublicUrlList=
;URL to the API exposed by the Lizmap plugin for QGIS Server
lizmapPluginAPIURL="http://map:8080/lizmap/"

onlyMaps=off
defaultRepository=testsrepository
defaultProject=

; cache configuration for tiles
cacheStorageType=file
;cacheStorageType=sqlite => store cached images in one sqlite file per repo/project/layer
;cacheStorageType=file => store cached images in one folder per repo/project/layer. The root folder is /tmp/
;cacheStorageType=redis => store cached images into the redis database
cacheRedisHost=redis
cacheRedisPort=6379
cacheRedisDb=0
cacheRedisKeyPrefix=

; default cache expiration : the default time to live of data, in seconds.
; 0 means no expiration, max : 2592000 seconds (30 days)
cacheExpiration=0

; debug mode
; on = print debug messages in lizmap/var/log/messages.log
; off = no lizmap debug messages
debugMode=0

; cache root directory where cache files will be stored
; must be writable
cacheRootDirectory="/tmp/"

; path to find repositories
rootRepositories="/srv/lzm/tests/qgis-projects"
; Does the server use relative path from root folder? 0/1
relativeWMSPath=on

appName=Lizmap
wmsMaxWidth=3000
wmsMaxHeight=3000
projectSwitcher=off
requestProxyEnabled=0
requestProxyType=http
requestProxyNotForDomain="localhost,127.0.0.1"
adminContactEmail="root@localhost.org"
proxyHttpBackend=curl

[repository:testsrepository]
label="Tests repository"
path="/srv/lzm/tests/qgis-projects/tests/"
allowUserDefinedThemes=1
accessControlAllowOrigin="http://othersite.local:8130"

[repository:private]
label="Private repository"
path="/srv/lzm/tests/qgis-projects/CONFIDENTIAL/"
allowUserDefinedThemes=1

[repository:badrepository]
label="Repository with bad path"
path="/srv/lzm/tests/qgis-projects/bad/"
allowUserDefinedThemes=0
