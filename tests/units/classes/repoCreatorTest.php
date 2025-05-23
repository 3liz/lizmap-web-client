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
        'B:/windows/folder',
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
        $this->assertEquals(
            'B:/windows/folder/',
            RepoCreator::pathValidator($this->listPath[5], '')
        );

        $this->expectException(ApiException::class);

        RepoCreator::pathValidator($this->listPath[2], $rootRepo);
        RepoCreator::pathValidator($this->listPath[3], $rootRepo);
        RepoCreator::pathValidator($this->listPath[4], $rootRepo);
        RepoCreator::pathValidator($this->listPath[5], $rootRepo);

        RepoCreator::pathValidator($this->listPath[0], '');
        RepoCreator::pathValidator($this->listPath[1], '');
        RepoCreator::pathValidator($this->listPath[2], '');
        RepoCreator::pathValidator($this->listPath[3], '');
    }
}
