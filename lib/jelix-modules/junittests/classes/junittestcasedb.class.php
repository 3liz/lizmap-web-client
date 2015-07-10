<?php
/**
* @package     jelix
* @subpackage  junittests
* @author      Laurent Jouanneau
* @contributor
* @copyright   2007 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/
require_once(__DIR__.'/junittestcase.class.php');

class jUnitTestCaseDb extends jUnitTestCase {

    /**
    *   erase all record in a table
    */
    public function emptyTable($table){
        $db = jDb::getConnection($this->dbProfile);
        $db->exec('DELETE FROM '.$db->encloseName($table));
    }

    public function insertRecordsIntoTable($table, $fields, $records, $emptyBefore=false){
        if($emptyBefore)
            $this->emptytable($table);
        $db = jDb::getConnection($this->dbProfile);

        $fieldsList = '';
        foreach($fields as $f) {
            if ($fieldsList != '')
                $fieldsList.=',';
            $fieldsList .= $db->encloseName($f);
        }

        $sql = 'INSERT INTO '.$db->encloseName($table).'  ('.$fieldsList.') VALUES (';

        foreach($records as $rec){
            $ins='';
            foreach($fields as $f){
                $ins.= ','.$db->quote($rec[$f]);
            }
            $db->exec($sql.substr($ins,1).')');
        }
    }

    /**
     * check if the table is empty
     */
    public function assertTableIsEmpty($table, $message="%s"){
        $db = jDb::getConnection($this->dbProfile);
        $rs = $db->query('SELECT count(*) as N FROM '.$db->encloseName($table));
        if($r=$rs->fetch()){
            $message = sprintf( $message, $table. " table should be empty");
            if($r->N == 0){
                $this->pass($message);
                return true;
            }else{
                $this->fail($message);
                return false;
            }
        }else{
            $this->fail(sprintf( $message, $table. " table should be empty, but error when try to get record count"));
            return false;
        }
    }

    /**
     * check if the table is not empty
     */
    public function assertTableIsNotEmpty($table, $message="%s"){
        $db = jDb::getConnection($this->dbProfile);
        $rs = $db->query('SELECT count(*) as N FROM '.$db->encloseName($table));
        if($r=$rs->fetch()){
            $message = sprintf( $message, $table. " table shouldn't be empty");
            if($r->N > 0){
                $this->pass($message);
                return true;
            }else{
                $this->fail($message);
                return false;
            }
        }else{
            $this->fail(sprintf( $message, $table. " table shouldn't be empty, but error when try to get record count"));
            return false;
        }
    }

    /**
     * check if a table has a specific number of records
     */
    public function assertTableHasNRecords($table, $n, $message="%s"){
        $db = jDb::getConnection($this->dbProfile);
        $rs = $db->query('SELECT count(*) as N FROM '.$db->encloseName($table));
        if($r=$rs->fetch()){
            $message = sprintf( $message, $table. " table should contains ".$n." records");
            if($r->N == $n){
                $this->pass($message);
                return true;
            }else{
                $this->fail($message);
                return false;
            }
        }else{
            $this->fail(sprintf( $message, $table. " table shouldn't be empty, but error when try to get record count"));
            return false;
        }
    }

    /**
     * check if all given record are in the table
     */
    public function assertTableContainsRecords($table, $records, $onlyThem = true, $message ="%s"){
        $db = jDb::getConnection($this->dbProfile);

        $message = sprintf( $message, $table. " table should contains given records.");

        $sql = 'SELECT * FROM '.$db->encloseName($table);
        $rs = $db->query($sql);
        if(!$rs){
           $this->fail($message.' ( no results set)');
           return false;
        }
        $results = array();
        foreach($rs as $r){
           $results[]=get_object_vars($r);
        }

        $globalok=true;
        $resultsSaved = $results;
        foreach($records as $rec){
            $ok=false;
            foreach($results as $k=>$res){
                $sameValues = true;
                foreach($rec as $name=>$value){
                    if($res[$name] != $value) {
                        $sameValues = false;
                        break;
                    }
                }

                if($sameValues){
                    unset($results[$k]);
                    $ok = true;
                    break;
                }
            }
            if(!$ok){
                $globalok = false;
                $this->fail($message.'. No record found : '. var_export($rec,true));
            }
        }

        if($onlyThem && count($results) != 0){
            $globalok = false;
            $this->fail($message.'. Other unknown records exists');
        }

        if($globalok){
            $this->pass($message);
            return true;
        }else{
            $this->sendMessage('Results from database');
            $this->dump($resultsSaved);
            $this->sendMessage('Records we should find');
            $this->dump($records);
            return false;
        }
    }

    /**
     * check if all given record are in the table
     * @param string $table the table name
     * @param array $records the list of record we should find
     * @param array|string $keys  the list of key names of records
     * @param boolean $onlyThem  if true, check if the table has only this records
     * @param string $message the error message
     */
    public function assertTableContainsRecordsByKeys($table, $records, $keys, $onlyThem = true, $message ="%s"){
        $db = jDb::getConnection($this->dbProfile);

        if (is_string ($keys))
            $keys = array($keys);

        $message = sprintf( $message, $table. " table should contains given records.");

        $sql = 'SELECT * FROM '.$db->encloseName($table);
        $rs = $db->query($sql);
        if(!$rs){
           $this->fail($message.' ( no results set)');
           return false;
        }
        $results = array();
        foreach($rs as $r){
           $results[]=get_object_vars($r);
        }

        $globalok=true;
        $resultsSaved = $results;
        foreach($records as $rec) {
            $found = false;
            $res = array();
            foreach($results as $k=>$res){
                $keyok = true;
                foreach ($keys as $keyname) {
                    if($rec[$keyname] != $res[$keyname]) {
                        $keyok = false;
                        break;
                    }
                }
                if ($keyok) {
                    $found = true;
                    break;
                }
            }

            if(!$found){
                $globalok = false;
                $this->fail($message.'. No record found : '. var_export($rec,true));
            }
            else {
                $sameValues = true;
                foreach($rec as $name=>$value){
                    if($res[$name] != $value) {
                        $sameValues = false;
                        break;
                    }
                }
                unset($results[$k]);
                if(!$sameValues){
                    $globalok = false;
                    $this->fail($message.'. Difference in a record. Actual:'. var_export($res,true). ' | Expected:'.var_export($rec,true));
                    $this->diff(var_export($rec,true), var_export($res,true));
                }
            }
        }

        if($onlyThem && count($results) != 0){
            $globalok = false;
            $this->fail($message.'. Other unknown records exists');
            $this->sendMessage('Unexpected records');
            $this->dump($results);
        }

        if($globalok){
            $this->pass($message);
            return true;
        }
        else {
            return false;
        }
    }

    function getLastId($fieldName, $tableName){
        $db = jDb::getConnection($this->dbProfile);
        return $db->lastIdInTable($fieldName, $tableName);
    }

}

