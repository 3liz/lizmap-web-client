<?php
/**
* @package     jelix
* @subpackage  dao
* @author      Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @copyright   2001-2005 CopixTeam, 2005-2012 Laurent Jouanneau
* This class was get originally from the Copix project (CopixDAODefinitionV1, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

require(JELIX_LIB_PATH.'dao/jDaoXmlException.class.php');
require(JELIX_LIB_PATH.'dao/jDaoProperty.class.php');
require(JELIX_LIB_PATH.'dao/jDaoMethod.class.php');
require(JELIX_LIB_PATH.'dao/jDaoGenerator.class.php');

/**
 * extract data from a dao xml content
 * @package  jelix
 * @subpackage dao
 * @see jDaoCompiler
 */
class jDaoParser {
    /**
    * the properties list.
    * keys = field code name
    * values = jDaoProperty
    */
    private $_properties = array ();

    /**
    * all tables with their properties, and their own fields
    * keys = table code name
    * values = array()
    *          'name'=> table code name, 'realname'=>'real table name',
    *           'pk'=> primary keys list
    *          'fk'=> foreign keys list
    *          'fields'=>array(list of field code name)
    */
    private $_tables = array();

    /**
    * primary table code name
    */
    private $_primaryTable = '';

    /**
    * code name of foreign table with a outer join
    * @var array  list of array(table code name, 0)
    */
    private $_ojoins = array ();

    /**
    * code name of foreign table with a inner join
    * @var array  list of table code name
    */
    private $_ijoins = array ();

    /**
     * @var array list of jDaoMethod objects
     */
    private $_methods = array();

    /**
     * list of main events to sent
     */
    private $_eventList = array();

    public $hasOnlyPrimaryKeys = false;

    /**
     * selector of the user record class
     * @var jSelectorDaoRecord
     */
    private $_userRecord = null;
    
    /**
     * selector of the imported dao
     * @var jSelectorDao[]
     */
    private $_importedDao = null;
    
    public $selector;
    /**
    * Constructor
    */
    function __construct($selector) {
        $this->selector = $selector;
    }

    /**
    * parse a dao xml content
    * @param SimpleXmlElement $xml
    * @param jDbTools $tools
    * @param int $debug  for debug only 0:parse all, 1:parse only datasource+record, 2;parse only datasource
    */
    public function parse ($xml, $tools) {
        $this->import($xml, $tools);
        $this->parseDatasource($xml);
        $this->parseRecord($xml, $tools);
        $this->parseFactory($xml);
    }
    
    protected function import ($xml, $tools) {
        if (isset($xml['import'])) {
            $import = (string)$xml['import'];

            jApp::pushCurrentModule($this->selector->module);
            // Keep the same driver as current used
            $importSel = new jSelectorDao($import, $this->selector->driver);
            jApp::popCurrentModule();

            $doc = new DOMDocument();
            if (!$doc->load($importSel->getPath())) {
                throw new jException('jelix~daoxml.file.unknown', $importSel->getPath());
            }
            $parser = new jDaoParser ($importSel);
            $parser->parse(simplexml_import_dom($doc), $tools);

            $this->_properties = $parser->getProperties();
            $this->_tables = $parser->getTables();
            $this->_primaryTable = $parser->getPrimaryTable();
            $this->_methods = $parser->getMethods();
            $this->_ojoins = $parser->getOuterJoins();
            $this->_ijoins = $parser->getInnerJoins();
            $this->_eventList = $parser->getEvents();
            $this->_userRecord = $parser->getUserRecord();
            $this->_importedDao = $parser->getImportedDao();
            $this->hasOnlyPrimaryKeys = $parser->hasOnlyPrimaryKeys;

            if ($this->_importedDao)
                $this->_importedDao[] = $importSel;
            else
                $this->_importedDao = array($importSel);
        }
    }
    
