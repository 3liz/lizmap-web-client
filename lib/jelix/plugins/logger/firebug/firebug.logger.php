<?php
/**
* @package     jelix
* @subpackage  logger
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @copyright   2010 Laurent Jouanneau
* @copyright   2011 Julien Issler
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

class firebugLogger implements jILogger {

    protected $messages = array();

    /**
     * @param jILogMessage $message the message to log
     */
    function logMessage($message) {
        $this->messages[] = $message;
    }

    /**
     * output messages to the given response
     * @param jResponseBasicHtml $response
     */
    function output($response){
        //if (! ($response instanceof jResponseBasicHtml)
        if (!count($this->messages))
            return;
        $type = $response->getType();
        if ($type != 'html' && $type != 'htmlfragment')
            return;

        $src = '<script type="text/javascript">//<![CDATA[
if(console){';
        foreach( $this->messages  as $m){
            switch ($m->getCategory()) {
            case 'warning':
                $src.= 'console.warn("';
                break;
            case 'error':
                $src.= 'console.error("';
                break;
            case 'notice':
                $src.= 'console.debug("';
                break;
            default:
                $src.= 'console.info("';
                break;
            }
            $src .= str_replace(array('"',"\n","\r","\t"),array('\"','\\n','\\r','\\t'),$m->getFormatedMessage());
            $src .= '");';
        }
        $src .= '} //]]>
</script>';
        //$src .= '}else{alert("there are some errors or me, you should activate Firebug to see them");}</script>';
        $response->addContent($src);
    }
}