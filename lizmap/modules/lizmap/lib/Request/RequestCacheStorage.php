<?php

/**
 * Request cache storage to use in GuzzleCache with jCache.
 *
 * @author    3liz
 * @copyright 2025 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

use Kevinrob\GuzzleCache\CacheEntry;
use Kevinrob\GuzzleCache\Storage\CacheStorageInterface;

class RequestCacheStorage implements CacheStorageInterface
{
    /**
     * @var string jCache profile
     */
    protected $profile;

    /**
     * @param string $profile the jCache profile
     */
    public function __construct(string $profile)
    {
        $this->profile = $profile;
    }

    /**
     * @param string $key
     *
     * @return null|CacheEntry the data or false
     */
    public function fetch($key)
    {
        try {
            $cache = unserialize(\jCache::get($key, $this->profile));
            if ($cache instanceof CacheEntry) {
                return $cache;
            }
        } catch (\Exception $ignored) {
            \jLog::logEx($ignored, 'error');

            return null;
        }

        return null;
    }

    /**
     * @param string     $key
     * @param CacheEntry $data
     *
     * @return bool
     */
    public function save($key, $data)
    {
        try {
            $lifeTime = $data->getTTL();
            if ($lifeTime === 0) {
                return \jCache::set(
                    $key,
                    serialize($data),
                    null,
                    $this->profile
                );
            }
            if ($lifeTime > 0) {
                return \jCache::set(
                    $key,
                    serialize($data),
                    $lifeTime,
                    $this->profile
                );
            }
        } catch (\Exception $ignored) {
            // No fail if we can't save it the storage
            \jLog::logEx($ignored, 'error');
        }

        return false;
    }

    /**
     * @param string $key
     *
     * @return bool
     */
    public function delete($key)
    {
        return \jCache::delete($key, $this->profile);
    }
}
