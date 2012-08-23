<?php
/**
 * classic wikirenderer syntax to plain text
 *
 * @package WikiRenderer
 * @subpackage rules
 * @author Laurent Jouanneau 
 * @copyright 2003-2006 Laurent Jouanneau
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

class classicwr_to_text   extends WikiRendererConfig {

   public $defaultTextLineContainer = 'WikiTextLine';

   public $textLineContainers = array(
          'WikiTextLine'=>array( 'cwrtext_strong','cwrtext_em','cwrtext_code','cwrtext_q',
              'cwrtext_cite','cwrtext_acronym','cwrtext_link', 'cwrtext_image', 'cwrtext_anchor')
    );

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array('cwrtext_title', 'cwrtext_list', 'cwrtext_pre','cwrtext_hr',
                         'cwrtext_blockquote','cwrtext_definition','cwrtext_table', 'cwrtext_p');


   public $simpletags = array('%%%'=>"\n");


}

// ===================================== déclarations des tags inlines

class cwrtext_strong extends WikiTag {
    protected $name ='strong';
    public $beginTag='__';
    public $endTag='__';
}

class cwrtext_em extends WikiTag {
    protected $name ='em';
    public $beginTag='\'\'';
    public $endTag='\'\'';
}

class cwrtext_code extends WikiTag {
    protected $name ='code';
    public $beginTag='@@';
    public $endTag='@@';
    function getContent(){ return '['.$this->contents[0].']';}
}

class cwrtext_q extends WikiTag {
    protected $name ='q';
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

class cwrtext_cite extends WikiTag {
    protected $name ='cite';
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

class cwrtext_acronym extends WikiTag {
    protected $name ='acronym';
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

class cwrtext_anchor extends WikiTag {
    protected $name ='anchor';
    public $beginTag='~~';
    public $endTag='~~';
    protected $attribute=array('name');
    public $separators=array('|');
    public function getContent(){ return ''; }
}


class cwrtext_link extends WikiTag {
    protected $name ='link';
    public $beginTag='[';
    public $endTag=']';
    protected $attribute=array('$$','href','hreflang','title');
    public $separators=array('|');
    public function getContent(){
        $cntattr=count($this->attribute);
        $cnt=($this->separatorCount + 1 > $cntattr?$cntattr:$this->separatorCount+1);
        if($cnt == 1 ){
            return $this->wikiContentArr[0];
        }else{
            list($href, $label) = $this->config->processLink($this->wikiContentArr[1], $this->name);
            return $this->wikiContentArr[0].' ('.$href.')';
        }
    }
}



class cwrtext_image extends WikiTag {
    protected $name ='image';
    public $beginTag='((';
    public $endTag='))';
    protected $attribute=array('src','alt','align','longdesc');
    public $separators=array('|');

    public function getContent(){ return ''; }
}



// ===================================== déclaration des différents bloc wiki

/**
 * traite les signes de types liste
 */
class cwrtext_list extends WikiRendererBloc {
   public $type='list';
   protected $regexp="/^([\*#-]+)(.*)/";
   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }
}


/**
 * traite les signes de types table
 */
class cwrtext_table extends WikiRendererBloc {
   public $type='table';
   protected $regexp="/^\| ?(.*)/";
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
class cwrtext_hr extends WikiRendererBloc {

   public $type='hr';
   protected $regexp='/^={4,} *$/';
   protected $_closeNow=true;

   public function getRenderedLine(){
      return "=======================================================\n";
   }

}

/**
 * traite les signes de types titre
 */
class cwrtext_title extends WikiRendererBloc {
   public $type='title';
   protected $regexp="/^(\!{1,3})(.*)/";
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
class cwrtext_p extends WikiRendererBloc {
   public $type='p';

   public function detect($string){
      if($string=='') return false;
      if(preg_match('/^={4,} *$/',$string)) return false;
      $c=$string[0];
      if(strpos("*#-!| \t>;" ,$c) === false){
        $this->_detectMatch=array($string,$string);
        return true;
      }else{
        return false;
      }
   }
}

/**
 * traite les signes de types pre (pour afficher du code..)
 */
class cwrtext_pre extends WikiRendererBloc {

   public $type='pre';
   protected $regexp="/^(\s)(.*)/";

   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }

}


/**
 * traite les signes de type blockquote
 */
class cwrtext_blockquote extends WikiRendererBloc {
   public $type='bq';
   protected $regexp="/^(\>+)(.*)/";

   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

/**
 * traite les signes de type définitions
 */
class cwrtext_definition extends WikiRendererBloc {

   public $type='dfn';
   protected $regexp="/^;(.*) : (.*)/i";

   public function getRenderedLine(){
      $dt=$this->_renderInlineTag($this->_detectMatch[1]);
      $dd=$this->_renderInlineTag($this->_detectMatch[2]);
      return "$dt :\n\t$dd";
   }
}

?>