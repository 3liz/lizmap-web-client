<?php

use Lizmap\DataTables\DataTables;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class DataTablesTest extends TestCase
{
    public function testConvertCriteriaToExpression(): void
    {
        $criteria = array(
            'data' => 'name',
            'condition' => '=',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name = \'test\'');

        $criteria = array(
            'data' => 'name',
            'condition' => '!=',
            'value1' => '1',
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name != 1');

        $criteria = array(
            'data' => 'name',
            'condition' => '<',
            'value1' => '1.5',
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name < 1.5');

        $criteria = array(
            'data' => 'name',
            'condition' => '<=',
            'value1' => 2,
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name <= 2');

        $criteria = array(
            'data' => 'name',
            'condition' => '>',
            'value1' => 0.5,
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name > 0.5');

        $criteria = array(
            'data' => 'name',
            'condition' => '>=',
            'value1' => 'C',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name >= \'C\'');

        $criteria = array(
            'data' => 'name',
            'condition' => 'starts',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name ILIKE \'test%\'');

        $criteria = array(
            'data' => 'name',
            'condition' => '!starts',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name NOT ILIKE \'test%\'');

        $criteria = array(
            'data' => 'name',
            'condition' => 'contains',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name ILIKE \'%test%\'');

        $criteria = array(
            'data' => 'name',
            'condition' => '!contains',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name NOT ILIKE \'%test%\'');

        $criteria = array(
            'data' => 'name',
            'condition' => 'ends',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name ILIKE \'%test\'');

        $criteria = array(
            'data' => 'name',
            'condition' => '!ends',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name NOT ILIKE \'%test\'');

        $criteria = array(
            'data' => 'name',
            'condition' => 'null',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name IS NULL');

        $criteria = array(
            'data' => 'name',
            'condition' => '!null',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name IS NOT NULL');

        $criteria = array(
            'data' => 'name',
            'condition' => 'between',
            'value1' => 'a',
            'value2' => 'd',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name BETWEEN \'a\' AND \'d\'');

        $criteria = array(
            'data' => 'name',
            'condition' => '!between',
            'value1' => 'a',
            'value2' => 'd',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name NOT BETWEEN \'a\' AND \'d\'');

        $criteria = array(
            'data' => 'name',
            'condition' => 'between',
            'value1' => 0,
            'value2' => 5,
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name BETWEEN 0 AND 5');

        $criteria = array(
            'data' => 'name',
            'condition' => '!between',
            'value1' => '0',
            'value2' => '5',
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name NOT BETWEEN 0 AND 5');

        $criteria = array(
            'data' => 'name',
            'type' => 'string',
            'condition' => '=',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, 'name = \'\'');
    }

    public function testInvalidConvertCriteriaToExpression(): void
    {
        $criteria = array(
            'type' => '',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '');

        $criteria = array(
            'data' => 'name',
            'type' => '',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '');

        $criteria = array(
            'data' => 'name',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '');
    }

    public function testConvertSearchToExpression(): void
    {
        $search = array(
            'criteria' => array(
                array(
                    'data' => 'name',
                    'condition' => '=',
                    'value1' => 'test',
                    'type' => 'string',
                ),
            ),
        );
        $exp = DataTables::convertSearchToExpression($search);
        $this->assertEquals($exp, 'name = \'test\'');

        $search = array(
            'criteria' => array(
                array(
                    'data' => 'name',
                    'condition' => '>=',
                    'value1' => 'a',
                    'type' => 'string',
                ),
                array(
                    'data' => 'name',
                    'condition' => '<=',
                    'value1' => 'd',
                    'type' => 'string',
                ),
            ),
        );
        $exp = DataTables::convertSearchToExpression($search);
        $this->assertEquals($exp, 'name >= \'a\' AND name <= \'d\'');

        $search = array(
            'criteria' => array(
                array(
                    'data' => 'name',
                    'condition' => 'starts',
                    'value1' => 'test',
                    'type' => 'string',
                ),
                array(
                    'data' => 'name',
                    'condition' => 'ends',
                    'value1' => 'test',
                    'type' => 'string',
                ),
            ),
            'logic' => 'OR',
        );
        $exp = DataTables::convertSearchToExpression($search);
        $this->assertEquals($exp, 'name ILIKE \'test%\' OR name ILIKE \'%test\'');
    }
}
