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
 * function plugin :  write the url corresponding to the given jelix action
 *
 * @param jTpl $tpl template engine
 * @param string $selector selector action
 * @param array $params parameters for the url
 * @param boolean $escape if true, then escape the string for html
 */
function jtpl_function_html_jurl($tpl, $selector, $params=array(),$escape=true)
{

     echo jUrl::get($selector, $params, ($escape?1:0));
}


