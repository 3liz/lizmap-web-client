<?php
/**
 * Wikirenderer is a wiki text parser. It can transform a wiki text into xhtml or other formats
 * @package WikiRenderer
 * @author Laurent Jouanneau
 * @copyright 2003-2008 Laurent Jouanneau
 * @link http://wikirenderer.jelix.org
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public 2.1
 * License as published by the Free Software Foundation.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

/**
 * base class for the configuration
 */
abstract class WikiRendererConfig {

   public $defaultTextLineContainer = 'WikiTextLine';

   public $textLineContainers = array(
         'WikiTextLine'=>array(),
   );

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array();


   public $simpletags = array();

   public $checkWikiWordFunction = null;

   /**
    * @var string name of the class used to parse unrecognized line
    */
   public $defaultBlock = null;

   public $escapeChar = '\\';

   // for htmlspecialchars
   public $charset = 'UTF-8';

   /**
    * Called before the wiki text parsing
    * @param string $text  the wiki text
    * @return string the wiki text to parse
    */
   public function onStart($texte){
        return $texte;
    }

   /**
    * called after the parsing. You can add additionnal data to
    * the result of the parsing
    */
   public function onParse($finalTexte){
       return $finalTexte;
   }

   /**
    * in some wiki system, some links are specials. You should override this method
    * to transform this specific links to real URL
    * @return array  first item is the url, second item is an alternate label
    */
   public function processLink($url, $tagName='') {
      return array($url, $url);
   }
}

