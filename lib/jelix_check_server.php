<?php

/**
* check a jelix installation
*
* @package     jelix
* @subpackage  core
* @author      Laurent Jouanneau
* @copyright   2007-2010 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
* @since       1.0b2
*/

/**
 *
 */

/**
* @package     jelix
* @subpackage  installer
* @author      Laurent Jouanneau
* @copyright   2008-2009 Laurent Jouanneau
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
* interface for classes used as reporter for installation or check etc...
* This classes are responsible to show informations to the user
* @package     jelix
* @subpackage  installer
* @since 1.2
*/
interface jIInstallReporter {

    /**
     * start the process
     */
    function start();

    /**
     * displays a message
     * @param string $message the message to display
     * @param string $type the type of the message : 'error', 'notice', 'warning', ''
     */
    function message($message, $type='');

    /**
     * called when the installation is finished
     * @param array $results an array which contains, for each type of message,
     * the number of messages
     */
    function end($results);

}



/**
* 
* @package  jelix
* @subpackage core
* @author   Laurent Jouanneau
* @contributor Bastien Jaillot
* @copyright 2007-2009 Laurent Jouanneau, 2008 Bastien Jaillot
* @link     http://www.jelix.org
* @licence  GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
* @since 1.0b2
*/

/**
 * message provider for jInstallCheck and jInstaller
 * @package  jelix
 * @subpackage core
 * @since 1.0b2
 */
class jInstallerMessageProvider {
    protected $currentLang;

