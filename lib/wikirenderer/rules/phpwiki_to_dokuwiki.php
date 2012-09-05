<?php
/**
 * phpwiki syntax to dokuwiki syntax
 *
 * @package WikiRenderer
 * @subpackage rules
 * @author Laurent Jouanneau
 * @copyright 2009 Laurent Jouanneau
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

class phpwiki_to_dokuwiki  extends WikiRendererConfig {

    public $defaultTextLineContainer = 'PhpWikiDkTextLine';
  
    public $textLineContainers = array(
        'PhpWikiDkTextLine'=>array( 'pwdk_strong','pwdk_em', 'pwdk_nolink2', 'pwdk_nolink1', 'pwdk_link'),
        'pwdk_table_row'=>array( 'pwdk_strong','pwdk_em', 'pwdk_nolink2', 'pwdk_nolink1', 'pwdk_link'),
        'pwdk_pre_textLine'=>array( 'pwdk_nostrong','pwdk_nolink2', 'pwdk_nolink1')
    );
  
    public $bloctags = array('pwdk_title', 'pwdk_list', 'pwdk_pre', 'pwdk_hr',
                          'pwdk_blockquote', 'pwdk_note', 'pwdk_plugin','pwdk_table', 'pwdk_p');
  
    public $simpletags = array('%%%'=>"\n");
  
    public $footnotes = array();
    
    public $rowspan = array();

    function __construct() {
        $this->checkWikiWordFunction = array($this, 'transformWikiWord');
    }

    public $wikiWordBaseUrl = '';
    public $enableLinkOnWikiWord = true;
    public function transformWikiWord($ww){
        $result=array();
        foreach($ww as $w){
            if ($w[0] == '!')
                $result[]=substr($w,1);
            elseif($this->enableLinkOnWikiWord) {
              if ($this->wikiWordBaseUrl)
                $result[]='[['.$this->wikiWordBaseUrl.$w.'|'.$w.']]';
              else
                $result[]='[['.$w.']]';
            }
            else
                $result[]=$w;
        }
        return $result;
    }
    
    /**
     * called before the parsing
     */
    public function onStart($texte){
         $this->footnotes = array();
         return $texte;
    }
  
    /**
     * called after the parsing
     */
    public function onParse($finalTexte){
        foreach($this->footnotes as $id=>$text) {
          if ($text)
            $finalTexte = str_replace($id, '(('.$text.'))', $finalTexte);  
        }
        return $finalTexte;
    }

}

class PhpWikiTag extends WikiTag {
    protected function _doEscape($string){
        return $string;
    }

    protected function _findWikiWord($string){
/*echo "STR=$string <br>";
            $arr = debug_backtrace();
            $messageLog="\ttrace:";
            foreach($arr as $k=>$t){
                $messageLog.="\n\t$k\t".(isset($t['class'])?$t['class'].$t['type']:'').$t['function']."()\t";
                $messageLog.=(isset($t['file'])?$t['file']:'[php]').' : '.(isset($t['line'])?$t['line']:'');
            }
            $messageLog.="\n";
  echo "<pre>$messageLog</pre>";
*/
/*$t = array (
                0 => array (
                        0 => array (
                                0 => 'http://ipsum.dolor',
                                1 => 6,
                                ),
                        1 => array (
                                0 => '',
                                1 => 6,
                                ),
                        2 => array (
                                0 => 'http://ipsum.dolor',
                                1 => 6,
                                ),
                        ),
        )
    */
        if(preg_match_all('/(!?)([a-z]+\:(?:\/\/)?\w+[^\s]*)/u', $string, $m, PREG_SET_ORDER |PREG_OFFSET_CAPTURE)){
            $str ='';
            $begin = 0;

            foreach($m as $match) {
                $len = ($match[0][1])-$begin;
                $str.= parent::_findWikiWord(substr($string, $begin, $len));
                $begin = $match[0][1] + strlen($match[0][0]);
                if(preg_match('![^\w\\/]$!', substr($match[0][0],-1,1)) ) {
                  $begin--;
                  $match[2][0] = substr($match[2][0],0,-1);
                }
                if ($match[1][0] !='') {
                  $str.= $match[2][0];
                }
                else {
                  $str.="[[".$match[2][0]."]]";
                }
            }
            if($begin < strlen($string)) {
                $str.= parent::_findWikiWord(substr($string, $begin));
            }
            return $str;
        }
        else return parent::_findWikiWord($string);
    }
}



