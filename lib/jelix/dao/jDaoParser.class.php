<?php
/**
* @package     jelix
* @subpackage  dao
* @author      Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @copyright   2001-2005 CopixTeam, 2005-2006 Laurent Jouanneau
* This class was get originally from the Copix project (CopixDAODefinitionV1, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

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
    *          'primarykey'=> attribute , 'pk'=> primary keys list
    *          'onforeignkey'=> attribute, 'fk'=> foreign keys list
    *          'fields'=>array(list of field code name)
    */
    private $_tables = array();

    /**
    * primary table code name
    */
    private $_primaryTable = '';

    /**
    * code name of foreign table with a outer join
    * @var array  of table code name
    */
    private $_ojoins = array ();

    /**
    * code name of foreign table with a inner join
    * @var array  of array(table code name, 0)
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
    public function parse( $xml, $tools){
        $this->parseDatasource($xml);
        $this->parseRecord($xml, $tools);
        $this->parseFactory($xml);
    }
    
    protected function parseDatasource($xml) {
        // -- tables
        if(isset ($xml->datasources) && isset ($xml->datasources[0]->primarytable)){
            $t = $this->_parseTable (0, $xml->datasources[0]->primarytable[0]);
            $this->_primaryTable = $t['name'];
            if(isset($xml->datasources[0]->primarytable[1])){
                throw new jDaoXmlException ($this->selector, 'table.two.many');
            }
            foreach($xml->datasources[0]->foreigntable as $table){
                $this->_parseTable (1, $table);
            }
            foreach($xml->datasources[0]->optionalforeigntable as $table){
                $this->_parseTable (2, $table);
            }
        }else{
            throw new jDaoXmlException ($this->selector, 'datasource.missing');
        }
    }
    
    protected function parseRecord($xml, $tools) {
        $countprop = 0;
        //add the record properties
        if(isset($xml->record) && isset($xml->record[0]->property)){
            foreach ($xml->record[0]->property as $prop){
                $p = new jDaoProperty ($prop->attributes(), $this, $tools);
                $this->_properties[$p->name] = $p;
                $this->_tables[$p->table]['fields'][] = $p->name;
                if($p->ofPrimaryTable && !$p->isPK)
                    $countprop ++;
            }
            $this->hasOnlyPrimaryKeys = ($countprop == 0);
        }else
            throw new jDaoXmlException ($this->selector, 'properties.missing');
    }
    
    protected function parseFactory($xml) {
        // get additionnal methods definition
        if (isset ($xml->factory)) {
            if (isset($xml->factory[0]['events'])) {
                $events = (string)$xml->factory[0]['events'];
                $this->_eventList = preg_split("/[\s,]+/", $events);
            }

            if (isset($xml->factory[0]->method)){
                foreach($xml->factory[0]->method as $method){
                    $m = new jDaoMethod ($method, $this);
                    if(isset ($this->_methods[$m->name])){
                        throw new jDaoXmlException ($this->selector, 'method.duplicate',$m->name);
                    }
                    $this->_methods[$m->name] = $m;
                }
            }
        }
    }

    /**
    * parse a join definition
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

    public function getProperties () { return $this->_properties; }
    public function getTables(){  return $this->_tables;}
    public function getPrimaryTable(){  return $this->_primaryTable;}
    public function getMethods(){  return $this->_methods;}
    public function getOuterJoins(){  return $this->_ojoins;}
    public function getInnerJoins(){  return $this->_ijoins;}
    public function hasEvent($event){ return in_array($event,$this->_eventList);}
}