    protected $messages = array(
        'fr'=>array(
     'checker.title'=>'Vérification de votre serveur pour Jelix 1.6.17',
        'number.errors'         =>' erreurs.',
        'number.error'          =>' erreur.',
        'number.warnings'       =>' avertissements.',
        'number.warning'        =>' avertissement.',
        'number.notices'        =>' remarques.',
        'number.notice'         =>' remarque.',
    'conclusion.error'      =>'Vous devez corriger l\'erreur pour faire fonctionner correctement une application Jelix 1.6.17.',
    'conclusion.errors'     =>'Vous devez corriger les erreurs pour faire fonctionner correctement une application Jelix 1.6.17.',
    'conclusion.warning'    =>'Une application Jelix 1.6.17 peut à priori fonctionner, mais il est préférable de corriger l\'avertissement pour être sûr.',
    'conclusion.warnings'   =>'Une application Jelix 1.6.17 peut à priori fonctionner, mais il est préférable de corriger les avertissements pour être sûr.',
    'conclusion.notice'     =>'Aucun problème pour installer une application pour Jelix  1.6.17 malgré la remarque.',
    'conclusion.notices'    =>'Aucun problème pour installer une application pour Jelix  1.6.17 malgré les remarques.',
    'conclusion.ok'         =>'Vous pouvez installer une application avec Jelix 1.6.17',
        'cannot.continue'       =>'Les vérifications ne peuvent continuer : %s',
        'extension.not.installed'=>'L\'extension %s n\'est pas disponible',
        'extension.optional.not.installed'=>'L\'extension %s optionnelle n\'est pas disponible',
        'extension.required.not.installed'=>'L\'extension %s obligatoire n\'est pas disponible',
        'extension.installed'=>'L\'extension %s est disponible',
        'extension.optional.installed'=>'L\'extension %s optionnelle est disponible',
        'extension.required.installed'=>'L\'extension %s obligatoire est disponible',
        'extensions.required.ok'=>'Toutes les extensions PHP obligatoires sont disponibles',
        'extension.database.ok'=>'L\'application utilisera une base de données SQL : %s',
        'extension.database.ok2'=>'L\'application pourra utiliser une base de données SQL : %s',
        'extension.database.missing'=>'L\'application a besoin d\'une base de données SQL',
        'extension.database.missing2'=>'L\'application ne pourra pas utiliser de base de données SQL',
        'path.core'             =>'Le fichier init.php  de jelix ou le fichier application.ini.php de votre application n\'est pas chargé',
        'path.temp'             =>'Le repertoire temporaire n\'est pas accessible en écriture ou alors le chemin du répertoire temp n\'est pas configurée comme il faut',
        'path.log'              =>'Le repertoire var/log dans votre application n\'est pas accessible en écriture ou alors le chemin du répertoire de log n\'est pas configurée comme il faut',
        'path.var'              =>'Le chemin du répertoire var n\'est pas configuré correctement : ce répertoire n\'existe pas',
        'path.config'           =>'Le chemin du répertoire config n\'est pas configuré correctement : ce répertoire n\'existe pas',
        'path.www'              =>'Le chemin du répertoire www n\'est pas configuré correctement : ce répertoire n\'existe pas',
        'path.config.writable' =>'Le répertoire var/config n\'a pas les droits en écriture',
        'path.profiles.writable'=>'Le fichier profiles.ini.php n\'a pas les droits en écriture',
        'path.mainconfig.writable'=>'Le fichier mainconfig.ini.php n\'a pas les droits en écriture',        
        'path.installer.writable'=>'Le fichier installer.ini.php n\'a pas les droits en écriture',
        'path.custom.not.exists'=>'Le fichier %s n\'existe pas, ses droits ne peuvent être vérifiés',
        'path.custom.writable'=>'Le fichier %s n\'a pas les droits en écriture',
        'path.custom.ok'=>'Le fichier %s a les droits en écriture',
        'php.bad.version'       =>'Mauvaise version de PHP',
        'php.version.current'   =>'Version PHP courante : %s',
        'php.ok.version'        =>'La version PHP %s installée est correcte',
        'php.version.required'  =>'L\'application nécessite au moins PHP %s',
        'too.critical.error'    =>'Trop d\'erreurs critiques sont apparues. Corrigez les.',
        'config.file'           =>'La variable $config_file n\'existe pas ou le fichier qu\'elle indique n\'existe pas',
        'paths.ok'              =>'Les répertoires temp, log, var, config et www sont ok',
        'ini.magic_quotes_gpc'  =>'php.ini : l\'activation des magic quotes n\'est pas prise en charge par jelix. Vous devez les désactiver',
        'ini.magic_quotes_runtime'=>'php.ini : magic_quotes_runtime doit être à off',
        'ini.session.auto_start'=>'php.ini : session.auto_start doit être à off',
        'ini.safe_mode'         =>'php.ini : le safe_mode est obsolète et n\'est pas recommandé.',
        'ini.register_globals'  =>'php.ini : il faut désactiver register_globals, pour des raisons de sécurité et parce que cette option n\'est pas nécessaire.',
        'ini.asp_tags'          =>'php.ini : il est conseillé de désactiver asp_tags. Cette option n\'est pas nécessaire.',
        'ini.ok'                =>'Les paramètres de php sont ok',

        'module.unknown'        =>'Module inconnu',
        'module.circular.dependency'=>"Dépendance circulaire ! le composant %s ne peut être installé",
        'module.needed'         =>'Pour installer le module %s, ces modules doivent être présent : %s',
        'module.bad.jelix.version'=>'Le module %s necessite une autre version de jelix (%s - %s)',
        'module.bad.dependency.version'=>'Le module %s necessite une autre version du module %s (%s - %s)',
        'module.installer.class.not.found'=>'La classe d\'installation %s pour le module %s n\'existe pas',
        'module.upgrader.class.not.found'=>'La classe de mise à jour %s pour le module %s n\'existe pas',
        'module.upgrader.missing.version'=>'La version cible est manquante pour le script de mise à jour %s du module %s',
        'module.missing.version'=>'La version est manquante dans le fichier module.xml du module %s',

        'installer.ini.missing.version'=>'La version précédente du module %s n\'est pas indiquée dans le fichier installer.ini.php',

        'install.entrypoint.start'  =>'Installation pour le point d\'entrée %s',
        'install.entrypoint.end'    =>'Tous les modules sont installés ou mis à jour pour le point d\'entrée %s',
        'install.entrypoint.bad.end'=>'Installation interrompue pour cause d\'erreurs pour le point d\'entrée %s',
        'install.entrypoint.installers.disabled'=>'Les scripts d\'installation et de mise à jour ne seront pas executés, ils sont désactivés dans la configuration.',

        'install.dependencies.ok'   =>'Toutes les dépendances des modules sont valides',
        'install.bad.dependencies'  =>'Il y a des erreurs dans les dépendances. Installation annulée.',
        'install.invalid.xml.file'  =>'Le fichier identité %s est invalide ou inexistant',

        'install.module.already.installed'  =>'Le module %s déjà installé',
        'install.module.installed'          =>'Le module %s est installé',
        'install.module.error'              =>'Une erreur est survenue durant l\'installation du module %s: %s',
        'install.module.check.dependency'   =>'Vérifie les dépendances du module %s',
        'install.module.upgraded'           =>'Le module %s est mis à jour à la version %s',
        'more.details'                      =>'Plus de details',

        ),

        'en'=>array(
  'checker.title'   =>'Check your configuration server for Jelix 1.6.17',
        'number.errors'     =>' errors.',
        'number.error'      =>' error.',
        'number.warnings'   =>' warnings.',
        'number.warning'    =>' warning.',
        'number.notices'    =>' notices.',
        'number.notice'     =>' notice.',
      'conclusion.error'    =>'You must fix the error in order to run an application correctly with Jelix 1.6.17.',
      'conclusion.errors'   =>'You must fix errors in order to run an application correctly with Jelix 1.6.17.',
      'conclusion.warning'  =>'Your application for Jelix 1.6.17 may run without problems, but it is recommanded to fix the warning.',
      'conclusion.warnings' =>'Your application for Jelix 1.6.17 may run without problems, but it is recommanded to fix warnings.',
      'conclusion.notice'   =>'You can install an application for Jelix 1.6.17, although there is a notice.',
      'conclusion.notices'  =>'You can install an application for Jelix 1.6.17, although there are notices.',
      'conclusion.ok'       =>'You can install an application for Jelix 1.6.17.',
        'cannot.continue'       =>'Cannot continue the checking: %s',
        'extension.not.installed'=>'The extension %s is not available',
        'extension.optional.not.installed'=>'the optional extension %s is not available',
        'extension.required.not.installed'=>'the required extension %s is not available',
        'extension.installed'=>'The extension %s is available',
        'extension.optional.installed'=>'the optional extension %s is available',
        'extension.required.installed'=>'the required extension %s is available',
        'extensions.required.ok'=>'All needed PHP extensions are available',
        'extension.database.ok'=>'The application will use a SQL database: %s',
        'extension.database.ok2'=>'The application can use SQL databases: %s',
        'extension.database.missing'=>'The application needs a SQL database',
        'extension.database.missing2'=>'The application couldn\'t use a SQL database',
        'path.core'             =>'jelix init.php file or application.ini.php file is not loaded',
        'path.temp'             =>'temp/yourApp directory is not writable or the application temp path is not correctly set !',
        'path.log'              =>'var/log directory (in the directory of your application) is not writable or the application log path is not correctly set!',
        'path.var'              =>'The application var path is not correctly set: var directory  doesn\'t exist!',
        'path.config'           =>'The application config path is not correctly set: config directory  doesn\'t exist!',
        'path.www'              =>'The application www path is not correctly set: www directory  doesn\'t exist!',
        'path.config.writable' =>'The directory var/config have not write rights',
        'path.profiles.writable'=>'The file profiles.ini.php have not write rights',
        'path.mainconfig.writable'=>'The file mainconfig.ini.php have not write rights',
        'path.installer.writable'=>'The file installer.ini.php have not write rights',
        'path.custom.not.exists'=>'The file %s is not found, rights cannot be validated',
        'path.custom.writable'=>'The file %s have not write rights',
        'path.custom.ok'=>'The file %s have write rights',
        'php.bad.version'       =>'Bad PHP version',
        'php.version.current'   =>'Current PHP version: %s',
        'php.ok.version'        =>'The PHP version %s is ok',
        'php.version.required'  =>'The application requires at least PHP %s',
        'too.critical.error'    =>'Too much critical errors. Fix them.',
        'config.file'           =>'$config_file variable does not exist or doesn\'t contain a correct application config file name',
        'paths.ok'              =>'temp, log, var, config and www directory are ok',
        'ini.magic_quotes_gpc'  =>'php.ini: magic quotes are not supported by Jelix. You must deactivate it into PHP',
        'ini.magic_quotes_runtime'=>'php.ini: magic_quotes_runtime must be off',
        'ini.session.auto_start'=>'php.ini: session.auto_start must be off',
        'ini.safe_mode'         =>'php.ini: safe_mode is deprecated and is not recommended.',
        'ini.register_globals'  =>'php.ini: you must deactivate register_globals, for security reasons, and because this option is not needed.',
        'ini.asp_tags'          =>'php.ini: you should deactivate asp_tags. No need to have this option.',
        'ini.ok'                =>'php settings are ok',

        'module.unknown'        =>'Unknown module %s',
        'module.circular.dependency'=>"Circular dependency ! Cannot install the component %s",
        'module.needed'         =>'To install %s these modules are needed: %s',
        'module.bad.jelix.version'=>'The module %s needs another jelix version (%s - %s)',
        'module.bad.dependency.version'=>'The module %s needs another version of the module %s (%s - %s)',
        'module.installer.class.not.found'=>'The installation class %s for the module %s doesn\'t exist',
        'module.upgrader.class.not.found'=>'The upgrade class %s for the module %s doesn\'t exist',
        'module.upgrader.missing.version'=>'Target version is missing for the upgrade script %s of the module %s',
        'module.missing.version'=>'Version is missing from the module.xml file of the module %s',

        'installer.ini.missing.version'=>'The previous version of the module %s is missing from the installer.ini.php file',

        'install.entrypoint.start'  =>'Installation starts for the entry point %s',
        'install.entrypoint.end'    =>'All modules are installed or upgraded for the entry point %s',
        'install.entrypoint.bad.end'=>'Installation/upgrade is aborted for the entry point %s',
        'install.entrypoint.installers.disabled'=>'Installation scripts and update scripts will not be executed: it is disabled in the configuration.',

        'install.dependencies.ok'   =>'All modules dependencies are ok',
        'install.bad.dependencies'  =>'Error in dependencies. Installation cancelled.',
        'install.invalid.xml.file'  =>'The identity file  %s is invalid or not found',

        'install.module.already.installed'=>'Module %s is already installed',
        'install.module.installed'      =>'Module %s installed',
        'install.module.error'          =>'An error occured during the installation of the module %s: %s',
        'install.module.check.dependency'=>'Check dependencies of the module %s',
        'install.module.upgraded'       =>'Module %s upgraded to the version %s',
        'more.details'                  =>'More details',

        ),
    );

