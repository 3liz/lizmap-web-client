<?php

/**
 * Histogram.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

class HistogramPlot extends AbstractPlot
{
    public const TYPE = 'histogram';

    protected const AGGREGATION_MODE = self::AGGREGATION_NEVER;

    protected const Y_MANDATORY = false;

    /**
     * Get the trace template of the plot type.
     *
     * @return array the Plotly trace properties, with empty data
     */
    protected function getTraceTemplate(): array
    {
        return array(
            'type' => 'histogram',
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
            'hoverinfo' => 'label+value+percent',
            'textinfo' => 'label',
            'orientation' => 'v',
            'nbinsx' => array(),
            'nbinsy' => array(),
            'histnorm' => null,
            'opacity' => null,
            'cumulative' => array(
                'enabled' => false,
                'direction' => false,
            ),
        );
    }
}
