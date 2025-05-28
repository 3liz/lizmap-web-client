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
class datavizConfig
{
    private $status = false;
    private $errors = array();
    private $config;

    public function __construct($repository, $project)
    {
        try {
            $lizmapProject = lizmap::getProject($repository.'~'.$project);
            if (!$lizmapProject) {
                $this->errors = array(
                    'code' => 404,
                    'error_code' => 'project_not_found',
                    'title' => jLocale::get('dataviz~dataviz.log.project_not_found.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.project_not_found.detail', array($project, $repository)),
                );

                return;
            }
        } catch (UnknownLizmapProjectException $e) {
            $this->errors = array(
                'code' => 404,
                'error_code' => 'project_not_found',
                'title' => jLocale::get('dataviz~dataviz.log.project_not_found.title'),
                'detail' => jLocale::get('dataviz~dataviz.log.project_not_found.detail', array($project, $repository)),
            );

            return;
        }

        // Check acl
        if (!$lizmapProject->checkAcl()) {
            $this->errors = array(
                'code' => 403,
                'error_code' => 'access_denied',
                'title' => jLocale::get('dataviz~dataviz.log.access_denied.title'),
                'detail' => jLocale::get('dataviz~dataviz.log.access_denied.detail'),
            );

            return;
        }

        // Get config
        $datavizConfig = $lizmapProject->getDatavizLayersConfig();
        if (!$datavizConfig) {
            $this->errors = array(
                'code' => 404,
                'error_code' => 'no_configuration',
                'title' => jLocale::get('dataviz~dataviz.log.no_configuration.title'),
                'detail' => jLocale::get('dataviz~dataviz.log.no_configuration.detail'),
            );

            return;
        }

        if (empty($datavizConfig['layers'])) {
            $this->errors = array(
                'code' => 404,
                'error_code' => 'no_layers',
                'title' => jLocale::get('dataviz~dataviz.log.no_layers.title'),
                'detail' => jLocale::get('dataviz~dataviz.log.no_layers.detail'),
            );

            return;
        }

        $this->status = true;
        $this->config = $datavizConfig;
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
