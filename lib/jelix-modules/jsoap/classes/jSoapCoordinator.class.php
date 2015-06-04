<?php
/**
* @package      jelix
* @subpackage   core
* @author       Sylvain de Vathaire
* @contributor  Laurent Jouanneau
* @copyright    2008 Sylvain DE VATHAIRE, 2008-2012 Laurent Jouanneau
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Specialisation of the main class of the jelix core for soap purpose
 *
 * @package  jelix
 * @subpackage core
 * @see jCoordinator
 */
class jSoapCoordinator extends jCoordinator {

    /**
     * WSDL utility object
     * @var jWSDL
     */
    public $wsdl;

    /**
     * Soap server reference
     * @var SoapServer
     */
    protected $soapServer;

    /**
     * Intercept the soapServer method call in order to handle the call thrue the process method
     * Return php variables, the soap server will transform it in a soap response
     */
    public function processSoap(){
        $this->wsdl = new jWSDL($this->request->params['module'], $this->request->params['action']);

        $this->soapServer = $this->getSoapServer($this->wsdl);
        $this->soapServer->setclass('jSoapHandler', $this);
        $this->soapServer->handle($this->request->soapMsg);
    }

    /**
     * Init and return the soap server
     * Use wsdl mode or not depending of the wsdl object param
     * @param jWsdl $wsdl
     * @return SoapServer
     */
    public function getSoapServer($wsdl = null){

        if(is_null($this->soapServer)){
            if(is_null($wsdl)){
                $this->soapServer = new SoapServer(null, array('soap_version' => SOAP_1_1, 'encoding' => jApp::config()->charset, 'uri' => $_SERVER['PHP_SELF']));
            }else{
                $this->soapServer = new SoapServer($wsdl->getWSDLFilePath(), array('soap_version' => SOAP_1_1, 'encoding' => jApp::config()->charset));
            }
        }
        return $this->soapServer;
    }
}


/**
* Handler for soap extension call
* @package  jelix
* @subpackage core_response
*/
class jSoapHandler {

    /**
    * Coordinator
    * @var jSoapCoordinator
    */
    protected $coord;


    function __construct($coordinator) {
        $this->coord = $coordinator;
    }

    /**
     * Intercept the soapServer method call in order to handle the call thrue the process method oj the coordinator
     * @param string $soapOperationName Soap operation name (ie action name)
     * @param array $soapArgsSoap Params for the operation
     * @return mixed data, the soap server will transform it in a soap response
     * Use of reflexion thrue jWSDL in order to map arg array to action params
     */
    function __call($soapOperationName,$soapArgs){

       $this->coord->request->params['action'] .= ':'.$soapOperationName;

       $operationParams = $this->coord->wsdl->getOperationParams($soapOperationName);
       foreach(array_keys($operationParams) as $i=>$paramName){
           $this->coord->request->params[$paramName] = $soapArgs[$i];
       }
        $this->coord->process($this->coord->request);
        $response = $this->coord->response;
        if (($c = get_class($response)) == 'jResponseRedirect'
                || $c == 'jResponseRedirectUrl')
            return null;
        return $this->coord->response->data;
    }
}
