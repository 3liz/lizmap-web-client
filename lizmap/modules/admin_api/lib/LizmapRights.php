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
        'lizmap.repositories.view' => 'admin~jacl2.lizmap.repositories.view',
        'lizmap.tools.displayGetCapabilitiesLinks' => 'admin~jacl2.lizmap.tools.displayGetCapabilitiesLinks',
        'lizmap.tools.edition.use' => 'admin~jacl2.lizmap.tools.edition.use',
        'lizmap.tools.layer.export' => 'admin~jacl2.lizmap.tools.layer.export',
        'lizmap.tools.loginFilteredLayers.override' => 'admin~jacl2.lizmap.tools.loginFilteredLayers.override',
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

    /**
     * Get label for a given subject corresponding to passed lablekey.
     * It uses the correct local given in parameters.
     *
     * @param string $labelKey Label key of the subject
     * @param mixed  $locale
     *
     * @return string label if found, else "Not found."
     *
     * @throws \Exception
     */
    public static function getLabel(string $labelKey, $locale): string
    {
        if ($labelKey) {
            try {
                return \jLocale::get($labelKey, locale: $locale);
            } catch (\Exception $e) {
                throw new \Exception($e->getMessage(), $e->getCode());
            }
        }

        return 'Not found.';
    }
}
