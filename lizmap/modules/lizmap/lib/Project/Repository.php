<?php

/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012-2022 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project;

use Lizmap\App\AppContextInterface;

class Repository
{
    /**
     * services properties.
     */
    private static $properties = array(
        'label',
        'path',
        'allowUserDefinedThemes',
        'accessControlAllowOrigin',
    );

    /**
     * services properties options.
     */
    private static $propertiesOptions = array(
        'label' => array(
            'fieldType' => 'text',
            'required' => true,
        ),
        'path' => array(
            'fieldType' => 'text',
            'required' => true,
        ),
        'allowUserDefinedThemes' => array(
            'fieldType' => 'checkbox',
            'required' => false,
        ),
        'accessControlAllowOrigin' => array(
            'fieldType' => 'text',
            'required' => false,
        ),
    );

    /**
     * Lizmap repository key.
     */
    private $key = '';

    /**
     * Lizmap repository configuration data.
     */
    private $data = array();

    /**
     * @var Project[] list of projects. keys are projects names
     */
    protected $projectInstances = array();

    /**
     * The configuration files folder path.
     */
    private $varPath = '';

    protected $services;

    protected $appContext;

    /**
     * lizmapRepository Constructor.
     *
     * Do not call it directly. Prefer to call `lizmapServices::getLizmapRepository()` instead.
     *
     * @param string              $key        the name of the repository
     * @param array               $data       the repository data
     * @param string              $varPath    the configuration files folder path
     * @param \lizmapServices     $services
     * @param AppContextInterface $appContext
     */
    public function __construct($key, $data, $varPath, $services, $appContext)
    {
        $properties = self::getProperties();
        $this->varPath = $varPath;
        $this->services = $services;
        $this->appContext = $appContext;

        // Set each property
        foreach ($properties as $property) {
            if (array_key_exists($property, $data)) {
                $this->data[$property] = $data[$property];
            }
        }
        $this->key = $key;
    }

    /**
     * @return string the technical name of the repository
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * Get the repository label.
     *
     * @return string the repository label
     */
    public function getLabel()
    {
        return $this->getData('label');
    }

    /**
     * Indicate if user defined themes are allowed.
     *
     * @return bool true if it is allowed
     */
    public function allowUserDefinedThemes()
    {
        $value = $this->getData('allowUserDefinedThemes');
        if (empty($value)) {
            return false;
        }
        if (is_bool($value)) {
            return $value;
        }
        if (is_numeric($value)) {
            return intval($value) > 0;
        }
        $strVal = strtolower($value);

        return in_array($strVal, array('true', 't', 'on', '1'));
    }

    /**
     * Return the value of the Access-Control-Allow-Origin HTTP header.
     *
     * @param $referer The referer
     *
     * @return string the value of the ACAO header. If empty, the header should not be set.
     */
    public function getACAOHeaderValue($referer)
    {
        $origins = $this->getData('accessControlAllowOrigin');
        if (!$origins || $referer == '') {
            return '';
        }

        if (is_string($origins)) {
            $origins = preg_split('/\s*,\s*/', $origins);
        }

        $refParts = parse_url($referer);
        $referer = ($refParts['scheme'] ?? 'https').'://'.$refParts['host'];
        if (isset($refParts['port'])) {
            $referer .= ':'.$refParts['port'];
        }

        foreach ($origins as $origin) {
            if ($origin == $referer) {
                return $origin;
            }
        }

        return '';
    }

    protected $cleanedPath;

    /**
     * @return false|string the path of the repository
     */
    public function getPath()
    {
        if ($this->data['path'] == '') {
            return false;
        }
        if ($this->cleanedPath !== null) {
            return $this->cleanedPath;
        }
        $path = $this->data['path'];
        // add a trailing slash if needed
        if (!preg_match('#/$#', $path)) {
            $path .= '/';
        }
        // if path is relative, get full path
        if ($this->data['path'][0] != '/' && $this->data['path'][1] != ':') {
            $path = realpath($this->varPath.$this->data['path']).'/';
        }
        if (strstr($this->data['path'], './')) {
            $path = realpath($this->data['path']).'/';
        }
        if ($path === '/') {
            return false;
        }
        if (file_exists($path)) {
            $this->cleanedPath = $path;
        } else {
            return false;
        }

        return $this->cleanedPath;
    }

    public function getOriginalPath()
    {
        return $this->data['path'];
    }

    public static function getProperties()
    {
        return self::$properties;
    }

    public function getRepoProperties()
    {
        return self::$properties;
    }

    public static function getPropertiesOptions()
    {
        return self::$propertiesOptions;
    }

    /**
     * @deprecated
     *
     * @param string $key
     *
     * @return null|mixed
     */
    public function getData($key)
    {
        if (!array_key_exists($key, $this->data)) {
            return null;
        }

        return $this->data[$key];
    }

    /**
     * Update a repository in a ini content.
     *
     * @param array             $data the repository data
     * @param \jIniFileModifier $ini  the object to edit the ini file
     *
     * @return bool true if there is at least one valid data in $data
     */
    public function update($data, $ini)
    {
        // Set section
        $section = 'repository:'.$this->key;

        $modified = false;
        // Modify the ini data for the repository
        foreach ($data as $k => $v) {
            if (in_array($k, self::getProperties())) {
                // Set values in ini file
                $ini->setValue($k, $v, $section);
                // Modify lizmapConfigData
                $this->data[$k] = $v;
                $modified = true;
            }
        }

        // Save the ini file
        if ($modified) {
            $ini->save();
        }

        return $modified;
    }

