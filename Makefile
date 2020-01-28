#
# expected variables in the CI environment
# - FACTORY_SCRIPTS = path to scripts of the factory
# - REGISTRY_URL = url of the docker registry

STAGE=build

#-------- git
BRANCH:=$(shell git rev-parse --abbrev-ref HEAD)
BUILDID=$(shell date +"%Y%m%d%H%M")
COMMITID=$(shell git rev-parse --short HEAD)

#------- versions
LIZMAP_VERSION:=$(shell sed -n 's:.*<version[^>]*>\(.*\)</version>.*:\1:p' lizmap/project.xml)
LTR:=$(shell sed -n 's:.* ltr="\([^"]*\)".*:\1:p' lizmap/project.xml)
MAJOR_VERSION=$(firstword $(subst ., ,$(LIZMAP_VERSION)))
MINOR_VERSION=$(word 2,$(subst ., ,$(LIZMAP_VERSION)))
PATCH_VERSION=$(firstword $(subst -, ,$(word 3,$(subst ., ,$(LIZMAP_VERSION)))))
SHORT_VERSION=$(MAJOR_VERSION).$(MINOR_VERSION)
STABLE_VERSION=$(MAJOR_VERSION).$(MINOR_VERSION).$(PATCH_VERSION)
SHORT_VERSION_NAME=$(MAJOR_VERSION)_$(MINOR_VERSION)

LATEST_RELEASE=$(shell git branch -a | grep -Po "(release_\\d+_\\d+)" | sort | tail -n1 | cut -d'_' -f 2,3)

ifdef DO_RELEASE
DOCKER_MANIFEST_VERSION=$(STABLE_VERSION)
DOCKER_MANIFEST_VERSION_SHORT=$(SHORT_VERSION)
ifneq ($(LTR),)
DOCKER_MANIFEST_RELEASE_TAG=ltr-$(SHORT_VERSION)
# compatibility with some scripts?
RELEASE_TAG=ltr-$(SHORT_VERSION)
endif
else
DOCKER_MANIFEST_VERSION=$(SHORT_VERSION)-dev
endif

PACKAGE_MANIFEST_EXISTS=$(shell [ -f build/MANIFEST ] && echo 1 || echo 0 )
ifeq ($(PACKAGE_MANIFEST_EXISTS), 1)
SAAS_LZMPACK_VERSION=$(shell sed -n 's:version=\(.*\):\1:p' build/MANIFEST)
else
SAAS_LZMPACK_VERSION=
endif

#-------- Packages names
PACKAGE_NAME=lizmap-web-client-$(LIZMAP_VERSION)
SAAS_PACKAGE=lizmap_web_client_$(SHORT_VERSION_NAME)
ZIP_PACKAGE=$(STAGE)/$(PACKAGE_NAME).zip
GENERIC_DIR_NAME=lizmap_web_client
GENERIC_PACKAGE_DIR=$(STAGE)/$(GENERIC_DIR_NAME)
GENERIC_PACKAGE_ZIP=$(GENERIC_DIR_NAME).zip
GENERIC_PACKAGE_PATH=$(STAGE)/$(GENERIC_PACKAGE_ZIP)

#-------- WPS
LIZMAP_WPS_BRANCH:=master

#-------- Docker
DOCKER_NAME=lizmap-web-client
DOCKER_BUILDIMAGE=$(DOCKER_NAME):$(LIZMAP_VERSION)-$(COMMITID)
DOCKER_ARCHIVENAME=$(shell echo $(DOCKER_NAME):$(LIZMAP_VERSION)|tr '[:./]' '_')
DOCKER_BUILD_ARGS=--build-arg lizmap_version=$(LIZMAP_VERSION) --build-arg lizmap_wps_version=$(LIZMAP_WPS_BRANCH)
DOCKER_MANIFEST=docker/factory.manifest
DOCKER_RELEASE_PACKAGE_NAME=$(DOCKER_NAME)-$(MAJOR_VERSION).$(MINOR_VERSION)

ifdef REGISTRY_URL
REGISTRY_PREFIX=$(REGISTRY_URL)/
DOCKER_BUILD_ARGS += --build-arg REGISTRY_PREFIX=$(REGISTRY_PREFIX)
endif

#-------- build
DIST=$(STAGE)/$(PACKAGE_NAME)

FILES=lib lizmap CONTRIBUTING.md icon.png INSTALL.md license.txt README.md UPGRADE.md

FORBIDDEN_CONFIG_FILES := installer.ini.php liveconfig.ini.php lizmapConfig.ini.php localconfig.ini.php profiles.ini.php
EMPTY_DIRS := var/db var/log var/mails var/uploads var/sessions

