<?php

/**
 * Manage and give access to lizmap log configuration.
 *
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Logger;

use Lizmap\App;

class Config
{
    /**
     * Lizmap log configuration data.
     *
     * @var array
     */
    private $data = array();

    /**
     * general properties.
     *
     * @var array
     */
    private $properties = array(
        'active',
        'profile',
    );

    /**
     * @var Item[] list of log items of the ini file
     */
    protected $logItems = array();

    /**
     * @var string If the log is active globally or not
     */
    private $active = '';

    /**
     * @var string database profile
     */
    private $profile = '';

    /**
     * @var string The location of the ini file
     */
    protected $file;

    /**
     * @var App\AppContextInterface
     */
    protected $appContext;

    /**
     * Constructs the object. This method shouldn't be called, you should call lizmap::getLogConfig() instead.
     *
     * @param array                   $configData  An array containing the ini file
     * @param App\AppContextInterface $appContext  The context
     * @param string                  $iniFilePath the path to the ini file folder
     */
    public function __construct($configData, App\AppContextInterface $appContext, $iniFilePath)
    {
        $this->data = $configData;
        $this->appContext = $appContext;
        $this->file = $iniFilePath;

        // set generic parameters
        foreach ($this->properties as $prop) {
            if (isset($configData['general'][$prop])) {
                $this->{$prop} = $configData['general'][$prop];
            }
        }
    }

    /**
     * @return string[]
     *
     * @deprecated
     */
    public function getProperties()
    {
        return $this->properties;
    }

    /**
     * Get a log item.
     *
     * @param string $key Key of the log item to get
     *
     * @return Item
     */
    public function getLogItem($key)
    {
        if (!array_key_exists($key, $this->logItems)) {
            if (!array_key_exists('item:'.$key, $this->data)) {
                return null;
            }
            $this->logItems[$key] = new Item($key, $this->data['item:'.$key], $this->appContext);
        }

        return $this->logItems[$key];
    }

    /**
     * Get a list of log items names.
     *
     * @return string[] list of names
     */
    public function getLogItemList()
    {
        $logItemList = array();

        foreach ($this->data as $section => $data) {
            if (preg_match('/^item:(.*)/', $section, $matches)) {
                $logItemList[] = $matches[1];
            }
        }

        return $logItemList;
    }

    /**
     * Save the properties of a log Item in the ini file.
     *
     * @param mixed $key
     */
    public function updateItem($key)
    {
        $item = $this->getLogItem($key);
        foreach (Item::getSProperties() as $prop) {
            $this->data['item:'.$key][$prop] = $item->getData($prop);
        }
    }

    /**
     * Modify the general options.
     *
     * @param array $data associative array containing the global config data
     */
    public function modify($data)
    {
        $modified = false;
        if (!$data) {
            return $modified;
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
     * @param null|mixed $ini
     * @param mixed      $profile
     * @param mixed      $active
     */
    public function update($profile, $active, $ini = null)
    {
        $data = array(
            'profile' => $profile,
            'active' => $active,
        );
        $modified = $this->modify($data);
        if ($modified) {
            $modified = $this->save($ini);
        }

        return $modified;
    }

    /**
     * save the global configuration data.
     *
     * @param null|mixed $ini
     */
    public function save($ini = null)
    {
        if (!$ini) {
            $ini = $this->appContext->getIniModifier($this->file);
        }

        foreach ($this->data as $section => $props) {
            if ($section !== 'general' && !strstr($section, 'item:')) {
                continue;
            }
            foreach ($props as $prop => $value) {
                if ($section === 'general' && in_array($prop, $this->properties) || in_array($prop, Item::getSProperties())) {
                    if ($this->{$prop} !== '' && $this->{$prop} !== null) {
                        $ini->setValue($prop, $value, $section);
                    } else {
                        $ini->removeValue($prop, $section);
                    }
                }
            }
        }

        // Save the ini file
        $ini->save();

        return $ini->isModified();
    }
}
