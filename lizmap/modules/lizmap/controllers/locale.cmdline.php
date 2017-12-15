<?php
/**
* @package   lizmap
* @subpackage lizmap
* @author    your name
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/
//require (JELIX_LIB_CORE_PATH.'selector/jSelectorModule.class.php');
class mySelectorModule extends jSelectorModule {
}

class localeCtrl extends jControllerCmdLine {

    /**
    * Options to the command line
    *  'method_name' => array('-option_name' => true/false)
    * true means that a value should be provided for the option on the command line
    */
    protected $allowed_options = array(
    );

    /**
     * Parameters for the command line
     * 'method_name' => array('parameter_name' => true/false)
     * false means that the parameter is optional. All parameters which follow an optional parameter
     * is optional
     */
    protected $allowed_parameters = array(
        'pot' => array(
            'module'=>True, // module name
            'output'=>True  // output pot file full path
        ),
        'po' => array(
            'module'=>True, // module name
            'locale'=>True, // locale
            'output'=>True  // output po file full path
        ),
        'localize' => array(
            'module'=>True, // module name
            'input'=>True,  // po file full path
            'output'=>True  // output directory full path
        )
    );

    /**
     * Help
     *
     *
     */
    public $help = array(

        'pot' => 'Generate a POT file for a module.

        Use :
        php lizmap/scripts/script.php lizmap~locale:pot module output_path

        Example :
        php lizmap/scripts/script.php lizmap~locale:pot view /tmp/
        ',

        'po' => 'Generate a PO file for a module and a locale.

        Use :
        php lizmap/scripts/script.php lizmap~locale:po module locale output_path

        Example :
        php lizmap/scripts/script.php lizmap~locale:po view fr_FR /tmp/fr_FR/
        ',

        'localize' => 'Generate a Jelix locale file for a module and a locale.

        Use :
        php lizmap/scripts/script.php lizmap~locale:localize module input_path output_path

        Example :
        php lizmap/scripts/script.php lizmap~locale:localize view /tmp/fr_FR/view.po /tmp/lizmap/view/locales/fr_FR/
        '

    );

    /**
     * Generate POT file for a module
     */
    function pot() {
        $rep = $this->getResponse(); // cmdline response by default

        //$module = new mySelectorModule( $this->param('module') );
        $module = $this->param('module');

        if (!isset(jApp::config()->_modulesPathList[$module])) {
            if ($module == 'jelix')
                throw new Exception('jelix module is not enabled !!');
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $module);
        }

        $path = jApp::config()->_modulesPathList[$module].'locales/en_US/';

        $files = Array();
        if ( $dh = opendir( $path ) ) {
            while( ($file = readdir($dh)) !== false ) {
                if (substr($file, -17) == '.UTF-8.properties' && $file != 'format.UTF-8.properties')
                    $files[] = $file;
            }
            closedir($dh);
        }

        $rep->addContent("================\n");
        $rep->addContent( $module ."\n" );
        $rep->addContent( jApp::config()->_modulesPathList[$module] ."\n" );
        $rep->addContent( $path ."\n" );

        $dt= new DateTime('NOW');
        $xml = simplexml_load_file(jApp::appPath('project.xml'));

        $str = "#\n";
        $str.= 'msgid ""'."\n";
        $str.= 'msgstr ""'."\n";
        $str.= '"Project-Id-Version: '.(string)$xml->info->label.' '.$module.' '.(string)$xml->info->version.'\n"'."\n";
        $str.= '"Report-Msgid-Bugs-To:\n"'."\n";
        $str.= '"POT-Creation-Date: '.$dt->format('Y-m-d H:i+O').'\n"'."\n";
        $str.= '"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\n"'."\n";
        $str.= '"Last-Translator: FULL NAME <EMAIL@ADDRESS>\n"'."\n";
        $str.= '"MIME-Version: 1.0\n"'."\n";
        $str.= '"Content-Type: text/plain; charset=UTF-8\n"'."\n";
        $str.= '"Content-Transfer-Encoding: 8bit\n"'."\n";

        foreach( $files as $f ) {
            $rep->addContent( $f ."\n" );

            $lines = file( $path.$f );
            foreach ($lines as $lineNumber => $lineContent){
                if(!empty($lineContent) and $lineContent != '\n'){
                    $exp = explode('=', trim($lineContent), 2);
                    if( count($exp) == 2 && !empty($exp[0]) ) {
                        $str.= "\n";
                        $msgctxt = $module.'~'.str_replace('.UTF-8.properties','',$f).'.'.trim($exp[0]);
                        $str.= "#: ".$msgctxt."\n";
                        $str.= 'msgctxt "'.$msgctxt.'"'."\n";
                        $msgid = jLocale::get($msgctxt, array(), 'en_US');
                        $msgid = str_replace( '"', '\"', $msgid );
                        $str.= 'msgid "'.$msgid.'"'."\n";
                        $str.= 'msgstr ""'."\n";
                    }
                }
            }

        }
        $output = $this->param('output');
        $dir = dirname( $output );
        if ( is_dir( $output ) ) {
            $dir = $output;
            if ( substr($output, -1) == '/' )
                $output = $dir.$module.'.pot';
            else
                $output = $dir.'/'.$module.'.pot';
        }
        if ( !file_exists( $dir ) )
            jFile::createDir( $dir );
        jFile::write( $output, $str);
        $rep->addContent("================\n");
        return $rep;
    }

    /**
     * Generate PO file for a module and a local
     */
    function po() {
        $rep = $this->getResponse(); // cmdline response by default

        //$module = new mySelectorModule( $this->param('module') );
        $module = $this->param('module');
        $locale = $this->param('locale');

        if (!isset(jApp::config()->_modulesPathList[$module])) {
            if ($module == 'jelix')
                throw new Exception('jelix module is not enabled !!');
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $module);
        }

        $path = jApp::config()->_modulesPathList[$module].'locales/en_US/';

        $files = Array();
        if ( $dh = opendir( $path ) ) {
            while( ($file = readdir($dh)) !== false ) {
                if (substr($file, -17) == '.UTF-8.properties' && $file != 'format.UTF-8.properties')
                    $files[] = $file;
            }
            closedir($dh);
        }

        $rep->addContent("================\n");
        $rep->addContent( $module ."\n" );
        $rep->addContent( jApp::config()->_modulesPathList[$module] ."\n" );
        $rep->addContent( $path ."\n" );

        $dt = new DateTime();
        $xml = simplexml_load_file(jApp::appPath('project.xml'));

        $str = "#\n";
        $str.= 'msgid ""'."\n";
        $str.= 'msgstr ""'."\n";
        $str.= '"Project-Id-Version: '.(string)$xml->info->label.' '.$module.' '.(string)$xml->info->version.'\n"'."\n";
        $str.= '"Report-Msgid-Bugs-To:\n"'."\n";
        $str.= '"POT-Creation-Date: '.$dt->format('Y-m-d H:iO').'\n"'."\n";
        $str.= '"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\n"'."\n";
        $str.= '"Last-Translator: FULL NAME <EMAIL@ADDRESS>\n"'."\n";
        $str.= '"Language: '.$locale.'\n"'."\n";
        $str.= '"MIME-Version: 1.0\n"'."\n";
        $str.= '"Content-Type: text/plain; charset=UTF-8\n"'."\n";
        $str.= '"Content-Transfer-Encoding: 8bit\n"'."\n";

        foreach( $files as $f ) {
            $rep->addContent( $f ."\n" );

            $thePath = '';

            // check if the locale has been overloaded
            $overloadedPath = jApp::varPath('overloads/'.$module.'/locales/'.$locale.'/'.$f);
            if (is_readable ($overloadedPath)){
                $rep->addContent( $overloadedPath ."\n" );
                $thePath = $overloadedPath;
            }

            // check if the locale is available in the locales directory
            $localesPath = jApp::varPath('locales/'.$locale.'/'.$module.'/locales/'.$f);
            if ($thePath == '' && is_readable ($localesPath)){
                $rep->addContent( $localesPath ."\n" );
                $thePath = $localesPath;
            }

            // else check for the original locale file in the module
            $modulePath = jApp::config()->_modulesPathList[$module].'locales/'.$locale.'/'.$f;
            if ($thePath == '' && is_readable ($modulePath)){
                $rep->addContent( $modulePath ."\n" );
                $thePath = $modulePath;
            }

            $keys = Array();
            $lines = file( $thePath );
            foreach ($lines as $lineNumber => $lineContent){
                if(!empty($lineContent) and $lineContent != '\n'){
                    $exp = explode('=', trim($lineContent), 2);
                    if( count($exp) == 2 && !empty($exp[0]) )
                        $keys[] = trim($exp[0]);
                }
            }

            $lines = file( $path.$f );
            foreach ($lines as $lineNumber => $lineContent){
                if(!empty($lineContent) and $lineContent != '\n'){
                    $exp = explode('=', trim($lineContent), 2);
                    if( count($exp) == 2 && !empty($exp[0]) ) {
                        $str.= "\n";
                        $msgctxt = $module.'~'.str_replace('.UTF-8.properties','',$f).'.'.trim($exp[0]);
                        $str.= "#: ".$msgctxt."\n";
                        $str.= 'msgctxt "'.$msgctxt.'"'."\n";

                        $msgid = jLocale::get($msgctxt, array(), 'en_US');
                        $msgid = str_replace( '"', '\"', $msgid );
                        $str.= 'msgid "'.$msgid.'"'."\n";

                        $msgstr = '';
                        if ( in_array( trim($exp[0]), $keys ) )
                            $msgstr = jLocale::get($msgctxt, array(), $locale);
                        $msgstr = str_replace( '"', '\"', $msgstr );
                        if ( $msgstr != $msgid )
                            $str.= 'msgstr "'.$msgstr.'"'."\n";
                        else
                            $str.= 'msgstr ""'."\n";
                    }
                }
            }

        }
        $output = $this->param('output');
        $dir = dirname( $output );
        if ( is_dir( $output ) ) {
            $dir = $output;
            if ( substr($output, -1) == '/' )
                $output = $dir.$module.'.po';
            else
                $output = $dir.'/'.$module.'.po';
        }
        if ( !file_exists( $dir ) )
            jFile::createDir( $dir );
        jFile::write( $output, $str);
        $rep->addContent("================\n");
        return $rep;
    }

    /**
     * Generate Jelix local file for a module based on a PO file
     */
    function localize() {
        $rep = $this->getResponse(); // cmdline response by default

        $module = $this->param('module');

        if (!isset(jApp::config()->_modulesPathList[$module])) {
            if ($module == 'jelix')
                throw new Exception('jelix module is not enabled !!');
            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $module);
        }

        $path = jApp::config()->_modulesPathList[$module].'locales/en_US/';

        $files = Array();
        if ( $dh = opendir( $path ) ) {
            while( ($file = readdir($dh)) !== false ) {
                if (substr($file, -17) == '.UTF-8.properties' && $file != 'format.UTF-8.properties')
                    $files[] = $file;
            }
            closedir($dh);
        }

        $input = $this->param('input');
        if ( !is_readable( $input ) )
            throw new Exception($input.' is not readable !!');

        $output = $this->param('output');
        if ( !is_dir( $output ) )
            throw new Exception($output.' is not a directory !!');

        $rep->addContent("================\n");

        // Inspired by PoParser
        $hash            = array();
        $entry           = array();
        $justNewEntry    = false; // A new entry has been just inserted.
        $firstLine       = false;
        $lastPreviousKey = null; // Used to remember last key in a multiline previous entry.
        $state           = null;
        $lineNumber      = 0;

        $lines = file( $input );
        foreach ($lines as $num => $line){
            $split = preg_split('/\s+/ ', $line, 2);
            $key   = $split[0];

            // If a blank line is found, or a new msgid when already got one
            if ($line === '' || ($key=='msgid' && isset($entry['msgid'])) || ($key=='msgctxt' && isset($entry['msgid']))) {
                // Two consecutive blank lines
                if ($justNewEntry) {
                    $lineNumber++;
                    continue;
                }
                if ($firstLine) {
                    $firstLine = false;
                    /*
                    if (self::isHeader($entry)) {
                        array_shift($entry['msgstr']);
                        $headers = $entry['msgstr'];
                    } else {
                        $hash[] = $entry;
                    }
                    **/
                } else {
                    // A new entry is found!
                    $hash[] = $entry;
                }
                $entry           = array();
                $state           = null;
                $justNewEntry    = true;
                $lastPreviousKey = null;
                if ($line==='') {
                    $lineNumber++;
                    continue;
                }
            }

            $justNewEntry = false;
            $data         = isset($split[1]) ? $split[1] : null;

            switch ($key) {
                // Flagged translation
                case '#,':
                    $entry['flags'] = preg_split('/,\s*/', $data);
                    break;
                // # Translator comments
                case '#':
                    $entry['tcomment'] = !isset($entry['tcomment']) ? array() : $entry['tcomment'];
                    $entry['tcomment'][] = $data;
                    break;
                // #. Comments extracted from source code
                case '#.':
                    $entry['ccomment'] = !isset($entry['ccomment']) ? array() : $entry['ccomment'];
                    $entry['ccomment'][] = $data;
                    break;
                // Reference
                case '#:':
                    $entry['reference'][] = $data;
                    break;



                case '#|':      // #| Previous untranslated string
                case '#~':      // #~ Old entry
                case '#~|':     // #~| Previous-Old untranslated string. Reported by @Cellard
                    switch ($key) {
                        case '#|':  $key = 'previous';
                                    break;
                        case '#~':  $key = 'obsolete';
                                    break;
                        case '#~|': $key = 'previous-obsolete';
                                    break;
                    }
                    $tmpParts = explode(' ', $data);
                    $tmpKey   = $tmpParts[0];
                    if (!in_array($tmpKey, array('msgid','msgid_plural','msgstr','msgctxt'))) {
                        $tmpKey = $lastPreviousKey; // If there is a multiline previous string we must remember what key was first line.
                        $str = $data;
                    } else {
                        $str = implode(' ', array_slice($tmpParts, 1));
                    }
                    $entry[$key] = isset($entry[$key])? $entry[$key]:array('msgid'=>array(),'msgstr'=>array());
                    if (strpos($key, 'obsolete')!==false) {
                        $entry['obsolete'] = true;
                        switch ($tmpKey) {
                            case 'msgid':
                                $entry['msgid'][] = $str;
                                $lastPreviousKey = $tmpKey;
                                break;
                            case 'msgstr':
                                if ($str == "\"\"") {
                                    $entry['msgstr'][] = trim($str, '"');
                                } else {
                                    $entry['msgstr'][] = $str;
                                }
                                $lastPreviousKey = $tmpKey;
                                break;
                            default:
                                break;
                        }
                    }
                    if ($key!=='obsolete') {
                        switch ($tmpKey) {
                            case 'msgid':
                            case 'msgid_plural':
                            case 'msgstr':
                                $entry[$key][$tmpKey][] = $str;
                                $lastPreviousKey = $tmpKey;
                                break;
                            default:
                                $entry[$key][$tmpKey] = $str;
                                break;
                        }
                    }
                    break;


                // context
                // Allows disambiguations of different messages that have same msgid.
                // Example:
                //
                // #: tools/observinglist.cpp:700
                // msgctxt "First letter in 'Scope'"
                // msgid "S"
                // msgstr ""
                //
                // #: skycomponents/horizoncomponent.cpp:429
                // msgctxt "South"
                // msgid "S"
                // msgstr ""
                case 'msgctxt':
                    // untranslated-string
                case 'msgid':
                    // untranslated-string-plural
                case 'msgid_plural':
                    $state = $key;
                    $entry[$state][] = $data;
                    break;
                // translated-string
                case 'msgstr':
                    $state = 'msgstr';
                    $entry[$state][] = $data;
                    break;

                default:
                    if (strpos($key, 'msgstr[') !== false) {
                        // translated-string-case-n
                        $state = $key;
                        $entry[$state][] = $data;
                    } else {
                        // "multiline" lines
                        switch ($state) {
                            case 'msgctxt':
                            case 'msgid':
                            case 'msgid_plural':
                            case (strpos($state, 'msgstr[') !== false):
                                if (is_string($entry[$state])) {
                                    // Convert it to array
                                    $entry[$state] = array($entry[$state]);
                                }
                                $entry[$state][] = $line;
                                break;
                            case 'msgstr':
                                // Special fix where msgid is ""
                                if ($entry['msgid'] == "\"\"") {
                                    $entry['msgstr'][] = trim($line, '"');
                                } else {
                                    $entry['msgstr'][] = $line;
                                }
                                break;
                            default:
                                throw new Exception(
                                    'PoParser: Parse error! Unknown key "' . $key . '" on line ' . ($lineNumber+1)
                                );
                        }
                    }
                    break;
            }

            $lineNumber++;
        }
        if (isset($entry['msgid'])) {
            // last entry
            $hash[] = $entry;
        }

        // - Cleanup data,
        // - merge multiline entries
        // - Reindex hash for ksort
        $temp = $hash;
        $entries = array();
        $contexts = array();
        foreach ($temp as $entry) {
            foreach ($entry as &$v) {
                $or = $v;
                $v = $this->clean($v);
                if ($v === false) {
                    // parse error
                    throw new Exception(
                        'PoParser: Parse error! poparser::clean returned false on "' . htmlspecialchars($or) . '"'
                    );
                }
            }
            // check if msgid and a key starting with msgstr exists
            if (isset($entry['msgid']) && count(preg_grep('/^msgstr/', array_keys($entry)))) {
                $id = trim( implode(' ', (array)$entry['msgid'] ) );
                $entries[$id] = $entry;
            }
            // check if msgctxt and a key starting with msgstr exists
            if (isset($entry['msgctxt']) && count(preg_grep('/^msgstr/', array_keys($entry)))) {
                $id = trim( implode(' ', (array)$entry['msgctxt'] ) );
                $contexts[$id] = $entry;
            }
        }

        foreach( $files as $f ) {
            $str = '';
            $rep->addContent( $f ."\n" );

            $lines = file( $path.$f );
            foreach ($lines as $lineNumber => $lineContent){
                if(!empty($lineContent) and $lineContent != '\n'){
                    $exp = explode('=', trim($lineContent), 2);
                    if( count($exp) == 2 && !empty($exp[0]) ) {
                        $str.= trim($exp[0]).'=';
                        $msgctxt = $module.'~'.str_replace('.UTF-8.properties','',$f).'.'.trim($exp[0]);
                        $msgid = jLocale::get($msgctxt,array(),'en_US');
                        $msgstr = '';
                        if ( array_key_exists( $msgctxt, $contexts ) && array_key_exists( 'msgstr', $contexts[$msgctxt] ))
                            $msgstr = trim(implode(' ', (array)$contexts[$msgctxt]['msgstr']) );
                        else if ( array_key_exists( $msgid, $entries ) && array_key_exists( 'msgstr', $entries[$msgid] ))
                            $msgstr = trim(implode(' ', (array)$entries[$msgid]['msgstr']) );
                        if ( $msgstr != '' )
                            $str.= $msgstr;
                        else {
                            $str.= $msgid;
                            //$rep->addContent("'".$msgid."'\n");
                        }
                        $str.="\n";
                    }
                }
            }

            if ( substr($output, -1) == '/' )
                $outputFile = $output.$f;
            else
                $outputFile = $output.'/'.$f;
            jFile::write( $outputFile, $str);
        }

        $rep->addContent("================\n");
        return $rep;
    }


    /**
     * Undos `cleanExport` actions on a string.
     *
     * @param string|array $x
     * @return string|array.
     */
    protected function clean($x)
    {
        if (is_array($x)) {
            foreach ($x as $k => $v) {
                $x[$k] = $this->clean($v);
            }
        } else {
            // Remove double quotes from start and end of string
            if ($x == '') {
                return '';
            }
            if ($x[0] == '"') {
                $x = substr($x, 1, -1);
                $x = trim( $x, '"' );
            }
            // Escapes C-style escape sequences (\a,\b,\f,\n,\r,\t,\v) and converts them to their actual meaning
            $x = stripcslashes($x);
        }
        return $x;
    }
}
