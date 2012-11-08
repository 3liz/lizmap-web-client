<?php
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
       'checker.title'=>'Vérification de l\'installation de Jelix',
        'number.errors'         =>' erreurs.',
        'number.error'          =>' erreur.',
        'number.warnings'       =>' avertissements.',
        'number.warning'        =>' avertissement.',
        'number.notices'        =>' remarques.',
        'number.notice'         =>' remarque.',
        'build.not.found'       =>'Le fichier BUILD de jelix est introuvable',
        'conclusion.error'      =>'Vous devez corriger l\'erreur pour faire fonctionner correctement l\'application.',
        'conclusion.errors'     =>'Vous devez corriger les erreurs pour faire fonctionner correctement l\' application.',
        'conclusion.warning'    =>'L\'application peut à priori fonctionner, mais il est préférable de corriger l\'avertissement pour être sûr.',
        'conclusion.warnings'   =>'L\'application peut à priori fonctionner, mais il est préférable de corriger les avertissements pour être sûr.',
        'conclusion.notice'     =>'Les prerequis essentiels pour faire fonctionner l\'application sont ok malgré la remarque.',
        'conclusion.notices'    =>'Les prerequis essentiels pour faire fonctionner l\'application sont ok malgré les remarques.',
        'conclusion.ok'         =>'Les prerequis essentiels pour faire fonctionner l\'application sont ok',
        'cannot.continue'       =>'Les vérifications ne peuvent continuer : %s',
        'extension.not.installed'=>'L\'extension %s n\'est pas disponible',
        'extension.optional.not.installed'=>'L\'extension %s optionnelle n\'est pas disponible',
        'extension.required.not.installed'=>'L\'extension %s obligatoire n\'est pas disponible',
        'extension.installed'=>'L\'extension %s est disponible',
        'extension.optional.installed'=>'L\'extension %s optionnelle est disponible',
        'extension.required.installed'=>'L\'extension %s obligatoire est disponible',
        'extensions.required.ok'=>'Toutes les extensions PHP obligatoires sont disponibles',
        'extension.opcode.cache'=>'Cette édition de Jelix a besoin d\'une extension de cache d\'opcode (apc, eaccelerator...)',
        'extension.database.ok'=>'L\'application utilisera une base de données SQL',
        'extension.database.ok2'=>'L\'application pourra utiliser une base de données SQL',
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
        'path.defaultconfig.writable'=>'Le fichier defaultconfig.ini.php n\'a pas les droits en écriture',
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
        'ini.magic_quotes_gpc_with_plugin'=>'php.ini : le plugin magicquotes est activé mais vous devriez mettre magic_quotes_gpc à off',
        'ini.magicquotes_plugin_without_php'=>'php.ini : le plugin magicquotes est activé alors que magic_quotes_gpc est déjà à off, désactivez le plugin',
        'ini.magic_quotes_gpc'  =>'php.ini : l\'activation des magicquotes n\'est pas recommandée pour jelix. Vous devez les désactiver ou activer le plugin magicquotes si ce n\'est pas fait',
        'ini.magic_quotes_runtime'=>'php.ini : magic_quotes_runtime doit être à off',
        'ini.session.auto_start'=>'php.ini : session.auto_start doit être à off',
        'ini.safe_mode'         =>'php.ini : le safe_mode n\'est pas recommandé.',
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

        ),

        'en'=>array(
        'checker.title'     =>'Jelix Installation checking',
        'number.errors'     =>' errors.',
        'number.error'      =>' error.',
        'number.warnings'   =>' warnings.',
        'number.warning'    =>' warning.',
        'number.notices'    =>' notices.',
        'number.notice'     =>' notice.',
        'build.not.found'   =>'BUILD jelix file is not found',
        'conclusion.error'  =>'You must fix the error in order to run your application correctly.',
        'conclusion.errors' =>'You must fix errors in order to run your application correctly.',
        'conclusion.warning'=>'Your application may run without problems, but it is recommanded to fix the warning.',
        'conclusion.warnings'=>'Your application may run without problems, but it is recommanded to fix warnings.',
        'conclusion.notice' =>'The main prerequisites to run your application are ok, although there is a notice.',
        'conclusion.notices'=>'The main prerequisites to run your application are ok, although there are notices.',
        'conclusion.ok'     =>'The main prerequisites to run your application are ok',
        'cannot.continue'       =>'Cannot continue the checking: %s',
        'extension.not.installed'=>'The extension %s is not available',
        'extension.optional.not.installed'=>'the optional extension %s is not available',
        'extension.required.not.installed'=>'the required extension %s is not available',
        'extension.installed'=>'The extension %s is available',
        'extension.optional.installed'=>'the optional extension %s is available',
        'extension.required.installed'=>'the required extension %s is available',
        'extensions.required.ok'=>'All needed PHP extensions are available',
        'extension.opcode.cache'=>'The application requires an extension for opcode cache (apc, eaccelerator...)',
        'extension.database.ok'=>'The application will use a SQL database',
        'extension.database.ok2'=>'The application can use SQL databases',
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
        'path.defaultconfig.writable'=>'The file defaultconfig.ini.php have not write rights',
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
        'ini.magic_quotes_gpc_with_plugin'=>'php.ini: the magicquotes plugin is actived but you should set magic_quotes_gpc to off',
        'ini.magicquotes_plugin_without_php'=>'php.ini: the magicquotes plugin is actived whereas magic_quotes_gpc is already off, you should disable the plugin',
        'ini.magic_quotes_gpc'  =>'php.ini: magicquotes are not recommended for Jelix. You should deactivate it or activate the magicquote jelix plugin',
        'ini.magic_quotes_runtime'=>'php.ini: magic_quotes_runtime must be off',
        'ini.session.auto_start'=>'php.ini: session.auto_start must be off',
        'ini.safe_mode'         =>'php.ini: safe_mode is not recommended.',
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
