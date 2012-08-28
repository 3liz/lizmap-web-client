<?php
/**
 * dokuwiki syntax to docbook 4.3
 *
 * @package WikiRenderer
 * @subpackage rules
 * @author Laurent Jouanneau
 * @copyright 2008 Laurent Jouanneau
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

class dokuwiki_to_docbook  extends WikiRendererConfig  {


    public $defaultTextLineContainer = 'WikiHtmlTextLine';

    public $textLineContainers = array(
            'WikiHtmlTextLine'=>array( 'dkdbk_strong','dkdbk_emphasis','dkdbk_underlined','dkdbk_monospaced',
        'dkdbk_subscript', 'dkdbk_superscript', 'dkdbk_del', 'dkdbk_link', 'dkdbk_footnote', 'dkdbk_image',
        'dkdbk_nowiki_inline',),
            'dkdbk_table_row'=>array( 'dkdbk_strong','dkdbk_emphasis','dkdbk_underlined','dkdbk_monospaced',
        'dkdbk_subscript', 'dkdbk_superscript', 'dkdbk_del', 'dkdbk_link', 'dkdbk_footnote', 'dkdbk_image',
        'dkdbk_nowiki_inline',)
    );

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array('dkdbk_title', 'dkdbk_list', 'dkdbk_blockquote','dkdbk_table', 'dkdbk_pre',
         'dkdbk_syntaxhighlight', 'dkdbk_file', 'dkdbk_nowiki', 'dkdbk_html', 'dkdbk_php', 'dkdbk_para',
         'dkdbk_macro'
   );


   public $simpletags = array("\\\\"=>"");

   public $escapeChar = '';

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

class dkdbk_strong extends WikiTagXhtml {
    protected $name='emphasis';
    public $beginTag='**';
    public $endTag='**';
    protected $additionnalAttributes=array('role'=>'strong');
}

class dkdbk_emphasis extends WikiTagXhtml {
    protected $name='emphasis';
    public $beginTag='//';
    public $endTag='//';
}

class dkdbk_underlined extends WikiTagXhtml {
    protected $name='underlined';
    public $beginTag='__';
    public $endTag='__';
    public function getContent(){ return $this->contents[0];}
}

class dkdbk_monospaced extends WikiTagXhtml {
    protected $name='code';
    public $beginTag='\'\'';
    public $endTag='\'\'';
}


class dkdbk_subscript extends WikiTagXhtml {
    protected $name='subscript';
    public $beginTag='<sub>';
    public $endTag='</sub>';
}

class dkdbk_superscript extends WikiTagXhtml {
    protected $name='superscript';
    public $beginTag='<sup>';
    public $endTag='</sup>';
}

class dkdbk_del extends WikiTagXhtml {
    protected $name='del';
    public $beginTag='<del>';
    public $endTag='</del>';
    public function getContent(){ return '';}
}

class dkdbk_link extends WikiTagXhtml {
    protected $name='ulink';
    public $beginTag='[[';
    public $endTag=']]';
    protected $attribute=array('href','$$');
    public $separators=array('|');

    public function getContent(){
        $cntattr=count($this->attribute);
        $cnt=($this->separatorCount + 1 > $cntattr?$cntattr:$this->separatorCount+1);
        list($href,$label) = $this->config->processLink($this->wikiContentArr[0], $this->name);

        if($cnt == 1 ){
            $label = htmlspecialchars($label);
        } else {
            $label = $this->contents[1];
        }
        
        if(preg_match("/^\#(.+)$/", $href, $m))
            return '<link linkterm="'.htmlspecialchars(trim($m[1])).'">'.$label.'</link>';
        else
            return '<ulink url="'.htmlspecialchars(trim($href)).'">'.$label.'</ulink>';
    }
}

class dkdbk_footnote extends WikiTagXhtml {
    protected $name='footnote';
    public $beginTag='((';
    public $endTag='))';
    public function getContent(){ return '<footnote><para>'.$this->contents[0].'</para></footnote>';}
}


class dkdbk_nowiki_inline extends WikiTagXhtml {
    protected $name='nowiki';
    public $beginTag='<nowiki>';
    public $endTag='</nowiki>';
    public function getContent(){
        return '<phrase>'.htmlspecialchars($this->wikiContentArr[0], ENT_NOQUOTES).'</phrase>';
    }
}


class dkdbk_image extends WikiTagXhtml {
    protected $name='image';
    public $beginTag='{{';
    public $endTag='}}';
    protected $attribute=array('fileref','title');
    public $separators=array('|');

    public function getContent(){
        $contents = $this->wikiContentArr;

        if(count($contents) == 1) {
            $href = $contents[0];
            $title = '';
        } else {
            $href = $contents[0];
            $title = $contents[1];
        }

        $align='';
        $width='';
        $height='';

        $m= array('','','','','','','','');
        if (preg_match("/^(\s*)([^\s\?]+)(\?(\d+)(x(\d+))?)?(\s*)$/", $href, $m)) {
            if($m[1] != '' && $m[7] != ''){
                $align='center';
            } elseif($m[1] != ''){
                $align='right';
            } elseif($m[7] != ''){
                $align='left';
            }
            if($m[3]) {
                $width=$height=$m[4];
                if($m[5])
                   $height=$m[6];
            }
            $href= $m[2];
        }
        list($href, $label) = $this->config->processLink($href, $this->name);
        $tag = '<inlinemediaobject><imageobject><imagedata fileref="'.$href.'"';
        if($width != '')
            $tag.=' contentwidth="'.$width.'px"';
        if($height != '')
            $tag.=' contentdepth="'.$height.'px"';
        if($align != '')
            $tag.=' align="'.$align.'"';

        $tag .='/></imageobject>';
        if($title != '') 
                $tag.='<textobject><phrase>'.htmlspecialchars($title).'</phrase></textobject>';

        return $tag.'</inlinemediaobject>';
    }
}



// ===================================== blocs

/**
 * traite les signes de types liste
 */
