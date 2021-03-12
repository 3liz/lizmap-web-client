<?php
/**
 * Get access to the Lizmap project metadata.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project;

class ProjectMetadata
{
    /**
     * The project metadata.
     *
     * @var array
     */
    protected $data;

    /**
     * Construct the object.
     *
     * @param $project The Lizmap project instance
     */
    public function __construct($project)
    {
        $metadata = array(
            'id' => $project->getData('id'),
            'repository' => $project->getData('repository'),
            'title' => $project->getData('title'),
            'abstract' => $project->getData('abstract'),
            'keywordList' => $project->getData('keywordList'),
            'proj' => $project->getData('proj'),
            'bbox' => $project->getData('bbox'),
            'wmsGetCapabilitiesUrl' => $project->getData('wmsGetCapabilitiesUrl'),
            'wmtsGetCapabilitiesUrl' => $project->getData('wmtsGetCapabilitiesUrl'),
            'map' => $project->getRelativeQgisPath(),
            'acl' => $project->checkAcl(),
        );

        $options = $project->getOptions();
        $hideProject = (
            $options && property_exists($options, 'hideProject') && $options->hideProject == 'True'
        );
        $metadata['hidden'] = $hideProject;

        $this->data = $metadata;
    }

    /**
     * Get the project id.
     *
     * @return string the project id
     */
    public function getId()
    {
        return $this->data['id'];
    }

    /**
     * Get the project repository code.
     *
     * @return string the project repository code
     */
    public function getRepository()
    {
        return $this->data['repository'];
    }

    /**
     * Get the project title.
     *
     * @return string the project title
     */
    public function getTitle()
    {
        return $this->data['title'];
    }

    /**
     * Get the project abstract.
     *
     * @return string the project abstract
     */
    public function getAbstract()
    {
        return $this->data['abstract'];
    }

    /**
     * Get the project map.
     *
     * @return string the project map
     */
    public function getMap()
    {
        return $this->data['map'];
    }

    /**
     * Get the project hidden flag.
     *
     * @return bool True if the project must be hidden in the landing page
     */
    public function getHidden()
    {
        return $this->data['hidden'];
    }

    /**
     * Get the project access rights for the authenticated or anonymous user.
     *
     * @return bool True if the user has the right to access the Lizmap project
     */
    public function getAcl()
    {
        return $this->data['acl'];
    }

    /**
     * Get any project property.
     *
     * @param string $key The property to get
     *
     * @return the project title
     */
    public function getData($key)
    {
        if (array_key_exists($key, $this->data)) {
            return $this->data[$key];
        }

        return null;
    }
}
