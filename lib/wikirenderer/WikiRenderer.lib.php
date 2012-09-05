<?php
/**
 * Wikirenderer is a wiki text parser. It can transform a wiki text into xhtml or other formats
 * @package WikiRenderer
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
define('WIKIRENDERER_PATH', dirname(__FILE__).'/');
define('WIKIRENDERER_VERSION', '3.1.5');


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
 * base class to generate output from inline wiki tag
 *
 * this objects are driven by the wiki inline parser
 * @package WikiRenderer
 * @see WikiInlineParser
 */
abstract class WikiTag {
    protected $name ='';

    public $beginTag='';
    public $endTag='';
    public $isTextLineTag=false;
    /**
     * list of possible separators
     */
    public $separators=array();

    protected $attribute = array('$$');
    protected $checkWikiWordIn = array('$$');
    protected $contents = array('');
    /**
     * wiki content of each part of the tag
     */
    protected $wikiContentArr = array('');
    /**
     * wiki content of the full tag
     */
    protected $wikiContent='';
    protected $separatorCount=0;
    protected $currentSeparator=false;
    protected $checkWikiWordFunction=false;
    protected $config = null;

    /**
    * @param WikiRendererConfig $config
    */
    function __construct($config){
        $this->config = $config;
        $this->checkWikiWordFunction = $config->checkWikiWordFunction;
        if($config->checkWikiWordFunction === null) $this->checkWikiWordIn = array();
        if(count($this->separators)) $this->currentSeparator = $this->separators[0];
    }

    /**
    * called by the inline parser, when it found a new content
    * @param string $wikiContent   the original content in wiki syntax if $parsedContent is given, or a simple string if not
    * @param string $parsedContent the content already parsed (by an other wikitag object), when this wikitag contains other wikitags
    */
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

    /**
    * called by the inline parser, when it found a separator
    */
    public function addSeparator($token){
        $this->wikiContent.= $this->wikiContentArr[$this->separatorCount];
        $this->separatorCount++;
        if($this->separatorCount > count($this->separators))
            $this->currentSeparator = end($this->separators);
        else
            $this->currentSeparator = $this->separators[$this->separatorCount-1];
        $this->wikiContent .= $this->currentSeparator;
        $this->contents[$this->separatorCount]='';
        $this->wikiContentArr[$this->separatorCount]='';
    }

    /**
    * says if the given token is the current separator of the tag.
    *
    * The tag can support many separator
    * @return string the separator
    */
    public function isCurrentSeparator($token){
        return ($this->currentSeparator === $token);
    }

    /**
    * return the wiki content of the tag
    * @return string the content
    */
    public function getWikiContent(){
        return $this->beginTag.$this->wikiContent.$this->wikiContentArr[$this->separatorCount].$this->endTag;
    }

    /**
    * return the generated content of the tag
    * @return string the content
    */
    public function getContent(){ return $this->contents[0];}

    public function isOtherTagAllowed() {
        if (isset($this->attribute[$this->separatorCount]))
            return ($this->attribute[$this->separatorCount] == '$$');
        else
            return false;
    }

    /**
    * return the generated content of the tag
    * @return string the content
    */
    public function getBogusContent(){
        $c=$this->beginTag;
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

    /**
    * escape a simple string.
    */
    protected function _doEscape($string){
        return $string;
    }

    protected function _findWikiWord($string){
        if($this->checkWikiWordFunction !== null && preg_match_all("/(?:(?<=\b)|!)[A-Z]\p{Ll}+[A-Z0-9][\p{Ll}\p{Lu}0-9]*/u", $string, $matches)){
            $match = array_unique($matches[0]); // we must have a list without duplicated values, because of str_replace.
            if(is_array($this->checkWikiWordFunction)) {
                $o = $this->checkWikiWordFunction[0];
                $m = $this->checkWikiWordFunction[1];
                $result = $o->$m($match);
            } else {
                $fct=$this->checkWikiWordFunction;
                $result = $fct($match);
            }
            $string= str_replace($match, $result, $string);
        }
        return $string;
    }

}


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


class WikiTextLineContainer {
    public $tag = null;
    
