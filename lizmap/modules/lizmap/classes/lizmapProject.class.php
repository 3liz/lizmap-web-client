<?php

/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012-2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

use Lizmap\Project\Project;
use Lizmap\Project\ProjectMetadata;
use Lizmap\Project\Repository;
use Lizmap\Project\UnknownLizmapProjectException;

/**
 * @deprecated
 *
 * Verify this methods are not used in external modules so we can delete them without risk, otherwise, we have to implement them
 * in Project and call it here
 */
class lizmapProject
{
    /**
     * @var Project
     */
    protected $proj;

    /**
     * constructor.
     *
     * @param string     $key      : the project name
     * @param Repository $rep      : the repository
     * @param mixed      $context
     * @param mixed      $services
     */
    public function __construct($key, $rep, $context, $services)
    {
        try {
            $this->proj = new Project($key, $rep, $context, $services);
        } catch (UnknownLizmapProjectException $e) {
            throw $e;
        }
    }

    public function clearCache()
    {
        $this->proj->clearCache();
    }

    public function getPath()
    {
        return $this->proj->getPath();
    }

    public function getQgisProjectVersion()
    {
        return $this->proj->getQgisProjectVersion();
    }

    public function getRelations()
    {
        return $this->proj->getRelations();
    }

    public function getThemes()
    {
        return $this->proj->getThemes();
    }

    public function getLayerDefinition($layerId)
    {
        return $this->proj->getLayerDefinition($layerId);
    }

    public function getLayerByKeyword($key)
    {
        return $this->proj->getLayerByKeyword($key);
    }

    /**
     * @param string $key
     *
     * @return qgisMapLayer[]|qgisVectorLayer[]
     */
    public function findLayersByKeyword($key)
    {
        return $this->proj->findLayersByKeyword($key);
    }

    public function getQgisPath()
    {
        return $this->proj->getQgisPath();
    }

    public function getRelativeQgisPath()
    {
        return $this->proj->getRelativeQgisPath();
    }

    public function getKey()
    {
        return $this->proj->getKey();
    }

    public function getRepository()
    {
        return $this->proj->getRepository();
    }

    public function getFileTime()
    {
        return $this->proj->getFileTime();
    }

    public function getCfgFileTime()
    {
        return $this->proj->getCfgFileTime();
    }

    public function getProperties()
    {
        return $this->proj->getProperties();
    }

    public function getOptions()
    {
        return $this->proj->getOptions();
    }

    public function getLayers()
    {
        return $this->proj->getLayers();
    }

    public function getLayer($layerId)
    {
        return $this->proj->getLayer($layerId);
    }

    /**
     * @param string $layerId
     *
     * @return SimpleXMLElement[]
     *
     * @deprecated
     */
    public function getXmlLayer($layerId)
    {
        return $this->proj->getXmlLayer($layerId);
    }

    /**
     * Get the minimum needed project information for some pages (landing page, admin project listing).
     *
     * @return ProjectMetadata
     */
    public function getMetadata()
    {
        return $this->proj->getMetadata();
    }

    public function findLayerByAnyName($name)
    {
        return $this->proj->findLayerByAnyName($name);
    }

    public function findLayerByName($name)
    {
        return $this->proj->findLayerByName($name);
    }

    public function findLayerByShortName($shortName)
    {
        return $this->proj->findLayerByShortName($shortName);
    }

    public function findLayerByTitle($title)
    {
        return $this->proj->findLayerByTitle($title);
    }

    public function findLayerByLayerId($layerId)
    {
        return $this->proj->findLayerByLayerId($layerId);
    }

    public function findLayerByTypeName($typeName)
    {
        return $this->proj->findLayerByTypeName($typeName);
    }

    public function hasLocateByLayer()
    {
        return $this->proj->hasLocateByLayer();
    }

    public function hasFormFilterLayers()
    {
        return $this->proj->hasFormFilterLayers();
    }

    public function getFormFilterLayersConfig()
    {
        return $this->proj->getFormFilterLayersConfig();
    }

    public function hasTimemanagerLayers()
    {
        return $this->proj->hasTimemanagerLayers();
    }

    public function hasAtlasEnabled()
    {
        return $this->proj->hasAtlasEnabled();
    }

    public function hasTooltipLayers()
    {
        return $this->proj->hasTooltipLayers();
    }

    public function hasAttributeLayers($onlyDisplayedLayers = false)
    {
        return $this->proj->hasAttributeLayers($onlyDisplayedLayers);
    }

