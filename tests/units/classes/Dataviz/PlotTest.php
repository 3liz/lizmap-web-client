<?php

use Lizmap\Project\Project;
use LizmapDataviz\Json\JsonColumn;
use LizmapDataviz\Plot\AbstractPlot;
use LizmapDataviz\Plot\BoxPlot;
use LizmapDataviz\Plot\PiePlot;
use LizmapDataviz\Plot\PlotFactory;
use LizmapDataviz\Plot\SunburstPlot;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Tests of the dataviz plots: creation from the configuration, traces built
 * from GeoJSON features (raw or aggregated values), layout and JSON output.
 *
 * The features are given directly to buildTraces(), without WFS request.
 *
 * @internal
 *
 * @coversNothing
 */
class PlotTest extends TestCase
{
    /**
     * Get a mock of the Lizmap project.
     *
     * The layer is not found, so the field names are used instead of aliases.
     *
     * @param string $theme the dataviz theme option of the project
     *
     * @return Project the project mock
     */
    private function getProject(string $theme = 'light'): Project
    {
        $project = $this->createMock(Project::class);
        $project->method('getOption')->willReturnMap(array(array('theme', $theme)));
        $project->method('getLayer')->willReturn(null);

        return $project;
    }

    /**
     * Get a plot configuration with one trace.
     *
     * The trace uses all the fields of the test features: X "category",
     * Y "value", color "color" and Z "parent" (used by sunburst only).
     *
     * @param string $type        the plot type
     * @param string $aggregation the aggregation
     * @param array  $plot        plot properties overriding the default ones
     *
     * @return array the plot configuration
     */
    private static function getPlotConfig(string $type, string $aggregation, array $plot = array()): array
    {
        return array(
            'layer_id' => 'layer',
            'title' => 'Title',
            'plot' => array_merge(array(
                'type' => $type,
                'x_field' => 'category',
                'aggregation' => $aggregation,
                'traces' => array(
                    (object) array(
                        'y_field' => 'value',
                        'color' => 'green',
                        'colorfield' => 'color',
                        'z_field' => 'parent',
                    ),
                ),
                'display_legend' => true,
                'stacked' => false,
                'horizontal' => false,
            ), $plot),
        );
    }

    /**
     * Get the test features, as decoded from GeoJSON.
     *
     * Category A has two features (values 1 and 3) with different parents,
     * B has a numeric string value and an empty color, "1.5" is a numeric
     * string category, and the last feature has no category.
     *
     * @return array the features
     */
    private static function getFeatures(): array
    {
        $features = array();
        foreach (array(
            // category, value, color, parent
            array('A', 1, 'red', 'P1'),
            array('B', '2', '', 'P1'),
            array('A', 3, 'blue', 'P2'),
            array('1.5', 4, null, null),
            array(null, 9, null, null),
        ) as list($category, $value, $color, $parent)) {
            $features[] = (object) array(
                'type' => 'Feature',
                'properties' => (object) array(
                    'category' => $category,
                    'value' => $value,
                    'color' => $color,
                    'parent' => $parent,
                ),
            );
        }

        return $features;
    }

    /**
     * Get the test features sorted by category, as requested by fetchData()
     * for the plot types sorted by X: "1.5", "A", "A", "B", then no category.
     *
     * @return array the features
     */
    private static function getSortedFeatures(): array
    {
        $features = self::getFeatures();
        $order = array('1.5' => 0, 'A' => 1, 'B' => 2);
        usort($features, fn ($a, $b): int => ($order[$a->properties->category] ?? 3) <=> ($order[$b->properties->category] ?? 3));

        return $features;
    }

    /**
     * Create a plot and build its traces, checking that it succeeds.
     *
     * @param array         $plotConfig the plot configuration
     * @param null|iterable $features   the features, the test features by default
     *
     * @return AbstractPlot the plot with its traces
     */
    private function buildPlot(array $plotConfig, ?iterable $features = null): AbstractPlot
    {
        $plot = PlotFactory::create($this->getProject(), $plotConfig);
        $this->assertNotNull($plot);
        $this->assertTrue($plot->buildTraces($features ?? self::getFeatures()));

        return $plot;
    }

    /**
     * Test that the factory creates the plot class of the configured type,
     * and nothing for an unknown type.
     */
    public function testFactory(): void
    {
        $plot = PlotFactory::create($this->getProject(), self::getPlotConfig('pie', 'sum'));
        $this->assertInstanceOf(PiePlot::class, $plot);
        $this->assertEquals('Title', $plot->getTitle());

        $this->assertNull(PlotFactory::create($this->getProject(), self::getPlotConfig('unknown', 'sum')));
    }

