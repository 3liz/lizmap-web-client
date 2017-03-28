<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Lepeltier kévin
 * @contributor Dominique Papin
 * @copyright   2008 Lepeltier kévin
 * @copyright   2008 Dominique Papin
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 *
 * This script uses the jQuery script written by Luke Lutman "jquery.flash.js"
 */

/**
 * swfjs plugin :  Adds html and JS code to display a swf
 *
 * Example :
 * {swfjs 'promobidon.swf',
 *         array('id'=>'promo', 'width'=>150, 'height'=>90, 'detect'=>true),
 *         array('quality'=>'hight', 'wmode'=>'transparent'),
 *         array('longeur'=>150)}
 *     {image 'toupie.png'}
 * {/swfjs}
 *
 * Render after the execution of javascript file :
 *
 * <div id="promo">
 *     <embed width="150" height="90" wmode="transparent" quality="hight"
 *            type="application/x-shockwave-flash" src="/data/fichiers/promobidon.swf"
 *            pluginspage="http://www.adobe.com/go/getflashplayer" flashvars="longeur=150"/>
 * </div>
 *
 * $params[0] url of the swf
 * $params[1]['id'] id of <object .../>
 * $params[1]['class'] class of <object .../>
 * $params[1]['width'] Width final of SWF
 * $params[1]['height'] Height final of SWF
 * $params[1]['version'] (ex: '6.0.65') Detect specific major, minor and revision versions of the Flash plugin.
 * $params[1]['expressinstall'] (true:Bool) Use Express Install, or show an update message if Flash isn't installed.
 *    OR  $params[1]['update'] (false:Bool) Or, degrade silently and gracefully.
 * $params[2][xx] Parameter of the Flash Player
 * $params[3][xx] Flashvar for the Flash Player
 *
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $params parameters for the url
 * @return string PHP generated code
 */
function jtpl_block_html_swfjs($compiler, $begin, $params) {

    if($begin) {

        $meta  = '
        $resp = jApp::coord()->response
        if( $resp && $resp->getType() ==\'html\') {
            $src = '.$params[0].';
            $options = '.$params[1].';
            $params = '.$params[2].';
            $flashvar = '.$params[3].';

            $script = \'$(function(){\'."\n";
            $script .= "        ".\'$("#\'.$options[\'id\'].\'").flash({\'."\n";
            if( !empty($options[\'width\']) )
                $script .= "            ".\'width:"\'.$options[\'width\'].\'",\'."\n";
            if( !empty($options[\'height\']) )
                $script .= "            ".\'height:"\'.$options[\'height\'].\'",\'."\n";
            if( count($params) ) foreach($params as $key => $val)
                $script .= "            ".$key.\':"\'.$val.\'", \'."\r";
            $script .= "            ".\'src:"\'.$src.\'"\'."\n";
            $script .= "        ".\'}, {\'."\n";
            if( !empty($options[\'version\']) )
                $script .= "            ".\'version:\'.$options[\'version\'];
            if( !empty($options[\'version\']) && !empty($options[\'detect\']) )
            	$script .= \',\'."\n";
            if( !empty($options[\'detect\']) )
                $script .= "            ".\'expressInstall:\'.$options[\'detect\'].\'\'."\n";
            $script .= "        ".\'}, function(htmlOptions) {\'."\n";
            if( count($flashvar) ) foreach($flashvar as $key => $val)
                $script .= "            ".\'htmlOptions.flashvars.\'.$key.\' = "\'.$val.\'";\'."\n";
            $script .= "            ".\'$(this).children().remove();\'."\n";
            $script .= "            ".\'$(this).prepend($.fn.flash.transform(htmlOptions));\'."\n";
            $script .= "        ".\'});\'."\n";
            $script .= "    ".\'});\'."\n";
            $p = jApp::config()->urlengine[\'jqueryPath\']
            $resp->addJSLink($p.\'jquery.js\');
            $resp->addJSLink($p.\'flash/jquery.flash.js\');
            $resp->addJSCode($script);
        }
        ';

        $compiler->addMetaContent($meta);

        $sortie  = '
        $options = '.$params[1].';

        $att = \'\';
        $atts = array(\'id\'=>\'\', \'class\'=>\'\');
        $atts = array_intersect_key($options, $atts);
        foreach( $atts as $key => $val ) if( !empty($val) )
            $att .= \' \'.$key.\'="\'.$val.\'"\';
        echo \'<div \'.$att.\'>\';
        ';

        return $sortie;

    } else {

        return 'echo \'</div>\'';

    }

}
