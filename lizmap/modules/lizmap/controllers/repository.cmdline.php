<?php
/**
 * @author    your name
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license    All rights reserved
 */
class repositoryCtrl extends jControllerCmdLine
{
    /**
     * Options to the command line
     *  'method_name' => array('-option_name' => true/false)
     * true means that a value should be provided for the option on the command line.
     */
    protected $allowed_options = array(
    );

    /**
     * Parameters for the command line
     * 'method_name' => array('parameter_name' => true/false)
     * false means that the parameter is optional. All parameters which follow an optional parameter
     * is optional.
     */
    protected $allowed_parameters = array(
        'create' => array(
            'key' => true,
            'label' => true,
            'path' => true,
            'allowUserDefinedThemes' => false,
        ),
    );

    /**
     * Help.
     */
    public $help = array(
        'create' => 'Create repository
    parameters:
        key             the repository id
        label           the repository name
        path            the repository path (absolute or relative to root repositories path
    optional prameters:
        allowUserDefinedThemes   boolean to activate the theme capabilities directly in repository
    Use:
        php lizmap/scripts/script.php lizmap~repository:create key label path [allowUserDefinedThemes]
        ',
    );

    public function create()
    {
        $rep = $this->getResponse(); // cmdline response by default

        $key = $this->param('key');

        $lrep = lizmap::getRepository($key);
        if ($lrep) {
            // Error message
            $rep->addContent("The repository already exists!\n");
            $rep->addContent("The repository can't be created!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        // Repository data
        $data = array();
        foreach (lizmap::getRepositoryProperties() as $prop) {
            $data[$prop] = $this->param($prop);
            // Check paths
            if ($prop == 'path') {
                $path = $data[$prop];
                // Testing relative path and updating it if needed
                if ($path[0] != '/' and $path[1] != ':') {
                    // Get services data
                    $services = lizmap::getServices();
                    $rootRepositories = $services->getRootRepositories();
                    if ($rootRepositories != '') {
                        if (!preg_match('#/$#', $rootRepositories)) {
                            $rootRepositories .= '/';
                        }
                        $npath = realpath($rootRepositories.$path);
                        if (substr($npath, 0, strlen($rootRepositories)) !== $rootRepositories) {
                            // Error message
                            $rep->addContent("The path provided is not authorized!\n");
                            $rep->addContent("The repository can't be created!\n");
                            $rep->setExitCode(1);

                            return $rep;
                        }
                        $path = $npath;
                    }
                }
                if (!file_exists($path) or !is_dir($path)) {
                    // Error message
                    $rep->addContent("The path provided doesn't exist or is not a directory!\n");
                    $rep->addContent("The repository can't be created!\n");
                    $rep->setExitCode(1);

                    return $rep;
                }
                // Add a trailing / if needed
                if (!preg_match('#/$#', $path)) {
                    $path .= '/';
                }
                $data[$prop] = $path;
            }
            // Check allowUserDefinedThemes
            if ($prop == 'allowUserDefinedThemes') {
                $value = $data[$prop];
                if (empty($value)) {
                    $data[$prop] = false;
                } else {
                    $strVal = strtolower($value);
                    if ($strVal === 'true' && $strVal === 't' && intval($value) === 1 &&
                        $strVal === 'on' && $strVal === '1' && $value === true) {
                        $data[$prop] = true;
                    } else {
                        $data[$prop] = false;
                    }
                }
            }
        }

        if (empty($data)) {
            // Error message
            $rep->addContent("The data is empty!\n");
            $rep->addContent("The repository can't be created!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        $lrep = lizmap::createRepository($key, $data);
        if (!$lrep) {
            $rep->addContent("The repository can't be created!\n");
            $rep->setExitCode(1);
        } else {
            $rep->addContent("The repository has been created!\n");
        }

        return $rep;
    }
}
