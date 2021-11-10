#!/bin/bash
SCRIPTDIR="$( cd "$(dirname "$0")" ; pwd -P )"
DATA=$(find $SCRIPTDIR/ -type f -name "*.sql")
for i in $DATA
do
    echo "* Run file $i"
    PGPASSWORD=lizmap1234! psql -h localhost -p 8132 -U lizmap -f ${i}
done
