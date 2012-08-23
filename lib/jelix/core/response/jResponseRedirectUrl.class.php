<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Laurent Jouanneau
* @contributor Loic Mathaud (fix bug)
* @copyright   2005-2010 Laurent Jouanneau, 2007 Loic Mathaud
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* Response To redirect to an URL
* @package  jelix
* @subpackage core_response
* @see jResponse
*/

final class jResponseRedirectUrl extends jResponse {
    protected $_type = 'redirectUrl';

    /**
     * full url to redirect
     * @var string
     */
    public $url = '';
    
    /**
     * true if it is a temporary redirection
     * @var boolean
     */
    public $temporary = true;

    /**
     * set the url with the referer URL
     * @return boolean true if there is a referer URL
     * @since 1.0
     */
    public function toReferer($defaultUrl='') {
        if(isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER'] != '') {
            $this->url = $_SERVER['HTTP_REFERER'];
            return true;
        }
        else {
            $this->url = $defaultUrl;
            return false;
        }
    }

    public function output(){
        if ($this->url =='')
            throw new jException('jelix~errors.repredirect.empty.url');
        if($this->temporary)
            $this->setHttpStatus(303, 'See Other');
        else
            $this->setHttpStatus(301, 'Moved Permanently');
        $this->sendHttpHeaders();
        header ('Location: '.$this->url);
        return true;
    }
}
