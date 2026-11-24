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

use GuzzleHttp\Psr7\Utils as Psr7Utils;
use Lizmap\App\Checker;
use Lizmap\DataTables\DataTables;
use Lizmap\Project\Project;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\FeatureStream;
use Lizmap\Request\Proxy;
use Lizmap\Request\WFSAggregateRequest;
use Lizmap\Request\WFSRequest;
use proj4php\Point as Proj4Point;
use proj4php\Proj as Proj4Proj;
use proj4php\Proj4php;

class datatablesCtrl extends jController
{
    /**
     * @var null|string The repository key string
     */
    private $repository;

    /**
     * @var null|string The qgis project key
     */
    private $project;

    /**
     * @var null|string The layer id
     */
    private $layerId;

    /**
     * @var null|string Pagination start
     */
    private $DTStart;

    /**
     * @var null|string Number of features per page
     */
    private $DTLength;

    /**
     * @var mixed Array of columns order
     */
    private $DTOrder;

    /**
     * @var mixed Array of columns name
     */
    private $DTColumns;

    /**
     * @var null|array Array of search builder condition criteria
     */
    private $DTSearchBuilder;

    /**
     * @var string Value of the quick search on all the columns
     */
    private $searchValue = '';

    /**
     * @var string[] the columns not searched by the quick search, because too many labels match the search
     */
    private $quickSearchSkippedColumns = array();

    /**
     * @var null|string srs code
     */
    private $srsName;

    /**
     * @var array bbox array
     */
    private $bbox;

    /**
     * @var array Array of filtered features ids
     */
    private $filteredFeatureIDs;

    /**
     * @var null|string WFS expression filter
     */
    private $expFilter;

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

    /**
     * Get the Lizmap project. If the project does not exist, the user does not have the right to access the project
     * or the user does not have access to WFS data, set the error response.
     *
     * @param jResponseJson $rep - the response object to which the error details will be assigned
     *
     * @return null|Project - the Lizmap project or null
     */
    private function getProject(jResponseJson $rep): ?Project
    {
        $lproj = null; // Initialize the variable outside the try-catch block

        try {
            $lproj = lizmap::getProject($this->repository.'~'.$this->project);
            if (!$lproj) {
                $this->setErrorResponse($rep, 404, 'The lizmap project '.$this->repository.'~'.$this->project.' does not exist.');
            }
        } catch (UnknownLizmapProjectException $e) {
            $this->setErrorResponse($rep, 404, 'The lizmap project '.$this->repository.'~'.$this->project.' does not exist.');
        }

        if (!$lproj) {
            return $lproj;
        }

        // Check rights to access this repository/project
        if (!$lproj->checkAcl()) {
            $this->setErrorResponse($rep, 403, 'Access forbidden');

            return null;
        }

        // Datatables expose WFS data: enforce the same WFS authorization as the OGC
        // service endpoint.
        if (!Checker::checkWfsAccessAcl($lproj)) {
            $this->setErrorResponse($rep, 403, 'Access forbidden');

            return null;
        }

        return $lproj;
    }

    /**
     * Assign values to class instance property.
     */
    private function initClassProperties()
    {
        $this->repository = $this->param('repository');
        $this->project = $this->param('project');
        $this->layerId = $this->param('layerId');
        $this->DTStart = $this->param('start');
        $this->DTLength = $this->param('length');
        $this->DTOrder = $this->param('order');
        $this->DTColumns = $this->param('columns');
        $this->DTSearchBuilder = $this->param('searchBuilder');
        // Quick search on all the columns, sent by DataTables as search[value]
        $search = $this->param('search');
        $this->searchValue = '';
        if (is_array($search) && isset($search['value']) && is_string($search['value'])) {
            $this->searchValue = trim($search['value']);
        }
        $this->filteredFeatureIDs = $this->param('filteredfeatureids') ? explode(',', $this->param('filteredfeatureids')) : array();
        $this->srsName = $this->param('srsname');
        $this->bbox = $this->param('bbox') && $this->srsName ? explode(',', $this->param('bbox')) : array();
        $this->expFilter = $this->getExpFilter();
    }

