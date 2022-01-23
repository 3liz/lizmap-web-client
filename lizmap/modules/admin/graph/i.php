<?php
// Connecting, selecting database
$dbconn = pg_connect('host=localhost dbname=lizmap user=lizmap_view password=password')
    or exit('Could not connect: '.pg_last_error());
