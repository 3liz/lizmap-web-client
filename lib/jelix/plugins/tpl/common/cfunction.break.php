<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Denis Lallement
* @copyright   2009 Denis Lallement
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* cfunction to allow to had a break instruction in a template
* 
* <pre>
* <ul>
* {for $i = 1; $i < 10; $i++}
*     <li>{$i}</li>
*     {if $i == '4'}{break}{/if}
* {/for}
* </ul></pre>
*/
function jtpl_cfunction_common_break($compiler) {
    return ' break;';
}
