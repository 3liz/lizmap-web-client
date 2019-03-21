<?php
/**
 * @package    jelix
 * @subpackage jtpl_plugin
 * @copyright  2019 Laurent Jouanneau
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * fetch the content of a template without template variables of
 * calling template, except private variables setted by some plugins
 *
 * It allows to use a template as a recursive way, in a cleaner way than include,
 * because it doesn't inherits of variables from the parent template
 *
 * Meta content must not use template variable given to 'fetch', as they will not
 * be available at the time of meta processing (except if they are a copy of
 * template variable of the parent template)
 *
 *
 * <pre>{fetch 'myModule~foo', array('varname'=>'value) }</pre>
 * @param jTplCompiler $compiler the template compiler
 * @param array $param   0=>string the template selector (string)
 *                       1=>array  a list of template variable to inject into the template
 *                       2=>boolean : inherits (true) or not of private variables. default is true.
 * @return string the php code corresponding to the function content
 */
function jtpl_cfunction_common_fetchtpl($compiler, $param=array()) {
    if(!$compiler->trusted) {
        $compiler->doError1('errors.tplplugin.untrusted.not.available','fetch');
        return '';
    }
    if (count($param) < 2 || count($param) > 3) {
      $compiler->doError2('errors.tplplugin.cfunction.bad.argument.number','fetch','2');
      return '';
    }

    if (count($param) == 2) {
      $param[] = 'true';
    }

    $compiler->addMetaContent('$t->meta('.$param[0].');');
    $php = '$tplClass=get_class($t);$subTpl = new $tplClass();';
    $php .= 'if ('.$param[2].') { $subTpl->_privateVars = $t->_privateVars;}'."\n";
    $php .= '$subTpl->assign('.$param[1].');';
    $php .= '$subTpl->display('.$param[0].');'."\n";
    return $php;

}
