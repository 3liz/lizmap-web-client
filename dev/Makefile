
# Docker image with composer base on debian:buster-slim
#

NAME=lizmap-builder

PHP_VERSION:=7.4
COMPOSER_VERSION:=2.0.8

VERSION_TAG=$(COMPOSER_VERSION)-php$(PHP_VERSION)

all: build image

image:
	$(MAKE) -C .. docker-build docker-tag docker-clean

builder:
	docker build --rm \
		--build-arg="PHP_VERSION=$(PHP_VERSION)" \
		--build-arg="COMPOSER_VERSION=$(COMPOSER_VERSION)" \
		-t $(NAME):$(VERSION_TAG) \
		.

WORKDIR=$(realpath ..)

build: builder
	mkdir -p $(WORKDIR)/.composer $(WORKDIR)/.npm
	docker run --rm -it --user $$(id -u):$$(id -g) \
		--workdir /build \
		--volume $(WORKDIR):/build \
		--volume $(WORKDIR)/.composer:/.composer \
		--volume $(WORKDIR)/.npm:/.npm \
		$(NAME):$(VERSION_TAG) \
		make package

clean:
	rm -rf $(WORKDIR)/.composer $(WORKDIR)/.npm


