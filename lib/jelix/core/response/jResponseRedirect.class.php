<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @contributor Aubanel Monnier (patch for anchor)
* @contributor Loic Mathaud (fix bug)
* @contributor Afroxav (bug fix)
* @copyright   2005-2010 Laurent Jouanneau,  2007 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* Response To redirect to an action
* @package  jelix
* @subpackage core_response
* @see jResponse
*/

final class jResponseRedirect extends jResponse {
    /**
    * @var string
    */
    protected $_type = 'redirect';

    /**
     * selector of the action where you want to redirect.
     * jUrl will be used to get the real url
     * @var string
     */
    public $action = '';

    /**
     * the anchor you want to add to the final url. leave blank if you don't one.
     * @since 1.0b2
     */
    public $anchor ='';

    /**
     * parameters for the action/url
     */
    public $params = array();

    /**
     * true if it is a temporary redirection
     * @var boolean
     */
    public $temporary = true;

    public function output(){
        if($this->temporary)
            $this->setHttpStatus(303, 'See Other');
        else
            $this->setHttpStatus(301, 'Moved Permanently');
        $this->sendHttpHeaders();
        header ('Location: '.jUrl::get($this->action, $this->params).($this->anchor!='' ? '#'.$this->anchor:''));
        return true;
    }

}
