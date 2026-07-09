<?php

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
}