    protected function parseDatasource($xml) {
        // -- tables
        if(isset ($xml->datasources) && isset ($xml->datasources[0]->primarytable)) {
            $previousTables = $this->_tables;
            // erase table definitions (in the case where the dao imports an other one)
            $this->_tables = array();
            $this->_ijoins = array();
            $this->_ojoins = array();

            $t = $this->_parseTable (0, $xml->datasources[0]->primarytable[0]);
            $this->_primaryTable = $t['name'];
            if (isset($previousTables[$t['name']])) {
                $this->_tables[$t['name']]['fields'] = $previousTables[$t['name']]['fields'];
            }
            if(isset($xml->datasources[0]->primarytable[1])){
                throw new jDaoXmlException ($this->selector, 'table.two.many');
            }
            foreach($xml->datasources[0]->foreigntable as $table){
                $t = $this->_parseTable (1, $table);
                if (isset($previousTables[$t['name']])) {
                    $this->_tables[$t['name']]['fields'] = $previousTables[$t['name']]['fields'];
                }
            }
            foreach($xml->datasources[0]->optionalforeigntable as $table){
                $t = $this->_parseTable (2, $table);
                if (isset($previousTables[$t['name']])) {
                    $this->_tables[$t['name']]['fields'] = $previousTables[$t['name']]['fields'];
                }
            }
        }else if ($this->_primaryTable === '') { // no imported dao
            throw new jDaoXmlException ($this->selector, 'datasource.missing');
        }
    }

    /**
     * @param simpleXmlElement $xml
     * @param jDbTools $tools
     * @throws jDaoXmlException
     */
    protected function parseRecord($xml, $tools) {

        //add the record properties
        if(isset($xml->record)){
            if (isset($xml->record[0]['extends'])) {
                jApp::pushCurrentModule($this->selector->module);
                $this->_userRecord = new jSelectorDaoRecord((string)$xml->record[0]['extends']);
                jApp::popCurrentModule();
            }
            if (isset($xml->record[0]->property)) {
                // don't append directly new properties into _properties,
                // so we can see the differences between imported properties
                // and readed properties
                $properties = array();
                foreach ($xml->record[0]->property as $prop){
                    $p = new jDaoProperty ($prop->attributes(), $this, $tools);
                    if (isset($properties[$p->name])) {
                        throw new jDaoXmlException ($this->selector, 'property.already.defined', $p->name);
                    }
                    if (!in_array($p->name, $this->_tables[$p->table]['fields'])) { // if this property does not redefined an imported property
                        $this->_tables[$p->table]['fields'][] = $p->name;
                    }
                    $properties[$p->name] = $p;
                }
                $this->_properties = array_merge($this->_properties, $properties);
            }
        }
        // in the case when there is no defined property and no imported dao
        if (count($this->_properties) == 0)
            throw new jDaoXmlException ($this->selector, 'properties.missing');

        // check that properties are attached to a known table. It can be
        // wrong if the datasource has been redefined with other table names
        $countprop = 0;
        foreach ($this->_properties as $p) {
            if (!isset($this->_tables[$p->table]))
                throw new jDaoXmlException ($this->selector, 'property.imported.unknown.table', $p->name);
            if($p->ofPrimaryTable && !$p->isPK)
                $countprop ++;
        }
        $this->hasOnlyPrimaryKeys = ($countprop == 0);
    }

    protected function parseFactory($xml) {
        // get additionnal methods definition
        if (isset ($xml->factory)) {
            if (isset($xml->factory[0]['events'])) {
                $events = (string)$xml->factory[0]['events'];
                $this->_eventList = preg_split("/[\s,]+/", $events);
            }

            if (isset($xml->factory[0]->method)){
                $methods = array();
                foreach($xml->factory[0]->method as $method){
                    $m = new jDaoMethod ($method, $this);
                    if (isset ($methods[$m->name])){
                        throw new jDaoXmlException ($this->selector, 'method.duplicate',$m->name);
                    }
                    $methods[$m->name] = $m;
                }
                $this->_methods = array_merge($this->_methods, $methods);
            }
        }
    }

