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
 * plugin to show general message logs
 */
class defaultlogDebugbarPlugin implements jIDebugbarPlugin {

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
        $info = new debugbarItemInfo('defaultlog', 'General logs');
            $info->htmlLabel = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIASURBVDjLpVPPaxNREJ6Vt01caH4oWk1T0ZKlGIo9RG+BUsEK4kEP/Q8qPXnpqRdPBf8A8Wahhx7FQ0GF9FJ6UksqwfTSBDGyB5HkkphC9tfb7jfbtyQQTx142byZ75v5ZnZWC4KALmICPy+2DkvKIX2f/POz83LxCL7nrz+WPNcll49DrhM9v7xdO9JW330DuXrrqkFSgig5iR2Cfv3t3gNxOnv5BwU+eZ5HuON5/PMPJZKJ+yKQfpW0S7TxdC6WJaWkyvff1LDaFRAeLZj05MHsiPTS6hua0PUqtwC5sHq9zv9RYWl+nu5cETcnJ1M0M5WlWq3GsX6/T+VymRzHDluZiGYAAsw0TQahV8uyyGq1qFgskm0bHIO/1+sx1rFtchJhArwEyIQ1Gg2WD2A6nWawHQJVDIWgIJfLhQowTIeE9D0mKAU8qPC0220afsWFQoH93W6X7yCDJ+DEBeBmsxnPIJVKxWQVUwry+XyUwBlKMKwA8jqdDhOVCqVAzQDVvXAXhOdGBFgymYwrGoZBmUyGjxCCdF0fSahaFdgoTHRxfTveMCXvWfkuE3Y+f40qhgT/nMitupzApdvT18bu+YeDQwY9Xl4aG9/d/URiMBhQq/dvZMeVghtT17lSZW9/rAKsvPa/r9Fc2dw+Pe0/xI6kM9mT5vtXy+Nw2kU/5zOGRpvuMIu0YAAAAABJRU5ErkJggg==" alt="General logs" title="General logs"/> ';

        $messages = jLog::getMessages(array('default','debug'));

        $c = count($messages);
        $info->htmlLabel .= $c;
        if ($c == 0) {
            $info->label = 'no message';
        }
        else {
            $info->popupContent = '<ul id="jxdb-defaultlog" class="jxdb-list">';
            $currentCount = array('default'=>0,'debug'=>0);
            foreach($messages as $msg) {
                $cat = $msg->getCategory();
                $currentCount[$cat]++;
                $title = $msg->getFormatedMessage();
                $truncated = false;
                if (strlen($title)>60) {
                    $truncated = true;
                    $title = substr($title, 0, 60).'...';
                }
                $info->popupContent .= '<li>
                <h5><a href="#" onclick="jxdb.toggleDetails(this);return false;"><span>'.htmlspecialchars($title).'</span></a></h5>
                <div>';
                if ($truncated) {
                    if ($msg instanceof jLogDumpMessage) {
                        $info->popupContent .= "<pre>".htmlspecialchars($msg->getMessage()).'</pre>';
                    }
                    else $info->popupContent .= htmlspecialchars($msg->getMessage());
                }
                $info->popupContent .='</div></li>';
            }
            $info->popupContent .= '</ul>';

            foreach($currentCount as $type=>$count) {
                if (($c = jLog::getMessagesCount($type)) > $count) {
                    $info->popupContent .= '<p class="jxdb-msg-warning">There are '.$c.' '.($type=='default'?'':$type).' messages. Only first '.$count.' messages are shown.</p>';
                }
            }

        }
        $debugbar->addInfo($info);
    }
}