<?php
/**
* @package    jelix
* @subpackage core
* @author     Laurent Jouanneau
* @author     Gerald Croes
* @contributor Julien Issler, Yannick Le Guédart, Dominique Papin
* @copyright  2001-2005 CopixTeam, 2005-2012 Laurent Jouanneau
* Some parts of this file are took from Copix Framework v2.3dev20050901, CopixI18N.class.php, http://www.copix.org.
* copyrighted by CopixTeam and released under GNU Lesser General Public Licence.
* initial authors : Gerald Croes, Laurent Jouanneau.
* enhancement by Laurent Jouanneau for Jelix.
* @copyright 2008 Julien Issler, 2008 Yannick Le Guédart, 2008 Dominique Papin
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* a bundle contains all readed properties in a given language, and for all charsets
* @package  jelix
* @subpackage core
*/
class jBundle {
    /**
     * @var jISelector
     */
    public $fic;
    /**
     * @var string
     */
    public $locale;

    protected $_loadedCharset = array ();
    protected $_strings = array();

    /**
    * constructor
    * @param jISelector   $file selector of a properties file
    * @param string      $locale    the code lang
    */
    public function __construct ($file, $locale){
        $this->fic  = $file;
        $this->locale = $locale;
    }

    /**
    * get the translation
    * @param string $key the locale key
    * @param string $charset
    * @return string the localized string
    */
    public function get ($key, $charset = null){

        if($charset == null){
            $charset = jApp::config()->charset;
        }
        if (!in_array ($charset, $this->_loadedCharset)){
            $this->_loadLocales ($charset);
        }

        if (isset ($this->_strings[$charset][$key])){
            return $this->_strings[$charset][$key];
        }else{
            return null;
        }
    }

    /**
    * Loads the resources for a given locale/charset.
    * @param string $charset    the charset
    */
    protected function _loadLocales ($charset){

        $this->_loadedCharset[] = $charset;

        $source = $this->fic->getPath();
        $cache = $this->fic->getCompiledFilePath();

        // check if we have a compiled version of the ressources

        if (is_readable ($cache)){
            $okcompile = true;

            if (jApp::config()->compilation['force']){
               $okcompile = false;
            }else{
                if (jApp::config()->compilation['checkCacheFiletime']){
                    if (is_readable ($source) && filemtime($source) > filemtime($cache)){
                        $okcompile = false;
                    }
                }
            }

            if ($okcompile) {
                include ($cache);
                $this->_strings[$charset] = $_loaded;
                return;
            }
        }

        $this->_loadResources ($source, $charset);

        if(isset($this->_strings[$charset])){
            $content = '<?php $_loaded= '.var_export($this->_strings[$charset], true).' ?>';

            jFile::write($cache, $content);
        }
    }


    /**
    * loads a given resource from its path.
    */
    protected function _loadResources ($fichier, $charset){

        if (($f = @fopen ($fichier, 'r')) !== false) {
            $utf8Mod = ($charset=='UTF-8')?'u':'';
            $unbreakablespace = ($charset=='UTF-8')?utf8_encode(chr(160)):chr(160);
            $escapedChars = array('\#','\n', '\w', '\S', '\s');
            $unescape = array('#',"\n", ' ', $unbreakablespace, ' ');
            $multiline=false;
            $linenumber=0;
            $key='';
            while (!feof($f)) {
                if($line=fgets($f)){
                    $linenumber++;
                    $line=rtrim($line);
                    if($multiline){
                        if(preg_match("/^\s*(.*)\s*(\\\\?)$/U".$utf8Mod, $line, $match)){
                            $multiline= ($match[2] =="\\");
                            if (strlen ($match[1])) {
                                $sp = preg_split('/(?<!\\\\)\#/', $match[1], -1 ,PREG_SPLIT_NO_EMPTY);
                                $this->_strings[$charset][$key].=' '.str_replace($escapedChars,$unescape,trim($sp[0]));
                            } else {
                                $this->_strings[$charset][$key].=' ';
                            }
                        }else{
                            throw new Exception('Syntaxe error in file properties '.$fichier.' line '.$linenumber,210);
                        }
                    }elseif(preg_match("/^\s*(.+)\s*=\s*(.*)\s*(\\\\?)$/U".$utf8Mod,$line, $match)){
                        // on a bien un cle=valeur
                        $key=$match[1];
                        $multiline= ($match[3] =="\\");
                        $sp = preg_split('/(?<!\\\\)\#/', $match[2], -1 ,PREG_SPLIT_NO_EMPTY);
                        if(count($sp)){
                            $value=trim($sp[0]);
                        }else{
                            $value='';
                        }

                        $this->_strings[$charset][$key] = str_replace($escapedChars,$unescape,$value);

                    }elseif(preg_match("/^\s*(\#.*)?$/",$line, $match)){
                        // ok, just a comment
                    }else {
                        throw new Exception('Syntaxe error in file properties '.$fichier.' line '.$linenumber,211);
                    }
                }
            }
            fclose ($f);
        }else{
            throw new Exception('Cannot load the resource '.$fichier,212);
        }
    }
}
