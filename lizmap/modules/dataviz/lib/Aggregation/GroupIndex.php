<?php

/**
 * Index of the distinct group values (X values) of a plot.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Aggregation;

/**
 * Give a stable position to each distinct value, in order of first appearance.
 *
 * The index is shared by all the traces of a plot, so that the aggregated
 * values of every trace are aligned on the same X values.
 *
 * Values are not used directly as PHP array keys: it would cast floats to int
 * ("1.5" and "1.7" in the same group) and numeric strings to int.
 */
final class GroupIndex
{
    /** @var array<string, int> */
    private array $positions = array();

    /** @var list<mixed> */
    private array $values = array();

    /**
     * Get the key identifying a group value.
     *
     * Two values get the same key only if they are the same group: same
     * type and same value. It is used as PHP array key by the index, and to
     * compare the groups of consecutive features when they are sorted.
     *
     * @param mixed $value the group value: a scalar, or an array for groups
     *                     made of several values
     *
     * @return string the key of the value
     */
    public static function keyOf(mixed $value): string
    {
        // Build a key keeping the value type: the prefix avoids
        // the cast of numeric strings to int by PHP array keys
        if (is_string($value)) {
            return 's'.$value;
        }
        if (is_int($value)) {
            return 'i'.$value;
        }

        return 'o'.json_encode($value);
    }

    /**
     * Get the position of the given value, adding it if not yet known.
     *
     * @param mixed $value the group value: a scalar, or an array for groups
     *                     made of several values
     *
     * @return int the position of the value, starting at 0
     */
    public function positionOf(mixed $value): int
    {
        $key = self::keyOf($value);

        // Add the value if it is not yet known
        $position = $this->positions[$key] ?? null;
        if ($position === null) {
            $position = count($this->values);
            $this->positions[$key] = $position;
            $this->values[] = $value;
        }

        return $position;
    }

    /**
     * Get the distinct values.
     *
     * @return list<mixed> the distinct values, in order of first appearance
     */
    public function values(): array
    {
        return $this->values;
    }

    /**
     * Get the number of distinct values.
     *
     * @return int the number of distinct values
     */
    public function count(): int
    {
        return count($this->values);
    }
}
