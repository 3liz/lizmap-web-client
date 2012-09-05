<?php
/**
 *
 * @package    jelix
 * @subpackage jtpl_plugin
 * @author     Laurent Jouanneau
 * @copyright  2006 Laurent Jouanneau
 * @link http://wikirenderer.berlios.de/
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 *
 */
require_once(JELIX_LIB_UTILS_PATH.'jWiki.class.php');

/**
 * modifier plugin :  transform a wiki text to another format
 * you can use other transformations by given the name of
 * corresponding wikirenderer rules
 * <pre> 
 * {$var|wiki}
 * {$var|wiki:"classicwr_to_xhtml"}
 * </pre>
 * @param string $text the wiki texte
 * @param string $config  the name of the wikirenderer rule to use
 * @return string
 * @see jWiki
 * @link  http://wikirenderer.berlios.de/
 */
function jtpl_modifier_common_wiki($text, $config = 'wr3_to_xhtml')
{
    $wr = new jWiki($config);
    return $wr->render($text);
}

