<?php
/**
* @package    jelix-modules
* @subpackage jelix
* @author     Laurent Jouanneau
* @contributor Julien Issler
* @copyright  2010-2015 Laurent Jouanneau
* @copyright  2015 Julien Issler
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

        if (!$this->request->isPostMethod() || !$this->request->isAjax()) {
            $rep = $this->getResponse('text', true);
            $rep->setHttpStatus('405', 'Method Not Allowed');
            return $rep;
        }

        $rep = $this->getResponse('json', true);

        try {
            $form = jForms::get($this->param('__form'), $this->param('__formid'));
            if (!$form) {
                throw new Exception ('dummy');
            }
        }
        catch(Exception $e) {
            $rep = $this->getResponse('text', true);
            $rep->setHttpStatus('422', 'Unprocessable entity');
            $rep->content = 'invalid form selector';
            return $rep;
        }

        // check CSRF
        if ($form->securityLevel == jFormsBase::SECURITY_CSRF) {
            if ($form->getContainer()->token !== $this->param('__JFORMS_TOKEN__')) {
                $rep = $this->getResponse('text', true);
                $rep->setHttpStatus('422', 'Unprocessable entity');
                $rep->content = 'invalid token';
                jLog::logEx(new jException("jelix~formserr.invalid.token"), "error");
                return $rep;
            }
        }

        // retrieve the control to fill
        $control = $form->getControl($this->param('__ref'));
        if (!$control || ! ($control instanceof jFormsControlDatasource)) {
            $rep = $this->getResponse('text', true);
            $rep->setHttpStatus('422', 'Unprocessable entity');
            $rep->content = 'bad control';
            return $rep;
        }

        if (!($control->datasource instanceof jIFormsDynamicDatasource)) {
            $rep = $this->getResponse('text', true);
            $rep->setHttpStatus('422', 'Unprocessable entity');
            $rep->content = 'not supported datasource type';
            return $rep;
        }

        $dependentControls = $control->datasource->getCriteriaControls();
        if (!$dependentControls) {
            $rep = $this->getResponse('text', true);
            $rep->setHttpStatus('422', 'Unprocessable entity');
            $rep->content = 'no dependent controls';
            return $rep;
        }

        foreach ($dependentControls as $ctname) {
            $form->setData($ctname, $this->param($ctname));
        }

        $rep->data = array();
        if($control->datasource->hasGroupedData()){
            foreach($control->datasource->getData($form) as $k=>$items){
                $data = array();
                foreach ($items as $k2=>$v) {
                    $data[] = array('value'=>$k2,'label'=>$v);
                }
                $rep->data[] = array('items'=>$data,'label'=>$k);
            }
        }
        else{
            foreach($control->datasource->getData($form) as $k=>$v) {
                $rep->data[] = array('value'=>$k,'label'=>$v);
            }
        }

        return $rep;
    }

}

