<?php
/**
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @contributor Yannick Le Guédart, Julien Issler
* @copyright   2011-2012 Laurent Jouanneau, 2007 Yannick Le Guédart, 2011 Julien Issler
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* class to read profiles from the profiles.ini.php
* @package     jelix
* @subpackage  utils
*/
class jProfiles {

    /**
     * loaded profiles
     * @var array
     */
    protected static $_profiles = null;

    /**
     * pool of objects loaded for profiles
     * @var array   array of object
     */
    protected static $_objectPool = array();


    protected static function loadProfiles() {
        $file = jApp::configPath('profiles.ini.php');
        self::$_profiles = parse_ini_file($file, true);
    }

    /**
     * load properties of a profile.
     *
     * A profile is a section in the profiles.ini.php file. Profiles are belong
     * to a category. Each section names is composed by "category:profilename".
     *
     * The given name can be a profile name or an alias of a profile. An alias
     * is a parameter name in the category section of the ini file, and the value
     * of this parameter should be a profile name.
     *
     * @param string $category the profile category
     * @param string $name profile name or alias of a profile name. if empty, use the default profile
     * @param boolean $noDefault if true and if the profile doesn't exist, throw an error instead of getting the default profile
     * @return array properties
     * @throws jException
     */
    public static function get ($category, $name='', $noDefault = false) {
        if (self::$_profiles === null) {
            self::loadProfiles();
        }

        if ($name == '') {
            $name = 'default';
        }
        $section = $category.':'.$name;
        $targetName = $section;

        if (isset(self::$_profiles[$category.':__common__'])) {
            $common = self::$_profiles[$category.':__common__'];
        }
        else
            $common = null;

        // the name attribute created in this method will be the name of the connection
        // in the connections pool. So profiles of aliases and real profiles should have
        // the same name attribute.

        if (isset(self::$_profiles[$section])) {
            self::$_profiles[$section]['_name'] = $name;
            if ($common) {
                return array_merge($common, self::$_profiles[$section]);
            }
            return self::$_profiles[$section];
        }
        else if (isset(self::$_profiles[$category][$name])) {
            // it is an alias
            $name = self::$_profiles[$category][$name];
            $targetName = $category.':'.$name;
        }
        // if the profile doesn't exist, we take the default one
        elseif (!$noDefault) {
            if (isset(self::$_profiles[$category.':default'])) {
                self::$_profiles[$category.':default']['_name'] = 'default';
                if ($common) {
                    return array_merge($common, self::$_profiles[$category.':default']);
                }
                return self::$_profiles[$category.':default'];
            }
            elseif (isset(self::$_profiles[$category]['default'])) {
                $name = self::$_profiles[$category]['default'];
                $targetName = $category.':'.$name;
            }
        }
        else {
            if ($name == 'default')
                throw new jException('jelix~errors.profile.default.unknown', $category);
            else
                throw new jException('jelix~errors.profile.unknown',array($name, $category));
        }

        if (isset(self::$_profiles[$targetName]) && is_array(self::$_profiles[$targetName])) {
            self::$_profiles[$targetName]['_name'] = $name;
            if ($common)
                return array_merge($common, self::$_profiles[$targetName]);
            return self::$_profiles[$targetName];
        }
        else {
            throw new jException('jelix~errors.profile.unknown', array($name, $category));
        }
    }

    /**
     * add an object in the objects pool, corresponding to a profile
     * @param string $category the profile category
     * @param string $name the name of the profile  (value of _name in the retrieved profile)
     * @param object $obj the object to store
     */
    public static function storeInPool($category, $name, $object) {
        self::$_objectPool[$category][$name] = $object;
    }

    /**
     * get an object from the objects pool, corresponding to a profile
     * @param string $category the profile category
     * @param string $name the name of the profile (value of _name in the retrieved profile)
     * @return object|null the stored object
     */
    public static function getFromPool($category, $name) {
        if (isset(self::$_objectPool[$category][$name]))
            return self::$_objectPool[$category][$name];
        return null;
    }

    /**
     * add an object in the objects pool, corresponding to a profile
     * or store the object retrieved from the function, which accepts a profile
     * as parameter (array)
     * @param string $category the profile category
     * @param string $name the name of the profile (will be given to jProfiles::get)
     * @param string|array  $function the function name called to retrieved the object. It uses call_user_func.
     * @param boolean  $noDefault  if true and if the profile doesn't exist, throw an error instead of getting the default profile
     * @return object|null the stored object
     */
    public static function getOrStoreInPool($category, $name, $function, $nodefault=false) {
        $profile = self::get($category, $name, $nodefault);
        if (isset(self::$_objectPool[$category][$profile['_name']]))
            return self::$_objectPool[$category][$profile['_name']];
        $obj = call_user_func($function, $profile);
        if ($obj)
            self::$_objectPool[$category][$profile['_name']] = $obj;
        return $obj;
    }


    /**
     * create a temporary new profile
     * @param string $category the profile category
     * @param string $name the name of the profile
     * @param array|string $params parameters of the profile. key=parameter name, value=parameter value.
     *                      we can also indicate a name of an other profile, to create an alias
     * @throws jException
     */
    public static function createVirtualProfile ($category, $name, $params) {
        if ($name == '') {
           throw new jException('jelix~errors.profile.virtual.no.name', $category);
        }

        if (self::$_profiles === null) {
            self::loadProfiles();
        }
        if (is_string($params)) {
            self::$_profiles[$category][$name] = $params;
        }
        else {
            $params['_name'] = $name;
            self::$_profiles[$category.':'.$name] = $params;
        }
        unset (self::$_objectPool[$category][$name]); // close existing connection with the same pool name
        if (gc_enabled())
            gc_collect_cycles();
    }

    /**
     * clear the loaded profiles to force to reload the profiles file.
     * WARNING: it destroy all objects stored in the pool!
     */
    public static function clear() {
        self::$_profiles = null;
        self::$_objectPool = array();
        if (gc_enabled())
            gc_collect_cycles();
    }
}