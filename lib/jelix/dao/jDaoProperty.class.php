<?php
/**
* @package     jelix
* @subpackage  dao
* @author      Gérald Croes, Laurent Jouanneau
* @contributor Laurent Jouanneau
* @contributor Philippe Villiers
* @copyright   2001-2005 CopixTeam, 2005-2011 Laurent Jouanneau
* This class was get originally from the Copix project (CopixDAODefinitionV1, Copix 2.3dev20050901, http://www.copix.org)
* Few lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this Copix class are Gerald Croes and Laurent Jouanneau,
* and this class was adapted/improved for Jelix by Laurent Jouanneau
*
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * Container for properties of a dao property
 * @package  jelix
 * @subpackage dao
 */

class jDaoProperty {
    /**
    * the name of the property of the object
    */
    public $name = '';

    /**
    * the name of the field in table
    */
    public $fieldName = '';

    /**
    * give the regular expression that needs to be matched against.
    * @var string
    */
    public $regExp = null;

    /**
    * says if the field is required when doing a check
    * @var boolean
    */
    public $required = false;

    /**
    * says if the value of the field is required when construct SQL conditions
    * @var boolean
    */
    public $requiredInConditions = false;

    /**
    * Says if it's a primary key.
    * @var boolean
    */
    public $isPK = false;

    /**
    * Says if it's a foreign key
    * @var boolean
    */
    public $isFK = false;

    public $datatype;

    public $unifiedType;

    public $table=null;
    public $updatePattern='%s';
    public $insertPattern='%s';
    public $selectPattern='%s';
    public $sequenceName='';

    /**
    * the maxlength of the key if given
    * @var int
    */
    public $maxlength = null;
    public $minlength = null;

    public $ofPrimaryTable = true;

    public $defaultValue = null;

    public $autoIncrement = false;

    /**
    * comment field / eg : use to form's label
    * @var string
    */
    public $comment = '';

    /**
     * constructor.
     * @param $aAttributes
     * @param jDaoParser $parser the parser on the dao file
     * @param jDbTools $tools
     * @throws jDaoXmlException
     * @internal param array $attributes list of attributes of a simpleXmlElement
     */
    function __construct ($aAttributes, $parser, $tools){
        $needed = array('name', 'fieldname', 'table', 'datatype', 'required',
                        'minlength', 'maxlength', 'regexp', 'sequence', 'default', 'autoincrement');

        // Allowed attributes names
        $allowed = array('name', 'fieldname', 'table', 'datatype', 'required',
                        'minlength', 'maxlength', 'regexp', 'sequence', 'default', 'autoincrement',
                        'updatepattern', 'insertpattern', 'selectpattern','comment');

        foreach($aAttributes as $attributeName => $attributeValue) {
            if(!in_array($attributeName, $allowed)) {
                throw new jDaoXmlException ($parser->selector, 'unknown.attr', array($attributeName, 'property'));
            }
        }

        $params = $parser->getAttr($aAttributes, $needed);

        if ($params['name']===null){
            throw new jDaoXmlException ($parser->selector, 'missing.attr', array('name', 'property'));
        }
        $this->name       = $params['name'];

        if(!preg_match('/^[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/', $this->name)){
            throw new jDaoXmlException ($parser->selector, 'property.invalid.name', $this->name);
        }

        $this->fieldName  = $params['fieldname'] !==null ? $params['fieldname'] : $this->name;
        $this->table      = $params['table'] !==null ? $params['table'] : $parser->getPrimaryTable();

        $tables = $parser->getTables();

        if(!isset( $tables[$this->table])){
            throw new jDaoXmlException ($parser->selector, 'property.unknown.table', $this->name);
        }

        $this->required   = $this->requiredInConditions = $parser->getBool ($params['required']);
        $this->maxlength  = $params['maxlength'] !== null ? intval($params['maxlength']) : null;
        $this->minlength  = $params['minlength'] !== null ? intval($params['minlength']) : null;
        $this->regExp     = $params['regexp'];
        $this->autoIncrement = $parser->getBool ($params['autoincrement']);

        if ($params['datatype']===null){
            throw new jDaoXmlException ($parser->selector, 'missing.attr', array('datatype', 'property'));
        }
        $params['datatype'] = trim(strtolower($params['datatype']));

        if ($params['datatype'] == '') {
            throw new jDaoXmlException ($parser->selector, 'wrong.attr', array($params['datatype'],
                                                           $this->fieldName,
                                                           'property'));
        }
        $this->datatype = strtolower($params['datatype']);

        $ti = $tools->getTypeInfo($this->datatype);
        $this->unifiedType = $ti[1];
        if (!$this->autoIncrement)
            $this->autoIncrement = $ti[6];

        if ($this->unifiedType == 'integer' || $this->unifiedType == 'numeric') {
            if ($params['sequence'] !== null) {
                $this->sequenceName = $params['sequence'];
                $this->autoIncrement = true;
            }
        }

        $pkeys = array_map('strtolower', $tables[$this->table]['pk']);
        $this->isPK = in_array(strtolower($this->fieldName), $pkeys);
        if(!$this->isPK && $this->table == $parser->getPrimaryTable()){
            foreach($tables as $table=>$info) {
                if ($table == $this->table)
                    continue;
                if(isset($info['fk'])) {
                    $fkeys = array_map('strtolower', $info['fk']);
                    if(in_array(strtolower($this->fieldName), $fkeys)) {
                        $this->isFK = true;
                        break;
                    }
                }
            }
        }
        else {
            $this->required = true;
            $this->requiredInConditions = true;
        }

        if ($this->autoIncrement) {
            $this->required = false;
            $this->requiredInConditions = true;
        }

        if ($params['default'] !== null) {
            $this->defaultValue = $tools->stringToPhpValue($this->unifiedType, $params['default']);
        }

        // insertpattern is allowed on primary keys noy autoincremented
        if ($this->isPK && !$this->autoIncrement && isset($aAttributes['insertpattern'])) {
            $this->insertPattern=(string)$aAttributes['insertpattern'];
        }
        if ($this->isPK) {
            $this->updatePattern = '';
        }
        // we ignore *pattern attributes on PK and FK fields
        if (!$this->isPK && !$this->isFK) {
            if(isset($aAttributes['updatepattern'])) {
                $this->updatePattern=(string)$aAttributes['updatepattern'];
            }

            if(isset($aAttributes['insertpattern'])) {
                $this->insertPattern=(string)$aAttributes['insertpattern'];
            }

            if(isset($aAttributes['selectpattern'])) {
                $this->selectPattern=(string)$aAttributes['selectpattern'];
            }
        }


        // no update and insert patterns for field of external tables
        if ($this->table != $parser->getPrimaryTable()) {
            $this->updatePattern = '';
            $this->insertPattern = '';
            $this->required = false;
            $this->requiredInConditions = false;
            $this->ofPrimaryTable = false;
        }
        else {
            $this->ofPrimaryTable=true;
        }

        // field comment
        if(isset($aAttributes['comment'])) {
            $this->comment=(string)$aAttributes['comment'];
        }

    }
}
