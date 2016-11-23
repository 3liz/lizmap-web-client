<?php
/**
 * Wikirenderer is a wiki text parser. It can transform a wiki text into xhtml or other formats
 * @package WikiRenderer
 * @author Laurent Jouanneau
 * @copyright 2003-2016 Laurent Jouanneau
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
                $attr.=' '.$this->attribute[$i].'="'.$this->_doEscape($this->wikiContentArr[$i]).'"';
            else
                $content = $this->contents[$i];
        }

        foreach($this->additionnalAttributes as $name=>$value) {
            $attr.=' '.$name.'="'.$this->_doEscape($value).'"';
        }

        return '<'.$this->name.$attr.'>'.$content.'</'.$this->name.'>';
   }

   protected function _doEscape($string){
       return htmlspecialchars($string, ENT_COMPAT, $this->config->charset);
   }
}


class WikiTagXml extends WikiTagXhtml {
   protected function _doEscape($string){
       return htmlspecialchars($string, ENT_NOQUOTES, $this->config->charset);
   }
}

