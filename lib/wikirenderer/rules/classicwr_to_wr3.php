<?php
/**
 * classic wikirenderer syntax to Wikirenderer 3 syntax
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

class classicwr_to_wr3  extends WikiRendererConfig {

   public $defaultTextLineContainer = 'WikiTextLine';

   public $textLineContainers = array(
           'WikiTextLine'=>array( 'cwrwr3_strong','cwrwr3_em','cwrwr3_code','cwrwr3_q',
              'cwrwr3_cite','cwrwr3_acronym','cwrwr3_link', 'cwrwr3_image', 'cwrwr3_anchor'));

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array('cwrwr3_title', 'cwrwr3_list', 'cwrwr3_pre','cwrwr3_hr',
                         'cwrwr3_blockquote','cwrwr3_definition','cwrwr3_table', 'cwrwr3_p');


   public $simpletags = array('%%%'=>"\n");

}

// ===================================== déclarations des tags inlines

class cwrwr3_strong extends WikiTag {
    public $beginTag='__';
    public $endTag='__';
    public function getContent(){ return '__'.$this->contents[0].'__';}
}

class cwrwr3_em extends WikiTag {
    public $beginTag='\'\'';
    public $endTag='\'\'';
    public function getContent(){ return '\'\''.$this->contents[0].'\'\'';}
}

class cwrwr3_code extends WikiTag {
    public $beginTag='@@';
    public $endTag='@@';
    public function getContent(){ return '@@'.$this->contents[0].'@@';}
}

class cwrwr3_q extends WikiTag {
    public $beginTag='^^';
    public $endTag='^^';
    protected $attribute=array('$$','lang','cite');
    public $separators=array('|');
    public function getContent(){
        if($this->separatorCount == 0)
            return '^^'.$this->contents[0].'^^';
        elseif($this->separatorCount == 1)
            return '^^'.$this->contents[0].'|'.$this->wikiContentArr[1].'^^';
        else
            return '^^'.$this->contents[0].'|'.$this->wikiContentArr[1].'|'.$this->wikiContentArr[2].'^^';
    }
}

class cwrwr3_cite extends WikiTag {
    public $beginTag='{{';
    public $endTag='}}';
    protected $attribute=array('$$','title');
    public $separators=array('|');

    public function getContent(){
        if($this->separatorCount == 0)
            return '{{'.$this->contents[0].'}}';
        else
            return '{{'.$this->contents[0].'|'.$this->wikiContentArr[1].'}}';
    }

}

class cwrwr3_acronym extends WikiTag {
    public $beginTag='??';
    public $endTag='??';
    protected $attribute=array('$$','title');
    public $separators=array('|');
    public function getContent(){
        if($this->separatorCount == 0)
            return '??'.$this->contents[0].'??';
        else
            return '??'.$this->contents[0].'|'.$this->wikiContentArr[1].'??';
    }
}

class cwrwr3_anchor extends WikiTag {
    public $beginTag='~~';
    public $endTag='~~';
    protected $attribute=array('name');
    public $separators=array('|');
    public function getContent(){ return '~~'.$this->wikiContentArr[0].'~~'; }
}


class cwrwr3_link extends WikiTag {
    public $beginTag='[';
    public $endTag=']';
    protected $attribute=array('$$','href','hreflang','title');
    public $separators=array('|');
    public function getContent(){
        if($this->separatorCount == 0)
            return '[['.$this->contents[0].']]';
        elseif($this->separatorCount == 1)
            return '[['.$this->contents[0].'|'.$this->wikiContentArr[1].']]';
        elseif($this->separatorCount == 2)
            return '[['.$this->contents[0].'|'.$this->wikiContentArr[1].'|'.$this->wikiContentArr[2].']]';
        else
            return '[['.$this->contents[0].'|'.$this->wikiContentArr[1].'|'.$this->wikiContentArr[2].'|'.$this->wikiContentArr[3].']]';
    }

}



class cwrwr3_image extends WikiTag {
    public $beginTag='((';
    public $endTag='))';
    protected $attribute=array('src','alt','align','longdesc');
    public $separators=array('|');

    public function getContent(){
        if($this->separatorCount == 0)
            return '(('.$this->wikiContentArr[0].'))';
        elseif($this->separatorCount == 1)
            return '(('.$this->wikiContentArr[0].'|'.$this->wikiContentArr[1].'))';
        elseif($this->separatorCount == 2)
            return '(('.$this->wikiContentArr[0].'|'.$this->wikiContentArr[1].'|'.$this->wikiContentArr[2].'))';
        else
            return '(('.$this->wikiContentArr[0].'|'.$this->wikiContentArr[1].'|'.$this->wikiContentArr[2].'|'.$this->wikiContentArr[3].'))';
    }
}

// ===================================== déclaration des différents bloc wiki

class WrWr3Bloc extends WikiRendererBloc {
   public function getRenderedLine(){
      return $this->_detectMatch[1];
   }
}

/**
 * traite les signes de types liste
 */
class cwrwr3_list extends WikiRendererBloc {
   public $type='list';
   protected $regexp="/^([\*#-]+)(.*)/";

   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }
}


/**
 * traite les signes de types table
 */
class cwrwr3_table extends WrWr3Bloc {
   public $type='table';
   protected $regexp="/^(\| ?.*)/";
}

/**
 * traite les signes de types hr
 */
class cwrwr3_hr extends WrWr3Bloc {

   public $type='hr';
   protected $regexp='/^(={4,}) *$/';
   protected $_closeNow=true;
}

/**
 * traite les signes de types titre
 */
class cwrwr3_title extends WikiRendererBloc {
   public $type='title';
   protected $regexp="/^(\!{1,3})(.*)/";
   protected $_closeNow=true;
   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

/**
 * traite les signes de type paragraphe
 */
class cwrwr3_p extends WikiRendererBloc {
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
   public function getRenderedLine(){
      return $this->_renderInlineTag($this->_detectMatch[1]);
   }
}

/**
 * traite les signes de types pre (pour afficher du code..)
 */
class cwrwr3_pre extends WrWr3Bloc {

   public $type='pre';
   protected $regexp="/^(\s.*)/";
   protected $_openTag="<code>\n";
   protected $_closeTag="\n</code>";
}


/**
 * traite les signes de type blockquote
 */
class cwrwr3_blockquote extends WikiRendererBloc {
   public $type='bq';
   protected $regexp="/^(\>+)(.*)/";
   public function getRenderedLine(){
      return $this->_detectMatch[1].$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

/**
 * traite les signes de type définitions
 */
class cwrwr3_definition extends WikiRendererBloc {

   public $type='dfn';
   protected $regexp="/^;(.*) : (.*)/i";
   public function getRenderedLine(){
      return ';'.$this->_renderInlineTag($this->_detectMatch[1]).' : '.$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

?>