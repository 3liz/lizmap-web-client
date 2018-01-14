<?php
/**
 * @package     jelix
 * @subpackage  kvdb
 * @author      Yannick Le Guédart
 * @contributor  Laurent Jouanneau
 * @copyright   2009 Yannick Le Guédart, 2010-2011 Laurent Jouanneau
 *
 * @link     http://www.jelix.org
 * @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * main class to access to key-value storage databases
 */
class jKVDb {

    protected function __construct() { } // the class is only static

    /**
    * get the jKVDriver object associated to a given profile name
    *
    * @param string $name
    * @return jKVDriver
    */
    public static function getConnection($name = null) {
        return jProfiles::getOrStoreInPool('jkvdb', $name, array('jKVDb', '_createConnector'));
    }

    /**
     * callback method for jProfiles. internal use
     * @return jKVDriver
     */
    public static function _createConnector($profile) {
        // If no driver is specified, let's throw an exception
        if (! isset($profile['driver'])) {
            throw new jException(
                'jelix~kvstore.error.driver.notset', $profile['_name']);
        }

        $connector = jApp::loadPlugin($profile['driver'], 'kvdb', '.kvdriver.php', $profile['driver'] . 'KVDriver', $profile);
        //if (is_null($connector)) {
        //    throw new jException('jelix~errors.kvdb.driver.notfound',$profile['driver']);
        //}

        return $connector;
    }
}