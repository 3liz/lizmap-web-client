<?php
/**
 * classic wikirenderer syntax to xhtml
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

class classicwr_to_xhtml  extends WikiRendererConfig  {

   public $defaultTextLineContainer = 'WikiHtmlTextLine';

   public $textLineContainers = array(
            'WikiHtmlTextLine'=>array( 'cwrxhtml_strong','cwrxhtml_em','cwrxhtml_code','cwrxhtml_q',
    'cwrxhtml_cite','cwrxhtml_acronym','cwrxhtml_link', 'cwrxhtml_image', 'cwrxhtml_anchor'));

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array('cwrxhtml_title', 'cwrxhtml_list', 'cwrxhtml_pre','cwrxhtml_hr',
                         'cwrxhtml_blockquote','cwrxhtml_definition','cwrxhtml_table', 'cwrxhtml_p');


   public $simpletags = array('%%%'=>'<br />', ':-)'=>'<img src="laugh.png" alt=":-)" />');

   public function processLink($url, $tagName='') {
      $label = $url;
      if(strlen($label) > 40)
         $label = substr($label,0,40).'(..)';
      if(strpos($url,'javascript:')!==false) { // for security reason
         $url='#';
      }
      return array($url, $label);
   }
}

// ===================================== déclarations des tags inlines

class cwrxhtml_strong extends WikiTagXhtml {
    protected $name='strong';
    public $beginTag='__';
    public $endTag='__';
}

class cwrxhtml_em extends WikiTagXhtml {
    protected $name='em';
    public $beginTag='\'\'';
    public $endTag='\'\'';
}

class cwrxhtml_code extends WikiTagXhtml {
    protected $name='code';
    public $beginTag='@@';
    public $endTag='@@';
}

class cwrxhtml_q extends WikiTagXhtml {
    protected $name='q';
    public $beginTag='^^';
    public $endTag='^^';
    protected $attribute=array('$$','lang','cite');
    public $separators=array('|');
}

class cwrxhtml_cite extends WikiTagXhtml {
    protected $name='cite';
    public $beginTag='{{';
    public $endTag='}}';
    protected $attribute=array('$$','title');
    public $separators=array('|');
}

class cwrxhtml_acronym extends WikiTagXhtml {
    protected $name='acronym';
    public $beginTag='??';
    public $endTag='??';
    protected $attribute=array('$$','title');
    public $separators=array('|');
}

class cwrxhtml_anchor extends WikiTagXhtml {
    protected $name='anchor';
    public $beginTag='~~';
    public $endTag='~~';
    protected $attribute=array('name');
    public $separators=array('|');
    public function getContent(){
        return '<a name="'.htmlspecialchars($this->wikiContentArr[0]).'"></a>';
    }
}


class cwrxhtml_link extends WikiTagXhtml {
    protected $name='a';
    public $beginTag='[';
    public $endTag=']';
    protected $attribute=array('$$','href','hreflang','title');
    public $separators=array('|');
    public function getContent(){
        $cntattr=count($this->attribute);
        $cnt=($this->separatorCount + 1 > $cntattr?$cntattr:$this->separatorCount+1);
        if($cnt == 1 ){
            list($href, $label) = $this->config->processLink($this->wikiContentArr[0], $this->name);
            return '<a href="'.htmlspecialchars($href).'">'.htmlspecialchars($label).'</a>';
        }else{
            list($href, $label) = $this->config->processLink($this->wikiContentArr[1], $this->name);
            $this->wikiContentArr[1] = $href;
            return parent::getContent();
        }
    }
}



class cwrxhtml_image extends WikiTagXhtml {
    protected $name='image';
    public $beginTag='((';
    public $endTag='))';
    protected $attribute=array('src','alt','align','longdesc');
    public $separators=array('|');

    public function getContent(){
        $contents = $this->wikiContentArr;
        $cnt=count($contents);
        $attribut='';
        if($cnt > 4) $cnt=4;
        switch($cnt){
            case 4:
                $attribut.=' longdesc="'.$contents[3].'"';
            case 3:
                if($contents[2]=='l' ||$contents[2]=='L' || $contents[2]=='g' || $contents[2]=='G')
                    $attribut.=' style="float:left;"';
                elseif($contents[2]=='r' ||$contents[2]=='R' || $contents[2]=='d' ||$contents[2]=='D')
                    $attribut.=' style="float:right;"';
            case 2:
                $attribut.=' alt="'.$contents[1].'"';
            case 1:
            default:
                list($href,$label) = $this->config->processLink($contents[0], $this->name);
                $attribut.=' src="'.htmlspecialchars($href).'"';
                if($cnt == 1) $attribut.=' alt=""';
        }
        return '<img'.$attribut.'/>';
    }
}



// ===================================== déclaration des différents bloc wiki

/**
 * traite les signes de types liste
 */
class cwrxhtml_list extends WikiRendererBloc {

   public $type='list';
   protected $_previousTag;
   protected $_firstItem;
   protected $_firstTagLen;
   protected $regexp="/^([\*#-]+)(.*)/";

