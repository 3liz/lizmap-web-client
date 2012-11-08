<?php
/**
* @package    jelix
* @subpackage coord_plugin
* @author     Florian Lonqueu-Brochard
* @copyright  2012 Florian Lonqueu-Brochard
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/



class traceexecCoordPlugin implements jICoordPlugin {

    public $config;


    function __construct($conf){
        $this->config = $conf;
    }


    public function beforeAction($params){


        if(isset($params['traceexec.log_session']))
            $this->config['log_session'] = $params['traceexec.log_session'];


        if(isset($params['traceexec.enabled']))
            $this->config['enable_trace'] = $params['traceexec.enabled'];


        if(isset($this->config['enable_trace']) && $this->config['enable_trace'] == true) {

            $coord = jApp::coord();

            $moduleName = $coord->moduleName;
            $actionName = $coord->actionName;


            $message = $moduleName . '~' . $actionName ;

            //Url
            $message .= "\nUrl : ".$_SERVER['REQUEST_URI'];

            //Module & action
            $message .= "\nModule : ".$moduleName;
            $message .= "\nAction : ".$actionName;


            //Params
            $r_params = $coord->request->params;
            unset($r_params['module']);
            unset($r_params['action']);

            if(empty($r_params)) {
                $message .= "\nNo params";
            }
            else {
                $message .= "\nParams : ".var_export($r_params, true);
            }

            //Session
            if (isset($this->config['log_session']) && $this->config['log_session'] == true) {
                $message .= "\nSession : ".var_export($_SESSION, true);
            }

            $message .= "\n";
            jLog::log($message, 'trace');
        }
    }


    public function beforeOutput(){}


    public function afterProcess (){}
}
