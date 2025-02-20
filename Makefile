#
# expected variables in the CI environment
# - REGISTRY_URL = url of the docker registry

STAGE=build

#-------- git
BRANCH:=$(shell git rev-parse --abbrev-ref HEAD)
BUILDID=$(shell date +"%Y%m%d%H%M")
COMMITID=$(shell git rev-parse --short HEAD)
COMMIT_NUMBER=$(shell git rev-list --count HEAD)

#------- versions
LIZMAP_VERSION:=$(shell sed -n 's:.*<version[^>]*>\(.*\)</version>.*:\1:p' lizmap/project.xml)
LTR:=$(shell sed -n 's:.* ltr="\([^"]*\)".*:\1:p' lizmap/project.xml)
STABLE_VERSION=$(firstword $(subst -, ,$(LIZMAP_VERSION)))
PRERELEASE_VERSION=$(word 2,$(subst -, ,$(LIZMAP_VERSION)))
MAJOR_VERSION=$(firstword $(subst ., ,$(STABLE_VERSION)))
MINOR_VERSION=$(word 2,$(subst ., ,$(STABLE_VERSION)))
PATCH_VERSION=$(word 3,$(subst ., ,$(STABLE_VERSION)))

SHORT_VERSION=$(MAJOR_VERSION).$(MINOR_VERSION)
SHORT_VERSION_NAME=$(MAJOR_VERSION)_$(MINOR_VERSION)
FULL_VERSION=$(SHORT_VERSION).$(PATCH_VERSION)
DATE_VERSION=$(shell date +%Y-%m-%d)

LATEST_RELEASE=$(shell git branch -a | grep -Po "(release_\\d+_\\d+)" | sort | tail -n1 | cut -d'_' -f 2,3)

ifdef DO_RELEASE
ifeq ($(PRERELEASE_VERSION),)
# if we release a stable version, we tag the docker image with version and the short version
# and optionally with an ltr tag if this is an ltr version
DOCKER_MANIFEST_VERSION=$(STABLE_VERSION)
DOCKER_MANIFEST_VERSION_SHORT=$(SHORT_VERSION)
ifneq ($(LTR),)
DOCKER_MANIFEST_RELEASE_TAG=ltr-$(SHORT_VERSION)
# compatibility with some scripts?
RELEASE_TAG=ltr-$(SHORT_VERSION)
endif
else
# if we release an unstable version, just tag the docker image with the full version
DOCKER_MANIFEST_VERSION=$(LIZMAP_VERSION)
endif
else
# we don't do a release, we tag the docker image with the -dev label
DOCKER_MANIFEST_VERSION=$(SHORT_VERSION)-dev
endif

SAAS_LIZMAP_VERSION=$(LIZMAP_VERSION).$(COMMIT_NUMBER)


#-------- Packages names
PACKAGE_NAME=lizmap-web-client-$(LIZMAP_VERSION)
DEMO_PACKAGE_NAME=lizmapdemo-module-$(MAJOR_VERSION).$(MINOR_VERSION)
ZIP_PACKAGE=$(STAGE)/$(PACKAGE_NAME).zip
ZIP_DEMO_PACKAGE=$(STAGE)/$(DEMO_PACKAGE_NAME).zip
GENERIC_DIR_NAME=lizmap_web_client
GENERIC_PACKAGE_DIR=$(STAGE)/$(GENERIC_DIR_NAME)
GENERIC_PACKAGE_ZIP=$(GENERIC_DIR_NAME).zip
GENERIC_PACKAGE_PATH=$(STAGE)/$(GENERIC_PACKAGE_ZIP)

#-------- Docker
DOCKER_NAME=lizmap-web-client
DOCKER_BUILDIMAGE=3liz/$(DOCKER_NAME):$(LIZMAP_VERSION)-$(COMMITID)
DOCKER_ARCHIVENAME=$(shell echo $(DOCKER_NAME):$(LIZMAP_VERSION)|tr '[:./]' '_')
DOCKER_BUILD_ARGS=
DOCKER_MANIFEST=docker/factory.manifest
DOCKER_RELEASE_PACKAGE_NAME=$(DOCKER_NAME)-$(MAJOR_VERSION).$(MINOR_VERSION)

REGISTRY_URL ?= 3liz
REGISTRY_PREFIX=$(REGISTRY_URL)/
BUILD_ARGS += --build-arg REGISTRY_PREFIX=$(REGISTRY_PREFIX)

#-------- build
DIST=$(STAGE)/$(PACKAGE_NAME)

FILES=lizmap CONTRIBUTING.md icon.png INSTALL.md license.txt README.md UPGRADE.md

