<?php
/**
* @package   lizmap
* @subpackage localiz
* @author    aeag
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/


class localizModuleInstaller extends jInstallerModule {

    function install() {
        // installer le CSS
        $cssFile = jApp::wwwPath('css/localiz.css');
        if (! file_exists($cssFile)) {
            $this->copyFile('css/localiz.css', $cssFile);
        }
        
        // installer le JS
        $jsFile = jApp::wwwPath('js/localiz.js');
        if (! file_exists($jsFile)) {
            $this->copyFile('js/localiz.js', $jsFile);
        }

        // conf DB
        $localConfFile = jApp::configPath('localconfig.ini.php');
        if (file_exists($localConfFile)) {
            $ini = new jIniFileModifier($localConfFile);
            $ini->setValue('db_driver', 'pgsql', 'localiz_plugin');
            $ini->setValue('db_host', 'pgpool', 'localiz_plugin');
            $ini->setValue('db_port', '5432', 'localiz_plugin');
            $ini->setValue('db_database', 'refgeo2', 'localiz_plugin');
            $ini->setValue('db_user', 'visu', 'localiz_plugin');
            $ini->setValue('db_password', 'visu', 'localiz_plugin');
            $ini->setValue('db_query', "select oid, geometrytype, value, label, longlabel, xmin, ymin, xmax, ymax from MYTABLE where label like '%s%%'", 'localiz_plugin');
            /* Ex with plain text search
                "select oid, typcode, geometrytype(geom) as geometrytype, code as value, lib || complement as label, 
                typ || ' ' || lib || complement || ' (' || code || ')' as longlabel, 
                st_xmin(bbox) xmin, st_ymin(bbox) ymin, st_xmax(bbox) xmax, st_ymax(bbox) ymax
                from services.ref_search
                where (v @@ to_tsquery('fr', regexp_replace('%1$s', '\\s+', '&', 'g')) )
                order by st_area(bbox) desc"            */
            $ini->save();
        }
        
    }
}