.PHONY: debug build tests clean check-release check-registry check-factory stage package deploy_download deploy_download_stable saas_package trigger_ci saas_release
.PHONY: local_saas_package docker-build docker-build-ci docker-tag docker-deliver docker-clean docker-clean-all docker-release docker-hub docker-run

debug:
	@echo "LIZMAP_VERSION="$(LIZMAP_VERSION)
	@echo "LTR="$(LTR)
	@echo "MAJOR_VERSION="$(MAJOR_VERSION)
	@echo "MINOR_VERSION="$(MINOR_VERSION)
	@echo "PATCH_VERSION="$(PATCH_VERSION)
	@echo "STABLE_VERSION="$(STABLE_VERSION)
	@echo "SHORT_VERSION="$(SHORT_VERSION)
	@echo "SHORT_VERSION_NAME="$(SHORT_VERSION_NAME)
	@echo "DOCKER_MANIFEST_VERSION="$(DOCKER_MANIFEST_VERSION)
ifdef DOCKER_MANIFEST_VERSION_SHORT
	@echo "DOCKER_MANIFEST_VERSION_SHORT="$(DOCKER_MANIFEST_VERSION_SHORT)
endif
ifdef DOCKER_MANIFEST_RELEASE_TAG
	@echo "DOCKER_MANIFEST_RELEASE_TAG="$(DOCKER_MANIFEST_RELEASE_TAG)
endif
	@echo "SAAS_LZMPACK_VERSION="$(SAAS_LZMPACK_VERSION)
	@echo "PACKAGE_NAME="$(PACKAGE_NAME)
	@echo "SAAS_PACKAGE="$(SAAS_PACKAGE)
	@echo "GENERIC_PACKAGE_PATH="$(GENERIC_PACKAGE_PATH)
	@echo "BRANCH="$(BRANCH)
	@echo "BUILDID="$(BUILDID)
	@echo "COMMITID="$(COMMITID)

build: debug
	composer update --working-dir=lizmap/ --prefer-dist --no-ansi --no-interaction --ignore-platform-reqs --no-dev --no-suggest --no-progress

tests: debug build
	@echo "No tests yet. All is ok."

clean:
	rm -rf $(STAGE)
	rm -f $(DOCKER_MANIFEST) docker/$(GENERIC_PACKAGE_ZIP)


