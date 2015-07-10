<?php
/**
* @package      jelix
* @subpackage   tests
* @author       Laurent Jouanneau
* @copyright    2012 Laurent Jouanneau
* @link         http://jelix.org
* @licence      MIT
*/

namespace jelix\FakeServerConf;

/**
 * simulate a server configured with apache + mod_php
 */
class ApacheMod extends FakeServerConf {

    public function setHttpRequest($url, $method='get', $body='', $bodyContentType='application/x-www-form-urlencoded') {
        parent::setHttpRequest($url, $method, $body, $bodyContentType);
        if (isset($_SERVER['PATH_INFO'])) {
            $_SERVER['PATH_TRANSLATED'] = $_SERVER["DOCUMENT_ROOT"].ltrim($_SERVER['PATH_INFO'], '/');
        }
    }
}