class dkdbk_list extends WikiRendererBloc {

    public $type='list';
    protected $_stack=array();
    protected $_firstTagLen;
    protected $regexp="/^(\s{2,})([\*\-])(.*)/";
    protected $_firstItem = true;

    public function open(){
        $this->_stack[] = array(strlen($this->_detectMatch[1]) ,  $this->_detectMatch[2]);
        $this->_firstTagLen = strlen($this->_detectMatch[1]);
        $this->_firstItem = true;
        if($this->_detectMatch[2] == '-')
            return "<orderedlist>\n";
        else
            return "<itemizedlist>\n";
   }

   public function close(){
        $str='';

        for($i=count($this->_stack)-1; $i >=0; $i--){
            if($this->_stack[$i][0] < $this->_firstTagLen) break;

            $str.=($this->_stack[$i][1]== '-'?"</listitem></orderedlist>\n":"</listitem></itemizedlist>\n");
            array_pop($this->_stack);
        }
        return $str;
   }

    public function getRenderedLine(){
        $t=end($this->_stack);
        $newLen = strlen($this->_detectMatch[1]);
        $d=$t[0] - $newLen;
        $str='';

        if( $d < 0 ){ // un niveau de plus
            $this->_stack[] = array($newLen ,  $this->_detectMatch[2]);
            $str=($this->_detectMatch[2] == '-'?"<orderedlist><listitem>":"<itemizedlist><listitem>");

        } else {
            if( $d > 0 ){ // on remonte d'un ou plusieurs cran dans la hierarchie...
                for($i=count($this->_stack)-1; $i >=0; $i--){
                    if($this->_stack[$i][0] <= $newLen){
                        break;
                    } else {
                        $str.=($this->_stack[$i][1]== '-'?"</listitem></orderedlist>\n":"</listitem></itemizedlist>\n");
                    }
                    array_pop($this->_stack);
                }
                if(count($this->_stack) == 0) {
                    $this->_firstTagLen = $newLen;
                    $this->_firstItem = true;
                    $t = array($newLen,   $this->_detectMatch[2]);
                    $this->_stack[] = $t;
                    if($t[1] == '-')
                        $str .= "<orderedlist>\n";
                    else
                        $str .= "<itemizedlist>\n";
                } else {
                    $t=end($this->_stack);
                }

            }

            if($t[1] != $this->_detectMatch[2]) {
                if(!$this->_firstItem)
                    $str .='</listitem>';

                if($t[1] == '-')
                    $str .= "<orderedlist>\n<listitem>";
                else
                    $str .= "<itemizedlist>\n<listitem>";
                array_pop($this->_stack);
                $this->_stack[] = array($newLen ,  $this->_detectMatch[2]);
            } else {
                if($this->_firstItem)
                    $str.="<listitem>";
                else
                    $str.="</listitem>\n<listitem>";
            }

        }
        $this->_firstItem = false;
        return $str.$this->_renderInlineTag(trim($this->_detectMatch[3]));

    }
}



