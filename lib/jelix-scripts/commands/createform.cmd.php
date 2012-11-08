<?php
/**
* @package     jelix-scripts
* @author      Laurent Jouanneau
* @contributor Loic Mathaud
* @copyright   2007-2012 Laurent Jouanneau, 2008 Loic Mathaud, 2009 Bastien Jaillot
* @link        http://www.jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/


class createformCommand extends JelixScriptCommand {

    public  $name = 'createform';
    public  $allowed_options=array('-createlocales'=>false);
    public  $allowed_parameters=array('module'=>true,'form'=>true, 'dao'=>false);

    public  $syntaxhelp = "[-createlocales] MODULE FORM [DAO]";
    public  $help=array(
        'fr'=>"
    Crée un nouveau fichier jforms, soit vide, soit un formulaire à partir d'un fichier dao

    Si l'option -createlocales est présente, créé les fichiers locales avec les champs du formulaire

    MODULE: nom du module concerné.
    FORM : nom du formulaire.
    DAO   : sélecteur du dao concerné. Si non indiqué, le fichier jforms sera vide.",

        'en'=>"
    Create a new jforms file, from a jdao file.

    If you give the -createlocales option, it will create the locales files with the form's values.

    MODULE : module name where to create the form
    FORM : name of the form
    DAO    : selector of the dao on which the form will be based. If not given, the jforms file will be empty",
    );


    public function run(){

        $this->loadAppConfig();

        $path = $this->getModulePath($this->_parameters['module']);

        $formdir = $path.'forms/';
        $this->createDir($formdir);

        $formfile = strtolower($this->_parameters['form']).'.form.xml';

        if ($this->getOption('-createlocales')) {

            $locale_content = '';
            $locale_base = $this->_parameters['module'].'~'.strtolower($this->_parameters['form']).'.form.';

            $locale_filename_fr = 'locales/fr_FR/';
            $this->createDir($path.$locale_filename_fr);
            $locale_filename_fr.=strtolower($this->_parameters['form']).'.UTF-8.properties';

            $locale_filename_en = $path.'locales/en_US/';
            $this->createDir($locale_filename_en);
            $locale_filename_en.=strtolower($this->_parameters['form']).'.UTF-8.properties';

            $submit="\n\n<submit ref=\"_submit\">\n\t<label locale='".$locale_base."ok' />\n</submit>";
        }
        else
            $submit="\n\n<submit ref=\"_submit\">\n\t<label>ok</label>\n</submit>";

        $dao = $this->getParam('dao');
        if ($dao === null) {
            if ($this->getOption('-createlocales')) {
                $locale_content = "form.ok=OK\n";
                $this->createFile($path.$locale_filename_fr, 'locales.tpl', array('content'=>$locale_content), "Locales file");
                $this->createFile($path.$locale_filename_en, 'locales.tpl', array('content'=>$locale_content), "Locales file");
            }
            $this->createFile($formdir.$formfile, 'module/form.xml.tpl', array('content'=>'<!-- add control declaration here -->'.$submit), "Form");
            return;
        }

        jApp::config()->startModule = $this->_parameters['module'];
        jContext::push($this->_parameters['module']);

        $tools = jDb::getConnection()->tools();

        // we're going to parse the dao
        $selector = new jSelectorDao($dao,'');

        $doc = new DOMDocument();
        $daoPath = $selector->getPath();

        if(!$doc->load($daoPath)){
           throw new jException('jelix~daoxml.file.unknown', $daoPath);
        }

        if($doc->documentElement->namespaceURI != JELIX_NAMESPACE_BASE.'dao/1.0'){
           throw new jException('jelix~daoxml.namespace.wrong',array($daoPath, $doc->namespaceURI));
        }

        $parser = new jDaoParser ($selector);
        $parser->parse(simplexml_import_dom($doc), $tools);

        // now we generate the form file
        $properties = $parser->GetProperties();
        $table = $parser->GetPrimaryTable();

        $content = '';

        foreach($properties as $name=>$property){
            if( !$property->ofPrimaryTable) {
                continue;
            }
            if($property->isPK && $property->autoIncrement) {
                continue;
            }

            $attr='';
            if($property->required)
                $attr.=' required="true"';

            if($property->defaultValue !== null)
                $attr.=' defaultvalue="'.htmlspecialchars($property->defaultValue).'"';

            if($property->maxlength !== null)
                $attr.=' maxlength="'.$property->maxlength.'"';

            if($property->minlength !== null)
                $attr.=' minlength="'.$property->minlength.'"';

            $datatype='';
            $tag = 'input';
            switch($property->unifiedType){
                case 'integer':
                case 'numeric':
                    $datatype='integer';
                    break;
                case 'datetime':
                    $datatype='datetime';
                    break;
                case 'time':
                    $datatype='time';
                    break;
                case 'date':
                    $datatype='date';
                    break;
                case 'double':
                case 'float':
                    $datatype='decimal';
                    break;
                case 'text':
                case 'blob':
                    $tag='textarea';
                    break;
                case 'boolean':
                    $tag='checkbox';
                    break;
            }
            if($datatype != '')
                $attr.=' type="'.$datatype.'"';

            if ($this->getOption('-createlocales')) {
                $locale_content .= 'form.'.$name.'='. ucwords(str_replace('_',' ',$name))."\n";
                $content.="\n\n<$tag ref=\"$name\"$attr>\n\t<label locale='".$locale_base.$name."' />\n</$tag>";
            } else {
                $content.="\n\n<$tag ref=\"$name\"$attr>\n\t<label>".ucwords(str_replace('_',' ',$name))."</label>\n</$tag>";
            }
        }

        if ($this->getOption('-createlocales')) {
            $locale_content .= "form.ok=OK\n";
            $this->createFile($path.$locale_filename_fr, 'module/locales.tpl', array('content'=>$locale_content), "Locales file");
            $this->createFile($path.$locale_filename_en, 'module/locales.tpl', array('content'=>$locale_content), "Locales file");
        }

        $this->createFile($formdir.$formfile,'module/form.xml.tpl', array('content'=>$content.$submit), "Form file");
    }
}
