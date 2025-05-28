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

class adminLoginHtmlResponse extends AbstractLizmapHtmlResponse
{
    protected $CSPPropName = 'adminCSPHeader';

    public function __construct()
    {
        parent::__construct();
        $this->prepareHeadContent();

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
        $this->bodyTpl = 'master_admin~index_login';
        // Include all process in common for all actions, like the settings of the
        // main template, the settings of the response etc..
        $this->title .= ($this->title != '' ? ' - ' : '').'Administration';
        $this->body->assignIfNone('MAIN', '');
        $this->body->assignIfNone('page_title', jLocale::get('jcommunity~login.login.title'));

        parent::doAfterActions();
    }
}
