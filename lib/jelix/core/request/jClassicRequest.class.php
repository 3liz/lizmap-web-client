<?php
/**
* @package     jelix
* @subpackage  core_request
* @author      Laurent Jouanneau
* @contributor Yoan Blanc
* @copyright   2005-2011 Laurent Jouanneau, 2008 Yoan Blanc
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * handle "classical" request
 * it just gets parameters from the url query and the post content. And responses can
 * be in many format : text, html, xml...
 * @package     jelix
 * @subpackage  core_request
 */
class jClassicRequest extends jRequest {

    public $type = 'classic';

    public $defaultResponseType = 'html';

    protected function _initParams(){

        $url  = jUrl::getEngine()->parseFromRequest($this, $_GET);

        if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
            $_PUT = $this->readHttpBody();
            if (is_string($_PUT))
                $this->params['__httpbody'] = $_PUT;
            else
                $this->params = array_merge($url->params, $_PUT);
        }
        else {
            $this->params = array_merge($url->params, $_POST);
        }
    }

    /**
     * @return jResponse
     */
    public function getErrorResponse($currentResponse) {
        // fatal error, we should output errors
        if ($this->isAjax()) {
            if ($currentResponse)
                $resp = $currentResponse;
            else {
                require_once(JELIX_LIB_CORE_PATH.'response/jResponseText.class.php');
                $resp = new jResponseText();
            }
        }
        else if (isset($_SERVER['HTTP_ACCEPT']) && strstr($_SERVER['HTTP_ACCEPT'],'text/html')) {
            require_once(JELIX_LIB_CORE_PATH.'response/jResponseBasicHtml.class.php');
            $resp  = new jResponseBasicHtml();
        }
        elseif($currentResponse) {
            $resp = $currentResponse;
        }
        else {
            try {
                $resp = $this->getResponse('', true);
            }
            catch(Exception $e) {
                require_once(JELIX_LIB_CORE_PATH.'response/jResponseBasicHtml.class.php');
                $resp = new jResponseBasicHtml();
            }
        }
        return $resp;
    }

    /**
     * @param jResponse $response the response
     * @return boolean true if the given class is allowed for the current request
     */
    public function isAllowedResponse($response){
        return true;
    }
}
