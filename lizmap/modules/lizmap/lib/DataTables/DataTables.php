<?php

namespace Lizmap\DataTables;

/**
 * @phpstan-type DTSingleCriteria array{type: string, data: ?string, origData: ?string, condition: ?string, value1: ?string, value2: ?string}
 * @phpstan-type DTCriteria array{criteria: ?DTSingleCriteria, type: string, data: ?string, origData: ?string, condition: ?string, value1: ?string, value2: ?string}
 * @phpstan-type DTSearchBuilder array{criteria: DTCriteria[], logic: ?string}
 */
class DataTables
{
    /**
     * Maximum number of features of a layer evaluated by QGIS Server for the quick search.
     *
     * Above it, the quick search is disabled: QGIS Server would read all the features.
     * The layers queried as SQL by Lizmap are not limited.
     */
    public const QUICK_SEARCH_MAX_FEATURES = 50000;

    /**
     * Maximum number of words of a quick search, the next ones are ignored.
     */
    public const QUICK_SEARCH_MAX_WORDS = 3;

    /**
     * PostgreSQL types of text values, searched directly with ILIKE.
     * The types are given as returned by Jelix, without the digits, e.g. int for int4.
     */
    protected const PG_TEXT_TYPES = array(
        'varchar', 'text', 'bpchar', 'char', 'name', 'citext',
    );

    /**
     * PostgreSQL types which are not searched: booleans, binary data, geometries, documents.
     * The other types, e.g. numbers, dates, uuid or arrays, are converted to text with concat().
     */
    protected const PG_NOT_SEARCHED_TYPES = array(
        'bool', 'bytea', 'geometry', 'geography', 'raster', 'box', 'box2d', 'box3d',
        'json', 'jsonb', 'xml', 'tsvector', 'tsquery', 'oid',
    );

    /**
     * @param DTCriteria $criteria A search criteria provided by DataTables search builder
     *
     * @return string the expression build against criteria. If the criteria is not valid, return an empty string.
     */
    public static function convertCriteriaToExpression($criteria): string
    {
        // Check column
        $column = $criteria['origData'] ?? '';
        if ($column == '') {
            return '';
        }

        // Check column type
        $type = $criteria['type'];
        if ($type == '') {
            return '';
        }

        // Check condition
        $condition = $criteria['condition'] ?? '';
        if ($condition == '') {
            return '';
        }

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
                if ($type == 'num') {
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
                if ($type == 'num') {
                    $value = $value1.' AND '.$value2;
                } else {
                    $value = '\''.$value1.'\' AND \''.$value2.'\'';
                }

                break;

            case '!between':
                $qgisOperator = 'NOT BETWEEN';
                if ($type == 'num') {
                    $value = $value1.' AND '.$value2;
                } else {
                    $value = '\''.$value1.'\' AND \''.$value2.'\'';
                }

                break;
        }

        // Enclose the column name in double quotes so that identifiers with
        // uppercase letters or special characters are resolved correctly both
        // as a QGIS Server expression and as raw PostgreSQL SQL (unquoted
        // mixed-case identifiers are folded to lower case by PostgreSQL).
        $quotedColumn = '"'.str_replace('"', '""', $column).'"';

        return trim("{$quotedColumn} {$qgisOperator} {$value}");
    }

    /**
     * @param DTSearchBuilder $search A search provided by DataTables
     * @param int             $depth  Depth level
     */
    public static function convertSearchToExpression($search, $depth = 0): string
    {
        $logic = isset($search['logic']) ? $search['logic'] : 'AND';
        $expressions = array();
        foreach ($search['criteria'] as $criteria) {
            if (array_key_exists('criteria', $criteria) && is_array($criteria['criteria'])) {
                $expressions[] = self::convertSearchToExpression($criteria, $depth + 1);
            }
            $expressions[] = self::convertCriteriaToExpression($criteria);
        }

        // returns only not empty expressions
        $expression = implode(" {$logic} ", array_filter($expressions));
        if ($depth != 0 && $expression) {
            // add parentheses only if there is a valid expression and only if
            // this expression is a subcondition
            $expression = "({$expression})";
        }

        return $expression;
    }

    /**
     * Get the words of a quick search.
     *
     * The search is split on white spaces, like the smart search of DataTables.
     * The control characters and the backslashes are removed: the backslash is an
     * escape character with a different meaning in QGIS expressions and in PostgreSQL.
     * The wildcards % and _ are kept, they match any characters as in a LIKE pattern.
     *
     * @param string $search the value typed by the user
     *
     * @return string[] the unique words, at most QUICK_SEARCH_MAX_WORDS
     */
    public static function getQuickSearchWords(string $search): array
    {
        // Remove the control characters and the backslashes
        $search = preg_replace('/[\x00-\x1F\x7F\\\]/u', ' ', $search);
        if ($search === null) {
            // Invalid UTF-8 string
            return array();
        }

        // Split on white spaces and keep the first unique words
        $words = preg_split('/\s+/u', trim($search), -1, PREG_SPLIT_NO_EMPTY);
        if ($words === false) {
            return array();
        }

        return array_slice(array_values(array_unique($words)), 0, self::QUICK_SEARCH_MAX_WORDS);
    }

