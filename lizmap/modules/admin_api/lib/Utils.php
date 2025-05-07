<?php

namespace LizmapApi;

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
     * @throws \Exception
     */
    public static function verifyVars(?string $group, ?string $right, string $key): void
    {
        if (!\lizmap::getRepository($key)) {
            throw new \Exception("The repository '{$key}' doesn't exists.", 404);
        }

        if (!$group) {
            throw new \Exception("'group' parameter is required !", 400);
        }

        if (!$right) {
            throw new \Exception("'right' parameter is required !", 400);
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
            throw new \Exception("'{$group}' group doesn't exist !", 404);
        }

        $allRights = LizmapRights::getLWCRights();

        in_array($right, $allRights) ? $isRightValid = true : $isRightValid = false;

        if (!$isRightValid) {
            throw new \Exception("'{$right}' right doesn't exist !", 404);
        }

    }
}
