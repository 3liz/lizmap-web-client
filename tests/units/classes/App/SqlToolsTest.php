<?php

use Lizmap\App\SqlTools;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class SqlToolsTest extends TestCase
{
    public static function getValidateExpressionFilterData()
    {
        return array(
            array(';', false),
            array('select * from test', false),
            array('delete table', false),
            array('insert ', false),
            array('update ', false),
            array('drop ', false),
            array('alter ', false),
            array('--', false),
            array('truncate ', false),
            array('vacuum ', false),
            array('create ', false),
            array('grant ', false),
            array('revoke ', false),
            array('selectoioio', false),
            array('test intersects other test', true),
            array('test geom_from_gml other test', true),
            array('test intersects $geometry', true),
            array('$id IN (1)', true),
            array('$id IN (1, 2)', true),
            array('"id" IN (1)', true),
            array('"id" IN (1, 2)', true),
            array('"id" IN (\'test\')', true),
            array('("foo" = \'test\' AND "id" = 55)', true),
            array('("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44)', true),
            array('("foo" = \'test\' AND "id" = 55) OR ("foo" = \'bar\' AND "id" = 44); -- SELECT * FROM jlx_user', false),
        );
    }

    #[DataProvider('getValidateExpressionFilterData')]
    public function testValidateExpressionFilter($filter, $expectedResult): void
    {
        [$valid, $blocked] = SqlTools::validateExpressionFilter($filter);
        $this->assertEquals($expectedResult, $valid);
    }
}
