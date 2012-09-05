<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @contributor Dominique Papin, Olivier Demah
* @copyright   2006-2008 Laurent Jouanneau, 2008 Dominique Papin
* @copyright   2009 Olivier Demah
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/
/**
 * base class for all jforms control
 * @package     jelix
 * @subpackage  forms
 */
abstract class jFormsControl {
    public $type = null;
    public $ref='';
    public $datatype;
    public $required = false;
    public $label='';
    public $defaultValue='';
    public $help = '';
    public $hint='';
    public $alertInvalid='';
    public $alertRequired='';

    public $initialReadOnly = false;
    public $initialActivation = true;

    protected $form;
    protected $container;


    function __construct($ref){
        $this->ref = $ref;
        $this->datatype = new jDatatypeString();
    }

    function setForm($form) {
        $this->form = $form;
        $this->container = $form->getContainer();
        if($this->initialReadOnly)
            $this->container->setReadOnly($this->ref, true);
        if(!$this->initialActivation)
            $this->container->deactivate($this->ref, true);
    }

    /**
     * says if the control can have multiple values
     */
    function isContainer(){
        return false;
    }

    function check(){
        $value = $this->container->data[$this->ref];
        if(trim($value) == '') {
            if($this->required)
                return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
            if (!$this->datatype->allowWhitespace())  {
                $this->container->data[$this->ref] = trim($value);
            }
        }elseif(!$this->datatype->check($value)){
            return $this->container->errors[$this->ref] = jForms::ERRDATA_INVALID;
        }elseif($this->datatype instanceof jIFilteredDatatype) {
            $this->container->data[$this->ref] = $this->datatype->getFilteredValue();
        }
        return null;
    }

    function setData($value) {
        $this->container->data[$this->ref] = $value;
    }

    function setReadOnly($r = true){
        $this->container->setReadOnly($this->ref, $r);
    }

    function setValueFromRequest($request) {
        $this->setData($request->getParam($this->ref,''));
    }

    function setDataFromDao($value, $daoDatatype) {
        $this->setData($value);
    }

    function getDisplayValue($value){
        return $value;
    }

    /**
     * says if the content is html or not
     * @since 1.2
     */
    public function isHtmlContent() {
        return false;
    }

    public function deactivate($deactivation=true) {
        $this->container->deactivate($this->ref, $deactivation);
    }

    /**
    * check if the control is activated
    * @return boolean true if it is activated
    */
    public function isActivated() {
        return $this->container->isActivated($this->ref);
    }

    /**
     * check if the control is readonly
     * @return boolean true if it is readonly
     */
    public function isReadOnly() {
        return $this->container->isReadOnly($this->ref);
    }
}

require(JELIX_LIB_PATH.'forms/controls/jFormsControlDatasource.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlGroups.class.php');

require(JELIX_LIB_PATH.'forms/controls/jFormsControlCaptcha.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlCheckbox.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlCheckboxes.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlChoice.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlGroup.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlReset.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlHidden.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlHtmlEditor.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlInput.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlListbox.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlRadiobuttons.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlMenulist.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlOutput.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlRepeat.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlSecret.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlSecretConfirm.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlSubmit.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlSwitch.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlTextarea.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlUpload.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlDate.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlDatetime.class.php');
require(JELIX_LIB_PATH.'forms/controls/jFormsControlWikiEditor.class.php');

