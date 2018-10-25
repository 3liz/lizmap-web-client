<?php
/**
 * @package    jelix
 * @subpackage jtpl_plugin
 * @copyright  2018 Laurent Jouanneau
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 * Dump a value into log files
 * @param jTpl $tpl
 * @param mixed $value
 */
function jtpl_function_common_dumptolog($tpl, $value)
{
    jLog::dump($value);
}
