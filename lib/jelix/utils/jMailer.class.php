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
 * @copyright   2006-2018 Laurent Jouanneau
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

    const DEBUG_RECEIVER_CONFIG = 1;
    const DEBUG_RECEIVER_USER = 2;


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
     * indicates if mails should be copied into files, so the developer can
     * verify that all mails are sent.
     */
    protected $copyToFiles = false;

    protected $htmlImageBaseDir = '';

    protected $html2textConverter = false;

    /**
     * Debug mode. If activated, debugReceivers should be filled
     * @var bool
     */
    protected $debugModeEnabled = false;

    /**
     * @var string  replacement for the From header
     */
    protected $debugFrom = '';

    /**
     * @var string  replacement for the From header
     */
    protected $debugFromName = '';

    /**
     * @var int combination of DEBUG_RECEIVER_*
     */
    protected $debugReceiversType = 1;

    /**
     * List of addresses to send all emails. Addresses in "To"
     * @var array
     */
    protected $debugReceivers = array();

    /**
     * List of valid addresses
     *
     * Receivers for 'To' having these emails will not be replaced by debugReceivers
     * Receivers for 'Cc' and 'Bcc' having these emails will not be removed
     * @var array
     */
    protected $debugReceiversWhiteList = array();

    protected $debugSubjectPrefix = '[DEBUG MODE]';

    protected $debugBodyIntroduction = 'This is an example of a message that could be send with following parameters, in the normal mode:';

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

        if (strtolower($this->Mailer) == 'smtp') {
            if (isset($config->mailer['smtpProfile']) &&
                $config->mailer['smtpProfile'] != ''
            ) {
                $smtp = jProfiles::get('smtp', $config->mailer['smtpProfile']);
                $smtp = array_merge(array(
                    'host' => 'localhost',
                    'port' => 25,
                    'secure_protocol' => '', // or "ssl", "tls"
                    'helo' => '',
                    'auth_enabled' => false,
                    'username' => '',
                    'password' => '',
                    'timeout' => 10
                ), $smtp);
                $this->Host = $smtp['host'];
                $this->Port = $smtp['port'];
                $this->Helo = $smtp['helo'];
                $this->SMTPAuth = $smtp['auth_enabled'];
                $this->SMTPSecure = $smtp['secure_protocol'];
                $this->Username = $smtp['username'];
                $this->Password = $smtp['password'];
                $this->Timeout = $smtp['timeout'];
            }
            else {
                $this->Host = $config->mailer['smtpHost'];
                $this->Port = $config->mailer['smtpPort'];
                $this->Helo = $config->mailer['smtpHelo'];
                $this->SMTPAuth = $config->mailer['smtpAuth'];
                $this->SMTPSecure = $config->mailer['smtpSecure'];
                $this->Username = $config->mailer['smtpUsername'];
                $this->Password = $config->mailer['smtpPassword'];
                $this->Timeout = $config->mailer['smtpTimeout'];
            }
        }

        if ($config->mailer['webmasterEmail'] != '') {
            $this->From = $config->mailer['webmasterEmail'];
        }

        $this->FromName = $config->mailer['webmasterName'];
        $this->filePath = jApp::varPath($config->mailer['filesDir']);

        $this->copyToFiles = $config->mailer['copyToFiles'];

        $this->debugModeEnabled = $config->mailer['debugModeEnabled'];
        if ($this->debugModeEnabled) {
            $this->debugReceivers = $config->mailer['debugReceivers'];
            if ($this->debugReceivers) {
                if (!is_array($this->debugReceivers)) {
                    $this->debugReceivers = array($this->debugReceivers);
                }
                if ($config->mailer['debugFrom']) {
                    $this->debugFrom = $config->mailer['debugFrom'];
                }
                if ($config->mailer['debugFromName']) {
                    $this->debugFromName = $config->mailer['debugFromName'];
                }
                if ($config->mailer['debugSubjectPrefix']) {
                    $this->debugSubjectPrefix = $config->mailer['debugSubjectPrefix'];
                }
                if ($config->mailer['debugBodyIntroduction']) {
                    $this->debugBodyIntroduction = $config->mailer['debugBodyIntroduction'];
                }
                $this->debugReceiversType = $config->mailer['debugReceiversType'];
                $this->debugReceiversWhiteList = $config->mailer['debugReceiversWhiteList'];
                if (!is_array($this->debugReceiversWhiteList)) {
                    $this->debugReceiversWhiteList = array($this->debugReceiversWhiteList);
                }
            }
            else {
                $this->debugModeEnabled = false;
            }
        }

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
     * @param false|callable  an html2text converter when the content is html.
     * By default, it uses the converter of jMailer, html2textKeepLinkSafe(). (since 1.6.17)
     * @param string $basedir Absolute path to a base directory to prepend to relative paths to images (since 1.6.17)
     * @return jTpl the template object.
     */
    public function Tpl( $selector, $isHtml = false, $html2textConverter = false, $htmlImageBaseDir='') {
        $this->bodyTpl = $selector;
        $this->tpl = new jTpl();
        $this->isHTML($isHtml);
        $this->html2textConverter = $html2textConverter;
        $this->htmlImageBaseDir = $htmlImageBaseDir;
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
            if ($this->tpl == null) {
                $this->tpl = new jTpl();
            }
            $mailtpl = $this->tpl;
            $metas = $mailtpl->meta( $this->bodyTpl , ($this->ContentType == 'text/html'?'html':'text') );

            if (isset($metas['Subject']) && is_string($metas['Subject'])) {
                $this->Subject = $metas['Subject'];
            }

            if (isset($metas['Priority']) && is_numeric($metas['Priority'])) {
                $this->Priority = $metas['Priority'];
            }
            $mailtpl->assign('Priority', $this->Priority );

            if (isset($metas['Sender']) && is_string($metas['Sender'])) {
                $this->Sender = $metas['Sender'];
            }
            $mailtpl->assign('Sender', $this->Sender );

            foreach (array('to'=>'to',
                         'cc'=>'cc',
                         'bcc'=>'bcc',
                         'ReplyTo'=>'Reply-To') as $prop=>$propName) {
                if (isset($metas[$prop])) {
                    if (is_array($metas[$prop])) {
                        foreach ($metas[$prop] as $val) {
                            $this->getAddrName($val, $propName);
                        }
                    }
                    else if (is_string($metas[$prop])) {
                        $this->getAddrName($metas[$prop], $propName);
                    }
                }
                $mailtpl->assign($prop, $this->$prop );
            }

            if (isset($metas['From'])) {
                $adr = $this->getAddrName($metas['From']);
                $this->setFrom($adr[0], $adr[1]);
            }

            $mailtpl->assign('From', $this->From );
            $mailtpl->assign('FromName', $this->FromName );

            if ($this->ContentType == 'text/html') {
                $converter = $this->html2textConverter ? $this->html2textConverter: array($this, 'html2textKeepLinkSafe');
                $this->msgHTML($mailtpl->fetch( $this->bodyTpl, 'html'), $this->htmlImageBaseDir, $converter);
            }
            else
                $this->Body = $mailtpl->fetch( $this->bodyTpl, 'text');
        }

        if ($this->debugModeEnabled) {
            $this->debugOverrideReceivers();
        }

        $result = parent::Send();

        if ($this->debugModeEnabled) {
            foreach($this->debugOriginalValues as $f => $val) {
                $this->$f = $val;
            }
        }
        return $result;
    }

    protected $debugOriginalValues = array();

    protected function debugOverrideReceivers() {
        $this->debugOriginalValues = array();
        foreach(array('to','cc','bcc','all_recipients','RecipientsQueue',
                    'ReplyTo','ReplyToQueue', 'Subject', 'Body', 'AltBody',
                    'From', 'Sender', 'FromName') as $f) {
            $this->debugOriginalValues[$f] = $this->$f;
        }

        if ($this->debugFrom) {
            $this->From = $this->debugFrom;
            $this->FromName = $this->debugFromName;
            $this->Sender = $this->debugFrom;
        }

        $this->clearAllRecipients();
        $this->clearReplyTos();

        if (count($this->debugReceiversWhiteList)) {
            // if some to/cc/bcc are in the white list, keep them
            foreach(array('to','cc','bcc') as $recipientType) {
                foreach($this->debugOriginalValues[$recipientType] as $email) {
                    if (in_array($email[0], $this->debugReceiversWhiteList)) {
                        if (empty($email[1])) {
                            $this->addAnAddress($recipientType, $email[0]);
                        }
                        else {
                            $this->addAnAddress($recipientType, $email[0], $email[1]);
                        }
                    }
                }
            }
        }

        if (!count($this->to)) {
            // we replace the "to" field only if it is empty (original not in white list)
            $who = $this->debugReceiversType;
            if ($who & self::DEBUG_RECEIVER_USER) {
                if (class_exists('jAuth', false) &&
                    jAuth::isConnected() &&
                    jAuth::getUserSession() &&
                    !empty(jAuth::getUserSession()->login)
                ) {
                    $this->getAddrName(jAuth::getUserSession()->login, 'to');
                }
                else {
                    $who = self::DEBUG_RECEIVER_CONFIG;
                }
            }

            if ($who & self::DEBUG_RECEIVER_CONFIG) {
                foreach($this->debugReceivers as $email) {
                    $this->getAddrName($email, 'to');
                }
            }
        }

        $this->Subject = $this->debugSubjectPrefix . $this->Subject;

        $intro = $this->debugBodyIntroduction."\r\n\r\n";;
        $introHtml = '<p>'. $this->debugBodyIntroduction."</p>\r\n<ul>\r\n";
        $intro .= ' - From: '.$this->debugOriginalValues['FromName']." <".$this->debugOriginalValues['From'].">\r\n";
        $introHtml .= '<li>From: '.$this->debugOriginalValues['FromName']." &lt;".$this->debugOriginalValues['From']."&gt;</li>\r\n";
        foreach(array('to', 'cc', 'bcc', 'ReplyTo') as $f) {
            $val = $this->debugOriginalValues[$f];
            if (!is_array($val)) {
                $val = array($val);
            }
            foreach($val as $v) {
                if ($v[1]) {
                    $intro .= ' - '.$f.': '. $v[1].' <'.$v[0].">\r\n";
                    $introHtml .= '<li>'.$f.': '.$v[1].' &lt;'.$v[0]."&gt;</li>\r\n";
                }
                else {
                    $intro .= ' - '.$f.': '.$v[0]."\r\n";
                    $introHtml .= '<li>'.$f.': '.$v[0]."</li>\r\n";
                }
            }
        }
        $intro .= "\r\n-----------------------------------------------------------\r\n";
        $introHtml .= "</ul>\r\n<hr />\r\n";

        if ($this->ContentType == 'text/html') {
            $this->Body = $introHtml. $this->Body ;
            $this->AltBody = $intro . $this->AltBody;
        }
        else {
            $this->Body = $intro . $this->Body;
        }
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


    /**
     * Convert HTML content to Text.
     *
     * Basically, it removes all tags (strip_tags). For <a> tags, it puts the
     * link in parenthesis, except <a> elements having the "notexpandlink".
     * class.
     * @param string $html
     * @return string
     * @since 1.6.17
     */
    public function html2textKeepLinkSafe($html) {
        $regexp = "/<a\\s[^>]*href\\s*=\\s*([\"\']??)([^\" >]*?)\\1([^>]*)>(.*)<\/a>/siU";
        if(preg_match_all($regexp, $html, $matches, PREG_SET_ORDER)) {
            foreach($matches as $match) {
                if (strpos($match[3], "notexpandlink") !== false) {
                    continue;
                }
                // keep space inside parenthesis, because some email client my
                // take parenthesis as part of the link
                $html = str_replace($match[0], $match[4].' ( '.$match[2].' )', $html);
            }
        }
        $html = preg_replace('/<(head|title|style|script)[^>]*>.*?<\/\\1>/si', '', $html);

        return html_entity_decode(
            trim(strip_tags($html)),
            ENT_QUOTES,
            $this->CharSet
        );
    }
}
