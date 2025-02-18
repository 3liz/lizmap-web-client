<?php
use PHPUnit\Framework\TestCase;
use Lizmap\Form;

class dummyQgisFormControls implements Form\QgisFormControlsInterface
{
    /**
     * @return Form\QgisFormControl[]
     */
    public function getQgisControls()
    {
        return array();
    }

    /**
     * @param string $name
     *
     * @return null|Form\QgisFormControl null if the control does not exists
     */
    public function getQgisControl($name)
    {
        return null;
    }

    /**
     * Return the control name for the jForms form.
     *
     * @param string $name the name of the qgis control
     *
     * @return null|string null if the control does not exist
     */
    public function getFormControlName($name)
    {
        return $name;
    }
}

/**
 * @internal
 * @coversNothing
 */
class qgisAttributeFormTest extends TestCase
{
    public function testSimpleContainer(): void
    {
        $xml = '<attributeEditorForm>
            <attributeEditorField showLabel="1" index="0" name="pkuid"/>
            <attributeEditorField showLabel="1" index="1" name="name"/>
            <attributeEditorField showLabel="1" index="2" name="description"/>
      </attributeEditorForm>';
        $sXml = simplexml_load_string($xml);
        $controls = new dummyQgisFormControls();
        $element = new qgisAttributeEditorElement($controls, $sXml, 'foo', 0, 0);

        $this->assertEquals(3, count($element->getFields()));

        $this->assertEquals(3, count($element->getChildrenBeforeTab()));
        $this->assertEquals(0, count($element->getChildrenAfterTab()));
        $this->assertEquals(0, count($element->getTabChildren()));
        $this->assertEquals('', $element->getName());
        $this->assertFalse($element->isGroupBox());
        $this->assertFalse($element->isTabPanel());
        $this->assertTrue($element->isContainer());
        $this->assertTrue($element->hasChildren());
        $this->assertEquals('foo', $element->getHtmlId());
        $this->assertEquals('foo', $element->getParentId());

        $this->assertEquals(0, count($element->getGroupVisibilityExpressions()));

        $cc = $element->getChildrenBeforeTab()[0];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('pkuid', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-0', $cc->getHtmlId());
        $this->assertEquals('foo', $cc->getParentId());

        $cc = $element->getChildrenBeforeTab()[1];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('name', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-1', $cc->getHtmlId());
        $this->assertEquals('foo', $cc->getParentId());

        $cc = $element->getChildrenBeforeTab()[2];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('description', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-2', $cc->getHtmlId());
        $this->assertEquals('foo', $cc->getParentId());
    }

    public function testSimpleGroupBox(): void
    {
        $xml = '<attributeEditorForm>
           <attributeEditorContainer showLabel="1" visibilityExpressionEnabled="0" visibilityExpression="" name="Generic" groupBox="1" columnCount="0">
            <attributeEditorField showLabel="1" index="0" name="pkuid"/>
            <attributeEditorField showLabel="1" index="1" name="name"/>
            <attributeEditorField showLabel="1" index="2" name="description"/>
          </attributeEditorContainer>
      </attributeEditorForm>';
        $sXml = simplexml_load_string($xml);
        $controls = new dummyQgisFormControls();
        $element = new qgisAttributeEditorElement($controls, $sXml, 'foo', 0, 0);

        $this->assertEquals(3, count($element->getFields()));

        $this->assertEquals(1, count($element->getChildrenBeforeTab()));
        $this->assertEquals(0, count($element->getChildrenAfterTab()));
        $this->assertEquals(0, count($element->getTabChildren()));
        $this->assertEquals('', $element->getName());

        $this->assertFalse($element->isGroupBox());
        $this->assertFalse($element->isTabPanel());
        $this->assertTrue($element->isContainer());
        $this->assertTrue($element->hasChildren());
        $this->assertEquals('foo', $element->getHtmlId());
        $this->assertEquals('foo', $element->getParentId());

        $this->assertEquals(1, count($element->getGroupVisibilityExpressions()));

        $c = $element->getChildrenBeforeTab()[0];

        $this->assertEquals(3, count($c->getChildrenBeforeTab()));
        $this->assertEquals(0, count($c->getChildrenAfterTab()));
        $this->assertEquals(0, count($c->getTabChildren()));
        $this->assertEquals('Generic', $c->getName());

        $this->assertTrue($c->isGroupBox());
        $this->assertFalse($c->isTabPanel());
        $this->assertTrue($c->isContainer());
        $this->assertTrue($c->hasChildren());
        $this->assertEquals('foo-group0', $c->getHtmlId());
        $this->assertEquals('foo', $c->getParentId());

        $cc = $c->getChildrenBeforeTab()[0];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('pkuid', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-group0-0', $cc->getHtmlId());
        $this->assertEquals('foo-group0', $cc->getParentId());

        $cc = $c->getChildrenBeforeTab()[1];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('name', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-group0-1', $cc->getHtmlId());
        $this->assertEquals('foo-group0', $cc->getParentId());

        $cc = $c->getChildrenBeforeTab()[2];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('description', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-group0-2', $cc->getHtmlId());
        $this->assertEquals('foo-group0', $cc->getParentId());
    }

    public function testTabAttributesForm(): void
    {
        $xml = '<attributeEditorForm>
        <attributeEditorContainer showLabel="1" visibilityExpressionEnabled="0" visibilityExpression="" name="Description" groupBox="0" columnCount="0">
          <attributeEditorContainer showLabel="1" visibilityExpressionEnabled="0" visibilityExpression="" name="Generic" groupBox="1" columnCount="0">
            <attributeEditorField showLabel="1" index="0" name="pkuid"/>
            <attributeEditorField showLabel="1" index="1" name="name"/>
            <attributeEditorField showLabel="1" index="2" name="description"/>
          </attributeEditorContainer>
          <attributeEditorContainer showLabel="1" visibilityExpressionEnabled="1" visibilityExpression="&quot;name&quot; IS NOT NULL AND &quot;name&quot; &lt;> \'\'" name="Other" groupBox="1" columnCount="0">
            <attributeEditorField showLabel="1" index="4" name="date"/>
            <attributeEditorField showLabel="1" index="5" name="type"/>
            <attributeEditorField showLabel="1" index="3" name="user"/>
          </attributeEditorContainer>
        </attributeEditorContainer>
        <attributeEditorContainer showLabel="1" visibilityExpressionEnabled="0" visibilityExpression="" name="Photo" groupBox="0" columnCount="0">
          <attributeEditorField showLabel="1" index="6" name="photo"/>
        </attributeEditorContainer>
      </attributeEditorForm>';
        $sXml = simplexml_load_string($xml);
        $controls = new dummyQgisFormControls();
        $element = new qgisAttributeEditorElement($controls, $sXml, 'foo', 0, 0);

        $this->assertEquals(7, count($element->getFields()));

        $this->assertEquals(0, count($element->getChildrenBeforeTab()));
        $this->assertEquals(0, count($element->getChildrenAfterTab()));
        $this->assertEquals(2, count($element->getTabChildren()));
        $this->assertEquals('', $element->getName());
        $this->assertFalse($element->isGroupBox());
        $this->assertFalse($element->isTabPanel());
        $this->assertTrue($element->isContainer());
        $this->assertTrue($element->hasChildren());
        $this->assertEquals('foo', $element->getHtmlId());
        $this->assertEquals('foo', $element->getParentId());

        $groupVisibilityExpressions = $element->getGroupVisibilityExpressions();
        $this->assertEquals(4, count($groupVisibilityExpressions));

        $photogroup = $element->getTabChildren()[1];

        $this->assertEquals(1, count($photogroup->getChildrenBeforeTab()));
        $this->assertEquals(0, count($photogroup->getChildrenAfterTab()));
        $this->assertEquals(0, count($photogroup->getTabChildren()));
        $this->assertEquals('Photo', $photogroup->getName());
        $this->assertFalse($photogroup->isGroupBox());
        $this->assertTrue($photogroup->isTabPanel());
        $this->assertTrue($photogroup->isContainer());
        $this->assertTrue($photogroup->hasChildren());
        $this->assertEquals('foo-tab1', $photogroup->getHtmlId());
        $this->assertEquals('foo', $photogroup->getParentId());

        $cc = $photogroup->getChildrenBeforeTab()[0];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('photo', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-tab1-0', $cc->getHtmlId());
        $this->assertEquals('foo-tab1', $cc->getParentId());

        $tab = $element->getTabChildren()[0];

        $this->assertEquals(2, count($tab->getChildrenBeforeTab()));
        $this->assertEquals(0, count($tab->getChildrenAfterTab()));
        $this->assertEquals(0, count($tab->getTabChildren()));
        $this->assertEquals('Description', $tab->getName());
        $this->assertFalse($tab->isGroupBox());
        $this->assertTrue($tab->isTabPanel());
        $this->assertTrue($tab->isContainer());
        $this->assertTrue($tab->hasChildren());
        $this->assertEquals('foo-tab0', $tab->getHtmlId());
        $this->assertEquals('foo', $tab->getParentId());

        $tab1 = $tab->getChildrenBeforeTab()[0];

        $this->assertEquals(3, count($tab1->getChildrenBeforeTab()));
        $this->assertEquals(0, count($tab1->getChildrenAfterTab()));
        $this->assertEquals(0, count($tab1->getTabChildren()));
        $this->assertEquals('Generic', $tab1->getName());
        $this->assertTrue($tab1->isGroupBox());
        $this->assertFalse($tab1->isTabPanel());
        $this->assertTrue($tab1->isContainer());
        $this->assertTrue($tab1->hasChildren());
        $this->assertEquals('foo-tab0-group0', $tab1->getHtmlId());
        $this->assertEquals('foo-tab0', $tab1->getParentId());

        $tab2 = $tab->getChildrenBeforeTab()[1];

        $this->assertEquals(3, count($tab2->getChildrenBeforeTab()));
        $this->assertEquals(0, count($tab2->getChildrenAfterTab()));
        $this->assertEquals(0, count($tab2->getTabChildren()));
        $this->assertEquals('Other', $tab2->getName());
        $this->assertTrue($tab2->isGroupBox());
        $this->assertFalse($tab2->isTabPanel());
        $this->assertTrue($tab2->isContainer());
        $this->assertTrue($tab2->hasChildren());
        $this->assertEquals('foo-tab0-group1', $tab2->getHtmlId());
        $this->assertEquals('foo-tab0', $tab2->getParentId());

        $this->assertTrue(array_key_exists($tab2->getHtmlId(), $groupVisibilityExpressions));
        $this->assertNotEquals('', $groupVisibilityExpressions[$tab2->getHtmlId()]);
        $this->assertEquals('"name" IS NOT NULL AND "name" <> \'\'', $groupVisibilityExpressions[$tab2->getHtmlId()]);

        $cc = $tab1->getChildrenBeforeTab()[0];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('pkuid', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-tab0-group0-0', $cc->getHtmlId());
        $this->assertEquals('foo-tab0-group0', $cc->getParentId());

        $cc = $tab1->getChildrenBeforeTab()[1];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('name', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-tab0-group0-1', $cc->getHtmlId());
        $this->assertEquals('foo-tab0-group0', $cc->getParentId());

        $cc = $tab1->getChildrenBeforeTab()[2];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('description', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-tab0-group0-2', $cc->getHtmlId());
        $this->assertEquals('foo-tab0-group0', $cc->getParentId());

        $cc = $tab2->getChildrenBeforeTab()[0];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('date', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-tab0-group1-0', $cc->getHtmlId());
        $this->assertEquals('foo-tab0-group1', $cc->getParentId());

        $cc = $tab2->getChildrenBeforeTab()[1];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('type', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-tab0-group1-1', $cc->getHtmlId());
        $this->assertEquals('foo-tab0-group1', $cc->getParentId());

        $cc = $tab2->getChildrenBeforeTab()[2];

        $this->assertEquals(0, count($cc->getChildrenBeforeTab()));
        $this->assertEquals(0, count($cc->getChildrenAfterTab()));
        $this->assertEquals(0, count($cc->getTabChildren()));
        $this->assertEquals('user', $cc->getName());
        $this->assertFalse($cc->isGroupBox());
        $this->assertFalse($cc->isTabPanel());
        $this->assertFalse($cc->isContainer());
        $this->assertFalse($cc->hasChildren());
        $this->assertEquals('foo-tab0-group1-2', $cc->getHtmlId());
        $this->assertEquals('foo-tab0-group1', $cc->getParentId());
    }
}
