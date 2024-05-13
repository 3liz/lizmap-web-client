<?php

echo "Delete all tables from the postgresql database lizmap\n";
$tryAgain = true;

while($tryAgain) {

    $cnx = @pg_connect("host='pgsql' port='5432' dbname='lizmap' user='lizmap' password='lizmap1234!' ");
    if (!$cnx) {
        echo "  postgresql is not ready yet\n";
        sleep(1);
        continue;
    }
    $tryAgain = false;
    pg_query($cnx, 'drop table if exists mapcontext cascade');
    pg_query($cnx, 'drop table if exists jacl2_subject_group cascade');
    pg_query($cnx, 'drop table if exists jacl2_user_group cascade');
    pg_query($cnx, 'drop table if exists jacl2_group cascade');
    pg_query($cnx, 'drop table if exists jacl2_rights cascade');
    pg_query($cnx, 'drop table if exists jacl2_subject');
    pg_query($cnx, 'drop table if exists geobookmark');
    pg_query($cnx, 'drop table if exists jlx_user');
    pg_query($cnx, 'drop table if exists log_counter');
    pg_query($cnx, 'drop table if exists log_detail');
    pg_close($cnx);
}

echo "  tables deleted\n";
