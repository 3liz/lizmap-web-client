<?php

/**
 * QGIS Raster layer.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project\Qgis;

/**
 * QGIS Raster layer.
 *
 * @property string               $id
 * @property bool                 $embedded
 * @property string               $type
 * @property string               $layername
 * @property Qgis\SpatialRefSys   $srs
 * @property string               $datasource
 * @property string               $provider
 * @property MapLayerStyleManager $styleManager
 * @property null|string          $shortname
 * @property null|string          $title
 * @property null|string          $abstract
 * @property null|array<string>   $keywordList
 * @property RasterLayerPipe      $pipe
 * @property MapLayerStyleManager $styleManager
 */
class RasterLayer extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'id',
        'embedded',
        'type',
        'layername',
        'srs',
        'datasource',
        'provider',
        'styleManager',
        'shortname',
        'title',
        'abstract',
        'keywordList',
        'pipe',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'id',
        'embedded',
        'type',
        'layername',
        'srs',
        'datasource',
        'provider',
        'styleManager',
        'pipe',
    );

    /**
     * Get layer opacity.
     *
     * @return float
     */
    public function getLayerOpacity()
    {
        return $this->pipe->renderer->opacity;
    }

    /**
     * Get map layer as key array.
     *
     * @return array
     */
    public function toKeyArray()
    {
        return array(
            'type' => $this->type,
            'id' => $this->id,
            'name' => $this->layername,
            'shortname' => $this->shortname !== null ? $this->shortname : '',
            'title' => $this->title !== null ? $this->title : $this->layername,
            'abstract' => $this->abstract !== null ? $this->abstract : '',
            'proj4' => $this->srs->proj4,
            'srid' => $this->srs->srid,
            'authid' => $this->srs->authid,
            'datasource' => $this->datasource,
            'provider' => $this->provider,
            'keywords' => $this->keywordList !== null ? $this->keywordList : array(),
        );
    }
}
