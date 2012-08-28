<?php
/**
 * wikirenderer3 (wr3) syntax to xhtml
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

class wr3_to_xhtml  extends WikiRendererConfig  {

   public $defaultTextLineContainer = 'WikiHtmlTextLine';

   public $textLineContainers = array('WikiHtmlTextLine'=> array( 'wr3xhtml_strong','wr3xhtml_em','wr3xhtml_code','wr3xhtml_q',
    'wr3xhtml_cite','wr3xhtml_acronym','wr3xhtml_link', 'wr3xhtml_image',
    'wr3xhtml_anchor', 'wr3xhtml_footnote'));

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array('wr3xhtml_title', 'wr3xhtml_list', 'wr3xhtml_pre','wr3xhtml_hr',
                         'wr3xhtml_blockquote','wr3xhtml_definition','wr3xhtml_table', 'wr3xhtml_p');


   public $simpletags = array('%%%'=>'<br />');


   // la syntaxe wr3 contient la possibilité de mettre des notes de bas de page
   // celles-ci seront stockées ici, avant leur incorporation é la fin du texte.
   public $footnotes = array();
   public $footnotesId='';
   public $footnotesTemplate = '<div class="footnotes"><h4>Notes</h4>%s</div>';

    /**
    * methode invoquée avant le parsing
    */
   public function onStart($texte){
        $this->footnotesId = rand(0,30000);
        $this->footnotes = array(); // on remet é zero les footnotes
        return $texte;
    }

   /**
    * methode invoquée aprés le parsing
    */
    public function onParse($finalTexte){
        // on rajoute les notes de bas de pages.
        if(count($this->footnotes)){
            $footnotes = implode("\n",$this->footnotes);
            $finalTexte .= str_replace('%s', $footnotes, $this->footnotesTemplate);
        }
        return $finalTexte;
    }

     public function processLink($url, $tagName='') {
        $label = $url;
        if(strlen($label) > 40)
            $label = substr($label,0,40).'(..)';
  
        if(strpos($url,'javascript:')!==false) // for security reason
            $url='#';
        return array($url, $label);
    }
}

// ===================================== déclarations des tags inlines

class wr3xhtml_strong extends WikiTagXhtml {
    protected $name='strong';
    public $beginTag='__';
    public $endTag='__';
}

class wr3xhtml_em extends WikiTagXhtml {
    protected $name='em';
    public $beginTag='\'\'';
    public $endTag='\'\'';
}

class wr3xhtml_code extends WikiTagXhtml {
    protected $name='code';
    public $beginTag='@@';
    public $endTag='@@';

    public function getContent(){
        $code = $this->wikiContentArr[0];
        return '<code>'.htmlspecialchars($code).'</code>';
    }

    public function isOtherTagAllowed() {
        return false;
    }

}

class wr3xhtml_q extends WikiTagXhtml {
    protected $name='q';
    public $beginTag='^^';
    public $endTag='^^';
    protected $attribute=array('$$','lang','cite');
    public $separators=array('|');
}

class wr3xhtml_cite extends WikiTagXhtml {
    protected $name='cite';
    public $beginTag='{{';
    public $endTag='}}';
    protected $attribute=array('$$','title');
    public $separators=array('|');
}

class wr3xhtml_acronym extends WikiTagXhtml {
    protected $name='acronym';
    public $beginTag='??';
    public $endTag='??';
    protected $attribute=array('$$','title');
    public $separators=array('|');
}

class wr3xhtml_anchor extends WikiTagXhtml {
    protected $name='anchor';
    public $beginTag='~~';
    public $endTag='~~';
    protected $attribute=array('name');
    public $separators=array('|');
    public function getContent(){
        return '<a name="'.htmlspecialchars($this->wikiContentArr[0]).'"></a>';
    }
}


class wr3xhtml_link extends WikiTagXhtml {
    protected $name='a';
    public $beginTag='[[';
    public $endTag=']]';
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



class wr3xhtml_image extends WikiTagXhtml {
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
               list($href, $label) = $this->config->processLink($contents[0], $this->name);
                $attribut.=' src="'.htmlspecialchars($href).'"';
                if($cnt == 1) $attribut.=' alt=""';
        }
        return '<img'.$attribut.'/>';
    }
}


class wr3xhtml_footnote extends WikiTagXhtml {
    protected $name='footnote';
    public $beginTag='$$';
    public $endTag='$$';

    public function getContent(){
        $number = count($this->config->footnotes) + 1;
        $id = 'footnote-'.$this->config->footnotesId.'-'.$number;
        $this->config->footnotes[] = "<p>[<a href=\"#rev-$id\" name=\"$id\" id=\"$id\">$number</a>] ".$this->contents[0].'</p>';

        return "<span class=\"footnote-ref\">[<a href=\"#$id\" name=\"rev-$id\" id=\"rev-$id\">$number</a>]</span>";
   }
}

// ===================================== déclaration des différents bloc wiki

/**
 * traite les signes de types liste
 */
class wr3xhtml_list extends WikiRendererBloc {

   public $type='list';
   protected $_previousTag;
   protected $_firstItem;
   protected $_firstTagLen;
   protected $regexp="/^\s*([\*#-]+)(.*)/";

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
class wr3xhtml_table extends WikiRendererBloc {
   public $type='table';
   protected $regexp="/^\s*\| ?(.*)/";
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
class wr3xhtml_hr extends WikiRendererBloc {

   public $type='hr';
   protected $regexp='/^\s*={4,} *$/';
   protected $_closeNow=true;

   public function getRenderedLine(){
      return '<hr />';
   }

}

/**
 * traite les signes de types titre
 */
class wr3xhtml_title extends WikiRendererBloc {
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
class wr3xhtml_p extends WikiRendererBloc {
   public $type='p';
   protected $_openTag='<p>';
   protected $_closeTag='</p>';

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
class wr3xhtml_pre extends WikiRendererBloc {

    public $type='pre';
    protected $_openTag='<pre>';
    protected $_closeTag='</pre>';
    protected $isOpen = false;


   public function open(){
      $this->isOpen = true;
      return $this->_openTag;
   }

   public function close(){
      $this->isOpen=false;
      return $this->_closeTag;
   }

    public function getRenderedLine(){
        return htmlspecialchars($this->_detectMatch);
    }

    public function detect($string){
        if($this->isOpen){
            if(preg_match('/(.*)<\/code>\s*$/',$string,$m)){
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
class wr3xhtml_blockquote extends WikiRendererBloc {
   public $type='bq';
   protected $regexp="/^\s*(\>+)(.*)/";

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
class wr3xhtml_definition extends WikiRendererBloc {

   public $type='dfn';
   protected $regexp="/^\s*;(.*) : (.*)/i";
   protected $_openTag='<dl>';
   protected $_closeTag='</dl>';

   public function getRenderedLine(){
      $dt=$this->_renderInlineTag($this->_detectMatch[1]);
      $dd=$this->_renderInlineTag($this->_detectMatch[2]);
      return "<dt>$dt</dt>\n<dd>$dd</dd>\n";
   }
}

?>