<?php

use Lizmap\CliHelpers\RepositoryCreator;

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
        /**
         * @var jResponseCmdline $rep
         */
        $rep = $this->getResponse(); // cmdline response by default
        $rep->addContent("Using this command is deprecated, all commands are now unified in console.php
In lizmap folder, use 'php console.php repository:create <key> <label> <path>'\n\n");

        try {
            $cli = new RepositoryCreator();
            $cli->create(
                $this->param('key'),
                $this->param('label'),
                $this->param('path'),
                $this->param('allowUserDefinedThemes')
            );
        } catch (Exception $e) {
            $rep->addContent("The repository can't be created ! : \n");
            $rep->addContent($e->getMessage()."\n");
            $rep->setExitCode(1);

            return $rep;
        }
        $rep->addContent("The repository has been created!\n");

        return $rep;
    }
}
