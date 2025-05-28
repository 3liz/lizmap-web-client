<?php

/**
 * Manage and give access to lizmap log item.
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

class Item
{
    // log item properties
    private static $properties = array(
        'label',
        'logCounter',
        'logDetail',
        'logIp',
        'logEmail',
    );

    // Log key
    private $key = '';

    private $data = array();

    // log record keys
    private static $recordKeys = array(
        'key',
        'user',
        'content',
        'repository',
        'project',
        'ip',
        'email',
    );

    protected $appContext;

    /**
     * Construct the object, you should use the Log\Config::getLogItem() method
     * which will call this constructor.
     *
     * @param string $key        the name of the item
     * @param array  $iniSection the array containing the fields of lizmapLogConfig.ini.php
     */
    public function __construct($key, $iniSection, App\AppContextInterface $appContext)
    {
        $this->appContext = $appContext;

        // Set each property
        foreach (self::$properties as $property) {
            if (isset($iniSection[$property])) {
                $this->data[$property] = $iniSection[$property];
            }
        }

        $this->key = $key;
    }

    /**
     * Return log item key.
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * @return string[] list of properties name
     */
    public static function getSProperties()
    {
        return self::$properties;
    }

    /**
     * @return string[] list of record keys
     */
    public function getRecordKeys()
    {
        return self::$recordKeys;
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
        if (!array_key_exists($key, $this->data)) {
            return null;
        }

        return $this->data[$key];
    }

    public function setProperty($prop, $value)
    {
        if (!in_array($prop, self::$properties)) {
            return;
        }
        $this->data[$prop] = $value;
    }

    /**
     * Insert a new line of log for this item.
     *
     * @param array $data    list of details to save, the keys should be one of the RecordKeys (The key field is mandatory)
     * @param mixed $profile
     */
    public function insertLogDetail($data, $profile = 'lizlog')
    {
        $dao = $this->appContext->getJelixDao('lizmap~logDetail', $profile);
        $rec = $this->appContext->createDaoRecord('lizmap~logDetail', $profile);

        if (!$data) {
            return;
        }

        // Set the value for each column
        foreach (self::$recordKeys as $k) {
            if (array_key_exists($k, $data)) {
                $rec->{$k} = $data[$k];
            }
        }

        try {
            $dao->insert($rec);
        } catch (\Exception $e) {
            $this->appContext->logMessage('Error while inserting a new line in log_detail :'.$e->getMessage(), 'error');
        }
    }

    /**
     * Increase counter for this log item.
     *
     * @param string $repository
     * @param string $project
     * @param string $profile
     */
    public function increaseLogCounter($repository = '', $project = '', $profile = 'lizlog')
    {
        $dao = $this->appContext->getJelixDao('lizmap~logCounter', $profile);

        try {
            if ($rec = $dao->getDistinctCounter($this->key, $repository, $project)) {
                ++$rec->counter;

                $dao->update($rec);
            } else {
                $rec = $this->appContext->createDaoRecord('lizmap~logCounter', $profile);
                $rec->key = $this->key;
                if ($repository) {
                    $rec->repository = $repository;
                }
                if ($project) {
                    $rec->project = $project;
                }
                $rec->counter = 1;

                $dao->insert($rec);
            }
        } catch (\Exception $e) {
            $this->appContext->logMessage('Error while increasing log counter:'.$e->getMessage(), 'error');
        }
    }
}
