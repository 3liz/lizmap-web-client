<?php

/**
 * HTML Jelix response for full screen map.
 *
 * @author    3liz
 * @copyright 2011-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once __DIR__.'/AbstractLizmapHtmlResponse.php';

class adminHtmlResponse extends AbstractLizmapHtmlResponse
{
    protected $CSPPropName = 'adminCSPHeader';

    public $bodyTpl = 'master_admin~main';

    public function __construct()
    {
        parent::__construct();
        $this->prepareHeadContent();

        $this->addAssets('jquery_ui');
        $this->addAssets('bootstrap');

        // Override default theme with color set in admin panel
        $CSSThemeFile = jApp::varPath('lizmap-theme-config/').'theme.css';
        if (file_exists($CSSThemeFile)) {
            $cssContent = file_get_contents($CSSThemeFile);
            if ($cssContent) {
                $css = '<style type="text/css">'.$cssContent.'</style>';
                $this->addHeadContent($css);
            }
        }
    }

    protected function doAfterActions()
    {

        // Include all process in common for all actions, like the settings of the
        // main template, the settings of the response etc..
        $this->title .= ($this->title != '' ? ' - ' : '').' Administration';
        $this->body->assignIfNone('selectedMenuItem', '');
        $this->body->assignZone('MENU', 'master_admin~admin_menu', array('selectedMenuItem' => $this->body->get('selectedMenuItem')));
        $this->body->assignZone('INFOBOX', 'master_admin~admin_infobox');
        $this->body->assignIfNone('MAIN', '');
        $this->body->assignIfNone('adminTitle', '');
        $this->body->assign('user', jAuth::getUserSession());

        parent::doAfterActions();
    }
}
