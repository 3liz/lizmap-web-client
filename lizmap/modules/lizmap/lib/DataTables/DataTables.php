<?php

namespace Lizmap\DataTables;

/**
 * @phpstan-type DTCriteria array{data: string, condition: string, value1: ?string, value2: ?string, type: string}
 * @phpstan-type DTSearchBuilder array{criteria: DTCriteria[], logic: ?string}
 */
class DataTables
{
    /**
     * @param DTCriteria $criteria A search criteria provided by DataTables search builder
     */
    public static function convertCriteriaToExpression($criteria): string
    {
        $column = $criteria['data'];
        $condition = $criteria['condition'];
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
                if ($criteria['type'] == 'num') {
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
                if ($criteria['type'] == 'num') {
                    $value = $value1.' AND '.$value2;
                } else {
                    $value = '\''.$value1.'\' AND \''.$value2.'\'';
                }

                break;

            case '!between':
                $qgisOperator = 'NOT BETWEEN';
                if ($criteria['type'] == 'num') {
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

        return implode(" {$logic} ", $expressions);
    }
}
