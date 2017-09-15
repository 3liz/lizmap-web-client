<?php
/**
* HTML Jelix response for full screen map.
* @package   lizmap
* @subpackage admin
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

require_once (JELIX_LIB_CORE_PATH.'response/jResponseHtml.class.php');

class adminHtmlResponse extends jResponseHtml {

    public $bodyTpl = 'master_admin~main';

    function __construct() {
        parent::__construct();

        $bp = jApp::config()->urlengine['basePath'];
        $this->addJSLink($bp.'js/jquery-1.12.4.min.js');
        $this->addJSLink($bp.'js/jquery-ui-1.11.2.custom.min.js');
        $this->addJSLink($bp.'js/bootstrap.js');

        $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');

       // Override default theme with color set in admin panel
       if($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/') . 'theme.css') ){
           $css = '<style type="text/css">' . $cssContent . '</style>
           ';
           $this->addHeadContent($css);
        }


    }

    protected function doAfterActions() {

        // Include all process in common for all actions, like the settings of the
        // main template, the settings of the response etc..
        $this->title .= ($this->title !=''?' - ':'').' Administration';
        $this->body->assignIfNone('selectedMenuItem','');
        $this->body->assignZone('MENU','master_admin~admin_menu', array('selectedMenuItem'=>$this->body->get('selectedMenuItem')));
        $this->body->assignZone('INFOBOX','master_admin~admin_infobox');
        $this->body->assignIfNone('MAIN','');
        $this->body->assignIfNone('adminTitle','');
        $this->body->assign('user', jAuth::getUserSession());
    }

}