    public $allowedTags = array();
    
    public $pattern = '';
}


/**
 * The parser used to find all inline tag in a single line of text
 * @package WikiRenderer
 * @abstract
 */
class WikiInlineParser {

    public $error=false;

    protected $simpletags=array();

    protected $resultline='';

    protected $str=array();

    protected $config;

    protected $textLineContainers=array();
    
    protected $currentTextLineContainer = null;

    /**
    * constructor
    * @param WikiRendererConfig $config  a config object
    */
    function __construct($config ){
        $this->escapeChar = $config->escapeChar;
        $this->config = $config;

        $simpletagPattern = '';
        foreach($config->simpletags as $tag=>$html){
            $simpletagPattern.='|('.preg_quote($tag, '/').')';
        }
        
        $escapePattern = '';
        if($this->escapeChar != '')
            $escapePattern ='|('.preg_quote($this->escapeChar, '/').')';


        foreach($config->textLineContainers as $class=>$tags){
            $c = new WikiTextLineContainer();
            $c->tag = new $class($config);
            $separators = $c->tag->separators;
            
            $tagList = array();
            foreach($tags as $tag) {
                $t = new $tag($config);
                $c->allowedTags[$t->beginTag] = $t;
                $c->pattern .= '|('.preg_quote($t->beginTag, '/').')';
                if($t->beginTag!= $t->endTag)
                    $c->pattern .= '|('.preg_quote($t->endTag, '/').')';
                $separators = array_merge($separators, $t->separators);
            }
            $separators= array_unique($separators);
            foreach($separators as $sep){
                $c->pattern .='|('.preg_quote($sep, '/').')';
            }
            $c->pattern .= $simpletagPattern. $escapePattern;
            $c->pattern = '/'.substr($c->pattern,1).'/';

            $this->textLineContainers[$class] = $c;
        }

        $this->simpletags = $config->simpletags;
    }

    /**
    * main function which parse a line of wiki content
    * @param   string   $line   a string containing wiki content, but without line feeds
    * @return  string   the line transformed to the target content 
    */
    public function parse($line){
        $this->error=false;
        $this->currentTextLineContainer = $this->textLineContainers[$this->config->defaultTextLineContainer];
        $firsttag = clone ($this->currentTextLineContainer->tag);

        $this->str = preg_split($this->currentTextLineContainer->pattern, $line, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
        $this->end = count($this->str);

        if($this->end > 1){
            $pos=-1;
            $this->_parse($firsttag, $pos);
            return $firsttag->getContent();
        }else{
            $firsttag->addContent($line);
            return  $firsttag->getContent();
        }
    }


    /**
    * core of the parser
    * @return integer new position
    */
    protected function _parse($tag, $posstart){

      $checkNextTag=true;

      // we analyse each part of the string, 
      for($i=$posstart+1; $i < $this->end; $i++){
            $t=&$this->str[$i];

            // is it the escape char ?
            if($this->escapeChar !='' && $t === $this->escapeChar){
               if($checkNextTag){
                  $t=''; // yes -> let's ignore the tag
                  $checkNextTag=false;
               }else{
                  // if we are here, this is because the previous part was the escape char
                  $tag->addContent($this->escapeChar);
                  $checkNextTag=true;
               }

            // is this a separator ?
            }elseif($tag->isCurrentSeparator($t)){
                $tag->addSeparator($t);

            }elseif($checkNextTag){
                // is there a ended tag
                if($tag->endTag == $t && !$tag->isTextLineTag){
                    return $i;

                }elseif(!$tag->isOtherTagAllowed()) {
                    $tag->addContent($t);

                // is there a tag which begin something ?
                }elseif( isset($this->currentTextLineContainer->allowedTags[$t]) ){
                    $newtag = clone $this->currentTextLineContainer->allowedTags[$t];
                    $i=$this->_parse($newtag,$i);
                    if($i !== false){
                        $tag->addContent($newtag->getWikiContent(), $newtag->getContent());
                    }else{
                        $i=$this->end;
                        $tag->addContent($newtag->getWikiContent(), $newtag->getBogusContent());
                    }

                // is there a simple tag ?
                }elseif( isset($this->simpletags[$t])){
                    $tag->addContent($t, $this->simpletags[$t]);
                }else{
                    $tag->addContent($t);
                }
            }else{
                if(isset($this->currentTextLineContainer->allowedTags[$t]) || isset($this->simpletags[$t]) || $tag->endTag == $t)
                    $tag->addContent($t);
                else
                    $tag->addContent($this->escapeChar.$t);
                $checkNextTag=true;
            }
      }
      if(!$tag->isTextLineTag ){
         //we didn't find the ended tag, error
         $this->error=true;
         return false;
      }else
        return $this->end;
   }

}



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
 * base class for the configuration
 */
abstract class WikiRendererConfig {

