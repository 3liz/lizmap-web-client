<?php
/**
* jMailer : based on PHPMailer - PHP email class
* Class for sending email using either
* sendmail, PHP mail(), SMTP, or files for tests.  Methods are
* based upon the standard AspEmail(tm) classes.
*
* @package     jelix
* @subpackage  utils
* @author      Laurent Jouanneau
* @contributor Kévin Lepeltier, GeekBay, Julien Issler
* @copyright   2006-2016 Laurent Jouanneau
* @copyright   2008 Kévin Lepeltier, 2009 Geekbay
* @copyright   2010-2015 Julien Issler
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

require(LIB_PATH.'phpMailer/class.phpmailer.php');
require(LIB_PATH.'phpMailer/class.smtp.php');
require(LIB_PATH.'phpMailer/class.pop3.php');


/**
 * jMailer based on PHPMailer - PHP email transport class
 * @package jelix
 * @subpackage  utils
 * @author Laurent Jouanneau
 * @contributor Kévin Lepeltier
 * @copyright   2006-2008 Laurent Jouanneau
 * @copyright   2008 Kévin Lepeltier
 * @since 1.0b1
 * @see PHPMailer
 */
class jMailer extends PHPMailer {

    /**
     * the selector of the template used for the mail.
     * Use the Tpl() method to change this property
     * @var string
     */
    protected $bodyTpl = '';

    protected $defaultLang;

    /**
     * the path of the directory where to store mails
     * if mailer is file.
    */
    public $filePath = '';

    /**
     * indicates if mails should be copied into files, so the developer can verify that all mails are sent.
     */
    protected $copyToFiles = false;

    /**
     * initialize some member
     */
    function __construct(){
        $config = jApp::config();
        $this->defaultLang = $config->locale;
        $this->CharSet = $config->charset;
        $this->Mailer = $config->mailer['mailerType'];
        if ($config->mailer['mailerType']) {
            $this->Mailer = $config->mailer['mailerType'];
        }
        $this->Hostname = $config->mailer['hostname'];
        $this->Sendmail = $config->mailer['sendmailPath'];
        $this->Host = $config->mailer['smtpHost'];
        $this->Port = $config->mailer['smtpPort'];
        $this->Helo = $config->mailer['smtpHelo'];
        $this->SMTPAuth = $config->mailer['smtpAuth'];
        $this->SMTPSecure = $config->mailer['smtpSecure'];
        $this->Username = $config->mailer['smtpUsername'];
        $this->Password = $config->mailer['smtpPassword'];
        $this->Timeout = $config->mailer['smtpTimeout'];
        if ($config->mailer['webmasterEmail'] != '') {
            $this->From = $config->mailer['webmasterEmail'];
        }

        $this->FromName = $config->mailer['webmasterName'];
        $this->filePath = jApp::varPath($config->mailer['filesDir']);

        $this->copyToFiles = $config->mailer['copyToFiles'];

        parent::__construct(true);

    }

    /**
     * Sets Mailer to store message into files instead of sending it
     * useful for tests.
     * @return void
     */
    public function IsFile() {
        $this->Mailer = 'file';
    }


    /**
     * Find the name and address in the form "name<address@hop.tld>"
     * @param string $address
     * @param string $kind One of 'to', 'cc', 'bcc', or 'ReplyTo'
     * @return array( $name, $address )
     */
    function getAddrName($address, $kind = false) {
        if (preg_match ('`^([^<]*)<([^>]*)>$`', $address, $tab )) {
            $name = $tab[1];
            $addr = $tab[2];
        }
        else {
            $name = '';
            $addr = $address;
        }
        if ($kind) {
            $this->addAnAddress($kind, $addr, $name);
        }
        return array($addr, $name);
    }

    protected $tpl = null;

    /**
     * Adds a Tpl référence.
     * @param string $selector
     * @param boolean $isHtml  true if the content of the template is html.
     *                 IsHTML() is called.
     * @return jTpl the template object.
     */
    function Tpl( $selector, $isHtml = false ) {
        $this->bodyTpl = $selector;
        $this->tpl = new jTpl();
        $this->isHTML($isHtml);
        return $this->tpl;
    }

