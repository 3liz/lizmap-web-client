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
     * @var lizmapProject[] list of projects. keys are projects names
     */
    protected static $projectInstances = array();

    // log items
    protected static $logItems = array();

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
        return jClasses::getService('lizmap~lizmapServices');
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
     */
    public static function getRepositoryProperties()
    {
        return lizmapRepository::$properties;
    }

    /**
     * Get the list of properties options for a generic repository.
     */
    public static function getRepositoryPropertiesOptions()
    {
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
        $propertiesOptions = lizmap::getRepositoryPropertiesOptions();

        foreach (lizmap::getRepositoryProperties() as $k) {
            $ctrl = null;
            if ($propertiesOptions[$k]['fieldType'] == 'checkbox') {
                $ctrl = new jFormsControlCheckbox($k);
            } elseif ($k == 'path' && $rootRepositories != '') {
                if ($rep == null ||
                    substr($rep->getPath(), 0, strlen($rootRepositories)) === $rootRepositories
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
            foreach ($rep->getProperties() as $k) {
                $v = $rep->getData($k);
                if ($k == 'path' && $rootRepositories != '' &&
                    substr($rep->getPath(), 0, strlen($rootRepositories)) === $rootRepositories
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

        $rep = new lizmapRepository($key);
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
        if (in_array($key, self::$repositories) ||
            in_array($key, self::getRepositoryList())
        ) {
            return null;
        }

        $rep = new lizmapRepository($key);
        $rep->update($data);
        self::getRepositoryList();
        self::$repositoryInstances[$key] = $rep;

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

        if (isset(self::$projectInstances[$key])) {
            return self::$projectInstances[$key];
        }

        try {
            $proj = new lizmapProject($matches['proj'], $rep);
        } catch (UnknownLizmapProjectException $e) {
            throw $e;
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return null;
        }
        self::$projectInstances[$key] = $proj;

        return $proj;
    }

    /**
     * Get global configuration for logs.
     *
     * @return lizmapLogConfig
     */
    public static function getLogConfig()
    {
        return jClasses::getService('lizmap~lizmapLogConfig');
    }

    /**
     * Get a list of log items names.
     *
     * @return string[] list of names
     */
    public static function getLogItemList()
    {
        // read the lizmap log configuration file
        $readConfigPath = parse_ini_file(jApp::varPath().self::$lizmapLogConfig, true);
        $logItemList = array();
        foreach ($readConfigPath as $section => $data) {
            $match = preg_match('#(^item:)#', $section, $matches);
            if (isset($matches[0])) {
                $logItemList[] = str_replace($matches[0], '', $section);
            }
        }
        self::$logItems = $logItemList;

        return self::$logItems;
    }

    /**
     * Get the list of properties for a generic log item.
     *
     * @return string[] list of properties name
     */
    public static function getLogItemProperties()
    {
        return lizmapLogItem::getSProperties();
    }

    /**
     * Get a log item.
     *
     * @param string $key Key of the log item to get
     *
     * @return lizmapLogItem
     */
    public static function getLogItem($key)
    {
        if (!in_array($key, self::$logItems)) {
            if (!in_array($key, self::getLogItemList())) {
                return null;
            }
        }

        return new lizmapLogItem($key);
    }

    /**
     * call it at the beginning of your controller if you want to call
     * logMetric later.
     *
     * @param float|string $start indicate the start time. time in Milli-seconds, or
     *                            'now' for the current time, or 'request' for the PHP Http Request time.
     */
    public static function startMetric($start = 'now')
    {
        // Choose from when to calculate time: index, request or given $start
        if ($start == 'now') {
            $_SERVER['LIZMAP_BEGIN_TIME'] = microtime(true);
        } elseif ($start == 'request') {
            // For php < 5.4
            if (!isset($_SERVER['REQUEST_TIME_FLOAT'])) {
                $_SERVER['LIZMAP_BEGIN_TIME'] = $_SERVER['REQUEST_TIME'];
            } else {
                $_SERVER['LIZMAP_BEGIN_TIME'] = $_SERVER['REQUEST_TIME_FLOAT'];
            }
        } else {
            $_SERVER['LIZMAP_BEGIN_TIME'] = $start;
        }
    }

    /**
     * Send metrics to the logger
     *
     * Metrics contains the time spent to do the action, since the call of startMetric()
     *
     * @param string $label   Name of the action to log
     * @param string $service name of a service (could be a SIG service like WMD, WFS or any other service into Lizmap
     * @param array  $payload some values about the action
     */
    public static function logMetric($label, $service, $payload = array())
    {
        if (!self::getServices()->areMetricsEnabled()) {
            return;
        }

        // Calculate time
        if (isset($_SERVER['LIZMAP_BEGIN_TIME'])) {
            $time = (microtime(true) - $_SERVER['LIZMAP_BEGIN_TIME']) * 1000;
        }
        else {
            $time = -1;
        }

        // Create log content
        $log = array(
            'NAME' => $label,
            'SERVICE' => $service,
            'RESPONSE_TIME' => $time,
            'PAYLOAD' => $payload,
        );

        $logMessage = new Log\MetricsLogMessage($log, 'metric');

        jLog::log($logMessage);
    }
}
