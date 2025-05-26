<?php

namespace LizmapApi;

use lizmap;

/**
 * This class acts on paths in Lizmap.
 */
class LizmapPaths
{
    /**
     * Retrieves the paths from the root repository.
     *
     * @return array the paths available and reserved
     *
     * @throws ApiException
     */
    public static function getPaths(): array
    {
        $rootRepositories = \lizmap::getServices()->getRootRepositories();

        if ($rootRepositories == '') {
            throw new ApiException('No root repository found.', 404);
        }

        if (!str_ends_with($rootRepositories, '/')) {
            $rootRepositories .= '/';
        }

        $listDirectory = scandir($rootRepositories);

        $allLizmapRepo = \lizmap::getRepositoryList();

        $listPathRepo = array();
        foreach ($allLizmapRepo as $repo) {
            $listPathRepo[] = Utils::getLastPartPath(\lizmap::getRepository($repo)->getOriginalPath());
        }

        $response = array();

        foreach ($listDirectory as $repo) {
            if ($repo == '.' or $repo == '..') {
                continue;
            }
            if (!is_dir($rootRepositories.$repo)) {
                continue;
            }
            if ($repo == 'media') {
                $response[$repo.'/'] = 'Reserved';

                continue;
            }
            $info = 'Available';
            if (in_array($repo.'/', $listPathRepo)) {
                $info = 'Reserved';
            }
            $response[$repo.'/'] = $info;
        }

        return $response;
    }
}
