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
    * @var WikiRendererBloc the previous opened bloc element
    */
   protected $_previousBloc=null;

   /**
    * @var array       list of all possible blocs
    */
   protected $_blocList= array();

   /**
    * @var WikiRendererBloc the default bloc used for unrecognized line
    */
   protected $_defaultBlock = null;

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

      if ($this->config->defaultBlock) {
        $name = $this->config->defaultBlock;
        $this->_defaultBlock = new $name($this);
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
      $this->_previousBloc = null;

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
                    if ($bloc->detect($ligne)) {
                        $found=true;
                        // we open the new bloc

                        if($bloc->closeNow()){
                            // if we have to close now the bloc, we close.
                            $this->_newtext[]=$bloc->open().$bloc->getRenderedLine().$bloc->close();
                            $this->_previousBloc = $bloc;
                            $this->_currentBloc = null;
                        }else{
                            $this->_previousBloc = $this->_currentBloc;
                            $this->_currentBloc = clone $bloc; // careful ! it MUST be a copy here !
                            $this->_newtext[]=$this->_currentBloc->open().$this->_currentBloc->getRenderedLine();
                        }
                        break;
                    }
                }
                if (!$found) {
                    if (trim($ligne) == '') {
                        $this->_newtext[] = '';
                    }
                    else if ($this->_defaultBlock) {
                        $this->_defaultBlock->detect($ligne);
                        $this->_newtext[] = $this->_defaultBlock->open().$this->_defaultBlock->getRenderedLine().$this->_defaultBlock->close();
                    }
                    else {
                       $this->_newtext[] = $this->inlineParser->parse($ligne);
                    }
                    $this->_previousBloc = $this->_currentBloc;
                    $this->_currentBloc = null;;
                }
            }
         }
         else {
            $found=false;
            // no opened bloc, we saw if the line correspond to a bloc
            foreach($this->_blocList as $bloc){
                if($bloc->detect($ligne)){
                    $found=true;
                    if($bloc->closeNow()){
                        $this->_newtext[]=$bloc->open().$bloc->getRenderedLine().$bloc->close();
                        $this->_previousBloc = $bloc;
                    }else{
                        $this->_currentBloc = clone $bloc; // careful ! it MUST be a copy here !
                        $this->_newtext[]=$this->_currentBloc->open().$this->_currentBloc->getRenderedLine();
                    }
                    break;
                }
            }
            if(!$found){
                if (trim($ligne) == '') {
                    $this->_newtext[] = '';
                }
                else if ($this->_defaultBlock) {
                    $this->_defaultBlock->detect($ligne);
                    $this->_newtext[] = $this->_defaultBlock->open().$this->_defaultBlock->getRenderedLine().$this->_defaultBlock->close();
                }
                else {
                    $this->_newtext[]=$this->inlineParser->parse($ligne);
                }
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

    /**
     * @return WikiRendererConfig
     */
    public function getConfig(){
        return $this->config;
    }

    public function getPreviousBloc() {
        return $this->_previousBloc;
    }
}