class PhpWikiDkTextLine extends PhpWikiTag {
    public $isTextLineTag=true;
}




// ===================================== inlines tags

class pwdk_strong extends PhpWikiTag {
    public $beginTag='__';
    public $endTag='__';
    public function getContent(){ return '**'.$this->contents[0].'**';}
}

class pwdk_em extends PhpWikiTag {
    public $beginTag='\'\'';
    public $endTag='\'\'';
    public function getContent(){ return '//'.$this->contents[0].'//';}
}

/*

Liens:
  CollerLesMotsEnMajuscule
  [lien vers une autre page]
  [http://www.exemple.com]
  [libelle|http://www.exemple.com]
  http://...
  ftp://...
  mailto://
  [1], [2], ... au dela de la première colonne : lien vers une note de bas de page
           à la première colonne: la note elle même 
  [phpwiki:nomdelapage?action=x&autreparam]
      action: browse, info, diff, search, edit, zip, dumpserial, loadserial,
              remove, lock, unlock, login, logout, setprefs, save


Pour empêcher des liens
  !NePasLier
  !http://truc.com
  !!NePasLier
  [[[[texte]
  [[texte]
  [[!http://www.exemple.com]
  [[libelle|!http://www.exemple.com]


Affichage des images
    URL se terminant par .png, .gif, ou .jpg, encadré par des crochets
    [http://phpwiki.sourceforge.net/demo/themes/default/images/png.png]
*/
class pwdk_link extends PhpWikiTag {
    public $beginTag='[';
    public $endTag=']';
    protected $attribute=array('$$','href');
    protected $checkWikiWordIn=array();
    public $separators=array('|');
    public function getContent(){
        if($this->separatorCount == 0){
            if($this->isImage($this->wikiContentArr[0]))
              return '{{'.$this->wikiContentArr[0].'}}';
            else {
              return '[['.$this->transformWikiLink($this->contents[0]).']]';
            }
        }
        else {
            if($this->isImage($this->wikiContentArr[1]))
                return '{{'.$this->wikiContentArr[1].'|'.$this->contents[0].'}}';
            else
                return '[['.$this->transformWikiLink($this->wikiContentArr[1], $this->contents[0]).']]';
        }
    }
    
    function transformWikiLink($href, $label='') {
        $href = trim($href);
        if ($href == '') return '';
        if(preg_match("!^([a-z]+)\:(.+)!", trim($href), $m)) {
          if ($m[1] == 'phpwiki') {
            $href = str_replace(array('action=browse', 'action=info', 'action=diff', 'action=search',
                                      'action=edit', 'action=zip', 'action=dumpserial', 'action=loadserial',
                                      'action=remove', 'action=lock', 'action=unlock', 'action=login',
                                      'action=logout', 'action=setprefs', 'action=save'),
                                array('', 'action=default:details', 'action=diff','','action=edit:index',
                                      '','','','action=delete:index','','','','','',''), $m[2]);
          }
          if ($label!='')
            return $href.'|'.$label;
          else
            return $href;
        }

        if($href[0] == '#' || $href[0] == '/') {
          if ($label!='')
            return $href.'|'.$label;
          else
            return $href;
        }
        if(is_numeric($href)) {
          $href = '!PWNOTE'.$href.'!';
          if (!isset($this->config->footnotes['[['.$href.']]']))
            $this->config->footnotes['[['.$href.']]'] = '';
          return $href;
        }
        //$newhref = $this->config->wikiWordBaseUrl.$href;
        $newhref = str_replace("/",":",$href);
        if ($label!='')
          return $newhref.'|'.$label;
        elseif( $href != $newhref)
          return $newhref.'|'.$href;
        else
          return $newhref;
    }
    
