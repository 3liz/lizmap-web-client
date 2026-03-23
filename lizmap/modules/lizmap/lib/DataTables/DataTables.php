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

        return trim("{$column} {$qgisOperator} {$value}");
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
}
