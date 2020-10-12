Changelog
=========

Version 3.3.11
---------------------

- Fix QGIS custom dates in forms
- Add zoomlevels to baselayers
- Filter : assert filters have a title

- Treat PostGIS view datasource containing `key='""'` as `key=''`
- Remove wps module from docker image
- Fix broken link to IGN image in attribution
- Datepicker i18n,call getCurrentLang() once

Version 3.3.10
---------------------

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

