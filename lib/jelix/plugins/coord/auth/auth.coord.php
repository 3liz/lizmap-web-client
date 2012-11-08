<?php
/**
* @package    jelix
* @subpackage coord_plugin
* @author     Gérald Croes
* @contributor  Laurent Jouanneau, Frédéric Guillot, Antoine Detante, Julien Issler
* @copyright  2001-2005 CopixTeam, 2005-2011 Laurent Jouanneau, 2007 Frédéric Guillot, 2007 Antoine Detante
* @copyright  2007 Julien Issler
*
* This class was get originally from an experimental branch of the Copix project
* (PluginAuth, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix classes are Gerald Croes and Laurent Jouanneau,
* and this class was adapted for Jelix by Laurent Jouanneau
*
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 */
require(JELIX_LIB_PATH.'auth/jAuth.class.php');
require(JELIX_LIB_PATH.'auth/jAuthDummyUser.class.php');

/**
* @package    jelix
* @subpackage coord_plugin
*/
class AuthCoordPlugin implements jICoordPlugin {
    public $config;

    function __construct($conf){
        $this->config = $conf;

        if (!isset($this->config['session_name'])
            || $this->config['session_name'] == ''){
            $this->config['session_name'] = 'JELIX_USER';
        }
    }

    /**
     * @param    array  $params   plugin parameters for the current action
     * @return null or jSelectorAct  if action should change
     */
    public function beforeAction ($params){
        $notLogged = false;
        $badip = false;
        $selector = null;
        // Check if auth cookie exist and user isn't logged on
        if (isset($this->config['persistant_enable']) && $this->config['persistant_enable'] && !jAuth::isConnected()) {
            if (isset($this->config['persistant_cookie_name']) && isset($this->config['persistant_crypt_key'])) {
                $cookieName = $this->config['persistant_cookie_name'];
                if (isset($_COOKIE[$cookieName]['auth']) && strlen($_COOKIE[$cookieName]['auth'])>0) {
                    $decrypted = jCrypt::decrypt($_COOKIE[$cookieName]['auth'],$this->config['persistant_crypt_key']);
                    $decrypted = @unserialize($decrypted);
                    if ($decrypted && is_array($decrypted)) {
                        list($login, $password) = $decrypted;
                        jAuth::login($login,$password);
                    }
                }
                if (isset($_COOKIE[$cookieName]['login'])) {
                    // destroy deprecated cookies
                    setcookie($cookieName.'[login]', '', time() - 3600, $this->config['persistant_cookie_path']);
                    setcookie($cookieName.'[passwd]', '', time() - 3600, $this->config['persistant_cookie_path']);
                }
            }
            else {
                throw new jException('jelix~auth.error.persistant.incorrectconfig','persistant_cookie_name, persistant_crypt_key');
            }
        }
        //Do we check the ip ?
        if ($this->config['secure_with_ip']){
            if (! isset ($_SESSION['JELIX_AUTH_SECURE_WITH_IP'])){
                $_SESSION['JELIX_AUTH_SECURE_WITH_IP'] = $this->_getIpForSecure ();
            }else{
                if (($_SESSION['JELIX_AUTH_SECURE_WITH_IP'] != $this->_getIpForSecure ())){
                    session_destroy ();
                    $selector = new jSelectorAct($this->config['bad_ip_action']);
                    $notLogged = true;
                    $badip = true;
                }
            }
        }

        //Creating the user's object if needed
        if (! isset ($_SESSION[$this->config['session_name']])){
            $notLogged = true;
            $_SESSION[$this->config['session_name']] = new jAuthDummyUser();
        }else{
            $notLogged = ! jAuth::isConnected();
        }
        if(!$notLogged && $this->config['timeout']){
            if(isset($_SESSION['JELIX_AUTH_LASTTIME'])){
                if((time() - $_SESSION['JELIX_AUTH_LASTTIME'] )> ($this->config['timeout'] *60)){
                    $notLogged = true;
                    jAuth::logout();
                    unset($_SESSION['JELIX_AUTH_LASTTIME']);
                }else{
                    $_SESSION['JELIX_AUTH_LASTTIME'] = time();
                }
            }else{
                $_SESSION['JELIX_AUTH_LASTTIME'] = time();
            }
        }
        $needAuth = isset($params['auth.required']) ? ($params['auth.required']==true):$this->config['auth_required'];
        $authok = false;

        if($needAuth){
            if($notLogged){
                if(jApp::coord()->request->isAjax() || $this->config['on_error'] == 1
                    || !jApp::coord()->request->isAllowedResponse('jResponseRedirect')){
                    throw new jException($this->config['error_message']);
                }else{
                    if(!$badip){
                        $auth_url_return = jApp::coord()->request->getParam('auth_url_return');
                        if($auth_url_return === null)
                            jApp::coord()->request->params['auth_url_return'] = jUrl::getCurrentUrl();
                        $selector= new jSelectorAct($this->config['on_error_action']);
                    }
                }
            }else{
                $authok= true;
            }
        }else{
          $authok= true;
        }

        return $selector;
    }


    public function beforeOutput(){}

    public function afterProcess (){}

    /**
    * Getting IP informations of the user
    * @return string
    * @access private
    */
    private function _getIpForSecure (){
        $toReturn = $_SERVER['REMOTE_ADDR']. '|'.gethostbyaddr($_SERVER['REMOTE_ADDR']);
        if (isset ($_SERVER['HTTP_X_FORWARDED_FOR']))
            $toReturn .= '|'.$_SERVER['HTTP_X_FORWARDED_FOR'];
        return $toReturn;
    }
}
