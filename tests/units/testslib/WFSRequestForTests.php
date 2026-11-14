<?php

use Lizmap\Request\WFSRequest;

class WFSRequestForTests extends WFSRequest
{
    public $datasource;

    public $selectFields;

    public $qgisLayer;

    public $appContext;

    /**
     * @var array the filters by login returned by getRequestLoginFilters()
     */
    public $loginFiltersForTests = array();

    public function __construct() {}

    /**
     * Get the SQL filters by login set for the tests.
     *
     * @return array the filters by login
     */
    protected function getRequestLoginFilters(): array
    {
        return $this->loginFiltersForTests;
    }

    public function getFeatureIdFilterExpForTests($featureid, $typename, $qgisLayer)
    {
        return $this->getFeatureIdFilterExp($featureid, $typename, $qgisLayer);
    }

    public function buildQueryBaseForTests($cnx, $params, $wfsFields)
    {
        return $this->buildQueryBase($cnx, $params, $wfsFields);
    }

    public function getDatasourceSqlForTests()
    {
        return $this->getDatasourceSql();
    }

    public function getBboxSqlForTests($params)
    {
        return $this->getBboxSql($params);
    }

    public function parseExpFilterForTests($cnx, $params)
    {
        return $this->parseExpFilter($cnx, $params);
    }

    /**
     * Parse the expression filter of the request parameters merged with other filters.
     *
     * @param jDbConnection $cnx          the database connection
     * @param string        $clientFilter the EXP_FILTER parameter sent by the client
     * @param array         $mergedParams the request parameters, with the merged EXP_FILTER
     *
     * @return false|string the SQL filter, or false if the expression filter is not valid
     */
    public function parseMergedExpFilterForTests($cnx, $clientFilter, $mergedParams)
    {
        // The client parameters, as sent by the client
        $this->params = array('exp_filter' => $clientFilter);

        return $this->parseExpFilter($cnx, $mergedParams);
    }

    public function getWhereClauseForTests($cnx, $params)
    {
        $this->params = $params;

        return $this->getWhereClause($cnx, $params);
    }

    public function parseFeatureIdForTests($cnx, $params)
    {
        $this->params = $params;

        return $this->parseFeatureId($cnx, $params);
    }

    public function getQueryOrderForTests($cnx, $params, $wfsFields)
    {
        return $this->getQueryOrder($cnx, $params, $wfsFields);
    }

    public function getSortFieldsForTests($params, $wfsFields)
    {
        return $this->getSortFields($params, $wfsFields);
    }

    public function getSelectedFieldsForTests($params, $wfsFields)
    {
        return $this->getSelectedFields($params, $wfsFields);
    }

    public function getQueryFieldsForTests($params, $wfsFields, $isHitsRequest = false)
    {
        return $this->getQueryFields($params, $wfsFields, $isHitsRequest);
    }

    public function validateFilterForTests($filter)
    {
        return $this->validateFilter($filter);
    }

    public function setGeojsonSqlForTests($sql, $cnx, $typename, $geometryname, int $outputSrid = 4326)
    {
        return $this->setGeojsonSql($sql, $cnx, $typename, $geometryname, $outputSrid);
    }

    public function parseSrsnameSridForTests(string $srsname): ?int
    {
        return $this->parseSrsnameSrid($srsname);
    }
}
