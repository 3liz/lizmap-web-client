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

namespace Presentation;

use Lizmap\Project\UnknownLizmapProjectException;

class PresentationConfig
{
    private $status = false;
    private $errors = array();
    private $repository = false;
    private $project = false;

    public function __construct($repository, $project)
    {
        // Setup Lizmap repository & project
        $this->repository = $repository;
        $this->project = $project;

        // First check the rights to use the Presentation module
        if (!\jAcl2::check('lizmap.presentation.usage', $repository) && !\jAcl2::check('lizmap.presentation.edit', $repository)) {
            $this->errors = array(
                array(
                    'title' => 'No right to use the presentation module',
                    'detail' => 'The given user cannot use the presentation module !',
                ),
            );

            return false;
        }

        try {
            $lizmapProject = \lizmap::getProject($repository.'~'.$project);
            if (!$lizmapProject) {
                $this->errors = array(
                    array(
                        'title' => 'Invalid Query Parameter',
                        'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                    ),
                );

                return false;
            }
        } catch (UnknownLizmapProjectException $e) {
            $this->errors = array(
                array(
                    'title' => 'Invalid Query Parameter',
                    'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                ),
            );

            return false;
        }

        // Check acl on Lizmap project
        if (!$lizmapProject->checkAcl()) {
            $this->errors = array(
                array(
                    'title' => 'Access Denied',
                    'detail' => \jLocale::get('view~default.repository.access.denied'),
                ),
            );

            return false;
        }

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
