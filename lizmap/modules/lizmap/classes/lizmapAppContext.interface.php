<?php

/**
 * Interface that will be implemented to get Jelix infos so
 * we can either send Jelix's real infos either custom infos
 * to make our own tests.
 */
interface lizmapAppContext
{
    public function jAppInfos($info, $params);

    public function jAcl2CheckResult($params);

    public function jAcl2DbUserGroups($list = false);

    public function jAuthIsConnected();

    public function jAuthGetUserSession();

    public function jCacheHandler($method, $params);

    public function createVirtualProfile($category, $name, $params);

    public function getProfile($category, $name = '', $noDefault = false);

    public function eventNotify($eventName, $params = array());

    public function getDbConnection($name = '');

    public function useDbConnection($cnx, $method, $params);

    public function getLocale($key);

    public function tplAssign($tpl, $name, $value = null);

    public function tplFetch($tpl, $name, $outputType = '');

    public function jDaoHandler($method, $params);

    public function createJForm($formSelector);
}