    /**
     * Test that pie values are always aggregated, with a sum when
     * no aggregation is configured.
     */
    public function testPieAlwaysAggregated(): void
    {
        foreach (array('sum', 'no', '') as $aggregation) {
            // Pie plots are sorted by X
            $plot = $this->buildPlot(self::getPlotConfig('pie', $aggregation), self::getSortedFeatures());
            $this->assertTrue($plot->isAggregated());
            $trace = $plot->getData()[0];

            // One slice per category, the feature without category is ignored
            $this->assertSame(array('1.5', 'A', 'B'), $trace['labels']);
            $this->assertSame(array(4, 4, 2), $trace['values']);

            // Pie colors are in marker.colors: the first color of each category
            $this->assertSame(array(null, 'red', null), $trace['marker']['colors']);
            $this->assertArrayNotHasKey('color', $trace['marker']);
        }
    }

    /**
     * Test the median aggregation in a plot.
     */
    public function testPieMedian(): void
    {
        // Median of A (1, 3) is 2, B and 1.5 have a single value
        $plot = $this->buildPlot(self::getPlotConfig('pie', 'median'), self::getSortedFeatures());
        $this->assertSame(array(4, 2, 2), $plot->getData()[0]['values']);
    }

    /**
     * Get the aggregate functions to compare the aggregation of sorted features
     * group by group with the aggregation of all the groups at once.
     *
     * @return array<array{0: string}> the aggregate functions
     */
    public static function aggregationProvider(): array
    {
        return array_map(
            fn ($function): array => array($function),
            array('sum', 'count', 'avg', 'min', 'max', 'stddev', 'median', 'first', 'last'),
        );
    }

    /**
     * Test that the features sorted by X are aggregated group by group,
     * with the same result as the aggregation of all the groups at once.
     *
     * The scatter plot is sorted by X and the bar plot is not: they use
     * the two aggregations, with the same trace properties.
     *
     * @param string $function the aggregate function
     */
    #[DataProvider('aggregationProvider')]
    public function testSortedAggregation(string $function): void
    {
        $scatter = $this->buildPlot(self::getPlotConfig('scatter', $function), self::getSortedFeatures());
        $bar = $this->buildPlot(self::getPlotConfig('bar', $function), self::getSortedFeatures());

        // The values of the scatter plot are written in columns
        $this->assertInstanceOf(JsonColumn::class, $scatter->getTraces()[0]['x']);
        $this->assertInstanceOf(JsonColumn::class, $scatter->getTraces()[0]['y']);

        // Same groups, values and colors
        $scatterTrace = $scatter->getData()[0];
        $barTrace = $bar->getData()[0];
        $this->assertSame(array('1.5', 'A', 'B'), $scatterTrace['x']);
        $this->assertSame($barTrace['x'], $scatterTrace['x']);
        $this->assertSame($barTrace['y'], $scatterTrace['y']);

        // The trace color is used for the groups without color
        $this->assertSame(array('green', 'red', 'green'), $scatterTrace['marker']['color']);
        $this->assertSame($barTrace['marker']['color'], $scatterTrace['marker']['color']);
    }

    /**
     * Test that features which should be sorted by X but are not, for example
     * if the server can not sort by the X field, are aggregated by value:
     * each X value appears once, the groups are sorted, and the values are
     * the same as with sorted features.
     */
    public function testUnsortedFeaturesAggregatedByValue(): void
    {
        // The test features are not sorted: A, B, A, "1.5"
        $unsorted = $this->buildPlot(self::getPlotConfig('scatter', 'sum'), self::getFeatures());
        $sorted = $this->buildPlot(self::getPlotConfig('scatter', 'sum'), self::getSortedFeatures());

        // Each group once, sorted, with the same values and colors
        $unsortedTrace = $unsorted->getData()[0];
        $sortedTrace = $sorted->getData()[0];
        $this->assertSame(array('1.5', 'A', 'B'), $unsortedTrace['x']);
        $this->assertSame($sortedTrace['y'], $unsortedTrace['y']);
        $this->assertSame($sortedTrace['marker']['color'], $unsortedTrace['marker']['color']);
    }

    /**
     * Test that unsorted features given by a generator, which can not be
     * read again, make buildTraces() fail instead of repeating groups.
     */
    public function testUnsortedFeaturesGenerator(): void
    {
        $plot = PlotFactory::create($this->getProject(), self::getPlotConfig('pie', 'sum'));
        $features = (function () {
            yield from self::getFeatures();
        })();
        $this->assertFalse($plot->buildTraces($features));

        // The features given again are aggregated by value, then sorted
        $this->assertTrue($plot->buildTraces(self::getFeatures()));
        $this->assertSame(array('1.5', 'A', 'B'), $plot->getData()[0]['labels']);
    }

