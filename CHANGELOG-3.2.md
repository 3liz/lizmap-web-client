Changelog 3.2
=============

Version 3.2.18 (next)
---------------------

- update locales
- Upgrade the ldapdao module, to fix ldap connection management
- Update IGN attribution
- Fix a PHP notice about the existence of the hideLayer property

Version 3.2.17
---------------------

- Treat PostGIS view datasource containing `key='""'` as `key=''`
- Remove wps module from docker image
- Fix broken link to IGN image in attribution
- Datepicker i18n,call getCurrentLang() once
- Fix the user table name into the Sqlite to Postgresql migrator
- localization updated. New supported language: Slovak
- upgrade ldap support (ldapdao module), to fix ldap connection management

Version 3.2.16
---------------------

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

