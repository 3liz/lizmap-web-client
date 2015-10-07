<?php
/**
* @package   lizmap
* @subpackage localiz
* @author    your name
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/

class defaultCtrl extends jController {
    /**
    *
    */
    function index() {
        $rep = $this->getResponse('html');
        return $rep;
    }
    
    /**
    *
    */
    function search() {
        $localConfig = jApp::configPath('localconfig.ini.php');
        $ini = new jIniFileModifier($localConfig);
        
        $jdbParams = array(
            "driver" => $ini->getValue('db_driver', 'localiz_plugin') ?: 'pgsql',
            "host" => $ini->getValue('db_host', 'localiz_plugin'),
            "port" => $ini->getValue('db_port', 'localiz_plugin') ?: 5432,
            "database" => $ini->getValue('db_database', 'localiz_plugin'),
            "user" => $ini->getValue('db_user', 'localiz_plugin') ?: 'postgres',
            "password" => $ini->getValue('db_password', 'localiz_plugin')
        );
        
        jProfiles::createVirtualProfile('jdb', 'localiz_plugin', $jdbParams);

        $cnx = jDb::getConnection('localiz_plugin');
        $sql = sprintf($ini->getValue('db_query', 'localiz_plugin'), $this->param('term'));
        $res = $cnx->query($sql);
        $rep = $this->getResponse('json');
        $rep->data = array();
        foreach($res as $record)
        {
            $rep->data[] = array( 
                'oid'=>$record->oid, 
                'typcode'=>$record->typcode, 
                'value'=>$record->value, 
                'label'=>$record->label, 
                'longlabel'=>$record->longlabel, 
                'geometrytype'=>$record->geometrytype, 
                'xmin'=>$record->xmin, 
                'ymin'=>$record->ymin, 
                'xmax'=>$record->xmax, 
                'ymax'=>$record->ymax
            );
        }
		
        return $rep;
    }
    
}

