<?php
/**
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author		Didier Huguet
 * @copyright 2008 Didier Huguet
 * @link http://snipplr.com/view.php?codeview&id=3618
 * @link http://jelix.org/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */ 
 
 /**
 * modifier plugin : cut a html formated string and close all opened tags so that it doesn't inpact on the rest of the page
 * You should use this modifier in a zone so that the return value is cached
 * Plugin from sniplr (original sources can be found here: http://snipplr.com/view.php?codeview&id=3618 )
 * <pre>{$mytext|wordwrap}
 * {$mytext|truncatehtml:150:"\n<a href="...">read full article</a>"}
 * {$mytext|truncatehtml:45}
 * </pre>
 * @param string $string the string to truncate
 * @param integer $nbChar number of chars to keep (warning html tags included )
 * @param string $etcPattern  the string to append to the truncated string
 * @return string
 */
 function jtpl_modifier_common_truncatehtml($string,$nbChar=200,$etcPattern='...')
 {
    if ($nbChar == 0)
        return '';
    
    // If there is a comment, we delete it
    $string = preg_replace('#<!--(.+)-->#isU','',$string);
    $string = str_replace('<!--','&lteq;!--',$string);     //non closed comment
    
    if (strlen($string) < $nbChar)
       return $string; 
    
    //detecting the last word
    $html = preg_replace('/\s+?(\S+)?$/', '', substr ($string, 0, $nbChar+1));
    $html = substr ($html, 0, $nbChar);

    $html = strrpos ($html, "<" ) > strrpos ($html, ">" ) ? rtrim(substr ($string, 0, strrpos ( $html, "<" ))) . $etcPattern : rtrim ($html) . $etcPattern;
	
    //put all opened tags into an array
    $openedtags = array();
    preg_match_all ("#<([a-z]+)( .*)?(?!/)>#iU", $html, $result );
   	foreach ($result[2] as $key=>$value){
		if(!preg_match('#/$#',$value))                      //Detecting auto-closed tags and excluding them
			$openedtags[] = $result[1][$key];
   		
   	}

    //put all closed tags into an array
    preg_match_all ("#</([a-z]+)>#iU", $html, $result );
    $closedtags = $result[1];
    $len_opened = count ( $openedtags );
    //all tags are closed
    if (count($closedtags) == $len_opened ) {
        return $html;
    }
    $openedtags = array_reverse ( $openedtags );
    // close tags
    for( $i = 0; $i < $len_opened; $i++ ) {
        if (!in_array($openedtags[$i], $closedtags) ) {
            $html .= "</" . $openedtags[$i] . ">";
        } else {
            unset ($closedtags[array_search($openedtags[$i], $closedtags)]);
        }
    }
    return $html;
 }