    /**
     * Return expression filter parameter.
     *
     * @return null|string
     */
    private function getExpFilter()
    {
        $expFilter = $this->param('exp_filter');
        if (count($this->filteredFeatureIDs) > 0) {
            $filteredFeatureIDSFilter = '$id IN ('.implode(' , ', $this->filteredFeatureIDs).')';
            // concat current exp_filter with filteredFeaturesIds filter
            $expFilter = !$expFilter ? $filteredFeatureIDSFilter : "( {$expFilter} ) AND ( {$filteredFeatureIDSFilter} )";
        }

        // Handle search made by searchBuilder
        if ($this->DTSearchBuilder) {
            $searchBuilderFilter = DataTables::convertSearchToExpression($this->DTSearchBuilder);
            // concat current exp_filter with searchBuilderFilter filter
            $expFilter = !$expFilter ? $searchBuilderFilter : "( {$expFilter} ) AND ( {$searchBuilderFilter} )";
        }

        return $expFilter;

    }

    /**
     * Get the columns searched by the quick search.
     *
     * The columns are the DataTables columns which are searchable and published
     * in WFS, as the client can not be trusted.
     *
     * @param qgisVectorLayer $layer the layer
     *
     * @return string[] the names of the searched columns
     */
    private function getQuickSearchColumns(qgisVectorLayer $layer): array
    {
        if (!is_array($this->DTColumns)) {
            return array();
        }

        $wfsFields = $layer->getWfsFields();
        $columns = array();
        foreach ($this->DTColumns as $column) {
            // A column without data or not searchable
            if (!is_array($column) || !isset($column['data']) || !is_string($column['data'])) {
                continue;
            }
            if (isset($column['searchable'])
                && ($column['searchable'] === false || $column['searchable'] === 'false')) {
                continue;
            }
            // Only the fields published in WFS
            if (in_array($column['data'], $wfsFields, true) && !in_array($column['data'], $columns, true)) {
                $columns[] = $column['data'];
            }
        }

        return $columns;
    }

    /**
     * Get the labels of the searched columns displayed with labels in the table.
     *
     * The labels of the value maps are stored in the project. For the value relations
     * and the relation references, only the labels matching the quick search are requested
     * in the source layer. If there are too many, the column is not searched and is added
     * to the skipped columns. If they can not be requested, e.g. the source layer is not
     * published in WFS, or for the value relations with multiple values, the codes are
     * searched as for the other columns.
     *
     * @param Project         $lproj   the project
     * @param qgisVectorLayer $layer   the layer
     * @param string[]        $columns the names of the searched columns
     *
     * @return array<string, array> the labels indexed by code, for each column with labels
     */
    private function getQuickSearchLabeledValues(Project $lproj, qgisVectorLayer $layer, array $columns): array
    {
        $fieldsConfig = $lproj->getLayersLabeledFieldsConfig()[$layer->getName()] ?? array();
        if (!is_array($fieldsConfig)) {
            return array();
        }

        $labeledValues = array();
        foreach ($columns as $column) {
            $fieldConfig = $fieldsConfig[$column] ?? null;
            if (!is_array($fieldConfig)) {
                continue;
            }
            $type = $fieldConfig['type'] ?? '';

            // Value map: the labels are in the project
            if ($type === 'ValueMap') {
                if (!empty($fieldConfig['data']) && is_array($fieldConfig['data'])) {
                    $labeledValues[$column] = $fieldConfig['data'];
                }

                continue;
            }

            // Value relation with a single value or relation reference: the labels are in the source layer
            if ($type === 'RelationReference' || ($type === 'ValueRelation' && empty($fieldConfig['allow_multi']))) {
                $labels = $this->getSourceLayerLabels($lproj, $fieldConfig);
                if ($labels === null) {
                    continue;
                }
                if (count($labels) > DataTables::QUICK_SEARCH_MAX_LABELS) {
                    // Too many labels: the column is not searched
                    $this->quickSearchSkippedColumns[] = $column;
                    $labels = array();
                }
                $labeledValues[$column] = $labels;
            }
        }

        return $labeledValues;
    }

