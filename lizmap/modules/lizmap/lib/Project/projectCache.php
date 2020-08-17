<?php

namespace Lizmap\Project;

class projectCache
{
    /**
     * The Cache profile
     * @var string
     */
    protected $profile = 'qgisprojects';

    /**
     * The path of the project file
     * @var string
     */
    protected $file;

    /**
     * The key to access data in the cache
     * @var string
     */
    protected $fileKey;

    /**
     * @var jelixInfos
     */
    protected $jelix;

    public function __construct($file, $jelix)
    {
        $this->file = $file;
        $this->fileKey = $this->jelix->normalizeCacheKey($file);
        $this->jelix = $jelix;
    }

    /**
     * Returns the Project data stored in Cache
     * @return array|bool
     */
    public function retrieveProjectData()
    {
        // For the cache key, we use the full path of the project file
        // to avoid collision in the cache engine
        $data = false;

        try {
            $data = $this->jelix->getCache($this->$fileKey, $this->profile);
        } catch (Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
        }
        return $data;
    }

    /**
     * Store project Data in Cache.
     * @param array $data The datas to store
     */
    public function storeProjectData($data)
    {
        try {
            jCache::set($this->$fileKey, $data, null, $this->profile);
        } catch (Exception $e) {
            jLog::logEx($e, 'error');
        }
    }

    /**
     * Erase the project data from the cache
     */
    public function clearCache()
    {
        try {
            jCache::delete($fileKey, $this->profile);
        } catch (Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
        }
    }
}