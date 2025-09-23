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

        $wfsParamsData = array(
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $typeName,
        );

        // Get total number of features
        $hits = 0;
        $wfsParamsHits = array(
            'RESULTTYPE' => 'hits',
        );
        // Get hits with WFS request
        $wfsrequest = new WFSRequest($lproj, array_merge($wfsParamsData, $wfsParamsHits), lizmap::getServices());
        $wfsresponse = $wfsrequest->process();

        // Check response
        if ($wfsresponse->getCode() >= 400) {
            return $this->setErrorResponse($rep, 400, 'The request to get the total number of features failed, code: '.$wfsresponse->getCode());
        }
        if (!str_contains(strtolower($wfsresponse->getMime()), 'text/xml')) {
            return $this->setErrorResponse($rep, 400, 'The request to get the total number of features failed, mime-type: '.$wfsresponse->getMime());
        }

        $hitsData = $wfsresponse->getBodyAsString();
        preg_match('/numberOfFeatures="([0-9]+)"/', $hitsData, $matches);

        if (count($matches) < 2) {
            return $this->setErrorResponse($rep, 400, 'The response of the request to get the total number of features is not well formed.');
        }

        $hits = $matches[1];
        $recordsFiltered = $hits;
        if (count($filteredFeatureIDs) > 0) {
            $recordsFiltered = count($filteredFeatureIDs);
        }

        if (count($filteredFeatureIDs) > 0) {
            $wfsParamsData['EXP_FILTER'] = '$id IN ('.implode(' , ', $filteredFeatureIDs).')';
        }

        // Handle search made by searchBuilder
        if ($DTSearchBuilder) {
            $expFilter = DataTables::convertSearchToExpression($DTSearchBuilder);
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
            'OUTPUTFORMAT' => 'GeoJSON',
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
            if (!str_contains(strtolower($wfsresponse->getMime()), 'text/xml')) {
                return $this->setErrorResponse($rep, 400, 'The request to get the number of paginated features failed, mime-type: '.$wfsresponse->getMime());
            }

            $filterByExtentHitsData = $wfsresponse->getBodyAsString();
            preg_match('/numberOfFeatures="([0-9]+)"/', $filterByExtentHitsData, $matches);

            if (count($matches) < 2) {
                return $this->setErrorResponse($rep, 400, 'The response of the request to get the number of paginated features is not well formed.');
            }

            $recordsFiltered = $matches[1];
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
}
