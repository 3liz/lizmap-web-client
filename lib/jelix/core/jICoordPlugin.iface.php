<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @copyright  2005-2006 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/


/**
* interface that should implement all coordinator plugins
* @package  jelix
* @subpackage core
*/
interface jICoordPlugin {

    /**
     * @param    array  $config  content of the config ini file of the plugin
     */
    public function __construct($config);

    /**
     * this method is called before each action
     * @param    array  $params   plugin parameters for the current action
     * @return null or jSelectorAct  if action should change
     */
    public function beforeAction($params);

    /**
     * this method is called after the execution of the action, and before the output of the response
     */
    public function beforeOutput();

    /**
     * this method is called after the output.
     */
    public function afterProcess ();
}
