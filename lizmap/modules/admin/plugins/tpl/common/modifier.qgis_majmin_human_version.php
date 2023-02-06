<?php

function jtpl_modifier_common_qgis_majmin_human_version($qgisIntVersion, $include_spaces = false)
{
    // NOTE Will work as long a Major version is on 1 Digit
    return substr($qgisIntVersion, 0, 1).'.'.substr($qgisIntVersion, -2);
}
