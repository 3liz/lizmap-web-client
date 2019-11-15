The PHP Connector for CKFinder 3.x
==================================

## Quick Start

Follow the steps below to install the CKFinder PHP connector.

1. `git clone git@github.com:cksource/ckfinder-connector-php.git`
2. `cd ckfinder-connector-php`
3. `composer install`
4. `cp config.template.php config.php`
5. Edit `config.php` and set `return true;` in the `authentication` function.
6. Give write permissions for the `userfiles` directory (e.g. `chmod 777`)
7. Run: `http://127.0.0.1/ckfinder-connector-php/ckfinder.php?command=Init`

At this stage you should see the JSON response.

## Building Documentation

In order to build the documentation, install [doxygen](http://www.doxygen.org). Version 1.8.8+ is recommended due to some major bugs fixed.

1. `cd dev/doc`
2. `./builddoc.sh`
3. The documentation is created in the `output/html` folder.

## License

Copyright (c) 2007-2019, CKSource - Frederico Knabben. All rights reserved.

See `license.txt` for licensing details.
