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
 */

/**
 * swfbiscuit plugin :  Adds html code to display a swf
 *
 * Example :
 * {swfbiscuit 'promobidon.swf',
 *       array('id'=>'promo', 'width'=>150, 'height'=>90),
 *       array('quality'=>'hight', 'wmode'=>'transparent'),
 *       array('longeur'=>150)}
 *
 * Render :
 *
 * <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
 *         codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0"
 *         width="150" height="90">
 *     <param name="movie" value="/data/fichiers/promobidon.swf?longeur=150" />
 *     <param name="quality" value="hight" />
 *     <param name="wmode" value="transparent" />
 *     <embed src="/data/fichiers/promobidon.swf?longeur=150"
 *            quality="high" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer"
 *            type="application/x-shockwave-flash" width="150" height="90"/>
 * </object>
 *
 * $params[0] url of the swf
 * $params[1]['id'] id of <object .../>
 * $params[1]['class'] class of <object .../>
 * $params[1]['width'] Width final of SWF
 * $params[1]['height'] Height final of SWF
 * $params[2][xx] Parameter of the Flash Player
 * $params[3][xx] Flashvar for the Flash Player
 *
 * @param jTpl $tpl template engine
 * @param array $params parameters for the url
 * @return string PHP generated code
 */
function jtpl_cfunction_html_swfbiscuit($tpl, $params) {

    $sortie  = '
        $src = '.$params[0].';
        $options = '.$params[1].';
        $params = '.$params[2].';
        $flashvar = '.$params[3].';

        $att = \'\';
        $atts = array(\'id\'=>\'\', \'class\'=>\'\');
        $atts = array_intersect_key($options, $atts);
        foreach( $atts as $key => $val )
            if( !empty($val) )
                $att .= \' \'.$key.\'="\'.$val.\'"\';

        echo "\n".\'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0" width="\'.$options[\'width\'].\'" height="\'.$options[\'height\'].\'"\'.$att.\'>\'."\n";
        echo "    ".\'<param name="movie" value="\'.$src.\'?\';
        if( count($flashvar) ) foreach($flashvar as $key => $val)
            echo \'&\'.$key.\'=\'.$val;
        echo \'" />\'."\n";
        if( count($params) ) foreach($params as $key => $val)
            echo "    ".\'<param name="\'.$key.\'" value="\'.$val.\'" />\'."\n";
        echo "    ".\'<embed \';
        if( count($params) ) foreach($params as $key => $val)
            echo $key.\'="\'.$val.\'" \';
        echo \' src="\'.$src.\'?\';
        if( count($flashvar) ) foreach($flashvar as $key => $val)
            echo \'&\'.$key.\'=\'.$val;
        echo \'" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="\'.$options[\'width\'].\'" height="\'.$options[\'height\'].\'"></embed>\'."\n";
        echo \'</object>\';
        ';
    return $sortie;
}
