<?php

/**
* Installation wizard
*
* @package     InstallWizard
* @author      Laurent Jouanneau
* @copyright   2010-2011 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU General Public Licence see LICENCE file or http://www.gnu.org/licenses/gpl.html
*/

require(__DIR__.'/jtpl/jtpl_standalone_prepend.php');
require(__DIR__.'/installWizardPage.php');

/**
 * main class of the wizard
 *
 */
class installWizard {

    protected $config;

    protected $configPath;

    protected $lang = 'en';

    protected $pages = array();

    protected $customPath = '';

    protected $tempPath = '';

    protected $stepName = "";

    protected $locales = array();

    /**
     * @param string $config an ini file for the installation
     * should contain this parameter:
     * - 
     */
    function __construct($configFile) {
        $this->configPath = $configFile;
        session_start();
        date_default_timezone_set("Europe/Paris");
    }

    /**
     * read the configuration file
     */
    protected function readConfiguration() {
        $conf = parse_ini_file($this->configPath,true);
        if (!$conf)
            throw new Exception('Impossible to read the configuration file');
        $this->config = $conf;
        
        if (isset($this->config['supportedLang'])) {
           $this->config['supportedLang'] = preg_split('/ *, */',$this->config['supportedLang']);
        }
        else
            $this->config['supportedLang'] = array('en');
    }

    /**
     * read and prepare all paths of pages, of temp dir etc.
     */
    protected function initPath() {

        $list = preg_split('/ *, */',$this->config['pagesPath']);
        $basepath = dirname($this->configPath).'/';

        foreach($list as $k=>$path){
            if(trim($path) == '') continue;
            $p = realpath($basepath.$path);
            if ($p== '' || !file_exists($p))
                throw new Exception ('The path, '.$path.' given in the configuration doesn\'t exist !');

            if (substr($p,-1) !='/')
                $p.='/';

            if ($handle = opendir($p)) {
                while (false !== ($f = readdir($handle))) {
                    if ($f[0] != '.' && is_dir($p.$f) && isset($this->config[$f.'.step'])) {
                        $this->pages[$f] = $p.$f.'/';
                    }
                }
                closedir($handle);
            }
        }
        if (isset($this->config['customPath']) && $this->config['customPath'] != '') {
            $this->customPath = realpath($basepath.$this->config['customPath']);
            if ($this->customPath)
                $this->customPath .= '/';
        }

        if (isset($this->config['tempPath']) && $this->config['tempPath'] != '') {
            $this->tempPath = realpath($basepath.$this->config['tempPath']);
            if (!$this->tempPath)
                throw new Exception("no temp directory");
            if (!is_writable($this->tempPath))
                throw new Exception("The temp directory ".$this->config['tempPath']." is not writable. Change the rights on this directory to allow the web server to write in it.");

            $this->tempPath .= '/';
        }
        else
            throw new Exception("no temp directory");
    }

    /**
     * filled a __previous variable into data of each step.
     * @return string the name of the last step
     */
    protected function initPrevious($step='', $previousStep='') {
        if ($step == '') {
            if (isset($this->config['start']))
                $step = $this->config['start'];
            else
                return '';
        }
        if (!isset($this->pages[$step]) || !isset($this->config[$step.'.step'])) {
            return '';
        }
        if (isset($this->config[$step.'.step']['__previous'])) {
            return '';
        }
        
        if (isset($this->config[$step.'.step']['noprevious']) && $this->config[$step.'.step']['noprevious'])
            $this->config[$step.'.step']['__previous'] = '';
        else
            $this->config[$step.'.step']['__previous'] = $previousStep;
        
        if (!isset($this->config[$step.'.step']['next'])) {
            return $step;
        }
        $last = '';
        if (is_array($this->config[$step.'.step']['next'])) {
            foreach($this->config[$step.'.step']['next'] as $next) {
                $rv = $this->initPrevious($next, $step);
                if ($rv != '')
                    $last = $rv;
            }
        }
        else 
            $last = $this->initPrevious($this->config[$step.'.step']['next'], $step);
        return $last;
    }

