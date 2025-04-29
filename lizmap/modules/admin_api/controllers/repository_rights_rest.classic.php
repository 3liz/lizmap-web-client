<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use LizmapApi\Credentials;
use LizmapApi\Error;
use LizmapApi\RestApiCtrl;
use LizmapApi\Utils;

class repository_rights_restCtrl extends RestApiCtrl
{
    /**
     * Handles the edition of group rules on repositories.
     *
     * @return object a JSON response object
     */
    public function post(): object
    {
        $rep = $this->getResponse('json');

        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        $repo = $this->param('repo');

        if (!lizmap::getRepository($repo)) {
            return Error::setError($rep, 404, "The repository '{$repo}' doesn't exists.");
        }

        $action = $this->param('method');

        if ($action == 'add' || $action == 'remove') {
            $rep = $this->editRights($rep);
        } else {
            return Error::setError($rep, 501, "'{$action}' is not implemented.");
        }

        return $rep;
    }

    /**
     * Modifies access rights for a specified group on a repository.
     *
     * @param object $rep the JSON response object to be modified
     *
     * @return object the modified JSON response object
     */
    private function editRights(object $rep): object
    {
        $key = $this->param('repo');
        $group = $this->param('group');
        $right = $this->param('right');

        $isValid = Utils::verifyVars($group, $right, $key);

        if (!$isValid['bool']) {
            return Error::setError($rep, 400, $isValid['message']);
        }

        try {
            if ($this->param('method') == 'add') {
                jAcl2DbManager::addRight($group, $right, $key);
            } else {
                jAcl2DbManager::removeRight($group, $right, $key);
            }
        } catch (Exception $e) {
            return Error::setError($rep, 400, $e->getMessage());
        }

        $rep->data = array(
            'key' => $key,
            'group' => $group,
            'right' => $right,
        );

        return $rep;
    }
}
