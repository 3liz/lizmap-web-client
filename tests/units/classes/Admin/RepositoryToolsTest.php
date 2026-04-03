<?php

use LizmapAdmin\RepositoryTools;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class RepositoryToolsTest extends TestCase
{
    public static function getDomainLists()
    {
        return array(
            array('', array()),

            array(' ', array()),

            array('https://domain1.com',  array('https://domain1.com')),

            array('https://domain1.com ', array('https://domain1.com')),

            array(' https://domain1.com', array('https://domain1.com')),

            array(' http://domain1.com',  array('http://domain1.com')),

            array('domain1.com',          array('https://domain1.com')),

            array('https://domain1.com,https://www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('https://domain1.com, https://www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('https://domain1.com,,https://www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('https://domain1.com, , https://www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('https://domain1.com, www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('domain1.com, www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('https://domain1.com,https://www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('https://domain1.com,https://www.domain2.com',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('"https://domain1.com", \'https://www.domain2.com\'',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('https://domain1.com,https://domain1.com',
                array('https://domain1.com')),

            array('https://domain1.com/foo/bar.xml,https://www.domain2.com/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
                array('https://domain1.com', 'https://www.domain2.com')),

            array('"https://domain1.com/foo/bar.xml","https://domain1.com/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities"',
                array('https://domain1.com')),
        );
    }

    /**
     * @dataProvider getDomainLists
     *
     * @param string $domainListAsString
     * @param array $expectedResult
     */
    #[DataProvider('getDomainLists')]
    public function testFixDomainList($domainListAsString, $expectedResult): void
    {
        $domainList = preg_split('/\s*,\s*/', $domainListAsString);
        $this->assertEquals(
            $expectedResult,
            RepositoryTools::fixDomainList($domainList),
        );

        $this->expectException(ValueError::class);
        RepositoryTools::fixDomainList(array('ftp:://domain1'));
    }

    public function testBadDomainList(): void
    {
        $this->expectException(ValueError::class);
        RepositoryTools::fixDomainList(array('ftp:://domain1'));
    }
}
