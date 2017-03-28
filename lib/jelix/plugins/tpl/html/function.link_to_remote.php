<?php
/**
* @package     jelix
* @subpackage  jtpl_plugin
* @author      Julien Jacottet
* @contributor Dominique Papin, Julien Issler
* @copyright   2008 Julien Jacottet, 2008 Dominique Papin, 2011 Julien Issler
* @link        http://www.jelix.org
* @licence     GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * function plugin :  Ajax request
 *
 * it creates a javascript ajax function
 * example :
 * <pre>
 * {link_to_remote
 *  'Link',    <!-- link label -->
 *  'result',    <!-- id dom for ajax result -->
 *  'test~default:ajax', array('id'=>'34'),    <!-- jurl request -->
 *  array(
 *    'position'=>'html',    <!-- html or append or prepend (default html) -->
 *    'method'=>'GET',    <!-- GET or POST (default POST) -->
 *    'beforeSend'=>'alert("beforeSend")',    <!-- JS script before send (default null) -->
 *    'complete'=>'alert("complete")',    <!-- JS script after send  (default null)-->
 *    'error'=>'alert("error")',    <!-- JS if error  (default null) -->
 * )}
 * <div id="result"></div>
 * </pre>
 */

function jtpl_function_html_link_to_remote($tpl, $label, $element_id, $action_selector, $action_parameters, $option) {

    $resp = jApp::coord()->response;
    static $id_link_to_remote = 0;

    if($resp && $resp->getFormatType() == 'html'){
        // Add js link
        $resp->addJSLink(jApp::config()->urlengine['jqueryPath'].'jquery.js');
    }

    $id_link_to_remote++;

    $url = jUrl::get($action_selector, $action_parameters);

    $position = ((array_key_exists("position", $option)) ? $option['position'] : 'html' );
    $method =   ((array_key_exists("method", $option)) ? $option['method'] : 'GET' );
    $beforeSend = ((array_key_exists("beforeSend", $option)) ? $option['beforeSend'] : '' );
    $complete = ((array_key_exists("complete", $option)) ? $option['complete'] : '' );
    $error =    ((array_key_exists("error", $option)) ? $option['error'] : '' );

    // Link
    echo '<a href="#" onclick="link_to_remote_'.$id_link_to_remote.'();">'.$label."</a>\n";

    // Script
    echo '
    <script type="text/javascript">//<![CDATA[
      function link_to_remote_'.$id_link_to_remote.'() {
        $.ajax({
          type: \''.$method."',
          url: '".$url."',
          beforeSend: function(){".$beforeSend.";},
          complete: function(){".$complete.";},
          error: function(){".$error.';},
          success: function(msg){
            $(\'#'.$element_id."').".$position."(msg);
          }
        });
      } //]]>
    </script>";
}