    function isImage($href) {
      return preg_match('/\.(png|gif|jpg|jpeg)$/', $href);
    }
}

class pwdk_nolink1 extends PhpWikiTag {
    public $beginTag='[[';
    public $endTag=']';
    protected $attribute=array('$$','$$','$$');
    public $separators=array('|');
    public function getContent(){
        return '['.implode('|',$this->contents).']';
    }

    public function getBogusContent(){
        $c='[';
        $m= count($this->contents)-1;
        $s= count($this->separators);
        foreach($this->contents as $k=>$v){
            $c.=$v;
            if($k< $m){
                if($k < $s)
                    $c.=$this->separators[$k];
                else
                    $c.=end($this->separators);
            }
        }

        return $c;
    }
}

class pwdk_nolink2 extends PhpWikiTag {
    public $beginTag='[[[[';
    public $endTag=']';
    protected $attribute=array('$$','$$','$$');
    public $separators=array('|');
    public function getContent(){
        return '[['.implode('|',$this->contents).']';
    }
}

class pwdk_nostrong extends PhpWikiTag {
    public $beginTag='__';
    public $endTag='__';
    protected $attribute=array('$$');
    public $separators=array();
    public function getContent(){
        return $this->contents[0];
    }
}

// ===================================== déclaration des différents bloc wiki

class PwDkBloc extends WikiRendererBloc {

}

/** 
Listes
  * item
  ** item
  *#* item
 */
class pwdk_list extends PwDkBloc {
   public $type='list';
   protected $regexp="/^([\*#]+)(.*)/";

   protected $_previousTag;
   protected $_firstItem;
   protected $_firstTagLen;
   
   protected $indentation = '';

   public function open(){
      $this->_previousTag = $this->_detectMatch[1];
      $this->_firstTagLen = strlen($this->_previousTag);
      $this->_firstItem=true;
      $this->indentationCount = 0;
      return "";
   }
   public function close(){
      return '';
   }

   public function getRenderedLine(){
      $t = $this->_previousTag;
      $d = strlen($t) - strlen($this->_detectMatch[1]);

      $c = substr($this->_detectMatch[1],-1,1);
      $l = strlen($this->_detectMatch[1]);
      $str = str_repeat("   ", $l).$c;

      if( $d > 0 ){ // on remonte d'un ou plusieurs cran dans la hierarchie...
         $this->_previousTag=substr($this->_previousTag,0,-$d); // pour etre sur...
      }elseif( $d < 0 ){ // un niveau de plus
         $this->_previousTag .= $c;
      }
      $this->_firstItem=false;
      return $str.$this->_renderInlineTag($this->_detectMatch[2]);
   }
}



/**
 * 
 * HR
 *  ---- Quatre tirets ou plus créent une règle horizontale
 */
class pwdk_hr extends PwDkBloc {

  public $type='hr';
  protected $regexp='/^(-{4,})\s*$/';
  protected $_closeNow=true;
  public function getRenderedLine(){
      return "";
  }
}

/**
 *
 * '!' en début de ligne produit un petit titre
 * '!!' en début de ligne produit un titre moyen
 * '!!!' en début de ligne produit un gros titre
 */
class pwdk_title extends PwDkBloc {
  public $type='title';
  protected $regexp="/^(\!{1,3})(.*)/";
  protected $_closeNow=true;

  public function getRenderedLine(){
     
    $tag = str_repeat('=', 4-strlen($this->_detectMatch[1]));
    
    return $tag.' '.$this->_renderInlineTag($this->_detectMatch[2]).' '.$tag;
  }
}

/**
 * traite les signes de type paragraphe
 * Paragraphes
  - pas d'indentation
  - lignes vide comme séparateurs

 */
class pwdk_p extends PwDkBloc {
   public $type='p';

