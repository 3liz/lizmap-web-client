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
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Lizmap parameters
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $filteredFeatureIDs = array();
        if ($this->param('filteredfeatureids')) {
            $filteredFeatureIDs = explode(',', $this->param('filteredfeatureids'));
        }
        $expFilter = $this->param('exp_filter');

        $bbox = array();
        $srsName = $this->param('srsname');
        if ($this->param('bbox') && $srsName) {
            $bbox = explode(',', $this->param('bbox'));
        }

        // DataTables parameters
        $DTStart = $this->param('start');
        $DTLength = $this->param('length');

        $DTOrder = $this->param('order');
        $DTColumns = $this->param('columns');
        $DTOrderColumnIndex = $DTOrder[0]['column'];
        $DTOrderColumnDirection = $DTOrder[0]['dir'] == 'desc' ? 'd' : '';
        $DTOrderColumnName = $DTColumns[$DTOrderColumnIndex]['data'];

        $DTSearchBuilder = '';
        if ($this->param('searchBuilder')) {
            $DTSearchBuilder = $this->param('searchBuilder');
        }

        $lproj = lizmap::getProject($repository.'~'.$project);

        /** @var qgisVectorLayer $layer */
        $layer = $lproj->getLayer($layerId);
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

        $wfsrequest = new WFSRequest($lproj, array_merge($wfsParamsData, $wfsParamsHits), lizmap::getServices());
        $wfsresponse = $wfsrequest->process();
        $hitsData = $wfsresponse->getBodyAsString();
        preg_match('/numberOfFeatures="([0-9]+)"/', $hitsData, $matches);
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
            foreach ($DTSearchBuilder['criteria'] as $criteria) {
                $column = $criteria['data'];
                $condition = $criteria['condition'];
                $value = '';
                $value1 = isset($criteria['value1']) ? addslashes($criteria['value1']) : '';
                $value2 = isset($criteria['value2']) ? addslashes($criteria['value2']) : '';

                // Map DataTables operators to QGIS Server operators
                $qgisOperator = '';

                switch ($condition) {
                    case '=':
                    case '!=':
                    case '<':
                    case '<=':
                    case '>':
                    case '>=':
                        $qgisOperator = $condition;
                        if ($criteria['type'] == 'num') {
                            $value = $value1;
                        } else {
                            $value = '\''.$value1.'\'';
                        }

                        break;

                    case 'starts':
                        $qgisOperator = 'ILIKE';
                        $value = '\''.$value1.'%\'';

                        break;

                    case '!starts':
                        $qgisOperator = 'NOT ILIKE';
                        $value = '\''.$value1.'%\'';

                        break;

                    case 'contains':
                        $qgisOperator = 'ILIKE';
                        $value = '\'%'.$value1.'%\'';

                        break;

                    case '!contains':
                        $qgisOperator = 'NOT ILIKE';
                        $value = '\'%'.$value1.'%\'';

                        break;

                    case 'ends':
                        $qgisOperator = 'ILIKE';
                        $value = '\'%'.$value1.'\'';

                        break;

                    case '!ends':
                        $qgisOperator = 'NOT ILIKE';
                        $value = '\'%'.$value1.'\'';

                        break;

                    case 'null':
                        $qgisOperator = 'IS NULL';

                        break;

                    case '!null':
                        $qgisOperator = 'IS NOT NULL';

                        break;

                    case 'between':
                        $qgisOperator = 'BETWEEN';
                        if ($criteria['type'] == 'num') {
                            $value = $value1.' AND '.$value2;
                        } else {
                            $value = '\''.$value1.'\' AND \''.$value2.'\'';
                        }

                        break;

                    case '!between':
                        $qgisOperator = 'NOT BETWEEN';
                        if ($criteria['type'] == 'num') {
                            $value = $value1.' AND '.$value2;
                        } else {
                            $value = '\''.$value1.'\' AND \''.$value2.'\'';
                        }

                        break;
                }
                // Append the filter to the exp_filter string
                if (!empty($expFilter)) {
                    $logic = isset($DTSearchBuilder['logic']) ? $DTSearchBuilder['logic'] : 'AND';
                    $expFilter .= " {$logic} ";
                }

                $expFilter .= "{$column} {$qgisOperator} {$value}";
            }
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

        $wfsrequest = new WFSRequest($lproj, array_merge($wfsParamsData, $wfsParamsPaginated), lizmap::getServices());
        $wfsresponse = $wfsrequest->process();
        $featureData = $wfsresponse->getBodyAsString();

        // Get hits when data is filtered
        if ($expFilter || count($bbox) == 4) {

            $wfsrequest = new WFSRequest($lproj, array_merge($wfsParamsData, $wfsParamsHits), lizmap::getServices());
            $wfsresponse = $wfsrequest->process();
            $filterByExtentHitsData = $wfsresponse->getBodyAsString();
            preg_match('/numberOfFeatures="([0-9]+)"/', $filterByExtentHitsData, $matches);
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
            'recordsTotal' => $hits,
            'recordsFiltered' => $recordsFiltered,
            'data' => json_decode($featureData),
            'editableFeatures' => $editableFeaturesRep,
        );

        $rep->data = $returnedData;

        return $rep;
    }
}
