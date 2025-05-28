<?php

namespace Lizmap\CliHelpers;

use Lizmap\Project\Repository;

class RepositoryCreator
{
    public function create($key, $label, $path, $allowUserDefinedThemes = null)
    {
        $lizServices = \lizmap::getServices();

        $lrep = \lizmap::getRepository($key);
        if ($lrep) {
            throw new \Exception('The repository already exists!');
        }

        // Repository data
        $data = array('label' => $label,
            'path' => $path,
            'allowUserDefinedThemes' => $allowUserDefinedThemes,
        );
        foreach (Repository::getProperties() as $prop) {
            // Check paths
            if ($prop == 'path') {
                $path = $data[$prop];
                // Testing relative path and updating it if needed
                if ($path[0] != '/' and $path[1] != ':') {
                    // Get services data

                    $rootRepositories = $lizServices->getRootRepositories();
                    if ($rootRepositories != '') {
                        if (!preg_match('#/$#', $rootRepositories)) {
                            $rootRepositories .= '/';
                        }
                        $npath = realpath($rootRepositories.$path);
                        if (substr($npath, 0, strlen($rootRepositories)) !== $rootRepositories) {
                            // Error message
                            throw new \Exception('The path provided is not authorized !');
                        }
                        $path = $npath;
                    }
                }
                if (!file_exists($path) or !is_dir($path)) {
                    throw new \Exception("The path provided doesn't exist or is not a directory !");
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
                    if ($strVal === 'true' || $strVal === 't' || intval($value) === 1
                        && $strVal === 'on' || $strVal === '1' || $value === true) {
                        $data[$prop] = true;
                    } else {
                        $data[$prop] = false;
                    }
                }
            }
        }

        $lrep = \lizmap::createRepository($key, $data);
        if (!$lrep) {
            throw new \Exception("repository can't be created !");
        }

        return true;
    }
}