    /**
     * Get the labels of the source layer of a value relation or of a relation reference
     * matching the quick search.
     *
     * At most DataTables::QUICK_SEARCH_MAX_LABELS + 1 labels are requested, to know if
     * there are too many. The filter expression of the value relation is not used: it often
     * depends on the form, and only the codes stored in the layer can be found.
     *
     * @param Project $lproj       the project
     * @param array   $fieldConfig the configuration of the field with labels, with the keys
     *                             source_layer_id, code_field and label_field
     *
     * @return null|array<string, string> the labels indexed by code, or null if they can not be requested
     */
    private function getSourceLayerLabels(Project $lproj, array $fieldConfig): ?array
    {
        // The source layer, with the code and the label fields published in WFS
        $sourceLayer = $lproj->getLayer($fieldConfig['source_layer_id'] ?? '');
        if (!$sourceLayer instanceof qgisVectorLayer) {
            return null;
        }
        $codeField = $fieldConfig['code_field'] ?? '';
        $labelField = $fieldConfig['label_field'] ?? '';
        $wfsFields = $sourceLayer->getWfsFields();
        if (!is_string($codeField) || !is_string($labelField)
            || !in_array($codeField, $wfsFields, true) || !in_array($labelField, $wfsFields, true)) {
            return null;
        }

        // The filter on the label, run as SQL by Lizmap if possible
        $dbFieldTypes = $this->getQuickSearchDbFieldTypes($sourceLayer, '');
        $unaccentFunction = ($dbFieldTypes !== null) ? $this->getUnaccentFunction($sourceLayer) : null;
        $filter = DataTables::buildLabelSearchExpression($this->searchValue, $labelField, $dbFieldTypes, $unaccentFunction);
        if ($filter === '') {
            return null;
        }

        // Request the codes and the labels
        $wfsParams = WFSRequest::buildGetFeatureParameters(
            $sourceLayer->getWfsTypeName(),
            array(
                'PROPERTYNAME' => $codeField.','.$labelField,
                'GEOMETRYNAME' => 'none',
                'EXP_FILTER' => $filter,
                'MAXFEATURES' => (string) (DataTables::QUICK_SEARCH_MAX_LABELS + 1),
            )
        );
        $wfsrequest = new WFSRequest($lproj, $wfsParams, lizmap::getServices());
        $wfsresponse = $wfsrequest->process();
        if ($wfsresponse->getCode() >= 400
            || !str_contains(strtolower($wfsresponse->getMime()), 'application/vnd.geo+json')) {
            return null;
        }
        $data = json_decode($wfsresponse->getBodyAsString(), true);
        if (!is_array($data) || !isset($data['features']) || !is_array($data['features'])) {
            return null;
        }

        // The labels indexed by code
        $labels = array();
        foreach ($data['features'] as $feature) {
            $properties = $feature['properties'] ?? null;
            if (!is_array($properties) || !isset($properties[$codeField], $properties[$labelField])) {
                continue;
            }
            if (!is_scalar($properties[$codeField]) || !is_scalar($properties[$labelField])) {
                continue;
            }
            $labels[(string) $properties[$codeField]] = (string) $properties[$labelField];
        }

        return $labels;
    }

