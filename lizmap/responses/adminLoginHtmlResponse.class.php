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

class adminLoginHtmlResponse extends jResponseHtml {

    function __construct() {
        parent::__construct();
        $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');

       // Override default theme with color set in admin panel
       if($cssContent = jFile::read(jApp::varPath('lizmap-theme-config/') . 'theme.css') ){
           $css = '<style type="text/css">' . $cssContent . '</style>
           ';
           $this->addHeadContent($css);
        }

    }

    protected function doAfterActions() {
        $this->bodyTpl = 'master_admin~index_login';
        // Include all process in common for all actions, like the settings of the
        // main template, the settings of the response etc..
       $this->title .= ($this->title !=''?' - ':'').'Administration';
       $this->body->assignIfNone('MAIN','');
    }
}
