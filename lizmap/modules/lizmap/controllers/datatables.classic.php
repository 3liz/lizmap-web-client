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

        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');

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
        );

        $wfsrequest = new WFSRequest($lproj, $wfsparams, lizmap::getServices());
        $wfsresponse = $wfsrequest->process();
        $featureData = $wfsresponse->getBodyAsString();
        $rep->content = $featureData;

        return $rep;
    }
}
