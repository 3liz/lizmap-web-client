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
 * The stream is read by chunks. In each chunk, the block of complete features
 * is found by searching backward for a separator between two features:
 * a "}" followed by a "," and a "{" (whitespaces allowed). This works for the
 * GeoJSON written by QGIS Server and by the PostgreSQL direct query of Lizmap.
 *
 * Such a separator can also be found inside a feature (in a string or between
 * nested objects): the block is then not valid JSON, json_decode fails and the
 * previous separator is tried. As a block must start and end at feature
 * boundaries to be valid JSON, wrong features can not be returned.
 *
 * Usage, with the response of a WFS GetFeature request in GeoJSON:
 *     foreach (FeatureStream::fromResponse($wfsRequest->process()) as $feature) {
 *         $value = $feature->properties->name;
 *     }
 */
class FeatureStream
{
    /**
     * Maximum number of separators tried in a chunk before reading the next one.
     */
    private const MAX_CUT_ATTEMPTS = 8;

    /**
     * Maximum number of commas examined in a chunk to find a separator.
     */
    private const MAX_COMMAS = 4096;

    /**
     * Maximum number of whitespaces around a separator.
     */
    private const MAX_WHITESPACES = 64;

    /**
     * Get the features of the GeoJSON body of a response.
     *
     * The caller must check the response code and mime type before:
     * an error response is not GeoJSON.
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
        // The generator keeps a reference to the PHP stream of the body
        return self::read(StreamWrapper::getResource($response->getBodyAsStream()), $chunkSize);
    }

    /**
     * Get the features of the GeoJSON stream.
     *
     * The stream is read by chunks, and the complete features of the chunks
     * are decoded together. Only the current chunk and the decoded block of
     * features are kept in memory.
     *
     * @param resource $stream    the GeoJSON FeatureCollection stream
     * @param int      $chunkSize the number of bytes read at once
     *
     * @return \Generator<int, object> the features, as objects
     *
     * @throws \JsonException if the GeoJSON is not valid
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
                // No features array: decode the whole content
                $collection = json_decode($buffer, false, 512, JSON_THROW_ON_ERROR);
                foreach ($collection->features ?? array() as $feature) {
                    yield $feature;
                }

                return;
            }
            $buffer .= $chunk;
            $start = self::findFeaturesStart($buffer);
        }

        // Keep only the features in the buffer: it starts with the first one
        $buffer = substr($buffer, $start);

        // Read the next chunks and decode the complete features of the buffer.
        // The last feature, which may be incomplete, stays in the buffer.
        while (true) {
            $chunk = fread($stream, $chunkSize);
            if ($chunk === false || $chunk === '') {
                break;
            }
            $buffer .= $chunk;

            $features = self::decodeCompleteFeatures($buffer);
            if ($features !== null) {
                foreach ($features as $feature) {
                    yield $feature;
                }
                unset($features);
            }
        }

        // The buffer contains the last features, the end of the features
        // array and of the collection, and maybe other collection members
        $collection = json_decode('{"features":['.$buffer, false, 512, JSON_THROW_ON_ERROR);
        foreach ($collection->features as $feature) {
            yield $feature;
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
     * Decode the complete features at the beginning of the buffer
     * and remove them from the buffer.
     *
     * The block of features ends at the last separator found in the buffer.
     * If the block can not be decoded, the separator was inside a feature,
     * and the previous separators are tried.
     *
     * @param string $buffer the features, the first one starts the buffer
     *
     * @return null|array the decoded features, null if no block can be decoded yet
     */
    private static function decodeCompleteFeatures(string &$buffer): ?array
    {
        $offset = strlen($buffer);
        for ($attempt = 0; $attempt < self::MAX_CUT_ATTEMPTS; ++$attempt) {
            // Find the previous separator between two features
            $comma = self::findSeparatorBefore($buffer, $offset);
            if ($comma === false) {
                return null;
            }

            // Decode the features before the separator as a JSON array.
            // It is valid JSON only if the separator is between two features.
            $features = json_decode('['.substr($buffer, 0, $comma).']');
            if (is_array($features)) {
                // Keep the features after the separator in the buffer
                $buffer = substr($buffer, $comma + 1);

                return $features;
            }

            // The separator is inside a feature: try the previous one
            $offset = $comma;
        }

        // Too many attempts: wait for the next chunk
        return null;
    }

    /**
     * Find, backward from the offset, a comma between "}" and "{".
     *
     * Whitespaces are allowed around the comma, as QGIS Server writes
     * a new line before it.
     *
     * @param string $buffer the features
     * @param int    $offset the position before which the comma is searched
     *
     * @return false|int the position of the comma, false if not found
     */
    private static function findSeparatorBefore(string $buffer, int $offset): false|int
    {
        for ($commas = 0; $offset > 0 && $commas < self::MAX_COMMAS; ++$commas) {
            // Find the previous comma: a negative offset makes strrpos
            // search backward, from the character before $offset
            $comma = strrpos($buffer, ',', $offset - strlen($buffer) - 1);
            if ($comma === false) {
                return false;
            }
            $offset = $comma;

            // The comma must follow a "}", ignoring whitespaces
            $before = rtrim(substr($buffer, max(0, $comma - self::MAX_WHITESPACES), min(self::MAX_WHITESPACES, $comma)));
            if (!str_ends_with($before, '}')) {
                continue;
            }
            // and be followed by a "{", ignoring whitespaces
            $after = ltrim(substr($buffer, $comma + 1, self::MAX_WHITESPACES));
            if (!str_starts_with($after, '{')) {
                continue;
            }

            return $comma;
        }

        return false;
    }
}
