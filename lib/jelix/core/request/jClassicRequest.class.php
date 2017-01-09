<?php
/**
* @package     jelix
* @subpackage  core_request
* @author      Laurent Jouanneau
* @contributor Yoan Blanc, Julien Issler
* @copyright   2005-2017 Laurent Jouanneau, 2008 Yoan Blanc, 2016-2017 Julien Issler
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
        $this->params = jUrl::getEngine()->parseFromRequest($this, $_GET)->params;

        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            // when no content type or for known content-type,
            // let's get parameters from $_POST
            if (!isset($_SERVER['CONTENT_TYPE']) ||
                strpos($_SERVER['CONTENT_TYPE'], 'application/x-www-form-urlencoded') === 0 ||
                strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') === 0
            ) {
                $this->params = array_merge($this->params, $_POST);
                return;
            }
        }

        // for any REQUEST method other than GET (PUT, unknown content type for POST, etc...)
        $data = $this->readHttpBody();
        if (is_string($data)) {
            $this->params['__httpbody'] = $data;
        } else {
            $this->params = array_merge($this->params, $data);
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