    /**
     * Test the aggregation group by group with many groups, written in
     * temporary files, and consecutive features in the same group.
     */
    public function testSortedAggregationManyGroups(): void
    {
        // 100000 groups with two features each, the second one without color.
        // The JSON of the groups (about 900 KB) is written in a temporary file.
        $features = (function () {
            for ($i = 0; $i < 200000; ++$i) {
                yield (object) array(
                    'type' => 'Feature',
                    'properties' => (object) array(
                        'category' => sprintf('%06d', intdiv($i, 2)),
                        'value' => $i,
                        'color' => $i % 2 ? null : 'red',
                        'parent' => null,
                    ),
                );
            }
        })();
        $plot = $this->buildPlot(self::getPlotConfig('scatter', 'sum'), $features);
        $trace = $plot->getData()[0];

        // The sum of each group: 2i + (2i + 1)
        $this->assertCount(100000, $trace['x']);
        $this->assertSame('099999', $trace['x'][99999]);
        $this->assertSame(1, $trace['y'][0]);
        $this->assertSame(399997, $trace['y'][99999]);
        $this->assertSame(array('red'), array_values(array_unique($trace['marker']['color'])));
    }

    /**
     * Test a bar plot without aggregation: one value per feature,
     * and no Plotly aggregate transform anymore.
     */
    public function testBarRaw(): void
    {
        $plot = $this->buildPlot(self::getPlotConfig('bar', 'no'));
        $this->assertFalse($plot->isAggregated());
        $trace = $plot->getData()[0];

        // The values of all the features, in the same order
        $this->assertSame(array('A', 'B', 'A', '1.5', null), $trace['x']);
        $this->assertSame(array(1, '2', 3, 4, 9), $trace['y']);

        // The trace color is used for features without color
        $this->assertSame(array('red', 'green', 'blue', 'green', 'green'), $trace['marker']['color']);
        $this->assertArrayNotHasKey('transforms', $trace);
    }

    /**
     * Test a horizontal bar plot: the categories are on the Y axis, sorted,
     * and the aggregated values on the X axis.
     */
    public function testHorizontalBarAggregated(): void
    {
        $plot = $this->buildPlot(self::getPlotConfig('bar', 'count', array('horizontal' => true)));
        $trace = $plot->getData()[0];
        $this->assertEquals('h', $trace['orientation']);
        $this->assertSame(array('1.5', 'A', 'B'), $trace['y']);
        $this->assertSame(array(1, 2, 1), $trace['x']);
    }

    /**
     * Test that box plots are never aggregated, as they display
     * the distribution of the values.
     */
    public function testBoxNeverAggregated(): void
    {
        $plot = $this->buildPlot(self::getPlotConfig('box', 'count'));
        $this->assertInstanceOf(BoxPlot::class, $plot);
        $this->assertFalse($plot->isAggregated());
        $trace = $plot->getData()[0];
        $this->assertCount(5, $trace['y']);

        // The trace color is the box fill color
        $this->assertEquals('green', $trace['fillcolor']);
    }

    /**
     * Test the sunburst hierarchy: the root, the parents and the groups
     * aggregated by (parent, label).
     */
    public function testSunburst(): void
    {
        $plot = $this->buildPlot(self::getPlotConfig('sunburst', 'sum'));
        $trace = $plot->getData()[0];
        $root = SunburstPlot::ROOT;

        // The nodes are written as columns, the groups being read one by one
        $this->assertInstanceOf(JsonColumn::class, $plot->getTraces()[0]['ids']);

        // Nodes: the groups, then the parents P1 and P2, then the root. The label A
        // is used twice, under P1 and P2. "1.5" has no parent: it is under the root.
        $this->assertSame(array('A', 'B', 'A', '1.5', 'P1', 'P2', $root), $trace['labels']);

        // A parent value is the sum of its children values,
        // the root value is the sum of all values
        $this->assertSame(array(1, 2, 3, 4, 3, 3, 10), $trace['values']);

        // The parents are given by node ids, as the labels are not unique
        $this->assertSame(
            array($root.'/p0', $root.'/p0', $root.'/p1', $root, $root, $root, ''),
            $trace['parents']
        );
        $this->assertCount(7, array_unique($trace['ids']));

        // A parent has the color of its first child, white root
        $this->assertSame(array('red', null, 'blue', null, 'red', 'blue', 'white'), $trace['marker']['colors']);
    }

