<?php
/**
 * Get access to the Lizmap project metadata.
 *
 * @author    3liz
 * @copyright 2012-2021 3liz
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
     * @param Project $project The Lizmap project instance
     */
    public function __construct(Project $project)
    {
        $metadata = array(
            'id' => $project->getKey(),
            'repository' => $project->getRepositoryKey(),
            'title' => $project->getTitle(),
            'abstract' => $project->getAbstract(),
            'keywordList' => $project->getKeywordsList(),
            'proj' => $project->getProj(),
            'bbox' => $project->getBbox(),
            'wmsGetCapabilitiesUrl' => $project->getWMSGetCapabilitiesUrl(),
            'wmtsGetCapabilitiesUrl' => $project->getWMTSGetCapabilitiesUrl(),
            'map' => $project->getRelativeQgisPath(),
            'acl' => $project->checkAcl(),
            'qgisProjectVersion' => $project->getQgisProjectVersion(),
            'lizmapPluginVersion' => $project->getLizmapPluginVersion(),
            'lizmapWebClientTargetVersion' => $project->getLizmapWebCLientTargetVersion(),
            'needsUpdateError' => $project->needsUpdateError(),
            'needsUpdateWarning' => $project->needsUpdateWarning(),
            'layerCount' => $project->getLayerCount(),
            'fileTime' => $project->getFileTime(),
            'aclGroups' => '',
        );
        if (is_array($project->getOption('acl'))) {
            $metadata['aclGroups'] = implode(', ', $project->getOption('acl'));
        }

        $metadata['hidden'] = $project->getBooleanOption('hideProject');

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
     * List of keywords.
     *
     * @return array
     */
    public function getKeywordList()
    {
        return $this->data['keywordList'];
    }

    /**
     * FIXME what is the returned content ?
     *
     * @return mixed
     */
    public function getProj()
    {
        return $this->data['proj'];
    }

    /**
     * Get the bounding box.
     *
     * FIXME what is the returned content ?
     *
     * @return mixed
     */
    public function getBbox()
    {
        return $this->data['bbox'];
    }

    /**
     * The url of WMS GetCapabilities.
     *
     * @return string
     */
    public function getWMSGetCapabilitiesUrl()
    {
        return $this->data['wmsGetCapabilitiesUrl'];
    }

    /**
     * The url of WMTS GetCapabilities.
     *
     * @return string
     */
    public function getWMTSGetCapabilitiesUrl()
    {
        return $this->data['wmtsGetCapabilitiesUrl'];
    }

    /**
     * The QGIS desktop project version.
     *
     * @return string
     */
    public function getQgisProjectVersion()
    {
        return $this->data['qgisProjectVersion'];
    }

    /**
     * The version of the Desktop lizmap plugin.
     *
     * @return string
     */
    public function getLizmapPluginVersion()
    {
        return $this->data['lizmapPluginVersion'];
    }

    /**
     * The target version written in the CFG file.
     *
     * @return int
     */
    public function getLizmapWebCLientTargetVersion()
    {
        return $this->data['lizmapWebClientTargetVersion'];
    }

    /**
     * Check if the project needs an update which is critical.
     *
     * @return bool true if the project needs an update
     */
    public function needsUpdateError()
    {
        return $this->data['needsUpdateError'];
    }

    /**
     * Check if the project needs an update which is not critical.
     *
     * @return bool true if the project needs an update
     */
    public function needsUpdateWarning()
    {
        return $this->data['needsUpdateWarning'];
    }

    /**
     * The project file time.
     *
     * @return string
     */
    public function getFileTime()
    {
        return $this->data['fileTime'];
    }

    /**
     * The number of layers in the QGIS project.
     *
     * @return string
     */
    public function getLayerCount()
    {
        return $this->data['layerCount'];
    }

    /**
     * The acl option which corresponds to authorized groups.
     *
     * @return string
     */
    public function getAclGroups()
    {
        return $this->data['aclGroups'];
    }

    /**
     * Get any project property.
     *
     * @deprecated  use other get* methods
     *
     * @param string $key The property to get
     *
     * @return mixed
     */
    public function getData($key)
    {
        if (array_key_exists($key, $this->data)) {
            return $this->data[$key];
        }

        return null;
    }
}
