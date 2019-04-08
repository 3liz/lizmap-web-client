# Contribution guidelines


## Pull request

To contribute you should clone the lizmap_web_client repository into your
Github account. After adding some changes in a new branch (see Branches and Commits),
you should do a pull request in Github.

## Branches

* New features are developped in **master** branch
* **release_X_Y** branches are created for each stable version, for example release_3_1 for Lizmap 3.1
* Bug fixes must land on the **last release branch**, for example **release_3_1**. We regularly merge the last release branch in the master branch. No cherry-pick must be done from master into the release branch

## Commits

You should create commits in a new branch based on the target branch (see above).

```
# git checkout -b <your-new-branch> <target-branch>
# example:

git checkout -b fix-something release_3_1 
```

* Commit messages must be written with care. First line of the message is short and allows a quick comprehension. A description can be written after a line break if more text is needed.
* Related issues must be written in the commit message. Be aware Github can close related issues when using some words: https://help.github.com/articles/closing-issues-via-commit-messages/
* A keyword can be used to prefix the commit and describe the type of commit, between brackets like [FEATURE] or [BUGFIX]

For example

```
[FEATURE] New super feature to make coffea #123456789

This allows the user to request coffea:
* with sugar
* long or regular
```

## Coding style

Use [php-cs-fixer](https://cs.symfony.com/) to follow our coding style in PHP sources.
Launch it at the root of the repository.

```bash
php-cs-fixer fix
```

Configuration of php-cs-fixer has been setup into .php-cs.dist.

## Issues

Go to https://github.com/3liz/lizmap-web-client/issues and post issues you find.

## Testing your changes

You can test your changes by running a Vagrant machine. It allows to create
quickly a virtual machine with all softwares needed by Lizmap (PostgreSQL, QGIS Server...).
See vagrant/README.md for details and to learn how to launch this VM.

You can test with Android browsers in your Ubuntu Desktop thanks to [Anbox](https://docs.anbox.io/userguide/install.html#install-anbox).
For example, you can [download a x86 version of Firefox Mobile](https://ftp.mozilla.org/pub/mobile/) then [install it](https://docs.anbox.io/userguide/install_apps.html#install-applications).

## Localization

The locale files are stored in the modules' locales directory.
The files are *.properties. You can find documentation about localizing Jelix
application here : https://docs.jelix.org/en/manual-1.6/locales

However, only modifications on en_US locales are accepted in Pull Requests.
All other locales are translated with Transifex. So to help us to translate, 
please go on Transifex:  https://www.transifex.com/3liz-1/lizmap-locales/

For core developers, see the repository https://github.com/3liz/lizmap-locales/.
