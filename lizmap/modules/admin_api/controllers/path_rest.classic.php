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

class path_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves a list of unique repository paths available in Lizmap.
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

        $listRepo = lizmap::getRepositoryList();

        $response = array();

        for ($i = 0; $i < count($listRepo); ++$i) {
            $repo = lizmap::getRepository($listRepo[$i]);
            $path = Utils::getLastPartPath($repo->getOriginalPath());
            if (!in_array($path, $response)) {
                $response[] = $path;
            }
        }

        $rep->data = $response;

        return $rep;
    }
}
