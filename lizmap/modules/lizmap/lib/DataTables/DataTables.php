<?php

namespace Lizmap\DataTables;

/**
 * @phpstan-type DTCriteria array{type: string, data: ?string, condition: ?string, value1: ?string, value2: ?string}
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
        $column = $criteria['data'] ?? '';
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
     */
    public static function convertSearchToExpression($search): string
    {
        $logic = isset($search['logic']) ? $search['logic'] : 'AND';
        $expressions = array();
        foreach ($search['criteria'] as $criteria) {
            $expressions[] = self::convertCriteriaToExpression($criteria);
        }

        // returns only not empty expressions
        return implode(" {$logic} ", array_filter($expressions));
    }
}
