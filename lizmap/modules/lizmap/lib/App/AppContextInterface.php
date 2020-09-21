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
     * says if the current user has the given right.
     *
     * @param string $right    the key of the right to check
     * @param string $resource the id of a resource if any
     * @param mixed  $role
     *
     * @return bool true if the right is ok
     */
    public function aclCheck($role, $resource = null);

    /**
     * Retrieve the list of groups id, the current user is member of,
     * in the acl system.
     *
     * @return array list of group id
     */
    public function aclUserGroupsId();

    /**
     * Retrieve the list of groups properties, the current user is member of,
     * in the acl system.
     *
     * @param string $login login of the user. if not given, the current user
     *                      is taken account
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
     * return the normalized value of a cache key, to be used with getCache.
     *
     * @param string $key
     *
     * @return string
     */
    public function normalizeCacheKey($key);

    /**
     * Create a profile to be used with getDbConnection.
     *
     * @param string $category The profile category to create
     * @param string $name     The profile name
     * @param array  $params   The parameters of the profile
     */
    public function createVirtualProfile($category, $name, $params);

    /**
     * Return the properties of a profile.
     *
     * @param string The profile category
     * @param string the profile name
     * @param bool If true and if the profile doesn't exist, throw an error
     * instead of getting the default profile
     * @param mixed $category
     * @param mixed $name
     * @param mixed $noDefault
     *
     * @return array properties
     */
    public function getProfile($category, $name = '', $noDefault = false);

    /**
     * Send an application event.
     *
     * @param string The name of the event
     * @param array the parameters of the event
     * @param mixed $eventName
     * @param mixed $params
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
     * @param string $key The key corresponding to the string
     *                    you want to get
     *
     * @return string the translated string
     */
    public function getLocale($key);

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
}
