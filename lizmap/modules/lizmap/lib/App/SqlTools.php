<?php

/**
 * SQL tools for Lizmap.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

class SqlTools
{
    protected static $blockSqlWords = array(
        ';',
        'select',
        'delete',
        'insert',
        'update',
        'drop',
        'alter',
        '--',
        'truncate',
        'vacuum',
        'create',
        'reindex',
        'grant',
        'revoke',
        '/*',
    );

    /**
     * QGIS geometry predicate functions mapped to their PostGIS ST_* equivalents.
     *
     * These are the operators offered by the selection tool and the filter form.
     *
     * @var array<string, string>
     */
    public const GEOMETRY_PREDICATES = array(
        'intersects' => 'ST_Intersects',
        'contains' => 'ST_Contains',
        'within' => 'ST_Within',
        'crosses' => 'ST_Crosses',
        'overlaps' => 'ST_Overlaps',
        'touches' => 'ST_Touches',
        'disjoint' => 'ST_Disjoint',
    );

    /**
     * Validate an expression filter.
     *
     * @param string $filter The expression filter to validate
     *
     * @return array{0: bool, 1: list<string>} returns if the expression does not contains dangerous chars, and the list of blocked items
     */
    public static function validateExpressionFilter(string $filter): array
    {
        $block_items = array();
        $pattern = '#'.implode('|', array_map(fn ($w): string => preg_quote($w, '#'), static::$blockSqlWords)).'#i';

        return array(!preg_match($pattern, $filter, $block_items), $block_items);
    }

    /**
     * Translate a QGIS expression filter into a PostGIS compatible SQL filter.
     *
     * Rewrites the geometry predicate functions used by the selection tool and
     * the filter form (intersects, contains, within, crosses, overlaps, touches,
     * disjoint) to their PostGIS ST_* equivalents, translates geom_from_gml() and
     * replaces the $geometry variable with the given geometry column.
     *
     * The predicate name is matched case-insensitively and only when followed by
     * an opening parenthesis, so plain text and column names are left untouched.
     *
     * @param string $filter         The QGIS expression filter
     * @param string $geometryColumn The layer geometry column name
     *
     * @return string The PostGIS compatible filter
     */
    public static function translateExpressionToPostgis(string $filter, string $geometryColumn): string
    {
        foreach (self::GEOMETRY_PREDICATES as $qgisFunction => $postgisFunction) {
            $filter = preg_replace('/\b'.$qgisFunction.'\s*\(/i', $postgisFunction.'(', $filter);
        }
        $filter = str_replace('geom_from_gml', 'ST_GeomFromGML', $filter);

        return str_replace('$geometry', '"'.$geometryColumn.'"', $filter);
    }
}
