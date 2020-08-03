<?php

require_once (JELIX_LIB_PATH.'forms/jFormsDatasource.class.php');

class qgisFormValueRelationDynamicDatasource extends jFormsDynamicDatasource
{
    //protected $formid;
    protected $ref;
    protected $emptyValue = false;

    public function __construct($ref, $emptyValue) {
        //$this->formid = $formid;
        $this->ref = $ref;
        $this->emptyValue = $emptyValue;
    }

    public function getData($form) {
        $privateData = $form->getContainer()->privateData;

        $valueRelationData = $privateData['qgis_controls'][$this->ref]['valueRelationData'];

        $layerId = $valueRelationData['layer'];
        $valueColumn = $valueRelationData['value'];
        $keyColumn = $valueRelationData['key'];
        $filterExpression = $valueRelationData['filterExpression'];

        $repository = $privateData['liz_repository'];
        $project = $privateData['liz_project'];
        $lproj = lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($layerId);

        $result = array();
        if ($filterExpression !== '') {
            // build feature's form
            $geom = null;
            $values = array();
            foreach ($this->criteriaFrom as $ref) {
                if ($ref == $privateData['liz_geometryColumn']) {
                    // from wkt to json
                    $wkt = trim($form->getData($ref));

                    // Get geometry type
                    preg_match("/^\w*/", $wkt, $matches);
                    if (count($matches) != 1) {
                        continue;
                    }
                    $geomType = strtolower($matches[0]);

                    // Get coordinates
                    preg_match("/\((.*)\)$/", $wkt, $matches);
                    if (count($matches) != 2) {
                        continue;
                    }
                    $coord = $matches[1];

                    if ($geomType === 'point') {
                        preg_match_all("/\d\d*\.*\d*/", $coord, $matches);
                        if (count($matches) != 1 || count($matches[0]) < 2) {
                            continue;
                        }
                        $geom = Array(
                            'type' => 'Point',
                            'coordinates' => array(
                                floatval($matches[0][0]),
                                floatval($matches[0][1])
                            )
                        );
                    } else if ($geomType === 'linestring') {
                        $coordinates = array();
                        foreach (explode(',', $coord) as $ptCoord) {
                            preg_match_all("/\d\d*\.*\d*/", trim($ptCoord), $matches);
                            $coordinates[] = array(
                                floatval($matches[0][0]),
                                floatval($matches[0][1])
                            );
                        }
                        $geom = Array(
                            'type' => 'LineString',
                            'coordinates' => $coordinates
                        );
                    } else if ($geomType === 'polygon') {
                        $coordinates = array();
                        foreach (preg_split('/\)\s*,\s*\(/', $coord) as $splitCoord) {
                            preg_match("/[^\(\)][^\(\)]*/", $splitCoord, $matches);
                            $lineCoord = $matches[0];
                            $lineCoordinates = array();
                            foreach (explode(',', $lineCoord) as $ptCoord) {
                                preg_match_all("/\d\d*\.*\d*/", trim($ptCoord), $matches);
                                $lineCoordinates[] = array(
                                    floatval($matches[0][0]),
                                    floatval($matches[0][1])
                                );
                            }
                            if (count($lineCoordinates) > 2) {
                                $coordinates[] = $lineCoordinates;
                            }
                        }
                        $geom = Array(
                            'type' => 'Polygon',
                            'coordinates' => $coordinates
                        );
                    }
                } else {
                    // properties
                    $values[$ref] = $form->getData($ref);
                }
            }

            $form_feature = array(
                'type' => 'Feature',
                'geometry' => $geom,
                'properties' => $values
            );

            // build expression getFeatureWithFormsScope parameters
            $params = array(
                'service' => 'EXPRESSION',
                'request' => 'getFeatureWithFormScope',
                'map' => $lproj->getRelativeQgisPath(),
                'layer' => $layer->getName(),
                'filter' => $filterExpression,
                'form_feature' => json_encode($form_feature),
                'fields' => $keyColumn.','.$valueColumn
            );

            $url = lizmapProxy::constructUrl($params, array('method' => 'post'));
            list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

            if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
                $json = json_decode($data);
                // Get result from json
                $features = $json->features;
                foreach ($features as $feat) {
                    if (property_exists($feat, 'properties')
                        and property_exists($feat->properties, $keyColumn)
                        and property_exists($feat->properties, $valueColumn)) {
                        $result[(string) $feat->properties->{$keyColumn}] = $feat->properties->{$valueColumn};
                    }
                }
            }
        } else {

            $typename = $layer->getShortName();
            if ($typename === null || $typename === '') {
                $typename = str_replace(' ', '_', $layer->getName());
            }

            $params = array(
                'SERVICE' => 'WFS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetFeature',
                'TYPENAME' => $typename,
                'PROPERTYNAME' => $valueColumn.','.$keyColumn,
                'OUTPUTFORMAT' => 'GeoJSON',
                'GEOMETRYNAME' => 'none',
            );

            // Perform request
            $wfsRequest = new lizmapWFSRequest($lproj, $params);
            $wfsResult = $wfsRequest->process();

            $data = $wfsResult->data;
            if (property_exists($wfsResult, 'file') and $wfsResult->file and is_file($data)) {
                $data = jFile::read($data);
            }
            $mime = $wfsResult->mime;

            if ($data && (strpos($mime, 'text/json') === 0 ||
                          strpos($mime, 'application/json') === 0 ||
                          strpos($mime, 'application/vnd.geo+json') === 0)) {
                $json = json_decode($data);
                // Get result from json
                $features = $json->features;
                foreach ($features as $feat) {
                    if (property_exists($feat, 'properties')
                        and property_exists($feat->properties, $keyColumn)
                        and property_exists($feat->properties, $valueColumn)) {
                        $result[(string) $feat->properties->{$keyColumn}] = $feat->properties->{$valueColumn};
                    }
                }
            }

            // Add default empty value for required fields
            // Jelix does not do it, but we think it is better this way to avoid unwanted set values
            if ($this->emptyValue) {
                $result[''] = '';
            }

        }


