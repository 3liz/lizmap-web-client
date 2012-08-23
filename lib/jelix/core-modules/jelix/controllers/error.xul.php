<?php
/**
* @package    jelix-modules
* @subpackage jelix
* @author     Laurent Jouanneau
* @copyright  2006 Laurent Jouanneau
* @licence    http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

/**
 * @package    jelix-modules
 * @subpackage jelix
 */
class errorCtrl extends jController {

    /**
    * 404 error page
    */
    public function notfound() {
        $rep = $this->getResponse('xul', true);
        $rep->bodyTpl = 'jelix~404.xul';
        $rep->setHttpStatus('404', 'Not Found');

        return $rep;
    }
}
