<?php
/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012-2020 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project;

class Repository
{
    /**
     * services properties.
     */
    private static $properties = array(
        'label',
        'path',
        'allowUserDefinedThemes',
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
     * @param string                          $key        the name of the repository
     * @param array                           $data       the repository data
     * @param string                          $varPath    the configuration files folder path
     * @param \lizmapServices                 $services
     * @param \Lizmap\App\AppContextInterface $appContext
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
     * @return false|string the path of the repository
     */
    public function getPath()
    {
        if ($this->data['path'] == '') {
            return false;
        }
        // add a trailing slash if needed
        if (!preg_match('#/$#', $this->data['path'])) {
            $this->data['path'] .= '/';
        }
        $path = $this->data['path'];
        // if path is relative, get full path
        if ($this->data['path'][0] != '/' and $this->data['path'][1] != ':') {
            $path = realpath($this->varPath.$this->data['path']).'/';
        }
        if (strstr($this->data['path'], './')) {
            $path = realpath($this->data['path']).'/';
        }
        if ($path === '/') {
            return false;
        }
        if (file_exists($path)) {
            $this->data['path'] = $path;
        } else {
            return false;
        }

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

    public function getProject($key)
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

        $this->projectInstances[$key] = $proj;

        return $proj;
    }

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
                            $proj = $this->getProject(substr($qgsFile, 0, -4));
                            if ($proj != null) {
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
}
