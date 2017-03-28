<?php

namespace jelix\forms\Captcha;

class SimpleCaptchaValidator implements CaptchaValidatorInterface {

    /**
     * called by the widget to initialize some data when the form is generated
     *
     * It can returns some data that can be useful for the widget, and which will
     * be passed to validate() method ($internalData)
     * @return mixed
     */
    public function initOnDisplay() {
        $numbers = \jLocale::get('jelix~captcha.number');
        $id = rand(1,intval($numbers));
        return array(
            'question'=> \jLocale::get('jelix~captcha.question.'.$id),
            'expectedresponse' => \jLocale::get('jelix~captcha.response.'.$id)
        );
    }

    /**
     * Validate the data coming from the submitted form.
     *
     * It should returns null if it is ok, or one of jForms::ERRDATA_* constant
     *
     * @param string $value the value of the control if it exists
     * @param mixed
     * @return null|integer
     */
    public function validate($value, $internalData) {
        if (trim($value) == '') {
            return \jForms::ERRDATA_REQUIRED;
        }elseif(!$internalData ||
                !is_array($internalData) ||
                ! isset($internalData['expectedresponse']) ||
                $value != $internalData['expectedresponse']){
            return \jForms::ERRDATA_INVALID;
        }
        return null;
    }

}