    function __construct($lang=''){
        if($lang == '' && isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])){
            $languages = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
            foreach($languages as $bl){
                // pour les user-agents qui livrent un code internationnal
                if(preg_match("/^([a-zA-Z]{2,3})(?:[-_]([a-zA-Z]{2,3}))?(;q=[0-9]\\.[0-9])?$/",$bl,$match)){
                    $lang = strtolower($match[1]);
                    break;
                }
            }
        }elseif(preg_match("/^([a-zA-Z]{2,3})(?:[-_]([a-zA-Z]{2,3}))?$/",$lang,$match)){
            $lang = strtolower($match[1]);
        }
        if($lang == '' || !isset($this->messages[$lang])){
            $lang = 'en';
        }
        $this->currentLang = $lang;
    }

    function get($key, $params = null){
        if(isset($this->messages[$this->currentLang][$key])){
            $msg = $this->messages[$this->currentLang][$key];
        }else{
            throw new Exception ("Error : don't find error message '$key'");
        }

        if ($params !== null || (is_array($params) && count($params) > 0)) {
            $msg = call_user_func_array('sprintf', array_merge (array ($msg), is_array ($params) ? $params : array ($params)));
        }
        return $msg;
    }

    function getLang(){
        return $this->currentLang;
    }
}


/**
* check a jelix installation
*
* @package  jelix
* @subpackage core
* @author   Laurent Jouanneau
* @contributor Bastien Jaillot
* @contributor Olivier Demah, Brice Tence, Julien Issler
* @copyright 2007-2014 Laurent Jouanneau, 2008 Bastien Jaillot, 2009 Olivier Demah, 2010 Brice Tence, 2011 Julien Issler
* @link     http://www.jelix.org
* @licence  GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
* @since 1.0b2
*/

