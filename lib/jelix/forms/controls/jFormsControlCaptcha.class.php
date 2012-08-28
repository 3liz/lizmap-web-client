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
 * captcha control
 * @package     jelix
 * @subpackage  forms
 * @since 1.1
 */
class jFormsControlCaptcha extends jFormsControl {
    public $type = 'captcha';
    public $question='';
    public $required = true;
    function check(){
        $value = $this->container->data[$this->ref];
        if(trim($value) == '') {
            return $this->container->errors[$this->ref] = jForms::ERRDATA_REQUIRED;
        }elseif($value !=  $this->container->privateData[$this->ref]){
            return $this->container->errors[$this->ref] = jForms::ERRDATA_INVALID;
        }
        return null;
    }

    function initExpectedValue(){
        $numbers = jLocale::get('jelix~captcha.number');
        $id = rand(1,intval($numbers));
        $this->question = jLocale::get('jelix~captcha.question.'.$id);
        $this->container->privateData[$this->ref] = jLocale::get('jelix~captcha.response.'.$id);
    }
}

