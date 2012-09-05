<?php
/**
* @package     jelix-scripts
* @author      Christophe Thiriot
* @contributor Loic Mathaud
* @contributor Laurent Jouanneau
* @copyright   2006 Christophe Thiriot, 2007-2011 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class cleartempCommand extends JelixScriptCommand {

    public  $name = 'cleartemp';
    public  $allowed_options=array();
    public  $allowed_parameters=array();

    public  $syntaxhelp = "";
    public  $help=array(
            'fr'=>"
    Vide le cache.",
            'en'=>"
    Delete cache files.",
            );


    public function run(){
        try {
            $tempPath = jApp::tempBasePath();
            if ($tempPath == DIRECTORY_SEPARATOR || $tempPath == '' || $tempPath == '/') {
                echo "Error: bad path in jApp::tempBasePath(), it is equals to '".$tempPath."' !!\n";
                echo "       Jelix cannot clear the content of the temp directory.\n";
                echo "       Correct the path in your application.init.php or create the corresponding directory\n";
                exit(1);
            }
            if (!jFile::removeDir($tempPath, false, array('.svn', '.dummy'))) {
                echo "Some temp files were not removed\n";
            }
            else if ($this->verbose())
                echo "All temp files have been removed\n";
        }
        catch (Exception $e) {
            if($this->config->helpLang == 'fr') {
               echo "Un ou plusieurs répertoires n'ont pas pu être supprimés.\n" .
                    "Message d'erreur : " . $e->getMessage()."\n";
            } else {
               echo "One or more directories couldn't be deleted.\n" .
                    "Error: " . $e->getMessage()."\n";
            }
        }
    }
}
