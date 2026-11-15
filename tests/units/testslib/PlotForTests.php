<?php

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
}
