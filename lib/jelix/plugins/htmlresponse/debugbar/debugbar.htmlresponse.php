<?php
/**
* @package     jelix
* @subpackage  responsehtml_plugin
* @author      Laurent Jouanneau
* @contributor Julien Issler
* @copyright   2010-2012 Laurent Jouanneau
* @copyright   2011 Julien Issler
* @link        http://jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * interface for plugins for the debugbar
 * @since 1.3
 */
interface jIDebugbarPlugin {

    /**
     * @return string CSS styles
     */
    function getCss();

    /**
     * @return string Javascript code lines
     */
    function getJavascript();

    /**
     * it should adds content or set some properties on the debugbar
     * to displays some contents.
     * @param debugbarHTMLResponsePlugin $debugbar the debugbar
     */
    function show($debugbar);

}

require_once(__DIR__.'/errors.debugbar.php');


/**
 * information for a component a debug bar
 * @since 1.3
 */
class debugbarItemInfo {

    /**
     * an id. required
     */
    public $id ='';

    /**
     * a simple text label
     */
    public $label='';

    /**
     * the HTML label to display in the debug bar
     */
    public $htmlLabel = '';

    /**
     * the HTML content of the popup if the information needs a popup
     */
    public $popupContent ='';

    /**
     * indicate if the popup should be opened or not at the startup
     */
    public $popupOpened = false;

    /**
     * @param string $id an id
     * @param string $label a simple text label
     * @param string $htmlLabel the HTML label to display in the debug bar
     * @param string $popupContent the HTML content of the popup if the information needs a popup
     * @param boolean $isOpened indicate if the popup should be opened or not at the startup
     */
    function __construct($id, $label, $htmlLabel='', $popupContent='', $isOpened= false) {
        $this->id = $id;
        $this->label = $label;
        $this->htmlLabel = $htmlLabel;
        $this->popupContent = $popupContent;
        $this->popupOpened = $isOpened;
    }
}


/**
 * plugin for jResponseHTML, it displays a debugbar
 * @since 1.3
 */
class debugbarHTMLResponsePlugin implements jIHTMLResponsePlugin {

    protected $response = null;

    protected $plugins = array();

    protected $tabs = array();

    // ------------- implementation of the jIHTMLResponsePlugin interface

    public function __construct(jResponse $c) {
        $this->response = $c;
        $this->plugins['errors'] = new errorsDebugbarPlugin();
    }

    /**
     * called just before the jResponseBasicHtml::doAfterActions() call
     */
    public function afterAction() {

    }

    /**
     * called just before the final output. This is the opportunity
     * to make changes before the head and body output. At this step
     * the main content (if any) is already generated.
     */
    public function beforeOutput() {
        // load plugins
        $plugins = jApp::config()->debugbar['plugins'];
        if ($plugins) {
            $plugins = preg_split('/ *, */', $plugins);
            foreach ($plugins as $name) {
                $plugin = jApp::loadPlugin($name, 'debugbar', '.debugbar.php', $name.'DebugbarPlugin', $this);
                if ($plugin) {
                    $this->plugins[$name] = $plugin;
                }
                /*else
                    throw new jException('');*/
            }
        }
    }

