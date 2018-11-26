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

class ignCtrl extends jController {

  /**
  * Query the IGN Geoportal API
  * @param text $query A query on IGN BD adresse object
  * @param text $bbox A bounding box in EPSG:4326
  * @return XML.
  */
  function address() {
    $rep = $this->getResponse('json');
    $rep->data = array();

    $query = $this->param('query');
    if ( !$query )
      return $rep;

    // Get the project
    $project = filter_var($this->param('project'), FILTER_SANITIZE_STRING);
    if(!$project)
      return $rep;

    // Get repository data
    $repository = $this->param('repository');
    if(!$repository)
      return $rep;

    // Get the project object
    $lproj = null;
    try {
        $lproj = lizmap::getProject($repository.'~'.$project);
        if(!$lproj)
            return $rep;
    }
    catch(UnknownLizmapProjectException $e) {
        jLog::logEx($e, 'error');
        return $rep;
    }

    $configOptions = $lproj->getOptions();
    if( !property_exists($configOptions, 'ignKey')
      || $configOptions->ignKey == '')
      return $rep;

    $url = 'https://wxs.ign.fr/'.$configOptions->ignKey.'/geoportail/ols?';
    $xls = '<XLS xmlns:xls="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.opengis.net/xls" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.2" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">';
    $xls .= '<RequestHeader/><Request requestID="1" version="1.2" methodName="LocationUtilityService"><GeocodeRequest returnFreeForm="false"><Address countryCode="StreetAddress">';
    $xls .= '<freeFormAddress>'.$query.'</freeFormAddress>';
    $xls .= '</Address></GeocodeRequest></Request></XLS>';
    $params = array(
      "xls"=>$xls,
      "output"=>'xml'
    );

    $url .= http_build_query($params);
    $curl_handle = curl_init();
    curl_setopt($curl_handle, CURLOPT_URL, $url);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl_handle, CURLOPT_HTTPHEADER, array('Expect:'));
    curl_setopt($curl_handle, CURLOPT_REFERER, jUrl::getFull('lizmap~ign:address'));
    $content = curl_exec($curl_handle);
    curl_close($curl_handle);

    $rep->content = $content;

    $content = str_replace('xmlns=', 'ns=', $content);
    $content = str_replace('gml:', '', $content);
    $xml = simplexml_load_string( $content );
    $results = array();
    $GeocodedAddresses = $xml->xpath('//GeocodedAddress');
    foreach( $GeocodedAddresses as $GeocodedAddress ) {
      $result = array();
      $address = array();

      /*
       * bug with gml:*
       */
      $Point = $GeocodedAddress->xpath('Point/pos');
      if ( count($Point) != 0 ) {
        $Point = $Point[0];
        $point = explode(' ',(string)$Point);
        $result['point'] = array($point[1],$point[0]);
      }

      $Address = $GeocodedAddress->xpath('Address');
      if ( count($Address) == 0 )
        continue;
      $Address = $Address[0];

      $Building = $Address->xpath('StreetAddress/Building');
      if ( count($Building) != 0 ) {
        $Building = $Building[0];
        $address['number'] = (string)$Building['number'];
      }

      $Street = $Address->xpath('StreetAddress/Street');
      if ( count($Street) != 0 ) {
        $Street = $Street[0];
        $address['street'] = (string)$Street;
      }

      $Places = $Address->xpath('Place');
      foreach($Places as $Place) {
        $PlaceType = (string)$Place['type'];
        if ($PlaceType == 'Municipality')
          $address['municipality'] = (string)$Place;
        else if ($PlaceType == 'Departement')
          $address['departement'] = (string)$Place;
        else if ($PlaceType == 'Bbox')
          $result['bbox'] = explode(';',(string)$Place);
      }

      $formatted_address = '';
      if( array_key_exists('number', $address) )
        $formatted_address = $address['number'].' ';
      if( array_key_exists('street', $address) && $address['street'] != '' )
        $formatted_address .= $address['street'].', ';
      if( array_key_exists('municipality', $address) )
        $formatted_address .= $address['municipality'].', ';
      if( array_key_exists('departement', $address) )
        $formatted_address .= $address['departement'];
      $result['formatted_address'] = $formatted_address;

      $results[] = $result;
    }

    $rep->data = $results;
    return $rep;
  }
}
