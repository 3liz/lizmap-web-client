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
     *
     * @return bool returns true if the repository is successfully created
     *
     * @throws \Exception if the repository creation fails
     */
    public static function createRepository(string $key, string $label, string $path, string $allowUserDefinedThemes): bool
    {
        if (\lizmap::getRepository($key)) {
            throw new \Exception("The repository '{$key}' already exists.", 409);
        }

        if (!$label) {
            throw new \Exception('The repository label is not set.', 400);
        }

        if (!$path) {
            throw new \Exception('The repository path is not set.', 400);
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
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage(), $e->getCode());
        }

        if (!file_exists($path) or !is_dir($path)) {
            throw new \Exception(
                "The path provided doesn't exist or is not a directory ! ".
                "It has to be a folder in '{$rootRepositories}'.",
                400
            );
        }
        // Add a trailing / if needed
        if (!str_ends_with($path, '/')) {
            $path .= '/';
        }
        $data['path'] = $path;

        $data['allowUserDefinedThemes'] = self::isValidBooleanValue($allowUserDefinedThemes);

        $repo = \lizmap::createRepository($key, $data);
        if (!$repo) {
            throw new \Exception("Repository can't be created !", 500);
        }

        return true;
    }

    /**
     * Validates and resolves a relative path to an absolute path based on the specified root repository.
     *
     * @param string $path     The path to validate and resolve. It can be a relative or absolute path.
     * @param string $rootRepo the root repository directory used as a base for paths
     *
     * @return string returns the path
     *
     * @throws \Exception if the provided relative path is not authorized or cannot be resolved within
     *                    the root repository
     */
    private static function testRelativePath(string $path, string $rootRepo): string
    {
        if ($path[0] != '/' and $path[1] != ':') {
            if ($rootRepo != '') {

                if (!str_ends_with($rootRepo, '/')) {
                    $rootRepo .= '/';
                }
                $npath = realpath($rootRepo.$path);

                if (!str_starts_with($npath, $rootRepo)) {
                    // Error message
                    throw new \Exception('The path provided is not authorized !', 400);
                }

                $path = $npath;
            }
        }

        return $path;
    }

    /**
     * Validates whether the given value represents a boolean true value.
     *
     * @param mixed $value The value to validate. Can be of any data type.
     *
     * @return bool returns true if the value represents a boolean true value, otherwise false
     */
    private static function isValidBooleanValue(mixed $value): bool
    {
        if (empty($value)) {
            return false;
        }

        if (is_bool($value)) {
            return $value;
        }

        $strVal = strtolower((string) $value);
        $validTrueValues = array('true', 't', 'on', '1');

        return in_array($strVal, $validTrueValues, true);
    }
}
