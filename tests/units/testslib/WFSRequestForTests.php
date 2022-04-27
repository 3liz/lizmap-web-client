<?php

use Lizmap\Request\WFSRequest;

class WFSRequestForTests extends WFSRequest {

    public $datasource;

    public $selectFields;

    public $qgisLayer;

    public $appContext;

    public function __construct()
    {}

    public function getFeatureIdFilterExpForTests($featureid, $typename, $qgisLayer)
    {
        return $this->getFeatureIdFilterExp($featureid, $typename, $qgisLayer);
    }

    public function buildQueryBaseForTests($cnx, $params, $wfsFields)
    {
        return $this->buildQueryBase($cnx, $params, $wfsFields);
    }

    public function getBboxSqlForTests($params)
    {
        return $this->getBboxSql($params);
    }

    public function parseExpFilterForTests($cnx, $params)
    {
        return $this->parseExpFilter($cnx, $params);
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

    public function validateExpressionFilterForTests($filter)
    {
        return $this->validateExpressionFilter($filter);
    }

    public function validateFilterForTests($filter)
    {
        return $this->validateFilter($filter);
    }
}
