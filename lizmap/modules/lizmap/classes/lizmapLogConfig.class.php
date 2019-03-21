<?php
/**
 * Manage and give access to lizmap log configuration.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapLogConfig
{
    // Lizmap log configuration file path (relative to the path folder)
    private $config = 'config/lizmapLogConfig.ini.php';

    // Lizmap log configuration data
    private $data = array();

    // general properties
    private $properties = array(
        'active',
        'profile',
    );

    // If the log is active globally or not
    private $active = '';

    // database profile
    private $profile = '';

    public function __construct()
    {
        // read the lizmap log configuration file
        $readConfigPath = parse_ini_file(jApp::varPath().$this->config, true);
        $this->data = $readConfigPath;

        // set generic parameters
        foreach ($this->properties as $prop) {
            if (isset($readConfigPath['general'][$prop])) {
                $this->{$prop} = $readConfigPath['general'][$prop];
            }
        }
    }

    public function getProperties()
    {
        return $this->properties;
    }

    /**
     * Modify the general options.
     *
     * @param array $data array containing the global config data
     */
    public function modify($data)
    {
        $modified = false;
        foreach ($data as $k => $v) {
            if (in_array($k, $this->properties)) {
                $this->data['general'][$k] = $v;
                $this->{$k} = $v;
                $modified = true;
            }
        }

        return $modified;
    }

    /**
     * Update the global config data. (modify and save).
     *
     * @param array $data array containing the data of the general options
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
     * save the global configuration data.
     */
    public function save()
    {
        // Get access to the ini file
        $iniFile = jApp::configPath('lizmapLogConfig.ini.php');
        $ini = new jIniFileModifier($iniFile);

        foreach ($this->properties as $prop) {
            if ($this->{$prop} != '') {
                $ini->setValue($prop, $this->{$prop}, 'general');
            } else {
                $ini->removeValue($prop, 'general');
            }
        }

        // Save the ini file
        $ini->save();

        return $ini->isModified();
    }
}
