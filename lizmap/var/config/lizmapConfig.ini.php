;Services 
;list the different map services (servers, generic parameters, etc.)
[services]
wmsServerURL="http://127.0.0.1/cgi-bin/qgis_mapserv.fcgi"
defaultRepository=montpellier
cacheStorageType=sqlite
;cacheStorageType=sqlite => store cached images in one sqlite file per repo/project/layer
;cacheStorageType=file => store cached images in one folder per repo/project/layer. The root folder is /tmp/
cacheExpiration=0
; cache expiration : the default time to live of data, in seconds. 0 means no timeout.


;Repositories

;Each repository must be set in a separate section
;The section name must begin with the prefix "repository:"

; Example of public repository
[repository:montpellier]
label="LizMap Demo"
path="../install/qgis/"

; Example of a repository wich will have access control
[repository:intranet]
label="Lizmap Demo - Intranet"
path="../install/qgis_intranet/"















