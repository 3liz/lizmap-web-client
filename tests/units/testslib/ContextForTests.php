<?php

use Lizmap\App\AppContextInterface;

class ContextForTests implements AppContextInterface
{
    protected $result = array();

    protected $cache = array();

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

    public function appVarPath($file = '')
    {
    }

    public function getCoord()
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

        return array();
    }

    public function aclGroupsIdByUser($login)
    {
    }

    public function aclUserPublicGroupsId($login = null)
    {
        $userGroups = $this->aclUserGroupsId();
        $privateIndex = null;
        foreach ($userGroups as $idx => $uGroup) {
            if (substr($uGroup, 0, 7) == '__priv_') {
                $privateIndex = $idx;

                break;
            }
        }
        if ($privateIndex !== null) {
            return array_splice($userGroups, $privateIndex, 1);
        }

        return $userGroups;
    }

    public function aclUserPrivateGroup($login = null)
    {
        $userGroups = $this->aclUserGroupsId();
        foreach($userGroups as $uGroup) {
            if (substr($uGroup, 0, 7) == '__priv_') {
                return $uGroup;
            }
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
        if ($profile == '') {
            $profile = 'default';
        }

        if (isset($this->cache[$profile][$key])) {
            return $this->cache[$profile][$key];
        }
        return null;
    }

    public function getAllCacheForTests()
    {
        return $this->cache;
    }

    public function getCacheDriver($profile)
    {
        if (array_key_exists('cacheDriver', $this->result)) {
            return $this->result['cacheDriver'];
        }

        return \jCache::getDriver($profile);
    }

    public function normalizeCacheKey($key)
    {
        return $key;
    }

    public function setCache($key, $value, $ttl = null, $profile = '')
    {
        if ($profile == '') {
            $profile = 'default';
        }
        $this->cache[$profile][$key] = $value;
    }

    public function clearCache($key, $profile = '')
    {
        if ($profile == '') {
            $profile = 'default';
        }
        unset($this->cache[$profile]);
    }

    public function flushCache($profile = '')
    {
        if ($profile == '') {
            $profile = 'default';
        }
        unset($this->cache[$profile]);
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
        return new \jEvent('event');
    }

    public function getDbConnection($profile = '')
    {
        return new jDbConnectionForTests();
    }

    public function getLocale($key, $variables = array())
    {
    }

    public function getJelixDao($daoKey, $profile = '')
    {
        if (array_key_exists('getDao', $this->result)) {
            return $this->result['getDao'];
        }

        return null;
    }

    public function createDaoRecord($dao, $profile = '')
    {
        if (array_key_exists('createDaoRecord', $this->result)) {
            return $this->result['createDaoRecord'];
        }

        return null;
    }

    public function createJelixForm($formSel, $formId = null)
    {
    }

    public function getUrl($selector, $params = array())
    {
        // simple url build
        $keyWithVal4QueryString = array();
        array_walk($params, function($v ,$key) use (&$keyWithVal4QueryString): void {$keyWithVal4QueryString[]=$key.'='.$v;});
        return $selector.'?'.implode("&", $keyWithVal4QueryString);
    }

    public function getFullUrl($selector, $params = array())
    {
        if (array_key_exists('fullUrl', $this->result)) {
            return $this->result['fullUrl'];
        }

        return '';
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

    public function getFormPath()
    {
        return $this->result['path'];
    }

    public function getClassService($selector)
    {
    }

    public function getTpl()
    {
        return new jTplForTests();
    }

    public function getTileCaps($project)
    {
        return LizmapTilerForTests::getTileCapabilities($project);
    }
}
