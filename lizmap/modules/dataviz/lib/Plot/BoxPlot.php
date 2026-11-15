<?php

/**
 * Box plot.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

class BoxPlot extends AbstractPlot
{
    public const TYPE = 'box';

    protected const AGGREGATION_MODE = self::AGGREGATION_NEVER;

    protected const X_MANDATORY = false;

    /**
     * Get the trace template of the plot type.
     *
     * @return array the Plotly trace properties, with empty data
     */
    protected function getTraceTemplate(): array
    {
        return array(
            'type' => 'box',
            'name' => '',
            'x' => array(),
            'y' => array(),
            'text' => array(),
            'boxmean' => null,
            'orientation' => 'v',
            'boxpoints' => false,
            'fillcolor' => 'orange',
            'line' => array(
                'color' => null,
                'width' => 1,
            ),
            'opacity' => null,
        );
    }
}
