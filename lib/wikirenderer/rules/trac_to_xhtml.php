<?php
/**
 * trac syntax to xhtml
 *
 * @package WikiRenderer
 * @subpackage rules
 * @author Laurent Jouanneau
 * @copyright 2006-2008 Laurent Jouanneau
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

class trac_to_xhtml  extends WikiRendererConfig  {

    public $defaultTextLineContainer = 'tracWikiHtmlTextLine';

    public $textLineContainers = array(
                'tracWikiHtmlTextLine'=> array( 'tracxhtml_strongem', 'tracxhtml_strong','tracxhtml_emphasis',
        'tracxhtml_underlined', 'tracxhtml_monospaced', 'tracxhtml_monospaced2', 'tracxhtml_strikethrough',
        'tracxhtml_subscript', 'tracxhtml_superscript', 'tracxhtml_macro', 'tracxhtml_link',
        ),
                'tracxhtml_table_row'=> array( 'tracxhtml_strongem', 'tracxhtml_strong','tracxhtml_emphasis',
        'tracxhtml_underlined', 'tracxhtml_monospaced', 'tracxhtml_monospaced2', 'tracxhtml_strikethrough',
        'tracxhtml_subscript', 'tracxhtml_superscript', 'tracxhtml_macro', 'tracxhtml_link',
        ));

    /**
    * liste des balises de type bloc reconnus par WikiRenderer.
    */
    public $bloctags = array('tracxhtml_title', 'tracxhtml_list', 'tracxhtml_definition','tracxhtml_pre',
        'tracxhtml_blockquote', 'tracxhtml_blockquote2', 'tracxhtml_table','tracxhtml_image',
          'tracxhtml_para', 'tracxhtml_hr', 'tracxhtml_timestamp',
    );

    public $simpletags = array();

    public $escapeChar = '';

    public $sectionLevel= array();

    public $startHeaderNumber = 1; // top level header will be <h1> if you set to 1, <h2> if it is 2 etc..

    public $wikiWordBaseUrl = '/';
    public $linkBaseUrl = array(
        'ticket'=>'/ticket/',
        'report'=>'/report/',
        'changeset'=>'/changeset/',
        'log'=>'/log/',
        'wiki'=>'/wiki/',
        'milestone'=>'/milestone/',
        'source'=>'/browser/',
        'attachement'=>'/attachment/',
    );

    function __construct() {
        $this->checkWikiWordFunction = array($this, 'transformWikiWord');

    }

    public function transformWikiWord($ww){
        $result=array();
        foreach($ww as $w){
            if ($w[0] == '!')
                $result[]=substr($w,1);
            else
                $result[]='<a href="'.$this->wikiWordBaseUrl.$w.'">'.$w.'</a>';
        }
        return $result;
    }

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
        $finalTexte.= str_repeat('</div>', count($this->sectionLevel));
        return $finalTexte;
    }
}

class tracWikiHtmlTextLine extends WikiTag {
    public $isTextLineTag=true;
    protected $attribute=array('$$');
    protected $checkWikiWordIn=array('$$');

    protected function _doEscape($string){

        if(preg_match_all('/([a-z]+)\:([^\s]+)|#(\d+)|{(\d+)}/', $string, $m, PREG_SET_ORDER |PREG_OFFSET_CAPTURE)){
            $str ='';
            $begin = 0;

            foreach($m as $match) {
                $len = ($match[0][1])-$begin;
                $str.= htmlspecialchars(substr($string, $begin, $len));
                $begin = $match[0][1] + strlen($match[0][0]);

                switch($match[1][0]) {
                    case 'http': $str.= '<a href="'.$match[0][0].'">'.$match[0][0].'</a>'; break;
                    case '':
                        if($match[3][0] != '')
                            $str.= '<a href="'.$this->config->linkBaseUrl['ticket'].$match[3][0].'">#'.$match[3][0].'</a>';
                        else
                            $str.= '<a href="'.$this->config->linkBaseUrl['report'].$match[4][0].'">{'.$match[4][0].'}</a>';
                        break;
                    default:
                        if (isset($this->config->linkBaseUrl[$match[1][0]])) {
                            if($match[1][0] == 'wiki' || $match[1][0] == 'source')
                                $str.= '<a href="'.$this->config->linkBaseUrl[$match[1][0]].$match[2][0].'">'.$match[2][0].'</a>';
                            else
                                $str.= '<a href="'.$this->config->linkBaseUrl[$match[1][0]].$match[2][0].'">'.$match[1][0].' '.$match[2][0].'</a>';
                        }
                        else
                            $str.= htmlspecialchars($match[0][0]);
                }

            }
            if($begin < strlen($string))
                $str.= htmlspecialchars(substr($string, $begin));
            return $str;
        }
        else
            return htmlspecialchars($string);
    }
}



