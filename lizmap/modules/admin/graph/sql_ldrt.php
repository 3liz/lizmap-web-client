<?php
// info conexão
include 'i.php';

// Performing SQL query
$query = 'SELECT data
	FROM public.v_log_detail_log_repository_total_legenda';
$result = pg_query($query) or exit('Query failed: '.pg_last_error());

// Printing results in HTML
while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
    foreach ($line as $col_value) {
        echo $col_value;
    }
}

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);
