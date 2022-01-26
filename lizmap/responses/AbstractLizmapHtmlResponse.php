<?php
/**
 * Abstract class for our custom HTML response objects.
 *
 * @author    3liz
 * @copyright 2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
require_once JELIX_LIB_CORE_PATH.'response/jResponseHtml.class.php';

/**
 * One of the goal of this class is to redefine methods manipulating
 * JS and CSS links, to add a revision number to the url of this assets,
 * in order to force browsers to reload assets when the revision number
 * has changed.
 * See plugins/configcompiler/lizmapconfig.configcompiler.php.
 */
class AbstractLizmapHtmlResponse extends jResponseHtml
{
    /**
     * Append the revision parameter to the given url string.
     *
     * @param string $url
     *
     * @return string
     */
    public function appendRevisionToUrl($url)
    {
        $revisionParam = jApp::config()->urlengine['assetsRevQueryUrl'];
        if ($revisionParam != '') {
            $url .= (strpos($url, '?') === false) ? '?' : '&';
            $url .= $revisionParam;
        }

        return $url;
    }

    /**
     * Add the revision parameter to the given list of query parameters.
     *
     * @param array $parameters list of query parameters
     */
    public function appendRevisionToQueryParameters(&$parameters)
    {
        $revision = jApp::config()->urlengine['assetsRevision'];
        if ($revision != '') {
            $parameters['_r'] = $revision;
        }
    }

    /**
     * {@inheritDoc}
     */
    public function addJSLink($src, $params = array(), $forIE = false)
    {
        if (isset($this->_JSLink[$src])) {
            // if the resource has already been added without the revision let's remove it
            unset($this->_JSLink[$src]);
        }
        $src = $this->appendRevisionToUrl($src);
        parent::addJSLink($src, $params, $forIE);
    }

    /**
     * {@inheritDoc}
     */
    public function addJSLinkModule($module, $src, $params = array(), $forIE = false)
    {
        $jurlParams = array('targetmodule' => $module, 'file' => $src);
        $this->appendRevisionToQueryParameters($jurlParams);
        $url = jUrl::get('jelix~www:getfile', $jurlParams);
        parent::addJSLink($url, $params, $forIE);
    }

    /**
     * {@inheritDoc}
     */
    public function addCSSLink($src, $params = array(), $forIE = false)
    {
        if (isset($this->_CSSLink[$src])) {
            // if the resource has already been added without the revision let's remove it
            unset($this->_CSSLink[$src]);
        }
        $src = $this->appendRevisionToUrl($src);
        parent::addCSSLink($src, $params, $forIE);
    }

    /**
     * {@inheritDoc}
     */
    public function addCSSLinkModule($module, $src, $params = array(), $forIE = false)
    {
        $jurlParams = array('targetmodule' => $module, 'file' => $src);
        $this->appendRevisionToQueryParameters($jurlParams);
        $src = jUrl::get('jelix~www:getfile', $jurlParams);
        parent::addCSSLink($src, $params, $forIE);
    }

    /**
     * {@inheritDoc}
     */
    public function addCSSThemeLinkModule($module, $src, $params = array(), $forIE = false)
    {
        $file = 'themes/'.jApp::config()->theme.'/'.$src;
        $jurlParams = array('targetmodule' => $module, 'file' => $file);
        $this->appendRevisionToQueryParameters($jurlParams);
        $url = jUrl::get('jelix~www:getfile', $jurlParams);
        parent::addCSSLink($url, $params, $forIE);
    }
}
