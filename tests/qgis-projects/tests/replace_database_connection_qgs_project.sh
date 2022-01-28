#!/bin/sh

if [ "$#" -ne 2 ]; then
    echo "Bad numbers of arguments"
    echo "This script is to replace the service database connection in a set of QGIS projects."
    echo "replace_database_connection_qgs_project.sh QGS_DIRECTORY NEW_SERVICE"
    echo "Be careful, original files will be updated"
    exit 1
fi

DIR="$1"

echo "$DIR : Is the path for the qgs projects to modify"

echo "#### Update files ####"

for file in "$DIR"*.qgs
do
    echo "$file updated"
    sed -i "s/source=\"service='lizmapdb'/source=\"service='$2'/g" $file;
    sed -i "s/<datasource>service='lizmapdb'/<datasource>service='$2'/g" $file;
done

echo "#### End ####"
