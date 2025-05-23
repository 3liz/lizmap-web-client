<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use LizmapApi\ApiException;
use LizmapApi\Credentials;
use LizmapApi\Error;
use LizmapApi\LizmapPaths;
use LizmapApi\RestApiCtrl;

class path_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves a list of unique repository paths.
     * They are available if not already registered in a Lizmap repository.
     *
     * @return object a JSON response object containing the list of unique repository paths
     *                or an error response in case of authentication failure
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        try {
            $rep->data = LizmapPaths::getPaths();
        } catch (ApiException $e) {
            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }
}
