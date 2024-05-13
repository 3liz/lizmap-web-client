
# Docker image with composer base on debian:buster-slim
#

NAME=lizmap-builder

PHP_VERSION:=8.1

VERSION_TAG=php$(PHP_VERSION)

all: build image

image:
	$(MAKE) -C .. docker-build docker-tag docker-clean

builder:
	docker build --rm \
		--build-arg="php_version=$(PHP_VERSION)" \
		-t $(NAME):$(VERSION_TAG) \
		.

WORKDIR=$(realpath ..)

package: builder
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
