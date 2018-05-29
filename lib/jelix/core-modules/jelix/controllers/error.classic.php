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
        $rep = $this->getResponse('html', true);
        $rep->bodyTpl = 'jelix~404.html';
        $rep->setHttpStatus('404', 'Not Found');

        return $rep;
    }

    /**
    * 403 error page
    * @since 1.0.1
    */
    public function badright() {
        $rep = $this->getResponse('html', true);
        $rep->bodyTpl = 'jelix~403.html';
        $rep->setHttpStatus('403', 'Forbidden');

        return $rep;
    }
}

