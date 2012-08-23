<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @copyright  2005-2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * function plugin :  write the localized string corresponding to the given locale key
 *
 * example : {jlocale 'myModule~my.locale.key'}
 * @param jTpl $tpl template engine
 * @param string $locale the locale key
 * @param array $params parameters (optional)
 * @param string $lang  the lang (optional)
 */
function jtpl_function_text_jlocale($tpl, $locale)
{
     if(func_num_args() == 4 && is_array(func_get_arg(2))){
         $param2 = func_get_arg(2);
         $param3 = func_get_arg(3);
         echo jLocale::get($locale, $param2, $param3);
     }elseif(func_num_args() == 3 && is_array(func_get_arg(2))){
          $param = func_get_arg(2);
          echo jLocale::get($locale, $param);
     }elseif(func_num_args() > 2){
         $params = func_get_args();
         unset($params[0]);
         unset($params[1]);
         echo jLocale::get($locale, $params);
     }else{
         echo jLocale::get($locale);
     }
}