/**
 * check an installation of a jelix application
 * @package  jelix
 * @subpackage core
 * @since 1.0b2
 */
class jInstallCheck {

    /**
     * the object responsible of the results output
     * @var jIInstallReporter
     */
    protected $reporter;

    /**
     * @var jInstallerMessageProvider
     */
    public $messages;

    public $nbError = 0;
    public $nbOk = 0;
    public $nbWarning = 0;
    public $nbNotice = 0;

    protected $buildProperties;

    public $verbose = false;

    public $checkForInstallation = false;

    function __construct ($reporter, $lang=''){
        $this->reporter = $reporter;
        $this->messages = new jInstallerMessageProvider($lang);
        $this->buildProperties = array(
   'PHP_VERSION_TARGET'=>'5.3',
        );
    }

    protected $otherExtensions = array();

    function addExtensionCheck($extension, $required) {
        $this->otherExtensions[$extension] = $required;
    }

    protected $otherPaths = array();

    /**
     * @since 1.2.5
     */
    function addWritablePathCheck($pathOrFileName) {
        if (is_array($pathOrFileName))
            $this->otherPaths = array_merge($this->otherPaths, $pathOrFileName);
        else
            $this->otherPaths[] = $pathOrFileName;
    }

    protected $databases = array();
    protected $dbRequired = false;

    function addDatabaseCheck($databases, $required) {
        $this->databases = $databases;
        $this->dbRequired = $required;
    }

    /**
     * run the ckecking
     */
    function run(){
        $this->nbError = 0;
        $this->nbOk = 0;
        $this->nbWarning = 0;
        $this->nbNotice = 0;
        $this->reporter->start();
        try {
            $this->checkPhpExtensions();
            $this->checkPhpSettings();
        }catch(Exception $e){
            $this->error('cannot.continue',$e->getMessage());
        }
        $results = array('error'=>$this->nbError, 'warning'=>$this->nbWarning, 'ok'=>$this->nbOk,'notice'=>$this->nbNotice);
        $this->reporter->end($results);
    }

    protected function error($msg, $msgparams=array(), $extraMsg=''){
        if($this->reporter)
            $this->reporter->message($this->messages->get($msg, $msgparams).$extraMsg, 'error');
        $this->nbError ++;
    }

    protected function ok($msg, $msgparams=array()){
        if($this->reporter)
            $this->reporter->message($this->messages->get($msg, $msgparams), 'ok');
        $this->nbOk ++;
    }
    /**
     * generate a warning
     * @param string $msg  the key of the message to display
     */
    protected function warning($msg, $msgparams=array()){
        if($this->reporter)
            $this->reporter->message($this->messages->get($msg, $msgparams), 'warning');
        $this->nbWarning ++;
    }

    protected function notice($msg, $msgparams=array()){
        if($this->reporter) {
            $this->reporter->message($this->messages->get($msg, $msgparams), 'notice');
        }
        $this->nbNotice ++;
    }

