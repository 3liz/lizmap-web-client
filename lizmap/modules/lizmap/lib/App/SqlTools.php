<?php

/**
 * SQL tools for Lizmap.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

class SqlTools
{
    public const PARSER_STATE_BETWEEN_PARAMETERS = 0;
    public const PARSER_STATE_PARAM_NAME = 1;
    public const PARSER_STATE_PARAM_EQUAL = 2;
    public const PARSER_STATE_IN_VALUE = 3;
    public const PARSER_STATE_TABLE_VALUE = 4;
    public const PARSER_STATE_TABLE_SCHEMA = 5;
    public const PARSER_STATE_TABLE_NAME_SEPARATOR = 6;
    public const PARSER_STATE_TABLE_NAME_DBLQUOTE = 7;
    public const PARSER_STATE_TABLE_NAME = 8;
    public const PARSER_STATE_TABLE_SQL = 9;
    public const PARSER_STATE_SQL_VALUE = 10;

    protected static $blockSqlWords = array(
        ';',
        'select',
        'delete',
        'insert',
        'update',
        'drop',
        'alter',
        '--',
        'truncate',
        'vacuum',
        'create',
        'reindex',
        'grant',
        'revoke',
        '/*',
    );

    /**
     * QGIS geometry predicate functions mapped to their PostGIS ST_* equivalents.
     *
     * These are the operators offered by the selection tool and the filter form.
     *
     * @var array<string, string>
     */
    public const GEOMETRY_PREDICATES = array(
        'intersects' => 'ST_Intersects',
        'contains' => 'ST_Contains',
        'within' => 'ST_Within',
        'crosses' => 'ST_Crosses',
        'overlaps' => 'ST_Overlaps',
        'touches' => 'ST_Touches',
        'disjoint' => 'ST_Disjoint',
    );

    /**
     * Validate an expression filter.
     *
     * @param string $filter The expression filter to validate
     *
     * @return array{0: bool, 1: list<string>} returns if the expression does not contains dangerous chars, and the list of blocked items
     */
    public static function validateExpressionFilter(string $filter): array
    {
        $block_items = array();
        $pattern = '#'.implode('|', array_map(fn ($w): string => preg_quote($w, '#'), static::$blockSqlWords)).'#i';

        return array(!preg_match($pattern, $filter, $block_items), $block_items);
    }

    /**
     * Translate a QGIS expression filter into a PostGIS compatible SQL filter.
     *
     * Rewrites the geometry predicate functions used by the selection tool and
     * the filter form (intersects, contains, within, crosses, overlaps, touches,
     * disjoint) to their PostGIS ST_* equivalents, translates geom_from_gml() and
     * replaces the $geometry variable with the given geometry column.
     *
     * The predicate name is matched case-insensitively and only when followed by
     * an opening parenthesis, so plain text and column names are left untouched.
     *
     * @param string $filter         The QGIS expression filter
     * @param string $geometryColumn The layer geometry column name
     *
     * @return string The PostGIS compatible filter
     */
    public static function translateExpressionToPostgis(string $filter, string $geometryColumn): string
    {
        foreach (self::GEOMETRY_PREDICATES as $qgisFunction => $postgisFunction) {
            $filter = preg_replace('/\b'.$qgisFunction.'\s*\(/i', $postgisFunction.'(', $filter);
        }
        $filter = str_replace('geom_from_gml', 'ST_GeomFromGML', $filter);

        return str_replace('$geometry', '"'.$geometryColumn.'"', $filter);
    }

    /**
     * Parse a Qgis connection string.
     *
     * It supports `table` and `sql` parameters, as well as geometry tags like `(geom)`.
     *
     * @throws \Exception
     */
    public static function parseQgisConnectionString(string $connection_string): array
    {
        $result = array();

        $tokens = preg_split('/(=| +|(?<!\\\)\'|(?<!\\\)")/', $connection_string, -1, PREG_SPLIT_DELIM_CAPTURE);
        $state = self::PARSER_STATE_BETWEEN_PARAMETERS;
        $currentParamName = '';
        $currentValue = '';
        $valueIsQuoted = '';
        $tableSchemaName = '';

        foreach ($tokens as $token) {
            if ($token === '') {
                continue;
            }

            switch ($state) {
                case self::PARSER_STATE_BETWEEN_PARAMETERS:
                    if ($token[0] == ' ') {
                        break;
                    }
                    if ($token == "'" || $token == '"' || $token == '=') {
                        throw new \Exception('syntax error, unexpected character "'.$token.'"');
                    }
                    if ($token[0] == '(') {
                        $result['geocol'] = trim($token, '()');

                        break;
                    }

                    $currentParamName = $token;
                    $state = self::PARSER_STATE_PARAM_NAME;

                    break;

                case self::PARSER_STATE_PARAM_NAME:
                    if ($token[0] == ' ') {
                        break;
                    }
                    if ($token != '=') {
                        throw new \Exception('syntax error, missing equal sign after parameter '.$currentParamName);
                    }
                    $state = self::PARSER_STATE_PARAM_EQUAL;

                    break;

                case self::PARSER_STATE_PARAM_EQUAL:
                    if ($token[0] == ' ') {
                        break;
                    }
                    if ($token == '=') {
                        throw new \Exception('syntax error unexpected equal sign after parameter '.$currentParamName);
                    }

                    if ($currentParamName == 'table') {
                        if ($token == '"') {
                            $valueIsQuoted = $token;
                            $currentValue = '';
                            $state = self::PARSER_STATE_TABLE_VALUE;
                        } else {
                            $currentValue = $token;
                            $state = self::PARSER_STATE_TABLE_NAME;
                        }
                        $tableSchemaName = '';

                        break;
                    }
                    if ($currentParamName == 'sql') {
                        $currentValue = $token;
                        $state = self::PARSER_STATE_SQL_VALUE;

                        break;
                    }
                    if ($token == "'") {
                        $valueIsQuoted = $token;
                    } else {
                        $currentValue = $token;
                    }
                    $state = self::PARSER_STATE_IN_VALUE;

                    break;

                case self::PARSER_STATE_IN_VALUE:
                    if (($valueIsQuoted && $token == $valueIsQuoted) || ($valueIsQuoted == '' && $token == ' ')) {

                        if ($valueIsQuoted != '') {
                            $currentValue = str_replace('\\'.$valueIsQuoted, $valueIsQuoted, $currentValue);
                        }
                        $result[$currentParamName] = $currentValue;
                        $currentValue = '';
                        $currentParamName = '';
                        $state = self::PARSER_STATE_BETWEEN_PARAMETERS;
                        $valueIsQuoted = '';
                    } else {
                        $currentValue .= $token;
                    }

                    break;

                case self::PARSER_STATE_TABLE_VALUE:
                    if ($token[0] == '(') {
                        $currentValue = $token;
                        $state = self::PARSER_STATE_TABLE_SQL;
                    } else {
                        $currentValue .= $token;
                        $state = self::PARSER_STATE_TABLE_SCHEMA;
                    }

                    break;

                case self::PARSER_STATE_TABLE_SCHEMA:
                    // we take all content until the next double quote, or space if it doesn't start with double quotes
                    if ($token == $valueIsQuoted) {
                        $tableSchemaName = $currentValue;
                        $currentValue = '';
                        $state = self::PARSER_STATE_TABLE_NAME_SEPARATOR;
                    } else {
                        $currentValue .= $token;
                    }

                    break;

                case self::PARSER_STATE_TABLE_NAME_SEPARATOR:
                    if ($token == '.') {
                        $state = self::PARSER_STATE_TABLE_NAME_DBLQUOTE;
                    } elseif ($token[0] = ' ') { // no dot separator, we reach the end of the table full name
                        $result['table'] = '"'.$tableSchemaName.'"';
                        $result['tablename'] = $tableSchemaName;
                        $result['schema'] = '';
                        $state = self::PARSER_STATE_BETWEEN_PARAMETERS;
                        $currentParamName = '';
                        $currentValue = '';
                    } else {
                        throw new \Exception('table name separator is missing after '.$tableSchemaName);
                    }

                    break;

                case self::PARSER_STATE_TABLE_NAME_DBLQUOTE:
                    if ($token == '"') {
                        $state = self::PARSER_STATE_TABLE_NAME;
                    } else {
                        throw new \Exception('table name is missing after the schema '.$tableSchemaName);
                    }

                    break;

                case self::PARSER_STATE_TABLE_NAME:
                    if (($valueIsQuoted && $token == '"') || ($valueIsQuoted == '' && $token[0] == ' ')) {
                        if ($tableSchemaName) {
                            $result['table'] = '"'.$tableSchemaName.'"."'.$currentValue.'"';
                        } else {
                            $result['table'] = '"'.$currentValue.'"';
                        }
                        $result['tablename'] = $currentValue;
                        $result['schema'] = $tableSchemaName;
                        $state = self::PARSER_STATE_BETWEEN_PARAMETERS;
                        $currentParamName = '';
                        $currentValue = '';
                        $valueIsQuoted = '';
                    } else {
                        $currentValue .= $token;
                    }

                    break;

                case self::PARSER_STATE_TABLE_SQL:
                    // we take all content until the next double quote
                    if ($valueIsQuoted && $token == $valueIsQuoted) {
                        // fooliz is the name of the 'virtual' table
                        $result['table'] = $result['tablename'] = trim(str_replace('\"', '"', $currentValue)).' fooliz';
                        $result['schema'] = '';
                        $state = self::PARSER_STATE_BETWEEN_PARAMETERS;
                        $currentParamName = '';
                        $currentValue = '';
                        $valueIsQuoted = '';
                    } else {
                        $currentValue .= $token;
                    }

                    break;

                case self::PARSER_STATE_SQL_VALUE:
                    // we take all content until the end of string
                    $currentValue .= $token;

                    break;
            }
        }

        if ($state == self::PARSER_STATE_SQL_VALUE) {
            $result[$currentParamName] = trim($currentValue);
        } elseif ($state == self::PARSER_STATE_IN_VALUE || $state == self::PARSER_STATE_TABLE_VALUE || $state == self::PARSER_STATE_TABLE_SQL) {
            if ($valueIsQuoted) {
                throw new \Exception('syntax error, missing ending quote for parameter='.$currentParamName);
            }
            $result[$currentParamName] = trim($currentValue);
        } elseif ($state == self::PARSER_STATE_PARAM_EQUAL) {
            $result[$currentParamName] = '';
        } elseif ($state == self::PARSER_STATE_TABLE_NAME) {
            if ($valueIsQuoted == '') {
                $result['table'] = '"'.$currentValue.'"';
                $result['tablename'] = $currentValue;
                $result['schema'] = '';
            } else {
                throw new \Exception('syntax error, missing ending quote for table name');
            }
        } elseif ($state != self::PARSER_STATE_BETWEEN_PARAMETERS) {
            throw new \Exception('syntax error, missing equal sign for parameter '.$currentParamName);
        }

        return $result;
    }
}
