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
 * plugin to show all sql queries into the debug bar
 */
class sqllogDebugbarPlugin implements jIDebugbarPlugin {

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
        $info = new debugbarItemInfo('sqllog', 'SQL queries');
        $messages = jLog::getMessages('sql');
            $info->htmlLabel = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEYSURBVBgZBcHPio5hGAfg6/2+R980k6wmJgsJ5U/ZOAqbSc2GnXOwUg7BESgLUeIQ1GSjLFnMwsKGGg1qxJRmPM97/1zXFAAAAEADdlfZzr26miup2svnelq7d2aYgt3rebl585wN6+K3I1/9fJe7O/uIePP2SypJkiRJ0vMhr55FLCA3zgIAOK9uQ4MS361ZOSX+OrTvkgINSjS/HIvhjxNNFGgQsbSmabohKDNoUGLohsls6BaiQIMSs2FYmnXdUsygQYmumy3Nhi6igwalDEOJEjPKP7CA2aFNK8Bkyy3fdNCg7r9/fW3jgpVJbDmy5+PB2IYp4MXFelQ7izPrhkPHB+P5/PjhD5gCgCenx+VR/dODEwD+A3T7nqbxwf1HAAAAAElFTkSuQmCC" alt="SQL queries" title="SQL queries"/> ';

        if (!jLog::isPluginActivated('memory', 'sql')) {
            $info->htmlLabel .= '?';
            $info->label .= 'memory logger is not active';
        }
        else {
            $realCount = jLog::getMessagesCount('sql');
            $currentCount = count($messages);
            $info->htmlLabel .= $realCount;
            if ($realCount) {
                if ($realCount > $currentCount) {
                    $info->popupContent = '<p class="jxdb-msg-warning">Too many queries ('.$realCount.'). Only first '.$currentCount.' queries are shown.</p>';
                }
                $sqlDetailsContent = '<ul id="jxdb-sqllog" class="jxdb-list">';
                $totalTime = 0;
                foreach($messages as $msg) {
                    if (get_class($msg) != 'jSQLLogMessage')
                        continue;
                    $dao = $msg->getDao();
                    if ($dao) {
                        $m = 'DAO '.$dao;
                    }
                    else $m = substr($msg->getMessage(), 0,50).' [...]';

                    $msgTime = $msg->getTime();
                    $totalTime += $msgTime;
                    $sqlDetailsContent .= '<li>
                    <h5><a href="#" onclick="jxdb.toggleDetails(this);return false;"><span>'.htmlspecialchars($m).'</span></a></h5>
                    <div>
                    <p>Time: '.$msgTime.'s</p>';
                    $sqlDetailsContent.= '<pre style="white-space:pre-wrap">'.htmlspecialchars($msg->getMessage()).'</pre>';
                    if ($msg->getMessage() != $msg->originalQuery)
                        $sqlDetailsContent .= '<p>Original query: </p><pre style="white-space:pre-wrap">'.htmlspecialchars($msg->originalQuery).'</pre>';
                    $sqlDetailsContent.= $debugbar->formatTrace($msg->getTrace());
                    $sqlDetailsContent .='</div></li>';
                }
                $sqlDetailsContent .= '</ul>';

                $info->popupContent .= '<div>Total SQL time&nbsp;: '.$totalTime.'s</div>';
                $info->popupContent .= $sqlDetailsContent;
            }
        }

        $debugbar->addInfo($info);
    }

}
