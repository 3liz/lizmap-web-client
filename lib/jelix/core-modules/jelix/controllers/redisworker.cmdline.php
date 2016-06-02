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
        
        if (get_class($redisPlugin) != 'redisCacheDriver') {
            $rep->addContent("Error, wrong profile. Not a redis cache.\n");
            $this->setExitCode(1);
            return $rep;
        }
        $rep->addContent("--- Starting worker...\n");
        $redis = $redisPlugin->getRedis();
        while(true) {
            $prefixKey = $redis->lpop('jcacheredisdelkeys');
            if (!$prefixKey) {
                sleep(1);
                continue;
            }
            $rep->addContent("flush $prefixKey\n");
            $redis->flushByPrefix($prefixKey);
        }
        return $rep;
    }

    public function deljkvdb() {
        $rep = $this->getResponse();

        $redisDriver = jKvDb::getConnection($this->param('profile'));
        
        if (get_class($redisDriver) != 'redisKVDriver') {
            $rep->addContent("Error, wrong profile. Not a redis jKvDb driver.\n");
            $this->setExitCode(1);
            return $rep;
        }
        $rep->addContent("--- Starting worker...\n");
        $redis = $redisPlugin->getRedis();
        while(true) {
            $prefixKey = $redis->lpop('jkvdbredisdelkeys');
            if (!$prefixKey) {
                sleep(1);
                continue;
            }
            $rep->addContent("flush $prefixKey\n");
            $redis->flushByPrefix($prefixKey);
        }

        return $rep;
    }
}