    /**
     * setup the language by analysing the lang of the browser
     */
    protected function guessLanguage($lang = '') {
        if($lang == '' && isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])){
            $languages = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
            foreach($languages as $bl){
                // pour les user-agents qui livrent un code internationnal
                if(preg_match("/^([a-zA-Z]{2})(?:[-_]([a-zA-Z]{2}))?(;q=[0-9]\\.[0-9])?$/",$bl,$match)){
                    $lang = strtolower($match[1]);
                    break;
                }
            }
        }elseif(preg_match("/^([a-zA-Z]{2})(?:[-_]([a-zA-Z]{2}))?$/",$lang,$match)){
            $lang = strtolower($match[1]);
        }
        if($lang == '' || !in_array($lang, $this->config['supportedLang'])){
            $lang = 'en';
        }
        return $lang;
    }

    /**
     * retrieve the name of the current step
     * @return string the name
     */
    protected function getStepName() {
        if (isset($_REQUEST['step'])) {
            $stepname = $_REQUEST['step'];
        }
        elseif (isset($this->config['start'])) {
            $stepname = $this->config['start'];
        }
        else {
            throw new Exception('No step start in the configuration');
        }

        if (!isset($this->pages[$stepname])) {
            throw new Exception('Unknow step');
        }

        return $stepname;
    }

    /**
     * return the name of the next step after the current page
     * @param installWizardPage $page the current page
     * @param integer $result  the return code of the process method of the current page
     * @return string the name
     */
    protected function getNextStep($page, $result=0) {
        if (is_array($page->config['next'])) {
            if (is_numeric($result))
                $nextStep = $page->config['next'][$result];
            else
                $nextStep = $page->config['next'][0];
        }
        else
            $nextStep = $page->config['next'];
        return $nextStep;
    }


    function run ($isAlreadyDone = false) {

        try {

            $this->readConfiguration();

            $this->initPath();

            $laststep = $this->initPrevious();

            $this->lang = $this->guessLanguage();

            if ($isAlreadyDone && !isset($_SESSION['__install__wizard'])) {
                if (isset($this->config['onalreadydone']))
                    $laststep = $this->config['onalreadydone'];
                if ($laststep != '' && isset($this->pages[$laststep])) {
                    $this->stepName = $laststep;
                }
                else {
                    throw new Exception("Application is installed. The script cannot be runned.");
                }
            }
            else {
                if (!isset($_SESSION['__install__wizard']) && !$isAlreadyDone)
                    $_SESSION['__install__wizard'] = true;
                $this->stepName = $this->getStepName();
            }

            jTplConfig::$lang = $this->lang;
            jTplConfig::$localesGetter = array($this, 'getLocale');
            jTplConfig::$cachePath = $this->tempPath;

            $page = $this->loadPage();

            if (isset($_POST['doprocess']) && $_POST['doprocess'] == "1") {
                //if ($isAlreadyDone)
                //    $result = true;
                //else
                    $result = $page->process();
                if ($result !== false) {
                    header("location: ?step=".$this->getNextStep($page, $result));
                    exit(0);
                }
            }

            $tpl = new jTpl();
            $tpl->assign($page->config);
            $tpl->assign($page->getErrors());
            $tpl->assign('appname', isset($this->config['appname'])?$this->config['appname']:'');
            $continue = $page->show($tpl);
            $content = $tpl->fetch($this->stepName.'.tpl', 'html');

            $this->showMainTemplate($page, $content, $continue);

            if ($laststep == $this->stepName) {
                session_destroy();
            }
        } catch (Exception $e) {
            $error = $e->getMessage();
            header("HTTP/1.1 500 Application error");
            if ($this->customPath && file_exists($this->customPath.'error.php'))
                require($this->customPath.'error.php');
            else
                require(__DIR__.'/error.php');
            exit(1);
        }
    }
    
    
    protected function loadPage() {
        $stepname = $this->stepName;
        // load the class which run the step
        require($this->pages[$stepname].$stepname.'.page.php');
        $class = $stepname.'WizPage';
        if (!class_exists($stepname.'WizPage'))
            throw new Exception ('No class for the given step');

        // load the locales
        $this->loadLocales($stepname, $stepname);

        // load the template
        $tplfile = $this->getRealPath($stepname, $stepname.'.tpl');
        if ($tplfile === false)
            throw new Exception ("No template file for the given step");

        jTplConfig::$templatePath = dirname($tplfile).'/';

        $page = new $class($this->config[$stepname.'.step'], $this->locales);
        return $page;
    }
    
    protected function showMainTemplate($page, $content, $continue) {
        $filename = "wiz_layout.tpl";
        $path = $this->getRealPath('', $filename);
        jTplConfig::$templatePath = dirname($path).'/';

        $this->loadLocales('', 'wiz_layout');

        $conf = $this->config[$this->stepName.'.step'];
        $tpl = new jTpl();
        $tpl->assign('title', $page->getLocale($page->title));
        if (isset($conf['messageHeader']))
            $tpl->assign('messageHeader', $conf['messageHeader']);
        else
            $tpl->assign('messageHeader', '');
        if (isset($conf['messageFooter']))
            $tpl->assign('messageFooter', $conf['messageFooter']);
        else
            $tpl->assign('messageFooter', '');

        $tpl->assign ('MAIN', $content);
        $tpl->assign (array_merge(array('enctype'=>''),$conf));
        $tpl->assign ('stepname', $this->stepName);
        $tpl->assign ('lang', $this->lang);
        $tpl->assign('next', ($continue && isset($conf['next'])));
        $tpl->assign('previous', isset($conf['__previous'])?$conf['__previous']:'');
        $tpl->assign('appname', isset($this->config['appname'])?$this->config['appname']:'Application');
    
        $tpl->display($filename, 'html');
    }

    protected function getRealPath($stepname, $fileName) {
        if ($this->customPath) {
            if (file_exists($this->customPath.$fileName))
                return $this->customPath.$fileName;
        }

        if ($stepname)
            $path = $this->pages[$stepname];
        else
            $path = __DIR__."/";

        if (file_exists($path.$fileName))
            return $path.$fileName;

        return false;
    }

    protected function loadLocales($stepname, $prefix) {
        $localeFile = $this->getRealPath($stepname, $prefix.'.'.$this->lang.'.php');

        if ($localeFile === false && $this->lang != 'en')
            $localeFile = $this->getRealPath($stepname, $prefix.'.en.php');

        if ($localeFile === false)
            throw new Exception ("No lang file for the given step");

        require($localeFile); // load a php array $locales
        $this->locales = $locales;
    }
    
    /**
     * function for the template engine, to retrieve a localized string
     * @param string $name the key of the localized string
     * @return string the localized string or the given key if it doesn't exists
    */
    public function getLocale($name) {
        if (isset($this->locales[$name]))
            return $this->locales[$name];
        else return $name;
    }
    
}