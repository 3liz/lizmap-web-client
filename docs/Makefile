SHELL:=bash
.ONESHELL:
.PHONY: js

js:
	rm -rf docs/js
	npx jsdoc --package ../assets/package.json -r ../assets/src/ -d js/
	# JSDoc errors should be cleaned from the logs
	exit 0
