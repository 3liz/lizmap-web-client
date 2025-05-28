<?php

namespace Lizmap\CliHelpers;

use Lizmap\Request\Proxy;

class RepositoryWMSChecker
{
    public function checkAllRepository(int $checkCount, $outputCallback)
    {
        $svc = \lizmap::getServices();
        $repositories = \lizmap::getRepositoryList();
        if (!is_callable($outputCallback)) {
            throw new \Exception('output Callback not callable');
        }
        foreach ($repositories as $repoName) {
            $outputCallback('Enter the repository '.$repoName);
            $lrep = $svc->getLizmapRepository($repoName);
            // Get projects metadata
            $metadata = $lrep->getProjectsMetadata();
            foreach ($metadata as $meta) {
                $projectName = $meta->getId();
                $outputCallback('Get the project '.$projectName);
                // Get params
                $params = array(
                    'map' => $meta->getMap(),
                    'service' => 'WMS',
                    'request' => 'GetCapabilities',
                );

                $url = Proxy::constructUrl($params, \lizmap::getServices());

                $nb_500 = 0;
                $nb_400 = 0;
                $nb_success = 0;

                $i = 0;
                while ($i < $checkCount) {
                    // Get remote data
                    list($data, $mime, $code) = Proxy::getRemoteData($url);
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
                    $outputCallback($nb_500.' request(s) return error 500 for the project '.$meta->getId());
                } elseif ($nb_400) {
                    $outputCallback($nb_400.' request(s) return error 400 for the project '.$meta->getId());
                } else {
                    $outputCallback($nb_success.' request(s) return success for the project '.$meta->getId());
                }
            }
        }
    }
}