// ===================================== inline tags

class tracxhtml_strongem extends WikiTagXhtml {
    protected $name='strongem';
    public $beginTag="'''''";
    public $endTag="'''''";
    public function getContent(){ 
         return '<strong><em>'.$this->contents[0].'</em></strong>';
    }
}

class tracxhtml_strong extends WikiTagXhtml {
    protected $name='strong';
    public $beginTag="'''";
    public $endTag="'''";
}

class tracxhtml_emphasis extends WikiTagXhtml {
    protected $name='em';
    public $beginTag="''";
    public $endTag="''";
}

class tracxhtml_underlined extends WikiTagXhtml {
    protected $name='u';
    public $beginTag='__';
    public $endTag='__';
}

class tracxhtml_monospaced extends WikiTagXhtml {
    protected $name='code';
    public $beginTag='{{{';
    public $endTag='}}}';
}

class tracxhtml_monospaced2 extends WikiTagXhtml {
    protected $name='code';
    public $beginTag='`';
    public $endTag='`';
}

class tracxhtml_strikethrough extends WikiTagXhtml {
    protected $name='del';
    public $beginTag='~~';
    public $endTag='~~';
}

class tracxhtml_subscript extends WikiTagXhtml {
    protected $name='sub';
    public $beginTag=',,';
    public $endTag=',,';
}

class tracxhtml_superscript extends WikiTagXhtml {
    protected $name='sup';
    public $beginTag='^';
    public $endTag='^';
}

class tracxhtml_macro extends WikiTagXhtml {
    protected $name='sup';
    public $beginTag='[[';
    public $endTag=']]';
    public function getContent(){
        if (strtoupper ($this->contents[0]) == 'BR')
            return '<br />';
        else
            return '[['.$this->contents[0].']]';
    }
}

class tracxhtml_link extends WikiTagXhtml {
    protected $name='a';
    public $beginTag='[';
    public $endTag=']';
    protected $attribute=array('href','$$');
    public $separators=array(' ');

    public function getContent(){
        $cntattr=count($this->attribute);
        $cnt=($this->separatorCount + 1 > $cntattr?$cntattr:$this->separatorCount+1);
        $hasLabel = false;
        if($cnt == 1 ){
            $href = $this->wikiContentArr[0];
            $label = $href;
            if(strlen($label) > 40)
                $label=substr($label,0,40).'(..)';
            $label = htmlspecialchars($label);
        }
        else {
            $href = $this->wikiContentArr[0];
            $label = $this->contents[1];
            $hasLabel=true;
        }

        if(!preg_match('/^([a-z]+):(.+)/', $href, $m))
            return $this->getWikiContent();

        if($m[1] == 'http' || $m[1] == 'https' || $m[1] == 'ftp' || $m[1] == 'irc' || $m[1] == 'mailto') {
            return '<a href="'.htmlspecialchars(trim($href)).'">'.$label.'</a>';
        }

        if (isset($this->config->linkBaseUrl[$m[1]])) {
            if($hasLabel) 
                return '<a href="'.$this->config->linkBaseUrl[$m[1]].$m[2].'">'.$label.'</a>';
            else if($m[1] == 'wiki' || $m[1] == 'source')
                return '<a href="'.$this->config->linkBaseUrl[$m[1]].$m[2].'">'.$m[2].'</a>';
            else
                return '<a href="'.$this->config->linkBaseUrl[$m[1]].$m[2].'">'.$m[1].' '.$m[2].'</a>';
        }

        // all other protocols are forbidden for security reasons, (especially javascript:)
        return $this->getWikiContent();
    }

    public function addContent($wikiContent, $parsedContent=false){
        if($parsedContent === false){
            $parsedContent = $this->_doEscape($wikiContent);
            if(count( $this->checkWikiWordIn)
                && isset($this->attribute[$this->separatorCount])
                && in_array($this->attribute[$this->separatorCount], $this->checkWikiWordIn)){
                $parsedContent = $this->_findWikiWord($parsedContent);
            }
        }
        $this->contents[$this->separatorCount] .= $parsedContent;
        $this->wikiContentArr[$this->separatorCount] .= $wikiContent;
    }

