<?php
/**
 * @author       Laurent Jouanneau <laurent@jelix.org>
 * @copyright    2018 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

namespace Jelix\JCommunity;


class Account {
    
    const STATUS_PWD_CHANGED = 3;
    const STATUS_MAIL_CHANGED = 2;
    const STATUS_VALID = 1;
    const STATUS_NEW = 0;
    const STATUS_DEACTIVATED = -1;
    const STATUS_DELETED = -2;

}