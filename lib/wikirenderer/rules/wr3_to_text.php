<?php
/**
 * wikirenderer3 syntax to plain text
 *
 * @package WikiRenderer
 * @subpackage wr3_to_text
 * @author Laurent Jouanneau
 * @copyright 2003-2010 Laurent Jouanneau
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

class wr3_to_text   extends WikiRendererConfig {

   public $defaultTextLineContainer = 'WikiTextLine';

   public $textLineContainers = array(
            'WikiTextLine'=>array( 'wr3text_strong','wr3text_em','wr3text_code','wr3text_q',
    'wr3text_cite','wr3text_acronym','wr3text_link', 'wr3text_image', 'wr3text_anchor',
    'wr3text_footnote'));

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array('wr3text_title', 'wr3text_list', 'wr3text_pre','wr3text_hr',
                         'wr3text_blockquote','wr3text_definition','wr3text_table', 'wr3text_p');


   public $simpletags = array('%%%'=>"\n");


}

// ===================================== déclarations des tags inlines

class wr3text_strong extends WikiTag {
    public $beginTag='__';
    public $endTag='__';
}

class wr3text_em extends WikiTag {
    public $beginTag='\'\'';
    public $endTag='\'\'';
}

class wr3text_code extends WikiTag {
    public $beginTag='@@';
    public $endTag='@@';
    function getContent(){ return '['.$this->wikiContentArr[0].']';}
    public function isOtherTagAllowed() {
        return false;
    }
}

class wr3text_q extends WikiTag {
    public $beginTag='^^';
    public $endTag='^^';
    protected $attribute=array('$$','lang','cite');
    public $separators=array('|');
    public function getContent(){
        if($this->separatorCount > 1)
            return '"'.$this->contents[0].'" ('.$this->contents[2].')';
        else
            return '"'.$this->contents[0].'"';
    }
}

class wr3text_cite extends WikiTag {
    public $beginTag='{{';
    public $endTag='}}';
    protected $attribute=array('$$','title');
    public $separators=array('|');
    public function getContent(){
        if($this->separatorCount > 1)
            return '"'.$this->contents[0].'" ('.$this->contents[2].')';
        else
            return '"'.$this->contents[0].'"';
    }
}

class wr3text_acronym extends WikiTag {
    public $beginTag='??';
    public $endTag='??';
    protected $attribute=array('$$','title');
    public $separators=array('|');
    public function getContent(){
        if($this->separatorCount > 0)
            return $this->contents[0].' ('.$this->contents[2].')';
        else
            return $this->contents[0];
    }
}

class wr3text_anchor extends WikiTag {
    public $beginTag='~~';
    public $endTag='~~';
    protected $attribute=array('name');
    public $separators=array('|');
    public function getContent(){ return ''; }
}


class wr3text_link extends WikiTag {
    public $beginTag='[[';
    public $endTag=']]';
    protected $attribute=array('$$','href','hreflang','title');
    public $separators=array('|');
    public function getContent(){
        $cntattr=count($this->attribute);
        $cnt=($this->separatorCount + 1 > $cntattr?$cntattr:$this->separatorCount+1);
        if($cnt == 1 ){
            return $this->wikiContentArr[0];
        }else{
            return $this->wikiContentArr[0].' ('.$this->wikiContentArr[1].')';
        }
    }
}



class wr3text_image extends WikiTag {
    public $beginTag='((';
    public $endTag='))';
    protected $attribute=array('src','alt','align','longdesc');
    public $separators=array('|');

    public function getContent(){ return ''; }
}

class wr3text_footnote extends WikiTag {
    public $beginTag='$$';
    public $endTag='$$';

    public function getContent(){
       return ' ('.$this->contents[0].')';
   }
}

// ===================================== déclaration des différents bloc wiki

/**
 * traite les signes de types liste
 */
class wr3text_list extends WikiRendererBloc {
   public $type='list';
   protected $regexp="/^\s*([\*#-]+)(.*)/";
   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }
}