    public function addSeparator($token){
        $this->currentSeparator = ' ';

        if($this->separatorCount < 1) {
            $this->separatorCount++;
            $this->wikiContent .= $this->wikiContentArr[0].' ';
            $this->contents[1]='';
            $this->wikiContentArr[1]='';
        }
        else {
            $this->contents[1].=' ';
            $this->wikiContentArr[1].=' ';
        }
    }
}

// ===================================== blocs

/**
 * traite les signes de types liste
 */
class tracxhtml_list extends WikiRendererBloc {

    public $type='list';
    protected $_stack=array();
    protected $_firstTagLen;
    protected $regexp="/^(\s*)(\*|1\.)(.*)/";
    protected $_firstItem = true;

    public function open(){
        $this->_stack[] = array(strlen($this->_detectMatch[1]) ,  $this->_detectMatch[2]);
        $this->_firstTagLen = strlen($this->_detectMatch[1]);
        $this->_firstItem = true;
        if($this->_detectMatch[2] == '*')
            return "<ul>\n";
        else
            return "<ol>\n";
   }

   public function close(){
        $str='';

        for($i=count($this->_stack)-1; $i >=0; $i--){
            if($this->_stack[$i][0] < $this->_firstTagLen) break;

            $str.=($this->_stack[$i][1]== '*'?"</li></ul>\n":"</li></ol>\n");
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
            $str=($this->_detectMatch[2] == '*'?"<ul><li>":"<ol><li>");

        } else {
            if( $d > 0 ){ // on remonte d'un ou plusieurs cran dans la hierarchie...
                for($i=count($this->_stack)-1; $i >=0; $i--){
                    if($this->_stack[$i][0] <= $newLen){
                        break;
                    } else {
                        $str.=($this->_stack[$i][1]== '*'?"</li></ul>\n":"</li></ol>\n");
                    }
                    array_pop($this->_stack);
                }
                if(count($this->_stack) == 0) {
                    $this->_firstTagLen = $newLen;
                    $this->_firstItem = true;
                    $t = array($newLen,   $this->_detectMatch[2]);
                    $this->_stack[] = $t;
                    if($t[1] == '*')
                        $str .= "<ul>\n";
                    else
                        $str .= "<ol>\n";
                } else {
                    $t=end($this->_stack);
                }

            }

            if($t[1] != $this->_detectMatch[2]) {
                if(!$this->_firstItem)
                    $str .='</li>';

                if($t[1] == '*')
                    $str .= "<ul>\n<li>";
                else
                    $str .= "<ol>\n<li>";
                array_pop($this->_stack);
                $this->_stack[] = array($newLen ,  $this->_detectMatch[2]);
            } else {
                if($this->_firstItem)
                    $str.="<li>";
                else
                    $str.="</li>\n<li>";
            }

        }
        $this->_firstItem = false;
        return $str.$this->_renderInlineTag(trim($this->_detectMatch[3]));
    }
}

/**
 * definition list
 */
class tracxhtml_definition extends WikiRendererBloc {

    public $type='dfn';
    protected $_openTag='<dl>';
    protected $_closeTag='</dl>';
    protected $isOpen = false;
    protected $indent = 0;
    protected $currentTag ='';

    public function open(){
       $this->isOpen = true;
       return $this->_openTag;
    }

    public function close(){
       $this->isOpen=false;
       return $this->_closeTag;
    }

    public function getRenderedLine(){
        return '<'.$this->currentTag.'>'.$this->_renderInlineTag($this->_detectMatch).'</'.$this->currentTag.'>';
    }

    public function detect($string){
        if($this->isOpen){
            if(preg_match('/^(\s*)([^:]+)(::)?(.*)/i',$string,$m)){
                if (isset($m[3]) && $m[3] != '') {
                    if(isset($m[4]) && $m[4] != '')
                        return false;
                    $this->_detectMatch=$m[2];
                    $this->currentTag = 'dt';
                    $this->indent = strlen($m[1]);
                }
                else {
                    if(strlen($m[1]) <= $this->indent) {
                        return false;
                    }
                    $this->_detectMatch = $m[2].(isset($m[4])?$m[4]:'');
                    $this->currentTag = 'dd';
                }
                return true;
            }
            else {
                return false;
            }
        }else{
            if(preg_match('/^(\s*)([^:]+)::/i',$string,$m)){
                $this->_detectMatch=$m[2];
                $this->currentTag = 'dt';
                $this->indent = strlen($m[1]);
                return true;
            }else{
                return false;
            }
        }
    }
}