    /**
     * Get the PostgreSQL types of the layer fields, if the WFS requests are run as SQL by Lizmap.
     *
     * It follows the conditions of WFSRequest::getfeaturePostgres(): a PostgreSQL table,
     * not a SQL query, with all the WFS fields in the database (no virtual field) and,
     * if the expression filter uses $id, a single primary key. When the fields types are
     * returned, the quick search can use database functions, not known by QGIS Server.
     *
     * @param qgisVectorLayer $layer     the layer
     * @param string          $expFilter the expression filter of the request
     *
     * @return null|array<string, string> the type of each field, or null if the filter is evaluated by QGIS Server
     */
    private function getQuickSearchDbFieldTypes(qgisVectorLayer $layer, string $expFilter): ?array
    {
        // A PostgreSQL table, not a SQL query
        if ($layer->getProvider() != 'postgres') {
            return null;
        }
        $dtParams = $layer->getDatasourceParameters();
        if (!$dtParams->table || $dtParams->table[0] == '(') {
            return null;
        }

        try {
            $dbFields = $layer->getDbFieldList();
        } catch (Exception $e) {
            return null;
        }
        if (!is_array($dbFields) || !array_key_exists($dtParams->key, $dbFields)) {
            return null;
        }

        // All the WFS fields are in the database
        $types = array();
        foreach ($layer->getWfsFields() as $field) {
            if (!array_key_exists($field, $dbFields)) {
                return null;
            }
            $types[$field] = $dbFields[$field]->type;
        }

        // $id can only be translated for a single primary key
        if ($expFilter && str_contains($expFilter, '$id') && str_contains($dtParams->key, ',')) {
            return null;
        }

        return $types;
    }

    /**
     * Get the PostgreSQL function removing the accents, if it exists in the layer database.
     *
     * The f_unaccent immutable function, advised by the Lizmap documentation, is preferred,
     * as it can be used in an index. It is searched with the search path of the layer connection.
     *
     * @param qgisVectorLayer $layer the PostgreSQL layer
     *
     * @return null|string the function name, f_unaccent or unaccent, or null
     */
    private function getUnaccentFunction(qgisVectorLayer $layer): ?string
    {
        try {
            $cnx = $layer->getDatasourceConnection();
            $sql = "SELECT CASE
                WHEN to_regprocedure('f_unaccent(text)') IS NOT NULL THEN 'f_unaccent'
                WHEN to_regprocedure('unaccent(text)') IS NOT NULL THEN 'unaccent'
                ELSE '' END AS fn";
            $result = $cnx->query($sql)->fetch();
        } catch (Exception $e) {
            jLog::logEx($e, 'lizmapadmin');

            return null;
        }

        if (is_object($result) && in_array($result->fn, array('f_unaccent', 'unaccent'), true)) {
            return $result->fn;
        }

        return null;
    }

    /**
     * Get the number of features of a layer.
     *
     * @param Project $lproj    the project
     * @param string  $typeName the WFS type name of the layer
     *
     * @return null|int the number of features, or null if the request failed
     */
    private function getFeatureCount(Project $lproj, string $typeName): ?int
    {
        $wfsParams = array_merge(
            WFSRequest::buildGetFeatureParameters($typeName),
            WFSRequest::$hitsGetFeatureParameters
        );
        $wfsrequest = new WFSRequest($lproj, $wfsParams, lizmap::getServices());
        $wfsresponse = $wfsrequest->process();
        if ($wfsresponse->getCode() >= 400
            || !str_contains(strtolower($wfsresponse->getMime()), 'application/vnd.geo+json')) {
            return null;
        }

        $hitsData = json_decode($wfsresponse->getBodyAsString());
        if (!is_object($hitsData) || !property_exists($hitsData, 'numberOfFeatures')) {
            return null;
        }

        return (int) $hitsData->numberOfFeatures;
    }

