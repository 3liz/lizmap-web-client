<?php
/**
 * @package   lizmap
 * @subpackage admin_api
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 * @link      https://3liz.com
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use LizmapApi\ErrorHttp;
use LizmapAdmin\RepositoryRightsService;
use Lizmap\CliHelpers\RepositoryCreator;
use Lizmap\App\Checker;

class restCtrl extends jController implements jIRestController {

    public $pluginParams = array(
        '*'=>array('auth.required'=>false),
    );

    /**
     * Retrieves repository information and rights based on the provided parameters.
     * If a specific repository is requested, detailed information and user rights are returned.
     * Otherwise, a list of available repositories and their basic information is returned.
     *
     * @return object A JSON response object containing repository or repositories data and rights if applicable.
     */
    function get(){

        $rep = $this->getResponse('json');

        if (!$this->handleCredentials($rep)) {
            return $rep;
        }

        if ($this->param('repo') != null) {
            $repo = lizmap::getRepository($this->param('repo'));

            $referer = $this->request->header('Referer');

            $cnx = jDb::getConnection('jacl2_profile');

            $rights = RepositoryRightsService::getRights($cnx, $repo->getKey());

            $response = array(
                'key' => $repo->getKey(),
                'label' => $repo->getLabel(),
                'path' => $this->getRelativePath($repo->getOriginalPath()),
                'allowUserDefinedThemes' => $repo->getData('allowUserDefinedThemes'),
                'accessControlAllowOrigin' => $repo->getACAOHeaderValue($referer),
                'rightsGroup' => $rights,
            );
        } else {
            $listRepo = lizmap::getRepositoryList();

            $response = array();

            for ($i = 0; $i < count($listRepo); $i++) {
                $repo = lizmap::getRepository($listRepo[$i]);
                $response[] = array(
                    'key' => $repo->getKey(),
                    'label' => $repo->getLabel(),
                    'path' => $this->getRelativePath($repo->getOriginalPath()),
                );
            }
        }

        $rep->data = $response;

        return $rep;
    }

    /**
     * Extracts and returns the relative path from a given path.
     *
     * @param string $path The directory path to process.
     * @return string The relative portion of the path, formatted with a trailing slash.
     */
    protected function getRelativePath($path)
    {
        $array = explode('/', $path);
        $length = count($array);

        // Sometimes paths doesn't end with a '/'
        if ($array[$length - 1] == '') {
            return $array[$length - 2] . '/';
        } else {
            return $array[$length - 1] . '/';
        }
    }

    /**
     * Handles the creation of a new repository based on provided parameters.
     *
     * @return object A JSON response object containing the repository details and a success flag indicating if the repository was successfully created.
     */
    function post(){
        $rep = $this->getResponse('json');

        if (!$this->handleCredentials($rep)) {
            return $rep;
        }

        $repoCreator = new RepositoryCreator();

        $key = "anotherrepo"; //$this->param('repo');
        $label = "Another Repo"; //$this->param('label');
        $path = "/home/neo/Documents/testing_project"; //$this->param('path');
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
        } catch (Exception $e) {
            $rep->data = array(
                'error' => 'Repository creation failed',
                'message' => $e->getMessage(),
            );
        }
        return $rep;
    }

    function put(){
        $rep = $this->getResponse('json');

        return ErrorHttp::setError($rep);
    }

    function delete(){
        $rep = $this->getResponse('json');

        return ErrorHttp::setError($rep);
    }

    /**
     * Validates the user's credentials and updates the response object in case of failure.
     *
     * @param object $rep The response object to be updated with an error message if validation fails.
     * @return bool True if the credentials are valid, false otherwise.
     */
    protected function handleCredentials($rep): bool
    {
        $ok = Checker::checkCredentials($_SERVER);

        if (!$ok) {
            $rep->data = array(
                'error' => 'Unauthorized',
                'message' => 'You do not have the necessary credentials to access this resource.'
            );
        }
        return $ok;
    }
}
