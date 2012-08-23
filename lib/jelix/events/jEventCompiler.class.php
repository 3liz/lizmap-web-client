<?php
/**
* @package     jelix
* @subpackage  events
* @author      Laurent Jouanneau
* @copyright 2005-2006 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 * @package     jelix
 * @subpackage  events
 */
class jEventCompiler implements jIMultiFileCompiler {

    private $eventList;

    function __construct(){
        $this->eventList = array();
    }

    public function compileItem($sourceFile, $module){
        if (is_readable ($sourceFile)){
            $xml = simplexml_load_file($sourceFile);

            if (isset ($xml->listener)){
                foreach ($xml->listener as $listener){

                    $listenerName = (string)$listener['name'];

                    foreach ($listener->event as $eventListened){
                        $name = (string) $eventListened['name'];
                        // clé = nom de l'event, valeur = liste des fichiers listener
                        $this->eventList[$name][] = array($module,$listenerName);
                    }
                }
            }
        }
        return true;
    }

    public function endCompile($cachefile){
        $content = '<?php $GLOBALS["JELIX_EVENTS"] = '.var_export($this->eventList,true).";\n?>";

        jFile::write($cachefile, $content);
    }
}

