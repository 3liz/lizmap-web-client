<?php
/**
 * @copyright 2011-2018 3liz
 *
 * @see      http://3liz.com
 *
 * @license   MPL-2.0
 */
use Gettext\Translations;
use Jelix\PropertiesFile\Parser;
use Jelix\PropertiesFile\Properties;
use Jelix\PropertiesFile\Writer;

class localeCtrl extends jControllerCmdLine
{
    /**
     * Options to the command line
     *  'method_name' => array('-option_name' => true/false)
     * true means that a value should be provided for the option on the command line.
     */
    protected $allowed_options = array(
    );

    /**
     * Parameters for the command line
     * 'method_name' => array('parameter_name' => true/false)
     * false means that the parameter is optional. All parameters which follow an optional parameter
     * is optional.
     */
    protected $allowed_parameters = array(
        'pot' => array(
            'module' => true, // module name
            'output' => true,  // output pot file full path
        ),
        'po' => array(
            'module' => true, // module name
            'locale' => true, // locale
            'output' => true,  // output po file full path
        ),
        'importpo' => array(
            'input' => true,  // po file full path
            'module' => true, // module name
            'locale' => true, // locale
        ),
    );

    /**
     * Help.
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

        'importpo' => 'Generate a Jelix locale file for a module and a locale.

        Use :
        php lizmap/scripts/script.php lizmap~locale:importpo input_path module locale 

        Example :
        php lizmap/scripts/script.php lizmap~locale:importpo /tmp/fr_FR/view.po view fr_FR 
        ',
    );

    /**
     * construct the list of all properties files of the module.
     *
     * @param string $module
     * @param string $moduleLocalePath
     *
     * @return string[]
     */
    protected function getModuleLocaleFiles($module, $moduleLocalePath)
    {
        $files = array();
        if ($dh = opendir($moduleLocalePath)) {
            while (($file = readdir($dh)) !== false) {
                if (substr($file, -17) == '.UTF-8.properties' &&
                    !($module == 'jelix' && $file == 'format.UTF-8.properties')) {
                    $files[] = $file;
                }
            }
            closedir($dh);
        }

        sort($files);
        return $files;
    }

    protected function getModulePath($lang = 'en_US')
    {
        $module = $this->param('module');

        if (!isset(jApp::config()->_modulesPathList[$module])) {
            if ($module == 'jelix') {
                throw new Exception('jelix module is not enabled !!');
            }

            throw new jExceptionSelector('jelix~errors.selector.module.unknown', $module);
        }

        $modulePath = jApp::config()->_modulesPathList[$module];
        $originalModulePath = $modulePath.'locales/'.$lang.'/';
        if (strpos($modulePath, LIB_PATH) === 0 || strpos($modulePath, '/vendor/') !== false ) {
            // this is a module in lib/ or in a vendor/ directory, so it is not
            // developed into Lizmap: we don't want to store languages files into
            // these directories
            if (file_exists(jApp::appPath('app/locales'))) {
                $localesPath = jApp::appPath('app/locales/' . $lang . '/' . $module . '/locales/');
            }
            else if (file_exists(jApp::varPath('locales'))) {
                $localesPath = jApp::varPath('locales/'.$lang.'/'.$module.'/locales/');
            } else {
                $localesPath = jApp::varPath('overloads/'.$module.'/locales/'.$lang.'/');
            }
        } else {
            $localesPath = $originalModulePath;
        }

        return array($module, $modulePath, $localesPath, $originalModulePath, $modulePath.'locales/en_US/');
    }

    protected function getOutputFile($module, $extension)
    {
        $output = $this->param('output');
        if (is_dir($output)) {
            $dir = $output;
            if (substr($dir, -1) == '/') {
                $output = $dir.$module.'.'.$extension;
            } else {
                $output = $dir.'/'.$module.'.'.$extension;
            }
        } else {
            $dir = dirname($output);
        }
        if (!file_exists($dir)) {
            jFile::createDir($dir);
        }

        return $output;
    }

