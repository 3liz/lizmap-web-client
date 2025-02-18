<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Form\QgisFormControlProperties;

require_once __DIR__.'/../../../../lizmap/vendor/jelix/jelix/lib/jelix/forms/jFormsBase.class.php';

/**
 * @internal
 * @coversNothing
 */
class QgisFormControlPropertiesTest extends TestCase
{
    function testIsEditable(): void {
        # TextEdit - editable
        $properties = new QgisFormControlProperties(
            'id',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'Editable' => true
            )
        );
        $this->assertTrue($properties->isEditable());

        # TextEdit - not editable
        $properties = new QgisFormControlProperties(
            'id',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'Editable' => false
            )
        );
        $this->assertFalse($properties->isEditable());

        # TextEdit - field editable
        $properties = new QgisFormControlProperties(
            'id',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'fieldEditable' => true
            )
        );
        $this->assertTrue($properties->isEditable());

        # TextEdit - field not editable
        $properties = new QgisFormControlProperties(
            'id',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'fieldEditable' => false
            )
        );
        $this->assertFalse($properties->isEditable());

        # UniqueValues - editable
        $properties = new QgisFormControlProperties(
            'author',
            'UniqueValues',
            'input',
            array(
                'Editable' => true
            )
        );
        $this->assertTrue($properties->isEditable());

        # UniqueValues - not editable
        $properties = new QgisFormControlProperties(
            'author',
            'UniqueValues',
            'input',
            array(
                'Editable' => false
            )
        );
        $this->assertFalse($properties->isEditable());

        # ValueMap
        $properties = new QgisFormControlProperties(
            'checked',
            'ValueMap',
            'menulist',
            array(
                'valueMap' => array(
                     'true' => 'Yes',
                     'false' => 'No',
                     '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => '<NULL>',
                ),
                'Editable' => 1
            )
        );
        $this->assertTrue($properties->isEditable());
    }

    function testGetEditAttribute(): void {

        $properties = new QgisFormControlProperties(
            'risque',
            'RelationReference',
            'menulist',
            array(
                'AllowNULL' => true,
                'OrderByValue' => false,
                'Relation' => 'tab_demand_risque_risque_66c_risque',
                'MapIdentification' => false,
                'ReferencedLayerName' => 'risque',
                'ReferencedLayerId' => 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3',
            )
        );

        $this->assertTrue($properties->getEditAttribute('AllowNULL'));
        $this->assertTrue($properties->getEditAttribute('AllowNull'));
        $this->assertTrue($properties->getEditAttribute('allowNull'));
        $this->assertTrue($properties->getEditAttribute('allownull'));

        $this->assertEquals($properties->getEditAttribute('ReferencedLayerId'), 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3');
        $this->assertEquals($properties->getEditAttribute('referencedLayerId'), 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3');
        $this->assertEquals($properties->getEditAttribute('referencedLayerid'), 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3');
        $this->assertEquals($properties->getEditAttribute('referencedlayerid'), 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3');
    }

    function testGetValueRelationData(): void {

        $properties = new QgisFormControlProperties(
            'tram_id',
            'ValueRelation',
            'menulist',
            array(
                'AllowMulti' => false,
                'AllowNull' => true,
                'FilterExpression' => '',
                'Key' => 'osm_id',
                'Layer' => 'tramway20150328114206278',
                'OrderByValue' => true,
                'UseCompleter' => false,
                'Value' => 'test',
            )
        );

        $valueRelationData = $properties->getValueRelationData();
        $this->assertTrue(is_array($valueRelationData));
        $this->assertTrue($valueRelationData['allowNull']);
        $this->assertTrue($valueRelationData['orderByValue']);
        $this->assertEquals($valueRelationData['layer'], 'tramway20150328114206278');
        $this->assertEquals($valueRelationData['layerName'], '');
        $this->assertEquals($valueRelationData['key'], 'osm_id');
        $this->assertEquals($valueRelationData['value'], 'test');
        $this->assertFalse($valueRelationData['allowMulti']);
        $this->assertEquals($valueRelationData['filterExpression'], '');
        $this->assertFalse($valueRelationData['useCompleter']);
        $this->assertTrue($valueRelationData['fieldEditable']);
    }

    function testGetRelationReference(): void {

        $properties = new QgisFormControlProperties(
            'risque',
            'RelationReference',
            'menulist',
            array(
                'AllowNull' => true,
                'OrderByValue' => false,
                'Relation' => 'tab_demand_risque_risque_66c_risque',
                'MapIdentification' => false,
                'ReferencedLayerName' => 'risque',
                'ReferencedLayerId' => 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3',
            )
        );

        $relationReferenceData = $properties->getRelationReference();
        $this->assertTrue(is_array($relationReferenceData));
        $this->assertTrue($relationReferenceData['allowNull']);
        $this->assertFalse($relationReferenceData['orderByValue']);
        $this->assertEquals($relationReferenceData['relation'], 'tab_demand_risque_risque_66c_risque');
        $this->assertFalse($relationReferenceData['mapIdentification']);
        $this->assertTrue(is_array($relationReferenceData['filters']));
        $this->assertCount(0, $relationReferenceData['filters']);
        $this->assertEquals($relationReferenceData['filterExpression'], Null);
        $this->assertFalse($relationReferenceData['chainFilters']);
        $this->assertEquals($relationReferenceData['referencedLayerName'], 'risque');
        $this->assertEquals($relationReferenceData['referencedLayerId'], 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3');

        # AllowNULL / not AllowNull
        # referencedLayerName / not ReferencedLayerName
        # referencedLayerId / not ReferencedLayerId
        $properties = new QgisFormControlProperties(
            'risque',
            'RelationReference',
            'menulist',
            array(
                'AllowNULL' => true,
                'OrderByValue' => false,
                'Relation' => 'tab_demand_risque_risque_66c_risque',
                'MapIdentification' => false,
                'referencedLayerName' => 'risque',
                'referencedLayerId' => 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3',
            )
        );

        $relationReferenceData = $properties->getRelationReference();
        $this->assertTrue(is_array($relationReferenceData));
        $this->assertTrue($relationReferenceData['allowNull']);
        $this->assertFalse($relationReferenceData['orderByValue']);
        $this->assertEquals($relationReferenceData['relation'], 'tab_demand_risque_risque_66c_risque');
        $this->assertFalse($relationReferenceData['mapIdentification']);
        $this->assertTrue(is_array($relationReferenceData['filters']));
        $this->assertCount(0, $relationReferenceData['filters']);
        $this->assertEquals($relationReferenceData['filterExpression'], Null);
        $this->assertFalse($relationReferenceData['chainFilters']);
        $this->assertEquals($relationReferenceData['referencedLayerName'], 'risque');
        $this->assertEquals($relationReferenceData['referencedLayerId'], 'risque_66cb8d43_86b7_4583_9217_f7ead54463c3');
    }
}
