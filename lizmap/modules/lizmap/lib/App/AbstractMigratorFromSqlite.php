<?php

/**
 * @author    3liz
 * @copyright 2019-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

abstract class AbstractMigratorFromSqlite
{
    public function __construct() {}

    public const MIGRATE_RES_OK = 1;
    public const MIGRATE_RES_ALREADY_MIGRATED = 2;

    protected function copyTable($daoSelector, $oldProfile, $newProfile, $updateSequence = true)
    {
        $daoNew = \jDao::get($daoSelector, $newProfile);
        $daoSqlite = \jDao::create($daoSelector, $oldProfile);
        $properties = array_keys($daoSqlite->getProperties());
        foreach ($daoSqlite->findAll() as $rec) {
            $daoRec = \jDao::createRecord($daoSelector, $newProfile);
            foreach ($properties as $prop) {
                $daoRec->{$prop} = $rec->{$prop};
            }

            try {
                $daoNew->insert($daoRec);
            } catch (\Exception $e) {
                echo '*** Insert ERROR for the record ';
                var_export($rec->getPk());
                echo "\nError is: ".$e->getMessage()."\n";
            }
        }

        if ($updateSequence) {
            $idField = $daoNew->getProperties()[$daoNew->getPrimaryKeyNames()[0]]['fieldName'];
            $table = $daoNew->getTables()[$daoNew->getPrimaryTable()]['realname'];

            $conn = \jDb::getConnection($newProfile);
            $rs = $conn->query('SELECT pg_get_serial_sequence('.$conn->quote($table).','.$conn->quote($idField).') as sequence_name');
            if ($rs && ($rec = $rs->fetch())) {
                $sequence = $rec->sequence_name;
                if ($sequence) {
                    $conn->query('SELECT setval('.$conn->quote($sequence).',
                    (SELECT max('.$conn->encloseName($idField).')
                    FROM '.$conn->encloseName($table).'))');
                }
            }
        }
    }
}