/**
 * traite les signes de types titre
 *
 */
class tracxhtml_title extends WikiRendererBloc {
    public $type='title';
    protected $regexp="/^\s*(\={1,6})([^=]*)(\={1,6})\s*$/";
    protected $_closeNow=true;

    public function getRenderedLine(){
        $level = strlen($this->_detectMatch[1]);

        $conf = $this->engine->getConfig();

        $output='';
        if(count($conf->sectionLevel)) {
            $last = end($conf->sectionLevel);
            if($last > $level) {
                while($last = end($conf->sectionLevel) && $last >= $level) {
                    $output.= '</div>';
                    array_pop($conf->sectionLevel);
                }
            }else if($last < $level) {

            }else{
                array_pop($conf->sectionLevel);
                $output.= '</div>';
            }
        }

        $conf->sectionLevel[] = $level;
        $h = $conf->startHeaderNumber -1 + $level;
        if($h > 5) $h = 5;
        elseif($h < 1) $h = 1;
        return $output.'<div class="wr-section"><h'.$h.'>'.$this->_renderInlineTag(trim($this->_detectMatch[2])).'</h'.$h.'>';
    }
}

/**
 * traite les signes de type paragraphe
 */
class tracxhtml_para extends WikiRendererBloc {
    public $type='para';
    protected $_openTag='<p>';
    protected $_closeTag='</p>';

    public function detect($string){
        if($string=='') return false;
        if(preg_match("/^([^\s\*\1\=\-\|\^\{\>].*)/",$string, $m)) {
            $this->_detectMatch=array($m[1],$m[1]);
            return true;
        }
        return false;
    }
}

/**
 * traite les signes de type blockquote
 */
class tracxhtml_blockquote extends WikiRendererBloc {
    public $type='blockquote';
    protected $regexp="/^\s*(\>+)(.*)/";
    protected $_previousTag;
    protected $_firstLine =true;
    protected $_firstTagLen;
    
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
      }
      return $str.$this->_renderInlineTag($this->_detectMatch[2]);
   }
}

class tracxhtml_blockquote2 extends WikiRendererBloc {
    public $type='blockquote2';
    protected $regexp='/^(\s+)([^\s\>\*1\=\{\-\[].*)/';
    protected $_previousTag;
    protected $_restart = false;
    protected $_firstTagLen = 0;
    protected $_previousTagLen;

    public function open(){
        $this->_previousTag = $this->_detectMatch[1];
        $this->_previousTagLen = $this->_firstTagLen = strlen($this->_previousTag);
        return '<blockquote><p>';
    }

    public function close(){
       return '</p>'.str_repeat('</blockquote>',$this->_previousTagLen - $this->_firstTagLen+1);
    }

    public function getRenderedLine(){
        $str='';
        if($this->_restart) {
            $str = '</p>'.str_repeat('</blockquote>',$this->_previousTagLen - $this->_firstTagLen+1);
            $str .= '<blockquote><p>';
            $this->_previousTag = $this->_detectMatch[1];
            $this->_previousTagLen = $this->_firstTagLen = strlen($this->_previousTag);
            $this->_restart = false;
        }

        $d= strlen($this->_previousTag) - strlen($this->_detectMatch[1]);
 
        if( $d > 0 ){ // on remonte d'un cran dans la hierarchie...
           $str='</p>'.str_repeat('</blockquote>',$d).'<p>';
           $this->_previousTag = $this->_detectMatch[1];
           $this->_previousTagLen = strlen($this->_previousTag);
        }elseif( $d < 0 ){ // un niveau de plus
           $this->_previousTag = $this->_detectMatch[1];
           $this->_previousTagLen = strlen($this->_previousTag);
           $str='</p>'.str_repeat('<blockquote>',-$d).'<p>';
        }
       return $str.$this->_renderInlineTag($this->_detectMatch[2]);
    }

