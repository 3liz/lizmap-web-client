# Contribution guidelines

## Getting in touch

* People working on Lizmap are available through email on :
  * [Discourse](https://discourse.osgeo.org/c/qgis/lizmap/48)
  * the [Lizmap mailing list](https://lists.osgeo.org/pipermail/lizmap/)
* We are also hanging out on #lizmap on https://libera.chat

## Localization and translation

### For the English language

The locale files (except for `en_US` language) are stored into the `lizmap/app/locales` directory.
The files are `*.properties`. You can find [documentation about localizing Jelix](https://docs.jelix.org/en/manual-1.6/locales).

Locale files for `en_US` language are stored into modules directly (see `locales/`
directory into subdirectories of `lizmap/modules/`).

Only modifications on `en_US` locales are accepted in Pull Requests.

### For other locales

All locales are translated with [Transifex](https://www.transifex.com/) with the **help of the opensource community**.
So to help us to translate, please go on Transifex, create an account and ask to join these projects :

* [Lizmap-locales](https://www.transifex.com/3liz-1/lizmap-locales/) to translate Lizmap Web Client and Lizmap QGIS plugin strings
- [Jelix](https://www.transifex.com/3liz-1/jelix/) to translate Jelix strings (the web framework used in Lizmap Web Client)
- [Documentation](https://www.transifex.com/3liz-1/lizmap-documentation/) to translate the [documentation](https://docs.lizmap.com)

If the language is not yet available, you can **request** the language on Transifex.
Please check carefully existing languages before requesting a new one, about the language code. (with 2 or 4 characters).

For **core developers**, see the repository https://github.com/3liz/lizmap-locales/
and https://github.com/jelix/jelix-langpacks.

## Source code about PHP/Javascript

To contribute you should clone the 3liz/lizmap-web-client repository into your
GitHub account. After adding some changes in a new branch (see Branches and Commits),
you should do a pull request in GitHub.

### Branches

* New features are developed in `master` branch
* `release_X_Y` branches are created for each stable version, for example `release_3_4` for Lizmap 3.4
* Starting from January 2021, bug fixes must land on the `master` branch. To backport to a released branch,
  either use the backport bot or do the cheery-pick manually. It's your responsibility to check the backport.

### Pre-commit

We are using some pre-commit hook using [pre-commit.com](https://pre-commit.com/) (to run in a venv ideally) :

```bash
pip install pre-commit
pre-commit install
```
and that's it ! Hooks will run automatically.

### Commits

You should create commits in a new branch based on the `master` branch.

```
# git checkout -b <your-new-branch> master
# example:

git checkout -b fix-something master
```

* Commit messages must be written with care. First line of the message is short and allows a quick comprehension.
  A description can be written after a line break if more text is needed.
* Related issues must be written in the commit message. Be aware GitHub can close related issues when using
  some words: https://help.github.com/articles/closing-issues-via-commit-messages/
* A keyword can be used to prefix the commit and describe the type of commit, between brackets like [FEATURE]
  or [BUGFIX]

For example :

```
[FEATURE] New super feature to make coffea #123456789

This allows the user to request coffea:
* with sugar
* long or regular
```

## Build and install dependencies

**Since Lizmap 3.4, the source code in the repository is not usable directly**.
The application should be "built" first.

If you want to modify then test the code of Lizmap, or if you want to generate
zip packages you must install some tools. See below.

If you just want to modify and/or test the docker image of Lizmap (the
`docker/` directory). See `docker/CONTRIBUTING.md`.

### tools

You need some developer tools in order to build and install dependencies.

* The CLI version of PHP. Be sure that following extensions are also installed:
  `json`, `curl`, `mbstring`, `xml`.
* [Composer](http://getcomposer.org), the package manager of PHP.
* Nodejs and npm:
  * with [binaries](https://nodejs.org/en/download/)
  * or with the package manager for your Linux distribution, but prefer to install
    directly from [nodesource](https://github.com/nodesource/distributions/blob/master/README.md#debinstall)
* `Make` and `zip`.

### Building a zip with Javascript and PHP

- Run `make package` in your terminal.
- You'll have 3 packages in the `build` directory:
  - `lizmap-web-client` and `lizmap-web-client-X.Y` are identical.
  - Each folder has its own zip file too.
  - `lizmapdemo` is a module for the Lizmap demo.

### Building JavaScript only

#### Requirements

* Install dependencies with `npm install` in the root directory.

It creates a `node_modules/` directory. Don't commit it into the git repository!

#### Installation

* Build for production (minified JS files) :
    * From root directory : `npm run build`

Don't commit minified JS files into the git repository. They will be built by our
continuous integration and added into zip packages that are available on GitHub.

* Build for development (source mapping, build is executed at every change on a JS file) :
    * From root directory : `npm run watch`

Look at [webpack documentation](https://webpack.js.org/guides/development/) for other development options (e.g. live reloading)

### Installing PHP dependencies only

Run `composer install` into the `lizmap/` directory.

It will download some packages and install them into `lizmap/vendor/`.
Don't commit this directory into the git repository!

## Coding style

### PHP

Use [php-cs-fixer](https://cs.symfony.com/) to follow our coding style in PHP sources.
Launch it at the root of the repository.

```bash
php-cs-fixer fix
```

Configuration of `php-cs-fixer` has been set up into `.php-cs.dist`.

### JavaScript

Please run `npm run pretest` in the root directory and fix errors before any commit.

## Issues

Go to [GitHub](https://github.com/3liz/lizmap-web-client/issues) and post issues you find.

## Testing your changes

Tests is highly recommended for any new commits. Tests can be provided with :

* End-to-end tests with Playwright
* PHP Unit tests
* Manual tests

You can test your changes, or you can launch unit tests, by running some
Docker containers. Go into `tests/` and read the [README.md](./tests/README.md) file.
A `docker-compose.yml` file is provided, launching a full stack of softwares to
run Lizmap (NGINX, PHP-FPM, QGIS, PostgreSQL...).

You can test with Android browsers in your Ubuntu Desktop thanks to [Anbox](https://docs.anbox.io/userguide/install.html#install-anbox).
For example, you can [download a x86 version of Firefox Mobile](https://ftp.mozilla.org/pub/mobile/) then
[install it](https://docs.anbox.io/userguide/install_apps.html#install-applications).
