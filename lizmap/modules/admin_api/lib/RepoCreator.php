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
     * @param string $allowUserDefinedThemes whether user-defined themes are allowed for the repository
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
        string $allowUserDefinedThemes,
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

        // Testing a relative path and updating it if needed
        try {
            $path = self::testRelativePath($path, $rootRepositories);
        } catch (ApiException $e) {
            throw new ApiException($e->getMessage(), $e->getCode());
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage(), $e->getCode());
        }

        if (!is_dir($path)) {
            if ($createDirectory) {
                $oldUmask = umask(0002);
                $isCreated = mkdir($path, 0775, true);
                umask($oldUmask);
                if (!$isCreated) {
                    throw new ApiException(
                        "Unable to create directory '{$path}'".
                        " Maybe you don't have enough permissions.",
                        500
                    );
                }
            } else {
                throw new ApiException(
                    "The path provided ({$path}) doesn't exist or is not a directory ! ",
                    400
                );
            }
        } elseif ($createDirectory) {
            throw new ApiException(
                'The directory you want to create already exists ! ',
                409
            );
        }

        // Add a trailing / if needed
        if (!str_ends_with($path, '/')) {
            $path .= '/';
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
     * Tests and validates a relative path.
     *
     * @param string $path     The path to validate. It can be a relative or absolute path.
     * @param string $rootRepo the root repository directory used as a base for paths
     *
     * @return string returns the path
     *
     * @throws ApiException if the provided relative path is not authorized
     */
    private static function testRelativePath(string $path, string $rootRepo): string
    {
        if ($path[0] != '/' and $path[1] != ':') {
            if ($rootRepo != '') {

                if (!str_ends_with($rootRepo, '/')) {
                    $rootRepo .= '/';
                }
                $path = $rootRepo.$path;
            } else {
                throw new ApiException("The path provided is not authorized as there's no root repository !", 400);
            }
        }

        return $path;
    }
}