    /**
     * Add the quick search on all the columns to the expression filter.
     *
     * The quick search is disabled for the layers evaluated by QGIS Server above
     * DataTables::QUICK_SEARCH_MAX_FEATURES features. When it is disabled, the search is ignored.
     *
     * @param Project         $lproj        the project
     * @param qgisVectorLayer $layer        the layer
     * @param null|int        $featureCount the number of features of the layer, requested if null and needed
     *
     * @return bool true if the quick search is enabled for the layer
     */
    private function applyQuickSearch(Project $lproj, qgisVectorLayer $layer, ?int $featureCount = null): bool
    {
        $columns = $this->getQuickSearchColumns($layer);
        $dbFieldTypes = $this->getQuickSearchDbFieldTypes($layer, (string) $this->expFilter);
        $sqlQuery = ($dbFieldTypes !== null);

        // Only the columns which can be searched
        if ($sqlQuery) {
            $columns = array_values(array_filter($columns, function ($column) use ($dbFieldTypes) {
                return DataTables::isQuickSearchDbType($dbFieldTypes[$column]);
            }));
        }

        // The number of features is only needed to search a layer evaluated by QGIS Server
        if ($featureCount === null) {
            $featureCount = 0;
            if (!$sqlQuery && $this->searchValue !== '') {
                $featureCount = $this->getFeatureCount($lproj, $layer->getWfsTypeName());
                if ($featureCount === null) {
                    return false;
                }
            }
        }

        $enabled = DataTables::isQuickSearchEnabled($sqlQuery, $featureCount, count($columns));

        // Nothing to search or search disabled
        if ($this->searchValue === '' || !$enabled) {
            return $enabled;
        }

        // Build the expression, without accents if possible, on the labels of the columns with labels
        $unaccentFunction = $sqlQuery ? $this->getUnaccentFunction($layer) : null;
        $labeledValues = $this->getQuickSearchLabeledValues($lproj, $layer, $columns);
        $searchFilter = DataTables::buildQuickSearchExpression($this->searchValue, $columns, $dbFieldTypes, $unaccentFunction, $labeledValues);
        if ($searchFilter) {
            $this->expFilter = !$this->expFilter ? $searchFilter : "( {$this->expFilter} ) AND ( {$searchFilter} )";
        }

        return $enabled;
    }

    public function index()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Lizmap parameters
        $this->initClassProperties();

        if (!$this->repository || !$this->project || !$this->layerId) {
            return $this->setErrorResponse($rep, 400, 'The parameters repository, project and layerId are mandatory.');
        }

