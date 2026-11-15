<?php

/**
 * Pie plot: values are always aggregated by distinct X values.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

class PiePlot extends AbstractPlot
{
    public const TYPE = 'pie';

    protected const AGGREGATION_MODE = self::AGGREGATION_ALWAYS;

    protected const FEATURE_COLORS = self::FEATURE_COLORS_MARKER_COLORS;

    protected const X_PROPERTY = 'labels';

    protected const Y_PROPERTY = 'values';

    /**
     * Get the trace template of the plot type.
     *
     * @return array the Plotly trace properties, with empty data
     */
    protected function getTraceTemplate(): array
    {
        $template = array(
            'type' => 'pie',
            'name' => '',
            'values' => array(),
            'labels' => array(),
            'hoverinfo' => 'label+value+percent',
            'hovertemplate' => '%{label}<br>%{value:.1f}<br>%{percent:,.0%}',
            'textinfo' => 'value',
            'texttemplate' => '%{value:.1f}',
            'insidetextorientation' => 'horizontal',
            'opacity' => null,
            'hole' => '0.4',
            'automargin' => true,
            'sort' => false, // slices in the order of the groups, sorted by X
        );
        // White text outside the slices for the dark theme
        if ($this->theme == 'dark') {
            $template['outsidetextfont'] = array('color' => 'white');
        }

        return $template;
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
        // Legend below the plot, smaller bottom margin without legend
        $layout['legend']['y'] = '-5';
        if (!$this->displayLegend) {
            $layout['margin']['b'] = 10;
        }

        return $layout;
    }
}
