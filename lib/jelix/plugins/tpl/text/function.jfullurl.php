<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Mickael Fradin
* @contributor Laurent Jouanneau
* @copyright  2009 Mickael Fradin
* @link       http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * function plugin :  write the full url (with domain name) corresponding to the given jelix action
 *
 * @param jTpl $tpl template engine
 * @param string $selector selector action
 * @param array $params parameters for the url
 * @param string $domain domain name, false if you want to use the config domain name or the server name
 */
function jtpl_function_text_jfullurl($tpl, $selector, $params=array(), $domain=false) {
    echo jUrl::getFull($selector, $params, 0, $domain);
}