FORBIDDEN_CONFIG_FILES := installer.ini.php installer.bak.ini.php liveconfig.ini.php localframework.ini.php localurls.xml lizmapConfig.ini.php localconfig.ini.php profiles.ini.php
EMPTY_DIRS := var/db var/log var/mails var/uploads var/sessions var/lizmap-theme-config/ var/themes/default

.PHONY: debug build tests clean check-release check-registry stage package deploy_download deploy_download_stable saas_package saas_release
.PHONY: docker-build docker-build-ci docker-tag docker-deliver docker-clean docker-clean-all docker-release docker-hub docker-run

debug:
	@echo "LIZMAP_VERSION="$(LIZMAP_VERSION)
	@echo "LTR="$(LTR)
	@echo "MAJOR_VERSION="$(MAJOR_VERSION)
	@echo "MINOR_VERSION="$(MINOR_VERSION)
	@echo "PATCH_VERSION="$(PATCH_VERSION)
	@echo "PRERELEASE_VERSION="$(PRERELEASE_VERSION)
	@echo "STABLE_VERSION="$(STABLE_VERSION)
	@echo "SHORT_VERSION="$(SHORT_VERSION)
	@echo "SHORT_VERSION_NAME="$(SHORT_VERSION_NAME)
	@echo "DATE_VERSION="$(DATE_VERSION)
	@echo "DOCKER_MANIFEST_VERSION="$(DOCKER_MANIFEST_VERSION)
ifdef DOCKER_MANIFEST_VERSION_SHORT
	@echo "DOCKER_MANIFEST_VERSION_SHORT="$(DOCKER_MANIFEST_VERSION_SHORT)
endif
ifdef DOCKER_MANIFEST_RELEASE_TAG
	@echo "DOCKER_MANIFEST_RELEASE_TAG="$(DOCKER_MANIFEST_RELEASE_TAG)
endif
	@echo "SAAS_LIZMAP_VERSION="$(SAAS_LIZMAP_VERSION)
	@echo "PACKAGE_NAME="$(PACKAGE_NAME)
	@echo "GENERIC_PACKAGE_PATH="$(GENERIC_PACKAGE_PATH)
	@echo "BRANCH="$(BRANCH)
	@echo "BUILDID="$(BUILDID)
	@echo "COMMITID="$(COMMITID)
	@echo "ZIP_PACKAGE="$(ZIP_PACKAGE)
	@echo "GENERIC_PACKAGE_DIR="$(GENERIC_PACKAGE_DIR)
	@echo "ZIP_DEMO_PACKAGE="$(ZIP_DEMO_PACKAGE)
	@echo "COMMIT_NUMBER="$(COMMIT_NUMBER)

build: debug
	composer update --working-dir=lizmap/ --prefer-dist --no-ansi --no-interaction --no-dev --no-suggest --no-progress
	npm install
	npm run build

tests: debug build
	composer update --working-dir=tests/units/ --prefer-dist --no-ansi --no-interaction --no-dev --no-suggest --no-progress
	cd tests/units/ && php vendor/bin/phpunit

quicktests: debug
	cd tests/units/ && php vendor/bin/phpunit

clean:
	rm -rf $(STAGE)
	rm -f $(DOCKER_MANIFEST) docker/$(GENERIC_PACKAGE_ZIP)


