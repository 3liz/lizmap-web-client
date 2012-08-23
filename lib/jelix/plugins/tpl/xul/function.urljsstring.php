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
 * function plugin :  write the url corresponding to the given jelix action for javascript
 *
 * it creates a javascript string, that contains the url, with dynamic javasript parameters<br/>
 * example : {urljsstring 'jxacl~admin_rightslist',array(),array('grpid'=>'idgroup','__rnd'=>'Math.random()')};<br/>
 * it will produce: "index.php?module=acl&action=admin_rightslist&grpid="+idgroup+"&__rnd="+ Math.random();
 * @param jTpl $tpl template engine
 * @param string $selector selector action
 * @param array $params parameters for the url
 * @param array $jsparam array : key=name of a url parameter, value=piece of javascript code ( variable name for example)
 */
function jtpl_function_xul_urljsstring($tpl, $selector, $params=array(), $jsparams=array())
{
    $search = array();
    $repl =array();
    foreach($jsparams as $par=>$var){
        $params[$par] = '__@@'.$var.'@@__';
        $search[] = urlencode($params[$par]);
        $repl[] = '"+encodeURIComponent('.$var.')+"';
    }

    $url = jUrl::get($selector, $params, 0);

    echo '"'.str_replace($search, $repl, $url).'"';
}


