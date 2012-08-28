<?php
/**
* @package     jelix
* @subpackage  core_url
* @author      Laurent Jouanneau
* @copyright   2005-2008 Laurent Jouanneau
* Some parts of this file are took from an experimental branch of the Copix project (CopixUrl.class.php, Copix 2.3dev20050901, http://www.copix.org),
* Some lines of code are still copyrighted 2001-2005 CopixTeam (LGPL licence).
* Initial authors of this parts are Gerald Croes and Laurent Jouanneau,
* and this parts were adapted for Jelix by Laurent Jouanneau
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * interface for url engines
 * @package  jelix
 * @subpackage core_url
 * @author      Laurent Jouanneau
 * @copyright   2005 CopixTeam, 2005-2006 Laurent Jouanneau
 */
interface jIUrlEngine {
    /**
    * Parse some url components
    * @param string $scriptNamePath    /path/index.php
    * @param string $pathinfo          the path info part of the url (part between script name and query)
    * @param array  $params            url parameters (query part e.g. $_REQUEST)
    * @return jUrlAction
    */
    public function parse($scriptNamePath, $pathinfo, $params );

    /**
     * Parse a url from the request
     * @param jRequest $request
     * @param array  $params            url parameters
     * @return jUrlAction
     * @since 1.1
     */
    public function parseFromRequest($request, $params );

    /**
    * Create a jurl object with the given action data
    * @param jUrlAction $url  information about the action
    * @return jUrl the url correspondant to the action
    */
    public function create($urlact);

}
