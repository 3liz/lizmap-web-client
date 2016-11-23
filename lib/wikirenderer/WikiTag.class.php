<?php
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