$(DIST):
	mkdir -p $(DIST)
	cp -aR $(FILES) $(DIST)/
	mkdir -p $(DIST)/temp/lizmap/
	cp -a temp/.htaccess $(DIST)/temp/
	cp -a temp/lizmap/.empty $(DIST)/temp/lizmap/
	@for file in $(FORBIDDEN_CONFIG_FILES); do rm -f $(DIST)/lizmap/var/config/$$file; done;
	@for dir in $(EMPTY_DIRS); do rm -rf $(DIST)/lizmap/$$dir/*;  touch $(DIST)/lizmap/$$dir/.empty; done;
	rm -f $(DIST)/lizmap/composer.*
	rm -rf $(DIST)/lizmap/www/cache/images/* && touch $(DIST)/lizmap/www/cache/images/.empty
	rm -rf $(DIST)/lizmap/www/document/* && touch $(DIST)/lizmap/www/document/.empty
	echo $(LIZMAP_VERSION) > $(DIST)/VERSION

$(GENERIC_PACKAGE_DIR): $(DIST)
	mkdir -p $(GENERIC_PACKAGE_DIR)
	cp -a $(DIST)/* $(GENERIC_PACKAGE_DIR)

$(ZIP_PACKAGE): $(DIST)
	cd $(STAGE) && zip -r $(PACKAGE_NAME).zip  $(PACKAGE_NAME)/

$(GENERIC_PACKAGE_PATH): $(GENERIC_PACKAGE_DIR)
	cd $(STAGE) && zip -r $(GENERIC_PACKAGE_ZIP) $(GENERIC_DIR_NAME)/

$(DOCKER_MANIFEST):
	echo name=$(DOCKER_NAME) > $(DOCKER_MANIFEST) && \
echo version=$(DOCKER_MANIFEST_VERSION)   >> $(DOCKER_MANIFEST) && \
echo buildid=$(BUILDID)   >> $(DOCKER_MANIFEST) && \
echo commitid=$(COMMITID) >> $(DOCKER_MANIFEST) && \
echo archive=$(DOCKER_ARCHIVENAME) >> $(DOCKER_MANIFEST)
ifdef DOCKER_MANIFEST_VERSION_SHORT
	echo version_short=$(DOCKER_MANIFEST_VERSION_SHORT) >> $(DOCKER_MANIFEST)
endif
ifdef DOCKER_MANIFEST_RELEASE_TAG
	echo release_tag=$(DOCKER_MANIFEST_RELEASE_TAG) >> $(DOCKER_MANIFEST)
endif

check-release:
ifndef DO_RELEASE
	$(error DO_RELEASE is undefined, cannot do a release)
endif

check-registry:
ifndef REGISTRY_URL
	$(error REGISTRY_URL is undefined)
endif

check-factory:
ifndef FACTORY_SCRIPTS
	$(error FACTORY_SCRIPTS is undefined)
endif

stage: $(DIST)

package: $(ZIP_PACKAGE) $(GENERIC_PACKAGE_PATH)

deploy_download:
	upload_to_packages_server $(ZIP_PACKAGE) pub/lizmap/unstable/$(SHORT_VERSION)/

deploy_download_stable:
	upload_to_packages_server $(ZIP_PACKAGE) pub/lizmap/release/$(SHORT_VERSION)/

saas_package: $(GENERIC_PACKAGE_DIR)
	rm -rf $(DIST)/lizmap/vendor # vendor dir is not needed because provided by lizmap-saas
	cp lizmap/composer.json $(DIST)/lizmap/  # copy again composer.json, needed by lizmap-saas
	mv $(STAGE)/$(PACKAGE_NAME) $(STAGE)/lizmap_web_client
	saasv2_register_package $(SAAS_PACKAGE) $(LIZMAP_VERSION) $(GENERIC_DIR_NAME) $(STAGE)

trigger_ci:
	trigger-ci $(SAAS_PROJ_ID) $(SAAS_PROJ_TOKEN) $(MAJOR_VERSION).$(MINOR_VERSION).x -F variables[SAAS_LZMPACK_VERSION]=$(SAAS_LZMPACK_VERSION)

saas_release: check-release
	saasv2_release_package $(SAAS_PACKAGE)

local_saas_package: clean stage saas_package

docker-build: debug $(GENERIC_PACKAGE_PATH) docker-build-ci

docker-build-ci: debug $(DOCKER_MANIFEST)
	cp $(GENERIC_PACKAGE_PATH) docker/
	docker build --rm --force-rm --no-cache $(DOCKER_BUILD_ARGS) -t $(DOCKER_BUILDIMAGE) docker/

docker-tag: check-registry
	docker tag $(DOCKER_BUILDIMAGE) $(REGISTRY_PREFIX)$(DOCKER_NAME):$(DOCKER_MANIFEST_VERSION)
ifdef DOCKER_MANIFEST_VERSION_SHORT
	docker tag $(DOCKER_BUILDIMAGE) $(REGISTRY_PREFIX)$(DOCKER_NAME):$(DOCKER_MANIFEST_VERSION_SHORT)
endif
ifdef DOCKER_MANIFEST_RELEASE_TAG
	docker tag $(DOCKER_BUILDIMAGE) $(REGISTRY_PREFIX)$(DOCKER_NAME):$(DOCKER_MANIFEST_RELEASE_TAG)
endif

docker-deliver: docker-tag
	docker push $(REGISTRY_URL)/$(DOCKER_NAME):$(DOCKER_MANIFEST_VERSION)
ifdef DOCKER_MANIFEST_VERSION_SHORT
	docker push $(REGISTRY_URL)/$(DOCKER_NAME):$(DOCKER_MANIFEST_VERSION_SHORT)
endif
ifdef DOCKER_MANIFEST_RELEASE_TAG
	docker push $(REGISTRY_URL)/$(DOCKER_NAME):$(DOCKER_MANIFEST_RELEASE_TAG)
endif

docker-clean:
	docker rmi -f $(DOCKER_BUILDIMAGE) || true

docker-clean-all:
	docker rmi -f $(shell docker images $(DOCKER_BUILDIMAGE) -q) || true

docker-release: check-factory
	cd docker && $(FACTORY_SCRIPTS)/release-image.sh $(DOCKER_RELEASE_PACKAGE_NAME)
	cd docker && $(FACTORY_SCRIPTS)/push-to-docker-hub.sh --clean

docker-hub:
	cd docker && $(FACTORY_SCRIPTS)/push-to-docker-hub.sh --clean

LIZMAP_USER:=$(shell id -u)

docker-run:
	rm -rf $(shell pwd)/docker/.run
	docker run -it --rm -p 9000:9000 \
    -v $(shell pwd)/.run/config:/www/lizmap/var/config \
    -v $(shell pwd)/.run/web:/www/lizmap/www \
    -v $(shell pwd)/.run/log:/usr/local/var/log \
    -v $(shell pwd)/.run/lizmap-theme-config:/www/lizmap/var/lizmap-theme-config \
    -e LIZMAP_WMSSERVERURL=$(LIZMAP_WMSSERVERURL) \
    -e LIZMAP_CACHEREDISHOST=$(LIZMAP_CACHEREDISHOST) \
    -e LIZMAP_USER=$(LIZMAP_USER) \
    -e LIZMAP_HOME=/srv/lizmap \
    $(DOCKER_BUILDIMAGE) php-fpm

