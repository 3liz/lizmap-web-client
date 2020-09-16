<?php

use Lizmap\App\AppContextInterface;

class testContext implements AppContextInterface
{
    protected $result = array();

    public function appConfig()
    {
    }

    public function appConfigPath($file = '')
    {
        if (array_key_exists('configPath', $this->result)) {
            return $this->result['configPath'];
        }
        return null;
    }

    public function aclCheck($role, $resource = null)
    {
        if (array_key_exists($role, $this->result)) {
            return $this->result[$role];
        }
        return true;
    }

    public function aclUserGroupsId()
    {
        if (array_key_exists('groups', $this->result)) {
            return $this->result['groups'];
        }
        return null;
    }

    public function aclUserGroupsInfo()
    {
    }

    public function UserIsConnected()
    {
        if (array_key_exists('userIsConnected', $this->result)) {
            return $this->result['userIsConnected'];
        }
        return false;
    }

    public function getUserSession()
    {
        if (array_key_exists('userSession', $this->result)) {
            return $this->result['userSession'];
        }
        return null;
    }

    public function getCache($key, $profile = '')
    {
    }

    public function normalizeCacheKey($key)
    {
    }

    public function setCache($key, $value, $ttl = null, $profile = '')
    {
    }

    public function clearCache($key, $profile = '')
    {
    }

    public function logMessage($message, $cat = 'default')
    {
    }

    public function logException($exception, $cat = 'default')
    {
    }

    public function createVirtualProfile($category, $name, $params)
    {
    }

    public function getProfile($category, $name = '', $noDefault = false)
    {
    }

    public function eventNotify($eventName, $params = array())
    {
    }

    public function getDbConnection($profile = '')
    {
    }

    public function getLocale($key)
    {
    }

    public function getJelixDao($daoKey, $profile = '')
    {
        if (array_key_exists('getDao', $this->result)) {
            return $this->result['getDao'];
        }
    }

    public function createDaoRecord($dao, $profile = '')
    {
        if (array_key_exists('createDaoRecord', $this->result)) {
            return $this->result['createDaoRecord'];
        }
    }

    public function createJelixForm($formSel, $formId = null)
    {
    }

    public function getUrl($selector)
    {
    }
    
    public function getFullUrl($selector, $params = array())
    {
    }

    public function setResult($result)
    {
        $this->result = $result;
    }

    public function getResult()
    {
        return $this->result;
    }

    public function getIniModifier($ini)
    {
        if (array_key_exists('ini', $this->result)) {
            return $this->result['ini'];
        }
        return null;
    }

    public function insert($record)
    {
    }
}
