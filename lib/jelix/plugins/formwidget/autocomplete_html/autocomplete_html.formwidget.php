<?php

/**
 * @author    Laurent Jouanneau
 * @copyright 2019 Laurent Jouanneau
 *
 * @see      https://jelix.org
 *
 * @license MIT
 */

/**
 * Widget allowing to select a value by showing results from a search after
 * the user starts to type a name. The search is made into a select html element
 * filled by the datasource of the control, which should be a menulist.
 * See jAutocomplete jqueryui plugin, which is base on the autocomplete plugin.
 *
 * If the select box may contain hundred values, prefer to use the autocompleteajax_html widget.
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
 *     <datasource dao="mymodule~mydao"/>
 *     </menulist>
 * ```
 * In a template:
 * ```
 * {form $form, $submitAction, $submitParam, 'html', array('plugins'=>array(
 *      'mylist'=>'autocomplete_html'))}
 *
 * {formcontrols}
 *    ... {ifctrl 'mylist'}{ctrl_control '', array(
 *          'attr-autocomplete'=>array('style'=>'width:40em;')}
 *        {else}{ctrl_control}{/ifctrl}
 * {/formcontrols}
 * ```
 */
class autocomplete_htmlFormWidget  extends \jelix\forms\HtmlWidget\WidgetBase {

    protected function outputJs() {
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

        $this->parentWidget->addFinalJs('$(\'#'.$this->getId().'_autocomplete\').jAutocomplete({searchInId: '.($searchInId?'true':'false').'})');
        $resp = jApp::coord()->response;
        if ($resp instanceof jResponseHtml) {
            $config = jApp::config();
            $www = $config->urlengine['jelixWWWPath'];
            $resp->addJSLink($www.'js/jforms/jAutocomplete.jqueryui.js');
        }
    }

    function outputControl() {
        $attr = $this->getControlAttributes();
        $value = $this->getValue();

        if (isset($attr['readonly'])) {
            $attr['disabled'] = 'disabled';
            unset($attr['readonly']);
        }

        $attr['size'] = '1';
        $attr['class'] .= ' autocomplete-select';

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



        echo '<div class="autocomplete-box"><input type="text" ';
        $this->_outputAttr($attrAutoComplete);
        echo '> <span class="autocomplete-no-search-results" style="display:none">pas de résultats</span> 
                <button class="autocomplete-trash btn btn-mini" title="Effacer" type="button"><i class="icon-trash"></i></button> 
                <select';
        $this->_outputAttr($attr);
        echo ">\n";

        if(is_array($value)){
            if(isset($value[0]))
                $value = $value[0];
            else
                $value='';
        }
        $value = (string) $value;
        if ($this->ctrl->emptyItemLabel !== null || !$this->ctrl->required) {
            echo '<option value=""', ($value === '' ? ' selected="selected"' : ''), '>', htmlspecialchars($this->ctrl->emptyItemLabel), "</option>\n";
        }
        $this->fillSelect($this->ctrl, $value);
        echo "</select></div>\n";
        $this->outputJs();
    }
}