    /**
     * called when the content is generated, and potentially sent, except
     * the body end tag and the html end tags. This method can output
     * directly some contents.
     */
    public function atBottom() {
        $css = "";
        $js = '';
        foreach($this->plugins as $name => $plugin) {
            $css .= $plugin->getCSS();
            $js .= $plugin->getJavascript();
        }
        ?>
<style type="text/css">
#jxdb {position:absolute;right:10;top:0;left:auto;margin:0;padding:0;z-index:1000;font-size:10pt;font-family:arial;font-weight:normal;color:black;}
#jxdb-pjlx-a-right { display:none;}
#jxdb-pjlx-a-left { display:inline;}
#jxdb.jxdb-position-l {left:10; right: auto;}
#jxdb.jxdb-position-l #jxdb-pjlx-a-right { display:inline;}
#jxdb.jxdb-position-l #jxdb-pjlx-a-left { display:none;}
#jxdb-header {
    padding:3px;font-size:10pt;color:#797979;float:right;z-index:1200;position:relative;
    background:linear-gradient(top, #EFF4F6, #87CDEF);background:-moz-linear-gradient(top, #EFF4F6, #87CDEF);background:-webkit-linear-gradient(top, #EFF4F6, #87CDEF);background-color: #EFF4F6;
    border-radius:0 0 5px 5px ;-webkit-border-bottom-right-radius: 5px;-webkit-border-bottom-left-radius: 5px;-o-border-radius:0 0  5px 5px ;-moz-border-radius:0 0 5px 5px;
    box-shadow: #6B6F80 3px 3px 6px 0;-moz-box-shadow: #969CB4 3px 3px 6px 0;-webkit-box-shadow: #6B6F80 3px 3px 6px;-o-box-shadow: #6B6F80 3px 3px 6px 0;
}
#jxdb.jxdb-position-l #jxdb-header { float:left;}
#jxdb-header img {vertical-align: middle;}
#jxdb-header a img {border:0;}
#jxdb-header span {display:inline-block;border-right: 1px solid #93B6B8;padding: 0 0.5em;color:black;}
#jxdb-header a {text-decoration:none;color:black;}
#jxdb-header span a:hover {text-decoration:underline;}
#jxdb-tabpanels {
    clear:both;color:black;background-color: #CCE4ED;z-index:1100;margin:0;padding:0;position:relative;max-height:700;overflow: auto;resize:both;
    border-radius:0 0  5px 5px ;-moz-border-radius: 0 0 5px 5px;-o-border-radius:0 0  5px 5px ;-webkit-border-bottom-left-radius: 5px;-webkit-border-bottom-right-radius: 5px;
    box-shadow: #6B6F80 3px 3px 3px 0;-moz-box-shadow: #969CB4 3px 3px 3px 0;-webkit-box-shadow: #6B6F80 3px 3px 3px;-o-box-shadow: #6B6F80 3px 3px 3px 0;
}
#jxdb-tabpanels div.jxdb-tabpanel { padding:4px; }
.jxdb-list {margin:10; padding:8px 8px 8px 8px; list-style-type:none;}
.jxdb-list li {margin:3px 0; padding:0 0 0 0; background-color: #D0E6F4;}
.jxdb-list h5 a {color:black;text-decoration:none;display:inline-block;padding:0 0 0 18px;background-position:left center; background-repeat: no-repeat;}
.jxdb-list h5 span {display:inline-block;padding:0 0 0 18px;background-position: left center;background-repeat:no-repeat;}
.jxdb-list h5 {display:block;margin:0;padding:0;font-size:12pt;font-weight:normal; background-color:#FFF9C2;}
.jxdb-list p {margin:0 0 0 18px;font-size:10pt;}
.jxdb-list table {margin:0 0 0 18px;font-size:9pt;font-family:courier new, monospace;color:#3F3F3F; width:100%;}
#jxdb-errors li {background-color: inherit;}
#jxdb-errors li.jxdb-msg-error h5 {background-color:#FFD3D3;}
#jxdb-errors li.jxdb-msg-notice h5 {background-color:#DDFFE6;}
#jxdb-errors li.jxdb-msg-warning h5 { background-color:#FFB94E;}
.jxdb-list li >div {display:none;}
.jxdb-list li.jxdb-opened >div {display:block;}
p.jxdb-msg-error { background-color:#FFD3D3;}
p.jxdb-msg-warning { background-color:#FFB94E;}

ul.jxdb-list li h5 a {background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAABjSURBVCjPY/jPgB8y0FHBkb37/+/6v+X/+v8r/y/ei0XB3v+H4HDWfywKtgAl1v7/D8SH/k/ApmANUAICDv1vx6ZgMZIJ9dgUzEJyQxk2BRPWdf1vAeqt/F/yP3/dwIQk2QoAfUogHsamBmcAAAAASUVORK5CYII=');}
ul.jxdb-list li.jxdb-opened  h5 a {background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAABhSURBVCjPY/jPgB8y0FHBkb37/+/6v+X/+v8r/y/ei0XB3v+H4HDWfywKtgAl1oLhof8TsClYA5SAgEP/27EpWIxkQj02BbOQ3FCGTcGEdV3/W4B6K/+X/M9fNzAhSbYCAMiTH3pTNa+FAAAAAElFTkSuQmCC');}
<?php echo $css ?>
</style>
<script type="text/javascript">//<![CDATA[
var jxdb={plugins:{},init:function(event){for(var i in jxdb.plugins)jxdb.plugins[i].init()},me:function(){return document.getElementById('jxdb')},close:function(){document.getElementById('jxdb').style.display="none"},selectTab:function(tabPanelId){var close=(document.getElementById(tabPanelId).style.display=='block');this.hideTab();if(!close){document.getElementById('jxdb-tabpanels').style.display='block';document.getElementById(tabPanelId).style.display='block'}},hideTab:function(){var panels=document.getElementById('jxdb-tabpanels').childNodes;for(var i=0;i<panels.length;i++){var elt=panels[i];if(elt.nodeType==elt.ELEMENT_NODE){elt.style.display='none'}}document.getElementById('jxdb-tabpanels').style.display='none'},moveTo:function(side){document.getElementById('jxdb').setAttribute('class','jxdb-position-'+side);this.createCookie('jxdebugbarpos',side)},createCookie:function(name,value){var date=new Date();date.setTime(date.getTime()+(7*24*60*60*1000));document.cookie=name+"="+value+"; expires="+date.toGMTString()+"; path=/"},toggleDetails:function(anchor){var item=anchor.parentNode.parentNode;var cssclass=item.getAttribute('class');if(cssclass==null)cssclass='';if(cssclass.indexOf('jxdb-opened')==-1){item.setAttribute('class',cssclass+" jxdb-opened");item.childNodes[3].style.display='block'}else{item.setAttribute('class',cssclass.replace("jxdb-opened",''));item.childNodes[3].style.display='none'}}};if(window.addEventListener)window.addEventListener("load",jxdb.init,false);
<?php echo $js ?> //]]>
</script>
        <?php
        foreach($this->plugins as $plugin) {
            $plugin->show($this);
        }

        if (isset($_COOKIE['jxdebugbarpos']))
            $class = "jxdb-position-".$_COOKIE['jxdebugbarpos'];
        else
            $class = "jxdb-position-".(jApp::config()->debugbar['defaultPosition'] == 'left'?'l':'r');
        ?>
<div id="jxdb" class="<?php echo $class;?>">
    <div id="jxdb-header">
   <a href="javascript:jxdb.selectTab('jxdb-panel-jelix');"><img src="data:image/png;base64,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" alt="Jelix debug toolbar"/></a>
<?php foreach ($this->tabs as $item) {
    $label = ($item->htmlLabel ? $item->htmlLabel: htmlspecialchars($item->label));
    if ($item->popupContent) {
        echo '<span><a href="javascript:jxdb.selectTab(\'jxdb-panel-'.$item->id.'\');">'.$label.'</a></span>';
    }
    else
        echo '<span>'.$label.'</span>';
}
?>
   <a href="javascript:jxdb.close();"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHdSURBVDjLpZNraxpBFIb3a0ggISmmNISWXmOboKihxpgUNGWNSpvaS6RpKL3Ry//Mh1wgf6PElaCyzq67O09nVjdVlJbSDy8Lw77PmfecMwZg/I/GDw3DCo8HCkZl/RlgGA0e3Yfv7+DbAfLrW+SXOvLTG+SHV/gPbuMZRnsyIDL/OASziMxkkKkUQTJJsLaGn8/iHz6nd+8mQv87Ahg2H9Th/BxZqxEkEgSrq/iVCvLsDK9awtvfxb2zjD2ARID+lVVlbabTgWYTv1rFL5fBUtHbbeTJCb3EQ3ovCnRC6xAgzJtOE+ztheYIEkqbFaS3vY2zuIj77AmtYYDusPy8/zuvunJkDKXM7tYWTiyGWFjAqeQnAD6+7ueNx/FLpRGAru7mcoj5ebqzszil7DggeF/DX1nBN82rzPqrzbRayIsLhJqMPT2N83Sdy2GApwFqRN7jFPL0tF+10cDd3MTZ2AjNUkGCoyO6y9cRxfQowFUbpufr1ct4ZoHg+Dg067zduTmEbq4yi/UkYidDe+kaTcP4ObJIajksPd/eyx3c+N2rvPbMDPbUFPZSLKzcGjKPrbJaDsu+dQO3msfZzeGY2TCvKGYQhdSYeeJjUt21dIcjXQ7U7Kv599f4j/oF55W4g/2e3b8AAAAASUVORK5CYII=" alt="close" title="click to close the debug toolbar"/></a>
    </div>
    <div id="jxdb-tabpanels">
        <div id="jxdb-panel-jelix" class="jxdb-tabpanel" style="display:none">
            <ul>
                <li>Jelix version: <?php echo JELIX_VERSION?></li>
                <li>Move the debug bar <a id="jxdb-pjlx-a-right" href="javascript:jxdb.moveTo('r')">to right</a>
                <a href="javascript:jxdb.moveTo('l')" id="jxdb-pjlx-a-left">to left</a></li>
                <li>To remove it definitively, deactivate the plugin "debugbar"<br/> into the configuration</li>
            </ul>
        </div>
        <?php
        $alreadyOpen = false;
        foreach ($this->tabs as $item) {
            if (!$item->popupContent)
                continue;
            echo '<div id="jxdb-panel-'.$item->id.'" class="jxdb-tabpanel"';
            if ($item->popupOpened && !$alreadyOpen) {
                $alreadyOpen = true;
                echo ' style="display:block"';
            }
            else
                echo ' style="display:none"';
            echo '>', $item->popupContent;
            echo '</div>';
        }?>
    </div>
</div>
        <?php
    }

    /**
     * called just before the output of an error page
     */
    public function beforeOutputError() {
        $this->beforeOutput();
        ob_start();
        $this->atBottom();
        $this->response->addContent(ob_get_clean(),true);
    }

    // ------------- methods that plugins for the debugbar can call

    /**
     * add an information in the debug bar
     * @param debugbarItemInfo $info  informations
     */
    function addInfo($info) {
        $this->tabs[] = $info;
    }

    /**
     * returns html formated stack trace
     * @param array $trace
     * @return string
     */
    function formatTrace($trace) {
        $html = '<table>';
        foreach($trace as $k=>$t) {
            if (isset($t['file'])) {
                $file = $t['file'];
            }
            else {
                $file = '[php]';
            }
            $html .='<tr><td>'.$k.'</td><td>'.(isset($t['class'])?$t['class'].$t['type']:'').$t['function'].'()</td>';
            $html .='<td>'.($file).'</td><td>'.(isset($t['line'])?$t['line']:'').'</td></tr>';
        }
        $html .='</table>';
        return $html;
    }
}