    function checkPhpExtensions(){
        $ok=true;
        if(!version_compare($this->buildProperties['PHP_VERSION_TARGET'], phpversion(), '<=')){
            $this->error('php.bad.version');
            $notice = $this->messages->get('php.version.required', $this->buildProperties['PHP_VERSION_TARGET']);
            $notice.= '. '.$this->messages->get('php.version.current',phpversion());
            $this->reporter->message($notice, 'notice');
            $ok=false;
        }
        else if ($this->verbose) {
            $this->ok('php.ok.version', phpversion());
        }

        $extensions = array( 'dom', 'SPL', 'SimpleXML', 'pcre', 'session',
            'tokenizer', 'iconv', 'filter', 'json');

        foreach($extensions as $name){
            if(!extension_loaded($name)){
                $this->error('extension.required.not.installed', $name);
                $ok=false;
            }
            else if ($this->verbose) {
                $this->ok('extension.required.installed', $name);
            }
        }

        if (count($this->databases)) {
            $driversInfos = jDbParameters::getDriversInfosList();
            $okdb = false;

            array_combine($this->databases, array_fill(0, count($this->databases), false));

            $alreadyExtensionsChecked = array();
            $okdatabases = array();
            foreach($this->databases as $name) {
                foreach($driversInfos as $driverInfo) {
                    list($dbType, $nativeExt, $pdoExt, $jdbDriver, $pdoDriver) = $driverInfo;

                    if ($name == $dbType || $name == $nativeExt || $name == $pdoDriver) {
                        if (extension_loaded($nativeExt)) {
                            if (!isset($alreadyExtensionsChecked[$nativeExt])) {
                                if ($this->verbose) {
                                    $this->ok('extension.installed', $nativeExt);
                                }
                                $alreadyExtensionsChecked[$nativeExt] = true;
                                $okdb = true;
                                $okdatabases[$name] = true;
                            }
                        }
                        else {
                            if (!isset($alreadyExtensionsChecked[$nativeExt])) {
                                if ($this->verbose) {
                                    $this->notice('extension.not.installed', $nativeExt);
                                }
                                $alreadyExtensionsChecked[$nativeExt] = false;
                            }
                        }
                        if (extension_loaded($pdoExt)) {
                            if (!isset($alreadyExtensionsChecked[$pdoExt])) {
                                if ($this->verbose) {
                                    $this->ok('extension.installed', $pdoExt);
                                }
                                $alreadyExtensionsChecked[$pdoExt] = true;
                                $okdb = true;
                                $okdatabases[$name] = true;
                            }
                        }
                        else {
                            if (!isset($alreadyExtensionsChecked[$pdoExt])) {
                                if ($this->verbose) {
                                    $this->notice('extension.not.installed', $pdoExt);
                                }
                                $alreadyExtensionsChecked[$pdoExt] = false;
                            }
                        }
                    }
                }
            }
            if ($this->dbRequired) {
                if ($okdb) {
                    $this->ok('extension.database.ok', implode(',', array_keys($okdatabases)));
                }
                else {
                    $this->error('extension.database.missing');
                    $ok = false;
                }
            }
            else {
                if ($okdb) {
                    $this->ok('extension.database.ok2', implode(',', array_keys($okdatabases)));
                }
                else {
                    $this->notice('extension.database.missing2');
                }
            }

        }

        foreach($this->otherExtensions as $name=>$required){
            $req = ($required?'required':'optional');
            if(!extension_loaded($name)){
                if ($required) {
                    $this->error('extension.'.$req.'.not.installed', $name);
                    $ok=false;
                }
                else {
                    $this->notice('extension.'.$req.'.not.installed', $name);
                }
            }
            else if ($this->verbose) {
                $this->ok('extension.'.$req.'.installed', $name);
            }
        }

        if($ok)
            $this->ok('extensions.required.ok');

        return $ok;
    }

    function checkPhpSettings(){
        $ok = true;
        if(ini_get('magic_quotes_gpc') == 1){
            $this->error('ini.magic_quotes_gpc');
            $ok=false;
        }

        if(ini_get('magic_quotes_runtime') == 1){
            $this->error('ini.magic_quotes_runtime');
            $ok=false;
        }

        if(ini_get('session.auto_start') == 1){
            $this->error('ini.session.auto_start');
            $ok=false;
        }

        if(ini_get('safe_mode') == 1){
            $this->error('ini.safe_mode');
            $ok=false;
        }

        if(ini_get('register_globals') == 1){
            $this->warning('ini.register_globals');
            $ok=false;
        }

        if(ini_get('asp_tags') == 1){
            $this->notice('ini.asp_tags');
        }
        if($ok){
            $this->ok('ini.ok');
        }
        return $ok;
    }
}



/**
 * @package     jelix
 * @subpackage  db
 * @author      Laurent Jouanneau
 * @copyright   2015 Laurent Jouanneau
 *
 * @link        http://jelix.org
 * @licence     http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public Licence, see LICENCE file
 */

/**
 * allow to normalize & analyse database parameters.
 *
 * supported parameters in a profile:
 *  - driver: the jdb driver name, or "pdo" to use dbo ("pdo" value is deprecated, use usepdo instead)
 *  - database: the name of the database (for sqlite: path to the sqlite file)
 *  - host: the host of the database
 *  - port: the port of the database
 *  - user & password: credentials to connect to the database
 *  - force_encoding: force the encoding at the connection, using the default encoding of the application
 *  - dsn: dsn (pdo, odbc... optional)
 *  - usepdo: true if pdo should be used
 *  - pdodriver: name of the pdodriver to use. Guessed from dsn
 *  - pdoext: name of the pdo extension to use. Guessed from dsn
 *  - dbtype: type of the database (so it determines the SQL language)
 *  - phpext: name of the php extension to use
 *  - persistent: if true, the connection should be persistent
 *  - extensions: some informations about extensions to load (For sqlite for example. optional)
 *  - single_transaction: indicate to execute all queries into a single transaction (pgsql, optional)
 *  - busytimeout: timeout for the connection (sqlite, optional)
 *  - timeout: timeout for the connection (pgsql, optional)
 *  - search_path: schema for pgsql (optional)
 *  - table_prefix: prefix to add to database table. Used by jDao (optional)
 */
class jDbParameters
{
    protected $parameters = array();

