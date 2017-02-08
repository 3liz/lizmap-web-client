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
 * Inspired by the method satay Drew McLellan (http://www.alistapart.com/articles/flashsatay/)
 */

/**
 * swf plugin :  Adds html code to display a swf
 *
 * Example :
 * {swf 'promobidon.swf',
 *       array('id'=>'promo', 'width'=>150, 'height'=>90),
 *       array('quality'=>'hight', 'wmode'=>'transparent'),
 *       array('longeur'=>150)}
 *     {image 'toupie.png'}
 * {/swf}
 *
 * Render :
 *
 * <object id="promo" width="150" height="90"
 *         data="/data/fichiers/promobidon.swf?&longeur=150"
 *         type="application/x-shockwave-flash">
 *     <param value="hight" name="quality"/>
 *     <param value="transparent" name="wmode"/>
 *     <img src="/data/fichiers/toupie.png"/>
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
 * @param jTplCompiler $compiler the template compiler
 * @param boolean $begin true if it is the begin of block, else false
 * @param array $params parameters for the url
 * @return string PHP generated code
 */
function jtpl_block_html_swf($compiler, $begin, $params) {

    if($begin) {
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

        echo \'<object type="application/x-shockwave-flash" data="\'.$src.\'?\';
        if( count($flashvar) ) foreach($flashvar as $key => $val)
            echo \'&\'.$key.\'=\'.$val;
        echo \'" width="\'.$options[\'width\'].\'" height="\'.$options[\'height\'].\'"\'.$att.\'>\';
        echo "    ";
        echo \'<param name="movie" value="\'.$src.\'" />\'."\n";
        if( count($params) ) foreach($params as $key => $val)
            echo \'<param name="\'.$key.\'" value="\'.$val.\'" />\'."\n";
        ';
        return $sortie;
    } else {
        return 'echo \'</object>\';';
    }
}
