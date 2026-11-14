<?php

/**
 * Read several columns of values row by row.
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
 * Read several columns of the same length together, row by row.
 *
 * Each row is built from the values of the columns at the same position, by
 * a callback. The columns are read value by value, so the memory does not
 * depend on the number of rows. The rows can be read several times.
 *
 * Usage, to read the groups (parent, label) aggregated by the database:
 *     $groups = new JsonRows(array($parents, $labels), fn (array $values): array => $values);
 *     foreach ($groups as list($parent, $label)) { ... }
 *
 * @implements \IteratorAggregate<int, mixed>
 */
class JsonRows implements \Countable, \IteratorAggregate
{
    /** @var list<array|JsonColumn|JsonRows> The columns */
    private array $columns;

    /** @var \Closure The callback building a row from the values of the columns */
    private \Closure $buildRow;

    /**
     * Create the rows from the columns.
     *
     * @param list<array|JsonColumn|JsonRows> $columns  the columns, with the same number of values
     * @param callable                        $buildRow the callback building a row from the list of the values of a row
     */
    public function __construct(array $columns, callable $buildRow)
    {
        $this->columns = $columns;
        $this->buildRow = \Closure::fromCallable($buildRow);
    }

    /**
     * Get the number of rows: the number of values of the first column.
     *
     * @return int the number of rows
     */
    public function count(): int
    {
        return count($this->columns[0] ?? array());
    }

    /**
     * Get the rows one by one.
     *
     * @return \Generator<int, mixed> the rows built by the callback
     */
    public function getIterator(): \Generator
    {
        // Read all the columns together
        $iterators = new \MultipleIterator(\MultipleIterator::MIT_NEED_ALL | \MultipleIterator::MIT_KEYS_NUMERIC);
        foreach ($this->columns as $column) {
            $iterators->attachIterator(is_array($column) ? new \ArrayIterator($column) : $column->getIterator());
        }

        foreach ($iterators as $values) {
            yield ($this->buildRow)($values);
        }
    }
}
