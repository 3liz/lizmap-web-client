<?php
/**
* @package     jelix-scripts
* @author      Florian Lonqueu-Brochard
* @contributor Laurent Jouanneau
* @copyright   2011 Florian Lonqueu-Brochard, 2011-2020 Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class createlangpackageCommand extends JelixScriptCommand {

    public  $name = 'createlangpackage';
    public  $allowed_options=array('-to-overload'=>false, '-to-app'=>false);
    public  $allowed_parameters=array('lang'=>true, 'model_lang'=>false);

    public  $syntaxhelp = "LANG [MODEL_LANG]";
    public  $help=array(
        'fr'=>"Créer des fichiers properties pour une nouvelle langue, à partir des fichiers de chaque modules d'une langue donnée",
        'en'=>"Create properties file for a new lang, from locales stored in each modules, of a specific lang."
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

            if ($this->getOption('-to-overload')) {
                $target_dir = jApp::varPath('overloads/'.$module.'/locales/'.$lang.'/');
            }
            else if ($this->getOption('-to-app')) {
                $target_dir = jApp::appPath('app/locales/'.$lang.'/'.$module.'/locales/');
            }
            else {
                $target_dir = jApp::varPath('locales/'.$lang.'/'.$module.'/locales/');
            }

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
