<?php
/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class presentationConfig
{
    private $status = false;
    private $errors = array();
    private $repository;
    private $project;

    public function __construct($repository, $project)
    {
        try {
            $lizmapProject = lizmap::getProject($repository.'~'.$project);
            if (!$lizmapProject) {
                $this->errors = array(
                    array(
                        'title' => 'Invalid Query Parameter',
                        'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                    ),
                );

                return false;
            }
        } catch (\Lizmap\Project\UnknownLizmapProjectException $e) {
            $this->errors = array(
                array(
                    'title' => 'Invalid Query Parameter',
                    'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                ),
            );

            return false;
        }

        // Check acl
        if (!$lizmapProject->checkAcl()) {
            $this->errors = array(
                array(
                    'title' => 'Access Denied',
                    'detail' => jLocale::get('view~default.repository.access.denied'),
                ),
            );

            return false;
        }

        $this->repository = $repository;
        $this->project = $project;
        $this->status = true;
    }

    /**
     * Get the status.
     *
     * @return bool Status of the configuration for the given project
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Get the errors.
     *
     * @return array
     */
    public function getErrors()
    {
        return $this->errors;
    }
}
