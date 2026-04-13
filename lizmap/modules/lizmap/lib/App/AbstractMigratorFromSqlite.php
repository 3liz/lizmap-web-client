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

    protected $oldProfile = '';
    protected $newProfile = '';
    protected $tablesWereReseted = true;

    protected function prepareTablesCopy($oldProfile, $newProfile, $tablesWereReseted = true)
    {
        $this->newProfile = $newProfile;
        $this->oldProfile = $oldProfile;
        $this->tablesWereReseted = $tablesWereReseted;
    }

    protected function copyTable($daoSelector, $updateSequence = true, $forceUpdateFields = array(), $updateExisting = false)
    {
        $daoNew = \jDao::get($daoSelector, $this->newProfile);
        $daoSqlite = \jDao::create($daoSelector, $this->oldProfile);
        $properties = array_keys($daoSqlite->getProperties());

        /** @var \jDaoRecordBase $rec */
        foreach ($daoSqlite->findAll() as $rec) {
            $daoRec = \jDao::createRecord($daoSelector, $this->newProfile);
            foreach ($properties as $prop) {
                $daoRec->{$prop} = $rec->{$prop};
            }

            try {

                if (!$this->tablesWereReseted) {
                    // if content was not deleted before import, we should check if the record is here.
                    $existingRec = $daoNew->get($rec->getPk());
                    if ($existingRec) {
                        if ($updateExisting) {
                            $daoNew->update($daoRec);
                        }

                        continue;
                    }
                }

                $daoNew->insert($daoRec);

                if (count($forceUpdateFields)) {
                    $newConn = \jDb::getConnection($this->newProfile);
                    // $daoNew->insert does not save fields for which there is an "insertpattern" into the dao.
                    // so we must set the value ourselves.
                    $tableName = $daoNew->getTables()[$daoNew->getPrimaryTable()]['realname'];
                    $pkNames = $daoNew->getPrimaryKeyNames();
                    $pkFieldNames = array();
                    foreach ($pkNames as $pkName) {
                        $pkFieldNames[] = $daoNew->getProperties()[$pkName]['fieldName'];
                    }

                    $sets = array();
                    foreach ($forceUpdateFields as $prop) {
                        if ($rec->{$prop} == '' && !$daoNew->getProperties()[$prop]['required']) {
                            $val = 'NULL';
                        } else {
                            $val = $newConn->quote($rec->{$prop});
                        }
                        $fieldName = $daoNew->getProperties()[$prop]['fieldName'];
                        $sets[] = $newConn->encloseName($fieldName).' = '.$val;
                    }
                    $sql = 'UPDATE '.$newConn->prefixTable($tableName).' SET '.implode(',', $sets).' WHERE ';
                    $pkValues = array_combine($pkFieldNames, is_array($rec->getPk()) ? $rec->getPk() : array($rec->getPk()));
                    $sqlPk = array();
                    foreach ($pkValues as $f => $v) {
                        $sqlPk[] = $newConn->encloseName($f).'='.$newConn->quote($v);
                    }
                    $sql .= implode(' AND ', $sqlPk);
                    $newConn->exec($sql);
                }
            } catch (\Exception $e) {
                echo '*** Insert ERROR for the record ';
                var_export($rec->getPk());
                echo "\nError is: ".$e->getMessage()."\n";
            }
        }

        if ($updateSequence) {
            $idField = $daoNew->getProperties()[$daoNew->getPrimaryKeyNames()[0]]['fieldName'];
            $table = $daoNew->getTables()[$daoNew->getPrimaryTable()]['realname'];

            $conn = \jDb::getConnection($this->newProfile);
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
