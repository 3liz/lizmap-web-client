<?php

echo "Create the schema lizmap into the database lizmap\n";
$tryAgain = true;

while($tryAgain) {

    $cnx = @pg_connect("host='pgsql' port='5432' dbname='lizmap' user='lizmap' password='lizmap1234!' ");
    if (!$cnx) {
        echo "  postgresql is not ready yet\n";
        sleep(1);
        continue;
    }
    $tryAgain = false;
    pg_query($cnx, 'CREATE SCHEMA IF NOT EXISTS lizmap');
    pg_query($cnx, 'CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public');
    pg_close($cnx);
}

echo "  schema created\n";
