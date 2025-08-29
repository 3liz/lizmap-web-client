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
use LizmapApi\LizmapRights;
use LizmapApi\RestApiCtrl;

class rights_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves all the rights used in Lizmap Web Client.
     * If 'repo' is defined, it retrieves rights on a specific repository.
     *
     * @return object The response object containing data or an error message
     *
     * @throws Exception
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
        if (!jAcl2::check('lizmap.admin.repositories.view')
            || !jAcl2::check('lizmap.admin.repositories.update')
        ) {
            return Error::setError($rep, 403);
        }

        $locale = $this->param('locale', null);

        $resp = array();

        foreach (LizmapRights::getLWCRights() as $right => $label) {
            $resp[$right] = LizmapRights::getLabel($label, $locale);
        }

        $rep->data = $resp;

        return $rep;
    }
}
