<?php

use LizmapDataviz\Aggregation\AggregateFunction;
use LizmapDataviz\Aggregation\GroupIndex;
use LizmapDataviz\Aggregation\TraceAggregator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Tests of the aggregation of the plot values by group (distinct X values):
 * the aggregate functions, the group index and the normalization of the
 * aggregation given in the plot configuration.
 *
 * @internal
 *
 * @coversNothing
 */
class TraceAggregatorTest extends TestCase
{
    /**
     * Features as [x, y, color].
     *
     * Group A has 3 numeric values (1, 3, 8), group B has a numeric string
     * and a text, group C has only a null value. Only the first feature of
     * group A has a color.
     */
    private const FEATURES = array(
        array('A', 1, 'red'),
        array('B', '2', ''),
        array('A', 3, 'blue'),
        array('A', 8, null),
        array('B', 'not a number', null),
        array('C', null, null),
    );

    /**
     * Get the expected results of each aggregate function for FEATURES.
     *
     * Only count, first and last use the non numeric values. Without
     * numeric value, the sum is 0 and the other functions give null.
     *
     * @return array<string, array{0: string, 1: array}> the function
     *                                                   and the expected value for groups A, B and C
     */
    public static function aggregationProvider(): array
    {
        return array(
            'sum' => array(AggregateFunction::SUM, array(12, 2, 0)),
            'count' => array(AggregateFunction::COUNT, array(3, 2, 1)),
            'avg' => array(AggregateFunction::AVG, array(4, 2, null)),
            'min' => array(AggregateFunction::MIN, array(1, 2, null)),
            'max' => array(AggregateFunction::MAX, array(8, 2, null)),
            'first' => array(AggregateFunction::FIRST, array(1, '2', null)),
            'last' => array(AggregateFunction::LAST, array(8, 'not a number', null)),
            'median' => array(AggregateFunction::MEDIAN, array(3, 2, null)),
        );
    }

    /**
     * Test each aggregate function on the same features.
     *
     * @param string $function the aggregate function
     * @param array  $expected the expected value for groups A, B and C
     */
    #[DataProvider('aggregationProvider')]
    public function testAggregation(string $function, array $expected): void
    {
        // Aggregate the features, grouped by X
        $groups = new GroupIndex();
        $aggregator = new TraceAggregator($function);
        foreach (self::FEATURES as list($x, $y, $color)) {
            $aggregator->add($groups->positionOf($x), $y, $color);
        }

        // The groups are in order of first appearance
        $this->assertSame(array('A', 'B', 'C'), $groups->values());

        // One value per group
        $this->assertSame($expected, $aggregator->results($groups->count()));

        // The first non empty color of each group is kept
        $this->assertSame(array('red', null, null), $aggregator->colors($groups->count()));
    }

    /**
     * Test the standard deviation, computed in one pass (Welford algorithm).
     */
    public function testStddev(): void
    {
        // Values of group 0: mean 5, population standard deviation 2
        $aggregator = new TraceAggregator(AggregateFunction::STDDEV);
        foreach (array(2, 4, 4, 4, 5, 5, 7, 9) as $value) {
            $aggregator->add(0, $value);
        }

        // Group 1 has no numeric value
        $aggregator->add(1, 'text');

        $this->assertSame(array(2.0, null), $aggregator->results(2));
    }

    /**
     * Test the median of an even number of values: the mean of the two
     * middle values, after sorting the values.
     */
    public function testMedianEvenCount(): void
    {
        // Sorted values: 1, 3, 4, 10, so the median is (3 + 4) / 2
        $aggregator = new TraceAggregator(AggregateFunction::MEDIAN);
        foreach (array(10, 1, 4, 3) as $value) {
            $aggregator->add(0, $value);
        }

        $this->assertSame(array(3.5), $aggregator->results(1));
    }

    /**
     * Test that no color is returned when no feature has a color,
     * so the trace color is kept.
     */
    public function testNoColors(): void
    {
        // An empty color is not a color
        $aggregator = new TraceAggregator(AggregateFunction::SUM);
        $aggregator->add(0, 1, '');
        $aggregator->add(1, 1);

        $this->assertNull($aggregator->colors(2));
    }

