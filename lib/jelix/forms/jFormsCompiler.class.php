<?php
/**
* @package    jelix
* @subpackage forms
* @author     Laurent Jouanneau
* @contributor Loic Mathaud, Dominique Papin
* @contributor Uriel Corfa (Emotic SARL), Julien Issler
* @copyright   2006-2012 Laurent Jouanneau
* @copyright   2007 Loic Mathaud, 2007 Dominique Papin
* @copyright   2007 Emotic SARL
* @copyright   2008 Julien Issler
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * Generates form class from an xml file describing the form
 * @package     jelix
 * @subpackage  forms
 */
class jFormsCompiler implements jISimpleCompiler {

    protected $sourceFile;

    public function compile($selector){

        $this->sourceFile = $selector->getPath();

        // load XML file
        $doc = new DOMDocument();

        if(!$doc->load($this->sourceFile)){
            throw new jException('jelix~formserr.invalid.xml.file',array($this->sourceFile));
        }

        if ($doc->documentElement->namespaceURI == JELIX_NAMESPACE_BASE.'forms/1.0') {
            require_once(JELIX_LIB_PATH.'forms/jFormsCompiler_jf_1_0.class.php');
            $compiler = new jFormsCompiler_jf_1_0($this->sourceFile);
        } elseif ($doc->documentElement->namespaceURI == JELIX_NAMESPACE_BASE.'forms/1.1') {
            if ($doc->documentElement->localName != 'form') {
                throw new jException('jelix~formserr.bad.root.tag',array($doc->documentElement->localName, $this->sourceFile));
            }
            require_once(JELIX_LIB_PATH.'forms/jFormsCompiler_jf_1_1.class.php');
            $compiler = new jFormsCompiler_jf_1_1($this->sourceFile);
        } else {
           throw new jException('jelix~formserr.namespace.wrong',array($this->sourceFile));
        }

        $source=array();
        $source[] = "<?php \nif (jApp::config()->compilation['checkCacheFiletime'] &&\n";
        $source[] .= "filemtime('".$this->sourceFile.'\') > '.filemtime($this->sourceFile)."){ return false;\n}else{\n";
        $source[]='class '.$selector->getClass().' extends jFormsBase {';
        
        $source[]=' public function __construct($sel, &$container, $reset = false){';
        $source[]='          parent::__construct($sel, $container, $reset);';

        $compiler->compile($doc, $source);

        $source[]="  }\n}\n return true;}";
        jFile::write($selector->getCompiledFilePath(), implode("\n", $source));

        return true;
    }
}
