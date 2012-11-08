<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @copyright  2005-2012 Laurent Jouanneau
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
    $resp = jApp::coord()->response;

    if($resp->getFormatType() != 'xul'){
        return;
    }
    switch($method){
        case 'overlay':
            $resp->addOverlay($param);
            break;
        case 'js':
            $resp->addJSLink($param);
            break;
        case 'css':
            $resp->addCSSLink($param);
            break;
        case 'csstheme':
            $resp->addCSSLink(jApp::config()->urlengine['basePath'].'themes/'.jApp::config()->theme.'/'.$param);
            break;
        case 'rootattr':
            if(is_array($param)){
                foreach($param as $p1=>$p2){
                    if(!is_numeric($p1)) $resp->rootAttributes[$p1]=$p2;
                }
            }
            break;
        case 'ns':
            if(is_array($param)){
                $ns=array('jxbl'=>"http://jelix.org/ns/jxbl/1.0");
                foreach($param as $p1=>$p2){
                    if(isset($ns[$p2])) $p2=$ns[$p2];
                    if(!is_numeric($p1)) $resp->rootAttributes['xmlns:'.$p1]=$p2;
                }
            }
            break;
    }
}

