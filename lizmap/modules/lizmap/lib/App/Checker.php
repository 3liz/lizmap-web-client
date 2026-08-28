<?php

namespace Lizmap\App;

use Lizmap\Project\Project;

class Checker
{
    /**
     * Check if credentials of the user are correct.
     *
     * @param array $serverVars Server variables, including authentication details
     *
     * @return bool True if
     *              * no BASIC authentication is needed
     *              * authentication is OK with login & password from $_SERVER variable
     *              False otherwise if $_SERVER login & password are incorrect
     */
    public static function checkCredentials($serverVars)
    {
        if (isset($serverVars['PHP_AUTH_USER'])) {
            return \jAuth::login($serverVars['PHP_AUTH_USER'], $serverVars['PHP_AUTH_PW']);
        }

        return true;
    }

    /**
     * Check if the user has access to the WFS service.
     *
     * @param Project $project The Lizmap project
     *
     * @return bool true if the user has access to the WFS service
     */
    public static function checkWfsAccessAcl($project)
    {
        $appContext = $project->getAppContext();
        if (!$appContext->aclCheck('lizmap.tools.layer.export', $project->getRepository()->getKey())) {
            $requestHeaders = \jApp::coord()->request->headers();
            if (!isset($_SESSION['html_map_token'])
                || $_SESSION['html_map_token'] !== $appContext->buildMapToken()) {
                return false;
            }
        }

        return true;
    }
}
