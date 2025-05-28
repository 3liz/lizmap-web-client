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
class actionConfig
{
    private $status = false;
    private $errors = array();
    private $config;
    public $oldConfigConversionDone = false;

    public function __construct($repository, $project)
    {
        $this->status = false;

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

        // Test if action file is found
        $action_path = $lproj->getQgisPath().'.action';
        if (!file_exists($action_path)) {
            return;
        }

        // Parse config
        $config = jFile::read($action_path);
        $this->config = json_decode($config);
        if ($this->config === null) {
            return;
        }

        // Convert old configuration (generated for LWC < 3.7)
        if (is_object($this->config)) {
            $this->convertOldConfig();
            $this->oldConfigConversionDone = true;
        }

        // Get config
        $this->status = true;
    }

    /**
     * Convert an old "action" configuration (generated for LWC < 3.7)
     * into the new format (array of actions instead of array of layers).
     *
     * @return array The new configuration
     */
    public function convertOldConfig()
    {
        $config = $this->config;
        $newConfig = array();
        foreach ($config as $layerId => $actions) {
            foreach ($actions as $action) {
                $action->scope = 'feature';
                $action->layers = array($layerId);
                $newConfig[] = $action;
            }
        }
        $this->config = $newConfig;

        return $newConfig;
    }

    public function getConfig()
    {
        return $this->config;
    }

    /**
     * Get an action from the configuration.
     *
     * @param string $actionName The action short name
     * @param string $layerId    The Layer ID (optional)
     *
     * @return null|object The action for this layer
     */
    public function getAction($actionName, $layerId = null)
    {
        foreach ($this->config as $action) {
            // Skip the actions with another name
            if ($action->name != $actionName) {
                continue;
            }

            // Return the action if no layer ID is given
            if (empty($layerId)) {
                return $action;
            }

            // Return the action corresponding to the given layer ID
            if (property_exists($action, 'layers') && in_array($layerId, $action->layers)) {
                return $action;
            }
        }

        return null;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Get the project actions
     * corresponding to the given scope.
     *
     * @param string $scope - The scope of the action: project, layer or feature
     *
     * @return array $actions - The corresponding actions
     */
    public function getActionsByScope($scope = 'project')
    {
        $actions = array();
        foreach ($this->config as $action) {
            if ($action->scope == $scope) {
                $actions[] = $action;
            }
        }

        return $actions;
    }
}
