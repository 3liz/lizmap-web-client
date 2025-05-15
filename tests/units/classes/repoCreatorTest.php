<?php

use LizmapApi\ApiException;
use LizmapApi\RepoCreator;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class repoCreatorTest extends TestCase
{
    public array $listPath = array(
        'demoqgis/',
        'demoqgis',
        '/demoqgis',
        'projects/city',
        '/srv/lzm/tests/qgis-projects/demoqgis',
    );

    public function testPathValidator(): void
    {
        $rootRepo = '/srv/lzm/tests/qgis-projects/';

        $this->assertEquals(
            '/srv/lzm/tests/qgis-projects/demoqgis/',
            RepoCreator::pathValidator($this->listPath[0], $rootRepo)
        );
        $this->assertEquals(
            '/srv/lzm/tests/qgis-projects/demoqgis/',
            RepoCreator::pathValidator($this->listPath[1], $rootRepo)
        );
        $this->assertEquals(
            '/srv/lzm/tests/qgis-projects/demoqgis/',
            RepoCreator::pathValidator($this->listPath[4], '')
        );

        $this->expectException(ApiException::class);

        RepoCreator::pathValidator($this->listPath[2], $rootRepo);
        RepoCreator::pathValidator($this->listPath[3], $rootRepo);
        RepoCreator::pathValidator($this->listPath[4], $rootRepo);

        RepoCreator::pathValidator($this->listPath[0], '');
        RepoCreator::pathValidator($this->listPath[1], '');
        RepoCreator::pathValidator($this->listPath[2], '');
        RepoCreator::pathValidator($this->listPath[3], '');
    }

    public function testCountPartSlashes(): void
    {
        $this->assertEquals(
            1,
            RepoCreator::countPartSlashes($this->listPath[0])
        );
        $this->assertEquals(
            1,
            RepoCreator::countPartSlashes($this->listPath[1])
        );
        $this->assertEquals(
            1,
            RepoCreator::countPartSlashes($this->listPath[2])
        );
        $this->assertEquals(
            2,
            RepoCreator::countPartSlashes($this->listPath[3])
        );
        $this->assertEquals(
            5,
            RepoCreator::countPartSlashes($this->listPath[4])
        );
    }
}
