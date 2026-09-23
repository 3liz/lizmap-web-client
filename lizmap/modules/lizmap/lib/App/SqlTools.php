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
    public const PARSER_STATE_TABLE_NAME_QUOTE = 7;
    public const PARSER_STATE_TABLE_NAME = 8;
    public const PARSER_STATE_TABLE_SQL = 9;
    public const PARSER_STATE_SQL_VALUE = 10;

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

    protected const ALLOWED_SQL_TOKENS = array(
        'IS',
        'NOT',
        'NULL',
        'AND',
        'OR',
        'IN',
        'LIKE',
        'ILIKE',
        'AS',
        'CASE',
        'WHEN',
        'THEN',
        'ELSE',
        'END',
        'BETWEEN',
        'DMETAPHONE',
        'SOUNDEX',

        // QGIS Expression tokens
        '$id',
        '$geometry',
        '$area',
        '$length',

        // Lizmap tokens
        '@lizmap_user',
        '@lizmap_user_groups',
    );

    protected const ALLOWED_SQL_FUNCTIONS = array(
        // Spatial functions
        'ST_Intersects',
        'ST_Contains',
        'ST_Within',
        'ST_Crosses',
        'ST_Overlaps',
        'ST_Touches',
        'ST_Disjoint',
        'ST_GeomFromGML',
        'ST_GeomFromText',
        'ST_GeomFromWKB',
        'ST_GeomFromEWKB',
        'ST_GeomFromEWKT',
        'ST_GeomFromGeoJSON',
        'ST_GeomFromKML',
        'ST_MakePoint',
        'ST_MakeLine',
        'ST_MakePolygon',
        'ST_MakeEnvelope',
        'ST_Buffer',
        'ST_Transform',
        'ST_SetSRID',
        'ST_SRID',
        'ST_AsText',
        'ST_AsBinary',
        'ST_AsEWKT',
        'ST_AsEWKB',
        'ST_AsGeoJSON',
        'ST_AsKML',
        'ST_AsGML',
        'ST_Distance',
        'ST_Length',
        'ST_Area',
        'ST_Area2D',
        'ST_Intersection',
        'ST_Union',
        'ST_Difference',
        'ST_SymDifference',
        'ST_ConvexHull',
        'ST_Envelope',
        'ST_Centroid',
        'ST_X',
        'ST_Y',
        'ST_ExteriorRing',
        'ST_InteriorRingN',
        'ST_NumInteriorRings',
        'ST_NumGeometries',
        'ST_GeometryN',

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
        'LENGTH',
        'LOWER',
        'UPPER',
        'TRIM',
        'LTRIM',
        'RTRIM',
        'SUBSTRING',
        'POSITION',
        'REPLACE',
        'CONCAT',
        'LEFT',
        'RIGHT',
        'INITCAP',

        // Date and time functions
        'NOW',
        'CURRENT_DATE',
        'CURRENT_TIME',
        'CURRENT_TIMESTAMP',
        'EXTRACT',
        'DATE_PART',
        'DATE_TRUNC',
        'AGE',

        // Miscellaneous functions
        'COALESCE',
        'NULLIF',
    );

    /**
     * Parse and validate the provided SQL query string against the defined whitelist of tokens and functions.
     *
     * @param string $sql                 the SQL query string to be parsed and validated
     * @param array  $allowedSqlTokens    allowed SQL tokens to be merged with the default whitelist
     * @param array  $allowedSqlFunctions allowed SQL functions to be merged with the default whitelist
     *
     * @return string Cleaned SQL string (original string with no comments)
     *
     * @throws \Exception if the SQL query contains disallowed tokens, functions, or syntax errors
     */
    public static function parseAndValidateSQLString(string $sql, array $allowedSqlTokens = array(), array $allowedSqlFunctions = array()): string
    {
        // Remove comments and unnecessary whitespace
        $cleanSql = self::stripComments($sql);
        // If there are somme comments, the string is not valid
        if (trim($sql) != $cleanSql) {
            throw new \Exception('SQL parser - Comments are not allowed !');
        }

        // 2. Extract tokens from the cleaned SQL string
        $tokens = self::tokenizeSQL($cleanSql);

        // 3. Validate the balance and correctness of parentheses
        self::validateParentheses($tokens);

        // 4. Validate the tokens against the whitelist and check for disallowed elements
        self::validateSecurityAndAliases($tokens, $allowedSqlTokens, $allowedSqlFunctions);

        return $cleanSql;
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
            $sql = self::parseAndValidateSQLString($sql);
        } catch (\Exception $e) {
            return false;
        }

        return true;
    }

    /**
     * Remove SQL comments (-- ... and /* ... *\/) from the SQL string.
     *
     * @return string the SQL string without comments
     */
    private static function stripComments(string $sql): string
    {
        $regex = '/(--.*$|\/\*[\s\S]*?\*\/)/m';
        if (preg_match_all($regex, $sql, $matches)) {
            return preg_replace($regex, ' ', $sql);
        }

        return trim($sql);
    }

    /**
     * Tokenize the SQL string into an array of tokens, including keywords, identifiers, operators, and literals.
     *
     * @return array{type: string, value: mixed[]}
     */
    private static function tokenizeSQL(string $sql): array
    {
        // The order of the regexp is needed to avoid a token to be captured as a simple identifier
        $pattern = '/(?>'
        .'\'(?:[^\']|\'\')*+\''          // Single quoted strings
        .'|"(?>[^"\\\]+|\\\.)*"'       // Double quoted strings
        .'|\d++(?:\.\d++)?+'             // Numbers
        .'|[\$@]?[a-zA-Z_]\w*+'          // Words / Identifiers . We should keep $bob for QGIS variables
        .'|<=|>=|!=|<>|==|->>|->'        // Composed operators
        .'|[\+\-\*\/<>=!\|&\^~%?:]'      // Simple operators
        .'|[()\[\]{}]'                   // Parentheses, brackets
        .'|[.,;]'                        // Ponctuation : , . ;
        .')/x';

        $result = preg_match_all(
            $pattern,
            $sql,
            $matches,
            PREG_SET_ORDER
        );
        if ($result === false) {
            throw new \Exception('SQL parser - regexp error: '.preg_last_error_msg());
        }

        $tokens = array();
        foreach ($matches as $match) {
            $tokens[] = $match[0];
        }

        return $tokens;
    }

    /**
     * Check for balanced parentheses in the token array. Throws an exception if unbalanced.
     */
    private static function validateParentheses(array $tokens): void
    {
        $stack = 0;
        foreach ($tokens as $token) {
            if ($token === '(') {
                ++$stack;
            } elseif ($token === ')') {

                --$stack;
                if ($stack < 0) {
                    throw new \Exception('SQL parser - Unmatched closing parenthesis');
                }
            }
        }
        if ($stack !== 0) {
            throw new \Exception("SQL parser - Unmatched parenthesis. Missing {$stack} closing parenthesis(es)");
        }
    }

    /**
     * Check if a token is a literal string (enclosed in single or double quotes).
     *
     * @return bool true if the token is a literal string, false otherwise
     */
    private static function isLiteralString(string $token): bool
    {
        $firstChar = $token[0] ?? '';
        $lastChar = substr($token, -1);

        return ($firstChar === "'" && $lastChar === "'") || ($firstChar === '"' && $lastChar === '"');
    }

    /**
     * Check the tokens against the whitelist and validate security constraints, including dynamic alias handling.
     *
     * Semi-colons are strictly forbidden outside of string literals, and only whitelisted functions and tokens are allowed.
     *
     * @param array $allowedSqlTokens    allowed SQL tokens to be merged with the default whitelist
     * @param array $allowedSqlFunctions allowed SQL functions to be merged with the default whitelist
     */
    private static function validateSecurityAndAliases(array $tokens, array $allowedSqlTokens, array $allowedSqlFunctions): void
    {
        $count = count($tokens);

        // Merge the default whitelists with the provided ones, ensuring uniqueness
        $whitelistWords = array_unique(array_merge(self::ALLOWED_SQL_TOKENS, $allowedSqlTokens));
        $whitelistWords = array_map('strtolower', $whitelistWords);

        $whitelistFunctions = array_unique(array_merge(self::ALLOWED_SQL_FUNCTIONS, $allowedSqlFunctions));
        $whitelistFunctions = array_map('strtolower', $whitelistFunctions);

        // Local list to store aliases discovered on-the-fly during the reading of this query
        $dynamicAliases = array();

        for ($i = 0; $i < $count; ++$i) {
            $token = $tokens[$i];

            // Forbidden semi-colons outside of string literals
            if ($token === ';') {
                throw new \Exception('forbidden semi-colon ');
            }

            // Ignore string literals (single or double quoted) to avoid false positives in validation
            if (self::isLiteralString($token)) {
                continue;
            }

            // Ignore punctuation and mathematical/logical operators
            if (preg_match('/^[\+\-\*\/<>=!,\(\)\.]+/', $token)) {
                continue;
            }

            // Ignore numbers
            if (is_numeric($token)) {
                continue;
            }

            $cleanToken = strtolower(trim($token, '`[]'));

            // Check for dynamic aliasing: if the previous token was 'as', the current token is a valid temporary alias
            if ($i > 0 && strtolower(trim($tokens[$i - 1], '`[]')) === 'as') {
                $dynamicAliases[] = $cleanToken;

                continue;
            }

            // Validate the use of functions: if the token is followed by a parenthesis, it is considered a function call
            $isFollowedByParenthesis = ($i + 1 < $count && $tokens[$i + 1] === '(');

            if ($isFollowedByParenthesis && !in_array($cleanToken, $whitelistWords)) {
                if (!empty($whitelistFunctions) && !in_array($cleanToken, $whitelistFunctions)) {
                    throw new \Exception('Forbidden function: '.$token);
                }
            } else {
                // Validation of identifiers, keywords, and other tokens against the whitelist and dynamic aliases
                if (!empty($whitelistWords)
                    && !in_array($cleanToken, $whitelistWords)
                    && !in_array($cleanToken, $dynamicAliases)
                ) {
                    throw new \Exception('Forbidden token: '.$token);
                }
            }
        }
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
