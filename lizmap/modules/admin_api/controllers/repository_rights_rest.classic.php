<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use LizmapAdmin\RepositoryRightsService;
use LizmapApi\ApiException;
use LizmapApi\Credentials;
use LizmapApi\Error;
use LizmapApi\RestApiCtrl;
use LizmapApi\Utils;

class repository_rights_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves all the rights used in a specific Lizmap Web Client repository.
     * Labels are display depending on the local chosen ones.
     *
     * @return object The response object containing data or an error message
     *
     * @throws Exception
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        try {
            $rep->data = $this->getRepoRights();
        } catch (ApiException $e) {
            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }

    /**
     * Return rights to a specific repository.
     *
     * @return array Response array containing rights on a specific repository
     *
     * @throws ApiException
     */
    protected function getRepoRights(): array
    {
        $repo = lizmap::getRepository($this->param('repo'));

        if ($repo == null) {
            throw new ApiException("The repository doesn't exist !", 404);
        }

        return RepositoryRightsService::getRights($repo->getKey());
    }

    /**
     * Adds a specific right for a group to a repository.
     *
     * @return object the response object containing the details of the operation,
     *                or an error message if the operation fails
     */
    public function post(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        $key = $this->param('repo');
        $group = $this->param('group');
        $right = $this->param('right');

        try {
            Utils::verifyVars($group, $right, $key);
        } catch (ApiException $e) {
            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        $isAdded = false;

        try {
            $isAdded = jAcl2DbManager::addRight($group, $right, $key);
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, 500, $e->getMessage());
        }

        $rep->data = array(
            'key' => $key,
            'group' => $group,
            'right' => $right,
            'isAdded' => $isAdded,
        );

        return $rep;
    }

    /**
     * Removes a specific right for a group to a repository.
     *
     * @return object the response object containing the details of the operation,
     *                or an error message if the operation fails
     */
    public function delete(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Credentials::handle()) {
            return Error::setError($rep, 401);
        }

        $key = $this->param('repo');
        $group = $this->param('group');
        $right = $this->param('right');

        try {
            Utils::verifyVars($group, $right, $key);
        } catch (ApiException $e) {
            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        $isRemoved = false;

        try {
            jAcl2DbManager::removeRight($group, $right, $key);
            // removeRight() has no return not like addRight()
            $isRemoved = true;
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, 500, $e->getMessage());
        }

        $rep->data = array(
            'key' => $key,
            'group' => $group,
            'right' => $right,
            'isRemoved' => $isRemoved,
        );

        return $rep;
    }
}
