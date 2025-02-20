<?php

use Lizmap\CliHelpers\RepositoryWMSChecker;

/**
 * @author    your name
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license    All rights reserved
 */
class projectCtrl extends jControllerCmdLine
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
        'load' => array(
            'nb' => true,
        ),
    );

    /**
     * Help.
     */
    public $help = array(
        'load' => 'Create repository
    parameters:
        nb             the number of loading iteration on each project
    Use:
        php lizmap/scripts/script.php lizmap~project:load nb
        ',
    );

    public function load()
    {
        /** @var jResponseCmdline $rep */
        $rep = $this->getResponse(); // cmdline response by default
        $rep->addContent("Using this command is deprecated, all commands are now unified in console.php
        In lizmap folder, use 'php console.php project:load'\n\n");

        $nb = (int) $this->param('nb');
        if (!$nb || $nb < 1) {
            $rep->addContent("The number of loading iteration on each project has to be a number > 0!\n");
            $rep->setExitCode(1);

            return $rep;
        }
        $checker = new RepositoryWMSChecker();
        $checker->checkAllRepository($nb, function ($str) use ($rep) { $rep->addContent($str."\n"); });

        return $rep;
    }
}