/**
 * traite les signes de types table
 */
class wr3text_table extends WikiRendererBloc {
   public $type='table';
   protected $regexp="/^\s*\| ?(.*)/";
   protected $_openTag="--------------------------------------------";
   protected $_closeTag="--------------------------------------------\n";

   protected $_colcount=0;

   public function open(){
      $this->_colcount=0;
      return $this->_openTag;
   }


   public function getRenderedLine(){

      $result=explode(' | ',trim($this->_detectMatch[1]));
      $str='';
      $t='';

      if((count($result) != $this->_colcount) && ($this->_colcount!=0))
         $t="--------------------------------------------\n";
      $this->_colcount=count($result);

      for($i=0; $i < $this->_colcount; $i++){
         $str.= $this->_renderInlineTag($result[$i])."\t| ";
      }
      $str=$t."| ".$str;

      return $str;
   }

}

/**
 * traite les signes de types hr
 */
class wr3text_hr extends WikiRendererBloc {

   public $type='hr';
   protected $regexp='/^\s*={4,} *$/';
   protected $_closeNow=true;

   public function getRenderedLine(){
      return "=======================================================\n";
   }

}

/**
 * traite les signes de types titre
 */
class wr3text_title extends WikiRendererBloc {
   public $type='title';
   protected $regexp="/^\s*(\!{1,3})(.*)/";
   protected $_closeNow=true;

   protected $_minlevel=3;
   /**
    * indique le sens dans lequel il faut interpreter le nombre de signe de titre
    * true -> ! = titre , !! = sous titre, !!! = sous-sous-titre
    * false-> !!! = titre , !! = sous titre, ! = sous-sous-titre
    */
   protected $_order=false;

   public function getRenderedLine(){
      if($this->_order){
         $repeat= 4- strlen($this->_detectMatch[1]);
         if($repeat <1) $repeat=1;
      }else
         $repeat= strlen($this->_detectMatch[1]);
      return str_repeat("\n",$repeat)."\t".$this->_renderInlineTag($this->_detectMatch[2])."\n";
   }
}

/**
 * traite les signes de type paragraphe
 */
class wr3text_p extends WikiRendererBloc {
   public $type='p';

   public function detect($string){
      if($string=='') return false;
      if(preg_match("/^\s*[\*#\-\!\| \t>;<=].*/",$string)) return false;
      $this->_detectMatch=array($string,$string);
      return true;
   }
}

/**
 * traite les signes de types pre (pour afficher du code..)
 */
class wr3text_pre extends WikiRendererBloc {

   public $type='pre';
   public function getRenderedLine(){
        return '   '.$this->_detectMatch;
   }

   public function detect($string){
        if($this->isOpen){
            if(preg_match("/(.*)<\/code>\s*$/",$string,$m)){
                $this->_detectMatch=$m[1];
                $this->isOpen=false;
            }else{
                $this->_detectMatch=$string;
            }
            return true;
        }else{
            if(preg_match('/^\s*<code>(.*)/',$string,$m)){
                if(preg_match('/(.*)<\/code>\s*$/',$m[1],$m2)){
                    $this->_closeNow = true;
                    $this->_detectMatch=$m2[1];
                }
                else {
                    $this->_closeNow = false;
                    $this->_detectMatch=$m[1];
                }
                return true;
            }else{
                return false;
            }
        }
    }

}


/**
 * traite les signes de type blockquote
 */
class wr3text_blockquote extends WikiRendererBloc {
   public $type='bq';
   protected $regexp="/^\s*(\>+)(.*)/";

   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

/**
 * traite les signes de type définitions
 */
class wr3text_definition extends WikiRendererBloc {

   public $type='dfn';
   protected $regexp="/^\s*;(.*) : (.*)/i";

   public function getRenderedLine(){
      $dt=$this->_renderInlineTag($this->_detectMatch[1]);
      $dd=$this->_renderInlineTag($this->_detectMatch[2]);
      return "$dt :\n\t$dd";
   }
}

?>