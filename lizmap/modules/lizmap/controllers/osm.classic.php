<?php

use Lizmap\Request\Proxy;

/**
 * Php proxy to access OpenStreetMap services.
 *
 * @author    3liz
 * @copyright 2011-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class osmCtrl extends jController
{
    /**
     * Query the OpenStreetMap Nominatim API.
     *
     * @urlparam text $query A query on OpenStreetMap object
     * @urlparam text $bbox A bounding box in EPSG:4326
     *
     * @return jResponseBinary JSON content
     */
    public function nominatim()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'nominatim.json';
        $rep->mimeType = 'application/json';

        $query = $this->param('query');
        if (!$query) {
            $rep->content = '[]';

            return $rep;
        }

        $url = 'https://nominatim.openstreetmap.org/search?';
        $params = array(
            'q' => $query,
            'format' => 'json',
        );
        $bbox = $this->param('bbox');
        if (preg_match('/\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?/', $bbox)) {
            $params['viewbox'] = $bbox;
            $params['bounded'] = 1;
        }

        $url .= http_build_query($params);
        list($content, $mime, $code) = Proxy::getRemoteData($url, array(
            'method' => 'get',
            'referer' => jUrl::getFull('view~default:index'),
        ));

        $rep->content = $content;

        return $rep;
    }
}
