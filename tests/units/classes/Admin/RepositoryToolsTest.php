<?php

use LizmapAdmin\RepositoryTools;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class RepositoryToolsTest extends TestCase
{
    public function testFixDomainList(): void
    {
        $domainList = array();
        $this->assertEquals(array(), RepositoryTools::fixDomainList($domainList));

        $domainList = array('');
        $this->assertEquals(array(), RepositoryTools::fixDomainList($domainList));

        $domainList = array(' ');
        $this->assertEquals(array(), RepositoryTools::fixDomainList($domainList));

        $domainList = preg_split('/\s*,\s*/', 'https://domain1.com');
        $this->assertEquals(
            array('https://domain1.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'https://domain1.com ');
        $this->assertEquals(
            array('https://domain1.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', ' https://domain1.com');
        $this->assertEquals(
            array('https://domain1.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', ' http://domain1.com');
        $this->assertEquals(
            array('http://domain1.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'domain1.com');
        $this->assertEquals(
            array('https://domain1.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'https://domain1.com,https://www.domain2.com');
        $this->assertEquals(
            array('https://domain1.com', 'https://www.domain2.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'https://domain1.com, https://www.domain2.com');
        $this->assertEquals(
            array('https://domain1.com', 'https://www.domain2.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'https://domain1.com,,https://www.domain2.com');
        $this->assertEquals(
            array('https://domain1.com', 'https://www.domain2.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'https://domain1.com, , https://www.domain2.com');
        $this->assertEquals(
            array('https://domain1.com', 'https://www.domain2.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'https://domain1.com, www.domain2.com');
        $this->assertEquals(
            array('https://domain1.com', 'https://www.domain2.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $domainList = preg_split('/\s*,\s*/', 'domain1.com, www.domain2.com');
        $this->assertEquals(
            array('https://domain1.com', 'https://www.domain2.com'),
            RepositoryTools::fixDomainList($domainList),
        );

        $this->expectException(ValueError::class);
        RepositoryTools::fixDomainList(array('ftp:://domain1'));
    }
}