        // orderByValue
        if ($valueRelationData['orderByValue']) {
            asort($result);
        }

        return $result;
    }

    public function getLabel2($key, $form) {
        $privateData = $form->getContainer()->privateData;

        $valueRelationData = $privateData['qgis_controls'][$this->ref]['valueRelationData'];

        $layerId = $valueRelationData['layer'];
        $valueColumn = $valueRelationData['value'];
        $keyColumn = $valueRelationData['key'];
        $filterExpression = $valueRelationData['filterExpression'];

        $repository = $privateData['liz_repository'];
        $project = $privateData['liz_project'];
        $lproj = lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($layerId);

        $filter = '"'.$keyColumn.'" = ';
        if (is_numeric($key)) {
            $filter .= "".$key;
        } else {
            $filter .= "'".addslashes($key)."'";
        }

        $typename = $layer->getShortName();
        if ($typename === null || $typename === '') {
            $typename = str_replace(' ', '_', $layer->getName());
        }

        $params = array(
            'map' => $lproj->getRelativeQgisPath(),
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $typename,
            'PROPERTYNAME' => $valueColumn.','.$keyColumn,
            'OUTPUTFORMAT' => 'GeoJSON',
            'GEOMETRYNAME' => 'none',
            'EXP_FILTER' => $filter,
        );

        // Perform request
        $wfsRequest = new lizmapWFSRequest($lproj, $params);
        $wfsResult = $wfsRequest->process();

        $data = $wfsResult->data;
        if (property_exists($wfsResult, 'file') and $wfsResult->file and is_file($data)) {
            $data = jFile::read($data);
        }
        $mime = $wfsResult->mime;

        if ($data && (strpos($mime, 'text/json') === 0 ||
                      strpos($mime, 'application/json') === 0 ||
                      strpos($mime, 'application/vnd.geo+json') === 0)) {
            $json = json_decode($result->data);
            // Get result from json
            $features = $json->features;
            foreach ($features as $feat) {
                if (property_exists($feat, 'properties')
                    and property_exists($feat->properties, $keyColumn)
                    and property_exists($feat->properties, $valueColumn)) {
                    return (string) $feat->properties->{$valueColumn};
                }
            }
        }

        return null;
    }
}