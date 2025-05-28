<?php

/**
 * Interface for app context informations.
 *
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

use Lizmap\Project\Project;

/**
 * Interface that will be implemented to get Jelix infos so
 * we can either send Jelix's real infos either custom infos
 * to make our own tests.
 */
interface AppContextInterface
{
    /**
     * Configuration of the application.
     *
     * @return object configuration parameters into properties of an object
     */
    public function appConfig();

    /**
     * Returns the configuration file path.
     *
     * @param string $file The configuration file
     */
    public function appConfigPath($file = '');

    /**
     * Returns the app var path.
     *
     * @param string $file The var file
     */
    public function appVarPath($file = '');

    /**
     * Returns a jCoordinator object.
     */
    public function getCoord();

    /**
     * says if the current user has the given right.
     *
     * @param string $right    the key of the right to check
     * @param string $resource the id of a resource if any
     *
     * @return bool true if the right is ok
     */
    public function aclCheck($right, $resource = null);

    /**
     * Retrieve the list of groups id, the current user is member of,
     * in the acl system.
     *
     * @return array list of group id
     */
    public function aclUserGroupsId();

    /**
     * Retrieve the list of group the given user is member of
     * in the acl system.
     *
     * @param string $login The user's login
     *
     * @return array list of group id
     */
    public function aclGroupsIdByUser($login);

    /**
     * Retrieve the list of public group the given user is member of
     * in the acl system.
     *
     * @param string $login The user's login
     *
     * @return array list of public group id
     */
    public function aclUserPublicGroupsId($login = null);

    /**
     * Get the private group for the current user or for the given login
     * in the acl system.
     *
     * @param string $login The user's login
     *
     * @return string the id of the private group
     */
    public function aclUserPrivateGroup($login = null);

    /**
     * Retrieve the list of groups properties, the current user is member of,
     * in the acl system.
     *
     * @return array list of groups objects
     */
    public function aclUserGroupsInfo();

    /**
     * Indicate if the current user is authenticated.
     *
     * @return bool true if yes
     */
    public function UserIsConnected();

    /**
     * Informations of the current authenticated user.
     *
     * @return object the user properties
     */
    public function getUserSession();

    /**
     * get the cached value of the given key.
     *
     * @param string $key     the cache key
     * @param string $profile the name of the cache type
     *
     * @return mixed the value corresponding to the current cache, or null if
     *               there is no cache
     */
    public function getCache($key, $profile = '');

    /**
     * Returns the cache driver corresponding to the profile.
     *
     * @param string $profile The profile name
     */
    public function getCacheDriver($profile);

    /**
     * return the normalized value of a cache key, to be used with getCache.
     *
     * @param string $key
     *
     * @return string
     */
    public function normalizeCacheKey($key);

    /**
     * Set a data in the cache.
     *
     * @param string $key     The cache key
     * @param mixed  $value   The data to store in the cache
     * @param mixed  $ttl     data time expiration
     * @param string $profile the cache profile to use
     */
    public function setCache($key, $value, $ttl = null, $profile = '');

    /**
     * Deletes data from cache.
     *
     * @param string $key     The cache key
     * @param string $profile The cache profile
     */
    public function clearCache($key, $profile = '');

    /**
     * Flushes data from the cache.
     *
     * @param string $profile The cache profile
     */
    public function flushCache($profile = '');

    /**
     * Log a message.
     *
     * @param mixed  $message The message to log
     * @param string $cat     The category of the logged message
     */
    public function logMessage($message, $cat = 'default');

    /**
     * Log an Exception.
     *
     * @param \Exception $exception The exception to log
     * @param string     $cat       The category of the logged Exception
     */
    public function logException($exception, $cat = 'default');

    /**
     * Create a profile to be used with jDb or jCache.
     *
     * @param string $category The profile category to create
     * @param string $name     The profile name
     * @param array  $params   The parameters of the profile
     */
    public function createVirtualProfile($category, $name, $params);

    /**
     * Return the properties of a profile.
     *
     * instead of getting the default profile
     *
     * @param string $category  The profile category
     * @param string $name      the profile name
     * @param bool   $noDefault If true and if the profile doesn't exist, throw an error
     *
     * @return array properties
     */
    public function getProfile($category, $name = '', $noDefault = false);

    /**
     * Send an application event.
     *
     * @param string $eventName The name of the event
     * @param array  $params    the parameters of the event
     *
     * @return object
     */
    public function eventNotify($eventName, $params = array());

    /**
     * Retrieve a connection object to query a database.
     *
     * @param string $profile The profile to use, if empty, use the default one
     *
     * @return object
     */
    public function getDbConnection($profile = '');

    /**
     * Get a string in a specific language.
     *
     * @param string $key       The key corresponding to the string
     *                          you want to get
     * @param array  $variables values to replace in the localized string
     *
     * @return string the translated string
     */
    public function getLocale($key, $variables = array());

    /**
     * Return a dao factory. Specific to Jelix.
     *
     * @param string $daoKey  the identifier of the dao factory you want to use
     * @param string $profile the profile name for the db connection
     *
     * @return \jDaoFactoryBase
     */
    public function getJelixDao($daoKey, $profile = '');

    /**
     * Creates a new Record in the Dao.
     *
     * @param string $dao     The Jelix dao selector
     * @param string $profile The profile to use
     */
    public function createDaoRecord($dao, $profile = '');

    /**
     * Gets the form object corresponding to the given selector.
     *
     * specific to Jelix
     *
     * @param string $formSel the selector of the xml jform file
     * @param string $formId  the id of the new instance (an id of a record for example)
     *
     * @return \jFormsBase
     */
    public function createJelixForm($formSel, $formId = null);

    /**
     * Returns the URL corresponding to the Jelix Selector.
     *
     * @param string $selector The Jelix selector
     * @param mixed  $params   action params
     */
    public function getUrl($selector, $params = array());

    /**
     * Returns the absolute Url.
     *
     * @param string $selector The Jelix selector of the Url
     * @param array  $params   an associative array with the parameters of the Url
     */
    public function getFullUrl($selector, $params = array());

    /**
     * Returns a the IniFileModifier corresponding to the ini file.
     *
     * @param string $ini The ini file
     */
    public function getIniModifier($ini);

    /**
     * Returns the path to the json form folder.
     *
     * @return string the path
     */
    public function getFormPath();

    /**
     * Returns a class instance.
     *
     * @param string $selector The jelix class selector
     */
    public function getClassService($selector);

    /**
     * Returns a new jTpl Object.
     */
    public function getTpl();

    /**
     * Calls the lizmapTiler::getTileCapabilities method.
     *
     * @param Project $project
     */
    public function getTileCaps($project);
}
