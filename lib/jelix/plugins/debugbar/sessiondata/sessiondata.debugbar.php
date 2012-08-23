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
 * plugin to show content of a session
 */
class sessiondataDebugbarPlugin implements jIDebugbarPlugin {

    /**
     * @return string CSS styles
     */
    function getCss() {
        return '
.jxdb-jform-dump dt { padding-top:6px; color:blue;font-size:11pt}
.jxdb-jform-dump dd { font-size:10pt;}
.jxdb-jform-dump table {border:1px solid black; border-collapse: collapse;}
.jxdb-jform-dump table th, .jxdb-jform-dump table td {border:1px solid black;}';
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
        $info = new debugbarItemInfo('sessiondata', 'Session');
            $info->htmlLabel = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJaSURBVDjLpVPNi1JRFP89v2f8RHHGaqOCJFNuohki+oBxE7Sp1oFQLXPXbqDFUG1btOgvyIKBoFmUixSJqERIzbFJ05lRpHn6xoYcP0af+nrnlmKBqzlwOPe+d3/nd37n3MtJkoSjmAJHNNVokcvlIoPBYFl29Pt9iKI49l6vN/Zut0sxGggE/ITjSIIMvqzRaGJ2u50d+t8mZarVasRiMZRKJX8wGIyyCmTG+xaLBTzPQ6vVjkGTQFpXKhWYTCa4XC4iXZE/R7lMJsPYbTYbGo3GP+WSFAJyHAelUsnYjUYj9Ho9wuEwCoWCX0XsVDpppUM6nY75iL3T6eDt86c4TL3E4VDeW0/h2t1V+Hw+ZLPZFRUxtVotCILAGkTA4XAIaibFr58i6Hx5hYEkQuKUaJYTePbkAW7cuceqpATLxEQbAsmSWMkKxZ8J86kI5ubdsJmNpBtmxzHUhTzMci8IqyJW0kpOCcgpAbGTGRxO3Axch35Gh4P6LlQGG16vr0P8O2qWYAQkkNfrZZGc5HzYrWEzGceZpSWYrHPY2cojJehwUv4/TkAToASj0Y36kE6nsbVdRHRmAfG195hVA8WDWTQlLRKJBKuaC4VCb2QtVyZuGYtCrcbGxVeraLfbOHf+AuYdDqy9CLFR0kj39oRv3LTHtPHw7DZ//KrzXVmD5q86qnIiYqSLptbqcem0HYvix/7Ux2SwnYjv72RQrvyA1WqF2+1mYI/HA3EwRHnzM/QmY0o1LYFkdd7mftYfFQvfbzX3qxflSg0kLZlMDip8fWNh0f6YszjyvwFmK4mzFto0SwAAAABJRU5ErkJggg==" alt="Session data" title="Session data"/> ';

        if (!isset($_SESSION) || count($_SESSION) == 0) {
            $info->htmlLabel .= '0';
        }
        else {
            $info->htmlLabel .= count($_SESSION);
            $info->popupContent = '<ul id="jxdb-sessiondata" class="jxdb-list">';
            foreach($_SESSION as $key=>$value) {
                $info->popupContent .= '<li> ';
                $pre = false;
                $title = $value;
                if (is_scalar($value)) {
                    if (is_string($value)) {
                        if( strlen($value) > 40) {
                            $title = '"'.substr($value,0,40).'..."';
                            $pre = true;
                        }
                        else $title = '"'.$value.'"';
                    }
                    else if (is_bool($value)) {
                        $title = ($value?'true':'false');
                    }
                }
                else if(is_null($value)) {
                    $title = 'null';
                }
                else {
                    $pre = true;
                }

                if ($pre) {
                    $info->popupContent .= '<h5><a href="#" onclick="jxdb.toggleDetails(this);return false;"><span>'.$key.'</span></a></h5>
                   <div>';
                    if ($key == 'JFORMS') {
                        $info->popupContent .= '<dl class="jxdb-jform-dump">';
                        foreach ($value as $selector=>$formlist) {
                            foreach($formlist as $formid=>$form) {
                                $info->popupContent .= "<dt>".$selector." (".$formid.")</dt>";
                                $info->popupContent .= "<dd>Data:<table style=''><tr><th>name</th><th>value</th><th>original value</th><th>RO</th><th>Deact.</th></tr>";
                                foreach($form->data as $dn=>$dv){
                                    if (is_array($dv)){
                                        $info->popupContent .= "<tr><td>$dn</td><td>".var_export($dv, true)."</td>";
                                        $info->popupContent .= "<td>".(isset($form->originalData[$dn])?var_export($form->originalData[$dn],true):'')."</td>";
                                    }
                                    else {
                                        $info->popupContent .= "<tr><td>$dn</td><td>".htmlspecialchars($dv)."</td>";
                                        $info->popupContent .= "<td>".(isset($form->originalData[$dn])?htmlspecialchars($form->originalData[$dn]):'')."</td>";
                                    }
                                    $info->popupContent .= "<td>".($form->isReadOnly($dn)?'Y':'')."</td>";
                                    $info->popupContent .= "<td>".($form->isActivated($dn)?'':'Y')."</td></tr>";
                                }
                                $info->popupContent .= "</table>";

                                $info->popupContent .="<br/>Update Time: ".($form->updatetime?date('Y-m-d H:i:s', $form->updatetime):'');
                                $info->popupContent .="<br/>Token: ".$form->token;
                                $info->popupContent .="<br/>Ref count: ".$form->refcount;
                                $info->popupContent .= "</dd>";
                            }
                        }
                        $info->popupContent .= "</dl>";
                    }
                    else {
                        $info->popupContent .= '<pre>';
                        $info->popupContent .= var_export($value, true);
                        $info->popupContent .='</pre>';
                    }
                    $info->popupContent .= '</div></li>';
                }
                else {
                    $info->popupContent .= '<h5><a href="#" onclick="jxdb.toggleDetails(this);return false;"><span>'.$key.' = '.htmlspecialchars($title).'</span></a></h5><div></div>';
                    $info->popupContent .='</li>';
                }
            }
            $info->popupContent .= '</ul>';
        }

        $debugbar->addInfo($info);
    }

}