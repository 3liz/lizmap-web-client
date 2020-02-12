<?php

/**
 * @author    Laurent Jouanneau
 * @copyright 2019-2020 Laurent Jouanneau
 *
 * @see      https://jelix.org
 *
 * @license MIT
 */

/**
 * Widget allowing to select a value by showing results from a search after
 * the user start to type a name. The search is made by doing an http request
 * to the server. See jAutocompleteAjax jqueryui plugin, which is base on the
 * autocomplete plugin.
 *
 * You should use a menulist control, and a datasource, inheriting from
 * jFormsDaoDatasource or jFormsDynamicDatasource, and having a getData() method
 * returning an empty list.
 *
 * The widget accepts a specific attribute, 'attr-autocomplete', an array
 * which should contains at least an item 'source' indicating the url of the search
 * engine. The array may contains other attributes for the input element used to
 * type the search term (class, style..).
 *
 * example of use:
 *
 * In the form file:
 * ```
 *     <menulist ref="mylist"> <label>test</label>
 *     <datasource class="mymodule~mydatasource"/>
 *     </menulist>
 * ```
 * The datasource:
 * ```
 * class mydatasource extends jFormsDaoDatasource {
 *    function __construct($formId) {
 *       parent::__construct ("mymodule~myDao" , "findAll" , "label", 'id');
 *    }
 *    public function getData($form) { return array(); }
 *  }
 * ```
 *
 * In a template:
 * ```
 * {form $form, $submitAction, $submitParam, 'html', array('plugins'=>array(
 *      'mylist'=>'autocompleteajax_html'))}
 *
 * {formcontrols}
 *    ... {ifctrl 'mylist'}{ctrl_control '', array(
 *          'attr-autocomplete'=>array('style'=>'width:40em;',
 *              'source'=>$searchUrl))}
 *        {else}{ctrl_control}{/ifctrl}
 * {/formcontrols}
 * ```
 *
 */
class autocompleteajax_htmlFormWidget  extends \jelix\forms\HtmlWidget\WidgetBase {

    protected function outputJs($source) {
        $ctrl = $this->ctrl;
        $jFormsJsVarName = $this->builder->getjFormsJsVarName();

        $this->parentWidget->addJs("c = new ".$jFormsJsVarName."ControlString('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n");
        if ($ctrl instanceof jFormsControlDatasource
            && $ctrl->datasource instanceof jIFormsDynamicDatasource) {
            $dependentControls = $ctrl->datasource->getCriteriaControls();
            if ($dependentControls) {
                $this->parentWidget->addJs("c.dependencies = ['".implode("','",$dependentControls)."'];\n");
                $this->parentWidget->addFinalJs("jFormsJQ.tForm.declareDynamicFill('".$ctrl->ref."');\n");
            }
        }
        $this->commonJs();
        $searchInId = (strpos($this->getCSSClass(), 'autocomplete-search-in-id') !== false);

        $this->parentWidget->addFinalJs('$(\'#'.$this->getId().
            '_autocomplete\').jAutocompleteAjax({source:"'.$source.
            '", searchInId: '.($searchInId?'true':'false').'});');
        $resp = jApp::coord()->response;
        if ($resp instanceof jResponseHtml) {
            $config = jApp::config();
            $www = $config->urlengine['jelixWWWPath'];
            $resp->addJSLink($www.'js/jforms/jAutocompleteAjax.jqueryui.js');
        }
    }

    function outputControl() {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        if (isset($attr['readonly'])) {
            $attr['disabled'] = 'disabled';
            unset($attr['readonly']);
        }

        $attr['class'] .= ' autocomplete-value';
        $attr['value'] = $value;
        $attr['title'] = $this->ctrl->getDisplayValue($value);

        $attrAutoComplete = array(
            'placeholder'=> jLocale::get('jelix~jforms.autocomplete.placeholder'),
        );
        if (isset($attr['attr-autocomplete'])) {
            $attrAutoComplete = array_merge($attrAutoComplete, $attr['attr-autocomplete']);
            unset($attr['attr-autocomplete']);
        }
        if (isset($attrAutoComplete['class'])) {
            $attrAutoComplete['class'] .= ' autocomplete-input';
        }
        else {
            $attrAutoComplete['class'] = ' autocomplete-input';
        }
        if (isset($attrAutoComplete['style'])) {
            $attrAutoComplete['style'] .= 'display:none';
        }
        else {
            $attrAutoComplete['style'] = 'display:none';
        }
        $attrAutoComplete['id'] = $this->getId().'_autocomplete';

        $source = isset($attrAutoComplete['source'])?$attrAutoComplete['source']:'';

        echo '<div class="autocomplete-box"><input type="text" ';
        $this->_outputAttr($attrAutoComplete);
        echo '> <span class="autocomplete-no-search-results" style="display:none">'.jLocale::get('jelix~jforms.autocomplete.no.results').'</span> 
                <button class="autocomplete-trash btn btn-mini" title="Effacer" type="button"><i class="icon-trash"></i></button>
                <input type="hidden" ';
        $this->_outputAttr($attr);
        echo '/>';

        echo "</div>\n";
        $this->outputJs($source);
    }
}
