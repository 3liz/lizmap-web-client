<?php

/**
 * Manage OGC response.
 *
 * @author    3liz
 * @copyright 2015-2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

use Psr\Http\Message\StreamInterface;

class ProxyResponse
{
    /**
     * @var int the HTTP status code of the response
     */
    protected $code;

    /**
     * @var string the MIME type of the response
     */
    protected $mime;

    /**
     * @var array<string, string> the headers of the response
     */
    protected $headers;

    /**
     * @var StreamInterface the response body as a stream
     */
    protected $body;

    /**
     * constructor.
     *
     * @param int                   $code    the HTTP status code of the response
     * @param string                $mime    the MIME type of the response
     * @param array<string, string> $headers the headers of the response
     * @param StreamInterface       $body    the response body as a string
     */
    public function __construct($code, $mime, $headers, $body)
    {
        $this->code = $code;
        $this->mime = $mime;
        $this->headers = $headers;
        $this->body = $body;
    }

    /**
     * Get the HTTP status code of the response.
     *
     * @return int
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Get the MIME type of the response.
     *
     * @return string
     */
    public function getMime()
    {
        return $this->mime;
    }

    /**
     * Get the headers of the response.
     *
     * @return array<string, string>
     */
    public function getHeaders()
    {
        return $this->headers;
    }

    /**
     * Get the response's body as string.
     *
     * @return string
     */
    public function getBodyAsString()
    {
        if ($this->body->isSeekable()) {
            $this->body->rewind();
        }

        return $this->body->getContents();
    }

    /**
     * Get the response's body as stream.
     *
     * @return StreamInterface
     */
    public function getBodyAsStream()
    {
        return $this->body;
    }
}