    /**
     * Get a project by key.
     *
     * @param string $key           the project key
     * @param bool   $keepReference if we need to keep reference in the repository property projectInstances
     *
     * @return null|Project null if it does not exist
     */
    public function getProject($key, $keepReference = true)
    {
        if (isset($this->projectInstances[$key])) {
            return $this->projectInstances[$key];
        }

        try {
            $proj = new Project($key, $this, $this->appContext, $this->services);
        } catch (UnknownLizmapProjectException $e) {
            throw $e;
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'error');

            return null;
        }

        if ($keepReference) {
            $this->projectInstances[$key] = $proj;
        }

        return $proj;
    }

    /**
     * Get the repository projects instances.
     *
     * @return Project[]
     */
    public function getProjects()
    {
        $projects = array();
        $dir = $this->getPath();

        if (is_dir($dir)) {
            if ($dh = opendir($dir)) {
                $cfgFiles = array();
                $qgsFiles = array();
                while (($file = readdir($dh)) !== false) {
                    if (substr($file, -3) == 'cfg') {
                        $cfgFiles[] = $file;
                    }
                    if (substr($file, -3) == 'qgs') {
                        $qgsFiles[] = $file;
                    }
                }
                closedir($dh);

                foreach ($qgsFiles as $qgsFile) {
                    $proj = null;
                    if (in_array($qgsFile.'.cfg', $cfgFiles)) {
                        try {
                            // Avoid memory usage by not keeping project instance in projectInstances
                            $keepReference = false;
                            $proj = $this->getProject(substr($qgsFile, 0, -4), $keepReference);
                            if ($proj != null) {
                                // Add project instance in returned object
                                $projects[] = $proj;
                            }
                        } catch (UnknownLizmapProjectException $e) {
                            $this->appContext->logException($e, 'error');
                        } catch (\Exception $e) {
                            $this->appContext->logException($e, 'error');
                        }
                    }
                }
            }
        }

        return $projects;
    }

    /**
     * Get the repository projects metadata.
     *
     * @param bool $checkAcl If the ACL must be checked, according to the current user, default to true
     *
     * @return ProjectMetadata[]
     */
    public function getProjectsMetadata($checkAcl = true)
    {
        $data = array();
        $dir = $this->getPath();

        if (is_dir($dir)) {
            if ($dh = opendir($dir)) {
                $cfgFiles = array();
                $qgsFiles = array();
                while (($file = readdir($dh)) !== false) {
                    if (substr($file, -3) == 'cfg') {
                        $cfgFiles[] = $file;
                    }
                    if (substr($file, -3) == 'qgs') {
                        $qgsFiles[] = $file;
                    }
                }
                closedir($dh);

                foreach ($qgsFiles as $qgsFile) {
                    $proj = null;
                    if (in_array($qgsFile.'.cfg', $cfgFiles)) {
                        try {
                            // Get project
                            $keepReference = false;
                            $proj = $this->getProject(substr($qgsFile, 0, -4), $keepReference);
                            // Get the project metadata and add it to the returned object
                            // only if the authenticated user can access the project (or if checkACL is disabled)
                            if ($proj != null) {
                                if ($checkAcl && !$proj->checkAcl()) {
                                    continue;
                                }
                                $data[] = $proj->getMetadata();
                            }
                        } catch (UnknownLizmapProjectException $e) {
                            $this->appContext->logException($e, 'error');
                        } catch (\Exception $e) {
                            $this->appContext->logException($e, 'error');
                        }
                    }
                }
            }
        }

        return $data;
    }

    /**
     * Get the repository projects main data.
     *
     * @return ProjectMainData[]
     */
    public function getProjectsMainData()
    {
        $data = array();
        $dir = $this->getPath();

        if (is_dir($dir)) {
            if ($dh = opendir($dir)) {
                $cfgFiles = array();
                $qgsFiles = array();
                while (($file = readdir($dh)) !== false) {
                    if (substr($file, -3) == 'cfg') {
                        $cfgFiles[] = $file;
                    }
                    if (substr($file, -3) == 'qgs') {
                        $qgsFiles[] = $file;
                    }
                }
                closedir($dh);

                $requiredTargetLwcVersion = \jApp::config()->minimumRequiredVersion['lizmapWebClientTargetVersion'];
                foreach ($qgsFiles as $qgsFile) {
                    $proj = null;
                    if (in_array($qgsFile.'.cfg', $cfgFiles)) {
                        try {
                            // Get project main data
                            $proj = new ProjectMainData(
                                $this->getKey(),
                                substr($qgsFile, 0, -4),
                                $this->getPath().$qgsFile,
                                $requiredTargetLwcVersion,
                                $this->appContext
                            );
                            // $this->getProject(substr($qgsFile, 0, -4), $keepReference);
                            // Get the project metadata and add it to the returned object
                            // only if the authenticated user can access the project
                            if ($proj != null && $proj->getAcl()) {
                                $data[] = $proj;
                            }
                        } catch (UnknownLizmapProjectException $e) {
                            $this->appContext->logException($e, 'error');
                        } catch (\Exception $e) {
                            $this->appContext->logException($e, 'error');
                        }
                    }
                }
            }
        }

        return $data;
    }
}
