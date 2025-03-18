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

use Lizmap\Request\WFSRequest;

class datatablesCtrl extends jController
{
    public function index()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'datatables.json';
        $rep->mimeType = 'application/json';

        // Lizmap parameters
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');

        // DataTables parameters
        $DTStart = $this->param('start');
        $DTLength = $this->param('length');

        $DTOrder = $this->param('order');
        $DTColumns = $this->param('columns');
        $DTOrderColumnIndex = $DTOrder[0]['column'];
        $DTOrderColumnDirection = $DTOrder[0]['dir'] == 'desc' ? 'd' : '';
        $DTOrderColumnName = $DTColumns[$DTOrderColumnIndex]['data'];

        $DTSearch = $this->param('search');

        $lproj = lizmap::getProject($repository.'~'.$project);
        $layer = $lproj->getLayer($layerId);
        $typeName = $layer->getWfsTypeName();

        $wfsparams = array(
            'SERVICE' => 'WFS',
            'VERSION' => '1.0.0',
            'REQUEST' => 'GetFeature',
            'TYPENAME' => $typeName,
            'OUTPUTFORMAT' => 'GeoJSON',
            'GEOMETRYNAME' => 'none',
            'MAXFEATURES' => $DTLength,
            'SORTBY' => $DTOrderColumnName.' '.$DTOrderColumnDirection,
            'STARTINDEX' => $DTStart,
        );

        $wfsrequest = new WFSRequest($lproj, $wfsparams, lizmap::getServices());
        $wfsresponse = $wfsrequest->process();
        $featureData = $wfsresponse->getBodyAsString();
        $jsonFeatures = json_decode($featureData)->features;
        $data = array();
        foreach ($jsonFeatures as $key => $feature) {
            $dataObject = array_merge(
                array(
                    'DT_RowId' => (int) explode('.', $feature->id)[1],
                    'lizSelected' => '',
                    'featureToolbar' => '',
                ),
                (array) $feature->properties
            );
            $data[] = $dataObject;
        }
        // jLog::log(var_export(, true), 'error');

        $returnedData = array(
            'draw' => (int) $this->param('draw'),
            'recordsTotal' => 31, // TODO: get the total number of features
            'recordsFiltered' => 31,
            'data' => $data,
            // 'error' => 'error',
        );

        $rep->content = json_encode($returnedData);
        // $rep->content = $wfsresponse;

        return $rep;
    }
}
