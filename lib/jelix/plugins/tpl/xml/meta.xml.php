<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @copyright  2005-2008 Laurent Jouanneau
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
    global $gJCoord, $gJConfig;

    if($gJCoord->response->getFormatType() != 'xml'){
        return;
    }
    switch($method){
        case 'xsl':
            $gJCoord->response->addXSLStyleSheet($param);
            break;
        case 'css':
            $gJCoord->response->addCSSLink($param);
            break;
        case 'csstheme':
            $gJCoord->response->addCSSLink($gJConfig->urlengine['basePath'].'themes/'.$gJConfig->theme.'/'.$param);
            break;
    }
}

