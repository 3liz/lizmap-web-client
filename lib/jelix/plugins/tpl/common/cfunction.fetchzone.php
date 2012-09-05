<?php
/**
 * @package     jelix
 * @subpackage  jtpl_plugin
 * @author      Julien Issler
 * @copyright   2009 Julien Issler
 * @link        http://www.jelix.org
 * @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * cfunction to fetch the content of a zone into a tpl var
 *
 * <pre> {fetchzone 'myVar', 'myModule~myzone', array('foo'=>'bar)}
 * {if $myVar !== ''}
 * <div id="container">
 * {$myVar}
 * </div>
 * {/if}</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param array $param 0=>$string the name of the tpl var that will hold the zone's content
 *                     1=>$string the zone selector (string)
 *                     2=>$params parameters for the zone (array)
 * @return string the php code corresponding to the function content
 */
function jtpl_cfunction_common_fetchzone($compiler, $params=array()){
    if(count($params) == 3)
        return '$t->_vars['.$params[0].'] = jZone::get('.$params[1].','.$params[2].');';
    else if(count($params) == 2)
        return '$t->_vars['.$params[0].'] = jZone::get('.$params[1].');';
    $compiler->doError2('errors.tplplugin.cfunction.bad.argument.number','fetchzone','2-3');
    return '';
}