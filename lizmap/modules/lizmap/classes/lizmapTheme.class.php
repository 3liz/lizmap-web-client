<?php

use Jelix\IniFile\IniModifier;

/**
 * Manage and give access to lizmap theme configuration.
 *
 * @author    3liz
 * @copyright 2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapTheme
{
    // Lizmap configuration file path (relative to the path folder)
    private $config = 'config/lizmapConfig.ini.php';

    // Lizmap theme data
    private $data = array();

    // theme properties
    private $properties = array(
        'headerLogo',
        'headerLogoWidth',
        'headerBackgroundImage',
        'headerBackgroundColor',
        'headerTitleColor',
        'headerSubtitleColor',
        'menuBackgroundColor',
        'dockBackgroundColor',
        'navbarColor',
        'additionalCss',
    );

    // header logo image
    public $headerLogo = '';

    // header logo image width
    public $headerLogoWidth = '';

    // header background image
    public $headerBackgroundImage = '';

    // header background color
    public $headerBackgroundColor = '';

    // header title color
    public $headerTitleColor = '';

    // header subtitle color
    public $headerSubtitleColor = '';

    // menu background color
    public $menuBackgroundColor = '';

    // dock background color
    public $dockBackgroundColor = '';

    // navbar color
    public $navbarColor = '';

    // additional CSS properties
    public $additionalCss = '';

    public function __construct()
    {
        // read the lizmap configuration file
        $readConfigPath = parse_ini_file(jApp::varPath().$this->config, true);
        $this->data = $readConfigPath;

        // set generic parameters
        foreach ($this->properties as $prop) {
            if (isset($readConfigPath['theme'][$prop])) {
                $this->{$prop} = $readConfigPath['theme'][$prop];
            }
        }
    }

    /**
     * Get theme properties.
     */
    public function getProperties()
    {
        return $this->properties;
    }

    /**
     * Modify the theme.
     *
     * @param array $data array containing the data of the theme
     */
    public function modify($data)
    {
        $modified = false;
        foreach ($data as $k => $v) {
            if (in_array($k, $this->properties)) {
                $this->data['theme'][$k] = $v;
                $this->{$k} = $v;
                $modified = true;
            }
        }

        return $modified;
    }

    /**
     * Update the theme. (modify and save).
     *
     * @param array $data array containing the data of the theme
     */
    public function update($data)
    {
        $modified = $this->modify($data);
        if ($modified) {
            $modified = $this->save();
        }

        return $modified;
    }

    /**
     * Save the theme.
     */
    public function save()
    {
        // Get access to the ini file
        $iniFile = jApp::varConfigPath('lizmapConfig.ini.php');
        $ini = new IniModifier($iniFile);

        foreach ($this->properties as $prop) {
            if ($this->{$prop} != '') {
                $ini->setValue($prop, $this->{$prop}, 'theme');
            } else {
                $ini->removeValue($prop, 'theme');
            }
        }

        // Save the ini file
        $ini->save();

        // Save the CSS theme file configured via this controller
        $this->writeThemeCssFile();

        return $ini->isModified();
    }

    /**
     * Build the theme main css content
     * based one the properties saved.
     */
    private function buildCssThemeContent()
    {
        $css = '';

        // MAIN css
        if (!empty($this->headerBackgroundColor)) {
            $css .= '
        #header {
          background: '.$this->headerBackgroundColor.';
        }
        ';
        }

        // Header logo image and size
        if (!empty($this->headerLogo) and file_exists(jApp::varPath('lizmap-theme-config/').$this->headerLogo)) {
            $logoUrl = jUrl::get('view~media:themeImage', array('key' => 'headerLogo'));
            $css .= '
        #logo {
          background : url("'.$logoUrl.'") no-repeat left center;
          background-size:contain;
        ';
            if (!empty($this->headerLogoWidth)) {
                $css .= '
          width: '.$this->headerLogoWidth.'px;
          text-align: right;
          ';
            }
            $css .= '
        }
        ';

            $css .= '
        #title {
          top: 40%;
          transform: translateY(-60%);
        }
        ';
        }

        // Header background image
        if (!empty($this->headerBackgroundImage) and file_exists(jApp::varPath('lizmap-theme-config/').$this->headerBackgroundImage)) {
            $logoUrl = jUrl::get('view~media:themeImage', array('key' => 'headerBackgroundImage'));
            $css .= '
        #header {
          background-image : url("'.$logoUrl.'");
          background-repeat: no-repeat;
          background-position:  left center;
        }
        #title {
          background: none;
        }
        ';
        }

        if (!empty($this->headerTitleColor)) {
            $css .= '
        #title h1{
          color: '.$this->headerTitleColor.';
        }
        #logo h1{
          color: '.$this->headerTitleColor.';
        }
        ';
        }
        if (!empty($this->headerSubtitleColor)) {
            $css .= '
        #title h2{
          color: '.$this->headerSubtitleColor.';
        }
        ';
        }

        // MAP css
        if (!empty($this->menuBackgroundColor)) {
            $css .= '
        #mapmenu{
          background: '.$this->menuBackgroundColor.';
        }
        ';
        }
        if (!empty($this->dockBackgroundColor)) {
            $css .= '
        #dock, #mini-dock, #bottom-dock, #right-dock, #sub-dock,
        .lizmapPopup.olPopup, #map-content .lizmapPopup{
          background-color: '.$this->dockBackgroundColor.' !important;
        }
        ';
        }

        if (!empty($this->navbarColor)) {
            $css .= '
        #navbar button.btn{
          background-color: '.$this->navbarColor.';
        }

        #navbar div.slider{
          background: '.$this->navbarColor.';
        }
        ';
        }

        if (!empty($this->additionalCss)) {
            $css .= html_entity_decode($this->additionalCss);
        }

        return $css;
    }

    /**
     * Write the theme css file
     * based one the properties saved.
     */
    private function writeThemeCssFile()
    {
        $cssPath = jApp::varPath('lizmap-theme-config/').'theme.css';
        $css = $this->buildCssThemeContent();

        return jFile::write($cssPath, $css);
    }
}
