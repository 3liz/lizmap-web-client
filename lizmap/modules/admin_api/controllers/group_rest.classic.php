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

class group_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves the group rights from the ACL manager and returns the response object.
     *
     * @return object the response object containing group rights data or error details
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // User must be authenticated with BASIC auth
        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        // Check rights
        if (!jAcl2::check('acl.group.view')) {
            return Error::setError($rep, 403);
        }

        try {
            $manager = new jAcl2DbAdminUIManager();
            $groups = $manager->getGroupRights();
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, 500, $e->getMessage());
        }

        $rep->data = $groups['groups'];

        return $rep;
    }
}
