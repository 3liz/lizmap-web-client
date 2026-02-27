<?php

/**
 * Send data to datatables ajax requests.
 *
 * @author    3liz
 * @copyright 2025 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

use GuzzleHttp\Psr7\StreamWrapper as Psr7StreamWrapper;
use JsonMachine\Items as JsonMachineItems;
use Lizmap\DataTables\DataTables;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\Proxy;
use Lizmap\Request\WFSRequest;

class datatablesCtrl extends jController
{
    /**
     * Sets the error in the provided response object based on the given HTTP error code.
     *
     * @param jResponseJson $rep          - the response object to which the error details will be assigned
     * @param int           $code         - the HTTP error code
     * @param string        $errorMessage - the custom error message
     *
     * @return jResponseJson returns the updated response object containing the error details
     */
    protected function setErrorResponse(jResponseJson $rep, int $code, string $errorMessage): jResponseJson
    {
        $rep->setHttpStatus($code, Proxy::getHttpStatusMsg($code));
        $rep->data = array(
            'code' => Proxy::getHttpStatusMsg($code),
            'status' => $code,
            'message' => $errorMessage,
        );

        return $rep;
    }

    public function index()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Lizmap parameters
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');

        if (!$repository || !$project || !$layerId) {
            return $this->setErrorResponse($rep, 400, 'The parameters repository, project and layerId are mandatory.');
        }

        // DataTables parameters
        $DTStart = $this->param('start');
        $DTLength = $this->param('length');
        $DTOrder = $this->param('order');
        $DTColumns = $this->param('columns');

        // Check DataTables parameters
        if (!isset($DTStart) || !isset($DTLength) || !isset($DTOrder) || !isset($DTColumns)) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameters start, length'.
            ', order and columns are mandatory.');
        }
        if (!is_array($DTOrder) || count($DTOrder) == 0 || !array_key_exists(0, $DTOrder)
            || !array_key_exists('column', $DTOrder[0]) || !array_key_exists('dir', $DTOrder[0])) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameter order '.json_encode($DTOrder).
            ' is not well formed.');
        }
        if (!is_array($DTColumns) || count($DTColumns) == 0) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameter columns '.json_encode($DTColumns).
            ' is not well formed.');
        }

        // Extract info for DataTables parameters
        $DTOrderColumnIndex = $DTOrder[0]['column'];
        $DTOrderColumnDirection = $DTOrder[0]['dir'] == 'desc' ? 'DESC' : 'ASC';
        if (!array_key_exists($DTOrderColumnIndex, $DTColumns)) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameters order and columns are not compatible.');
        }
        if (!array_key_exists('data', $DTColumns[$DTOrderColumnIndex])) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameter columns '.json_encode($DTColumns).
            ' is not well formed.');
        }
        $DTOrderColumnName = $DTColumns[$DTOrderColumnIndex]['data'];

        $DTSearchBuilder = '';
        if ($this->param('searchBuilder')) {
            $DTSearchBuilder = $this->param('searchBuilder');
        }

        $filteredFeatureIDs = array();
        if ($this->param('filteredfeatureids')) {
            $filteredFeatureIDs = explode(',', $this->param('filteredfeatureids'));
        }
        $expFilter = $this->param('exp_filter');

        // Filter by bounding box
        $bbox = array();
        $srsName = $this->param('srsname');
        if ($this->param('bbox') && $srsName) {
            $bbox = explode(',', $this->param('bbox'));
        }

        // Check if when the bbox is defined, it contains 4 number
        if (count($bbox) > 0 && count($bbox) != 4) {
            return $this->setErrorResponse($rep, 400, 'The bbox parameter must contain 4 numbers separated by a comma.');
        }

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                return $this->setErrorResponse($rep, 404, 'The lizmap project '.$repository.'~'.$project.' does not exist.');
            }
        } catch (UnknownLizmapProjectException $e) {
            return $this->setErrorResponse($rep, 404, 'The lizmap project '.$repository.'~'.$project.' does not exist.');
        }

        /** @var null|qgisVectorLayer $layer */
        $layer = $lproj->getLayer($layerId);
        if (!$layer) {
            return $this->setErrorResponse($rep, 404, 'The layerId '.$layerId.' does not exist.');
        }
        $typeName = $layer->getWfsTypeName();

        $jsonFeatures = array();

        $wfsParamsData = WFSRequest::buildGetFeatureParameters($typeName);

        // Get total number of features
        $hits = 0;
        $wfsParamsHits = WFSRequest::$hitsGetFeatureParameters;
        // Get hits with WFS request
        $wfsrequest = new WFSRequest($lproj, array_merge($wfsParamsData, $wfsParamsHits), lizmap::getServices());
        $wfsresponse = $wfsrequest->process();

        // Check response
        if ($wfsresponse->getCode() >= 400) {
            return $this->setErrorResponse($rep, 400, 'The request to get the total number of features failed, code: '.$wfsresponse->getCode());
        }
        if (!str_contains(strtolower($wfsresponse->getMime()), 'application/vnd.geo+json')) {
            return $this->setErrorResponse($rep, 400, 'The request to get the total number of features failed, mime-type: '.$wfsresponse->getMime());
        }

        $hitsData = json_decode($wfsresponse->getBodyAsString());
        if (!property_exists($hitsData, 'numberOfFeatures')) {
            return $this->setErrorResponse($rep, 400, 'The response of the request to get the total number of features is not well formed.');
        }

        $hits = $hitsData->numberOfFeatures;
        $recordsFiltered = $hits;
        if (count($filteredFeatureIDs) > 0) {
            $recordsFiltered = count($filteredFeatureIDs);
        }

        if (count($filteredFeatureIDs) > 0) {
            $filteredFeatureIDSFilter = '$id IN ('.implode(' , ', $filteredFeatureIDs).')';
            // concat current exp_filter with filteredFeaturesIds filter
            $expFilter = !$expFilter ? $filteredFeatureIDSFilter : "( {$expFilter} ) AND ( {$filteredFeatureIDSFilter} )";
        }

        // Handle search made by searchBuilder
        if ($DTSearchBuilder) {
            $searchBuilderFilter = DataTables::convertSearchToExpression($DTSearchBuilder);
            // concat current exp_filter with searchBuilderFilter filter
            $expFilter = !$expFilter ? $searchBuilderFilter : "( {$expFilter} ) AND ( {$searchBuilderFilter} )";
        }

        if ($expFilter) {
            $wfsParamsData['EXP_FILTER'] = $expFilter;
        }

        // Handle filter by extent
        if (count($bbox) == 4) {
            // Add parameters to get features in the bounding box (paginated)
            $bboxString = implode(',', $bbox);
            $wfsParamsData['BBOX'] = $bboxString;
            $wfsParamsData['SRSNAME'] = $srsName;
        }

        $wfsParamsPaginated = array(
            'MAXFEATURES' => $DTLength,
            'STARTINDEX' => $DTStart,
            'SORTBY' => $DTOrderColumnName.' '.$DTOrderColumnDirection,
        );
        // Get paginated features by a WFS resquest
        $wfsrequest = new WFSRequest($lproj, array_merge($wfsParamsData, $wfsParamsPaginated), lizmap::getServices());
        $wfsresponse = $wfsrequest->process();

        // Check response
        if ($wfsresponse->getCode() >= 400) {
            return $this->setErrorResponse($rep, 400, 'The request to get paginated features failed, code: '.$wfsresponse->getCode());
        }
        if (!str_contains(strtolower($wfsresponse->getMime()), 'application/vnd.geo+json')) {
            return $this->setErrorResponse($rep, 400, 'The request to get paginated features failed, mime-type: '.$wfsresponse->getMime());
        }

        $featureData = $wfsresponse->getBodyAsString();

        // Get hits when data is filtered
        if ($expFilter || count($bbox) == 4) {

            $wfsrequest = new WFSRequest($lproj, array_merge($wfsParamsData, $wfsParamsHits), lizmap::getServices());
            $wfsresponse = $wfsrequest->process();

            // Check response
            if ($wfsresponse->getCode() >= 400) {
                return $this->setErrorResponse($rep, 400, 'The request to get the number of paginated features failed, code: '.$wfsresponse->getCode());
            }
            if (!str_contains(strtolower($wfsresponse->getMime()), 'application/vnd.geo+json')) {
                return $this->setErrorResponse($rep, 400, 'The request to get the number of paginated features failed, mime-type: '.$wfsresponse->getMime());
            }

            $filterByExtentHitsData = json_decode($wfsresponse->getBodyAsString());
            if (!property_exists($hitsData, 'numberOfFeatures')) {
                return $this->setErrorResponse($rep, 400, 'The response of the request to get the number of paginated features is not well formed.');
            }

            $recordsFiltered = $filterByExtentHitsData->numberOfFeatures;
        }

        // Handle editable features
        $editableFeaturesRep = $layer->editableFeatures(array_merge($wfsParamsData, $wfsParamsPaginated), false);
        $editableFeaturesIds = array();
        foreach ($editableFeaturesRep['features'] as $feature) {
            $editableFeaturesIds[] = (int) explode('.', $feature['id'])[1];
        }

        unset($editableFeaturesRep['features']);
        $editableFeaturesRep['featuresids'] = $editableFeaturesIds;

        $returnedData = array(
            'draw' => (int) $this->param('draw'),
            'recordsTotal' => (int) $hits,
            'recordsFiltered' => (int) $recordsFiltered,
            'data' => json_decode($featureData),
            'editableFeatures' => $editableFeaturesRep,
        );

        $rep->data = $returnedData;

        return $rep;
    }

    /**
     * Gets features via WFS and calculates the total extent.
     * It basically use the same logic of the main endpoint but ignores
     * pagination to get all filtered features.
     *
     * @return jResponseJson
     */
    public function filteredFeaturesExtent()
    {

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Lizmap parameters
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');

        if (!$repository || !$project || !$layerId) {
            return $this->setErrorResponse($rep, 400, 'The parameters repository, project and layerId are mandatory.');
        }
        $DTSearchBuilder = '';
        if ($this->param('searchBuilder')) {
            $DTSearchBuilder = $this->param('searchBuilder');
        }

        $filteredFeatureIDs = array();
        if ($this->param('filteredfeatureids')) {
            $filteredFeatureIDs = explode(',', $this->param('filteredfeatureids'));
        }
        $expFilter = $this->param('exp_filter');

        // Filter by bounding box
        $bbox = array();
        $srsName = $this->param('srsname');
        if ($this->param('bbox') && $srsName) {
            $bbox = explode(',', $this->param('bbox'));
        }

        // Check if when the bbox is defined, it contains 4 number
        if (count($bbox) > 0 && count($bbox) != 4) {
            return $this->setErrorResponse($rep, 400, 'The bbox parameter must contain 4 numbers separated by a comma.');
        }

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                return $this->setErrorResponse($rep, 404, 'The lizmap project '.$repository.'~'.$project.' does not exist.');
            }
        } catch (UnknownLizmapProjectException $e) {
            return $this->setErrorResponse($rep, 404, 'The lizmap project '.$repository.'~'.$project.' does not exist.');
        }

        /** @var null|qgisVectorLayer $layer */
        $layer = $lproj->getLayer($layerId);
        if (!$layer) {
            return $this->setErrorResponse($rep, 404, 'The layerId '.$layerId.' does not exist.');
        }

        // filter project layers to get geometry type
        $projectLayers = $lproj->getLayers();
        $layerCfg = $projectLayers->{$layer->getName()};
        if (!property_exists($layerCfg, 'geometryType')
            || $layerCfg->geometryType == 'none'
            || $layerCfg->geometryType == 'unknown'
        ) {
            return $this->setErrorResponse($rep, 404, 'Invalid geometry');
        }

        $pointGeom = $layerCfg->geometryType == 'point';

        $typeName = $layer->getWfsTypeName();

        $wfsParamsData = WFSRequest::buildGetFeatureParameters($typeName);

        if (count($filteredFeatureIDs) > 0) {
            $filteredFeatureIDSFilter = '$id IN ('.implode(' , ', $filteredFeatureIDs).')';
            // concat current exp_filter with filteredFeaturesIds filter
            $expFilter = !$expFilter ? $filteredFeatureIDSFilter : "( {$expFilter} ) AND ( {$filteredFeatureIDSFilter} )";
        }

        // Handle search made by searchBuilder
        if ($DTSearchBuilder) {
            $searchBuilderFilter = DataTables::convertSearchToExpression($DTSearchBuilder);
            // concat current exp_filter with searchBuilderFilter filter
            $expFilter = !$expFilter ? $searchBuilderFilter : "( {$expFilter} ) AND ( {$searchBuilderFilter} )";
        }

        if ($expFilter) {
            $wfsParamsData['EXP_FILTER'] = $expFilter;
        }

        // Handle filter by extent
        if (count($bbox) == 4) {
            // Add parameters to get features in the bounding box (paginated)
            $bboxString = implode(',', $bbox);
            $wfsParamsData['BBOX'] = $bboxString;
            $wfsParamsData['SRSNAME'] = $srsName;
        }

        // if the geometry is not of type point, request the geometry extent,
        // else get default geometry
        if (!$pointGeom) {
            $wfsParamsData['GEOMETRYNAME'] = 'extent';
        }

        $wfsrequest = new WFSRequest($lproj, $wfsParamsData, lizmap::getServices());
        $wfsresponse = $wfsrequest->process();

        if ($wfsresponse->getCode() >= 400) {
            return $this->setErrorResponse($rep, 400, 'The request to get paginated features failed, code: '.$wfsresponse->getCode());
        }
        if (!str_contains(strtolower($wfsresponse->getMime()), 'application/vnd.geo+json')) {
            return $this->setErrorResponse($rep, 400, 'The request to get paginated features failed, mime-type: '.$wfsresponse->getMime());
        }

        // get WFS resposne as a stream, so we can parse it step by step
        $featureStream = Psr7StreamWrapper::getResource($wfsresponse->getBodyAsStream());
        $features = JsonMachineItems::fromStream($featureStream, array('pointer' => '/features'));

        $bboxXMin = null;
        $bboxXMax = null;
        $bboxYMin = null;
        $bboxYMax = null;
        $finalExtent = array();

        foreach ($features as $feat) {
            if (!$pointGeom && property_exists($feat, 'bbox')) {
                $bbox = $feat->bbox;
                if (
                    is_array($bbox)
                    && count($bbox) == 4
                    && $bbox[0] !== null
                    && $bbox[1] !== null
                    && $bbox[2] !== null
                    && $bbox[3] !== null
                ) {
                    $bboxXMin = min((float) $bbox[0], $bboxXMin === null ? (float) $bbox[0] : $bboxXMin);
                    $bboxYMin = min((float) $bbox[1], $bboxYMin === null ? (float) $bbox[1] : $bboxYMin);
                    $bboxXMax = max((float) $bbox[2], $bboxXMax === null ? (float) $bbox[2] : $bboxXMax);
                    $bboxYMax = max((float) $bbox[3], $bboxYMax === null ? (float) $bbox[3] : $bboxYMax);
                }
            } elseif ($pointGeom
                && property_exists($feat, 'geometry')
                && property_exists($feat->geometry, 'coordinates')
            ) {
                $coords = $feat->geometry->coordinates;
                if (
                    is_array($coords)
                    && count($coords) == 2
                    && $coords[0] !== null
                    && $coords[1] !== null
                ) {
                    $bboxXMin = min((float) $coords[0], $bboxXMin === null ? (float) $coords[0] : $bboxXMin);
                    $bboxYMin = min((float) $coords[1], $bboxYMin === null ? (float) $coords[1] : $bboxYMin);
                    $bboxXMax = max((float) $coords[0], $bboxXMax === null ? (float) $coords[0] : $bboxXMax);
                    $bboxYMax = max((float) $coords[1], $bboxYMax === null ? (float) $coords[1] : $bboxYMax);
                }
            }
        }

        if (
            $bboxXMin !== null
            && $bboxYMin !== null
            && $bboxXMax !== null
            && $bboxYMax !== null
        ) {
            $finalExtent = array(
                $bboxXMin,
                $bboxYMin,
                $bboxXMax,
                $bboxYMax,
            );
        }

        $rep->data = $finalExtent;

        return $rep;
    }
}
