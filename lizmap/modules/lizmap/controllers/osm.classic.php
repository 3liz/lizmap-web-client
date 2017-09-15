<?php
/**
* Php proxy to access OpenStreetMap services
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class osmCtrl extends jController {

  /**
  * Query the OpenStreetMap Nominatim API
  * @param text $query A query on OpenStreetMap object
  * @param text $bbox A bounding box in EPSG:4326
  * @return XML.
  */
  function nominatim() {
    $rep = $this->getResponse('binary');
    $rep->outputFileName = 'nominatim.json';
    $rep->mimeType = 'application/json';

    $query = $this->param('query');
    if ( !$query ) {
      $rep->content = '[]';
      return $rep;
    }

    $url = 'http://nominatim.openstreetmap.org/search.php?';
    $params = array(
      'q'=>$query,
      'format'=>'json',
    );
    $bbox = $this->param('bbox');
    if( preg_match('/\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?/',$bbox) )
      $params['viewbox'] = $bbox;

    $url .= http_build_query($params);
    $curl_handle = curl_init();
    curl_setopt($curl_handle, CURLOPT_URL, $url);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl_handle, CURLOPT_HTTPHEADER, array('Expect:'));
    curl_setopt($curl_handle, CURLOPT_REFERER, jUrl::getFull("view~default:index"));
    $content = curl_exec($curl_handle);
    curl_close($curl_handle);

    $rep->content = $content;

    return $rep;
  }
}
