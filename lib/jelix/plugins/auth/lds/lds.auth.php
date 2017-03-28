<?php
/**
* @package    jelix
* @subpackage auth_driver
* @author     Nicolas JEUDY
* @contributor Laurent Jouanneau
* @copyright  2006 Nicolas JEUDY
* @copyright  2007 Laurent Jouanneau
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/


/**
 * object which represent a user
 *
 * @package    jelix
 * @subpackage auth_driver
 */
class jAuthUserLDS extends jAuthUser {
}




/**
 * authentification driver, which communicate with a LDS server
 * LDS = Linbox Directory Server
 * @package    jelix
 * @subpackage auth_driver
 * @link http://lds.linbox.org/
 * @see jAuth
 * @since 1.0b1
 */
class ldsAuthDriver implements jIAuthDriver {

    protected $_params;

    function __construct($params){
        $this->_params = $params;
    }


    public function saveNewUser($user){
        $login = $user->login;
        $pass = $user->password;
        $firstname = "Jelix User";
        $name = "Jelix User";
        // NULL homedir = /tmp ...
        $homedir = "/tmp";
        $param = array($login, $pass, $firstname, $name, $homedir);
        $this->xmlCall("base.createUser",$param);
        return true;
    }

    public function removeUser($login){
        //fichier=1 -> remove user files (homeDirectory etc)
        $fichier=0;
        $param=array ($login,$fichier);
        //ldap account can be modified from an other apps, so group can be use in an other app
        $this->xmlCall("base.delUserFromAllGroups", $login);
        $this->xmlCall("base.delUser",$param);
        return true;
    }

    public function updateUser($user){
        return true;
    }

    public function getUser($login){
        $login = '*'.$login.'*';
        $paramsArr = $this->xmlCall('base.getUsersLdap',$login);
        $user = new jAuthUserLDS();
        $user->login = $paramsArr['uid'][0];
        $user->password = $paramsArr['userPassword'][0];
        return $user;
    }

    public function createUserObject($login,$password){
        $user = new jAuthUserLDS();
        $user->login = $login;
        $user->password = $password;
        return $user;
    }

    public function getUserList($pattern){
        $users = $this->xmlCall('base.getUsersLdap',$pattern . '*');
        $userslist = array();
        foreach ($users as $userldap) {
            $user = new jAuthUserLDS();
            $user->login = $userldap['uid'];
            $userslist[] = $user;
        }
        return $userslist;
    }

    public function changePassword($login, $newpassword){
        $param[]=$login;
    	$param[]=$newpassword;
        return $this->xmlCall("base.changeUserPasswd",$param);
    }

    public function verifyPassword($login, $password){
        if (trim($password) == '')
            return false;
        $param[]=$login;
        $param[]=$password;
        $ret= $this->xmlCall("base.ldapAuth",$param);
        if ( $ret == '1') {
            $user = new jAuthUserLDS();
            $user->login = $login;
            $user->password = $password;
        }
        return ($user?$user:false);
    }

    /**
    * function wich decode UTF-8 Entity with ref &#03; for example.
    *
    * It is needed because XMLRPC server doest not like this sort
    * of encoding.
    * @param string $text the content in which the entities should be decoded
    * @return string the decoded string
    */
    protected function decodeEntities($text, $charset='UTF-8') {
        $text = html_entity_decode($text,ENT_QUOTES,"ISO-8859-1"); /* NOTE: UTF-8 does not work! */
        $text= preg_replace('/&#(\d+);/me',"chr(\\1)",$text); /* decimal notation */
        $text= preg_replace('/&#x([a-f0-9]+);/mei',"chr(0x\\1)",$text);  /* hex notation */
        return $text;
    }

    /**
     * call an xmlrpc call for a method
     * via the xmlrpc server in python (lmc-agent)
     * @param string $method name of the method
     * @param array $params array with param
     * @return mixed the value of the response returned by the call
     * @throws jException
     */
    protected function xmlCall($method,$params) {

        $output_options = array( "output_type" => "xml", "verbosity" => "pretty", "escaping" => array("markup", "non-ascii", "non-print"), "version" => "xmlrpc", "encoding" => "UTF-8" );

       //$output_options = array( "output_type" => "xml", "verbosity" => "pretty", "escaping" => array("markup", "non-ascii", "non-print"), "version" => "xmlrpc", "encoding" => "iso-8859-1" );

        if ($params==null) {
            $request = xmlrpc_encode_request($method,null,$output_options);
        }else {
            $request = xmlrpc_encode_request($method,$params,$output_options);
            $request = $this->decodeEntities($request, "UTF-8");
        }


        $host= $this->_params['host'].":".$this->_params['port'];
        $url = "/";

        $httpQuery = "POST ". $url ." HTTP/1.0\r\n";
        $httpQuery .= "User-Agent: xmlrpc\r\n";
        $httpQuery .= "Host: ". $host ."\r\n";
        $httpQuery .= "Content-Type: text/xml\r\n";
        $httpQuery .= "Content-Length: ". strlen($request) ."\r\n";
        $httpQuery .= "Authorization: Basic ".base64_encode($this->_params['login']).":".base64_encode($this->_params['password'])."\r\n\r\n";
        $httpQuery .= $request;
        $sock=null;

        // if crypted connexion
        if ($this->_params['scheme']=="https") {
            $prot="ssl://";
        }
        $sock = @fsockopen($prot.$this->_params['host'],$this->_params['port'], $errNo, $errString);

        if ( !$sock ) {
            jLog::log('Erreur de connexion XMLRPC');
            jLog::dump($prot.$this->_params['host']);
            jLog::dump($this->_params['port']);
            jLOG::dump($httpQuery);
            jLOG::dump(strlen($httpQuery));
            jLOG::dump($errNo);
            jLOG::dump($errString);
            throw new jException('jelix~auth.error.lds.unreachable.server');
        }

        if ( !fwrite($sock, $httpQuery, strlen($httpQuery)) ) {
            throw new jException('jelix~auth.error.lds.request.not.send');
        }

        fflush($sock);
        // We get the response from the server
        while ( !feof($sock) ) {
            $xmlResponse .= fgets($sock);
        }
        // Closing the connection
        fclose($sock);
    	$xmlResponse = substr($xmlResponse, strpos($xmlResponse, "\r\n\r\n") +4);
        /*
        To decode the XML into PHP, we use the (finaly a short function)
        xmlrpc_decode function. And that should've done the trick.
        We now have what ever the server function made in our $xmlResponse
        variable.

        Test if the XMLRPC result is a boolean value set to False.
        If it is the case, xmlrpc_decode will return an empty string.
	    So we need to test this special case. */

        $booleanFalse = "<?xml version='1.0'?>\n<methodResponse>\n<params>\n<param>\n<value><boolean>0</boolean></value>\n</param>\n</params>\n</methodResponse>\n";
        if ($xmlResponse == $booleanFalse)
            $xmlResponse = "0";
        else {
            $xmlResponseTmp = xmlrpc_decode($xmlResponse,"UTF-8");

            //if we cannot decode in UTF-8
            if (!$xmlResponseTmp) {
                    //conversion in UTF-8
                    $xmlResponse = iconv("ISO-8859-1","UTF-8",$xmlResponse);
                    $xmlResponse = xmlrpc_decode($xmlResponse,"UTF-8");
            } else {
                    $xmlResponse=$xmlResponseTmp;
            }
        }
        return $xmlResponse;
    }
}

