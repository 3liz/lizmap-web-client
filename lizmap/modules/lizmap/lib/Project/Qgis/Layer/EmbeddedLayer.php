<?php
/**
 * QGIS Embedded layer.
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
 * QGIS Embedded layer.
 *
 * @property string $id
 * @property bool   $embedded
 * @property string $type
 * @property string $project
 */
class EmbeddedLayer extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'id',
        'embedded',
        'type',
        'project',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'id',
        'embedded',
        'project',
    );

    /**
     * QGIS Embedded layer constructor to force type property.
     *
     * @param array $data the instance data
     */
    public function __construct($data)
    {
        $data['type'] = 'embedded';
        parent::__construct($data);
    }

    /**
     * Get embedded layer as key array.
     *
     * @return array
     */
    public function toKeyArray()
    {
        return array(
            'id' => $this->id,
            'embedded' => $this->embedded,
            'type' => $this->type,
            'project' => $this->project,
        );
    }
}
