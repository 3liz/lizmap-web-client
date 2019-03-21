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
class lizmapRepository
{
    // Lizmap configuration file path (relative to the path folder)
    private $config = 'config/lizmapConfig.ini.php';

    // services properties
    public static $properties = array(
        'label',
        'path',
        'allowUserDefinedThemes',
    );
    public static $propertiesOptions = array(
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

    // Lizmap repository key
    private $key = '';
    // Lizmap repository configuration data
    private $data = array();

    public function __construct($key)
    {
        // read the lizmap configuration file
        $readConfigPath = parse_ini_file(jApp::varPath().$this->config, true);

        $section = 'repository:'.$key;
        // Check if repository exists in the ini file
        if (array_key_exists($section, $readConfigPath)) {
            // Set each property
            foreach (self::$properties as $property) {
                if (array_key_exists($property, $readConfigPath[$section])) {
                    $this->data[$property] = $readConfigPath[$section][$property];
                }
            }
        }
        $this->key = $key;
    }

    public function getKey()
    {
        return $this->key;
    }

    public function getPath()
    {
        // add a trailing slash if needed
        if (!preg_match('#/$#', $this->data['path'])) {
            $this->data['path'] .= '/';
        }
        // if path is relative, get full path
        if ($this->data['path'][0] != '/' and $this->data['path'][1] != ':') {
            return realpath(jApp::varPath().$this->data['path']).'/';
        }

        return $this->data['path'];
    }

    public function getProperties()
    {
        return self::$properties;
    }

    public function getPropertiesOptions()
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

    public function update($data)
    {
        // Get access to the ini file
        $iniFile = jApp::configPath('lizmapConfig.ini.php');
        $ini = new jIniFileModifier($iniFile);

        // Set section
        $section = 'repository:'.$this->key;

        $modified = false;
        // Modify the ini data for the repository
        foreach ($data as $k => $v) {
            if (in_array($k, self::$properties)) {
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
                            $proj = lizmap::getProject($this->key.'~'.substr($qgsFile, 0, -4));
                            if ($proj != null) {
                                $projects[] = $proj;
                            }
                        } catch (UnknownLizmapProjectException $e) {
                            jLog::logEx($e, 'error');
                        } catch (Exception $e) {
                            jLog::logEx($e, 'error');
                        }
                    }
                }
            }
        }

        return $projects;
    }
}