    /**
     * the constructor normalizes parameters: it ensure that all parameters needed by
     * jDb and the targeted database type are there, as some parameters can be
     * "guessed" by jDb or needed for internal use.
     *
     * @param array $profileParameters profile parameters for a jdb connection
     *                                 required keys: driver
     *                                 optional keys: dsn, host, username, password, database,....
     */
    public function __construct($profileParameters)
    {
        $this->parameters = $profileParameters;

        $this->normalizeBoolean($this->parameters, 'usepdo');
        $this->normalizeBoolean($this->parameters, 'persistent');
        $this->normalizeBoolean($this->parameters, 'force_encoding');
        if (!isset($this->parameters['table_prefix'])) {
            $this->parameters['table_prefix'] = '';
        }

        $info = $this->getDatabaseInfo($this->parameters);
        $this->parameters = array_merge($this->parameters, $info);

        if ($this->parameters['usepdo'] &&
            (!isset($this->parameters['dsn']) ||
                $this->parameters['dsn'] == '')) {
            $this->parameters['dsn'] = $this->getPDODsn($this->parameters);
        }
        $pdooptions = array_diff(array_keys($this->parameters),
                                 array('driver', 'dsn', 'service', 'host', 'password', 'user', 'port', 'force_encoding',
                                       'usepdo', 'persistent', 'pdodriver', 'pdoext', 'dbtype', 'phpext',
                                       'extensions', 'table_prefix', 'database', 'table_prefix', '_name' ));
        $this->parameters['pdooptions'] = implode(',', $pdooptions);
    }

    public function getParameters()
    {
        return $this->parameters;
    }

    /**
     * indicate if the php extension corresponding to the database configuration is available in
     * the current php configuration.
     */
    public function isExtensionActivated()
    {
        if ($this->parameters['usepdo']) {
            return (extension_loaded('PDO') && extension_loaded($this->parameters['pdoext']));
        } elseif (isset($this->parameters['phpext'])) {
            return extension_loaded($this->parameters['phpext']);
        }
        throw new Exception('Unable to check existance of the extension corresponding to jdb driver '.$this->parameters['driver']);
    }

    /**
     * it gives the name of the jDb driver and the database type indicated in a profile.
     * (or corresponding to the PDO dsn indicated in the profile).
     *
     * @param  array $profile 'driver' key is required. It should indicates 'pdo' or a jdb driver.
     *    if 'pdo', a 'dsn' key is required.
     * @return array ['database type', 'native extension name', 'pdo extension name', 'jdb driver name', 'pdo driver name']
     * @throws Exception
     */
    protected function getDatabaseInfo($profile)
    {
        $info = null;
        if (!isset($profile['driver']) || $profile['driver'] == '') {
            throw new Exception('jDb profile: driver is missing');
        }
        // driver = "pdo"
        if ($profile['driver'] == 'pdo') {
            $usepdo = true;
            $pdoDriver = '';
            if (isset($profile['dsn'])) {
                $pdoDriver = substr($profile['dsn'], 0, strpos($profile['dsn'], ':'));
            } elseif (isset($profile['pdodriver'])) {
                $pdoDriver = $profile['pdodriver'];
            }

            if (!$pdoDriver) {
                throw new Exception('PDO profile: dsn is missing or mal-formed');
            }

            if (isset(self::$PDODriverIndex[$pdoDriver])) {
                $info = self::$driversInfos[self::$PDODriverIndex[$pdoDriver]];
            } else {
                throw new Exception('Unknown pdo driver ('.$pdoDriver.')');
            }
        }
        // driver = jdb driver name
        else {
            $usepdo = $profile['usepdo'];
            $driver = $profile['driver'];
            if (isset(self::$JdbDriverIndex[$driver])) {
                $info = self::$driversInfos[self::$JdbDriverIndex[$driver]];
            } else {
                $info = array('', '', '', $driver, '', '');
                $info[0] = (isset($profile['dbtype']) ? $profile['dbtype'] : '');
                $info[1] = (isset($profile['phpext']) ? $profile['phpext'] : '');
            }
        }

        $info =  array_combine(array('dbtype', 'phpext', 'pdoext',
                                     'driver', 'pdodriver', ), $info);

        $info['usepdo'] = $usepdo;

        return $info;
    }

    protected function normalizeBoolean(&$profile, $param)
    {
        if (!isset($profile[$param])) {
            $profile[$param] = false;
        } elseif (!is_bool($profile[$param])) {
            if ($profile[$param] === '1' ||
                $profile[$param] === 1 ||
                $profile[$param] === 'on' ||
                $profile[$param] === 'true') {
                $profile[$param] = true;
            } else {
                $profile[$param] = false;
            }
        }
    }

    protected static $JdbDriverIndex = array(
        'mysqli' => 0,
        'mysql' => 1,
        'pgsql' => 2,
        'sqlite3' => 3,
        'sqlite' => 4,
        'oci' => 5,
        'mssql' => 6,
        'sqlsrv' => 7,
        'sybase' => 9,
        'odbc' => 10,
    );

    protected static $PDODriverIndex = array(
        'mysql' => 0,
        'pgsql' => 2,
        'sqlite' => 3,
        'sqlite2' => 4,
        'oci' => 5,
        'sqlsrv' => 7,
        'odbc' => 10,
        'mssql' => 6,
        'sybase' => 8,
    );

