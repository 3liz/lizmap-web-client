<?php

/**
 * @author    3liz
 * @copyright 2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Form;

trait WidgetTrait
{
    protected function getCSSClass()
    {
        $ro = $this->ctrl->isReadOnly();

        if (isset($this->attributes['class'])) {
            $class = $this->attributes['class'].' ';
        } else {
            $class = '';
        }

        if (isset($this->attributes['bootstrapClass'])) {
            $class .= $this->attributes['bootstrapClass'].' ';
        } elseif (isset($this->defaultAttributes['bootstrapClass'])) {
            $class .= $this->defaultAttributes['bootstrapClass'].' ';
        }

        $class .= 'jforms-ctrl-'.$this->ctrl->type;
        $class .= ($this->ctrl->required == false || $ro ? '' : ' jforms-required');
        $class .= (isset($this->builder->getForm()->getContainer()->errors[$this->ctrl->ref]) ? ' jforms-error is-invalid' : '');
        $class .= ($ro && $this->ctrl->type != 'captcha' ? ' jforms-readonly' : '');

        $attrClass = $this->ctrl->getAttribute('class');
        if ($attrClass) {
            $class .= ' '.$attrClass;
        }

        return $class;
    }

    protected function outputLabelAsTitle($label, $attr)
    {
        echo '<label class="',$attr['class'],'"',$attr['idLabel'],$attr['hint'],'>';
        echo htmlspecialchars($label, ENT_COMPAT | ENT_SUBSTITUTE), $attr['reqHtml'];
        echo "</label>\n";
    }
}
