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
    public const PARSER_STATE_BETWEEN_TOKENS = 0;
    public const PARSER_STATE_BETWEEN_PARAMETERS = 0;
    public const PARSER_STATE_PARAM_NAME = 1;
    public const PARSER_STATE_PARAM_EQUAL = 2;
    public const PARSER_STATE_IN_VALUE = 3;
    public const PARSER_STATE_TABLE_VALUE = 4;
    public const PARSER_STATE_TABLE_SCHEMA = 5;
    public const PARSER_STATE_TABLE_NAME_SEPARATOR = 6;
    public const PARSER_STATE_TABLE_NAME_QUOTE = 7;
    public const PARSER_STATE_TABLE_NAME = 8;
    public const PARSER_STATE_TABLE_SQL = 9;
    public const PARSER_STATE_SQL_VALUE = 10;
    public const PARSER_STATE_STRING_VALUE = 11;
    public const PARSER_STATE_COMMENT_SQL_1 = 12;
    public const PARSER_STATE_COMMENT_SQL_2 = 13;

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
     * Allowed SQL tokens.
     * Please only in lowercase.
     */
    protected const ALLOWED_SQL_TOKENS = array(

        // operators
        ',', '=', '<', '>', '<=', '>=', '!=',
        'is',
        'not',
        'null',
        'and',
        'or',
        'in',
        'like',
        'ilike',
        'as',
        'case',
        'when',
        'then',
        'else',
        'end',
        'between',
        'dmetaphone',
        'soundex',

        // QGIS Expression tokens
        '$id',
        '$geometry',
        '$area',
        '$length',

        // Lizmap tokens
        '@lizmap_user',
        '@lizmap_user_groups',

        // Spatial functions
        'st_intersects',
        'st_contains',
        'st_within',
        'st_crosses',
        'st_overlaps',
        'st_touches',
        'st_disjoint',
        'st_geomfromgml',
        'st_geomfromtext',
        'st_geomfromwkb',
        'st_geomfromewkb',
        'st_geomfromewkt',
        'st_geomfromgeojson',
        'st_geomfromkml',
        'st_makepoint',
        'st_makeline',
        'st_makepolygon',
        'st_makeenvelope',
        'st_buffer',
        'st_transform',
        'st_setsrid',
        'st_srid',
        'st_astext',
        'st_asbinary',
        'st_asewkt',
        'st_asewkb',
        'st_asgeojson',
        'st_askml',
        'st_asgml',
        'st_distance',
        'st_length',
        'st_area',
        'st_area2d',
        'st_intersection',
        'st_union',
        'st_difference',
        'st_symdifference',
        'st_convexhull',
        'st_envelope',
        'st_centroid',
        'st_x',
        'st_y',
        'st_exteriorring',
        'st_interiorringn',
        'st_numinteriorrings',
        'st_numgeometries',
        'st_geometryn',

        // QGIS Expression functions
        'buffer',
        'distance',
        'area',
        'length',
        'intersects',
        'contains',
        'within',
        'crosses',
        'overlaps',
        'touches',
        'disjoint',
        'geom_from_gml',

        // String functions
        'length',
        'lower',
        'upper',
        'trim',
        'ltrim',
        'rtrim',
        'substring',
        'position',
        'replace',
        'concat',
        'left',
        'right',
        'initcap',

        // Date and time functions
        'now',
        'current_date',
        'current_time',
        'current_timestamp',
        'extract',
        'date_part',
        'date_trunc',
        'age',

        // Miscellaneous functions
        'coalesce',
        'nullif',
    );

    /**
     * Parse and validate the provided SQL query string against the defined whitelist of tokens and functions.
     *
     * @param string $sql              the SQL query string to be parsed and validated
     * @param array  $allowedSqlTokens allowed SQL tokens to be merged with the default whitelist
     *
     * @return bool true when no exceptions
     *
     * @throws \Exception if the SQL query contains disallowed tokens, functions, or syntax errors
     */
    public static function parseAndValidateSQLString(string $sql, array $allowedSqlTokens = array()): bool
    {
        // split the SQL string into tokens using regular expression. Splitting is made on syntaxic elements
        $tokens = preg_split('#('
            .'!=|<=|>=|<>|==|->>|->' // Composed operators
            .'|--|\n|/\*|\*/' // comments
            .'|[;:.,()=<>%\'"+*\-/!|&^~?\[\]{}]' // Simple operators, ponctuations, Parentheses, brackets
            .'|[ \t]+|\d+)#u', $sql, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
        $state = self::PARSER_STATE_BETWEEN_TOKENS;

        if (count($allowedSqlTokens)) {
            $whitelistWords = array_unique(array_merge(self::ALLOWED_SQL_TOKENS, array_map('strtolower', $allowedSqlTokens)));
        } else {
            $whitelistWords = self::ALLOWED_SQL_TOKENS;
        }

        $openedParenthesis = 0;

        foreach ($tokens as $k => $token) {

            switch ($state) {
                case self::PARSER_STATE_BETWEEN_TOKENS:
                    if ($token[0] == ' ' || $token[0] == "\t") {
                        break;

                    }
                    if ($token == ';') {
                        throw new \Exception('forbidden semi-colon');
                    }

                    if ($token == "'") {
                        $state = self::PARSER_STATE_STRING_VALUE;

                        break;
                    }
                    if ($token == '"') {
                        $state = self::PARSER_STATE_TABLE_NAME;

                        break;
                    }

                    if ($token == '--') {
                        $state = self::PARSER_STATE_COMMENT_SQL_1;

                        break;
                    }
                    if ($token == '/*') {
                        $state = self::PARSER_STATE_COMMENT_SQL_2;

                        break;
                    }

                    if ($token == '(') {
                        ++$openedParenthesis;
                    } elseif ($token == ')') {
                        --$openedParenthesis;
                        if ($openedParenthesis < 0) {
                            throw new \Exception('SQL parser - Unmatched closing parenthesis');
                        }
                    } elseif (!preg_match('/^\d+$/', $token) && !in_array(strtolower($token), $whitelistWords)) {
                        throw new \Exception('Forbidden keyword or syntax element: '.$token);
                    }

                    break;

                case self::PARSER_STATE_STRING_VALUE:
                    // if we reach a single quote, ensure this is not an escaped single quote ( '' in SQL)
                    if ($token == "'" && (!isset($tokens[$k + 1]) || $tokens[$k + 1] != "'")) {
                        $state = self::PARSER_STATE_BETWEEN_TOKENS;
                    }

                    break;

                case self::PARSER_STATE_TABLE_NAME:
                    // if we reach a double quote, ensure this is not an escaped double quote ( "" in SQL)
                    if ($token == '"' && (!isset($tokens[$k + 1]) || $tokens[$k + 1] != '"')) {
                        $state = self::PARSER_STATE_BETWEEN_TOKENS;
                    }

                    break;

                case self::PARSER_STATE_COMMENT_SQL_1:
                    if ($token == "\n") {
                        $state = self::PARSER_STATE_BETWEEN_TOKENS;
                    }

                    break;

                case self::PARSER_STATE_COMMENT_SQL_2:
                    if ($token == '*/') {
                        $state = self::PARSER_STATE_BETWEEN_TOKENS;
                    }

                    break;
            }
        }
        if ($openedParenthesis > 0) {
            throw new \Exception("SQL parser - Unmatched parenthesis. Missing {$openedParenthesis} closing parenthesis(es)");
        }
        if ($state != self::PARSER_STATE_BETWEEN_TOKENS && $state != self::PARSER_STATE_COMMENT_SQL_1) {
            $reason = '';
            if ($state == self::PARSER_STATE_COMMENT_SQL_2) {
                $reason = ': Comment not closed';
            } elseif ($state == self::PARSER_STATE_TABLE_NAME) {
                $reason = ': Double quoted string not closed';
            } elseif ($state == self::PARSER_STATE_STRING_VALUE) {
                $reason = ': Single quoted string not closed';
            }

            throw new \Exception('SQL parser - Syntax error'.$reason);
        }

        return true;
    }

    /**
     * Validate if the given string is valid.
     *
     * This is a helper function for testing purpose
     *
     * @param string $sql The SQL string to test
     *
     * @return bool True if the SQL string is valid
     */
    public static function validateExpressionFilter(string $sql): bool
    {
        try {
            self::parseAndValidateSQLString($sql);
        } catch (\Exception $e) {
            return false;
        }

        return true;
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
     * It supports `table` and `sql` parameters, as well as geometry tags like `(geom)`, in addition of
     * other database connection parameters.
     *
     * It is compliant with the Qgis 4.2 parser.
     *
     * @see https://api.qgis.org/api/4.2/qgsdatasourceuri_8cpp_source.html
     *
     * @return array the list of parameters
     *
     * @throws QgisConnectionStringParserException
     */
    public static function parseQgisConnectionString(string $connection_string): array
    {
        $parameters = array();

        $tokens = preg_split('/(=| +|(?<!\\\)\'|(?<!\\\)")/u', $connection_string, -1, PREG_SPLIT_DELIM_CAPTURE);
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
                        throw new QgisConnectionStringParserException('syntax error, unexpected character "'.$token.'"', 1, $parameters);
                    }
                    if ($token[0] == '(') {
                        // geometry column
                        $parameters['geocol'] = str_replace(array('\)', '\\\\'), array(')', '\\'), trim($token, '()'));

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
                        throw new QgisConnectionStringParserException('syntax error, missing equal sign after parameter '.$currentParamName, 2, $parameters);
                    }
                    $state = self::PARSER_STATE_PARAM_EQUAL;

                    break;

                case self::PARSER_STATE_PARAM_EQUAL:
                    if ($token[0] == ' ') {
                        break;
                    }
                    if ($token == '=') {
                        throw new QgisConnectionStringParserException('syntax error, unexpected equal sign after parameter '.$currentParamName, 3, $parameters);
                    }

                    if ($currentParamName == 'table') {
                        if ($token == '"' || $token == "'") {
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
                    if ($token == "'" || $token == '"') {
                        $valueIsQuoted = $token;
                    } else {
                        $currentValue = $token;
                    }
                    $state = self::PARSER_STATE_IN_VALUE;

                    break;

                case self::PARSER_STATE_IN_VALUE:
                    // All characters until the delimiter are taken.
                    // Escaped delimiters and escaped anti-slash must be unescaped.
                    // When there are no delimiters, a space indicate the end of the value
                    if (($valueIsQuoted && $token == $valueIsQuoted) || ($valueIsQuoted == '' && $token == ' ')) {

                        if ($valueIsQuoted != '') {
                            $currentValue = str_replace(
                                array('\\'.$valueIsQuoted, '\\\\'),
                                array($valueIsQuoted, '\\'),
                                $currentValue
                            );
                        }
                        $parameters[$currentParamName] = $currentValue;
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
                        $state = self::PARSER_STATE_TABLE_NAME_QUOTE;
                    } elseif ($token[0] = ' ') { // no dot separator, we reach the end of the table full name
                        $parameters['table'] = '"'.$tableSchemaName.'"';
                        $parameters['tablename'] = $tableSchemaName;
                        $parameters['schema'] = '';
                        $state = self::PARSER_STATE_BETWEEN_PARAMETERS;
                        $currentParamName = '';
                        $currentValue = '';
                    } else {
                        throw new QgisConnectionStringParserException('syntax error, table name separator is missing after '.$tableSchemaName, 4, $parameters);
                    }

                    break;

                case self::PARSER_STATE_TABLE_NAME_QUOTE:
                    if ($token == '"' || $token == "'") {
                        $valueIsQuoted = $token;
                        $state = self::PARSER_STATE_TABLE_NAME;
                    } else {
                        throw new QgisConnectionStringParserException('syntax error, table name is missing after the schema '.$tableSchemaName, 5, $parameters);
                    }

                    break;

                case self::PARSER_STATE_TABLE_NAME:
                    if (($valueIsQuoted && $token == $valueIsQuoted) || ($valueIsQuoted == '' && $token[0] == ' ')) {
                        if ($tableSchemaName) {
                            $parameters['table'] = '"'.$tableSchemaName.'"."'.$currentValue.'"';
                        } else {
                            $parameters['table'] = '"'.$currentValue.'"';
                        }
                        $parameters['tablename'] = $currentValue;
                        $parameters['schema'] = $tableSchemaName;
                        $state = self::PARSER_STATE_BETWEEN_PARAMETERS;
                        $currentParamName = '';
                        $currentValue = '';
                        $valueIsQuoted = '';
                    } else {
                        $currentValue .= $token;
                    }

                    break;

                case self::PARSER_STATE_TABLE_SQL:
                    // we take all content until the next quote
                    if ($valueIsQuoted && $token == $valueIsQuoted) {
                        // dummy_liz_alias is a SQL alias to avoid error in Postgresql. PG does not allow `FROM (subquery)` without alias.
                        $parameters['table'] = $parameters['tablename'] = trim(str_replace('\\'.$valueIsQuoted, $valueIsQuoted, $currentValue)).' dummy_liz_alias';
                        $parameters['schema'] = '';
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

        if ($state == self::PARSER_STATE_BETWEEN_PARAMETERS) {
            return $parameters;
        }

        if ($state == self::PARSER_STATE_SQL_VALUE) {
            $currentValue = trim($currentValue);
            if ($currentValue == '""' || $currentValue == "''") {
                $currentValue = '';
            }
            $parameters[$currentParamName] = $currentValue;
        } elseif ($state == self::PARSER_STATE_IN_VALUE || $state == self::PARSER_STATE_TABLE_VALUE || $state == self::PARSER_STATE_TABLE_SQL) {
            if ($valueIsQuoted) {
                throw new QgisConnectionStringParserException('syntax error, missing ending quote for parameter='.$currentParamName, 6, $parameters);
            }
            $parameters[$currentParamName] = trim($currentValue);
        } elseif ($state == self::PARSER_STATE_PARAM_EQUAL) {
            $parameters[$currentParamName] = '';
        } elseif ($state == self::PARSER_STATE_TABLE_NAME) {
            if ($valueIsQuoted == '') {
                $parameters['table'] = '"'.$currentValue.'"';
                $parameters['tablename'] = $currentValue;
                $parameters['schema'] = '';
            } else {
                throw new QgisConnectionStringParserException('syntax error, missing ending quote for table name', 7, $parameters);
            }
        } elseif ($state == self::PARSER_STATE_TABLE_NAME_QUOTE) {
            throw new QgisConnectionStringParserException('syntax error, table name is missing after the schema '.$tableSchemaName, 5, $parameters);
        } else {
            throw new QgisConnectionStringParserException('syntax error, missing equal sign for parameter '.$currentParamName, 2, $parameters);
        }

        return $parameters;
    }
}
