<?php

namespace LizmapApi;

/**
 * This class defines the rights associated with Lizmap functionalities.
 *
 * The rights are hard-coded because there are other rights not used in it.
 */
class LizmapRights
{
    protected static array $rights = array(
        'lizmap.tools.edition.use',
        'lizmap.repositories.view',
        'lizmap.tools.loginFilteredLayers.override',
        'lizmap.tools.displayGetCapabilitiesLinks',
        'lizmap.tools.layer.export',
    );

    /**
     * Retrieves the LWC rights.
     *
     * @return array the list of LWC rights
     */
    public static function getLWCRights(): array
    {
        return self::$rights;
    }
}
