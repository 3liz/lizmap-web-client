<?php
/**
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author     Laurent Jouanneau
 * @copyright  2018 Laurent Jouanneau
 * @link       https://jelix.org
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * function plugin: write the url corresponding to the given jelix action,
 * inserting placeholder name (between two %) for some parameter, so you can generate the
 * url dynamically in JS by replacing placeholders by javascript values.
 *
 * example :
 * <pre>
 * <div id="baz" data-url="{jurlpattern 'jxacl~admin_rightslist',
 *          array('foo'=>'bar'),
 *          array('grpid'=>'idgroup',  'acl'=>'acl')
 * }">
 * </pre>
 *
 * it may produce something like that (depending how the url is configured for
 * the 'jxacl~admin_rightslist' action):
 *   <code>index.php/acl/rightslist/%idgroup%/bar?acl=%acl%</code>
 *
 * Then you can replace placeholders
 *
 * <code>
 *
 * var urlpattern = document.getElementById("baz").dataset.url;
 * var id_group = 45, acl = 'hello';
 * var url = urlpattern.replace("%idgroup%", id_group);
 * url = url.replace("%acl%", acl);
 *
 * </code>
 *
 * @param jTpl $tpl template engine
 * @param string $selector selector action
 * @param array $params static parameters for the url
 * @param array $placeholders  list of placeholders: key=name of an url parameter,
 *              value=a placeholder name you choose
 */
function jtpl_function_html_jurlpattern($tpl, $selector, $params=array(), $placeholders=array())
{
    $search = array();
    $repl =array();
    foreach($placeholders as $par => $var){
        $params[$par] = '__@@'.$var.'@@__';
        $search[] = urlencode($params[$par]);
        $repl[] = '%'.$var.'%';
    }

    $url = jUrl::get($selector, $params);

    echo str_replace($search, $repl, $url);
}

