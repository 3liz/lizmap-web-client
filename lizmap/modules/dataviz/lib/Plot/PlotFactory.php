<?php

/**
 * Create the plots.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

use Lizmap\Project\Project;

/**
 * Create the plot corresponding to the type of the plot configuration.
 */
class PlotFactory
{
    /** @var array<string, class-string<AbstractPlot>> */
    public const TYPES = array(
        ScatterPlot::TYPE => ScatterPlot::class,
        BoxPlot::TYPE => BoxPlot::class,
        BarPlot::TYPE => BarPlot::class,
        HistogramPlot::TYPE => HistogramPlot::class,
        Histogram2dPlot::TYPE => Histogram2dPlot::class,
        PiePlot::TYPE => PiePlot::class,
        PolarPlot::TYPE => PolarPlot::class,
        SunburstPlot::TYPE => SunburstPlot::class,
        HtmlPlot::TYPE => HtmlPlot::class,
    );

    /**
     * Create the plot for the given configuration.
     *
     * @param Project $project    the Lizmap project, the ACL must have been checked
     * @param array   $plotConfig the plot configuration, see Project::parseDatavizPlotConfig()
     *
     * @return null|AbstractPlot null if the plot type is not supported
     */
    public static function create(Project $project, array $plotConfig): ?AbstractPlot
    {
        // Only the supported types are allowed
        $type = $plotConfig['plot']['type'] ?? null;
        if (!is_string($type) || !array_key_exists($type, self::TYPES)) {
            return null;
        }

        // Create the plot of the class corresponding to the type
        $class = self::TYPES[$type];

        return new $class($project, $plotConfig);
    }
}
