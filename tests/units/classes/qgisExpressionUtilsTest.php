<?php

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 */
#[CoversNothing]
class qgisExpressionUtilsTest extends TestCase
{
    public function testCriteriaFromExpression(): void
    {
        $exp = '"name" IS NOT NULL AND "name" <> \'\'';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp = 'try( to_int( "pkuid" ), -1 ) >= 0';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('pkuid', $dependencies));

        $exp = 'regexp_match( "description", \'\bphotos?\b\' )';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('description', $dependencies));

        $exp = '"name" IS NOT NULL AND "name" <> \'\' AND try( to_int( "pkuid" ), -1 ) >= 0 AND regexp_match( "description", \'\bphotos?\b\' )';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 3);
        $this->assertTrue(in_array('name', $dependencies));
        $this->assertTrue(in_array('pkuid', $dependencies));
        $this->assertTrue(in_array('description', $dependencies));
    }

    public function testCriteriaFromExpressions(): void
    {
        $exp = '"name" IS NOT NULL AND "name" <> \'\'';
        $dependencies = qgisExpressionUtils::getCriteriaFromExpressions(
            array($exp)
        );

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $dependencies = qgisExpressionUtils::getCriteriaFromExpressions(
            array('test' => $exp)
        );

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('name', $dependencies));

        $exp2 = 'try( to_int( "pkuid" ), -1 ) >= 0';
        $exp3 = 'regexp_match( "description", \'\bphotos?\b\' )';
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

    public function testCurrentValueCriteriaFromExpression(): void
    {
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

        $exp = 'regexp_match( current_value(\'description\'), \'\bphotos?\b\' )';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 1);
        $this->assertTrue(in_array('description', $dependencies));

        $exp = 'current_value(\'name\') IS NOT NULL AND current_value(\'name\') <> \'\' AND try( to_int( current_value(\'pkuid\') ), -1 ) >= 0 AND regexp_match( current_value(\'description\'), \'\bphotos?\b\' )';
        $dependencies = qgisExpressionUtils::getCurrentValueCriteriaFromExpression($exp);

        $this->assertEquals(count($dependencies), 3);
        $this->assertTrue(in_array('name', $dependencies));
        $this->assertTrue(in_array('pkuid', $dependencies));
        $this->assertTrue(in_array('description', $dependencies));
    }

    public function testCurrentGeometry(): void
    {
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

    public function testReplaceAtlasVariables(): void
    {
        $exp = "'Flstk_'||replace(attribute(@atlas_feature,'Flurstück') ,'/','-')";
        $this->assertEquals(
            "'Flstk_'||replace(attribute(@feature,'Flurstück') ,'/','-')",
            qgisExpressionUtils::replaceAtlasVariables($exp, '"Flurstück"', 'parcels_id', 'Parcels')
        );

        $exp = "'Flstk_'||replace(@atlas_pagename,'/','-')";
        $this->assertEquals(
            "'Flstk_'||replace((\"Flurstück\"),'/','-')",
            qgisExpressionUtils::replaceAtlasVariables($exp, '"Flurstück"', 'parcels_id', 'Parcels')
        );
        // Empty page name expression: QGIS uses the page number
        $this->assertEquals(
            "'Flstk_'||replace('1','/','-')",
            qgisExpressionUtils::replaceAtlasVariables($exp, '', 'parcels_id', 'Parcels')
        );

        // Variables sharing the same prefix
        $exp = "@atlas_featureid||'-'||@atlas_featurenumber||'-'||@atlas_totalfeatures||'-'||area(@atlas_geometry)";
        $this->assertEquals(
            "@id||'-'||1||'-'||1||'-'||area(@geometry)",
            qgisExpressionUtils::replaceAtlasVariables($exp, '', 'parcels_id', 'Parcels')
        );

        // Layer variables are replaced by escaped string literals
        $exp = '@atlas_layername||@atlas_layerid';
        $this->assertEquals(
            "'Owner''s parcels'||'parcels_id'",
            qgisExpressionUtils::replaceAtlasVariables($exp, '', 'parcels_id', "Owner's parcels")
        );

        // Text in string literals and quoted field names is kept, unknown variables too
        $exp = "'@atlas_pagename'||\"@atlas_feature\"||@atlas_filename||@project_title";
        $this->assertEquals(
            $exp,
            qgisExpressionUtils::replaceAtlasVariables($exp, '"name"', 'parcels_id', 'Parcels')
        );
    }

    /**
     * The status and the errors of a replace expression text response are removed.
     */
    public function testLogReplaceExpressionTextErrors(): void
    {
        // A context keeping the logged messages
        $appContext = new class() extends ContextForTests {
            /** @var list<array{0: string, 1: string}> the logged messages and their categories */
            public array $messages = array();

            public function logMessage($message, $cat = 'default')
            {
                $this->messages[] = array($message, $cat);
            }
        };

        // Response of lizmap_server >= 2.16, with an expression in error
        $json = json_decode('{
            "type": "FeatureCollection",
            "status": "partial",
            "errors": [
                {"feature": 0, "key": "a", "error": "Expression \'round(\'x\')\' evaluation error"},
                {"feature": 1, "key": "a", "error": "Expression \'round(\'x\')\' evaluation error"}
            ],
            "features": [{"type": "Feature", "id": 0, "geometry": null, "properties": {"a": null}}]
        }');
        $errors = qgisExpressionUtils::logReplaceExpressionTextErrors($json, 'layer "test"', $appContext);

        // Each distinct error is logged once, and the first error of each string is returned
        $this->assertEquals(
            array(array("Replace expression text error for the layer \"test\": Expression 'round('x')' evaluation error (2 times)", 'lizmapadmin')),
            $appContext->messages
        );
        $this->assertEquals(array('a' => "Expression 'round('x')' evaluation error"), $errors);

        // The status and the errors are removed from the response
        $this->assertFalse(property_exists($json, 'status'));
        $this->assertFalse(property_exists($json, 'errors'));
        $this->assertCount(1, $json->features);
        $this->assertNull($json->features[0]->properties->a);

        // Response of an older plugin, without status nor errors
        $json = json_decode('{"type": "FeatureCollection", "features": []}');
        $errors = qgisExpressionUtils::logReplaceExpressionTextErrors($json, 'layer "test"', $appContext);

        $this->assertEquals(array(), $errors);
        $this->assertEquals('FeatureCollection', $json->type);
        $this->assertCount(0, $json->features);
    }

    /**
     * The details of an expression error are only given to the administrators and the publishers.
     */
    public function testExpressionErrorMessage(): void
    {
        // A context returning the locale key and its variables
        $appContext = new class() extends ContextForTests {
            public function getLocale($key, $variables = array())
            {
                return $key.': '.implode(' | ', $variables);
            }
        };

        // Administrator, with the right to update the repositories
        $appContext->setResult(array(
            'lizmap.admin.repositories.update' => true,
            'lizmap.admin.project.list.view' => false,
        ));
        $this->assertEquals(
            'view~edition.form.error.text.widget.details: Widget | The error',
            qgisExpressionUtils::expressionErrorMessage($appContext, 'view~edition.form.error.text.widget', 'Widget', 'The error')
        );

        // Publisher, with the right to view the projects list
        $appContext->setResult(array(
            'lizmap.admin.repositories.update' => false,
            'lizmap.admin.project.list.view' => true,
        ));
        $this->assertEquals(
            'view~edition.form.error.text.widget.details: Widget | The error',
            qgisExpressionUtils::expressionErrorMessage($appContext, 'view~edition.form.error.text.widget', 'Widget', 'The error')
        );

        // Other users: generic message, without the error
        $appContext->setResult(array(
            'lizmap.admin.repositories.update' => false,
            'lizmap.admin.project.list.view' => false,
        ));
        $this->assertEquals(
            'view~edition.form.error.text.widget: Widget',
            qgisExpressionUtils::expressionErrorMessage($appContext, 'view~edition.form.error.text.widget', 'Widget', 'The error')
        );
    }
}
