#!/bin/sh

if [ "$#" -ne 6 ]; then
    echo "Bad numbers of arguments"
    echo "This script is to replace the database connection in a set of QGIS projects."
    echo "replace_database_connection_qgs_project.sh QGS_DIRECTORY HOST DB_NAME USER PASSWORD PORT"
    echo "Be careful, original files will be updated"
    exit 1
fi

DIR="$1"

echo "$DIR : Is the path for the qgs projects to modify"

echo "#### Update files ####"

for file in "$DIR"*.qgs
do
    echo "$file updated"
    sed -i "s/source=\"service='lizmapdb'/source=\"dbname='$3' host='$2' port=$6 user='$4'/g" $file;
    sed -i "s/<datasource>service='lizmapdb'/<datasource>dbname='$3' host='$2' port=$6 user='$4' password='$5'/g" $file;
done

echo "#### End ####"

