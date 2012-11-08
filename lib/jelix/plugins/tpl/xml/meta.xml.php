<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @copyright  2005-2012 Laurent Jouanneau
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * meta plugin :  modify an xml response object
 *
 * @see jResponseXml
 * @param jTpl $tpl template engine
 * @param string $method indicates what you want to specify (possible values : xsl,css,csstheme)
 * @param mixed $param parameter (a css style sheet url for "css" for example)
 */
function jtpl_meta_xml_xml($tpl, $method, $param)
{
    $resp = jApp::coord()->response;

    if($resp->getFormatType() != 'xml'){
        return;
    }
    switch($method){
        case 'xsl':
            $resp->addXSLStyleSheet($param);
            break;
        case 'css':
            $resp->addCSSLink($param);
            break;
        case 'csstheme':
            $resp->addCSSLink(jApp::config()->urlengine['basePath'].'themes/'.jApp::config()->theme.'/'.$param);
            break;
    }
}

