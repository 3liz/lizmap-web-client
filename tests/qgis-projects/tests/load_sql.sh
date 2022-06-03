#!/bin/bash
SCRIPTDIR="$( cd "$(dirname "$0")" ; pwd -P )"

echo "* Run file $SCRIPTDIR/tests_dataset.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f $SCRIPTDIR/tests_dataset.sql

echo "* Run file $SCRIPTDIR/set_tests_respository_rights.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f $SCRIPTDIR/set_tests_respository_rights.sql

echo "* Run file $SCRIPTDIR/set_tests_lizmap_search.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f $SCRIPTDIR/set_tests_lizmap_search.sql