   public function detect($string){
      if($string=='') return false;
      if(preg_match('/^(<\?plugin|-{4,})/',$string)) return false;
      $c=$string[0];
      if(strpos("*#!| \t>;" ,$c) === false){
        $this->_detectMatch = array($string,$string);
        return true;
      }else{
        return false;
      }
   }
}



class pwdk_note extends PwDkBloc {
   public $type='note';
   protected $isOpen = false;
   
   protected $noteid = '';
   
   public function open(){
      $this->isOpen = true;
      return '';
   }

   public function close(){
      $this->isOpen=false;
      $c = $this->engine->getConfig();
      $c->footnotes[$this->noteid] = $this->_renderInlineTag($c->footnotes[$this->noteid] );
      return '';
   }
   public function detect($string){
      if ($this->isOpen) {
        if(trim($string)=='' || preg_match('/^(<\?plugin|-{4,})/',$string)) {
          $this->isOpen=false;
          return false;
        }
        $c=$string[0];
        if(strpos("*#!| \t>;" ,$c) === false){
          $this->_detectMatch = $string;
          return true;
        }else{
          $this->isOpen = false;
          return false;
        }
      }
      else {
        if (preg_match('/^\[([0-9]+)\](.+)$/',$string, $m)) {
          $this->noteid = '[[!PWNOTE'.$m[1].'!]]';
          if(!isset($this->engine->getConfig()->footnotes[$this->noteid]))
            $this->engine->getConfig()->footnotes[$this->noteid] = '';
          $this->_detectMatch = $m[2];
          return true;
        }else{
          return false;
        }
      }
   }
   public function getRenderedLine(){
      $this->engine->getConfig()->footnotes[$this->noteid] .= $this->_detectMatch;
      return '';
   }
}


class pwdk_pre_textLine extends PhpWikiTag {
    public $isTextLineTag=true;
    protected $attribute=array('$$');
    protected $checkWikiWordIn=array('$$');

    public $separators = array();
}


/**
 * Texte preformaté
 * indentation avec des espaces
 */
class pwdk_pre extends PwDkBloc {

  public $type='pre';
  protected $regexp="/^(\s+.*)/";
  protected $_openTag="<code>";
  protected $_closeTag="</code>";


  public function open(){
      $this->engine->getConfig()->defaultTextLineContainer = 'pwdk_pre_textLine';
      $this->engine->getConfig()->enableLinkOnWikiWord = false;
      return parent::open();
  }

  public function close(){
      $this->engine->getConfig()->defaultTextLineContainer = 'PhpWikiDkTextLine';
      $this->engine->getConfig()->enableLinkOnWikiWord = true;
      return parent::close();
  }

  public function getRenderedLine(){
      return $this->engine->inlineParser->parse($this->_detectMatch[1]);
  }


}


/**
 * Paragraphes indentés <BLOCKQUOTE>
 * ;: ceci est un bloc de texte indenté
 */
class pwdk_blockquote extends PwDkBloc {
  public $type='bq';
  protected $regexp="/^;:(.*)/";
  public function getRenderedLine(){
    return '>'.$this->_renderInlineTag($this->_detectMatch[1]);
  }
}


/**
 * Plugins
 * <?plugin nom  param=value?>
 */
class pwdk_plugin extends PwDkBloc {
  protected $_closeNow=true;
  public $type='plugin';
  protected $regexp='/^<\?plugin\s+([^\?\>]+)\?\>\s*$/i';
  public function getRenderedLine(){
    if (preg_match('/^(\w+)(\s+(.*))?$/', $this->_detectMatch[1], $m)) {
      if (isset($m[3]) && $m[3]) {
        return '~~'.$m[1].':'.$m[3].'~~';
      }
      return '~~'.$m[1].'~~';
    }
    else return '~~PHPWIKI '.$this->_detectMatch[1].'~~';
  }
}



/**
 *
 */
class pwdk_table_row extends PhpWikiTag {
    public $isTextLineTag=true;
    protected $attribute=array('$$');
    protected $checkWikiWordIn=array('$$');

