<?php
/**
* @package    jelix
* @subpackage auth
* @author     Laurent Jouanneau
* @contributor Loic Mathaud, Julien Issler
* @copyright  2006-2007 Laurent Jouanneau
* @copyright  2007 Julien Issler
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * default object to represent a user
 *
 * this is only a data container. In fact, auth drivers can provide
 * other object to embed user data.
 * @package    jelix
 * @subpackage auth
 */
abstract class jAuthUser {
    public $login = '';
    public $email ='';
}

