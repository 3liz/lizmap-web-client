#

STAGE=build
LIZMAP_VERSION:=$(shell sed -n 's:.*<version[^>]*>\(.*\)</version>.*:\1:p' lizmap/project.xml)
MAJOR_VERSION=$(firstword $(subst ., ,$(LIZMAP_VERSION)))
MINOR_VERSION=$(word 2,$(subst ., ,$(LIZMAP_VERSION)))
SHORT_VERSION=$(MAJOR_VERSION).$(MINOR_VERSION)

BRANCH:=$(shell git rev-parse --abbrev-ref HEAD)

SHORT_VERSION_NAME=$(MAJOR_VERSION)_$(MINOR_VERSION)
SAAS_PACKAGE=lizmap_web_client_$(SHORT_VERSION_NAME)

MANIFEST_EXISTS=$(shell [ -f build/MANIFEST ] && echo 1 || echo 0 )
ifeq ($(MANIFEST_EXISTS), 1)
    SAAS_LZMPACK_VERSION=$(shell sed -n 's:version=\(.*\):\1:p' build/MANIFEST)
else
    SAAS_LZMPACK_VERSION=
endif


PACKAGE_NAME=lizmap-web-client-$(LIZMAP_VERSION)
DIST=$(STAGE)/$(PACKAGE_NAME)

FILES=lib lizmap CONTRIBUTING.md icon.png INSTALL.md license.txt README.md UPGRADE.md

FORBIDDEN_CONFIG_FILES := installer.ini.php liveconfig.ini.php lizmapConfig.ini.php localconfig.ini.php profiles.ini.php
EMPTY_DIRS := var/db var/log var/mails var/uploads var/sessions


.PHONY: package clean stage build tests debug deploy_download deploy_download_stable saas_package saas_release trigger_ci

debug:
	@echo "LIZMAP_VERSION="$(LIZMAP_VERSION)
	@echo "SHORT_VERSION="$(SHORT_VERSION)
	@echo "MAJOR_VERSION="$(MAJOR_VERSION)
	@echo "MINOR_VERSION="$(MINOR_VERSION)
	@echo "BRANCH="$(BRANCH)
	@echo "PACKAGE_NAME="$(PACKAGE_NAME)
	@echo "SAAS_PACKAGE="$(SAAS_PACKAGE)
	@echo "SAAS_LZMPACK_VERSION="$(SAAS_LZMPACK_VERSION)

build: debug
	@echo "Nothing to build. All is ok."

tests: debug
	@echo "No tests yet. All is ok."

clean:
	rm -rf $(STAGE)

stage:
	mkdir -p $(DIST)
	cp -aR $(FILES) $(DIST)/
	mkdir -p $(DIST)/temp/lizmap/
	cp -a temp/.htaccess $(DIST)/temp/
	cp -a temp/lizmap/.empty $(DIST)/temp/lizmap/
	@for file in $(FORBIDDEN_CONFIG_FILES); do rm -f $(DIST)/lizmap/var/config/$$file; done;
	@for dir in $(EMPTY_DIRS); do rm -rf $(DIST)/lizmap/$$dir/*;  touch $(DIST)/lizmap/$$dir/.empty; done;
	rm -rf $(DIST)/lizmap/www/cache/images/* && touch $(DIST)/lizmap/www/cache/images/.empty
	rm -rf $(DIST)/lizmap/www/document/* && touch $(DIST)/lizmap/www/document/.empty
	echo $(LIZMAP_VERSION) > $(DIST)/VERSION

package: clean build stage
	cd $(STAGE) && zip -r $(PACKAGE_NAME).zip  $(PACKAGE_NAME)/

deploy_download:
	upload_to_packages_server $(STAGE)/$(PACKAGE_NAME).zip pub/lizmap/unstable/$(SHORT_VERSION)/

deploy_download_stable:
	upload_to_packages_server $(STAGE)/$(PACKAGE_NAME).zip pub/lizmap/release/$(SHORT_VERSION)/

saas_package:
	mv $(STAGE)/$(PACKAGE_NAME) $(STAGE)/lizmap_web_client
	saasv2_register_package $(SAAS_PACKAGE) $(LIZMAP_VERSION) lizmap_web_client $(STAGE)

trigger_ci:
	trigger-ci $(SAAS_PROJ_ID) $(SAAS_PROJ_TOKEN) $(MAJOR_VERSION).$(MINOR_VERSION).x -F variables[SAAS_LZMPACK_VERSION]=$(SAAS_LZMPACK_VERSION)

saas_release:
	saasv2_release_package $(SAAS_PACKAGE)
