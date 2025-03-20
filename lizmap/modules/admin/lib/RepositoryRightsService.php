<?php

namespace LizmapAdmin;

class RepositoryRightsService
{
    /**
     * Retrieves the rights from a repository key, grouped by subject and formatted as concatenated group names.
     *
     * @param string $repo a string representing the repository key
     *
     * @return array an associative array where keys are subject IDs and values are arrays of group names
     */
    public static function getRights(string $repo): array
    {
        $manager = new \jAcl2DbAdminUIManager();

        $groups = $manager->getGroupRights();

        $userById = array();

        foreach ($groups['groups'] as $group) {
            $userById[$group->id_aclgrp] = $group->name;
        }

        $rightsLabel = array_keys(
            $manager->getGroupRightsWithResources('admins')['rightsLabels']
        );

        $rights = array();

        foreach ($userById as $userId => $userName) {
            $rightsFromId = $manager->getGroupRightsWithResources($userId)['rightsWithResources'];

            foreach ($rightsLabel as $right) {
                if (array_key_exists($right, $rightsFromId)) {
                    $element = $rightsFromId[$right];

                    foreach ($element as $elementRight) {
                        if ($elementRight->id_aclres == $repo) {
                            $rights[$right][] = $userName;

                            break;
                        }
                    }
                }
            }
        }

        return $rights;
    }
}