    /**
     * Test that reset() forgets the state of the groups, so a new group
     * can be aggregated at the same position.
     */
    public function testReset(): void
    {
        // First group: values and color
        $aggregator = new TraceAggregator(AggregateFunction::AVG);
        $aggregator->add(0, 2, 'red');
        $aggregator->add(0, 4);
        $this->assertSame(array(3), $aggregator->results(1));
        $this->assertSame(array('red'), $aggregator->colors(1));
        // The same, for a single group
        $this->assertSame(3, $aggregator->result(0));
        $this->assertSame('red', $aggregator->color(0));

        // Next group at the same position, without the previous state
        $aggregator->reset();
        $aggregator->add(0, 10);
        $this->assertSame(array(10), $aggregator->results(1));
        $this->assertNull($aggregator->colors(1));
    }

    /**
     * Test that an unsupported aggregate function is rejected.
     */
    public function testUnknownFunction(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new TraceAggregator('mode');
    }

    /**
     * Test that the group index keeps the type of the values.
     *
     * Used directly as PHP array keys, the floats would be cast to int
     * (1.5 and 1.7 in the same group) and the numeric strings too
     * ('1' and 1 in the same group).
     */
    public function testGroupIndexKeepsValueTypes(): void
    {
        // Each value gets a new position
        $groups = new GroupIndex();
        $this->assertSame(0, $groups->positionOf(1.5));
        $this->assertSame(1, $groups->positionOf(1.7));
        $this->assertSame(2, $groups->positionOf('1'));
        $this->assertSame(3, $groups->positionOf(1));
        $this->assertSame(4, $groups->positionOf(true));
        $this->assertSame(5, $groups->positionOf(array('P1', 'A')));

        // Known values keep their position, arrays included (sunburst groups)
        $this->assertSame(0, $groups->positionOf(1.5));
        $this->assertSame(2, $groups->positionOf('1'));
        $this->assertSame(5, $groups->positionOf(array('P1', 'A')));

        // The values are returned unchanged
        $this->assertSame(array(1.5, 1.7, '1', 1, true, array('P1', 'A')), $groups->values());
    }

    /**
     * Test the keys of the group values, used to compare the groups of
     * consecutive features: same key only for the same type and value.
     */
    public function testGroupKey(): void
    {
        $this->assertSame(GroupIndex::keyOf('A'), GroupIndex::keyOf('A'));
        $this->assertSame(GroupIndex::keyOf(array('P1', 'A')), GroupIndex::keyOf(array('P1', 'A')));
        $this->assertNotSame(GroupIndex::keyOf('1'), GroupIndex::keyOf(1));
        $this->assertNotSame(GroupIndex::keyOf(1), GroupIndex::keyOf(1.0));
        $this->assertNotSame(GroupIndex::keyOf(1.5), GroupIndex::keyOf(1.7));
    }

    /**
     * Get aggregations from the plot configuration and their normalized value.
     *
     * @return array<array{0: mixed, 1: null|string}> the configured aggregation
     *                                                and the expected function, null for no aggregation
     */
    public static function normalizeProvider(): array
    {
        return array(
            // Supported functions, case insensitive, with "mean" as alias
            array('sum', 'sum'),
            array(' Count ', 'count'),
            array('mean', 'avg'),
            // No aggregation
            array('', null),
            array('no', null),
            array('none', null),
            array(null, null),
            // Unsupported Plotly function
            array('mode', null),
        );
    }

    /**
     * Test the normalization of the aggregation from the plot configuration.
     *
     * @param mixed       $value    the configured aggregation
     * @param null|string $expected the expected function, null for no aggregation
     */
    #[DataProvider('normalizeProvider')]
    public function testNormalize(mixed $value, ?string $expected): void
    {
        $this->assertSame($expected, AggregateFunction::normalize($value));
    }
}
