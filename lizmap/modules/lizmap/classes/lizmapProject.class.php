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

use Lizmap\Project;

 /**
  * @deprecated 
  * @FIXME getXml, getComposer
  * Verify this methods are not used in external modules so we can delete them without risk, otherwise, we have to implement them
  * in Project and call it here
  */
class lizmapProject extends qgisProject
{
    /**
     * @var project
     */
    protected $proj;
    /**
     * constructor.
     *
     * @param string           $key : the project name
     * @param lizmapRepository $rep : the repository
     */
    public function __construct($key, $rep)
    {
        $this->proj = new \Lizmap\Project\project($key, $rep, lizmap::getJelixInfos(), lizmap::getServices());
    }

    public function clearCache()
    {
        $this->proj->clearCache();
    }

    /**
     * Read the qgis files.
     *
     * @param mixed $key
     * @param mixed $rep
     */
    protected function readProject($key, $rep)
    {
        $this->proj->readProject($key, $rep);
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

    /**
     * @return mixed
     */
    public function getQgisServerPlugins()
    {
        return $this->proj->getQgisServerPlugins();
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
        return $this->proj->hasEditionLayers();
    }

    public function getEditionLayers()
    {
        return $this->proj->getEditionLayers();
    }

    public function findEditionLayerByName($name)
    {
        return $this->proj->findEditionLayerByName($name);
    }

    /**
     * @param $layerId
     *
     * @return null|array
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

    public function getLoginFilters($layers)
    {
        return $this->proj->getLoginFilters($layers);
    }

    private function optionToBoolean($config_string)
    {
        return $this->proj->optionToBoolean($config_string);
    }

    /**
     * @return array|bool
     */
    public function getDatavizLayersConfig()
    {
        return $this->proj->getDatavizLayersConfig();
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

    protected function readPrintCapabilities($qgsLoad, $cfg)
    {
        return $this->proj->readPrintCapabilities($qgsLoad, $cfg);
    }

    /**
     * @param SimpleXMLElement $xml
     * @param string           $layerId
     *
     * @return SimpleXMLElement[]
     */
    protected function getXmlLayer2($xml, $layerId)
    {
        return $this->proj->getXmlLayer2($xml, $layerId);
    }

    protected function readLocateByLayers($xml, $cfg)
    {
        return $this->proj->readLocateByLayers($xml, $cfg);
    }

    protected function readFormFilterLayers($xml, $cfg)
    {
        return $this->proj->readFormFilterLayers($xml, $cfg);
    }

    protected function readEditionLayers($xml, $cfg)
    {
        return $this->proj->readEditionLayers($xml, $cfg);
    }

    protected function readAttributeLayers($xml, $cfg)
    {
        return $this->proj->readAttributeLayers($xml, $cfg);
    }

    /**
     * @param SimpleXMLElement $xml
     * @param $cfg
     *
     * @return int[]
     */
    protected function readLayersOrder($xml, $cfg)
    {
        return $this->proj->readLayersOrder($xml, $cfg);
    }

    /**
     * @return false|string the JSON object corresponding to the configuration
     */
    public function getUpdatedConfig()
    {
        return $this->proj->getUpdatedConfig();
    }

    /**
     * @return object
     */
    public function getFullCfg()
    {
        return $this->proj->getFullCfg();
    }

    /**
     * @throws jExceptionSelector
     *
     * @return lizmapMapDockItem[]
     */
    public function getDefaultDockable()
    {
        return $this->proj->getDefaultDockable();
    }

    /**
     * @throws jException
     * @throws jExceptionSelector
     *
     * @return lizmapMapDockItem[]
     */
    public function getDefaultMiniDockable()
    {
        return $this->proj->getDefaultMiniDockable();
    }

    /**
     * @throws jExceptionSelector
     *
     * @return lizmapMapDockItem[]
     */
    public function getDefaultBottomDockable()
    {
        return $this->proj->getDefaultBottomDockable();
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

    public function getSpatialiteExtension()
    {
        return $this->proj->getSpatialiteExtension();
    }
}
