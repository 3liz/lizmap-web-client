<?php

use LizmapDataviz\Json\JsonColumn;
use LizmapDataviz\Plot\BarPlot;

/**
 * Plot exposing the protected static methods of AbstractPlot, to test them.
 */
class PlotForTests extends BarPlot
{
    /**
     * Compare two groups, to sort them as the database does.
     *
     * @param mixed $a the first group
     * @param mixed $b the second group
     *
     * @return int negative, 0 or positive if $a is before, equal to or after $b
     */
    public static function compareGroupsForTests(mixed $a, mixed $b): int
    {
        return self::compareGroups($a, $b);
    }

    /**
     * Get the colors of the groups of a trace, from a column of colors.
     *
     * @param JsonColumn  $column       the color of each group, null if none
     * @param null|string $defaultColor the color of the groups without color
     *
     * @return null|JsonColumn the colors, null if no group has a color
     */
    public static function getColorColumnForTests(JsonColumn $column, ?string $defaultColor): ?JsonColumn
    {
        return self::getColorColumn($column, $defaultColor);
    }
}
