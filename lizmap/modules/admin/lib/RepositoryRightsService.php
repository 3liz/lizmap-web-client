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
        $cnx = \jDb::getConnection('jacl2_profile');

        // $sql = " SELECT r.id_aclsbj, group_concat(g.name, ' - ') AS group_names";
        $sql = ' SELECT r.id_aclsbj, g.name AS group_name';
        $sql .= ' FROM jacl2_rights r';
        $sql .= ' INNER JOIN jacl2_group g ON r.id_aclgrp = g.id_aclgrp';
        $sql .= ' WHERE (g.grouptype = 0 OR g.grouptype = 1)';
        $sql .= ' AND id_aclres='.$cnx->quote($repo);
        // $sql.= " GROUP BY r.id_aclsbj;";
        $sql .= ' ORDER BY g.name';
        $rights = $cnx->query($sql);

        $group_names = array();
        foreach ($rights as $r) {
            if (!array_key_exists($r->id_aclsbj, $group_names)) {
                $group_names[$r->id_aclsbj] = array();
            }
            $group_names[$r->id_aclsbj][] = $r->group_name;
        }

        return $group_names;
    }
}
