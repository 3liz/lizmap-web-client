<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @copyright   2006-2008 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * this object is a container for form data
 * @package     jelix
 * @subpackage  forms
 */
class jFormsDataContainer {
    /**
     * contains data provided by the user in each controls
     * @var array
     */
    public $data = array();

    /**
     * contains data provided by the user in each controls
     * @var array
     * @see jFormsBase::getModifiedControls()
     * @see jFormsBase::initModifiedControlsList()
     */
    public $originalData = array();

    /**
     * internal use. Used by controls object to store some private data. (captcha for example)
     * @var array
     */
    public $privateData = array();

    /**
     * the instance id of the form
     * @var string
     */
    public $formId;
    /**
     * the selector of the xml file of the form
     * @var jSelectorForm
     */
    public $formSelector;

    /**
     * list of errors detected in data
     * @var array
     */
    public $errors = array();

    /**
     * the last date when the form has been used
     * @var integer
     */
    public $updatetime = 0;

    /**
     * token for security against CSRF
     */
    public $token = '';

    /**
     * reference counter for the 'anonymous' form id (jForms::DEFAULT_ID)
     */
    public $refcount = 0;

    /**
     *
     */
    protected $readOnly = array();

    /**
     *
     */
    protected $deactivated = array();
    /**
     *
     * @param jSelectorForm $formSelector
     * @param string $formId
     */
    function __construct($formSelector,$formId){
        $this->formId = $formId;
        $this->formSelector =$formSelector;
    }

    function unsetData($name){
        unset($this->data[$name]);
    }

    function clear(){
        $this->data = array();
        $this->errors = array();
        $this->originalData = array();
        $this->privateData = array();
    }

    public function deactivate($name, $deactivation=true) {
        if($deactivation) {
            $this->deactivated[$name]=true;
        }
        else {
            if(isset($this->deactivated[$name]))
                unset($this->deactivated[$name]);
        }
    }

    public function setReadOnly($name, $readonly=true) {
        if($readonly) {
            $this->readOnly[$name]=true;
        }
        else {
            if(isset($this->readOnly[$name]))
                unset($this->readOnly[$name]);
        }
    }

    /**
    * check if a control is activated
    * @param string $name the control name
    * @return boolean true if it is activated
    */
    public function isActivated($name) {
        return !isset($this->deactivated[$name]);
    }

    /**
    * check if a control is activated
    * @param string $name the control name
    * @return boolean true if it is activated
    */
    public function isReadOnly($name) {
        return isset($this->readOnly[$name]);
    }


}
