<?php
/**
 * @package     jelix-scripts
 * @author      Laurent Jouanneau
 * @copyright   2018 Laurent Jouanneau
 * @link        https://jelix.org
 * @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
 */


class setinivalueCommand extends JelixScriptSingleCommand {

    public  $name = 'setinivalue';
    public  $allowed_options=array('--del'=>false, '--create-file'=>false);
    public  $allowed_parameters=array('file'=>true, 'param'=>true, 'value'=>false, 'section'=>false);

    public  $syntaxhelp = "[--del] [--create-file] <file> <param> [<value> [<section>]]";
    public  $help=array(
        'fr'=>"
    modifie un paramètre dans un fichier ini",
        'en'=>"
    modify a parameter from an ini file",
    );

    public function run(){
        $todel = $this->getOption('--del');
        $createFile = $this->getOption('--create-file');

        $file = $this->getParam('file');
        $param = $this->getParam('param');
        $value = $this->getParam('value');
        $section = $this->getParam('section');
        if ($section === null) {
            $section = 0;
        }

        if ($createFile && !file_exists($file)) {
            file_put_contents($file, "");
        }

        $ini = new jIniFileModifier($file);

        if ($todel) {
            $ini->removeValue($param, $section);
        }
        else {
            if ($value === null) {
                throw new Exception("value is missing");
            }
            $ini->setValue($param, $value, $section);
        }
        $ini->save();
    }
}