   public $defaultTextLineContainer = 'WikiTextLine';

   public $textLineContainers = array(
         'WikiTextLine'=>array(),
   );

   /**
   * liste des balises de type bloc reconnus par WikiRenderer.
   */
   public $bloctags = array();


   public $simpletags = array();

   public $checkWikiWordFunction = null;

   public $escapeChar = '\\';

   /**
    * Called before the wiki text parsing
    * @param string $text  the wiki text
    * @return string the wiki text to parse
    */
   public function onStart($texte){
        return $texte;
    }

   /**
    * called after the parsing. You can add additionnal data to
    * the result of the parsing
    */
   public function onParse($finalTexte){
       return $finalTexte;
   }

   /**
    * in some wiki system, some links are specials. You should override this method
    * to transform this specific links to real URL
    * @return array  first item is the url, second item is an alternate label
    */
   public function processLink($url, $tagName='') {
      return array($url, $url);
   }
}



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
 * Main class of WikiRenderenr. You should instantiate like this:
 *      $ctr = new WikiRenderer();
 *      $monTexteXHTML = $ctr->render($montexte);
 */
class WikiRenderer {

   /**
    * @var   string   contains the final content
    */
   protected $_newtext;

   /**
    * @var WikiRendererBloc the current opened bloc element
    */
   protected $_currentBloc=null;

   /**
    * @var array       list of all possible blocs
    */
   protected $_blocList= array();

   /**
    * @var WikiInlineParser   the parser for inline content
    */
   public $inlineParser=null;

   /**
    * list of lines which contain an error
    */
   public $errors=array();


   protected $config=null;

   /**
    * prepare the engine
    * @param WikiRendererConfig $config  a config object. if it is not present, it uses wr3_to_xhtml rules.
    */
   function __construct( $config=null){

      if(is_string($config)){
          $f = WIKIRENDERER_PATH.'rules/'.basename($config).'.php';
          if(file_exists($f)){
              require_once($f);
              $this->config= new $config();
          }else
             throw new Exception('Wikirenderer : bad config name');
      }elseif(is_object($config)){
         $this->config=$config;
      }else{
         require_once(WIKIRENDERER_PATH . 'rules/wr3_to_xhtml.php');
         $this->config= new wr3_to_xhtml();
      }

      $this->inlineParser = new WikiInlineParser($this->config);

      foreach($this->config->bloctags as $name){
         $this->_blocList[]= new $name($this);
      }
   }

