<?php
/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

use Lizmap\Logger as Log;

/**
 * @deprecated
 */
class UnknownLizmapProjectException extends Exception
{
}

class lizmap
{
    // Lizmap configuration file path (relative to the path folder)
    protected static $lizmapConfig = 'config/lizmapConfig.ini.php';
    protected static $lizmapLogConfig = 'config/lizmapLogConfig.ini.php';

    /**
     * @var string[] List of repositories names
     */
    protected static $repositories = array();

    /**
     * @var lizmapRepository[] list of repository instances. keys are repository names
     */
    protected static $repositoryInstances = array();

    /**
     * @var lizmapServices The lizmapServices instance for the singleton
     */
    protected static $lizmapServicesInstance = null;

    /**
     * @var lizmapLogConfig The lizmapLogConfig instance for the singleton
     */
    protected static $lizmapLogConfigInstance = null;

    /**
     * @var lizmapJelixContext The jelixContext instance for the singleton
     */
    protected static $appContext = null;

    /**
     * this is a static class, so private constructor.
     */
    private function __construct()
    {
    }

    /**
     * @return lizmapServices
     */
    public static function getServices()
    {
        if (!isset(self::$lizmapServicesInstance)) {
            $lizmapConfigTab = parse_ini_file(jApp::configPath('lizmapConfig.ini.php'), true);
            $globalConfig = jApp::config();
            $ldapEnabled = jApp::isModuleEnabled('ldapdao');
            $varPath = jApp::varPath();
            self::$lizmapServicesInstance = new lizmapServices($lizmapConfigTab, $globalConfig, $ldapEnabled, $varPath, self::getAppContext());
        }

        return self::$lizmapServicesInstance;
    }

    public static function getAppContext()
    {
        if (!self::$appContext) {
            self::$appContext = new \Lizmap\App\JelixContext();
        }

        return self::$appContext;
    }

    public static function saveServices()
    {
        $ini = new jIniFileModifier(jApp::configPath('lizmapConfig.ini.php'));
        $liveIni = new jIniFileModifier(jApp::configPath('liveconfig.ini.php'));

        $services = self::getServices();
        $services->saveIntoIni($ini, $liveIni);

        $modified = $ini->isModified() || $liveIni->isModified();
        $ini->save();
        $liveIni->save();

        return $modified;
    }

    /**
     * @return lizmapTheme
     */
    public static function getTheme()
    {
        return jClasses::getService('lizmap~lizmapTheme');
    }

    /**
     * Get a list of repository names.
     *
     * @return string[] List of repositories names
     */
    public static function getRepositoryList()
    {
        // read the lizmap configuration file
        $readConfigPath = parse_ini_file(jApp::varPath().self::$lizmapConfig, true);
        $repositoryList = array();
        foreach ($readConfigPath as $section => $data) {
            if (preg_match('#^(repository:)#', $section, $matches)) {
                $repositoryList[] = str_replace($matches[0], '', $section);
            }
        }
        self::$repositories = $repositoryList;

        return self::$repositories;
    }

    /**
     * Get the list of properties for a generic repository.
     * This method shouldn't be used, you should use lizmapRepository::getProperties() instead.
     *
     * @deprecated
     */
    public static function getRepositoryProperties()
    {
        trigger_error('This method is deprecated. Please use the lizmapRepository::getProperties() method.', E_DEPRECATED);

        return lizmapRepository::$properties;
    }

    /**
     * Get the list of properties options for a generic repository.
     * This method shouldn't be used, you should use lizmapRepository::getPropertiesOptions() instead.
     *
     * @deprecated
     */
    public static function getRepositoryPropertiesOptions()
    {
        trigger_error('This method is deprecated. Please use the lizmapRepository::getPropertiesOptions() method.', E_DEPRECATED);

        return lizmapRepository::$propertiesOptions;
    }

