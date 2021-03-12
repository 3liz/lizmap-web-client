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

        $services = lizmap::getServices();
        $wmsServerURL = $services->wmsServerURL;

        $repositories = lizmap::getRepositoryList();
        foreach ($repositories as $r) {
            $rep->addContent('Enter the repository '.$r."\n");
            $lrep = lizmap::getRepository($r);

            // Get projects metadata
            $metadata = $lrep->getProjectsMetadata();
            foreach ($metadata as $meta) {
                $rep->addContent('Get the project '.$meta->getId()."\n");
                // Get params
                $params = array(
                    'map' => $meta->getMap(),
                    'service' => 'WMS',
                    'request' => 'GetCapabilities',
                );

                // Build http params
                $bparams = http_build_query($params);

                // Replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
                $a = array('+', '_', '.', '-');
                $b = array('%20', '%5F', '%2E', '%2D');
                $bparams = str_replace($a, $b, $bparams);

                // Get URL
                $url = $wmsServerURL.'?'.$bparams;

                $nb_500 = 0;
                $nb_400 = 0;
                $nb_success = 0;

                $i = 0;
                while ($i < $nb) {
                    // Get remote data
                    list($data, $mime, $code) = lizmapProxy::getRemoteData($url);
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
                    $rep->addContent($nb_500.' request(s) return error 500 for the project '.$meta->getId()."\n");
                } elseif ($nb_400) {
                    $rep->addContent($nb_400.' request(s) return error 400 for the project '.$meta->getId()."\n");
                } else {
                    $rep->addContent($nb_success.' request(s) return success for the project '.$meta->getId()."\n");
                }
            }
        }

        return $rep;
    }
}
