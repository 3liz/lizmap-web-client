#
# Makefile for running tests
#

SHELL:=bash
.ONESHELL:
.PHONY: env

export LZMBRANCH:=$(shell git rev-parse --abbrev-ref HEAD)

PREFIX:=lizmap-$(LZMBRANCH)-tests

LIZMAP_USER_ID ?= $(shell id -u)
LIZMAP_GROUP_ID ?= $(shell id -g)
LZMPOSTGISVERSION ?= 11-2.5
LZMQGSRVVERSION ?= 3.16
LZMPGPORT ?= 8132
LZMQGSRVPORT ?= 8131
LZMWEBPORT ?= 8130
LIZMAP_ADMIN_LOGIN ?= admin
LIZMAP_ADMIN_EMAIL ?= admin@localhost.local
LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE ?= /srv/etc/admin.conf

env:
	@echo "Creating environment file for docker-compose"
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
	EOF


build: 
	if [ ! -d qgis-server-plugins/lizmap ]; then
		./add_server_plugins.sh
	fi

up: env
	docker-compose up  -V --force-recreate -d

stop:
	docker-compose stop 

reset:
	docker-compose down -v --remove-orphans
	./lizmap-ctl clean

