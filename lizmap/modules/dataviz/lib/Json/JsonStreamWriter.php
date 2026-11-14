<?php

/**
 * Write JSON data containing columns to a stream.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Json;

/**
 * Write data as JSON to a stream, copying the JsonColumn values directly
 * from their temporary stream, without decoding them.
 *
 * The data, except the columns, is encoded with json_encode: each column
 * is replaced by a unique placeholder string, then the encoded JSON is split
 * on the placeholders and the columns are written between the parts.
 */
class JsonStreamWriter
{
    /** Flags used to encode the JSON, the same as jResponseJson */
    public const JSON_FLAGS = 0;

    /**
     * Write the data as JSON to the output stream.
     *
     * The JsonColumn objects found in the data are written as JSON arrays,
     * by copying their content, so their values are never loaded in memory.
     *
     * @param mixed    $data   the data, which can contain JsonColumn objects
     *                         at any depth of nested arrays
     * @param resource $output the output stream
     */
    public static function write(mixed $data, $output): void
    {
        // Replace each column by a placeholder. The random token makes the
        // placeholders unique, so they can not be confused with a data value.
        $token = bin2hex(random_bytes(8));
        $columns = array();
        if (is_array($data)) {
            array_walk_recursive($data, function (&$value) use (&$columns, $token) {
                if ($value instanceof JsonColumn) {
                    $placeholder = '@column:'.$token.':'.count($columns).'@';
                    $columns[] = $value;
                    $value = $placeholder;
                }
            });
        }

        // Encode the data, which is small without the columns
        $json = json_encode($data, self::JSON_FLAGS);

        // Without column, the JSON is complete
        if (count($columns) === 0) {
            fwrite($output, $json);

            return;
        }

        // Split the JSON on the placeholders (quotes included). With the
        // captured column index, the even parts are JSON and the odd parts
        // are the indexes of the columns to write instead of the placeholders.
        $parts = preg_split('/"@column:'.$token.':(\d+)@"/', $json, -1, PREG_SPLIT_DELIM_CAPTURE);
        foreach ($parts as $i => $part) {
            if ($i % 2 === 0) {
                fwrite($output, $part);
            } else {
                $columns[(int) $part]->writeTo($output);
            }
        }
    }

    /**
     * Encode the data as a JSON string.
     *
     * Unlike write(), the whole JSON is loaded in memory: use it only for
     * small data or for tests.
     *
     * @param mixed $data the data, which can contain JsonColumn objects
     *
     * @return string the JSON
     */
    public static function encode(mixed $data): string
    {
        // Write the JSON in a memory stream, then get its content
        $output = fopen('php://memory', 'r+');
        self::write($data, $output);
        rewind($output);
        $json = stream_get_contents($output);
        fclose($output);

        return $json;
    }
}
