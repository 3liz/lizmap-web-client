<?php
/**
* @package     jelix-modules
* @subpackage  jelix-module
* @author      Loic Mathaud
* @contributor Christophe Thiriot
* @copyright   2006 Loic Mathaud
* @copyright   2008 Christophe Thiriot
* @licence     http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

/**
 * @package    jelix-modules
 * @subpackage jelix-module
 */
class helpCtrl extends jControllerCmdLine {
    protected $allowed_options = array(
            'index' => array());

    protected $allowed_parameters = array(
            'index' => array('cmd_name' => false));

    /**
    *
    */
    public function index() {

        $rep = $this->getResponse();

        $cmd_name = $this->param('cmd_name');

        if (empty($cmd_name)) {
            $rep->addContent("
General purpose:
    php cmdline.php help [COMMAND]

    COMMAND : name of the command to launch
               'module~controller:action' or more simply
               'controller:action' or 'action', depending of the app configuration
");
        } else {
            if (!preg_match('/(?:([\w\.]+)~)/', $cmd_name)) {
                $cmd_name = jApp::config()->startModule.'~'.$cmd_name;
            }
            $selector = new jSelectorAct($cmd_name);

            include($selector->getPath());
            $ctrl = $selector->getClass();
            $ctrl = new $ctrl(null);
            $help = $ctrl->help;

            $rep->addContent("
Use of the command ". $selector->method ." :
");
            if (isset($help[$selector->method]) && $help[$selector->method] !='') {
                $rep->addContent($help[$selector->method]."\n\n");
            } else {
                $rep->addContent("\tNo availabled help for this command\n\n");
            }
        }
        return $rep;
    }
}
