<?php
/**
* @package     jelix
* @subpackage  formwidgets
* @author      Claudio Bernardes
* @contributor Laurent Jouanneau, Julien Issler, Dominique Papin
* @copyright   2012 Claudio Bernardes
* @copyright   2006-2012 Laurent Jouanneau, 2008-2011 Julien Issler, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * HTML form builder
 * @package     jelix
 * @subpackage  jelix-plugins
 * @link http://developer.jelix.org/wiki/rfc/jforms-controls-plugins
 */

class input_htmlFormWidget extends \jelix\forms\HtmlWidget\WidgetBase {
    protected function outputJs() {
        $ctrl = $this->ctrl;

        $datatype = array('jDatatypeBoolean'=>'Boolean','jDatatypeDecimal'=>'Decimal','jDatatypeInteger'=>'Integer','jDatatypeHexadecimal'=>'Hexadecimal',
                        'jDatatypeDateTime'=>'Datetime','jDatatypeDate'=>'Date','jDatatypeTime'=>'Time',
                        'jDatatypeUrl'=>'Url','jDatatypeEmail'=>'Email','jDatatypeIPv4'=>'Ipv4','jDatatypeIPv6'=>'Ipv6');
        $isLocale = false;
        $data_type_class = get_class($ctrl->datatype);
        if(isset($datatype[$data_type_class]))
            $dt = $datatype[$data_type_class];
        else if ($ctrl->datatype instanceof jDatatypeLocaleTime)
            { $dt = 'Time'; $isLocale = true; }
        else if ($ctrl->datatype instanceof jDatatypeLocaleDate)
            { $dt = 'LocaleDate'; $isLocale = true; }
        else if ($ctrl->datatype instanceof jDatatypeLocaleDateTime)
            { $dt = 'LocaleDatetime'; $isLocale = true; }
        else
            $dt = 'String';

        $jFormsJsVarName = $this->builder->getjFormsJsVarName();
        $js = "c = new ".$jFormsJsVarName."Control".$dt."('".$ctrl->ref."', ".$this->escJsStr($ctrl->label).");\n";
        if ($isLocale)
            $js .="c.lang='".jApp::config()->locale."';\n";

        $maxv= $ctrl->datatype->getFacet('maxValue');
        if($maxv !== null)
            $js .="c.maxValue = '$maxv';\n";

        $minv= $ctrl->datatype->getFacet('minValue');
        if($minv !== null)
            $js .="c.minValue = '$minv';\n";

        $maxl= $ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $js .="c.maxLength = '$maxl';\n";

        $minl= $ctrl->datatype->getFacet('minLength');
        if($minl !== null)
            $js .="c.minLength = '$minl';\n";
        $re = $ctrl->datatype->getFacet('pattern');
        if($re !== null)
            $js .="c.regexp = ".$re.";\n";

        $this->parentWidget->addJs($js);
        $this->commonJs();
    }

    function outputControl() {
        $attr = $this->getControlAttributes();

        if ($this->ctrl->size != 0)
            $attr['size'] = $this->ctrl->size;
        $maxl= $this->ctrl->datatype->getFacet('maxLength');
        if($maxl !== null)
            $attr['maxlength']=$maxl;
        $attr['value'] = $this->getValue();
        $attr['type'] = 'text';

        echo '<input';
        $this->_outputAttr($attr);
        echo "/>\n";
        $this->outputJs();
    }
}
