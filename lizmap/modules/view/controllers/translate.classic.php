<?php

use Lizmap\App\LocalesLoader;

/**
 * Service to provide translation dictionary.
 *
 * @author    3liz
 * @copyright 2011-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class translateCtrl extends jController
{
    /**
     * Get text/javascript containing all translation for the dictionary.
     *
     * @urlparam string $lang Language. Ex: fr_FR (optional)
     *
     * @return jResponseBinary
     */
    public function index()
    {
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->mimeType = 'text/javascript';
        $rep->doDownload = false;
        $rep->setExpires('+1 month');

        $lang = $this->param('lang');

        if (!$lang) {
            $lang = jLocale::getCurrentLocale();
        }

        $data = LocalesLoader::getLocalesFrom('view~dictionnary', $lang);

        if (strpos(jApp::config()->jResponseHtml['plugins'], 'debugbar') !== false) {
            $fallback = LocalesLoader::getLocalesFrom('view~dictionnary', jApp::config()->fallbackLocale);
            $data = array_merge($fallback, $data);
        }
        $rep->content = 'var lizDict = '.json_encode($data).';';

        return $rep;
    }

    /**
     * Get JSON containing all translation for a given jelix property file.
     *
     * @urlparam string $property Name of the property file. Ex: map if searched file is map.UTF-8.properties
     * @urlparam string $lang     Language. Ex: fr_FR (optional)
     *
     * @return jResponseJson
     */
    public function getDictionary()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Get the property file
        $property = $this->param('property');
        $lang = $this->param('lang');

        if (!$lang) {
            $lang = jLocale::getCurrentLocale();
        }

        $rep->data = LocalesLoader::getLocalesFrom('view~'.$property, $lang);

        return $rep;
    }
}
