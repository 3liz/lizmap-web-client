<?php

use PHPUnit\Framework\TestCase;
use GuzzleHttp\Psr7 as Psr7;
use Lizmap\Request;

class ProxyResponseTest extends TestCase
{
    public function testGetter() : void
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
