<?php

use Lizmap\ActionQuery\ActionQuery;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class ActionQueryTest extends TestCase
{
    // =========================================================
    // Helpers
    // =========================================================

    /**
     * Fake DB connection that does nothing. Enough for tests that only call
     * buildParams() or buildSql(), which never touch the connection.
     */
    private function makeActionQuery(): ActionQuery
    {
        return new ActionQuery($this->fakeCnx(), 'repo', 'proj', '', new ContextForTests());
    }

    private function fakeCnx(): object
    {
        return new class() {
            public function beginTransaction(): void {}

            public function commit(): void {}

            public function rollback(): void {}

            public function errorCode(): string
            {
                return '';
            }

            public function prepare(string $sql): object
            {
                return new class() implements Iterator {
                    private int $pos = 0;

                    public function execute(array $v): void {}

                    public function id(): int
                    {
                        return 1;
                    }

                    public function current(): mixed
                    {
                        return (object) array('data' => '[]');
                    }

                    public function key(): int
                    {
                        return 0;
                    }

                    public function next(): void
                    {
                        ++$this->pos;
                    }

                    public function rewind(): void
                    {
                        $this->pos = 0;
                    }

                    public function valid(): bool
                    {
                        return false; // no rows
                    }
                };
            }
        };
    }

    /**
     * Minimal layer stub.
     */
    private function fakeLayer(string $name, string $schema = 'public', string $table = 'mytable'): object
    {
        return new class($name, $schema, $table) {
            public function __construct(
                private string $name,
                private string $schema,
                private string $table,
            ) {}

            public function getName(): string
            {
                return $this->name;
            }

            public function getDatasourceParameters(): object
            {
                return (object) array('schema' => $this->schema, 'tablename' => $this->table);
            }
        };
    }

    // =========================================================
    // buildParams()
    // =========================================================

    public function testBuildParamsBaseFieldsAreSet(): void
    {
        $aq = $this->makeActionQuery();

        $params = $aq->buildParams('myaction', 'scope', null, null, 'WKT', 'CENTER', 'EXTENT');

        $this->assertEquals('repo', $params['lizmap_repository']);
        $this->assertEquals('proj', $params['lizmap_project']);
        $this->assertEquals('myaction', $params['action_name']);
        $this->assertEquals('scope', $params['action_scope']);
        $this->assertEquals('WKT', $params['wkt']);
        $this->assertEquals('CENTER', $params['map_center']);
        $this->assertEquals('EXTENT', $params['map_extent']);
        // jAuth not connected in test env -> falls back to anonymous
        $this->assertEquals('anonymous', $params['user_login']);
    }

    public function testBuildParamsProjectScopeIgnoresLayer(): void
    {
        $aq = $this->makeActionQuery();
        $layer = $this->fakeLayer('MyLayer');

        // Even when a layer is passed, scope=project must leave layer fields null
        $params = $aq->buildParams('act', 'project', $layer, 42, '', '', '');

        $this->assertNull($params['layer_name']);
        $this->assertNull($params['layer_schema']);
        $this->assertNull($params['layer_table']);
        $this->assertNull($params['feature_id']);
    }

    public function testBuildParamsLayerScopeFillsLayerInfo(): void
    {
        $aq = $this->makeActionQuery();
        $layer = $this->fakeLayer('MyLayer', 'myschema', 'mytable');

        $params = $aq->buildParams('act', 'layer', $layer, null, '', '', '');

        $this->assertEquals('MyLayer', $params['layer_name']);
        $this->assertEquals('myschema', $params['layer_schema']);
        $this->assertEquals('mytable', $params['layer_table']);
    }

    public function testBuildParamsFeatureScopeIncludesFeatureId(): void
    {
        $aq = $this->makeActionQuery();
        $layer = $this->fakeLayer('MyLayer');

        $params = $aq->buildParams('act', 'feature', $layer, 99, '', '', '');

        $this->assertEquals(99, $params['feature_id']);
    }

    // public function testBuildParamsLayerNameSingleQuoteIsDoubled(): void
    // {
    //     $aq = $this->makeActionQuery();
    //     $layer = $this->fakeLayer("L'île"); // single quote in name

    //     $params = $aq->buildParams('act', 'layer', $layer, null, '', '', '');

    //     // SQL-safe escaping: ' → ''
    //     $this->assertEquals("L''île", $params['layer_name']);
    // }

    // =========================================================
    // buildSql()
    // =========================================================

    public function testBuildSqlStructureContainsLizmapGetData(): void
    {
        $aq = $this->makeActionQuery();

        [$sql] = $aq->buildSql(array('lizmap_repository' => 'repo'), (object) array('options' => array()), array());

        $this->assertStringContainsString('public.lizmap_get_data', $sql);
        $this->assertStringContainsString('json_build_object', $sql);
    }

    public function testBuildSqlFeatureIdCastAsInteger(): void
    {
        $aq = $this->makeActionQuery();
        // feature_id key should be integer
        $params = array('feature_id' => 42);

        [$sql] = $aq->buildSql($params, (object) array('options' => array()), array());

        $this->assertStringContainsString("'feature_id', (\$1)::integer", $sql);
    }

    public function testBuildSqlTextParamCastAsText(): void
    {
        $aq = $this->makeActionQuery();
        $params = array('layer_name' => 'MyLayer');

        [$sql] = $aq->buildSql($params, (object) array('options' => array()), array());

        $this->assertStringContainsString("'layer_name', (\$1)::text", $sql);
    }

    public function testBuildSqlPlaceholderIndexIncrements(): void
    {
        $aq = $this->makeActionQuery();
        $params = array('layer_name' => 'foo', 'feature_id' => 5);

        [$sql] = $aq->buildSql($params, (object) array('options' => array()), array());

        $this->assertStringContainsString('$1', $sql);
        $this->assertStringContainsString('$2', $sql);
        $this->assertStringNotContainsString('$3', $sql);
    }

    public function testBuildSqlValuesMatchParamsInOrder(): void
    {
        $aq = $this->makeActionQuery();
        $params = array('lizmap_repository' => 'repo', 'lizmap_project' => 'proj');

        [, $values] = $aq->buildSql($params, (object) array('options' => array()), array());

        $this->assertSame(array('repo', 'proj'), $values);
    }

    public function testBuildSqlTotalValuesCountEqualsParamsPlusOptions(): void
    {
        $aq = $this->makeActionQuery();
        $params = array('lizmap_repository' => 'repo', 'feature_id' => 1);
        $action = (object) array('options' => array('filter_a' => 'default_a', 'filter_b' => 'default_b'));
        $clientOptions = array('filter_a' => 'val_a', 'filter_b' => 'val_b');

        [, $values] = $aq->buildSql($params, $action, $clientOptions);

        $this->assertCount(4, $values); // 2 params + 2 options
    }

    public function testBuildSqlValidClientOptionOverridesConfigDefault(): void
    {
        $aq = $this->makeActionQuery();
        $action = (object) array('options' => array('my_filter' => 'default_value'));
        $clientOptions = array('my_filter' => 'client_value');

        [, $values] = $aq->buildSql(array(), $action, $clientOptions);

        $this->assertEquals('client_value', $values[0]);
    }

    public function testBuildSqlEmptyClientOptionFallsBackToConfigDefault(): void
    {
        $aq = $this->makeActionQuery();
        $action = (object) array('options' => array('my_filter' => 'safe_default'));
        $clientOptions = array('my_filter' => '');

        [, $values] = $aq->buildSql(array(), $action, $clientOptions);

        $this->assertEquals('safe_default', $values[0]);
    }

    public static function sqlInjectionProvider(): array
    {
        return array(
            'semicolon' => array('; DROP TABLE users; --'),
            'select statement' => array('select * from users'),
            'delete statement' => array('delete from users'),
            'update statement' => array('update users set x=1'),
            'comment block open' => array('/* comment */'),
            'double dash' => array('-- comment'),
            'truncate' => array('truncate table users'),
        );
    }

    #[DataProvider('sqlInjectionProvider')]
    public function testBuildSqlInjectionAttemptFallsBackToConfigDefault(string $maliciousInput): void
    {
        $aq = $this->makeActionQuery();
        $action = (object) array('options' => array('my_filter' => 'safe_default'));
        $clientOptions = array('my_filter' => $maliciousInput);

        [, $values] = $aq->buildSql(array(), $action, $clientOptions);

        $this->assertEquals(
            'safe_default',
            $values[0],
            "Malicious input «{$maliciousInput}» should have been rejected",
        );
    }
}
