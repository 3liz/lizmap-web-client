<?php

/**
 * File tools for Lizmap.
 *
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

class FileTools
{
    /**
     * Tail in PHP, capable of eating big files.
     *
     * @author  Torleif Berger
     *
     * @see    http://www.geekality.net/?p=1654
     *
     * @return string
     */
    public static function tail(string $filepath, int $lines = 10, int $buffer = 4096)
    {
        // Check if the file path exists and is a file
        if (!file_exists($filepath) || !is_file($filepath)) {
            return '';
        }

        // Open the file
        $f = fopen($filepath, 'rb');
        // Jump to last character
        fseek($f, -1, SEEK_END);

        // Prepare to collect output
        $output = '';
        $chunk = '';

        // Start reading it and adjust line number if necessary
        // (Otherwise the result would be wrong if file doesn't end with a blank line)
        $TAIL_NL = "\n";
        if (fread($f, 1) != $TAIL_NL) {
            --$lines;
        }

        // While we would like more
        while (ftell($f) > 0 && $lines >= 0) {
            // Figure out how far back we should jump
            $seek = min(ftell($f), $buffer);

            // Do the jump (backwards, relative to where we are)
            fseek($f, -$seek, SEEK_CUR);

            // Read a chunk and prepend it to our output
            $output = ($chunk = fread($f, $seek)).$output;

            // Jump back to where we started reading
            fseek($f, -mb_strlen($chunk, '8bit'), SEEK_CUR);

            // Decrease our line counter
            $lines -= substr_count($chunk, $TAIL_NL);
        }

        // While we have too many lines
        // (Because of buffer size we might have read too many)
        while ($lines++ < 0) {
            // Find first newline and remove all text before that
            $output = substr($output, strpos($output, $TAIL_NL) + 1);
        }

        // Close file and return
        fclose($f);

        return $output;
    }
}