    /**
     * informations about correspondance between pdo driver and native driver, type of function etc...
     */
    protected static $driversInfos = array(
        //array('database type', 'native extension name', 'pdo extension name', 'jdb driver name', 'pdo driver name')
        0 => array('mysql',  'mysqli',    'pdo_mysql',   'mysqli',  'mysql'),
        1 => array('mysql',  'mysql',     'pdo_mysql',   'mysql',   'mysql'),
        2 => array('pgsql',  'pgsql',     'pdo_pgsql',   'pgsql',   'pgsql'), // pgsql:host=;port=;dbname=;user=;password=;
        3 => array('sqlite', 'sqlite3',   'pdo_sqlite',  'sqlite3', 'sqlite'),
        4 => array('sqlite', 'sqlite',    'pdo_sqlite2', 'sqlite',  'sqlite2'),
        5 => array('oci',    'oci8',      'pdo_oci',     'oci',     'oci'), // experimental  oci:dbname=tnsname  oci://localhost:1521/mydb
        6 => array('mssql',  'mssql',     'pdo_dblib',   'mssql',   'mssql'),     // deprecated since PHP 5.3
        7 => array('mssql',  'sqlsrv',    'pdo_sqlsrv',  'sqlsrv',  'sqlsrv'), //mssql 2005+ sqlsrv:Server=localhost,port;Database=
        8 => array('sybase', 'sybase',    'pdo_dblib',   'sybase',  'sybase'), // deprecated
        9 => array('sybase', 'sybase_ct', 'pdo_dblib',   'sybase',  'sybase'),
        10 => array('odbc',  'odbc',      'pdo_odbc',    'odbc',    'odbc'), // odbc:DSN
    );

    protected static $pdoNeededDsnInfo = array(
        'mysql' => array('host', 'database'),
        'pgsql' => array(array('host', 'database'), array('service')),
        'sqlite' =>  array('database'),
        'sqlite2' =>  array('database'),
        'oci' =>  array('database'),
        'sqlsrv' =>  array('host', 'database'),
        'odbc' =>  array('dsn'),
        'mssql' => array('host', 'database'),
        'sybase' => array('host', 'database'),
    );

    public static function getDriversInfosList() {
        return self::$driversInfos;
    }
    
    protected function _checkRequirements($requirements, &$profile) {
        foreach ($requirements as $param) {
            if (!isset($profile[$param])) {
                throw new Exception('Parameter '.$param.' is required for pdo driver '.$profile['pdodriver']);
            }
        }
    }

    protected function getPDODsn($profile)
    {
        if (!isset(self::$pdoNeededDsnInfo[$profile['pdodriver']])) {
            throw new Exception('PDO does not support database '.$profile['dbtype']);
        }
        $requirements = self::$pdoNeededDsnInfo[$profile['pdodriver']];
        if (is_array($requirements[0])) {
            $error = null;
            foreach($requirements as $requirements2) {
                try {
                    $this->_checkRequirements($requirements2, $profile);
                    $error = null;
                    break;
                }
                catch(Exception $e) {
                    $error = $e;
                }
            }
            if ($error) {
                throw $error;
            }
        }
        else {
            $this->_checkRequirements($requirements, $profile);
        }

        switch ($profile['pdodriver']) {
            case 'mysql':
                $dsn = 'mysql:';
                if (isset($profile['unix_socket'])) {
                    $dsn .= 'unix_socket='.$profile['unix_socket'];
                } else {
                    $dsn .= 'host='.$profile['host'];
                    if (isset($profile['port'])) {
                        $dsn .= ';port='.$profile['port'];
                    }
                }
                $dsn .= ';dbname='.$profile['database'];
                break;
            case 'pgsql':
                if (isset($profile['service']) && $profile['service']) {
                    $dsn = 'pgsql:service='.$profile['service'];
                }
                else {
                    $dsn = 'pgsql:host='.$profile['host'];
                    if (isset($profile['port'])) {
                        $dsn .= ';port='.$profile['port'];
                    }
                    $dsn .= ';dbname='.$profile['database'];
                }
                break;
            case 'sqlite':
                $dsn = 'sqlite:'.$profile['database'];
                break;
            case 'sqlite2':
                $dsn = 'sqlite2:'.$profile['database'];
                break;
            case 'oci':
                $dsn = 'oci:dbname=';
                if (isset($profile['host'])) {
                    $dsn .= $profile['host'];
                    if (isset($profile['port'])) {
                        $dsn .= ':'.$profile['port'];
                    }
                    $dsn .= '/';
                }
                $dsn .= $profile['database'];
                break;
            case 'mssql':
            case 'sybase':
                $dsn = $profile['pdodriver'].':';
                $dsn .= 'host='.$profile['host'];
                $dsn .= ';dbname='.$profile['database'];
                if (isset($profile['appname'])) {
                    $dsn .= ';appname='.$profile['appname'];
                }
                break;
            case 'sqlsrv':
                $dsn = 'sqlsrv:Server='.$profile['host'];
                if (isset($profile['port'])) {
                    $dsn .= ','.$profile['port'];
                }
                $dsn .= ';Database='.$profile['database'];
                break;
            case 'odbc':
            default:
                throw new Exception('PDO: cannot construct the DSN string');
                break;
        }

        return $dsn;
    }
}

/**
 * an HTML reporter for jInstallChecker
 * @package jelix
 */
class jHtmlInstallChecker implements jIInstallReporter {

    function start(){
        echo '<ul class="checkresults">';
    }

    function message($message, $type=''){
        echo '<li class="'.$type.'">'.htmlspecialchars($message).'</li>';
    }
    
