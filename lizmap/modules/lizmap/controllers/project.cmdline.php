<?php

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
        $rep = $this->getResponse(); // cmdline response by default

        $nb = (int) $this->param('nb');
        if (!$nb || $nb < 1) {
            $rep->addContent("The number of loading iteration on each project has to be a number > 0!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        $repositories = lizmap::getRepositoryList();
        foreach ($repositories as $r) {
            $rep->addContent('Enter the repository '.$r."\n");
            $lrep = lizmap::getRepository($r);
            $lprojects = $lrep->getProjects();

            foreach ($lprojects as $p) {
                $rep->addContent('Get the project '.$p->getData('id')."\n");
                // Get params
                $params = array(
                    'map' => $p->getRelativeQgisPath(),
                    'service' => 'WMS',
                    'request' => 'GetCapabilities',
                );

                $url = \Lizmap\Request\Proxy::constructUrl($params, lizmap::getServices());

                $nb_500 = 0;
                $nb_400 = 0;
                $nb_success = 0;

                $i = 0;
                while ($i < $nb) {
                    // Get remote data
                    list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($url);
                    if (floor($code / 100) >= 5) {
                        ++$nb_500;
                    } elseif (floor($code / 100) >= 4) {
                        ++$nb_400;
                    } else {
                        ++$nb_success;
                    }
                    ++$i;
                }
                if ($nb_500) {
                    $rep->addContent($nb_500.' request(s) return error 500 for the project '.$p->getData('id')."\n");
                } elseif ($nb_400) {
                    $rep->addContent($nb_400.' request(s) return error 400 for the project '.$p->getData('id')."\n");
                } else {
                    $rep->addContent($nb_success.' request(s) return success for the project '.$p->getData('id')."\n");
                }
            }
        }

        return $rep;
    }
}
