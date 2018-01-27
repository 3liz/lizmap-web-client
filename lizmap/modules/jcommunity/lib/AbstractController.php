<?php
/**
* @package      jcommunity
* @author       Laurent Jouanneau <laurent@jelix.org>
* @copyright    2015 Laurent Jouanneau
* @link         http://jelix.org
* @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/
namespace Jelix\JCommunity;

class AbstractController extends \jController {

    protected $configMethodCheck = '';

    protected $config;
    
    function __construct ($request){
        parent::__construct($request);
        $this->config = new Config();
    }

    protected function _check() {
        if ($this->configMethodCheck) {
            $method = $this->configMethodCheck;
            if (!$this->config->$method()) {
                return $this->notavailable();
            }
        }
        if (\jAuth::isConnected()) {
            return $this->noaccess();
        }
        return null;
    }

    protected function _getjCommunityResponse() {
        $response = 'html';
        if (isset(\jApp::config()->jcommunity)) {
            $conf = \jApp::config()->jcommunity;
            $response = (isset($conf['loginResponse'])?$conf['loginResponse']:'html');
        }
        return $this->getResponse($response);
    }

    protected function noaccess() {
        $rep = $this->_getjCommunityResponse();
        $rep->setHttpStatus(403, "Forbidden");
        $tpl = new \jTpl();
        $rep->body->assign('MAIN',$tpl->fetch('no_access'));
        return $rep;
    }

    protected function notavailable() {
        $rep = $this->_getjCommunityResponse();
        $rep->setHttpStatus(404, "Not found");
        $tpl = new \jTpl();
        $rep->body->assign('MAIN',$tpl->fetch('not_available'));
        return $rep;
    }

}