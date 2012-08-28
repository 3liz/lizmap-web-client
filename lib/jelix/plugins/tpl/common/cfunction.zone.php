<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @copyright   2006 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * cfunction plugin :  include the content of a zone
 *
 * <pre> {zone 'myModule~myzone'}
 * {zone 'myModule~myzone',array('foo'=>'bar)}</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param array $param 0=>$string the zone selector (string)
 *                     1=>$params parameters for the zone (array)
 * @return string the php code corresponding to the function content
 */
function jtpl_cfunction_common_zone($compiler, $params=array())
{
    if(count($params) == 2){
        $content = 'echo jZone::get('.$params[0].','.$params[1].');';
    }elseif(count($params) == 1){
        $content = 'echo jZone::get('.$params[0].');';
    }else{
        $content='';
        $compiler->doError2('errors.tplplugin.cfunction.bad.argument.number','zone','1-2');
    }
    return $content;
}

