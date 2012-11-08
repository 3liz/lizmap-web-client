<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Brice Tencé
* @copyright  
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * function plugin :  write the root url corresponding to the given ressource type
 * If this ressource type is not specified in the config file, returned value will be basePath
 *
 * @param jTpl $tpl template engine
 * @param string $ressourceType the name of the ressource type
 */
function jtpl_function_html_jrooturl($tpl, $ressourceType)
{
     echo jUrl::getRootUrl($ressourceType);
}


