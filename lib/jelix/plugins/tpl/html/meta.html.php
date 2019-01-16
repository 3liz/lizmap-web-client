<?php
/**
* @package      jelix
* @subpackage   jtpl_plugin
* @author       Laurent Jouanneau
* @contributor  Yann (description and keywords), Dominique Papin (ie7 support), Mickaël Fradin (style), Loic Mathaud (title), Olivier Demah (auhor,generator), Julien Issler, Claudio Bernardes (include correction)
* @copyright    2005-2012 Laurent Jouanneau, 2007 Dominique Papin, 2008 Mickaël Fradin, 2009 Loic Mathaud, 2010 Olivier Demah
* @copyright    2010 Julien Issler, 2012 Claudio Bernardes
* @link         http://www.jelix.org
* @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * meta plugin :  modify an html response object
 *
 * @see jResponseHtml
 * @param jTpl $tpl template engine
 * @param string $method indicates what you want to specify
 *       (possible values : js, css, jsie, jsie7, jsltie7, cssie, cssie7, cssltie7,
 *       csstheme, cssthemeie, cssthemeie7, cssthemeltie7, bodyattr, keywords,
 *       description, others)
 * @param mixed $param parameter (a css style sheet for "css" for example)
 * @params array $params additionnal parameters (a media attribute for stylesheet for example)
 */
function jtpl_meta_html_html($tpl, $method, $param=null, $params=array())
{
    $resp = jApp::coord()->response;

    if($resp->getType() != 'html'){
        return;
    }
    switch($method){
        case 'title':
            $resp->setTitle($param);
            break;
        case 'js':
            $resp->addJSLink($param,$params);
            break;
        case 'css':
            $resp->addCSSLink($param,$params);
            break;
        case 'jsie':
            $resp->addJSLink($param,$params,true);
            break;
        case 'jsie7':
            $resp->addJSLink($param,$params,'IE 7');
            break;
        case 'jsltie7':
            $resp->addJSLink($param,$params,'lt IE 7');
            break;
        case 'cssie':
            $resp->addCSSLink($param,$params,true);
            break;
        case 'cssie7':
        case 'cssie8':
        case 'cssie9':
            $resp->addCSSLink($param,$params,'IE '.substr($method,-1,1));
            break;
        case 'cssltie7':
        case 'cssltie8':
        case 'cssltie9':
            $resp->addCSSLink($param,$params,'lt IE '.substr($method,-1,1));
            break;
        case 'csstheme':
            $resp->addCSSLink(jApp::urlBasePath().'themes/'.jApp::config()->theme.'/'.$param,$params);
            break;
        case 'cssthemeie':
            $resp->addCSSLink(jApp::urlBasePath().'themes/'.jApp::config()->theme.'/'.$param,$params,true);
            break;
        case 'cssthemeie7':
        case 'cssthemeie8':
        case 'cssthemeie9':
            $resp->addCSSLink(jApp::urlBasePath().'themes/'.jApp::config()->theme.'/'.$param,$params,'IE '.substr($method,-1,1));
            break;
        case 'cssthemeltie7':
        case 'cssthemeltie8':
        case 'cssthemeltie9':
            $resp->addCSSLink(jApp::urlBasePath().'themes/'.jApp::config()->theme.'/'.$param,$params,'lt IE '.substr($method,-1,1));
            break;
        case 'style':
            if(is_array($param)){
                foreach($param as $p1=>$p2){
                    $resp->addStyle($p1,$p2);
                }
            }
            break;
        case 'bodyattr':
            if(is_array($param)){
                $resp->setBodyAttributes( $param );
            }
            break;
        case 'keywords':
            $resp->addMetaKeywords($param);
            break;
        case 'description':
            $resp->addMetaDescription($param);
            break;
        case 'others':
            $resp->addHeadContent($param);
            break;
        case 'author':
            $resp->addMetaAuthor($param);
            break;
        case 'generator':
            $resp->addMetaGenerator($param);
            break;
        case 'jquery':
            $resp->addJSLink(jApp::config()->jquery['jquery']);
            break;
        case 'jquery_ui':
            $base = jApp::config()->urlengine['jqueryPath'];
            switch($param){
                case 'default':
                    $resp->addJSLink(jApp::config()->jquery['jquery']);
                    $js = jApp::config()->jquery['jqueryui.js'];
                    foreach($js as $file) {
                        $resp->addJSLink($file);
                    }
                    $css = jApp::config()->jquery['jqueryui.css'];
                    foreach($css as $file) {
                        $resp->addCSSLink($file);
                    }
                    break;
                case 'components':
                    $resp->addJSLink(jApp::config()->jquery['jquery']);
                    $resp->addJSLink($base.'ui/jquery.ui.core.min.js');
                    foreach($params as $f)
                        $resp->addJSLink($base.'ui/jquery.ui.'.$f.'.min.js');
                    break;
                case 'effects':
                    $resp->addJSLink(jApp::config()->jquery['jquery']);
                    $resp->addJSLink($base.'ui/jquery.ui.core.min.js');
                    $resp->addJSLink($base.'ui/jquery.ui.effect.min.js');
                    foreach($params as $f)
                        $resp->addJSLink($base.'ui/jquery.ui.effect-'.$f.'.min.js');
                    break;
                case 'theme':
                    $css = jApp::config()->jquery['jqueryui.css'];
                    foreach($css as $file) {
                        $resp->addCSSLink($file);
                    }
                    break;
            }
            break;
    }
}
