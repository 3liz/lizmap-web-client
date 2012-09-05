<?php
/**
 * Plugin from smarty project and adapted for jtpl
 * @package    jelix
 * @subpackage jtpl_plugin
 * @copyright  2001-2003 ispi of Lincoln, Inc.
 * @contributor Brice Tence
 * @link http://smarty.php.net/
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * function plugin :  include a template into another template
 *
 * <pre>{include 'myModule~foo'}</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param array $param   0=>$string the template selector (string)
 * @return string the php code corresponding to the function content
 */
function jtpl_cfunction_common_include($compiler, $param=array()) {
    if(!$compiler->trusted) {
        $compiler->doError1('errors.tplplugin.untrusted.not.available','include');
        return '';
    }
    if(count($param) == 1){
        $compiler->addMetaContent('$t->meta('.$param[0].');');
        return '$t->display('.$param[0].');';
    }else{
        $compiler->doError2('errors.tplplugin.cfunction.bad.argument.number','include','1');
        return '';
    }
}
