<?php


class qgisExpressionUtilsTest extends PHPUnit_Framework_TestCase {

    function testCriteriaFromExpression() {
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

    function testCriteriaFromExpressions() {
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

}