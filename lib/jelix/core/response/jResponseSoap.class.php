<?php
/**
* @package     jelix
* @subpackage  core_response
* @author      Sylvain de Vathaire
* @contributor Laurent Jouanneau
* @copyright   2008 Sylvain de Vathaire, 2009-2010 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* Response for soap web services
* @package  jelix
* @subpackage core_response
* @see jResponse
*/
final class jResponseSoap extends jResponse {
    /**
    * @var string
    */
    protected $_type = 'soap';

    /**
     * PHP data you want to return
     * @var mixed
     */
    public $data = null;


    public function output(){
        return true;
    }

    public function outputErrors(){
        global $gJCoord, $gJConfig;
 
        $e = $gJCoord->getErrorMessage();
        if ($e) {
            $errorCode = $e->getCode();
            if ($errorCode > 5000)
                $errorMessage = $e->getMessage();
            else
                $errorMessage = $gJCoord->getGenericErrorMessage();
        }
        else {
            $errorCode = -1;
            $errorMessage = $gJCoord->getGenericErrorMessage();
        }

        //soapFault param have to be UTF-8 encoded (soapFault seems to not use the encoding param of the SoapServer)
        if($gJConfig->charset != 'UTF-8'){
            $errorCode  = utf8_encode($errorCode);
            $errorMessage = utf8_encode($errorMessage);
        }
        $soapServer = $gJCoord->getSoapServer();
        $soapServer->fault($errorCode, $errorMessage);
    }
}
