<?php

/**
 * page to install the demo
 */
class demoWizPage extends installWizardPage {
    
    /**
     * action to display the page
     * @param jTpl $tpl the template container
     */
    function show ($tpl) {
        if (!isset($_SESSION['installdemo'])) {
            $_SESSION['installdemo'] = false;
        }

        $tpl->assign('installdemo', $_SESSION['installdemo']);

        return true;
    }
    
    /**
     * action to process the page after the submit
     */
    function process() {

        $ini = new jIniFileModifier(jApp::mainConfigFile());
        $_SESSION['installdemo'] = ($_POST['installdemo'] == 'on');
               
        $parameters = $ini->getValue('lizmap.parameters','modules');
        
        if ($parameters === null) {
            $parameters = '';
        }

        if (strpos($parameters, 'demo') === false) {
            if ($_SESSION['installdemo']) {
                $parameters .= 'demo';
            }
        }
        else {
            if (!$_SESSION['installdemo']) {
                $parameters = str_replace('demo','', $parameters);
            }
        }

        $ini->setValue('lizmap.parameters', $parameters, 'modules');
        $ini->save();
        unset($_SESSION['installdemo']);
        return 0;
    } 
}