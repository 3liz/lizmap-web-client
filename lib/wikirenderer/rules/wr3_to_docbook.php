<?php
/**
 * wikirenderer3 (wr3) syntax to docbook 4.3
 *
 * @package WikiRenderer
 * @subpackage rules
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

class wr3_to_docbook  extends WikiRendererConfig  {


   public $defaultTextLineContainer = 'WikiHtmlTextLine';

   public $textLineContainers = array(
            'WikiHtmlTextLine'=>array( 'wr3dbk_strong','wr3dbk_emphasis','wr3dbk_code','wr3dbk_q',
    'wr3dbk_cite','wr3dbk_acronym','wr3dbk_link', 'wr3dbk_image',
    'wr3dbk_anchor', 'wr3dbk_footnote')
    );

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array('wr3dbk_title', 'wr3dbk_list', 'wr3dbk_pre','wr3dbk_hr',
                         'wr3dbk_blockquote','wr3dbk_definition','wr3dbk_table', 'wr3dbk_p');


   public $simpletags = array('%%%'=>'<br />');

   public $sectionLevel= array();

    /**
    * called before the parsing
    */
   public function onStart($texte){
        $this->sectionLevel = array();
        return $texte;
    }

   /**
    * called after the parsing
    */
    public function onParse($finalTexte){
        $finalTexte.= str_repeat('</section>', count($this->sectionLevel));


        return $finalTexte;
    }
}

// ===================================== inline tags

class wr3dbk_strong extends WikiTagXhtml {
    protected $name='emphasis';
    public $beginTag='__';
    public $endTag='__';
    protected $additionnalAttributes=array('role'=>'strong');
}

class wr3dbk_emphasis extends WikiTagXhtml {
    protected $name='emphasis';
    public $beginTag='\'\'';
    public $endTag='\'\'';
}

class wr3dbk_code extends WikiTagXhtml {
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

class wr3dbk_q extends WikiTagXhtml {
    protected $name='quote';
    public $beginTag='^^';
    public $endTag='^^';
    protected $attribute=array('$$','lang','cite');
    protected $ignoreAttribute = array('cite');
    public $separators=array('|');
}

class wr3dbk_cite extends WikiTagXhtml {
    protected $name='cite';
    public $beginTag='{{';
    public $endTag='}}';
    protected $attribute=array('$$','title');
    public $separators=array('|');

    public function getContent(){ return $this->contents[0];}

}

class wr3dbk_acronym extends WikiTagXhtml {
    protected $name='acronym';
    public $beginTag='??';
    public $endTag='??';
    protected $attribute=array('$$','title');
    public $separators=array('|');
    protected $ignoreAttribute = array('title');
}

class wr3dbk_anchor extends WikiTagXhtml {
    protected $name='anchor';
    public $beginTag='~~';
    public $endTag='~~';
    protected $attribute=array('id');
    public $separators=array('|');
    public function getContent(){
        return '<anchor id="'.htmlspecialchars($this->wikiContentArr[0]).'"/>';
    }
}


class wr3dbk_link extends WikiTagXhtml {
    protected $name='ulink';
    public $beginTag='[[';
    public $endTag=']]';
    protected $attribute=array('$$','href','hreflang','title');
    public $separators=array('|');
    protected $ignoreAttribute = array('hreflang','title');
    public function getContent(){
        $cntattr=count($this->attribute);
        $cnt=($this->separatorCount + 1 > $cntattr?$cntattr:$this->separatorCount+1);
        if($cnt == 1 ){
            list($href, $label) = $this->config->processLink($this->wikiContentArr[0], $this->name);

            if(preg_match("/^\#(.+)$/", $href, $m))
                return '<link linkterm="'.htmlspecialchars($m[1]).'">'.htmlspecialchars($label).'</link>';
            else
                return '<ulink url="'.htmlspecialchars($href).'">'.htmlspecialchars($label).'</ulink>';

        }else{
            list($href, $label) = $this->config->processLink($this->wikiContentArr[1], $this->name);
            if(preg_match("/^\#(.+)$/", $href, $m))
                return '<link linkterm="'.htmlspecialchars($m[1]).'">'.$this->contents[0].'</link>';
            else
                return '<ulink url="'.htmlspecialchars($href).'">'.$this->contents[0].'</ulink>';
        }
    }
}



class wr3dbk_image extends WikiTagXhtml {
    protected $name='image';
    public $beginTag='((';
    public $endTag='))';
    protected $attribute=array('fileref','alt','align','longdesc');
    public $separators=array('|');

