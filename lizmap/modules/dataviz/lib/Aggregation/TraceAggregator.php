<?php

/**
 * Aggregate the values of one trace by group.
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
 * Online (one pass) aggregation of the values of a trace per group.
 *
 * Only the state required by the configured function is kept, so the memory
 * used is proportional to the number of groups, except for the median which
 * needs to keep every numeric value. When the features are sorted by group,
 * reset() allows to keep only the state of the current group.
 *
 * Except for count, first and last, non numeric values are ignored.
 */
final class TraceAggregator
{
    private string $function;

    /**
     * Main state per group: sum, count, min, max, first or last value.
     *
     * @var array<int, mixed>
     */
    private array $values = array();

    /**
     * Number of numeric values per group (avg, stddev).
     *
     * @var array<int, int>
     */
    private array $counts = array();

    /**
     * Running mean per group (stddev, Welford algorithm).
     *
     * @var array<int, float>
     */
    private array $means = array();

    /**
     * Sum of squares of differences from the mean per group (stddev).
     *
     * @var array<int, float>
     */
    private array $m2 = array();

    /**
     * Numeric values per group (median only).
     *
     * @var array<int, list<float|int>>
     */
    private array $samples = array();

    /**
     * First non empty color per group.
     *
     * @var array<int, mixed>
     */
    private array $colors = array();

    /**
     * Create an aggregator for the given function.
     *
     * @param string $function one of the AggregateFunction constants
     *
     * @throws \InvalidArgumentException if the function is not supported
     */
    public function __construct(string $function)
    {
        // Only the supported functions are allowed
        if (!in_array($function, AggregateFunction::ALL, true)) {
            throw new \InvalidArgumentException('Unknown aggregate function "'.$function.'"');
        }
        $this->function = $function;
    }

    /**
     * Get the aggregate function.
     *
     * @return string one of the AggregateFunction constants
     */
    public function getFunction(): string
    {
        return $this->function;
    }

    /**
     * Add a feature value to a group.
     *
     * Only the state needed by the aggregate function is updated.
     *
     * @param int   $group the group position given by the GroupIndex
     * @param mixed $value the feature value (Y)
     * @param mixed $color the feature color, if any
     */
    public function add(int $group, mixed $value, mixed $color = null): void
    {
        // Keep the first non empty color of the group
        if ($color !== null && $color !== '' && !isset($this->colors[$group])) {
            $this->colors[$group] = $color;
        }

        // Functions using any value, numeric or not
        switch ($this->function) {
            case AggregateFunction::COUNT:
                $this->values[$group] = ($this->values[$group] ?? 0) + 1;

                return;

            case AggregateFunction::FIRST:
                if (!array_key_exists($group, $this->values)) {
                    $this->values[$group] = $value;
                }

                return;

            case AggregateFunction::LAST:
                $this->values[$group] = $value;

                return;
        }

        // The other functions ignore the non numeric values
        $number = self::toNumber($value);
        if ($number === null) {
            return;
        }

        // Functions using the numeric values
        switch ($this->function) {
            case AggregateFunction::SUM:
                $this->values[$group] = ($this->values[$group] ?? 0) + $number;

                break;

            case AggregateFunction::MIN:
                if (!isset($this->values[$group]) || $number < $this->values[$group]) {
                    $this->values[$group] = $number;
                }

                break;

            case AggregateFunction::MAX:
                if (!isset($this->values[$group]) || $number > $this->values[$group]) {
                    $this->values[$group] = $number;
                }

                break;

            case AggregateFunction::AVG:
                $this->values[$group] = ($this->values[$group] ?? 0) + $number;
                $this->counts[$group] = ($this->counts[$group] ?? 0) + 1;

                break;

            case AggregateFunction::STDDEV:
                // Welford online algorithm: update the count, the mean and
                // the sum of squares of differences from the mean, without
                // keeping the values
                $count = ($this->counts[$group] ?? 0) + 1;
                $mean = $this->means[$group] ?? 0.0;
                $delta = $number - $mean;
                $mean += $delta / $count;
                $this->counts[$group] = $count;
                $this->means[$group] = $mean;
                $this->m2[$group] = ($this->m2[$group] ?? 0.0) + $delta * ($number - $mean);

                break;

            case AggregateFunction::MEDIAN:
                // The median needs all the values
                $this->samples[$group][] = $number;

                break;
        }
    }