    /**
     * Get the jForm for a repository.
     *
     * @param lizmapRepository $rep
     * @param jFormsBase       $form
     *
     * @return jFormsBase
     */
    public static function constructRepositoryForm($rep, $form)
    {
        $services = lizmap::getServices();
        $rootRepositories = $services->getRootRepositories();

        $repositories = array();
        foreach (lizmap::getRepositoryList() as $repo) {
            if ($rep && $rep->getKey() == $repo) {
                continue;
            }
            $repositories[] = lizmap::getRepository($repo);
        }

        // reconstruct form fields based on repositoryPropertyList
        $propertiesOptions = lizmapRepository::getRepoProperties();

        foreach (lizmapRepository::getProperties() as $k) {
            $ctrl = null;
            if ($propertiesOptions[$k]['fieldType'] == 'checkbox') {
                $ctrl = new jFormsControlCheckbox($k);
            } elseif ($k == 'path' && $rootRepositories != '') {
                if ($rep == null
                    || substr($rep->getPath(), 0, strlen($rootRepositories)) === $rootRepositories
                ) {
                    $ctrl = new jFormsControlMenulist($k);
                    $dataSource = new jFormsStaticDatasource();
                    $data = array();
                    $data[''] = '';
                    if ($dh = opendir($rootRepositories)) {
                        while (($file = readdir($dh)) !== false) {
                            if ($file == '.' || $file == '..') {
                                continue;
                            }

                            $filePath = $rootRepositories.$file.'/';
                            if (is_dir($filePath)) {
                                $allreadyUsed = false;
                                foreach ($repositories as $repo) {
                                    if ($repo->getPath() == $filePath) {
                                        $allreadyUsed = true;

                                        break;
                                    }
                                }
                                if (!$allreadyUsed) {
                                    $data[$filePath] = $file;
                                }
                            }
                        }
                    }
                    $dataSource->data = $data;
                    $ctrl->datasource = $dataSource;
                } else {
                    $ctrl = new jFormsControlHidden($k);
                }
            } else {
                $ctrl = new jFormsControlInput($k);
                $ctrl->datatype = new jDatatypeString();
            }
            $ctrl->required = $propertiesOptions[$k]['required'];
            $ctrl->label = jLocale::get('admin~admin.form.admin_section.repository.'.$k.'.label');
            $ctrl->size = 100;
            $form->addControl($ctrl);
        }
        if ($rep) {
            foreach (lizmapRepository::getProperties() as $k) {
                $v = $rep->getData($k);
                if ($k == 'path' && $rootRepositories != ''
                    && substr($rep->getPath(), 0, strlen($rootRepositories)) === $rootRepositories
                ) {
                    $v = $rep->getPath();
                }
                $form->setData($k, $v);
            }
        }

        return $form;
    }

    /**
     * Get a repository.
     *
     * @param string $key Key of the repository to get
     *
     * @return lizmapRepository
     */
    public static function getRepository($key)
    {
        if (!in_array($key, self::$repositories)) {
            if (!in_array($key, self::getRepositoryList())) {
                return null;
            }
        }

        if (array_key_exists($key, self::$repositoryInstances)) {
            return self::$repositoryInstances[$key];
        }

        $services = self::getServices();
        $rep = $services->getLizmapRepository($key);
        self::$repositoryInstances[$key] = $rep;

        return $rep;
    }

    /**
     * Create a repository.
     *
     * @param string $key  the repository name
     * @param array  $data list of properties for the repository
     *
     * @return lizmapRepository
     */
    public static function createRepository($key, $data)
    {
        if (in_array($key, self::$repositories)
            || in_array($key, self::getRepositoryList())
        ) {
            return null;
        }

        $services = self::getServices();
        $rep = $services->getLizmapRepository($key);
        self::$repositoryInstances[$key] = $rep;
        self::updateRepository($key, $data);
        self::getRepositoryList();

        return $rep;
    }

