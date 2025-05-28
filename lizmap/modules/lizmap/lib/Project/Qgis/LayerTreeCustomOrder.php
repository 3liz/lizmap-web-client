<?php

/**
 * QGIS Layer tree custom order.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

/**
 * QGIS Layer tree custom order.
 *
 * @property bool          $enabled
 * @property array<string> $items
 */
class LayerTreeCustomOrder extends BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'enabled',
        'items',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'enabled',
    );

    protected function set(array $data): void
    {
        if (!$data['enabled']) {
            $data['items'] = array();
        }
        parent::set($data);
    }
}
