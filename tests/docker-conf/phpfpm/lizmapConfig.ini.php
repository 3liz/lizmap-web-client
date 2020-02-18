;<?php die(''); ?>
;for security reasons , don't remove or modify the first line
hideSensitiveServicesProperties=0
;Services
;list the different map services (servers, generic parameters, etc.)
[services]
wmsServerURL="http://map:8080/ows/"
;List of URL available for the web client
onlyMaps=off
defaultRepository=montpellier
cacheStorageType=file
;cacheStorageType=sqlite => store cached images in one sqlite file per repo/project/layer
;cacheStorageType=file => store cached images in one folder per repo/project/layer. The root folder is /tmp/
;cacheStorageType=redis => store cached images into the redis database
cacheRedisHost=redis
cacheRedisPort=6379
cacheRedisDb=0
cacheExpiration=0
; default cache expiration : the default time to live of data, in seconds.
; 0 means no expiration, max : 2592000 seconds (30 days)
debugMode=0
; debug mode
; on = print debug messages in lizmap/var/log/messages.log
; off = no lizmap debug messages
cacheRootDirectory="/tmp/"
; cache root directory where cache files will be stored
; must be writable

; path to find repositories
; rootRepositories="path"
; Does the server use relative path from root folder? 0/1
; relativeWMSPath=0

appName=Lizmap
qgisServerVersion=3.0
wmsMaxWidth=3000
wmsMaxHeight=3000
projectSwitcher=off
relativeWMSPath=on
rootRepositories="/srv/lzm/tests/qgis-projects"
requestProxyEnabled=0
requestProxyType=http
requestProxyNotForDomain="localhost,127.0.0.1"
adminContactEmail="laurent@jelix.org"
proxyHttpBackend=curl

[repository:montpellier]
label=Demo
path="demoqgis/"
allowUserDefinedThemes=1

[repository:intranet]
label="Demo - Intranet"
path="demoqgis_intranet/"
allowUserDefinedThemes=0


