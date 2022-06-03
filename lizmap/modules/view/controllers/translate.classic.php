<?php
/**
 * Service to provide translation dictionnary.
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
     * Get text/javascript containing all translation for the dictionnary.
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
            $lang = jLocale::getCurrentLang().'_'.jLocale::getCurrentCountry();
        }

        $data = array();
        $path = jApp::appPath().'modules/view/locales/en_US/dictionnary.UTF-8.properties';
        if (file_exists($path)) {
            $lines = file($path);
            foreach ($lines as $lineNumber => $lineContent) {
                if (!empty($lineContent) and $lineContent != '\n') {
                    $exp = explode('=', trim($lineContent));
                    if (!empty($exp[0])) {
                        $data[$exp[0]] = jLocale::get('view~dictionnary.'.$exp[0], null, $lang);
                    }
                }
            }
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
            $lang = jLocale::getCurrentLang().'_'.jLocale::getCurrentCountry();
        }

        $data = array();
        $path = jApp::appPath().'modules/view/locales/'.$lang.'/'.$property.'.UTF-8.properties';
        if (file_exists($path)) {
            $lines = file($path);
            foreach ($lines as $lineNumber => $lineContent) {
                if (!empty($lineContent) and $lineContent != '\n') {
                    $exp = explode('=', trim($lineContent));
                    if (!empty($exp[0])) {
                        $data[$exp[0]] = jLocale::get('view~dictionnary.'.$exp[0], null, $lang);
                    }
                }
            }
        }
        $rep->data = $data;

        return $rep;
    }
}
