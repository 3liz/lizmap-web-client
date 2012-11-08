<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Lepeltier kévin
 * @contributor Dominique Papin
 * @copyright   2008 Lepeltier kévin, 2008 Dominique Papin
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Adds the path followed by the user
 *
 * {breadcrumb 5, '>>'}
 *
 * <ol class="history">
 *     <li value="3" class="first"><a href="./?module=main&action=page&page=home">Home</a> >> </li>
 *     <li><a href="./?module=main&action=page&page=product">Product</a> >> </li>
 *     <li><a href="./?module=main&action=page&page=home">Home</a> >> </li>
 *     <li class="end"><a href="./?module=main&action=page&page=contact">Contact</a></li>
 * </ol>
 *
 * Rendering example :
 *
 * Home >> Product >> Home >> Contact
 * ¯¯¯¯    ¯¯¯¯¯¯¯    ¯¯¯¯
 */

/**
 * breadcrumb plugin : display breadcrumb trails, ie. user navigation tracking
 *
 * @param jTpl $tpl template engine
 * @param array $nb the number of items displayed by the plugin
 * @param string $separator Symbol separating items
 */
function jtpl_function_html_breadcrumb($tpl, $nb=null, $separator = '') {

    $plugin = jApp::coord()->getPlugin('history', true);
    if($plugin === null){
        return;
    }

    $config = & $plugin->config;
    if (!isset($config['session_name'])
        || $config['session_name'] == ''){
        $config['session_name'] = 'HISTORY';
    }

    if( !isset($_SESSION[$config['session_name']]) ) {
        return;
    }

    echo '<ol class="history">';

    $leng = count($_SESSION[$config['session_name']]);
    $nb = ($nb !== null)? count($_SESSION[$config['session_name']])-$nb:0;
    $nb = ($nb < 0)? 0:$nb;

    for( $i = $nb; $i < $leng; $i++ ) {

        $page = $_SESSION[$config['session_name']][$i];
        echo '<li'.($i==$nb?' class="first"':($i==$leng-1?' class="end"':'')).'>';
        if( $i!=$leng-1 )
            echo '<a href="'.jUrl::get($page['action'], $page['params'], jUrl::XMLSTRING).'" '.($page['title']!=''?'title="'.$page['title'].'"':'').'>';
        echo $_SESSION[$config['session_name']][$i]['label'];

        if( $i!=$leng-1 )
            echo '</a>';

        echo ($i==$leng-1?'':$separator).'</li>';
    }

    echo '</ol>';
}
