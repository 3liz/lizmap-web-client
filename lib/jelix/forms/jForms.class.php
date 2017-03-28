<?php
/**
* @package     jelix
* @subpackage  forms
* @author      Laurent Jouanneau
* @copyright   2006-2009 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 *
 */
require_once(JELIX_LIB_PATH.'forms/jFormsBase.class.php');

/**
 * static class to manage and call a form
 *
 * A form is identified by a selector, and each instance of a form have a unique id (formId).
 * This id can be the id of a record for example. If it is not given, the id is set to 0.
 * @package     jelix
 * @subpackage  forms
 */
class jForms {

    const ID_PARAM = '__forms_id__';

    const DEFAULT_ID = 0;

    const ERRDATA_INVALID = 1;
    const ERRDATA_REQUIRED = 2;
    const ERRDATA_INVALID_FILE_SIZE = 3;
    const ERRDATA_INVALID_FILE_TYPE = 4;
    const ERRDATA_FILE_UPLOAD_ERROR = 5;

    /**
     * pure static class, so no constructor
     */
    private function __construct(){ }

    /**
     * Create a new form with empty data
     *
     * Call it to create a new form, before to display it.
     * Data of the form are stored in the php session in a jFormsDataContainer object.
     * If a form with same id exists, data are erased.
     *
     * @param string $formSel the selector of the xml jform file
     * @param string $formId  the id of the new instance (an id of a record for example)
     * @return jFormsBase the object representing the form
     */
    public static function create($formSel, $formId=null){
        $sel = new jSelectorForm($formSel);
        // normalize the selector to avoid conflict in session
        $formSel = $sel->toString(); 
        jIncluder::inc($sel);
        $c = $sel->getClass();
        if($formId === null || $formId === '')
            $formId = self::DEFAULT_ID;
        $fid = is_array($formId) ? serialize($formId) : $formId;
        if(!isset($_SESSION['JFORMS'][$formSel][$fid])){
            $dc = $_SESSION['JFORMS'][$formSel][$fid]= new jFormsDataContainer($formSel, $formId);
            if (is_numeric($formId) && $formId == self::DEFAULT_ID) {
                $dc->refcount = 1;
            }
        }
        else {
            $dc = $_SESSION['JFORMS'][$formSel][$fid];
            if (is_numeric($formId) && $formId == self::DEFAULT_ID) 
                $dc->refcount++;
        }
        $form = new $c($formSel, $dc, true);
        return $form;
    }

    /**
     * get an existing instance of a form
     *
     * In your controller, call it before to re-display a form with existing data.
     *
     * @param string $formSel the selector of the xml jform file
     * @param string $formId  the id of the form (if you use multiple instance of a form)
     * @return jFormsBase the object representing the form. Return null if there isn't an existing form
     */
    static public function get($formSel, $formId=null){

        if($formId === null || $formId === '')
            $formId= self::DEFAULT_ID;
        $fid = is_array($formId) ? serialize($formId) : $formId;

        $sel = new jSelectorForm($formSel);
        // normalize the selector to avoid conflict in session
        $formSel = $sel->toString();

        if(!isset($_SESSION['JFORMS'][$formSel][$fid])){
            return null;
        }

        jIncluder::inc($sel);
        $c = $sel->getClass();
        $form = new $c($formSel, $_SESSION['JFORMS'][$formSel][$fid],false);

        return $form;
    }

    /**
     * get an existing instance of a form, and fill it with data provided by the request
     *
     * use it in the action called to submit a webform.
     *
     * @param string $formSel the selector of the xml jform file
     * @param string $formId  the id of the form (if you use multiple instance of a form)
     * @return jFormsBase the object representing the form. Return null if there isn't an existing form
     */
    static public function fill($formSel,$formId=null){
        $form = self::get($formSel,$formId);
        if($form)
            $form->initFromRequest();
        return $form;
    }

    /**
     * destroy a form in the session
     *
     * use it after saving data of a form, and if you don't want to re-display the form.
     *
     * @param string $formSel the selector of the xml jform file
     * @param string $formId  the id of the form (if you use multiple instance of a form)
     */
    static public function destroy($formSel, $formId=null){

        if($formId === null || $formId === '')  $formId = self::DEFAULT_ID;
        if(is_array($formId)) $formId = serialize($formId);
        
        // normalize the selector to avoid conflict in session
        $sel = new jSelectorForm($formSel);
        $formSel = $sel->toString();

        if(isset($_SESSION['JFORMS'][$formSel][$formId])){
            if (is_numeric($formId) && $formId == self::DEFAULT_ID) {
                if((--$_SESSION['JFORMS'][$formSel][$formId]->refcount) > 0) {
                    $_SESSION['JFORMS'][$formSel][$formId]->clear();
                    return;
                }
            }
            unset($_SESSION['JFORMS'][$formSel][$formId]);
        }
    }

    /**
     * destroy all form which are too old and unused
     * @param integer $life the number of second of a life of a form
     */
    static public function clean($formSel='', $life=86400) {
        if(!isset($_SESSION['JFORMS'])) return;
        if($formSel=='') {
            $t = time();
            foreach($_SESSION['JFORMS'] as $sel=>$f) {
                // don't call clean itself, see bug #1154
                foreach($_SESSION['JFORMS'][$sel] as $id=>$cont) {
                    if($t-$cont->updatetime > $life)
                        unset($_SESSION['JFORMS'][$sel][$id]);
                }
            }
        } else {
            // normalize the selector to avoid conflict in session
            $sel = new jSelectorForm($formSel);
            $formSel = $sel->toString();
            
            if(isset($_SESSION['JFORMS'][$formSel])) {
                $t = time();
                foreach($_SESSION['JFORMS'][$formSel] as $id=>$cont) {
                    if($t-$cont->updatetime > $life)
                        unset($_SESSION['JFORMS'][$formSel][$id]);
                }
            }
        }
    }
}
