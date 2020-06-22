<?php
/**
* @package     jacl2
* @author      Laurent Jouanneau
* @copyright   2020 Laurent Jouanneau
* @link        https://jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
* @since 1.1
*/

/**
 * interface for jAcl2 drivers
 * @package jelix
 * @subpackage acl
 * @since 1.6.29
 */
interface jIAcl2Driver2 extends jIAcl2Driver {

    /**
     * Says if there is a right on the given subject (and on the optional resource)
     * for the given user
     *
     * @param string $login  the user login. Can be empty/null if anonymous
     * @param string $subject the key of the subject
     * @param string $resource the id of a resource
     * @return boolean true if the right exists
     */
    public function getRightByUser($login, $subject, $resource=null);

}
