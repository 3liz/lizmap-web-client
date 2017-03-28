<?php
/**
* @package     jelix-modules
* @subpackage  jelix
* @author      Laurent Jouanneau
* @copyright   2016 Laurent Jouanneau
* @licence     http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

/**
 * @package    jelix-modules
 * @subpackage jelix
 */
class redisworkerCtrl extends jControllerCmdLine {
    protected $allowed_options = array(
            'deljcache' => array(),
            'deljkvdb' => array(),
            );

    protected $allowed_parameters = array(
            'deljcache' => array('profile' => true),
            'deljkvdb' => array('profile' => true),
            );

    public function deljcache() {
        $rep = $this->getResponse();

        $redisPlugin = jCache::getDriver($this->param('profile'));
        
        if (get_class($redisPlugin) != 'redis_phpCacheDriver' && get_class($redisPlugin) != 'redis_extCacheDriver') {
            $rep->addContent("Error, wrong profile. Not a redis cache.\n");
            $rep->setExitCode(1);
            return $rep;
        }
        $rep->addContent("--- Starting worker...\n");
        $redis = $redisPlugin->getRedis();

        if (get_class($redisPlugin) == 'redis_phpCacheDriver') {
            $this->deletionLoop('jcacheredisdelkeys', $rep, $redis, false);
        }
        else if (get_class($redisPlugin) == 'redis_extCacheDriver') {
            $this->deletionLoop('jcacheredisdelkeys', $rep, $redis, true);
        }
        return $rep;
    }

    protected function deletionLoop($key, $rep, $redis, $isExt) {
        while(true) {
            if ($isExt) {
                $prefixKey = $redis->lPop($key);
            }
            else {
                $prefixKey = $redis->lpop($key);
            }

            if (!$prefixKey) {
                sleep(1);
                continue;
            }
            $rep->addContent("flush $prefixKey\n");
            $redis->flushByPrefix($prefixKey);
        }
    }

    public function deljkvdb() {
        $rep = $this->getResponse();

        $redisDriver = jKvDb::getConnection($this->param('profile'));
        
        if (get_class($redisDriver) != 'redis_phpKVDriver' && get_class($redisDriver) != 'redis_extKVDriver') {
            $rep->addContent("Error, wrong profile. Not a redis jKvDb driver.\n");
            $rep->setExitCode(1);
            return $rep;
        }
        $rep->addContent("--- Starting worker...\n");
        $redis = $redisDriver->getRedis();
        if (get_class($redisDriver) == 'redis_phpKVDriver') {
            $this->deletionLoop('jkvdbredisdelkeys', $rep, $redis, false);
        }
        else if (get_class($redisDriver) == 'redis_extKVDriver') {
            $this->deletionLoop('jkvdbredisdelkeys', $rep, $redis, true);
        }
        return $rep;
    }
}