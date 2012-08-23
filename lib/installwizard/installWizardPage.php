<?php

/**
* Installation wizard
*
* @package     InstallWizard
* @author      Laurent Jouanneau
* @copyright   2010 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

/**
 * base class to implement a wizard page
 */
class installWizardPage {

    /**
     * the locale key of the title of the page.
     */
    public $title = 'title';

    /**
     * The content of the configuration in the corresponding section of the page
     * in the main configuration (install.ini.php)
     * @var array
     */
    public $config;
    
    /**
     * the content of the locales file corresponding to the current lang
     * @var array
     */
    protected $locales = array();
    
    /**
     * list of errors or other data which will be used during the display
     * of the page if the submit has failed. must be a key=>value array.
     * It will be injected into the template.
     * @var array
     */
    protected $errors = array();
    
    /**
     * @param array $confParameters the content of the configuration
     * @param array $locales the content of the locales file
     */
    function __construct($confParameters, $locales) {
        $this->config = $confParameters;
        $this->locales = $locales;
    }
    
    /**
     * action to display the page.
     * @param jTpl $tpl the template container which will be used
     * to display the page. The template should be store in the
     * same directory of the page class, with the same prefix.
     * @return boolean true if the wizard can continue
     */
    function show ($tpl) {
        return true;
    }

    /**
     * action to process the page after the submit. you can call
     * $_POST to retrieve the content of the form of your template.
     * It should return the index of the "next" step name stored
     * in the configuration.
     *
     * @return integer|false the index of the "next" step name, or false if there are errors
     */
    function process() {
        return 0;
    }

    /**
     * internal use.
     * @return array the content of $errors.
     */
    function getErrors() {
        return $this->errors;
    }

    /**
     * return the localized string
     * @param string $key the key of the locale
     * @return string the localized string
     */
    function getLocale($key) {
        if(isset($this->locales[$key]))
            return $this->locales[$key];
        else return '';
    }
}
