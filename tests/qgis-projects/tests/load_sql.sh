#!/bin/bash
SCRIPTDIR="$( cd "$(dirname "$0")" ; pwd -P )"

set -e

echo "* Removing existing schema about test data"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -c "DROP SCHEMA IF EXISTS tests_projects CASCADE"

echo "* Run file $SCRIPTDIR/tests_dataset.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f $SCRIPTDIR/tests_dataset.sql

echo "* Run file $SCRIPTDIR/set_tests_respository_rights.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f $SCRIPTDIR/set_tests_respository_rights.sql

echo "* Run file $SCRIPTDIR/set_tests_lizmap_search.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f $SCRIPTDIR/set_tests_lizmap_search.sql

echo "* Run file $SCRIPTDIR/set_tests_module_action.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f $SCRIPTDIR/set_tests_module_action.sql
