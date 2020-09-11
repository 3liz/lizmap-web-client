<?php

use Lizmap\App\AppContextInterface;

class testContext implements AppContextInterface
{
    protected $result = array();

    public function appConfig()
    {
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
    }

    public function getUserSession()
    {
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
}
