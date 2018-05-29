<?php
/**
* @package    jelix-modules
* @subpackage jelix-module
* @author     Laurent Jouanneau
* @copyright  2006 Laurent Jouanneau
* @licence    http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

/**
 * @package    jelix-modules
 * @subpackage jelix-module
 */
class errorCtrl extends jController {

    /**
    * 404 error page
    */
    public function notfound() {
        $rep = $this->getResponse('xmlrpc', true);
        $rep->response = array('error'=>'404 not found (wrong action)');
        $rep->setHttpStatus('404', 'Not Found');

        return $rep;
    }
}
