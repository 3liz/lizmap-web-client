#

STAGE=build
DIST=$(STAGE)/lizmap-web-client

FILES=lib lizmap INSTALL.md icon.png license.txt README.md UPGRADE.md CONTRIBUTING.md

VERSION=$(shell sed -n 's:.*<version[^>]*>\(.*\)</version>.*:\1:p' lizmap/project.xml)

FORBIDDEN_CONFIG_FILES := installer.ini.php liveconfig.ini.php lizmapConfig.ini.php localconfig.ini.php profiles.ini.php
EMPTY_DIRS := var/db var/log var/mails var/uploads var/sessions

PACKAGE_NAME=lizmap-web-client-$(VERSION)

.PHONY: package clean stage

package: clean stage
	cd $(STAGE) && zip -r $(PACKAGE_NAME).zip  lizmap-web-client/

clean:
	rm -rf $(STAGE)

stage:
	mkdir -p $(DIST)
	cp -aR $(FILES) $(DIST)/
	mkdir -p $(DIST)/temp/lizmap/
	cp -a temp/.htaccess $(DIST)/temp/
	cp -a temp/lizmap/.empty $(DIST)/temp/lizmap/
	rm -rf $(DIST)/lizmap/vendor
	@for file in $(FORBIDDEN_CONFIG_FILES); do rm -f $(DIST)/lizmap/var/config/$$file; done;
	@for dir in $(EMPTY_DIRS); do rm -rf $(DIST)/lizmap/$$dir/*;  touch $(DIST)/lizmap/$$dir/.empty; done;
	rm -rf $(DIST)/lizmap/www/cache/images/* && touch $(DIST)/lizmap/www/cache/images/.empty
