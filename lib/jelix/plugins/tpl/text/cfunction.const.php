<?php
/**
 * display a constant
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author      Laurent Jouanneau
 * @copyright  2008 Laurent Jouanneau
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * compiled function plugin :  display a constant. Not available in untrusted templates
 *
 * <pre>{const 'foo'}</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param array $param   0=>$string the constant name
 * @return string the php code corresponding to the function content
 */
function jtpl_cfunction_text_const($compiler, $param=array()) {
    if(!$compiler->trusted) {
        $compiler->doError1('errors.tplplugin.untrusted.not.available','const');
        return '';
    }
    if(count($param) == 1){
        return 'echo constant('.$param[0].');';
    }else{
        $compiler->doError2('errors.tplplugin.cfunction.bad.argument.number','const','1');
        return '';
    }
}


