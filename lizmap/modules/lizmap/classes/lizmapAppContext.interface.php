<?php

/**
 * Interface that will be implemented to get Jelix infos so
 * we can either send Jelix's real infos either custom infos
 * to make our own tests.
 */
interface lizmapAppContext
{
    public function appConfig($params);

    public function aclCheckResult($params);

    public function aclDbUserGroups($list = false);

    public function UserIsConnected();

    public function getUserSession();

    public function getCache($key, $profile = '');

    public function normalizeCacheKey($key);
    
    public function createVirtualProfile($category, $name, $params);

    public function getProfile($category, $name = '', $noDefault = false);

    public function eventNotify($eventName, $params = array());

    public function getDbConnection($name = '');

    public function useDbConnection($method, $params);

    public function getLocale($key);

    public function tplAssign($tpl, $name, $value = null);

    public function tplFetch($tpl, $name, $outputType = '');

    public function getDao($params);

    public function createForm($formSelector);
}
