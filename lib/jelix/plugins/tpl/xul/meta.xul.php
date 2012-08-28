<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @version    $Id$
* @author     Laurent Jouanneau
* @copyright  2005-2006 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * meta plugin :  modify an xul response object
 *
 * @see jResponseXul
 * @param jTpl $tpl template engine
 * @param string $method indicates what you want to specify (possible values : js,css,overlay,rootattr,ns)
 * @param mixed $param parameter (a css style sheet for "css" for example)
 */
function jtpl_meta_xul_xul($tpl, $method, $param)
{
    global $gJCoord, $gJConfig;

    if($gJCoord->response->getFormatType() != 'xul'){
        return;
    }
    switch($method){
        case 'overlay':
            $gJCoord->response->addOverlay($param);
            break;
        case 'js':
            $gJCoord->response->addJSLink($param);
            break;
        case 'css':
            $gJCoord->response->addCSSLink($param);
            break;
        case 'csstheme':
            $gJCoord->response->addCSSLink($gJConfig->urlengine['basePath'].'themes/'.$gJConfig->theme.'/'.$param);
            break;
        case 'rootattr':
            if(is_array($param)){
                foreach($param as $p1=>$p2){
                    if(!is_numeric($p1)) $gJCoord->response->rootAttributes[$p1]=$p2;
                }
            }
            break;
        case 'ns':
            if(is_array($param)){
                $ns=array('jxbl'=>"http://jelix.org/ns/jxbl/1.0");
                foreach($param as $p1=>$p2){
                    if(isset($ns[$p2])) $p2=$ns[$p2];
                    if(!is_numeric($p1)) $gJCoord->response->rootAttributes['xmlns:'.$p1]=$p2;
                }
            }
            break;
    }
}

