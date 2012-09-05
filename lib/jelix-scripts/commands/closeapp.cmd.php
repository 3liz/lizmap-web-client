<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @copyright   2010 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

class closeappCommand extends JelixScriptCommand {

    public  $name = 'closeapp';
    public  $allowed_options = array();
    public  $allowed_parameters = array('message'=>false);

    public  $syntaxhelp = "[MESSAGE]";
    public  $help = '';

    function __construct($config){
        $this->help= array(
            'fr'=>"
    Ferme l'application. Elle ne sera plus accessible depuis le web.
    ",
            'en'=>"
    Close the application. It will not accessible anymore from the web.
    ",
    );
        parent::__construct($config);
    }

    public function run(){
        jAppManager::close($this->getParam('message',''));
        if ($this->verbose())
            echo "Application is closed.\n";
    }
}