   /**
    * Main method to call to convert a wiki text into an other format, according to the
    * rules given to the constructor.
    * @param   string  $text the wiki text to convert
    * @return  string  the converted text.
    */
   public function render($text){
      $text = $this->config->onStart($text);

      $lignes=preg_split("/\015\012|\015|\012/",$text); // we split the text at all line feeds

      $this->_newtext=array();
      $this->errors=array();
      $this->_currentBloc = null;

      // we loop over all lines
      foreach($lignes as $num=>$ligne){
         if($this->_currentBloc){
            // a bloc is already open
            if($this->_currentBloc->detect($ligne)){
                $s =$this->_currentBloc->getRenderedLine();
                if($s !== false)
                    $this->_newtext[]=$s;
            }else{
                $this->_newtext[count($this->_newtext)-1].=$this->_currentBloc->close();
                $found=false;
                foreach($this->_blocList as $bloc){
                    if($bloc->type != $this->_currentBloc->type && $bloc->detect($ligne)){
                        $found=true;
                        // we open the new bloc

                        if($bloc->closeNow()){
                            // if we have to close now the bloc, we close.
                            $this->_newtext[]=$bloc->open().$bloc->getRenderedLine().$bloc->close();
                            $this->_currentBloc = null;
                        }else{
                            $this->_currentBloc = clone $bloc; // careful ! it MUST be a copy here !
                            $this->_newtext[]=$this->_currentBloc->open().$this->_currentBloc->getRenderedLine();
                        }
                        break;
                    }
                }
                if(!$found){
                   $this->_newtext[]= $this->inlineParser->parse($ligne);
                   $this->_currentBloc = null;
                }
            }

         }else{
            $found=false;
            // no opened bloc, we saw if the line correspond to a bloc
            foreach($this->_blocList as $bloc){
                if($bloc->detect($ligne)){
                    $found=true;
                    if($bloc->closeNow()){
                        $this->_newtext[]=$bloc->open().$bloc->getRenderedLine().$bloc->close();
                    }else{
                        $this->_currentBloc = clone $bloc; // careful ! it MUST be a copy here !
                        $this->_newtext[]=$this->_currentBloc->open().$this->_currentBloc->getRenderedLine();
                    }
                    break;
                }
            }
            if(!$found){
                $this->_newtext[]= $this->inlineParser->parse($ligne);
            }
         }
         if($this->inlineParser->error){
            $this->errors[$num+1]=$ligne;
         }
      }
      if($this->_currentBloc){
          $this->_newtext[count($this->_newtext)-1].=$this->_currentBloc->close();
      }

      return $this->config->onParse(implode("\n",$this->_newtext));
   }

    /**
     * return the version of WikiRenderer
     * @access public
     * @return string   version
     */
    public function getVersion(){
       return WIKIRENDERER_VERSION;
    }

    public function getConfig(){
        return $this->config;
    }

}



/**
 *
 */
class WikiTextLine extends WikiTag {
    public $isTextLineTag=true;
}

/**
 *
 */
class WikiHtmlTextLine extends WikiTag {
    public $isTextLineTag=true;

    protected function _doEscape($string){
        return htmlspecialchars($string);
    }
}

class WikiXmlTextLine extends WikiHtmlTextLine {
    protected function _doEscape($string){
        return htmlspecialchars($string, ENT_NOQUOTES);
    }
}

/**
 * a base class for wiki inline tag, to generate XHTML element.
 * @package WikiRenderer
 */
abstract class WikiTagXhtml extends WikiTag {

   protected $additionnalAttributes=array();

   /**
    * sometimes, an attribute could not correspond to something in the target format
    * so we could indicate it.
    */
   protected $ignoreAttribute = array();

   public function getContent(){
        $attr='';
        $cntattr=count($this->attribute);
        $count=($this->separatorCount >= $cntattr?$cntattr-1:$this->separatorCount);
        $content='';

        for($i=0;$i<=$count;$i++){
            if(in_array($this->attribute[$i] , $this->ignoreAttribute))
                continue;
            if($this->attribute[$i] != '$$')
                $attr.=' '.$this->attribute[$i].'="'.htmlspecialchars($this->wikiContentArr[$i]).'"';
            else
                $content = $this->contents[$i];
        }

        foreach($this->additionnalAttributes as $name=>$value) {
            $attr.=' '.$name.'="'.htmlspecialchars($value).'"';
        }

        return '<'.$this->name.$attr.'>'.$content.'</'.$this->name.'>';
   }

   protected function _doEscape($string){
       return htmlspecialchars($string);
   }
}


class WikiTagXml extends WikiTagXhtml {
   protected function _doEscape($string){
       return htmlspecialchars($string, ENT_NOQUOTES);
   }
}

