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

/**
 * @deprecated
 * @see \Lizmap\Project\Repository
 */
class lizmapRepository
{
    /**
     * services properties.
     *
     * @deprecated
     * @see \Lizmap\Project\Repository::$properties
     */
    public static $properties = array(
        'label',
        'path',
        'allowUserDefinedThemes',
        'accessControlAllowOrigin',
    );

    /**
     * services properties options.
     *
     * @deprecated
     * @see \Lizmap\Project\Repository::$propertiesOptions
     */
    public static $propertiesOptions = array(
        'path' => array(
            'fieldType' => 'text',
            'required' => true,
        ),
        'label' => array(
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
     * @var \Lizmap\Project\Repository The repository instance
     */
    protected $repo;

    /**
     * lizmapRepository Constructor
     * Do not call it, if you want to instanciate a lizmapRepository, you should
     * do it with the lizmapServices::getLizmapRepository method.
     *
     * @param string $key      the name of the repository
     * @param array  $data     the repository data
     * @param string $varPath  the configuration files folder path
     * @param mixed  $context
     * @param mixed  $services
     */
    public function __construct($key, $data, $varPath, $context, $services)
    {
        $this->repo = new \Lizmap\Project\Repository($key, $data, $varPath, $context, $services);
    }

    public function getKey()
    {
        return $this->repo->getKey();
    }

    public function getPath()
    {
        return $this->repo->getPath();
    }

    public function getOriginalPath()
    {
        return $this->repo->getOriginalPath();
    }

    public function getLabel()
    {
        return $this->repo->getLabel();
    }

    public function allowUserDefinedThemes()
    {
        return $this->repo->allowUserDefinedThemes();
    }

    public static function getProperties()
    {
        return self::$properties;
    }

    public static function getRepoProperties()
    {
        return self::$propertiesOptions;
    }

    public function getPropertiesOptions()
    {
        return $this->repo::getPropertiesOptions();
    }

    public function getData($key)
    {
        return $this->repo->getData($key);
    }

    /**
     * Update a repository in a \Jelix\IniFile\IniModifier object.
     *
     * @param array                      $data the repository data
     * @param \Jelix\IniFile\IniModifier $ini  the object to edit the ini file
     *
     * @return bool true if there is at least one valid data in $data
     */
    public function update($data, $ini)
    {
        return $this->repo->update($data, $ini);
    }

    /**
     * Get a project by key.
     *
     * @param string $key           the project key
     * @param bool   $keepReference if we need to keep reference in projectInstances
     *
     * @return null|Lizmap\Project\Project null if it does not exist
     */
    public function getProject($key, $keepReference = true)
    {
        return $this->repo->getProject($key, $keepReference);
    }

    /**
     * Get the repository projects.
     *
     * @return Lizmap\Project\Project[]
     */
    public function getProjects()
    {
        return $this->repo->getProjects();
    }

    /**
     * Get the repository projects metadata.
     *
     * @return Lizmap\Project\ProjectMetadata[]
     */
    public function getProjectsMetadata()
    {
        return $this->repo->getProjectsMetadata();
    }

    /**
     * Return the value of the Access-Control-Allow-Origin HTTP header.
     *
     * @param $referer
     *
     * @return string the value of the ACAO header. If empty, the header should not be set.
     */
    public function getACAOHeaderValue($referer)
    {
        return $this->repo->getACAOHeaderValue($referer);
    }
}
