<?php
/**
* @package     jelix
* @subpackage  forms_builder_plugin
* @author      Laurent Jouanneau
* @contributor Julien Issler, Dominique Papin, Olivier Demah
* @copyright   2006-2012 Laurent Jouanneau
* @copyright   2008 Julien Issler, 2008 Dominique Papin
* @copyright   2009 Olivier Demah
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  forms_builder_plugin
 */
class htmlFormBuilder extends \jelix\forms\Builder\HtmlBuilder {

    protected $jFormsJsVarName = 'jFormsJQ';

    public function outputMetaContent($t) {
        $resp= jApp::coord()->response;
        if($resp === null || $resp->getType() !='html'){
            return;
        }

        $confUrlEngine = &jApp::config()->urlengine;
        $www = $confUrlEngine['jelixWWWPath'];

        $resp->addJSLink(jApp::config()->jquery['jquery']);
        $resp->addJSLink($www.'/jquery/include/jquery.include.js');
        $resp->addJSLink($www.'js/jforms_jquery.js');
        $resp->addCSSLink($www.'design/jform.css');

        //we loop on root control has they fill call the outputMetaContent recursively
        foreach( $this->_form->getRootControls() as $ctrlref=>$ctrl) {
            if($ctrl->type == 'hidden') continue;
            if(!$this->_form->isActivated($ctrlref)) continue;

            $widget = $this->getWidget($ctrl, $this->rootWidget);
            $widget->outputMetaContent($resp);
        }
    }


}