$(DIST): lizmap/www/assets/js/lizmap.js lizmap/vendor
	mkdir -p $(DIST)
	cp -aR $(FILES) $(DIST)/
	sed -i "s/\(<version date=\"\)\([^\"]*\)\(\"\)/\1$(DATE_VERSION)\3/" $(DIST)/lizmap/project.xml
	sed -i "s/\(<version.*pre\)</\1\.$(COMMIT_NUMBER)</" $(DIST)/lizmap/project.xml
	sed -i "s@commitSha=@commitSha=$(COMMITID)@g" $(DIST)/lizmap/app/system/mainconfig.ini.php
	mkdir -p $(DIST)/temp/lizmap/
	cp -a temp/.htaccess $(DIST)/temp/
	cp -a temp/lizmap/.empty $(DIST)/temp/lizmap/
	@for file in $(FORBIDDEN_CONFIG_FILES); do rm -f $(DIST)/lizmap/var/config/$$file; done;
	@for dir in $(EMPTY_DIRS); do rm -rf $(DIST)/lizmap/$$dir/*;  touch $(DIST)/lizmap/$$dir/.empty; done;
	rm -f $(DIST)/lizmap/composer.*
	rm -rf $(DIST)/lizmap/www/cache/images/* && touch $(DIST)/lizmap/www/cache/images/.empty
	rm -rf $(DIST)/lizmap/www/document/* && touch $(DIST)/lizmap/www/document/.empty
	echo $(LIZMAP_VERSION) > $(DIST)/VERSION
	chmod -R o-w $(DIST)/

$(STAGE)/lizmapdemo:
	cp -aR extra-modules/lizmapdemo $(STAGE)/

$(GENERIC_PACKAGE_DIR): $(DIST)
	mkdir -p $(GENERIC_PACKAGE_DIR)
	cp -a $(DIST)/* $(GENERIC_PACKAGE_DIR)

$(ZIP_PACKAGE): $(DIST)
	cd $(STAGE) && zip -rq $(PACKAGE_NAME).zip  $(PACKAGE_NAME)/

$(GENERIC_PACKAGE_PATH): $(GENERIC_PACKAGE_DIR)
	cd $(STAGE) && zip -rq $(GENERIC_PACKAGE_ZIP) $(GENERIC_DIR_NAME)/

$(ZIP_DEMO_PACKAGE): $(STAGE)/lizmapdemo
	cd $(STAGE) && zip -rq $(DEMO_PACKAGE_NAME).zip  lizmapdemo/

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

stage: $(DIST)

ci_package: $(ZIP_PACKAGE) $(GENERIC_PACKAGE_PATH) $(ZIP_DEMO_PACKAGE)

package: clean build ci_package

deploy_download:
	upload_to_packages_server $(ZIP_PACKAGE) pub/lizmap/unstable/$(SHORT_VERSION)/
	upload_to_packages_server $(ZIP_DEMO_PACKAGE) pub/lizmap/unstable/$(SHORT_VERSION)/

deploy_download_stable:
	upload_to_packages_server $(ZIP_PACKAGE) pub/lizmap/release/$(SHORT_VERSION)/
	upload_to_packages_server $(ZIP_DEMO_PACKAGE) pub/lizmap/release/$(SHORT_VERSION)/

saas_deploy_snap:
	saas_release_lizmap unstable $(SAAS_LIZMAP_VERSION) $(GENERIC_PACKAGE_PATH)

saas_release: check-release
	saas_release_lizmap stable $(SAAS_LIZMAP_VERSION) $(GENERIC_PACKAGE_PATH)

version-doc:
	sed -i "s@COMMIT_ID@$(COMMITID)@g" docs/index.html
	sed -i "s@VERSION@$(FULL_VERSION)@g" docs/index.html docs/phpdoc.xml
	sed -i "s@DATE@$(DATE_VERSION)@g" docs/index.html
	jq '.version = "$(FULL_VERSION)"' package.json > "$tmp" && mv "$tmp" package.json

php-doc:
	docker run --rm -v ${PWD}:/data phpdoc/phpdoc:3 -c docs/phpdoc.xml

js-doc:
	rm -rf docs/js
	npx jsdoc -c docs/jsdoc.json

docker-build: debug $(GENERIC_PACKAGE_PATH) docker-build-ci

docker-build-ci: debug $(DOCKER_MANIFEST)
	cp $(GENERIC_PACKAGE_PATH) docker/
	docker build --rm $(DOCKER_BUILD_ARGS) -t $(DOCKER_BUILDIMAGE) docker/

docker-tag:
	docker tag $(DOCKER_BUILDIMAGE) $(REGISTRY_PREFIX)$(DOCKER_NAME):$(DOCKER_MANIFEST_VERSION)
ifdef DOCKER_MANIFEST_VERSION_SHORT
	docker tag $(DOCKER_BUILDIMAGE) $(REGISTRY_PREFIX)$(DOCKER_NAME):$(DOCKER_MANIFEST_VERSION_SHORT)
endif
ifdef DOCKER_MANIFEST_RELEASE_TAG
	docker tag $(DOCKER_BUILDIMAGE) $(REGISTRY_PREFIX)$(DOCKER_NAME):$(DOCKER_MANIFEST_RELEASE_TAG)
endif

docker-deliver: check-registry  docker-tag
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

docker-release:
	cd docker && release-image $(DOCKER_RELEASE_PACKAGE_NAME)
	cd docker && push-to-docker-hub --clean

docker-hub:
	cd docker && push-to-docker-hub --clean

php-cs-fixer-test-docker:
	# Version must match the one in the GitHub workflow and pre-commit
	docker run --rm -w=/app -v ${PWD}:/app ghcr.io/php-cs-fixer/php-cs-fixer:3.69-php8.1 check --allow-risky=yes --diff

php-cs-fixer-apply-docker:
	# Version must match the one in the GitHub workflow and pre-commit
	docker run --rm -it -w=/app -v ${PWD}:/app ghcr.io/php-cs-fixer/php-cs-fixer:3.69-php8.1 fix --allow-risky=yes
