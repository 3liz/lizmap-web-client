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

use GuzzleHttp\Psr7\Utils as Psr7Utils;
use Psr\Http\Message\StreamInterface;

class OGCResponse
{
    /**
     * @var int the HTTP status code of the response
     */
    public $code;

    /**
     * @var string the MIME type of the response
     */
    public $mime;

    /**
     * @var iterable|StreamInterface|string the response body as a stream, an iterable or a string
     */
    public $data;

    /**
     * @var bool the response has been cached
     */
    public $cached = false;

    /**
     * @var array the response headers
     */
    public $headers = array();

    /**
     * constructor.
     *
     * @param int                             $code    the HTTP status code of the response
     * @param string                          $mime    the MIME type of the response
     * @param iterable|StreamInterface|string $data    the response body as a string
     * @param bool                            $cached  the response has been cached, default value false
     * @param array                           $headers default value an empty array
     */
    public function __construct($code, $mime, $data, $cached = false, $headers = array())
    {
        $this->code = $code;
        $this->mime = $mime;
        $this->data = $data;
        $this->cached = $cached;
        $this->headers = $headers;
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
     * Get is the response has been cached.
     *
     * @return bool
     */
    public function isCached()
    {
        return $this->cached;
    }

    /**
     * Get the response's headers.
     *
     * @return array
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
        if (is_string($this->data)) {
            if (substr($this->data, 0, 7) == 'file://' && is_file(substr($this->data, 7))) {
                return $this->getBodyAsStream()->getContents();
            }

            return $this->data;
        }
        if (is_iterable($this->data)) {
            $body = '';
            foreach ($this->data as $d) {
                $body .= $d;
            }

            return $body;
        }
        if ($this->data->isSeekable()) {
            $this->data->rewind();
        }

        return $this->data->getContents();
    }

    /**
     * Get the response's body as stream.
     *
     * @return StreamInterface
     */
    public function getBodyAsStream()
    {
        if (is_string($this->data)) {
            if (substr($this->data, 0, 7) == 'file://' && is_file(substr($this->data, 7))) {
                $resource = Psr7Utils::tryFopen(substr($this->data, 7), 'r');

                return Psr7Utils::streamFor($resource);
            }

            return Psr7Utils::streamFor($this->data);
        }
        if (is_iterable($this->data)) {
            return Psr7Utils::streamFor($this->data);
        }

        return $this->data;
    }
}
