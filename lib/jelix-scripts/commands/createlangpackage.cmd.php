<?php
/**
* @package     jelix-scripts
* @author      Florian Lonqueu-Brochard
* @contributor Laurent Jouanneau
* @copyright   2011 Florian Lonqueu-Brochard, 2011-2012 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class createlangpackageCommand extends JelixScriptCommand {

    public  $name = 'createlangpackage';
    public  $allowed_options=array();
    public  $allowed_parameters=array('lang'=>true, 'model_lang'=>false);

    public  $syntaxhelp = "LANG [MODEL_LANG]";
    public  $help=array(
        'fr'=>"Créer des fichiers properties pour tous les modules pour une langue spécifique, à partir
des fichiers d'une autre langue",
        'en'=>"Create properties file for all modules for a specific lang, from files of an existing locale"
    );

    public function run(){
        $this->loadAppConfig();
        $config = jApp::config();

        $model_lang = $this->getParam('model_lang', $config->locale);
        $lang = $this->getParam('lang');

        foreach ($config->_modulesPathList as $module=>$dir) {
            $source_dir = $dir.'locales/'.$model_lang.'/';
            if (!file_exists($source_dir))
                continue;

            $target_dir = jApp::varPath('overloads/'.$module.'/locales/'.$lang.'/');
            jFile::createDir($target_dir);

            if ($dir_r = opendir($source_dir)) {
                while( FALSE !== ($fich = readdir($dir_r)) ) {
                    if ($fich != "." && $fich != ".."
                        && is_file($source_dir.$fich)
                        && strpos($fich, '.'.$config->charset.'.properties')
                        && !file_exists($target_dir.$fich)) {
                        copy ($source_dir.$fich, $target_dir.$fich);
                        if ($this->verbose()) {
                            echo "Copy Locales file $fich from $source_dir to $target_dir.\n";
                        }
                    }
                }
                closedir($dir_r);
            }
        }
    }
}
