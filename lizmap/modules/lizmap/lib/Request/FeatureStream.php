<?php

/**
 * Read the features of a GeoJSON FeatureCollection stream by blocks.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace Lizmap\Request;

use GuzzleHttp\Psr7\StreamWrapper;

/**
 * Decode the features of a GeoJSON FeatureCollection stream with the native
 * json_decode, by blocks of features, so the memory stays bounded.
 *
 * The stream is read by chunks. The JSON structure of the features array is
 * followed in a single pass: the depth of the objects and arrays, and whether
 * the current position is inside a string. A feature ends when the depth goes
 * back to the level of the features array, so the end of each feature is known
 * exactly, whatever its content: nested objects, arrays of objects, strings
 * containing braces, or any JSON structure in the properties.
 *
 * Only the structural characters are examined one by one: the other characters
 * are skipped with strcspn. The complete features of each chunk are then decoded
 * together with json_decode.
 *
 * Usage, with the response of a WFS GetFeature request in GeoJSON:
 *     foreach (FeatureStream::fromResponse($wfsRequest->process()) as $feature) {
 *         $value = $feature->properties->name;
 *     }
 */
class FeatureStream
{
    /**
     * Get the features of the GeoJSON body of a response.
     *
     * An error response, with an HTTP error code or with a mime type which is
     * not JSON, for example a QGIS Server exception in XML, gives no feature:
     * the error is logged.
     *
     * @param OGCResponse|ProxyResponse $response  the response, for example of a WFS GetFeature request
     * @param int                       $chunkSize the number of bytes read at once
     *
     * @return \Generator<int, object> the features, as objects
     *
     * @throws \JsonException if the GeoJSON is not valid
     */
    public static function fromResponse($response, int $chunkSize = 32768): \Generator
    {
        // Error responses are not GeoJSON
        if (!self::isGeoJsonResponse($response)) {
            self::log('The response is not GeoJSON, code: '.$response->getCode().', mime type: '.$response->getMime());

            return self::noFeature();
        }

        // The generator keeps a reference to the PHP stream of the body
        return self::read(StreamWrapper::getResource($response->getBodyAsStream()), $chunkSize);
    }

    /**
     * Check if a response contains GeoJSON.
     *
     * The response must have a success code and a JSON mime type, for example
     * application/vnd.geo+json or application/json, with or without charset.
     *
     * @param OGCResponse|ProxyResponse $response the response
     *
     * @return bool true if the response contains GeoJSON
     */
    public static function isGeoJsonResponse($response): bool
    {
        // HTTP error code
        if ($response->getCode() >= 400) {
            return false;
        }

        // The mime type, without parameters like the charset
        $mime = strtolower(trim(explode(';', (string) $response->getMime())[0]));

        return str_ends_with($mime, '/json') || str_ends_with($mime, '+json');
    }

