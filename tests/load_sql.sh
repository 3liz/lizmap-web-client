#!/bin/bash
DATA=`find ./qgis-projects/tests -type f -name "*.sql"`
for i in $DATA
do
    echo "* Run file $i"
    PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f ${i}
done
