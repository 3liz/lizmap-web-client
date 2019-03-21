<?php
/**
 * @author    3liz
 * @copyright 2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
interface qgisFormControlsInterface
{
    /**
     * @return qgisFormControl[]
     */
    public function getQgisControls();

    /**
     * @param string $name
     *
     * @return null|qgisFormControl null if the control does not exists
     */
    public function getQgisControl($name);

    /**
     * Return the control name for the jForms form.
     *
     * @param string $name the name of the qgis control
     *
     * @return null|string null if the control does not exist
     */
    public function getFormControlName($name);
}