    function end($results){
        echo '</ul>';
        
        $nbError = $results['error'];
        $nbWarning = $results['warning'];
        $nbNotice = $results['notice'];

        echo '<div class="results">';
        if ($nbError) {
            echo ' '.$nbError. $this->messageProvider->get( ($nbError > 1?'number.errors':'number.error'));
        }
        if ($nbWarning) {
            echo ' '.$nbWarning. $this->messageProvider->get(($nbWarning > 1?'number.warnings':'number.warning'));
        }
        if ($nbNotice) {
            echo ' '.$nbNotice. $this->messageProvider->get(($nbNotice > 1?'number.notices':'number.notice'));
        }

        if($nbError){
            echo '<p>'.$this->messageProvider->get(($nbError > 1?'conclusion.errors':'conclusion.error')).'</p>';
        }else if($nbWarning){
            echo '<p>'.$this->messageProvider->get(($nbWarning > 1?'conclusion.warnings':'conclusion.warning')).'</p>';
        }else if($nbNotice){
            echo '<p>'.$this->messageProvider->get(($nbNotice > 1?'conclusion.notices':'conclusion.notice')).'</p>';
        }else{
            echo '<p>'.$this->messageProvider->get('conclusion.ok').'</p>';
        }
        echo "</div>";
    }
}

$reporter = new jHtmlInstallChecker();
$check = new jInstallCheck($reporter);
if (isset($_GET['verbose'])) {
    $check->verbose = true;
}
$check->addDatabaseCheck(array('mysqli', 'sqlite3', 'pgsql', 'oci', 'mssql'), false);
$reporter->messageProvider = $check->messages;

header("Content-type:text/html;charset=UTF-8");

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php echo $check->messages->getLang(); ?>" lang="<?php echo $check->messages->getLang(); ?>">
<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type"/>
    <title><?php echo htmlspecialchars($check->messages->get('checker.title')); ?></title>

    <style type="text/css">

body {  
  font-family: Verdana, Arial, Sans; 
  font-size:0.8em;
  margin:0;
  background-color:#eff4f6;
  color : #002830;
  padding:0 1em;
}
a { color:#3f6f7a; text-decoration:underline; }
a:visited { color : #002830;}
a:hover { color: #0f82af; background-color: #d7e7eb; }
h1.apptitle {
    font-size: 1.7em;
    background:-moz-linear-gradient(top, #2b4c53,#27474E 40%, #244148 60%, #002830);
    background-color:#002830;
    color:white;
    margin: 32px auto 1em auto;
    padding: 0.5em;
    width: 600px;
    -moz-border-radius:5px;
    -webkit-border-radius:5px; 
    -o-border-radius:5px;
    border-radius:5px ;
    z-index:100;
    -moz-box-shadow: #999 3px 3px 8px 0px;
    -webkit-box-shadow: #999  3px 3px 8px;
    -o-box-shadow: #999 3px 3px 8px 0px;
    box-shadow: #999 3px 3px 8px 0px;
}

h1.apptitle span.welcome { font-size:0.8em; font-style:italic; }
ul.checkresults { border:3px solid black; margin: 2em; padding:1em; list-style-type:none; }
ul.checkresults li { margin:0; padding:5px; border-top:1px solid black; }
ul.checkresults li:first-child {border-top:0px}
li.error, p.error  { background-color:#ff6666;}
li.ok, p.ok      { background-color:#a4ffa9;}
li.warning { background-color:#ffbc8f;}
li.notice { background-color:#DBF0FF;}
.logo { margin:6px 0; text-align:right;}
.nocss { display: none; }
#page { margin: 0 auto; width: 924px; }
div.block h2 {
  color:white;
  vertical-align:bottom;
  margin:0;
  padding:10px 0px 5px 10px;
  background:-moz-linear-gradient(top, #87B2C3,#5595AF, #3c90af);
  background-color:#3c90af;
  background-position:center left;
  background-repeat:no-repeat;
  -moz-border-radius:15px 15px 0px  0px ;
  -o-border-radius:15px 15px 0px  0px ;
  -webkit-border-top-right-radius: 15px;
  -webkit-border-top-left-radius: 15px; 
  border-radius:15px 15px 0px  0px ;
  -moz-box-shadow: #999 3px 3px 8px 0px;
  -webkit-box-shadow: #999 3px 3px 8px;
  -o-box-shadow: #999 3px 3px 8px 0px;
  box-shadow: #999 3px 3px 8px 0px;
  z-index:50;
}
div.block h3 {
  color:#C03033;
}

div.block .blockcontent {
  background: white;
  padding: 1em 2em;
  margin-bottom: 20px;
  -moz-box-shadow: #999 3px 3px 8px 0px;
  -webkit-box-shadow: #999  3px 3px 8px;
  -o-box-shadow: #999 3px 3px 8px 0px;
  box-shadow: #999 3px 3px 8px 0px;
  -moz-border-radius:0px 0px 15px 15px;
  -webkit-border-bottom-left-radius: 15px; 
  -webkit-border-bottom-right-radius: 15px; 
  -o-border-radius:0px 0px 15px 15px;
  border-radius:0px 0px 15px 15px;
}

div#jelixpowered {
    text-align:center;
    margin: 0 auto;
}

</style>

</head><body >
    <h1 class="apptitle"><?php echo htmlspecialchars($check->messages->get('checker.title')); ?></h1>

<?php $check->run();

if (!$check->verbose) {
?>
<p><a href="?verbose"><?php echo htmlspecialchars($check->messages->get('more.details')); ?></a></p>
<?php } ?>
</body>
</html>