        // Check DataTables parameters
        if (!isset($this->DTStart) || !isset($this->DTLength) || !isset($this->DTOrder) || !isset($this->DTColumns)) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameters start, length'.
            ', order and columns are mandatory.');
        }

        if (!is_array($this->DTOrder) || count($this->DTOrder) == 0 || !array_key_exists(0, $this->DTOrder)
            || !array_key_exists('column', $this->DTOrder[0]) || !array_key_exists('dir', $this->DTOrder[0])) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameter order '.json_encode($this->DTOrder).
            ' is not well formed.');
        }

        if (!is_array($this->DTColumns) || count($this->DTColumns) == 0) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameter columns '.json_encode($this->DTColumns).
            ' is not well formed.');
        }

        // Check if when the bbox is defined, it contains 4 number
        if (count($this->bbox) > 0 && count($this->bbox) != 4) {
            return $this->setErrorResponse($rep, 400, 'The bbox parameter must contain 4 numbers separated by a comma.');
        }

        // Extract info for DataTables parameters
        $DTOrderColumnIndex = $this->DTOrder[0]['column'];
        $DTOrderColumnDirection = $this->DTOrder[0]['dir'] == 'desc' ? 'DESC' : 'ASC';
        if (!array_key_exists($DTOrderColumnIndex, $this->DTColumns)) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameters order and columns are not compatible.');
        }
        if (!array_key_exists('data', $this->DTColumns[$DTOrderColumnIndex])) {
            return $this->setErrorResponse($rep, 400, 'The DataTables parameter columns '.json_encode($this->DTColumns).
            ' is not well formed.');
        }
        $DTOrderColumnName = $this->DTColumns[$DTOrderColumnIndex]['data'];

        // Get project - The response is updated if the project is not available
        $lproj = $this->getProject($rep);
        if (!$lproj) {
            return $rep;
        }

        /** @var null|qgisVectorLayer $layer */
        $layer = $lproj->getLayer($this->layerId);
        if (!$layer) {
            return $this->setErrorResponse($rep, 404, 'The layerId '.$this->layerId.' does not exist.');
        }
        $typeName = $layer->getWfsTypeName();

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
        if (count($this->filteredFeatureIDs) > 0) {
            $recordsFiltered = count($this->filteredFeatureIDs);
        }

        // Quick search on all the columns, depending on the size of the layer
        $quickSearchEnabled = $this->applyQuickSearch($lproj, $layer, (int) $hits);

        if ($this->expFilter) {
            $wfsParamsData['EXP_FILTER'] = $this->expFilter;
        }

        // Handle filter by extent
        if (count($this->bbox) == 4) {
            // Add parameters to get features in the bounding box (paginated)
            $bboxString = implode(',', $this->bbox);
            $wfsParamsData['BBOX'] = $bboxString;
            $wfsParamsData['SRSNAME'] = $this->srsName;
        }

        $wfsParamsPaginated = array(
            'MAXFEATURES' => $this->DTLength,
            'STARTINDEX' => $this->DTStart,
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
        if ($this->expFilter || count($this->bbox) == 4) {

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
            'quickSearch' => array(
                'enabled' => $quickSearchEnabled,
                'skippedColumns' => $this->quickSearchSkippedColumns,
            ),
        );

        $rep->data = $returnedData;

        return $rep;
    }

    /**
     * Calculates the total extent of the filtered features, in EPSG:4326.
     *
     * It basically use the same logic of the main endpoint but ignores
     * pagination to get all filtered features. For a PostgreSQL layer, the
     * extent is computed by the database; otherwise the features are got
     * via WFS to calculate it.
     *
     * @return jResponseJson
     */
    public function filteredFeaturesExtent()
    {

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Lizmap parameters
        $this->initClassProperties();

        if (!$this->repository || !$this->project || !$this->layerId) {
            return $this->setErrorResponse($rep, 400, 'The parameters repository, project and layerId are mandatory.');
        }

        // Check if when the bbox is defined, it contains 4 number
        if (count($this->bbox) > 0 && count($this->bbox) != 4) {
            return $this->setErrorResponse($rep, 400, 'The bbox parameter must contain 4 numbers separated by a comma.');
        }

        // Get project - The response is updated if the project is not available
        $lproj = $this->getProject($rep);
        if (!$lproj) {
            return $rep;
        }

        /** @var null|qgisVectorLayer $layer */
        $layer = $lproj->getLayer($this->layerId);
        if (!$layer) {
            return $this->setErrorResponse($rep, 404, 'The layerId '.$this->layerId.' does not exist.');
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

        // Quick search on all the columns, as for the features displayed in the table
        $this->applyQuickSearch($lproj, $layer);

        $wfsParamsData = WFSRequest::buildGetFeatureParameters($typeName);

        if ($this->expFilter) {
            $wfsParamsData['EXP_FILTER'] = $this->expFilter;
        }

        // Handle filter by extent
        if (count($this->bbox) == 4) {
            // Add parameters to get features in the bounding box
            $bboxString = implode(',', $this->bbox);
            $wfsParamsData['BBOX'] = $bboxString;
            $wfsParamsData['SRSNAME'] = $this->srsName;
        }

        // Compute the extent in the database when possible,
        // with the same parameters selecting the features
        $aggregateRequest = new WFSAggregateRequest($lproj, $wfsParamsData, lizmap::getServices());
        $extent = $aggregateRequest->extent();
        if ($extent !== null) {
            $rep->data = $extent;

            return $rep;
        }
        if (lizmap::getServices()->debugMode == '1') {
            jLog::log('Datatables - '.$this->layerId.' - the extent is not computed by the database: '.$aggregateRequest->getFailureReason(), 'lizmapadmin');
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

        // decode the WFS response stream by blocks of features
        $features = FeatureStream::fromResponse($wfsresponse);

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

            // With a bounding box, the SRSNAME parameter is needed by QGIS Server
            // to read it, and the features are then returned in this CRS:
            // the extent must be transformed into EPSG:4326, expected by the client
            if (count($this->bbox) == 4) {
                $finalExtent = $this->transformExtentTo4326($lproj, $finalExtent, $this->srsName);
            }
        }

        $rep->data = $finalExtent;

        return $rep;
    }

    /**
     * Transform an extent into EPSG:4326.
     *
     * The four corners of the extent are transformed, and the extent of the
     * transformed corners is returned.
     *
     * @param Project      $lproj  the project, giving the CRS definitions
     * @param array<float> $extent the extent [xmin, ymin, xmax, ymax]
     * @param string       $crs    the CRS of the extent, e.g. EPSG:3857
     *
     * @return array<float> the extent in EPSG:4326, or an empty array
     *                      if it can not be transformed
     */
    private function transformExtentTo4326($lproj, array $extent, string $crs): array
    {
        // Nothing to do
        if (strtoupper($crs) == 'EPSG:4326') {
            return $extent;
        }

        try {
            // The source CRS, defined by the project if not known by proj4php
            $proj4 = new Proj4php();
            $definition = $lproj->getProj4($crs);
            if ($definition) {
                $proj4->addDef($crs, $definition);
            }
            $sourceProj = new Proj4Proj($crs, $proj4);
            $destProj = new Proj4Proj('EPSG:4326', $proj4);

            // Transform the four corners
            $xs = array();
            $ys = array();
            foreach (array(array(0, 1), array(0, 3), array(2, 1), array(2, 3)) as $corner) {
                $point = $proj4->transform($sourceProj, $destProj, new Proj4Point($extent[$corner[0]], $extent[$corner[1]]));
                $xs[] = $point->x;
                $ys[] = $point->y;
            }
        } catch (Exception $e) {
            // No zoom rather than a wrong one
            jLog::logEx($e, 'lizmapadmin');

            return array();
        }

        return array(min($xs), min($ys), max($xs), max($ys));
    }

    /**
     * Returns all features corresponding to the searching parameters, ignoring pagination.
     *
     * @return jResponseBinary|jResponseJson
     */
    public function selectFilteredFeatures()
    {

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Lizmap parameters
        $this->initClassProperties();

        if (!$this->repository || !$this->project || !$this->layerId) {
            return $this->setErrorResponse($rep, 400, 'The parameters repository, project and layerId are mandatory.');
        }

        // Check if when the bbox is defined, it contains 4 number
        if (count($this->bbox) > 0 && count($this->bbox) != 4) {
            return $this->setErrorResponse($rep, 400, 'The bbox parameter must contain 4 numbers separated by a comma.');
        }

        // Get project - The response is updated if the project is not available
        $lproj = $this->getProject($rep);
        if (!$lproj) {
            return $rep;
        }

        /** @var null|qgisVectorLayer $layer */
        $layer = $lproj->getLayer($this->layerId);
        if (!$layer) {
            return $this->setErrorResponse($rep, 404, 'The layerId '.$this->layerId.' does not exist.');
        }

        $typeName = $layer->getWfsTypeName();

        // Quick search on all the columns, as for the features displayed in the table
        $this->applyQuickSearch($lproj, $layer);

        $wfsParamsData = WFSRequest::buildGetFeatureParameters($typeName);

        if ($this->expFilter) {
            $wfsParamsData['EXP_FILTER'] = $this->expFilter;
        }

        // Handle filter by extent
        if (count($this->bbox) == 4) {
            // Add parameters to get features in the bounding box (paginated)
            $bboxString = implode(',', $this->bbox);
            $wfsParamsData['BBOX'] = $bboxString;
            $wfsParamsData['SRSNAME'] = $this->srsName;
        }

        $wfsrequest = new WFSRequest($lproj, $wfsParamsData, lizmap::getServices());
        $wfsresponse = $wfsrequest->process();

        if ($wfsresponse->getCode() >= 400) {
            return $this->setErrorResponse($rep, 400, 'The request to get paginated features failed, code: '.$wfsresponse->getCode());
        }
        if (!str_contains(strtolower($wfsresponse->getMime()), 'application/vnd.geo+json')) {
            return $this->setErrorResponse($rep, 400, 'The request to get paginated features failed, mime-type: '.$wfsresponse->getMime());
        }

        /** @var jResponseBinary $binaryRep */
        $binaryRep = $this->getResponse('binary');
        $binaryRep->mimeType = 'application/json';

        $binaryRep->setContentCallback(function () use ($wfsresponse) {
            $output = Psr7Utils::streamFor(fopen('php://output', 'w+'));
            Psr7Utils::copyToStream($wfsresponse->getBodyAsStream(), $output);
        });

        return $binaryRep;
    }
}
