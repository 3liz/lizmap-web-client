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

use Lizmap\Logger as Log;

/**
 * @deprecated
 */
class lizmapLogConfig
{
    /**
     * @var Log\Config;
     */
    protected $config;

    public function __construct($readConfigPath, $appContext, $iniFile)
    {
        $this->config = new Log\Config($readConfigPath, $appContext, $iniFile);
    }

    public function getProperties()
    {
        return $this->config->getProperties();
    }

    /**
     * Get a log item.
     *
     * @param string $key Key of the log item to get
     *
     * @return lizmapLogItem|Log\Item
     */
    public function getLogItem($key)
    {
        return $this->config->getLogItem($key);
    }

    /**
     * Get a list of log items names.
     *
     * @return string[] list of names
     */
    public function getLogItemList()
    {
        return $this->config->getLogItemList();
    }

    /**
     * Modify the general options.
     *
     * @param array $data array containing the global config data
     */
    public function modify($data)
    {
        return $this->config->modify($data);
    }

    /**
     * Update the global config data. (modify and save).
     *
     * @param array      $data array containing the data of the general options
     * @param null|mixed $ini
     */
    public function update($data, $ini = null)
    {
        return $this->config->update($data, $ini);
    }

    /**
     * save the global configuration data.
     *
     * @param null|mixed $ini
     */
    public function save($ini = null)
    {
        return $this->config->save($ini);
    }
}