    /**
     * Test the sunburst nodes when the first feature has no parent and the
     * features are not sorted by parent. Each group appears once, so the
     * features are aggregated in their order: the group without parent is
     * the first group, at position 0 as the first parent. The ids of the
     * parents and of the groups are still unique, and the hierarchy is right.
     */
    public function testSunburstGroupWithoutParentFirst(): void
    {
        // The feature without parent first, then the features with parents
        $features = self::getFeatures();
        array_unshift($features, array_splice($features, 3, 1)[0]);
        $plot = $this->buildPlot(self::getPlotConfig('sunburst', 'sum'), $features);
        $trace = $plot->getData()[0];
        $root = SunburstPlot::ROOT;

        // All the node ids are unique, "c" for the groups and "p" for the parents
        $this->assertSame(array($root.'/c0', $root.'/p0/c1', $root.'/p0/c2', $root.'/p1/c3', $root.'/p0', $root.'/p1', $root), $trace['ids']);

        // The group without parent is under the root, the others under their parent
        $this->assertSame(array('1.5', 'A', 'B', 'A', 'P1', 'P2', $root), $trace['labels']);
        $this->assertSame(array($root, $root.'/p0', $root.'/p0', $root.'/p1', $root, $root, ''), $trace['parents']);
        $this->assertSame(array(4, 1, 2, 3, 3, 3, 10), $trace['values']);
    }

    /**
     * Test the order of the groups sorted in PHP: as the database, with the
     * null values last, and value by value for the lists (parent, label).
     */
    public function testCompareGroups(): void
    {
        $groups = array(array('P2', 'A'), array(null, 'B'), array('P1', 'B'), array('P1', 'A'), array(null, 'A'));
        usort($groups, fn ($a, $b): int => PlotForTests::compareGroupsForTests($a, $b));
        $this->assertSame(
            array(array('P1', 'A'), array('P1', 'B'), array('P2', 'A'), array(null, 'A'), array(null, 'B')),
            $groups
        );

        // Numbers in their order
        $values = array(10, 9, 1.5, 100);
        usort($values, fn ($a, $b): int => PlotForTests::compareGroupsForTests($a, $b));
        $this->assertSame(array(1.5, 9, 10, 100), $values);
    }

    /**
     * Test that there is no trace when there is no feature.
     */
    public function testNoFeature(): void
    {
        $plot = $this->buildPlot(self::getPlotConfig('pie', 'sum'), array());
        $this->assertSame(array(), $plot->getData());
    }

    /**
     * Test that features without the configured fields are rejected.
     */
    public function testInvalidFeature(): void
    {
        $plot = PlotFactory::create($this->getProject(), self::getPlotConfig('pie', 'sum'));
        $feature = (object) array('properties' => (object) array('other' => 1));
        $this->assertFalse($plot->buildTraces(array($feature)));
    }

    /**
     * Test that a configuration without a mandatory field is rejected.
     */
    public function testMissingMandatoryField(): void
    {
        // Bar plots need an X field
        $plot = PlotFactory::create($this->getProject(), self::getPlotConfig('bar', 'sum', array('x_field' => '')));
        $this->assertFalse($plot->buildTraces(self::getFeatures()));
    }

    /**
     * Test the layout customized by the plot types.
     */
    public function testLayout(): void
    {
        // Pie without legend: small bottom margin and no axis title
        $plot = PlotFactory::create($this->getProject(), self::getPlotConfig('pie', 'sum', array('display_legend' => false)));
        $layout = $plot->getLayout();
        $this->assertFalse($layout['showlegend']);
        $this->assertEquals(10, $layout['margin']['b']);
        $this->assertArrayNotHasKey('title', $layout['xaxis']);

        // Scatter: the X axis title is the X field alias (here its name)
        $plot = PlotFactory::create($this->getProject(), self::getPlotConfig('scatter', 'sum'));
        $this->assertEquals('category', $plot->getLayout()['xaxis']['title']);
    }

    /**
     * Test that the dark theme of the project changes the text color.
     */
    public function testDarkTheme(): void
    {
        $plot = PlotFactory::create($this->getProject('dark'), self::getPlotConfig('pie', 'sum'));
        $plot->buildTraces(self::getFeatures());
        $this->assertEquals(array('color' => 'white'), $plot->getData()[0]['outsidetextfont']);
    }

    /**
     * Test that the streamed JSON contains the same plot as getData(),
     * for raw values (stored in columns) and aggregated values.
     */
    public function testWriteJson(): void
    {
        foreach (array(array('bar', 'no'), array('pie', 'sum'), array('sunburst', 'count')) as list($type, $aggregation)) {
            // Write the plot JSON with an additional property
            $plot = $this->buildPlot(self::getPlotConfig($type, $aggregation));
            $output = fopen('php://memory', 'r+');
            $plot->writeJson($output, array('plotly' => array('script' => 'plotly.js')));
            rewind($output);
            $json = json_decode(stream_get_contents($output), true);

            // Same title, traces and layout, plus the additional property
            $this->assertEquals('Title', $json['title']);
            $this->assertSame($plot->getData(), $json['data']);
            $this->assertEquals($plot->getLayout(), $json['layout']);
            $this->assertEquals(array('script' => 'plotly.js'), $json['plotly']);
        }
    }
}
