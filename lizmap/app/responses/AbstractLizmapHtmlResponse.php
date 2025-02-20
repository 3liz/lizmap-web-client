<?php

/**
 * Abstract class for our custom HTML response objects.
 *
 * @author    3liz
 * @copyright 2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_CORE_PATH.'response/jResponseHtml.class.php';

class AbstractLizmapHtmlResponse extends jResponseHtml
{
    protected $CSPPropName = 'mapCSPHeader';

    protected function prepareHeadContent()
    {
        $bp = jApp::urlBasePath();

        // Header
        $this->addHttpHeader('x-ua-compatible', 'ie=edge');

        $csp = jApp::config()->lizmap[$this->CSPPropName];
        if ($csp != '') {
            $this->addHttpHeader('Content-Security-Policy', $csp);
        }

        // Favicon
        $this->addHeadContent('<link rel="shortcut icon" href="'.$bp.'assets/favicon/favicon.ico">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="57x57" href="'.$bp.'assets/favicon/apple-icon-57x57.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="60x60" href="'.$bp.'assets/favicon/apple-icon-60x60.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="72x72" href="'.$bp.'assets/favicon/apple-icon-72x72.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="76x76" href="'.$bp.'assets/favicon/apple-icon-76x76.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="114x114" href="'.$bp.'assets/favicon/apple-icon-114x114.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="120x120" href="'.$bp.'assets/favicon/apple-icon-120x120.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="144x144" href="'.$bp.'assets/favicon/apple-icon-144x144.png">');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="152x152" href="'.$bp.'assets/favicon/apple-icon-152x152.png"> ');
        $this->addHeadContent('<link rel="apple-touch-icon" sizes="180x180" href="'.$bp.'assets/favicon/apple-icon-180x180.png">');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="192x192"  href="'.$bp.'assets/favicon/android-icon-192x192.png"> ');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="32x32" href="'.$bp.'assets/favicon/favicon-32x32.png">');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="96x96" href="'.$bp.'assets/favicon/favicon-96x96.png"> ');
        $this->addHeadContent('<link rel="icon" type="image/png" sizes="16x16" href="'.$bp.'assets/favicon/favicon-16x16.png">');
        $this->addHeadContent('<link rel="manifest" href="'.$bp.'assets/favicon/manifest.json"> ');

        $this->addHeadContent('<meta name="msapplication-TileColor" content="#ffffff">');
        $this->addHeadContent('<meta name="msapplication-TileImage" content="'.$bp.'assets/favicon/ms-icon-144x144.png"> ');
        $this->addHeadContent('<meta name="theme-color" content="#ffffff">');

        $this->addHeadContent('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />');
    }

    protected $jsVarData = array();

    public function addJsVariable($name, $value)
    {
        $this->jsVarData[$name] = $value;
    }

    public function addJsVariables(array $variables)
    {
        $this->jsVarData = array_merge($this->jsVarData, $variables);
    }

    protected function doAfterActions()
    {
        $this->addHeadContent('<script id="lizmap-vars" type="application/json">'.json_encode($this->jsVarData).'</script>');
    }
}