    public function getContent(){
        $contents = $this->wikiContentArr;
        $cnt=count($contents);
        $attribut='';
        if($cnt > 4) $cnt=4;
        $alt='';
        switch($cnt){
            case 4:
            case 3:
                if($contents[2]=='l' ||$contents[2]=='L' || $contents[2]=='g' || $contents[2]=='G')
                    $attribut.=' align="left"';
                elseif($contents[2]=='r' ||$contents[2]=='R' || $contents[2]=='d' ||$contents[2]=='D')
                    $attribut.=' align="right"';
            case 2:
                $alt='<textobject><phrase>'.$contents[1].'</phrase></textobject>';
            case 1:
            default:
               list($href, $label) = $this->config->processLink($contents[0], $this->name);
                $attribut.=' fileref="'.htmlspecialchars($href).'"';
        }

        return '<inlinemediaobject><imageobject><imagedata'.$attribut.'/></imageobject>'.$alt.'</inlinemediaobject>';
    }
}


class wr3dbk_footnote extends WikiTagXhtml {
    protected $name='footnote';
    public $beginTag='$$';
    public $endTag='$$';
    public function getContent(){ return '<footnote><para>'.$this->contents[0].'</para></footnote>';}
}

// ===================================== blocs

/**
 * traite les signes de types liste
 */
class wr3dbk_list extends WikiRendererBloc {

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
         return "<orderedlist>\n";
      else
         return "<itemizedlist>\n";
   }
   public function close(){
      $t=$this->_previousTag;
      $str='';

      for($i=strlen($t); $i >= $this->_firstTagLen; $i--){
          $str.=($t[$i-1]== '#'?"</listitem></orderedlist>\n":"</listitem></itemizedlist>\n");
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
            $str.=($t[$i-1]== '#'?"</listitem></orderedlist>\n":"</listitem></itemizedlist>\n");
         }
         $str.="</listitem>\n<listitem>";
         $this->_previousTag=substr($this->_previousTag,0,-$d); // pour �tre sur...

      }elseif( $d < 0 ){ // un niveau de plus
         $c=substr($this->_detectMatch[1],-1,1);
         $this->_previousTag.=$c;
         $str=($c == '#'?"<orderedlist><listitem>":"<itemizedlist><listitem>");

      }else{
         $str=($this->_firstItem ? '<listitem>':"</listitem>\n<listitem>");
      }
      $this->_firstItem=false;
      return $str.$this->_renderInlineTag($this->_detectMatch[2]);

   }


}


/**
 * traite les signes de types table
 */
class wr3dbk_table extends WikiRendererBloc {
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
class wr3dbk_hr extends WikiRendererBloc {

   public $type='hr';
   protected $regexp='/^\s*={4,} *$/';
   protected $_closeNow=true;

   public function getRenderedLine(){
      return '';
   }

}

/**
 * traite les signes de types titre
 */
class wr3dbk_title extends WikiRendererBloc {
    public $type='title';
    protected $regexp="/^\s*(\!{1,3})(.*)/";
    protected $_closeNow=true;

    /**
        * indique le sens dans lequel il faut interpreter le nombre de signe de titre
        * true -> ! = titre , !! = sous titre, !!! = sous-sous-titre
        * false-> !!! = titre , !! = sous titre, ! = sous-sous-titre
        */
    protected $_order=false;

    public function getRenderedLine(){
        $level = strlen($this->_detectMatch[1]);
        if(!$this->_order)
            $level = 4-$level;

        $conf = $this->engine->getConfig();

        $output='';
        if(count($conf->sectionLevel)) {
            $last = end($conf->sectionLevel);
            if($last > $level) {
                while($last = end($conf->sectionLevel) && $last >= $level) {
                    $output.= '</section>';
                    array_pop($conf->sectionLevel);
                }
            }else if($last < $level) {

            }else{
                array_pop($conf->sectionLevel);
                $output.= '</section>';
            }
        }

        $conf->sectionLevel[] = $level;
        return $output.'<section><title>'.$this->_renderInlineTag($this->_detectMatch[2]).'</title>';
    }
}

/**
 * traite les signes de type paragraphe
 */
class wr3dbk_p extends WikiRendererBloc {
   public $type='para';
   protected $_openTag='<para>';
   protected $_closeTag='</para>';

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
class wr3dbk_pre extends WikiRendererBloc {

    public $type='pre';
    protected $_openTag='<literallayout>';
    protected $_closeTag='</literallayout>';
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
class wr3dbk_blockquote extends WikiRendererBloc {
   public $type='bq';
   protected $regexp="/^\s*(\>+)(.*)/";

   public function open(){
      $this->_previousTag = $this->_detectMatch[1];
      $this->_firstTagLen = strlen($this->_previousTag);
      $this->_firstLine = true;
      return str_repeat('<blockquote>',$this->_firstTagLen).'<para>';
   }

   public function close(){
      return '</para>'.str_repeat('</blockquote>',strlen($this->_previousTag));
   }


   public function getRenderedLine(){

      $d=strlen($this->_previousTag) - strlen($this->_detectMatch[1]);
      $str='';

      if( $d > 0 ){ // on remonte d'un cran dans la hierarchie...
         $str='</para>'.str_repeat('</blockquote>',$d).'<para>';
         $this->_previousTag=$this->_detectMatch[1];
      }elseif( $d < 0 ){ // un niveau de plus
         $this->_previousTag=$this->_detectMatch[1];
         $str='</para>'.str_repeat('<blockquote>',-$d).'<para>';
      }else{
         if($this->_firstLine)
            $this->_firstLine=false;
      }
      return $str.$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

/**
 * definition list
 */
class wr3dbk_definition extends WikiRendererBloc {

   public $type='dfn';
   protected $regexp="/^\s*;(.*) : (.*)/i";
   protected $_openTag='<variablelist>';
   protected $_closeTag='</variablelist>';

   public function getRenderedLine(){
      $dt=$this->_renderInlineTag($this->_detectMatch[1]);
      $dd=$this->_renderInlineTag($this->_detectMatch[2]);
      return "<varlistentry><term>$dt</term>\n<listitem>$dd</listitem></varlistentry>\n";
   }
}

?>