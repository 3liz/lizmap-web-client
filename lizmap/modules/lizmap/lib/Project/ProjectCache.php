<?php

namespace Lizmap\Project;

use Lizmap\App;

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
    protected $qgsMtime;

    /**
     * @var int
     */
    protected $qgsCfgMtime;

    /**
     * version of the format of data stored in the cache.
     *
     * This number should be increased each time you change the structure of the
     * properties of qgisProject (ex: adding some new data properties into the $layers).
     * So you'll be sure that the cache will be updated when Lizmap code source
     * is updated on a server
     */
    const CACHE_FORMAT_VERSION = 1;

    /**
     * Construct the object.
     *
     * @param string                  $file       The full path of the project
     * @param App\AppContextInterface $appContext The interface to call Jelix
     */
    public function __construct($file, App\AppContextInterface $appContext)
    {
        $this->file = $file;
        $this->appContext = $appContext;
        $this->fileKey = $this->appContext->normalizeCacheKey($file);
    }

    /**
     * Returns the Project data stored in Cache.
     *
     * @param array $props The properties to get from the cache
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
            if ($data === false || $data['qgsmtime'] < filemtime($this->file) || $data['qgscfgmtime'] < filemtime($this->file.'.cfg')
                || !isset($data['format_version']) || $data['format_version'] != self::CACHE_FORMAT_VERSION) {
                $data = false;
            }
            if ($data) {
                $this->qgsMtime = $data['qgsmtime'];
                $this->qgsCfgMtime = $data['qgscfgmtime'];
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
            $data['qgsmtime'] = filemtime($this->file);
            $data['qgscfgmtime'] = filemtime($this->file.'.cfg');
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

    public function getFileTime()
    {
        return $this->qgsMtime;
    }

    public function getCfgFileTime()
    {
        return $this->qgsCfgMtime;
    }
}