    public $separators = array('|', '>', '<', '^', 'v');

    protected $columns = array('');

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
        return in_array($token, $this->separators);
    }

    public function isOtherTagAllowed() {
        return true;
    }

    public function getBogusContent(){
        $c = $this->beginTag;
        foreach ($this->contents as $k=>$v) {
            $c .= $this->columns[$k].$v;
        }
        return $c;
    }

    protected $colspan='';
    public function getContent(){
        $c = "";
        $currentCell = '';
        $currentCol = '';
        $this->colNum = 0;
        $this->colspan = '';
        $this->previousColNum = 0;
        foreach ($this->columns as $k=>$col) {
          if($col == '|') {
            if ($currentCell) {
              $c.= $this->addCol($currentCell, $currentCol);
              $currentCol = '';
              $c.=$col;
            }
            else {
              if ($this->colNum > 0)
                $this->colspan.=$col;
              else
                $c.=$col;
            }
            $this->colNum ++;
            $currentCell = $this->contents[$k];
          }
          else {
            if ($k > 0 && $this->contents[$k-1] != '') {
              $currentCell .= $col.$this->contents[$k];
            }
            else {
              $currentCol = $col;
              $currentCell = $this->contents[$k];
            }
          }
        }

        if ($currentCell) {
          $c .= $this->addCol($currentCell, $currentCol);
        }
        $this->colNum++;
        if (!$this->config->firstRow) {
          $fc = true;
          while(isset($this->config->rowspan[$this->colNum]) && $this->config->rowspan[$this->colNum]) {
            if ($fc) {
              $c .= '|';
              $fc = false;
            }
            else
              $c .= ' |';
            $this->config->rowspan[$this->colNum] = false;
            $this->colNum++;
          }
          $c .= ($fc?'|':' |');
        }
        else
          $c .= '|';
        $this->config->firstRow = false;
        return $c;
    }
    
    protected $previousColNum=0;
    protected $colNum = 0;
    protected function addCol($content, $type) {
      $c = '';
      if (!$this->config->firstRow) {
        while(isset($this->config->rowspan[$this->colNum]) && $this->config->rowspan[$this->colNum]) {
          $c .= ' |';
          $this->config->rowspan[$this->colNum] = false;
          $this->colNum++;
        }
      }
      $this->previousColNum = $this->colNum;
      $this->config->rowspan[$this->colNum] = false;
      $left='';
      $right='';
      switch($type) {
        case '<':
          $left=' ';
          $right = '   ';
          break;
        case '>':
          $left = '   ';
          $right=' ';
          break;
        case '^':
          $left = '   ';
          $right = '   ';
          break;
        case 'v':
          $this->config->rowspan[$this->colNum] = true;
        case '':
          $left = ' ';
          $right = ' ';
          break;
      }
      $c.=$left.trim($content).$right.$this->colspan;
      $this->colspan = '';
      return $c;
    }
}



/**
 * Table

||  __Nom__               |v __Coût__   |v __Notes__
| __Prénom__   | __Nom de famille__
|> Jeff       |< Dairiki   |^  Pas cher     |< Pas valable
|> Marco      |< Polo      | Encore moins cher     |< Pas disponible

__||__ colspan
__v__ rowspan
__>__ une colonne cadrée à droite,
__<__ une colonne cadrée à gauche
__^__ une colonne centrée

 */
class pwdk_table extends PwDkBloc {
    public $type='table';
    protected $regexp="/^(\| ?.*)/";

    protected $_colcount=0;

    public function open(){
        $this->engine->getConfig()->defaultTextLineContainer = 'pwdk_table_row';
        $this->engine->getConfig()->rowspan = array();
        $this->engine->getConfig()->firstRow = true;
        return '';
    }

    public function close(){
        $this->engine->getConfig()->defaultTextLineContainer = 'PhpWikiDkTextLine';
        return '';
    }

    public function getRenderedLine(){
        return $this->engine->inlineParser->parse($this->_detectMatch[1]);
    }

}
