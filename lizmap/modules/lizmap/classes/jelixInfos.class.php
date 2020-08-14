<?php

class jelixInfos implements lizmapAppContext
{
    /**
     * call and return jApp::config.
     */
    public function appConfig()
    {
        return jApp::config();
    }

    /**
     * Call and return the result of jAcl2::check().
     *
     * @param array $params An array containing the params to be passed to jAcl2::check()
     *
     * @return bool The result of jAcl2::check()
     */
    public function aclCheckResult($params)
    {
        return jAcl2::check(...$params);
    }

    /**
     * Return the jAcl2DbUserGroup::getGroups/getGroupList() result.
     *
     * @param bool $list True if you want to get the jAcl2DbUserGroup::getGroupList() result
     */
    public function aclDbUserGroups($list = false)
    {
        if ($list) {
            return jAcl2DbUserGroup::getGroupList();
        }

        return jAcl2dbUserGroup::getGroups();
    }

    /**
     * Return the result of jAuth::isConnected().
     *
     * @return bool
     */
    public function UserIsConnected()
    {
        return jAuth::IsConnected();
    }

    /**
     * Return the result of jAuth::getUserSession().
     */
    public function getUserSession()
    {
        return jAuth::getUserSession();
    }

    /**
     * Return the result of a jCache method.
     *
     * @param string $method The method to call
     * @param array  $params An array containing the parameters
     *                       to pass to $method
     */
    public function getCache($key, $profile = '')
    {
        return jCache::get($key, $profile);
    }

    public function normalizeCacheKey($key)
    {
        return jCache::normalizeKey($key);
    }
    /**
     * Return the result of jProfile::createVirtualProfile.
     *
     * @param string $category The profile category to create
     * @param string $name     The profile name
     * @param array  $params   The parameters of the profile
     */
    public function createVirtualProfile($category, $name, $params)
    {
        return jProfiles::createVirtualProfile($category, $name, $params);
    }

    /**
     * Return the properties of a profile by calling jProfile::get().
     *
     * @param string The profile category
     * @param string the profile name
     * @param bool If true and if the profile doesn't exist, throw an error
     * instead of getting the default profile
     * @param mixed $category
     * @param mixed $name
     * @param mixed $noDefault
     */
    public function getProfile($category, $name = '', $noDefault = false)
    {
        return jProfile::get($category, $name, $noDefault);
    }

    /**
     * Call jEvent::notify().
     *
     * @param string The name of the event
     * @param array the parameters of the event
     * @param mixed $name
     * @param mixed $params
     */
    public function eventNotify($name, $params = array())
    {
        return jEvent::notify($name, $params);
    }

    /**
     * Return the connection to a Db by calling jDb::getConnection().
     *
     * @param string $name The profile name to use, if empty, use the default one
     */
    public function getDbConnection($name = '')
    {
        return jDb::getConnection($name);
    }

    /**
     * Return the result of a jDbConnection method.
     *
     * @param jDbConnection $cnx    The Db Connection on which to call the method
     * @param string        $method The method to call
     * @param array         $params An array containing the parameters
     *                              to pass to $method
     */
    public function useDbConnection($cnx, $method, $params)
    {
        if (!$params || !isset($params[0])) {
            return $cnx->{$method}();
        }

        return $cnx->{$method}(...$params);
    }

    /**
     * Get a string in a specific language.
     *
     * @param string $key The Jelix selector corresponding to the string
     *                    you want to get
     */
    public function getLocale($key)
    {
        return jLocale::get($key);
    }

    /**
     * Return the result of a jDao method.
     *
     * @param string $jSelector
     */
    public function getDao($jSelector)
    {
        return jDao::get($jSelector);
    }

    /**
     * Call and return the result of jForms::create().
     *
     * @param string $formSelector the Jelix Selector of the form file
     */
    public function createForm($formSelector)
    {
        return jForms::create($formSelector);
    }
}
