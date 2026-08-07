<?php

/**
 * Give access to qgis mapLayer configuration.
 *
 * @author    3liz
 * @copyright 2013-2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
use Lizmap\App\SqlTools;

class qgisVectorLayerDatasource
{
    protected $provider;

    protected $datasource;

    /**
     * constructor.
     *
     * @param mixed $provider
     * @param mixed $datasource
     */
    public function __construct($provider, $datasource)
    {
        $this->provider = $provider;
        if ($this->provider == 'ogr' && preg_match('#layername=#', $datasource)) {
            $this->datasource = $this->parseOgrConnection($datasource);
        } else {
            $this->datasource = SqlTools::parseQgisConnectionString($datasource);
        }
    }

    public function getDatasourceParameter($param)
    {
        if (isset($this->datasource[$param])) {
            return $this->datasource[$param];
        }

        return '';
    }

    private function parseOgrConnection($datasource)
    {
        $split = explode('|', $datasource);
        $dbname = trim($split[0]);
        $table = trim(str_replace('layername=', '', $split[1]));
        $sql = '';
        if (count($split) == 3) {
            $sql = trim(str_replace('subset=', '', $split[2]));
        }

        return array(
            'dbname' => $dbname,
            'service' => '',
            'host' => '',
            'port' => '',
            'user' => '',
            'password' => '',
            'sslmode' => '',
            'authcfg' => '',
            'key' => '',
            'estimatedmetadata' => '',
            'selectatid' => '',
            'srid' => '',
            'type' => '',
            'checkPrimaryKeyUnicity' => '',
            'table' => $table,
            // Handle schema and tablename like getDatasourceParameterSql does
            'tablename' => trim($table),
            'schema' => '',
            'geocol' => 'geom',
            'sql' => $sql,
        );
    }
}
