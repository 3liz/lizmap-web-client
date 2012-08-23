<?php

/**
* page for Installation wizard
*
* @package     InstallWizard
* @subpackage  pages
* @author      Laurent Jouanneau
* @copyright   2010 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class confmailWizPage extends installWizardPage {
    
    /**
     * action to display the page
     * @param jTpl $tpl the template container
     */
    function show ($tpl) {
        if (!isset($_SESSION['confmail'])) {
            $_SESSION['confmail'] = $this->loadconf();
        }

        $tpl->assign($_SESSION['confmail']);

        return true;
    }
    
    /**
     * action to process the page after the submit
     */
    function process() {
        $ini = new jIniFileModifier(jApp::configPath('defaultconfig.ini.php'));
        $errors = array();
        $_SESSION['confmail']['webmasterEmail'] = trim($_POST['webmasterEmail']);
        if ($_SESSION['confmail']['webmasterEmail'] == '') {
            $errors[] = $this->locales['error.missing.webmasterEmail'];
        }
        else {
            $ini->setValue('webmasterEmail',$_SESSION['confmail']['webmasterEmail'], 'mailer');
        }
        $_SESSION['confmail']['webmasterName'] = trim($_POST['webmasterName']);

         $mailerType = $_SESSION['confmail']['mailerType'] = $_POST['mailerType'];
         $ini->setValue('mailerType',$mailerType, 'mailer');

        if ($mailerType == 'sendmail') {
            $_SESSION['confmail']['sendmailPath'] = trim($_POST['sendmailPath']);
            if ($_SESSION['confmail']['sendmailPath'] == '') {
                $errors[] = $this->locales['error.missing.sendmailPath'];
            }
            else {
                $ini->setValue('sendmailPath',$_SESSION['confmail']['sendmailPath'], 'mailer');
            }
        }
        elseif ($mailerType == 'smtp') {
            $_SESSION['confmail']['smtpHost'] = trim($_POST['smtpHost']);
            if ($_SESSION['confmail']['smtpHost'] == '') {
                $errors[] = $this->locales['error.missing.smtpHost'];
            }
            else {
                $ini->setValue('smtpHost',$_SESSION['confmail']['smtpHost'], 'mailer');
            }
            $smtpPort = $_SESSION['confmail']['smtpPort'] = trim($_POST['smtpPort']);
            if ($smtpPort != '' && intval($smtpPort) == 0) {
                $errors[] = $this->locales['error.smtpPort'];
            }
            else {
                $ini->setValue('smtpPort',$smtpPort, 'mailer');
            }
            $_SESSION['confmail']['smtpSecure'] = trim($_POST['smtpSecure']);

            if (isset($_POST['smtpAuth'])) {
                $smtpAuth = $_SESSION['confmail']['smtpAuth'] = trim($_POST['smtpAuth']);
                $smtpAuth = ($smtpAuth != '');
            }
            else $smtpAuth= false;

            $ini->setValue('smtpAuth',$smtpAuth, 'mailer');
            if ($smtpAuth) {
                $_SESSION['confmail']['smtpUsername'] = trim($_POST['smtpUsername']);
                if ($_SESSION['confmail']['smtpUsername'] == '') {
                    $errors[] = $this->locales['error.missing.smtpUsername'];
                }
                else {
                    $ini->setValue('smtpUsername',$_SESSION['confmail']['smtpUsername'], 'mailer');
                }
                $_SESSION['confmail']['smtpPassword'] = trim($_POST['smtpPassword']);
                if ($_SESSION['confmail']['smtpPassword'] == '') {
                    $errors[] = $this->locales['error.missing.smtpPassword'];
                }
                else {
                    $ini->setValue('smtpPassword',$_SESSION['confmail']['smtpPassword'], 'mailer');
                }
            }
        }
        if (count($errors)) {
            $_SESSION['confmail']['errors'] = $errors;
            return false;
        }
        $ini->save();
        unset($_SESSION['confmail']);
        return 0;
    }


    protected function loadconf() {
        $ini = new jIniFileModifier(jApp::configPath('defaultconfig.ini.php'));
        $emailConfig = array(
            'webmasterEmail'=>$ini->getValue('webmasterEmail','mailer'),
            'webmasterName'=>$ini->getValue('webmasterName','mailer'),
            'mailerType'=>$ini->getValue('mailerType','mailer'),
            'hostname'=>$ini->getValue('hostname','mailer'),
            'sendmailPath'=>$ini->getValue('sendmailPath','mailer'),
            'smtpHost'=>$ini->getValue('smtpHost','mailer'),
            'smtpPort'=>$ini->getValue('smtpPort','mailer'),
            'smtpSecure'=>$ini->getValue('smtpSecure','mailer'),
            'smtpHelo'=>$ini->getValue('smtpHelo','mailer'),
            'smtpAuth'=>$ini->getValue('smtpAuth','mailer'),
            'smtpUsername'=>$ini->getValue('smtpUsername','mailer'),
            'smtpPassword'=>$ini->getValue('smtpPassword','mailer'),
            'smtpTimeout'=>$ini->getValue('smtpTimeout','mailer'),
            'errors'=>array()
        );

        if (!in_array($emailConfig['mailerType'], array('mail','sendmail','smtp')))
            $emailConfig['mailerType'] = 'mail';

        return $emailConfig;
    }


}