    /**
     * Check if a PostgreSQL column can be searched by the quick search.
     *
     * @param string $type the PostgreSQL type, as returned by Jelix
     *
     * @return bool true if the column is searched
     */
    public static function isQuickSearchDbType(string $type): bool
    {
        return !in_array(strtolower($type), self::PG_NOT_SEARCHED_TYPES, true);
    }

    /**
     * Build the expression filter of a quick search on several columns.
     *
     * Each word must be found in at least one of the columns: the conditions on the
     * columns are combined with OR, and the conditions on the words with AND.
     *
     * Without the database types, the expression is evaluated by QGIS Server, which
     * converts any value to text for ILIKE: every column is searched with ILIKE.
     * With the PostgreSQL types, the expression is run as SQL by Lizmap: the text
     * columns are searched with ILIKE, optionally without accents, the other columns
     * are converted to text with concat(), and booleans, geometries or binary data
     * are not searched.
     *
     * @param string                     $search           the value typed by the user
     * @param string[]                   $columns          the names of the searched columns
     * @param null|array<string, string> $dbFieldTypes     the PostgreSQL type of each column, null if the
     *                                                     expression is evaluated by QGIS Server
     * @param null|string                $unaccentFunction the PostgreSQL function removing accents,
     *                                                     unaccent or f_unaccent, or null
     *
     * @return string the expression, or an empty string if there is nothing to search
     */
    public static function buildQuickSearchExpression(string $search, array $columns, ?array $dbFieldTypes = null, ?string $unaccentFunction = null): string
    {
        // Only the known functions removing accents
        if (!in_array($unaccentFunction, array('unaccent', 'f_unaccent'), true)) {
            $unaccentFunction = null;
        }

        $words = self::getQuickSearchWords($search);
        $wordExpressions = array();
        foreach ($words as $word) {
            // The pattern, with the single quotes escaped
            $pattern = "'%".str_replace("'", "''", $word)."%'";

            // One condition by searched column
            $columnExpressions = array();
            foreach ($columns as $column) {
                $quotedColumn = '"'.str_replace('"', '""', $column).'"';

                // Evaluated by QGIS Server: any type is converted to text
                if ($dbFieldTypes === null) {
                    $columnExpressions[] = "{$quotedColumn} ILIKE {$pattern}";

                    continue;
                }

                // Run as SQL: depends on the PostgreSQL type of the column
                if (!array_key_exists($column, $dbFieldTypes)) {
                    continue;
                }
                $type = strtolower($dbFieldTypes[$column]);
                if (!self::isQuickSearchDbType($type)) {
                    continue;
                }
                if (in_array($type, self::PG_TEXT_TYPES, true)) {
                    if ($unaccentFunction) {
                        $columnExpressions[] = "{$unaccentFunction}({$quotedColumn}) ILIKE {$unaccentFunction}({$pattern})";
                    } else {
                        $columnExpressions[] = "{$quotedColumn} ILIKE {$pattern}";
                    }

                    continue;
                }
                // Numbers, dates, arrays, etc. converted to text
                $columnExpressions[] = "concat({$quotedColumn}) ILIKE {$pattern}";
            }

            // No searchable column: nothing can be found
            if (count($columnExpressions) == 0) {
                return '1 = 0';
            }
            $wordExpressions[] = '( '.implode(' OR ', $columnExpressions).' )';
        }

        return implode(' AND ', $wordExpressions);
    }

    /**
     * Check if the quick search is enabled for a layer, depending on its size.
     *
     * When the filter is evaluated by QGIS Server, the quick search is disabled
     * above the maximum number of features. When it is run as SQL by Lizmap,
     * it is always enabled.
     *
     * @param bool $sqlQuery     true if the filter is run as SQL by Lizmap
     * @param int  $featureCount the number of features of the layer
     * @param int  $columnCount  the number of searched columns
     * @param int  $maxFeatures  the maximum number of features, 0 for no limit
     *
     * @return bool true if the quick search is enabled
     */
    public static function isQuickSearchEnabled(bool $sqlQuery, int $featureCount, int $columnCount, int $maxFeatures = self::QUICK_SEARCH_MAX_FEATURES): bool
    {
        // No column to search
        if ($columnCount == 0) {
            return false;
        }

        // Always enabled for SQL, else limited by the number of features for QGIS Server
        return $sqlQuery || $maxFeatures <= 0 || $featureCount <= $maxFeatures;
    }
}
