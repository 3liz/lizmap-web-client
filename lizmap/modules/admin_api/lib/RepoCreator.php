<?php

namespace LizmapApi;

class RepoCreator
{
    protected static $regexWindowsAbsolutePath = '/^[A-Z][:][\/][a-zA-Z0-9_\/]+/';
    protected static $regexLinuxAbsolutePath = '/^[\/][a-zA-Z0-9_\/]+/';
    protected static $regexFolderName = '/^[a-zA-Z0-9_]+$/';

    /**
     * Creates a new repository with the given properties.
     *
     * @param string $key                    The unique identifier for the repository. Must not yet exist.
     * @param string $label                  the display name of the repository
     * @param string $path                   the path to the repository directory
     * @param bool   $allowUserDefinedThemes whether user-defined themes are allowed for the repository
     * @param bool   $createDirectory        whether to create the repository directory
     *
     * @return bool returns true if the repository is successfully created
     *
     * @throws ApiException if the repository creation fails
     */
    public static function createRepository(
        string $key,
        string $label,
        string $path,
        bool $allowUserDefinedThemes,
        bool $createDirectory
    ): bool {
        if (\lizmap::getRepository($key)) {
            throw new ApiException("The repository '{$key}' already exists.", 409);
        }

        if (!$label) {
            throw new ApiException('The repository label is not set.', 400);
        }

        if (!$path) {
            throw new ApiException('The repository path is not set.', 400);
        }

        $data = array(
            'label' => $label,
            'path' => $path,
            'allowUserDefinedThemes' => $allowUserDefinedThemes,
        );

        $rootRepositories = \lizmap::getServices()->getRootRepositories();

        if ($rootRepositories == '' and $createDirectory) {
            throw new ApiException(
                'The root repository folder is not set on this instance,
                 it is not possible to create a folder on the file system without this setting.',
                403
            );
        }

        try {
            $path = self::pathValidator($path, $rootRepositories);
        } catch (ApiException $e) {
            throw new ApiException($e->getMessage(), $e->getCode());
        }

        if (!is_dir($path)) {
            if ($createDirectory) { // Root Repo is filled
                $oldUmask = umask(0002);
                $isCreated = mkdir($path, 0775, false);
                umask($oldUmask);
                if (!$isCreated) {
                    throw new ApiException("Unable to create directory '{$path}'", 500);
                }
            } else {
                throw new ApiException(
                    "The path provided doesn't exist or is not a directory ! ",
                    404
                );
            }
        } elseif ($createDirectory) {
            throw new ApiException(
                'The directory you want to create already exists ! ',
                409
            );
        }

        $listPaths = LizmapPaths::getPaths();

        if ($listPaths[Utils::getLastPartPath($path)] == 'Reserved') {
            throw new ApiException(
                'The path you provided is already reserved for a repository !',
                409
            );
        }

        $data['path'] = $path;

        $data['allowUserDefinedThemes'] = Utils::isValidBooleanValue($allowUserDefinedThemes);

        $repo = \lizmap::createRepository($key, $data);
        if (!$repo) {
            throw new ApiException("Repository can't be created !", 500);
        }

        return true;
    }

    /**
     * Tests and validates a path to create a repository.
     *
     * @param string $path     The path to validate. It can be a relative or absolute path.
     * @param string $rootRepo the root repository directory used as a base for paths
     *
     * @return string Returns the path
     *
     * @throws ApiException If the path is incorrect
     */
    public static function pathValidator(string $path, string $rootRepo): string
    {
        if ($rootRepo == '') {  // createDirectory = false
            if (
                !preg_match(self::$regexWindowsAbsolutePath, $path)   // WINDOWS
                and !preg_match(self::$regexLinuxAbsolutePath, $path)         // LINUX
            ) {
                throw new ApiException(
                    "The path provided is not authorized as there's no root repository !",
                    400
                );
            }
        } else {
            if (str_starts_with($path, '/') or str_starts_with($path, '.')) {
                throw new ApiException(
                    "The path provided is not authorized because there's a root repository !",
                    400
                );
            }

            $path = trim($path, '/');

            if (!preg_match(self::$regexFolderName, $path)) {
                throw new ApiException(
                    'The path provided is not authorized ! It needs to be a single repository.',
                    400
                );
            }

            if (!str_ends_with($rootRepo, '/')) {
                $rootRepo .= '/';
            }
            $path = $rootRepo.$path;
        }

        if (!str_ends_with($path, '/')) {
            $path .= '/';
        }

        return $path;
    }
}
