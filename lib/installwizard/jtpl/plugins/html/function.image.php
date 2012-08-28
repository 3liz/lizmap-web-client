<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Lepeltier kévin
 * @contributor Dominique Papin, Rob2
 * @copyright   2007-2008 Lepeltier kévin, 2008 Dominique Papin, 2010 Rob2
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * image plugin :  write the url corresponding to the image
 *
 * Add a link to the image,
 * The image is resized, and cached
 *
 * class :string
 * id :string
 * alt :string
 * width :uint
 * height :uint
 * maxwidth :uint only with maxheight
 * maxheight :uint only with maxwidth
 * zoom 1-100
 * omo :boolean
 * alignh [left|center|right|:int]
 * alignv [top|center|bottom|:int]
 * ext [png|jpg|gif]
 * quality 0-100 if ext = jpg
 * shadow :boolean
 * soffset :uint
 * sangle :uint
 * sblur :uint
 * sopacity :uint
 * scolor #000000 :string
 * background #000000 :string
 *
 * gif   -> image/gif
 * jpeg  -> image/jpeg
 * jpg   -> image/jpeg
 * jpe   -> image/jpeg
 * xpm   -> image/x-xpixmap
 * xbm   -> image/x-xbitmap
 * wbmp  -> image/vnd.wap.wbmp
 * png   -> image/png
 * other -> image/png
 *
 * @param jTpl $tpl template engine
 * @param string $src the url of image relative to the www path
 * @param array $params parameters for the transformation and img element
 */
function jtpl_function_html_image($tpl, $src, $params=array()) {
    $att = jImageModifier::get($src, $params, false);

    // alt attribute is required (xhtml/html4 spec)
    if (!array_key_exists('alt',$att))
        $att['alt']='';

    // generating hmtl tag img
    echo '<img';
    foreach( $att as $key => $val ) {
        if( !empty($val) || $key == 'alt' )
            echo ' '.$key.'="'.htmlspecialchars($val).'"';
    }
    echo '/>';
}
