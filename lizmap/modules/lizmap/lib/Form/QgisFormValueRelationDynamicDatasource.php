<?php

namespace Lizmap\Form;

require_once JELIX_LIB_PATH.'forms/jFormsDatasource.class.php';

class QgisFormValueRelationDynamicDatasource extends \jFormsDynamicDatasource
{
    //protected $formid;
    protected $ref;
    protected $emptyValue = false;

    public function __construct($ref, $emptyValue)
    {
        //$this->formid = $formid;
        $this->ref = $ref;
        $this->emptyValue = $emptyValue;
    }

    public function getData($form)
    {
        $privateData = $form->getContainer()->privateData;

        $valueRelationData = $privateData['qgis_controls'][$this->ref]['valueRelationData'];

        $layerId = $valueRelationData['layer'];
        $valueColumn = $valueRelationData['value'];
        $keyColumn = $valueRelationData['key'];
        $filterExpression = $valueRelationData['filterExpression'];

        $repository = $privateData['liz_repository'];
        $project = $privateData['liz_project'];
        $lproj = \lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($layerId);

        $result = array();
        if ($layer) {
            if ($filterExpression !== '') {
                // build feature's form
                $geom = null;
                $values = array();
                $criteriaControls = $this->getCriteriaControls();
                if ($criteriaControls !== null && is_array($criteriaControls)) {
                    foreach ($criteriaControls as $ref) {
                        if ($ref == $privateData['liz_geometryColumn']) {
                            // from wkt to geom
                            $wkt = trim($form->getData($ref));
                            $geom = \lizmapWkt::parse($wkt);
                        } else {
                            // properties
                            $values[$ref] = $form->getData($ref);
                        }
                    }
                }

                $form_feature = array(
                    'type' => 'Feature',
                    'geometry' => $geom,
                    'properties' => $values,
                );

                // Get Feature With Forms Scope
                $features = \qgisExpressionUtils::getFeatureWithFormScope($layer, $filterExpression, $form_feature, array($keyColumn, $valueColumn));
                foreach ($features as $feat) {
                    if (property_exists($feat, 'properties')
                        and property_exists($feat->properties, $keyColumn)
                        and property_exists($feat->properties, $valueColumn)) {
                        $result[(string) $feat->properties->{$keyColumn}] = $feat->properties->{$valueColumn};
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
                $wfsRequest = new \Lizmap\Request\WFSRequest($lproj, $params, \lizmap::getServices(), \lizmap::getAppContext());
                $wfsResult = $wfsRequest->process();

                $data = $wfsResult->data;
                if (property_exists($wfsResult, 'file') and $wfsResult->file and is_file($data)) {
                    $data = \jFile::read($data);
                }
                $mime = $wfsResult->mime;

                if ($data && (strpos($mime, 'text/json') === 0
                            || strpos($mime, 'application/json') === 0
                            || strpos($mime, 'application/vnd.geo+json') === 0)) {
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
        }

        return $result;
    }

    public function getLabel2($key, $form)
    {
        $privateData = $form->getContainer()->privateData;

        $valueRelationData = $privateData['qgis_controls'][$this->ref]['valueRelationData'];

        $layerId = $valueRelationData['layer'];
        $valueColumn = $valueRelationData['value'];
        $keyColumn = $valueRelationData['key'];
        $filterExpression = $valueRelationData['filterExpression'];

        $repository = $privateData['liz_repository'];
        $project = $privateData['liz_project'];
        $lproj = \lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($layerId);

        $filter = '"'.$keyColumn.'" = ';
        if (is_numeric($key)) {
            $filter .= ''.$key;
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
        $wfsRequest = new \Lizmap\Request\WFSRequest($lproj, $params, \lizmap::getServices(), \lizmap::getAppContext());
        $wfsResult = $wfsRequest->process();

        $data = $wfsResult->data;
        if (property_exists($wfsResult, 'file') and $wfsResult->file and is_file($data)) {
            $data = \jFile::read($data);
        }
        $mime = $wfsResult->mime;

        if ($data && (strpos($mime, 'text/json') === 0
                      || strpos($mime, 'application/json') === 0
                      || strpos($mime, 'application/vnd.geo+json') === 0)) {
            $json = json_decode($data);
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
