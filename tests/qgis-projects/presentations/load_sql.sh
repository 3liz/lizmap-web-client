# Import SQL data for test purpose
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Delete the previous demo data
echo "=== Drop the existing demo schema and data"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -c "DROP SCHEMA IF EXISTS demo CASCADE;"

# Import data
echo "=== Add the demo schema with test data"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f "$SCRIPT_DIR"/test_data.sql

# Import sample presentations
echo "=== Add the presentation data"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f "$SCRIPT_DIR"/sample_presentations.sql

echo "* Run file $SCRIPTDIR/set_tests_repository_rights.sql"
PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f "$SCRIPT_DIR"/set_tests_repository_rights.sql
