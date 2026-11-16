<?php

use Lizmap\Request\FeatureStream;
use Lizmap\Request\OGCResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Tests of the decoding of GeoJSON features by blocks.
 *
 * The decoded features must be exactly the ones of the whole GeoJSON,
 * whatever its layout (QGIS Server, PostgreSQL direct query, pretty printed)
 * and the chunk size, even when the separator between two features
 * also appears inside the features.
 *
 * @internal
 *
 * @coversNothing
 */
class FeatureStreamTest extends TestCase
{
    /**
     * Create a stream containing the given content.
     *
     * @param string $content the stream content
     *
     * @return resource the stream, positioned at its beginning
     */
    private static function stream(string $content)
    {
        $stream = fopen('php://memory', 'r+');
        fwrite($stream, $content);
        rewind($stream);

        return $stream;
    }

    /**
     * Get test features which are difficult to split.
     *
     * Their properties contain the separator between two features ("},{")
     * in strings and between nested objects, and an escaped new line.
     * The variable string length moves the separators in the chunks.
     *
     * @param int $count the number of features
     *
     * @return array the features, as arrays
     */
    private static function features(int $count): array
    {
        $features = array();
        for ($i = 0; $i < $count; ++$i) {
            $features[] = array(
                'type' => 'Feature',
                'id' => 'layer.'.$i,
                'geometry' => null,
                'properties' => array(
                    'name' => 'Feature '.$i,
                    // Separators between features inside strings and nested objects
                    'text' => str_repeat('x', $i % 13).'},{"a":1}, {'."\n".'"]}',
                    'json' => array(array('a' => 1), array('b' => array('c' => '},{'))),
                    // Arrays of objects, as in JSON fields, with many separators
                    'items' => array_fill(0, 3, array('k' => array(array('x' => '}]'), array('y' => '[{')))),
                    // Escaped quotes and a backslash at the end of a string
                    'escaped' => '"},{" \"[{\\',
                    'value' => $i * 1.5,
                ),
            );
        }

        return $features;
    }

    /**
     * Get the GeoJSON as written by QGIS Server: one feature per line,
     * separated by a new line and a comma.
     *
     * @param array $features the features
     *
     * @return string the GeoJSON
     */
    private static function qgisServerGeoJson(array $features): string
    {
        $lines = array();
        foreach ($features as $feature) {
            $lines[] = json_encode($feature);
        }

        return "{\"type\": \"FeatureCollection\",\n \"bbox\": [ 3.8, 43.6, 3.9, 43.7],\n \"features\": [\n  "
            .implode("\n ,", $lines)
            ."\n ]\n}\n";
    }

    /**
     * Get the GeoJSON as written by the PostgreSQL direct query of Lizmap:
     * features separated by a comma only, with new lines inside the features
     * (row_to_json with pretty_bool).
     *
     * @param array $features the features
     *
     * @return string the GeoJSON
     */
    private static function postgresqlGeoJson(array $features): string
    {
        $rows = array();
        foreach ($features as $feature) {
            $rows[] = '{"type":"Feature",'."\n".' "id":'.json_encode($feature['id']).",\n"
                .' "geometry":null,'."\n".' "properties":'.json_encode($feature['properties']).'}';
        }

        return '{"type": "FeatureCollection", "features": ['.implode(',', $rows).']}';
    }