    /**
     * Removes a repository.
     *
     * @param string $key the repository name
     *
     * @return bool true if the repository was known
     */
    public static function removeRepository($key)
    {
        if (!in_array($key, self::$repositories)) {
            if (!in_array($key, self::getRepositoryList())) {
                return false;
            }
        }

        // Get access to the ini file
        $iniFile = jApp::configPath('lizmapConfig.ini.php');
        $ini = new jIniFileModifier($iniFile);

        // Remove the section corresponding to the repository
        $section = 'repository:'.$key;
        if ($ini->isSection($section)) {
            $ini->removeValue(null, $section);
            $ini->save();
            self::getRepositoryList();
            if (array_key_exists($key, self::$repositoryInstances)) {
                unset(self::$repositoryInstances[$key]);
            }

            return true;
        }

        return false;
    }

    /**
     * Uptade a repository.
     *
     * @param string $key  the repository name
     * @param array  $data the repository data
     *
     * @return bool false if the repository corresponding to $key cannot be found
     *              or if there is no valid entry in $data
     */
    public static function updateRepository($key, $data)
    {
        if (!key_exists($key, self::$repositoryInstances)) {
            return false;
        }

        $iniFile = jApp::configPath('lizmapConfig.ini.php');
        $ini = new jIniFileModifier($iniFile);
        $rep = self::$repositoryInstances[$key];

        $modified = $rep->update($data, $ini);
        unset($ini);

        return $modified;
    }

    /**
     * Get a project.
     *
     * @param string $key the project name
     *
     * @return null|lizmapProject null if it does not exist
     * @FIXME all calls to getProject construct $key. Why not to
     * deliver directly $rep and $project? It could avoid
     * a preg_match
     */
    public static function getProject($key)
    {
        $match = preg_match('/(?P<rep>\w+)~(?P<proj>[\w-]+)/', $key, $matches);
        if ($match != 1) {
            return null;
        }

        $rep = self::getRepository($matches['rep']);
        if ($rep == null) {
            return null;
        }

        return $rep->getProject($matches['proj']);
    }

    /**
     * Get global configuration for logs.
     *
     * @return lizmapLogConfig
     */
    public static function getLogConfig()
    {
        if (!self::$lizmapLogConfigInstance) {
            $readConfigPath = parse_ini_file(jApp::varPath().self::$lizmapLogConfig, true);
            self::$lizmapLogConfigInstance = new Log\Config($readConfigPath, self::getAppContext(), jApp::configPath('lizmapLogConfig.ini.php'));
        }

        return self::$lizmapLogConfigInstance;
    }

    /**
     * Get the list of properties for a generic log item.
     *
     * @return string[] list of properties name
     */
    public static function getLogItemProperties()
    {
        return Log\Item::getSProperties();
    }

    /**
     * Get a log item.
     *
     * @param string $key Key of the log item to get
     *
     * @return lizmapLogItem
     *
     * @deprecated
     */
    public static function getLogItem($key)
    {
        return self::getLogConfig()->getLogItem($key);
    }

    /**
     * Get a list of log items names.
     *
     * @return string[] list of names
     *
     * @deprecated
     */
    public static function getLogItemList()
    {
        return self::getLogConfig()->getLogItemList();
    }

    /**
     * Returns time spent in milliseconds from beginning of request.
     *
     * @param string $label Name of the action to lo
     * @param mixed  $start
     */
    public static function logMetric($label, $start = 'index')
    {
        // Choose from when to calculate time: index, request or given $start
        if ($start == 'index') {
            $start = $_SERVER['LIZMAP_BEGIN_TIME'];
        } elseif ($start == 'request') {
            // For php < 5.4
            if (!isset($_SERVER['REQUEST_TIME_FLOAT'])) {
                $start = $_SERVER['REQUEST_TIME'];
            } else {
                $start = $_SERVER['REQUEST_TIME_FLOAT'];
            }
        }

        // Calculate time
        $time = (microtime(true) - $start) * 1000;

        // Create log content
        $log = array(
            'NAME' => $label,
            'RESPONSE_TIME' => $time,
        );

        // Add cache parameter if given
        if (isset($_SESSION['LIZMAP_GETMAP_CACHE_STATUS'])) {
            $log['CACHE_STATUS'] = $_SESSION['LIZMAP_GETMAP_CACHE_STATUS'];
        }
        jLog::log(json_encode($log), 'metric');
    }
}