/**
 * traite les signes de types titre
 */
class dkdbk_title extends WikiRendererBloc {
    public $type='title';
    protected $regexp="/^\s*(\={1,6})([^=]*)(\={1,6})\s*$/";
    protected $_closeNow=true;

    public function getRenderedLine(){
        $level = strlen($this->_detectMatch[1]);

        $conf = $this->engine->getConfig();

        $output='';
        if(count($conf->sectionLevel)) {
            $last = end($conf->sectionLevel);
            if($last < $level) {
                while($last = end($conf->sectionLevel) && $last <= $level) {
                    $output.= '</section>';
                    array_pop($conf->sectionLevel);
                }
            }else if($last > $level) {

            }else{
                array_pop($conf->sectionLevel);
                $output.= '</section>';
            }
        }

        $conf->sectionLevel[] = $level;
        return $output.'<section><title>'.$this->_renderInlineTag(trim($this->_detectMatch[2])).'</title>';
    }
}

/**
 * traite les signes de type paragraphe
 */
class dkdbk_para extends WikiRendererBloc {
    public $type='para';
    protected $_openTag='<para>';
    protected $_closeTag='</para>';

    public function detect($string){
        if($string=='') return false;
        if (preg_match("/^\s+[\*\-\=\|\^>;<=~]/",$string))
            return false;
        if(preg_match("/^\s*([^\*\-\=\|\^>;<=~].*)/",$string, $m)) {
            $this->_detectMatch=array($m[1],$m[1]);
            return true;
        }
        return false;
    }
}



/**
 * traite les signes de type blockquote
 */
class dkdbk_blockquote extends WikiRendererBloc {
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
 *
 */
class dkdbk_table_row extends WikiTag {
    public $isTextLineTag=true;
    protected $attribute=array('$$');
    protected $checkWikiWordIn=array('$$');

    public $separators=array('|','^');

    protected $columns = array('');

    protected function _doEscape($string){
        return htmlspecialchars($string, ENT_NOQUOTES);
    }

    /**
    * called by the inline parser, when it found a separator
    */
    public function addSeparator($token){
        $this->wikiContent.= $this->wikiContentArr[$this->separatorCount];
        $this->separatorCount++;
        $this->currentSeparator = $token;
        $this->wikiContent.= $token;
        $this->contents[$this->separatorCount]='';
        $this->wikiContentArr[$this->separatorCount]='';
        $this->columns[$this->separatorCount]=$token;
    }

    public function isCurrentSeparator($token){
        return ($token == '|' || $token == '^');
    }

    public function isOtherTagAllowed() {
        return true;
    }

    public function getBogusContent(){
        $c=$this->beginTag;
        $m= count($this->contents)-1;
        $s= count($this->separators);
        foreach($this->contents as $k=>$v){
            $c.=$this->columns[$k].$v;
        }
        return $c;
    }

    public function getContent(){
        $c = "<tr>\n";
        $col ='';
        $colnum =0;
        $colspan = 0;

        $last = count($this->contents) -1;
        foreach( $this->contents as $k=>$content) {

            if($k == 0) continue; // we ignore first content (which is before the first separator
            if($k == $last)  break; // we ignore the last content (which is after the last separator

            if($content == '') {
                if($col == '' && $k > 0) { // if bad syntax on first col
                     $c.='<td></td>';
                } else 
                    $colspan++;
            } else {
                if($col !='')
                    $c.= $this->addCol($colnum, $col, $colspan);
                $colnum = $k;
                $col = $content;
            }
        }
        $c.= $this->addCol($colnum, $col, $colspan);
        return $c."\n</tr>\n";
    }

    protected function addCol($num, $content, $colspan) {
        if($this->columns[$num] == '^')
            $t = 'th';
        else
            $t = 'td';

        $align='';
        $l = 0;
        $r = 0;
        if (preg_match("/^(\s+)/", $content, $m)) {
            $l = strlen($m[1]);
        }
        if (preg_match("/(\s+)$/", $content, $m)) {
            $r = strlen($m[1]);
        }
        if(trim($content) == '') {
            $l=$r=0;
        }

        if($l==0 && $r > 2) {
            $align=' align="left"';
        }else if($r==0 && $l > 2) {
            $align=' align="right"';
        }else if($l > 2 && $l==$r) {
            $align=' align="center"';
        }

        if($colspan) {
            return '<'.$t.' colspan="'.($colspan+1).'"'.$align.'>'.$content.'</'.$t.'>';
        } else {
            return '<'.$t.$align.'>'.$content.'</'.$t.'>';
        }
    }

}

/**
 * traite les signes de types table
 */
class dkdbk_table extends WikiRendererBloc {
    public $type='table';
    protected $regexp="/^\s*(\||\^)(.*)/";
    protected $_openTag='<table>';
    protected $_closeTag='</table>';

