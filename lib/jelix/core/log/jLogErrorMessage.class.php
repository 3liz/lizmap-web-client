<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @contributor Brice Tence
* @copyright  2006-2012 Laurent Jouanneau, 2011 Brice Tence
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * this class is formatting an error message for a logger
 */
class jLogErrorMessage implements jILogMessage {
    protected $category;
    protected $message;
    protected $file;
    protected $line;
    protected $trace;
    protected $code;
    protected $format = '%date%\t%ip%\t[%code%]\t%msg%\t%file%\t%line%\n\t%url%\n%params%\n%trace%';

    /**
     * @param string $category category of the message (error, warning...)
     * @param integer $code  error code
     * @param string $message error message
     * @param string $file  file path + file name where the error appeared
     * @param integer $line the line where the error appeared
     * @param array $trace stack trace
     */
    public function __construct($category, $code, $message, $file, $line, $trace) {
        $this->category = $category;
        $this->message = $message;
        $this->code = $code;
        $this->file = $file;
        $this->line = $line;
        $this->trace = $trace;
    }

    /**
     * set the pattern to format the message output
     * @param string $format
     */
    public function setFormat($format) {
        $this->format = $format;
    }

    /**
     * @return string error code
     */
    public function getCode() {
        return $this->code;
    }

    /**
     * @return string category of the message (error, warning...)
     */
    public function getCategory() {
        return $this->category;
    }

    /**
     * @return string error message
     */
    public function getMessage() {
        return $this->message;
    }

    /**
     * @return string file path + file name where the error appeared
     */
    public function getFile() {
        return $this->file;
    }

    /**
     * @return integer the line where the error appeared
     */
    public function getLine() {
        return $this->line;
    }

    /**
     * @return array the stack trace
     */
    public function getTrace() {
        return $this->trace;
    }

    /**
     * @return string formated error message
     */
    public function getFormatedMessage() {

        if (isset($_SERVER['REQUEST_URI']))
            $url = $_SERVER['REQUEST_URI'];
        elseif(isset($_SERVER['SCRIPT_NAME']))
            $url = $_SERVER['SCRIPT_NAME'];
        else
            $url = 'Unknow request';

        // url params including module and action
        if (jApp::coord() && ($req = jApp::coord()->request)) {
            $params = $this->sanitizeParams($req->params);
            $remoteAddr = $req->getIP();
        }
        else {
            $params = $this->sanitizeParams(isset($_GET)?$_GET:array());
            // When we are in cmdline we need to fix the remoteAddr
            $remoteAddr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
        }

        $traceLog="";
        foreach($this->trace as $k=>$t){
            $traceLog.="\n\t$k\t".(isset($t['class'])?$t['class'].$t['type']:'').$t['function']."()\t";
            $traceLog.=(isset($t['file'])?$t['file']:'[php]').' : '.(isset($t['line'])?$t['line']:'');
        }

        // referer
        $httpReferer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Unknown referer';

        $messageLog = strtr($this->format, array(
            '%date%' => @date("Y-m-d H:i:s"), // @ because if the timezone is not set, we will have an error here
            '%typeerror%'=>$this->category,
            '%code%' => $this->code,
            '%msg%'  => $this->message,
            '%ip%'   => $remoteAddr,
            '%url%'  => $url,
            '%referer%'  => $httpReferer,
            '%params%'=>$params,
            '%file%' => $this->file,
            '%line%' => $this->line,
            '%trace%' => $traceLog,
            '%http_method%' => isset($_SERVER['REQUEST_METHOD'])?$_SERVER['REQUEST_METHOD']:'Unknown method',
            '\t' =>"\t",
            '\n' => "\n"
        ));

        return $messageLog;
    }

    protected function sanitizeParams($params) {
        foreach(jApp::config()->error_handling['sensitiveParameters'] as $param) {
            if ($param != '' && isset($params[$param])) {
                $params[$param] = '***';
            }
        }
        return str_replace("\n", ' ', var_export($params, true));
    }
}
