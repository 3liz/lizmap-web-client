Here you can install some PHP packages with [Composer](https://getcomposer.org)
needed to add new features to Lizmap. It can be packages containing modules, or
libraries for modules you install by hand into lizmap-modules.

Rename `composer.json.dist` to `composer.json`, and fill it by indicating
the list of new packages, into the `require` section (see documentation of Composer).
Keep the package `jelix/composer-module-setup` into the list.

Then run `composer install`. If some packages are modules, probably you'll
have to declare them into `var/config/localconfig.ini.php`. Read their respective
documentation.
