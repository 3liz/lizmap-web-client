# Project files and data
In this directory for every tests you'll find :
* a QGIS project (*.qgs)
* a Lizmap configuration (*.qgs.cfg)
* a dump of PostgreSQL (schema + data)(*.sql). Command example to dump : `pg_dump -d "service=lizmapdb" -t tests_projects.layer_with_no_filter -t tests_projects.filter_layer_by_user -t tests_projects.filter_layer_by_user_edition_only -f filter_layer_by_user.sql`
* a markdown discribing the manual tests scenarios (*.md)

Those files share the same name, only extension is different.
