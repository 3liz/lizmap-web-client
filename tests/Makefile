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
LZMQGSRVVERSION ?= qgis-ltr-eager
QGSRVAPIPORT ?= 8134
LZMPGPORT ?= 8132
LZMQGSRVPORT ?= 8131
LZMQGSADMINPORT ?= 9876
LZMWEBPORT ?= 8130
LZMWEBSPORT ?= 8135
LIZMAP_ADMIN_LOGIN ?= admin
LIZMAP_ADMIN_EMAIL ?= admin@localhost.local
LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE ?= /srv/etc/admin.conf
DOCKER_BUILDKIT ?= 1
SWAGGER_UI_PORT ?= 8133
SWAGGER_YAML_FOLDER_PATH ?= ./api

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
	LZMWEBSPORT=$(LZMWEBSPORT)
	QGSRVAPIPORT=$(QGSRVAPIPORT)
	LIZMAP_ADMIN_LOGIN=$(LIZMAP_ADMIN_LOGIN)
	LIZMAP_ADMIN_EMAIL=$(LIZMAP_ADMIN_EMAIL)
	LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE=$(LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE)
	COMPOSE_PROJECT_NAME=$(PREFIX)
	PHP_VERSION=$(PHP_VERSION)
	DOCKER_BUILDKIT=$(DOCKER_BUILDKIT)
	SWAGGER_PORT=$(SWAGGER_UI_PORT)
	EOF

build-plugins:
	echo "Plugins are auto installed at qgis worker startup"

show-qgis-server-versions:
	@docker run -q \
	    --rm -i \
	    --entrypoint qjazz-config \
	    3liz/qjazz:${LZMQGSRVVERSION} \
	    version
	docker run \
	    -u $(LIZMAP_USER_ID):$(LIZMAP_GROUP_ID) \
	    --rm -i \
	    -e QGIS_PLUGINPATH=/srv/plugins \
	    -e QGIS_PLUGIN_MANAGER_SKIP_SOURCES_FILE=True \
	    -v $(shell pwd)/qgis-server-plugins:/srv/plugins \
	    -v $(shell pwd)/:/src \
	    --workdir /srv/plugins \
	    --entrypoint qgis-plugin-manager \
	    3liz/qjazz:${LZMQGSRVVERSION} \
	    list

upgrade-projects:
	@echo "Upgrading all projects in qgis-projects/tests to ${LZMQGSRVVERSION}"
	@docker run -q \
	    -u $(LIZMAP_USER_ID):$(LIZMAP_GROUP_ID) \
	    --rm -i \
	    -v $(shell pwd)/qgis-server-plugins:/srv/plugins \
	    -v $(shell pwd)/qgis-projects/tests:/tmp/qgis-projects \
	    --entrypoint /srv/plugins/upgrade_projects.py \
	    3liz/qjazz:${LZMQGSRVVERSION} \

up: env
	docker compose --profile=dev up  -V --force-recreate -d

# Alias for 'up'
run: up

stop:
	docker compose --profile=dev  stop

reset:
	docker compose --profile=dev down -v --remove-orphans
	./lizmap-ctl clean

# install or update base images, to be sure we have the latest images
build:: env
	docker compose pull

# install or update plugins, to be sure we have the latest plugins
build:: build-plugins

clean:
	./lizmap-ctl clean

clean-plugins:
	rm -rf \
	./qgis-server-plugins/.cache_plugin_manager \
	./qgis-server-plugins/atlasprint \
	./qgis-server-plugins/lizmap_server \
	./qgis-server-plugins/wfsOutputExtension 

# run docker
# prepare lizmap
# populate PostgreSQL database with testing data
install: run
	./lizmap-ctl install
	./qgis-projects/tests/load_sql.sh
