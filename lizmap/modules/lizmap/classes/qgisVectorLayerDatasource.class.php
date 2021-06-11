<?php
/**
 * Give access to qgis mapLayer configuration.
 *
 * @author    3liz
 * @copyright 2013-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisVectorLayerDatasource
{
    /**
     * @var array Regexes used to get datasource parameters
     */
    protected $datasourceRegexes = array(
        'dbname' => "dbname='?([^ ']+)'? ",
        'service' => "service='?([^ ']+)'? ",
        'host' => "host='?([^ ']+)'? port=",
        'port' => 'port=([0-9]+) ',
        'user' => "user='?([^ ']+)'? ",
        'password' => "password='?([^ ']+)'? ",
        'sslmode' => "sslmode='?([^ ']+)'? ",
        'key' => "key='?([^ ']+)'? ",
        'estimatedmetadata' => 'estimatedmetadata=([^ ]+) ',
        'selectatid' => 'selectatid=([^ ]+) ',
        'srid' => 'srid=([0-9]+) ',
        'type' => 'type=([a-zA-Z]+) ',
        'checkPrimaryKeyUnicity' => "checkPrimaryKeyUnicity='([0-1]+)' ",
        'table' => 'table="(.+?)"($|\s)',
        'geocol' => '\(([^ ]+)\)',
        'sql' => ' sql=(.*)$',
    );

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
        $this->datasource = $datasource;
    }

    public function getDatasourceParameter($param)
    {
        if ($this->provider == 'ogr' and preg_match('#layername=#', $this->datasource)) {
            return $this->getDatasourceParameterOgr($param);
        }

        return $this->getDatasourceParameterSql($param);
    }

    private function getDatasourceParameterSql($param)
    {
        $value = '';

        // For tablename and schema, first get table
        // and then get table name or schema
        if ($param == 'tablename' or $param == 'schema') {
            $table = $this->getDatasourceParameter('table');
            if (substr($table, 0, 1) == '"') {
                $exp = explode('.', str_replace('"', '', $table));
                if ($param == 'tablename') {
                    $value = $exp[1];
                } elseif ($param == 'schema') {
                    $value = $exp[0];
                }
            } else {
                if ($param == 'tablename') {
                    $value = $table;
                } elseif ($param == 'schema') {
                    $value = '';
                }
            }

            return trim($value);
        }

        // For other parameters, use specific parameter regex
        $regex = $this->datasourceRegexes[$param];

        preg_match(
            '#'.$regex.'#s',
            $this->datasource,
            $result
        );

        $nb_result = count($result);
        if ((2 <= $nb_result) and ($nb_result <= 3) and strlen($result[1])) {
            $value = $result[1];

            // Specific parsing for complex table parameter
            if ($param == 'table') {
                $table = $value;

                // Complex subquery
                if (substr($table, 0, 1) == '(' and substr($table, -1) == ')') {
                    $table = $table.' fooliz';
                    // remove \" which escapes table and schema names in QGIS WML within subquery
                    $table = str_replace('\"', '"', $table);
                }
                // Simple "schemaname"."table_name"
                elseif (preg_match('#"."#', $table)) {
                    $table = '"'.$table.'"';
                }
                $value = $table;
            }
        }

        return trim($value);
    }

    private function getDatasourceParameterOgr($param)
    {
        $split = explode('|', $this->datasource);
        $dbname = $split[0];
        $table = str_replace('layername=', '', $split[1]);
        $sql = '';
        if (count($split) == 3) {
            $sql = str_replace('subset=', '', $split[2]);
        }
        $ds = array(
            'dbname' => $dbname,
            'service' => '',
            'host' => '',
            'port' => '',
            'user' => '',
            'password' => '',
            'sslmode' => '',
            'key' => '',
            'estimatedmetadata' => '',
            'selectatid' => '',
            'srid' => '',
            'type' => '',
            'checkPrimaryKeyUnicity' => '',
            'table' => $table,
            'geocol' => 'geom',
            'sql' => $sql,
        );

        return trim($ds[$param]);
    }
}