    /**
    * parse a join definition
     * @param integer $typetable
     * @param simpleXmlElement $tabletag
    */
    private function _parseTable ($typetable, $tabletag){
        $infos = $this->getAttr($tabletag, array('name','realname','primarykey','onforeignkey'));

        if ($infos['name'] === null )
            throw new jDaoXmlException ($this->selector, 'table.name');

        if($infos['realname'] === null)
            $infos['realname'] = $infos['name'];

        if($infos['primarykey'] === null)
            throw new jDaoXmlException ($this->selector, 'primarykey.missing');

        $infos['pk']= preg_split("/[\s,]+/", $infos['primarykey']);
        unset($infos['primarykey']);

        if(count($infos['pk']) == 0 || $infos['pk'][0] == '')
            throw new jDaoXmlException ($this->selector, 'primarykey.missing');

        if($typetable){ // for the foreigntable and optionalforeigntable
            if($infos['onforeignkey'] === null)
                throw new jDaoXmlException ($this->selector, 'foreignkey.missing');
            $infos['fk']=preg_split("/[\s,]+/",$infos['onforeignkey']);
            unset($infos['onforeignkey']);
            if(count($infos['fk']) == 0 || $infos['fk'][0] == '')
                throw new jDaoXmlException ($this->selector, 'foreignkey.missing');
            if(count($infos['fk']) != count($infos['pk']))
                throw new jDaoXmlException ($this->selector, 'foreignkey.missing');
            if($typetable == 1){
                $this->_ijoins[]=$infos['name'];
            }else{
                $this->_ojoins[]=array($infos['name'],0);
            }
        }else{
            unset($infos['onforeignkey']);
        }

        $infos['fields'] = array ();
        $this->_tables[$infos['name']] = $infos;

        return $infos;
    }

    /**
    * Try to read all given attributes
    * @param SimpleXmlElement $tag
    * @param array $requiredattr attributes list
    * @return array attributes and their values
    */
    public function getAttr($tag, $requiredattr){
        $res=array();
        foreach($requiredattr as $attr){
            if(isset($tag[$attr]) && trim((string)$tag[$attr]) != '')
                $res[$attr]=(string)$tag[$attr];
            else
                $res[$attr]=null;
        }
        return $res;
    }

    /**
    * just a quick way to retrieve boolean values from a string.
    *  will accept yes, true, 1 as "true" values
    *  all other values will be considered as false.
    * @return boolean true / false
    */
    public function getBool ($value) {
        return in_array (trim ($value), array ('true', '1', 'yes'));
    }

    /**
    * the properties list.
    * keys = field code name
    * values = jDaoProperty
    * @return array
    */
    public function getProperties () { return $this->_properties; }

    /**
    * all tables with their properties, and their own fields
    * keys = table code name
    * values = array()
    *          'name'=> table code name, 'realname'=>'real table name',
    *           'pk'=> primary keys list
    *          'fk'=> foreign keys list
    *          'fields'=>array(list of field code name)
    * @return array
    */
    public function getTables(){  return $this->_tables;}

    /**
    * @return string the primary table code name
    */
    public function getPrimaryTable(){  return $this->_primaryTable;}

    /**
     * @return jDaoMethod[] list of jDaoMethod objects
     */
    public function getMethods(){  return $this->_methods;}

    /**
    * list of code name of foreign table with a outer join
    * @return array  list of array(table code name, 0)
    */
    public function getOuterJoins(){  return $this->_ojoins;}

    /**
    * list of code name of foreign tables with a inner join
    * @return array  the list
    */
    public function getInnerJoins(){  return $this->_ijoins;}

    public function getEvents(){ return $this->_eventList;}
    public function hasEvent($event){ return in_array($event,$this->_eventList);}

    /**
     * selector of the user record class
     * @return jSelectorDaoRecord
     */
    public function getUserRecord() { return $this->_userRecord;}

    /**
     * selector of the imported dao. If can return several selector, if
     * an imported dao import itself an other dao etc.
     * @return jSelectorDao[]
     */
    public function getImportedDao(){ return $this->_importedDao;}
}
