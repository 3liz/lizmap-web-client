<?php

/**
 * Scatter plot.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

class ScatterPlot extends AbstractPlot
{
    public const TYPE = 'scatter';

    protected const FEATURE_COLORS = self::FEATURE_COLORS_MARKER_COLOR;

    protected const SORT_BY_X = true;

    /**
     * Get the trace template of the plot type.
     *
     * @return array the Plotly trace properties, with empty data
     */
    protected function getTraceTemplate(): array
    {
        return array(
            'type' => 'scattergl',
            'name' => '',
            'y' => array(),
            'x' => array(),
            'text' => array(),
            'marker' => array(
                'color' => 'orange',
                'colorscale' => null,
                'showscale' => false,
                'reversescale' => false,
                'colorbar' => array(
                    'len' => '0.8',
                ),
                'size' => null,
                'symbol' => null,
                'line' => array(
                    'color' => null,
                    'width' => null,
                ),
            ),
            'mode' => 'lines',
            'textinfo' => 'none',
            'opacity' => null,
        );
    }
}
