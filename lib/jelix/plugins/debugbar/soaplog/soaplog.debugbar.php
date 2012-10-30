<?php
/**
* @package     jelix
* @subpackage  debugbar_plugin
* @author      Laurent Jouanneau
* @copyright   2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
 * plugin to show soap message
 */
class soaplogDebugbarPlugin implements jIDebugbarPlugin {

    /**
     * @return string CSS styles
     */
    function getCss() {
        return '';
    }

    /**
     * @return string Javascript code lines
     */
    function getJavascript() {
        return '';
    }

    /**
     * it should adds content or set some properties on the debugbar
     * to displays some contents.
     * @param debugbarHTMLResponsePlugin $debugbar the debugbar
     */
    function show($debugbar) {
        $info = new debugbarItemInfo('soaplog', 'Soap logs');
        $info->htmlLabel = 'Soap ';

        $messages = jLog::getMessages(array('soap'));

        $c = count($messages);
        $info->htmlLabel .= $c;
        if ($c == 0) {
            $info->label = 'no message';
        }
        else {
            $c = jLog::getMessagesCount('soap');
            if ($c > count($messages)) {
                $info->popupContent .= '<p class="jxdb-msg-warning">There are '.$c.' soap requests. Only '.count($messages).' first of them are shown.</p>';
            }
            $info->popupContent .= '<ul id="jxdb-soaplog" class="jxdb-list">';
            foreach($messages as $msg) {
                if (get_class($msg) != 'jLogSoapMessage')
                    continue;
                $info->popupContent .= '<li>
                <h5><a href="#" onclick="jxdb.toggleDetails(this);return false;"><span>'.htmlspecialchars($msg->getMessage()).'</span></a></h5>
                <div>';
                $info->popupContent .= "Duration: ".$msg->getDuration()."s<br />";
                $info->popupContent .= "<h6>Headers</h6><pre>".$msg->getHeaders()."</pre>";
                $info->popupContent .= "<h6>Request</h6><pre>".$this->xmlprettyprint($msg->getRequest())."</pre>";
                $info->popupContent .= "<h6>Response</h6><pre>".$this->xmlprettyprint($msg->getResponse())."</pre>";
                $info->popupContent .='</div></li>';
            }
            $info->popupContent .= '</ul>';
        }
        $debugbar->addInfo($info);
    }


    function xmlprettyprint($xml) {
        $indent = '   ';
        $level = 0;
        $pretty = array();

        $xml = preg_split("!(</?[\w]+[^>]*>)!U", $xml, 0, PREG_SPLIT_DELIM_CAPTURE);
        if (count($xml) && preg_match('/^<\?\s*xml/', $xml[0])) {
            $pretty[] = array_shift($xml);
        }

        foreach ($xml as $item) {
            if (preg_match('!^<[\w]+[^>]*[^/]>$!U', $item)) {
                $pretty[] = str_repeat($indent, $level). $item;
                $level++;
            }
            elseif (preg_match('!^<[\w]+[^>]*/>$!U', $item)) {
                $pretty[] = str_repeat($indent, $level). $item;
            }
            elseif (preg_match('!^</[\w]+[^>/]*>$!U', $item)) {
                $level--;
                $pretty[] = str_repeat($indent, $level). $item;
            }
            else {
                $item = trim(str_replace("\n", " ", $item));
                if ($item !='')
                    $pretty[] = str_repeat($indent, $level). $item;
            }
        }

        return htmlspecialchars(implode("\n", $pretty));
    }

}