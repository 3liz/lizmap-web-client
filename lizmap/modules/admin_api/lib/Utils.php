<?php

namespace LizmapApi;

use LizmapAdmin\RepositoryRightsService;

class Utils
{
    /**
     * Extracts and returns last part of a given path with a trailing slash.
     *
     * @param string $path the directory path to process
     *
     * @return string the last portion of the path, formatted with a trailing slash
     */
    public static function getLastPartPath(string $path): string
    {
        $array = explode('/', $path);
        $length = count($array);

        // Sometimes paths doesn't end with a '/'
        if ($array[$length - 1] == '') {
            return $array[$length - 2].'/';
        }

        return $array[$length - 1].'/';

    }

    /**
     * Retrieves and returns a list of all group IDs.
     *
     * @param object $manager the manager object from which group information is retrieved
     *
     * @return array an array of group IDs
     */
    private static function getAllGroups(object $manager): array
    {
        $all = $manager->getGroupRights()['groups'];
        $arrayGroup = array();

        foreach ($all as $group) {
            $arrayGroup[] = $group->id_aclgrp;
        }

        return $arrayGroup;
    }

    /**
     * Verifies the validity of the provided group and right parameters against existing groups and rights.
     *
     * @param null|string $group the name of the group to validate
     * @param null|string $right the name of the right to validate
     * @param string      $key   the key used to fetch the list of rights
     *
     * @return array an associative array containing a boolean under the key 'bool' indicating success or failure,
     *               and a message under the key 'message' describing the result or error
     */
    public static function verifyVars(?string $group, ?string $right, string $key): array
    {
        if (!$group) {
            return array(
                'bool' => false,
                'message' => "'group' parameter is required !",
            );
        }

        if (!$right) {
            return array(
                'bool' => false,
                'message' => "'right' parameter is required !",
            );
        }

        $manager = new \jAcl2DbAdminUIManager();

        $allGroups = Utils::getAllGroups($manager);

        $isGroupValid = false;

        // Not using 'array_search' because the return value is problematic when it is equal to 0.
        foreach ($allGroups as $groupElement) {
            if ($groupElement == $group) {
                $isGroupValid = true;

                break;
            }
        }

        if (!$isGroupValid) {
            return array(
                'bool' => false,
                'message' => "'{$group}' group doesn't exist !",
            );
        }

        $allRights = RepositoryRightsService::getRights($key);

        array_key_exists($right, $allRights) ? $isRightValid = true : $isRightValid = false;

        if (!$isRightValid) {
            return array(
                'bool' => false,
                'message' => "'{$right}' right doesn't exist !",
            );
        }

        return array(
            'bool' => true,
            'message' => '',
        );
    }
}
