<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Aubanel Monnier
* @copyright  2007 Aubanel Monnier
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * modifier plugin : simple search/replace for latex chars
 * @param string $string the string to modify
 * @return the modified string
 */
function jtpl_modifier_ltx2pdf_latex($string)
{
    return str_replace(array('#','$','%','^','&','_','{','}','~'), array('\\#','\\$','\\%','\\^','\\&','\\_','\\{','\\}','\\~'), str_replace('\\','\\textbackslash',$string));
}
