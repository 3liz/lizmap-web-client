<?php
use PHPUnit\Framework\TestCase;

class qgisExpressionUtilsTest extends TestCase {

    function testCriteriaFromExpression(): void {
        $exp = '"name" IS NOT NULL AND "name" <> \'\'';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = 'try( to_int( "pkuid" ), -1 ) >= 0';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('pkuid', $dependencies));

        $exp = 'regexp_match( "description", \'\\bphotos?\\b\' )';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('description', $dependencies));


        $exp = '"name" IS NOT NULL AND "name" <> \'\' AND try( to_int( "pkuid" ), -1 ) >= 0 AND regexp_match( "description", \'\\bphotos?\\b\' )';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 3);
        $this->assertTrue(in_array('name', $dependencies));
        $this->assertTrue(in_array('pkuid', $dependencies));
        $this->assertTrue(in_array('description', $dependencies));
    }

    function testCriteriaFromExpressions(): void {
        $exp = '"name" IS NOT NULL AND "name" <> \'\'';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpressions(
                array($exp)
            );

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $dependencies = qgisExpressionUtils::getCriteriaFromExpressions(
                array('test'=>$exp)
            );

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp2 = 'try( to_int( "pkuid" ), -1 ) >= 0';
        $exp3 = 'regexp_match( "description", \'\\bphotos?\\b\' )';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpressions(
                array($exp, $exp2, $exp3)
            );

        $this->assertEquals(count($dependencies), 3);
        $this->assertTrue(in_array('name', $dependencies));
        $this->assertTrue(in_array('pkuid', $dependencies));
        $this->assertTrue(in_array('description', $dependencies));

        $dependencies = qgisExpressionUtils::getCriteriaFromExpressions(
                array(
                    'test' => $exp,
                    'group-tab' => $exp2,
                    'edition-group0' => $exp3)
            );

        $this->assertEquals(count($dependencies), 3);
        $this->assertTrue(in_array('name', $dependencies));
        $this->assertTrue(in_array('pkuid', $dependencies));
        $this->assertTrue(in_array('description', $dependencies));
    }

    function testCurrentValueCriteriaFromExpression(): void {
        $exp = '"old_name" = current_value(\'name\')';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = '"old_name" = current_value(   \'name\')';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = '"old_name" = current_value(\'name\'   )';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = '"old_name" = current_value(   \'name\' )';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = '"old_name" = my_current_value(\'name\')';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 0);

        $exp = '"old_name" =current_value(\'name\')';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = '"old_name" =current_value(\'name\')||\'test\'';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = 'current_value(\'name\') IS NOT NULL AND current_value(\'name\') <> \'\'';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));


        $exp = 'try( to_int( current_value(\'pkuid\') ), -1 ) >= 0';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('pkuid', $dependencies));

        $exp = 'regexp_match( current_value(\'description\'), \'\\bphotos?\\b\' )';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('description', $dependencies));


        $exp = 'current_value(\'name\') IS NOT NULL AND current_value(\'name\') <> \'\' AND try( to_int( current_value(\'pkuid\') ), -1 ) >= 0 AND regexp_match( current_value(\'description\'), \'\\bphotos?\\b\' )';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 3);
        $this->assertTrue(in_array('name', $dependencies));
        $this->assertTrue(in_array('pkuid', $dependencies));
        $this->assertTrue(in_array('description', $dependencies));
    }

    function testCurrentGeometry(): void {
        $exp = '@current_geometry';
        $this->assertTrue(qgisExpressionUtils::hasCurrentGeometry($exp));

        $exp = 'my@current_geometry';
        $this->assertFalse(qgisExpressionUtils::hasCurrentGeometry($exp));

        $exp = ' @current_geometry ';
        $this->assertTrue(qgisExpressionUtils::hasCurrentGeometry($exp));

        $exp = 'intersects(@current_geometry, $geometry)';
        $this->assertTrue(qgisExpressionUtils::hasCurrentGeometry($exp));

        $exp = 'intersects(@current_geometry, $geometry) AND area(@current_geometry)>1000';
        $this->assertTrue(qgisExpressionUtils::hasCurrentGeometry($exp));

        $exp = 'intersects(buffer(@current_geometry,50), $geometry )';
        $this->assertTrue(qgisExpressionUtils::hasCurrentGeometry($exp));
    }

}
