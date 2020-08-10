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

    public function __construct($readConfigPath)
    {
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
        if (!$data) {
            return false;
        }
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
    public function update($data, $ini)
    {
        $modified = $this->modify($data);
        if ($modified) {
            $modified = $this->save($ini);
        }

        return $modified;
    }

    /**
     * save the global configuration data.
     */
    public function save($ini)
    {
        foreach ($this->properties as $prop) {
            if ($this->{$prop} !== '' && $this->{$prop} !== null) {
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
