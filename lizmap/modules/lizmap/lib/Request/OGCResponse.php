<?php
/**
 * Manage OGC response.
 *
 * @author    3liz
 * @copyright 2015-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

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
     * @var string the response body as a string
     */
    public $data;

    /**
     * @var bool the response has been cached
     */
    public $cached = false;

    /**
     * @var array
     */
    public $headers = array();

    /**
     * constructor.
     *
     * @param int    $code    the HTTP status code of the response
     * @param string $mime    the MIME type of the response
     * @param string $data    the response body as a string
     * @param bool   $cached  the response has been cached, default value false
     * @param array  $headers default value an empty array
     */
    public function __construct($code, $mime, $data, $cached = false, $headers = array())
    {
        $this->code = $code;
        $this->mime = $mime;
        $this->data = $data;
        $this->cached = $cached;
        $this->headers = $headers;
    }
}