    /**
     * Generate POT file for a module.
     */
    public function pot()
    {
        $rep = $this->getResponse(); // cmdline response by default
        list($module, $modulePath, $localesPath, $originalModulePath, $enLocalesPath) = $this->getModulePath();

        $files = $this->getModuleLocaleFiles($module, $enLocalesPath);

        $rep->addContent("================\n");
        $rep->addContent($module."\n");
        $rep->addContent($modulePath."\n");
        $rep->addContent($enLocalesPath."\n");

        $dt = new DateTime('NOW');
        $xml = simplexml_load_file(jApp::appPath('project.xml'));
        $projectId = (string) $xml->info->label.' '.$module.' '.(string) $xml->info->version;

        $translations = new Translations();
        $translations->setHeader('Project-Id-Version', $projectId);
        $translations->setHeader('Report-Msgid-Bugs-To', '');
        $translations->setHeader('POT-Creation-Date', $dt->format('Y-m-d H:i+O'));
        $translations->setHeader('PO-Revision-Date', $dt->format('Y-m-d H:i+O'));
        $translations->setHeader('Last-Translator', 'FULL NAME <EMAIL@ADDRESS>');
        $translations->setHeader('MIME-Version', '1.0');
        $translations->setHeader('Content-Type', 'text/plain; charset=UTF-8');
        $translations->setHeader('Content-Transfer-Encoding', '8bit');

        $propertiesReader = new Parser();
        foreach ($files as $f) {
            $rep->addContent($f."\n");
            $fileId = str_replace('.UTF-8.properties', '', $f);
            $properties = new \Jelix\PropertiesFile\Properties();
            $propertiesReader->parseFromFile($enLocalesPath.$f, $properties);
            $msgctxtPrefix = $module.'~'.$fileId.'.';
            $propertiesArray = array();
            foreach ($properties->getIterator() as $key => $value) {
                $propertiesArray[$key] = $value;
            }
            ksort($propertiesArray);
            foreach ($propertiesArray as $key => $value) {
                $msgctxt = $msgctxtPrefix.$key;
                $translation = $translations->insert($msgctxt, $value);
                $translation->addReference($msgctxt);
                $translation->setTranslation('');
            }
        }

        $targetFile = $this->getOutputFile($module, 'pot');
        $rep->addContent("save to: ${targetFile}\n");
        \Gettext\Generators\Po::toFile($translations, $targetFile);

        $rep->addContent("================\n");

        return $rep;
    }

    /**
     * Generate PO file for a module and a local.
     */
    public function po()
    {
        $rep = $this->getResponse(); // cmdline response by default

        $locale = $this->param('locale');
        list($module, $modulePath, $localesPath, $originalModulePath, $enLocalesPath) = $this->getModulePath($locale);

        $files = $this->getModuleLocaleFiles($module, $enLocalesPath);

        $rep->addContent("================\n");
        $rep->addContent($module."\n");
        $rep->addContent($modulePath."\n");
        $rep->addContent($enLocalesPath."\n");

        $dt = new DateTime('NOW');
        $xml = simplexml_load_file(jApp::appPath('project.xml'));
        $projectId = (string) $xml->info->label.' '.$module.' '.(string) $xml->info->version;

        $translations = new Translations();
        $translations->setHeader('Project-Id-Version', $projectId);
        $translations->setHeader('Report-Msgid-Bugs-To', '');
        $translations->setHeader('POT-Creation-Date', $dt->format('Y-m-d H:i+O'));
        $translations->setHeader('PO-Revision-Date', $dt->format('Y-m-d H:i+O'));
        $translations->setHeader('Last-Translator', 'FULL NAME <EMAIL@ADDRESS>');
        $translations->setHeader('MIME-Version', '1.0');
        $translations->setHeader('Content-Type', 'text/plain; charset=UTF-8');
        $translations->setHeader('Content-Transfer-Encoding', '8bit');

        $propertiesReader = new Parser();

        foreach ($files as $f) {
            $rep->addContent($f."\n");

            // read locale file
            $localeProperties = new \Jelix\PropertiesFile\Properties();
            if (file_exists($localesPath.$f)) {
                $propertiesReader->parseFromFile($localesPath.$f, $localeProperties);
            }

            // if the locale file is not the original one in the module,
            // let's read the original one
            $originalProperties = new \Jelix\PropertiesFile\Properties();
            if ($originalModulePath !== $localesPath && file_exists($originalModulePath.$f)) {
                $propertiesReader->parseFromFile($originalModulePath.$f, $originalProperties);
            }

            // read the en_US properties file.
            $USProperties = new \Jelix\PropertiesFile\Properties();
            $propertiesReader->parseFromFile($enLocalesPath.$f, $USProperties);

            $fileId = str_replace('.UTF-8.properties', '', $f);
            $msgctxtPrefix = $module.'~'.$fileId.'.';

            foreach ($USProperties->getIterator() as $key => $value) {
                $msgctxt = $msgctxtPrefix.$key;
                $translation = $translations->insert($msgctxt, $value);
                $translation->addReference($msgctxt);
                $localeValue = $localeProperties[$key];
                if ($localeValue === null) {
                    $localeValue = $originalProperties[$key];
                }
                if ($localeValue !== null && $localeValue != $value) {
                    $translation->setTranslation($value);
                } else {
                    $translation->setTranslation('');
                }
            }
        }

        $targetFile = $this->getOutputFile($module, 'po');
        $rep->addContent("save to: ${targetFile}\n");
        \Gettext\Generators\Po::toFile($translations, $targetFile);

        $rep->addContent("================\n");

        return $rep;
    }

