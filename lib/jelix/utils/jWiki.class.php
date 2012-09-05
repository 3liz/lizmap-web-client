<?php
/**
* @package    jelix
* @subpackage utils
* @author     Laurent Jouanneau
* @copyright  2006-2010 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * include the wikirenderer class
 */
require_once(LIB_PATH.'wikirenderer/WikiRenderer.lib.php');

/**
 * transform a wiki text into a document (html or else)
 * @package    jelix
 * @subpackage utils
 * @link http://wikirenderer.berlios.de/
 * @since 1.0b1
 */
class jWiki extends  WikiRenderer {

    function __construct( $config=null){

        if(is_string($config)){
            $f = WIKIRENDERER_PATH.'rules/'.basename($config).'.php';
            if(file_exists($f)){
                require_once($f);
                $this->config= new $config();
            }else{
                $this->config = jApp::loadPlugin($config, 'wr_rules', '.rule.php', $config);
                if (is_null($this->config))
                    throw new Exception('Rules "'.$config.'" not found for jWiki');
            }
        }elseif(is_object($config)){
            $this->config=$config;
        }else{
            require_once(WIKIRENDERER_PATH . 'rules/wr3_to_xhtml.php');
            $this->config= new wr3_to_xhtml();
        }

        $this->inlineParser = new WikiInlineParser($this->config);

        foreach($this->config->bloctags as $name){
            $this->_blocList[]= new $name($this);
        }
   }
}
