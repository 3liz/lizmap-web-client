<?php
/**
 * @package     jelix
 * @subpackage  dao
 * @author      Laurent Jouanneau
 * @copyright   2017-2018 Laurent Jouanneau
 * @link        http://www.jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

require_once(__DIR__.'/jDaoParser.class.php');

/**
 * It allows to create tables corresponding to a dao file.
 * @since 1.6.16
 */
class jDaoDbMapper
{
    /**
     * @var jDbConnection
     */
    protected $connection;

    protected $profile;
    /**
     * jDaoDbMapper constructor.
     * @param string $profile the jdb profile
     */
    public function __construct($profile = '')
    {
        $this->connection = jDb::getConnection($profile);
        $this->profile = $profile;
    }

    /**
     *
     * @param string $selector the selector of the DAO file
     * @return jDbTable
     */
    public function createTableFromDao($selectorStr) {
        $selector = new jSelectorDao($selectorStr, $this->profile);
        $parser = $this->getParser($selector);

        $schema = $this->connection->schema();

        $tables = $parser->getTables();
        $properties = $parser->getProperties();
        $tableInfo = $tables[$parser->getPrimaryTable()];

        // create the columns and the table
        $columns = array();
        foreach($tableInfo['fields'] as $propertyName) {
            $property = $properties[$propertyName];
            $columns[] = $this->createColumnFromProperty($property);
        }
        $table = $schema->createTable($tableInfo['realname'], $columns, $tableInfo['pk']);
        if (!$table) {
            $table = $schema->getTable($tableInfo['realname']);
            foreach($columns as $column) {
                $table->alterColumn($column);
            }
        }

        // create foreign keys
        foreach($tables as $tableName=>$info) {
            if ($tableName == $tableInfo['realname']) {
                continue;
            }
            if (isset($info['fk'])) {
                $ref = new jDbReference('', $info['fk'], $info['realname'], $info['pk']);
                $table->addReference($ref);
            }
        }
        return $table;
    }

    /**
     * @param string $selectorStr the dao for which we want to insert data
     * @param string[]  $properties list of properties for which data are given
     * @param mixed[][] $data the data. each row is an array of values.
     *                  Values are in the same order as $properties
     * @param integer $option one of jDbTools::IBD_* const
     * @return integer number of records inserted/updated
     */
    public function insertDaoData($selectorStr, $properties, $data, $option) {
        $selector = new jSelectorDao($selectorStr, $this->profile);
        $parser = $this->getParser($selector);
        $tools = $this->connection->tools();
        $allProperties = $parser->getProperties();
        $tables = $parser->getTables();
        $columns = array();
        $primaryKey = array();
        foreach($properties as $name) {
            if (!isset($allProperties[$name])) {
                throw new Exception("insertDaoData: Unknown property $name");
            }
            $columns[] = $allProperties[$name]->fieldName;
            if ($allProperties[$name]->isPK) {
                $primaryKey[] = $allProperties[$name]->fieldName;
            }
        }
        if (count($primaryKey) == 0) {
            $primaryKey = null;
        }

        return $tools->insertBulkData(
            $tables[$parser->getPrimaryTable()]['realname'],
            $columns, $data, $primaryKey, $option
        );
    }

    protected function getParser(jSelectorDao $selector) {
        $parser = new jDaoParser($selector);
        $daoPath = $selector->getPath();

        // load the XML file
        $doc = new DOMDocument();

        if (!$doc->load($daoPath)) {
            throw new jException('jelix~daoxml.file.unknown', $daoPath);
        }

        if ($doc->documentElement->namespaceURI != JELIX_NAMESPACE_BASE . 'dao/1.0') {
            throw new jException('jelix~daoxml.namespace.wrong', array($daoPath, $doc->namespaceURI));
        }

        /** @var jDbTools $tools */
        $tools = jApp::loadPlugin($selector->driver, 'db', '.dbtools.php', $selector->driver . 'DbTools');
        if (is_null($tools)) {
            throw new jException('jelix~db.error.driver.notfound', $selector->driver);
        }

        $parser->parse(simplexml_import_dom($doc), $tools);
        return $parser;
    }

    protected function createColumnFromProperty(jDaoProperty $property) {
        if ($property->autoIncrement) {
            // it should match properties as readed by jDbSchema
            $hasDefault = true;
            $default = '';
            $notNull = true;
        }
        else {
            $hasDefault = $property->defaultValue !== null || !$property->required;
            $default = $hasDefault?$property->defaultValue: null;
            $notNull = $property->required;
        }

        $column = new jDbColumn(
            $property->fieldName,
            $property->datatype,
            0,
            $hasDefault,
            $default,
            $notNull
        );
        $column->autoIncrement = $property->autoIncrement;
        $column->sequence = $property->sequenceName ? $property->sequenceName: false;
        if ($property->maxlength !== null) {
            $column->maxLength = $column->length = $property->maxlength;
        }
        if ($property->minlength !== null) {
            $column->minLength = $property->minlength;
        }
        return $column;
    }


}