    /**
     * Creates message and assigns Mailer. If the message is
     * not sent successfully then it returns false.  Use the ErrorInfo
     * variable to view description of the error.
     * @return bool
     */
    function Send() {

        if (isset($this->bodyTpl) && $this->bodyTpl != "") {
            if ($this->tpl == null)
                $this->tpl = new jTpl();
            $mailtpl = $this->tpl;
            $metas = $mailtpl->meta( $this->bodyTpl , ($this->ContentType == 'text/html'?'html':'text') );

            if (isset($metas['Subject'])) {
                $this->Subject = $metas['Subject'];
            }

            if (isset($metas['Priority'])) {
                $this->Priority = $metas['Priority'];
            }
            $mailtpl->assign('Priority', $this->Priority );

            if (isset($metas['Sender'])) {
                $this->Sender = $metas['Sender'];
            }
            $mailtpl->assign('Sender', $this->Sender );

            if (isset($metas['to'])) {
                foreach ($metas['to'] as $val) {
                    $this->getAddrName($val, 'to');
                }
            }
            $mailtpl->assign('to', $this->to );

            if (isset($metas['cc'])) {
                foreach ($metas['cc'] as $val) {
                    $this->getAddrName($val, 'cc');
                }
            }
            $mailtpl->assign('cc', $this->cc );

            if (isset($metas['bcc'])) {
                foreach ($metas['bcc'] as $val) {
                    $this->getAddrName($val, 'bcc');
                }
            }
            $mailtpl->assign('bcc', $this->bcc);

            if (isset($metas['ReplyTo'])) {
                foreach ($metas['ReplyTo'] as $val) {
                    $this->getAddrName($val, 'Reply-To');
                }
            }
            $mailtpl->assign('ReplyTo', $this->ReplyTo );

            if (isset($metas['From'])) {
                $adr = $this->getAddrName($metas['From']);
                $this->setFrom($adr[0], $adr[1]);
            }

            $mailtpl->assign('From', $this->From );
            $mailtpl->assign('FromName', $this->FromName );

            if ($this->ContentType == 'text/html') {
                $this->msgHTML($mailtpl->fetch( $this->bodyTpl, 'html'));
            }
            else
                $this->Body = $mailtpl->fetch( $this->bodyTpl, 'text');
        }

        return parent::Send();
    }

    public function CreateHeader() {
        if ($this->Mailer == 'file') {
            // to have all headers in the file, like cc, bcc...
            $this->Mailer = 'sendmail';
            $headers = parent::CreateHeader();
            $this->Mailer = 'file';
            return $headers;
        }
        else {
            return parent::CreateHeader();
        }
    }

    /**
     * store mail in file instead of sending it
     * @access public
     * @return bool
     */
    protected function FileSend($header, $body) {
        return jFile::write ($this->getStorageFile(), $header.$body);
    }

    protected function getStorageFile() {
        return rtrim($this->filePath,'/').'/mail.'.jApp::coord()->request->getIP().'-'.date('Ymd-His').'-'.uniqid(mt_rand(), true);
    }

    function SetLanguage($lang_type = 'en', $lang_path = 'language/') {
        $lang = explode('_', $lang_type);
        return parent::SetLanguage($lang[0], $lang_path);
    }

    protected function lang($key) {
      if(count($this->language) < 1) {
        $this->SetLanguage($this->defaultLang); // set the default language
      }
      return parent::lang($key);
    }

    protected function sendmailSend($header, $body) {
        if ($this->copyToFiles)
            $this->copyMail($header, $body);
        return parent::SendmailSend($header, $body);
    }

    protected function MailSend($header, $body) {
        if ($this->copyToFiles)
            $this->copyMail($header, $body);
        return parent::MailSend($header, $body);
    }

    protected function smtpSend($header, $body) {
        if ($this->copyToFiles)
            $this->copyMail($header, $body);
        return parent::SmtpSend($header, $body);
    }

    protected function copyMail($header, $body) {
        $dir = rtrim($this->filePath,'/').'/copy-'.date('Ymd').'/';
        if (isset(jApp::coord()->request))
            $ip = jApp::coord()->request->getIP();
        else $ip = "no-ip";
        $filename = $dir.'mail-'.$ip.'-'.date('Ymd-His').'-'.uniqid(mt_rand(), true);
        jFile::write ($filename, $header.$body);
    }
}
