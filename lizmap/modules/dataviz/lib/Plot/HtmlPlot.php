<?php

/**
 * HTML plot, rendered by Lizmap: values are always aggregated by distinct X values.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

class HtmlPlot extends AbstractPlot
{
    public const TYPE = 'html';

    protected const AGGREGATION_MODE = self::AGGREGATION_ALWAYS;

    protected const FEATURE_COLORS = self::FEATURE_COLORS_MARKER_COLORS;

    /**
     * Get the trace template of the plot type.
     *
     * @return array the Plotly trace properties, with empty data
     */
    protected function getTraceTemplate(): array
    {
        return array(
            'type' => 'html',
            'name' => '',
            'x' => array(),
            'y' => array(),
            'marker' => array(
                'color' => 'orange',
                'line' => array(
                    'color' => null,
                    'width' => null,
                ),
            ),
            'opacity' => null,
        );
    }
}
