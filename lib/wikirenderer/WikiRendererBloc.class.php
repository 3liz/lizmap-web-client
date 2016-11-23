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
 * base class to parse bloc elements
 * @abstract
 */
abstract class WikiRendererBloc {

    /**
    * @var string  type of the bloc
    */
   public $type='';

   /**
    * @var string  the string inserted at the beginning of the bloc
    */
   protected $_openTag='';

   /**
    * @var string  the string inserted at the end of the bloc
    */
   protected $_closeTag='';
   /**
    * @var boolean   says if the bloc is only on one line
    * @access private
    */
   protected $_closeNow=false;

   /**
    * @var WikiRenderer      reference to the main parser
    */
   protected $engine=null;

   /**
    * @var   array      list of elements found by the regular expression
    */
   protected $_detectMatch=null;

   /**
    * @var string      regular expression which can detect the bloc
    */
   protected $regexp='';

   /**
    * @param WikiRenderer    $wr   l'objet moteur wiki
    */
   function __construct($wr){
      $this->engine = $wr;
   }

   /**
    * @return string   the string to insert at the beginning of the bloc
    */
   public function open(){
      return $this->_openTag;
   }

   /**
    * @return string the string to insert at the end of the bloc
    */
   public function close(){
      return $this->_closeTag;
   }

   /**
    * @return boolean says if the bloc can exists only on one line
    */
   public function closeNow(){
      return $this->_closeNow;
   }

   /**
    * says if the given line belongs to the bloc
    * @param string   $string
    * @return boolean
    */
   public function detect($string){
      return preg_match($this->regexp, $string, $this->_detectMatch);
   }

   /**
    * @return string a rendered line  of bloc
    * @abstract
    */
   public function getRenderedLine(){
      return $this->_renderInlineTag($this->_detectMatch[1]);
   }

   /**
    * @param   string  $string a line of wiki
    * @return  string  the transformed line
    * @see WikiRendererInline
    */
   protected function _renderInlineTag($string){
      return $this->engine->inlineParser->parse($string);
   }
}
