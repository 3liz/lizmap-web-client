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

        $configFile = jApp::configPath('localconfig.ini.php');
        if (!file_exists($configFile)) {
            copy(jApp::configPath('localconfig.ini.php.dist'), $configFile);
        }

        $ini = new jIniFileModifier($configFile);
        $_SESSION['installdemo'] = ($_POST['installdemo'] == 'on');
               
        $parameters = $ini->getValue('lizmap.installparam','modules');
        
        if ($parameters === null) {
            $parameters = '';
        }

        if (strpos($parameters, 'demo') === false) {
            if ($_SESSION['installdemo']) {
                $parameters .= (trim($parameters) == '' ? 'demo':',demo');
            }
        }
        else {
            if (!$_SESSION['installdemo']) {
                $parameters = str_replace('demo','', $parameters);
            }
        }

        $ini->setValue('lizmap.installparam', $parameters, 'modules');
        $ini->save();
        unset($_SESSION['installdemo']);
        return 0;
    } 
}