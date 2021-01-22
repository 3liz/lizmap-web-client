# Project files and data

In this directory for every test you will find :
* a QGIS project (*.qgs)
* a Lizmap configuration (*.qgs.cfg)
* a SQL file for PostgreSQL (schema + data)(*.sql).
  * Command to dump : `pg_dump -d "service=lizmapdb" -t tests_projects.name_of_source_table -t tests_projects.name_of_another_table -f destination.sql`
  * Command to restore : `psql service=lizmapdb -f source.sql`
* a markdown describing the manual tests scenarios (*.md)

Those files share the same name, only extension is different.
