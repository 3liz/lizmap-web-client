<?php

/**
 * Sunburst plot: values are always aggregated by distinct (Z, X) values.
 *
 * @author    3liz
 * @copyright 2017-2026 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License
 */

namespace LizmapDataviz\Plot;

use LizmapDataviz\Aggregation\GroupIndex;
use LizmapDataviz\Json\JsonColumn;
use LizmapDataviz\Json\JsonRows;

/**
 * The X field gives the labels, the Z field of the first trace gives
 * the parents. A root node contains all the parents.
 */
class SunburstPlot extends AbstractPlot
{
    public const TYPE = 'sunburst';

    /** Label of the root node */
    public const ROOT = 'Total';

    protected const AGGREGATION_MODE = self::AGGREGATION_ALWAYS;

    /** The groups are processed to build the hierarchy: they are given as arrays */
    protected const FEATURE_COLORS = self::FEATURE_COLORS_MARKER_COLORS;

    protected const X_PROPERTY = 'labels';

    protected const Y_PROPERTY = 'values';

    protected const Z_PROPERTY = 'parents';

    /**
     * Get the trace template of the plot type.
     *
     * @return array the Plotly trace properties, with empty data
     */
    protected function getTraceTemplate(): array
    {
        $template = array(
            'type' => 'sunburst',
            'name' => '',
            'values' => array(),
            'labels' => array(),
            'parents' => array(),
            'branchvalues' => 'total',
            'hovertemplate' => '%{label}<br>%{value:.1f}<br>%{percentEntry:,.0%}',
            'texttemplate' => '%{value:.1f}',
            'opacity' => null,
        );
        // White text outside the nodes for the dark theme
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
        // Legend below the plot and small bottom margin
        $layout['legend']['y'] = '-5';
        $layout['margin']['b'] = 10;

        return $layout;
    }

    /**
     * Get the group of a feature: its parent and its label.
     *
     * The same label can be used by several parents, so the values
     * are aggregated by (parent, label).
     *
     * @param object $properties the feature properties
     * @param mixed  $x          the feature X value (label), not null
     *
     * @return array the parent (null if none) and the label
     */
    protected function getGroup(object $properties, mixed $x): mixed
    {
        $parentField = $this->getParentField();
        if ($parentField === null) {
            return array(null, $x);
        }

        return array($properties->{$parentField} ?? null, $x);
    }

    /**
     * Get the fields grouping the features in the database aggregation:
     * the parent field if any, and the label field (X).
     *
     * @return list<string> the group fields
     */
    protected function getGroupFields(): array
    {
        $parentField = $this->getParentField();
        if ($parentField === null) {
            return array($this->xFields[0]);
        }

        return array($parentField, $this->xFields[0]);
    }

    /**
     * Get the group (parent, label) from the values of the group fields.
     *
     * @param list<mixed> $values the values of the fields given by getGroupFields()
     *
     * @return array the parent (null if none) and the label
     */
    protected function getGroupFromValues(array $values): mixed
    {
        if (count($values) === 1) {
            return array(null, $values[0]);
        }

        return array($values[0], $values[1]);
    }

    /**
     * Set the nodes: the groups, the parents and the root.
     *
     * The value of a parent is the sum of the values of its children,
     * the value of the root is the sum of all the values.
     * Groups without parent are attached to the root.
     *
     * As a label can be used by several parents, each node has a unique id:
     * "p" and the parent position for a parent, "c" and the group position
     * for a group, so a parent and a group attached to the root can not have
     * the same id.
     *
     * The groups are read one by one and written in JsonColumn, so the memory
     * does not depend on the number of groups. Only the parents are kept in
     * memory, then written after the groups, and the root last: Plotly builds
     * the hierarchy from the ids, whatever the order of the nodes.
     *
     * @param array                           $trace  the sunburst trace
     * @param JsonColumn|JsonRows|list<array> $groups the groups: [parent, label]
     * @param JsonColumn|list<mixed>          $values the aggregated value of each group
     * @param null|array|JsonColumn           $colors the color of each group, null if none
     *
     * @return null|JsonColumn the colors of all the nodes, null if none
     */
    protected function setAggregatedValues(array &$trace, array|JsonColumn|JsonRows $groups, array|JsonColumn $values, null|array|JsonColumn $colors): ?JsonColumn
    {
        $root = self::ROOT;

        // The columns of the nodes
        $ids = new JsonColumn();
        $labels = new JsonColumn();
        $nodeValues = new JsonColumn();
        $parents = new JsonColumn();
        $nodeColors = $colors !== null ? new JsonColumn() : null;

        // Read the groups, their values and their colors together
        $rows = new JsonRows(
            $colors !== null ? array($groups, $values, $colors) : array($groups, $values),
            fn (array $row): array => $row,
        );

        // Write the groups, and build the parent nodes. A parent has the sum
        // of the values of its children, and the color of its first child.
        $parentIndex = new GroupIndex();
        $parentNodes = array();
        $total = 0;
        foreach ($rows as $i => $row) {
            list($parent, $label) = $row[0];
            $value = is_numeric($row[1]) ? $row[1] + 0 : 0;
            $color = $row[2] ?? null;
            $total += $value;

            // Groups without parent are attached to the root
            $parentId = $root;
            if ($parent !== null && $parent !== '') {
                $p = $parentIndex->positionOf($parent);
                if (!isset($parentNodes[$p])) {
                    $parentNodes[$p] = array(
                        'id' => $root.'/p'.$p,
                        'label' => $parent,
                        'value' => 0,
                        'color' => null,
                    );
                }
                $parentNodes[$p]['value'] += $value;
                if ($parentNodes[$p]['color'] === null) {
                    $parentNodes[$p]['color'] = $color;
                }
                $parentId = $parentNodes[$p]['id'];
            }

            // The group position makes the child id unique
            $ids->append($parentId.'/c'.$i);
            $labels->append($label);
            $nodeValues->append($row[1]);
            $parents->append($parentId);
            $nodeColors?->append($color);
        }

        // Then the parents, and the root
        foreach ($parentNodes as $node) {
            $ids->append($node['id']);
            $labels->append($node['label']);
            $nodeValues->append($node['value']);
            $parents->append($root);
            $nodeColors?->append($node['color']);
        }
        $ids->append($root);
        $labels->append($root);
        $nodeValues->append($total);
        $parents->append('');
        $nodeColors?->append('white');

        // Set the nodes in the trace
        $trace['ids'] = $ids;
        $trace[self::X_PROPERTY] = $labels;
        $trace[self::Y_PROPERTY] = $nodeValues;
        $trace[self::Z_PROPERTY] = $parents;

        return $nodeColors;
    }

    /**
     * Get the field containing the parent of the features.
     *
     * @return null|string the parent field: the Z field of the first trace
     */
    private function getParentField(): ?string
    {
        return $this->zFields[0] ?? null;
    }
}
