help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  start-server   to start the test server"
	@echo "  stop-server    to stop the test server"
	@echo "  test           to perform unit tests.  Provide TEST to perform a specific test."
	@echo "  coverage       to perform unit tests with code coverage. Provide TEST to perform a specific test."
	@echo "  coverage-show  to show the code coverage report"
	@echo "  clean          to remove build artifacts"
	@echo "  docs           to build the Sphinx docs"
	@echo "  docs-show      to view the Sphinx docs"
	@echo "  tag            to modify the version, update changelog, and chag tag"
	@echo "  package        to build the phar and zip files"

start-server: stop-server
	node tests/server.js &> /dev/null &

stop-server:
	@PID=$(shell ps axo pid,command \
	  | grep 'tests/server.js' \
	  | grep -v grep \
	  | cut -f 1 -d " "\
	) && [ -n "$$PID" ] && kill $$PID || true

test: start-server
	vendor/bin/phpunit
	$(MAKE) stop-server

coverage: start-server
	vendor/bin/phpunit --coverage-html=build/artifacts/coverage
	$(MAKE) stop-server

coverage-show: view-coverage

view-coverage:
	open build/artifacts/coverage/index.html

clean:
	rm -rf artifacts/*

docs:
	cd docs && make html && cd ..

docs-show:
	open docs/_build/html/index.html

tag:
	$(if $(TAG),,$(error TAG is not defined. Pass via "make tag TAG=4.2.1"))
	@echo Tagging $(TAG)
	chag update $(TAG)
	sed -i '' -e "s/VERSION = '.*'/VERSION = '$(TAG)'/" src/ClientInterface.php
	php -l src/ClientInterface.php
	git add -A
	git commit -m '$(TAG) release'
	chag tag

package:
	php build/packager.php

.PHONY: docs burgomaster coverage-show view-coverage
