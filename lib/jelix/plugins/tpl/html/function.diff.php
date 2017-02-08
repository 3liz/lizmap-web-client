<?php
/**
* @package    jelix
* @subpackage jtpl_plugin
* @author     Laurent Jouanneau
* @contributor Olivier Demah
* @copyright  2005-2006 Laurent Jouanneau
* @copyright  2008 Olivier Demah
* @link        http://www.jelix.org
* @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * load the diff library
 */
require_once(LIB_PATH.'diff/diffhtml.php');

/**
 * function plugin : show a diff between two string
 *
 * @param jTpl $tpl template engine
 * @param string $str1 the first string
 * @param string $str2 the second string
 * @param array $options contains : 'nodiffmsg' message when no diff found ; 'version1' ; 'version2' to be compared ; 'type' of display
 */
function jtpl_function_html_diff($tpl, $str1,$str2, $options = array()) 
{ 
    $nodiffmsg  ='Pas de différence';
    $version1   = '';
    $version2   = '';
    $type       = 'unifieddiff';
    $supported_output_format = array('unifieddiff','inlinetable','sidebyside');        
    
	if (!is_array($options))
        $nodiffmsg = $options;
    else {               
        if (array_key_exists('nodiffmsg',$options))
            $nodiffmsg = $options['nodiffmsg'];            
        if (array_key_exists('version1',$options))
            $version1 = $options['version1'];
        if (array_key_exists('version2',$options))
            $version2 = $options['version2'];        
        //the type of ouput format of the diff
        //1) type option exists ?
        if (array_key_exists('type',$options))
            $type = $options['type'];
        //2) is it a supported type ouput format ?
        if (!in_array($type,$supported_output_format)) 
            $type = 'unifieddiff';
     }
    
    $diff = new Diff(explode("\n",$str1),explode("\n",$str2)); 
	if($diff->isEmpty()){ 
		echo $nodiffmsg; 
	} else {     
        switch ($type) {
            case 'inlinetable' :
                require_once(LIB_PATH.'diff/difftableformatter.php'); 
                $fmt = new HtmlInlineTableDiffFormatter($version1,$version2);        
                break;
            case 'sidebyside' :
                require_once(LIB_PATH.'diff/difftableformatter.php'); 
                $fmt = new HtmlTableDiffFormatter($version1,$version2);        
                break;
            case 'unifieddiff' :
            default:
                $fmt = new HtmlUnifiedDiffFormatter();
                break;
        }
        echo $fmt->format($diff);
	} 
} 
