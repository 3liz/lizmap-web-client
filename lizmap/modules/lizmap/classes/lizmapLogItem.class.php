<?php

/**
 * Manage and give access to lizmap log item.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

use Jelix\IniFile\IniModifier;
use Lizmap\App;
use Lizmap\Logger as Log;

/**
 * @deprecated
 */
class lizmapLogItem
{
    /**
     * @var Log\Item
     */
    protected $item;

    /**
     * Construct the object, you should use the lizmapLogConfig::getLogItem() method
     * which will call this constructor.
     *
     * @param string $key            the name of the item
     * @param array  $readConfigPath the array containing the fields of lizmapLogConfig.ini.php
     */
    public function __construct($key, $readConfigPath, App\AppContextInterface $appContext)
    {
        $this->item = new Log\Item($key, $readConfigPath, $appContext);
    }

    /**
     * Return log item key.
     */
    public function getKey()
    {
        return $this->item->getKey();
    }

    /**
     * @return string[] list of properties name
     */
    public function getProperties()
    {
        return Log\Item::getSProperties();
    }

    /**
     * @return string[] list of properties name
     */
    public static function getSProperties()
    {
        return Log\Item::getSProperties();
    }

    /**
     * @return string[] list of record keys
     */
    public function getRecordKeys()
    {
        return $this->item->getRecordKeys();
    }

    /**
     * Return data for a log item.
     *
     * @param string $key Key of the log item
     *
     * @return mixed
     */
    public function getData($key)
    {
        return $this->item->getData($key);
    }

    /**
     * Update the data for the log item in the ini file.
     *
     * @param mixed $data
     *
     * @return bool true if there were some modifications
     */
    public function update($data)
    {
        // Get access to the ini file
        $iniFile = jApp::varConfigPath('lizmapLogConfig.ini.php');
        $ini = new IniModifier($iniFile);

        // Set section
        $section = 'item:'.$this->item->getKey();

        // Modify the ini data for the repository
        foreach ($data as $k => $v) {
            if (in_array($k, Log\Item::getSProperties())) {
                // Set values in ini file
                $ini->setValue($k, $v, $section);
                // Modify lizmapConfigData
                $this->item->setProperty($k, $v);
            }
        }
        $modified = $ini->isModified();
        // Save the ini file
        if ($modified) {
            $ini->save();
        }

        return $modified;
    }

    /**
     * Insert a new line of log for this item.
     *
     * @param array $data    list of details to save
     * @param mixed $profile
     */
    public function insertLogDetail($data, $profile = 'lizlog')
    {
        $this->item->insertLogDetail($data, $profile);
    }

    /**
     * Increase counter for this log item.
     *
     * @param mixed $repository
     * @param mixed $project
     * @param mixed $profile
     */
    public function increaseLogCounter($repository = '', $project = '', $profile = 'lizlog')
    {
        $this->item->increaseLogCounter($repository, $project, $profile);
    }
}
