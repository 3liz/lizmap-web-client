# Changelog Lizmap 3.3

## 3.3.16 - 2021-06-17

- Fix: some IGN base layers with free keys could not be displayed
- Fix: always display form filters in the same order
- Fix: remove spaces at begin and end in registration login before using it
- Fix: lizmap stop loading baselayers from WMS source or XML file
- Fix: form filter no more fails when using text values with multiple single quote
- Fix: tabs in anchored popup were not toggling

## 3.3.15 - 2021-03-25

- Fix database migrator: sequence should be updated
- Update Jelix to fix an issue in the installer
- Fix 'Undefined index' notice

## 3.3.14 - 2021-03-04

- Fix the sqlite to pgsql migrator
- Fix some issues with PHP 8.0 and PHP 7.x
- Fix geobookmark sql: remove explicit public schema
- Fix the latest issues with rights management in some specific case
- Improved the interface management to be more understandable

## 3.3.13 - 2021-01-14

- Fix assert crs is not empty before loading
- Remove warning about lizmap_search
- Fix issues with rights managements: removing rights to manage rights, from all
  users, was still possible in specific case.
- new config parameter to disable the behavior change of the login page,
  introduced in lizmap 3.3.12, which redirect to the main page when the user
  is already authenticated. You can disable it by setting `noRedirectionOnAuthenticatedLoginPage=on`
  into the jcommunity section of the configuration (`localconfig.ini.php`).
- Fix attribute edition sets to null unedited fields
- Search - Use a transaction to avoid PostgreSQL connection issue

## 3.3.12 - 2020-12-07

- Add 'empty-data' class in auto popup when value is empty or NULL
- Fix QGIS Date format support
- Fix delete attachment in forms
- Fix edition forms: Do not activate combobox or autocomplete on disabled select
- Fix edition forms: mandatory relational value by default
- Fix Admin export logs: there were no output with big logs table

- Configuration form: do not allow to enable user account request when the
  webmaster email is not set
- new scripts for the command line, to create a user, change or reset a password

```bash
php scripts/script.php jcommunity~user:changePassword [--force] <login> [<password>]
php scripts/script.php jcommunity~user:resetPassword <login>
php scripts/script.php jcommunity~user:create [--reset] [--admin] [--no-error-if-exist] <login> <email> [<password>]
```

- authentication: redirect to a lizmap page when the user goes to the login
  form whereas he is authenticated.
- bugs fixes from 3.2.18

## 3.3.11 - 2020-10-13

- Fix QGIS custom dates in forms
- Add zoomlevels to baselayers
- Filter : assert filters have a title
- Filter: use min_date field if max_date undefined
- Don't display filter when no data

- Treat PostGIS view datasource containing `key='""'` as `key=''`
- Remove wps module from docker image
- Fix broken link to IGN image in attribution
- Datepicker i18n,call getCurrentLang() once
- Fix the user table name into the Sqlite to Postgresql migrator
- localization updated. New supported language: Slovak

## 3.3.10 - 2020-08-31

- Fix account management (module jCommunity 1.3.5):
  - Hide reset password links in user profile when password change is not possible
  - Fix configuration reading
- Fix wrong ordering of attributes where the first letter has an accent in filter form

- Update some libraries to fix some bugs :
    - Upgrade jQuery File Upload to version 10.31.0
    - Update Jelix:
      - you can indicate a database name in a connection profile
        when using Postgresql services.
      - fix a security issue when redirecting to a page after authentication
    - upgrade jCommunity to 1.2.4 to fix some low security issues during login
- Fix an error on SQL queries during the migration of user table from Sqlite to Postgresql
- Don't sort values with ValueMap widget to keep order defined in QGIS
- Use form in edition.js to get it's id
- A new command to test the mailer configuration:
  php scripts/script.php jelix~mailer:test your.email@example.com
- Fix show feature count
