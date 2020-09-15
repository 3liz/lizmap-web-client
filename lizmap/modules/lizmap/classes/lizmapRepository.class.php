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
     */
    public static $properties = array(
        'label',
        'path',
        'allowUserDefinedThemes',
    );

    /**
     * services properties options.
     *
     * @deprecated
     */
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

    /**
     * @var \Lizmap\Project\Repository The repository instance
     */
    protected $repo;

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

    public static function getProperties()
    {
        return self::$properties;
    }

    public function getRepoProperties()
    {
        return self::$propertiesOptions;
    }

    public static function getPropertiesOptions()
    {
        return self::$repo->getPropertiesOptions();
    }

    public function getData($key)
    {
        return $this->repo->getData($key);
    }

    /**
     * Update a repository in a jIniFilemodifier object.
     *
     * @param array            $data the repository data
     * @param jIniFileModifier $ini  the object to edit the ini file
     *
     * @return bool true if there is at least one valid data in $data
     */
    public function update($data, $ini)
    {
        return $this->repo->update($data, $ini);
    }

    public function getProject($key)
    {
        return $this->repo->getProject($key);
    }

    public function getProjects()
    {
        return $this->repo->getProjects();
    }
}