    public function hasFtsSearches()
    {
        return $this->proj->hasFtsSearches();
    }

    public function hasEditionLayers()
    {
        return $this->proj->hasEditionLayersForCurrentUser();
    }

    public function hasEditionLayersForCurrentUser()
    {
        return $this->proj->hasEditionLayersForCurrentUser();
    }

    public function getEditionLayers()
    {
        return $this->proj->getEditionLayers();
    }

    public function getEditionLayersForCurrentUser()
    {
        return $this->proj->getEditionLayersForCurrentUser();
    }

    public function findEditionLayerByName($name)
    {
        return $this->proj->findEditionLayerByName($name);
    }

    /**
     * @param string $layerId
     *
     * @return null|object
     */
    public function findEditionLayerByLayerId($layerId)
    {
        return $this->proj->findEditionLayerByLayerId($layerId);
    }

    /**
     * @return bool
     */
    public function hasLoginFilteredLayers()
    {
        return $this->proj->hasLoginFilteredLayers();
    }

    public function getLoginFilteredConfig($layername)
    {
        return $this->proj->getLoginFilteredConfig($layername);
    }

    /**
     * Get login filtered configs with the build expressions.
     *
     * @param array<string> $layers  : layers' name list
     * @param bool          $edition : get login filters for edition
     *
     * @return array the login filtered configs with build expressions
     */
    public function getLoginFilters($layers, $edition = false)
    {
        return $this->proj->getLoginFilters($layers, $edition);
    }

    /**
     * Get login filtered config with the build expression.
     *
     * @param string $layerName : layer's name
     * @param bool   $edition   : get login filters for edition
     *
     * @return array the login filtered config with build expression
     */
    public function getLoginFilter($layerName, $edition = false)
    {
        return $this->proj->getLoginFilter($layerName, $edition);
    }

    /**
     * @return array|bool
     */
    public function getDatavizLayersConfig()
    {
        return $this->proj->getDatavizLayersConfig();
    }

    public function getData($key)
    {
        return $this->proj->getData($key);
    }

    public function getProj4($authId)
    {
        return $this->proj->getProj4($authId);
    }

    public function getAllProj4()
    {
        return $this->proj->getAllProj4();
    }

    public function getCanvasColor()
    {
        return $this->proj->getCanvasColor();
    }

    public function getWMSInformation()
    {
        return $this->proj->getWMSInformation();
    }

    /**
     * @return bool
     */
    public function needsGoogle()
    {
        return $this->proj->needsGoogle();
    }

    /**
     * @return string
     */
    public function getGoogleKey()
    {
        return $this->proj->getGoogleKey();
    }

    /**
     * @param string $layerId
     *
     * @return null|string
     */
    public function getLayerNameByIdFromConfig($layerId)
    {
        return $this->proj->getLayerNameByIdFromConfig($layerId);
    }

    /**
     * @return object the updated JSON object corresponding to the configuration
     */
    public function getUpdatedConfig()
    {
        return $this->proj->getUpdatedConfig();
    }

    /**
     * @return object the full JSON object corresponding to the configuration
     */
    public function getFullCfg()
    {
        return $this->proj->getFullCfg();
    }

    /**
     * @return lizmapMapDockItem[]
     *
     * @throws jExceptionSelector
     */
    public function getDefaultDockable()
    {
        return $this->proj->getDefaultDockable();
    }

    /**
     * @return lizmapMapDockItem[]
     *
     * @throws jException
     * @throws jExceptionSelector
     */
    public function getDefaultMiniDockable()
    {
        return $this->proj->getDefaultMiniDockable();
    }

    /**
     * @return lizmapMapDockItem[]
     *
     * @throws jExceptionSelector
     */
    public function getDefaultBottomDockable()
    {
        return $this->proj->getDefaultBottomDockable();
    }

    /**
     * Check if the project needs an update in the QGIS desktop plugin.
     *
     * @return bool true if the project needs an update
     */
    public function needsUpdateError()
    {
        return $this->proj->needsUpdateError();
    }

    /**
     * Check if the project needs an update in the QGIS desktop plugin.
     *
     * @return bool true if the project needs an update
     */
    public function needsUpdateWarning()
    {
        return $this->proj->needsUpdateWarning();
    }

    /**
     * Check acl rights on the project.
     *
     * @return bool true if the current user as rights on the project
     */
    public function checkAcl()
    {
        return $this->proj->checkAcl();
    }

    public function checkAclByUser($login)
    {
        return $this->proj->checkAclByUser($login);
    }
}
