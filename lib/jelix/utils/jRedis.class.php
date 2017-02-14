<?php
/**
 * @package     jelix
 * @subpackage  utils
 * @author      Laurent Jouanneau
 * @copyright   2016-2017 Laurent Jouanneau
 * @link        http://jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * extends the class Redis from the phpredis extension
 *
 * @package     jelix
 * @subpackage  utils
 */
class jRedis extends \Redis
{
    /**
     * delete some keys starting by the given prefix
     *
     * *Warning*: use it with caution. This method could
     * consume huge processing time. It is not recommanded to use it
     * during a php request if there are chance that it will delete
     * thousand keys. In this case, prefer to launch it in a separate
     * process (for example in a worker launched by a messaging system like
     * RabbitMQ, Resque..)
     *
     * @param string $prefix
     * @param integer $maxKeyToDeleteByIter the number of keys that are deleted at each iteration
     *               To avoid memory issue it deleted keys by
     *               pack of $maxKeyToDeleteByIter key.
     *               You can change the default number,
     *               depending of the memory that the process can use.
     *               and the length of keys
     *               $maxKeyToDeleteByIter = maxmemory/(average key length+140)
     */
    public function flushByPrefix($prefix, $maxKeyToDeleteByIter = 3000) {
        $end = false;
        // to avoid memory issue, we will delete only $maxKeyToDeleteByIter
        // at the same time
        while(!$end) {
            $nextIndex = null;
            // in this array, be sure it does not contain duplicate keys.
            // According to SCAN specification, it may return some keys
            // several time. We should not delete the same key
            // several time.
            $keysToDelete = array();

            while ($nextIndex !== 0) {
                if ($nextIndex == -1) {
                    $nextIndex = 0;
                }
                $response = $this->scan($nextIndex, $prefix.'*');
                if ($response === false) {
                    $end = true;
                    break;
                }
                foreach($response as $key) {
                    if (!isset($keysToDelete[$key])) {
                        $keysToDelete[$key] = true;
                    }
                }
                $end = ($nextIndex === 0);
                if (count($keysToDelete)>= $maxKeyToDeleteByIter) {
                    $nextIndex = 0;
                }
            }
            foreach($keysToDelete as $key => $v) {
                $this->delete($key);
            }
        }
    }

}