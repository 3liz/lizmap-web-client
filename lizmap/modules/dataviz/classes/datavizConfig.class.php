<?php
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
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                $this->errors = array(
                    'title' => 'Invalid Query Parameter',
                    'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
                );

                return;
            }
        } catch (UnknownLizmapProjectException $e) {
            $this->errors = array(
                'title' => 'Invalid Query Parameter',
                'detail' => 'The lizmap project '.strtoupper($project).' does not exist !',
            );

            return;
        }

        // Check acl
        if (!$lproj->checkAcl()) {
            $this->errors = array(
                'title' => 'Access Denied',
                'detail' => jLocale::get('view~default.repository.access.denied'),
            );

            return;
        }

        // Get config
        $datavizConfig = $lproj->getDatavizLayersConfig();
        if (!$datavizConfig) {
            $this->errors = array(
                'title' => 'Dataviz Configuration not found',
                'detail' => 'No dataviz configuration has been found for this project',
            );

            return;
        }

        if (empty($datavizConfig['layers'])) {
            $this->errors = array(
                'title' => 'Dataviz Configuration: empty layers',
                'detail' => 'No layers dataviz configuration has been found for this project',
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