    protected $_colcount=0;

    public function open(){
        $this->engine->getConfig()->defaultTextLineContainer = 'dkdbk_table_row';
        return $this->_openTag;
    }

    public function close(){
        $this->engine->getConfig()->defaultTextLineContainer = 'WikiHtmlTextLine';
        return $this->_closeTag;
    }

    public function getRenderedLine(){
        return $this->engine->inlineParser->parse($this->_detectMatch[1].$this->_detectMatch[2]);
    }

}


class dkdbk_syntaxhighlight extends WikiRendererBloc {

    public $type='syntaxhighlight';
    protected $_openTag='<programlisting>';
    protected $_closeTag='</programlisting>';
    protected $isOpen = false;
    protected $dktag='code';

   public function open(){
      $this->isOpen = true;
      return $this->_openTag;
   }

   public function close(){
      $this->isOpen=false;
      return $this->_closeTag;
   }

    public function getRenderedLine(){
        return htmlspecialchars($this->_detectMatch, ENT_NOQUOTES);
    }

    public function detect($string){
        if($this->isOpen){
            if(preg_match('/(.*)<\/'.$this->dktag.'>\s*$/',$string,$m)){
                $this->_detectMatch=$m[1];
                $this->isOpen=false;
            }else{
                $this->_detectMatch=$string;
            }
            return true;

        }else{
            if(preg_match('/^\s*<'.$this->dktag.'( \w+)?>(.*)/',$string,$m)){
                if(preg_match('/(.*)<\/'.$this->dktag.'>\s*$/',$m[2],$m2)){
                    $this->_closeNow = true;
                    $this->_detectMatch=$m2[1];
                }
                else {
                    $this->_closeNow = false;
                    $this->_detectMatch=$m[2];
                }
                return true;
            }else{
                return false;
            }
        }
    }
}

class dkdbk_file extends dkdbk_syntaxhighlight {
    public $type='syntaxhighlight';
    protected $_openTag='<literallayout>';
    protected $_closeTag='</literallayout>';
    protected $dktag='file';
}

class dkdbk_nowiki extends dkdbk_syntaxhighlight {
    public $type='syntaxhighlight';
    protected $_openTag='<para>';
    protected $_closeTag='</para>';
    protected $dktag='nowiki';
}

class dkdbk_pre extends WikiRendererBloc {
    public $type='pre';
    protected $_openTag='<literallayout>';
    protected $_closeTag='</literallayout>';

    public function detect($string){
        if($string=='') return false;
        if(preg_match("/^(\s{2,}[^\s\*\-\=\|\^>;<=~].*)/",$string)) {
            $this->_detectMatch=array($string,$string);
            return true;
        }
        return false;
    }
}


class dkdbk_html extends WikiRendererBloc {

    public $type='html';
    protected $isOpen = false;
    protected $dktag='html';

    public function open(){
        $this->isOpen = true;
        return '';
    }

   public function close(){
      $this->isOpen=false;
      return '';
   }

    public function getRenderedLine(){
        return '';
    }

    public function detect($string){
        if($this->isOpen){
            if(preg_match('/(.*)<\/'.$this->dktag.'>\s*$/',$string,$m)){
                $this->isOpen=false;
            }
            return true;
        }else{
            if(preg_match('/^\s*<'.$this->dktag.'>(.*)/',$string,$m)){
                if(preg_match('/(.*)<\/'.$this->dktag.'>\s*$/',$string,$m)){
                    $this->_closeNow = true;
                }
                else {
                    $this->_closeNow = false;
                }
                return true;
            }else{
                return false;
            }
        }
    }
}

class dkdbk_php extends dkdbk_html {
    protected $dktag='php';
}



class dkdbk_macro extends WikiRendererBloc {
    public $type='macro';
    protected $regexp="/^\s*~~[^~]*~~\s*$/";
    protected $_closeNow=true;

    public function getRenderedLine(){
        return '';
    }
}



/**
 * definition list
 */
class dkdbk_definition extends WikiRendererBloc {

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