    public function detect($string){
        if(preg_match($this->regexp, $string, $this->_detectMatch)) {
            if( strlen($this->_detectMatch[1]) < $this->_firstTagLen) {
                $this->_restart = true;
            }
            return true;
        }
        return false;
    }
}




/**
 *
 */

class tracxhtml_table_row extends WikiTag {
    public $isTextLineTag=true;
    protected $attribute=array('$$');
    protected $checkWikiWordIn=array('$$');

    public $separators=array('||');

    protected $columns = array('');

    protected function _doEscape($string){
        return htmlspecialchars($string);
    }

    // called by the inline parser, when it found a separator
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
        return ($token == '||');
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
        if($colspan) {
            return '<td colspan="'.($colspan+1).'">'.$content.'</td>';
        } else {
            return '<td>'.$content.'</td>';
        }
    }

}

/**
 * traite les signes de types table
 */

class tracxhtml_table extends WikiRendererBloc {
    public $type='table';
    protected $regexp="/^\s*(\|\|.*)/";
    protected $_openTag='<table>';
    protected $_closeTag='</table>';

    protected $_colcount=0;

    public function open(){
        $this->engine->getConfig()->defaultTextLineContainer = 'tracxhtml_table_row';
        return $this->_openTag;
    }

    public function close(){
        $this->engine->getConfig()->defaultTextLineContainer = 'tracWikiHtmlTextLine';
        return $this->_closeTag;
    }

    public function getRenderedLine(){
        return $this->engine->inlineParser->parse($this->_detectMatch[1]);
    }

}


class tracxhtml_pre extends WikiRendererBloc {

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
            if(preg_match('/(.*)}}}\s*$/',$string,$m)){
                $this->_detectMatch=$m[1];
                $this->isOpen=false;
            }else{
                $this->_detectMatch=$string;
            }
            return true;

        }else{
            if(preg_match('/^\s*{{{(.*)/',$string,$m)){
                $this->_detectMatch=$m[1];
                return true;
            }else{
                return false;
            }
        }
    }
}



class tracxhtml_hr extends WikiRendererBloc {
   public $type='hr';
   protected $regexp='/^\s*-{3,}\s*$/';
   protected $_closeNow=true;

   public function getRenderedLine(){
      return '<hr />';
   }
}



/*

Macros :

[[Image]]
 [[Image(photo.jpg)]]                           # simplest
    [[Image(photo.jpg, 120px)]]                    # with size
    [[Image(photo.jpg, right)]]                    # aligned by keyword
    [[Image(photo.jpg, nolink)]]                   # without link to source
    [[Image(photo.jpg, align=right)]]
[[Timestamp]]
*/


class tracxhtml_image extends WikiRendererBloc {
    public $type='image';
    protected $regexp="/^\s+\[\[Image\(([^\]\)]*)\)\]\]\s*$/";
    protected $_closeNow=true;

    public function getRenderedLine(){
        $params = preg_split("/,/",$this->_detectMatch[1]);
        $file = trim(array_shift($params));
        $width = null;
        $nolink=false;
        $attrs = ' src="'.$file.'"';
        $hasAlt = false;
        foreach($params as $p) {
            $p=trim($p);
            if(in_array($p, array('right', 'left', 'top','bottom'))) {
                $attrs.=' align="'.$p.'"';
            }
            else if($p == 'nolink') {
                $nolink = true;
            }
            else if(preg_match('/^(\d+)(px|em|\%)?$/',$p)) {
                if($width === null) {
                    $width = $p;
                    $attrs.=' width="'.$p.'"';
                }
                else{
                    $attrs.=' height="'.$p.'"';
                }
            }
            else if(preg_match('/^(align|border|width|height|alt|title|longdesc|class|id)=(.*)$/', $p,$m)) {
                if($m[1]=='alt') $hasAlt = true;
                $attrs.=' '.$m[1].'="'.htmlspecialchars($m[2]).'"';
            }
        }
        if(!$hasAlt)
            $attrs.=' alt=""';
        if($nolink)
            return '<div><img'.$attrs.' /></div>';
        else
            return '<div><a href="'.$file.'"><img'.$attrs.' /></a></div>';
    }
}


class tracxhtml_timestamp extends WikiRendererBloc {
    public $type='timestamp';
    protected $regexp="/^\s+\[\[Timestamp\]\]\s*$/";
    protected $_closeNow=true;

    public function getRenderedLine(){
        return time();
    }
}