   public function open(){
      $this->_previousTag = $this->_detectMatch[1];
      $this->_firstTagLen = strlen($this->_previousTag);
      $this->_firstItem=true;

      if(substr($this->_previousTag,-1,1) == '#')
         return "<ol>\n";
      else
         return "<ul>\n";
   }
   public function close(){
      $t=$this->_previousTag;
      $str='';

      for($i=strlen($t); $i >= $this->_firstTagLen; $i--){
          $str.=($t[$i-1]== '#'?"</li></ol>\n":"</li></ul>\n");
      }
      return $str;
   }

   public function getRenderedLine(){
      $t=$this->_previousTag;
      $d=strlen($t) - strlen($this->_detectMatch[1]);
      $str='';

      if( $d > 0 ){ // on remonte d'un ou plusieurs cran dans la hierarchie...
         $l=strlen($this->_detectMatch[1]);
         for($i=strlen($t); $i>$l; $i--){
            $str.=($t[$i-1]== '#'?"</li></ol>\n":"</li></ul>\n");
         }
         $str.="</li>\n<li>";
         $this->_previousTag=substr($this->_previousTag,0,-$d); // pour étre sur...

      }elseif( $d < 0 ){ // un niveau de plus
         $c=substr($this->_detectMatch[1],-1,1);
         $this->_previousTag.=$c;
         $str=($c == '#'?"<ol><li>":"<ul><li>");

      }else{
         $str=($this->_firstItem ? '<li>':"</li>\n<li>");
      }
      $this->_firstItem=false;
      return $str.$this->_renderInlineTag($this->_detectMatch[2]);

   }


}


/**
 * traite les signes de types table
 */
class cwrxhtml_table extends WikiRendererBloc {
   public $type='table';
   protected $regexp="/^\| ?(.*)/";
   protected $_openTag='<table border="1">';
   protected $_closeTag='</table>';

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
         $t='</table><table border="1">';
      $this->_colcount=count($result);

      for($i=0; $i < $this->_colcount; $i++){
         $str.='<td>'. $this->_renderInlineTag($result[$i]).'</td>';
      }
      $str=$t.'<tr>'.$str.'</tr>';

      return $str;
   }

}

/**
 * traite les signes de types hr
 */
class cwrxhtml_hr extends WikiRendererBloc {

   public $type='hr';
   protected $regexp='/^={4,} *$/';
   protected $_closeNow=true;

   public function getRenderedLine(){
      return '<hr />';
   }

}

/**
 * traite les signes de types titre
 */
class cwrxhtml_title extends WikiRendererBloc {
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
      if($this->_order)
         $hx= $this->_minlevel + strlen($this->_detectMatch[1])-1;
      else
         $hx= $this->_minlevel + 3-strlen($this->_detectMatch[1]);
      return '<h'.$hx.'>'.$this->_renderInlineTag($this->_detectMatch[2]).'</h'.$hx.'>';
   }
}

/**
 * traite les signes de type paragraphe
 */
class cwrxhtml_p extends WikiRendererBloc {
   public $type='p';
   protected $_openTag='<p>';
   protected $_closeTag='</p>';

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
      //return preg_match($this->regexp, $string, $this->_detectMatch);
   }
}

/**
 * traite les signes de types pre (pour afficher du code..)
 */
class cwrxhtml_pre extends WikiRendererBloc {

   public $type='pre';
   protected $regexp="/^\s(.*)/";
   protected $_openTag='<pre>';
   protected $_closeTag='</pre>';

   public function getRenderedLine(){
      return htmlspecialchars($this->_detectMatch[1]);
   }

}


/**
 * traite les signes de type blockquote
 */
class cwrxhtml_blockquote extends WikiRendererBloc {
   public $type='bq';
   protected $regexp="/^(\>+)(.*)/";

   public function open(){
      $this->_previousTag = $this->_detectMatch[1];
      $this->_firstTagLen = strlen($this->_previousTag);
      $this->_firstLine = true;
      return str_repeat('<blockquote>',$this->_firstTagLen).'<p>';
   }

   public function close(){
      return '</p>'.str_repeat('</blockquote>',strlen($this->_previousTag));
   }


   public function getRenderedLine(){

      $d=strlen($this->_previousTag) - strlen($this->_detectMatch[1]);
      $str='';

      if( $d > 0 ){ // on remonte d'un cran dans la hierarchie...
         $str='</p>'.str_repeat('</blockquote>',$d).'<p>';
         $this->_previousTag=$this->_detectMatch[1];
      }elseif( $d < 0 ){ // un niveau de plus
         $this->_previousTag=$this->_detectMatch[1];
         $str='</p>'.str_repeat('<blockquote>',-$d).'<p>';
      }else{
         if($this->_firstLine)
            $this->_firstLine=false;
         else
            $str='<br />';
      }
      return $str.$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

/**
 * traite les signes de type définitions
 */
class cwrxhtml_definition extends WikiRendererBloc {

   public $type='dfn';
   protected $regexp="/^;(.*) : (.*)/i";
   protected $_openTag='<dl>';
   protected $_closeTag='</dl>';

   public function getRenderedLine(){
      $dt=$this->_renderInlineTag($this->_detectMatch[1]);
      $dd=$this->_renderInlineTag($this->_detectMatch[2]);
      return "<dt>$dt</dt>\n<dd>$dd</dd>\n";
   }
}

?>