<?php

use LizmapApi\RepoCreator;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class repoCreatorTest extends TestCase
{
    public function testRelativePath(): void
    {
        $listPath = array(
            'demoqgis/',
            'demoqgis',
            'projects/city',
            '/demoqgis/',
        );

        $rootRepo = '/srv/lzm/tests/qgis-projects/';

        $this->assertEquals(
            '/srv/lzm/tests/qgis-projects/demoqgis/',
            RepoCreator::testRelativePath($listPath[0], $rootRepo)
        );
        $this->assertEquals(
            '/srv/lzm/tests/qgis-projects/demoqgis',
            RepoCreator::testRelativePath($listPath[1], $rootRepo)
        );
        $this->assertEquals(
            '/srv/lzm/tests/qgis-projects/projects/city',
            RepoCreator::testRelativePath($listPath[2], $rootRepo)
        );
        $this->assertEquals(
            '/demoqgis/',
            RepoCreator::testRelativePath($listPath[3], $rootRepo)
        );

        $this->assertFalse(RepoCreator::testRelativePath($listPath[0], ''));
        $this->assertFalse(RepoCreator::testRelativePath($listPath[1], ''));
        $this->assertFalse(RepoCreator::testRelativePath($listPath[2], ''));
    }
}
