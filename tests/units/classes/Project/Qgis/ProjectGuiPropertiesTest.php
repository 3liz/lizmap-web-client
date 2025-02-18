<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Project\Qgis;
use Lizmap\App;

/**
 * @internal
 * @coversNothing
 */
class ProjectGuiPropertiesTest extends TestCase
{
    public function testConstruct(): void
    {
        $data = array(
          'CanvasColorBluePart' => 255,
          'CanvasColorGreenPart' => 255,
          'CanvasColorRedPart' => 255,
          'SelectionColorAlphaPart' => 255,
          'SelectionColorBluePart' => 0,
          'SelectionColorGreenPart' => 255,
          'SelectionColorRedPart' => 255,
        );

        $properties = new Qgis\ProjectGuiProperties($data);
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $properties->$prop);
        }
      }

    public function testGetCanvasColor(): void
    {
      $data = array(
        'CanvasColorBluePart' => 255,
        'CanvasColorGreenPart' => 255,
        'CanvasColorRedPart' => 255,
        'SelectionColorAlphaPart' => 255,
        'SelectionColorBluePart' => 0,
        'SelectionColorGreenPart' => 255,
        'SelectionColorRedPart' => 255,
      );

      $properties = new Qgis\ProjectGuiProperties($data);
      $this->assertEquals('rgb(255, 255, 255)', $properties->getCanvasColor());

      $data = array(
        'CanvasColorBluePart' => 200,
        'CanvasColorGreenPart' => 100,
        'CanvasColorRedPart' => 50,
        'SelectionColorAlphaPart' => 255,
        'SelectionColorBluePart' => 0,
        'SelectionColorGreenPart' => 255,
        'SelectionColorRedPart' => 255,
      );

      $properties = new Qgis\ProjectGuiProperties($data);
      $this->assertEquals('rgb(50, 100, 200)', $properties->getCanvasColor());
    }

    public function testExceptionNoSuchProperty(): void
    {
        $data = array(
          'CanvasColorBluePart' => 255,
          'CanvasColorGreenPart' => 255,
          'CanvasColorRedPart' => 255,
          'CanvasColorAlphaPart' => 255,
        );

        $srs = new Qgis\ProjectGuiProperties($data);
        $this->assertEquals($data['CanvasColorBluePart'], $srs->CanvasColorBluePart);
        $this->assertEquals($data['CanvasColorGreenPart'], $srs->CanvasColorGreenPart);
        $this->assertEquals($data['CanvasColorRedPart'], $srs->CanvasColorRedPart);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('no such property `CanvasColorAlphaPart`.');
        $srs->CanvasColorAlphaPart;
    }

    public function testExceptionMandatoryProperties(): void
    {
        $data = array(
          'SelectionColorAlphaPart' => 255,
          'SelectionColorBluePart' => 0,
          'SelectionColorGreenPart' => 255,
          'SelectionColorRedPart' => 255,
        );

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('$data has to contain `CanvasColorBluePart`, `CanvasColorGreenPart`, `CanvasColorRedPart` keys!');
        $srs = new Qgis\ProjectGuiProperties($data);
    }

    public function testFromXmlReader(): void
    {
        $xmlStr = '
        <Gui>
          <CanvasColorBluePart type="int">255</CanvasColorBluePart>
          <CanvasColorGreenPart type="int">255</CanvasColorGreenPart>
          <CanvasColorRedPart type="int">255</CanvasColorRedPart>
          <SelectionColorAlphaPart type="int">255</SelectionColorAlphaPart>
          <SelectionColorBluePart type="int">0</SelectionColorBluePart>
          <SelectionColorGreenPart type="int">255</SelectionColorGreenPart>
          <SelectionColorRedPart type="int">255</SelectionColorRedPart>
        </Gui>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $properties = Qgis\ProjectGuiProperties::fromXmlReader($oXml);

        $data = array(
          'CanvasColorBluePart' => 255,
          'CanvasColorGreenPart' => 255,
          'CanvasColorRedPart' => 255,
          'SelectionColorAlphaPart' => 255,
          'SelectionColorBluePart' => 0,
          'SelectionColorGreenPart' => 255,
          'SelectionColorRedPart' => 255,
        );
        foreach($data as $prop => $value) {
            $this->assertEquals($value, $properties->$prop, $prop);
        }
    }

    public function testExceptionMandatoryElements(): void
    {
        $xmlStr = '
        <Gui>
          <SelectionColorAlphaPart type="int">255</SelectionColorAlphaPart>
          <SelectionColorBluePart type="int">0</SelectionColorBluePart>
          <SelectionColorGreenPart type="int">255</SelectionColorGreenPart>
          <SelectionColorRedPart type="int">255</SelectionColorRedPart>
        </Gui>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('`Gui` element has to contain `CanvasColorBluePart`, `CanvasColorGreenPart`, `CanvasColorRedPart` elements!');
        Qgis\ProjectGuiProperties::fromXmlReader($oXml);
    }
}
