<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use Lizmap\App\VersionTools;
use LizmapApi\ApiException;
use LizmapApi\Credentials;
use LizmapApi\Error;
use LizmapApi\RestApiCtrl;

class project_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves project information based on the provided parameters.
     * If a specific project is requested, detailed information are returned.
     * Otherwise, a list of available project and their basic information is returned.
     *
     * @return object a JSON response object containing project data
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        try {
            $repo = lizmap::getRepository($this->param('repo'));

            if ($repo == null) {
                throw new ApiException("The repository doesn't exist.", 404);
            }
        } catch (ApiException $e) {
            return Error::setError($rep, $e->getCode(), $e->getMessage());
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, 500, $e->getMessage());
        }

        if ($this->param('proj') != null) {
            $rep = $this->getProjDetail($rep, $repo);
        } else {
            $rep = $this->getProjList($rep, $repo);
        }

        return $rep;
    }

    /**
     * Return a list of available projects and their basic information.
     *
     * @param jResponseJson    $rep  response to fill
     * @param lizmapRepository $repo repository
     *
     * @return object a JSON response object containing projects
     */
    protected function getProjList($rep, $repo)
    {
        $projs = $repo->getProjectsMainData();

        $response = array();

        foreach ($projs as $proj) {
            $response[] = array(
                'id' => $proj->getId(),
                'title' => $proj->getTitle(),
                'abstract' => $proj->getAbstract(),
            );
        }
        $rep->data = $response;

        return $rep;
    }

    /**
     * Return detailed information and user rights.
     *
     * @param jResponseJson    $rep  response to fill
     * @param lizmapRepository $repo repository
     *
     * @return object a JSON response object containing a specific repository with rights
     */
    protected function getProjDetail($rep, $repo)
    {
        try {
            $proj = $repo->getProject($this->param('proj'));
            $projInfos = $proj->getFirstQgisConfigLine();
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, 500, $e->getMessage());
        }

        $response = array(
            'id' => $proj->getKey(),
            'projectName' => $projInfos['projectName'],
            'title' => $proj->getTitle(),
            'abstract' => $proj->getAbstract(),
            'keywordList' => $proj->getKeywordsList(),
            'proj' => $proj->getProj(),
            'bbox' => $proj->getBbox(),
            'needsUpdateError' => $proj->needsUpdateError(),
            'acl' => $proj->checkAcl(),
            'wmsGetCapabilitiesUrl' => $proj->getWMSGetCapabilitiesUrl(),
            'wmtsGetCapabilitiesUrl' => $proj->getWMTSGetCapabilitiesUrl(),
            'version' => $projInfos['version'],
            'saveDateTime' => $projInfos['saveDateTime'],
            'saveUser' => $projInfos['saveUser'],
            'saveUserFull' => $projInfos['saveUserFull'],
        );

        $rep->data = $response;

        return $rep;
    }
}
