<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use Lizmap\CliHelpers\RepositoryCreator;
use Lizmap\Request\Proxy;
use LizmapAdmin\RepositoryRightsService;
use LizmapApi\Credentials;
use LizmapApi\Error;
use LizmapApi\RestApiCtrl;
use LizmapApi\Utils;

class repository_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves repository information and rights based on the provided parameters.
     * If a specific repository is requested, detailed information and user rights are returned.
     * Otherwise, a list of available repositories and their basic information is returned.
     *
     * @return object a JSON response object containing repository or repositories data and rights if applicable
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        if ($this->param('repo') != null) {
            $rep = $this->getRepoDetail($rep);
        } else {
            $rep = $this->getRepoList($rep);
        }

        return $rep;
    }

    /**
     * Return a list of available repositories and their basic information.
     *
     * @param jResponseJson $rep response to fill
     *
     * @return object a JSON response object containing repositories
     */
    protected function getRepoList($rep)
    {
        $listRepo = lizmap::getRepositoryList();

        $response = array();

        for ($i = 0; $i < count($listRepo); ++$i) {
            $repo = lizmap::getRepository($listRepo[$i]);
            $response[] = array(
                'key' => $repo->getKey(),
                'label' => $repo->getLabel(),
                'path' => Utils::getLastPartPath($repo->getOriginalPath()),
            );
        }
        $rep->data = $response;

        return $rep;
    }

    /**
     * Return detailed information and user rights.
     *
     * @param jResponseJson $rep response to fill
     *
     * @return object a JSON response object containing a specific repository with rights
     */
    protected function getRepoDetail($rep)
    {
        try {
            $repo = lizmap::getRepository($this->param('repo'));

            if ($repo == null) {
                throw new Exception("Valid repository is needed", 404);
            }

            $referer = $this->request->header('Referer');

            $rights = RepositoryRightsService::getRights($repo->getKey());

            $response = array(
                'key' => $repo->getKey(),
                'label' => $repo->getLabel(),
                'path' => Utils::getLastPartPath($repo->getOriginalPath()),
                'allowUserDefinedThemes' => $repo->allowUserDefinedThemes(),
                'accessControlAllowOrigin' => $repo->getACAOHeaderValue($referer),
                'rightsGroup' => $rights,
            );
        } catch (Throwable $e) {
            return Error::setError($rep, $e->getCode());
        }
        $rep->data = $response;

        return $rep;
    }

    /**
     * Handles the creation of a repository based on provided parameters.
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

        if (lizmap::getRepository($repo)) {
            return Error::setError($rep, 400, "The repository '{$repo}' already exists.");
        }

        return $this->createRepo($rep);
    }

    /**
     * Creates a new repository with the specified parameters.
     *
     * @param object $rep the response object to populate with the repository creation result
     *
     * @return object the updated response object containing the creation status
     *                and repository details if successful, or an error message if failed
     */
    public function createRepo($rep): object
    {
        $repoCreator = new RepositoryCreator();

        $key = $this->param('repo');
        $label = $this->param('label');
        $path = $this->param('path');
        $allowUserDefinedThemes = $this->param('allowUserDefinedThemes', null);

        try {
            $isCreated = $repoCreator->create($key, $label, $path, $allowUserDefinedThemes);

            $rep->data = array(
                'key' => $key,
                'label' => $label,
                'path' => $path,
                'allowUserDefinedThemes' => $allowUserDefinedThemes,
                'isCreated' => $isCreated,
            );

            $rep->setHttpStatus(
                201,
                Proxy::getHttpStatusMsg(201),
            );

        } catch (Exception $e) {
            return Error::setError($rep, 400, $e->getMessage());
        }

        return $rep;
    }
}
