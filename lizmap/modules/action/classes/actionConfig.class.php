<?php

use Lizmap\App\AppContextInterface;
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

        // Remove actions when the current user is not allowed to see and run
        $this->filterConfigByUser($lproj->getAppContext());

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

    /**
     * Filter the project actions against the current user login and groups.
     *
     * An action can be restricted with two optional properties:
     * - lizmap_user_groups: the list of the allowed ACL group ids
     * - lizmap_user: the list of the allowed user logins
     *
     * If none of them is set (or if they are empty), the action is visible
     * by everybody. Otherwise the action is kept only if the user is a member
     * of one of the given groups OR if their login is in the given logins.
     *
     * These properties are always removed from the configuration: they must
     * never be sent to the web browser.
     *
     * @param AppContextInterface $appContext The application context
     */
    protected function filterConfigByUser(AppContextInterface $appContext)
    {
        // Get the user login and groups
        // Same behaviour as for the print layouts Lizmap\Project\Project::getUpdatedConfig()
        $userGroups = array('');
        $userLogin = 'anonymous';
        if ($appContext->userIsConnected()) {
            $userGroups = $appContext->aclUserGroupsId();
            $userLogin = $appContext->getUserSession()->login;
        }

        $allowedActions = array();
        foreach ($this->config as $action) {
            if ($this->checkActionAcl($action, $userLogin, $userGroups)) {
                $allowedActions[] = $action;
            }
            // Do not expose the ACL configuration to the client
            unset($action->lizmap_user_groups, $action->lizmap_user);
        }
        $this->config = $allowedActions;
    }

    /**
     * Check the current user is allowed to see and run the given action.
     *
     * @param object   $action     The action configuration object
     * @param string   $userLogin  The current user login
     * @param string[] $userGroups The current user ACL groups
     *
     * @return bool True if the action must be kept
     */
    protected function checkActionAcl($action, $userLogin, $userGroups)
    {
        $allowedGroups = $this->getAclProperty($action, 'lizmap_user_groups');
        $allowedLogins = $this->getAclProperty($action, 'lizmap_user');

        // No restriction at all: the action is public
        if (empty($allowedGroups) && empty($allowedLogins)) {
            return true;
        }

        // The user is a member of one of the allowed groups
        if (array_intersect($allowedGroups, $userGroups)) {
            return true;
        }

        // The user login has been explicitly allowed
        if (in_array($userLogin, $allowedLogins)) {
            return true;
        }

        return false;
    }

    /**
     * Read an ACL property of an action and normalize it
     * into a trimmed list of strings.
     *
     * The property can be given as an array or as a comma separated string,
     * as done for the "allowed_groups" property of the print layouts.
     *
     * @param object $action   The action configuration object
     * @param string $property The property name
     *
     * @return string[] The normalized list, empty if the property is not set
     */
    protected function getAclProperty($action, $property)
    {
        if (!property_exists($action, $property) || empty($action->{$property})) {
            return array();
        }

        $values = $action->{$property};
        if (!is_array($values)) {
            $values = explode(',', $values);
        }

        return array_values(array_filter(array_map('trim', $values)));
    }
}
