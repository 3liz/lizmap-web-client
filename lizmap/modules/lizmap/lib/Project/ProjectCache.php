<?php

namespace Lizmap\Project;

use Lizmap\App;
use Lizmap\Form\QgisFormControlProperties;

class ProjectCache
{
    /**
     * The Cache profile.
     *
     * @var string
     */
    protected $profile = 'qgisprojects';

    /**
     * The path of the project file.
     *
     * @var string
     */
    protected $file;

    /**
     * The key to access data in the cache.
     *
     * @var string
     */
    protected $fileKey;

    /**
     * @var App\AppContextInterface
     */
    protected $appContext;

    /**
     * @var int
     */
    protected $qgsMtime = 0;

    /**
     * @var int
     */
    protected $qgsCfgMtime = 0;

    /**
     * version of the format of data stored in the cache.
     *
     * This number should be increased each time you change the structure of the
     * properties of QgisProject or the content of QgisFormControlProperties
     * (ex: adding some new data properties into the $layers).
     * So you'll be sure that the cache will be updated when Lizmap code source
     * is updated on a server
     */
    public const CACHE_FORMAT_VERSION = 10;

    /**
     * Initialize the cache of a Qgis project.
     *
     * The given Qgis file should exist, as well as the corresponding lizmap
     * cfg file.
     *
     * @param string                  $file            The full path of the QGIS project file
     * @param int                     $modifiedTime    Modification time of the file
     * @param int                     $cfgModifiedTime Modification time of the lizmap configuration file for the QGIS project
     * @param App\AppContextInterface $appContext      The interface to call Jelix
     */
    public function __construct($file, $modifiedTime, $cfgModifiedTime, App\AppContextInterface $appContext)
    {
        $this->file = $file;
        $this->appContext = $appContext;
        $this->fileKey = $this->appContext->normalizeCacheKey($file);
        $this->qgsMtime = $modifiedTime;
        $this->qgsCfgMtime = $cfgModifiedTime;
    }

    /**
     * Returns the Project data stored in Cache.
     *
     * @return array|bool
     */
    public function retrieveProjectData()
    {
        // For the cache key, we use the full path of the project file
        // to avoid collision in the cache engine
        $data = false;

        try {
            $data = $this->appContext->getCache($this->fileKey, $this->profile);
            if ($data === false
                || is_null($data)
                || $data['qgsmtime'] < $this->qgsMtime
                || $data['qgscfgmtime'] < $this->qgsCfgMtime
                || !isset($data['format_version'])
                || $data['format_version'] != self::CACHE_FORMAT_VERSION
            ) {
                $data = false;
            }
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            $this->appContext->logException($e, 'error');
        }

        return $data;
    }

    /**
     * Store project Data in Cache.
     *
     * @param array $data The datas to store
     */
    public function storeProjectData($data)
    {
        try {
            $data['qgsmtime'] = $this->qgsMtime;
            $data['qgscfgmtime'] = $this->qgsCfgMtime;
            $data['format_version'] = self::CACHE_FORMAT_VERSION;
            $this->appContext->setCache($this->fileKey, $data, null, $this->profile);
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'error');
        }
    }

    /**
     * Erase the project data from the cache.
     */
    public function clearCache()
    {
        try {
            $this->appContext->clearCache($this->fileKey, $this->profile);
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            $this->appContext->logException($e, 'error');
        }
    }

    /**
     * Stores form properties from an editable Layer into cache.
     *
     * It should be called during the read of the project, before the project
     * properties are stored into the cache.
     * as the getEditableLayerFormCache method does not check the validity
     * of the cache.
     *
     * @param string                      $layerId
     * @param QgisFormControlProperties[] $formControls
     */
    public function setEditableLayerFormCache($layerId, $formControls)
    {
        $cacheKey = $this->fileKey.'.layer-'.$layerId.'-form';
        $this->appContext->setCache($cacheKey, $formControls, null, $this->profile);
    }

    /**
     * Read the form properties of the corresponding editable layer.
     *
     * Is assumes that the cache exists, as it should be created during the
     * first project parsing.
     *
     * @param string $layerId
     *
     * @return QgisFormControlProperties[]
     *
     * @throws \Exception
     */
    public function getEditableLayerFormCache($layerId)
    {
        $cacheKey = $this->fileKey.'.layer-'.$layerId.'-form';

        try {
            $cacheContent = $this->appContext->getCache($cacheKey, $this->profile);
        } catch (\Exception $e) {
            throw new \Exception('Can\'t read the layer form properties from cache, try to clear your cache and reload the page.');
        }

        return $cacheContent;
    }

    /**
     * store some data into the project cache, related to the project.
     *
     * @param string $key
     * @param mixed  $data
     * @param int the life time of the cache, in seconds
     * @param mixed $ttl
     *
     * @return bool false if failure
     */
    public function setProjectRelatedDataCache($key, $data, $ttl = 7200)
    {
        $cacheContent = array(
            'qgsmtime' => $this->qgsMtime,
            'qgscfgmtime' => $this->qgsCfgMtime,
            'format_version' => self::CACHE_FORMAT_VERSION,
            'data' => $data,
        );

        $cacheKey = $this->fileKey.'.'.$key;

        try {
            return $this->appContext->setCache($cacheKey, $cacheContent, $ttl, $this->profile);
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'error');

            return false;
        }
    }

    /**
     * Read some data from the project cache, related to the project.
     *
     * It checks if the cache is belong with the current project cache.
     *
     * @param string $key
     *
     * @return false|mixed false if there is no cache, else the data
     */
    public function getProjectRelatedDataCache($key)
    {
        $data = false;

        try {
            $cacheKey = $this->fileKey.'.'.$key;
            $cacheContent = $this->appContext->getCache($cacheKey, $this->profile);
            // check if the cache correspond to the current project
            if ($cacheContent === false
                || $cacheContent['qgsmtime'] < $this->qgsMtime
                || $cacheContent['qgscfgmtime'] < $this->qgsCfgMtime
                || $cacheContent['format_version'] != self::CACHE_FORMAT_VERSION
            ) {
                return false;
            }
            $data = $cacheContent['data'];
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            $this->appContext->logException($e, 'error');
        }

        return $data;
    }

    public function getFileTime()
    {
        return $this->qgsMtime;
    }

    public function getCfgFileTime()
    {
        return $this->qgsCfgMtime;
    }
}
