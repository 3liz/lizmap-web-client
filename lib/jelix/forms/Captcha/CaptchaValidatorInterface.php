<?php

namespace jelix\forms\Captcha;

interface CaptchaValidatorInterface {

    /**
     * called by the widget to initialize some data when the form is generated
     *
     * It can returns some data that can be useful for the widget
     * @return mixed
     */
    public function initOnDisplay();

    /**
     * Validate the data coming from the submitted form.
     *
     * It should returns null if it is ok, or one of jForms::ERRDATA_* constant
     *
     * @param string $value the value of the control if it exists
     * @param mixed
     * @return null|integer
     */
    public function validate($value, $internalData);


}