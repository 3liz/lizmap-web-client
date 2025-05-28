#!/bin/sh

set -e

if [ "$#" -ne 3 ]; then
    echo "Bad numbers of arguments"
    echo "This script is to replace the service database connection in a set of QGIS projects."
    echo "deploy_snap.sh QGS_DIRECTORY NEW_SERVICE INSTANCE_VERSION"
    echo "INSTANCE_VERSION like lizmap_3_7"
    echo "Be careful, original files will be updated"
    exit 1
fi

DIR="$1"
NEW_SERVICE="$2"
INSTANCE_NAME="$3"

echo "$DIR : Path to update"

echo "#### Update files ####"

for file in "$DIR"*.qgs
do
    echo "$file updated"
    sed -i "s/service='lizmapdb'/service='$2'/g" "$file";
    sed -i "s/<datasource>service='lizmapdb'/<datasource>service='$2'/g" "$file";
done

echo "Drop existing schema"
psql -v ON_ERROR_STOP=1 service=${NEW_SERVICE} -n -c "DROP SCHEMA IF EXISTS tests_projects CASCADE"

echo "Update rights in the file"
sed -i "s#INSERT INTO lizmap\.#INSERT INTO lizmap_${INSTANCE_NAME}\.#g" set_tests_respository_rights.sql

echo "SQL queries on the server"

psql -v ON_ERROR_STOP=1 service=${NEW_SERVICE} -f set_tests_respository_rights.sql

# Import data, check there isn't any ACL before
psql -v ON_ERROR_STOP=1 service=${NEW_SERVICE} -f tests_dataset.sql
psql -v ON_ERROR_STOP=1 service=${NEW_SERVICE} -f set_tests_lizmap_search.sql
psql -v ON_ERROR_STOP=1 service=${NEW_SERVICE} -f set_tests_module_action.sql

# Clean
find . -name "*.qgs~" -type f -delete
find . -name "*.bak" -type f -delete
find . -name "*_attachments.zip" -type f -delete

echo "#### End ####"

echo "You must transfer files now"
echo "Tip after : git reset --hard"