    /**
     * Get the features of the GeoJSON stream.
     *
     * The stream is read by chunks, and the complete features of each chunk
     * are decoded together. Only the current chunk and the decoded block of
     * features are kept in memory.
     *
     * @param resource $stream    the GeoJSON FeatureCollection stream
     * @param int      $chunkSize the number of bytes read at once
     *
     * @return \Generator<int, object> the features, as objects
     *
     * @throws \JsonException if the GeoJSON is not valid or not complete
     */
    public static function read($stream, int $chunkSize = 32768): \Generator
    {
        // Read the stream until the beginning of the features array,
        // after the other members of the collection (type, bbox...)
        $buffer = '';
        $start = false;
        while ($start === false) {
            $chunk = fread($stream, $chunkSize);
            if ($chunk === false || $chunk === '') {
                // No features array: decode the whole content, which must be valid JSON
                $collection = json_decode($buffer, false, 512, JSON_THROW_ON_ERROR);
                if (!is_object($collection) || !property_exists($collection, 'features')) {
                    self::log('The GeoJSON has no features array');

                    return;
                }
                foreach ($collection->features as $feature) {
                    yield $feature;
                }

                return;
            }
            $buffer .= $chunk;
            $start = self::findFeaturesStart($buffer);
        }

        // Keep only the features in the buffer
        $buffer = substr($buffer, $start);

        // State of the JSON structure, kept between the chunks
        // the next position to examine in the buffer
        $position = 0;
        // the depth in the features array: 0 between two features
        $depth = 0;
        // true inside a string
        $inString = false;
        // the position of the "}" ending the last complete feature, -1 if none
        $lastEnd = -1;
        // true when the "]" ending the features array is found
        $complete = false;

        while (true) {
            // Follow the JSON structure in the new part of the buffer
            $length = strlen($buffer);
            while ($position < $length) {
                if ($inString) {
                    // Skip to the end of the string, or to an escaped character
                    $position += strcspn($buffer, '"\\', $position);
                    if ($position >= $length) {
                        break;
                    }
                    if ($buffer[$position] === '\\') {
                        // The escaped character can not end the string
                        $position += 2;

                        continue;
                    }
                    $inString = false;
                    ++$position;

                    continue;
                }

                // Skip to the next string, object or array delimiter
                $position += strcspn($buffer, '"{}[]', $position);
                if ($position >= $length) {
                    break;
                }
                $char = $buffer[$position];
                if ($char === '"') {
                    $inString = true;
                } elseif ($char === '{' || $char === '[') {
                    ++$depth;
                } else {
                    --$depth;
                    if ($depth === 0) {
                        // End of a feature
                        $lastEnd = $position;
                    } elseif ($depth < 0) {
                        // End of the features array
                        $complete = true;

                        break 2;
                    }
                }
                ++$position;
            }

            // Decode the complete features, and keep the rest in the buffer
            if ($lastEnd >= 0) {
                foreach (self::decodeFeatures(substr($buffer, 0, $lastEnd + 1)) as $feature) {
                    yield $feature;
                }
                $buffer = substr($buffer, $lastEnd + 1);
                $position -= $lastEnd + 1;
                $lastEnd = -1;
            }

            // Read the next chunk
            $chunk = fread($stream, $chunkSize);
            if ($chunk === false || $chunk === '') {
                break;
            }
            $buffer .= $chunk;
        }

        // A truncated GeoJSON, for example after a network error,
        // must not give partial data silently
        if (!$complete) {
            throw new \JsonException('The features array of the GeoJSON is not complete');
        }

        // The last features, before the end of the features array
        if ($lastEnd >= 0) {
            foreach (self::decodeFeatures(substr($buffer, 0, $lastEnd + 1)) as $feature) {
                yield $feature;
            }
        }
    }

    /**
     * Get a generator without feature.
     *
     * @return \Generator<int, object> an empty generator
     */
    private static function noFeature(): \Generator
    {
        yield from array();
    }

    /**
     * Log a message for the administrator.
     *
     * @param string $message the message
     */
    private static function log(string $message): void
    {
        // A logging error must not stop the reading of the features,
        // for example in unit tests without the Jelix logger configuration
        try {
            \jLog::log('FeatureStream: '.$message, 'lizmapadmin');
        } catch (\Throwable $e) {
            // Nothing to do
        }
    }

    /**
     * Find the beginning of the features array in the buffer.
     *
     * @param string $buffer the beginning of the GeoJSON
     *
     * @return false|int the position after the "[" of the features array,
     *                   false if it is not in the buffer yet
     */
    private static function findFeaturesStart(string $buffer): false|int
    {
        // The features member, then the opening bracket of its array
        $key = strpos($buffer, '"features"');
        if ($key === false) {
            return false;
        }
        $bracket = strpos($buffer, '[', $key + strlen('"features"'));
        if ($bracket === false) {
            return false;
        }

        return $bracket + 1;
    }

    /**
     * Decode a block of complete features.
     *
     * @param string $block the features separated by commas, maybe starting with
     *                      the comma after the previous block
     *
     * @return array the decoded features
     *
     * @throws \JsonException if the features are not valid JSON
     */
    private static function decodeFeatures(string $block): array
    {
        // Remove the comma between the previous block and this one
        $block = ltrim($block, " \t\r\n,");

        return json_decode('['.$block.']', false, 512, JSON_THROW_ON_ERROR);
    }
}
