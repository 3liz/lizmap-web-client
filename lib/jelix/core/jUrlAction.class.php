<?php
/**
* @package     jelix
* @subpackage  core_url
* @author      Laurent Jouanneau
* @copyright   2005-2008 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * A container to store url data for an action
 * @package  jelix
 * @subpackage core_url
 */
class jUrlAction extends jUrlBase {

    /**
     * the request type
     * @var string
     */
    public $requestType='';

    /**
     * constructor...
     */
    function __construct ($params=array(),$request=''){
        $this->params=$params;
        if($request == ''){
            $this->requestType = jApp::coord()->request->type;
        }
        else
            $this->requestType = $request;
    }

    /**
     * get the url string corresponding to the action
     * @param boolean $forxml  true: some characters will be escaped
     * @return string
     */
    public function toString($forxml = false){
        return $this->toUrl()->toString($forxml);
    }

    /**
     * get the jUrl object corresponding to the action
     * @return jUrl
     */
    public function toUrl() {
        return jUrl::getEngine()->create($this);
    }
}

