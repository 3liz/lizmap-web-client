<?php

namespace Lizmap\Project;

use Lizmap\App;

class projectCache
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
     * Construct the object.
     *
     * @param string                  $file       The full path of the project
     * @param App\appContextInterface $appContext The interface to call Jalix
     */
    public function __construct($file, App\appContextInterface $appContext)
    {
        $this->file = $file;
        $this->appContext = $appContext;
        $this->fileKey = $this->appContext->normalizeCacheKey($file);
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
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
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
            \jCache::set($this->fileKey, $data, null, $this->profile);
        } catch (\Exception $e) {
            \jLog::logEx($e, 'error');
        }
    }

    /**
     * Erase the project data from the cache.
     */
    public function clearCache()
    {
        try {
            \jCache::delete($this->fileKey, $this->profile);
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
        }
    }
}