    /**
     * Generate Jelix locale file for a module, from a PO file.
     */
    public function importpo()
    {
        $rep = $this->getResponse(); // cmdline response by default

        $locale = $this->param('locale');
        list($module, $modulePath, $localesPath, $originalModulePath, $enLocalesPath) = $this->getModulePath($locale);
        if (!is_dir($localesPath)) {
            jFile::createDir($localesPath);
        }

        $files = $this->getModuleLocaleFiles($module, $enLocalesPath);

        $rep->addContent("================\n");

        // read the PO file
        $input = $this->param('input');
        if (!is_readable($input)) {
            throw new Exception($input.' is not readable !!');
        }

        $translations = new Gettext\Translations();
        \Gettext\Extractors\Po::fromFile($input, $translations);

        $propertiesReader = new Parser();
        $propertiesWriter = new Writer();

        foreach ($files as $f) {
            $rep->addContent($f."\n");

            $localeProperties = new \Jelix\PropertiesFile\Properties();
            $USProperties = new \Jelix\PropertiesFile\Properties();
            $propertiesReader->parseFromFile($enLocalesPath.$f, $USProperties);

            $fileId = str_replace('.UTF-8.properties', '', $f);
            $msgctxtPrefix = $module.'~'.$fileId.'.';

            $sameAsUs = true;
            foreach ($USProperties->getIterator() as $key => $usString) {
                $msgctxt = $msgctxtPrefix.$key;
                $translation = $translations->find($msgctxt, $usString);
                if ($translation === false) {
                    $localeString = '';
                } else {
                    $localeString = $translation->getTranslation();
                }
                if (trim($localeString) == '') {
                    $localeString = $usString;
                }
                if ($localeString != $usString) {
                    $sameAsUs = false;
                }
                $localeProperties[$key] = $localeString;
            }
            if (!$sameAsUs) {
                $propertiesWriter->writeToFile(
                    $localeProperties,
                    $localesPath.$f,
                    array(
                        'lineLength' => 500,
                        'spaceAroundEqual' => false,
                        'removeTrailingSpace' => true,
                        "cutOnlyAtSpace"=>true,
                        'headerComment' => "Please don't modify this file.\nTo contribute on translations, go to https://www.transifex.com/3liz-1/lizmap-locales/.",
                    )
                );
            } elseif (file_exists($localesPath.$f)) {
                unlink($localesPath.$f);
            }
        }

        $rep->addContent("================\n");

        return $rep;
    }
}
