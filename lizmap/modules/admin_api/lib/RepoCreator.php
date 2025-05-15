<?php

namespace LizmapApi;

class RepoCreator
{
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
            throw new ApiException('The root repository is not set, and you want to create a directory.', 403);
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
            if (!str_starts_with($path, '/')) {
                throw new ApiException(
                    "The path provided is not authorized as there's no root repository !",
                    400
                );
            }
        } else {
            if (self::countPartSlashes($path) > 1) {
                throw new ApiException(
                    'The path provided is not authorized, it needs to be a single repository !',
                    400
                );
            }
            if (str_starts_with($path, '/') or str_starts_with($path, '.')) {
                throw new ApiException(
                    "The path provided is not authorized because there's a root repository !",
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

    /**
     * Counts the number of non-empty parts in a string separated by slashes.
     *
     * @param string $str the input string to be split and analyzed
     *
     * @return int returns the count of non-empty parts in the input string
     */
    public static function countPartSlashes(string $str): int
    {
        $list = explode('/', $str);
        $amountPart = 0;
        foreach ($list as $part) {
            if (strlen($part) > 0) {
                ++$amountPart;
            }
        }

        return $amountPart;
    }
}
