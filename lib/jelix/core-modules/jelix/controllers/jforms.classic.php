<?php
/**
* @package    jelix-modules
* @subpackage jelix
* @author     Laurent Jouanneau
* @copyright  2010 Laurent Jouanneau
* @licence    http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
*/

/**
 * @package    jelix-modules
 * @subpackage jelix
 */
class jformsCtrl extends jController {

    /**
    * web service for XHR request when a control should be filled with a list
    * of values, depending of the value of an other control.
    */
    public function getListData() {
        $rep = $this->getResponse('json', true);

        try {
            $form = jForms::get($this->param('__form'), $this->param('__formid'));
            if (!$form) {
                throw new Exception ('dummy');
            }
        }
        catch(Exception $e) {
            throw new Exception ('invalid form selector');
        }

        // check CSRF
        if ($form->securityLevel == jFormsBase::SECURITY_CSRF) {
            if ($form->getContainer()->token !== $this->param('__JFORMS_TOKEN__'))
                throw new jException("jelix~formserr.invalid.token");
        }

        // retrieve the control to fill
        $control = $form->getControl($this->param('__ref'));
        if (!$control || ! ($control instanceof jFormsControlDatasource))
            throw new Exception('bad control');

        if (!($control->datasource instanceof jFormsDaoDatasource))
            throw new Exception('not supported datasource type');

        $dependentControls = $control->datasource->getDependentControls();
        if (!$dependentControls) {
            throw new Exception('no dependent controls');
        }

        foreach ($dependentControls as $ctname) {
            $form->setData($ctname, $this->param($ctname));
        }

        $rep->data = array('data'=> $control->datasource->getData($form));

        return $rep;
    }

}

