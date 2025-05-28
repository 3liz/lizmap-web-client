<?php

namespace Lizmap\Form;

use GuzzleHttp\Psr7\StreamWrapper as Psr7StreamWrapper;
use JsonMachine\Items as JsonMachineItems;
use Lizmap\Request\WFSRequest;

class QgisFormValueRelationDynamicDatasource extends \jFormsDynamicDatasource
{
    // protected $formid;
    protected $ref;
    protected $forceEmptyValue;

    public function __construct($ref, $forceEmptyValue = false)
    {
        // $this->formid = $formid;
        $this->ref = $ref;
        $this->forceEmptyValue = $forceEmptyValue;
    }

    public function getForceEmptyValue()
    {
        if ($this->forceEmptyValue) {
            return true;
        }

        return false;
    }

    public function setForceEmptyValue($forceEmptyValue)
    {
        $this->forceEmptyValue = $forceEmptyValue;
    }

    public function getData($form)
    {
        $privateData = $form->getContainer()->privateData;

        $valueRelationData = $privateData['qgis_controls'][$this->ref]['valueRelationData'];

        $layerId = $valueRelationData['layer'];
        $valueColumn = $valueRelationData['value'];
        $keyColumn = $valueRelationData['key'];
        $filterExpression = $valueRelationData['filterExpression'];

        $repository = $form->getData('liz_repository');
        $project = $form->getData('liz_project');
        $lproj = \lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($layerId);

        $result = array();
        if ($layer) {
            if ($filterExpression !== '') {
                // build feature's form
                $geom = null;
                $values = array();
                // check criteria controls
                $criteriaControls = $this->getCriteriaControls();
                if ($criteriaControls !== null && is_array($criteriaControls)) {
                    foreach ($criteriaControls as $ref) {
                        if ($ref == $form->getData('liz_geometryColumn')) {
                            // from wkt to geom
                            $wkt = trim($form->getData($ref));
                            if ($wkt && \lizmapWkt::check($wkt)) {
                                $geom = \lizmapWkt::parse($wkt);
                                if ($geom === null) {
                                    \jLog::log('Parsing WKT failed! '.$wkt, 'error');
                                }
                            }
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
                $features = \qgisExpressionUtils::getFeatureWithFormScope($layer, $filterExpression, $form_feature, array($keyColumn, $valueColumn), true);
                foreach ($features as $feat) {
                    if (property_exists($feat, 'properties')
                        and property_exists($feat->properties, $keyColumn)
                        and property_exists($feat->properties, $valueColumn)) {
                        $result[(string) $feat->properties->{$keyColumn}] = $feat->properties->{$valueColumn};
                    }
                }
            } else {
                $typename = $layer->getWfsTypeName();
                $params = array(
                    'SERVICE' => 'WFS',
                    'VERSION' => '1.0.0',
                    'REQUEST' => 'GetFeature',
                    'TYPENAME' => $typename,
                    'PROPERTYNAME' => $valueColumn.','.$keyColumn,
                    'OUTPUTFORMAT' => 'GeoJSON',
                    'GEOMETRYNAME' => 'none',
                );

                // Get request
                $wfsRequest = new WFSRequest($lproj, $params, \lizmap::getServices());
                // Set Editing context
                $wfsRequest->setEditingContext(true);
                // Process request
                $wfsResult = $wfsRequest->process();

                $code = $wfsResult->getCode();
                $mime = $wfsResult->getMime();

                if ($code < 400 && (strpos($mime, 'text/json') === 0
                                    || strpos($mime, 'application/json') === 0
                                    || strpos($mime, 'application/vnd.geo+json') === 0)) {

                    $featureStream = Psr7StreamWrapper::getResource($wfsResult->getBodyAsStream());
                    $features = JsonMachineItems::fromStream($featureStream, array('pointer' => '/features'));
                    foreach ($features as $feat) {
                        if (property_exists($feat, 'properties')
                            and property_exists($feat->properties, $keyColumn)
                            and property_exists($feat->properties, $valueColumn)) {
                            $result[(string) $feat->properties->{$keyColumn}] = $feat->properties->{$valueColumn};
                        }
                    }
                }
            }

            // Add default empty value for required fields
            // Checkboxes Widget needs it
            if ($this->forceEmptyValue) {
                $result[''] = '';
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

        $repository = $form->getData('liz_repository');
        $project = $form->getData('liz_project');
        $lproj = \lizmap::getProject($repository.'~'.$project);

        $layer = $lproj->getLayer($layerId);

        $filter = '"'.$keyColumn.'" = ';
        if (is_numeric($key)) {
            $filter .= ''.$key;
        } else {
            $filter .= "'".addslashes($key)."'";
        }

        $typename = $layer->getWfsTypeName();
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
        $wfsRequest = new WFSRequest($lproj, $params, \lizmap::getServices());
        $wfsResult = $wfsRequest->process();

        $data = $wfsResult->data;
        if (substr($data, 0, 7) == 'file://' && is_file(substr($data, 7))) {
            $data = \jFile::read(substr($data, 7));
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
