<?php

use Lizmap\Project\UnknownLizmapProjectException;

/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class filterConfig
{
    private $status = false;
    private $errors = array();
    private $repository;
    private $project;
    private $lproj;
    private $config;

    public function __construct($repository, $project)
    {
        // The repository and the project are mandatory
        if ($repository === null || $project === null) {
            $this->errors = array(
                'status' => 'error',
                'code' => 400,
                'title' => 'Invalid Query Parameter',
                'detail' => 'The repository and project parameters are mandatory',
            );

            return;
        }

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                $this->errors = array(
                    'status' => 'error',
                    'code' => 404,
                    'title' => 'Invalid Query Parameter',
                    'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                );

                return;
            }
        } catch (UnknownLizmapProjectException $e) {
            $this->errors = array(
                'status' => 'error',
                'code' => 404,
                'title' => 'Invalid Query Parameter',
                'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
            );

            return;
        }

        // Check acl
        if (!$lproj->checkAcl()) {
            $this->errors = array(
                'status' => 'error',
                'code' => 403,
                'title' => 'Access Denied',
                'detail' => jLocale::get('view~default.repository.access.denied'),
            );

            return;
        }

        // Filter config may be an empty array
        // This means no layers have been set up with the filter by form tool
        // BUT : we still need to return data so that other tools can use the filter methods
        // Ex: timemanager uses the getMinAndMaxValues method of the service controller
        $filterConfig = $lproj->getFormFilterLayersConfig();
        $this->repository = $repository;
        $this->project = $project;
        $this->lproj = $lproj;
        $this->status = true;
        $this->config = $filterConfig;
    }

    public function getConfig()
    {
        return $this->config;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