    /**
     * Forget the state of all the groups.
     *
     * Used when the features are sorted by group: once the value of a group
     * is read, its state is no longer needed and the next group starts again
     * at position 0, so the memory does not depend on the number of groups.
     */
    public function reset(): void
    {
        $this->values = array();
        $this->counts = array();
        $this->means = array();
        $this->m2 = array();
        $this->samples = array();
        $this->colors = array();
    }

    /**
     * Get the aggregated value of each group.
     *
     * @param int $groupCount the total number of groups
     *
     * @return list<mixed> the values, aligned on the group positions
     */
    public function results(int $groupCount): array
    {
        // A group may have no state, for example a group with only
        // non numeric values: result() gives its default value
        $results = array();
        for ($group = 0; $group < $groupCount; ++$group) {
            $results[] = $this->result($group);
        }

        return $results;
    }

    /**
     * Get the color of each group.
     *
     * @param int $groupCount the total number of groups
     *
     * @return null|list<mixed> the colors aligned on the group positions
     *                          (null for a group without color), or null
     *                          if no group has a color
     */
    public function colors(int $groupCount): ?array
    {
        // No color at all
        if (count($this->colors) === 0) {
            return null;
        }

        // One color per group, null if the group has no color
        $colors = array();
        for ($group = 0; $group < $groupCount; ++$group) {
            $colors[] = $this->colors[$group] ?? null;
        }

        return $colors;
    }

    /**
     * Get the first non empty color of a group.
     *
     * @param int $group the group position
     *
     * @return mixed the color, null if the group has no color
     */
    public function color(int $group): mixed
    {
        return $this->colors[$group] ?? null;
    }

    /**
     * Get the aggregated value of a group.
     *
     * @param int $group the group position
     *
     * @return mixed the aggregated value: 0 for an empty count or sum,
     *               null for the other functions if the group has no value
     */
    public function result(int $group): mixed
    {
        switch ($this->function) {
            case AggregateFunction::COUNT:
            case AggregateFunction::SUM:
                return $this->values[$group] ?? 0;

            case AggregateFunction::AVG:
                // Mean of the numeric values
                if (empty($this->counts[$group])) {
                    return null;
                }

                return $this->values[$group] / $this->counts[$group];

            case AggregateFunction::STDDEV:
                // Population standard deviation
                if (empty($this->counts[$group])) {
                    return null;
                }

                return sqrt($this->m2[$group] / $this->counts[$group]);

            case AggregateFunction::MEDIAN:
                return self::median($this->samples[$group] ?? array());

            default:
                // min, max, first, last
                return $this->values[$group] ?? null;
        }
    }

    /**
     * Compute the median of the values.
     *
     * @param list<float|int> $values the numeric values
     *
     * @return null|float|int the median, null if there is no value
     */
    private static function median(array $values): null|float|int
    {
        $count = count($values);
        if ($count === 0) {
            return null;
        }
        sort($values, SORT_NUMERIC);
        $middle = intdiv($count, 2);

        // Odd count: the middle value
        if ($count % 2 === 1) {
            return $values[$middle];
        }

        // Even count: the mean of the two middle values
        return ($values[$middle - 1] + $values[$middle]) / 2;
    }

    /**
     * Convert a value to a number, if possible.
     *
     * @param mixed $value the value
     *
     * @return null|float|int the number, null if the value is not numeric
     */
    private static function toNumber(mixed $value): null|float|int
    {
        // Booleans are not considered as numbers
        if (is_int($value) || is_float($value)) {
            return $value;
        }

        // Numeric strings, for example from a text field
        if (is_string($value) && is_numeric($value)) {
            return $value + 0;
        }

        return null;
    }
}
