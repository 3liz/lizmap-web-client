<?php

use Lizmap\App\SqlTools;
use Lizmap\DataTables\DataTables;
use Lizmap\Form\QgisFormControl;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 */
#[CoversNothing]
class DataTablesTest extends TestCase
{
    public function testConvertCriteriaToExpression(): void
    {
        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '=',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" = \'test\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '!=',
            'value1' => '1',
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" != 1');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '<',
            'value1' => '1.5',
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" < 1.5');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '<=',
            'value1' => 2,
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" <= 2');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '>',
            'value1' => 0.5,
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" > 0.5');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '>=',
            'value1' => 'C',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" >= \'C\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => 'starts',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" ILIKE \'test%\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '!starts',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" NOT ILIKE \'test%\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => 'contains',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" ILIKE \'%test%\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '!contains',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" NOT ILIKE \'%test%\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => 'ends',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" ILIKE \'%test\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '!ends',
            'value1' => 'test',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" NOT ILIKE \'%test\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => 'null',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" IS NULL');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '!null',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" IS NOT NULL');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => 'between',
            'value1' => 'a',
            'value2' => 'd',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" BETWEEN \'a\' AND \'d\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '!between',
            'value1' => 'a',
            'value2' => 'd',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" NOT BETWEEN \'a\' AND \'d\'');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => 'between',
            'value1' => 0,
            'value2' => 5,
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" BETWEEN 0 AND 5');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'condition' => '!between',
            'value1' => '0',
            'value2' => '5',
            'type' => 'num',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" NOT BETWEEN 0 AND 5');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'type' => 'string',
            'condition' => '=',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"name" = \'\'');

        // Column names with uppercase letters must be enclosed in double quotes
        // so PostgreSQL does not fold the identifier to lower case.
        $criteria = array(
            'data' => 'Flur',
            'origData' => 'Flur',
            'condition' => '=',
            'value1' => '510',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"Flur" = \'510\'');

        // A double quote inside a column name must be doubled (escaped).
        $criteria = array(
            'data' => 'weird"col',
            'origData' => 'weird"col',
            'condition' => '=',
            'value1' => 'x',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '"weird""col" = \'x\'');
    }

    public function testInvalidConvertCriteriaToExpression(): void
    {
        $criteria = array(
            'type' => '',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '');

        $criteria = array(
            'data' => 'Name',
            'type' => '',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'type' => '',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '');

        $criteria = array(
            'data' => 'Name',
            'origData' => 'name',
            'type' => 'string',
        );
        $exp = DataTables::convertCriteriaToExpression($criteria);
        $this->assertEquals($exp, '');
    }

    public function testConvertSearchToExpression(): void
    {
        $search = array(
            'criteria' => array(
                array(
                    'data' => 'Name',
                    'origData' => 'name',
                    'condition' => '=',
                    'value1' => 'test',
                    'type' => 'string',
                ),
            ),
        );
        $exp = DataTables::convertSearchToExpression($search);
        $this->assertEquals($exp, '"name" = \'test\'');

        $search = array(
            'criteria' => array(
                array(
                    'data' => 'Name',
                    'origData' => 'name',
                    'condition' => '>=',
                    'value1' => 'a',
                    'type' => 'string',
                ),
                array(
                    'data' => 'Name',
                    'origData' => 'name',
                    'condition' => '<=',
                    'value1' => 'd',
                    'type' => 'string',
                ),
            ),
        );
        $exp = DataTables::convertSearchToExpression($search);
        $this->assertEquals($exp, '"name" >= \'a\' AND "name" <= \'d\'');

        $search = array(
            'criteria' => array(
                array(
                    'data' => 'Name',
                    'origData' => 'name',
                    'condition' => 'starts',
                    'value1' => 'test',
                    'type' => 'string',
                ),
                array(
                    'data' => 'Name',
                    'origData' => 'name',
                    'condition' => 'ends',
                    'value1' => 'test',
                    'type' => 'string',
                ),
            ),
            'logic' => 'OR',
        );
        $exp = DataTables::convertSearchToExpression($search);
        $this->assertEquals($exp, '"name" ILIKE \'test%\' OR "name" ILIKE \'%test\'');

        // test complex subconditions
        $search = array(
            'criteria' => array(
                array(
                    'criteria' => array(
                        array(
                            'data' => 'Surname',
                            'origData' => 'surname',
                            'condition' => 'starts',
                            'value1' => 'sub',
                            'type' => 'string',
                        ),
                        array(
                            'data' => 'Surname',
                            'origData' => 'surname',
                            'condition' => 'starts',
                            'value1' => 'liz',
                            'type' => 'string',
                        ),
                        array(
                            'criteria' => array(
                                array(
                                    'data' => 'Age',
                                    'origData' => 'age',
                                    'condition' => '=',
                                    'value1' => '22',
                                    'type' => 'num',
                                ),
                                array(
                                    'data' => 'Age',
                                    'origData' => 'age',
                                    'condition' => '=',
                                    'value1' => '23',
                                    'type' => 'num',
                                ),
                                array(
                                    'data' => 'Age',
                                    'origData' => 'age',
                                    'condition' => '=',
                                    'value1' => '45',
                                    'type' => 'num',
                                ),
                            ),
                            'logic' => 'OR',
                        ),
                    ),
                    'logic' => 'OR',
                ),
                array(
                    'data' => 'Name',
                    'origData' => 'name',
                    'condition' => '=',
                    'value1' => 'test',
                    'type' => 'string',
                ),
                array(
                    'data' => 'Location',
                    'origData' => 'location',
                    'condition' => 'ends',
                    'value1' => 'ce',
                    'type' => 'string',
                ),
                array(
                    'criteria' => array(
                        array(
                            'data' => 'Year',
                            'origData' => 'year',
                            'condition' => '=',
                            'value1' => '2025',
                            'type' => 'num',
                        ),
                        array(
                            'data' => 'Year',
                            'origData' => 'year',
                            'condition' => '=',
                            'value1' => '2026',
                            'type' => 'num',
                        ),
                    ),
                    'logic' => 'OR',
                ),
            ),
            'logic' => 'AND',
        );

        $exp = DataTables::convertSearchToExpression($search);
        $this->assertEquals($exp, '("surname" ILIKE \'sub%\' OR "surname" ILIKE \'liz%\' OR ("age" = 22 OR "age" = 23 OR "age" = 45)) AND "name" = \'test\' AND "location" ILIKE \'%ce\' AND ("year" = 2025 OR "year" = 2026)');
    }

    /**
     * Test the split of the quick search into words.
     */
    public function testGetQuickSearchWords(): void
    {
        // Empty search
        $this->assertEquals(array(), DataTables::getQuickSearchWords(''));
        $this->assertEquals(array(), DataTables::getQuickSearchWords("  \t "));

        // Words split on white spaces, without duplicates
        $this->assertEquals(array('rue', 'Paris'), DataTables::getQuickSearchWords('  rue   Paris rue '));

        // At most QUICK_SEARCH_MAX_WORDS words
        $this->assertEquals(array('a', 'b', 'c'), DataTables::getQuickSearchWords('a b c d e'));

        // Backslashes and control characters removed, quotes and wildcards kept
        $this->assertEquals(array('l\'école', '50%', 'a_b'), DataTables::getQuickSearchWords("l'école\\ 50%\n a_b"));
        $this->assertEquals(array('ab'), DataTables::getQuickSearchWords('\ab\\'));
    }

    /**
     * Test the quick search expression evaluated by QGIS Server.
     */
    public function testBuildQuickSearchExpressionQgis(): void
    {
        // Nothing to search
        $this->assertEquals('', DataTables::buildQuickSearchExpression('', array('name')));

        // One word, every column with ILIKE
        $exp = DataTables::buildQuickSearchExpression('par', array('name', 'code'));
        $this->assertEquals('( "name" ILIKE \'%par%\' OR "code" ILIKE \'%par%\' )', $exp);

        // Several words: each one in at least one column
        $exp = DataTables::buildQuickSearchExpression('rue par', array('name', 'code'));
        $this->assertEquals(
            '( "name" ILIKE \'%rue%\' OR "code" ILIKE \'%rue%\' ) AND ( "name" ILIKE \'%par%\' OR "code" ILIKE \'%par%\' )',
            $exp
        );

        // The quotes are escaped, in the value and in the column name
        $exp = DataTables::buildQuickSearchExpression("l'eau", array('my "name"'));
        $this->assertEquals('( "my ""name""" ILIKE \'%l\'\'eau%\' )', $exp);

        // The unaccent function is not used by QGIS Server
        $exp = DataTables::buildQuickSearchExpression('été', array('name'), null, 'unaccent');
        $this->assertEquals('( "name" ILIKE \'%été%\' )', $exp);

        // No column: nothing can be found
        $this->assertEquals('1 = 0', DataTables::buildQuickSearchExpression('été', array()));
    }

    /**
     * Test the quick search expression run as SQL in PostgreSQL.
     */
    public function testBuildQuickSearchExpressionPostgres(): void
    {
        $types = array(
            'name' => 'varchar',
            'description' => 'text',
            'id' => 'int',
            'value' => 'numeric',
            'day' => 'date',
            'checked' => 'bool',
            'geom' => 'geometry',
        );
        $columns = array('name', 'description', 'id', 'value', 'day', 'checked', 'geom');

        // Text columns with ILIKE, the others converted to text, booleans and geometries ignored
        $exp = DataTables::buildQuickSearchExpression('12', $columns, $types);
        $this->assertEquals(
            '( "name" ILIKE \'%12%\' OR "description" ILIKE \'%12%\' OR concat("id") ILIKE \'%12%\''
            .' OR concat("value") ILIKE \'%12%\' OR concat("day") ILIKE \'%12%\' )',
            $exp
        );

        // Text columns without accents
        $exp = DataTables::buildQuickSearchExpression('été', array('name', 'id'), $types, 'f_unaccent');
        $this->assertEquals(
            '( f_unaccent("name") ILIKE f_unaccent(\'%été%\') OR concat("id") ILIKE \'%été%\' )',
            $exp
        );
        $exp = DataTables::buildQuickSearchExpression('été', array('name'), $types, 'unaccent');
        $this->assertEquals('( unaccent("name") ILIKE unaccent(\'%été%\') )', $exp);

        // Only the known functions removing accents
        $exp = DataTables::buildQuickSearchExpression('été', array('name'), $types, 'pg_sleep');
        $this->assertEquals('( "name" ILIKE \'%été%\' )', $exp);

        // A column without type is ignored, no column to search: nothing can be found
        $this->assertEquals('1 = 0', DataTables::buildQuickSearchExpression('été', array('unknown', 'checked'), $types));

        // Searchable types
        $this->assertTrue(DataTables::isQuickSearchDbType('varchar'));
        $this->assertTrue(DataTables::isQuickSearchDbType('int'));
        $this->assertTrue(DataTables::isQuickSearchDbType('_text'));
        $this->assertFalse(DataTables::isQuickSearchDbType('bool'));
        $this->assertFalse(DataTables::isQuickSearchDbType('geometry'));
    }

    /**
     * Test that the quick search expressions are valid filters, even with malicious values.
     */
    public function testBuildQuickSearchExpressionIsValid(): void
    {
        $types = array('name' => 'varchar', 'id' => 'int');
        $searches = array(
            'simple',
            "l'eau",
            "' OR 1=1 --",
            "'); DROP TABLE users; --",
            '\\\' OR 1=1 --',
            '/* comment',
            '" OR "a"="a',
            '%_%',
        );
        foreach ($searches as $search) {
            foreach (array(null, 'f_unaccent') as $unaccent) {
                // As evaluated by QGIS Server
                $exp = DataTables::buildQuickSearchExpression($search, array('name', 'id'));
                $this->assertTrue(SqlTools::validateExpressionFilter($exp), $exp);
                $this->assertTrue(SqlTools::validateExpressionFilter('( '.$exp.' )'), $exp);

                // As run in PostgreSQL
                $exp = DataTables::buildQuickSearchExpression($search, array('name', 'id'), $types, $unaccent);
                $this->assertTrue(SqlTools::validateExpressionFilter($exp), $exp);
                $this->assertTrue(SqlTools::validateExpressionFilter('( '.$exp.' )'), $exp);
                // Only the searched columns are cited
                $this->assertEquals(array('name', 'id'), SqlTools::getSQLStringColumnNames($exp), $exp);
            }
        }
    }

    /**
     * Test the codes of the labels matching a word of the quick search.
     */
    public function testGetLabelCodesMatchingWord(): void
    {
        $labels = array(
            '1' => 'Forêt',
            '2' => 'Prairie',
            'U' => 'Zone urbaine',
            QgisFormControl::QGIS_NULL_VALUE => 'Inconnu',
        );

        // Case insensitive
        $this->assertEquals(array('2'), DataTables::getLabelCodesMatchingWord($labels, 'PRAIRIE'));
        $this->assertEquals(array('2', 'U'), DataTables::getLabelCodesMatchingWord($labels, 'ai'));

        // Accent insensitive, if the intl extension is installed
        if (class_exists('Normalizer')) {
            $this->assertEquals(array('1'), DataTables::getLabelCodesMatchingWord($labels, 'foret'));
            $this->assertEquals(array('1'), DataTables::getLabelCodesMatchingWord($labels, 'FORÊT'));
        }

        // The label of the NULL value is ignored, it is not displayed
        $this->assertEquals(array(), DataTables::getLabelCodesMatchingWord($labels, 'connu'));

        // LIKE wildcards
        $this->assertEquals(array('U'), DataTables::getLabelCodesMatchingWord($labels, 'zone%ine'));
        $this->assertEquals(array('2'), DataTables::getLabelCodesMatchingWord($labels, 'pr_irie'));

        // Regular expression characters are not interpreted
        $this->assertEquals(array(), DataTables::getLabelCodesMatchingWord($labels, '.*'));
        $this->assertEquals(array(), DataTables::getLabelCodesMatchingWord($labels, 'zone/'));

        // Not found
        $this->assertEquals(array(), DataTables::getLabelCodesMatchingWord($labels, 'eau'));
        $this->assertEquals(array(), DataTables::getLabelCodesMatchingWord(array(), 'eau'));
    }

    /**
     * Test the quick search on the columns with labels.
     */
    public function testBuildQuickSearchExpressionLabels(): void
    {
        $labeledValues = array(
            'landuse' => array(
                '1' => 'Forest',
                '2' => 'Forest edge',
                '3' => "Farmer's field",
                QgisFormControl::QGIS_NULL_VALUE => 'Unknown',
            ),
        );

        // Evaluated by QGIS Server: the codes of the matching labels
        $this->assertEquals(
            '( "name" ILIKE \'%forest%\' OR "landuse" IN ( \'1\', \'2\' ) )',
            DataTables::buildQuickSearchExpression('forest', array('name', 'landuse'), null, null, $labeledValues)
        );

        // No matching label: the column is not searched
        $this->assertEquals(
            '( "name" ILIKE \'%water%\' )',
            DataTables::buildQuickSearchExpression('water', array('name', 'landuse'), null, null, $labeledValues)
        );
        $this->assertEquals(
            '1 = 0',
            DataTables::buildQuickSearchExpression('water', array('landuse'), null, null, $labeledValues)
        );

        // The label of the NULL value is ignored, and the quotes in the codes are escaped
        $labeledValues['landuse']["o'k"] = 'Unknown too';
        $this->assertEquals(
            '( "landuse" IN ( \'o\'\'k\' ) )',
            DataTables::buildQuickSearchExpression('unknown', array('landuse'), null, null, $labeledValues)
        );

        // Run as SQL: the non text columns are converted to text
        $types = array('name' => 'varchar', 'landuse' => 'int');
        $this->assertEquals(
            '( "name" ILIKE \'%edge%\' OR concat("landuse") IN ( \'2\' ) )',
            DataTables::buildQuickSearchExpression('edge', array('name', 'landuse'), $types, null, $labeledValues)
        );
        $types['landuse'] = 'varchar';
        $this->assertEquals(
            '( "landuse" IN ( \'2\' ) )',
            DataTables::buildQuickSearchExpression('edge', array('landuse'), $types, 'unaccent', $labeledValues)
        );

        // The generated expressions are valid
        foreach (array("' OR 1=1 --", 'forest', 'unknown', "farmer's") as $search) {
            foreach (array(null, $types) as $dbFieldTypes) {
                $exp = DataTables::buildQuickSearchExpression($search, array('name', 'landuse'), $dbFieldTypes, null, $labeledValues);
                $this->assertTrue(SqlTools::validateExpressionFilter($exp), $exp);
            }
        }
    }

    /**
     * Test the expression getting the labels of a source layer matching the quick search.
     */
    public function testBuildLabelSearchExpression(): void
    {
        // Evaluated by QGIS Server: any word in the label
        $this->assertEquals(
            '( "label" ILIKE \'%first%\' ) OR ( "label" ILIKE \'%l\'\'eau%\' )',
            DataTables::buildLabelSearchExpression("first  l'eau", 'label')
        );

        // Run as SQL, without accents
        $this->assertEquals(
            '( f_unaccent("label") ILIKE f_unaccent(\'%forêt%\') )',
            DataTables::buildLabelSearchExpression('forêt', 'label', array('label' => 'text'), 'f_unaccent')
        );

        // Nothing to search
        $this->assertEquals('', DataTables::buildLabelSearchExpression('  ', 'label'));

        // The generated expressions are valid and only use the label field
        foreach (array("' OR 1=1 --", 'first second', '%_%') as $search) {
            $exp = DataTables::buildLabelSearchExpression($search, 'label', array('label' => 'varchar'), 'unaccent');
            $this->assertTrue(SqlTools::validateExpressionFilter($exp), $exp);
            $this->assertEquals(array('label'), SqlTools::getSQLStringColumnNames($exp), $exp);
        }
    }

    /**
     * Test if the quick search is enabled depending on the size of the layer.
     */
    public function testIsQuickSearchEnabled(): void
    {
        // Small layer
        $this->assertTrue(DataTables::isQuickSearchEnabled(false, 100, 5));
        $this->assertTrue(DataTables::isQuickSearchEnabled(true, 100, 5));
        $this->assertTrue(DataTables::isQuickSearchEnabled(false, DataTables::QUICK_SEARCH_MAX_FEATURES, 30));

        // No column to search
        $this->assertFalse(DataTables::isQuickSearchEnabled(true, 100, 0));

        // Too many features: disabled with QGIS Server, enabled with SQL
        $this->assertFalse(DataTables::isQuickSearchEnabled(false, DataTables::QUICK_SEARCH_MAX_FEATURES + 1, 5));
        $this->assertTrue(DataTables::isQuickSearchEnabled(true, 10000000, 5));

        // Other limit, or no limit
        $this->assertFalse(DataTables::isQuickSearchEnabled(false, 101, 5, 100));
        $this->assertTrue(DataTables::isQuickSearchEnabled(false, 10000000, 5, 0));
    }
}
