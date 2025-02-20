<?php

/**
 * QGIS Server metadata request matcher to cache response.
 *
 * @author    3liz
 * @copyright 2025 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

use Kevinrob\GuzzleCache\Strategy\Delegate\RequestMatcherInterface;
use Psr\Http\Message\RequestInterface;

class QgisServerMetadataRequestMatcher implements RequestMatcherInterface
{
    /**
     * The QGIS Server host.
     *
     * @var string
     */
    protected $qgisServerHost;

    /**
     * The QGIS Server Metadata path.
     *
     * @var string
     */
    protected $qgisServerMetadataPath;

    /**
     * @param string $qgisServerMetadataUrl The QGIS Server metadata URL - It could be provided by Lizmap Services
     */
    public function __construct(string $qgisServerMetadataUrl)
    {
        $urlInfo = parse_url($qgisServerMetadataUrl);
        $this->qgisServerHost = $urlInfo['host'] ?? 'localhost';
        $this->qgisServerMetadataPath = $urlInfo['path'] ?? '';
    }

    /**
     * @param RequestInterface $request
     *
     * @return bool
     */
    public function matches($request)
    {
        return strpos($request->getUri()->getHost(), $this->qgisServerHost) !== false
        && strpos($request->getUri()->getPath(), $this->qgisServerMetadataPath) !== false;
    }
}