    /**
     * Get the GeoJSON documents to decode.
     *
     * The small chunks (100 bytes) are smaller than a feature, so a feature
     * is often split between two chunks.
     *
     * @return array<string, array{0: string, 1: int, 2: int}> the GeoJSON,
     *                                                         the chunk size and the expected number of features
     */
    public static function geoJsonProvider(): array
    {
        $features = self::features(500);
        $pretty = json_encode(array('type' => 'FeatureCollection', 'features' => $features), JSON_PRETTY_PRINT);

        return array(
            'QGIS Server, small chunks' => array(self::qgisServerGeoJson($features), 100, 500),
            'QGIS Server, default chunks' => array(self::qgisServerGeoJson($features), 32768, 500),
            'PostgreSQL, small chunks' => array(self::postgresqlGeoJson($features), 100, 500),
            'PostgreSQL, default chunks' => array(self::postgresqlGeoJson($features), 32768, 500),
            // Many whitespaces around the separators
            'Pretty printed' => array($pretty, 256, 500),
            // Collection members after the features array
            'Members after features' => array(
                json_encode(array('type' => 'FeatureCollection', 'features' => $features, 'numberMatched' => 500)),
                1024,
                500,
            ),
            'No feature' => array('{"type": "FeatureCollection", "features": []}', 32768, 0),
            'No features member' => array('{"type": "FeatureCollection"}', 32768, 0),
        );
    }

    /**
     * Test that the features decoded by blocks are the same as the ones
     * decoded from the whole GeoJSON.
     *
     * @param string $geoJson   the GeoJSON
     * @param int    $chunkSize the number of bytes read at once
     * @param int    $count     the expected number of features
     */
    #[DataProvider('geoJsonProvider')]
    public function testRead(string $geoJson, int $chunkSize, int $count): void
    {
        // Reference: the features decoded at once
        $expected = json_decode($geoJson)->features ?? array();

        $features = iterator_to_array(FeatureStream::read(self::stream($geoJson), $chunkSize), false);

        $this->assertCount($count, $features);
        $this->assertEquals($expected, $features);
    }

    /**
     * Test that a truncated GeoJSON, for example after a network error,
     * raises an exception instead of returning partial data silently.
     */
    public function testTruncatedGeoJson(): void
    {
        // Cut the GeoJSON in the middle of the features
        $geoJson = self::qgisServerGeoJson(self::features(100));
        $truncated = substr($geoJson, 0, (int) (strlen($geoJson) * 0.7));

        $this->expectException(JsonException::class);
        iterator_to_array(FeatureStream::read(self::stream($truncated), 1024), false);
    }

    /**
     * Get responses and whether they contain GeoJSON.
     *
     * @return array<string, array{0: int, 1: string, 2: bool}> the code, the mime type and the expected result
     */
    public static function responseProvider(): array
    {
        return array(
            'GeoJSON' => array(200, 'application/vnd.geo+json; charset=utf-8', true),
            'JSON' => array(200, 'application/json', true),
            'Text JSON' => array(200, 'text/json', true),
            'QGIS Server exception' => array(200, 'text/xml; charset=utf-8', false),
            'HTML' => array(200, 'text/html', false),
            'Error code' => array(500, 'application/json', false),
        );
    }

    /**
     * Test the detection of the responses containing GeoJSON.
     *
     * @param int    $code     the HTTP status code
     * @param string $mime     the mime type
     * @param bool   $expected true if the response contains GeoJSON
     */
    #[DataProvider('responseProvider')]
    public function testIsGeoJsonResponse(int $code, string $mime, bool $expected): void
    {
        $response = new OGCResponse($code, $mime, '{"type": "FeatureCollection", "features": []}');
        $this->assertSame($expected, FeatureStream::isGeoJsonResponse($response));
    }

    /**
     * Test that an error response gives no feature, instead of a JSON exception.
     */
    public function testFromErrorResponse(): void
    {
        // A QGIS Server exception, with a success code
        $response = new OGCResponse(200, 'text/xml; charset=utf-8', '<ServiceExceptionReport/>');
        $this->assertCount(0, iterator_to_array(FeatureStream::fromResponse($response), false));
    }

    /**
     * Test the features of a GeoJSON response.
     */
    public function testFromResponse(): void
    {
        $geoJson = self::qgisServerGeoJson(self::features(50));
        $response = new OGCResponse(200, 'application/vnd.geo+json; charset=utf-8', $geoJson);

        $features = iterator_to_array(FeatureStream::fromResponse($response, 512), false);
        $this->assertEquals(json_decode($geoJson)->features, $features);
    }
}
