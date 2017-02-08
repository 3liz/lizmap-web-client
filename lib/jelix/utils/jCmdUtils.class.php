<?php
/**
* @package    jelix
* @subpackage utils
* @author     Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright  2006 Loic Mathaud, 2008-2017 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence  http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
*/

/**
 * utilities functions for command line
 * @package    jelix
 * @subpackage utils
 * @static
 */
class jCmdUtils {

    private function __construct() {}

    /**
     * analyze command line parameters and return an array
     * of all options and parameters which correspond to
     * allowed options and parameters
     *
     * allowed options should be an array like this :
     * array('-option1'=>bool, '-option2'=>bool, ..)
     * the boolean indicates that the option has a value on the CLI
     *
     * allowed parameters is an array like this:
     * array('param1'=>bool, 'param2'=>bool, ..)
     * it means that the first parameter value will be in the param1,
     * the second in param2 etc.. The boolean says that the parameter
     * is required (true) or optional (false). If a parameter is optional,
     * following parameters should be optional.
     *
     * the returned array contains two array :
     * array('-option1'=>value, '-option2'=>value, ...)
     * array('param1'=>value, 'param2'=>value...)
     *
     *
     * @param array $argv the array of parameters given by php-cli
     * @param array $sws allowed options
     * @param array $params allowed parameters
     * @return array an array with the array of founded option and
     *                        an array with founded parameters
     * @throws jException
     */
    public static function getOptionsAndParams($argv, $sws, $params) {
        $switches = array();
        $parameters = array();

        //---------- get the switches
        while (count($argv) && $argv[0]{0} == '-') {
            if (isset($sws[$argv[0]])) {
                if ($sws[$argv[0]]) {
                    if (isset($argv[1]) && ($argv[1]{0} != '-' || !isset($sws[$argv[1]]))) {
                        $sw = array_shift($argv);
                        $switches[$sw] = array_shift($argv);
                    } else {
                        throw new jException('jelix~errors.cli.option.value.missing', $argv[0]);
                    }
                } else {
                    $sw = array_shift($argv);
                    $switches[$sw] = true;
                }
            } else {
                throw new jException('jelix~errors.cli.unknown.option', $argv[0]);
            }
        }

        //---------- get the parameters
        foreach ($params as $pname => $needed) {
            if (count($argv) == 0) {
                if ($needed) {
                    throw new jException('jelix~errors.cli.param.missing', $pname);
                } else {
                    break;
                }
            }
            $parameters[$pname]=array_shift($argv);
        }

        if (count($argv)) {
            throw new jException('jelix~errors.cli.two.many.parameters');
        }

        return array($switches , $parameters);
    }

}


