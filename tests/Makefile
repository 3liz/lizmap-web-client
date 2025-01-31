#
# Makefile for running tests
#

SHELL:=bash
.ONESHELL:
.PHONY: env

export LZMBRANCH ?= $(shell git rev-parse --abbrev-ref HEAD | tr '[:upper:]' '[:lower:]')

PREFIX:=lizmap-$(LZMBRANCH)-tests

LIZMAP_USER_ID ?= $(shell id -u)
LIZMAP_GROUP_ID ?= $(shell id -g)
# Note that GH Action E2E has its own version config for PHP, PG and QGIS
PHP_VERSION ?= 8.2
LZMPOSTGISVERSION ?= 14-3
LZMQGSRVVERSION ?= 3.34
LZMPGPORT ?= 8132
LZMQGSRVPORT ?= 8131
LZMWEBPORT ?= 8130
LIZMAP_ADMIN_LOGIN ?= admin
LIZMAP_ADMIN_EMAIL ?= admin@localhost.local
LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE ?= /srv/etc/admin.conf
DOCKER_BUILDKIT ?= 1

env:
	@echo "Creating environment file for Docker Compose"
	@cat <<-EOF > .env
	LIZMAP_USER_ID=$(LIZMAP_USER_ID)
	LIZMAP_GROUP_ID=$(LIZMAP_GROUP_ID)
	LZMPOSTGISVERSION=$(LZMPOSTGISVERSION)
	LZMQGSRVVERSION=$(LZMQGSRVVERSION)
	LZMBRANCH=$(LZMBRANCH)
	LZMPGPORT=$(LZMPGPORT)
	LZMQGSRVPORT=$(LZMQGSRVPORT)
	LZMWEBPORT=$(LZMWEBPORT)
	LIZMAP_ADMIN_LOGIN=$(LIZMAP_ADMIN_LOGIN)
	LIZMAP_ADMIN_EMAIL=$(LIZMAP_ADMIN_EMAIL)
	LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE=$(LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE)
	COMPOSE_PROJECT_NAME=$(PREFIX)
	PHP_VERSION=$(PHP_VERSION)
	DOCKER_BUILDKIT=$(DOCKER_BUILDKIT)
	EOF


build-plugins:
	docker run \
	    -u $(LIZMAP_USER_ID):$(LIZMAP_GROUP_ID) \
	    --rm -i \
	    -e QGSRV_SERVER_PLUGINPATH=/srv/plugins \
	    -e QGIS_PLUGIN_MANAGER_SOURCES_FILE=/tmp/sources-plugin-manager.list \
	    -e QGIS_PLUGIN_MANAGER_CACHE_DIR=/tmp/cache-plugin-manager \
	    -v $(shell pwd)/qgis-server-plugins:/srv/plugins \
	    -v $(shell pwd)/:/src \
        --entrypoint /src/add_server_plugins.sh \
	    3liz/qgis-map-server:${LZMQGSRVVERSION} \

show-qgis-server-versions:
	docker run \
	    --rm -i \
	    --entrypoint qgisserver \
	    3liz/qgis-map-server:${LZMQGSRVVERSION} \
	    --version
	docker run \
	    -u $(LIZMAP_USER_ID):$(LIZMAP_GROUP_ID) \
	    --rm -i \
	    -e QGSRV_SERVER_PLUGINPATH=/srv/plugins \
	    -e QGIS_PLUGIN_MANAGER_SKIP_SOURCES_FILE=True \
	    -v $(shell pwd)/qgis-server-plugins:/srv/plugins \
	    -v $(shell pwd)/:/src \
	    --entrypoint qgis-plugin-manager \
	    3liz/qgis-map-server:${LZMQGSRVVERSION} \
	    list

upgrade-projects:
	@echo "Upgrading all projects in qgis-projects/tests to ${LZMQGSRVVERSION}"
	docker run \
	    -u $(LIZMAP_USER_ID):$(LIZMAP_GROUP_ID) \
	    --rm -i \
	    -v $(shell pwd)/qgis-server-plugins:/srv/plugins \
	    -v $(shell pwd)/qgis-projects/tests:/tmp/qgis-projects \
	    --entrypoint /srv/plugins/upgrade_projects.py \
	    3liz/qgis-map-server:${LZMQGSRVVERSION} \

up: env
	docker compose up  -V --force-recreate -d

stop:
	docker compose stop

reset:
	docker compose down -v --remove-orphans
	./lizmap-ctl clean
