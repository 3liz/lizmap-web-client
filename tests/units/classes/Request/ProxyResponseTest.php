<?php

use GuzzleHttp\Psr7;
use Lizmap\Request;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class ProxyResponseTest extends TestCase
{
    public function testGetter(): void
    {
        $response = new Request\ProxyResponse(
            200,
            'text/json',
            array('Content-Type' => 'text/json'),
            Psr7\Utils::streamFor('{}')
        );
        $this->assertEquals(200, $response->getCode());
        $this->assertEquals('text/json', $response->getMime());
        $this->assertEquals(array('Content-Type' => 'text/json'), $response->getHeaders());
    }
}
