<?php

/**
 * Bar plot, vertical or horizontal.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

class BarPlot extends AbstractPlot
{
    public const TYPE = 'bar';

    protected const FEATURE_COLORS = self::FEATURE_COLORS_MARKER_COLOR;

    /**
     * Get the trace template of the plot type.
     *
     * @return array the Plotly trace properties, with empty data
     */
    protected function getTraceTemplate(): array
    {
        return array(
            'type' => 'bar',
            'name' => '',
            'y' => array(),
            'x' => array(),
            'ids' => null,
            'text' => array(),
            'marker' => array(
                'color' => 'orange',
                'colorscale' => null,
                'showscale' => false,
                'reversescale' => false,
                'colorbar' => array(
                    'len' => '0.8',
                ),
                'line' => array(
                    'color' => null,
                    'width' => null,
                ),
            ),
            'textinfo' => 'none',
            'orientation' => $this->horizontal ? 'h' : 'v',
        );
    }

    /**
     * Customize the layout for the plot type.
     *
     * No axis title is displayed.
     *
     * @param array $layout the default layout
     *
     * @return array the layout of the plot type
     */
    protected function customizeLayout(array $layout): array
    {
        // Stack the bars of the traces if configured
        if (count($this->yFields) > 1 && $this->stacked) {
            $layout['barmode'] = 'stack';
        }

        return $layout;
    }
}
